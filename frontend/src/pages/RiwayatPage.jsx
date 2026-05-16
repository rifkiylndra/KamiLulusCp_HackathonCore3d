import { useState } from "react";
import {
  AlertTriangle,
  FileText,
  CheckCircle,
  ShieldAlert,
  Shield,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import NavbarLogin from "../components/layout/NavbarLogin";
import Footer from "../components/layout/Footer";

// ── Mock Data ────────────────────────────────────────────────────────────────
const trendData = [
  { day: "SEV", gizi: 88, keamanan: 82, sanitasi: 79 },
  { day: "SEL", gizi: 85, keamanan: 80, sanitasi: 76 },
  { day: "RAB", gizi: 91, keamanan: 87, sanitasi: 83 },
  { day: "KAM", gizi: 89, keamanan: 85, sanitasi: 81 },
  { day: "JUM", gizi: 93, keamanan: 90, sanitasi: 88 },
  { day: "SAB", gizi: 90, keamanan: 88, sanitasi: 86 },
  { day: "MIN", gizi: 94, keamanan: 91, sanitasi: 89 },
];

const donutData = [
  { name: "AMAN", value: 70, color: "#0D5C3A" },
  { name: "PERHATIAN", value: 20, color: "#F59E0B" },
  { name: "BAHAYA", value: 10, color: "#EF4444" },
];

const kitchenRows = [
  { id: "SPPG-081 Padang", waktu: "14:42:01", skor: 42, status: "BAHAYA" },
  { id: "SPPG-122 Bandung", waktu: "14:55:12", skor: 78, status: "PERHATIAN" },
  { id: "SPPG-004 Jakarta Pusat", waktu: "15:01:45", skor: 98, status: "AMAN" },
  { id: "SPPG-055 Surabaya", waktu: "15:02:10", skor: 94, status: "AMAN" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle = {
  AMAN: "bg-[#0D5C3A] text-white",
  PERHATIAN: "bg-amber-100 text-amber-700 border border-amber-300",
  BAHAYA: "bg-red-500 text-white",
};

const barColor = (skor) => {
  if (skor >= 90) return "bg-[#1A8A52]";
  if (skor >= 70) return "bg-amber-400";
  return "bg-red-500";
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

// ── Custom Donut Label ────────────────────────────────────────────────────────
function DonutCenter() {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.4em" fontSize="22" fontWeight="800" fill="#0D3D25">
        14.2k
      </tspan>
      <tspan x="50%" dy="1.5em" fontSize="10" fill="#9CA3AF">
        Total Dapur
      </tspan>
    </text>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RiwayatPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = kitchenRows.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      <NavbarLogin activePage="laporan" />

      <main className="flex-1 pt-16">
        {/* ── Emergency Banner ── */}
        <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              <strong>PERINGATAN KRITIS:</strong> 2 Dapur SPPG berada dalam
              status BAHAYA (Jeda distribusi &gt; 4 jam). Segera intervensi!
            </span>
          </div>
          <button className="shrink-0 bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-red-50 transition-colors whitespace-nowrap">
            Ambil Tindakan
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<FileText className="w-5 h-5" />}
              label="Laporan Hari Ini"
              value="14,203"
              badge="+12%"
              badgeColor="bg-green-100 text-green-700"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              label="Status AMAN"
              value="12,840"
              badge="Optimal"
              badgeColor="bg-blue-100 text-blue-700"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
              label="Status PERHATIAN"
              value="1,361"
              badge="Perlu Cek"
              badgeColor="bg-amber-100 text-amber-700"
            />
            <StatCard
              icon={<ShieldAlert className="w-5 h-5" />}
              label="Status BAHAYA Aktif"
              value="2"
              badge="Mendesak"
              badgeColor="bg-red-100 text-red-600"
              danger
            />
          </div>

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
                <LineChart width={700} height={220} data={trendData}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[70, 100]}
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
              </div>
            </div>

            {/* Donut Chart */}
            <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
              <h2 className="font-bold text-[#0D3D25] text-base mb-5">
                Distribusi Status Nasional
              </h2>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex justify-center">
                  <PieChart width={260} height={220}>
                    <Pie
                      data={donutData}
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
                      {donutData.map((entry, index) => (
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
                      14.2k
                    </text>
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill="#9CA3AF"
                    >
                      Total Dapur
                    </text>
                  </PieChart>
                </div>

                {/* Legend */}
                <div className="w-full flex flex-col gap-2">
                  {donutData.map(({ name, value, color }) => (
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
              </div>
            </div>
          </div>

          {/* ── Live SPPG Table ── */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-6 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-[#0D3D25] text-lg">
                  Live SPPG Status Monitor
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Update real-time dari 38 Provinsi
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari ID Dapur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1A8A52] focus:bg-white transition-all w-52"
                  />
                </div>
                <button className="flex items-center gap-2 bg-[#0D3D25] hover:bg-[#0a2e1b] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "ID DAPUR",
                      "WAKTU SUBMIT",
                      "SKOR AI",
                      "STATUS",
                      "AKSI",
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
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                        row.status === "BAHAYA" ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-sm text-[#0D3D25]">
                        {row.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {row.waktu}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor(row.skor)}`}
                              style={{ width: `${row.skor}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-[#0D3D25]">
                            {row.skor}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusStyle[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm font-semibold text-[#1A8A52] hover:text-[#0D3D25] transition-colors">
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Menampilkan {filtered.length} dari 14,203 laporan aktif
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {[1, 2].map((n) => (
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
                  onClick={() => setPage(Math.min(2, page + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
