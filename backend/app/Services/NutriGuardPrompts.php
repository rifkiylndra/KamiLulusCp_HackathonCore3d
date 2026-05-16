<?php

namespace App\Services;

use App\Models\MealSubmission;

/**
 * Prompt NutriGuard MBG — diselaraskan dengan app.js hackathon & dokumen vibe-coding v2.
 */
class NutriGuardPrompts
{
    /** Checklist sanitasi (sama seperti CHECKS di app.js). */
    public const SANITATION_CHECKS = [
        'Semua petugas pakai sarung tangan',
        'Semua petugas pakai masker',
        'Semua petugas pakai hairnet',
        'Dapur dibersihkan sebelum memasak',
        'Peralatan dicuci dan dikeringkan',
        'Tidak ada petugas sakit/batuk yang memasak',
    ];

    public static function visionPrompt(): string
    {
        return <<<'PROMPT'
Kamu adalah asisten gizi MBG Indonesia. Lihat foto makanan ini dan jawab hanya dengan JSON valid.
Jangan sertakan penjelasan, markdown, atau teks lain.

Format yang diharapkan:
{"nama_menu":"...","bahan":[{"nama":"...","gram":0}],"catatan":"..."}

Atau format alternatif NutriGuard:
{"detected_ingredients":[{"name":"...","estimated_weight_gram":0,"category":"protein|karbohidrat|sayur|lemak|lainnya","confidence":"high|medium|low"}],"visual_condition":"baik|mencurigakan","estimated_portions":1,"visual_notes":"...","error":null}

Fokus pada makanan Indonesia (nasi, tempe, tahu, lodeh, dll). Estimasi gram realistis per porsi.
Jika foto blur/bukan makanan: set "error": "Foto tidak dapat diidentifikasi sebagai makanan".
PROMPT;
    }

    public static function nutritionAnalysisPrompt(MealSubmission $submission): string
    {
        $submission->loadMissing(['menuItems', 'sanitationCheck', 'sppg']);

        $ingredients = $submission->menuItems
            ->map(fn ($item) => "- {$item->ingredient_name}: {$item->quantity_gram}g ({$item->category})")
            ->join("\n");

        $san = $submission->sanitationCheck;
        $apd = $san?->apd_used ? 'Ya' : 'Tidak';
        $kitchen = $san?->kitchen_cleaned ? 'Ya' : 'Tidak';
        $storage = $san?->storage_type ?? 'tidak disebutkan';
        $condition = $san?->ingredient_condition ?? 'tidak disebutkan';
        $supplier = $san?->supplier_source ?? 'tidak disebutkan';

        $cook = $submission->cook_start_at?->format('H:i') ?? '-';
        $serve = $submission->serve_planned_at?->format('H:i') ?? '-';
        $dist = $submission->distribute_at?->format('H:i') ?? '-';

        return <<<PROMPT
Kamu adalah ahli gizi dan keamanan pangan Indonesia. Analisis menu makan siang
untuk program MBG (Makan Bergizi Gratis) pemerintah Indonesia.

DATA MENU:
- Nama menu: {$submission->menu_name}
- Jumlah porsi: {$submission->portion_count} porsi
- Bahan-bahan (per total masakan):
{$ingredients}
- Waktu mulai masak: {$cook}
- Waktu rencana sajian: {$serve}
- Waktu distribusi ke siswa: {$dist}

PARAMETER SANITASI:
- APD dipakai: {$apd}
- Dapur dibersihkan sebelum masak: {$kitchen}
- Penyimpanan bahan: {$storage}
- Kondisi bahan saat diterima: {$condition}
- Sumber bahan: {$supplier}

Hitung nilai gizi PER PORSI berdasarkan berat gram bahan. Gunakan standar AKG Kemenkes 2019.
Estimasi konservatif untuk bahan tidak dikenal.

Balas HANYA dengan JSON berikut, tanpa teks lain:
{
  "nutrition_analysis": {
    "calories_per_portion": 0,
    "protein_per_portion_gram": 0,
    "carbs_per_portion_gram": 0,
    "fat_per_portion_gram": 0,
    "fiber_per_portion_gram": 0,
    "has_vegetables": false,
    "has_fruit": false,
    "ingredient_variety_count": 0,
    "meets_minimum_standard": false,
    "nutrition_notes": "string max 80 kata Bahasa Indonesia"
  },
  "food_safety_analysis": {
    "cook_to_serve_hours": 0,
    "serve_to_distribute_hours": 0,
    "total_exposure_hours": 0,
    "temperature_risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "safety_notes": "string max 80 kata Bahasa Indonesia"
  }
}
PROMPT;
    }

