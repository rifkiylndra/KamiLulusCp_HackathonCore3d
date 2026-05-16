import { useState } from "react";
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerSppg } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [namaSppg, setNamaSppg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!namaSppg || !email || !password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerSppg({
        name: namaSppg,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message || "Registrasi gagal.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFF0E8] via-[#EEF7F2] to-[#E8F4F0] flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-[#0D5C3A] rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-[#0D3D25] text-xl tracking-tight">
          NutriGuard
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
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">
                Registrasi berhasil! Mengalihkan ke halaman login...
              </p>
            </div>
          )}

          {/* Nama SPPG */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0D3D25]">
              Nama SPPG
            </label>
            <input
              type="text"
              placeholder="SPPG-XXX Kota"
              value={namaSppg}
              onChange={(e) => setNamaSppg(e.target.value)}
              required
              disabled={loading || success}
              className="w-full bg-[#F0F7F3] border border-transparent focus:border-[#1A8A52] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all"
            />
          </div>

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
              required
              disabled={loading || success}
              className="w-full bg-[#F0F7F3] border border-transparent focus:border-[#1A8A52] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0D3D25]">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading || success}
                className="w-full bg-[#F0F7F3] border border-transparent focus:border-[#1A8A52] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || success}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0D3D25]">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading || success}
                className="w-full bg-[#F0F7F3] border border-transparent focus:border-[#1A8A52] focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading || success}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#0D5C3A] hover:bg-[#0a4a2f] text-white font-semibold py-3 rounded-2xl transition-all duration-200 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : success ? "Berhasil!" : "Daftar"}
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="text-[#1A8A52] font-semibold hover:underline"
          >
            Masuk di sini
          </a>
        </p>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-7 leading-relaxed uppercase tracking-wide">
          Sistem Terenkripsi End-to-End
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