# 🔀 Merge Branches Guide - Menggabungkan AI, FE, dan BE

**Panduan lengkap untuk merge semua branch ke satu branch utama.**

---

## 📊 Branch Status

```
feat/be-api-endpoints (Backend - Current)
feat/ai-prompt-gemini (AI Implementation)
feat/fe-result-page (Frontend Result Page)
feat/fe-input-form (Frontend Input Form)
feat/fe-fullstack-integration (Frontend Integration)
```

---

## 🎯 Strategi Merge

Kita akan merge semua branch ke satu branch utama dengan urutan:

1. **Backend** (feat/be-api-endpoints) - Base
2. **AI** (feat/ai-prompt-gemini) - Merge ke backend
3. **Frontend** (feat/fe-result-page) - Merge ke backend
4. **Frontend Input** (feat/fe-input-form) - Merge ke backend
5. **Frontend Integration** (feat/fe-fullstack-integration) - Merge ke backend

---

## 🚀 Step-by-Step Merge

### Step 1: Pastikan Backend Branch Bersih

```bash
git checkout feat/be-api-endpoints
git pull origin feat/be-api-endpoints
git status
```

Expected: "nothing to commit, working tree clean"

### Step 2: Merge AI Branch

```bash
git merge feat/ai-prompt-gemini --no-ff -m "merge: integrate AI implementation from feat/ai-prompt-gemini"
```

**Jika ada conflict:**
```bash
# Lihat conflict
git status

# Resolve conflict di file yang conflict
# Kemudian:
git add .
git commit -m "resolve: merge conflicts from AI branch"
```

### Step 3: Merge Frontend Result Page

```bash
git merge feat/fe-result-page --no-ff -m "merge: integrate frontend result page from feat/fe-result-page"
```

**Jika ada conflict:**
```bash
git status
# Resolve conflicts
git add .
git commit -m "resolve: merge conflicts from FE result page"
```

### Step 4: Merge Frontend Input Form

```bash
git merge feat/fe-input-form --no-ff -m "merge: integrate frontend input form from feat/fe-input-form"
```

**Jika ada conflict:**
```bash
git status
# Resolve conflicts
git add .
git commit -m "resolve: merge conflicts from FE input form"
```

### Step 5: Merge Frontend Integration

```bash
git merge feat/fe-fullstack-integration --no-ff -m "merge: integrate frontend fullstack integration from feat/fe-fullstack-integration"
```

**Jika ada conflict:**
```bash
git status
# Resolve conflicts
git add .
git commit -m "resolve: merge conflicts from FE integration"
```

### Step 6: Push ke Remote

```bash
git push origin feat/be-api-endpoints
```

---

## 🔍 Conflict Resolution Guide

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
>>>>>>> branch-name
```

**3. Pilih mana yang mau dipakai:**
- Hapus `<<<<<<< HEAD`, `=======`, `>>>>>>> branch-name`
- Pilih code yang benar

**4. Selesaikan:**
```bash
git add .
git commit -m "resolve: merge conflicts"
```

---

## 📋 Common Conflicts & Solutions

### Conflict 1: package.json (Frontend)
**Solusi**: Merge dependencies dari kedua branch
```json
{
  "dependencies": {
    // Dari backend
    // Dari frontend
  }
}
```

### Conflict 2: .env atau .env.example
**Solusi**: Gunakan backend .env, tambahkan frontend config jika ada

### Conflict 3: routes atau API endpoints
**Solusi**: Pastikan semua routes dari semua branch ada

### Conflict 4: Models atau Controllers
**Solusi**: Merge logic dari kedua branch

---

## ✅ Verification After Merge

### 1. Check Git Log
```bash
git log --oneline -10
```

Expected: Melihat merge commits dari semua branch

### 2. Check File Structure
```bash
# Backend files
ls backend/app/Services/
ls backend/app/Http/Controllers/

# Frontend files
ls frontend/src/
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

---

## 🔄 Alternative: Create New Branch from Merge

Jika Anda ingin merge ke branch baru (lebih aman):

