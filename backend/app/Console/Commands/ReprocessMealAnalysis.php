<?php

namespace App\Console\Commands;

use App\Models\MealSubmission;
use App\Jobs\ProcessMealAnalysis;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ReprocessMealAnalysis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nutriguard:reprocess {id : The submission ID to reprocess} {--force : Force reprocessing without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reprocess a meal submission analysis';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $submissionId = $this->argument('id');
        $force = $this->option('force');

        // Find the submission
        $submission = MealSubmission::find($submissionId);

        if (!$submission) {
            $this->error("Submission with ID {$submissionId} not found");
            return 1;
        }

        // Show submission details
        $this->info("Submission Details:");
        $this->line("ID: {$submission->id}");
        $this->line("Menu: {$submission->menu_name}");
        $this->line("Status: {$submission->status}");
        $this->line("Created: {$submission->created_at}");

        // Confirm reprocessing
        if (!$force && !$this->confirm('Do you want to reprocess this submission?')) {
            $this->info('Reprocessing cancelled');
            return 0;
        }

        try {
            // Reset status to processing
            $submission->update(['status' => 'processing']);

            // Delete existing assessment if any
            if ($submission->aiAssessment) {
                $submission->aiAssessment->violations()->delete();
                $submission->aiAssessment->correctiveFeedback()->delete();
                $submission->aiAssessment->delete();
            }

            // Dispatch the job
            ProcessMealAnalysis::dispatch($submission);

            Log::info('Meal submission reprocessing initiated', [
                'submission_id' => $submission->id,
                'menu_name' => $submission->menu_name,
            ]);

            $this->info("✓ Submission {$submissionId} has been queued for reprocessing");
            $this->line("Status: processing");
            $this->line("Check the status with: php artisan queue:work");

            return 0;
        } catch (\Exception $e) {
            Log::error('Meal submission reprocessing failed', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage(),
            ]);

            $this->error("Error reprocessing submission: {$e->getMessage()}");
            return 1;
        }
    }
}
