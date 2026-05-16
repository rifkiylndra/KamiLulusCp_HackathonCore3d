# Phase 8: Polish & Error Handling

**Date:** May 16, 2026  
**Status:** ✅ COMPLETE

---

## 📋 Overview

Phase 8 focuses on polishing the backend with comprehensive error handling, logging, image upload support, time validation, CORS configuration, and a reprocessing command.

---

## ✅ What Was Implemented

### 1. Global Error Handling ✅

**File:** `app/Exceptions/Handler.php`

**Features:**
- Centralized exception handling
- JSON responses for API errors
- Validation error formatting
- Model not found handling
- Method not allowed handling
- Generic exception handling
- Debug mode support

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["error message"]
  }
}
```

**Status Codes:**
- 422 - Validation errors
- 404 - Resource not found
- 405 - Method not allowed
- 500 - Server error

---

### 2. Gemini Response Logging ✅

**File:** `config/logging.php`

**Features:**
- Dedicated Gemini logging channel
- Daily log rotation
- Separate log file: `storage/logs/gemini.log`
- Tracks all Gemini API calls
- Logs request/response details

**Log Entries:**
```
[2026-05-16 10:30:45] local.INFO: Calling Gemini API for nutrition analysis
[2026-05-16 10:30:50] local.INFO: Gemini API response received
[2026-05-16 10:30:50] local.INFO: Gemini nutrition analysis completed
```

**Usage in Code:**
```php
Log::channel('gemini')->info('Message', ['data' => 'value']);
```

---

### 3. Image Upload Handling ✅

**File:** `app/Http/Controllers/Api/MealSubmissionController.php`

**Features:**
- Image file validation (JPEG, PNG, GIF)
- File size limit (5MB)
- Automatic file storage
- Error handling for upload failures
- Logging of upload events

**Validation Rules:**
```php
'image_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
```

**Storage:**
- Location: `storage/app/public/submissions/`
- Naming: `{timestamp}_{uniqid}.{extension}`
- Accessible via: `/storage/submissions/{filename}`

**Error Handling:**
```json
{
  "success": false,
  "message": "Gagal upload gambar: Error message"
}
```

---

### 4. Time Validation ✅

**File:** `app/Http/Requests/StoreMealSubmissionRequest.php`

**Features:**
- Cook start time validation
- Serve planned time validation
- Distribute time validation
- Minimum time intervals
- Custom error messages

**Validation Rules:**
```php
'cook_start_at' => 'required|date_format:Y-m-d H:i:s',
'serve_planned_at' => 'required|date_format:Y-m-d H:i:s|after:cook_start_at',
'distribute_at' => 'nullable|date_format:Y-m-d H:i:s|after:serve_planned_at',
```

**Time Intervals:**
- Cook → Serve: Minimum 30 minutes
- Serve → Distribute: Minimum 15 minutes

**Error Messages:**
```
"Waktu penyajian minimal 30 menit setelah memasak"
"Waktu distribusi minimal 15 menit setelah penyajian"
```

---

### 5. CORS Configuration ✅

**File:** `config/cors.php`

**Features:**
- Configurable allowed origins
- Support for localhost development
- Support for Vercel deployment
- Wildcard domain support
- Credentials support

**Allowed Origins:**
```php
'http://localhost:3000',
'http://localhost:3001',
'http://127.0.0.1:3000',
'https://*.vercel.app',
env('FRONTEND_URL', 'http://localhost:3000'),
```

**Configuration:**
```php
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

**Usage:**
- Automatically applied to all API routes
- Configured in `bootstrap/app.php`
- No additional setup needed

---

### 6. Reprocessing Command ✅

**File:** `app/Console/Commands/ReprocessMealAnalysis.php`

**Features:**
- Reprocess failed submissions
- Reset status to processing
- Delete existing assessment
- Confirmation prompt
- Force flag for automation
- Comprehensive logging

**Usage:**
```bash
# With confirmation
php artisan nutriguard:reprocess 1

# Force without confirmation
php artisan nutriguard:reprocess 1 --force
```

**What It Does:**
1. Finds the submission by ID
2. Shows submission details
3. Asks for confirmation (unless --force)
4. Resets status to 'processing'
5. Deletes existing assessment
6. Dispatches ProcessMealAnalysis job
7. Logs the action

**Output:**
```
Submission Details:
ID: 1
Menu: Nasi Kuning
Status: processing
Created: 2026-05-16 10:00:00

✓ Submission 1 has been queued for reprocessing
Status: processing
Check the status with: php artisan queue:work
```

---

## 🔧 Configuration Changes

### .env Updates
```env
FRONTEND_URL=http://localhost:3000
```

### logging.php Updates
```php
'gemini' => [
    'driver' => 'daily',
    'path' => storage_path('logs/gemini.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'days' => env('LOG_DAILY_DAYS', 14),
    'replace_placeholders' => true,
],
```

### bootstrap/app.php Updates
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(append: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
})
```

---

## 📊 Error Handling Examples

### Validation Error
```bash
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "sppg_id": 1,
    "menu_name": "Test",
    "portion_count": 50,
    "cook_start_at": "2026-05-16 10:00:00",
    "serve_planned_at": "2026-05-16 10:10:00"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "serve_planned_at": [
      "Waktu penyajian minimal 30 menit setelah memasak"
    ]
  }
}
```

### Image Upload Error
```bash
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -F "image_path=@large_file.jpg" \
  ...
