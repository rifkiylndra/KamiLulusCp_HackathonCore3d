# 🚀 Full Stack Setup Guide - NutriGuard MBG

Panduan lengkap untuk menjalankan backend Laravel dan frontend React secara bersamaan.

## Prerequisites

Pastikan sudah terinstall:
- **PHP 8.3+** (dengan extensions: mysql, curl, json, mbstring)
- **Composer** (PHP package manager)
- **Node.js 18+** (dengan npm)
- **MySQL 8.0+** (atau MariaDB)
- **Git**

Verifikasi instalasi:
```bash
php --version
composer --version
node --version
npm --version
mysql --version
```

---

## Step 1: Setup Database MySQL

### 1.1 Buat Database Baru
```bash
mysql -u root -p
```

Di MySQL console:
```sql
CREATE DATABASE nutriguard_mbg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 1.2 Verifikasi Database
```bash
mysql -u root -p nutriguard_mbg -e "SELECT 1;"
```

---

## Step 2: Setup Backend (Laravel)

### 2.1 Navigate ke Backend Folder
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
composer install
```

### 2.3 Generate App Key (jika belum ada)
```bash
php artisan key:generate
```

### 2.4 Verify .env Configuration
Buka `backend/.env` dan pastikan:
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

**PENTING**: Jika DB_PASSWORD kosong, pastikan MySQL root user tidak memiliki password.

### 2.5 Run Database Migrations
```bash
php artisan migrate
```

Expected output:
```
Migrating: 2026_05_16_055101_create_sppg_table
Migrated:  2026_05_16_055101_create_sppg_table (xxx ms)
...
```

### 2.6 Seed Demo Data
```bash
php artisan db:seed
```

Expected output:
```
Seeding: Database\Seeders\DatabaseSeeder
Seeded:  Database\Seeders\DatabaseSeeder (xxx ms)
```

Verifikasi data:
```bash
php artisan tinker
>>> MealSubmission::count()
=> 22
>>> Sppg::count()
=> 10
>>> exit
```

### 2.7 Create Storage Link (untuk image uploads)
```bash
php artisan storage:link
```

### 2.8 Start Backend Server
```bash
php artisan serve
```

Expected output:
```
   INFO  Server running on [http://127.0.0.1:8000].

  Press Ctrl+C to stop the server
```

**Backend berjalan di**: `http://localhost:8000`

---

## Step 3: Setup Frontend (React + Vite)

### 3.1 Open New Terminal/PowerShell

### 3.2 Navigate ke Frontend Folder
```bash
cd frontend
```

### 3.3 Install Dependencies
```bash
npm install
```

### 3.4 Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Frontend berjalan di**: `http://localhost:5173`

---

## Step 4: Verify Full Stack Integration

### 4.1 Test Backend API
Buka browser atau gunakan Postman:

**Test 1: Get SPPG List**
```
GET http://localhost:8000/api/sppg
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SPPG Demo 1",
      "location": "Jakarta",
      ...
    }
  ],
  "message": "SPPG retrieved successfully"
}
```

**Test 2: Get Dashboard Stats**
```
GET http://localhost:8000/api/dashboard/stats
```

Expected response:
```json
{
  "success": true,
  "data": {
    "total_submissions": 22,
    "aman_count": 12,
    "perhatian_count": 8,
    "bahaya_count": 2,
    ...
  },
  "message": "Dashboard stats retrieved successfully"
}
```

### 4.2 Test Frontend
Buka browser: `http://localhost:5173`

Pastikan:
- ✅ Halaman loading dengan baik
- ✅ Bisa melihat data dari backend
- ✅ Tidak ada error di console browser (F12)

### 4.3 Check Backend Console
Di terminal backend, pastikan tidak ada error:
```
[timestamp] Processing: POST /api/submissions
[timestamp] Processed: POST /api/submissions
```

---

## Step 5: Test Full Workflow

### 5.1 Submit Meal (dari Frontend)
1. Buka `http://localhost:5173`
2. Klik "Submit Meal" atau form submission
3. Isi form dengan data:
   - SPPG: Pilih salah satu
   - Menu items: Tambahkan minimal 1 item
   - Sanitation checks: Isi parameter sanitasi
   - Image: Upload foto (optional)
4. Submit

