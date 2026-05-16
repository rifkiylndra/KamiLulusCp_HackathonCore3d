<?php

namespace App\Services;

use App\DTOs\ScoringResult;
use App\Models\MealSubmission;

class ScoringEngine
{
    private const NUTRITION_WEIGHT = 0.40;

    private const SAFETY_WEIGHT = 0.40;

    private const SANITATION_WEIGHT = 0.20;

    private const MAX_COOK_TO_DISTRIBUTE_MINUTES = 240;

    /**
     * Hitung skor dengan data Gemini + submission (NutriGuard PROMPT 1-C).
     */
    public function calculate(array $geminiData, MealSubmission $submission): ScoringResult
    {
        $submission->loadMissing(['menuItems', 'sanitationCheck']);

        $violations = [];
        $feedback = [
            'immediate_actions' => [],
            'tomorrow_improvements' => [],
            'routine_notes' => [],
        ];

        $immediateAction = false;
        $hardRuleTriggered = false;

        $jedaMenit = NutriGuardPrompts::jedaMenitMasakDistribusi($submission);
        if ($jedaMenit > self::MAX_COOK_TO_DISTRIBUTE_MINUTES) {
            $jam = number_format($jedaMenit / 60, 1);
            $hardRuleTriggered = true;
            $immediateAction = true;
            $violations[] = [
                'dimension' => 'keamanan',
                'severity' => 'CRITICAL',
                'description' => "Jeda total masak hingga distribusi mencapai {$jam} jam, melebihi batas aman 4 jam",
                'corrective_action' => 'Hentikan distribusi segera. Makanan berisiko tinggi kontaminasi bakteri.',
            ];
            $feedback['immediate_actions'][] = 'Hentikan distribusi makanan sekarang — jeda masak melebihi 4 jam.';
        }

        $san = $submission->sanitationCheck;
        if ($san && in_array($san->ingredient_condition, ['rusak', 'mencurigakan'], true)) {
            $immediateAction = true;
            $violations[] = [
                'dimension' => 'sanitasi',
                'severity' => 'CRITICAL',
                'description' => 'Bahan diterima dalam kondisi '.$san->ingredient_condition,
                'corrective_action' => 'Pisahkan bahan dan hubungi supervisor BGN untuk penggantian bahan.',
            ];
            $feedback['immediate_actions'][] = 'Pisahkan bahan yang rusak/mencurigakan dari jalur masak.';
        }

        if ($san && $san->storage_type === 'suhu_ruang') {
            $hasProtein = $submission->menuItems->contains(fn ($i) => in_array($i->category, ['protein', 'protein_hewani', 'protein_nabati'], true));
            if ($hasProtein) {
                $violations[] = [
                    'dimension' => 'sanitasi',
                    'severity' => 'HIGH',
                    'description' => 'Protein disimpan pada suhu ruang',
                    'corrective_action' => 'Simpan protein di kulkas/freezer sebelum memasak.',
                ];
            }
        }

        $nutritionScore = $this->scoreNutrition($geminiData, $submission, $violations, $feedback);
        $safetyScore = $this->scoreSafety($geminiData, $submission, $violations, $feedback);
        $sanitationScore = $this->scoreSanitation($submission, $violations, $feedback);

        $finalScore = (int) round(
            ($nutritionScore * self::NUTRITION_WEIGHT) +
            ($safetyScore * self::SAFETY_WEIGHT) +
            ($sanitationScore * self::SANITATION_WEIGHT)
        );

        if ($hardRuleTriggered) {
            $finalScore = min($finalScore, 49);
        }

        $hasCritical = collect($violations)->contains(fn ($v) => ($v['severity'] ?? '') === 'CRITICAL');
        $status = $this->resolveStatus($finalScore, $hasCritical || $hardRuleTriggered);

        return new ScoringResult(
            nutritionScore: $nutritionScore,
            safetyScore: $safetyScore,
            sanitationScore: $sanitationScore,
            finalScore: $finalScore,
            status: $status,
            immediateActionRequired: $immediateAction || $status === 'BAHAYA',
            violations: $violations,
            correctiveFeedback: $feedback,
            rawResponse: json_encode([
                'gemini' => $geminiData,
                'final_score' => $finalScore,
                'status' => $status,
            ]),
        );
    }

    /** Backward compatibility untuk unit test & ScoringTestController. */
    public function calculateScore(MealSubmission $submission): ScoringResult
    {
        return $this->calculate([], $submission);
    }

    private function scoreNutrition(array $gemini, MealSubmission $submission, array &$violations, array &$feedback): int
    {
        if (! empty($gemini['calories_per_portion']) || ! empty($gemini['protein_per_portion_gram'])) {
            $score = 100;
            $cal = (float) ($gemini['calories_per_portion'] ?? 0);
            if ($cal > 0) {
                if ($cal <= 450 || $cal > 900) {
                    $score -= 25;
                    $violations[] = $this->violation('gizi', 'LOW', 'Kalori per porsi di luar rentang aman MBG', 'Sesuaikan porsi agar 550–750 kcal.');
                } elseif ($cal < 550 || $cal > 750) {
                    $score -= 10;
                }
            }
            $protein = (float) ($gemini['protein_per_portion_gram'] ?? 0);
            if ($protein > 0 && $protein < 9) {
                $score -= 25;
                $violations[] = $this->violation('gizi', 'HIGH', "Protein {$protein} g/porsi di bawah standar minimum 12g MBG", 'Tambahkan lauk protein pada menu.');
            } elseif ($protein >= 9 && $protein < 12) {
                $score -= 15;
                $violations[] = $this->violation('gizi', 'MEDIUM', "Protein {$protein} g/porsi mendekati batas minimum", 'Tambah porsi protein hewani/nabati.');
            } elseif ($protein >= 12 && $protein < 15) {
                $score -= 5;
            }
            if (! empty($gemini['has_vegetables'])) {
                $score += 5;
            }
            if (! empty($gemini['has_fruit'])) {
                $score += 5;
            }
            if (($gemini['ingredient_variety_count'] ?? 0) >= 4) {
                $score += 5;
            }

            return max(0, min(100, $score));
        }

        return $this->scoreNutritionFromMenu($submission, $violations, $feedback);
    }

