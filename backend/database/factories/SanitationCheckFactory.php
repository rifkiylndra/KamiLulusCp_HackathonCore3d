<?php

namespace Database\Factories;

use App\Models\SanitationCheck;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SanitationCheck>
 */
class SanitationCheckFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'apd_used' => $this->faker->boolean(),
            'kitchen_cleaned' => $this->faker->boolean(),
            'storage_type' => $this->faker->randomElement(['freezer', 'kulkas', 'suhu_ruang']),
            'ingredient_condition' => $this->faker->randomElement(['baik', 'rusak', 'mencurigakan']),
            'supplier_source' => $this->faker->randomElement(['resmi', 'pasar', 'lainnya']),
        ];
    }
}
