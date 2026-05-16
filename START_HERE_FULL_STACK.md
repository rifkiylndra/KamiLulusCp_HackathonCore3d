# 🎯 START HERE - Full Stack NutriGuard MBG

**Panduan lengkap untuk menjalankan aplikasi full stack dalam 5-10 menit.**

---

## 📋 Checklist Persiapan

Pastikan sudah terinstall:
- ✅ PHP 8.3+ (verified: 8.3.23)
- ✅ Composer (verified: 2.9.3)
- ✅ Node.js 18+ (verified: v22.15.1)
- ✅ npm (verified: 11.6.0)
- ✅ MySQL 8.0+ (ready)

---

## 🚀 Jalankan Sekarang (5 Menit)

### Step 1: Setup Database (1x saja)

Buka **PowerShell/CMD**:

```bash
mysql -u root -p
```

Tekan Enter jika tidak ada password, lalu:

```sql
CREATE DATABASE nutriguard_mbg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 2: Setup Backend (1x saja)

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

**Tunggu sampai selesai (~2-3 menit)**

### Step 3: Jalankan Backend

```bash
php artisan serve
```

**Tunggu sampai muncul:**
```
INFO  Server running on [http://127.0.0.1:8000].
```

### Step 4: Setup Frontend (1x saja)

Buka **PowerShell/CMD baru**:

```bash
cd frontend
npm install
```

**Tunggu sampai selesai (~1-2 menit)**

### Step 5: Jalankan Frontend

```bash
npm run dev
```

**Tunggu sampai muncul:**
```
➜  Local:   http://localhost:5173/
```

### Step 6: Buka Browser

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/sppg

---

## ✅ Verifikasi Berhasil

Jika semua berjalan:

1. ✅ Backend console: "Server running on http://127.0.0.1:8000"
2. ✅ Frontend console: "Local: http://localhost:5173"
3. ✅ Browser: Halaman frontend loading
4. ✅ Browser console (F12): Tidak ada error merah

---

## 🔄 Hari Berikutnya (Cukup Jalankan)

**Terminal 1:**
```bash
cd backend
php artisan serve
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

---

## 📚 Dokumentasi Tersedia

| File | Untuk |
|------|-------|
| **RUN_NOW.md** | Quick start 5 menit |
| **QUICK_RUN_GUIDE.md** | Setup cepat dengan checklist |
| **FULL_STACK_SETUP_GUIDE.md** | Setup detail lengkap |
| **SETUP_SUMMARY.md** | Setup summary & reference |
| **PROJECT_STRUCTURE.md** | Struktur folder & file |
| **FRONTEND_BACKEND_INTEGRATION.md** | API integration & polling |

---

## 🧪 Test Aplikasi

### Test 1: Get SPPG List
Buka browser:
```
http://localhost:8000/api/sppg
```

Expected: JSON dengan list SPPG

### Test 2: Frontend
Buka browser:
```
http://localhost:5173
```

Expected: Halaman frontend loading tanpa error

### Test 3: Submit Meal
1. Buka frontend
2. Klik "Submit Meal" atau form submission
3. Isi form dan submit
4. Lihat status di dashboard

---

## ⚠️ Troubleshooting

### "Can't connect to MySQL"
```bash
# Pastikan MySQL running
mysql -u root -p
```

### "CORS error" di browser
- Restart backend: `php artisan serve`

### "npm: command not found"
- Restart terminal

### "php: command not found"
- Restart terminal

### Port sudah digunakan
```bash
# Backend di port lain
php artisan serve --port=8001

# Frontend di port lain
npm run dev -- --port 5174
```

---

## 📊 Workflow

```
1. User submit meal di frontend
   ↓
2. Frontend kirim ke backend API
   ↓
3. Backend simpan ke database
   ↓
4. Backend dispatch queue job
   ↓
5. Frontend polling status
   ↓
6. Queue job process:
   - Call Gemini API
   - Run Scoring Engine
   - Simpan hasil
   ↓
7. Frontend terima hasil
   ↓
8. User lihat scoring & feedback
```

---

## 🎯 API Endpoints

### SPPG
- `GET /api/sppg` - List SPPG
- `POST /api/sppg` - Create SPPG

### Submissions
- `POST /api/submissions` - Submit meal
- `GET /api/submissions` - List submissions
- `GET /api/submissions/{id}` - Get detail
- `GET /api/submissions/{id}/status` - Get status (polling)

### Dashboard
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/recent-sppg` - Recent SPPG

---

## 🔧 Configuration

**Backend** (`backend/.env`):
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=nutriguard_mbg
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=AIzaSyAQNu3AmKxLFrm1NWSuKLmygL5sR9cHhKw
QUEUE_CONNECTION=database
```

---

## 📁 Project Structure

```
KamiLulusCp_HackathonCore3d/
├── backend/              # Laravel API
├── frontend/             # React UI
├── docs/                 # Documentation
└── [Setup guides]
```

**Backend**: 7 models, 7 migrations, 19 API endpoints
**Frontend**: React 19 + Vite 8
**Database**: 7 tables dengan relationships

---

## 🚀 Next Steps

1. ✅ Setup database
2. ✅ Setup backend
3. ✅ Setup frontend
4. ✅ Run servers
5. ✅ Test API
6. ✅ Test workflow
7. 📦 Deploy (Railway/Vercel)

---

## 💡 Tips

- Biarkan kedua terminal (backend & frontend) tetap berjalan
- Jika ada error, cek logs: `backend/storage/logs/laravel.log`
- Gunakan F12 di browser untuk melihat console errors
- Verifikasi .env configuration jika ada masalah

---

## 📞 Support

Jika ada masalah:
1. Cek error message di terminal
2. Lihat logs di backend
3. Cek browser console (F12)
4. Verifikasi .env
5. Pastikan MySQL running

---

## 🎉 Siap!

Semua sudah siap. Tinggal jalankan sesuai langkah di atas.

**Happy coding! 🚀**

---

## 📝 Git Info

**Branch**: `feat/be-api-endpoints`
**Repository**: https://github.com/rifkiylndra/KamiLulusCp_HackathonCore3d

**Latest Commits**:
- Full stack setup guides
- API integration documentation
- Project structure documentation
- Backend implementation complete
- Gemini 2.5-flash integration

---

**Status**: ✅ **READY TO RUN**
