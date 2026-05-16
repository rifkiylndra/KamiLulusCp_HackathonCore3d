import { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileText,
  CheckCircle,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";
import { 
  fetchMonthlyStats, 
  fetchWeeklyTrend, 
  fetchStatusDistribution, 
  fetchSppgLeaderboard,
  getCurrentSppg,
  API_ENDPOINTS
} from "../services/api";

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle = {
  AMAN: "bg-[#0D5C3A] text-white",
  PERHATIAN: "bg-amber-100 text-amber-700 border border-amber-300",
  BAHAYA: "bg-red-500 text-white",
  EXCELLENT: "bg-green-600 text-white",
  GOOD: "bg-[#0D5C3A] text-white",
  FAIR: "bg-amber-500 text-white",
  POOR: "bg-red-500 text-white",
  NO_DATA: "bg-gray-400 text-white",
};

const barColor = (skor) => {
  if (skor >= 90) return "bg-green-500";
  if (skor >= 80) return "bg-[#1A8A52]";
  if (skor >= 70) return "bg-amber-400";
  if (skor > 0) return "bg-red-500";
  return "bg-gray-300";
};

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, badge, badgeColor, danger }) {
  return (
    <div
      className={`bg-white border rounded-2xl p-5 flex flex-col gap-3 ${
        danger ? "border-red-100" : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`${danger ? "text-red-500" : "text-[#1A8A52]"}`}>
          {icon}
        </div>
        {badge && (
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p
          className={`text-3xl font-extrabold tracking-tight ${
            danger ? "text-red-500" : "text-[#0D3D25]"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RiwayatPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterScoreMin, setFilterScoreMin] = useState(0);
  
  // Data states
  const [monthlyStats, setMonthlyStats] = useState({});
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState({ distribution: [], total: 0 });
  const [sppgLeaderboard, setSppgLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  // Handle "Lihat Detail" button - navigate to submissions with BAHAYA filter
  const handleViewDangerDetails = () => {
    const currentSppg = getCurrentSppg();
    if (currentSppg?.id) {
      // Navigate to a filtered view - you can create a new page or use query params
      // For now, we'll show an alert with the API endpoint to fetch danger submissions
      const dangerUrl = `${API_ENDPOINTS.SUBMISSIONS_LIST}?sppg_id=${currentSppg.id}&status=completed`;
      console.log('Fetching danger submissions from:', dangerUrl);
      
      // You can implement a modal or navigate to a detail page
      alert(`Fitur detail laporan bahaya akan menampilkan ${monthlyStats.bahaya} laporan dengan status BAHAYA.\n\nImplementasi: Buat halaman baru atau modal untuk menampilkan list submission dengan filter status BAHAYA.`);
    }
  };

  // Apply filters to leaderboard
  const applyFilters = () => {
    setShowFilterModal(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterStatus("all");
    setFilterProvince("all");
    setFilterScoreMin(0);
  };

  useEffect(() => {
    const fetchRiwayatData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching riwayat data...');
        
        // Get current SPPG ID
        const currentSppg = getCurrentSppg();
        const sppgId = currentSppg?.id || null;
        console.log('📍 Current SPPG ID:', sppgId);
        
        // Fetch all data in parallel
        const [monthly, weekly, distribution, leaderboard] = await Promise.all([
          fetchMonthlyStats(sppgId),
          fetchWeeklyTrend(sppgId),
          fetchStatusDistribution(sppgId),
          fetchSppgLeaderboard()
        ]);
        
        console.log('✅ Monthly stats:', monthly);
        console.log('✅ Weekly trend:', weekly);
        console.log('✅ Status distribution:', distribution);
        console.log('✅ SPPG leaderboard:', leaderboard);
        
        setMonthlyStats(monthly);
        setWeeklyTrend(weekly);
        setStatusDistribution(distribution);
        setSppgLeaderboard(leaderboard);
      } catch (error) {
        console.error('❌ Error fetching riwayat data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayatData();
  }, []);

  const filtered = sppgLeaderboard.filter((sppg) => {
    // Search filter
    const matchesSearch = sppg.name.toLowerCase().includes(search.toLowerCase()) ||
      sppg.location.toLowerCase().includes(search.toLowerCase()) ||
      sppg.province.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = filterStatus === "all" || sppg.status === filterStatus;
    
    // Province filter
    const matchesProvince = filterProvince === "all" || sppg.province === filterProvince;
    
    // Score filter
    const matchesScore = sppg.average_score >= filterScoreMin;
    
    return matchesSearch && matchesStatus && matchesProvince && matchesScore;
  });

  // Get unique provinces for filter dropdown
  const provinces = [...new Set(sppgLeaderboard.map(sppg => sppg.province))].sort();

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Belum ada';
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      <NavbarLogin activePage="laporan" />

      <main className="flex-1 pt-16">
        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                <strong>ERROR:</strong> {error}
              </span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="shrink-0 bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Reload Page
            </button>
          </div>
        )}

        {/* ── Emergency Banner ── */}
        {!loading && monthlyStats.bahaya > 0 && (
          <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                <strong>PERINGATAN KRITIS:</strong> {monthlyStats.bahaya} Laporan berada dalam
                status BAHAYA. Segera lakukan tindakan korektif!
              </span>
            </div>
            <button 
              onClick={handleViewDangerDetails}
              className="shrink-0 bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Lihat Detail
            </button>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          {/* ── Stat Cards ── */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-center">
                  <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<FileText className="w-5 h-5" />}
                label="Laporan Bulan Ini"
                value={monthlyStats.total_monthly?.toLocaleString() || "0"}
                badge={monthlyStats.total_monthly > 0 ? "Aktif" : "Kosong"}
                badgeColor={monthlyStats.total_monthly > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
              />
              <StatCard
                icon={<CheckCircle className="w-5 h-5" />}
                label="Status AMAN"
                value={monthlyStats.aman?.toLocaleString() || "0"}
                badge="Optimal"
                badgeColor="bg-blue-100 text-blue-700"
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                label="Status PERHATIAN"
                value={monthlyStats.perhatian?.toLocaleString() || "0"}
                badge={monthlyStats.perhatian > 0 ? "Perlu Cek" : "Aman"}
                badgeColor={monthlyStats.perhatian > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}
              />
              <StatCard
                icon={<ShieldAlert className="w-5 h-5" />}
                label="Status BAHAYA"
                value={monthlyStats.bahaya?.toLocaleString() || "0"}
                badge={monthlyStats.bahaya > 0 ? "Mendesak" : "Aman"}
                badgeColor={monthlyStats.bahaya > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}
                danger={monthlyStats.bahaya > 0}
              />
            </div>
          )}

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Line Chart */}
            <div className="md:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-[#0D3D25] text-base">
                  Tren Kepatuhan 7 Hari Terakhir
                </h2>
              </div>
              <div className="flex items-center gap-4 mb-5">
                {[
                  { label: "GIZI", color: "#1A8A52" },
                  { label: "KEAMANAN", color: "#0D3D25" },
                  { label: "SANITASI", color: "#9CA3AF" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : weeklyTrend.length > 0 ? (
                  <LineChart width={700} height={220} data={weeklyTrend}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gizi"
                      stroke="#1A8A52"
                      strokeWidth={2.5}
                      dot={false}
                      strokeLinecap="round"
                    />
                    <Line
                      type="monotone"
                      dataKey="keamanan"
                      stroke="#0D3D25"
                      strokeWidth={2.5}
                      dot={false}
                      strokeLinecap="round"
                    />
                    <Line
                      type="monotone"
                      dataKey="sanitasi"
                      stroke="#9CA3AF"
                      strokeWidth={2.5}
                      dot={false}
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                    />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-gray-400">
                    <p>Tidak ada data tren untuk 7 hari terakhir</p>
                  </div>
                )}
              </div>
            </div>

            {/* Donut Chart */}
            <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
              <h2 className="font-bold text-[#0D3D25] text-base mb-5">
                Distribusi Status Akun Ini
              </h2>
              <div className="flex flex-col items-center justify-center gap-4">
                {loading ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : statusDistribution.distribution.length > 0 ? (
                  <>
                    <div className="flex justify-center">
                      <PieChart width={260} height={220}>
                        <Pie
                          data={statusDistribution.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          fill="#0D5C3A"
                          isAnimationActive={false}
                        >
                          {statusDistribution.distribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <text
                          x="50%"
                          y="45%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="20"
                          fontWeight="800"
                          fill="#0D3D25"
                        >
                          {statusDistribution.total}
                        </text>
                        <text
                          x="50%"
                          y="58%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill="#9CA3AF"
                        >
                          Total Laporan
                        </text>
                      </PieChart>
                    </div>

                    {/* Legend */}
                    <div className="w-full flex flex-col gap-2">
                      {statusDistribution.distribution.map(({ name, value, color }) => (
                        <div
                          key={name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-gray-500">{name}</span>
                          </div>
                          <span className="text-xs font-bold text-[#0D3D25]">
                            {value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-gray-400">
                    <p>Tidak ada data distribusi status</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Live SPPG Table ── */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-[#0D3D25] text-lg">
                  Leaderboard SPPG Nasional
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Ranking SPPG berdasarkan skor rata-rata terbaik
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari SPPG atau lokasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1A8A52] focus:bg-white transition-all w-52"
                  />
                </div>
                <button 
                  onClick={() => setShowFilterModal(true)}
                  className="flex items-center gap-2 bg-[#0D3D25] hover:bg-[#0a2e1b] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {[
                        "RANK",
                        "SPPG / LOKASI",
                        "SKOR RATA-RATA",
                        "TOTAL LAPORAN",
                        "STATUS",
                        "TERAKHIR SUBMIT",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-6 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? (
                      filtered.slice((page - 1) * 10, page * 10).map((sppg) => (
                        <tr
                          key={sppg.id}
                          className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                            sppg.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {sppg.rank <= 3 && (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                  sppg.rank === 1 ? 'bg-yellow-500' : 
                                  sppg.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                                }`}>
                                  {sppg.rank}
                                </div>
                              )}
                              {sppg.rank > 3 && (
                                <span className="text-sm font-bold text-gray-600 w-6 text-center">
                                  {sppg.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-sm text-[#0D3D25]">
                                {sppg.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {sppg.location}, {sppg.province}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {sppg.average_score > 0 ? (
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${barColor(sppg.average_score)}`}
                                    style={{ width: `${sppg.average_score}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-[#0D3D25]">
                                  {sppg.average_score}/100
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Belum ada data</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <span className="font-bold text-[#0D3D25]">
                                {sppg.total_submissions}
                              </span>
                              {sppg.total_submissions > 0 && (
                                <div className="flex gap-1 mt-1">
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    {sppg.aman_count}A
                                  </span>
                                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                    {sppg.perhatian_count}P
                                  </span>
                                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                    {sppg.bahaya_count}B
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusStyle[sppg.status] || 'bg-gray-100 text-gray-600'}`}
                            >
                              {sppg.status === 'EXCELLENT' ? 'EXCELLENT' :
                               sppg.status === 'GOOD' ? 'GOOD' :
                               sppg.status === 'FAIR' ? 'FAIR' :
                               sppg.status === 'POOR' ? 'POOR' : 'NO DATA'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500">
                              {formatDateTime(sppg.last_submission)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                          {search ? 'Tidak ada SPPG yang cocok dengan pencarian' : 'Belum ada data SPPG'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Menampilkan {Math.min(filtered.length, 10)} dari {filtered.length} submissions
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {Array.from({ length: Math.ceil(filtered.length / 10) }, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        page === n
                          ? "bg-[#0D5C3A] text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  onClick={() => setPage(Math.min(Math.ceil(filtered.length / 10), page + 1))}
                  disabled={page >= Math.ceil(filtered.length / 10)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Modal ── */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#0D3D25]">Filter Leaderboard</h3>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status SPPG
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#1A8A52] focus:bg-white transition-all"
                  >
                    <option value="all">Semua Status</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="NO_DATA">No Data</option>
                  </select>
                </div>

                {/* Province Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Provinsi
                  </label>
                  <select
                    value={filterProvince}
                    onChange={(e) => setFilterProvince(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#1A8A52] focus:bg-white transition-all"
                  >
                    <option value="all">Semua Provinsi</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skor Minimum: {filterScoreMin}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={filterScoreMin}
                    onChange={(e) => setFilterScoreMin(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1A8A52]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2.5 bg-[#1A8A52] hover:bg-[#0D5C3A] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
