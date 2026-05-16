<?php

namespace Tests\Unit;

use App\Exceptions\GeminiParseException;
use App\Exceptions\VisionAnalysisException;
use App\Services\GeminiResponseParser;
use Tests\TestCase;

class GeminiResponseParserTest extends TestCase
{
    public function test_parses_nutrition_json(): void
    {
        $raw = '{"nutrition_analysis":{"calories_per_portion":620,"protein_per_portion_gram":14,"carbs_per_portion_gram":80,"fat_per_portion_gram":12,"fiber_per_portion_gram":4,"has_vegetables":true,"has_fruit":false,"ingredient_variety_count":4,"meets_minimum_standard":true,"nutrition_notes":"Cukup"},"food_safety_analysis":{"cook_to_serve_hours":2,"serve_to_distribute_hours":1,"total_exposure_hours":3,"temperature_risk_level":"LOW","safety_notes":"Aman"}}';

        $parsed = GeminiResponseParser::parseNutritionAnalysis($raw);

        $this->assertEquals(620, $parsed['calories_per_portion']);
        $this->assertEquals(14, $parsed['protein_per_portion_gram']);
        $this->assertTrue($parsed['has_vegetables']);
    }

    public function test_parses_assessment_app_js_format(): void
    {
        $raw = '{"skor_total":74,"skor_gizi":78,"skor_keamanan":61,"skor_sanitasi":85,"status":"PERHATIAN","violations":[{"severity":"HIGH","pesan":"Protein kurang","dimension":"gizi"}],"feedback_segera":[],"feedback_besok":["Tambah protein"],"catatan_rutin":[],"ringkasan_gizi":"Menu cukup variatif"}';

        $parsed = GeminiResponseParser::parseAssessmentResponse($raw);

        $this->assertEquals(74, $parsed['final_score']);
        $this->assertEquals('PERHATIAN', $parsed['status']);
        $this->assertEquals('Protein kurang', $parsed['violations'][0]['description']);
    }

    public function test_parses_vision_nama_menu_format(): void
    {
        $raw = '{"nama_menu":"Nasi Ayam","bahan":[{"nama":"Ayam","gram":120},{"nama":"Nasi","gram":200}],"catatan":"Terlihat segar"}';

        $parsed = GeminiResponseParser::parseVisionResponse($raw);

        $this->assertEquals('Nasi Ayam', $parsed['menu_name']);
        $this->assertCount(2, $parsed['detected_ingredients']);
    }

    public function test_vision_error_throws(): void
    {
        $this->expectException(VisionAnalysisException::class);
        GeminiResponseParser::parseVisionResponse('{"error":"Foto tidak dapat diidentifikasi sebagai makanan"}');
    }

    public function test_invalid_json_throws_gemini_parse_exception(): void
    {
        $this->expectException(GeminiParseException::class);
        GeminiResponseParser::parseAssessmentResponse('bukan json');
    }
}