    public static function fullAssessmentPrompt(MealSubmission $submission, int $sanitationPercent): string
    {
        $submission->loadMissing(['menuItems', 'sanitationCheck', 'sppg']);

        $bahan = $submission->menuItems
            ->map(fn ($item) => "{$item->ingredient_name} ".($item->quantity_gram ?? '?').'g')
            ->join(', ') ?: 'tidak disebutkan';

        $sppg = $submission->sppg?->name ?? 'SPPG tidak disebutkan';
        $petugas = $submission->submitted_by ?? 'Tidak disebutkan';
        $tM = $submission->cook_start_at?->format('H:i') ?? '-';
        $tS = $submission->serve_planned_at?->format('H:i') ?? '-';
        $tD = $submission->distribute_at?->format('H:i') ?? '-';

        $jedaMenit = self::jedaMenitMasakDistribusi($submission);
        $jedaJam = number_format($jedaMenit / 60, 1, '.', '');

        $san = $submission->sanitationCheck;
        $simpan = $san?->storage_type ?? 'tidak disebutkan';
        $kondisi = $san?->ingredient_condition ?? 'tidak disebutkan';
        $sumber = $san?->supplier_source ?? 'tidak disebutkan';
        $checklistDone = (int) round(($sanitationPercent / 100) * count(self::SANITATION_CHECKS));
        $checkTotal = count(self::SANITATION_CHECKS);

        return <<<PROMPT
Kamu adalah sistem AI NutriGuard untuk program Makan Bergizi Gratis (MBG) Indonesia.
Analisis kualitas gizi dan keamanan pangan laporan dapur ini.

DATA:
- SPPG: {$sppg} | Petugas: {$petugas}
- Menu: {$submission->menu_name}
- Bahan per porsi: {$bahan}
- Porsi: {$submission->portion_count} | Sasaran: umum
- Waktu masak: {$tM} | Sajian: {$tS} | Distribusi: {$tD}
- Jeda total masak→distribusi: {$jedaJam} jam ({$jedaMenit} menit)
- Penyimpanan: {$simpan} | Kondisi bahan: {$kondisi} | Sumber: {$sumber}
- Checklist sanitasi: {$checklistDone}/{$checkTotal} ({$sanitationPercent}%)

ATURAN WAJIB:
- Jika jeda masak→distribusi > 4 jam (240 menit): status = BAHAYA, skor_keamanan ≤ 30
- Skor total = (skor_gizi×0.4) + (skor_keamanan×0.4) + (skor_sanitasi×0.2)
- skor_sanitasi = {$sanitationPercent}
- Status: AMAN jika skor≥75, PERHATIAN jika 50-74, BAHAYA jika <50 atau jeda>4jam
- Kondisi bahan rusak/mencurigakan → skor_keamanan dikurangi signifikan

Berikan analisis realistis sesuai standar gizi Indonesia (AKG).
Jawab hanya dengan JSON valid, tanpa markdown, tanpa teks tambahan:
{"skor_total":0,"skor_gizi":0,"skor_keamanan":0,"skor_sanitasi":{$sanitationPercent},"status":"AMAN|PERHATIAN|BAHAYA","violations":[{"severity":"HIGH|MEDIUM|LOW|CRITICAL","pesan":"...","dimension":"gizi|keamanan|sanitasi"}],"feedback_segera":["..."],"feedback_besok":["..."],"catatan_rutin":["..."],"ringkasan_gizi":"..."}
PROMPT;
    }

    public static function sanitationPercentFromCheck(MealSubmission $submission): int
    {
        $san = $submission->sanitationCheck;
        if (! $san) {
            return 50;
        }

        $checks = [
            (bool) $san->apd_used,
            (bool) $san->kitchen_cleaned,
            (bool) $san->kitchen_cleaned,
            (bool) $san->kitchen_cleaned,
            (bool) $san->kitchen_cleaned,
            $san->ingredient_condition === 'baik',
        ];

        $done = collect($checks)->filter()->count();

        return (int) round(($done / count(self::SANITATION_CHECKS)) * 100);
    }

    public static function jedaMenitMasakDistribusi(MealSubmission $submission): int
    {
        if (! $submission->cook_start_at) {
            return 0;
        }

        $end = $submission->distribute_at ?? $submission->serve_planned_at;
        if (! $end) {
            return 0;
        }

        $startMin = $submission->cook_start_at->hour * 60 + $submission->cook_start_at->minute;
        $endMin = $end->hour * 60 + $end->minute;
        $diff = $endMin - $startMin;

        if ($diff < 0) {
            $diff += 1440;
        }

        return $diff;
    }
}
