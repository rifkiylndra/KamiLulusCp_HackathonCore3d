# 🔍 Verification Checklist - NutriGuard Backend

Run this checklist to verify everything is working correctly.

---

## ✅ Step 1: Database Verification

### Check Migrations
```bash
php artisan migrate:status
```

**Expected Output:**
```
✅ 0001_01_01_000000_create_users_table ................. [1] Ran
✅ 0001_01_01_000001_create_cache_table ................. [1] Ran
✅ 0001_01_01_000002_create_jobs_table .................. [1] Ran
✅ 2026_05_16_055101_create_sppg_table .................. [1] Ran
✅ 2026_05_16_055102_create_meal_submissions_table ...... [1] Ran
✅ 2026_05_16_055102_create_menu_items_table ............ [1] Ran
✅ 2026_05_16_055102_create_sanitation_checks_table ..... [1] Ran
✅ 2026_05_16_055103_create_ai_assessments_table ........ [1] Ran
✅ 2026_05_16_055103_create_violations_table ............ [1] Ran
✅ 2026_05_16_055104_create_corrective_feedbacks_table .. [1] Ran
```

### Check Data Count
```bash
php artisan tinker
>>> echo 'SPPG: ' . \App\Models\Sppg::count();
>>> echo 'MealSubmission: ' . \App\Models\MealSubmission::count();
>>> echo 'AiAssessment: ' . \App\Models\AiAssessment::count();
```

**Expected Output:**
```
SPPG: 10
MealSubmission: 22
AiAssessment: 21
```

---

## ✅ Step 2: Services Verification

### Check ScoringEngine
```bash
php artisan tinker
>>> $engine = app(\App\Services\ScoringEngine::class);
>>> echo 'ScoringEngine loaded: ' . (class_exists(\App\Services\ScoringEngine::class) ? 'YES' : 'NO');
```

**Expected Output:**
```
ScoringEngine loaded: YES
```

### Check GeminiService
```bash
php artisan tinker
>>> $service = app(\App\Services\GeminiService::class);
>>> echo 'GeminiService loaded: ' . (class_exists(\App\Services\GeminiService::class) ? 'YES' : 'NO');
```

**Expected Output:**
```
GeminiService loaded: YES
```

### Check ProcessMealAnalysis Job
```bash
php artisan tinker
>>> echo 'ProcessMealAnalysis exists: ' . (class_exists(\App\Jobs\ProcessMealAnalysis::class) ? 'YES' : 'NO');
```

**Expected Output:**
```
ProcessMealAnalysis exists: YES
```

---

## ✅ Step 3: API Endpoints Verification

### Start Development Server
```bash
php artisan serve --port=8000
```

### Test Dashboard Stats
```bash
curl -X GET "http://127.0.0.1:8000/api/dashboard/stats"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_submissions": 22,
    "today_submissions": X,
    "average_score": 75.5,
    "status_breakdown": {
      "AMAN": 18,
      "PERHATIAN": 1,
      "BAHAYA": 1
    }
  }
}
```

### Test SPPG List
```bash
curl -X GET "http://127.0.0.1:8000/api/sppg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SD Negeri 1 Padang",
      "location": "Padang",
      ...
    }
  ]
}
```

### Test Submissions List
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sppg_id": 1,
      "menu_name": "Nasi Kuning",
      "status": "completed",
      ...
    }
  ]
}
```

### Test Scoring Test Endpoint
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/perfect"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": X,
    "score": 100,
    "status": "AMAN",
    "violations": []
  }
}
```

---

## ✅ Step 4: Queue System Verification

### Check Queue Table
```bash
php artisan tinker
>>> DB::table('jobs')->count();
```

**Expected Output:**
```
0 (or number of pending jobs)
```

### Start Queue Worker
```bash
php artisan queue:work
```

**Expected Output:**
```
Processing jobs from the 'default' queue.
```

### Check Failed Jobs
```bash
php artisan queue:failed
```

**Expected Output:**
```
No failed jobs found.
```

---

## ✅ Step 5: Models & Relationships Verification

### Check Sppg Model
```bash
php artisan tinker
>>> $sppg = \App\Models\Sppg::first();
>>> echo 'Sppg loaded: ' . ($sppg ? 'YES' : 'NO');
>>> echo 'Has mealSubmissions: ' . ($sppg->mealSubmissions ? 'YES' : 'NO');
```

**Expected Output:**
```
Sppg loaded: YES
Has mealSubmissions: YES
```

### Check MealSubmission Model
```bash
php artisan tinker
>>> $submission = \App\Models\MealSubmission::first();
>>> echo 'MealSubmission loaded: ' . ($submission ? 'YES' : 'NO');
>>> echo 'Has aiAssessment: ' . ($submission->aiAssessment ? 'YES' : 'NO');
>>> echo 'Has menuItems: ' . ($submission->menuItems ? 'YES' : 'NO');
```

