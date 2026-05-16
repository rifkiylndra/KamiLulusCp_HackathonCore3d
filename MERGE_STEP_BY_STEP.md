# 🔀 Merge Step-by-Step - Gabungkan Semua Branch

**Panduan langkah demi langkah untuk merge AI, FE, dan BE.**

---

## 📊 Branch yang Ada

```
✅ feat/be-api-endpoints (Backend - Current)
✅ feat/ai-prompt-gemini (AI Implementation)
✅ feat/fe-result-page (Frontend Result Page)
✅ feat/fe-input-form (Frontend Input Form)
✅ feat/fullstack-integration (Frontend Integration)
```

---

## 🎯 Urutan Merge

1. **AI** (feat/ai-prompt-gemini) → Backend
2. **FE Result** (feat/fe-result-page) → Backend
3. **FE Input** (feat/fe-input-form) → Backend
4. **FE Integration** (feat/fullstack-integration) → Backend

---

## 🚀 Langkah-Langkah

### STEP 1: Backup Current Branch

```bash
git branch -c feat/be-api-endpoints feat/be-api-endpoints-backup
```

**Verifikasi:**
```bash
git branch
```

Expected: Melihat `feat/be-api-endpoints-backup`

---

### STEP 2: Update Current Branch

```bash
git checkout feat/be-api-endpoints
git pull origin feat/be-api-endpoints
git status
```

Expected: "Your branch is up to date with 'origin/feat/be-api-endpoints'"

---

### STEP 3: Merge AI Branch

```bash
git merge origin/feat/ai-prompt-gemini --no-ff -m "merge: integrate AI implementation from feat/ai-prompt-gemini"
```

**Jika ada conflict:**
```bash
git status
```

Lihat file mana yang conflict, kemudian:
- Buka file tersebut
- Cari `<<<<<<< HEAD` dan `>>>>>>> origin/feat/ai-prompt-gemini`
- Pilih code yang benar
- Hapus marker conflict

Setelah resolve:
```bash
git add .
git commit -m "resolve: merge conflicts from AI branch"
```

**Jika tidak ada conflict:**
```bash
git log --oneline -5
```

Expected: Melihat merge commit

---

### STEP 4: Merge FE Result Page

```bash
git merge origin/feat/fe-result-page --no-ff -m "merge: integrate frontend result page from feat/fe-result-page"
```

**Jika ada conflict:**
```bash
git status
# Resolve conflicts
git add .
git commit -m "resolve: merge conflicts from FE result page"
```

---

### STEP 5: Merge FE Input Form

```bash
git merge origin/feat/fe-input-form --no-ff -m "merge: integrate frontend input form from feat/fe-input-form"
```

**Jika ada conflict:**
```bash
git status
# Resolve conflicts
git add .
git commit -m "resolve: merge conflicts from FE input form"
```

---

### STEP 6: Merge FE Integration

```bash
git merge origin/feat/fullstack-integration --no-ff -m "merge: integrate frontend fullstack integration from feat/fullstack-integration"
```

**Jika ada conflict:**
```bash
git status
# Resolve conflicts
git add .
git commit -m "resolve: merge conflicts from FE integration"
```

---

### STEP 7: Verify Merge

```bash
git log --oneline -10
```

Expected: Melihat 4 merge commits

```bash
git status
```

Expected: "nothing to commit, working tree clean"

---

### STEP 8: Push ke Remote

```bash
git push origin feat/be-api-endpoints
```

Expected: "Everything up-to-date" atau "X commits"

---

## 🔍 Conflict Resolution

### Jika Ada Conflict di File

**1. Lihat conflict:**
```bash
git diff
```

**2. File akan terlihat seperti:**
```
<<<<<<< HEAD
// Backend code
=======
// AI/FE code
>>>>>>> origin/feat/ai-prompt-gemini
```

**3. Pilih mana yang mau dipakai:**

**Option A: Gunakan HEAD (Backend)**
```
// Backend code
```

**Option B: Gunakan incoming (AI/FE)**
```
// AI/FE code
```

**Option C: Merge keduanya**
```
// Backend code
// AI/FE code
```

**4. Selesaikan:**
```bash
git add .
git commit -m "resolve: merge conflicts"
```

---

## 📋 Common Conflicts

### Conflict 1: package.json (Frontend)

**Masalah**: Dependencies berbeda

**Solusi**: Merge dependencies
```json
{
  "dependencies": {
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "axios": "^1.6.0"  // Dari FE
  }
}
```

### Conflict 2: .env atau .env.example

