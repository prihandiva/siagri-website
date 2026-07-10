"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Leaf, Map, Database, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Login gagal. Periksa username dan password Anda.");
      } else {
        toast.success("Login berhasil!");
        router.replace("/"); // Menggunakan replace agar tidak stuck di history browser
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan pada sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Left Panel: Branding & Information */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-emerald-800 to-green-600 p-12 text-white flex-col justify-between relative overflow-hidden shadow-2xl z-10">
        {/* Background decorations */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
              <Leaf size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-wider">SIAGRI</h1>
              <p className="text-xs font-medium tracking-widest text-emerald-100 uppercase mt-1">Sistem Informasi Agribisnis</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight drop-shadow-md">
              Data Pertanian <br />Lebih <span className="text-green-300">Terdata</span>,<br />Kebijakan Lebih <span className="text-green-300">Tepat</span>
            </h2>
            <p className="text-emerald-50 text-lg leading-relaxed max-w-md">
              Platform pengelolaan data agribisnis terintegrasi dari tingkat desa hingga provinsi untuk perencanaan pembangunan pertanian yang cerdas.
            </p>
          </div>

          <div className="mt-16 space-y-5">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="bg-emerald-500/50 p-2 rounded-lg"><Map size={20} /></div>
              <span className="font-medium text-emerald-50">Pemetaan Komoditas Interaktif</span>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="bg-emerald-500/50 p-2 rounded-lg"><Database size={20} /></div>
              <span className="font-medium text-emerald-50">Dashboard Analitik Multi-Level</span>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="bg-emerald-500/50 p-2 rounded-lg"><ShieldCheck size={20} /></div>
              <span className="font-medium text-emerald-50">Sistem Keamanan Berlapis</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-emerald-200/80 border-t border-white/10 pt-6 mt-12 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} SIAGRI</span>
          <span>Dharma Jaya Revolusi &times; Arelda Industries</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-slate-50 relative">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-10 transform transition-all hover:-translate-y-1 hover:shadow-2xl">
          
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf size={28} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-wider">SIAGRI</h1>
            </div>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang</h2>
            <p className="text-slate-500 font-medium">Masuk untuk mengelola data agribisnis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-slate-700 ml-1">Username</label>
              <input
                id="username"
                type="text"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-slate-400"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2 relative">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 transition-colors cursor-pointer" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Ingat saya</span>
              </label>
              <a href="#" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">Lupa Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-bold shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Butuh bantuan? Hubungi <a href="mailto:admin@siagri.id" className="font-semibold text-green-600 hover:underline">Administrator</a>
          </p>
        </div>
      </div>
    </div>
  );
}
