# 📋 Setup Summary - NutriGuard MBG Full Stack

**Status**: ✅ **READY TO RUN**

---

## 🎯 Langkah-Langkah Menjalankan Aplikasi

### Persiapan (Jalankan 1x)

#### 1. Setup Database
```bash
mysql -u root -p
CREATE DATABASE nutriguard_mbg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 2. Setup Backend
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

#### 3. Setup Frontend
```bash
cd frontend
npm install
```

---

### Menjalankan Aplikasi (Setiap Kali)

#### Terminal 1: Backend
```bash
cd backend
php artisan serve
```
**Akses**: http://localhost:8000

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
**Akses**: http://localhost:5173

---

## 📚 Dokumentasi yang Tersedia

| File | Deskripsi |
|------|-----------|
| **RUN_NOW.md** | ⚡ Quick start 5 menit |
| **QUICK_RUN_GUIDE.md** | 📋 Setup cepat dengan checklist |
| **FULL_STACK_SETUP_GUIDE.md** | 📖 Setup detail lengkap |
| **FRONTEND_BACKEND_INTEGRATION.md** | 🔗 API integration & polling |

---

## ✅ Verifikasi Tools

Semua tools sudah terinstall:

```
✅ PHP 8.3.23
✅ Composer 2.9.3
✅ Node.js v22.15.1
✅ npm 11.6.0
✅ MySQL (ready)
```

---

## 🔧 Backend Configuration

**File**: `backend/.env`

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutriguard_mbg
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=AIzaSyAQNu3AmKxLFrm1NWSuKLmygL5sR9cHhKw
QUEUE_CONNECTION=database
```

---

## 🎨 Frontend Configuration

**Framework**: React 19 + Vite 8

**Scripts**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter

---

## 📡 API Endpoints

### SPPG
- `GET /api/sppg` - List all SPPG
- `POST /api/sppg` - Create new SPPG

### Meal Submissions
- `POST /api/submissions` - Submit meal
- `GET /api/submissions` - List submissions
- `GET /api/submissions/{id}` - Get detail
- `GET /api/submissions/{id}/status` - Get status (polling)

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent-sppg` - Recent SPPG

---

## 🔄 Workflow

1. **Frontend** mengirim form submission ke **Backend**
2. **Backend** menerima dan menyimpan ke database
3. **Backend** dispatch `ProcessMealAnalysis` job ke queue
4. **Frontend** polling status setiap 2 detik
5. **Queue Worker** memproses job:
   - Call Gemini API untuk analisis
   - Run Scoring Engine
   - Simpan hasil ke database
6. **Frontend** menerima hasil dan tampilkan ke user

---

## 📊 Database Schema

7 Tables:
- `sppg` - School/Institution data
- `meal_submissions` - Meal submission records
- `menu_items` - Menu items per submission
- `sanitation_checks` - Sanitation parameters
- `ai_assessments` - AI scoring results
- `violations` - Violations found
- `corrective_feedbacks` - AI recommendations

---

## 🧪 Testing

### Manual Testing
1. Submit meal dari frontend
2. Lihat status di dashboard
3. Tunggu AI processing selesai
4. Lihat hasil scoring dan feedback

### API Testing (Postman)
```
GET http://localhost:8000/api/sppg
GET http://localhost:8000/api/dashboard/stats
POST http://localhost:8000/api/submissions (dengan form data)
```

---

## ⚠️ Troubleshooting

| Error | Solusi |
|-------|--------|
| MySQL connection error | Pastikan MySQL running, cek DB_PASSWORD |
| CORS error | Restart backend, verifikasi FRONTEND_URL |
| npm not found | Restart terminal |
| php not found | Restart terminal |
| Port 8000 already in use | `php artisan serve --port=8001` |
| Port 5173 already in use | `npm run dev -- --port 5174` |

---

## 🚀 Next Steps

1. ✅ Setup database
2. ✅ Setup backend
3. ✅ Setup frontend
4. ✅ Run backend server
5. ✅ Run frontend server
6. ✅ Test API endpoints
7. ✅ Submit meal dan lihat hasil
8. 📦 Deploy ke production (Railway/Vercel)

---

## 📞 Support

Jika ada masalah:
1. Cek error message di terminal
2. Lihat logs: `backend/storage/logs/laravel.log`
3. Cek browser console: F12 → Console
4. Verifikasi .env configuration
5. Pastikan semua services running

---

## 📝 Git Status

**Branch**: `feat/be-api-endpoints`

**Latest Commits**:
- `64089f7` - docs: add quick start file
- `c3b2a01` - docs: add full stack setup and integration guides
- `cf8cdfd` - docs: add AI Corrective Feedback feature documentation
- `dfd6666` - feat: complete backend implementation with gemini-2.5-flash

**Repository**: https://github.com/rifkiylndra/KamiLulusCp_HackathonCore3d

---

## 🎉 Ready to Go!

Semua sudah siap. Tinggal jalankan sesuai langkah di atas.

**Happy coding! 🚀**
