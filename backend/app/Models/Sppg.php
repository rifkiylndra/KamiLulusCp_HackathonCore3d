<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Sppg extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'sppg';

    protected $fillable = [
        'name',
        'email',
        'password',
        'location',
        'province',
        'contact_person',
        'phone',
        'has_slhs',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'has_slhs' => 'boolean',
        'password' => 'hashed',
    ];

    public function mealSubmissions()
    {
        return $this->hasMany(MealSubmission::class);
    }
}
