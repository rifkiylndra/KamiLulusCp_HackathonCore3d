# Scoring Engine Documentation

## Overview
Scoring Engine adalah sistem penilaian komprehensif untuk mengevaluasi kualitas makanan yang disajikan di sekolah/institusi. Sistem ini menggunakan logika berbasis aturan (rule-based) dan weighted scoring untuk menghasilkan penilaian yang akurat dan konsisten.

## Arsitektur

### 1. ScoringResult DTO
**File:** `app/DTOs/ScoringResult.php`

Data Transfer Object yang membawa hasil scoring:
```php
- nutritionScore: int (0-100)
- safetyScore: int (0-100)
- sanitationScore: int (0-100)
- finalScore: int (0-100)
- status: string ('AMAN', 'PERHATIAN', 'BAHAYA')
- immediateActionRequired: bool
- violations: array
- correctiveFeedback: array
- rawResponse: string (JSON)
```

### 2. ScoringEngine Service
**File:** `app/Services/ScoringEngine.php`

Service utama yang menangani semua logika scoring.

#### Constants
```php
NUTRITION_WEIGHT = 0.40 (40%)
SAFETY_WEIGHT = 0.40 (40%)
SANITATION_WEIGHT = 0.20 (20%)
MAX_FOOD_HOLDING_HOURS = 4 jam
DANGER_THRESHOLD = 60
WARNING_THRESHOLD = 75
```

#### Main Method
```php
public function calculateScore(MealSubmission $submission): ScoringResult
```

## Scoring Logic

### 1. Hard Rules (Validasi Pertama)
Jika ada pelanggaran hard rule, status langsung menjadi **BAHAYA**.

**Rule 1: Food Holding Time**
- Jika waktu penyimpanan > 4 jam → CRITICAL violation
- Deskripsi: "Waktu penyimpanan makanan melebihi 4 jam (X jam). Risiko pertumbuhan bakteri patogen sangat tinggi."

### 2. Nutrition Score (40%)
Mengevaluasi variasi dan kelengkapan menu makanan.

**Kriteria:**
- Protein (ayam, daging, ikan, telur, tahu, tempe, kacang)
- Carbs (nasi, roti, kentang, jagung, gandum)
- Vegetables (sayur, bayam, brokoli, wortel, tomat, bawang)
- Fruits (buah, apel, pisang, jeruk, mangga, pepaya)

**Scoring:**
- Base: 100
- Tidak ada protein: -25
- Tidak ada carbs: -25
- Tidak ada vegetables: -20
- Tidak ada fruits: -15
- Bonus (semua ada): +10

**Violation Threshold:** < 60

### 3. Safety Score (40%)
Mengevaluasi keamanan pangan dan penanganan makanan.

**Kriteria:**
- Holding time (ideal < 2 jam)
- Distribution delay (ideal < 30 menit)
- Image documentation

**Scoring:**
- Base: 100
- Holding time > 2 jam: -5 per jam (max 30)
- Distribution delay > 30 menit: -5 per 30 menit (max 20)
- Tidak ada dokumentasi foto: -10

**Violation Threshold:** < 60

### 4. Sanitation Score (20%)
Mengevaluasi standar sanitasi dan kebersihan.

**Kriteria:**
- APD Used (Personal Protective Equipment): -25 jika tidak
- Kitchen Cleaned: -25 jika tidak
- Storage Type:
  - Freezer: 0 (best)
  - Kulkas: -5
  - Suhu Ruang: -20
- Ingredient Condition:
  - Baik: 0 (best)
  - Mencurigakan: -20
  - Rusak: -30
- Supplier Source:
  - Resmi: 0 (best)
  - Pasar: -10
  - Lainnya: -15

**Violation Threshold:** < 60

### 5. Final Score Calculation
```
Final Score = (Nutrition × 0.40) + (Safety × 0.40) + (Sanitation × 0.20)
```

### 6. Status Determination
```
BAHAYA:     < 60 atau ada hard rule violation
PERHATIAN:  60-74
AMAN:       >= 75
```

## Violations & Corrective Feedback

### Violations Structure
```php
[
    'dimension' => 'NUTRITION|SAFETY|SANITATION',
    'severity' => 'CRITICAL|HIGH|MEDIUM',
    'description' => 'Deskripsi masalah',
    'corrective_action' => 'Tindakan perbaikan'
]
```

### Corrective Feedback Structure
```php
[
    'immediate_actions' => [
        'Tindakan segera yang harus dilakukan'
    ],
    'tomorrow_improvements' => [
        'Perbaikan untuk hari esok'
    ],
    'routine_notes' => [
        'Catatan rutin untuk diterapkan'
    ]
]
```

## Usage Example

