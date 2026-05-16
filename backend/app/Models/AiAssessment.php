<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'meal_submission_id', 'nutrition_score', 'safety_score',
        'sanitation_score', 'final_score', 'status', 'violations_count',
        'immediate_action_required', 'raw_response', 'processing_time_ms'
    ];

    protected $casts = [
        'nutrition_score' => 'integer',
        'safety_score' => 'integer',
        'sanitation_score' => 'integer',
        'final_score' => 'integer',
        'violations_count' => 'integer',
        'immediate_action_required' => 'boolean',
    ];

    public function mealSubmission()
    {
        return $this->belongsTo(MealSubmission::class);
    }

    public function violations()
    {
        return $this->hasMany(Violation::class);
    }

    public function correctiveFeedback()
    {
        return $this->hasOne(CorrectiveFeedback::class);
    }
}