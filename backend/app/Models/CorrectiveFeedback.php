<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrectiveFeedback extends Model
{
    use HasFactory;

    protected $table = 'corrective_feedbacks';

    protected $fillable = [
        'ai_assessment_id', 'immediate_actions', 
        'tomorrow_improvements', 'routine_notes', 'generated_at'
    ];

    protected $casts = [
        'immediate_actions' => 'array',
        'tomorrow_improvements' => 'array',
        'routine_notes' => 'array',
        'generated_at' => 'datetime',
    ];

    public function aiAssessment()
    {
        return $this->belongsTo(AiAssessment::class);
    }
}