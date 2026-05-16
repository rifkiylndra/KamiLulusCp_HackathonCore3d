<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;
    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    private string $model = 'gemini-2.5-flash';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * Analyze nutrition data using Gemini
     */
    public function analyzeNutrition(array $menuItems, array $sanitationData): string
    {
        $prompt = $this->buildNutritionPrompt($menuItems, $sanitationData);

        return $this->callGemini($prompt);
    }

    /**
     * Analyze meal image using Gemini
     */
    public function analyzeImage(string $imagePath): string
    {
        try {
            $imageData = $this->encodeImage($imagePath);
            $prompt = $this->buildImagePrompt();

            return $this->callGeminiWithImage($imageData, $prompt);
        } catch (\Exception $e) {
            Log::error('Gemini image analysis failed', [
                'image_path' => $imagePath,
                'error' => $e->getMessage(),
            ]);

            return json_encode([
                'error' => 'Image analysis failed',
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Call Gemini API with text
     */
    private function callGemini(string $prompt): string
    {
        try {
            Log::channel('gemini')->info('Calling Gemini API for nutrition analysis', [
                'model' => $this->model,
                'prompt_length' => strlen($prompt),
            ]);

            $response = Http::timeout(30)
                ->post("{$this->baseUrl}/{$this->model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt,
                                ],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 2048,
                    ],
                ], [
                    'key' => $this->apiKey,
                ]);

            if ($response->failed()) {
                Log::channel('gemini')->error('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return json_encode([
                    'error' => 'Gemini API error',
                    'status' => $response->status(),
                ]);
            }

            $data = $response->json();

            Log::channel('gemini')->info('Gemini API response received', [
                'status' => $response->status(),
                'has_candidates' => isset($data['candidates']),
            ]);

            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                $result = $data['candidates'][0]['content']['parts'][0]['text'];
                Log::channel('gemini')->info('Gemini nutrition analysis completed', [
                    'response_length' => strlen($result),
                ]);
                return $result;
            }

            return json_encode([
                'error' => 'Invalid response format',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::channel('gemini')->error('Gemini API exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return json_encode([
                'error' => 'Exception occurred',
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Call Gemini API with image
     */
    private function callGeminiWithImage(string $imageData, string $prompt): string
    {
        try {
            Log::channel('gemini')->info('Calling Gemini API for image analysis', [
                'model' => $this->model,
                'image_data_length' => strlen($imageData),
            ]);

            $response = Http::timeout(30)
                ->post("{$this->baseUrl}/{$this->model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'inline_data' => [
                                        'mime_type' => 'image/jpeg',
                                        'data' => $imageData,
                                    ],
                                ],
                                [
                                    'text' => $prompt,
                                ],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topK' => 40,
                        'topP' => 0.95,
                        'maxOutputTokens' => 2048,
                    ],
                ], [
                    'key' => $this->apiKey,
                ]);

            if ($response->failed()) {
                Log::channel('gemini')->error('Gemini image API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return json_encode([
                    'error' => 'Gemini API error',
                    'status' => $response->status(),
                ]);
            }

            $data = $response->json();

            Log::channel('gemini')->info('Gemini image API response received', [
                'status' => $response->status(),
                'has_candidates' => isset($data['candidates']),
            ]);

            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                $result = $data['candidates'][0]['content']['parts'][0]['text'];
                Log::channel('gemini')->info('Gemini image analysis completed', [
                    'response_length' => strlen($result),
                ]);
                return $result;
            }

            return json_encode([
                'error' => 'Invalid response format',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            Log::channel('gemini')->error('Gemini image API exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return json_encode([
                'error' => 'Exception occurred',
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Build nutrition analysis prompt
     */
    private function buildNutritionPrompt(array $menuItems, array $sanitationData): string
    {
        $menuList = collect($menuItems)->map(fn($item) => "- {$item['ingredient_name']} ({$item['quantity_gram']}g, kategori: {$item['category']})")->join("\n");

        return <<<PROMPT
Anda adalah ahli gizi dan keamanan pangan. Analisis menu makanan berikut dan berikan penilaian dalam format JSON:

MENU ITEMS:
$menuList

SANITATION DATA:
- APD Used: {$sanitationData['apd_used']}
- Kitchen Cleaned: {$sanitationData['kitchen_cleaned']}
- Storage Type: {$sanitationData['storage_type']}
- Ingredient Condition: {$sanitationData['ingredient_condition']}
- Supplier Source: {$sanitationData['supplier_source']}

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "nutrition_analysis": {
    "protein_adequacy": "score 0-100",
    "carbs_adequacy": "score 0-100",
    "vegetables_adequacy": "score 0-100",
    "fruits_adequacy": "score 0-100",
    "overall_nutrition_score": "score 0-100",
    "nutrition_notes": "catatan detail"
  },
  "safety_analysis": {
    "food_handling_safety": "score 0-100",
    "storage_safety": "score 0-100",
    "overall_safety_score": "score 0-100",
    "safety_notes": "catatan detail"
  },
  "sanitation_analysis": {
    "hygiene_compliance": "score 0-100",
    "storage_compliance": "score 0-100",
    "supplier_compliance": "score 0-100",
    "overall_sanitation_score": "score 0-100",
    "sanitation_notes": "catatan detail"
  },
  "recommendations": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "risk_level": "LOW|MEDIUM|HIGH"
}

Hanya berikan JSON, tanpa penjelasan tambahan.
PROMPT;
    }

    /**
     * Build image analysis prompt
     */
    private function buildImagePrompt(): string
    {
        return <<<PROMPT
Anda adalah ahli gizi dan keamanan pangan. Analisis foto makanan ini dan berikan penilaian dalam format JSON:

Perhatikan:
1. Kebersihan dan presentasi makanan
2. Variasi dan kelengkapan menu
3. Tanda-tanda kerusakan atau kontaminasi
4. Kualitas visual makanan

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "visual_quality": {
    "cleanliness": "score 0-100",
    "presentation": "score 0-100",
    "freshness": "score 0-100",
    "overall_quality": "score 0-100"
  },
  "food_variety": {
    "has_protein": true/false,
    "has_carbs": true/false,
    "has_vegetables": true/false,
    "has_fruits": true/false,
    "variety_score": "score 0-100"
  },
  "safety_indicators": {
    "contamination_signs": "none|minor|moderate|severe",
    "spoilage_signs": "none|minor|moderate|severe",
    "safety_score": "score 0-100"
  },
  "observations": "observasi detail tentang makanan",
  "recommendations": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "risk_level": "LOW|MEDIUM|HIGH"
}

Hanya berikan JSON, tanpa penjelasan tambahan.
PROMPT;
    }

    /**
     * Encode image to base64
     */
    private function encodeImage(string $imagePath): string
    {
        if (!file_exists($imagePath)) {
            throw new \Exception("Image file not found: {$imagePath}");
        }

        $imageContent = file_get_contents($imagePath);
        return base64_encode($imageContent);
    }
}
