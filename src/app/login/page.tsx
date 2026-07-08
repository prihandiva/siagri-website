"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Leaf } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah. Silakan coba lagi.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decorative elements */}
      <div className="login-bg">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      {/* Left panel - Branding */}
      <div className="login-left">
        <div className="login-brand">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <Leaf size={32} strokeWidth={1.5} />
            </div>
            <div>
              <div className="login-logo-title">SIAGRI</div>
              <div className="login-logo-tagline">Sistem Informasi Agribisnis</div>
            </div>
          </div>

          <div className="login-hero-text">
            <h1 className="login-hero-title">
              Data Pertanian<br />Lebih Terdata,<br />Kebijakan Lebih Tepat
            </h1>
            <p className="login-hero-desc">
              Platform pengelolaan data agribisnis terintegrasi dari tingkat desa
              hingga provinsi. Mendukung perencanaan pembangunan sektor pertanian
              berbasis data akurat.
            </p>
          </div>

          {/* Features list */}
          <div className="login-features">
            {[
              { icon: "🗺️", text: "Peta sebaran komoditas interaktif" },
              { icon: "📊", text: "Dashboard analitik multi-level" },
              { icon: "📱", text: "Tersedia di web & mobile" },
              { icon: "🔐", text: "Hak akses berbasis wilayah" },
            ].map((f, i) => (
              <div key={i} className="login-feature-item">
                <span className="login-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="login-attribution">
          <span>Dikembangkan oleh</span>
          <strong>Dharma Jaya Revolusi × Arelda Industries</strong>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="login-right">
        <div className="login-form-container">
          {/* Mobile logo */}
          <div className="login-form-logo">
            <div className="login-form-logo-icon">
              <Leaf size={20} strokeWidth={1.5} />
            </div>
            <span>SIAGRI</span>
          </div>

          <div className="login-form-header">
            <h2>Selamat Datang</h2>
            <p>Masuk ke akun SIAGRI Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Error message */}
            {error && (
              <div className="login-error" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label required">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label required">
                Password
              </label>
              <div className="input-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="login-form-footer">
            <p>
              Lupa password? Hubungi admin wilayah Anda atau{" "}
              <a href="mailto:admin@siagri.id">admin@siagri.id</a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Background circles */
        .login-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .login-bg-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.06;
          background: #4CAF50;
        }
        .login-bg-circle-1 { width: 600px; height: 600px; top: -200px; left: -200px; }
        .login-bg-circle-2 { width: 400px; height: 400px; bottom: -150px; left: 10%; opacity: 0.04; }
        .login-bg-circle-3 { width: 300px; height: 300px; top: 40%; right: 55%; opacity: 0.05; }

        /* LEFT PANEL */
        .login-left {
          width: 55%;
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%);
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          color: white;
        }

        .login-brand { flex: 1; display: flex; flex-direction: column; justify-content: center; }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .login-logo-icon {
          width: 56px;
          height: 56px;
          background: rgba(255,255,255,0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          color: white;
        }

        .login-logo-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          line-height: 1;
        }

        .login-logo-tagline {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .login-hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: white;
          margin-bottom: 1.25rem;
        }

        .login-hero-desc {
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          max-width: 440px;
          margin-bottom: 2.5rem;
        }

        .login-features { display: flex; flex-direction: column; gap: 0.875rem; }

        .login-feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.85);
        }

        .login-feature-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .login-attribution {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          gap: 0.25rem;
        }

        .login-attribution strong { color: rgba(255,255,255,0.75); font-weight: 500; }

        /* RIGHT PANEL */
        .login-right {
          width: 45%;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .login-form-container {
          width: 100%;
          max-width: 380px;
        }

        .login-form-logo {
          display: none;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1B5E20;
          letter-spacing: 0.1em;
        }

        .login-form-logo-icon {
          width: 36px;
          height: 36px;
          background: #1B5E20;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .login-form-header { margin-bottom: 1.75rem; }

        .login-form-header h2 {
          font-size: 1.625rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.375rem;
        }

        .login-form-header p {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .login-form { display: flex; flex-direction: column; gap: 0.25rem; }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          color: #DC2626;
          margin-bottom: 0.5rem;
        }

        .input-password-wrapper { position: relative; }

        .input-password-toggle {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }

        .input-password-toggle:hover { color: #6B7280; }

        .login-submit-btn {
          width: 100%;
          justify-content: center;
          padding: 0.75rem;
          font-size: 0.9375rem;
          border-radius: 8px;
          margin-top: 0.5rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .login-form-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.8125rem;
          color: #9CA3AF;
        }

        .login-form-footer a {
          color: #1B5E20;
          text-decoration: none;
          font-weight: 500;
        }

        .login-form-footer a:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { width: 100%; }
          .login-form-logo { display: flex; }
        }
      `}</style>
    </div>
  );
}