**Masalah**: Environment variables berbeda

**Solusi**: Gunakan backend .env, tambahkan FE config
```env
# Backend
APP_ENV=local
GEMINI_API_KEY=...

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### Conflict 3: routes/api.php

**Masalah**: Routes berbeda

**Solusi**: Merge semua routes
```php
// Backend routes
Route::post('/submissions', [MealSubmissionController::class, 'store']);

// AI routes (jika ada)
Route::post('/gemini-test', [GeminiTestController::class, 'test']);
```

### Conflict 4: Frontend Components

**Masalah**: Component structure berbeda

**Solusi**: Merge folder structure
```
frontend/src/
├── components/
│   ├── SubmissionForm.jsx (dari input-form)
│   ├── ResultPage.jsx (dari result-page)
│   └── Integration.jsx (dari fullstack-integration)
```

---

## ✅ Verification After Merge

### 1. Check Git Log
```bash
git log --oneline -15
```

Expected: Melihat merge commits

### 2. Check File Structure
```bash
# Backend
ls backend/app/Services/
ls backend/app/Http/Controllers/

# Frontend
ls frontend/src/components/
ls frontend/src/pages/
```

### 3. Check Dependencies
```bash
# Backend
cd backend
composer install

# Frontend
cd frontend
npm install
```

### 4. Run Tests
```bash
# Backend
cd backend
php artisan test

# Frontend
cd frontend
npm run lint
```

### 5. Start Servers
```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev
```

Expected: Kedua server running tanpa error

---

## 🚨 Jika Ada Masalah

### Merge Gagal - Cancel Merge
```bash
git merge --abort
```

### Sudah Merge tapi Mau Undo
```bash
git reset --hard HEAD~1
```

### Conflict Terlalu Kompleks
```bash
# Gunakan backup
git reset --hard feat/be-api-endpoints-backup
```

---

## 📊 Merge Checklist

- [ ] Backup branch: `git branch -c feat/be-api-endpoints feat/be-api-endpoints-backup`
- [ ] Update branch: `git pull origin feat/be-api-endpoints`
- [ ] Merge AI: `git merge origin/feat/ai-prompt-gemini`
- [ ] Resolve conflicts (jika ada)
- [ ] Merge FE Result: `git merge origin/feat/fe-result-page`
- [ ] Resolve conflicts (jika ada)
- [ ] Merge FE Input: `git merge origin/feat/fe-input-form`
- [ ] Resolve conflicts (jika ada)
- [ ] Merge FE Integration: `git merge origin/feat/fullstack-integration`
- [ ] Resolve conflicts (jika ada)
- [ ] Verify: `git log --oneline -10`
- [ ] Push: `git push origin feat/be-api-endpoints`
- [ ] Test full stack
- [ ] Verify no errors

---

## 🎯 Expected Result

Setelah merge semua branch:

```
feat/be-api-endpoints (Main Branch)
├── backend/
│   ├── app/Services/
│   │   ├── ScoringEngine.php
│   │   ├── GeminiService.php
│   │   └── GeminiResponseParser.php
│   ├── app/Http/Controllers/Api/
│   │   ├── MealSubmissionController.php
│   │   ├── DashboardController.php
│   │   └── SppgController.php
│   └── routes/api.php
├── frontend/
│   ├── src/components/
│   │   ├── SubmissionForm.jsx
│   │   ├── ResultPage.jsx
│   │   └── Integration.jsx
│   ├── src/pages/
│   └── package.json
└── [Documentation files]
```

---

## 🚀 Next Steps

1. Follow merge steps di atas
2. Resolve conflicts jika ada
3. Test full stack
4. Push ke remote
5. Verify di GitHub
6. Ready untuk deployment

---

## 📞 Quick Commands Reference

```bash
# Backup
git branch -c feat/be-api-endpoints feat/be-api-endpoints-backup

# Update
git checkout feat/be-api-endpoints
git pull origin feat/be-api-endpoints

# Merge
git merge origin/feat/ai-prompt-gemini --no-ff -m "merge: AI"
git merge origin/feat/fe-result-page --no-ff -m "merge: FE Result"
git merge origin/feat/fe-input-form --no-ff -m "merge: FE Input"
git merge origin/feat/fullstack-integration --no-ff -m "merge: FE Integration"

# Verify
git log --oneline -10
git status

# Push
git push origin feat/be-api-endpoints
```

---

**Status**: Ready to merge
**Estimated Time**: 30-60 minutes
**Risk Level**: Low (backup tersedia)

**Mari mulai merge! 🚀**
