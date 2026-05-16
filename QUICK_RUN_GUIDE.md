# ⚡ Quick Run Guide - NutriGuard MBG

Panduan cepat untuk menjalankan aplikasi dalam 5 menit.

## ✅ Prerequisites Check

Semua sudah terinstall:
- ✅ PHP 8.3.23
- ✅ Composer 2.9.3
- ✅ Node.js v22.15.1
- ✅ npm 11.6.0

## 🚀 Langkah-Langkah Menjalankan

### Step 1: Setup Database (Jalankan 1x saja)

**Buka PowerShell/CMD dan jalankan:**

```bash
mysql -u root -p
```

**Jika diminta password, tekan Enter (jika tidak ada password)**

**Di MySQL console, ketik:**
```sql
CREATE DATABASE nutriguard_mbg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 2: Setup Backend (Jalankan 1x saja)

**Buka PowerShell/CMD di folder project:**

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

**Tunggu sampai selesai (±2-3 menit)**

### Step 3: Jalankan Backend Server

**Di PowerShell/CMD yang sama:**

```bash
php artisan serve
```

**Output yang diharapkan:**
```
INFO  Server running on [http://127.0.0.1:8000].
Press Ctrl+C to stop the server
```

**Backend siap di**: `http://localhost:8000`

### Step 4: Setup Frontend (Jalankan 1x saja)

**Buka PowerShell/CMD baru di folder project:**

```bash
cd frontend
npm install
```

**Tunggu sampai selesai (±1-2 menit)**

### Step 5: Jalankan Frontend Server

**Di PowerShell/CMD yang sama:**

```bash
npm run dev
```

**Output yang diharapkan:**
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

**Frontend siap di**: `http://localhost:5173`

### Step 6: Buka di Browser

Buka browser dan akses:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/sppg

---

## 📋 Terminal Setup

Untuk development, buka 2 terminal:

**Terminal 1 (Backend):**
```bash
cd backend
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Biarkan kedua terminal tetap berjalan.

---

## 🔄 Menjalankan Ulang (Hari Berikutnya)

Jika sudah setup sebelumnya, cukup jalankan:

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

## ⚠️ Troubleshooting

### Error: "Can't connect to MySQL server"
- Pastikan MySQL running
- Cek DB_PASSWORD di `backend/.env` (kosong jika root tidak punya password)

### Error: "CORS error" di browser
- Pastikan backend running di `http://localhost:8000`
- Restart backend server

### Error: "npm: command not found"
- Pastikan Node.js terinstall: `node --version`
- Restart terminal

### Error: "php: command not found"
- Pastikan PHP terinstall: `php --version`
- Restart terminal

---

## 📊 Verifikasi Berhasil

Jika semua berjalan:
1. ✅ Backend console: "Server running on http://127.0.0.1:8000"
2. ✅ Frontend console: "Local: http://localhost:5173"
3. ✅ Browser: Halaman frontend loading tanpa error
4. ✅ Browser console (F12): Tidak ada error merah

---

## 🎯 Next Steps

Setelah semua berjalan:
1. Test submit meal dari frontend
2. Lihat hasil scoring di dashboard
3. Monitor backend console untuk queue processing
4. Cek database: `mysql -u root -p nutriguard_mbg`

---

**Siap? Mari jalankan! 🚀**