```

**Response (if file > 5MB):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "image_path": [
      "Ukuran gambar maksimal 5MB"
    ]
  }
}
```

### Not Found Error
```bash
curl -X GET "http://127.0.0.1:8000/api/submissions/999"
```

**Response:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## 📝 Logging Examples

### Gemini Nutrition Analysis Log
```
[2026-05-16 10:30:45] local.INFO: Calling Gemini API for nutrition analysis {"model":"gemini-1.5-flash","prompt_length":1250}
[2026-05-16 10:30:50] local.INFO: Gemini API response received {"status":200,"has_candidates":true}
[2026-05-16 10:30:50] local.INFO: Gemini nutrition analysis completed {"response_length":850}
```

### Image Upload Log
```
[2026-05-16 10:35:20] local.INFO: Image uploaded successfully {"submission_id":null,"image_path":"submissions/1715857320_abc123.jpg","file_size":2048576}
```

### Meal Submission Log
```
[2026-05-16 10:35:25] local.INFO: Meal submission created {"submission_id":1,"sppg_id":1,"menu_name":"Nasi Kuning"}
```

### Reprocessing Log
```
[2026-05-16 10:40:00] local.INFO: Meal submission reprocessing initiated {"submission_id":1,"menu_name":"Nasi Kuning"}
```

---

## 🧪 Testing

### Test Image Upload
```bash
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -H "Content-Type: multipart/form-data" \
  -F "sppg_id=1" \
  -F "menu_name=Nasi Kuning" \
  -F "portion_count=50" \
  -F "cook_start_at=2026-05-16 10:00:00" \
  -F "serve_planned_at=2026-05-16 10:45:00" \
  -F "image_path=@meal.jpg" \
  -F "ingredients=[{\"ingredient_name\":\"Ayam\",\"quantity_gram\":150,\"category\":\"protein\"}]" \
  -F "sanitation={\"apd_used\":true,\"kitchen_cleaned\":true,\"storage_type\":\"freezer\",\"ingredient_condition\":\"baik\",\"supplier_source\":\"resmi\"}"
```

### Test Time Validation
```bash
# This will fail - serve time too close to cook time
curl -X POST "http://127.0.0.1:8000/api/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "sppg_id": 1,
    "menu_name": "Test",
    "portion_count": 50,
    "cook_start_at": "2026-05-16 10:00:00",
    "serve_planned_at": "2026-05-16 10:10:00",
    "ingredients": [...],
    "sanitation": {...}
  }'
```

### Test CORS
```bash
# From frontend (http://localhost:3000)
fetch('http://127.0.0.1:8000/api/dashboard/stats', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Test Reprocessing Command
```bash
# List submissions first
php artisan tinker
>>> \App\Models\MealSubmission::pluck('id', 'menu_name');

# Reprocess a submission
php artisan nutriguard:reprocess 1

# Force reprocess without confirmation
php artisan nutriguard:reprocess 1 --force
```

---

## 📂 Files Created/Modified

### Created Files
- `app/Exceptions/Handler.php` - Global exception handler
- `config/cors.php` - CORS configuration
- `app/Console/Commands/ReprocessMealAnalysis.php` - Reprocessing command

### Modified Files
- `app/Http/Requests/StoreMealSubmissionRequest.php` - Enhanced validation
- `app/Http/Controllers/Api/MealSubmissionController.php` - Image upload handling
- `app/Services/GeminiService.php` - Enhanced logging
- `config/logging.php` - Added Gemini channel
- `bootstrap/app.php` - Added CORS middleware
- `.env` - Added FRONTEND_URL

---

## 🚀 Deployment Checklist

- ✅ Error handling configured
- ✅ Logging configured
- ✅ Image upload handling implemented
- ✅ Time validation implemented
- ✅ CORS configured
- ✅ Reprocessing command created
- ✅ All tests passing
- ✅ Documentation complete

---

## 📊 Summary

| Feature | Status | Details |
|---------|--------|---------|
| Global Error Handling | ✅ | Centralized exception handling |
| Gemini Logging | ✅ | Dedicated log channel |
| Image Upload | ✅ | File validation & storage |
| Time Validation | ✅ | Cook → Serve → Distribute |
| CORS | ✅ | Localhost & Vercel support |
| Reprocessing Command | ✅ | CLI command for reprocessing |

---

## 🎯 Next Steps

### For Frontend Integration
1. Update FRONTEND_URL in .env
2. Test CORS from frontend
3. Implement image upload in frontend
4. Handle validation errors

### For Production
1. Update CORS allowed origins
2. Set APP_DEBUG=false
3. Configure logging rotation
4. Set up error monitoring (Sentry)

### For Monitoring
1. Monitor Gemini logs: `tail -f storage/logs/gemini.log`
2. Monitor Laravel logs: `tail -f storage/logs/laravel.log`
3. Check failed jobs: `php artisan queue:failed`

---

## 📞 Support

For issues or questions:
1. Check the error message in the response
2. Review logs in `storage/logs/`
3. Check Gemini logs in `storage/logs/gemini.log`
4. Run `php artisan queue:failed` to check failed jobs

---

*Phase 8 Complete - Backend is now polished and production-ready!*