### 5.2 Monitor Backend Processing
Di terminal backend, lihat:
```
[timestamp] Dispatching ProcessMealAnalysis job
[timestamp] Job queued successfully
```

### 5.3 Check Queue Processing
```bash
# Di terminal backend, jalankan queue worker
php artisan queue:work
```

Expected output:
```
Processing: App\Jobs\ProcessMealAnalysis
Processed:  App\Jobs\ProcessMealAnalysis
```

### 5.4 Verify Results
Buka `http://localhost:8000/api/submissions/{id}` untuk melihat hasil scoring dan AI assessment.

---

## Step 6: Troubleshooting

### Issue: Database Connection Error
```
SQLSTATE[HY000] [2002] No such file or directory
```

**Solution:**
- Pastikan MySQL running: `mysql -u root -p`
- Verifikasi DB_HOST di .env (gunakan `127.0.0.1` bukan `localhost`)
- Pastikan DB_PASSWORD kosong jika root user tidak punya password

### Issue: CORS Error di Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Verifikasi `FRONTEND_URL=http://localhost:5173` di backend .env
- Restart backend server: `php artisan serve`

### Issue: Queue Jobs Not Processing
```
No jobs available in the queue
```

**Solution:**
- Pastikan `QUEUE_CONNECTION=database` di .env
- Jalankan queue worker: `php artisan queue:work`
- Atau gunakan sync mode untuk testing: `QUEUE_CONNECTION=sync`

### Issue: Image Upload Failed
```
Storage disk not found
```

**Solution:**
- Jalankan: `php artisan storage:link`
- Pastikan folder `storage/app/public` writable

### Issue: Gemini API Error
```
Invalid API key
```

**Solution:**
- Verifikasi `GEMINI_API_KEY` di .env
- Pastikan API key valid dan aktif di Google Cloud Console

---

## Step 7: Development Workflow

### Terminal 1: Backend Server
```bash
cd backend
php artisan serve
```

### Terminal 2: Queue Worker (optional, untuk async processing)
```bash
cd backend
php artisan queue:work
```

### Terminal 3: Frontend Dev Server
```bash
cd frontend
npm run dev
```

### Terminal 4: Monitoring (optional)
```bash
# Monitor database
mysql -u root -p nutriguard_mbg

# Monitor logs
tail -f backend/storage/logs/laravel.log
```

---

## Step 8: API Endpoints Reference

### SPPG Endpoints
- `GET /api/sppg` - List all SPPG
- `POST /api/sppg` - Create new SPPG

### Meal Submission Endpoints
- `POST /api/submissions` - Submit meal
- `GET /api/submissions` - List submissions
- `GET /api/submissions/{id}` - Get submission detail
- `GET /api/submissions/{id}/status` - Get submission status (polling)

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-sppg` - Get recent SPPG

### Testing Endpoints
- `POST /api/scoring-test` - Test scoring engine
- `POST /api/gemini-test` - Test Gemini integration

---

## Step 9: Production Deployment

Untuk deployment ke Railway atau server production:

1. **Backend**: Lihat `PHASE_9_DEPLOYMENT_GUIDE.md`
2. **Frontend**: Build dan deploy ke Vercel/Netlify
3. **Database**: Setup MySQL di production server
4. **Environment**: Update .env dengan production values

---

## Quick Commands Reference

```bash
# Backend
cd backend
composer install              # Install dependencies
php artisan migrate          # Run migrations
php artisan db:seed          # Seed demo data
php artisan serve            # Start server (port 8000)
php artisan queue:work       # Start queue worker
php artisan tinker           # Interactive shell

# Frontend
cd frontend
npm install                  # Install dependencies
npm run dev                  # Start dev server (port 5173)
npm run build                # Build for production
npm run lint                 # Run linter

# Database
mysql -u root -p             # Connect to MySQL
mysql -u root -p nutriguard_mbg < backup.sql  # Restore backup
```

---

## Support

Jika ada masalah:
1. Cek error message di terminal
2. Lihat logs: `backend/storage/logs/laravel.log`
3. Cek browser console: F12 → Console tab
4. Verifikasi .env configuration
5. Pastikan semua services running (MySQL, PHP, Node)

---

**Status**: ✅ Ready to run!

Backend: http://localhost:8000
Frontend: http://localhost:5173
