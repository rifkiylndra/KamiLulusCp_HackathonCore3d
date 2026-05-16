# Testing Guide - Scoring Engine

## Quick Start

### 1. Test Case 1: Perfect Submission (AMAN)
Menguji submission dengan semua kriteria terpenuhi.

**URL:**
```
GET http://127.0.0.1:8000/api/scoring-test/perfect
```

**Expected Result:**
```json
{
  "test_case": "Perfect Submission (AMAN)",
  "submission_id": 1,
  "result": {
    "nutrition_score": 100,
    "safety_score": 100,
    "sanitation_score": 100,
    "final_score": 100,
    "status": "AMAN",
    "immediate_action_required": false,
    "violations": [],
    "corrective_feedback": {
      "immediate_actions": [],
      "tomorrow_improvements": [],
      "routine_notes": [...]
    }
  }
}
```

---

### 2. Test Case 2: Hard Rule Violation (BAHAYA)
Menguji submission dengan holding time > 4 jam.

**URL:**
```
GET http://127.0.0.1:8000/api/scoring-test/hard-rule-violation
```

**Expected Result:**
```json
{
  "test_case": "Hard Rule Violation (BAHAYA)",
  "submission_id": 2,
  "result": {
    "nutrition_score": 100,
    "safety_score": 30,
    "sanitation_score": 100,
    "final_score": 68,
    "status": "BAHAYA",
    "immediate_action_required": true,
    "violations": [
      {
        "dimension": "SAFETY",
        "severity": "CRITICAL",
        "description": "Waktu penyimpanan makanan melebihi 4 jam (6 jam). Risiko pertumbuhan bakteri patogen sangat tinggi.",
        "corrective_action": "Segera kurangi waktu penyimpanan atau tingkatkan suhu penyimpanan..."
      }
    ]
  }
}
```

---

### 3. Test Case 3: Poor Nutrition (PERHATIAN)
Menguji submission dengan menu tidak lengkap (hanya carbs).

**URL:**
```
GET http://127.0.0.1:8000/api/scoring-test/poor-nutrition
```

**Expected Result:**
```json
{
  "test_case": "Poor Nutrition (PERHATIAN)",
  "submission_id": 3,
  "result": {
    "nutrition_score": 15,
    "safety_score": 100,
    "sanitation_score": 100,
    "final_score": 63,
    "status": "PERHATIAN",
    "immediate_action_required": false,
    "violations": [
      {
        "dimension": "NUTRITION",
        "severity": "HIGH",
        "description": "Menu makanan kurang lengkap dari segi gizi...",
        "corrective_action": "Tambahkan variasi menu dengan memastikan ada protein..."
      }
    ]
  }
}
```

---

### 4. Test Case 4: Poor Sanitation (BAHAYA)
Menguji submission dengan sanitasi buruk.

**URL:**
```
GET http://127.0.0.1:8000/api/scoring-test/poor-sanitation
```

**Expected Result:**
```json
{
  "test_case": "Poor Sanitation (BAHAYA)",
  "submission_id": 4,
  "result": {
    "nutrition_score": 100,
    "safety_score": 100,
    "sanitation_score": 0,
    "final_score": 80,
    "status": "AMAN",
    "immediate_action_required": false,
    "violations": [
      {
        "dimension": "SANITATION",
        "severity": "HIGH",
        "description": "Standar sanitasi dan kebersihan tidak terpenuhi...",
        "corrective_action": "Tingkatkan protokol kebersihan..."
      }
    ]
  }
}
```

---

### 5. Score Specific Submission
Menghitung skor untuk submission tertentu.

**URL:**
```
GET http://127.0.0.1:8000/api/scoring-test/score/{submissionId}
```

**Example:**
```
GET http://127.0.0.1:8000/api/scoring-test/score/1
```

**Response:**
```json
{
  "success": true,
  "submission_id": 1,
  "result": {
    "nutrition_score": 100,
    "safety_score": 100,
    "sanitation_score": 100,
    "final_score": 100,
    "status": "AMAN",
    ...
  }
}
```

---

### 6. List All Test Submissions
Menampilkan semua test submissions dengan scoring result.

**URL:**
```
GET http://127.0.0.1:8000/api/scoring-test/list
```

**Response:**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": 1,
      "sppg": "Test School Perfect",
      "menu_name": "Menu Sehat Lengkap",
      "created_at": "2026-05-16T...",
      "scoring_result": {
        "nutrition_score": 100,
        "safety_score": 100,
        "sanitation_score": 100,
        "final_score": 100,
        "status": "AMAN",
        ...
      }
    },
    ...
  ]
}
```

---

## Testing dengan cURL

### Test Perfect Submission
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/perfect" \
  -H "Accept: application/json"
```

### Test Hard Rule Violation
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/hard-rule-violation" \
  -H "Accept: application/json"
```

### Test Poor Nutrition
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/poor-nutrition" \
  -H "Accept: application/json"
```

### Test Poor Sanitation
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/poor-sanitation" \
  -H "Accept: application/json"
```

### Score Specific Submission
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/score/1" \
  -H "Accept: application/json"
```

### List All Test Submissions
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/list" \
  -H "Accept: application/json"
