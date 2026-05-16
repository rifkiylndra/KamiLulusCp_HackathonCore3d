# 🔗 Frontend-Backend Integration Guide

Panduan integrasi antara React Frontend dan Laravel Backend.

## 📡 API Configuration

### Backend URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.yourdomain.com`

### Frontend Configuration
File yang perlu dikonfigurasi di frontend:

**`frontend/src/config/api.js` (atau sesuai struktur project)**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // SPPG
  SPPG_LIST: `${API_BASE_URL}/api/sppg`,
  SPPG_CREATE: `${API_BASE_URL}/api/sppg`,
  
  // Meal Submissions
  SUBMISSIONS_CREATE: `${API_BASE_URL}/api/submissions`,
  SUBMISSIONS_LIST: `${API_BASE_URL}/api/submissions`,
  SUBMISSIONS_DETAIL: (id) => `${API_BASE_URL}/api/submissions/${id}`,
  SUBMISSIONS_STATUS: (id) => `${API_BASE_URL}/api/submissions/${id}/status`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  DASHBOARD_RECENT: `${API_BASE_URL}/api/dashboard/recent-sppg`,
};

export default API_BASE_URL;
```

---

## 🔐 CORS Configuration

Backend sudah dikonfigurasi untuk menerima request dari frontend.

**Backend CORS Settings** (`backend/bootstrap/app.php`):
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
})
```

**Allowed Origins**:
- `http://localhost:5173` (development)
- `http://localhost:3000` (alternative)
- Production domains (sesuai kebutuhan)

---

## 📤 API Request Examples

### 1. Get SPPG List
```javascript
// Frontend
fetch('http://localhost:8000/api/sppg')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SPPG Demo 1",
      "location": "Jakarta",
      "coordinator_name": "Budi",
      "coordinator_phone": "08123456789",
      "created_at": "2026-05-16T10:00:00Z"
    }
  ],
  "message": "SPPG retrieved successfully"
}
```

### 2. Submit Meal
```javascript
// Frontend
const formData = new FormData();
formData.append('sppg_id', 1);
formData.append('menu_items', JSON.stringify([
  {
    name: 'Nasi Putih',
    portion_count: 50,
    ingredients: 'Beras, Air, Garam'
  }
]));
formData.append('sanitation_check', JSON.stringify({
  apd_used: true,
  kitchen_cleaned: true,
  storage_type: 'kulkas',
  ingredient_condition: 'baik',
  supplier_source: 'resmi'
}));
formData.append('cook_start_at', '2026-05-16 10:00:00');
formData.append('serve_planned_at', '2026-05-16 12:00:00');
formData.append('distribute_at', '2026-05-16 12:30:00');
formData.append('image', fileInput.files[0]); // optional

fetch('http://localhost:8000/api/submissions', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 23,
    "sppg_id": 1,
    "status": "processing",
    "created_at": "2026-05-16T10:30:00Z"
  },
  "message": "Meal submission created successfully"
}
```

### 3. Get Submission Status (Polling)
```javascript
// Frontend - Poll setiap 2 detik
const pollStatus = (submissionId) => {
  const interval = setInterval(async () => {
    const res = await fetch(`http://localhost:8000/api/submissions/${submissionId}/status`);
    const data = await res.json();
    
    console.log('Status:', data.data.status);
    
    if (data.data.status === 'completed' || data.data.status === 'failed') {
      clearInterval(interval);
      console.log('Processing selesai!');
      console.log('Result:', data.data);
    }
  }, 2000);
};

