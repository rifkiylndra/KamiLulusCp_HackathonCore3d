<?php

namespace App\Services;

use App\Exceptions\GeminiParseException;
use App\Models\MealSubmission;
use App\Support\GeminiJsonParser;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    private string $apiKey;

    private string $model;

    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.api_key', '');
        $this->model = (string) config('services.gemini.model', 'gemini-2.5-flash');
    }

    public function isConfigured(): bool
    {
        return str_starts_with($this->apiKey, 'AIza') && strlen($this->apiKey) > 30;
    }

    /**
     * Analisis foto menu (Vision) — setara doVision() di app.js.
     */
    public function analyzeImageFromPath(string $imagePath, string $mimeType = 'image/jpeg'): array
    {
        if (! file_exists($imagePath)) {
            throw new \InvalidArgumentException("File gambar tidak ditemukan: {$imagePath}");
        }

        $base64 = base64_encode((string) file_get_contents($imagePath));

        return $this->analyzeImageBase64($base64, $mimeType);
    }

    public function analyzeImageBase64(string $base64, string $mimeType = 'image/jpeg'): array
    {
        $prompt = NutriGuardPrompts::visionPrompt();
        $raw = $this->generateContent([
            ['inline_data' => ['mime_type' => $mimeType, 'data' => $base64]],
            ['text' => $prompt],
        ]);

        return GeminiResponseParser::parseVisionResponse($raw);
    }

    /**
     * Analisis gizi terstruktur (NutriGuard PROMPT 1-D).
     */
    public function analyzeNutrition(MealSubmission $submission): array
    {
        $prompt = NutriGuardPrompts::nutritionAnalysisPrompt($submission);
        $raw = $this->generateContent([['text' => $prompt]]);

        return GeminiResponseParser::parseNutritionAnalysis($raw);
    }

    /**
     * Penilaian lengkap SPPG — setara doSubmit() di app.js.
     */
    public function analyzeSubmissionAssessment(MealSubmission $submission): array
    {
        $sanPct = NutriGuardPrompts::sanitationPercentFromCheck($submission);
        $prompt = NutriGuardPrompts::fullAssessmentPrompt($submission, $sanPct);
        $raw = $this->generateContent([['text' => $prompt]]);

        return GeminiResponseParser::parseAssessmentResponse($raw);
    }

    /**
     * @param  array<int, array<string, mixed>>  $parts
     */
    private function generateContent(array $parts): string
    {
        if (! $this->isConfigured()) {
            throw new GeminiParseException('GEMINI_API_KEY belum dikonfigurasi atau tidak valid.');
        }

        $url = "{$this->baseUrl}/{$this->model}:generateContent";
        $body = [
            'contents' => [
                ['parts' => $parts],
            ],
            'generationConfig' => [
                'temperature' => 0.1,
                'maxOutputTokens' => 2048,
                'responseMimeType' => 'application/json',
            ],
        ];

        $started = microtime(true);
        $lastError = null;

        for ($attempt = 0; $attempt < 3; $attempt++) {
            try {
                $response = Http::timeout(30)
                    ->retry(0)
                    ->post($url.'?key='.urlencode($this->apiKey), $body);

                if ($response->failed()) {
                    $lastError = "HTTP {$response->status()}: {$response->body()}";
                    Log::channel('gemini')->warning('Gemini API error', [
                        'attempt' => $attempt + 1,
                        'status' => $response->status(),
                    ]);
                } else {
                    $data = $response->json();
                    if (isset($data['error']['message'])) {
                        throw new GeminiParseException($data['error']['message']);
                    }

                    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    $elapsed = (int) round((microtime(true) - $started) * 1000);

                    Log::channel('gemini')->info('Gemini call success', [
                        'model' => $this->model,
                        'parse_success' => true,
                        'processing_time_ms' => $elapsed,
                    ]);

                    return $text;
                }
            } catch (ConnectionException $e) {
                $lastError = $e->getMessage();
            }

            if ($attempt < 2) {
                usleep((int) (pow(2, $attempt) * 1_000_000));
            }
        }

        throw new GeminiParseException('Gemini gagal setelah 3 percobaan: '.($lastError ?? 'tidak diketahui'));
    }

    /**
     * Parse teks mentah ke array (untuk testing).
     */
    public static function decodeJson(string $text): array
    {
        return GeminiJsonParser::parse($text);
    }
}
