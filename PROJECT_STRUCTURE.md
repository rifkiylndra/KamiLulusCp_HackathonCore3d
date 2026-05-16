# 📁 Project Structure - NutriGuard MBG

Penjelasan struktur folder dan file project.

---

## 📂 Root Directory

```
KamiLulusCp_HackathonCore3d/
├── backend/                          # Laravel Backend
├── frontend/                         # React Frontend
├── docs/                             # Documentation
├── .git/                             # Git repository
├── .github/                          # GitHub workflows
├── .gitignore                        # Git ignore rules
├── composer.json                     # Root composer config
├── composer.lock                     # Composer lock file
├── RUN_NOW.md                        # ⚡ Quick start
├── QUICK_RUN_GUIDE.md               # Quick setup guide
├── FULL_STACK_SETUP_GUIDE.md        # Detailed setup
├── FRONTEND_BACKEND_INTEGRATION.md  # API integration
├── SETUP_SUMMARY.md                 # Setup summary
├── PROJECT_STRUCTURE.md             # This file
└── [Other documentation files]
```

---

## 🔙 Backend Structure

```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       └── ReprocessMealAnalysis.php    # Reprocess command
│   ├── DTOs/
│   │   └── ScoringResult.php               # Scoring result DTO
│   ├── Exceptions/
│   │   └── Handler.php                     # Global exception handler
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── MealSubmissionController.php
│   │   │       ├── DashboardController.php
│   │   │       ├── SppgController.php
│   │   │       └── ScoringTestController.php
│   │   ├── Requests/
│   │   │   └── StoreMealSubmissionRequest.php
│   │   └── Resources/
│   │       ├── MealSubmissionResource.php
│   │       └── AiAssessmentResource.php
│   ├── Jobs/
│   │   └── ProcessMealAnalysis.php         # Queue job
│   ├── Models/
│   │   ├── Sppg.php
│   │   ├── MealSubmission.php
│   │   ├── MenuItem.php
│   │   ├── SanitationCheck.php
│   │   ├── AiAssessment.php
│   │   ├── Violation.php
│   │   ├── CorrectiveFeedback.php
│   │   └── User.php
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Services/
│       ├── ScoringEngine.php               # Scoring logic
│       ├── GeminiService.php               # Gemini API integration
│       └── GeminiResponseParser.php        # JSON parsing
├── bootstrap/
│   ├── app.php                             # App bootstrap
│   ├── cache/
│   │   ├── packages.php
│   │   └── services.php
│   └── providers.php
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── cors.php                            # CORS configuration
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   └── [other configs]
├── database/
│   ├── factories/
│   │   ├── SppgFactory.php
│   │   ├── MealSubmissionFactory.php
│   │   ├── MenuItemFactory.php
│   │   ├── SanitationCheckFactory.php
│   │   ├── AiAssessmentFactory.php
│   │   ├── ViolationFactory.php
│   │   └── CorrectiveFeedbackFactory.php
│   ├── migrations/
│   │   ├── 2026_05_16_055101_create_sppg_table.php
│   │   ├── 2026_05_16_055102_create_meal_submissions_table.php
│   │   ├── 2026_05_16_055102_create_menu_items_table.php
│   │   ├── 2026_05_16_055102_create_sanitation_checks_table.php
│   │   ├── 2026_05_16_055103_create_ai_assessments_table.php
│   │   ├── 2026_05_16_055103_create_violations_table.php
│   │   └── 2026_05_16_055104_create_corrective_feedbacks_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── DemoSeeder.php
├── routes/
│   ├── api.php                             # API routes
│   ├── console.php
│   └── web.php
├── storage/
│   ├── app/
│   │   ├── public/
│   │   │   └── submissions/                # Uploaded images
│   │   └── [other storage]
│   └── logs/
│       └── laravel.log                     # Application logs
├── tests/
│   ├── Unit/
│   │   └── ScoringEngineTest.php          # Scoring tests
│   └── Feature/
├── .env                                    # Environment variables
├── .env.example                            # Example env
├── .editorconfig
├── .gitignore
├── artisan                                 # Artisan CLI
├── composer.json
├── composer.lock
└── phpunit.xml
```

---

## 🎨 Frontend Structure

