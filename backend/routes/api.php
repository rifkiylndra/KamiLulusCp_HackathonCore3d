<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MealSubmissionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SppgController;

// SPPG
Route::apiResource('sppg', SppgController::class);

// Submissions
Route::prefix('submissions')->group(function () {
    Route::post('/', [MealSubmissionController::class, 'store']);
    Route::get('/', [MealSubmissionController::class, 'index']);
    Route::get('/{id}', [MealSubmissionController::class, 'show']);
    Route::get('/{id}/status', [MealSubmissionController::class, 'status']);
});

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/recent-sppg', [DashboardController::class, 'recentSppg']);