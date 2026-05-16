<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    public static function log(string $action, string $model, int $modelId, array $data = [], string $status = 'success'): void
    {
        Log::channel('audit')->info('Audit log', [
            'timestamp' => now(),
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'data' => $data,
            'status' => $status,
        ]);
    }

    public static function logSubmissionCreated(int $submissionId, array $data): void
    {
        self::log('submission_created', 'MealSubmission', $submissionId, [
            'menu_name' => $data['menu_name'] ?? null,
            'sppg_id' => $data['sppg_id'] ?? null,
            'portion_count' => $data['portion_count'] ?? null,
        ]);
    }

    public static function logSubmissionUpdated(int $submissionId, array $changes): void
    {
        self::log('submission_updated', 'MealSubmission', $submissionId, $changes);
    }

    public static function logSubmissionDeleted(int $submissionId, array $data): void
    {
        self::log('submission_deleted', 'MealSubmission', $submissionId, $data);
    }

    public static function logAssessmentCompleted(int $submissionId, array $assessment): void
    {
        self::log('assessment_completed', 'MealSubmission', $submissionId, [
            'final_score' => $assessment['final_score'] ?? null,
            'status' => $assessment['status'] ?? null,
            'violations_count' => $assessment['violations_count'] ?? null,
        ]);
    }

    public static function logAssessmentFailed(int $submissionId, string $error): void
    {
        self::log('assessment_failed', 'MealSubmission', $submissionId, [
            'error' => $error,
        ], 'failed');
    }
}
