<?php

namespace Database\Seeders;

use App\Models\AiAssessment;
use App\Models\CorrectiveFeedback;
use App\Models\MealSubmission;
use App\Models\MenuItem;
use App\Models\SanitationCheck;
use App\Models\Sppg;
use App\Models\Violation;
use App\Services\ScoringEngine;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    private ScoringEngine $scoringEngine;

    public function __construct(ScoringEngine $scoringEngine)
    {
        $this->scoringEngine = $scoringEngine;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "\n=== Starting Demo Seeder ===\n";

        // Create 5 SPPG in Padang
        $sppgs = $this->createSppgs();

        // Create submissions with variations
        $this->createBahayaSubmission($sppgs[0]);
        $this->createPerhatianSubmission($sppgs[1]);
        $this->createAmanSubmissions($sppgs);

        echo "\n=== Demo Seeder Completed ===\n";
    }

    /**
     * Create 5 SPPG in Padang
     */
    private function createSppgs(): array
    {
        echo "Creating 5 SPPG in Padang...\n";

        $sppgs = [
            [
                'name' => 'SD Negeri 1 Padang',
                'location' => 'Jl. Diponegoro No. 1, Padang',
                'province' => 'Sumatera Barat',
                'contact_person' => 'Ibu Siti Nurhaliza',
                'phone' => '0751-123456',
            ],
            [
                'name' => 'SD Negeri 2 Padang',
                'location' => 'Jl. Ahmad Yani No. 45, Padang',
                'province' => 'Sumatera Barat',
                'contact_person' => 'Bapak Bambang Sutrisno',
                'phone' => '0751-234567',
            ],
            [
                'name' => 'SMP Negeri 1 Padang',
                'location' => 'Jl. Sudirman No. 78, Padang',
                'province' => 'Sumatera Barat',
                'contact_person' => 'Ibu Dewi Lestari',
                'phone' => '0751-345678',
            ],
            [
                'name' => 'SMP Negeri 2 Padang',
                'location' => 'Jl. Gatot Subroto No. 12, Padang',
                'province' => 'Sumatera Barat',
                'contact_person' => 'Bapak Hendra Wijaya',
                'phone' => '0751-456789',
            ],
            [
                'name' => 'SMA Negeri 1 Padang',
                'location' => 'Jl. Pemuda No. 99, Padang',
                'province' => 'Sumatera Barat',
                'contact_person' => 'Ibu Ratna Sari',
                'phone' => '0751-567890',
            ],
        ];

        $createdSppgs = [];
        foreach ($sppgs as $sppgData) {
            $sppg = Sppg::create($sppgData);
            $createdSppgs[] = $sppg;
            echo "  ✓ Created: {$sppg->name}\n";
        }

        return $createdSppgs;
    }

    /**
     * Create BAHAYA submission (holding time > 4 hours + APD false)
     */
    private function createBahayaSubmission(Sppg $sppg): void
    {
        echo "\nCreating BAHAYA submission...\n";

        $submission = MealSubmission::create([
            'sppg_id' => $sppg->id,
            'submitted_by' => 'Petugas Dapur',
            'menu_name' => 'Menu Terlalu Lama Disimpan (BAHAYA)',
            'portion_count' => 100,
            'cook_start_at' => Carbon::now()->subHours(6),
            'serve_planned_at' => Carbon::now(),
            'distribute_at' => Carbon::now()->addMinutes(30),
            'image_path' => null,
            'status' => 'completed',
        ]);

        // Add menu items (incomplete)
        MenuItem::create([
            'meal_submission_id' => $submission->id,
            'ingredient_name' => 'Nasi Putih',
            'quantity_gram' => 200,
            'category' => 'carbs',
        ]);

        // Add poor sanitation
        SanitationCheck::create([
            'meal_submission_id' => $submission->id,
            'apd_used' => false,
            'kitchen_cleaned' => false,
            'storage_type' => 'suhu_ruang',
            'ingredient_condition' => 'rusak',
            'supplier_source' => 'lainnya',
        ]);

        // Calculate score
        $result = $this->scoringEngine->calculateScore($submission);

        // Save assessment
        $this->saveAssessment($submission, $result);

        echo "  ✓ Created BAHAYA submission (ID: {$submission->id})\n";
        echo "    Status: {$result->status}\n";
        echo "    Final Score: {$result->finalScore}\n";
    }

    /**
     * Create PERHATIAN submission (protein rendah)
     */
    private function createPerhatianSubmission(Sppg $sppg): void
    {
        echo "\nCreating PERHATIAN submission...\n";

        $submission = MealSubmission::create([
            'sppg_id' => $sppg->id,
            'submitted_by' => 'Petugas Dapur',
            'menu_name' => 'Menu Protein Rendah (PERHATIAN)',
            'portion_count' => 80,
            'cook_start_at' => Carbon::now()->subHours(1),
            'serve_planned_at' => Carbon::now(),
            'distribute_at' => Carbon::now()->addMinutes(15),
            'image_path' => null,
            'status' => 'completed',
        ]);

        // Add menu items (no protein)
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

        // Add poor sanitation
        SanitationCheck::create([
            'meal_submission_id' => $submission->id,
            'apd_used' => false,
            'kitchen_cleaned' => true,
            'storage_type' => 'kulkas',
            'ingredient_condition' => 'mencurigakan',
            'supplier_source' => 'pasar',
        ]);

        // Calculate score
        $result = $this->scoringEngine->calculateScore($submission);

        // Save assessment
        $this->saveAssessment($submission, $result);

        echo "  ✓ Created PERHATIAN submission (ID: {$submission->id})\n";
        echo "    Status: {$result->status}\n";
        echo "    Final Score: {$result->finalScore}\n";
    }

    /**
     * Create AMAN submissions (various good scenarios)
     */
    private function createAmanSubmissions(array $sppgs): void
    {
        echo "\nCreating AMAN submissions...\n";

        $menuVariations = [
            [
                'name' => 'Menu Sehat Lengkap 1',
                'items' => [
                    ['name' => 'Ayam Goreng', 'category' => 'protein', 'gram' => 150],
                    ['name' => 'Nasi Putih', 'category' => 'carbs', 'gram' => 200],
                    ['name' => 'Sayur Bayam', 'category' => 'vegetables', 'gram' => 100],
                    ['name' => 'Buah Pisang', 'category' => 'fruits', 'gram' => 100],
                ],
            ],
            [
                'name' => 'Menu Sehat Lengkap 2',
                'items' => [
                    ['name' => 'Ikan Bakar', 'category' => 'protein', 'gram' => 150],
                    ['name' => 'Nasi Kuning', 'category' => 'carbs', 'gram' => 200],
                    ['name' => 'Sayur Sop', 'category' => 'vegetables', 'gram' => 120],
                    ['name' => 'Buah Jeruk', 'category' => 'fruits', 'gram' => 100],
                ],
            ],
            [
                'name' => 'Menu Sehat Lengkap 3',
                'items' => [
                    ['name' => 'Tahu Goreng', 'category' => 'protein', 'gram' => 150],
                    ['name' => 'Nasi Merah', 'category' => 'carbs', 'gram' => 200],
                    ['name' => 'Sayur Brokoli', 'category' => 'vegetables', 'gram' => 100],
                    ['name' => 'Buah Mangga', 'category' => 'fruits', 'gram' => 100],
                ],
            ],
            [
                'name' => 'Menu Sehat Lengkap 4',
                'items' => [
                    ['name' => 'Telur Rebus', 'category' => 'protein', 'gram' => 100],
                    ['name' => 'Roti Gandum', 'category' => 'carbs', 'gram' => 150],
                    ['name' => 'Sayur Wortel', 'category' => 'vegetables', 'gram' => 100],
                    ['name' => 'Buah Apel', 'category' => 'fruits', 'gram' => 100],
                ],
            ],
            [
                'name' => 'Menu Sehat Lengkap 5',
                'items' => [
                    ['name' => 'Daging Sapi', 'category' => 'protein', 'gram' => 150],
                    ['name' => 'Nasi Putih', 'category' => 'carbs', 'gram' => 200],
                    ['name' => 'Sayur Kangkung', 'category' => 'vegetables', 'gram' => 100],
                    ['name' => 'Buah Pepaya', 'category' => 'fruits', 'gram' => 100],
                ],
            ],
        ];

        $count = 0;
        foreach ($sppgs as $sppgIndex => $sppg) {
            // Create 3-4 AMAN submissions per SPPG
            $submissionsPerSppg = $sppgIndex < 3 ? 4 : 3;

            for ($i = 0; $i < $submissionsPerSppg; $i++) {
                $menuVariation = $menuVariations[$count % count($menuVariations)];

                $submission = MealSubmission::create([
                    'sppg_id' => $sppg->id,
                    'submitted_by' => 'Petugas Dapur',
                    'menu_name' => $menuVariation['name'],
                    'portion_count' => rand(50, 150),
                    'cook_start_at' => Carbon::now()->subHours(rand(1, 2)),
                    'serve_planned_at' => Carbon::now(),
                    'distribute_at' => Carbon::now()->addMinutes(rand(10, 30)),
                    'image_path' => null,
                    'status' => 'completed',
                ]);

                // Add menu items
                foreach ($menuVariation['items'] as $item) {
                    MenuItem::create([
                        'meal_submission_id' => $submission->id,
                        'ingredient_name' => $item['name'],
                        'quantity_gram' => $item['gram'],
                        'category' => $item['category'],
                    ]);
                }

                // Add good sanitation
                SanitationCheck::create([
                    'meal_submission_id' => $submission->id,
                    'apd_used' => true,
                    'kitchen_cleaned' => true,
                    'storage_type' => 'freezer',
                    'ingredient_condition' => 'baik',
                    'supplier_source' => 'resmi',
                ]);

                // Calculate score
                $result = $this->scoringEngine->calculateScore($submission);

                // Save assessment
                $this->saveAssessment($submission, $result);

                echo "  ✓ Created AMAN submission (ID: {$submission->id}) - {$sppg->name}\n";
                echo "    Menu: {$menuVariation['name']}\n";
                echo "    Status: {$result->status} | Score: {$result->finalScore}\n";

                $count++;
            }
        }

        echo "\n  Total AMAN submissions created: {$count}\n";
    }

    /**
     * Save assessment to database
     */
    private function saveAssessment(MealSubmission $submission, $result): void
    {
        // Create AI Assessment
        $assessment = AiAssessment::create([
            'meal_submission_id' => $submission->id,
            'nutrition_score' => $result->nutritionScore,
            'safety_score' => $result->safetyScore,
            'sanitation_score' => $result->sanitationScore,
            'final_score' => $result->finalScore,
            'status' => $result->status,
            'violations_count' => count($result->violations),
            'immediate_action_required' => $result->immediateActionRequired,
            'raw_response' => json_encode($result->toArray()),
            'processing_time_ms' => rand(100, 500),
        ]);

        // Save violations
        foreach ($result->violations as $violation) {
            Violation::create([
                'ai_assessment_id' => $assessment->id,
                'dimension' => $violation['dimension'],
                'severity' => $violation['severity'],
                'description' => $violation['description'],
                'corrective_action' => $violation['corrective_action'],
            ]);
        }

        // Save corrective feedback
        CorrectiveFeedback::create([
            'ai_assessment_id' => $assessment->id,
            'immediate_actions' => $result->correctiveFeedback['immediate_actions'] ?? [],
            'tomorrow_improvements' => $result->correctiveFeedback['tomorrow_improvements'] ?? [],
            'routine_notes' => $result->correctiveFeedback['routine_notes'] ?? [],
            'generated_at' => Carbon::now(),
        ]);
    }
}
