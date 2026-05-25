import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { BarChart2, AlertCircle, Clock, ChevronRight, ArrowLeft, User } from 'lucide-react';

// ── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs max-w-xs">
      <p className="font-bold text-gray-800 mb-1 truncate">{d.nombre_proveedor}</p>
      <p className="text-gray-400 mb-2">NIT: {d.nit_proveedor}</p>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#e8394a] flex-shrink-0" />
        <span className="text-gray-600">Facturas rechazadas:</span>
        <span className="font-bold text-gray-900">{d.rechazadas}</span>
      </div>
    </div>
  );
}

// ── Nombre corto para eje X ──────────────────────────────────────────────────
function shortName(name: string, max = 14): string {
  if (!name) return '—';
  const words = name.trim().split(/\s+/);
  const first = words[0];
  return first.length > max ? first.slice(0, max - 1) + '…' : first;
}

// ── Paleta de rojos degradada ────────────────────────────────────────────────
const RED_PALETTE = [
  '#b91c1c', '#c9253a', '#dc2626', '#e8394a', '#ef4444',
  '#f06b6b', '#f87171', '#fca5a5', '#fecaca', '#fee2e2',
];

// ── Gráfica: Proveedores con más facturas rechazadas ─────────────────────────
function RechazadasPorProveedor() {
  const [data,       setData]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [limit,      setLimit]      = useState(10);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/reportes/rechazadas-por-proveedor?limit=${limit}`)
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [limit]);

  // Scroll a la fila resaltada cuando cambia el hover
  useEffect(() => {
    if (hoveredIdx !== null && rowRefs.current[hoveredIdx]) {
      rowRefs.current[hoveredIdx]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredIdx]);

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50">
            <AlertCircle size={20} className="text-[#e8394a]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Proveedores con más facturas rechazadas</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ranking por volumen de rechazos acumulados</p>
          </div>
        </div>
        {/* Selector top N */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 font-medium">Top</span>
          {[5, 10, 15].map(n => (
            <button
              key={n}
              onClick={() => setLimit(n)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                limit === n
                  ? 'text-white border-transparent'
                  : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-[#e8394a] bg-white'
              }`}
              style={limit === n ? { background: '#e8394a', borderColor: '#e8394a' } : {}}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Cuerpo */}
      {error ? (
        <div className="flex-1 flex items-center justify-center py-16 text-sm text-red-500">
          ⚠️ {error}
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <AlertCircle size={36} className="opacity-30" />
          <p className="text-sm font-medium">No hay facturas rechazadas registradas</p>
        </div>
      ) : (
        <>
          {/* Indicador de pista */}
          {!loading && (
            <p className="text-[11px] text-gray-400 italic -mb-2">
              💡 Pasa el cursor sobre una barra para resaltar su fila en la tabla
            </p>
          )}

          {/* Gráfica */}
          <div className="h-80 w-full min-h-80">
            {loading ? (
              <div className="h-full bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                  barCategoryGap="28%"
                  onMouseMove={(state: any) => {
                    if (state.isTooltipActive && state.activeTooltipIndex != null) {
                      setHoveredIdx(state.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="nombre_proveedor"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    tickFormatter={v => shortName(v)}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232,57,74,0.06)' }} />
                  <Bar dataKey="rechazadas" radius={[6, 6, 0, 0]} maxBarSize={52}>
                    {data.map((_, i) => {
                      const base = RED_PALETTE[i] ?? RED_PALETTE[RED_PALETTE.length - 1];
                      return (
                        <Cell
                          key={i}
                          fill={hoveredIdx === i ? '#991b1b' : base}
                          stroke={hoveredIdx === i ? '#7f1d1d' : 'transparent'}
                          strokeWidth={hoveredIdx === i ? 2 : 0}
                          style={{ filter: hoveredIdx === i ? 'drop-shadow(0 0 6px rgba(153,27,27,0.5))' : 'none', transition: 'all 0.15s' }}
                        />
                      );
                    })}
                    <LabelList
                      dataKey="rechazadas"
                      position="top"
                      style={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabla resumen */}
          {!loading && (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="min-w-full text-xs">
                <thead>
                  <tr style={{ background: '#fdf2f3' }}>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Proveedor</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">NIT</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">Rechazadas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                      <tr
                        key={i}
                        ref={el => { rowRefs.current[i] = el; }}
                        style={{
                          background: isHovered ? '#fde8ea' : (i % 2 === 0 ? '#ffffff' : '#fdf6f6'),
                          borderLeft: isHovered ? '3px solid #e8394a' : '3px solid transparent',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        className="hover:bg-red-50"
                      >
                        <td className="px-4 py-2.5 text-gray-400 font-mono">
                          {isHovered ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-[#e8394a] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                              {i + 1}
                            </span>
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </td>
                        <td className={`px-4 py-2.5 font-semibold max-w-xs truncate ${isHovered ? 'text-[#e8394a]' : 'text-gray-800'}`}>
                          {row.nombre_proveedor}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono">{row.nit_proveedor}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isHovered
                              ? 'bg-[#e8394a] text-white border-[#c9253a] scale-110'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                            style={{ transition: 'all 0.15s' }}
                          >
                            {row.rechazadas}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Paleta para demoras (verde → amarillo → rojo según días) ─────────────────
function colorDemora(dias: number): string {
  if (dias <= 7)  return '#10b981';
  if (dias <= 15) return '#f59e0b';
  if (dias <= 30) return '#f97316';
  return '#e8394a';
}

function colorDemoraHover(dias: number): string {
  if (dias <= 7)  return '#059669';
  if (dias <= 15) return '#d97706';
  if (dias <= 30) return '#ea580c';
  return '#c9253a';
}

// ── Tooltip demoras ──────────────────────────────────────────────────────────
function TooltipDemoras({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs max-w-xs">
      <p className="font-bold text-gray-800 mb-2">{d.area}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Demora promedio</span>
          <span className="font-bold" style={{ color: colorDemora(d.avg_dias) }}>{d.avg_dias} días</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Máxima demora</span>
          <span className="font-semibold text-gray-800">{d.max_dias} días</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Facturas activas</span>
          <span className="font-semibold text-gray-800">{d.pendientes + d.en_revision}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Total facturas</span>
          <span className="font-semibold text-gray-800">{d.total}</span>
        </div>
      </div>
    </div>
  );
}

// ── Gráfica: Demoras por área ────────────────────────────────────────────────
function DemorasPorArea() {
  const [data,       setData]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [metric,     setMetric]     = useState<'avg_dias' | 'max_dias' | 'avg_dias_activas'>('avg_dias');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/reportes/demoras-por-area')
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Scroll a la fila resaltada cuando cambia el hover
  useEffect(() => {
    if (hoveredIdx !== null && rowRefs.current[hoveredIdx]) {
      rowRefs.current[hoveredIdx]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredIdx]);

  const metricLabels = {
    avg_dias:         'Promedio general',
    avg_dias_activas: 'Promedio activas',
    max_dias:         'Máximo registrado',
  };

  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50">
            <Clock size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Demoras por Área</h3>
            <p className="text-xs text-gray-400 mt-0.5">Días promedio desde radicación hasta hoy, por área</p>
          </div>
        </div>
        {/* Selector métrica */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
          {(Object.keys(metricLabels) as (keyof typeof metricLabels)[]).map(k => (
            <button key={k} onClick={() => setMetric(k)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                metric === k
                  ? 'text-white border-transparent bg-orange-500'
                  : 'border-gray-200 text-gray-500 bg-white hover:border-orange-300 hover:text-orange-500'
              }`}>
              {metricLabels[k]}
            </button>
          ))}
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {[
          { color: '#10b981', label: '≤ 7 días' },
          { color: '#f59e0b', label: '8 – 15 días' },
          { color: '#f97316', label: '16 – 30 días' },
          { color: '#e8394a', label: '> 30 días' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
            <span className="text-gray-500">{label}</span>
          </span>
        ))}
      </div>

      {/* Gráfica */}
      {error ? (
        <div className="py-16 text-center text-sm text-red-500">⚠️ {error}</div>
      ) : loading ? (
        <div className="h-72 bg-gray-50 rounded-xl animate-pulse" />
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">Sin datos de área registrados</div>
      ) : (
        <>
          {/* Indicador de pista */}
          <p className="text-[11px] text-gray-400 italic -mb-2">
            💡 Pasa el cursor sobre una barra para resaltar su fila en la tabla
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sorted}
                margin={{ top: 22, right: 20, left: -10, bottom: 0 }}
                barCategoryGap="28%"
                onMouseMove={(state: any) => {
                  if (state.isTooltipActive && state.activeTooltipIndex != null) {
                    setHoveredIdx(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="area" axisLine={false} tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }}
                  allowDecimals={false} unit=" d" />
                <Tooltip content={<TooltipDemoras />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
                <Bar dataKey={metric} radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {sorted.map((row, i) => {
                    const base  = colorDemora(row[metric]);
                    const hover = colorDemoraHover(row[metric]);
                    return (
                      <Cell
                        key={i}
                        fill={hoveredIdx === i ? hover : base}
                        stroke={hoveredIdx === i ? hover : 'transparent'}
                        strokeWidth={hoveredIdx === i ? 2 : 0}
                        style={{ filter: hoveredIdx === i ? `drop-shadow(0 0 6px ${base}88)` : 'none', transition: 'all 0.15s' }}
                      />
                    );
                  })}
                  <LabelList dataKey={metric} position="top"
                    formatter={(v) => `${Number(v)}d`}
                    style={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla resumen */}
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-orange-50">
                  {['#', 'Área', 'Prom. general', 'Prom. activas', 'Máx. días', 'Pendientes', 'En revisión', 'Procesadas', 'Total'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide text-[10px] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const isHovered  = hoveredIdx === i;
                  const accentColor = colorDemora(row[metric]);
                  return (
                    <tr
                      key={i}
                      ref={el => { rowRefs.current[i] = el; }}
                      style={{
                        background:  isHovered ? `${accentColor}18` : (i % 2 === 0 ? '#ffffff' : '#fff7f0'),
                        borderLeft:  isHovered ? `3px solid ${accentColor}` : '3px solid transparent',
                        transition:  'background 0.15s, border-color 0.15s',
                      }}
                    >
                      <td className="px-3 py-2.5 text-gray-400 font-mono">
                        {isHovered ? (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-bold leading-none"
                            style={{ background: accentColor }}
                          >
                            {i + 1}
                          </span>
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: isHovered ? accentColor : '#1f2937' }}>
                        {row.area}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-sm" style={{ color: colorDemora(row.avg_dias) }}>
                          {row.avg_dias} d
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 font-medium">{row.avg_dias_activas} d</td>
                      <td className="px-3 py-2.5 text-gray-600 font-medium">{row.max_dias} d</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isHovered ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700'}`}>
                          {row.pendientes}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isHovered ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700'}`}>
                          {row.en_revision}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isHovered ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700'}`}>
                          {row.procesadas}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold" style={{ color: isHovered ? accentColor : '#4b5563' }}>
                        {row.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Catálogo de reportes disponibles ────────────────────────────────────────
function TooltipEntregado({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs max-w-xs">
      <p className="font-bold text-gray-800 mb-2">{d.entregado}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Promedio en alerta</span>
          <span className="font-bold" style={{ color: colorDemora(d.avg_dias_alerta) }}>{d.avg_dias_alerta} dias</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Alertas</span>
          <span className="font-semibold text-red-700">{d.alertas}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Demoradas</span>
          <span className="font-semibold text-orange-700">{d.demoradas}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Total asignadas</span>
          <span className="font-semibold text-gray-800">{d.total}</span>
        </div>
      </div>
    </div>
  );
}

function DemorasPorEntregado() {
  const [data,       setData]       = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [metric,     setMetric]     = useState<'avg_dias_alerta' | 'max_dias' | 'riesgo_total'>('avg_dias_alerta');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/reportes/demoras-por-entregado')
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (hoveredIdx !== null && rowRefs.current[hoveredIdx]) {
      rowRefs.current[hoveredIdx]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredIdx]);

  const metricLabels = {
    avg_dias_alerta: 'Mayor demora',
    max_dias:        'Maximo dias',
    riesgo_total:    'Alertas + demoradas',
  };

  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);
  const lider = sorted[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50">
            <User size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Demora por Usuario Entregado</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ranking de usuarios asignados con facturas en Demorado o Alerta</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
          {(Object.keys(metricLabels) as (keyof typeof metricLabels)[]).map(k => (
            <button key={k} onClick={() => setMetric(k)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                metric === k
                  ? 'text-white border-transparent bg-rose-600'
                  : 'border-gray-200 text-gray-500 bg-white hover:border-rose-300 hover:text-rose-600'
              }`}>
              {metricLabels[k]}
            </button>
          ))}
        </div>
      </div>

      {lider && !loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 sm:col-span-2">
            <p className="text-[10px] uppercase tracking-wide font-bold text-rose-500">Mayor demora actual</p>
            <p className="text-lg font-bold text-gray-900 truncate mt-1">{lider.entregado}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Promedio alerta</p>
            <p className="text-lg font-bold text-gray-900">{lider.avg_dias_alerta} d</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Alertas</p>
            <p className="text-lg font-bold text-red-600">{lider.alertas}</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="py-16 text-center text-sm text-red-500">Error: {error}</div>
      ) : loading ? (
        <div className="h-72 bg-gray-50 rounded-xl animate-pulse" />
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No hay usuarios con facturas demoradas o en alerta</div>
      ) : (
        <>
          <p className="text-[11px] text-gray-400 italic -mb-2">
            Pasa el cursor sobre una barra para resaltar su fila en la tabla
          </p>

          <div className="h-72 min-h-72">
            <ResponsiveContainer width="100%" height={288}>
              <BarChart
                data={sorted}
                margin={{ top: 22, right: 20, left: -10, bottom: 0 }}
                barCategoryGap="28%"
                onMouseMove={(state: any) => {
                  if (state.isTooltipActive && state.activeTooltipIndex != null) {
                    setHoveredIdx(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="entregado" axisLine={false} tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => shortName(v, 12)} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }}
                  allowDecimals={false} unit={metric === 'riesgo_total' ? '' : ' d'} />
                <Tooltip content={<TooltipEntregado />} cursor={{ fill: 'rgba(225,29,72,0.06)' }} />
                <Bar dataKey={metric} radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {sorted.map((row, i) => {
                    const value = metric === 'riesgo_total' ? row.avg_dias_alerta : row[metric];
                    const base  = colorDemora(value);
                    const hover = colorDemoraHover(value);
                    return (
                      <Cell
                        key={i}
                        fill={hoveredIdx === i ? hover : base}
                        stroke={hoveredIdx === i ? hover : 'transparent'}
                        strokeWidth={hoveredIdx === i ? 2 : 0}
                        style={{ filter: hoveredIdx === i ? `drop-shadow(0 0 6px ${base}88)` : 'none', transition: 'all 0.15s' }}
                      />
                    );
                  })}
                  <LabelList dataKey={metric} position="top"
                    formatter={(v) => metric === 'riesgo_total' ? Number(v) : `${Number(v)}d`}
                    style={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-rose-50">
                  {['#', 'Usuario entregado', 'Prom. alerta', 'Max. dias', 'Alertas', 'Demoradas', 'A tiempo', 'Activas', 'Total'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500 uppercase tracking-wide text-[10px] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const isHovered  = hoveredIdx === i;
                  const accentColor = colorDemora(row.avg_dias_alerta);
                  return (
                    <tr
                      key={row.entregado}
                      ref={el => { rowRefs.current[i] = el; }}
                      style={{
                        background: isHovered ? `${accentColor}18` : (i % 2 === 0 ? '#ffffff' : '#fff7f9'),
                        borderLeft: isHovered ? `3px solid ${accentColor}` : '3px solid transparent',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                    >
                      <td className="px-3 py-2.5 text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-3 py-2.5 font-semibold max-w-xs truncate" style={{ color: isHovered ? accentColor : '#1f2937' }}>
                        {row.entregado}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-sm" style={{ color: accentColor }}>{row.avg_dias_alerta} d</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 font-medium">{row.max_dias} d</td>
                      <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">{row.alertas}</span></td>
                      <td className="px-3 py-2.5"><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-700">{row.demoradas}</span></td>
                      <td className="px-3 py-2.5 text-gray-600 font-medium">{row.a_tiempo}</td>
                      <td className="px-3 py-2.5 text-gray-600 font-medium">{row.activas}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-700">{row.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const REPORTES = [
  {
    key: 'rechazadas',
    titulo: 'Proveedores con más facturas rechazadas',
    descripcion: 'Ranking de proveedores ordenado por volumen de rechazos acumulados. Incluye gráfica de barras y tabla detallada.',
    icono: <AlertCircle size={28} className="text-[#e8394a]" />,
    fondo: 'bg-red-50',
    borde: 'border-red-100',
    badge: 'text-[#e8394a] bg-red-50 border-red-200',
    badgeLabel: 'Calidad · Proveedores',
  },
  {
    key: 'demoras',
    titulo: 'Demoras por Área',
    descripcion: 'Días promedio desde la radicación hasta hoy, agrupados por área. Permite comparar promedio general, activas y máximo registrado.',
    icono: <Clock size={28} className="text-orange-500" />,
    fondo: 'bg-orange-50',
    borde: 'border-orange-100',
    badge: 'text-orange-600 bg-orange-50 border-orange-200',
    badgeLabel: 'Tiempos · Áreas',
  },
  {
    key: 'entregado',
    titulo: 'Demora por Usuario Entregado',
    descripcion: 'Identifica que usuario de la columna Entregado concentra mayores demoras frente a la alerta de radicado.',
    icono: <User size={28} className="text-rose-600" />,
    fondo: 'bg-rose-50',
    borde: 'border-rose-100',
    badge: 'text-rose-600 bg-rose-50 border-rose-200',
    badgeLabel: 'Tiempos - Usuarios',
  },
] as const;

type ReporteKey = typeof REPORTES[number]['key'];

// ── Página principal ─────────────────────────────────────────────────────────
export default function Reportes() {
  const [selected, setSelected] = useState<ReporteKey | null>(null);

  const reporte = REPORTES.find(r => r.key === selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {selected && (
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={15} /> Volver
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading flex items-center gap-2.5">
            <BarChart2 size={24} className="text-[#e8394a]" />
            {selected ? reporte?.titulo : 'Reportes'}
          </h1>
          {!selected && (
            <p className="text-gray-500 text-sm mt-0.5">
              Selecciona un reporte para visualizarlo
            </p>
          )}
        </div>
      </div>

      {/* Catálogo */}
      {!selected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REPORTES.map(r => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              className={`text-left w-full bg-white rounded-2xl border ${r.borde} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 p-6 flex flex-col gap-4 group`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`p-3 rounded-xl ${r.fondo} flex-shrink-0`}>
                  {r.icono}
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 mt-1 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <p className="font-bold text-gray-900 text-base leading-snug">{r.titulo}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{r.descripcion}</p>
              </div>
              <span className={`self-start text-[11px] font-semibold px-2.5 py-1 rounded-full border ${r.badge}`}>
                {r.badgeLabel}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Reporte seleccionado */}
      {selected === 'rechazadas' && <RechazadasPorProveedor />}
      {selected === 'demoras'    && <DemorasPorArea />}
      {selected === 'entregado'  && <DemorasPorEntregado />}
    </div>
  );
}
