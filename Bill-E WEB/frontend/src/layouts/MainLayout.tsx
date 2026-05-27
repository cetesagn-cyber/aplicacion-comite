import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, List, UploadCloud, LogOut, Users, BarChart2, ChevronLeft, ChevronRight, ShieldCheck, KeyRound, Eye, EyeOff, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { DateRangeContext, defaultDesde, defaultHasta } from '../lib/dateRangeContext';

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (next !== confirm) { setError('Las claves nuevas no coinciden'); return; }
    if (next.length < 6)  { setError('La nueva clave debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('billee_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-[#e8394a]" />
            <h2 className="text-base font-bold text-gray-900">Cambiar clave</h2>
          </div>
          <button onClick={onClose} title="Cerrar" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {success ? (
            <p className="text-center text-green-600 font-semibold py-4">✓ Clave actualizada correctamente</p>
          ) : (
            <>
              <div>
                <label htmlFor="cp-current" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Clave actual</label>
                <div className="relative">
                  <input id="cp-current" type={showCur ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)}
                    required autoComplete="current-password" placeholder="••••••••" className={inp} />
                  <button type="button" title={showCur ? 'Ocultar' : 'Mostrar'} onClick={() => setShowCur(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="cp-new" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nueva clave</label>
                <div className="relative">
                  <input id="cp-new" type={showNew ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)}
                    required autoComplete="new-password" placeholder="Mínimo 6 caracteres" className={inp} />
                  <button type="button" title={showNew ? 'Ocultar' : 'Mostrar'} onClick={() => setShowNew(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="cp-confirm" className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Confirmar nueva clave</label>
                <input id="cp-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  required autoComplete="new-password" placeholder="Repite la nueva clave" className={inp} />
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60"
                  style={{ background: '#e8394a' }}>
                  {loading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChangePwd, setShowChangePwd] = useState(false);

  // ── Guard: redirige a login si no hay token ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('billee_token');
    if (!token) { navigate('/login', { replace: true }); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); })
      .catch(() => {
        localStorage.removeItem('billee_token');
        localStorage.removeItem('billee_user');
        navigate('/login', { replace: true });
      });
  }, [navigate]);

  const rawUser = localStorage.getItem('billee_user');
  const user    = rawUser ? JSON.parse(rawUser) : { full_name: 'Usuario', role: 'operador' };

  const [desde, setDesde] = useState(defaultDesde);
  const [hasta, setHasta] = useState(defaultHasta);

  const coreRoles = ['admin', 'operador'];
  const menuItems = [
    { name: 'Inicio',     path: '/',           icon: <Home size={18} />,        end: true,  roles: coreRoles },
    { name: 'Gestión',    path: '/gestion',    icon: <List size={18} />,        end: false, roles: coreRoles },
    { name: 'Radicación', path: '/radicacion', icon: <UploadCloud size={18} />, end: false, roles: coreRoles },
    { name: 'Reportes',   path: '/reportes',   icon: <BarChart2 size={18} />,   end: false, roles: coreRoles },
    { name: 'Usuarios',   path: '/usuarios',   icon: <Users size={18} />,       end: false, roles: ['admin'] },
    { name: 'Auditoría',  path: '/auditoria',  icon: <ShieldCheck size={18} />, end: false, roles: ['admin'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <DateRangeContext.Provider value={{ desde, hasta, setDesde, setHasta }}>
    {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">

      {/* ═══════════════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════════════ */}
      <aside className={cn(
        'relative flex flex-col flex-shrink-0 bg-white border-r border-gray-200 shadow-sm z-10 transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-14'
      )}>

        {/* ── Botón colapsar — flota en el borde derecho ── */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          className="absolute -right-3 top-8 z-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-400 hover:text-[#e8394a] hover:border-red-200 transition-all hover:shadow-lg"
        >
          {sidebarOpen
            ? <ChevronLeft size={11} strokeWidth={2.5} />
            : <ChevronRight size={11} strokeWidth={2.5} />}
        </button>

        {/* ── Cabecera ── */}
        {sidebarOpen ? (
          <div className="flex flex-col items-center px-5 pt-5 pb-4 gap-3 bg-white border-b border-gray-100 overflow-hidden">
            <img
              src="/logo-ct-horizontal-color.png"
              alt="Cementos Tequendama"
              className="w-full h-auto object-contain max-h-[56px]"
            />
            <div className="rounded-2xl overflow-hidden w-full shadow-sm border border-gray-100 h-[148px]">
              <img
                src="/logo-bille-portada.png"
                alt="Bill-e"
                className="w-full h-full object-cover object-[center_18%]"
              />
            </div>
            <p className="text-2xl font-bold tracking-wide text-[#e8394a]">
              Bill-e
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-0.5 flex-shrink-0">
              <img src="/logo-bille-1.png" alt="Bill-e" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        {/* ── Navegación ── */}
        <nav className={cn('flex-1 flex flex-col gap-0.5 py-4', sidebarOpen ? 'px-3' : 'px-2')}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              title={!sidebarOpen ? item.name : undefined}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                sidebarOpen ? 'px-4 py-2.5' : 'px-2.5 py-2.5 justify-center',
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-[#555558] hover:bg-red-50 hover:text-[#e8394a]'
              )}
              style={({ isActive }) =>
                isActive
                  ? { background: 'linear-gradient(90deg, #e8394a, #d42a3a)', boxShadow: '0 2px 10px rgba(232,57,74,0.30)' }
                  : {}
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="tracking-wide">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── Footer: cambiar clave + cerrar sesión ── */}
        <div className={cn('py-4 border-t border-gray-100 flex flex-col gap-0.5', sidebarOpen ? 'px-3' : 'px-2')}>
          <button
            type="button"
            onClick={() => setShowChangePwd(true)}
            title={!sidebarOpen ? 'Cambiar Clave' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm font-medium text-[#555558] hover:bg-red-50 hover:text-[#e8394a] transition-all',
              sidebarOpen ? 'px-4 py-2.5' : 'px-2.5 py-2.5 justify-center'
            )}
          >
            <KeyRound size={18} />
            {sidebarOpen && <span>Cambiar Clave</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('billee_token');
              localStorage.removeItem('billee_user');
              navigate('/login');
            }}
            title={!sidebarOpen ? 'Cerrar Sesión' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm font-medium text-[#555558] hover:bg-red-50 hover:text-[#e8394a] transition-all',
              sidebarOpen ? 'px-4 py-2.5' : 'px-2.5 py-2.5 justify-center'
            )}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          ÁREA PRINCIPAL
      ═══════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 min-w-0">

        {/* Header superior */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 shrink-0 shadow-sm flex items-center justify-between gap-6">
          <h2 className="text-lg font-bold tracking-tight whitespace-nowrap text-[#555558]">
            Portal de Gestión de Facturación
          </h2>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#e8394a] shadow-md bg-white flex-shrink-0 flex items-center justify-center p-1">
              <img src="/logo-bille-1.png" alt="Bill-e" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold truncate max-w-[160px] text-[#2e2e30]">{user.full_name}</p>
              <p className="text-[11px] capitalize text-[#87878b]">{user.role}</p>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
    </DateRangeContext.Provider>
  );
}
