<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MealSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sppg_id' => $this->sppg_id,
            'sppg_name' => $this->sppg?->name,
            'menu_name' => $this->menu_name,
            'submitted_by' => $this->submitted_by,
            'portion_count' => $this->portion_count,
            'cook_start_at' => $this->cook_start_at,
            'serve_planned_at' => $this->serve_planned_at,
            'distribute_at' => $this->distribute_at,
            'image_path' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'status' => $this->status,
            'ingredients' => $this->whenLoaded('menuItems', function () {
                return $this->menuItems->map(fn($item) => [
                    'id' => $item->id,
                    'ingredient_name' => $item->ingredient_name,
                    'quantity_gram' => $item->quantity_gram,
                    'category' => $item->category,
                ]);
            }),
            'sanitation' => $this->whenLoaded('sanitationCheck', function () {
                $check = $this->sanitationCheck;
                return $check ? [
                    'id' => $check->id,
                    'apd_used' => (bool) $check->apd_used,
                    'kitchen_cleaned' => (bool) $check->kitchen_cleaned,
                    'storage_type' => $check->storage_type,
                    'ingredient_condition' => $check->ingredient_condition,
                    'supplier_source' => $check->supplier_source,
                ] : null;
            }),
            'assessment' => $this->whenLoaded('aiAssessment', function () {
                $assessment = $this->aiAssessment;
                return $assessment ? [
                    'id' => $assessment->id,
                    'final_score' => $assessment->final_score,
                    'status' => $assessment->status,
                    'nutrition_score' => $assessment->nutrition_score,
                    'safety_score' => $assessment->safety_score,
                    'sanitation_score' => $assessment->sanitation_score,
                    'violations_count' => $assessment->violations_count,
                    'immediate_action_required' => (bool) $assessment->immediate_action_required,
                    'processing_time_ms' => $assessment->processing_time_ms,
                    'violations' => $assessment->violations?->map(fn($v) => [
                        'id' => $v->id,
                        'dimension' => $v->dimension,
                        'severity' => $v->severity,
                        'description' => $v->description,
                        'corrective_action' => $v->corrective_action,
                    ]),
                    'corrective_feedback' => $assessment->correctiveFeedback ? [
                        'immediate_actions' => $assessment->correctiveFeedback->immediate_actions,
                        'tomorrow_improvements' => $assessment->correctiveFeedback->tomorrow_improvements,
                        'routine_notes' => $assessment->correctiveFeedback->routine_notes,
                    ] : null,
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
