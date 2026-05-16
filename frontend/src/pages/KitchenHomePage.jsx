import { useState, useEffect } from "react";
import {
  Shield,
  Camera,
  History,
  CheckCircle,
  
  ChevronRight,
  AlertTriangle,
  Headphones,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";




// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KitchenHomePage() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDate = (d) =>
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      <NavbarLogin />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ── Header ── */}
          <div className="pt-16 flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0D3D25] leading-tight mb-2">
                Selamat Datang, SPPG Padang 01
              </h1>
              <p className="text-gray-400 text-sm">
                Pantau kelayakan gizi dan keamanan dapur Anda hari ini
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm shrink-0 self-start">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                {formatDate(now)} | {formatTime(now)}
              </span>
            </div>
          </div>

          {/* ── Action Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Buat Laporan Harian — dark green */}
            <button
              onClick={() => navigate("/submit")}
              className="group relative bg-[#0D5C3A] hover:bg-[#0a4a2e] rounded-3xl p-8 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Buat Laporan Harian
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Ambil foto masakan dan cek kebersihan dapur secara real-time
                dengan verifikasi AI.
              </p>
            </button>

            {/* Riwayat Laporan — light */}
            <button
              onClick={() => navigate("/riwayat")}
              className="group relative bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl p-8 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-[#EAF4EF] rounded-2xl flex items-center justify-center">
                  <History className="w-7 h-7 text-[#1A8A52]" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-2xl font-bold text-[#0D3D25] mb-3">
                Riwayat Laporan
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Akses arsip penilaian dapur, catatan gizi, dan kepatuhan standar
                sanitasi.
              </p>
            </button>
          </div>

          {/* ── Last Result Banner ── */}
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm mb-12">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#E6F4EC] rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-[#1A8A52]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                  Hasil Terakhir
                </p>
                <p className="text-lg font-bold text-[#0D3D25]">
                  Laporan Kemarin:{" "}
                  <span className="text-[#1A8A52]">92/100</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-[#E6F4EC] text-[#1A8A52] text-xs font-bold px-4 py-1.5 rounded-full border border-[#1A8A52]/20">
                AMAN
              </span>
              <p className="text-xs text-gray-400">Terverifikasi pada 23 Mei, 17:30</p>
            </div>
          </div>

          {/* ── Info Tiles ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-5 h-5 text-[#1A8A52]" />,
                title: "Standard Gizi",
                desc: "Panduan kalori dan protein nasional 2024 telah diperbarui.",
              },
              {
                icon: <Headphones className="w-5 h-5 text-[#1A8A52]" />,
                title: "Bantuan Teknis",
                desc: "Hubungi pusat bantuan MBG jika ada kendala sistem.",
              },
              {
                icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
                title: "Peringatan Sanitasi",
                desc: "Pastikan suhu penyimpanan beku tetap di bawah -18°C.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition-shadow"
              >
                <div className="mb-3">{icon}</div>
                <h3 className="font-semibold text-[#0D3D25] text-sm mb-1.5">
                  {title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}