# 🚀 Getting Started - NutriGuard Backend

Welcome to the NutriGuard Hackathon Backend! This guide will help you get up and running in minutes.

---

## 📋 Prerequisites

- PHP 8.2+
- MySQL 8.0+
- Composer
- Node.js (optional, for frontend)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
composer install
```

### Step 3: Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### Step 4: Configure Database
Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutriguard_mbg
DB_USERNAME=root
DB_PASSWORD=
```

### Step 5: Run Migrations
```bash
php artisan migrate
```

### Step 6: Seed Demo Data
```bash
php artisan db:seed --class=DemoSeeder
```

### Step 7: Start Development Server
```bash
php artisan serve --port=8000
```

### Step 8: Start Queue Worker (in another terminal)
```bash
php artisan queue:work
```

### Step 9: Test the API
```bash
curl -X GET "http://127.0.0.1:8000/api/dashboard/stats"
```

**Done!** Your backend is now running. 🎉

---

## 📚 What's Included

### ✅ Complete API
- SPPG management (Create, Read, Update, Delete)
- Meal submission handling
- Dashboard statistics
- Scoring test endpoints

### ✅ Scoring Engine
- Hard rule validation
- Nutrition, Safety, Sanitation scoring
- Automatic status determination (AMAN, PERHATIAN, BAHAYA)
- Violation tracking
- Corrective feedback generation

### ✅ AI Integration
- Gemini API integration
- Nutrition analysis
- Image analysis
- Automatic response parsing

### ✅ Queue System
- Asynchronous job processing
- Non-blocking API responses
- Automatic retry on failure

### ✅ Demo Data
- 5 SPPG in Padang
- 22 meal submissions
- Complete scoring results
- All status types represented

---

## 🔌 API Endpoints

### SPPG Management
```
GET    /api/sppg              - List all SPPG
POST   /api/sppg              - Create SPPG
GET    /api/sppg/{id}         - Get SPPG details
PUT    /api/sppg/{id}         - Update SPPG
DELETE /api/sppg/{id}         - Delete SPPG
```

### Meal Submissions
```
POST   /api/submissions        - Create submission
GET    /api/submissions        - List submissions
GET    /api/submissions/{id}   - Get submission details
GET    /api/submissions/{id}/status - Check status
```

### Dashboard
```
GET    /api/dashboard/stats    - Dashboard statistics
GET    /api/dashboard/recent-sppg - Recent SPPG
```

### Testing
```
GET    /api/scoring-test/perfect              - Perfect submission
GET    /api/scoring-test/hard-rule-violation  - Hard rule violation
GET    /api/scoring-test/poor-nutrition       - Poor nutrition
GET    /api/scoring-test/poor-sanitation      - Poor sanitation
```

---

## 🧪 Testing the API

### 1. Get Dashboard Stats
```bash
curl -X GET "http://127.0.0.1:8000/api/dashboard/stats"
```

### 2. List SPPG
```bash
curl -X GET "http://127.0.0.1:8000/api/sppg"
```

### 3. List Submissions
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions"
```

### 4. Get Submission Details
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/1"
```

### 5. Check Submission Status
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/1/status"
```

### 6. Test Scoring (Perfect)
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/perfect"
```

### 7. Test Scoring (Hard Rule Violation)
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/hard-rule-violation"
```

### 8. Create New Submission
```bash
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "sppg_id": 1,
    "menu_name": "Nasi Kuning",
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

---

## 📊 Understanding the Scoring System

### Status Levels
- **AMAN** (Safe) - Score ≥ 75
- **PERHATIAN** (Attention) - Score 60-74
- **BAHAYA** (Danger) - Score < 60

### Scoring Weights
- **Nutrition (40%)** - Menu variety, protein, carbs, vegetables, fruits
- **Safety (40%)** - Food handling, storage, supplier compliance
- **Sanitation (20%)** - Hygiene, kitchen cleanliness, APD usage

### Hard Rules
- Holding time > 4 hours = BAHAYA (immediate action required)
- APD not used = Safety violation
- Poor storage = Safety violation

---

## 🔧 Configuration

### Environment Variables (.env)
```env
# App
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutriguard_mbg
DB_USERNAME=root
DB_PASSWORD=

# Gemini API
GEMINI_API_KEY=your_api_key_here

# Queue
QUEUE_CONNECTION=database

# Session & Cache
SESSION_DRIVER=database
CACHE_STORE=database
```

### Queue Configuration
The queue is configured to use the database driver. Jobs are stored in the `jobs` table and processed by the queue worker.