```bash
# Create new branch
git checkout -b feat/fullstack-integration

# Merge semua branch
git merge feat/be-api-endpoints
git merge feat/ai-prompt-gemini
git merge feat/fe-result-page
git merge feat/fe-input-form
git merge feat/fe-fullstack-integration

# Push
git push origin feat/fullstack-integration
```

---

## 📊 Merge Strategies

### Strategy 1: Sequential Merge (Recommended)
Merge satu per satu dengan conflict resolution

**Pros**: Lebih mudah track conflict
**Cons**: Lebih lama

### Strategy 2: Squash Merge
Merge semua commit jadi satu

```bash
git merge feat/ai-prompt-gemini --squash
git commit -m "feat: merge AI implementation"
```

**Pros**: History lebih clean
**Cons**: Kehilangan commit history

### Strategy 3: Rebase Merge
Rebase branch sebelum merge

```bash
git rebase feat/be-api-endpoints feat/ai-prompt-gemini
git checkout feat/be-api-endpoints
git merge feat/ai-prompt-gemini
```

**Pros**: Linear history
**Cons**: Lebih kompleks

---

## 🚨 Rollback Jika Ada Masalah

### Jika merge gagal:
```bash
# Cancel merge
git merge --abort
```

### Jika sudah commit tapi mau undo:
```bash
# Undo last commit
git reset --soft HEAD~1

# Atau undo specific merge
git revert -m 1 <merge-commit-hash>
```

---

## 📝 Merge Checklist

- [ ] Backup current branch: `git branch -c feat/be-api-endpoints feat/be-api-endpoints-backup`
- [ ] Pull latest changes: `git pull origin feat/be-api-endpoints`
- [ ] Merge AI branch: `git merge feat/ai-prompt-gemini`
- [ ] Resolve conflicts (jika ada)
- [ ] Merge FE result page: `git merge feat/fe-result-page`
- [ ] Resolve conflicts (jika ada)
- [ ] Merge FE input form: `git merge feat/fe-input-form`
- [ ] Resolve conflicts (jika ada)
- [ ] Merge FE integration: `git merge feat/fe-fullstack-integration`
- [ ] Resolve conflicts (jika ada)
- [ ] Run tests
- [ ] Push to remote: `git push origin feat/be-api-endpoints`
- [ ] Create pull request (optional)

---

## 🎯 After Merge

### 1. Test Full Stack
```bash
# Backend
cd backend
php artisan serve

# Frontend (new terminal)
cd frontend
npm run dev
```

### 2. Test API Integration
- Submit meal dari frontend
- Check backend logs
- Verify database

### 3. Test AI Processing
- Submit meal dengan image
- Check Gemini API response
- Verify scoring results

### 4. Test Frontend Display
- Check result page
- Check input form
- Check integration

---

## 📞 If Merge Fails

### Error: "CONFLICT (content merge)"
```bash
# See conflicts
git status

# Resolve manually
# Then:
git add .
git commit -m "resolve conflicts"
```

### Error: "fatal: refusing to merge unrelated histories"
```bash
git merge --allow-unrelated-histories feat/ai-prompt-gemini
```

### Error: "Your branch is ahead of 'origin/...'"
```bash
git push origin feat/be-api-endpoints
```

---

## 🔐 Best Practices

1. **Always backup**: `git branch -c current-branch backup-branch`
2. **Pull first**: `git pull origin branch-name`
3. **Merge one by one**: Jangan merge semua sekaligus
4. **Test after merge**: Jalankan tests setelah setiap merge
5. **Commit merge**: Gunakan `--no-ff` untuk explicit merge commits
6. **Document conflicts**: Catat conflict yang terjadi

---

## 📊 Expected Result

Setelah merge semua branch:

```
feat/be-api-endpoints (Main Branch)
├── Backend (API, Models, Controllers)
├── AI (Gemini Integration, Scoring)
├── Frontend (React, Vite)
├── Frontend Input Form
└── Frontend Integration
```

---

## 🚀 Next Steps

1. Follow merge steps di atas
2. Resolve conflicts jika ada
3. Test full stack
4. Push ke remote
5. Create pull request ke main (optional)
6. Deploy ke production

---

**Status**: Ready to merge
**Estimated Time**: 30-60 minutes (tergantung conflicts)
**Risk Level**: Medium (backup dulu!)
