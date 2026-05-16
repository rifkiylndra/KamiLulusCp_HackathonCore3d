<?php

namespace Database\Factories;

use App\Models\Sppg;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sppg>
 */
class SppgFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'location' => $this->faker->address(),
            'province' => $this->faker->state(),
            'contact_person' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'has_slhs' => $this->faker->boolean(),
        ];
    }
}
