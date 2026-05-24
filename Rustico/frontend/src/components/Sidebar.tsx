import { NavLink, useNavigate } from 'react-router-dom';
import { Calendar, Users, Scissors, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agenda',   icon: Calendar,        label: 'Agenda' },
  { to: '/clientes', icon: Users,           label: 'Clientes' },
  { to: '/barberos', icon: Scissors,        label: 'Barberos' },
];

export default function Sidebar() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minHeight: '100vh',
      background: 'var(--superficie)',
      borderRight: '1px solid var(--borde)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--borde)' }}>
        <div style={{ fontSize: 11, color: 'var(--texto-suave)', letterSpacing: '0.15em', marginBottom: 2 }}>
          BARBER & CONCEPT SHOP
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--blanco)', letterSpacing: '0.05em' }}>
          RÚSTICO
        </div>
        <div style={{ fontSize: 10, color: 'var(--verde)', marginTop: 2 }}>
          BarberAdmin v0.1.0
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '16px 8px' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              color: isActive ? 'var(--blanco)' : 'var(--texto-suave)',
              background: isActive ? 'var(--verde)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--borde)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--verde-oscuro)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={14} color="var(--texto-suave)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto)' }}>
              {usuario?.nombre}
            </div>
            <div style={{ fontSize: 11, color: 'var(--texto-suave)', textTransform: 'capitalize' }}>
              {usuario?.rol}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 12px', borderRadius: 6,
            border: '1px solid var(--borde)',
            background: 'transparent', color: 'var(--texto-suave)',
            fontSize: 13, transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--error)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--error)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--texto-suave)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--borde)';
          }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
