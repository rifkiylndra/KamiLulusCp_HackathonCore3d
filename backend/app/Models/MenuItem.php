<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'meal_submission_id', 'ingredient_name', 'quantity_gram', 'category'
    ];

    public function mealSubmission()
    {
        return $this->belongsTo(MealSubmission::class);
    }
}