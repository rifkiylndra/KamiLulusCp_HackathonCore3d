# Gemini Integration + Queue Job Documentation

## Overview
Phase 6 mengintegrasikan Google Gemini API untuk analisis mendalam tentang gizi, keamanan, dan sanitasi makanan. Sistem menggunakan Laravel Queue untuk memproses analisis secara asynchronous.

## Architecture

### 1. GeminiService
**File:** `app/Services/GeminiService.php`

Service untuk komunikasi dengan Gemini API.

#### Methods:
```php
public function analyzeNutrition(array $menuItems, array $sanitationData): string
```
- Analisis data nutrisi menu dan sanitasi
- Return: JSON string dari Gemini

```php
public function analyzeImage(string $imagePath): string
```
- Analisis foto makanan
- Return: JSON string dari Gemini

### 2. GeminiResponseParser
**File:** `app/Services/GeminiResponseParser.php`

Parser untuk mengubah response Gemini menjadi structured data.

#### Methods:
```php
public static function parseNutritionResponse(string $response): array
```
- Parse nutrition analysis response
- Return: Array dengan nutrition_score, safety_score, sanitation_score, dll

```php
public static function parseImageResponse(string $response): array
```
- Parse image analysis response
- Return: Array dengan visual_quality_score, food_variety_score, dll

### 3. ProcessMealAnalysis Job
**File:** `app/Jobs/ProcessMealAnalysis.php`

Queue job untuk memproses analisis meal secara asynchronous.

#### Flow:
1. Load submission dengan relationships
2. Call Gemini untuk nutrition analysis
3. Call Gemini untuk image analysis (jika ada)
4. Run Scoring Engine
5. Merge Gemini + Scoring Engine results
6. Save ke database (ai_assessments, violations, corrective_feedbacks)
7. Update submission status

## Setup

### 1. Environment Configuration

Tambahkan ke `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
QUEUE_CONNECTION=database
```

### 2. Queue Configuration

File `config/queue.php` sudah dikonfigurasi untuk menggunakan database driver.

### 3. Create Queue Table

```bash
php artisan queue:table
php artisan migrate
```

### 4. Gemini API Key

Dapatkan API key dari: https://ai.google.dev/

## Usage

### Automatic Processing

Ketika submission dibuat via API, job otomatis di-dispatch:

```php
// Di MealSubmissionController
ProcessMealAnalysis::dispatch($submission);
```

### Manual Processing

```php
use App\Jobs\ProcessMealAnalysis;
use App\Models\MealSubmission;

$submission = MealSubmission::find(1);
ProcessMealAnalysis::dispatch($submission);
```

### Run Queue Worker

```bash
# Development
php artisan queue:work

# Production (dengan supervisor)
php artisan queue:work --daemon
```

## Gemini Prompts

### Nutrition Analysis Prompt

Gemini diminta untuk menganalisis:
- Protein adequacy
- Carbs adequacy
- Vegetables adequacy
- Fruits adequacy
- Overall nutrition score
- Safety analysis
- Sanitation analysis
- Recommendations
- Risk level

**Response Format:**
```json
{
  "nutrition_analysis": {
    "protein_adequacy": 85,
    "carbs_adequacy": 90,
    "vegetables_adequacy": 70,
    "fruits_adequacy": 60,
    "overall_nutrition_score": 76,
    "nutrition_notes": "..."
  },
  "safety_analysis": {
    "food_handling_safety": 80,
    "storage_safety": 85,
    "overall_safety_score": 82,
    "safety_notes": "..."
  },
  "sanitation_analysis": {
    "hygiene_compliance": 90,
    "storage_compliance": 85,
    "supplier_compliance": 80,
    "overall_sanitation_score": 85,
    "sanitation_notes": "..."
  },
  "recommendations": [...],
  "risk_level": "LOW"
}
```

### Image Analysis Prompt

Gemini diminta untuk menganalisis foto makanan:
- Visual quality (cleanliness, presentation, freshness)
- Food variety (protein, carbs, vegetables, fruits)
- Safety indicators (contamination, spoilage)
- Observations
- Recommendations
- Risk level

**Response Format:**
```json
{
  "visual_quality": {
    "cleanliness": 85,
    "presentation": 80,
    "freshness": 90,
    "overall_quality": 85
  },
  "food_variety": {
    "has_protein": true,
    "has_carbs": true,
    "has_vegetables": true,
    "has_fruits": true,
    "variety_score": 90
  },
  "safety_indicators": {
    "contamination_signs": "none",
    "spoilage_signs": "none",
    "safety_score": 95
  },
  "observations": "...",
  "recommendations": [...],
  "risk_level": "LOW"
}
```

## Result Merging

