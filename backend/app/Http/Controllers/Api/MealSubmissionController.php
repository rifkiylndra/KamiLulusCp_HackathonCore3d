<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMealSubmissionRequest;
use App\Jobs\ProcessMealAnalysis;
use App\Models\MealSubmission;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

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

            // Determine submitted_by value with fallback logic
            $submittedBy = $data['submitted_by'] ?? null;
            
            // If not provided, get SPPG name from sppg_id relationship
            if (!$submittedBy && isset($data['sppg_id'])) {
                $sppg = \App\Models\Sppg::find($data['sppg_id']);
                $submittedBy = $sppg ? $sppg->name : 'Petugas SPPG';
            }
            
            // Final fallback
            if (!$submittedBy) {
                $submittedBy = 'Petugas SPPG';
            }

            $submission = MealSubmission::create([
                'sppg_id' => $data['sppg_id'],
                'submitted_by' => $submittedBy,
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

            // Log audit
            AuditLogger::logSubmissionCreated($submission->id, $data);

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

    public function index(Request $request): JsonResponse
    {
        $query = MealSubmission::with(['sppg', 'aiAssessment']);

        // Filter by SPPG ID
        if ($request->has('sppg_id')) {
            $query->where('sppg_id', $request->sppg_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Limit results
        if ($request->has('limit')) {
            $limit = min((int)$request->limit, 50); // Max 50 items
            $submissions = $query->latest()->limit($limit)->get();
            
            return response()->json([
                'success' => true,
                'data' => $submissions,
            ]);
        }

        // Default pagination
        $submissions = $query->latest()->paginate(15);

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

    public function update(int $id, StoreMealSubmissionRequest $request): JsonResponse
    {
        $submission = MealSubmission::findOrFail($id);

        // Hanya bisa update jika status pending
        if ($submission->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya submission dengan status pending yang bisa diupdate',
            ], 422);
        }

        $data = $request->validated();

        DB::beginTransaction();
        try {
            $oldData = $submission->toArray();

            // Update image jika ada
            if ($request->hasFile('image')) {
                // Delete old image
                if ($submission->image_path) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($submission->image_path);
                }
                $ext = $request->file('image')->getClientOriginalExtension() ?: 'jpg';
                $imagePath = $request->file('image')->storeAs(
                    'menus',
                    Str::uuid().'.'.$ext,
                    'public'
                );
                $data['image_path'] = $imagePath;
            }

            $submission->update([
                'menu_name' => $data['menu_name'],
                'portion_count' => $data['portion_count'],
                'cook_start_at' => $data['cook_start_at'],
                'serve_planned_at' => $data['serve_planned_at'],
                'distribute_at' => $data['distribute_at'] ?? null,
                'image_path' => $data['image_path'] ?? $submission->image_path,
            ]);

            // Update ingredients
            $submission->menuItems()->delete();
            foreach ($data['ingredients'] as $item) {
                $submission->menuItems()->create([
                    'ingredient_name' => $item['ingredient_name'],
                    'quantity_gram' => $item['quantity_gram'],
                    'category' => $item['category'],
                ]);
            }

            // Update sanitation
            $submission->sanitationCheck()->delete();
            $submission->sanitationCheck()->create($data['sanitation']);

            DB::commit();

            // Log audit
            $changes = array_diff_assoc($submission->toArray(), $oldData);
            AuditLogger::logSubmissionUpdated($submission->id, $changes);

            return response()->json([
                'success' => true,
                'data' => $submission->fresh(['menuItems', 'sanitationCheck']),
                'message' => 'Submission berhasil diupdate',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate: '.$e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $submission = MealSubmission::findOrFail($id);

        // Hanya bisa delete jika status pending atau failed
        if (!in_array($submission->status, ['pending', 'failed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya submission dengan status pending atau failed yang bisa dihapus',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $submissionData = $submission->toArray();

            // Delete image
            if ($submission->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($submission->image_path);
            }

            // Delete related data
            $submission->menuItems()->delete();
            $submission->sanitationCheck()->delete();
            if ($submission->aiAssessment) {
                $submission->aiAssessment->violations()->delete();
                $submission->aiAssessment->correctiveFeedback()->delete();
                $submission->aiAssessment->delete();
            }

            $submission->delete();
            DB::commit();

            // Log audit
            AuditLogger::logSubmissionDeleted($id, $submissionData);

            return response()->json([
                'success' => true,
                'message' => 'Submission berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus: '.$e->getMessage(),
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        $query = MealSubmission::with(['sppg', 'aiAssessment']);

        // Filter by SPPG
        if ($request->has('sppg_id')) {
            $query->where('sppg_id', $request->sppg_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by assessment status
        if ($request->has('assessment_status')) {
            $query->whereHas('aiAssessment', fn($q) => $q->where('status', $request->assessment_status));
        }

        // Filter by date range
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [
                $request->date_from.' 00:00:00',
                $request->date_to.' 23:59:59'
            ]);
        }

        // Search by menu name
        if ($request->has('search')) {
            $query->where('menu_name', 'like', '%'.$request->search.'%');
        }

        // Filter by score range
        if ($request->has('score_min') && $request->has('score_max')) {
            $query->whereHas('aiAssessment', fn($q) => 
                $q->whereBetween('final_score', [$request->score_min, $request->score_max])
            );
        }

        $submissions = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }
}
