# 🍽️ NutriGuard - Sistem Monitoring Keamanan Pangan SPPG

**NutriGuard** adalah sistem monitoring keamanan pangan berbasis AI untuk Satuan Pendidikan Pangan Gizi (SPPG) yang menggunakan Google Gemini AI untuk analisis nutrisi, keamanan, dan sanitasi makanan.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Project](#-struktur-project)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Tim Pengembang](#-tim-pengembang)

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Manajemen Akun
- **Register & Login** - Sistem autentikasi untuk SPPG
- **Multi-Account Support** - Setiap SPPG memiliki data terpisah
- **Data Filtering** - Data otomatis difilter berdasarkan akun yang login

### 📸 Analisis Menu Makanan
- **Upload Foto Menu** - Ambil foto langsung dari kamera atau upload file
- **AI Vision Analysis** - Deteksi otomatis nama menu dan bahan makanan
- **Form Submission** - Input detail porsi, waktu, dan sanitasi

### 🤖 Penilaian AI Otomatis
- **Analisis Nutrisi** - Evaluasi kandungan gizi makanan
- **Analisis Keamanan** - Deteksi potensi bahaya keamanan pangan
- **Analisis Sanitasi** - Penilaian kebersihan dan higienitas
- **Scoring System** - Skor 0-100 untuk setiap kategori

### 📊 Dashboard & Laporan
- **Hasil Scan Terakhir** - Tampilan hasil analisis terbaru
- **Riwayat Submission** - History semua laporan yang pernah dibuat
- **Statistik Bulanan** - Total laporan, status aman/perhatian/bahaya
- **Trend Mingguan** - Grafik perkembangan skor 7 hari terakhir
- **Distribusi Status** - Pie chart distribusi status penilaian
- **SPPG Leaderboard** - Ranking nasional semua SPPG

### 🚨 Feedback & Rekomendasi
- **Immediate Actions** - Tindakan darurat yang harus dilakukan
- **Tomorrow Improvements** - Perbaikan untuk besok
- **Routine Notes** - Catatan rutin untuk peningkatan kualitas

---

## 🛠️ Teknologi

### Backend
- **Laravel 11** - PHP Framework
- **MySQL** - Database
- **Google Gemini AI** - AI untuk analisis makanan
- **Laravel Queue** - Background job processing

### Frontend
- **React 18** - JavaScript Library
- **Vite** - Build tool
- **TailwindCSS** - CSS Framework
- **React Router** - Routing
- **Recharts** - Data visualization
- **Lucide React** - Icons

---

## 📦 Prasyarat

Pastikan sistem Anda sudah terinstall:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **npm** atau **yarn**
- **MySQL** >= 8.0
- **Git**

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/rifkiylndra/KamiLulusCp_HackathonCore3d.git
cd KamiLulusCp_HackathonCore3d
```

### 2. Setup Backend (Laravel)

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
composer install

# Copy file environment
copy .env.example .env

# Generate application key
php artisan key:generate

# Buat database MySQL (via phpMyAdmin atau MySQL CLI)
# Nama database: nutriguard_db

# Jalankan migrasi database
php artisan migrate

# Jalankan seeder (opsional - untuk data dummy)
php artisan db:seed

# Kembali ke root folder
cd ..
```

### 3. Setup Frontend (React)

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Copy file environment
copy .env.example .env

# Kembali ke root folder
cd ..
```

---

## ⚙️ Konfigurasi

### Backend Configuration (`backend/.env`)

```env
APP_NAME=NutriGuard
APP_ENV=local
APP_KEY=base64:... # Auto-generated
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutriguard_db
DB_USERNAME=root
DB_PASSWORD=

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Queue
QUEUE_CONNECTION=database
```

**Cara mendapatkan Gemini API Key:**
1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy API key dan paste ke `.env`

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

---

## ▶️ Menjalankan Aplikasi

### Opsi 1: Manual (2 Terminal Terpisah)

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
# Backend berjalan di http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend berjalan di http://localhost:5173
```

### Opsi 2: Queue Worker (Opsional - untuk background jobs)

**Terminal 3 - Queue Worker:**
```bash
cd backend
php artisan queue:work
```

### Akses Aplikasi

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

---

## 📁 Struktur Project

```
KamiLulusCp_HackathonCore3d/
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── MealSubmissionController.php
│   │   │   │       ├── DashboardController.php
│   │   │   │       ├── VisionController.php
│   │   │   │       └── AiController.php
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   │   ├── Sppg.php
│   │   │   ├── MealSubmission.php
│   │   │   ├── AiAssessment.php
│   │   │   └── ...
│   │   ├── Services/
│   │   │   ├── GeminiService.php
│   │   │   ├── ScoringEngine.php
│   │   │   └── NutriGuardPrompts.php
│   │   └── Jobs/
│   │       └── ProcessMealAnalysis.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       ├── NavbarLogin.jsx
│   │   │       └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── KitchenHomePage.jsx
│   │   │   ├── SubmitFormPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   └── RiwayatPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── .env
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register SPPG baru
- `POST /api/auth/login` - Login SPPG
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Meal Submissions
- `POST /api/submissions` - Submit meal baru
- `GET /api/submissions` - List submissions (dengan filter)
- `GET /api/submissions/{id}` - Detail submission
- `GET /api/submissions/{id}/status` - Status analisis AI

### Dashboard
- `GET /api/dashboard/monthly-stats` - Statistik bulanan
- `GET /api/dashboard/weekly-trend` - Trend 7 hari
- `GET /api/dashboard/status-distribution` - Distribusi status
- `GET /api/dashboard/sppg-leaderboard` - Leaderboard SPPG

### Vision Analysis
- `POST /api/vision/analyze-photo` - Analisis foto untuk deteksi bahan

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "SQLSTATE[HY000] [1045] Access denied"**
```bash
# Pastikan kredensial database di .env benar
# Cek username dan password MySQL
```

**Error: "Class 'GeminiService' not found"**
```bash
# Clear cache dan autoload
php artisan config:clear
php artisan cache:clear
composer dump-autoload
```

**Error: "Gemini API Key not configured"**
```bash
# Pastikan GEMINI_API_KEY sudah diset di backend/.env
# Restart server setelah mengubah .env
```

### Frontend Issues

**Error: "Failed to fetch"**
```bash
# Pastikan backend sudah running di http://localhost:8000
# Cek VITE_API_URL di frontend/.env
```

**Error: "Module not found"**
```bash
# Install ulang dependencies
cd frontend
rm -rf node_modules
npm install
```

### CORS Issues

Jika ada error CORS, pastikan di `backend/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173'],
```

---

## 👥 Tim Pengembang

**Tim Kami Lulus CP - Hackathon Core3D 2026**

- Developer 1
- Developer 2
- Developer 3

---

## 📝 Lisensi

Project ini dibuat untuk keperluan Hackathon Core3D 2026.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - AI analysis engine
- **Laravel** - Backend framework
- **React** - Frontend library
- **TailwindCSS** - Styling
- **Recharts** - Data visualization

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di GitHub repository atau hubungi tim pengembang.

---

**Made with ❤️ by Tim Kami Lulus CP**