### Basic Usage
```php
use App\Services\ScoringEngine;
use App\Models\MealSubmission;

$scoringEngine = new ScoringEngine();
$submission = MealSubmission::with('menuItems', 'sanitationCheck')->find(1);

$result = $scoringEngine->calculateScore($submission);

// Access results
echo $result->finalScore;           // 85
echo $result->status;               // 'AMAN'
echo $result->nutritionScore;       // 90
echo $result->safetyScore;          // 80
echo $result->sanitationScore;      // 85
echo $result->immediateActionRequired; // false

// Violations
foreach ($result->violations as $violation) {
    echo $violation['description'];
}

// Corrective Feedback
foreach ($result->correctiveFeedback['immediate_actions'] as $action) {
    echo $action;
}
```

### Integration with Controller
```php
use App\Services\ScoringEngine;
use App\Models\MealSubmission;
use App\Models\AiAssessment;

public function scoreSubmission($submissionId)
{
    $submission = MealSubmission::with('menuItems', 'sanitationCheck')->findOrFail($submissionId);
    $scoringEngine = new ScoringEngine();
    $result = $scoringEngine->calculateScore($submission);

    // Save to database
    $assessment = AiAssessment::create([
        'meal_submission_id' => $submission->id,
        'nutrition_score' => $result->nutritionScore,
        'safety_score' => $result->safetyScore,
        'sanitation_score' => $result->sanitationScore,
        'final_score' => $result->finalScore,
        'status' => $result->status,
        'violations_count' => count($result->violations),
        'immediate_action_required' => $result->immediateActionRequired,
        'raw_response' => $result->rawResponse,
    ]);

    // Save violations
    foreach ($result->violations as $violation) {
        $assessment->violations()->create($violation);
    }

    // Save corrective feedback
    $assessment->correctiveFeedback()->create($result->correctiveFeedback);

    return response()->json([
        'success' => true,
        'data' => $result->toArray()
    ]);
}
```

## Testing

### Run Tests
```bash
php artisan test tests/Unit/ScoringEngineTest.php
```

### Test Cases
1. **Perfect Meal Submission** - Semua kriteria terpenuhi → AMAN
2. **Hard Rule Violation** - Holding time > 4 jam → BAHAYA
3. **Incomplete Menu** - Menu tidak lengkap → PERHATIAN
4. **Poor Sanitation** - Sanitasi buruk → Violation detected
5. **Missing Sanitation Check** - Tidak ada data sanitasi → Default score 50
6. **Scoring Weights** - Verifikasi weighted average
7. **Corrective Feedback** - Feedback generated correctly

### Test Results
```
✓ perfect meal submission returns aman status
✓ hard rule violation exceeding 4 hours returns bahaya
✓ incomplete menu returns perhatian status
✓ poor sanitation returns violation
✓ missing sanitation check uses default score
✓ final score uses correct weights
✓ corrective feedback is generated

Tests: 7 passed (27 assertions)
```

## Data Requirements

### MealSubmission
- `cook_start_at`: Waktu mulai memasak
- `serve_planned_at`: Waktu rencana penyajian
- `distribute_at`: Waktu distribusi
- `image_path`: Path dokumentasi foto
- `status`: Status submission

### MenuItem (Relasi)
- `ingredient_name`: Nama bahan
- `quantity_gram`: Jumlah dalam gram
- `category`: Kategori (protein, carbs, vegetables, fruits, dairy)

### SanitationCheck (Relasi)
- `apd_used`: APD digunakan (boolean)
- `kitchen_cleaned`: Dapur dibersihkan (boolean)
- `storage_type`: Tipe penyimpanan (freezer, kulkas, suhu_ruang)
- `ingredient_condition`: Kondisi bahan (baik, rusak, mencurigakan)
- `supplier_source`: Sumber supplier (resmi, pasar, lainnya)

## Future Enhancements

1. **AI Integration**: Integrasi dengan Gemini API untuk analisis lebih mendalam
2. **Image Analysis**: Analisis foto makanan menggunakan computer vision
3. **Historical Trends**: Tracking trend scoring dari waktu ke waktu
4. **Predictive Analytics**: Prediksi masalah berdasarkan historical data
5. **Custom Rules**: Memungkinkan institusi membuat custom scoring rules
6. **Multi-language Support**: Support untuk berbagai bahasa

## Performance Considerations

- Scoring calculation: ~50ms per submission
- Database queries: Optimized dengan eager loading
- Caching: Dapat di-cache untuk dashboard statistics
- Batch processing: Untuk scoring multiple submissions

## Security

- Input validation di StoreMealSubmissionRequest
- Authorization checks di controller
- SQL injection prevention dengan parameterized queries
- XSS prevention dengan proper output encoding

## Troubleshooting

### Issue: Score tidak sesuai ekspektasi
**Solution:** Verifikasi data MenuItem dan SanitationCheck sudah lengkap

### Issue: Violations tidak terdeteksi
**Solution:** Check threshold values dan scoring logic di ScoringEngine

### Issue: Test gagal
**Solution:** Pastikan database sudah di-migrate dan factories sudah di-update

## References

- Laravel Documentation: https://laravel.com/docs
- PHPUnit Testing: https://phpunit.de/
- Food Safety Standards: WHO/FAO Guidelines
