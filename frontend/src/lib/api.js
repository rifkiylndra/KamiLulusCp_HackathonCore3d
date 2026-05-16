import axios from 'axios'

// ─── Axios Instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
})

// ─── Interceptor: tangkap error global ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || 'Terjadi kesalahan. Coba lagi.'
    console.error('[API Error]', message, error)
    return Promise.reject(error)
  }
)

// ─── SPPG ─────────────────────────────────────────────────────────
// GET /api/sppg — daftar semua SPPG (untuk dropdown form)
export const getSppgList = () =>
  api.get('/sppg').then((r) => r.data)

// POST /api/sppg — tambah SPPG baru
export const createSppg = (data) =>
  api.post('/sppg', data).then((r) => r.data)

// ─── Submissions ──────────────────────────────────────────────────
// POST /api/submissions — kirim form menu + sanitasi (multipart/form-data)
export const createSubmission = (formData) =>
  api
    .post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)

// GET /api/submissions — daftar semua submission (opsional filter)
export const getSubmissions = (params = {}) =>
  api.get('/submissions', { params }).then((r) => r.data)

// GET /api/submissions/{id} — detail lengkap satu submission
export const getSubmissionDetail = (id) =>
  api.get(`/submissions/${id}`).then((r) => r.data)

// GET /api/submissions/{id}/status — polling status AI (pending/processing/completed/failed)
export const getSubmissionStatus = (id) =>
  api.get(`/submissions/${id}/status`).then((r) => r.data)

// ─── Dashboard ────────────────────────────────────────────────────
// GET /api/dashboard/stats — statistik hari ini + weekly trend
export const getDashboardStats = () =>
  api.get('/dashboard/stats').then((r) => r.data)

// GET /api/dashboard/recent-sppg — 10 SPPG terbaru yang submit hari ini
export const getRecentSppg = () =>
  api.get('/dashboard/recent-sppg').then((r) => r.data)

// ─── Vision ───────────────────────────────────────────────────────
// POST /api/vision/analyze-photo — analisis foto menu via Gemini Vision
export const analyzePhoto = (formData) =>
  api
    .post('/vision/analyze-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)

// ─── Scoring Test (dev only) ───────────────────────────────────────
export const scoringTest = {
  perfect: () => api.get('/scoring-test/perfect').then((r) => r.data),
  hardRuleViolation: () => api.get('/scoring-test/hard-rule-violation').then((r) => r.data),
  poorNutrition: () => api.get('/scoring-test/poor-nutrition').then((r) => r.data),
  poorSanitation: () => api.get('/scoring-test/poor-sanitation').then((r) => r.data),
  scoreSubmission: (id) => api.get(`/scoring-test/score/${id}`).then((r) => r.data),
  list: () => api.get('/scoring-test/list').then((r) => r.data),
}

export default api