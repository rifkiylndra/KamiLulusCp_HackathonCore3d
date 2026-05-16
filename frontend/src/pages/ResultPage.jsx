import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  Wrench,
  Leaf,
} from "lucide-react";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";

// ── Mock Result Data ──────────────────────────────────────────────────────────
const result = {
  skor: 68,
  status: "PERHATIAN",
  dimensi: [
    { label: "GIZI", nilai: 78, color: "#1A8A52", bg: "bg-[#1A8A52]" },
    {
      label: "KEAMANAN PANGAN",
      nilai: 61,
      color: "#F59E0B",
      bg: "bg-amber-400",
      critical: true,
    },
    { label: "SANITASI", nilai: 85, color: "#1A8A52", bg: "bg-[#1A8A52]" },
  ],
  pelanggaran: [
    {
      level: "KRITIS",
      levelColor: "bg-red-500 text-white",
      waktu: "Pkl 12:45 u IB",
      judul: "Jeda masak–sajian 4.5 jam",
      deskripsi:
        "Melewati batas aman maksimal 4 jam. Risiko pertumbuhan bakteri termofilik meningkat signifikan.",
    },
    {
      level: "SEDANG",
      levelColor: "bg-amber-400 text-white",
      waktu: "Analisis Nutrisi AI",
      judul: "Protein hanya 9g/porsi",
      deskripsi:
        "Standar minimum MBG adalah 12g protein per porsi untuk pertumbuhan optimal siswa.",
    },
  ],
  catatan:
    '"Data di atas diverifikasi melalui integrasi IoT sensor suhu ruang dan analisis citra piring saji secara real-time."',
  rekomendasi: [
    {
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      bg: "bg-red-50 border-red-100",
      titleColor: "text-red-600",
      judul: "Tindakan Kritis: Distribusi Segera",
      isi: (
        <>
          Percepat distribusi. Sisa waktu aman:{" "}
          <span className="font-bold text-amber-600">30 menit</span>. Jika
          melewati batas, masak ulang atau buang untuk mencegah keracunan
          pangan.
        </>
      ),
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50 border-amber-100",
      titleColor: "text-amber-700",
      judul: "Optimalisasi Menu Esok",
      isi: "Tambahkan 1 butir telur rebus per porsi (+6g protein) ATAU ganti tahu dengan tempe di menu yang sama untuk memenuhi target protein nasional.",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-[#1A8A52]" />,
      bg: "bg-green-50 border-green-100",
      titleColor: "text-[#1A8A52]",
      judul: "Pemeliharaan Preventif",
      isi: "Pastikan bahan protein disimpan di kulkas maks 4°C sejak diterima dari supplier. Log suhu harian menunjukkan fluktuasi di pagi hari.",
    },
  ],
};

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ label, nilai, bg, critical }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {critical && (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-2.5 h-2.5" />
            DI BAWAH MIN
          </span>
        )}
      </div>
      <span className="text-3xl font-extrabold text-[#0D3D25]">{nilai}%</span>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${bg}`}
          style={{ width: `${nilai}%` }}
        />
      </div>
    </div>
  );
}

// ── Kitchen Visual Placeholder ────────────────────────────────────────────────
function KitchenVisual() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-800 to-[#0D3D25] h-44">
      {/* Grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Fake kitchen elements */}
      <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2"
            style={{ transform: `translateY(${i % 2 === 0 ? "8px" : "-8px"})` }}
          >
            <div className="w-10 h-14 bg-white/20 rounded-lg" />
            <div className="w-8 h-2 bg-white/30 rounded" />
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
        <p className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
          Visualisasi Dapur Hub 04
        </p>
        <p className="text-white text-sm font-bold">
          Kondisi Operasional: Stabil (Normal)
        </p>
      </div>

      {/* Live dot */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white text-[10px] font-semibold">LIVE</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const navigate = useNavigate();

  const statusStyle =
    result.status === "AMAN"
      ? "bg-green-50 border-green-200 text-[#1A8A52]"
      : result.status === "BAHAYA"
        ? "bg-red-50 border-red-200 text-red-600"
        : "bg-amber-50 border-amber-200 text-amber-600";

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      <NavbarLogin activePage="laporan" />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 pt-20">
          {/* ── Score Hero Card ── */}
          <div className="bg-gradient-to-br from-[#EEF7F1] to-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D3D25] tracking-tight">
                Skor Kelayakan:{" "}
                <span
                  className={
                    result.skor >= 90
                      ? "text-[#1A8A52]"
                      : result.skor >= 70
                        ? "text-amber-500"
                        : "text-red-500"
                  }
                >
                  {result.skor}
                </span>{" "}
                / 100
              </h1>
              <span
                className={`flex items-center gap-1.5 border text-sm font-bold px-4 py-2 rounded-full shrink-0 mt-1 ${statusStyle}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {result.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-8">
              Hasil analisis sistem cerdas NutriGuard MBG berbasis visi
              komputer.
            </p>

            {/* Dimension Bars */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              {result.dimensi.map((d) => (
                <ScoreBar key={d.label} {...d} />
              ))}
            </div>
          </div>

          {/* ── 2-Column Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left — Pelanggaran */}
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-[#0D3D25] text-base">
                  Temuan Pelanggaran
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {result.pelanggaran.map((p, i) => (
                  <div
                    key={i}
                    className={`border-l-4 pl-4 py-1 ${
                      p.level === "KRITIS"
                        ? "border-red-500"
                        : "border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${p.levelColor}`}
                      >
                        {p.level}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {p.waktu}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#0D3D25] mb-1">
                      {p.judul}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {p.deskripsi}
                    </p>
                  </div>
                ))}
              </div>

              {/* IoT Note */}
              <div className="bg-gray-50 rounded-2xl p-4 mt-auto">
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  {result.catatan}
                </p>
              </div>
            </div>

            {/* Right — Rekomendasi */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#1A8A52]" />
                <h2 className="font-bold text-[#0D3D25] text-base">
                  Tindakan Korektif & Rekomendasi AI
                </h2>
              </div>

              {result.rekomendasi.map((r, i) => (
                <div
                  key={i}
                  className={`border rounded-2xl p-5 flex gap-3.5 ${r.bg}`}
                >
                  <div className="shrink-0 mt-0.5">{r.icon}</div>
                  <div>
                    <p className={`text-sm font-bold mb-1.5 ${r.titleColor}`}>
                      {r.judul}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {r.isi}
                    </p>
                  </div>
                </div>
              ))}

              {/* Kitchen Visual */}
              <KitchenVisual />
            </div>
          </div>

          {/* ── Back Button ── */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate("/home")}
              className="w-full flex items-center justify-center gap-3 bg-[#0D1F17] hover:bg-[#162d20] text-white font-semibold px-10 py-4 rounded-2xl transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
