<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MealSubmission;
use App\Models\MenuItem;
use App\Models\SanitationCheck;
use App\Models\Sppg;
use App\Services\ScoringEngine;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ScoringTestController extends Controller
{
    private ScoringEngine $scoringEngine;

    public function __construct(ScoringEngine $scoringEngine)
    {
        $this->scoringEngine = $scoringEngine;
    }

    /**
     * Test Case 1: Perfect Submission (AMAN)
     */
    public function testPerfectSubmission()
    {
        $sppg = Sppg::firstOrCreate(
            ['name' => 'Test School Perfect'],
            [
                'location' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'contact_person' => 'Kepala Sekolah',
                'phone' => '021-1234567',
            ]
        );

        $submission = MealSubmission::create([
            'sppg_id' => $sppg->id,
            'submitted_by' => 'Petugas Test',
            'menu_name' => 'Menu Sehat Lengkap',
            'portion_count' => 50,
            'cook_start_at' => Carbon::now()->subHours(2),
            'serve_planned_at' => Carbon::now(),
            'distribute_at' => Carbon::now()->addMinutes(15),
            'image_path' => 'test/perfect_meal.jpg',
            'status' => 'processing',
        ]);

        // Add complete menu items
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Ayam Goreng',
            'quantity_gram' => 150,
            'category' => 'protein',
        ]);
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Nasi Putih',
            'quantity_gram' => 200,
            'category' => 'carbs',
        ]);
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Sayur Bayam',
            'quantity_gram' => 100,
            'category' => 'vegetables',
        ]);
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Buah Pisang',
            'quantity_gram' => 100,
            'category' => 'fruits',
        ]);

        // Add perfect sanitation check
        SanitationCheck::create([
            'meal_submission_id' => $submission->id,
            'apd_used' => true,
            'kitchen_cleaned' => true,
            'storage_type' => 'freezer',
            'ingredient_condition' => 'baik',
            'supplier_source' => 'resmi',
        ]);

        $result = $this->scoringEngine->calculateScore($submission);

        return response()->json([
            'test_case' => 'Perfect Submission (AMAN)',
            'submission_id' => $submission->id,
            'result' => $result->toArray(),
        ]);
    }

    /**
     * Test Case 2: Hard Rule Violation (BAHAYA)
     */
    public function testHardRuleViolation()
    {
        $sppg = Sppg::firstOrCreate(
            ['name' => 'Test School Hard Rule'],
            [
                'location' => 'Bandung',
                'province' => 'Jawa Barat',
                'contact_person' => 'Kepala Sekolah',
                'phone' => '022-1234567',
            ]
        );

        $submission = MealSubmission::create([
            'sppg_id' => $sppg->id,
            'submitted_by' => 'Petugas Test',
            'menu_name' => 'Menu Terlalu Lama Disimpan',
            'portion_count' => 50,
            'cook_start_at' => Carbon::now()->subHours(6),
            'serve_planned_at' => Carbon::now(),
            'distribute_at' => Carbon::now()->addMinutes(15),
            'image_path' => 'test/hard_rule_violation.jpg',
            'status' => 'processing',
        ]);

        // Add menu items
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Ayam Goreng',
            'quantity_gram' => 150,
            'category' => 'protein',
        ]);

        // Add sanitation check
        SanitationCheck::create([
            'meal_submission_id' => $submission->id,
            'apd_used' => true,
            'kitchen_cleaned' => true,
            'storage_type' => 'freezer',
            'ingredient_condition' => 'baik',
            'supplier_source' => 'resmi',
        ]);

        $result = $this->scoringEngine->calculateScore($submission);

        return response()->json([
            'test_case' => 'Hard Rule Violation (BAHAYA)',
            'submission_id' => $submission->id,
            'result' => $result->toArray(),
        ]);
    }

    /**
     * Test Case 3: Poor Nutrition (PERHATIAN)
     */
    public function testPoorNutrition()
    {
        $sppg = Sppg::firstOrCreate(
            ['name' => 'Test School Poor Nutrition'],
            [
                'location' => 'Surabaya',
                'province' => 'Jawa Timur',
                'contact_person' => 'Kepala Sekolah',
                'phone' => '031-1234567',
            ]
        );

        $submission = MealSubmission::create([
            'sppg_id' => $sppg->id,
            'submitted_by' => 'Petugas Test',
            'menu_name' => 'Menu Tidak Lengkap',
            'portion_count' => 50,
            'cook_start_at' => Carbon::now()->subHours(1),
            'serve_planned_at' => Carbon::now(),
            'distribute_at' => Carbon::now()->addMinutes(15),
            'image_path' => 'test/poor_nutrition.jpg',
            'status' => 'processing',
        ]);

        // Add only carbs (missing protein, vegetables, fruits)
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Nasi Putih',
            'quantity_gram' => 200,
            'category' => 'carbs',
        ]);

        // Add sanitation check
        SanitationCheck::create([
            'meal_submission_id' => $submission->id,
            'apd_used' => true,
            'kitchen_cleaned' => true,
            'storage_type' => 'freezer',
            'ingredient_condition' => 'baik',
            'supplier_source' => 'resmi',
        ]);

        $result = $this->scoringEngine->calculateScore($submission);

        return response()->json([
            'test_case' => 'Poor Nutrition (PERHATIAN)',
            'submission_id' => $submission->id,
            'result' => $result->toArray(),
        ]);
    }

    /**
     * Test Case 4: Poor Sanitation (BAHAYA)
     */
    public function testPoorSanitation()
    {
        $sppg = Sppg::firstOrCreate(
            ['name' => 'Test School Poor Sanitation'],
            [
                'location' => 'Medan',
                'province' => 'Sumatera Utara',
                'contact_person' => 'Kepala Sekolah',
                'phone' => '061-1234567',
            ]
        );

        $submission = MealSubmission::create([
            'sppg_id' => $sppg->id,
            'submitted_by' => 'Petugas Test',
            'menu_name' => 'Menu Sanitasi Buruk',
            'portion_count' => 50,
            'cook_start_at' => Carbon::now()->subHours(1),
            'serve_planned_at' => Carbon::now(),
            'distribute_at' => Carbon::now()->addMinutes(15),
            'image_path' => 'test/poor_sanitation.jpg',
            'status' => 'processing',
        ]);

        // Add complete menu items
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Ayam Goreng',
            'quantity_gram' => 150,
            'category' => 'protein',
        ]);
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Nasi Putih',
            'quantity_gram' => 200,
            'category' => 'carbs',
        ]);
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Sayur Bayam',
            'quantity_gram' => 100,
            'category' => 'vegetables',
        ]);
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Buah Pisang',
            'quantity_gram' => 100,
            'category' => 'fruits',
        ]);

        // Add poor sanitation check
        SanitationCheck::create([
            'meal_submission_id' => $submission->id,
            'apd_used' => false,
            'kitchen_cleaned' => false,
            'storage_type' => 'suhu_ruang',
            'ingredient_condition' => 'rusak',
            'supplier_source' => 'lainnya',
        ]);

        $result = $this->scoringEngine->calculateScore($submission);

        return response()->json([
            'test_case' => 'Poor Sanitation (BAHAYA)',
            'submission_id' => $submission->id,
            'result' => $result->toArray(),
        ]);
    }

    /**
     * Score a specific submission
     */
    public function scoreSubmission($submissionId)
    {
        $submission = MealSubmission::with('menuItems', 'sanitationCheck')->findOrFail($submissionId);

        $result = $this->scoringEngine->calculateScore($submission);

        return response()->json([
            'success' => true,
            'submission_id' => $submissionId,
            'result' => $result->toArray(),
        ]);
    }

    /**
     * Get all test submissions
     */
    public function listTestSubmissions()
    {
        $submissions = MealSubmission::with('sppg', 'menuItems', 'sanitationCheck')
            ->where('menu_name', 'like', '%Test%')
            ->orWhere('menu_name', 'like', '%test%')
            ->latest()
            ->get()
            ->map(function ($submission) {
                $result = $this->scoringEngine->calculateScore($submission);
                return [
                    'id' => $submission->id,
                    'sppg' => $submission->sppg->name,
                    'menu_name' => $submission->menu_name,
                    'created_at' => $submission->created_at,
                    'scoring_result' => $result->toArray(),
                ];
            });

        return response()->json([
            'success' => true,
            'total' => $submissions->count(),
            'data' => $submissions,
        ]);
    }
}
