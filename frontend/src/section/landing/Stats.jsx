function Stats() {
  const stats = [
    { value: "14.7K+", label: "Titik SPPG Terdaftar" },
    { value: "0.0%", label: "Insiden Keamanan Pangan" },
    { value: "2.4jt", label: "Sajian Terverifikasi" },
    { value: "98%", label: "Akurasi Nutrisi AI" },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-4xl md:text-5xl font-extrabold text-[#1A8A52] tracking-tight">
              {value}
            </span>
            <span className="text-gray-500 text-sm mt-1">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;