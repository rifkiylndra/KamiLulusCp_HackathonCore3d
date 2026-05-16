import { useState, useEffect } from "react";
import { Shield, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function NavbarLogin() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    {
      label: "Home",
      path: "/home",
    },
    {
      label: "Laporan",
      path: "/riwayat",
    },
    {
      label: "Submit",
      path: "/submit",
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur shadow-sm"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0D5C3A] rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>

          <span className="font-bold text-[#0D3D25] text-lg tracking-tight">
            NutriGuard 
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-[#0D3D25] underline underline-offset-4 decoration-[#1A8A52]"
                    : "text-gray-500 hover:text-[#0D3D25]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Logout */}
        <div className="hidden md:block">
          <Link to="/login">
            <button className="bg-[#0D5C3A] text-white text-sm font-semibold px-5 py-2.5 rounded-full">
              LogOut
            </button>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">

          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-[#0D3D25]"
                    : "text-gray-500"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link to="/login">
            <button className="bg-[#0D5C3A] text-white text-sm font-semibold px-5 py-2.5 rounded-full w-full">
              LogOut
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default NavbarLogin;