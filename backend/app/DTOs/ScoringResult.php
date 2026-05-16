<?php

namespace App\DTOs;

class ScoringResult
{
    public function __construct(
        public int $nutritionScore,
        public int $safetyScore,
        public int $sanitationScore,
        public int $finalScore,
        public string $status,
        public bool $immediateActionRequired,
        public array $violations,
        public array $correctiveFeedback,
        public string $rawResponse = '',
    ) {}

    public function toArray(): array
    {
        return [
            'nutrition_score' => $this->nutritionScore,
            'safety_score' => $this->safetyScore,
            'sanitation_score' => $this->sanitationScore,
            'final_score' => $this->finalScore,
            'status' => $this->status,
            'immediate_action_required' => $this->immediateActionRequired,
            'violations' => $this->violations,
            'corrective_feedback' => $this->correctiveFeedback,
            'raw_response' => $this->rawResponse,
        ];
    }
}
