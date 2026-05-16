<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisionController extends Controller
{
    /**
     * Analisis foto menu — setara doVision() di app.js (tanpa simpan submission).
     */
    public function analyzePhoto(Request $request, GeminiService $gemini): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        if (! $gemini->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'GEMINI_API_KEY belum dikonfigurasi di server (.env).',
            ], 503);
        }

        try {
            $file = $request->file('image');
            $mime = $file->getMimeType() ?: 'image/jpeg';
            $base64 = base64_encode((string) file_get_contents($file->getRealPath()));
            $result = $gemini->analyzeImageBase64($base64, $mime);

            $ingredients = collect($result['detected_ingredients'] ?? [])->map(fn ($item) => [
                'nama' => $item['name'] ?? '',
                'gram' => $item['estimated_weight_gram'] ?? 0,
                'category' => $item['category'] ?? 'lainnya',
                'confidence' => $item['confidence'] ?? 'medium',
            ])->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'nama_menu' => $result['menu_name'] ?? '',
                    'bahan' => $ingredients,
                    'catatan' => $result['visual_notes'] ?? '',
                    'visual_condition' => $result['visual_condition'] ?? 'baik',
                ],
                'message' => 'Foto berhasil dianalisis oleh Gemini Vision.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal analisis foto: '.$e->getMessage(),
            ], 422);
        }
    }
}
