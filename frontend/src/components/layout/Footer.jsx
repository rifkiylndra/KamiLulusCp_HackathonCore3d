import { Shield,  Mail } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#0D1F17] text-white pt-14 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#1A8A52] rounded-full flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg">NutriGuard MBG</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Jl. Kebon Sirih No.1, RT.1/RW.7, Kb. Sirih, Kec. Menteng, Kota
              Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10340
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://www.instagram.com/badangizinasional.ri"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <FaInstagram className="w-4 h-4 text-gray-400" />
              </a>

              <a
                href="mailto:halo@bgn.go.id"
                className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Hubungi Kami */}
          <div>
            <h4 className="text-[#1A8A52] font-semibold text-sm mb-4 uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:halo@bgn.go.id"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Bantuan
                </a>
              </li>

              <li>
                <a
                  href="https://www.google.com/maps/place/Kementerian+Pertanian+Republik+Indonesia/@-6.2965741,106.8135791,1387m/data=!3m1!1e3!4m6!3m5!1s0x2e69edfdd6a06271:0x126574416be048a3!8m2!3d-6.2969793!4d106.8222265!16s%2Fg%2F12396wj1?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Alamat
                </a>
              </li>
            </ul>
          </div>

          {/* Hotline */}
          <div>
            <h4 className="text-[#1A8A52] font-semibold text-sm mb-4 uppercase tracking-wider">
              Kontak Darurat BGN
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">
                HOTLINE 24/7
              </p>
              <p className="text-2xl font-extrabold text-white tracking-tight mb-2">
                127
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Laporan segera jika terjadi kontaminasi silang atau
                keterlambatan distribusi &gt; 3 jam.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 NutriGuard MBG. Teknologi Pengawasan Pangan Nasional.
          </p>
          <div className="flex gap-6">
            {["Kebijakan Privasi", "Syarat & Ketentuan"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-500 hover:text-white text-xs transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
