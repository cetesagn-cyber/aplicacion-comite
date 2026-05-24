import { useState } from 'react';
import { BarChart2, DollarSign, BookOpen } from 'lucide-react';
import Ventas from './Ventas';
import Cierre from './Cierre';
import Estadisticas from './Estadisticas';

type FinTab = 'ventas' | 'cierre' | 'estadisticas';

const TABS: { id: FinTab; label: string; icon: React.ElementType; sub: string }[] = [
  { id: 'ventas',       label: 'Ingresos del Día', icon: DollarSign, sub: 'Registro de ventas'         },
  { id: 'cierre',       label: 'Cierre Diario',    icon: BookOpen,   sub: 'Cuadre de caja y gastos'    },
  { id: 'estadisticas', label: 'Estadísticas',     icon: BarChart2,  sub: 'Resumen semanal de ventas'  },
];

export default function Financiera() {
  const [tab, setTab] = useState<FinTab>('ventas');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignSelf: 'flex-start', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: tab === t.id ? 'var(--bg-tertiary)' : 'transparent',
              color: tab === t.id ? 'var(--accent-gold)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-header)',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              borderBottom: tab === t.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'ventas'       && <Ventas />}
        {tab === 'cierre'       && <Cierre />}
        {tab === 'estadisticas' && <Estadisticas />}
      </div>

    </div>
  );
}