pollStatus(23);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 23,
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
  "message": "Submission status retrieved successfully"
}
```

### 4. Get Dashboard Stats
```javascript
// Frontend
fetch('http://localhost:8000/api/dashboard/stats')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_submissions": 23,
    "aman_count": 15,
    "perhatian_count": 6,
    "bahaya_count": 2,
    "average_score": 82.5,
    "processing_count": 1
  },
  "message": "Dashboard stats retrieved successfully"
}
```

---

## 🖼️ Image Upload

### Frontend Implementation
```javascript
// Handle file upload
const handleImageUpload = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Validasi
  if (file.size > 5 * 1024 * 1024) { // 5MB
    alert('File terlalu besar (max 5MB)');
    return;
  }
  
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    alert('Format harus JPG, PNG, atau WebP');
    return;
  }
  
  return formData;
};
```

### Backend Storage
- **Path**: `storage/app/public/submissions/`
- **URL**: `http://localhost:8000/storage/submissions/{filename}`
- **Max Size**: 5MB
- **Formats**: JPG, PNG, WebP

---

## ⏱️ Polling Strategy

Untuk menunggu hasil AI processing:

```javascript
// Option 1: Simple Polling (setiap 2 detik)
const pollStatus = async (submissionId, maxAttempts = 30) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const res = await fetch(`http://localhost:8000/api/submissions/${submissionId}/status`);
    const data = await res.json();
    
    if (data.data.status === 'completed' || data.data.status === 'failed') {
      return data.data;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  }
  
  throw new Error('Processing timeout');
};

// Option 2: Exponential Backoff
const pollStatusWithBackoff = async (submissionId) => {
  let delay = 1000; // Start with 1 second
  let attempts = 0;
  
  while (attempts < 20) {
    const res = await fetch(`http://localhost:8000/api/submissions/${submissionId}/status`);
    const data = await res.json();
    
    if (data.data.status === 'completed' || data.data.status === 'failed') {
      return data.data;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, 10000); // Max 10 seconds
    attempts++;
  }
  
  throw new Error('Processing timeout');
};
```

---

## 🔄 Error Handling

### Common Errors

**1. CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Pastikan backend running dan FRONTEND_URL di .env benar

**2. 422 Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "sppg_id": ["The sppg id field is required."]
  }
}
```
**Solution**: Pastikan semua required fields terisi

**3. 500 Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
**Solution**: Cek backend logs: `backend/storage/logs/laravel.log`

### Frontend Error Handler
```javascript
const handleApiError = (error) => {
  if (error.response?.status === 422) {
    // Validation error
    console.error('Validation errors:', error.response.data.errors);
  } else if (error.response?.status === 500) {
    // Server error
    console.error('Server error:', error.response.data.message);
  } else if (error.code === 'ECONNREFUSED') {
    // Backend not running
    console.error('Backend not running');
  } else {
    console.error('Unknown error:', error.message);
  }
};
```

---

## 🧪 Testing Integration

### Manual Testing Checklist

- [ ] Backend running: `http://localhost:8000`
- [ ] Frontend running: `http://localhost:5173`
- [ ] Get SPPG list works
- [ ] Submit meal works
- [ ] Status polling works
- [ ] Dashboard stats works
- [ ] Image upload works
- [ ] Error handling works

### Postman Collection

Import ke Postman untuk testing:

```json
{
  "info": {
    "name": "NutriGuard API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get SPPG",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/sppg"
      }
    },
    {
      "name": "Submit Meal",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/submissions",
        "body": {
          "mode": "formdata",
          "formdata": [
            {"key": "sppg_id", "value": "1"},
            {"key": "menu_items", "value": "[]"},
            {"key": "sanitation_check", "value": "{}"}
          ]
        }
      }
    }
  ]
}
```

---

## 📊 Response Format Standard

Semua API responses mengikuti format:

```json
{
  "success": true/false,
  "data": {...},
  "message": "string"
}
```

---

## 🚀 Deployment Integration

### Environment Variables

**Frontend (.env.local)**
```
REACT_APP_API_URL=https://api.yourdomain.com
```

**Backend (.env)**
```
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### CORS untuk Production
Update `backend/bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
})
```

---

## 📞 Support

Jika ada masalah integrasi:
1. Cek backend logs: `backend/storage/logs/laravel.log`
2. Cek browser console: F12 → Console
3. Verifikasi API endpoints di Postman
4. Pastikan CORS configuration benar

---

**Status**: ✅ Ready for integration!