Sistem menggabungkan hasil dari Gemini dan Scoring Engine:

1. **Gemini Scores** digunakan jika tersedia
2. **Scoring Engine Scores** digunakan sebagai fallback
3. **Final Score** dihitung ulang dengan weighted average:
   - Nutrition: 40%
   - Safety: 40%
   - Sanitation: 20%

## Database Storage

### AI Assessment
```php
AiAssessment::create([
    'meal_submission_id' => $submission->id,
    'nutrition_score' => 85,
    'safety_score' => 80,
    'sanitation_score' => 90,
    'final_score' => 85,
    'status' => 'AMAN',
    'violations_count' => 0,
    'immediate_action_required' => false,
    'raw_response' => json_encode([...]),
    'processing_time_ms' => 1234,
]);
```

### Violations
```php
$assessment->violations()->create([
    'dimension' => 'NUTRITION',
    'severity' => 'MEDIUM',
    'description' => '...',
    'corrective_action' => '...',
]);
```

### Corrective Feedback
```php
$assessment->correctiveFeedback()->create([
    'immediate_actions' => [...],
    'tomorrow_improvements' => [...],
    'routine_notes' => [...],
    'generated_at' => now(),
]);
```

## Testing

### 1. Setup Queue Database

```bash
php artisan queue:table
php artisan migrate
```

### 2. Start Queue Worker

```bash
php artisan queue:work
```

### 3. Create Test Submission

```bash
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "sppg_id": 1,
    "menu_name": "Test Menu",
    "portion_count": 50,
    "cook_start_at": "2026-05-16 10:00:00",
    "serve_planned_at": "2026-05-16 12:00:00",
    "ingredients": [
      {
        "ingredient_name": "Ayam",
        "quantity_gram": 150,
        "category": "protein"
      },
      {
        "ingredient_name": "Nasi",
        "quantity_gram": 200,
        "category": "carbs"
      }
    ],
    "sanitation": {
      "apd_used": true,
      "kitchen_cleaned": true,
      "storage_type": "freezer",
      "ingredient_condition": "baik",
      "supplier_source": "resmi"
    }
  }'
```

### 4. Check Status

```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/{submission_id}/status" \
  -H "Accept: application/json"
```

### 5. View Results

```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/{submission_id}" \
  -H "Accept: application/json"
```

## Monitoring

### Check Queue Jobs

```bash
# List pending jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### View Logs

```bash
tail -f storage/logs/laravel.log
```

### Database Queries

```php
// Check job status
DB::table('jobs')->get();

// Check failed jobs
DB::table('failed_jobs')->get();

// Check AI assessments
AiAssessment::with('violations', 'correctiveFeedback')->get();
```

## Error Handling

### Common Issues

**Issue: "GEMINI_API_KEY not set"**
- Solution: Tambahkan GEMINI_API_KEY ke .env

**Issue: "Queue jobs not processing"**
- Solution: Pastikan `php artisan queue:work` sedang berjalan

**Issue: "Gemini API error"**
- Solution: Check logs di `storage/logs/laravel.log`
- Verify API key validity
- Check rate limits

**Issue: "Image analysis failed"**
- Solution: Pastikan image path valid
- Check file permissions
- Verify image format (JPEG, PNG)

## Performance Optimization

### 1. Batch Processing

```php
// Process multiple submissions
$submissions = MealSubmission::where('status', 'processing')->get();
foreach ($submissions as $submission) {
    ProcessMealAnalysis::dispatch($submission);
}
```

### 2. Queue Prioritization

```php
// High priority
ProcessMealAnalysis::dispatch($submission)->onQueue('high');

// Low priority
ProcessMealAnalysis::dispatch($submission)->onQueue('low');
```

### 3. Delayed Processing

```php
// Process after 5 minutes
ProcessMealAnalysis::dispatch($submission)->delay(now()->addMinutes(5));
```

## Production Deployment

### 1. Setup Supervisor

Create `/etc/supervisor/conf.d/laravel-worker.conf`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/backend/artisan queue:work database --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/path/to/backend/storage/logs/worker.log
```

### 2. Start Supervisor

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### 3. Monitor

```bash
sudo supervisorctl status
```

## Future Enhancements

1. **Caching**: Cache Gemini responses untuk menu yang sama
2. **Batch API**: Gunakan Gemini Batch API untuk processing lebih cepat
3. **Custom Models**: Fine-tune Gemini untuk domain-specific analysis
4. **Webhooks**: Notify frontend ketika analysis selesai
5. **Analytics**: Track Gemini API usage dan costs

## References

- Gemini API: https://ai.google.dev/
- Laravel Queue: https://laravel.com/docs/queues
- Laravel Jobs: https://laravel.com/docs/jobs
