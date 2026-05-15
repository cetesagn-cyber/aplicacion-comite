import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || `Error ${res.status}: sin respuesta del servidor`);

      localStorage.setItem('billee_token', data.token);
      localStorage.setItem('billee_user',  JSON.stringify(data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ fontFamily: 'Montserrat, Inter, sans-serif', background: '#f8f8f8' }}
    >
      {/* Fondo decorativo */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
           style={{ background: '#e8394a' }} />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-[0.05]"
           style={{ background: '#b21f2d' }} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl px-8 py-10">

        {/* Logo CT + ícono Bill-e */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="/logo-ct-horizontal-color.png"
            alt="Cementos Tequendama"
            className="h-40 object-contain"
          />
          <div className="flex items-center gap-2 mt-1">
            <img src="/logo-bille-1.png" alt="Bill-e" className="h-24 w-24 object-contain" />
            <span className="text-3xl font-bold text-gray-400 tracking-wide">Bill-e</span>
          </div>
        </div>

        {/* Títulos */}
        <div className="mb-7">
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Bienvenido de <span style={{ color: '#e8394a' }}>vuelta</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Ingresa tus credenciales para continuar.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl border text-sm font-medium"
               style={{ background: '#fff1f2', borderColor: '#ffc7cc', color: '#b21f2d' }}>
            <AlertCircle size={17} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Correo corporativo"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            style={{
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #e8394a 0%, #b21f2d 100%)',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(232,57,74,0.35)',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verificando…
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-8">
          © 2026 Cementos Tequendama
        </p>
      </div>
    </div>
  );
}
