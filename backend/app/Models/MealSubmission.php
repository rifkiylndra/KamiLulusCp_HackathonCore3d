<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'sppg_id', 'submitted_by', 'menu_name', 'portion_count',
        'cook_start_at', 'serve_planned_at', 'distribute_at', 
        'image_path', 'status'
    ];

    protected $casts = [
        'cook_start_at' => 'datetime',
        'serve_planned_at' => 'datetime',
        'distribute_at' => 'datetime',
    ];

    public function sppg()
    {
        return $this->belongsTo(Sppg::class);
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function sanitationCheck()
    {
        return $this->hasOne(SanitationCheck::class);
    }

    public function aiAssessment()
    {
        return $this->hasOne(AiAssessment::class);
    }
}