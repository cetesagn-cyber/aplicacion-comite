import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { AlertCircle, Clock, CheckCircle2, CalendarDays, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { useDateRange } from '../lib/dateRangeContext';
import { cn } from '../lib/utils';

// ── Selector de rango reutilizable ───────────────────────────────────────────
const todayStr = new Date().toISOString().slice(0, 10);

function DateRangePicker() {
  const { desde, hasta, setDesde, setHasta } = useDateRange();
  const [open, setOpen] = useState(false);

  const fmt = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const firstDay    = new Date(); firstDay.setDate(1);
  const firstDayStr = firstDay.toISOString().slice(0, 10);
  const prevFirst   = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10);
  const prevLast    = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().slice(0, 10);
  const monday      = new Date(); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const mondayStr   = monday.toISOString().slice(0, 10);

  const quick = [
    { label: 'Hoy',          d: todayStr,    h: todayStr   },
    { label: 'Esta semana',  d: mondayStr,   h: todayStr   },
    { label: 'Este mes',     d: firstDayStr, h: todayStr   },
    { label: 'Mes anterior', d: prevFirst,   h: prevLast   },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all',
          open ? 'border-red-300 bg-red-50 text-[#e8394a]'
               : 'border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50/50 hover:text-[#e8394a]'
        )}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <CalendarDays size={14} className="flex-shrink-0" />
        <span>{fmt(desde)}</span>
        <span className="text-gray-300 font-normal">→</span>
        <span>{fmt(hasta)}</span>
        <ChevronDown size={13} className={cn('text-gray-400 transition-transform ml-0.5', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-72">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Rango de fechas</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Fecha inicio</label>
                <input type="date" value={desde} max={hasta} onChange={e => setDesde(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-gray-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Fecha fin</label>
                <input type="date" value={hasta} min={desde} max={todayStr} onChange={e => setHasta(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none bg-gray-50 focus:bg-white transition-all" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Acceso rápido</p>
              <div className="grid grid-cols-2 gap-1.5">
                {quick.map(({ label, d, h }) => (
                  <button key={label} onClick={() => { setDesde(d); setHasta(h); setOpen(false); }}
                    className={cn('px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-left',
                      desde === d && hasta === h
                        ? 'border-red-300 bg-red-50 text-[#e8394a]'
                        : 'border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50/50 hover:text-[#e8394a]')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#e8394a,#b21f2d)' }}>
              Aplicar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tooltip personalizado ────────────────────────────────────────────────────
const mesActual   = new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' });
const mesAnterior = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  .toLocaleString('es-CO', { month: 'long', year: 'numeric' });

const DEMO_ACTUAL = [4,7,5,9,6,11,8,13,7,15,10,14,9,17,12,16,11,19,13,18,10,21,15,20,13,23,17,22,14,25,18];
const DEMO_ANTERIOR = [3,5,4,7,5, 9,6,10,5,12, 8,11, 7,14, 9,13, 8,15,10,14, 8,17,12,16,10,19,14,18,11,20,15];
const AREA_COLORS = [
  '#e8394a','#3b82f6','#10b981','#f59e0b',
  '#8b5cf6','#06b6d4','#f97316','#6366f1',
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-bold text-gray-700 mb-2 capitalize">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
            <span className="text-gray-600 capitalize">{p.dataKey === 'actual' ? mesActual : mesAnterior}:</span>
            <span className="font-semibold text-gray-900">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
  loading?: boolean;
}

function KPICard({ title, value, icon, trend, color, loading }: KPICardProps) {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      </div>
      {loading ? (
        <div className="h-9 bg-gray-100 rounded-lg animate-pulse w-24" />
      ) : (
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      )}
      <div className="flex items-center gap-1.5 text-xs">
        {isPositive
          ? <TrendingUp  size={14} className="text-green-600" />
          : <TrendingDown size={14} className="text-red-500" />}
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
        <span className="text-gray-400">vs mes anterior</span>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Dashboard() {
  const [metrics,   setMetrics]   = useState<any>(null);
  const [tendencia, setTendencia] = useState<{ actual: any[]; anterior: any[] }>({ actual: [], anterior: [] });
  const [porArea,   setPorArea]   = useState<{ area: string; total: number }[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [mRes, tRes, aRes] = await Promise.all([
          fetch('/api/dashboard/metrics'),
          fetch('/api/dashboard/tendencia'),
          fetch('/api/dashboard/por-area'),
        ]);
        if (!mRes.ok || !tRes.ok) throw new Error('Error al cargar métricas');
        setMetrics(await mRes.json());
        setTendencia(await tRes.json());
        if (aRes.ok) setPorArea(await aRes.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Construir datos del gráfico de área ─────────────────────────────────
  const chartData = useMemo(() => {
    const now         = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yearMonth     = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const prevYear      = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevMonth     = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYearMonth = `${prevYear}-${pad(prevMonth)}`;

    const actualMap   = new Map(tendencia.actual.map(r   => [r.dia, r.total]));
    const anteriorMap = new Map(tendencia.anterior.map(r => [r.dia, r.total]));

    const realTotal = tendencia.actual.reduce((s, r) => s + r.total, 0);
    const useDemo   = realTotal < 10; // si hay menos de 10 radicaciones reales este mes, usar demo

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day        = i + 1;
      const dayKey     = `${yearMonth}-${pad(day)}`;
      const prevDayKey = `${prevYearMonth}-${pad(day)}`;
      return {
        dia:      `${day} ${now.toLocaleString('es-CO', { month: 'short' })}`,
        actual:   useDemo ? (DEMO_ACTUAL[i]   || 0) : (actualMap.get(dayKey)       || 0),
        anterior: useDemo ? (DEMO_ANTERIOR[i] || 0) : (anteriorMap.get(prevDayKey) || 0),
      };
    });
  }, [tendencia]);

  // ── Top por área para el pie ─────────────────────────────────────────────
  const areaData = useMemo(() => {
    if (!porArea.length) return [];
    const totalArea = porArea.reduce((s, r) => s + r.total, 0) || 1;
    return porArea.map((r, i) => ({
      name:  r.area,
      value: r.total,
      pct:   Math.round((r.total / totalArea) * 100),
      color: AREA_COLORS[i % AREA_COLORS.length],
    }));
  }, [porArea]);

  // ── Tendencia mensual ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Dashboard General</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500 text-sm">Métricas de facturación</p>
            <span className="text-gray-300 text-sm">·</span>
            {loading
              ? <span className="h-4 w-20 bg-gray-100 rounded animate-pulse inline-block" />
              : <span className="text-sm font-semibold text-gray-700">
                  {metrics
              ? (Number(metrics.procesadas) + Number(metrics.pendientes) + Number(metrics.rechazadas)).toLocaleString('es-CO')
              : '—'}
                  <span className="font-normal text-gray-400"> facturas totales</span>
                </span>
            }
          </div>
        </div>
        <DateRangePicker />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error} — ¿El backend está corriendo en <code>localhost:3001</code>?
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KPICard
          title="Procesadas"
          value={metrics ? Number(metrics.procesadas).toLocaleString('es-CO') : '—'}
          icon={<CheckCircle2 size={22} className="text-green-600" />}
          trend={0}
          color="bg-green-50"
          loading={loading}
        />
        <KPICard
          title="Pendientes"
          value={metrics ? Number(metrics.pendientes).toLocaleString('es-CO') : '—'}
          icon={<Clock size={22} className="text-yellow-600" />}
          trend={0}
          color="bg-yellow-50"
          loading={loading}
        />
        <KPICard
          title="Rechazadas"
          value={metrics ? Number(metrics.rechazadas).toLocaleString('es-CO') : '—'}
          icon={<AlertCircle size={22} className="text-orange-600" />}
          trend={0}
          color="bg-orange-50"
          loading={loading}
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Tendencia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900">Tendencia de Radicación</h3>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                {mesActual} vs {mesAnterior} — radicaciones por día
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#e8394a] inline-block rounded" />
                <span className="capitalize">{mesActual}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-gray-300 inline-block rounded border-dashed" />
                <span className="capitalize">{mesAnterior}</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            {loading ? (
              <div className="h-full bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e8394a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#e8394a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#9ca3af" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }} dy={8} interval={4} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="anterior" stroke="#d1d5db" strokeWidth={1.5}
                    strokeDasharray="5 4" fillOpacity={1} fill="url(#gradAnterior)" dot={false} />
                  <Area type="monotone" dataKey="actual" stroke="#e8394a" strokeWidth={2.5}
                    fillOpacity={1} fill="url(#gradActual)" dot={false}
                    activeDot={{ r: 5, fill: '#e8394a', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribución por Área */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-1">Distribución por Área</h3>
          <p className="text-xs text-gray-400 mb-4">Radicaciones por área registrada</p>
          {loading ? (
            <div className="flex-1 bg-gray-50 rounded-xl animate-pulse" />
          ) : areaData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos de área registrados</p>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center min-h-[280px]">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={areaData} cx="50%" cy="50%" innerRadius={55} outerRadius={78}
                      paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                      {areaData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, _: any, props: any) => [`${v} (${props.payload.pct}%)`, props.payload.name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5 mt-2">
                {areaData.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-gray-600 font-medium truncate" title={s.name}>{s.name}</span>
                    </div>
                    <span className="font-bold text-gray-800 flex-shrink-0 ml-2">
                      {s.value.toLocaleString('es-CO')} <span className="text-gray-400 font-normal">({s.pct}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
