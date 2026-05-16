# ✅ HomePage - Integrasi Data Akun SPPG

## 📋 Ringkasan

HomePage telah berhasil diintegrasikan dengan data akun SPPG yang sedang login. Nama SPPG dan lokasi sekarang ditampilkan secara dinamis berdasarkan data dari localStorage.

---

## 🔧 Perubahan yang Dilakukan

### 1. KitchenHomePage.jsx
**File:** `frontend/src/pages/KitchenHomePage.jsx`

**Perubahan:**
- Import `getCurrentSppg` dari API service
- Tambah state `currentSppg` untuk menyimpan data SPPG yang login
- Load data SPPG dari localStorage saat component mount
- Update header untuk menampilkan nama SPPG dinamis
- Tambah lokasi SPPG di subtitle (jika ada)

**Sebelum:**
```jsx
<h1>Selamat Datang, SPPG Padang 01</h1>
<p>Pantau kelayakan gizi dan keamanan dapur Anda hari ini</p>
```

**Sesudah:**
```jsx
<h1>Selamat Datang, {currentSppg ? currentSppg.name : 'SPPG'}</h1>
<p>
  Pantau kelayakan gizi dan keamanan dapur Anda hari ini
  {currentSppg && currentSppg.location && ` - ${currentSppg.location}`}
</p>
```

### 2. LoginPage.jsx
**File:** `frontend/src/pages/LoginPage.jsx`

**Perubahan:**
- Import `loginSppg` dari API service
- Update `handleLogin` untuk call backend API
- Simpan data SPPG ke localStorage setelah login berhasil
- Tambah error handling yang lebih baik
- Tambah link ke halaman register
- Update button style menjadi solid green

**Flow Login:**
1. User input email & password
2. Call `loginSppg(email, password)`
3. Backend verify credentials
4. Return SPPG data
5. Save ke localStorage
6. Redirect ke /home
7. HomePage load data dari localStorage

---

## 🧪 Cara Testing

### Test 1: Login dengan Akun yang Sudah Ada

**Step 1: Buka Login Page**
```
http://localhost:5174/login
```

**Step 2: Login dengan Akun Test**
- Email: `test@sppg.go.id`
- Password: `password123`

**Step 3: Verifikasi HomePage**
- Setelah login, akan redirect ke `/home`
- Header harus menampilkan: "Selamat Datang, Test SPPG"
- Subtitle: "Pantau kelayakan gizi dan keamanan dapur Anda hari ini"

### Test 2: Register Akun Baru & Login

**Step 1: Register Akun Baru**
```
http://localhost:5174/register
```

Form:
- Nama SPPG: "SPPG Hub 05 - Jakarta Utara"
- Email: "hub05@sppg.go.id"
- Password: "password123"
- Konfirmasi Password: "password123"

**Step 2: Login dengan Akun Baru**
```
http://localhost:5174/login
```

- Email: `hub05@sppg.go.id`
- Password: `password123`

**Step 3: Verifikasi HomePage**
- Header harus menampilkan: "Selamat Datang, SPPG Hub 05 - Jakarta Utara"
- Subtitle: "Pantau kelayakan gizi dan keamanan dapur Anda hari ini"

### Test 3: Login dengan SPPG yang Punya Lokasi

**Step 1: Register dengan Data Lengkap**
Via API (atau bisa via frontend):
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SPPG Hub 06 - Bandung",
    "email": "hub06@sppg.go.id",
    "password": "password123",
    "password_confirmation": "password123",
    "location": "Bandung Kota",
    "province": "Jawa Barat"
  }'
```

**Step 2: Login**
- Email: `hub06@sppg.go.id`
- Password: `password123`

**Step 3: Verifikasi HomePage**
- Header: "Selamat Datang, SPPG Hub 06 - Bandung"
- Subtitle: "Pantau kelayakan gizi dan keamanan dapur Anda hari ini - Bandung Kota"

### Test 4: Logout & Login Ulang

**Step 1: Clear localStorage**
Buka browser console (F12) dan jalankan:
```javascript
localStorage.clear();
```

**Step 2: Refresh HomePage**
- Header harus menampilkan: "Selamat Datang, SPPG" (fallback)

**Step 3: Login Ulang**
- Kembali ke `/login`
- Login dengan akun manapun
- HomePage harus menampilkan nama SPPG yang benar

---

## 📊 Data Flow

### Login Flow:
```
1. User buka /login
2. Input email & password
3. Submit form
4. Frontend call loginSppg(email, password)
5. Backend verify credentials
6. Backend return SPPG data
7. Frontend save to localStorage:
   {
     "id": 8,
     "name": "Test SPPG",
     "email": "test@sppg.go.id",
     "location": "",
     "province": "",
     "contact_person": null,
     "phone": null
   }
