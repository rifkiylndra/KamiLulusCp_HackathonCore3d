<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    /**
     * Jalur 1: Gemini Vision - Ekstrak Menu & Bahan dari Foto
     */
    public function doVision(Request $request)
    {
        $request->validate([
            'image' => 'required', // Menerima string Base64 dari frontend
            'mime_type' => 'string'
        ]);

        $apiKey = env('GEMINI_API_KEY');
        $photoB64 = $request->input('image');
        $photoMime = $request->input('mime_type', 'image/jpeg');

        $prompt = "Kamu adalah asisten gizi MBG Indonesia. Lihat foto makanan ini dan jawab hanya dengan JSON valid. Jangan sertakan penjelasan, markdown, atau teks lain. Format yang diharapkan:
        {\"nama_menu\":\"...\",\"bahan\":[{\"nama\":\"...\",\"gram\":...}],\"catatan\":\"...\"}";

        try {
            // Tembak API Gemini 2.5 Flash via Laravel HTTP Client [cite: 95]
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inline_data' => [
                                    'mime_type' => $photoMime,
                                    'data' => $photoB64
                                ]
                            ],
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1, // [cite: 101]
                    'maxOutputTokens' => 2048, // [cite: 102]
                    'responseMimeType' => 'application/json' // [cite: 100]
                ]
            ]);

            if ($response->failed()) {
                return response()->json(['status' => 'error', 'message' => 'Gagal menghubungi Gemini API'], 500);
            }

            $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $aiData = json_decode($rawText, true);

            return response()->json([
                'status' => 'success',
                'data' => $aiData
            ]);

        } catch (\Exception $e) {
            Log::error('Gemini Vision Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Jalur 2: Gemini Text - Hitung Skor Gizi, Keamanan & Sanitasi (Submit)
     */
    public function doSubmitAnalysis(Request $request)
    {
        // Validasi input sesuai data form dari app.js
        $request->validate([
            'nama_menu' => 'required|string',
            'bahan' => 'required|string',
            'porsi' => 'nullable',
            'sasaran' => 'nullable|string',
            'tMasak' => 'required',
            'tSajian' => 'required',
            'tDistrib' => 'required',
            'jedaJam' => 'required',
            'jedaTotal' => 'required',
            'simpan' => 'required|string',
            'kondisi' => 'required|string',
            'sumber' => 'required|string',
            'checked_count' => 'required|integer',
            'total_checks' => 'required|integer',
            'sanPct' => 'required|integer',
        ]);

        $apiKey = env('GEMINI_API_KEY');

        // Master Prompt dari app.js Anda
        $prompt = "Kamu adalah sistem AI NutriGuard untuk program Makan Bergizi Gratis (MBG) Indonesia. Analisis kualitas gizi dan keamanan pangan laporan dapur ini.

DATA:
- Menu: " . $request->nama_menu . "
- Bahan per porsi: " . $request->bahan . "
- Porsi: " . $request->porsi . " | Sasaran: " . $request->sasaran . "
- Waktu masak: " . $request->tMasak . " | Sajian: " . $request->tSajian . " | Distribusi: " . $request->tDistrib . "
- Jeda total masak→distribusi: " . $request->jedaJam . " jam (" . $request->jedaTotal . " menit) [cite: 18]
- Penyimpanan: " . $request->simpan . " | Kondisi bahan: " . $request->kondisi . " | Sumber: " . $request->sumber . "
- Checklist sanitasi: " . $request->checked_count . "/" . $request->total_checks . " (" . $request->sanPct . "%)

ATURAN WAJIB:
- Jika jeda masak→distribusi > 4 jam (240 menit): status = BAHAYA, skor_keamanan ≤ 30 [cite: 18, 41]
- Skor total = (skor_gizi×0.4) + (skor_keamanan×0.4) + (skor_sanitasi×0.2) [cite: 40]
- skor_sanitasi = " . $request->sanPct . "
- Status: AMAN jika skor≥80, PERHATIAN jika 60-79, BAHAYA jika <60 atau jeda>4jam [cite: 13, 41]
- Kondisi bahan rusak/mencurigakan → skor_keamanan dikurangi signifikan

Berikan analisis realistis sesuai standar gizi Indonesia (AKG). Jawab hanya dengan JSON valid, tanpa markdown, tanpa teks tambahan, tanpa penjelasan. Pastikan semua kurung dan tanda kutip ditutup:
{\"skor_total\":<0-100>,\"skor_gizi\":<0-100>,\"skor_keamanan\":<0-100>,\"skor_sanitasi\":" . $request->sanPct . ",\"status\":\"<AMAN|PERHATIAN|BAHAYA>\",\"violations\":[{\"severity\":\"<HIGH|MEDIUM|LOW>\",\"pesan\":\"...\"}],\"feedback_segera\":[\"...\"],\"feedback_besok\":[\"...\"],\"catatan_rutin\":[\"...\"],\"ringkasan_gizi\":\"...\"}";

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.1, // [cite: 101]
                    'maxOutputTokens' => 2048, // [cite: 102]
                    'responseMimeType' => 'application/json' // [cite: 100]
                ]
            ]);

            if ($response->failed()) {
                return response()->json(['status' => 'error', 'message' => 'Gagal menghubungi Gemini API'], 500);
            }

            $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $aiData = json_decode($rawText, true);

            return response()->json([
                'status' => 'success',
                'data' => $aiData
            ]);

        } catch (\Exception $e) {
            Log::error('Gemini Submit Analysis Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
