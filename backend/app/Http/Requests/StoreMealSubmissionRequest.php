<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMealSubmissionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'sppg_id' => 'required|exists:sppg,id',
            'submitted_by' => 'nullable|string|max:255',
            'menu_name' => 'required|string|max:255',
            'portion_count' => 'required|integer|min:1|max:5000',
            'cook_start_at' => 'required|date',
            'serve_planned_at' => 'required|date|after:cook_start_at',
            'distribute_at' => 'nullable|date|after:serve_planned_at',
            'image' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_name' => 'required|string',
            'ingredients.*.quantity_gram' => 'required|numeric|min:0',
            'ingredients.*.category' => 'required|in:protein,karbohidrat,sayur,lemak,lainnya',
            'sanitation' => 'required|array',
            'sanitation.apd_used' => 'required|boolean',
            'sanitation.kitchen_cleaned' => 'required|boolean',
            'sanitation.storage_type' => 'required|in:freezer,kulkas,suhu_ruang',
            'sanitation.ingredient_condition' => 'required|in:baik,rusak,mencurigakan',
            'sanitation.supplier_source' => 'required|in:resmi,pasar,lainnya',
        ];
    }
}