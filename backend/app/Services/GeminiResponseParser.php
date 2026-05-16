<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class GeminiResponseParser
{
    /**
     * Parse nutrition analysis response
     */
    public static function parseNutritionResponse(string $response): array
    {
        try {
            $json = self::extractJson($response);
            $data = json_decode($json, true);

            if (!$data) {
                return self::getDefaultNutritionResponse();
            }

            return [
                'nutrition_score' => $data['nutrition_analysis']['overall_nutrition_score'] ?? 50,
                'safety_score' => $data['safety_analysis']['overall_safety_score'] ?? 50,
                'sanitation_score' => $data['sanitation_analysis']['overall_sanitation_score'] ?? 50,
                'nutrition_notes' => $data['nutrition_analysis']['nutrition_notes'] ?? '',
                'safety_notes' => $data['safety_analysis']['safety_notes'] ?? '',
                'sanitation_notes' => $data['sanitation_analysis']['sanitation_notes'] ?? '',
                'recommendations' => $data['recommendations'] ?? [],
                'risk_level' => $data['risk_level'] ?? 'MEDIUM',
                'raw_response' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to parse nutrition response', [
                'error' => $e->getMessage(),
                'response' => substr($response, 0, 500),
            ]);

            return self::getDefaultNutritionResponse();
        }
    }

    /**
     * Parse image analysis response
     */
    public static function parseImageResponse(string $response): array
    {
        try {
            $json = self::extractJson($response);
            $data = json_decode($json, true);

            if (!$data) {
                return self::getDefaultImageResponse();
            }

            return [
                'visual_quality_score' => $data['visual_quality']['overall_quality'] ?? 50,
                'food_variety_score' => $data['food_variety']['variety_score'] ?? 50,
                'safety_score' => $data['safety_indicators']['safety_score'] ?? 50,
                'has_protein' => $data['food_variety']['has_protein'] ?? false,
                'has_carbs' => $data['food_variety']['has_carbs'] ?? false,
                'has_vegetables' => $data['food_variety']['has_vegetables'] ?? false,
                'has_fruits' => $data['food_variety']['has_fruits'] ?? false,
                'contamination_signs' => $data['safety_indicators']['contamination_signs'] ?? 'none',
                'spoilage_signs' => $data['safety_indicators']['spoilage_signs'] ?? 'none',
                'observations' => $data['observations'] ?? '',
                'recommendations' => $data['recommendations'] ?? [],
                'risk_level' => $data['risk_level'] ?? 'MEDIUM',
                'raw_response' => $response,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to parse image response', [
                'error' => $e->getMessage(),
                'response' => substr($response, 0, 500),
            ]);

            return self::getDefaultImageResponse();
        }
    }

    /**
     * Extract JSON from response (handles markdown code blocks)
     */
    private static function extractJson(string $response): string
    {
        // Try to extract JSON from markdown code block
        if (preg_match('/```json\s*(.*?)\s*```/s', $response, $matches)) {
            return $matches[1];
        }

        // Try to extract JSON from plain code block
        if (preg_match('/```\s*(.*?)\s*```/s', $response, $matches)) {
            return $matches[1];
        }

        // Try to find JSON object directly
        if (preg_match('/\{.*\}/s', $response, $matches)) {
            return $matches[0];
        }

        // If no JSON found, return the response as is
        return $response;
    }

    /**
     * Get default nutrition response
     */
    private static function getDefaultNutritionResponse(): array
    {
        return [
            'nutrition_score' => 50,
            'safety_score' => 50,
            'sanitation_score' => 50,
            'nutrition_notes' => 'Analisis tidak tersedia',
            'safety_notes' => 'Analisis tidak tersedia',
            'sanitation_notes' => 'Analisis tidak tersedia',
            'recommendations' => [],
            'risk_level' => 'MEDIUM',
            'raw_response' => '',
        ];
    }

    /**
     * Get default image response
     */
    private static function getDefaultImageResponse(): array
    {
        return [
            'visual_quality_score' => 50,
            'food_variety_score' => 50,
            'safety_score' => 50,
            'has_protein' => false,
            'has_carbs' => false,
            'has_vegetables' => false,
            'has_fruits' => false,
            'contamination_signs' => 'none',
            'spoilage_signs' => 'none',
            'observations' => 'Analisis tidak tersedia',
            'recommendations' => [],
            'risk_level' => 'MEDIUM',
            'raw_response' => '',
        ];
    }
}
