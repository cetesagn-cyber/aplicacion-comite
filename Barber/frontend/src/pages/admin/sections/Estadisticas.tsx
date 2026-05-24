import { TrendingUp, Scissors, Star, Clock } from 'lucide-react';

const DAYS    = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const REV_DAY = [420000, 380000, 550000, 490000, 680000, 820000, 0];
const SVC_DAY = [5, 4, 6, 5, 7, 9, 0];
const MAX_REV = Math.max(...REV_DAY);

const SERVICES = [
  { name: 'Corte de Cabello', count: 22, revenue: 1100000, pct: 100 },
  { name: 'Arreglo de Barba',  count: 12, revenue:  600000, pct:  55 },
  { name: 'Corte + Barba',    count: 10, revenue: 1000000, pct:  91 },
];

const PEAK_HOURS = [
  { hour: '09', pct: 60 }, { hour: '10', pct: 45 }, { hour: '11', pct: 80 },
  { hour: '12', pct: 55 }, { hour: '13', pct: 30 }, { hour: '14', pct: 75 },
  { hour: '15', pct: 65 }, { hour: '16', pct: 50 }, { hour: '17', pct: 40 },
  { hour: '18', pct: 20 },
];

const BARBERS_STATS = [
  { name: 'Mateo Silva',    services: 20, revenue: 1100000, rating: 4.9 },
  { name: 'Santiago Ruíz', services: 16, revenue: 1240000, rating: 4.8 },
];

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const totalRevWeek = REV_DAY.reduce((s, v) => s + v, 0);
const totalSvcWeek = SVC_DAY.reduce((s, v) => s + v, 0);

export default function Estadisticas() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2rem' }}>Estadísticas <span className="gold-gradient-text">de Ventas</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Resumen semanal — semana actual</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '14px' }}>
        {[
          { label: 'Ingresos semana',  value: formatCOP(totalRevWeek),                          icon: TrendingUp, color: 'var(--accent-gold)',   glow: 'var(--accent-gold-glow)'  },
          { label: 'Servicios semana', value: String(totalSvcWeek),                              icon: Scissors,   color: 'var(--accent-copper)', glow: 'var(--accent-copper-glow)'},
          { label: 'Ticket promedio',  value: formatCOP(Math.round(totalRevWeek / totalSvcWeek)),icon: Star,       color: 'var(--success)',       glow: 'rgba(26,155,110,0.12)'    },
          { label: 'Mejor día',        value: 'Sábado',                                          icon: Clock,      color: 'var(--info)',          glow: 'rgba(59,130,246,0.10)'    },
        ].map(k => (
          <div key={k.label} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ background: k.glow, color: k.color, padding: '10px', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
              <k.icon size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</p>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Revenue bar chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Ingresos por día
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '130px' }}>
            {DAYS.map((day, i) => (
              <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', height: '100%', justifyContent: 'flex-end' }}>
                {REV_DAY[i] > 0 && (
                  <span style={{ fontSize: '0.58rem', color: 'var(--accent-copper)', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                    {(REV_DAY[i] / 1000).toFixed(0)}k
                  </span>
                )}
                <div style={{
                  width: '100%',
                  height: MAX_REV > 0 ? `${Math.round((REV_DAY[i] / MAX_REV) * 100)}px` : '4px',
                  background: REV_DAY[i] > 0
                    ? 'linear-gradient(0deg, var(--accent-copper), var(--accent-gold))'
                    : 'var(--bg-tertiary)',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px',
                }} />
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Servicios más vendidos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {SERVICES.map((svc, i) => (
              <div key={svc.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{svc.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{svc.count} servicios</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent-copper)', fontSize: '0.85rem' }}>{formatCOP(svc.revenue)}</span>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${svc.pct}%`,
                    height: '100%',
                    background: i === 0
                      ? 'linear-gradient(90deg, var(--accent-gold), #f0d87a)'
                      : i === 1
                        ? 'linear-gradient(90deg, #3c5040, var(--accent-copper))'
                        : 'linear-gradient(90deg, var(--accent-copper), var(--accent-gold))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak hours */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Horas pico
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '90px' }}>
            {PEAK_HOURS.map(h => (
              <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${h.pct}%`,
                  background: h.pct >= 70
                    ? 'linear-gradient(0deg, var(--accent-copper), var(--accent-gold))'
                    : h.pct >= 50
                      ? 'linear-gradient(0deg, #1e3020, #3c5040)'
                      : 'var(--bg-tertiary)',
                  borderRadius: '3px 3px 0 0',
                  minHeight: '3px',
                }} />
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h.hour}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>Dorado = mayor demanda</p>
        </div>

        {/* Barber performance */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Rendimiento por barbero
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {BARBERS_STATS.map((b, i) => (
              <div key={b.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: 700 }}>{b.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.services} servicios · ⭐ {b.rating}</p>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '1.05rem' }}>{formatCOP(b.revenue)}</span>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round((b.revenue / 1300000) * 100)}%`,
                    height: '100%',
                    background: i === 0
                      ? 'linear-gradient(90deg, #1a2a10, var(--accent-copper))'
                      : 'linear-gradient(90deg, #1a2a10, var(--accent-gold))',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