```bash
# Start queue worker
php artisan queue:work

# Check failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── DTOs/                    # Data Transfer Objects
│   │   └── ScoringResult.php
│   ├── Http/
│   │   ├── Controllers/Api/     # API Controllers
│   │   │   ├── DashboardController.php
│   │   │   ├── MealSubmissionController.php
│   │   │   ├── ScoringTestController.php
│   │   │   └── SppgController.php
│   │   └── Requests/            # Form Requests
│   │       └── StoreMealSubmissionRequest.php
│   ├── Jobs/                    # Queue Jobs
│   │   └── ProcessMealAnalysis.php
│   ├── Models/                  # Database Models
│   │   ├── AiAssessment.php
│   │   ├── CorrectiveFeedback.php
│   │   ├── MealSubmission.php
│   │   ├── MenuItem.php
│   │   ├── SanitationCheck.php
│   │   ├── Sppg.php
│   │   ├── User.php
│   │   └── Violation.php
│   └── Services/                # Business Logic
│       ├── GeminiResponseParser.php
│       ├── GeminiService.php
│       └── ScoringEngine.php
├── database/
│   ├── factories/               # Model Factories
│   ├── migrations/              # Database Migrations
│   └── seeders/                 # Database Seeders
│       └── DemoSeeder.php
├── routes/
│   └── api.php                  # API Routes
├── tests/
│   └── Unit/
│       └── ScoringEngineTest.php
├── config/
│   └── services.php             # Service Configuration
└── storage/
    └── logs/                    # Application Logs
```

---

## 🧪 Running Tests

### Run All Tests
```bash
php artisan test
```

### Run Specific Test
```bash
php artisan test tests/Unit/ScoringEngineTest.php
```

### Run with Coverage
```bash
php artisan test --coverage
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `PROJECT_STATUS_REPORT.md` | Complete project overview |
| `VERIFICATION_CHECKLIST.md` | Verification steps |
| `SCORING_ENGINE.md` | Scoring logic documentation |
| `GEMINI_INTEGRATION.md` | Gemini API integration |
| `QUICK_START_PHASE6.md` | Quick reference |
| `TESTING_GUIDE.md` | Testing guide |

---

## 🐛 Troubleshooting

### Issue: "SQLSTATE[HY000]: General error: 1030 Got error..."
**Solution:** Run migrations
```bash
php artisan migrate
```

### Issue: "Class not found" errors
**Solution:** Clear cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Issue: Queue jobs not processing
**Solution:** Start queue worker
```bash
php artisan queue:work
```

### Issue: Gemini API errors
**Solution:** Check API key in .env
```env
GEMINI_API_KEY=your_valid_api_key
```

### Issue: Database connection error
**Solution:** Check .env database configuration
```env
DB_HOST=127.0.0.1
DB_DATABASE=nutriguard_mbg
DB_USERNAME=root
DB_PASSWORD=
```

---

## 🚀 Next Steps

### For Frontend Integration
1. Use the API endpoints documented above
2. Poll `/api/submissions/{id}/status` for processing status
3. Display results from `/api/submissions/{id}` when completed
4. Show violations and corrective feedback to users

### For Production Deployment
1. Set `APP_ENV=production` in .env
2. Configure Supervisor for queue:work
3. Set up error monitoring (Sentry, etc.)
4. Configure database backups
5. Set up rate limiting for Gemini API

### For Further Development
1. Add authentication (Laravel Sanctum)
2. Add authorization (Laravel Policies)
3. Add API rate limiting
4. Add request logging
5. Add performance monitoring

---

## 📞 Support

For detailed information, refer to:
- `PROJECT_STATUS_REPORT.md` - Complete project status
- `VERIFICATION_CHECKLIST.md` - Verification steps
- `SCORING_ENGINE.md` - Scoring logic
- `GEMINI_INTEGRATION.md` - Gemini integration
- `QUICK_START_PHASE6.md` - Quick reference
- `TESTING_GUIDE.md` - Testing guide

---

## ✅ Verification

To verify everything is working:

1. **Check migrations:**
   ```bash
   php artisan migrate:status
   ```

2. **Check data:**
   ```bash
   php artisan tinker
   >>> \App\Models\Sppg::count()
   >>> \App\Models\MealSubmission::count()
   ```

3. **Test API:**
   ```bash
   curl -X GET "http://127.0.0.1:8000/api/dashboard/stats"
   ```

4. **Run tests:**
   ```bash
   php artisan test
   ```

---

## 🎉 You're All Set!

Your NutriGuard backend is now ready to use. Start building amazing features!

**Happy coding!** 🚀

---

*Last Updated: May 16, 2026*
