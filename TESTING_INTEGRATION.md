# 🧪 Testing Integration - NutriGuard Full Stack

**Panduan testing untuk memastikan FE, BE, dan AI terintegrasi sempurna.**

---

## ✅ Pre-Testing Checklist

- [ ] Database created: `nutriguard_mbg`
- [ ] Backend dependencies installed: `composer install`
- [ ] Frontend dependencies installed: `npm install`
- [ ] .env configured with GEMINI_API_KEY
- [ ] MySQL running
- [ ] No port conflicts (8000, 5173)

---

## 🚀 Setup & Run

### Terminal 1: Backend
```bash
cd backend
php artisan migrate
php artisan db:seed
php artisan serve
```

Expected: "Server running on http://127.0.0.1:8000"

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

Expected: "Local: http://localhost:5173"

### Terminal 3: Queue Worker (Optional)
```bash
cd backend
php artisan queue:work
```

---

## 🧪 Test Cases

### Test 1: API Health Check
```bash
curl http://localhost:8000/api/sppg
```

Expected: JSON array with SPPG data

### Test 2: Frontend Loading
```
Open: http://localhost:5173
```

Expected: Frontend loads without errors

### Test 3: Submit Meal (Full Flow)
1. Open frontend
2. Fill submission form
3. Upload image (optional)
4. Submit
5. Monitor backend console
6. Check polling status
7. View results

### Test 4: Dashboard Stats
```bash
curl http://localhost:8000/api/dashboard/stats
```

Expected: JSON with stats

### Test 5: Gemini Integration
1. Submit meal with image
2. Check backend logs: `tail -f backend/storage/logs/laravel.log`
3. Verify Gemini API call
4. Check response parsing
5. Verify scoring results

---

## 📊 Expected Results

### Successful Submission Flow
```
1. Frontend sends POST /api/submissions
2. Backend validates and stores
3. Backend dispatches ProcessMealAnalysis job
4. Frontend polls /api/submissions/{id}/status
5. Queue worker processes job
6. Gemini API called
7. Scoring engine runs
8. Results saved to database
9. Frontend receives results
10. Results displayed to user
```

### Expected Response Format
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "ai_assessment": {
      "nutrition_score": 85,
      "safety_score": 90,
      "sanitation_score": 88,
      "final_score": 87.4,
      "status": "AMAN"
    },
    "violations": [...],
    "corrective_feedback": {...}
  },
  "message": "Submission status retrieved successfully"
}
```

---

## 🔍 Debugging

### Check Backend Logs
```bash
tail -f backend/storage/logs/laravel.log
```

### Check Gemini Logs
```bash
tail -f backend/storage/logs/gemini.log
```

### Check Frontend Console
Press F12 → Console tab

### Check Network Requests
Press F12 → Network tab → Submit meal

### Check Database
```bash
mysql -u root -p nutriguard_mbg
SELECT * FROM meal_submissions;
SELECT * FROM ai_assessments;
```

---

## ⚠️ Common Issues

### Issue: CORS Error
**Solution**: Restart backend, verify FRONTEND_URL in .env

### Issue: Gemini API Error
**Solution**: Check GEMINI_API_KEY in .env, verify API key is valid

### Issue: Queue Job Not Processing
**Solution**: Run `php artisan queue:work` in separate terminal

### Issue: Image Upload Failed
**Solution**: Check storage permissions, run `php artisan storage:link`

### Issue: Polling Timeout
**Solution**: Check queue worker, verify Gemini API response

---

## 📈 Performance Metrics

- **API Response Time**: < 1 second
- **Gemini Processing Time**: 5-15 seconds
- **Total Processing Time**: < 30 seconds
- **Polling Interval**: 2 seconds
- **Max Polling Attempts**: 30 (60 seconds timeout)

---

## ✅ Verification Checklist

- [ ] Backend API responding
- [ ] Frontend loading
- [ ] SPPG list displaying
- [ ] Form submission working
- [ ] Image upload working
- [ ] Gemini API called
- [ ] Scoring engine running
- [ ] Results displaying
- [ ] Polling working
- [ ] No console errors
- [ ] No network errors
- [ ] Database updated
- [ ] All statuses correct

---

## 🎯 Test Scenarios

### Scenario 1: Perfect Meal
- All nutrition requirements met
- Good sanitation
- No violations
- Expected: AMAN status

### Scenario 2: Poor Nutrition
- Low protein
- Few vegetables
- Expected: PERHATIAN status

### Scenario 3: Safety Issue
- Food holding time > 4 hours
- Expected: BAHAYA status

### Scenario 4: Image Analysis
- Submit with image
- Verify image analysis
- Check visual quality score

---

## 📝 Test Report Template

```
Date: [Date]
Tester: [Name]
Environment: Local

Test Results:
- Backend API: ✅/❌
- Frontend Loading: ✅/❌
- Form Submission: ✅/❌
- Image Upload: ✅/❌
- Gemini Integration: ✅/❌
- Scoring Engine: ✅/❌
- Results Display: ✅/❌
- Polling: ✅/❌

Issues Found:
1. [Issue]
2. [Issue]

Notes:
[Additional notes]
```

---

## 🚀 Next Steps

1. Run all test cases
2. Document results
3. Fix any issues
4. Re-test
5. Deploy to production

---

**Status**: Ready for testing
**Last Updated**: May 16, 2026
