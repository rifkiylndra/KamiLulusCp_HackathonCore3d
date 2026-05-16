<?php

namespace App\Services;

use App\DTOs\ScoringResult;
use App\Models\MealSubmission;
use Carbon\Carbon;

class ScoringEngine
{
    // Scoring weights
    private const NUTRITION_WEIGHT = 0.40;
    private const SAFETY_WEIGHT = 0.40;
    private const SANITATION_WEIGHT = 0.20;

    // Hard rules
    private const MAX_FOOD_HOLDING_HOURS = 4;

    // Score thresholds
    private const DANGER_THRESHOLD = 60;
    private const WARNING_THRESHOLD = 75;

    /**
     * Calculate comprehensive score for meal submission
     */
    public function calculateScore(MealSubmission $submission): ScoringResult
    {
        $violations = [];
        $correctiveFeedback = [
            'immediate_actions' => [],
            'tomorrow_improvements' => [],
            'routine_notes' => [],
        ];

        // Check hard rules first
        $hardRuleViolation = $this->checkHardRules($submission);
        if ($hardRuleViolation) {
            $violations[] = $hardRuleViolation;
            $correctiveFeedback['immediate_actions'][] = $hardRuleViolation['corrective_action'];
        }

        // Calculate individual scores
        $nutritionScore = $this->calculateNutritionScore($submission);
        $safetyScore = $this->calculateSafetyScore($submission);
        $sanitationScore = $this->calculateSanitationScore($submission);

        // Calculate final score (weighted average)
        $finalScore = (int) round(
            ($nutritionScore * self::NUTRITION_WEIGHT) +
            ($safetyScore * self::SAFETY_WEIGHT) +
            ($sanitationScore * self::SANITATION_WEIGHT)
        );

        // Determine status
        $status = $this->determineStatus($finalScore, $hardRuleViolation !== null);

        // Generate violations based on scores
        $scoreViolations = $this->generateViolations(
            $nutritionScore,
            $safetyScore,
            $sanitationScore
        );
        $violations = array_merge($violations, $scoreViolations);

        // Generate corrective feedback
        $correctiveFeedback = $this->generateCorrectiveFeedback(
            $nutritionScore,
            $safetyScore,
            $sanitationScore,
            $correctiveFeedback
        );

        return new ScoringResult(
            nutritionScore: $nutritionScore,
            safetyScore: $safetyScore,
            sanitationScore: $sanitationScore,
            finalScore: $finalScore,
            status: $status,
            immediateActionRequired: $status === 'BAHAYA' || $hardRuleViolation !== null,
            violations: $violations,
            correctiveFeedback: $correctiveFeedback,
            rawResponse: json_encode([
                'nutrition_score' => $nutritionScore,
                'safety_score' => $safetyScore,
                'sanitation_score' => $sanitationScore,
                'final_score' => $finalScore,
                'status' => $status,
            ])
        );
    }

    /**
     * Check hard rules (time-based violations)
     */
    private function checkHardRules(MealSubmission $submission): ?array
    {
        // Rule: Food holding time should not exceed 4 hours
        if ($submission->cook_start_at && $submission->serve_planned_at) {
            $holdingTime = $submission->cook_start_at->diffInHours($submission->serve_planned_at);

            if ($holdingTime > self::MAX_FOOD_HOLDING_HOURS) {
                return [
                    'dimension' => 'SAFETY',
                    'severity' => 'CRITICAL',
                    'description' => "Waktu penyimpanan makanan melebihi " . self::MAX_FOOD_HOLDING_HOURS . " jam ({$holdingTime} jam). Risiko pertumbuhan bakteri patogen sangat tinggi.",
                    'corrective_action' => 'Segera kurangi waktu penyimpanan atau tingkatkan suhu penyimpanan. Pertimbangkan untuk memasak lebih dekat dengan waktu penyajian.',
                ];
            }
        }

        return null;
    }

    /**
     * Calculate nutrition score (0-100)
     * Based on menu items variety and nutritional completeness
     */
    private function calculateNutritionScore(MealSubmission $submission): int
    {
        $score = 100;
        $menuItems = $submission->menuItems;

        if ($menuItems->isEmpty()) {
            return 0;
        }

        // Check for nutritional variety by category
        $categories = $menuItems->pluck('category')->unique();
        $hasProtein = $categories->contains('protein');
        $hasCarbs = $categories->contains('carbs');
        $hasVegetables = $categories->contains('vegetables');
        $hasFruit = $categories->contains('fruits');

        // Deduct points for missing food groups
        if (!$hasProtein) $score -= 25;
        if (!$hasCarbs) $score -= 25;
        if (!$hasVegetables) $score -= 20;
        if (!$hasFruit) $score -= 15;

        // Bonus for variety
        $varietyCount = collect([$hasProtein, $hasCarbs, $hasVegetables, $hasFruit])->filter()->count();
        if ($varietyCount === 4) {
            $score = min(100, $score + 10);
        }

        return max(0, $score);
    }

    /**
     * Calculate safety score (0-100)
     * Based on food handling and storage conditions
     */
    private function calculateSafetyScore(MealSubmission $submission): int
    {
        $score = 100;

        // Check holding time (soft rule)
        if ($submission->cook_start_at && $submission->serve_planned_at) {
            $holdingTime = $submission->cook_start_at->diffInHours($submission->serve_planned_at);
            if ($holdingTime > 2) {
                $score -= min(30, $holdingTime * 5); // Deduct 5 points per hour over 2 hours
            }
        }

        // Check if distribution happened (food safety concern if delayed)
        if ($submission->distribute_at && $submission->serve_planned_at) {
            $delayMinutes = $submission->serve_planned_at->diffInMinutes($submission->distribute_at);
            if ($delayMinutes > 30) {
                $score -= min(20, ($delayMinutes / 30) * 5);
            }
        }

        // Check image documentation (safety compliance)
        if (!$submission->image_path) {
            $score -= 10;
        }

        return max(0, $score);
    }

