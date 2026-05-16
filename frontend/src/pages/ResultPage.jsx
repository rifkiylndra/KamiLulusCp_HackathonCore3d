import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  Loader,
} from "lucide-react";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";
import { getSubmissionStatus } from "../services/api";

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
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getSubmissionStatus(id);
        
        if (data.status === 'completed' && data.result) {
          // Transform API data to match UI format
          const apiResult = data.result;
          const assessment = apiResult;
          
          const transformedResult = {
            skor: Math.round(assessment.final_score || 0),
            status: assessment.assessment_status === 'AMAN' ? 'AMAN' : assessment.assessment_status === 'BAHAYA' ? 'BAHAYA' : 'PERHATIAN',
            dimensi: [
              { 
                label: "GIZI", 
                nilai: Math.round(assessment.scores?.nutrition || 0), 
                color: "#1A8A52", 
                bg: "bg-[#1A8A52]" 
              },
              {
                label: "KEAMANAN PANGAN",
                nilai: Math.round(assessment.scores?.safety || 0),
                color: "#F59E0B",
                bg: "bg-amber-400",
                critical: (assessment.scores?.safety || 0) < 70,
              },
              { 
                label: "SANITASI", 
                nilai: Math.round(assessment.scores?.sanitation || 0), 
                color: "#1A8A52", 
                bg: "bg-[#1A8A52]" 
              },
            ],
            pelanggaran: (assessment.violations || []).map(v => {
              // Create a concise title and keep full description
              let judul = '';
              let deskripsi = v.description || '';
              
              // Generate concise titles based on violation content patterns
              const desc = deskripsi.toLowerCase();
              
              if (desc.includes('bahan') && desc.includes('rusak')) {
                judul = 'Kondisi Bahan Baku';
              } else if (desc.includes('protein') && desc.includes('suhu')) {
                judul = 'Kontrol Suhu Protein';
              } else if (desc.includes('dapur') && desc.includes('bersih')) {
                judul = 'Sanitasi Dapur';
              } else if (desc.includes('supplier') || desc.includes('pemasok')) {
                judul = 'Verifikasi Supplier';
              } else if (desc.includes('jeda') && (desc.includes('distribusi') || desc.includes('saji'))) {
                judul = 'Manajemen Waktu';
              } else if (desc.includes('masak') && desc.includes('saji')) {
                judul = 'Proses Memasak';
              } else if (desc.includes('higiene') || desc.includes('kebersihan')) {
                judul = 'Standar Higiene';
              } else if (desc.includes('suhu') && desc.includes('penyimpanan')) {
                judul = 'Kontrol Penyimpanan';
              } else if (desc.includes('kontaminasi')) {
                judul = 'Pencegahan Kontaminasi';
              } else if (desc.includes('peralatan') || desc.includes('alat')) {
                judul = 'Kondisi Peralatan';
              } else if (desc.includes('dokumentasi') || desc.includes('pencatatan')) {
                judul = 'Sistem Dokumentasi';
              } else {
                // Smart fallback: extract key noun/action from description
                const words = deskripsi.split(' ');
                const keyWords = words.filter(word => 
                  word.length > 3 && 
                  !['yang', 'dan', 'atau', 'dalam', 'pada', 'untuk', 'dengan', 'dari', 'ke', 'di', 'oleh'].includes(word.toLowerCase())
                );
                
                if (keyWords.length >= 2) {
                  judul = keyWords.slice(0, 2).join(' ');
                } else if (keyWords.length === 1) {
                  judul = keyWords[0];
                } else {
                  judul = words.slice(0, 2).join(' ');
                }
                
                // Capitalize first letter
                judul = judul.charAt(0).toUpperCase() + judul.slice(1);
              }
              
              return {
                level: v.severity === 'CRITICAL' ? 'KRITIS' : v.severity === 'HIGH' ? 'TINGGI' : v.severity === 'MEDIUM' ? 'SEDANG' : 'INFO',
                levelColor: v.severity === 'CRITICAL' ? 'bg-red-600 text-white' : v.severity === 'HIGH' ? 'bg-red-500 text-white' : v.severity === 'MEDIUM' ? 'bg-amber-400 text-white' : 'bg-blue-400 text-white',
                waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                judul: judul || 'Pelanggaran',
                deskripsi: deskripsi,
              };
            }),
            catatan: `"Hasil analisis untuk menu: ${apiResult.menu_name} di ${apiResult.sppg_name}"`,
            rekomendasi: (assessment.corrective_feedback ? [
              {
                icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
                bg: "bg-red-50 border-red-100",
                titleColor: "text-red-600",
                judul: "Tindakan Kritis",
                items: assessment.corrective_feedback.immediate_actions || [],
              },
              {
                icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
                bg: "bg-amber-50 border-amber-100",
                titleColor: "text-amber-700",
                judul: "Optimalisasi Esok",
                items: assessment.corrective_feedback.tomorrow_improvements || [],
              },
              {
                icon: <CheckCircle className="w-5 h-5 text-[#1A8A52]" />,
                bg: "bg-green-50 border-green-100",
                titleColor: "text-[#1A8A52]",
                judul: "Catatan Rutin",
                items: assessment.corrective_feedback.routine_notes || [],
              },
            ] : []),
          };
          
          setResult(transformedResult);
        } else if (data.status === 'pending' || data.status === 'processing') {
          setError('Analisis masih berjalan. Silakan tunggu...');
        } else if (data.status === 'failed') {
          setError('Analisis gagal. Silakan coba kirim ulang.');
        }
      } catch (err) {
        setError(`Gagal memuat hasil: ${err.message}`);
        console.error('Error fetching result:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResult();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
        <NavbarLogin activePage="laporan" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 text-[#1A8A52] animate-spin" />
            <p className="text-gray-600">Memuat hasil analisis...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
        <NavbarLogin activePage="laporan" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-gray-600">{error || 'Hasil tidak ditemukan'}</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white font-semibold px-6 py-2 rounded-xl transition-colors"
            >
              Kembali ke Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusStyle =
    result.status === "AMAN"
      ? "bg-green-50 border-green-200 text-[#1A8A52]"
      : result.status === "BAHAYA"
        ? "bg-red-50 border-red-200 text-red-600"
        : "bg-amber-50 border-amber-200 text-amber-600";

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      <NavbarLogin activePage="laporan" />

      <main className="flex-1 pt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6 md:space-y-8 pt-20">
          
          {/* HERO */}
          <div className="bg-gradient-to-br from-[#EEF7F1] to-white border border-gray-100 rounded-3xl p-5 md:p-8 shadow-sm">
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              
              <h1 className="text-2xl md:text-5xl font-extrabold text-[#0D3D25] tracking-tight leading-tight">
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
                className={`flex items-center gap-1.5 border text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-full w-fit ${statusStyle}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {result.status}
              </span>
            </div>

            <p className="text-gray-400 text-xs md:text-sm mt-3 mb-6 md:mb-8">
              Hasil analisis sistem cerdas NutriGuard MBG berbasis visi komputer.
            </p>

            {/* SCORE BARS */}
            <div className="flex flex-col md:flex-row gap-5 md:gap-10">
              {result.dimensi.map((d) => (
                <ScoreBar key={d.label} {...d} />
              ))}
            </div>
          </div>

          {/* GRID SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            
            {/* LEFT */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 md:p-7 shadow-sm flex flex-col gap-5">
              
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-[#0D3D25] text-sm md:text-base">
                  Temuan Pelanggaran
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {result.pelanggaran && result.pelanggaran.length > 0 ? (
                  result.pelanggaran.map((p, i) => (
                    <div
                      key={i}
                      className={`border-l-4 pl-3 md:pl-4 py-1 ${
                        p.level === "KRITIS"
                          ? "border-red-500"
                          : p.level === "TINGGI"
                          ? "border-red-400"
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
                  ))
                ) : (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#1A8A52] shrink-0" />
                    <p className="text-sm text-gray-600">
                      Tidak ada pelanggaran terdeteksi. Menu sudah memenuhi standar keamanan pangan.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mt-auto">
                <p className="text-[11px] md:text-xs text-gray-400 italic leading-relaxed">
                  {result.catatan}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">
              
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#1A8A52]" />
                <h2 className="font-bold text-[#0D3D25] text-sm md:text-base">
                  Tindakan Korektif & Rekomendasi AI
                </h2>
              </div>

              {result.rekomendasi && result.rekomendasi.length > 0 ? (
                result.rekomendasi.map((r, i) => (
                  <div
                    key={i}
                    className={`border rounded-2xl p-4 md:p-5 flex gap-3.5 ${r.bg}`}
                  >
                    <div className="shrink-0 mt-0.5">{r.icon}</div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold mb-2 ${r.titleColor}`}>
                        {r.judul}
                      </p>
                      {r.items && r.items.length > 0 ? (
                        <ul className="space-y-2">
                          {r.items.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-600 leading-relaxed flex gap-2">
                              <span className="text-gray-400 shrink-0">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Tidak ada rekomendasi khusus untuk kategori ini
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-gray-600">
                    Analisis AI sedang memproses rekomendasi. Silakan refresh halaman dalam beberapa saat.
                  </p>
                </div>
              )}

              <KitchenVisual />
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate("/home")}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#0D1F17] hover:bg-[#162d20] text-white font-semibold px-6 md:px-10 py-3 md:py-4 rounded-2xl transition-colors text-sm"
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
