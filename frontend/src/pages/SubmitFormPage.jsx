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

// ── STEP 1 — Identifikasi Menu ────────────────────────────────────────────────
function StepMenu({ data, setData }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setData((p) => ({ ...p, foto: file }));
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
        {/* Upload zone */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Foto Menu Masakan
          </label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-gray-200 hover:border-[#1A8A52] rounded-2xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group bg-gray-50 hover:bg-green-50/30 overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <>
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#1A8A52]" />
                </div>
                <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                  Ambil foto atau seret gambar ke sini
                </p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
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

        {/* Warning */}
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 font-medium leading-relaxed">
            Peringatan: Jeda masak ke sajian maksimal 4 jam untuk menjaga kualitas nutrisi dan higienitas.
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
export default function SubmitFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [menuData, setMenuData] = useState({ foto: null, namaMenu: "" });
  const [waktuData, setWaktuData] = useState({
    bahan: "", porsi: "", mulaiMasak: "", estSaji: "", distribusi: "",
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

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/result/demo-001");
    }, 1800);
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
                  onClick={handleBack}
                  className="text-sm font-semibold text-gray-500 hover:text-[#0D3D25] px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Kembali
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Lanjut
                </button>
              ) : (
                <button
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