    /**
     * Calculate sanitation score (0-100)
     * Based on sanitation check data
     */
    private function calculateSanitationScore(MealSubmission $submission): int
    {
        $score = 100;
        $sanitationCheck = $submission->sanitationCheck;

        if (!$sanitationCheck) {
            return 50; // Default score if no sanitation check
        }

        // Evaluate sanitation check fields
        if (!$sanitationCheck->apd_used) {
            $score -= 25; // APD (Personal Protective Equipment) is critical
        }

        if (!$sanitationCheck->kitchen_cleaned) {
            $score -= 25; // Kitchen cleanliness is critical
        }

        // Evaluate storage type
        if ($sanitationCheck->storage_type === 'suhu_ruang') {
            $score -= 20; // Room temperature storage is risky
        } elseif ($sanitationCheck->storage_type === 'kulkas') {
            $score -= 5; // Refrigerator is acceptable but not ideal
        }
        // freezer is best (no deduction)

        // Evaluate ingredient condition
        if ($sanitationCheck->ingredient_condition === 'rusak') {
            $score -= 30; // Damaged ingredients are critical
        } elseif ($sanitationCheck->ingredient_condition === 'mencurigakan') {
            $score -= 20; // Suspicious ingredients are concerning
        }

        // Evaluate supplier source
        if ($sanitationCheck->supplier_source === 'pasar') {
            $score -= 10; // Market source is less reliable
        } elseif ($sanitationCheck->supplier_source === 'lainnya') {
            $score -= 15; // Unknown source is risky
        }
        // resmi (official) is best (no deduction)

        return max(0, $score);
    }

    /**
     * Determine overall status based on final score
     */
    private function determineStatus(int $finalScore, bool $hasHardRuleViolation): string
    {
        if ($hasHardRuleViolation || $finalScore < self::DANGER_THRESHOLD) {
            return 'BAHAYA';
        }

        if ($finalScore < self::WARNING_THRESHOLD) {
            return 'PERHATIAN';
        }

        return 'AMAN';
    }

    /**
     * Generate violations based on individual scores
     */
    private function generateViolations(int $nutritionScore, int $safetyScore, int $sanitationScore): array
    {
        $violations = [];

        // Nutrition violations
        if ($nutritionScore < 60) {
            $violations[] = [
                'dimension' => 'NUTRITION',
                'severity' => $nutritionScore < 40 ? 'HIGH' : 'MEDIUM',
                'description' => 'Menu makanan kurang lengkap dari segi gizi. Kurang variasi dalam kelompok makanan pokok, lauk pauk, sayuran, atau buah-buahan.',
                'corrective_action' => 'Tambahkan variasi menu dengan memastikan ada protein, karbohidrat, sayuran, dan buah dalam setiap penyajian.',
            ];
        }

        // Safety violations
        if ($safetyScore < 60) {
            $violations[] = [
                'dimension' => 'SAFETY',
                'severity' => $safetyScore < 40 ? 'HIGH' : 'MEDIUM',
                'description' => 'Praktik keamanan pangan tidak memadai. Waktu penyimpanan atau penanganan makanan tidak sesuai standar.',
                'corrective_action' => 'Kurangi waktu penyimpanan makanan, tingkatkan suhu penyimpanan, dan pastikan dokumentasi foto tersedia.',
            ];
        }

        // Sanitation violations
        if ($sanitationScore < 60) {
            $violations[] = [
                'dimension' => 'SANITATION',
                'severity' => $sanitationScore < 40 ? 'HIGH' : 'MEDIUM',
                'description' => 'Standar sanitasi dan kebersihan tidak terpenuhi. Ditemukan kekurangan dalam kebersihan tangan, peralatan, atau lingkungan.',
                'corrective_action' => 'Tingkatkan protokol kebersihan, pastikan cuci tangan sebelum memasak, bersihkan peralatan dengan benar, dan kelola limbah dengan baik.',
            ];
        }

        return $violations;
    }

    /**
     * Generate corrective feedback
     */
    private function generateCorrectiveFeedback(
        int $nutritionScore,
        int $safetyScore,
        int $sanitationScore,
        array $existingFeedback
    ): array
    {
        $feedback = $existingFeedback;

        // Immediate actions
        if ($safetyScore < 50) {
            $feedback['immediate_actions'][] = 'Hentikan penyajian makanan sampai masalah keamanan pangan teratasi.';
        }
        if ($sanitationScore < 50) {
            $feedback['immediate_actions'][] = 'Lakukan pembersihan menyeluruh pada area persiapan makanan dan peralatan.';
        }

        // Tomorrow improvements
        if ($nutritionScore < 70) {
            $feedback['tomorrow_improvements'][] = 'Rencanakan menu dengan variasi gizi yang lebih baik untuk hari esok.';
        }
        if ($safetyScore < 70) {
            $feedback['tomorrow_improvements'][] = 'Kurangi waktu penyimpanan makanan atau tingkatkan sistem pendinginan.';
        }

        // Routine notes
        $feedback['routine_notes'][] = 'Selalu dokumentasikan setiap tahap persiapan makanan dengan foto.';
        $feedback['routine_notes'][] = 'Lakukan pemeriksaan sanitasi secara berkala setiap hari.';
        $feedback['routine_notes'][] = 'Pastikan semua staf memahami protokol keamanan pangan.';

        return $feedback;
    }
}
