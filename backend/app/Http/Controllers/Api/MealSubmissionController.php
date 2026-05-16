<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMealSubmissionRequest;
use App\Models\MealSubmission;
use Illuminate\Http\Request;

class MealSubmissionController extends Controller
{
    public function store(StoreMealSubmissionRequest $request)
    {
        $data = $request->validated();

        \DB::beginTransaction();
        try {
            $submission = MealSubmission::create([
                'sppg_id' => $data['sppg_id'],
                'submitted_by' => $data['submitted_by'] ?? 'Petugas',
                'menu_name' => $data['menu_name'],
                'portion_count' => $data['portion_count'],
                'cook_start_at' => $data['cook_start_at'],
                'serve_planned_at' => $data['serve_planned_at'],
                'distribute_at' => $data['distribute_at'] ?? null,
                'image_path' => $data['image_path'] ?? null,
                'status' => 'processing',
            ]);

            // Simpan menu items
            if (isset($data['ingredients']) && \is_array($data['ingredients'])) {
                foreach ($data['ingredients'] as $item) {
                    $submission->menuItems()->create($item);
                }
            }

            // Simpan sanitation check
            if (isset($data['sanitation'])) {
                $submission->sanitationCheck()->create($data['sanitation']);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'data' => ['submission_id' => $submission->id],
                'message' => 'Submission berhasil dibuat. Silakan tunggu hasil analisis AI.'
            ], 201);

        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $submissions = MealSubmission::with('sppg', 'aiAssessment')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $submissions
        ]);
    }

    public function show($id)
    {
        $submission = MealSubmission::with([
            'sppg', 
            'menuItems', 
            'sanitationCheck', 
            'aiAssessment.violations', 
            'aiAssessment.correctiveFeedback'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $submission
        ]);
    }

    public function status($id)
    {
        $submission = MealSubmission::with('aiAssessment')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $submission->status,
                'ai_assessment' => $submission->aiAssessment
            ]
        ]);
    }
}