<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MealSubmission;
use App\Models\AiAssessment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today();

        $todaySubmissions = MealSubmission::whereDate('created_at', $today)->count();
        $dangerCount = MealSubmission::whereDate('created_at', $today)
            ->whereHas('aiAssessment', fn($q) => $q->where('status', 'BAHAYA'))
            ->count();

        // Gunakan join untuk aggregate function
        $avgScore = MealSubmission::whereDate('meal_submissions.created_at', $today)
            ->join('ai_assessments', 'meal_submissions.id', '=', 'ai_assessments.meal_submission_id')
            ->avg('ai_assessments.final_score') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'today_submissions' => $todaySubmissions,
                'active_alerts' => $dangerCount,
                'average_score' => round($avgScore, 1),
                'danger_count' => $dangerCount,
            ]
        ]);
    }

    public function recentSppg()
    {
        $recent = MealSubmission::with('sppg', 'aiAssessment')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($sub) => [
                'sppg' => $sub->sppg,
                'last_submission' => [
                    'status' => $sub->status,
                    'final_score' => optional($sub->aiAssessment)->final_score,
                    'status_label' => optional($sub->aiAssessment)->status,
                ]
            ]);

        return response()->json([
            'success' => true,
            'data' => $recent
        ]);
    }
}