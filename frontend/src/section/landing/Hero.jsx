import { Scan } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#EEF7F1] to-white text-center">
      <div className="max-w-3xl mx-auto">
        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#0D3D25] leading-[1.1] tracking-tight mb-6">
          Mengawal Nutrisi.
          <br />
          Mencegah Krisis di Setiap
          <br />
          Porsi.
        </h1>

        {/* Subheading */}
        <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Platform pengawasan gizi dan sanitasi proaktif untuk 14.700+ Satuan
          Pelayanan Program Gizi (SPPG) di seluruh Indonesia.
        </p>

        {/* CTA Button */}
        <Link to="/login">
          <button className="inline-flex items-center gap-2 bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            <Scan className="w-4 h-4" />
            Mulai Inspeksi AI
          </button>
        </Link>
      </div>
    </section>
  );
}

export default Hero;
