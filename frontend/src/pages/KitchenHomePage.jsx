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
  Loader,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";
import { fetchLatestResult, fetchRecentSubmissions, fetchDashboardStats, getCurrentSppg } from "../services/api";

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function KitchenHomePage() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [latestResult, setLatestResult] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSppg, setCurrentSppg] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Get current SPPG from localStorage
    const sppg = getCurrentSppg();
    setCurrentSppg(sppg);

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Get SPPG ID for filtering
        const sppgId = sppg?.id || null;
        
        // Fetch data in parallel
        const [latest, recent, stats] = await Promise.all([
          fetchLatestResult(sppgId),
          fetchRecentSubmissions(3, sppgId),
          fetchDashboardStats()
        ]);
        
        setLatestResult(latest);
        setRecentSubmissions(recent);
        setDashboardStats(stats);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const formatDate = (d) =>
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " WIB";

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'AMAN':
        return {
          bg: 'bg-[#E6F4EC]',
          text: 'text-[#1A8A52]',
          border: 'border-[#1A8A52]/20'
        };
      case 'BAHAYA':
        return {
          bg: 'bg-red-50',
          text: 'text-red-600',
          border: 'border-red-200'
        };
      case 'PERHATIAN':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col overflow-x-hidden">
      <NavbarLogin />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          
          {/* ── Header ── */}
          <div className="pt-16 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8 sm:mb-10">
            
            {/* Left */}
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D3D25] leading-tight mb-2">
                Selamat Datang, {currentSppg ? currentSppg.name : 'SPPG'}
              </h1>

              <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
                Pantau kelayakan gizi dan keamanan dapur Anda hari ini
                {currentSppg && currentSppg.location && ` - ${currentSppg.location}`}
              </p>
            </div>

            {/* Right Date */}
            <div className="w-full sm:w-auto flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />

              <span className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                {formatDate(now)}
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> | </span>
                {formatTime(now)}
              </span>
            </div>
          </div>

          {/* ── Action Cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            
            {/* Buat Laporan */}
            <button
              onClick={() => navigate("/submit")}
              className="group relative bg-[#0D5C3A] hover:bg-[#0a4a2e] rounded-3xl p-6 sm:p-8 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                Buat Laporan Harian
              </h2>

              <p className="text-white/70 text-sm sm:text-[15px] leading-relaxed">
                Ambil foto masakan dan cek kebersihan dapur secara real-time
                dengan verifikasi AI.
              </p>
            </button>

            {/* Riwayat */}
            <button
              onClick={() => navigate("/riwayat")}
              className="group relative bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#EAF4EF] rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6 sm:w-7 sm:h-7 text-[#1A8A52]" />
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#0D3D25] mb-3">
                Riwayat Laporan
              </h2>

              <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed">
                Akses arsip penilaian dapur, catatan gizi, dan kepatuhan standar
                sanitasi.
              </p>
            </button>
          </div>

          {/* ── Last Result Banner ── */}
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl px-4 sm:px-6 py-8 flex items-center justify-center shadow-sm mb-10 sm:mb-12">
              <div className="flex items-center gap-3">
                <Loader className="w-5 h-5 text-[#1A8A52] animate-spin" />
                <p className="text-gray-600">Memuat data terbaru...</p>
              </div>
            </div>
          ) : latestResult && latestResult.result ? (
            <div className="bg-white border border-gray-100 rounded-2xl px-4 sm:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm mb-10 sm:mb-12">
              
              {/* Left */}
              <div className="flex items-start sm:items-center gap-4">
                <div className={`w-11 h-11 ${getStatusColor(latestResult.result.assessment_status).bg} rounded-full flex items-center justify-center shrink-0`}>
                  <CheckCircle className={`w-6 h-6 ${getStatusColor(latestResult.result.assessment_status).text}`} />
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                    Hasil Terakhir
                  </p>

                  <p className="text-base sm:text-lg font-bold text-[#0D3D25] leading-snug">
                    {latestResult.result.menu_name || 'Menu Terbaru'}:{" "}
                    <span className={getStatusColor(latestResult.result.assessment_status).text}>
                      {Math.round(latestResult.result.final_score || 0)}/100
                    </span>
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col md:items-end gap-2">
                <span className={`${getStatusColor(latestResult.result.assessment_status).bg} ${getStatusColor(latestResult.result.assessment_status).text} text-xs font-bold px-4 py-1.5 rounded-full border ${getStatusColor(latestResult.result.assessment_status).border} w-fit`}>
                  {latestResult.result.assessment_status || 'PENDING'}
                </span>

                <p className="text-xs text-gray-400">
                  Terverifikasi pada {formatDateTime(latestResult.created_at)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl px-4 sm:px-6 py-8 flex flex-col items-center justify-center gap-3 shadow-sm mb-10 sm:mb-12">
              <Clock className="w-8 h-8 text-gray-300" />
              <div className="text-center">
                <p className="text-base font-semibold text-gray-600 mb-1">
                  Belum Ada Laporan
                </p>
                <p className="text-sm text-gray-400">
                  Buat laporan pertama Anda untuk melihat hasil analisis
                </p>
              </div>
              <button
                onClick={() => navigate("/submit")}
                className="mt-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Buat Laporan
              </button>
            </div>
          )}

          {/* ── Info Tiles ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 mb-10">
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
                className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 hover:shadow-sm transition-shadow"
              >
                <div className="mb-3">{icon}</div>

                <h3 className="font-semibold text-[#0D3D25] text-sm sm:text-base mb-2">
                  {title}
                </h3>

                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── Recent Submissions ── */}
          {!loading && recentSubmissions.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-[#0D3D25]">
                  Riwayat Terbaru
                </h2>
                <button
                  onClick={() => navigate("/riwayat")}
                  className="text-[#1A8A52] hover:text-[#0D5C3A] text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  Lihat Semua
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/result/${submission.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${getStatusColor(submission.status).bg} rounded-full flex items-center justify-center shrink-0`}>
                        {submission.status === 'completed' ? (
                          <CheckCircle className={`w-5 h-5 ${getStatusColor(submission.status).text}`} />
                        ) : submission.status === 'processing' ? (
                          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-[#0D3D25] text-sm">
                          {submission.menu_name || `Submission #${submission.id}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(submission.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {submission.status === 'completed' && submission.final_score && (
                        <span className="text-sm font-bold text-[#0D3D25]">
                          {Math.round(submission.final_score)}/100
                        </span>
                      )}
                      
                      <span className={`${getStatusColor(submission.status).bg} ${getStatusColor(submission.status).text} text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(submission.status).border}`}>
                        {submission.status === 'completed' ? 'SELESAI' : 
                         submission.status === 'processing' ? 'PROSES' : 
                         submission.status === 'pending' ? 'PENDING' : 
                         submission.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}