```
frontend/
├── src/
│   ├── components/                         # React components
│   ├── pages/                              # Page components
│   ├── services/                           # API services
│   ├── hooks/                              # Custom hooks
│   ├── utils/                              # Utility functions
│   ├── styles/                             # CSS/styling
│   ├── App.jsx                             # Main app component
│   └── main.jsx                            # Entry point
├── public/                                 # Static assets
├── index.html                              # HTML template
├── vite.config.js                          # Vite configuration
├── eslint.config.js                        # ESLint configuration
├── package.json                            # Dependencies
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 📚 Documentation Files

### Setup & Getting Started
- **RUN_NOW.md** - Quick start (5 minutes)
- **QUICK_RUN_GUIDE.md** - Quick setup with checklist
- **FULL_STACK_SETUP_GUIDE.md** - Detailed setup guide
- **SETUP_SUMMARY.md** - Setup summary & reference

### Integration & Development
- **FRONTEND_BACKEND_INTEGRATION.md** - API integration guide
- **PROJECT_STRUCTURE.md** - This file

### Verification & Reports
- **VERIFICATION_REPORT_PROMPT_1A.md** - Database schema verification
- **VERIFICATION_REPORT_PROMPT_1B.md** - API endpoints verification
- **VERIFICATION_REPORT_PROMPT_1C.md** - Scoring engine verification
- **VERIFICATION_REPORT_PROMPT_1D.md** - Queue job & Gemini verification
- **FEATURE_CORRECTIVE_FEEDBACK_REPORT.md** - AI feedback feature

### Deployment & Reference
- **PHASE_9_DEPLOYMENT_GUIDE.md** - Deployment instructions
- **TESTING_GUIDE.md** - Testing procedures
- **PHASE_9_TESTING_CHECKLIST.md** - Testing checklist

---

## 🗄️ Database Schema

### Tables

#### 1. `sppg`
School/Institution data
```
id, name, location, coordinator_name, coordinator_phone, created_at, updated_at
```

#### 2. `meal_submissions`
Meal submission records
```
id, sppg_id, status, image_path, cook_start_at, serve_planned_at, distribute_at, created_at, updated_at
```

#### 3. `menu_items`
Menu items per submission
```
id, meal_submission_id, name, portion_count, ingredients, created_at, updated_at
```

#### 4. `sanitation_checks`
Sanitation parameters
```
id, meal_submission_id, apd_used, kitchen_cleaned, storage_type, ingredient_condition, supplier_source, created_at, updated_at
```

#### 5. `ai_assessments`
AI scoring results
```
id, meal_submission_id, nutrition_score, safety_score, sanitation_score, final_score, status, nutrition_analysis, safety_analysis, created_at, updated_at
```

#### 6. `violations`
Violations found
```
id, ai_assessment_id, type, severity, description, created_at, updated_at
```

#### 7. `corrective_feedbacks`
AI recommendations
```
id, ai_assessment_id, immediate_actions, tomorrow_improvements, routine_notes, generated_at, created_at, updated_at
```

---

## 🔌 API Routes

### SPPG Routes
```
GET    /api/sppg              - List all SPPG
POST   /api/sppg              - Create new SPPG
```

### Meal Submission Routes
```
POST   /api/submissions       - Submit meal
GET    /api/submissions       - List submissions
GET    /api/submissions/{id}  - Get submission detail
GET    /api/submissions/{id}/status - Get submission status
```

### Dashboard Routes
```
GET    /api/dashboard/stats   - Dashboard statistics
GET    /api/dashboard/recent-sppg - Recent SPPG
```

### Testing Routes
```
POST   /api/scoring-test      - Test scoring engine
POST   /api/gemini-test       - Test Gemini integration
```

---

## 🔧 Key Files Explained

### Backend

**`app/Services/ScoringEngine.php`**
- Main scoring logic
- Hard rules checking
- Nutrition, safety, sanitation scoring
- Violation generation
- Corrective feedback generation

**`app/Services/GeminiService.php`**
- Gemini API integration
- Nutrition analysis
- Image analysis
- Response handling

**`app/Jobs/ProcessMealAnalysis.php`**
- Queue job for async processing
- Calls Gemini API
- Runs scoring engine
- Saves results to database

**`app/Http/Controllers/Api/MealSubmissionController.php`**
- Handles meal submission endpoints
- Validation
- Job dispatching
- Response formatting

**`routes/api.php`**
- All API route definitions
- Middleware configuration
- Route grouping

### Frontend

**`src/services/api.js`**
- API client configuration
- Endpoint definitions
- Request/response handling

**`src/components/SubmissionForm.jsx`**
- Meal submission form
- Image upload
- Form validation

**`src/pages/Dashboard.jsx`**
- Dashboard page
- Statistics display
- Submission list

---

## 🚀 Deployment Structure

### Backend Deployment (Railway)
```
Environment Variables:
- APP_ENV=production
- APP_DEBUG=false
- APP_URL=https://api.yourdomain.com
- DB_HOST=railway-mysql-host
- DB_DATABASE=nutriguard_mbg
- GEMINI_API_KEY=your-key
```

### Frontend Deployment (Vercel)
```
Environment Variables:
- REACT_APP_API_URL=https://api.yourdomain.com
```

---

## 📊 Development Workflow

```
1. Frontend (React)
   ↓ (HTTP Request)
2. Backend API (Laravel)
   ↓ (Validation & Processing)
3. Database (MySQL)
   ↓ (Store data)
4. Queue Job (ProcessMealAnalysis)
   ↓ (Async processing)
5. Gemini API
   ↓ (AI Analysis)
6. Scoring Engine
   ↓ (Calculate scores)
7. Database (Save results)
   ↓ (Update status)
8. Frontend (Polling)
   ↓ (Get results)
9. User (View results)
```

---

## 🔐 Security Considerations

- **CORS**: Configured for localhost and production domains
- **Validation**: Form requests validate all inputs
- **Authentication**: Ready for implementation
- **Image Upload**: File type and size validation
- **API Keys**: Stored in .env (not in code)
- **Database**: Prepared statements via Eloquent ORM

---

## 📈 Performance Optimization

- **Queue Jobs**: Async processing for AI analysis
- **Database Indexes**: On foreign keys and query columns
- **Caching**: Database cache for sessions
- **Image Optimization**: Stored with unique filenames
- **Response Format**: Consistent JSON format

---

## 🧪 Testing

**Unit Tests**: `tests/Unit/ScoringEngineTest.php`
- 7 test cases covering all scoring scenarios

**Manual Testing**: Use Postman or frontend UI
- Test all API endpoints
- Test full workflow
- Test error handling

---

## 📝 Git Workflow

**Branch**: `feat/be-api-endpoints`

**Commits**:
- Backend implementation
- Database schema
- API endpoints
- Scoring engine
- Gemini integration
- Documentation

**Push**: All changes pushed to GitHub

---

## 🎯 Next Steps

1. ✅ Setup database
2. ✅ Setup backend
3. ✅ Setup frontend
4. ✅ Run servers
5. ✅ Test API
6. ✅ Test full workflow
7. 📦 Deploy to production

---

**Happy coding! 🚀**
