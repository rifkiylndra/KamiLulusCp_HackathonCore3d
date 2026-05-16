<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\MealSubmission;
use App\Models\Sppg;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_submission_creation_and_processing()
    {
        // Create SPPG
        $sppg = Sppg::factory()->create();

        // Submit meal
        $response = $this->postJson('/api/submissions', [
            'sppg_id' => $sppg->id,
            'menu_name' => 'Test Menu',
            'portion_count' => 50,
            'cook_start_at' => now()->toDateTimeString(),
            'serve_planned_at' => now()->addHours(2)->toDateTimeString(),
            'ingredients' => [
                [
                    'ingredient_name' => 'Rice',
                    'quantity_gram' => 100,
                    'category' => 'karbohidrat'
                ]
            ],
            'sanitation' => [
                'apd_used' => true,
                'kitchen_cleaned' => true,
                'storage_type' => 'kulkas',
                'ingredient_condition' => 'baik',
                'supplier_source' => 'resmi'
            ]
        ]);

        $response->assertStatus(202);
        $response->assertJsonStructure([
            'success',
            'data' => ['submission_id', 'status'],
            'message'
        ]);

        $submissionId = $response->json('data.submission_id');

        // Check status
        $statusResponse = $this->getJson("/api/submissions/$submissionId/status");
        $statusResponse->assertStatus(200);
        $statusResponse->assertJsonStructure([
            'success',
            'data' => ['status', 'progress_percent']
        ]);
    }

    public function test_submission_search_and_filter()
    {
        $sppg = Sppg::factory()->create();

        // Create multiple submissions
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/submissions', [
                'sppg_id' => $sppg->id,
                'menu_name' => "Menu $i",
                'portion_count' => 50,
                'cook_start_at' => now()->toDateTimeString(),
                'serve_planned_at' => now()->addHours(2)->toDateTimeString(),
                'ingredients' => [
                    ['ingredient_name' => 'Bahan', 'quantity_gram' => 100, 'category' => 'protein']
                ],
                'sanitation' => [
                    'apd_used' => true,
                    'kitchen_cleaned' => true,
                    'storage_type' => 'kulkas',
                    'ingredient_condition' => 'baik',
                    'supplier_source' => 'resmi'
                ]
            ]);
        }

        // Search
        $response = $this->getJson('/api/submissions/search?search=Menu');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => ['data', 'meta']
        ]);
    }

    public function test_sppg_crud_operations()
    {
        // Create
        $createResponse = $this->postJson('/api/sppg', [
            'name' => 'Test School',
            'location' => 'Test Location',
            'province' => 'Test Province',
            'contact_person' => 'Test Person',
            'phone' => '081234567890'
        ]);

        $createResponse->assertStatus(201);
        $sppgId = $createResponse->json('data.id');

        // Read
        $readResponse = $this->getJson("/api/sppg/$sppgId");
        $readResponse->assertStatus(200);

        // Update
        $updateResponse = $this->putJson("/api/sppg/$sppgId", [
            'name' => 'Updated School'
        ]);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJsonPath('data.name', 'Updated School');
    }

    public function test_dashboard_stats()
    {
        $response = $this->getJson('/api/dashboard/stats');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'date',
                'today_submissions',
                'active_alerts',
                'average_score'
            ]
        ]);
    }

    public function test_validation_errors()
    {
        // Missing required fields
        $response = $this->postJson('/api/submissions', [
            'sppg_id' => 1,
            'menu_name' => 'Test'
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'success',
            'message',
            'errors'
        ]);
    }
}
