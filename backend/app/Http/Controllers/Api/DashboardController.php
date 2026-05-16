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

    public function monthlyStats()
    {
        try {
            $oneMonthAgo = Carbon::now()->subMonth();
            
            // Get monthly submission counts by status
            $monthlySubmissions = MealSubmission::with('aiAssessment')
                ->where('created_at', '>=', $oneMonthAgo)
                ->get();

            $stats = [
                'total_monthly' => $monthlySubmissions->count(),
                'aman' => 0,
                'perhatian' => 0,
                'bahaya' => 0,
            ];

            foreach ($monthlySubmissions as $submission) {
                if ($submission->aiAssessment) {
                    $status = strtolower($submission->aiAssessment->status ?? 'unknown');
                    if ($status === 'aman') {
                        $stats['aman']++;
                    } elseif ($status === 'perhatian') {
                        $stats['perhatian']++;
                    } elseif ($status === 'bahaya') {
                        $stats['bahaya']++;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly stats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function weeklyTrend()
    {
        try {
            $weeklyData = [];
            $days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
            
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dayName = $days[$date->dayOfWeek];
                
                $submissions = MealSubmission::with('aiAssessment')
                    ->whereDate('created_at', $date->toDateString())
                    ->get();

                $gizi = 0;
                $keamanan = 0;
                $sanitasi = 0;
                $count = 0;

                foreach ($submissions as $submission) {
                    if ($submission->aiAssessment) {
                        $gizi += $submission->aiAssessment->nutrition_score ?? 0;
                        $keamanan += $submission->aiAssessment->safety_score ?? 0;
                        $sanitasi += $submission->aiAssessment->sanitation_score ?? 0;
                        $count++;
                    }
                }

                $weeklyData[] = [
                    'day' => $dayName,
                    'gizi' => $count > 0 ? round($gizi / $count) : 0,
                    'keamanan' => $count > 0 ? round($keamanan / $count) : 0,
                    'sanitasi' => $count > 0 ? round($sanitasi / $count) : 0,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $weeklyData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch weekly trend',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function statusDistribution()
    {
        try {
            $submissions = MealSubmission::with('aiAssessment')->get();
            
            $distribution = [
                'aman' => 0,
                'perhatian' => 0,
                'bahaya' => 0,
            ];

            foreach ($submissions as $submission) {
                if ($submission->aiAssessment) {
                    $status = strtolower($submission->aiAssessment->status ?? 'unknown');
                    if (isset($distribution[$status])) {
                        $distribution[$status]++;
                    }
                }
            }

            $total = array_sum($distribution);
            
            $result = [];
            if ($total > 0) {
                $result = [
                    ['name' => 'AMAN', 'value' => round(($distribution['aman'] / $total) * 100), 'color' => '#0D5C3A'],
                    ['name' => 'PERHATIAN', 'value' => round(($distribution['perhatian'] / $total) * 100), 'color' => '#F59E0B'],
                    ['name' => 'BAHAYA', 'value' => round(($distribution['bahaya'] / $total) * 100), 'color' => '#EF4444'],
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'distribution' => $result,
                    'total' => $total,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch status distribution',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function sppgLeaderboard()
    {
        try {
            $sppgs = \App\Models\Sppg::all();
            
            $leaderboard = $sppgs->map(function ($sppg) {
                $submissions = MealSubmission::where('sppg_id', $sppg->id)
                    ->with('aiAssessment')
                    ->get();
                
                $totalSubmissions = $submissions->count();
                $averageScore = 0;
                $amanCount = 0;
                $perhatianCount = 0;
                $bahayaCount = 0;
                $lastSubmission = null;
                
                if ($totalSubmissions > 0) {
                    $scores = [];
                    foreach ($submissions as $submission) {
                        if ($submission->aiAssessment) {
                            $scores[] = $submission->aiAssessment->final_score;
                            
                            $status = strtolower($submission->aiAssessment->status ?? '');
                            if ($status === 'aman') $amanCount++;
                            elseif ($status === 'perhatian') $perhatianCount++;
                            elseif ($status === 'bahaya') $bahayaCount++;
                        }
                    }
                    
                    if (count($scores) > 0) {
                        $averageScore = round(array_sum($scores) / count($scores), 1);
                    }
                    
                    $lastSubmission = $submissions->sortByDesc('created_at')->first()->created_at;
                }
                
                return [
                    'id' => $sppg->id,
                    'name' => $sppg->name,
                    'location' => $sppg->location,
                    'province' => $sppg->province,
                    'total_submissions' => $totalSubmissions,
                    'average_score' => $averageScore,
                    'aman_count' => $amanCount,
                    'perhatian_count' => $perhatianCount,
                    'bahaya_count' => $bahayaCount,
                    'last_submission' => $lastSubmission,
                    'status' => $averageScore >= 90 ? 'EXCELLENT' : 
                               ($averageScore >= 80 ? 'GOOD' : 
                               ($averageScore >= 70 ? 'FAIR' : 
                               ($averageScore > 0 ? 'POOR' : 'NO_DATA')))
                ];
            })
            ->sortByDesc('average_score')
            ->values()
            ->map(function ($item, $index) {
                $item['rank'] = $index + 1;
                return $item;
            });

            return response()->json([
                'success' => true,
                'data' => $leaderboard,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SPPG leaderboard',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}