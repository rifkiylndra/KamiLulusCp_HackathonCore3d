<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SanitationCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'meal_submission_id', 'apd_used', 'kitchen_cleaned',
        'storage_type', 'ingredient_condition', 'supplier_source'
    ];

    public function mealSubmission()
    {
        return $this->belongsTo(MealSubmission::class);
    }
}