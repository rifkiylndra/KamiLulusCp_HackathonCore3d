<?php

namespace App\Services;

use App\Exceptions\GeminiParseException;
use App\Exceptions\VisionAnalysisException;
use App\Support\GeminiJsonParser;
use Illuminate\Support\Facades\Log;

class GeminiResponseParser
{
    public static function parseNutritionAnalysis(string $response): array
    {
        try {
            $data = GeminiJsonParser::parse($response);
            $nutrition = $data['nutrition_analysis'] ?? [];
            $safety = $data['food_safety_analysis'] ?? [];

            return [
                'calories_per_portion' => self::clampFloat($nutrition['calories_per_portion'] ?? 0, 0, 3000),
                'protein_per_portion_gram' => self::clampFloat($nutrition['protein_per_portion_gram'] ?? 0, 0, 200),
                'carbs_per_portion_gram' => self::clampFloat($nutrition['carbs_per_portion_gram'] ?? 0, 0, 500),
                'fat_per_portion_gram' => self::clampFloat($nutrition['fat_per_portion_gram'] ?? 0, 0, 200),
                'fiber_per_portion_gram' => self::clampFloat($nutrition['fiber_per_portion_gram'] ?? 0, 0, 100),
                'has_vegetables' => (bool) ($nutrition['has_vegetables'] ?? false),
                'has_fruit' => (bool) ($nutrition['has_fruit'] ?? false),
                'ingredient_variety_count' => (int) ($nutrition['ingredient_variety_count'] ?? 0),
                'meets_minimum_standard' => (bool) ($nutrition['meets_minimum_standard'] ?? false),
                'nutrition_notes' => (string) ($nutrition['nutrition_notes'] ?? ''),
                'serve_to_distribute_hours' => self::clampFloat($safety['serve_to_distribute_hours'] ?? 0, 0, 24),
                'temperature_risk_level' => (string) ($safety['temperature_risk_level'] ?? 'MEDIUM'),
                'safety_notes' => (string) ($safety['safety_notes'] ?? ''),
                'raw_response' => $response,
            ];
        } catch (\Throwable $e) {
            Log::channel('gemini')->error('parseNutritionAnalysis failed', ['error' => $e->getMessage()]);
            throw new GeminiParseException('Gagal parse respons gizi Gemini: '.$e->getMessage());
        }
    }

    /**
     * Respons penilaian penuh (format app.js doSubmit).
     */
    public static function parseAssessmentResponse(string $response): array
    {
        try {
            $data = GeminiJsonParser::parse($response);

            $violations = [];
            foreach ($data['violations'] ?? [] as $v) {
                $violations[] = [
                    'dimension' => strtolower($v['dimension'] ?? 'keamanan'),
                    'severity' => strtoupper($v['severity'] ?? 'MEDIUM'),
                    'description' => $v['pesan'] ?? $v['description'] ?? '',
                    'corrective_action' => $v['corrective_action'] ?? '',
                ];
            }

            return [
                'nutrition_score' => (int) ($data['skor_gizi'] ?? $data['nutrition_score'] ?? 0),
                'safety_score' => (int) ($data['skor_keamanan'] ?? $data['safety_score'] ?? 0),
                'sanitation_score' => (int) ($data['skor_sanitasi'] ?? $data['sanitation_score'] ?? 0),
                'final_score' => (int) ($data['skor_total'] ?? $data['final_score'] ?? 0),
                'status' => strtoupper($data['status'] ?? 'PERHATIAN'),
                'violations' => $violations,
                'corrective_feedback' => [
                    'immediate_actions' => array_values($data['feedback_segera'] ?? $data['immediate_actions'] ?? []),
                    'tomorrow_improvements' => array_values($data['feedback_besok'] ?? $data['tomorrow_improvements'] ?? []),
                    'routine_notes' => array_values($data['catatan_rutin'] ?? $data['routine_notes'] ?? []),
                ],
                'nutrition_summary' => (string) ($data['ringkasan_gizi'] ?? ''),
                'raw_response' => $response,
            ];
        } catch (\Throwable $e) {
            Log::channel('gemini')->error('parseAssessmentResponse failed', ['error' => $e->getMessage()]);
            throw new GeminiParseException('Gagal parse penilaian Gemini: '.$e->getMessage());
        }
    }

