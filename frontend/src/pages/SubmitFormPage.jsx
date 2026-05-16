import { useState, useRef } from "react";
import {
  Utensils,
  Clock,
  ClipboardList,
  Camera,
  Info,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Upload,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";
import { submitMeal, pollSubmissionStatus, analyzePhotoForIngredients } from "../services/api";

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ["Menu", "Waktu", "Sanitasi"];

  return (
    <div className="flex items-center justify-center mb-8 sm:mb-10 overflow-x-auto pb-2">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;

        return (
          <div key={label} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all
                ${
                  done
                    ? "bg-[#1A8A52] text-white"
                    : active
                    ? "bg-[#0D5C3A] text-white ring-4 ring-[#0D5C3A]/20"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : idx}
              </div>

              <span
                className={`text-[10px] sm:text-xs font-medium whitespace-nowrap
                ${
                  active
                    ? "text-[#0D5C3A]"
                    : done
                    ? "text-[#1A8A52]"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 md:w-28 mx-1 sm:mx-2 mb-4 rounded-full transition-all
                ${done ? "bg-[#1A8A52]" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-[#1A8A52]" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────────
function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#1A8A52] transition-colors pr-10"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ icon, title, badge, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-sm">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        
        <div className="flex items-center gap-2.5">
          <span className="text-[#1A8A52] shrink-0">{icon}</span>

          <h2 className="text-base sm:text-lg font-bold text-[#0D3D25] leading-snug">
            {title}
          </h2>
        </div>

        {badge && (
          <div className="w-full sm:w-auto">
            {badge}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

// ── STEP 1 — Identifikasi Menu ────────────────────────────────────────────────
function StepMenu({ data, setData, onPhotoAnalyzed }) {
  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    
    // Show preview immediately
    const url = URL.createObjectURL(file);
    setPreview(url);
    setData((p) => ({ ...p, foto: file }));
    stopCamera();
    
    // Auto-analyze photo for ingredients
    setAnalyzing(true);
    setAnalysisError("");
    
    try {
      console.log('Starting photo analysis...');
      const analysisResult = await analyzePhotoForIngredients(file);
      console.log('Analysis result:', analysisResult);
      
      // Auto-fill menu name if detected
      if (analysisResult.nama_menu) {
        console.log('Setting menu name:', analysisResult.nama_menu);
        setData((p) => ({ ...p, namaMenu: analysisResult.nama_menu }));
      }
      
      // Pass analysis result to parent component
      if (onPhotoAnalyzed) {
        console.log('Calling onPhotoAnalyzed with:', analysisResult);
        onPhotoAnalyzed(analysisResult);
      }
      
      setAnalyzing(false);
    } catch (error) {
      console.error('Photo analysis failed:', error);
      setAnalysisError(`Analisis gagal: ${error.message}`);
      setAnalyzing(false);
    }
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      // Store stream reference
      streamRef.current = stream;

      // Set camera active first to render video element
      setCameraActive(true);

      // Set video source after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Play video with proper error handling
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Video playing successfully');
              })
              .catch(err => {
                console.error('Play error:', err);
                setCameraError('Tidak bisa memutar video kamera');
              });
          }
        }
      }, 0);
    } catch (error) {
      console.error('Camera error:', error);
      let errorMsg = 'Tidak bisa mengakses kamera';
      
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Kamera tidak ditemukan di device ini.';
      } else if (error.name === 'NotReadableError') {
        errorMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      try {
        const context = canvasRef.current.getContext('2d');
        const video = videoRef.current;
        
        // Calculate 16:9 dimensions based on video width
        const targetWidth = video.videoWidth;
        const targetHeight = Math.round(targetWidth * 9 / 16);
        
        // Set canvas to 16:9 aspect ratio
        canvasRef.current.width = targetWidth;
        canvasRef.current.height = targetHeight;
        
        // Calculate crop to center the video in 16:9 frame
        const sourceHeight = video.videoHeight;
        const sourceWidth = video.videoWidth;
        
        // If video is taller than 16:9, crop top and bottom
        // If video is wider than 16:9, crop left and right
        let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
        
        const videoAspect = sourceWidth / sourceHeight;
        const targetAspect = 16 / 9;
        
        if (videoAspect > targetAspect) {
          // Video is wider, crop sides
          sw = Math.round(sourceHeight * targetAspect);
          sx = (sourceWidth - sw) / 2;
        } else {
          // Video is taller, crop top/bottom
          sh = Math.round(sourceWidth / targetAspect);
          sy = (sourceHeight - sh) / 2;
        }
        
        // Draw video frame to canvas with 16:9 crop
        context.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        
        // Convert canvas to blob
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            handleFile(file);
          }
        }, 'image/jpeg', 0.95);
      } catch (error) {
        console.error('Capture error:', error);
        setCameraError('Gagal mengambil foto');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    setCameraError("");
  };

  return (
    <SectionCard
      icon={<Utensils className="w-5 h-5" />}
      title="Identifikasi Menu"
      
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload zone */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Foto Menu Masakan
          </label>
          
          {cameraActive ? (
            // Camera view - 16:9 aspect ratio
            <div className="border-2 border-solid border-gray-300 rounded-2xl overflow-hidden bg-black relative flex flex-col w-full" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width="100%"
                height="100%"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera error message */}
              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center px-4">
                    <p className="text-red-400 text-sm font-semibold">{cameraError}</p>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
              
              {/* Controls */}
              {!cameraError && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-3 flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-[#1A8A52] hover:bg-[#0D5C3A] text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Ambil Foto
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Upload zone - 16:9 aspect ratio
            <div
              onClick={() => {
                if (!preview && !analyzing) {
                  startCamera();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!analyzing) {
                  handleFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-gray-200 hover:border-[#1A8A52] rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group bg-gray-50 hover:bg-green-50/30 overflow-hidden relative w-full"
              style={{ aspectRatio: '16/9' }}
            >
              {analyzing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-[#1A8A52]/20 border-t-[#1A8A52] rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 font-semibold">Menganalisis foto...</p>
                </div>
              ) : preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setAnalysisError("");
                      setData((p) => ({ ...p, foto: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Hapus
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#1A8A52]" />
                  </div>
                  <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                    Klik untuk ambil foto atau seret gambar ke sini
                  </p>
                </>
              )}
            </div>
          )}

          {/* Analysis error message */}
          {analysisError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{analysisError}</p>
            </div>
          )}

          {/* File input - fallback for file selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Help text */}
          {!cameraActive && !preview && (
            <p className="text-xs text-gray-400 mt-2">
              💡 Klik area foto untuk membuka kamera, atau seret file gambar ke sini
            </p>
          )}
        </div>

        {/* Name + hint */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Nama Menu Utama
            </label>
            <input
              type="text"
              placeholder="Contoh: Nasi Kuning Ayam Lengkuas"
              value={data.namaMenu}
              onChange={(e) => setData((p) => ({ ...p, namaMenu: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1A8A52] transition-colors"
            />
          </div>
          <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-600 leading-relaxed">
              Sistem AI akan secara otomatis mendeteksi komponen bahan baku setelah Anda mengunggah foto menu.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ── STEP 2 — Porsi & Waktu ────────────────────────────────────────────────────
function StepWaktu({ data, setData }) {
  return (
    <SectionCard
      icon={<Clock className="w-5 h-5" />}
      title="Porsi & Waktu"
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Daftar Bahan Utama
          </label>
          <textarea
            rows={4}
            placeholder="Sebutkan bahan utama dan bumbu yang digunakan..."
            value={data.bahan}
            onChange={(e) => setData((p) => ({ ...p, bahan: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1A8A52] transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Porsi", key: "porsi", type: "number", placeholder: "0" },
            { label: "Mulai Masak", key: "mulaiMasak", type: "time", placeholder: "--:-- --" },
            { label: "Est. Saji", key: "estSaji", type: "time", placeholder: "--:-- --" },
            { label: "Distribusi", key: "distribusi", type: "time", placeholder: "--:-- --" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={data[key]}
                onChange={(e) => setData((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#1A8A52] transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Warning - Updated to focus only on serve to distribute */}
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium leading-relaxed">
            Peringatan: Jeda sajian ke distribusi maksimal 4 jam untuk menjaga kualitas nutrisi dan higienitas.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

// ── STEP 3 — Audit Sanitasi ───────────────────────────────────────────────────
function StepSanitasi({ data, setData }) {
  return (
    <SectionCard
      icon={<ClipboardList className="w-5 h-5" />}
      title="Audit Sanitasi & Bahan"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Toggles */}
        <div className="flex flex-col gap-5">
          {[
            { key: "apd", label: "Kelengkapan APD", sub: "Masker, celemek, dan penutup rambut" },
            { key: "kebersihan", label: "Kebersihan Area", sub: "Meja saji dan alat masak steril" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-[#0D3D25]">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <Toggle
                checked={data[key]}
                onChange={(v) => setData((p) => ({ ...p, [key]: v }))}
              />
            </div>
          ))}
        </div>

        {/* Selects */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Kondisi Penyimpanan
            </label>
            <Select
              value={data.kondisiPenyimpanan}
              onChange={(v) => setData((p) => ({ ...p, kondisiPenyimpanan: v }))}
              options={["Kulkas (2°C - 5°C)", "Freezer (-18°C)", "Suhu Ruang", "Tidak Disimpan"]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status Kesegaran Bahan
            </label>
            <Select
              value={data.kesegaran}
              onChange={(v) => setData((p) => ({ ...p, kesegaran: v }))}
              options={["Baik & Segar", "Cukup Baik", "Perlu Pengecekan", "Tidak Layak"]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sumber Bahan Baku
            </label>
            <Select
              value={data.sumberBahan}
              onChange={(v) => setData((p) => ({ ...p, sumberBahan: v }))}
              options={["Supplier Resmi MBG", "Pasar Lokal", "Petani Langsung", "Campuran"]}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SubmitFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [menuData, setMenuData] = useState({
    foto: null,
    namaMenu: "",
  });

  const [waktuData, setWaktuData] = useState({
    bahan: "",
    porsi: "",
    mulaiMasak: "",
    estSaji: "",
    distribusi: "",
  });

  const [sanitasiData, setSanitasiData] = useState({
    apd: false,
    kebersihan: false,
    kondisiPenyimpanan: "Kulkas (2°C - 5°C)",
    kesegaran: "Baik & Segar",
    sumberBahan: "Supplier Resmi MBG",
  });

  const handlePhotoAnalyzed = (analysisResult) => {
    // Auto-fill ingredients from photo analysis
    if (analysisResult.bahan && analysisResult.bahan.length > 0) {
      const bahanText = analysisResult.bahan
        .map(b => `${b.nama} (${b.gram}g)`)
        .join('\n');
      setWaktuData((p) => ({ ...p, bahan: bahanText }));
    }
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate required fields
      if (!menuData.namaMenu.trim()) {
        throw new Error('Nama menu harus diisi');
      }
      if (!waktuData.bahan.trim()) {
        throw new Error('Daftar bahan harus diisi');
      }
      if (!waktuData.porsi) {
        throw new Error('Total porsi harus diisi');
      }
      if (!waktuData.mulaiMasak) {
        throw new Error('Waktu mulai masak harus diisi');
      }
      if (!waktuData.estSaji) {
        throw new Error('Estimasi waktu saji harus diisi');
      }

      // Create FormData object with all form fields in backend format
      const formData = new FormData();
      
      // Required fields - Use first available SPPG ID (4)
      formData.append('sppg_id', '4'); // SPPG Hub 01 - Jakarta Pusat
      formData.append('menu_name', menuData.namaMenu);
      formData.append('portion_count', waktuData.porsi);
      
      // Image
      if (menuData.foto) {
        formData.append('image', menuData.foto);
      }
      
      // Times - convert to ISO format with today's date
      const today = new Date().toISOString().split('T')[0];
      formData.append('cook_start_at', `${today}T${waktuData.mulaiMasak}:00`);
      formData.append('serve_planned_at', `${today}T${waktuData.estSaji}:00`);
      if (waktuData.distribusi) {
        formData.append('distribute_at', `${today}T${waktuData.distribusi}:00`);
      }
      
      // Parse ingredients from bahan text (simple parsing)
      const ingredients = waktuData.bahan
        .split('\n')
        .filter(line => line.trim())
        .map((line, idx) => ({
          ingredient_name: line.trim(),
          quantity_gram: 100, // Default quantity
          category: idx % 5 === 0 ? 'protein' : idx % 5 === 1 ? 'karbohidrat' : idx % 5 === 2 ? 'sayur' : idx % 5 === 3 ? 'lemak' : 'lainnya',
        }));
      
      if (ingredients.length === 0) {
        throw new Error('Minimal harus ada 1 bahan');
      }
      
      // Add ingredients to FormData
      ingredients.forEach((ing, idx) => {
        formData.append(`ingredients[${idx}][ingredient_name]`, ing.ingredient_name);
        formData.append(`ingredients[${idx}][quantity_gram]`, ing.quantity_gram);
        formData.append(`ingredients[${idx}][category]`, ing.category);
      });
      
      // Sanitation data
      formData.append('sanitation[apd_used]', sanitasiData.apd ? '1' : '0');
      formData.append('sanitation[kitchen_cleaned]', sanitasiData.kebersihan ? '1' : '0');
      
      // Map kondisiPenyimpanan to backend format
      const storageMap = {
        'Kulkas (2°C - 5°C)': 'kulkas',
        'Freezer (-18°C)': 'freezer',
        'Suhu Ruang': 'suhu_ruang',
        'Tidak Disimpan': 'suhu_ruang',
      };
      formData.append('sanitation[storage_type]', storageMap[sanitasiData.kondisiPenyimpanan] || 'kulkas');
      
      // Map kesegaran to backend format
      const conditionMap = {
        'Baik & Segar': 'baik',
        'Cukup Baik': 'baik',
        'Perlu Pengecekan': 'rusak',
        'Tidak Layak': 'mencurigakan',
      };
      formData.append('sanitation[ingredient_condition]', conditionMap[sanitasiData.kesegaran] || 'baik');
      
      // Map sumberBahan to backend format
      const supplierMap = {
        'Supplier Resmi MBG': 'resmi',
        'Pasar Lokal': 'pasar',
        'Petani Langsung': 'lainnya',
        'Campuran': 'lainnya',
      };
      formData.append('sanitation[supplier_source]', supplierMap[sanitasiData.sumberBahan] || 'resmi');

      // Submit meal to backend
      const submissionData = await submitMeal(formData);
      const submissionId = submissionData.submission_id;

      // Poll for completion
      await pollSubmissionStatus(submissionId);

      // Navigate to result page with actual submission ID
      setLoading(false);
      navigate(`/result/${submissionId}`);
    } catch (error) {
      setLoading(false);
      alert(`Terjadi kesalahan: ${error.message}`);
      console.error('Submission error:', error);
    }
  };

  const now = new Date();

  const timeStr =
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF7F1] to-gray-50 font-sans antialiased flex flex-col overflow-x-hidden">
      
      <NavbarLogin activePage="submit" />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Page Header */}
          <div className="mb-8 pt-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D3D25] tracking-tight mb-2 leading-tight">
              Laporan Dapur Harian
            </h1>

            <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Pastikan setiap sajian memenuhi standar keamanan pangan nasional.
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator current={step} />

          {/* Step Content */}
          <div className="mb-6">
            {step === 1 && (
              <StepMenu
                data={menuData}
                setData={setMenuData}
                onPhotoAnalyzed={handlePhotoAnalyzed}
              />
            )}

            {step === 2 && (
              <StepWaktu
                data={waktuData}
                setData={setWaktuData}
              />
            )}

            {step === 3 && (
              <StepSanitasi
                data={sanitasiData}
                setData={setSanitasiData}
              />
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-sm">
            
            {/* Left Info */}
            <div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {step < 3 ? (
                  <span className="text-[#1A8A52] font-semibold">
                    DRAFT
                  </span>
                ) : (
                  <span className="text-[#1A8A52] font-semibold">
                    SIAP KIRIM
                  </span>
                )}{" "}
                
                <span className="text-gray-300 mx-1 hidden sm:inline">
                  |
                </span>

                <span className="block sm:inline mt-1 sm:mt-0">
                  Terakhir diubah: {timeStr}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="w-full sm:w-auto text-sm font-semibold text-gray-500 hover:text-[#0D3D25] px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analisis Kelayakan Menu (AI)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}