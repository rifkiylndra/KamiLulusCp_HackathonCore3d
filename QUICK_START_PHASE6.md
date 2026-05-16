# Quick Start - Phase 6: Gemini Integration + Queue Job

## 5 Langkah Setup

### Step 1: Setup Environment

```bash
# Edit .env
GEMINI_API_KEY=AIzaSyAQNu3AmKxLFrm1NWSuKLmygL5sR9cHhKw
QUEUE_CONNECTION=database
```

### Step 2: Create Queue Table

```bash
cd backend
php artisan queue:table
php artisan migrate
```

### Step 3: Start Queue Worker

```bash
# Terminal 1 - Queue Worker
php artisan queue:work

# Atau dengan supervisor untuk production
```

### Step 4: Test dengan Scoring Test Endpoint

```bash
# Terminal 2 - Test API
curl -X GET "http://127.0.0.1:8000/api/scoring-test/perfect"
```

### Step 5: Monitor Queue Jobs

```bash
# Terminal 3 - Monitor
php artisan queue:failed
```

---

## Testing Flow

### 1. Create Submission

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
      },
      {
        "ingredient_name": "Sayur",
        "quantity_gram": 100,
        "category": "vegetables"
      },
      {
        "ingredient_name": "Buah",
        "quantity_gram": 100,
        "category": "fruits"
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

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 1
  },
  "message": "Submission berhasil. AI sedang menganalisis..."
}
```

### 2. Check Status

```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/1/status" \
  -H "Accept: application/json"
```

**Response (Processing):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "processing",
    "ai_assessment": null
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "ai_assessment": {
      "id": 1,
      "nutrition_score": 85,
      "safety_score": 80,
      "sanitation_score": 90,
      "final_score": 85,
      "status": "AMAN",
      "violations_count": 0,
      "immediate_action_required": false
    }
  }
}
```

### 3. Get Full Details

```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/1" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sppg_id": 1,
    "menu_name": "Test Menu",
    "status": "completed",
    "ai_assessment": {
      "id": 1,
      "nutrition_score": 85,
      "safety_score": 80,
      "sanitation_score": 90,
      "final_score": 85,
      "status": "AMAN",
      "violations": [],
      "corrective_feedback": {
        "immediate_actions": [],
        "tomorrow_improvements": [],
        "routine_notes": [...]
      }
    },
    "menu_items": [...],
    "sanitation_check": {...}
  }
}
```

---

## What Happens Behind the Scenes

### 1. Submission Created
```
POST /api/submissions
  ↓
MealSubmissionController::store()
  ↓
Save to database
  ↓
Dispatch ProcessMealAnalysis job
  ↓
Return submission_id
```

### 2. Queue Worker Processes Job
```
ProcessMealAnalysis::handle()
  ↓
Load submission + relationships
  ↓
Call Gemini API (nutrition analysis)
  ↓
Call Gemini API (image analysis) [if image exists]
  ↓
Run Scoring Engine
  ↓
Merge Gemini + Scoring Engine results
  ↓
Save to database:
  - ai_assessments
  - violations
  - corrective_feedbacks
  ↓
Update submission status to 'completed'
```

### 3. Frontend Polls Status
```
GET /api/submissions/{id}/status
  ↓
Check submission.status
  ↓
If 'completed', show results
  ↓
If 'processing', retry after 2 seconds
  ↓
If 'failed', show error
```

---

## Gemini API Integration

### Nutrition Analysis
Gemini menganalisis:
- Protein adequacy
- Carbs adequacy
- Vegetables adequacy
- Fruits adequacy
- Food handling safety
- Storage safety
- Hygiene compliance
- Supplier compliance

### Image Analysis
Gemini menganalisis foto makanan:
- Visual quality (cleanliness, presentation, freshness)
- Food variety detection
- Contamination signs
- Spoilage signs

### Result Merging
```
Gemini Scores + Scoring Engine Scores
  ↓
Final Score = (Nutrition × 0.40) + (Safety × 0.40) + (Sanitation × 0.20)
  ↓
Status = AMAN | PERHATIAN | BAHAYA
```

---

## Troubleshooting

### Queue Jobs Not Processing

**Check 1: Queue Worker Running?**
```bash
ps aux | grep "queue:work"
```

**Check 2: Queue Table Exists?**
```bash
php artisan migrate
```

**Check 3: Check Failed Jobs**
```bash
php artisan queue:failed
```

**Check 4: Retry Failed Jobs**
```bash
php artisan queue:retry all
```

### Gemini API Error

**Check 1: API Key Valid?**
```bash
# In .env
GEMINI_API_KEY=your_key_here
```

**Check 2: Check Logs**
```bash
tail -f storage/logs/laravel.log
```

**Check 3: Test Gemini Connection**
```php
php artisan tinker
>>> $service = app(\App\Services\GeminiService::class);
>>> $response = $service->analyzeNutrition([], []);
>>> dd($response);
```

### Submission Status Stuck on "processing"

**Solution 1: Check Queue Worker**
```bash
php artisan queue:work
```

**Solution 2: Check Failed Jobs**
```bash
php artisan queue:failed
```

**Solution 3: Manually Retry**
```php
php artisan tinker
>>> $submission = \App\Models\MealSubmission::find(1);
>>> \App\Jobs\ProcessMealAnalysis::dispatch($submission);
```

---

## Performance Tips

### 1. Batch Processing
```php
// Process multiple submissions at once
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

### 4. Monitor Queue Performance
```bash
# Check queue stats
php artisan queue:failed

# Clear old failed jobs
php artisan queue:flush
```

---

## Production Checklist

- [ ] GEMINI_API_KEY set in .env
- [ ] QUEUE_CONNECTION=database in .env
- [ ] Queue table migrated
- [ ] Supervisor configured for queue:work
- [ ] Logs directory writable
- [ ] Database backups configured
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] Rate limiting configured for Gemini API

---

## Next Steps

1. ✅ Setup environment
2. ✅ Create queue table
3. ✅ Start queue worker
4. ✅ Test with API
5. ✅ Monitor queue jobs
6. → Deploy to production
7. → Setup monitoring
8. → Optimize performance

---

## Files Created

- `app/Services/GeminiService.php` - Gemini API integration
- `app/Services/GeminiResponseParser.php` - Parse Gemini responses
- `app/Jobs/ProcessMealAnalysis.php` - Queue job
- `app/Http/Controllers/Api/ScoringTestController.php` - Testing endpoints
- `config/services.php` - Gemini config
- `GEMINI_INTEGRATION.md` - Full documentation
- `TESTING_GUIDE.md` - Testing guide

---

## Support

Untuk bantuan lebih lanjut, lihat:
- `backend/GEMINI_INTEGRATION.md` - Dokumentasi teknis lengkap
- `TESTING_GUIDE.md` - Testing guide
- `backend/SCORING_ENGINE.md` - Scoring engine documentation
