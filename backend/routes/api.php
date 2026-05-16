<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MealSubmissionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SppgController;
use App\Http\Controllers\Api\ScoringTestController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VisionController;

// Authentication routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);

// Vision (analisis foto — doVision app.js)
Route::post('/vision/analyze-photo', [VisionController::class, 'analyzePhoto']);

// Test CORS endpoint
Route::get('/test-cors', function () {
    return response()->json([
        'success' => true,
        'message' => 'CORS is working!',
        'timestamp' => now()->toDateTimeString(),
    ]);
});

Route::post('/test-cors-post', function () {
    return response()->json([
        'success' => true,
        'message' => 'CORS POST is working!',
        'data' => request()->all(),
    ]);
});

// SPPG
Route::apiResource('sppg', SppgController::class);

// Submissions
Route::prefix('submissions')->group(function () {
    Route::post('/', [MealSubmissionController::class, 'store']);
    Route::get('/', [MealSubmissionController::class, 'index']);
    Route::get('/search', [MealSubmissionController::class, 'search']);
    Route::get('/{id}/status', [MealSubmissionController::class, 'status']);
    Route::get('/{id}', [MealSubmissionController::class, 'show']);
    Route::put('/{id}', [MealSubmissionController::class, 'update']);
    Route::delete('/{id}', [MealSubmissionController::class, 'destroy']);
});

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/recent-sppg', [DashboardController::class, 'recentSppg']);
Route::get('/dashboard/sppg-stats', [DashboardController::class, 'sppgStats']);
Route::get('/dashboard/top-violations', [DashboardController::class, 'topViolations']);

// RiwayatPage endpoints
Route::get('/dashboard/monthly-stats', [DashboardController::class, 'monthlyStats']);
Route::get('/dashboard/weekly-trend', [DashboardController::class, 'weeklyTrend']);
Route::get('/dashboard/status-distribution', [DashboardController::class, 'statusDistribution']);
Route::get('/dashboard/sppg-leaderboard', [DashboardController::class, 'sppgLeaderboard']);

// Scoring Test Endpoints
Route::prefix('scoring-test')->group(function () {
    Route::get('/perfect', [ScoringTestController::class, 'testPerfectSubmission']);
    Route::get('/hard-rule-violation', [ScoringTestController::class, 'testHardRuleViolation']);
    Route::get('/poor-nutrition', [ScoringTestController::class, 'testPoorNutrition']);
    Route::get('/poor-sanitation', [ScoringTestController::class, 'testPoorSanitation']);
    Route::get('/score/{submissionId}', [ScoringTestController::class, 'scoreSubmission']);
    Route::get('/list', [ScoringTestController::class, 'listTestSubmissions']);
});