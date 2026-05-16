import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Email harus diisi");
      return;
    }

    if (!password.trim()) {
      setError("Kata sandi harus diisi");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    // Password minimum length
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }

    setLoading(true);
    
    // TODO: Call actual login API
    // For now, simulate login
    setTimeout(() => {
      setLoading(false);
      navigate("/home");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFF0E8] via-[#EEF7F2] to-[#E8F4F0] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 bg-[#0D5C3A] rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <span className="font-bold text-[#0D3D25] text-2xl tracking-tight">
          NutriGuard <span className="text-[#1A8A52]">MBG</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-green-900/10 border border-white p-8">
        {/* Shield icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-[#E6F4EC] rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-[#1A8A52]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#0D3D25] text-center mb-1">
          Masuk ke Sistem
        </h1>
        <p className="text-gray-400 text-sm text-center mb-7">
          Gunakan kredensial SPPG atau BGN Anda.
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0D3D25]">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="nama@instansi.go.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F0F7F3] border border-transparent focus:border-[#1A8A52] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#0D3D25]">
                Kata Sandi
              </label>
              <a
                href="#"
                className="text-sm text-[#1A8A52] hover:underline font-medium"
              >
                Lupa sandi?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F0F7F3] border border-transparent focus:border-[#1A8A52] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full border-2 border-[#1A8A52] text-[#1A8A52] hover:bg-[#1A8A52] hover:text-white font-semibold py-3 rounded-2xl transition-all duration-200 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-7 leading-relaxed">
          Sistem ini hanya untuk penggunaan resmi
          <br />
          NutriGuard MBG © 2024
        </p>
      </div>

      {/* Bottom trust badges */}
      <div className="flex items-center gap-6 mt-6 text-gray-400 text-xs">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>ISO 27001 Certified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🔒</span>
          <span>SSL Secured</span>
        </div>
      </div>
    </div>
  );
}