**Expected Output:**
```
MealSubmission loaded: YES
Has aiAssessment: YES
Has menuItems: YES
```

### Check AiAssessment Model
```bash
php artisan tinker
>>> $assessment = \App\Models\AiAssessment::first();
>>> echo 'AiAssessment loaded: ' . ($assessment ? 'YES' : 'NO');
>>> echo 'Has violations: ' . ($assessment->violations ? 'YES' : 'NO');
>>> echo 'Has correctiveFeedback: ' . ($assessment->correctiveFeedback ? 'YES' : 'NO');
```

**Expected Output:**
```
AiAssessment loaded: YES
Has violations: YES
Has correctiveFeedback: YES
```

---

## ✅ Step 6: Configuration Verification

### Check Environment Variables
```bash
php artisan tinker
>>> echo 'GEMINI_API_KEY: ' . (env('GEMINI_API_KEY') ? 'SET' : 'NOT SET');
>>> echo 'QUEUE_CONNECTION: ' . env('QUEUE_CONNECTION');
>>> echo 'DB_CONNECTION: ' . env('DB_CONNECTION');
```

**Expected Output:**
```
GEMINI_API_KEY: SET
QUEUE_CONNECTION: database
DB_CONNECTION: mysql
```

### Check Services Config
```bash
php artisan tinker
>>> $config = config('services.gemini');
>>> echo 'Gemini config: ' . ($config ? 'SET' : 'NOT SET');
```

**Expected Output:**
```
Gemini config: SET
```

---

## ✅ Step 7: Unit Tests Verification

### Run Scoring Engine Tests
```bash
php artisan test tests/Unit/ScoringEngineTest.php
```

**Expected Output:**
```
✓ test_perfect_submission
✓ test_hard_rule_violation
✓ test_poor_nutrition
✓ test_poor_sanitation
✓ test_multiple_violations
✓ test_corrective_feedback_generation
✓ test_status_determination

7 tests passed
```

---

## ✅ Step 8: End-to-End Flow Verification

### 1. Create a New Submission
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
      {"ingredient_name": "Ayam", "quantity_gram": 150, "category": "protein"},
      {"ingredient_name": "Nasi", "quantity_gram": 200, "category": "carbs"},
      {"ingredient_name": "Sayur", "quantity_gram": 100, "category": "vegetables"},
      {"ingredient_name": "Buah", "quantity_gram": 100, "category": "fruits"}
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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 23
  },
  "message": "Submission berhasil. AI sedang menganalisis..."
}
```

### 2. Check Status (Processing)
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/23/status"
```

**Expected Response (while processing):**
```json
{
  "success": true,
  "data": {
    "id": 23,
    "status": "processing",
    "ai_assessment": null
  }
}
```

### 3. Wait for Queue to Process
```bash
# In another terminal, run:
php artisan queue:work
```

### 4. Check Status (Completed)
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/23/status"
```

**Expected Response (after processing):**
```json
{
  "success": true,
  "data": {
    "id": 23,
    "status": "completed",
    "ai_assessment": {
      "id": 22,
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

### 5. Get Full Details
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/23"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 23,
    "sppg_id": 1,
    "menu_name": "Test Menu",
    "status": "completed",
    "ai_assessment": {
      "id": 22,
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

## ✅ Final Verification Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Database | ✅ | All tables created and migrated |
| Models | ✅ | All models with relationships |
| Services | ✅ | ScoringEngine, GeminiService, GeminiResponseParser |
| Jobs | ✅ | ProcessMealAnalysis queue job |
| Controllers | ✅ | All API controllers implemented |
| Routes | ✅ | All API routes configured |
| Queue | ✅ | Database queue configured |
| Gemini | ✅ | API key configured |
| Tests | ✅ | Unit tests passing |
| Demo Data | ✅ | 22 submissions with scoring |
| Documentation | ✅ | Complete documentation |

---

## 🎯 If All Checks Pass

✅ **Your NutriGuard backend is fully operational and ready for:**
- Frontend integration
- Production deployment
- Further development
- Testing with real data

---

## ❌ If Any Check Fails

1. **Database Issues:**
   ```bash
   php artisan migrate:fresh
   php artisan db:seed --class=DemoSeeder
   ```

2. **Queue Issues:**
   ```bash
   php artisan queue:table
   php artisan migrate
   php artisan queue:work
   ```

3. **Service Issues:**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   ```

4. **API Issues:**
   ```bash
   php artisan serve --port=8000
   ```

---

## 📞 Support

For detailed information, refer to:
- `PROJECT_STATUS_REPORT.md` - Complete project status
- `SCORING_ENGINE.md` - Scoring logic
- `GEMINI_INTEGRATION.md` - Gemini integration
- `QUICK_START_PHASE6.md` - Quick reference
- `TESTING_GUIDE.md` - Testing guide

---

*Last Updated: May 16, 2026*
