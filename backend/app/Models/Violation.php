<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Violation extends Model
{
    use HasFactory;

    protected $fillable = [
        'ai_assessment_id', 'dimension', 'severity', 
        'description', 'corrective_action'
    ];

    public function aiAssessment()
    {
        return $this->belongsTo(AiAssessment::class);
    }
}