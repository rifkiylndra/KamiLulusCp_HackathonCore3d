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
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ["Menu", "Waktu", "Sanitasi"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${done ? "bg-[#1A8A52] text-white" : active ? "bg-[#0D5C3A] text-white ring-4 ring-[#0D5C3A]/20" : "bg-gray-100 text-gray-400"}`}
              >
                {done ? <CheckCircle className="w-5 h-5" /> : idx}
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-[#0D5C3A]" : done ? "text-[#1A8A52]" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-28 mx-2 mb-4 rounded-full transition-all ${done ? "bg-[#1A8A52]" : "bg-gray-200"}`}
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
    <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[#1A8A52]">{icon}</span>
          <h2 className="text-lg font-bold text-[#0D3D25]">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ── STEP 1 — Identifikasi Menu (Live Camera Integration) ──────────────────────
function StepMenu({ data, setData }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [preview, setPreview] = useState(data.previewUrl || null);
  const [visionLoading, setVisionLoading] = useState(false);

  const openCamera = async () => {
    setIsCameraOpen(true);
    setPreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Kamera belakang HP
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal mengakses kamera harian SPPG:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL("image/jpeg");
    setPreview(photoDataUrl);

    // Mematikan aliran kamera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);

    // Ambil string Base64 murni untuk dikirim ke Laravel API
    const base64Image = photoDataUrl.split(",")[1];
    
    // Simpan ke state form utama
    setData((p) => ({ ...p, fotoBase64: base64Image, previewUrl: photoDataUrl }));

    // Trigger Analisis Gemini Vision Otomatis via Backend Laravel
    executeVisionAnalysis(base64Image);
  };

  const executeVisionAnalysis = async (base64String) => {
    setVisionLoading(true);
    try {
      const resp = await fetch("/api/vision-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64String,
          mime_type: "image/jpeg"
        })
      });

      const result = await resp.json();
      if (result.status === "success" && result.data) {
        const aiPayload = result.data;
        
        // Auto-fill nama menu utama ke State
        if (aiPayload.nama_menu) {
          setData((p) => ({ ...p, namaMenu: aiPayload.nama_menu }));
        }
        
        // Auto-fill data bahan terdeteksi ke State StepWaktu
        if (aiPayload.bahan && Array.isArray(aiPayload.bahan)) {
          const formattedBahan = aiPayload.bahan
            .map((b) => `${b.nama} ${b.gram}g`)
            .join(", ");
          
          // Mengirimkan event penulisan data bahan lintas komponen secara aman
          window.dispatchEvent(new CustomEvent("ai-autofill-bahan", { detail: formattedBahan }));
        }
      }
    } catch (err) {
      console.error("Gagal memproses ekstraksi Gemini Vision:", err);
    } finally {
      setVisionLoading(false);
    }
  };

  return (
    <SectionCard
      icon={<Utensils className="w-5 h-5" />}
      title="Identifikasi Menu"
      badge={
        <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-[#1A8A52] text-xs font-semibold px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          AI Auto-fill active (Gemini Vision)
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Camera capture interface */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Ambil Foto Menu Masakan
          </label>
          
          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl h-52 flex flex-col items-center justify-center bg-gray-50 overflow-hidden group">
            {isCameraOpen ? (
              <div className="w-full h-full relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" /> Ambil Foto
                </button>
              </div>
            ) : preview ? (
              <div className="w-full h-full relative">
                <img src={preview} alt="preview menu masakan" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={openCamera}
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-sm transition-all"
                  title="Foto Ulang"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {visionLoading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-medium">Gemini mengekstrak bahan...</span>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={openCamera} className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full transition-all hover:bg-green-50/30">
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#1A8A52]" />
                </div>
                <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                  Ketuk untuk mengaktifkan kamera SPPG
                </p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
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
              Kamera akan langsung mengambil visual hidangan. Sistem AI Gemini akan membaca isi piring dan menuliskan komposisi gramasi bahan secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ── STEP 2 — Porsi & Waktu (Listener untuk AI Auto-fill) ──────────────────────
function StepWaktu({ data, setData }) {
  // Menerima data bahan otomatis jika diekstrak dari StepMenu sebelumnya
  useRef(() => {
    const handleAutofill = (e) => {
      setData((p) => ({ ...p, bahan: e.detail }));
    };
    window.addEventListener("ai-autofill-bahan", handleAutofill);
    return () => window.removeEventListener("ai-autofill-bahan", handleAutofill);
  }, [setData]);

  return (
    <SectionCard
      icon={<Clock className="w-5 h-5" />}
      title="Porsi & Waktu"
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Daftar Bahan Utama
            </label>
            {data.bahan && (
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Auto-filled by AI
              </span>
            )}
          </div>
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

        {/* Warning */}
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium leading-relaxed">
            Peringatan: Jeda masak ke sajian maksimal 4 jam untuk menjaga kualitas nutrisi dan higienitas. [cite: 18, 41]
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

// ── Main Page (Koneksi Produksi ke API Laravel) ──────────────────────────────
export default function SubmitFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [menuData, setMenuData] = useState({ fotoBase64: null, previewUrl: null, namaMenu: "" });
  const [waktuData, setWaktuData] = useState({
    bahan: "", porsi: "", mulaiMasak: "06:00", estSaji: "07:30", distribusi: "08:00",
  });
  const [sanitasiData, setSanitasiData] = useState({
    apd: false,
    kebersihan: false,
    kondisiPenyimpanan: "Kulkas (2°C - 5°C)",
    kesegaran: "Baik & Segar",
    sumberBahan: "Supplier Resmi MBG",
  });

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // Perhitungan utilitas durasi waktu masak standar
  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Hitung Jeda secara dinamis di sisi klien
    const minMasak = toMinutes(waktuData.mulaiMasak);
    const minDistrib = toMinutes(waktuData.distribusi);
    const jedaTotal = (minDistrib - minMasak + 1440) % 1440;
    const jedaJam = (jedaTotal / 60).toFixed(1);

    // Hitung persentase pemenuhan checklist sanitasi
    let checkedCount = 0;
    if (sanitasiData.apd) checkedCount++;
    if (sanitasiData.kebersihan) checkedCount++;
    const sanPct = Math.round((checkedCount / 2) * 100);

    // Bungkus semua data menjadi satu payload object terstruktur
    const payload = {
      nama_menu: menuData.namaMenu,
      bahan: waktuData.bahan,
      porsi: waktuData.porsi,
      sasaran: "umum",
      tMasak: waktuData.mulaiMasak,
      tSajian: waktuData.estSaji,
      tDistrib: waktuData.distribusi,
      jedaJam: jedaJam,
      jedaTotal: jedaTotal,
      simpan: sanitasiData.kondisiPenyimpanan,
      kondisi: sanitasiData.kesegaran,
      sumber: sanitasiData.sumberBahan,
      checked_count: checkedCount,
      total_checks: 2,
      sanPct: sanPct
    };

    try {
      // Kirim data langsung ke endpoint PHP Laravel Anda
      const response = await fetch("/api/submit-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === "success" && result.data) {
        // Redirection halaman ke ResultPage.jsx dengan membawa payload AI asli dari server
        navigate("/result", { state: { dataAi: result.data } });
      } else {
        alert("Gagal memproses analisis: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Gagal menghubungi server Laravel:", error);
      alert("Terjadi kesalahan jaringan saat menghubungi server backend.");
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF7F1] to-gray-50 font-sans antialiased flex flex-col">
      <NavbarLogin activePage="home" />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="mb-8 pt-16">
            <h1 className="text-4xl font-extrabold text-[#0D3D25] tracking-tight mb-2">
              Laporan Dapur Harian
            </h1>
            <p className="text-gray-400 text-sm">
              Pastikan setiap sajian memenuhi standar keamanan pangan nasional.
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator current={step} />

          {/* Step Content */}
          <div className="mb-6">
            {step === 1 && <StepMenu data={menuData} setData={setMenuData} />}
            {step === 2 && <StepWaktu data={waktuData} setData={setWaktuData} />}
            {step === 3 && <StepSanitasi data={sanitasiData} setData={setSanitasiData} />}
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400">
                {step < 3 ? (
                  <span className="text-[#1A8A52] font-semibold">DRAFT</span>
                ) : (
                  <span className="text-[#1A8A52] font-semibold">SIAP KIRIM</span>
                )}{" "}
                <span className="text-gray-300 mx-1">|</span>{" "}
                <span className="text-gray-400">Terakhir diubah: {timeStr}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm font-semibold text-gray-500 hover:text-[#0D3D25] px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60"
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