    /**
     * Vision — format app.js (nama_menu + bahan) atau NutriGuard (detected_ingredients).
     */
    public static function parseVisionResponse(string $response): array
    {
        try {
            $data = GeminiJsonParser::parse($response);

            if (! empty($data['error'])) {
                throw new VisionAnalysisException((string) $data['error']);
            }

            if (! empty($data['nama_menu']) || ! empty($data['bahan'])) {
                $ingredients = [];
                foreach ($data['bahan'] ?? [] as $b) {
                    $ingredients[] = [
                        'name' => $b['nama'] ?? $b['name'] ?? '',
                        'estimated_weight_gram' => (float) ($b['gram'] ?? $b['estimated_weight_gram'] ?? 0),
                        'category' => self::guessCategory($b['nama'] ?? $b['name'] ?? ''),
                        'confidence' => 'medium',
                    ];
                }

                return [
                    'menu_name' => $data['nama_menu'] ?? '',
                    'detected_ingredients' => $ingredients,
                    'visual_condition' => 'baik',
                    'visual_notes' => $data['catatan'] ?? '',
                ];
            }

            if (! empty($data['detected_ingredients'])) {
                return [
                    'menu_name' => '',
                    'detected_ingredients' => $data['detected_ingredients'],
                    'visual_condition' => $data['visual_condition'] ?? 'baik',
                    'estimated_portions' => (int) ($data['estimated_portions'] ?? 1),
                    'visual_notes' => $data['visual_notes'] ?? '',
                ];
            }

            throw new VisionAnalysisException('Format vision tidak dikenali dari Gemini.');
        } catch (VisionAnalysisException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::channel('gemini')->error('parseVisionResponse failed', ['error' => $e->getMessage()]);
            throw new VisionAnalysisException('Gagal parse foto menu: '.$e->getMessage());
        }
    }

    /** @deprecated Gunakan parseNutritionAnalysis */
    public static function parseNutritionResponse(string $response): array
    {
        try {
            $parsed = self::parseNutritionAnalysis($response);

            return [
                'nutrition_score' => self::estimateNutritionScore($parsed),
                'safety_score' => self::estimateSafetyScore($parsed),
                'sanitation_score' => 70,
                'nutrition_notes' => $parsed['nutrition_notes'],
                'safety_notes' => $parsed['safety_notes'],
                'raw_response' => $response,
            ];
        } catch (GeminiParseException) {
            return self::defaultNutritionFallback();
        }
    }

    /** @deprecated */
    public static function parseImageResponse(string $response): array
    {
        try {
            return self::parseVisionResponse($response);
        } catch (VisionAnalysisException) {
            return ['detected_ingredients' => [], 'menu_name' => '', 'visual_notes' => 'Analisis gagal'];
        }
    }

    private static function defaultNutritionFallback(): array
    {
        return [
            'nutrition_score' => 50,
            'safety_score' => 50,
            'sanitation_score' => 50,
            'nutrition_notes' => '',
            'safety_notes' => '',
            'raw_response' => '',
        ];
    }

    private static function estimateNutritionScore(array $parsed): int
    {
        $score = 100;
        $cal = $parsed['calories_per_portion'];
        if ($cal > 0) {
            if ($cal < 451 || $cal > 900) {
                $score -= 25;
            } elseif ($cal < 550 || $cal > 750) {
                $score -= 10;
            }
        }
        $protein = $parsed['protein_per_portion_gram'];
        if ($protein < 9) {
            $score -= 25;
        } elseif ($protein < 12) {
            $score -= 15;
        } elseif ($protein < 15) {
            $score -= 5;
        }
        if ($parsed['has_vegetables']) {
            $score += 5;
        }
        if ($parsed['has_fruit']) {
            $score += 5;
        }
        if ($parsed['ingredient_variety_count'] >= 4) {
            $score += 5;
        }

        return max(0, min(100, $score));
    }

    private static function estimateSafetyScore(array $parsed): int
    {
        $score = 100;
        $hours = $parsed['serve_to_distribute_hours'] ?? 0;
        
        if ($hours > 4) {
            $score -= 50;
        } elseif ($hours > 3) {
            $score -= 20;
        } elseif ($hours > 2) {
            $score -= 5;
        }

        return max(0, min(100, $score));
    }

    private static function clampFloat(mixed $value, float $min, float $max): float
    {
        $num = is_numeric($value) ? (float) $value : (float) preg_replace('/[^\d.]/', '', (string) $value);

        return max($min, min($max, $num));
    }

    private static function guessCategory(string $name): string
    {
        $n = strtolower($name);
        if (preg_match('/ayam|ikan|telur|daging|tempe|tahu|udang|protein/', $n)) {
            return 'protein';
        }
        if (preg_match('/nasi|mie|kentang|ubi|roti|karbohidrat/', $n)) {
            return 'karbohidrat';
        }
        if (preg_match('/sayur|kangkung|bayam|brokoli|wortel/', $n)) {
            return 'sayur';
        }
        if (preg_match('/jeruk|pisang|buah|apel/', $n)) {
            return 'sayur';
        }

        return 'lainnya';
    }
}
