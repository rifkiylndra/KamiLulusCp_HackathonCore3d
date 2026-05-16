# 🧪 Testing Checklist - NutriGuard Full Stack

## ✅ Pre-Testing Setup

### Backend
- [ ] Database: `nutriguard_mbg` created
- [ ] Migrations: `php artisan migrate`
- [ ] Seeding: `php artisan db:seed`
- [ ] Server: `php artisan serve` (port 8000)
- [ ] Logs: Check `backend/storage/logs/laravel.log`

### Frontend
- [ ] Dependencies: `npm install` (fixed React 18)
- [ ] .env: `VITE_API_URL=http://localhost:8000`
- [ ] Vite config: Proxy configured
- [ ] Server: `npm run dev` (port 5173)

### Queue (Optional)
- [ ] Worker: `php artisan queue:work`

---

## 🧪 Test Cases

### Test 1: API Health Check
```bash
curl http://localhost:8000/api/sppg
```
**Expected**: JSON array with SPPG data
**Status**: ⬜

### Test 2: Frontend Loading
```
Open: http://localhost:5173
```
**Expected**: Frontend loads, no CORS errors
**Status**: ⬜

### Test 3: Get SPPG List
**Action**: Frontend loads SPPG dropdown
**Expected**: List of schools displayed
**Status**: ⬜

### Test 4: Submit Meal Form
**Action**: 
1. Select SPPG
2. Fill menu items
3. Fill sanitation checks
4. Submit

**Expected**: 
- Form validates
- Submission created
- Status shows "processing"

**Status**: ⬜

### Test 5: Image Upload
**Action**: Upload image with submission
**Expected**: Image uploaded successfully
**Status**: ⬜

### Test 6: Gemini API Call
**Action**: Monitor backend logs during submission
**Expected**: 
- Gemini API called
- Response parsed
- No errors in logs

**Status**: ⬜

### Test 7: Scoring Engine
**Action**: Check AI assessment results
**Expected**:
- Nutrition score: 0-100
- Safety score: 0-100
- Sanitation score: 0-100
- Final score: 0-100
- Status: AMAN/PERHATIAN/BAHAYA

**Status**: ⬜

### Test 8: Result Display
**Action**: View result page
**Expected**:
- Scores displayed
- Violations listed
- Corrective feedback shown
- Status indicator visible

**Status**: ⬜

### Test 9: Dashboard Stats
**Action**: Check dashboard
**Expected**:
- Total submissions count
- AMAN/PERHATIAN/BAHAYA breakdown
- Recent submissions listed

**Status**: ⬜

### Test 10: Polling
**Action**: Monitor status updates
**Expected**:
- Frontend polls every 2 seconds
- Status updates when processing complete
- Results display automatically

**Status**: ⬜

---

## 🔍 Debugging Checklist

### If CORS Error
- [ ] Backend running on 8000
- [ ] Frontend .env has correct API_URL
- [ ] Vite proxy configured
- [ ] Restart frontend

### If API Error
- [ ] Check backend logs: `tail -f backend/storage/logs/laravel.log`
- [ ] Verify database connection
- [ ] Check GEMINI_API_KEY in .env

### If Gemini Error
- [ ] Check Gemini logs: `tail -f backend/storage/logs/gemini.log`
- [ ] Verify API key is valid
- [ ] Check network connectivity

### If Image Upload Error
- [ ] Check storage permissions
- [ ] Run: `php artisan storage:link`
- [ ] Verify file size < 5MB

### If Queue Not Processing
- [ ] Run: `php artisan queue:work`
- [ ] Check queue table: `SELECT * FROM jobs;`

---

## 📊 Expected Results

### Successful Flow
```
1. Frontend submits form ✓
2. Backend validates ✓
3. Data saved to database ✓
4. Queue job dispatched ✓
5. Frontend polls status ✓
6. Queue worker processes ✓
7. Gemini API called ✓
8. Scoring engine runs ✓
9. Results saved ✓
10. Frontend displays results ✓
```

### Response Format
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
  "message": "Success"
}
```

---

## 📝 Test Report

**Date**: ___________
**Tester**: ___________
**Environment**: Local

### Results
- Test 1 (API Health): ⬜ Pass / ❌ Fail
- Test 2 (Frontend Load): ⬜ Pass / ❌ Fail
- Test 3 (SPPG List): ⬜ Pass / ❌ Fail
- Test 4 (Submit Form): ⬜ Pass / ❌ Fail
- Test 5 (Image Upload): ⬜ Pass / ❌ Fail
- Test 6 (Gemini Call): ⬜ Pass / ❌ Fail
- Test 7 (Scoring): ⬜ Pass / ❌ Fail
- Test 8 (Result Display): ⬜ Pass / ❌ Fail
- Test 9 (Dashboard): ⬜ Pass / ❌ Fail
- Test 10 (Polling): ⬜ Pass / ❌ Fail

### Issues Found
1. ___________
2. ___________
3. ___________

### Notes
___________

---

## 🚀 Ready to Test!

**Checklist**:
- [ ] Backend running
- [ ] Frontend running
- [ ] Database ready
- [ ] All dependencies installed
- [ ] .env configured
- [ ] No port conflicts

**Start Testing**: http://localhost:5173
