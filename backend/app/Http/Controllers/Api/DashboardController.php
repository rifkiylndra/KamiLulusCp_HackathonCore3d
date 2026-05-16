<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MealSubmission;
use App\Models\Sppg;
use App\Models\AiAssessment;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalSubmissions = MealSubmission::count();
        $totalSppg = Sppg::count();
        $processingSubmissions = MealSubmission::where('status', 'processing')->count();
        $completedSubmissions = MealSubmission::where('status', 'completed')->count();
        $violationsFound = AiAssessment::whereHas('violations')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_submissions' => $totalSubmissions,
                'total_sppg' => $totalSppg,
                'processing_submissions' => $processingSubmissions,
                'completed_submissions' => $completedSubmissions,
                'violations_found' => $violationsFound,
            ]
        ]);
    }

    public function recentSppg()
    {
        $recentSppg = Sppg::with('mealSubmissions')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $recentSppg
        ]);
    }
}
