<?php

namespace App\Jobs;

use App\Models\AiAssessment;
use App\Models\MealSubmission;
use App\Services\GeminiResponseParser;
use App\Services\GeminiService;
use App\Services\ScoringEngine;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMealAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private MealSubmission $submission;
    private int $timeout = 300; // 5 minutes

    public function __construct(MealSubmission $submission)
    {
        $this->submission = $submission;
    }

    /**
     * Execute the job
     */
    public function handle(
        GeminiService $geminiService,
        ScoringEngine $scoringEngine
    ): void {
        try {
            Log::info('Processing meal analysis', [
                'submission_id' => $this->submission->id,
            ]);

            // Load relationships
            $this->submission->load('menuItems', 'sanitationCheck', 'sppg');

            // Step 1: Get Gemini analysis
            $geminiAnalysis = $this->getGeminiAnalysis($geminiService);

            // Step 2: Run Scoring Engine
            $scoringResult = $scoringEngine->calculateScore($this->submission);

            // Step 3: Merge results
            $finalResult = $this->mergeResults($geminiAnalysis, $scoringResult);

            // Step 4: Save to database
            $this->saveResults($finalResult);

            // Step 5: Update submission status
            $this->submission->update(['status' => 'completed']);

            Log::info('Meal analysis completed', [
                'submission_id' => $this->submission->id,
                'final_score' => $finalResult['final_score'],
                'status' => $finalResult['status'],
            ]);
        } catch (\Exception $e) {
            Log::error('Meal analysis failed', [
                'submission_id' => $this->submission->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->submission->update(['status' => 'failed']);
            throw $e;
        }
    }

    /**
     * Get Gemini analysis
     */
    private function getGeminiAnalysis(GeminiService $geminiService): array
    {
        $menuItems = $this->submission->menuItems->map(fn($item) => [
            'ingredient_name' => $item->ingredient_name,
            'quantity_gram' => $item->quantity_gram,
            'category' => $item->category,
        ])->toArray();

        $sanitationData = $this->submission->sanitationCheck ? [
            'apd_used' => $this->submission->sanitationCheck->apd_used ? 'Ya' : 'Tidak',
            'kitchen_cleaned' => $this->submission->sanitationCheck->kitchen_cleaned ? 'Ya' : 'Tidak',
            'storage_type' => $this->submission->sanitationCheck->storage_type,
            'ingredient_condition' => $this->submission->sanitationCheck->ingredient_condition,
            'supplier_source' => $this->submission->sanitationCheck->supplier_source,
        ] : [];

        // Call Gemini for nutrition analysis
        $nutritionResponse = $geminiService->analyzeNutrition($menuItems, $sanitationData);
        $nutritionAnalysis = GeminiResponseParser::parseNutritionResponse($nutritionResponse);

        // Call Gemini for image analysis if image exists
        $imageAnalysis = [];
        if ($this->submission->image_path && file_exists(storage_path('app/' . $this->submission->image_path))) {
            $imageResponse = $geminiService->analyzeImage(storage_path('app/' . $this->submission->image_path));
            $imageAnalysis = GeminiResponseParser::parseImageResponse($imageResponse);
        }

        return [
            'nutrition' => $nutritionAnalysis,
            'image' => $imageAnalysis,
        ];
    }

    /**
     * Merge Gemini results with Scoring Engine results
     */
    private function mergeResults(array $geminiAnalysis, $scoringResult): array
    {
        // Use Gemini scores if available, otherwise use Scoring Engine scores
        $nutritionScore = !empty($geminiAnalysis['nutrition']['nutrition_score'])
            ? (int) $geminiAnalysis['nutrition']['nutrition_score']
            : $scoringResult->nutritionScore;

        $safetyScore = !empty($geminiAnalysis['nutrition']['safety_score'])
            ? (int) $geminiAnalysis['nutrition']['safety_score']
            : $scoringResult->safetyScore;

        $sanitationScore = !empty($geminiAnalysis['nutrition']['sanitation_score'])
            ? (int) $geminiAnalysis['nutrition']['sanitation_score']
            : $scoringResult->sanitationScore;

        // Recalculate final score with merged values
        $finalScore = (int) round(
            ($nutritionScore * 0.40) +
            ($safetyScore * 0.40) +
            ($sanitationScore * 0.20)
        );

        // Determine status
        $status = $this->determineStatus($finalScore, $scoringResult->immediateActionRequired);

        return [
            'nutrition_score' => $nutritionScore,
            'safety_score' => $safetyScore,
            'sanitation_score' => $sanitationScore,
            'final_score' => $finalScore,
            'status' => $status,
            'immediate_action_required' => $scoringResult->immediateActionRequired || $finalScore < 60,
            'violations' => $scoringResult->violations,
            'corrective_feedback' => $scoringResult->correctiveFeedback,
            'gemini_analysis' => $geminiAnalysis,
            'raw_response' => json_encode([
                'gemini' => $geminiAnalysis,
                'scoring_engine' => $scoringResult->toArray(),
            ]),
        ];
    }

    /**
     * Determine status based on final score
     */
    private function determineStatus(int $finalScore, bool $hasHardRuleViolation): string
    {
        if ($hasHardRuleViolation || $finalScore < 60) {
            return 'BAHAYA';
        }

        if ($finalScore < 75) {
            return 'PERHATIAN';
        }

        return 'AMAN';
    }

    /**
     * Save results to database
     */
    private function saveResults(array $results): void
    {
        // Create AI Assessment
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
            'processing_time_ms' => 0, // Can be calculated if needed
        ]);

        // Save violations
        foreach ($results['violations'] as $violation) {
            $assessment->violations()->create($violation);
        }

        // Save corrective feedback
        $assessment->correctiveFeedback()->create([
            'immediate_actions' => $results['corrective_feedback']['immediate_actions'] ?? [],
            'tomorrow_improvements' => $results['corrective_feedback']['tomorrow_improvements'] ?? [],
            'routine_notes' => $results['corrective_feedback']['routine_notes'] ?? [],
            'generated_at' => Carbon::now(),
        ]);

        Log::info('Results saved to database', [
            'assessment_id' => $assessment->id,
            'violations_count' => count($results['violations']),
        ]);
    }
}