```

---

## Testing dengan Postman

### 1. Import Collection
Buat collection baru di Postman dengan requests berikut:

### 2. Create Requests

**Request 1: Perfect Submission**
- Method: GET
- URL: `{{base_url}}/api/scoring-test/perfect`
- Headers: `Accept: application/json`

**Request 2: Hard Rule Violation**
- Method: GET
- URL: `{{base_url}}/api/scoring-test/hard-rule-violation`
- Headers: `Accept: application/json`

**Request 3: Poor Nutrition**
- Method: GET
- URL: `{{base_url}}/api/scoring-test/poor-nutrition`
- Headers: `Accept: application/json`

**Request 4: Poor Sanitation**
- Method: GET
- URL: `{{base_url}}/api/scoring-test/poor-sanitation`
- Headers: `Accept: application/json`

**Request 5: Score Submission**
- Method: GET
- URL: `{{base_url}}/api/scoring-test/score/1`
- Headers: `Accept: application/json`

**Request 6: List Test Submissions**
- Method: GET
- URL: `{{base_url}}/api/scoring-test/list`
- Headers: `Accept: application/json`

### 3. Set Environment Variable
```
base_url = http://127.0.0.1:8000
```

---

## Understanding the Results

### Status Meanings

| Status | Score Range | Meaning |
|--------|-------------|---------|
| **AMAN** | >= 75 | Aman untuk disajikan, tidak ada masalah |
| **PERHATIAN** | 60-74 | Ada beberapa masalah, perlu perbaikan |
| **BAHAYA** | < 60 | Tidak aman, perlu tindakan segera |

### Score Components

**Nutrition Score (40% weight)**
- Evaluasi variasi menu
- Cek ada protein, carbs, vegetables, fruits
- Score: 0-100

**Safety Score (40% weight)**
- Evaluasi waktu penyimpanan
- Cek distribution delay
- Cek dokumentasi foto
- Score: 0-100

**Sanitation Score (20% weight)**
- Evaluasi APD dan kebersihan
- Cek tipe penyimpanan
- Cek kondisi bahan
- Cek sumber supplier
- Score: 0-100

### Violations

Setiap violation memiliki:
- **dimension**: NUTRITION, SAFETY, atau SANITATION
- **severity**: CRITICAL, HIGH, atau MEDIUM
- **description**: Penjelasan masalah
- **corrective_action**: Tindakan perbaikan

### Corrective Feedback

Feedback dibagi menjadi 3 kategori:
- **immediate_actions**: Tindakan segera yang harus dilakukan
- **tomorrow_improvements**: Perbaikan untuk hari esok
- **routine_notes**: Catatan rutin untuk diterapkan

---

## Manual Testing Steps

### Step 1: Run Perfect Test
```
1. Buka browser
2. Akses: http://127.0.0.1:8000/api/scoring-test/perfect
3. Lihat hasilnya - seharusnya AMAN dengan score 100
```

### Step 2: Run Hard Rule Violation Test
```
1. Akses: http://127.0.0.1:8000/api/scoring-test/hard-rule-violation
2. Lihat hasilnya - seharusnya BAHAYA karena holding time > 4 jam
3. Perhatikan violation dengan severity CRITICAL
```

### Step 3: Run Poor Nutrition Test
```
1. Akses: http://127.0.0.1:8000/api/scoring-test/poor-nutrition
2. Lihat hasilnya - seharusnya PERHATIAN karena menu tidak lengkap
3. Perhatikan nutrition score yang rendah
```

### Step 4: Run Poor Sanitation Test
```
1. Akses: http://127.0.0.1:8000/api/scoring-test/poor-sanitation
2. Lihat hasilnya - seharusnya ada sanitation violation
3. Perhatikan sanitation score yang rendah
```

### Step 5: List All Tests
```
1. Akses: http://127.0.0.1:8000/api/scoring-test/list
2. Lihat semua test submissions yang sudah dibuat
3. Bandingkan scoring results dari setiap test
```

---

## Troubleshooting

### Issue: 404 Not Found
**Solution:** Pastikan Laravel server sudah running dan routes sudah di-register

### Issue: 500 Internal Server Error
**Solution:** Check Laravel logs di `storage/logs/laravel.log`

### Issue: Data tidak sesuai ekspektasi
**Solution:** 
1. Verifikasi database sudah di-migrate
2. Check data di database menggunakan `php artisan tinker`
3. Verifikasi ScoringEngine logic

### Issue: Submission tidak ditemukan
**Solution:** Gunakan endpoint `/api/scoring-test/list` untuk melihat submission IDs yang tersedia

---

## Advanced Testing

### Test dengan Custom Data
Anda bisa membuat submission custom dengan POST ke `/api/submissions`:

```bash
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "sppg_id": 1,
    "menu_name": "Custom Menu",
    "portion_count": 50,
    "cook_start_at": "2026-05-16 10:00:00",
    "serve_planned_at": "2026-05-16 12:00:00",
    "ingredients": [
      {
        "ingredient_name": "Ayam",
        "quantity_gram": 150,
        "category": "protein"
      }
    ],
    "sanitation": {
      "apd_used": true,
      "kitchen_cleaned": true,
      "storage_type": "freezer",
      "ingredient_condition": "baik",
      "supplier_source": "resmi"
    }
  }'
```

Kemudian score dengan:
```bash
curl -X GET "http://127.0.0.1:8000/api/scoring-test/score/{submission_id}" \
  -H "Accept: application/json"
```

---

## Next Steps

1. Jalankan semua test cases
2. Verifikasi hasil sesuai ekspektasi
3. Coba buat custom submissions
4. Integrasikan dengan frontend
5. Implementasikan real-time scoring

---

## Support

Jika ada pertanyaan atau issue, check:
- `backend/SCORING_ENGINE.md` - Dokumentasi teknis
- `backend/app/Services/ScoringEngine.php` - Source code
- `backend/tests/Unit/ScoringEngineTest.php` - Unit tests
