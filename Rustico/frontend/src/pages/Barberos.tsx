import { useEffect, useState } from 'react';
import { Scissors, Clock, TrendingUp, Star } from 'lucide-react';
import { api } from '../api/client';

interface Barbero {
  id: string; nombre: string; email: string; telefono: string;
  especialidad: string; porcentaje_comision: number; color_agenda: string;
  horario_inicio: string; horario_fin: string; activo: boolean;
}
interface Stats {
  total_citas: string; completadas: string;
  ingresos_cop: string; ticket_promedio: string;
}

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
}

export default function Barberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [stats, setStats]       = useState<Record<string, Stats>>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get<Barbero[]>('/barberos').then(async (bs) => {
      setBarberos(bs);
      const entries = await Promise.all(bs.map(async b => {
        const s = await api.get<Stats>(`/barberos/${b.id}/estadisticas`);
        return [b.id, s] as [string, Stats];
      }));
      setStats(Object.fromEntries(entries));
      setCargando(false);
    });
  }, []);

  if (cargando) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--texto-suave)' }}>Cargando…</div>
  );

  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--blanco)', marginBottom: 8 }}>Equipo</h1>
      <p style={{ color: 'var(--texto-suave)', marginBottom: 28 }}>{barberos.length} barberos activos</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {barberos.map(b => {
          const s = stats[b.id];
          return (
            <div key={b.id} style={{ background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 12, overflow: 'hidden' }}>
              {/* Color header */}
              <div style={{ height: 6, background: b.color_agenda }} />
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `${b.color_agenda}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Scissors size={20} color={b.color_agenda} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blanco)' }}>{b.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 2 }}>{b.especialidad}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Clock size={11} color="var(--texto-suave)" />
                      <span style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
                        {b.horario_inicio?.slice(0, 5)} – {b.horario_fin?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { icon: Star, label: 'Citas (mes)', val: s?.total_citas || '—' },
                    { icon: TrendingUp, label: 'Completadas', val: s?.completadas || '—' },
                    { icon: TrendingUp, label: 'Ingresos mes', val: s ? formatCOP(parseInt(s.ingresos_cop)) : '—' },
                    { icon: TrendingUp, label: 'Ticket prom.', val: s ? formatCOP(parseInt(s.ticket_promedio)) : '—' },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} style={{ background: 'var(--superficie2)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blanco)' }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--texto-suave)' }}>
                  Comisión: <strong style={{ color: 'var(--cobre)' }}>{b.porcentaje_comision}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
