import { useState, useEffect } from "react";
import { 
  Shield, 
  Menu,
  X,
} from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0D5C3A] rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0D3D25] text-lg tracking-tight">
            NutriGuard <span className="text-[#1A8A52]">MBG</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Sains", "Mitra"].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-sm font-medium transition-colors ${
                item === "Home"
                  ? "text-[#0D3D25] underline underline-offset-4 decoration-[#1A8A52]"
                  : "text-gray-500 hover:text-[#0D3D25]"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button className="bg-[#0D5C3A] hover:bg-[#0a4a2e] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
            Masuk Workspace
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">
          {["Home", "Sains", "Mitra"].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-gray-700">
              {item}
            </a>
          ))}
          <button className="bg-[#0D5C3A] text-white text-sm font-semibold px-5 py-2.5 rounded-full w-full">
            Masuk Workspace
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;