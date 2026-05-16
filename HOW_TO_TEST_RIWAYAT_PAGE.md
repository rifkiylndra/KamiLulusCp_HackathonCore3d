# 🧪 How to Test RiwayatPage

## Quick Test Steps

### Step 1: Open the Page
1. Go to: **http://localhost:5174**
2. Click **"Laporan"** in the navigation bar
3. Or directly visit: **http://localhost:5174/laporan**

### Step 2: Check What You Should See

#### ✅ Top Section - Stat Cards (4 cards)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Laporan Bulan   │ Status AMAN     │ Status          │ Status BAHAYA   │
│ Ini             │                 │ PERHATIAN       │                 │
│ 20              │ 3               │ 9               │ 8               │
│ [Aktif]         │ [Optimal]       │ [Perlu Cek]     │ [Mendesak]      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### ✅ Middle Section - Charts (2 charts side by side)
```
┌────────────────────────────────────┬──────────────────────────┐
│ Tren Kepatuhan 7 Hari Terakhir     │ Distribusi Status        │
│                                    │ Akun Ini                 │
│ [Line Chart]                       │ [Pie Chart]              │
│ - GIZI (green line)                │ - AMAN: 15%              │
│ - KEAMANAN (dark green line)       │ - PERHATIAN: 45%         │
│ - SANITASI (gray dashed line)      │ - BAHAYA: 40%            │
└────────────────────────────────────┴──────────────────────────┘
```

#### ✅ Bottom Section - SPPG Leaderboard Table
```
┌──────┬─────────────────────────────┬──────────────┬──────────────┬──────────┬─────────────┐
│ RANK │ SPPG / LOKASI               │ SKOR         │ TOTAL        │ STATUS   │ TERAKHIR    │
│      │                             │ RATA-RATA    │ LAPORAN      │          │ SUBMIT      │
├──────┼─────────────────────────────┼──────────────┼──────────────┼──────────┼─────────────┤
│  🥇  │ SPPG Hub 01 - Jakarta Pusat │ ████░░ 69.5  │ 20           │ POOR     │ 16 Mei,     │
│   1  │ Jakarta Pusat, DKI Jakarta  │              │ 3A 9P 8B     │          │ 16:27       │
├──────┼─────────────────────────────┼──────────────┼──────────────┼──────────┼─────────────┤
│  🥈  │ SPPG Hub 02 - Jakarta       │ Belum ada    │ 0            │ NO DATA  │ Belum ada   │
│   2  │ Selatan                     │ data         │              │          │             │
├──────┼─────────────────────────────┼──────────────┼──────────────┼──────────┼─────────────┤
│  🥉  │ SPPG Hub 03 - Jakarta Timur │ Belum ada    │ 0            │ NO DATA  │ Belum ada   │
│   3  │                             │ data         │              │          │             │
├──────┼─────────────────────────────┼──────────────┼──────────────┼──────────┼─────────────┤
│   4  │ SPPG Hub 04 - Jakarta Barat │ Belum ada    │ 0            │ NO DATA  │ Belum ada   │
│      │                             │ data         │              │          │             │
└──────┴─────────────────────────────┴──────────────┴──────────────┴──────────┴─────────────┘
```

### Step 3: Test Interactive Features

#### 🔍 Search Functionality
1. Type in search box: **"Jakarta Pusat"**
2. Should filter to show only SPPG Hub 01
3. Clear search to see all 4 SPPG again

#### 📄 Pagination
1. Currently shows all 4 SPPG on page 1
2. Pagination buttons at bottom (will be useful when more SPPG added)

#### 🎨 Visual Elements
- **Top 3 ranks** should have medal badges (🥇🥈🥉)
- **Score bars** should be colored:
  - Green: 90-100
  - Dark green: 80-89
  - Amber: 70-79
  - Red: 1-69
  - Gray: 0 (no data)
- **Status badges** should be colored:
  - EXCELLENT: Green
  - GOOD: Dark green
  - FAIR: Amber
  - POOR: Red
  - NO_DATA: Gray

### Step 4: Check Browser Console (F12)

#### ✅ Expected Console Output:
```
🔄 Fetching riwayat data...
✅ Monthly stats: {total_monthly: 20, aman: 3, perhatian: 9, bahaya: 8}
✅ Weekly trend: [{day: "MIN", gizi: 70, keamanan: 68, sanitasi: 71}, ...]
✅ Status distribution: {distribution: [...], total: 20}
✅ SPPG leaderboard: [{id: 4, name: "SPPG Hub 01...", rank: 1, ...}, ...]
```

#### ❌ If You See Errors:
The page will show a **red error banner** at the top with the error message and a "Reload Page" button.

### Step 5: Alternative Test (API Test Page)

If the main page has issues, test the API directly:

1. Open: **http://localhost:5174/test-riwayat-api.html**
2. Click **"Test All Endpoints"** button
3. All 4 endpoints should show **✓ Success**

## Common Issues & Solutions

### Issue 1: Page Shows Loading Forever
**Solution:**
- Check backend is running: `php artisan serve --host=0.0.0.0 --port=8000`
- Check frontend is running: `npm run dev`
- Test API: `curl http://localhost:8000/api/test-cors`

### Issue 2: CORS Error in Console
**Solution:**
- Backend should have CORS enabled (already configured)
- Check `backend/config/cors.php` has `'allowed_origins' => ['*']`

### Issue 3: Empty Data / No SPPG Shown
**Solution:**
- Check database has SPPG data
- Run: `php artisan db:seed` (if needed)
- Verify: `curl http://localhost:8000/api/dashboard/sppg-leaderboard`

### Issue 4: Charts Not Displaying
**Solution:**
- Check browser console for errors
- Verify recharts library is installed: `npm list recharts`
- If missing: `npm install recharts`

## Expected Data (Current Database)

### Monthly Stats
- **Total Submissions:** 20
- **AMAN:** 3 (15%)
- **PERHATIAN:** 9 (45%)
- **BAHAYA:** 8 (40%)

### SPPG Leaderboard
1. **SPPG Hub 01 - Jakarta Pusat**
   - Average Score: 69.5
   - Total Submissions: 20
   - Status: POOR
   - Breakdown: 3 AMAN, 9 PERHATIAN, 8 BAHAYA

2. **SPPG Hub 02 - Jakarta Selatan**
   - No submissions yet
   - Status: NO_DATA

3. **SPPG Hub 03 - Jakarta Timur**
   - No submissions yet
   - Status: NO_DATA

4. **SPPG Hub 04 - Jakarta Barat**
   - No submissions yet
   - Status: NO_DATA

## Success Criteria

✅ Page loads without errors
✅ All 4 stat cards display correct numbers
✅ Line chart shows 7 days of data
✅ Pie chart shows distribution
✅ Leaderboard table shows 4 SPPG
✅ Search filters SPPG correctly
✅ No console errors
✅ Emergency banner shows (because BAHAYA > 0)

---

**Ready to test!** 🚀

If you encounter any issues, check the browser console (F12) and the error banner on the page for details.