8. Redirect to /home
```

### HomePage Load Flow:
```
1. HomePage component mount
2. Call getCurrentSppg()
3. Read from localStorage.getItem('sppg')
4. Parse JSON
5. Set to currentSppg state
6. Render header with SPPG name
```

---

## 🔍 localStorage Structure

**Key:** `sppg`

**Value (JSON):**
```json
{
  "id": 8,
  "name": "Test SPPG",
  "email": "test@sppg.go.id",
  "location": "Jakarta Pusat",
  "province": "DKI Jakarta",
  "contact_person": "Ibu Siti",
  "phone": "021-1234567"
}
```

**Cara Cek di Browser:**
1. Buka DevTools (F12)
2. Tab "Application" atau "Storage"
3. Expand "Local Storage"
4. Klik domain (http://localhost:5174)
5. Lihat key `sppg`

---

## 🎨 UI Changes

### Header Section

**Before:**
```
┌─────────────────────────────────────────────────────────┐
│ Selamat Datang, SPPG Padang 01                          │
│ Pantau kelayakan gizi dan keamanan dapur Anda hari ini  │
└─────────────────────────────────────────────────────────┘
```

**After (No Login):**
```
┌─────────────────────────────────────────────────────────┐
│ Selamat Datang, SPPG                                     │
│ Pantau kelayakan gizi dan keamanan dapur Anda hari ini  │
└─────────────────────────────────────────────────────────┘
```

**After (Login - No Location):**
```
┌─────────────────────────────────────────────────────────┐
│ Selamat Datang, Test SPPG                                │
│ Pantau kelayakan gizi dan keamanan dapur Anda hari ini  │
└─────────────────────────────────────────────────────────┘
```

**After (Login - With Location):**
```
┌─────────────────────────────────────────────────────────┐
│ Selamat Datang, SPPG Hub 05 - Jakarta Utara             │
│ Pantau kelayakan gizi dan keamanan dapur Anda hari ini  │
│ - Jakarta Utara                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Notes

### localStorage vs Session
- Data disimpan di localStorage (persistent)
- Data tidak hilang saat browser ditutup
- Data bisa diakses via JavaScript
- **Tidak menyimpan password** (hanya data SPPG)

### Best Practices
✅ Hanya simpan data non-sensitive
✅ Tidak simpan password atau token
✅ Clear localStorage saat logout
✅ Validate data sebelum digunakan

### Future Improvements
- Implement token-based authentication (Sanctum)
- Add token expiration
- Implement refresh token
- Add session timeout
- Encrypt sensitive data

---

## 🐛 Troubleshooting

### Issue 1: Nama SPPG Tidak Muncul
**Symptom:** Header menampilkan "Selamat Datang, SPPG"

**Possible Causes:**
1. Belum login
2. localStorage kosong
3. Data SPPG tidak tersimpan saat login

**Solution:**
```javascript
// Check localStorage
console.log(localStorage.getItem('sppg'));

// If null, login ulang
// If ada data, check format JSON
```

### Issue 2: Data SPPG Lama Masih Muncul
**Symptom:** Setelah login dengan akun baru, nama SPPG masih yang lama

**Solution:**
```javascript
// Clear localStorage
localStorage.clear();

// Atau hapus specific key
localStorage.removeItem('sppg');

// Login ulang
```

### Issue 3: Error "Cannot read property 'name' of null"
**Symptom:** Console error saat load HomePage

**Solution:**
- Pastikan ada fallback: `{currentSppg ? currentSppg.name : 'SPPG'}`
- Check getCurrentSppg() return value
- Validate JSON parse

---

## ✅ Checklist

### Backend
- [x] Login endpoint working
- [x] Return SPPG data correctly
- [x] Password verification
- [x] Error handling

### Frontend
- [x] LoginPage integrated with backend
- [x] Save SPPG data to localStorage
- [x] HomePage load data from localStorage
- [x] Display SPPG name dynamically
- [x] Display location (if available)
- [x] Fallback for no login
- [x] Error handling

### Testing
- [x] Test login with existing account
- [x] Test register + login
- [x] Test with/without location
- [x] Test localStorage persistence
- [x] Test fallback behavior

---

## 📝 Next Steps

### 1. Implement Logout
- Add logout button di Navbar
- Call logoutSppg() API
- Clear localStorage
- Redirect to /login

### 2. Protected Routes
- Check if user logged in
- Redirect to /login if not
- Implement route guard

### 3. Profile Page
- Display full SPPG info
- Edit profile
- Change password

### 4. Session Management
- Implement token-based auth
- Auto-logout on token expiry
- Refresh token mechanism

---

## 🎯 Summary

✅ **HomePage sekarang menampilkan data akun SPPG yang login**
✅ **LoginPage terintegrasi dengan backend**
✅ **Data SPPG disimpan di localStorage**
✅ **Nama dan lokasi SPPG ditampilkan dinamis**
✅ **Fallback untuk user yang belum login**

**Status:** ✅ COMPLETE
**Date:** 2026-05-16
**Developer:** Kiro AI Assistant
