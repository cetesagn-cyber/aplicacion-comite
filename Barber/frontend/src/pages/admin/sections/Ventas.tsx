import { useState, useEffect } from 'react';
import { DollarSign, Scissors, Check, TrendingUp, RefreshCw } from 'lucide-react';
import { ApiClient } from '../../../services/api.client';

interface Sale {
  id: string;
  start_at: string;
  service_name: string;
  client_name: string;
  professional_id: string;
  price_cop: number;
  status: string;
}

const BARBERS: Record<string, string> = {
  'd1d11111-1111-1111-1111-111111111111': 'Mateo Silva',
  'd2d22222-2222-2222-2222-222222222222': 'Santiago Ruíz',
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  completed:   { label: 'Completado',  color: 'var(--success)'        },
  confirmed:   { label: 'Confirmado',  color: 'var(--accent-copper)'  },
  in_progress: { label: 'En curso',    color: 'var(--info)'           },
  pending:     { label: 'Pendiente',   color: 'var(--warning)'        },
  cancelled:   { label: 'Cancelado',   color: 'var(--danger)'         },
  no_show:     { label: 'No asistió',  color: 'var(--danger)'         },
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const formatTime = (iso: string) => iso.split('T')[1]?.slice(0, 5) ?? '--:--';

export default function Ventas() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (d: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.getAdminAgenda('c1c11111-1111-1111-1111-111111111111', d);
      setSales(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(date); }, [date]);

  const active   = sales.filter(s => s.status !== 'cancelled' && s.status !== 'no_show');
  const revenue  = active.reduce((sum, s) => sum + s.price_cop, 0);
  const done     = sales.filter(s => s.status === 'completed').length;
  const avgTicket = active.length ? Math.round(revenue / active.length) : 0;

  const byBarber = Object.entries(BARBERS).map(([id, name]) => {
    const items = active.filter(s => s.professional_id === id);
    return { name, items, total: items.reduce((sum, s) => sum + s.price_cop, 0) };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Ventas <span className="gold-gradient-text">del Día</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Registro de servicios y cobros</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-md)', color: '#fff', outline: 'none' }}
          />
          <button onClick={() => load(date)} disabled={loading} className="btn-secondary" style={{ padding: '8px 12px' }}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '14px' }}>
        {[
          { label: 'Total ingresos',      value: formatCOP(revenue),       icon: DollarSign, color: 'var(--accent-gold)',    glow: 'var(--accent-gold-glow)'    },
          { label: 'Servicios activos',   value: String(active.length),    icon: Scissors,   color: 'var(--accent-copper)',  glow: 'var(--accent-copper-glow)'  },
          { label: 'Completados',         value: String(done),             icon: Check,      color: 'var(--success)',        glow: 'rgba(26,155,110,0.12)'      },
          { label: 'Ticket promedio',     value: formatCOP(avgTicket),     icon: TrendingUp,  color: 'var(--info)',           glow: 'rgba(59,130,246,0.10)'      },
        ].map(k => (
          <div key={k.label} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ background: k.glow, color: k.color, padding: '10px', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
              <k.icon size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Per-barber panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '16px' }}>
        {byBarber.map(b => (
          <div key={b.name} className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{b.name}</h3>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.1rem' }}>{formatCOP(b.total)}</span>
            </div>
            {b.items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>Sin ventas registradas</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {b.items.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{s.service_name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.client_name} · {formatTime(s.start_at)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700 }}>{formatCOP(s.price_cop)}</p>
                      <p style={{ fontSize: '0.7rem', color: STATUS_META[s.status]?.color || 'var(--text-muted)' }}>
                        {STATUS_META[s.status]?.label || s.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full detail table */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '18px' }}>Detalle completo</h3>

        {sales.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No hay registros para esta fecha.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Hora', 'Servicio', 'Cliente', 'Barbero', 'Precio', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontFamily: 'var(--font-header)', fontSize: '0.7rem', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => {
                const meta = STATUS_META[s.status];
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-copper)', fontWeight: 600 }}>{formatTime(s.start_at)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.service_name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{s.client_name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{BARBERS[s.professional_id] || '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{formatCOP(s.price_cop)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px',
                        borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                        background: (meta?.color || 'var(--border-color)') + '22',
                        color: meta?.color || 'var(--text-muted)',
                        border: `1px solid ${(meta?.color || 'var(--border-color)')}55`,
                      }}>
                        {meta?.label || s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                <td colSpan={4} style={{ padding: '12px 12px', fontFamily: 'var(--font-header)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Total del día
                </td>
                <td style={{ padding: '12px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>{formatCOP(revenue)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

    </div>
  );
}
