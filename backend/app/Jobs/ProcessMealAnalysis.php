<?php

namespace App\Jobs;

use App\Models\AiAssessment;
use App\Models\MealSubmission;
use App\Services\GeminiService;
use App\Services\NutriGuardPrompts;
use App\Services\ScoringEngine;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessMealAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 60;

    public function __construct(
        private MealSubmission $submission
    ) {
        $this->onQueue(config('services.gemini.queue', 'ai-processing'));
    }

    public function handle(GeminiService $geminiService, ScoringEngine $scoringEngine): void
    {
        $started = microtime(true);

        try {
            $this->submission->update(['status' => 'processing']);
            $this->submission->load(['menuItems', 'sanitationCheck', 'sppg']);

            $geminiNutrition = [];
            $aiAssessment = null;

            if ($geminiService->isConfigured()) {
                try {
                    $geminiNutrition = $geminiService->analyzeNutrition($this->submission);
                } catch (\Throwable $e) {
                    Log::channel('gemini')->warning('Nutrition analysis skipped', ['error' => $e->getMessage()]);
                }

                try {
                    $aiAssessment = $geminiService->analyzeSubmissionAssessment($this->submission);
                } catch (\Throwable $e) {
                    Log::channel('gemini')->warning('Full assessment skipped', ['error' => $e->getMessage()]);
                }
            }

            $engineResult = $scoringEngine->calculate($geminiNutrition, $this->submission);
            $final = $this->mergeResults($engineResult, $aiAssessment, $geminiNutrition);

            $elapsed = (int) round((microtime(true) - $started) * 1000);
            $final['processing_time_ms'] = $elapsed;

            $this->saveResults($final);
            $this->submission->update(['status' => 'completed']);

            Log::info('Meal analysis completed', [
                'submission_id' => $this->submission->id,
                'final_score' => $final['final_score'],
                'status' => $final['status'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Meal analysis failed', [
                'submission_id' => $this->submission->id,
                'error' => $e->getMessage(),
            ]);
            $this->submission->update(['status' => 'failed']);
            throw $e;
        }
    }

    private function mergeResults($engineResult, ?array $aiAssessment, array $geminiNutrition): array
    {
        $nutrition = $engineResult->nutritionScore;
        $safety = $engineResult->safetyScore;
        $sanitation = $engineResult->sanitationScore;
        $violations = $engineResult->violations;
        $feedback = $engineResult->correctiveFeedback;
        $status = $engineResult->status;
        $immediate = $engineResult->immediateActionRequired;

        if ($aiAssessment) {
            $nutrition = $aiAssessment['nutrition_score'] ?: $nutrition;
            $safety = $aiAssessment['safety_score'] ?: $safety;
            $sanitation = $aiAssessment['sanitation_score'] ?: $sanitation;

            if (! empty($aiAssessment['violations'])) {
                $violations = $this->mergeViolations($violations, $aiAssessment['violations']);
            }

            foreach (['immediate_actions', 'tomorrow_improvements', 'routine_notes'] as $key) {
                $aiItems = $aiAssessment['corrective_feedback'][$key] ?? [];
                if (! empty($aiItems)) {
                    $feedback[$key] = array_values(array_unique(array_merge($feedback[$key] ?? [], $aiItems)));
                }
            }
        }

        $finalScore = (int) round(
            ($nutrition * 0.4) + ($safety * 0.4) + ($sanitation * 0.2)
        );

        $jedaMenit = NutriGuardPrompts::jedaMenitMasakDistribusi($this->submission);
        if ($jedaMenit > 240) {
            $finalScore = min($finalScore, 49);
            $status = 'BAHAYA';
            $immediate = true;
        }

        $hasCritical = collect($violations)->contains(fn ($v) => ($v['severity'] ?? '') === 'CRITICAL');
        if ($hasCritical || $finalScore < 50) {
            $status = 'BAHAYA';
            $immediate = true;
        } elseif ($finalScore < 75 && $status === 'AMAN') {
            $status = 'PERHATIAN';
        }

        return [
            'nutrition_score' => $nutrition,
            'safety_score' => $safety,
            'sanitation_score' => $sanitation,
            'final_score' => $finalScore,
            'status' => $status,
            'immediate_action_required' => $immediate,
            'violations' => $violations,
            'corrective_feedback' => $feedback,
            'nutrition_summary' => $aiAssessment['nutrition_summary'] ?? ($geminiNutrition['nutrition_notes'] ?? ''),
            'raw_response' => json_encode([
                'gemini_nutrition' => $geminiNutrition,
                'gemini_assessment' => $aiAssessment,
                'scoring_engine' => $engineResult->toArray(),
            ]),
            'processing_time_ms' => 0,
        ];
    }

    private function mergeViolations(array $engine, array $ai): array
    {
        $seen = collect($engine)->pluck('description')->all();
        foreach ($ai as $v) {
            $desc = $v['description'] ?? '';
            if ($desc && ! in_array($desc, $seen, true)) {
                $engine[] = $v;
                $seen[] = $desc;
            }
        }

        return $engine;
    }

    private function saveResults(array $results): void
    {
        $assessment = AiAssessment::create([
            'meal_submission_id' => $this->submission->id,
            'nutrition_score' => $results['nutrition_score'],
            'safety_score' => $results['safety_score'],
            'sanitation_score' => $results['sanitation_score'],
            'final_score' => $results['final_score'],
            'status' => $results['status'],
            'violations_count' => count($results['violations']),
            'immediate_action_required' => $results['immediate_action_required'],
            'raw_response' => $results['raw_response'],
            'processing_time_ms' => $results['processing_time_ms'],
        ]);

        foreach ($results['violations'] as $violation) {
            $assessment->violations()->create([
                'dimension' => $violation['dimension'] ?? 'keamanan',
                'severity' => $violation['severity'] ?? 'MEDIUM',
                'description' => $violation['description'] ?? '',
                'corrective_action' => $violation['corrective_action'] ?? '',
            ]);
        }

        $assessment->correctiveFeedback()->create([
            'immediate_actions' => $results['corrective_feedback']['immediate_actions'] ?? [],
            'tomorrow_improvements' => $results['corrective_feedback']['tomorrow_improvements'] ?? [],
            'routine_notes' => $results['corrective_feedback']['routine_notes'] ?? [],
            'generated_at' => Carbon::now(),
        ]);
    }

    public static function resolveImagePath(?string $imagePath): ?string
    {
        if (! $imagePath) {
            return null;
        }

        if (file_exists($imagePath)) {
            return $imagePath;
        }

        $public = storage_path('app/public/'.$imagePath);
        if (file_exists($public)) {
            return $public;
        }

        if (Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->path($imagePath);
        }

        return null;
    }
}
