import { useState, useEffect } from 'react';
import { BookOpen, Check, RefreshCw } from 'lucide-react';
import { ApiClient } from '../../../services/api.client';

interface Booking {
  id: string;
  professional_id: string;
  service_name: string;
  price_cop: number;
  status: string;
}

const BARBERS: Record<string, string> = {
  'd1d11111-1111-1111-1111-111111111111': 'Mateo Silva',
  'd2d22222-2222-2222-2222-222222222222': 'Santiago Ruíz',
};

type ExpenseKey = 'productos' | 'limpieza' | 'servicios' | 'otros';

const EXPENSE_LABELS: Record<ExpenseKey, string> = {
  productos: 'Productos y consumibles',
  limpieza:  'Limpieza y lavandería',
  servicios: 'Servicios (agua, luz, etc.)',
  otros:     'Otros gastos',
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const parseNum = (s: string) => parseFloat(s.replace(/\D/g, '')) || 0;

export default function Cierre() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(false);
  const [closed, setClosed]     = useState(false);
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({
    productos: '', limpieza: '', servicios: '', otros: '',
  });

  const load = async (d: string) => {
    setLoading(true);
    setClosed(false);
    try {
      const data = await ApiClient.getAdminAgenda('c1c11111-1111-1111-1111-111111111111', d);
      setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(date); }, [date]);

  const active        = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'no_show');
  const totalIngresos = active.reduce((s, b) => s + b.price_cop, 0);
  const totalGastos   = Object.values(expenses).reduce((s, v) => s + parseNum(v), 0);
  const neto          = totalIngresos - totalGastos;

  const byBarber = Object.entries(BARBERS).map(([id, name]) => {
    const items = active.filter(b => b.professional_id === id);
    return { name, count: items.length, total: items.reduce((s, b) => s + b.price_cop, 0) };
  });

  const setExp = (key: ExpenseKey, val: string) =>
    setExpenses(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Cierre <span className="gold-gradient-text">Diario</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Resumen contable y cuadre de caja</p>
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

      {/* Success banner */}
      {closed && (
        <div style={{ background: 'rgba(26,155,110,0.08)', border: '1px solid rgba(26,155,110,0.3)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(26,155,110,0.15)', color: 'var(--success)', padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
            <Check size={20} />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '3px' }}>Cierre registrado exitosamente</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Día {date} cerrado. Resultado neto: <strong style={{ color: neto >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCOP(neto)}</strong>
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Left col: resumen + barberos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '18px', borderLeft: '3px solid var(--accent-gold)' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Ingresos brutos</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-gold)' }}>{formatCOP(totalIngresos)}</p>
            </div>
            <div className="glass-panel" style={{ padding: '18px', borderLeft: '3px solid var(--danger)' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Total gastos</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--danger)' }}>{formatCOP(totalGastos)}</p>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderLeft: `3px solid ${neto >= 0 ? 'var(--success)' : 'var(--danger)'}`, gridColumn: '1 / -1' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Resultado neto</p>
              <p style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px', color: neto >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCOP(neto)}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{active.length} servicio{active.length !== 1 ? 's' : ''} facturado{active.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* By barber */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Por barbero</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {byBarber.map(b => (
                <div key={b.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{b.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-copper)' }}>{formatCOP(b.total)}</span>
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', height: '7px', overflow: 'hidden' }}>
                    <div style={{
                      width: totalIngresos > 0 ? `${Math.round((b.total / totalIngresos) * 100)}%` : '0%',
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent-copper), var(--accent-gold))',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {b.count} servicio{b.count !== 1 ? 's' : ''} · {totalIngresos > 0 ? Math.round((b.total / totalIngresos) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: expenses form */}
        <div className="glass-panel" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Registro de gastos</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {(Object.entries(EXPENSE_LABELS) as [ExpenseKey, string][]).map(([key, label]) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={expenses[key]}
                    onChange={e => setExp(key, e.target.value)}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-copper)')}
                    onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 12px 10px 26px',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff', outline: 'none', fontSize: '0.9rem',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total gastos</span>
            <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1.2rem' }}>{formatCOP(totalGastos)}</span>
          </div>

          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setClosed(true)}
          >
            <BookOpen size={15} />
            Registrar Cierre del Día
          </button>
        </div>

      </div>
    </div>
  );
}
