<?php

namespace Database\Factories;

use App\Models\MealSubmission;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MealSubmission>
 */
class MealSubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cookStart = Carbon::now()->subHours(2);
        $servePlanned = $cookStart->copy()->addHours(1);

        return [
            'submitted_by' => $this->faker->name(),
            'menu_name' => $this->faker->word(),
            'portion_count' => $this->faker->numberBetween(10, 100),
            'cook_start_at' => $cookStart,
            'serve_planned_at' => $servePlanned,
            'distribute_at' => $servePlanned->copy()->addMinutes(30),
            'image_path' => null,
            'status' => 'processing',
        ];
    }
}
