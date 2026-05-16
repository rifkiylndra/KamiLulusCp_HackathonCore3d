<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MealSubmission;
use App\Models\AiAssessment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $date = $request->has('date') ? Carbon::parse($request->date) : Carbon::today();

        $todaySubmissions = MealSubmission::whereDate('created_at', $date)->count();
        $dangerCount = MealSubmission::whereDate('created_at', $date)
            ->whereHas('aiAssessment', fn($q) => $q->where('status', 'BAHAYA'))
            ->count();

        $warningCount = MealSubmission::whereDate('created_at', $date)
            ->whereHas('aiAssessment', fn($q) => $q->where('status', 'PERHATIAN'))
            ->count();

        $safeCount = MealSubmission::whereDate('created_at', $date)
            ->whereHas('aiAssessment', fn($q) => $q->where('status', 'AMAN'))
            ->count();

        // Gunakan join untuk aggregate function
        $avgScore = MealSubmission::whereDate('meal_submissions.created_at', $date)
            ->join('ai_assessments', 'meal_submissions.id', '=', 'ai_assessments.meal_submission_id')
            ->avg('ai_assessments.final_score') ?? 0;

        // Get critical violations
        $criticalViolations = MealSubmission::whereDate('meal_submissions.created_at', $date)
            ->join('ai_assessments', 'meal_submissions.id', '=', 'ai_assessments.meal_submission_id')
            ->join('violations', 'ai_assessments.id', '=', 'violations.ai_assessment_id')
            ->where('violations.severity', 'CRITICAL')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date->format('Y-m-d'),
                'today_submissions' => $todaySubmissions,
                'active_alerts' => $dangerCount,
                'warning_alerts' => $warningCount,
                'safe_count' => $safeCount,
                'average_score' => round($avgScore, 1),
                'critical_violations' => $criticalViolations,
                'summary' => [
                    'total' => $todaySubmissions,
                    'danger' => $dangerCount,
                    'warning' => $warningCount,
                    'safe' => $safeCount,
                ]
            ]
        ]);
    }

    public function recentSppg(Request $request)
    {
        $limit = $request->get('limit', 10);
        
        $recent = MealSubmission::with('sppg', 'aiAssessment')
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($sub) => [
                'submission_id' => $sub->id,
                'sppg' => $sub->sppg,
                'menu_name' => $sub->menu_name,
                'submitted_at' => $sub->created_at,
                'status' => $sub->status,
                'assessment' => $sub->aiAssessment ? [
                    'final_score' => $sub->aiAssessment->final_score,
                    'status' => $sub->aiAssessment->status,
                    'nutrition_score' => $sub->aiAssessment->nutrition_score,
                    'safety_score' => $sub->aiAssessment->safety_score,
                    'sanitation_score' => $sub->aiAssessment->sanitation_score,
                    'immediate_action_required' => $sub->aiAssessment->immediate_action_required,
                ] : null
            ]);

        return response()->json([
            'success' => true,
            'data' => $recent
        ]);
    }

    public function sppgStats(Request $request)
    {
        $sppgId = $request->get('sppg_id');
        $dateFrom = $request->get('date_from', Carbon::now()->subDays(30));
        $dateTo = $request->get('date_to', Carbon::now());

        $query = MealSubmission::whereBetween('created_at', [$dateFrom, $dateTo]);
        
        if ($sppgId) {
            $query->where('sppg_id', $sppgId);
        }

        $totalSubmissions = $query->count();
        $avgScore = $query->join('ai_assessments', 'meal_submissions.id', '=', 'ai_assessments.meal_submission_id')
            ->avg('ai_assessments.final_score') ?? 0;

        $statusBreakdown = $query->join('ai_assessments', 'meal_submissions.id', '=', 'ai_assessments.meal_submission_id')
            ->select('ai_assessments.status', DB::raw('count(*) as count'))
            ->groupBy('ai_assessments.status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ],
                'total_submissions' => $totalSubmissions,
                'average_score' => round($avgScore, 1),
                'status_breakdown' => $statusBreakdown,
            ]
        ]);
    }

    public function topViolations(Request $request)
    {
        $limit = $request->get('limit', 10);
        $dateFrom = $request->get('date_from', Carbon::now()->subDays(7));
        $dateTo = $request->get('date_to', Carbon::now());

        $violations = DB::table('violations')
            ->join('ai_assessments', 'violations.ai_assessment_id', '=', 'ai_assessments.id')
            ->join('meal_submissions', 'ai_assessments.meal_submission_id', '=', 'meal_submissions.id')
            ->whereBetween('meal_submissions.created_at', [$dateFrom, $dateTo])
            ->select('violations.description', 'violations.severity', DB::raw('count(*) as count'))
            ->groupBy('violations.description', 'violations.severity')
            ->orderByDesc('count')
            ->take($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $violations
        ]);
    }
}