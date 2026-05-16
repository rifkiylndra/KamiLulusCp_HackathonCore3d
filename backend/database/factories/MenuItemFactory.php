<?php

namespace Database\Factories;

use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ingredient_name' => $this->faker->word(),
            'quantity_gram' => $this->faker->numberBetween(50, 300),
            'category' => $this->faker->randomElement(['protein', 'carbs', 'vegetables', 'fruits', 'dairy']),
        ];
    }
}
