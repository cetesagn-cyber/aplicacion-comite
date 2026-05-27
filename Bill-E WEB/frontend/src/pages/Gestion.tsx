import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  cloneElement,
  type CSSProperties,
  type ReactElement,
} from 'react';
import {
  Search, Download, Edit3, Trash2, Eye, Filter,
  X, Save, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, RefreshCw,
  Camera, ZoomIn, Loader2, Sliders, Pin, BookmarkCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

function countBusinessDaysSince(fechaRadicado: string): number | null {
  if (!fechaRadicado) return null;
  const startDate = new Date(fechaRadicado);
  if (Number.isNaN(startDate.getTime())) return null;
  const endDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  if (endDate <= startDate) return 0;

  let count = 0;
  const current = new Date(startDate);
  current.setDate(current.getDate() + 1);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count += 1;
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function computeAlerta(fechaRadicado: string): string {
  const days = countBusinessDaysSince(fechaRadicado);
  if (days === null) return '';
  if (days <= 3) return 'A tiempo';
  if (days <= 6) return 'Demorado';
  return 'Vencido';
}

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Factura {
  id: number;
  consecutivo: number;
  id_unico: string;
  numero_factura: string;
  nit_proveedor: string;
  nombre_proveedor: string;
  fecha_emision: string;
  alerta_radicado: string | null;
  fecha_vencimiento: string;
  valor_base: string;
  iva: string;
  valor_total: string;
  // Columnas operativas
  ampliacion_observacion: string;
  motivo_demora: string;
  fecha_contabilizado: string;
  doc_contable: string;
  dias: string;
  fecha_entrega_tesoreria: string;
  fecha_de_dev_a_recepcion: string;
  motivo_devolucion: string;
  fecha_envio_rechazo_recepcion_al_cliente: string;
  dias_rechazo_recepcion_vs_asignacion: string;
  acuse_recibido_dian: string;
  recibo_de_mercancia: string;
  aceptacion_o_rechazo: string;
  cufe: string;
  forma_de_pago: string;
  tipo_de_factura: string;
  tiempo_promedio: string;
  tiempo_real: string;
  evidencia_aceptacion_url: string;
  tipo_moneda: string;
  // Resto
  descripcion_items: string;
  tipo_archivo: string;
  estado: string;
  observaciones: string;
  orden_compra: string;
  entrada_servicio: string;
  entregado: string;
  radicado_x: string;
  contabilizado_por: string;
  area: string;
  fecha_registro: string;
  created_at: string;
}

const MONEDA_OPTIONS = [
  { code: 'COP', label: 'COP', description: 'Peso colombiano' },
  { code: 'USD', label: 'USD', description: 'Dólar estadounidense' },
  { code: 'EUR', label: 'EUR', description: 'Euro' },
  { code: 'GBP', label: 'GBP', description: 'Libra esterlina' },
  { code: 'MXN', label: 'MXN', description: 'Peso mexicano' },
  { code: 'BRL', label: 'BRL', description: 'Real brasileño' },
  { code: 'CLP', label: 'CLP', description: 'Peso chileno' },
  { code: 'PEN', label: 'PEN — Sol peruano'           },
  { code: 'ARS', label: 'ARS — Peso argentino'        },
  { code: 'CNY', label: 'CNY — Yuan chino'            },
];


const ENTREGADO_OPTIONS = ['', 'Alexander', 'Diana', 'Juan David', 'Neida', 'Recepcion', 'Yibley'];
const CONTABILIZADO_POR_OPTIONS = ['', 'Alexander', 'Asignado pero no causa', 'Devuelta', 'Diana', 'Juan David', 'Neida', 'Yibley'];
const MOTIVO_DEMORA_OPTIONS = [
  '',
  'Correo caja menor',
  'Diferencia en valores',
  'Faltan soportes',
  'No hay OC',
  'Pendiente confirmacion',
  'Pendiente entrada',
  'Tiempo revision contabilidad',
];
const MOTIVO_DEVOLUCION_OPTIONS = [
  '',
  'Cuenta contable erronea',
  'Diferencia en valores',
  'Documento que afecta fue rechazado anteriormente',
  'Duplicado',
  'Fuera de fecha',
  'No coincide el NIT vs orden de compra',
  'No hay entrada',
  'Proveedor factura erroneamente imptos',
  'Sin autorizacion del area financiera',
  'Sin documentos soportes',
  'Sin orden de compra',
  'Sin requisitos de facturacion electronica',
];
const AREA_OPTIONS = [
  '', 'ADMINISTRATIVO', 'CALIDAD', 'COMERCIAL', 'COMPRAS', 'CONTABILIDAD',
  'DISTRIBUCION', 'FINANCIERA', 'GESTION AMBIENTAL', 'GESTION SOCIAL',
  'IMPORTACION', 'JURIDICA', 'MANTENIMIENTO', 'MATERIA PRIMA', 'MINAS',
  'MORTEROS', 'PRESIDENCIA', 'PRODUCCION', 'RECEPCION FUERA DE FECHA',
  'SISO', 'SISTEMAS', 'TRANSP MATERIA PRIMA', 'TTHH', 'PARADA MAYOR',
];
const fmtConsecutivo = (n: number) => `BEL${String(n).padStart(6, '0')}`;

interface ColFilters {
  col_numero_factura: string;
  col_nombre_proveedor: string;
  col_nit_proveedor: string;
  col_tipo_archivo: string;
  col_fecha_desde: string;
  col_fecha_hasta: string;
  col_valor_min: string;
  col_valor_max: string;
  col_area: string;
  col_entregado: string;
  col_radicado_x: string;
  col_contabilizado_por: string;
  col_motivo_demora: string;
  col_alerta_radicado: string;
  col_forma_de_pago: string;
  col_orden_compra: string;
  col_doc_contable: string;
  col_motivo_devolucion: string;
}

const EMPTY_COL: ColFilters = {
  col_numero_factura: '', col_nombre_proveedor: '', col_nit_proveedor: '',
  col_tipo_archivo: '', col_fecha_desde: '', col_fecha_hasta: '',
  col_valor_min: '', col_valor_max: '',
  col_area: '', col_entregado: '', col_radicado_x: '', col_contabilizado_por: '',
  col_motivo_demora: '', col_alerta_radicado: '', col_forma_de_pago: '',
  col_orden_compra: '', col_doc_contable: '', col_motivo_devolucion: '',
};

const COLUMNS: { key: string; label: string }[] = [
  { key: 'consecutivo',     label: 'Consecutivo' },
  { key: 'area',            label: 'Área' },
  { key: 'radicado_x',      label: 'Radicado X' },
  { key: 'entregado',       label: 'Responsable de cont' },
  { key: 'fecha_emision',    label: 'F. Radicado' },
  { key: 'alerta_radicado', label: 'F. Alerta' },
  { key: 'nit_proveedor',   label: 'NIT' },
  { key: 'nombre_proveedor',label: 'Tercero' },
  { key: 'numero_factura',  label: 'N° Factura' },
  { key: 'orden_compra',    label: 'OC' },
  { key: 'contabilizado_por',label:'Contabilizado por' },
  { key: 'valor_total',     label: 'Valor Total' },
  { key: 'tipo_moneda',     label: 'Moneda' },
  { key: 'ampliacion_observacion', label: 'Ampliación Obs.' },
  { key: 'motivo_demora',   label: 'Motivo Demora' },
  { key: 'fecha_contabilizado', label: 'Fecha Tramitado' },
  { key: 'doc_contable',    label: 'Doc. Contable' },
  { key: 'dias',            label: 'Días' },
  { key: 'fecha_entrega_tesoreria',      label: 'Fecha Entrega Tesorería' },
  { key: 'fecha_de_dev_a_recepcion',     label: 'Fecha Dev. Recepción' },
  { key: 'motivo_devolucion',            label: 'Motivo Devolución' },
  { key: 'fecha_envio_rechazo_recepcion_al_cliente', label: 'Fecha Envío Rechazo' },
  { key: 'forma_de_pago',   label: 'Plazo de Pago' },
  { key: 'acuse_recibido_dian',  label: 'Acuse' },
  { key: 'recibo_de_mercancia',  label: 'Recibo Mercancía' },
  { key: 'evidencia_aceptacion_url', label: 'Evidencia Acept./Rechazo' },
  { key: 'cufe',            label: 'CUFE' },
  { key: 'tiempo_real',     label: 'Tiempo Real' },
  { key: 'estado',          label: 'Estado' },
  { key: 'acciones',        label: 'Acciones' },
];

const statusColors: Record<string, string> = {
  PENDIENTE:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESADA:   'bg-green-100  text-green-800  border-green-200',
  RECHAZADA:   'bg-red-100    text-red-800    border-red-200',
  EN_REVISION: 'bg-blue-100   text-blue-800   border-blue-200',
};
const statusLabels: Record<string, string> = {
  PENDIENTE:   'Pendiente',
  PROCESADA:   'Procesada',
  RECHAZADA:   'Rechazada',
  EN_REVISION: 'En Revisión',
};

const authHeader = (): Record<string, string> => {
  const t = localStorage.getItem('billee_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const fmt = (v: string | number | null) =>
  v == null ? '—' : Number(v).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const INP = 'w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-red-200 focus:border-red-300 outline-none bg-white placeholder-gray-400';


function CurrencyPicker({ value, onChange, minWidth = 110 }: { value: string; onChange: (value: string) => void; minWidth?: number }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selected = MONEDA_OPTIONS.find(option => option.code === value) ?? MONEDA_OPTIONS[0];

  return (
    <div ref={rootRef} className="relative inline-block" style={{ minWidth: Math.max(minWidth, 80) }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 outline-none transition-shadow duration-150 hover:border-gray-400 hover:shadow-sm focus:border-red-300 focus:ring-1 focus:ring-red-200"
      >
        <span className="uppercase tracking-widest">{selected.label}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full max-h-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {MONEDA_OPTIONS.map(option => (
            <button
              key={option.code}
              type="button"
              onClick={() => { onChange(option.code); setOpen(false); }}
              className="w-full px-3 py-3 text-left transition-colors duration-150 hover:bg-gray-50 focus:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">{option.code}</span>
                {option.code === selected.code && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Activo</span>
                )}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{option.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Celda editable inline ────────────────────────────────────────────────────
function EditCell({
  value, onSave, type = 'text', options, minWidth = 100, stickyStyle,
}: {
  value: string | null;
  onSave: (v: string) => void;
  type?: 'text' | 'date' | 'number' | 'select' | 'textarea';
  options?: string[];
  minWidth?: number;
  stickyStyle?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || '');

  const commit = () => { setEditing(false); if (draft !== (value || '')) onSave(draft); };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #e8e0e0', padding: '3px 6px', whiteSpace: 'nowrap',
    minWidth, color: draft ? '#1a1a1a' : '#bbb', ...(stickyStyle || {}),
  };

  // Celda con valor → requiere clic en "Modificar" para editar
  if (!editing && value) return (
    <td style={{ ...cellStyle, cursor: 'default' }}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs truncate" style={{ maxWidth: minWidth + 20 }}>{value}</span>
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          className="shrink-0 text-[9px] font-semibold text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-colors"
        >
          Modificar
        </button>
      </div>
    </td>
  );

  // Celda vacía → clic directo para editar
  if (!editing) return (
    <td style={{ ...cellStyle, cursor: 'pointer' }} onClick={() => { setDraft(''); setEditing(true); }}>
      <span className="text-gray-300 text-[10px]">— clic para agregar —</span>
    </td>
  );

  const inputClass = 'text-xs border border-red-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-red-200 bg-white';

  return (
    <td style={{ ...cellStyle, padding: '2px 4px', background: '#fff8f8' }}>
      {type === 'select' && options ? (
        <select autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
          className={inputClass} style={{ minWidth }}>
          {options.map(o => <option key={o} value={o}>{o || '—'}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea autoFocus rows={2} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
          className={inputClass} style={{ minWidth, resize: 'none' }} />
      ) : (
        <input autoFocus type={type} value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          className={inputClass} style={{ minWidth }} />
      )}
    </td>
  );
}

// ── Celda de evidencia (foto adjunta) ────────────────────────────────────────
function EvidenciaCell({ facturaId, url, onUpdate, stickyStyle }: {
  facturaId: number;
  url: string | null;
  onUpdate: (url: string | null) => void;
  stickyStyle?: React.CSSProperties;
}) {
  const inputRef             = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox,  setLightbox]  = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('imagen', file);
      const res = await fetch(`/api/facturas/${facturaId}/evidencia`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error);
      const { url: newUrl } = await res.json();
      onUpdate(newUrl);
    } catch (e: any) {
      alert(`Error al subir imagen: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar la evidencia?')) return;
    try {
      await fetch(`/api/facturas/${facturaId}/evidencia`, { method: 'DELETE' });
      onUpdate(null);
    } catch { /* silencioso */ }
  };

  const imgSrc = url ? `/uploads/${url}` : null;

  return (
    <td style={{ border: '1px solid #e8e0e0', padding: '4px 6px', textAlign: 'center', minWidth: 90, ...(stickyStyle || {}) }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {uploading ? (
        <div className="flex items-center justify-center">
          <Loader2 size={16} className="animate-spin text-[#e8394a]" />
        </div>
      ) : imgSrc ? (
        <div className="flex items-center justify-center gap-1">
          {/* Thumbnail */}
          <button onClick={() => setLightbox(true)} title="Ver imagen"
            className="relative group rounded overflow-hidden border border-gray-200 hover:border-[#e8394a] transition-all"
            style={{ width: 38, height: 38, flexShrink: 0 }}>
            <img src={imgSrc} alt="evidencia" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <ZoomIn size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
          {/* Reemplazar / Eliminar */}
          <div className="flex flex-col gap-0.5">
            <button onClick={() => inputRef.current?.click()} title="Reemplazar"
              className="p-0.5 rounded text-gray-300 hover:text-[#e8394a] hover:bg-red-50 transition-colors">
              <Camera size={11} />
            </button>
            <button onClick={handleDelete} title="Eliminar"
              className="p-0.5 rounded text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors">
              <X size={11} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} title="Adjuntar imagen de evidencia"
          className="flex items-center gap-1 mx-auto px-2 py-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-[#e8394a] hover:text-[#e8394a] hover:bg-red-50 transition-all text-[10px] font-medium">
          <Camera size={12} />
          Adjuntar
        </button>
      )}

      {/* Lightbox */}
      {lightbox && imgSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setLightbox(false)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-semibold">Evidencia de Aceptación / Rechazo</p>
              <button onClick={() => setLightbox(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <img src={imgSrc} alt="evidencia" className="w-full rounded-2xl shadow-2xl object-contain max-h-[75vh]" />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => { inputRef.current?.click(); setLightbox(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors">
                <Camera size={13} /> Reemplazar
              </button>
              <button onClick={() => { handleDelete(); setLightbox(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors">
                <Trash2 size={13} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </td>
  );
}

// ── Modal Editar ─────────────────────────────────────────────────────────────
function EditModal({ factura, onSave, onClose }: { factura: Factura; onSave: (f: Partial<Factura>) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Factura>>({ ...factura });
  const [saving, setSaving] = useState(false);

  const f = (label: string, key: keyof Factura, type = 'text') => (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {key === 'estado' ? (
        <select value={form[key] as string} onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 bg-white">
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ) : key === 'entregado' ? (
        <select value={(form[key] as string) || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 bg-white">
          {ENTREGADO_OPTIONS.map(o => <option key={o} value={o}>{o || '— Sin asignar —'}</option>)}
        </select>
      ) : key === 'area' ? (
        <select value={(form[key] as string) || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 bg-white">
          {AREA_OPTIONS.map(o => <option key={o} value={o}>{o || '— Sin asignar —'}</option>)}
        </select>
      ) : key === 'observaciones' || key === 'descripcion_items' ? (
        <textarea rows={2} value={(form[key] as string) || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" />
      ) : (
        <input type={type} value={(form[key] as string) || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500" />
      )}
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    // Enviar sólo los campos que cambiaron (diff) para evitar enviar objetos completos
    const patch: Partial<Factura> = {};
    Object.keys(form).forEach(k => {
      const key = k as keyof Factura;
      const newVal = (form as any)[key];
      const oldVal = (factura as any)[key];
      if (newVal !== oldVal) patch[key] = newVal as any;
    });
    await onSave(patch);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Editar Factura</h2>
            <p className="text-xs text-gray-400">{factura.numero_factura} — {factura.nombre_proveedor}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {f('N° Factura',        'numero_factura')}
          {f('Proveedor',         'nombre_proveedor')}
          {f('NIT / RUT',         'nit_proveedor')}
          {f('Fecha Emisión',     'fecha_emision',     'date')}
          {f('Fecha Vencimiento', 'fecha_vencimiento', 'date')}
          {f('Valor Base',        'valor_base',        'number')}
          {f('IVA',               'iva',               'number')}
          {f('Valor Total',       'valor_total',       'number')}
          {f('Estado',            'estado')}
          {f('Entregado a',       'entregado')}
          {f('Área',              'area')}
          {f('Orden de Compra',   'orden_compra')}
          {f('Entrada Servicio',  'entrada_servicio')}
          <div className="col-span-2">{f('Observaciones', 'observaciones')}</div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-sm font-semibold shadow-sm disabled:opacity-60"
            style={{ background: '#e8394a' }}>
            <Save size={16} />{saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Ver Detalle ────────────────────────────────────────────────────────
function DetailModal({ factura, onClose }: { factura: Factura; onClose: () => void }) {
  const row = (label: string, value: string | null) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '—'}</span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detalle de Factura</h2>
            <p className="text-xs text-gray-400">Consecutivo {fmtConsecutivo(factura.consecutivo)} · {factura.id_unico}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <span className={cn('px-3 py-1 text-xs font-bold rounded-full border', statusColors[factura.estado])}>
            {statusLabels[factura.estado]}
          </span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {row('N° Factura',        factura.numero_factura)}
            {row('Proveedor',         factura.nombre_proveedor)}
            {row('NIT / RUT',         factura.nit_proveedor)}
            {row('Formato',           factura.tipo_archivo?.toUpperCase())}
            {row('Fecha Emisión',     factura.fecha_emision)}
            {row('Fecha Vencimiento', factura.fecha_vencimiento)}
            {row('Valor Base',        `$${fmt(factura.valor_base)}`)}
            {row('IVA',               `$${fmt(factura.iva)}`)}
            {row('Valor Total',       `$${fmt(factura.valor_total)}`)}
            {row('Entregado a',       factura.entregado)}
            {row('Área',              factura.area)}
            {row('Orden de Compra',   factura.orden_compra)}
            {row('Entrada Servicio',  factura.entrada_servicio)}
            {row('Fecha Registro',    factura.fecha_registro)}
          </div>
          {factura.observaciones && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Observaciones</p>
              <p className="text-sm text-gray-700">{factura.observaciones}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Eliminar ────────────────────────────────────────────────────────────
function DeleteModal({ factura, onConfirm, onClose }: { factura: Factura; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Eliminar Factura</h2>
          <p className="text-sm text-gray-500">
            ¿Seguro que desea eliminar la factura{' '}
            <span className="font-semibold text-gray-800">{factura.numero_factura}</span> de {factura.nombre_proveedor}?
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Gestion() {
  const [facturas,        setFacturas]        = useState<Factura[]>([]);
  const [total,           setTotal]           = useState(0);
  const [totalPages,      setTotalPages]      = useState(1);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [search,          setSearch]          = useState('');
  const [filterEstado,    setFilterEstado]    = useState('');
  const [page,            setPage]            = useState(1);
  const [editingFactura,  setEditingFactura]  = useState<Factura | null>(null);
  const [viewingFactura,  setViewingFactura]  = useState<Factura | null>(null);
  const [deletingFactura, setDeletingFactura] = useState<Factura | null>(null);
  const [selectedRowId,   setSelectedRowId]   = useState<number | null>(null);

  // ── Filtros de columna ─────────────────────────────────────────────────────
  const [showColFilters, setShowColFilters] = useState(false);
  const [colFilters,     setColFilters]     = useState<ColFilters>(EMPTY_COL);
  const [debounced,      setDebounced]      = useState<ColFilters>(EMPTY_COL);

  // Debounce: espera 400ms después del último cambio
  useEffect(() => {
    const t = setTimeout(() => setDebounced(colFilters), 400);
    return () => clearTimeout(t);
  }, [colFilters]);

  const setCol = (key: keyof ColFilters, value: string) => {
    setColFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const hasColFilters = Object.values(colFilters).some(v => v !== '');

  const clearAll = () => {
    setSearch('');
    setFilterEstado('');
    setColFilters(EMPTY_COL);
    setPage(1);
  };

  const [PAGE_SIZE, setPageSize] = useState(10);

  // ── Visibilidad de columnas ────────────────────────────────────────────────
  const [hiddenCols,   setHiddenCols]   = useState<Set<string>>(() => new Set());
  const [showColPanel, setShowColPanel] = useState(false);
  const vis = (key: string) => !hiddenCols.has(key);
  const toggleCol = (key: string) => setHiddenCols(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const visibleCount = COLUMNS.filter(c => vis(c.key)).length;

  // ── Columnas fijas (sticky) ────────────────────────────────────────────────
  const [pinnedCols, setPinnedCols] = useState<Set<string>>(() => new Set(['consecutivo', 'nombre_proveedor']));
  const thRefs   = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const [stickyLeft, setStickyLeft] = useState<Record<string, number>>({});
  const [savedMsg,   setSavedMsg]   = useState(false);

  const togglePin = (key: string) => setPinnedCols(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  // Calcula offsets acumulados para cada columna fija (en orden COLUMNS)
  const recalcSticky = useCallback(() => {
    const pinned = COLUMNS.filter(c => pinnedCols.has(c.key) && !hiddenCols.has(c.key));
    const offsets: Record<string, number> = {};
    let acc = 0;
    for (const col of pinned) {
      offsets[col.key] = acc;
      const th = thRefs.current.get(col.key);
      if (th) acc += th.offsetWidth;
    }
    setStickyLeft(offsets);
  }, [pinnedCols, hiddenCols]);

  useLayoutEffect(() => {
    recalcSticky();
  }, [recalcSticky, facturas.length]);

  useEffect(() => {
    window.addEventListener('resize', recalcSticky);
    return () => window.removeEventListener('resize', recalcSticky);
  }, [recalcSticky]);

  // Columna fija más a la derecha → recibe sombra separadora
  const pinnedVisible  = COLUMNS.filter(c => pinnedCols.has(c.key) && vis(c.key));
  const lastPinnedKey  = pinnedVisible.length > 0 ? pinnedVisible[pinnedVisible.length - 1].key : null;

  const stickyTdStyle = (key: string, base: React.CSSProperties = {}): React.CSSProperties => {
    if (!pinnedCols.has(key)) return base;
    return {
      ...base,
      position: 'sticky',
      left:      stickyLeft[key] ?? 0,
      zIndex:    1,
      background: 'inherit',
      ...(key === lastPinnedKey ? { boxShadow: '3px 0 6px -2px rgba(0,0,0,0.10)' } : {}),
    };
  };

  // ── Guardar / cargar vista por usuario ────────────────────────────────────
  const getViewKey = () => {
    try {
      const userRaw = localStorage.getItem('billee_user');
      if (!userRaw) return 'billee_view_default';
      const user = JSON.parse(userRaw);
      return `billee_view_${user.id ?? 'default'}`;
    } catch { return 'billee_view_default'; }
  };

  const saveView = () => {
    localStorage.setItem(getViewKey(), JSON.stringify({
      hiddenCols: [...hiddenCols],
      pinnedCols: [...pinnedCols],
      pageSize:   PAGE_SIZE,
    }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const showAllCols = () => {
    setHiddenCols(new Set());
    try {
      const raw = localStorage.getItem(getViewKey());
      if (raw) {
        const saved = JSON.parse(raw);
        localStorage.setItem(getViewKey(), JSON.stringify({ ...saved, hiddenCols: [] }));
      }
    } catch { /* sin vista guardada */ }
  };

  // Carga la vista al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getViewKey());
      if (!raw) return;
      const { hiddenCols: h, pinnedCols: p, pageSize: ps } = JSON.parse(raw);
      if (Array.isArray(h)) setHiddenCols(new Set(h));
      if (Array.isArray(p)) {
        setPinnedCols(new Set<string>(p));
      }
      if (ps) setPageSize(ps);
    } catch { /* sin vista guardada */ }
  }, []);

  // Celda de filtro por columna (para la fila de filtros)
  const filterCellFor = (key: string) => {
    const s: React.CSSProperties = { border: '1px solid #f0d0d3', padding: '4px 6px' };
    const sel = (colKey: keyof ColFilters, opts: string[]) => (
      <td key={key} style={s}>
        <select value={colFilters[colKey]} onChange={e => { setCol(colKey, e.target.value); setPage(1); }}
          className={INP} style={{ minWidth: 100 }}>
          {opts.map(o => <option key={o} value={o}>{o || '— Todos —'}</option>)}
        </select>
      </td>
    );
    const txt = (colKey: keyof ColFilters) => (
      <td key={key} style={s}>
        <input type="text" value={colFilters[colKey]} onChange={e => { setCol(colKey, e.target.value); setPage(1); }}
          placeholder="Filtrar…" className={INP} />
      </td>
    );
    switch (key) {
      case 'fecha_emision': return (
        <td key={key} style={s}>
          <div className="flex flex-col gap-1">
            <input type="date" value={colFilters.col_fecha_desde} onChange={e => { setCol('col_fecha_desde', e.target.value); setPage(1); }} title="Desde" className={INP} />
            <input type="date" value={colFilters.col_fecha_hasta} onChange={e => { setCol('col_fecha_hasta', e.target.value); setPage(1); }} title="Hasta" className={INP} />
          </div>
        </td>
      );
      case 'nit_proveedor':    return txt('col_nit_proveedor');
      case 'nombre_proveedor': return txt('col_nombre_proveedor');
      case 'numero_factura':   return txt('col_numero_factura');
      case 'orden_compra':     return txt('col_orden_compra');
      case 'doc_contable':     return txt('col_doc_contable');
      case 'valor_total': return (
        <td key={key} style={s}>
          <div className="flex flex-col gap-1">
            <input type="number" value={colFilters.col_valor_min} onChange={e => { setCol('col_valor_min', e.target.value); setPage(1); }} placeholder="Mín" className={INP} />
            <input type="number" value={colFilters.col_valor_max} onChange={e => { setCol('col_valor_max', e.target.value); setPage(1); }} placeholder="Máx" className={INP} />
          </div>
        </td>
      );
      case 'area':             return sel('col_area',             ['', ...AREA_OPTIONS.filter(Boolean)]);
      case 'entregado':        return sel('col_entregado',        ENTREGADO_OPTIONS);
      case 'radicado_x':       return sel('col_radicado_x',       ENTREGADO_OPTIONS);
      case 'contabilizado_por':return sel('col_contabilizado_por',CONTABILIZADO_POR_OPTIONS);
      case 'motivo_demora':    return sel('col_motivo_demora',    MOTIVO_DEMORA_OPTIONS);
      case 'motivo_devolucion':return sel('col_motivo_devolucion',MOTIVO_DEVOLUCION_OPTIONS);
      case 'alerta_radicado':  return sel('col_alerta_radicado',  ['', 'A tiempo', 'Demorado', 'Vencido']);
      case 'forma_de_pago':    return sel('col_forma_de_pago',    ['', 'Crédito', 'Contado']);
      case 'estado': return (
        <td key={key} style={s}><span className="text-[10px] text-gray-400 italic">↑ arriba</span></td>
      );
      default: return <td key={key} style={s} />;
    }
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), search, estado: filterEstado });
      // Añadir filtros de columna no vacíos
      (Object.entries(debounced) as [string, string][]).forEach(([k, v]) => { if (v) params.set(k, v); });

      const res  = await fetch(`/api/facturas?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      const data: Factura[] = json.data;

      // Calcular y aplicar alerta en tiempo real
      const patched = data.map(f => {
        if (!f.fecha_emision) return f;
        const computed = computeAlerta(f.fecha_emision);
        return computed ? { ...f, alerta_radicado: computed } : f;
      });
      setFacturas(patched);
      setTotal(json.total);
      setTotalPages(json.totalPages);

      // Persistir en BD los registros con valor desactualizado (fire and forget)
      patched.forEach(f => {
        if (f.alerta_radicado && f.alerta_radicado !== data.find(d => d.id === f.id)?.alerta_radicado) {
          fetch(`/api/facturas/${f.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ alerta_radicado: f.alerta_radicado }),
          }).catch(() => {});
        }
      });
    } catch (e: any) {
      setError(e.message || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, [page, PAGE_SIZE, search, filterEstado, debounced]);

  useEffect(() => { fetchFacturas(); }, [fetchFacturas]);

  // ── Acciones ───────────────────────────────────────────────────────────────
  const handleSave = async (updated: Partial<Factura>) => {
    if (!editingFactura) return;
    try {
      const res = await fetch(`/api/facturas/${editingFactura.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body:    JSON.stringify(updated),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEditingFactura(null);
      fetchFacturas();
    } catch (e: any) {
      alert(`Error al guardar: ${e.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deletingFactura) return;
    try {
      const res = await fetch(`/api/facturas/${deletingFactura.id}`, { method: 'DELETE', headers: { ...authHeader() } });
      if (!res.ok) throw new Error((await res.json()).error);
      setDeletingFactura(null);
      fetchFacturas();
    } catch (e: any) {
      alert(`Error al eliminar: ${e.message}`);
    }
  };

  const patchField = async (id: number, field: string, value: string, extra: Record<string, string | null> = {}) => {
    try {
      const payload = { [field]: value || null, ...extra };
      const res = await fetch(`/api/facturas/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setFacturas(prev => prev.map(f => f.id === id ? { ...f, [field]: value, ...extra } : f));
    } catch (e: any) { alert(`Error al guardar: ${e.message}`); }
  };

  const handleEntregadoChange = async (id: number, value: string) => {
    try {
      const res = await fetch(`/api/facturas/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body:    JSON.stringify({ entregado: value || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setFacturas(prev => prev.map(f => f.id === id ? { ...f, entregado: value } : f));
    } catch (e: any) {
      alert(`Error al guardar: ${e.message}`);
    }
  };

  const handleRadicadoXChange = async (id: number, value: string) => {
    try {
      const res = await fetch(`/api/facturas/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body:    JSON.stringify({ radicado_x: value || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setFacturas(prev => prev.map(f => f.id === id ? { ...f, radicado_x: value } : f));
    } catch (e: any) {
      alert(`Error al guardar: ${e.message}`);
    }
  };

  const handleContabilizadoPorChange = async (id: number, value: string) => {
    try {
      const res = await fetch(`/api/facturas/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body:    JSON.stringify({ contabilizado_por: value || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setFacturas(prev => prev.map(f => f.id === id ? { ...f, contabilizado_por: value } : f));
    } catch (e: any) {
      alert(`Error al guardar: ${e.message}`);
    }
  };

  const handleAreaChange = async (id: number, value: string) => {
    try {
      const res = await fetch(`/api/facturas/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body:    JSON.stringify({ area: value || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setFacturas(prev => prev.map(f => f.id === id ? { ...f, area: value } : f));
    } catch (e: any) {
      alert(`Error al guardar: ${e.message}`);
    }
  };

  const anyFilter = search || filterEstado || hasColFilters;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {editingFactura  && <EditModal   factura={editingFactura}  onSave={handleSave}   onClose={() => setEditingFactura(null)} />}
      {viewingFactura  && <DetailModal factura={viewingFactura}  onClose={() => setViewingFactura(null)} />}
      {deletingFactura && <DeleteModal factura={deletingFactura} onConfirm={handleDelete} onClose={() => setDeletingFactura(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Gestión de Radicación</h1>
          <p className="text-gray-500 text-sm mt-1">Inventario de facturas en <span className="font-semibold">facturas_procesadas</span>.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchFacturas}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-semibold shadow-sm"
            style={{ background: '#e8394a' }}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Barra de herramientas */}
        <div className="p-3 border-b border-gray-200 flex flex-wrap items-center gap-3 bg-gray-50/60 rounded-t-xl">
          {/* Búsqueda global */}
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por N° factura, proveedor, NIT…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:border-transparent bg-white"
              style={{ ['--tw-ring-color' as any]: '#e8394a' }}
            />
          </div>

          {/* Filtro de estado */}
          <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white text-gray-700">
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          {/* Botón filtros de columna */}
          <button
            onClick={() => setShowColFilters(v => !v)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 border rounded-lg text-sm font-semibold transition-all',
              showColFilters || hasColFilters
                ? 'border-red-300 bg-red-50 text-[#e8394a]'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            )}
            title="Filtros por columna"
          >
            <Filter size={14} />
            Filtros
            {hasColFilters && (
              <span className="w-2 h-2 rounded-full bg-[#e8394a] flex-shrink-0" />
            )}
          </button>

          {/* Botón visibilidad de columnas */}
          <div className="relative">
            <button
              onClick={() => setShowColPanel(v => !v)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 border rounded-lg text-sm font-semibold transition-all',
                showColPanel || hiddenCols.size > 0
                  ? 'border-blue-300 bg-blue-50 text-blue-600'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              )}
              title="Mostrar/ocultar columnas"
            >
              <Sliders size={14} /> Columnas
              {hiddenCols.size > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none">
                  {hiddenCols.size}
                </span>
              )}
            </button>
            {showColPanel && (
              <div className="absolute top-full mt-1 right-0 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-72">
                <div className="flex items-center justify-between mb-1 pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-600">Columnas visibles</span>
                  <button onClick={showAllCols}
                    className="text-[11px] text-[#e8394a] hover:underline font-semibold">
                    Mostrar todas
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mb-1.5 px-1">
                  <Pin size={9} className="inline mr-1" />= columna fija al desplazar
                </p>
                <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
                  {COLUMNS.map(c => (
                    <div key={c.key} className="flex items-center gap-1 py-0.5 px-1.5 rounded-lg hover:bg-gray-50">
                      <label className="flex items-center gap-2 flex-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={vis(c.key)}
                          onChange={() => toggleCol(c.key)}
                          className="rounded border-gray-300 accent-red-500"
                        />
                        <span className="text-xs text-gray-700">{c.label}</span>
                      </label>
                      {/* Pin toggle */}
                      {vis(c.key) && c.key !== 'acciones' && (() => {
                        const isPinned = pinnedCols.has(c.key);
                        return (
                          <button
                            onClick={() => togglePin(c.key)}
                            title={isPinned ? 'Desfijar columna' : 'Fijar columna'}
                            className={cn(
                              'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all flex-shrink-0',
                              isPinned
                                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                : 'bg-white text-gray-400 border-gray-300 hover:border-blue-400 hover:text-blue-500'
                            )}
                          >
                            <Pin size={10} />
                            {isPinned ? 'Fija' : 'Fijar'}
                          </button>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guardar vista */}
          <button
            onClick={saveView}
            title="Guardar configuración de columnas para este usuario"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
            style={{
              background:  savedMsg ? '#16a34a' : '#e8394a',
              color:       '#fff',
              border:      'none',
              opacity:     1,
            }}
          >
            <BookmarkCheck size={15} />
            {savedMsg ? 'Guardado ✓' : 'Guardar vista'}
          </button>

          {/* Limpiar todo */}
          {anyFilter && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50">
              <X size={13} /> Limpiar
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">{total} registros</span>
        </div>

        {/* Cuerpo */}
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {error ? (
            <div className="text-center py-12 text-red-500 text-sm">
              ⚠️ {error} — ¿El backend está corriendo en <code>localhost:3001</code>?
            </div>
          ) : (
            <table className="min-w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 4 }}>
                {/* Cabeceras estilo Excel */}
                <tr style={{ background: '#e8394a' }}>
                  {COLUMNS.filter(c => vis(c.key)).map(c => (
                    <th key={c.key}
                      ref={el => { if (el && pinnedCols.has(c.key)) thRefs.current.set(c.key, el); else thRefs.current.delete(c.key); }}
                      className="whitespace-nowrap font-bold text-white text-[12px] uppercase tracking-wide select-none"
                      style={{
                        padding: '7px 10px', border: '1px solid #c9303f', textAlign: 'left',
                        ...(pinnedCols.has(c.key) ? {
                          position: 'sticky',
                          left:     stickyLeft[c.key] ?? 0,
                          zIndex:   3,
                          background: '#e8394a',
                          ...(c.key === lastPinnedKey ? { boxShadow: '3px 0 6px -2px rgba(0,0,0,0.18)' } : {}),
                        } : {}),
                      }}>
                      {c.label}
                      {pinnedCols.has(c.key) && <Pin size={9} className="inline ml-1 opacity-60" />}
                    </th>
                  ))}
                </tr>

                {/* Fila de filtros de columna */}
                {showColFilters && (
                  <tr style={{ background: '#fdf2f3', borderBottom: '2px solid #e8394a' }}>
                    {COLUMNS.filter(c => vis(c.key)).map(c => {
                      const cell = filterCellFor(c.key);
                      if (!pinnedCols.has(c.key)) return cell;
                      const cellElement = cell as ReactElement<{ style?: CSSProperties }>;
                      return cloneElement(cellElement, {
                        style: {
                          ...cellElement.props.style,
                          position: 'sticky',
                          left:     stickyLeft[c.key] ?? 0,
                          zIndex:   2,
                          background: '#fdf2f3',
                          ...(c.key === lastPinnedKey ? { boxShadow: '3px 0 6px -2px rgba(0,0,0,0.10)' } : {}),
                        },
                      });
                    })}
                  </tr>
                )}
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#fdf6f6' }}>
                      {Array.from({ length: visibleCount }).map((_, j) => (
                        <td key={j} style={{ border: '1px solid #e8e0e0', padding: '6px 10px' }}>
                          <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: j === 0 ? '70px' : '75%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : facturas.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCount} className="text-center text-gray-400" style={{ padding: '40px', border: '1px solid #e8e0e0' }}>
                      No se encontraron facturas.
                    </td>
                  </tr>
                ) : (
                  facturas.map((f, idx) => {
                    const isSelected = selectedRowId === f.id;
                    const bg0 = isSelected ? '#fef9c3' : idx % 2 === 0 ? '#ffffff' : '#fdf6f6';
                    const td  = (key: string, content: React.ReactNode, extra?: React.CSSProperties) => (
                      <td style={stickyTdStyle(key, { border: '1px solid #e8e0e0', padding: '5px 8px', whiteSpace: 'nowrap', ...extra })}>{content}</td>
                    );
                    return (
                      <tr key={f.id}
                        onClick={() => setSelectedRowId(prev => prev === f.id ? null : f.id)}
                        style={{ background: bg0, cursor: 'pointer', boxShadow: isSelected ? 'inset 3px 0 0 #f59e0b' : 'none' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fde8ea'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = bg0; }}>

                        {vis('consecutivo') && (
                          <td style={stickyTdStyle('consecutivo', { border: '1px solid #e8e0e0', padding: '5px 8px', whiteSpace: 'nowrap', color: '#888', fontFamily: 'monospace' })}>
                            {fmtConsecutivo(f.consecutivo)}
                          </td>
                        )}

                        {vis('area') && (
                          <td style={stickyTdStyle('area', { border: '1px solid #e8e0e0', padding: '3px 5px' })}>
                            <select value={f.area || ''} onChange={e => handleAreaChange(f.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white focus:ring-1 focus:ring-red-300 outline-none"
                              style={{ minWidth: 130 }}>
                              {AREA_OPTIONS.map(o => <option key={o} value={o}>{o || '— Sin asignar —'}</option>)}
                            </select>
                          </td>
                        )}

                        {vis('radicado_x') && (
                          <td style={stickyTdStyle('radicado_x', { border: '1px solid #e8e0e0', padding: '3px 5px' })}>
                            <select value={f.radicado_x || ''} onChange={e => handleRadicadoXChange(f.id, e.target.value)}
                              title="Radicado X"
                              className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white focus:ring-1 focus:ring-red-300 outline-none"
                              style={{ minWidth: 110 }}>
                              {ENTREGADO_OPTIONS.map(o => <option key={o} value={o}>{o || '— Sin asignar —'}</option>)}
                            </select>
                          </td>
                        )}

                        {vis('entregado') && (
                          <td style={stickyTdStyle('entregado', { border: '1px solid #e8e0e0', padding: '3px 5px' })}>
                            <select value={f.entregado || ''} onChange={e => handleEntregadoChange(f.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white focus:ring-1 focus:ring-red-300 outline-none"
                              style={{ minWidth: 110 }}>
                              {ENTREGADO_OPTIONS.map(o => <option key={o} value={o}>{o || '— Sin asignar —'}</option>)}
                            </select>
                          </td>
                        )}

                        {vis('fecha_emision')    && td('fecha_emision', f.fecha_emision?.slice(0,10) || '—', { color: '#555' })}

                        {vis('alerta_radicado') && (
                          <td style={stickyTdStyle('alerta_radicado', { border: '1px solid #e8e0e0', padding: '5px 8px', textAlign: 'center' })}>
                            {(() => {
                              const alerta = f.fecha_emision ? computeAlerta(f.fecha_emision) : '';
                              if (!alerta) return <span style={{ color: '#ccc', fontSize: 10 }}>—</span>;
                              const bg    = alerta === 'A tiempo' ? '#dcfce7' : alerta === 'Demorado' ? '#ffedd5' : '#fee2e2';
                              const color = alerta === 'A tiempo' ? '#166534' : alerta === 'Demorado' ? '#9a3412' : '#991b1b';
                              const border = alerta === 'A tiempo' ? '#86efac' : alerta === 'Demorado' ? '#fdba74' : '#fca5a5';
                              return (
                                <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', background: bg, color, border: `1px solid ${border}` }}>
                                  {alerta}
                                </span>
                              );
                            })()}
                          </td>
                        )}

                        {vis('nit_proveedor')    && td('nit_proveedor', f.nit_proveedor, { color: '#555', fontFamily: 'monospace' })}
                        {vis('nombre_proveedor') && (
                          <td style={stickyTdStyle('nombre_proveedor', { border: '1px solid #e8e0e0', padding: '5px 8px', whiteSpace: 'nowrap', color: '#333', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' })}>
                            {f.nombre_proveedor}
                          </td>
                        )}
                        {vis('numero_factura')   && td('numero_factura', f.numero_factura, { fontWeight: 600 })}
                        {vis('orden_compra')     && <EditCell value={f.orden_compra} type="text" minWidth={110} onSave={v => patchField(f.id, 'orden_compra', v)} stickyStyle={stickyTdStyle('orden_compra')} />}

                        {vis('contabilizado_por') && (
                          <td style={stickyTdStyle('contabilizado_por', { border: '1px solid #e8e0e0', padding: '3px 5px' })}>
                            <select value={f.contabilizado_por || ''} onChange={e => handleContabilizadoPorChange(f.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white focus:ring-1 focus:ring-red-300 outline-none"
                              style={{ minWidth: 110 }}>
                              {CONTABILIZADO_POR_OPTIONS.map(o => <option key={o} value={o}>{o || '— Sin asignar —'}</option>)}
                            </select>
                          </td>
                        )}

                        {vis('valor_total') && td('valor_total', `$${fmt(f.valor_total)}`, { fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' })}

                        {vis('tipo_moneda') && (() => {
                          const moneda = f.tipo_moneda || 'COP';
                          return (
                            <td style={stickyTdStyle('tipo_moneda', { border: '1px solid #e8e0e0', padding: '3px 5px' })}>
                              <CurrencyPicker
                                value={moneda}
                                onChange={async val => {
                                  try {
                                    const res = await fetch(`/api/facturas/${f.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', ...authHeader() },
                                      body: JSON.stringify({ tipo_moneda: val }),
                                    });
                                    if (!res.ok) throw new Error((await res.json()).error);
                                    setFacturas(prev => prev.map(r => r.id === f.id ? { ...r, tipo_moneda: val } : r));
                                  } catch (err: any) { alert(`Error: ${err.message}`); }
                                }}
                                minWidth={70}
                              />
                            </td>
                          );
                        })()}

                        {vis('ampliacion_observacion') && <EditCell value={f.ampliacion_observacion} type="textarea" minWidth={160} onSave={v => patchField(f.id, 'ampliacion_observacion', v)} stickyStyle={stickyTdStyle('ampliacion_observacion')} />}
                        {vis('motivo_demora') && (() => {
                          const dias = countBusinessDaysSince(f.fecha_emision);
                          const bloqueado = dias === null || dias <= 3;
                          return bloqueado
                            ? td('motivo_demora', f.motivo_demora || '—', { color: '#bbb', fontStyle: 'italic', fontSize: 11, minWidth: 180 })
                            : <EditCell value={f.motivo_demora} type="select" options={MOTIVO_DEMORA_OPTIONS} minWidth={180} onSave={v => patchField(f.id, 'motivo_demora', v)} stickyStyle={stickyTdStyle('motivo_demora')} />;
                        })()}
                        {vis('fecha_contabilizado') && (() => {
                          const disabled = Boolean(f.fecha_de_dev_a_recepcion);
                          return disabled ? td('fecha_contabilizado', f.fecha_contabilizado?.slice(0,10) || '—', { color: '#777' }) : <EditCell value={f.fecha_contabilizado?.slice(0,10)} type="date" minWidth={120} onSave={v => patchField(f.id, 'fecha_contabilizado', v)} stickyStyle={stickyTdStyle('fecha_contabilizado')} />;
                        })()}
                        {vis('doc_contable') && (() => {
                          const disabled = Boolean(f.fecha_de_dev_a_recepcion);
                          return disabled ? td('doc_contable', f.doc_contable || '—', { color: '#777' }) : <EditCell value={f.doc_contable} type="text" minWidth={110} onSave={v => patchField(f.id, 'doc_contable', v)} stickyStyle={stickyTdStyle('doc_contable')} />;
                        })()}
                        {vis('dias')                   && td('dias', countBusinessDaysSince(f.fecha_emision) ?? '—', { minWidth: 70, textAlign: 'center', color: '#333' })}
                        {vis('fecha_entrega_tesoreria') && <EditCell value={f.fecha_entrega_tesoreria} type="text" minWidth={130} onSave={v => patchField(f.id, 'fecha_entrega_tesoreria', v, { estado: 'EN_REVISION' })} stickyStyle={stickyTdStyle('fecha_entrega_tesoreria')} />}
                        {vis('fecha_de_dev_a_recepcion') && <EditCell value={f.fecha_de_dev_a_recepcion?.slice(0,10)} type="date" minWidth={130} onSave={v => patchField(f.id, 'fecha_de_dev_a_recepcion', v, { aceptacion_o_rechazo: 'Rechazo', estado: 'RECHAZADA' })} stickyStyle={stickyTdStyle('fecha_de_dev_a_recepcion')} />}
                        {vis('motivo_devolucion') && <EditCell value={f.motivo_devolucion} type="select" options={MOTIVO_DEVOLUCION_OPTIONS} minWidth={200} onSave={v => patchField(f.id, 'motivo_devolucion', v)} stickyStyle={stickyTdStyle('motivo_devolucion')} />}
                        {vis('fecha_envio_rechazo_recepcion_al_cliente') && <EditCell value={f.fecha_envio_rechazo_recepcion_al_cliente?.slice(0,10)} type="date" minWidth={140} onSave={v => patchField(f.id, 'fecha_envio_rechazo_recepcion_al_cliente', v)} stickyStyle={stickyTdStyle('fecha_envio_rechazo_recepcion_al_cliente')} />}
                        {vis('forma_de_pago')   && <EditCell value={f.forma_de_pago}   type="select" options={['','Crédito','Contado']} minWidth={110} onSave={v => patchField(f.id, 'forma_de_pago', v)} stickyStyle={stickyTdStyle('forma_de_pago')} />}
                        {vis('acuse_recibido_dian')  && <EditCell value={f.acuse_recibido_dian?.slice(0,10)}    type="date" minWidth={120} onSave={v => patchField(f.id, 'acuse_recibido_dian', v)} stickyStyle={stickyTdStyle('acuse_recibido_dian')} />}
                        {vis('recibo_de_mercancia') && (() => {
                          const disabled = Boolean(f.fecha_de_dev_a_recepcion);
                          return disabled ? td('recibo_de_mercancia', f.recibo_de_mercancia?.slice(0,10) || '—', { color: '#777' }) : <EditCell value={f.recibo_de_mercancia?.slice(0,10)} type="date" minWidth={120} onSave={v => patchField(f.id, 'recibo_de_mercancia', v)} stickyStyle={stickyTdStyle('recibo_de_mercancia')} />;
                        })()}

                        {vis('evidencia_aceptacion_url') && (() => {
                          const bloqueado = f.forma_de_pago === 'Contado';
                          return bloqueado
                            ? td('evidencia_aceptacion_url', '—', { color: '#bbb', fontStyle: 'italic', fontSize: 11, minWidth: 130 })
                            : (
                              <EvidenciaCell
                                facturaId={f.id}
                                url={f.evidencia_aceptacion_url || null}
                                onUpdate={url => setFacturas(prev => prev.map(r => r.id === f.id ? { ...r, evidencia_aceptacion_url: url || '' } : r))}
                                stickyStyle={stickyTdStyle('evidencia_aceptacion_url')}
                              />
                            );
                        })()}

                        {vis('cufe')            && td('cufe', f.cufe ? f.cufe.slice(0, 20) + '…' : '—', { fontFamily: 'monospace', color: '#777', fontSize: 10 })}
                        {vis('tipo_de_factura') && <EditCell value={f.tipo_de_factura} type="select" options={['','Electrónica','Física','Proforma']} minWidth={110} onSave={v => patchField(f.id, 'tipo_de_factura', v)} stickyStyle={stickyTdStyle('tipo_de_factura')} />}
                        {vis('tiempo_real')     && <EditCell value={f.tiempo_real}     type="select" options={['', ...Array.from({ length: 20 }, (_, i) => String(i + 1))]} minWidth={90} onSave={v => patchField(f.id, 'tiempo_real', v)} stickyStyle={stickyTdStyle('tiempo_real')} />}

                        {vis('estado') && (() => {
                          const isOnlyBasic = !f.fecha_contabilizado && !f.doc_contable && !f.fecha_de_dev_a_recepcion;
                          // Priorizar el estado guardado en la base de datos para permitir cambios manuales.
                          let displayEstado = f.estado && f.estado !== '' ? f.estado : null;
                          if (!displayEstado) {
                            if (f.fecha_envio_rechazo_recepcion_al_cliente || f.fecha_de_dev_a_recepcion) displayEstado = 'RECHAZADA';
                            else displayEstado = isOnlyBasic ? 'PENDIENTE' : (f.estado || 'PENDIENTE');
                          }
                          return (
                            <td style={stickyTdStyle('estado', { border: '1px solid #e8e0e0', padding: '5px 8px' })}>
                              <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded border whitespace-nowrap', statusColors[displayEstado])}>
                                {statusLabels[displayEstado] ?? displayEstado}
                              </span>
                            </td>
                          );
                        })()}

                        {vis('acciones') && (
                          <td style={{ border: '1px solid #e8e0e0', padding: '4px 6px' }}>
                            <div className="flex items-center gap-0.5">
                              <button onClick={() => setEditingFactura(f)} title="Editar"
                                className="p-1.5 rounded text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => setViewingFactura(f)} title="Ver detalle"
                                className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <Eye size={14} />
                              </button>
                              <button onClick={() => setDeletingFactura(f)} title="Eliminar"
                                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Mostrando <span className="font-semibold">{Math.min((page - 1) * PAGE_SIZE + 1, total)}</span>–
              <span className="font-semibold">{Math.min(page * PAGE_SIZE, total)}</span> de{' '}
              <span className="font-semibold">{total}</span>
            </p>
            <div className="flex items-center gap-1 ml-3 border-l border-gray-200 pl-3">
              <span className="text-xs text-gray-400">Mostrar</span>
              {[10, 20, 50].map(n => (
                <button key={n} onClick={() => { setPageSize(n); setPage(1); }}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all', PAGE_SIZE === n
                    ? 'text-white border-transparent'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-[#e8394a]')}
                  style={PAGE_SIZE === n ? { background: '#e8394a', borderColor: '#e8394a' } : {}}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
              return p <= totalPages ? (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-8 h-8 rounded-lg border text-sm font-semibold transition-colors',
                    p === page ? 'text-white border-transparent' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50')}
                  style={p === page ? { background: '#e8394a', borderColor: '#e8394a' } : {}}>
                  {p}
                </button>
              ) : null;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
