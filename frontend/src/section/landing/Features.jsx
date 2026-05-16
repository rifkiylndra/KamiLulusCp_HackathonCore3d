import {
  Camera,
  AlertTriangle,
  Activity,
} from "lucide-react";

function Features() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Visual Extraction — large card */}
        <div className="md:col-span-3 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-[#E6F4EC] rounded-2xl flex items-center justify-center mb-6">
            <Camera className="w-6 h-6 text-[#1A8A52]" />
          </div>
          <h2 className="text-4xl font-bold mb-3">
            Ekstraksi Visual
          </h2>
          <p className="text-lg leading-relaxed mb-6">
            Gunakan kamera inspeksi bertenaga AI untuk otomatis mengenali bahan
            baku, porsi sajian, dan identifikasi hama dari foto menu harian
            secara instan.
          </p>

          {/* Mock "photo scan" image */}
          <div className="rounded-2xl overflow-hidden bg-gray-800 relative">
            <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 relative">
              {/* Scan UI mockup */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Food tray illustration */}
                <div className="relative">
                  <div className="w-52 h-28 bg-gray-600 rounded-xl flex items-center justify-center gap-3 shadow-2xl">
                    <div className="w-14 h-14 rounded-full bg-gray-500 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gray-400 opacity-70" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="w-16 h-4 bg-gray-400 rounded opacity-60" />
                      <div className="w-12 h-4 bg-gray-500 rounded opacity-50" />
                      <div className="w-14 h-4 bg-gray-400 rounded opacity-60" />
                    </div>
                  </div>
                  {/* scan line */}
                  <div className="absolute -inset-2 border-2 border-[#1A8A52]/60 rounded-xl animate-pulse" />
                  {/* corner marks */}
                  {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
                    (pos, i) => (
                      <div
                        key={i}
                        className={`absolute ${pos} w-3 h-3 border-[#1A8A52] border-2 ${
                          i === 0
                            ? "border-r-0 border-b-0 -translate-x-2 -translate-y-2"
                            : i === 1
                            ? "border-l-0 border-b-0 translate-x-2 -translate-y-2"
                            : i === 2
                            ? "border-r-0 border-t-0 -translate-x-2 translate-y-2"
                            : "border-l-0 border-t-0 translate-x-2 translate-y-2"
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              {/* scan labels */}
              <div className="absolute top-3 left-3 bg-[#1A8A52]/80 text-white text-xs px-2 py-1 rounded-full font-medium">
                AI Scanning...
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1">
                {["Nasi", "Ayam", "Sayur"].map((label) => (
                  <span
                    key={label}
                    className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — 2 stacked cards */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Scoring Engine */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex-1">
            <div className="w-12 h-12 bg-[#E6F4EC] rounded-2xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-[#1A8A52]" />
            </div>
            <h3 className="text-3xl font-bold  mb-2">
              Scoring Engine
            </h3>
            <p className="text-lg leading-relaxed">
              Validasi Gizi (40%), Keamanan Waktu (40%), dan Sanitasi (20%)
              secara real-time berdasarkan data input SPPG.
            </p>

            
          </div>

          {/* Emergency Action */}
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-3xl font-bold text-red-600 mb-2">
              Tindakan Darurat
            </h3>
            <p className="text-red-500 text-lg leading-relaxed">
              Sistem memblokir distribusi jika jeda masak ke sajian melewati
              batas kritis 4 jam untuk mencegah keracunan masal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;