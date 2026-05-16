<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

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
            'menu_name' => 'required|string|max:255',
            'portion_count' => 'required|integer|min:1',
            'cook_start_at' => 'required|date_format:Y-m-d H:i:s',
            'serve_planned_at' => 'required|date_format:Y-m-d H:i:s|after:cook_start_at',
            'distribute_at' => 'nullable|date_format:Y-m-d H:i:s|after:serve_planned_at',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'submitted_by' => 'nullable|string|max:255',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_name' => 'required|string|max:255',
            'ingredients.*.quantity_gram' => 'required|numeric|min:0',
            'ingredients.*.category' => 'required|string|in:protein,carbs,vegetables,fruits,other',
            'sanitation' => 'required|array',
            'sanitation.apd_used' => 'required|boolean',
            'sanitation.kitchen_cleaned' => 'required|boolean',
            'sanitation.storage_type' => 'required|in:freezer,kulkas,suhu_ruang',
            'sanitation.ingredient_condition' => 'required|in:baik,rusak,mencurigakan',
            'sanitation.supplier_source' => 'required|in:resmi,pasar,lainnya',
        ];
    }

    public function messages()
    {
        return [
            'cook_start_at.required' => 'Waktu mulai memasak harus diisi',
            'cook_start_at.date_format' => 'Format waktu mulai memasak harus Y-m-d H:i:s',
            'serve_planned_at.required' => 'Waktu rencana penyajian harus diisi',
            'serve_planned_at.after' => 'Waktu penyajian harus setelah waktu memasak',
            'distribute_at.after' => 'Waktu distribusi harus setelah waktu penyajian',
            'image_path.image' => 'File harus berupa gambar',
            'image_path.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif',
            'image_path.max' => 'Ukuran gambar maksimal 5MB',
            'ingredients.min' => 'Minimal harus ada 1 bahan makanan',
            'ingredients.*.category.in' => 'Kategori bahan harus: protein, carbs, vegetables, fruits, atau other',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validasi waktu: cook_start_at → serve_planned_at → distribute_at
            $cookStart = Carbon::createFromFormat('Y-m-d H:i:s', $this->cook_start_at);
            $servePlanned = Carbon::createFromFormat('Y-m-d H:i:s', $this->serve_planned_at);

            // Minimal 30 menit dari memasak ke penyajian
            if ($servePlanned->diffInMinutes($cookStart) < 30) {
                $validator->errors()->add('serve_planned_at', 'Waktu penyajian minimal 30 menit setelah memasak');
            }

            // Jika ada distribute_at, validasi juga
            if ($this->distribute_at) {
                $distribute = Carbon::createFromFormat('Y-m-d H:i:s', $this->distribute_at);
                
                // Minimal 15 menit dari penyajian ke distribusi
                if ($distribute->diffInMinutes($servePlanned) < 15) {
                    $validator->errors()->add('distribute_at', 'Waktu distribusi minimal 15 menit setelah penyajian');
                }
            }
        });
    }
}