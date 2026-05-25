import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, List, UploadCloud, LogOut, Users, BarChart2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { DateRangeContext, defaultDesde, defaultHasta } from '../lib/dateRangeContext';

export default function MainLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const coreRoles = ['admin', 'operador', 'auditor', 'visor'];
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

        {/* ── Footer: cerrar sesión ── */}
        <div className={cn('py-4 border-t border-gray-100', sidebarOpen ? 'px-3' : 'px-2')}>
          <button
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
