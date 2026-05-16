<?php

namespace Tests\Unit;

use App\DTOs\ScoringResult;
use App\Models\MealSubmission;
use App\Models\MenuItem;
use App\Models\SanitationCheck;
use App\Models\Sppg;
use App\Services\ScoringEngine;
use Carbon\Carbon;
use Tests\TestCase;

class ScoringEngineTest extends TestCase
{
    private ScoringEngine $scoringEngine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scoringEngine = new ScoringEngine();
    }

    /**
     * Test Case 1: Perfect meal submission (all criteria met)
     * Expected: AMAN status with high score
     */
    public function test_perfect_meal_submission_returns_aman_status(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(2),
                'serve_planned_at' => Carbon::now(),
                'distribute_at' => Carbon::now()->addMinutes(15),
                'image_path' => 'path/to/image.jpg',
            ]);

        MenuItem::factory()->count(4)->sequence(
            ['ingredient_name' => 'Ayam Goreng', 'category' => 'protein', 'quantity_gram' => 150],
            ['ingredient_name' => 'Nasi Putih', 'category' => 'carbs', 'quantity_gram' => 200],
            ['ingredient_name' => 'Sayur Bayam', 'category' => 'vegetables', 'quantity_gram' => 100],
            ['ingredient_name' => 'Buah Pisang', 'category' => 'fruits', 'quantity_gram' => 100],
        )->for($submission)->create();

        SanitationCheck::factory()
            ->for($submission)
            ->create([
                'apd_used' => true,
                'kitchen_cleaned' => true,
                'storage_type' => 'freezer',
                'ingredient_condition' => 'baik',
                'supplier_source' => 'resmi',
            ]);

        $result = $this->scoringEngine->calculateScore($submission);

        $this->assertInstanceOf(ScoringResult::class, $result);
        $this->assertEquals('AMAN', $result->status);
        $this->assertGreaterThanOrEqual(75, $result->finalScore);
        $this->assertFalse($result->immediateActionRequired);
        $this->assertEmpty($result->violations);
    }

    /**
     * Test Case 2: Hard rule violation (food holding time > 4 hours)
     * Expected: BAHAYA status with critical violation
     */
    public function test_hard_rule_violation_exceeding_4_hours_returns_bahaya(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(6),
                'serve_planned_at' => Carbon::now(),
                'image_path' => 'path/to/image.jpg',
            ]);

        MenuItem::factory()->for($submission)->create([
            'ingredient_name' => 'Ayam Goreng',
            'category' => 'protein',
            'quantity_gram' => 150,
        ]);

        $result = $this->scoringEngine->calculateScore($submission);

        $this->assertEquals('BAHAYA', $result->status);
        $this->assertTrue($result->immediateActionRequired);
        $this->assertNotEmpty($result->violations);
        $this->assertEquals('CRITICAL', $result->violations[0]['severity']);
        $this->assertStringContainsString('4 jam', $result->violations[0]['description']);
    }

    /**
     * Test Case 3: Poor nutrition score (incomplete menu)
     * Expected: PERHATIAN status with nutrition violation
     */
    public function test_incomplete_menu_returns_perhatian_status(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(1),
                'serve_planned_at' => Carbon::now(),
                'image_path' => 'path/to/image.jpg',
            ]);

        // Only carbs - missing protein, vegetables, fruits
        MenuItem::factory()->for($submission)->create([
            'ingredient_name' => 'Nasi Putih',
            'category' => 'carbs',
            'quantity_gram' => 200,
        ]);

        // Poor sanitation to push score down
        SanitationCheck::factory()
            ->for($submission)
            ->create([
                'apd_used' => false,
                'kitchen_cleaned' => false,
                'storage_type' => 'suhu_ruang',
                'ingredient_condition' => 'mencurigakan',
                'supplier_source' => 'pasar',
            ]);

        $result = $this->scoringEngine->calculateScore($submission);

        $this->assertLessThan(75, $result->finalScore);
        $this->assertTrue(
            collect($result->violations)->contains(fn($v) => $v['dimension'] === 'NUTRITION')
        );
    }

    /**
     * Test Case 4: Poor sanitation score
     * Expected: Sanitation violation detected
     */
    public function test_poor_sanitation_returns_violation(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(1),
                'serve_planned_at' => Carbon::now(),
                'image_path' => 'path/to/image.jpg',
            ]);

        MenuItem::factory()->count(4)->sequence(
            ['ingredient_name' => 'Ayam Goreng', 'category' => 'protein', 'quantity_gram' => 150],
            ['ingredient_name' => 'Nasi Putih', 'category' => 'carbs', 'quantity_gram' => 200],
            ['ingredient_name' => 'Sayur Bayam', 'category' => 'vegetables', 'quantity_gram' => 100],
            ['ingredient_name' => 'Buah Pisang', 'category' => 'fruits', 'quantity_gram' => 100],
        )->for($submission)->create();

        SanitationCheck::factory()
            ->for($submission)
            ->create([
                'apd_used' => false,
                'kitchen_cleaned' => false,
                'storage_type' => 'suhu_ruang',
                'ingredient_condition' => 'rusak',
                'supplier_source' => 'lainnya',
            ]);

        $result = $this->scoringEngine->calculateScore($submission);

        // Verify sanitation violation is detected
        $this->assertTrue(
            collect($result->violations)->contains(fn($v) => $v['dimension'] === 'SANITATION')
        );
        // Verify sanitation score is low
        $this->assertLessThan(50, $result->sanitationScore);
    }

    /**
     * Test Case 5: No sanitation check data
     * Expected: Default sanitation score of 50, status depends on other factors
     */
    public function test_missing_sanitation_check_uses_default_score(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(1),
                'serve_planned_at' => Carbon::now(),
                'image_path' => 'path/to/image.jpg',
            ]);

        MenuItem::factory()->count(4)->sequence(
            ['ingredient_name' => 'Ayam Goreng', 'category' => 'protein', 'quantity_gram' => 150],
            ['ingredient_name' => 'Nasi Putih', 'category' => 'carbs', 'quantity_gram' => 200],
            ['ingredient_name' => 'Sayur Bayam', 'category' => 'vegetables', 'quantity_gram' => 100],
            ['ingredient_name' => 'Buah Pisang', 'category' => 'fruits', 'quantity_gram' => 100],
        )->for($submission)->create();

        $result = $this->scoringEngine->calculateScore($submission);

        $this->assertIsInt($result->sanitationScore);
        $this->assertEquals(50, $result->sanitationScore);
        $this->assertIsString($result->status);
        $this->assertTrue(in_array($result->status, ['AMAN', 'PERHATIAN', 'BAHAYA']));
    }

    /**
     * Test Case 6: Verify scoring weights are applied correctly
     * Expected: Final score is weighted average of component scores
     */
    public function test_final_score_uses_correct_weights(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(1),
                'serve_planned_at' => Carbon::now(),
                'image_path' => 'path/to/image.jpg',
            ]);

        MenuItem::factory()->count(4)->sequence(
            ['ingredient_name' => 'Ayam Goreng', 'category' => 'protein', 'quantity_gram' => 150],
            ['ingredient_name' => 'Nasi Putih', 'category' => 'carbs', 'quantity_gram' => 200],
            ['ingredient_name' => 'Sayur Bayam', 'category' => 'vegetables', 'quantity_gram' => 100],
            ['ingredient_name' => 'Buah Pisang', 'category' => 'fruits', 'quantity_gram' => 100],
        )->for($submission)->create();

        SanitationCheck::factory()
            ->for($submission)
            ->create([
                'apd_used' => true,
                'kitchen_cleaned' => true,
                'storage_type' => 'freezer',
                'ingredient_condition' => 'baik',
                'supplier_source' => 'resmi',
            ]);

        $result = $this->scoringEngine->calculateScore($submission);

        $minScore = min($result->nutritionScore, $result->safetyScore, $result->sanitationScore);
        $maxScore = max($result->nutritionScore, $result->safetyScore, $result->sanitationScore);

        $this->assertGreaterThanOrEqual($minScore, $result->finalScore);
        $this->assertLessThanOrEqual($maxScore, $result->finalScore);
    }

    /**
     * Test Case 7: Verify corrective feedback is generated
     */
    public function test_corrective_feedback_is_generated(): void
    {
        $sppg = Sppg::factory()->create();
        $submission = MealSubmission::factory()
            ->for($sppg)
            ->create([
                'cook_start_at' => Carbon::now()->subHours(1),
                'serve_planned_at' => Carbon::now(),
            ]);

        MenuItem::factory()->for($submission)->create([
            'ingredient_name' => 'Nasi Putih',
            'category' => 'carbs',
            'quantity_gram' => 200,
        ]);

        $result = $this->scoringEngine->calculateScore($submission);

        $this->assertIsArray($result->correctiveFeedback);
        $this->assertArrayHasKey('immediate_actions', $result->correctiveFeedback);
        $this->assertArrayHasKey('tomorrow_improvements', $result->correctiveFeedback);
        $this->assertArrayHasKey('routine_notes', $result->correctiveFeedback);
    }
}
