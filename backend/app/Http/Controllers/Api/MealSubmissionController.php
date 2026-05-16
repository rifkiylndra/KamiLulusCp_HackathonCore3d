<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMealSubmissionRequest;
use App\Models\MealSubmission;
use App\Jobs\ProcessMealAnalysis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MealSubmissionController extends Controller
{
    public function store(StoreMealSubmissionRequest $request)
    {
        $data = $request->validated();

        DB::beginTransaction();
        try {
            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image_path')) {
                try {
                    $file = $request->file('image_path');
                    $filename = 'submissions/' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $imagePath = Storage::disk('public')->putFileAs('submissions', $file, basename($filename));
                    
                    Log::info('Image uploaded successfully', [
                        'submission_id' => null,
                        'image_path' => $imagePath,
                        'file_size' => $file->getSize(),
                    ]);
                } catch (\Exception $e) {
                    Log::error('Image upload failed', [
                        'error' => $e->getMessage(),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ]);
                    throw new \Exception('Gagal upload gambar: ' . $e->getMessage());
                }
            }

            $submission = MealSubmission::create([
                'sppg_id' => $data['sppg_id'],
                'submitted_by' => $data['submitted_by'] ?? auth()->user()?->name ?? 'Petugas',
                'menu_name' => $data['menu_name'],
                'portion_count' => $data['portion_count'],
                'cook_start_at' => $data['cook_start_at'],
                'serve_planned_at' => $data['serve_planned_at'],
                'distribute_at' => $data['distribute_at'] ?? null,
                'image_path' => $imagePath,
                'status' => 'processing',
            ]);

            // Simpan ingredients
            if (!empty($data['ingredients'])) {
                foreach ($data['ingredients'] as $item) {
                    $submission->menuItems()->create($item);
                }
            }

            // Simpan sanitation
            if (!empty($data['sanitation'])) {
                $submission->sanitationCheck()->create($data['sanitation']);
            }

            DB::commit();

            Log::info('Meal submission created', [
                'submission_id' => $submission->id,
                'sppg_id' => $submission->sppg_id,
                'menu_name' => $submission->menu_name,
            ]);

            ProcessMealAnalysis::dispatch($submission);

            return response()->json([
                'success' => true,
                'data' => ['submission_id' => $submission->id],
                'message' => 'Submission berhasil. AI sedang menganalisis...'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Meal submission creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $submissions = MealSubmission::with(['sppg', 'aiAssessment'])
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
                'id' => $submission->id,
                'status' => $submission->status,
                'ai_assessment' => $submission->aiAssessment
            ]
        ]);
    }
}