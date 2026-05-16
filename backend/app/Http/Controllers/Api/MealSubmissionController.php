<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMealSubmissionRequest;
use App\Jobs\ProcessMealAnalysis;
use App\Models\MealSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MealSubmissionController extends Controller
{
    public function store(StoreMealSubmissionRequest $request): JsonResponse
    {
        $data = $request->validated();

        DB::beginTransaction();
        try {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $ext = $request->file('image')->getClientOriginalExtension() ?: 'jpg';
                $imagePath = $request->file('image')->storeAs(
                    'menus',
                    Str::uuid().'.'.$ext,
                    'public'
                );
            }

            $submission = MealSubmission::create([
                'sppg_id' => $data['sppg_id'],
                'submitted_by' => $data['submitted_by'] ?? 'Petugas SPPG',
                'menu_name' => $data['menu_name'],
                'portion_count' => $data['portion_count'],
                'cook_start_at' => $data['cook_start_at'],
                'serve_planned_at' => $data['serve_planned_at'],
                'distribute_at' => $data['distribute_at'] ?? null,
                'image_path' => $imagePath,
                'status' => 'pending',
            ]);

            foreach ($data['ingredients'] as $item) {
                $submission->menuItems()->create([
                    'ingredient_name' => $item['ingredient_name'],
                    'quantity_gram' => $item['quantity_gram'],
                    'category' => $item['category'],
                ]);
            }

            $submission->sanitationCheck()->create($data['sanitation']);

            DB::commit();

            ProcessMealAnalysis::dispatch($submission);

            return response()->json([
                'success' => true,
                'data' => [
                    'submission_id' => $submission->id,
                    'status' => 'pending',
                    'estimated_time_seconds' => 15,
                ],
                'message' => 'Analisis sedang diproses oleh AI. Gunakan submission_id untuk polling status.',
            ], 202);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan: '.$e->getMessage(),
            ], 500);
        }
    }

    public function index(): JsonResponse
    {
        $submissions = MealSubmission::with(['sppg', 'aiAssessment'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $submission = MealSubmission::with([
            'sppg',
            'menuItems',
            'sanitationCheck',
            'aiAssessment.violations',
            'aiAssessment.correctiveFeedback',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $submission,
        ]);
    }

    public function status(int $id): JsonResponse
    {
        $submission = MealSubmission::with([
            'sppg',
            'aiAssessment.violations',
            'aiAssessment.correctiveFeedback',
        ])->findOrFail($id);

        if (in_array($submission->status, ['pending', 'processing'], true)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $submission->status,
                    'progress_percent' => $submission->status === 'processing' ? 50 : 10,
                    'message' => 'Analisis AI sedang berjalan...',
                ],
            ]);
        }

        if ($submission->status === 'failed') {
            return response()->json([
                'success' => false,
                'data' => [
                    'status' => 'failed',
                    'message' => 'Analisis gagal. Silakan coba kirim ulang atau hubungi admin.',
                ],
            ], 500);
        }

        $assessment = $submission->aiAssessment;
        $feedback = $assessment?->correctiveFeedback;

        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'completed',
                'progress_percent' => 100,
                'result' => [
                    'submission_id' => $submission->id,
                    'menu_name' => $submission->menu_name,
                    'sppg_name' => $submission->sppg?->name,
                    'final_score' => $assessment?->final_score,
                    'assessment_status' => $assessment?->status,
                    'immediate_action_required' => (bool) $assessment?->immediate_action_required,
                    'scores' => [
                        'nutrition' => $assessment?->nutrition_score,
                        'safety' => $assessment?->safety_score,
                        'sanitation' => $assessment?->sanitation_score,
                    ],
                    'violations_count' => $assessment?->violations_count ?? 0,
                    'violations' => $assessment?->violations,
                    'corrective_feedback' => $feedback ? [
                        'immediate_actions' => $feedback->immediate_actions,
                        'tomorrow_improvements' => $feedback->tomorrow_improvements,
                        'routine_notes' => $feedback->routine_notes,
                    ] : null,
                ],
            ],
        ]);
    }
}
