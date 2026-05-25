import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight, RefreshCw, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuditRecord {
  id: number;
  usuario_id: number | null;
  usuario_nombre: string | null;
  usuario_email: string | null;
  usuario_rol: string | null;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  entidad: string;
  entidad_id: number | null;
  valor_previo: Record<string, unknown> | null;
  valor_nuevo: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

const authHeader = (): Record<string, string> => {
  const t = localStorage.getItem('billee_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const accionBadge: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-800 border-green-200',
  UPDATE: 'bg-blue-100  text-blue-800  border-blue-200',
  DELETE: 'bg-red-100   text-red-800   border-red-200',
};

const accionLabel: Record<string, string> = {
  INSERT: 'Inserción',
  UPDATE: 'Modificación',
  DELETE: 'Eliminación',
};

function DiffCell({ prev, next }: { prev: Record<string, unknown> | null; next: Record<string, unknown> | null }) {
  if (!prev && !next) return <span className="text-gray-300 text-xs">—</span>;

  // For INSERT: show new values; for DELETE: show old values; for UPDATE: show changed fields
  if (prev && next) {
    const changed = Object.keys({ ...prev, ...next }).filter(k => prev[k] !== next[k]);
    if (changed.length === 0) return <span className="text-gray-400 text-xs">Sin cambios</span>;
    return (
      <div className="space-y-1 max-w-xs">
        {changed.slice(0, 5).map(k => (
          <div key={k} className="text-[10px] leading-tight">
            <span className="font-semibold text-gray-600">{k}:</span>{' '}
            <span className="text-red-500 line-through mr-1">{String(prev[k] ?? '—')}</span>
            <span className="text-green-600">{String(next[k] ?? '—')}</span>
          </div>
        ))}
        {changed.length > 5 && (
          <span className="text-[10px] text-gray-400">+{changed.length - 5} más…</span>
        )}
      </div>
    );
  }

  const data = next ?? prev;
  const entries = Object.entries(data!).filter(([, v]) => v !== null && v !== '').slice(0, 4);
  return (
    <div className="space-y-0.5 max-w-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="text-[10px] leading-tight">
          <span className="font-semibold text-gray-600">{k}:</span>{' '}
          <span className="text-gray-700">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Auditoria() {
  const [records, setRecords]   = useState<AuditRecord[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [filterAccion, setFilterAccion] = useState('');
  const PAGE_SIZE = 20;

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search)       params.set('search', search);
      if (filterAccion) params.set('accion', filterAccion);

      const res = await fetch(`/api/audit?${params}`, { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setRecords(json.data);
      setTotal(json.total);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAccion]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-[#e8394a]" />
            <h1 className="text-xl font-bold text-[#2e2e30]">Auditoría</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Registro de inserciones y modificaciones por usuario</p>
        </div>
        <button
          onClick={() => { setPage(1); fetchAudit(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por usuario o factura ID…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterAccion}
            onChange={e => { setFilterAccion(e.target.value); setPage(1); }}
            aria-label="Filtrar por acción"
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-200 bg-white"
          >
            <option value="">Todas las acciones</option>
            <option value="INSERT">Inserción</option>
            <option value="UPDATE">Modificación</option>
            <option value="DELETE">Eliminación</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8f4f4]">
                {['Fecha / Hora', 'Usuario', 'Rol', 'Acción', 'Factura ID', 'Cambios', 'IP'].map(h => (
                  <th key={h} className="border border-[#e8e0e0] px-3 py-2 font-semibold text-[#555558] text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <RefreshCw size={18} className="inline animate-spin mr-2" /> Cargando…
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No hay registros de auditoría
                  </td>
                </tr>
              ) : records.map((r, i) => (
                <tr key={r.id} className={cn('hover:bg-red-50/30 transition-colors', i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]')}>
                  <td className="border border-[#e8e0e0] px-3 py-2 whitespace-nowrap text-[#555558]">
                    {fmtDate(r.created_at)}
                  </td>
                  <td className="border border-[#e8e0e0] px-3 py-2 whitespace-nowrap">
                    <div className="font-semibold text-gray-700">{r.usuario_nombre ?? <span className="text-gray-400 italic">Anónimo</span>}</div>
                    {r.usuario_email && <div className="text-gray-400 text-[10px]">{r.usuario_email}</div>}
                  </td>
                  <td className="border border-[#e8e0e0] px-3 py-2">
                    {r.usuario_rol
                      ? <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{r.usuario_rol}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="border border-[#e8e0e0] px-3 py-2">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', accionBadge[r.accion])}>
                      {accionLabel[r.accion] ?? r.accion}
                    </span>
                  </td>
                  <td className="border border-[#e8e0e0] px-3 py-2 text-center">
                    {r.entidad_id ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="border border-[#e8e0e0] px-3 py-2">
                    <DiffCell prev={r.valor_previo} next={r.valor_nuevo} />
                  </td>
                  <td className="border border-[#e8e0e0] px-3 py-2 text-[#87878b] whitespace-nowrap">
                    {r.ip ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">
            {total} registro{total !== 1 ? 's' : ''} — Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              title="Página anterior"
              aria-label="Página anterior"
              className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              title="Página siguiente"
              aria-label="Página siguiente"
              className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
