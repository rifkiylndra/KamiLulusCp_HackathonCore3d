<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sppg extends Model
{
    use HasFactory;

    protected $table = 'sppg';
    
    protected $fillable = [
        'name', 'location', 'province', 'contact_person', 'phone', 'has_slhs'
    ];

    public function mealSubmissions()
    {
        return $this->hasMany(MealSubmission::class);
    }
}