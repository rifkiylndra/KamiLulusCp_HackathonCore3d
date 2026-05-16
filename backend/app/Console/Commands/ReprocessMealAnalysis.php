<?php

namespace App\Console\Commands;

use App\Jobs\ProcessMealAnalysis;
use App\Models\AiAssessment;
use App\Models\MealSubmission;
use Illuminate\Console\Command;

class ReprocessMealAnalysis extends Command
{
    protected $signature = 'nutriguard:reprocess {submission_id : ID meal submission}';

    protected $description = 'Jalankan ulang analisis AI NutriGuard untuk satu submission';

    public function handle(): int
    {
        $submission = MealSubmission::find($this->argument('submission_id'));

        if (! $submission) {
            $this->error('Submission tidak ditemukan.');

            return self::FAILURE;
        }

        $existing = AiAssessment::where('meal_submission_id', $submission->id)->first();
        if ($existing) {
            $existing->violations()->delete();
            $existing->correctiveFeedback()?->delete();
            $existing->delete();
        }
        $submission->update(['status' => 'pending']);

        ProcessMealAnalysis::dispatch($submission);

        $this->info("Submission #{$submission->id} dikirim ke antrian AI.");

        return self::SUCCESS;
    }
}
