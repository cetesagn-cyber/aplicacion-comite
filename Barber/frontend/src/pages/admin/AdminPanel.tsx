import { useState } from 'react';
import { Calendar, Package, BarChart2, BookUser, LogOut } from 'lucide-react';
import Programacion from './sections/Programacion';
import Despacho from './sections/Despacho';
import Financiera from './sections/Financiera';
import Libreta from './sections/Libreta';
import './AdminPanel.css';

type AdminSection = 'programacion' | 'despacho' | 'financiera' | 'libreta';

interface Props {
  onBack: () => void;
}

const NAV_ITEMS: { id: AdminSection; label: string; sub: string; icon: React.ElementType }[] = [
  { id: 'programacion', label: 'Programación',  sub: 'Grilla interactiva de reservas',  icon: Calendar  },
  { id: 'despacho',     label: 'Despacho',       sub: 'Órdenes y envíos de tienda',      icon: Package   },
  { id: 'financiera',   label: 'Financiera',     sub: 'Ventas, cierre y estadísticas',   icon: BarChart2 },
  { id: 'libreta',      label: 'Libreta',         sub: 'Directorio de clientes',          icon: BookUser  },
];

export default function AdminPanel({ onBack }: Props) {
  const [section, setSection] = useState<AdminSection>('programacion');

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const active = NAV_ITEMS.find(n => n.id === section)!;

  return (
    <div className="admin-shell">

      {/* ══ SIDEBAR ══ */}
      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">
          <img src="/logo-rustico.png" alt="Rústico" className="admin-brand-logo" />
          <p className="admin-brand-name">RÚSTICO</p>
          <p className="admin-brand-tag">PANEL ADMINISTRATIVO</p>
        </div>

        <div className="admin-ornament">
          <span className="admin-ornament-line" />
          <span className="admin-ornament-diamond" />
          <span className="admin-ornament-line" />
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ id, label, sub, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`admin-nav-item${section === id ? ' admin-nav-item--active' : ''}`}
              onClick={() => setSection(id)}
            >
              <div className="admin-nav-icon-wrap">
                <Icon size={17} />
              </div>
              <div className="admin-nav-text">
                <span className="admin-nav-label">{label}</span>
                <span className="admin-nav-sub">{sub}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-footer-est">Est. 2018 · Bogotá, Colombia</p>
          <button type="button" className="admin-logout-btn" onClick={onBack}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>

      </aside>

      {/* ══ MAIN ══ */}
      <main className="admin-main">

        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <p className="admin-topbar-section">{active.label}</p>
            <p className="admin-topbar-sub">{active.sub}</p>
          </div>
          <p className="admin-topbar-date">{today}</p>
        </div>

        <div className="admin-content">
          {section === 'programacion' && <Programacion />}
          {section === 'despacho'     && <Despacho />}
          {section === 'financiera'   && <Financiera />}
          {section === 'libreta'      && <Libreta />}
        </div>

      </main>

    </div>
  );
}
