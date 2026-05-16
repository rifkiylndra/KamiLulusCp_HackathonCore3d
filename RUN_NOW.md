# 🎯 RUN NOW - Start NutriGuard in 5 Minutes

**Langsung jalankan aplikasi tanpa setup panjang!**

---

## ✅ Verifikasi Tools (Sudah Terinstall)

```
✅ PHP 8.3.23
✅ Composer 2.9.3
✅ Node.js v22.15.1
✅ npm 11.6.0
```

---

## 🚀 Jalankan Sekarang

### Step 1: Setup Database (Jalankan 1x)

Buka **PowerShell/CMD** dan jalankan:

```bash
mysql -u root -p
```

Tekan Enter jika tidak ada password, lalu ketik:

```sql
CREATE DATABASE nutriguard_mbg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 2: Setup Backend (Jalankan 1x)

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

### Step 3: Jalankan Backend

```bash
php artisan serve
```

**Tunggu sampai muncul:**
```
INFO  Server running on [http://127.0.0.1:8000].
```

### Step 4: Setup Frontend (Jalankan 1x)

Buka **PowerShell/CMD baru**:

```bash
cd frontend
npm install
```

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

## 📋 Checklist

- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Backend migrations ran
- [ ] Backend seeded
- [ ] Backend running on port 8000
- [ ] Frontend dependencies installed
- [ ] Frontend running on port 5173
- [ ] Browser shows frontend
- [ ] No errors in console

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

## 📚 Dokumentasi Lengkap

- **QUICK_RUN_GUIDE.md** - Setup cepat
- **FULL_STACK_SETUP_GUIDE.md** - Setup detail
- **FRONTEND_BACKEND_INTEGRATION.md** - API integration

---

## ⚠️ Jika Ada Error

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

---

## 🎉 Selesai!

Aplikasi sudah berjalan. Sekarang:
1. Test submit meal dari frontend
2. Lihat hasil scoring
3. Monitor backend console

**Happy coding! 🚀**