    private function scoreNutritionFromMenu(MealSubmission $submission, array &$violations, array &$feedback): int
    {
        $score = 100;
        $items = $submission->menuItems;
        if ($items->isEmpty()) {
            return 0;
        }

        $categories = $items->pluck('category')->map(fn ($c) => strtolower((string) $c));
        $hasProtein = $categories->contains(fn ($c) => str_contains($c, 'protein'));
        $hasCarbs = $categories->intersect(['karbohidrat', 'carbs', 'karbohidrat'])->isNotEmpty();
        $hasVegetables = $categories->intersect(['sayur', 'vegetables', 'sayur-mayur'])->isNotEmpty();
        $hasFruit = $categories->contains('fruits') || $categories->contains('buah');

        if (! $hasProtein) {
            $score -= 25;
        }
        if (! $hasCarbs) {
            $score -= 25;
        }
        if (! $hasVegetables) {
            $score -= 20;
        }
        if (! $hasFruit) {
            $score -= 15;
        }

        $variety = collect([$hasProtein, $hasCarbs, $hasVegetables, $hasFruit])->filter()->count();
        if ($variety === 4) {
            $score = min(100, $score + 10);
        }

        if ($score < 60) {
            $violations[] = $this->violation('gizi', $score < 40 ? 'HIGH' : 'MEDIUM', 'Menu kurang variasi gizi', 'Tambahkan protein, karbohidrat, sayur, dan buah.');
            $feedback['tomorrow_improvements'][] = 'Rencanakan menu dengan variasi gizi lebih lengkap.';
        }

        return max(0, $score);
    }

    private function scoreSafety(array $gemini, MealSubmission $submission, array &$violations, array &$feedback): int
    {
        $score = 100;

        $cookToServe = (float) ($gemini['cook_to_serve_hours'] ?? 0);
        if ($cookToServe <= 0 && $submission->cook_start_at && $submission->serve_planned_at) {
            $cookToServe = abs($submission->cook_start_at->diffInMinutes($submission->serve_planned_at)) / 60;
        }

        if ($cookToServe > 4) {
            $score -= 50;
        } elseif ($cookToServe > 3) {
            $score -= 20;
            $violations[] = $this->violation('keamanan', 'MEDIUM', 'Jeda masak ke sajian terlalu lama', 'Percepat penyajian setelah memasak.');
        } elseif ($cookToServe > 2) {
            $score -= 5;
        }

        $serveToDist = (float) ($gemini['serve_to_distribute_hours'] ?? 0);
        if ($serveToDist <= 0 && $submission->serve_planned_at && $submission->distribute_at) {
            $serveToDist = abs($submission->serve_planned_at->diffInMinutes($submission->distribute_at)) / 60;
        }

        if ($serveToDist > 2) {
            $score -= 25;
            $violations[] = $this->violation('keamanan', 'HIGH', 'Jeda sajian ke distribusi terlalu lama', 'Distribusikan segera setelah sajian.');
        } elseif ($serveToDist > 1) {
            $score -= 10;
        }

        if (! $submission->image_path) {
            $score -= 5;
        }

        return max(0, min(100, $score));
    }

    private function scoreSanitation(MealSubmission $submission, array &$violations, array &$feedback): int
    {
        $san = $submission->sanitationCheck;
        if (! $san) {
            return 50;
        }

        $score = NutriGuardPrompts::sanitationPercentFromCheck($submission);

        if (! $san->apd_used) {
            $violations[] = $this->violation('sanitasi', 'HIGH', 'APD tidak digunakan saat memasak', 'Wajibkan sarung tangan, masker, dan hairnet.');
            $feedback['immediate_actions'][] = 'Pastikan semua petugas memakai APD lengkap.';
        }
        if (! $san->kitchen_cleaned) {
            $violations[] = $this->violation('sanitasi', 'MEDIUM', 'Dapur belum dibersihkan sebelum memasak', 'Bersihkan dapur dan peralatan sebelum produksi.');
        }
        if ($san->supplier_source !== 'resmi') {
            $violations[] = $this->violation('sanitasi', 'LOW', 'Bahan tidak dari supplier resmi', 'Utamakan supplier bersertifikat.');
            $feedback['routine_notes'][] = 'Verifikasi sertifikat supplier setiap minggu.';
        }

        return max(0, min(100, $score));
    }

    private function resolveStatus(int $finalScore, bool $criticalOrHardRule): string
    {
        if ($criticalOrHardRule || $finalScore < 50) {
            return 'BAHAYA';
        }
        if ($finalScore < 75) {
            return 'PERHATIAN';
        }

        return 'AMAN';
    }

    private function violation(string $dimension, string $severity, string $description, string $corrective): array
    {
        return [
            'dimension' => $dimension,
            'severity' => $severity,
            'description' => $description,
            'corrective_action' => $corrective,
        ];
    }
}
