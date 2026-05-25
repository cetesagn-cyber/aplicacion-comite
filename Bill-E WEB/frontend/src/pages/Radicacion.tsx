import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, X, CheckCircle, ZoomIn, ZoomOut, FileText, Sparkles, Loader2 } from 'lucide-react';

interface FormData {
  origen: string;
  nit: string;
  empresa: string;
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento: string;
  cufe: string;
  valorBase: string;
  iva: string;
  valorTotal: string;
  ordenCompra: string;
  entradaServicio: string;
  observaciones: string;
  esProforma: boolean;
}

const emptyForm: FormData = {
  origen: '',
  nit: '',
  empresa: '',
  numeroFactura: '',
  fechaEmision: '',
  fechaVencimiento: '',
  cufe: '',
  valorBase: '',
  iva: '',
  valorTotal: '',
  ordenCompra: '',
  entradaServicio: '',
  observaciones: '',
  esProforma: false,
};

// ── Resaltado de sintaxis XML ────────────────────────────────────────────────
function highlightXml(xml: string): string {
  return xml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(&lt;\/?)([\w:-]+)/g, '<span style="color:#e8394a;font-weight:600">$1$2</span>')
    .replace(/([\w:-]+)(=)(&quot;[^&]*&quot;)/g,
      '<span style="color:#0369a1">$1</span><span style="color:#555">$2</span><span style="color:#16a34a">$3</span>')
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#9ca3af;font-style:italic">$1</span>');
}

function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  xml.replace(/>\s*</g, '>\n<').split('\n').forEach(node => {
    if (node.match(/^<\/\w/)) indent = Math.max(0, indent - 1);
    formatted += '  '.repeat(indent) + node.trim() + '\n';
    if (node.match(/^<\w[^/]*[^/]>$/) && !node.match(/^<.+\/>/)) indent++;
  });
  return formatted.trim();
}

// ── Visor de archivo ─────────────────────────────────────────────────────────
function FileViewer({ file, zoom, onZoomIn, onZoomOut }: { file: File; zoom: number; onZoomIn: () => void; onZoomOut: () => void }) {
  const [objectUrl] = useState(() => URL.createObjectURL(file));
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');
  const isXml = file.name.toLowerCase().endsWith('.xml');

  useEffect(() => {
    if (!isXml) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        setXmlContent(formatXml(text));
      } catch {
        setXmlContent(file.name);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }, [file, isXml]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
          <File size={14} className="shrink-0 text-primary-600" />
          <span className="truncate font-medium">{file.name}</span>
          <span className="text-gray-400 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onZoomOut} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Alejar">
            <ZoomOut size={15} />
          </button>
          <span className="text-[11px] text-gray-500 w-10 text-center font-semibold">{zoom}%</span>
          <button onClick={onZoomIn} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Acercar">
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto bg-gray-200 rounded-b-xl flex items-start justify-center p-3">
        {isPdf && (
          <iframe
            src={objectUrl}
            title="Vista previa PDF"
            className="rounded shadow-md"
            style={{ width: `${zoom}%`, minWidth: '300px', height: '600px', border: 'none' }}
          />
        )}
        {isImage && (
          <img
            src={objectUrl}
            alt="Vista previa"
            className="rounded shadow-md object-contain"
            style={{ width: `${zoom}%`, maxWidth: '100%' }}
          />
        )}
        {isXml && (
          <div className="bg-white rounded-xl shadow-md w-full h-full overflow-auto"
            style={{ fontSize: `${Math.round(zoom * 0.11)}px` }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0">
              <FileText size={14} className="text-primary-600 shrink-0" />
              <span className="text-xs font-semibold text-gray-600">XML</span>
              <span className="text-xs text-gray-400 ml-auto">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            {xmlContent == null ? (
              <div className="p-6 text-xs text-gray-400 animate-pulse">Cargando…</div>
            ) : (
              <pre
                className="p-4 overflow-auto leading-relaxed font-mono text-gray-800 whitespace-pre-wrap break-all"
                dangerouslySetInnerHTML={{ __html: highlightXml(xmlContent) }}
              />
            )}
          </div>
        )}
        {!isPdf && !isImage && !isXml && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-400">
            <File size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay previsualización disponible para este formato.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function Radicacion() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(100);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [submitted, setSubmitted] = useState(false);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setConfirmEnabled(false);
      runExtraction(f);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setConfirmEnabled(false);
      runExtraction(f);
    }
  };

  const removeFile = () => {
    setFile(null);
    setZoom(100);
    setExtraction(null);
    setForm({ ...emptyForm });
    setConfirmEnabled(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function parseJsonSafe(res: Response) {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  const runExtraction = async (f: File) => {
    setExtracting(true);
    setExtraction(null);
    try {
      const fd = new FormData();
      fd.append('archivo', f);
      const res = await fetch('/api/extract', { method: 'POST', body: fd });
      if (!res.ok) return;
      const data = await parseJsonSafe(res);
      const c = data.campos || {};
      // Poblar solo campos vacíos
      setForm(prev => ({
        ...prev,
        nit:             prev.nit             || c.nit_proveedor     || '',
        empresa:         prev.empresa         || c.nombre_proveedor  || '',
        numeroFactura:   prev.numeroFactura   || c.numero_factura    || '',
        fechaEmision:    prev.fechaEmision    || c.fecha_emision     || '',
        fechaVencimiento:prev.fechaVencimiento|| c.fecha_vencimiento || '',
        cufe:            prev.cufe            || c.cufe              || '',
        valorBase:       prev.valorBase       || (c.valor_base  != null ? String(c.valor_base)  : ''),
        iva:             prev.iva             || (c.iva         != null ? String(c.iva)         : ''),
        valorTotal:      prev.valorTotal      || (c.valor_total != null ? String(c.valor_total) : ''),
        ordenCompra:     prev.ordenCompra     || c.orden_compra      || '',
        esProforma:      c.es_proforma        ?? prev.esProforma,
      }));
      setExtraction({ metodo: data.metodo, confianza_global: data.confianza_global ?? 0 });
    } catch {
      // extracción fallida — no bloquear al usuario
    } finally {
      setExtracting(false);
    }
  };

  const [apiError,    setApiError]    = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [idUnico,     setIdUnico]     = useState('');
  const [savedCopy,   setSavedCopy]   = useState('');
  const [extracting,  setExtracting]  = useState(false);
  const [extraction,  setExtraction]  = useState<{ metodo: string; confianza_global: number } | null>(null);

  const submitFactura = async (selectedFile: File) => {
    setApiError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('archivo',           selectedFile);
      formData.append('nit_proveedor',     form.nit);
      formData.append('nombre_proveedor',  form.empresa);
      formData.append('numero_factura',    form.numeroFactura);
      formData.append('fecha_emision',     form.fechaEmision     || '');
      formData.append('fecha_vencimiento', form.fechaVencimiento || '');
      formData.append('cufe',              form.cufe             || '');
      formData.append('valor_base',        form.valorBase  || '0');
      formData.append('iva',               form.iva        || '0');
      formData.append('valor_total',       form.valorTotal || '0');
      formData.append('orden_compra',      form.ordenCompra     || '');
      formData.append('entrada_servicio',  form.entradaServicio || '');
      formData.append('observaciones',     form.observaciones   || '');

      const res = await fetch('/api/facturas', {
        method: 'POST',
        body:   formData,
      });

      const data = await parseJsonSafe(res);
      if (!res.ok) {
        throw new Error(data.error || data.message || `Error ${res.status}`);
      }

      setIdUnico(data.id_unico || '');
      setSavedCopy(data.copia_radicacion || '');
      setSubmitted(true);
    } catch (err: any) {
      setApiError(err.message || 'Error al radicar la factura');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!file && !submitting && !!form.origen && !!form.nit && !!form.empresa && !!form.numeroFactura && !!form.fechaEmision && !!form.valorBase && !!form.valorTotal;
  const showSubmitButton = canSubmit && confirmEnabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !showSubmitButton) return;
    await submitFactura(file);
  };

  const handleReset = () => {
    setFile(null);
    setForm({ ...emptyForm });
    setSubmitted(false);
    setSavedCopy('');
    setZoom(100);
    setConfirmEnabled(false);
  };

  const setField = (key: keyof FormData, value: string | boolean) => {
    setConfirmEnabled(false);
    setForm(f => ({ ...f, [key]: value }));
  };

  React.useEffect(() => {
    if (!canSubmit) setConfirmEnabled(false);
  }, [canSubmit]);

  const inputClass = "w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">¡Factura Radicada!</h2>
            <p className="text-gray-600 mt-2">
              La factura <span className="font-semibold text-gray-800">{form.numeroFactura || file?.name}</span> fue procesada exitosamente.
            </p>
          </div>
        </div>

        {/* Información de radicación */}
        <div className="grid grid-cols-2 gap-4">
          {/* Estado */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold mb-2">Estado</p>
            <p className="text-lg font-bold text-blue-900">Pendiente</p>
            <p className="text-xs text-blue-600 mt-1">Aguardando verificación y procesamiento</p>
          </div>

          {/* ID Único */}
          {idUnico && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4">
              <p className="text-xs text-purple-600 uppercase tracking-wider font-semibold mb-2">ID Único</p>
              <p className="text-lg font-bold font-mono text-purple-900 break-all">{idUnico}</p>
            </div>
          )}
        </div>

        {/* Información de archivo guardado */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">Archivo guardado automáticamente</p>
              <p className="text-xs text-green-700 mt-0.5">Se creó una copia sin interacción adicional</p>
            </div>
          </div>
          {savedCopy && (
            <div className="ml-9 bg-white border border-green-100 rounded-lg p-3 space-y-1">
              <p className="text-xs font-mono text-gray-500">Ubicación:</p>
              <p className="text-sm font-mono text-gray-800 break-all font-semibold">{savedCopy}</p>
            </div>
          )}
        </div>

        {/* Próximos pasos */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Próximos pasos:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-gray-400 font-semibold">1.</span>
              <span>La factura está en estado <span className="font-semibold">Pendiente</span> en el módulo de Gestión</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400 font-semibold">2.</span>
              <span>El operador debe revisar y procesarla</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400 font-semibold">3.</span>
              <span>El archivo se ha almacenado en el directorio local de radicaciones</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleReset}
          className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
        >
          Radicar otra factura
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Radicación Manual</h1>
        <p className="text-gray-500 text-sm mt-1">Cargue y confirme facturas que no fueron procesadas automáticamente por Bill-e.</p>
      </div>

      {/* Layout 50/50 */}
      <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[500px]">

        {/* ── Panel izquierdo: Visor ──────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {!file ? (
            /* Zona de carga */
            <div
              className={`flex-1 flex flex-col items-center justify-center m-3 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/40'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.xml"
              />
              <div className="bg-white p-5 rounded-2xl shadow-sm mb-4">
                <UploadCloud size={36} className="text-primary-600" />
              </div>
              <p className="text-gray-700 font-semibold text-center px-4">
                Arrastre su archivo aquí<br />o haga clic para buscar
              </p>
              <p className="text-gray-400 text-xs mt-3 text-center px-6">
                PDF · JPG · PNG · XML<br />Máximo 10 MB
              </p>
              <div className="mt-5 flex gap-2 flex-wrap justify-center px-4">
                {['PDF', 'JPG', 'XML', 'PNG'].map(f => (
                  <span key={f} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-500">{f}</span>
                ))}
              </div>
            </div>
          ) : (
            /* Visor activo */
            <div className="flex-1 flex flex-col overflow-hidden p-2">
              {/* Botón quitar archivo */}
              <div className="flex justify-end mb-1">
                <button
                  onClick={removeFile}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  <X size={13} /> Cambiar archivo
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <FileViewer
                  file={file}
                  zoom={zoom}
                  onZoomIn={() => setZoom(z => Math.min(z + 20, 200))}
                  onZoomOut={() => setZoom(z => Math.max(z - 20, 40))}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Panel derecho: Formulario ───────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/60 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Datos de la Factura</h3>
                <p className="text-xs text-gray-400 mt-0.5">Complete o corrija los campos extraídos</p>
              </div>
              {extracting && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Loader2 size={13} className="animate-spin" />
                  Analizando documento…
                </div>
              )}
              {!extracting && extraction && (
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${
                  extraction.confianza_global >= 70 ? 'bg-green-50 text-green-700' :
                  extraction.confianza_global >= 40 ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-600'
                }`}>
                  <Sparkles size={13} />
                  {extraction.metodo} · {extraction.confianza_global}% confianza
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-5 space-y-4 flex-1">

              {/* Origen */}
              <div>
                <label className={labelClass}>Origen *</label>
                <select
                  required
                  value={form.origen}
                  onChange={e => setField('origen', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccione...</option>
                  <option value="DIAN">DIAN</option>
                  <option value="Anticipo">Anticipo</option>
                  <option value="Nota Credito">Nota Crédito</option>
                  <option value="Cuenta de Cobro">Cuenta de Cobro</option>
                  <option value="Acta">Acta</option>
                  <option value="Caja Menor">Caja Menor</option>
                  <option value="Davivienda">Davivienda</option>
                  <option value="Itau">Itaú</option>
                  <option value="Servicio Publico">Servicio Público</option>
                  <option value="Pico y placa">Pico y placa</option>
                  <option value="Viaticos">Viáticos</option>
                  <option value="Certificado de Donacion">Certificado de Donación</option>
                  <option value="Credito Vehiculo">Crédito Vehículo</option>
                  <option value="Legalizacion">Legalización</option>
                  <option value="Orden de Giro">Orden de Giro</option>
                  <option value="Iris">Iris</option>
                  <option value="Facturas del exterior">Facturas del exterior</option>
                </select>
              </div>

              {/* Proveedor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>NIT / RUT del proveedor *</label>
                  <input type="text" required value={form.nit} onChange={e => setField('nit', e.target.value)} placeholder="900.123.456-7" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Empresa emisora *</label>
                  <input type="text" required value={form.empresa} onChange={e => setField('empresa', e.target.value)} placeholder="Razón social" className={inputClass} />
                </div>
              </div>

              {/* Factura */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>N° de factura *</label>
                  <input type="text" required value={form.numeroFactura} onChange={e => setField('numeroFactura', e.target.value)} placeholder="FV-2024-001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de emisión *</label>
                  <input type="date" required value={form.fechaEmision} onChange={e => setField('fechaEmision', e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha de vencimiento</label>
                  <input type="date" value={form.fechaVencimiento} onChange={e => setField('fechaVencimiento', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CUFE</label>
                  <input type="text" value={form.cufe} onChange={e => setField('cufe', e.target.value)} placeholder="" className={inputClass} />
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Valor base *</label>
                  <input type="number" required min="0" step="0.01" value={form.valorBase} onChange={e => setField('valorBase', e.target.value)} placeholder="0.00" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>IVA</label>
                  <input type="number" min="0" step="0.01" value={form.iva} onChange={e => setField('iva', e.target.value)} placeholder="0.00" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Valor total *</label>
                  <input type="number" required min="0" step="0.01" value={form.valorTotal} onChange={e => setField('valorTotal', e.target.value)} placeholder="0.00" className={inputClass} />
                </div>
              </div>

              {/* ERP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Orden de compra</label>
                  <input type="text" value={form.ordenCompra} onChange={e => setField('ordenCompra', e.target.value)} placeholder="OC-001" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Entrada de servicio</label>
                  <input type="text" value={form.entradaServicio} onChange={e => setField('entradaServicio', e.target.value)} placeholder="ES-001" className={inputClass} />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className={labelClass}>Observaciones / Motivo de falla Bill-e</label>
                <textarea
                  rows={2}
                  value={form.observaciones}
                  onChange={e => setField('observaciones', e.target.value)}
                  placeholder="Detalles adicionales..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Error API */}
            {apiError && (
              <div className="mx-5 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                ⚠️ {apiError}
              </div>
            )}

            {file && !canSubmit && (
              <div className="mx-5 mb-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                Complete los campos obligatorios antes de confirmar.
              </div>
            )}

            {file && canSubmit && !confirmEnabled && (
              <div className="mx-5 mb-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                Los datos están completos. Presione <strong>Revisar y habilitar radicado</strong> para activar el botón Confirmar y Radicar.
              </div>
            )}

            {/* Botones */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-200 flex justify-end gap-3 bg-gray-50/40 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              {file && canSubmit && !confirmEnabled && (
                <button
                  type="button"
                  onClick={() => setConfirmEnabled(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                >
                  Revisar y habilitar radicado
                </button>
              )}
              {showSubmitButton && (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm"
                  style={{ background: '#e8394a' }}
                >
                  <CheckCircle size={17} />
                  {submitting ? 'Radicando…' : 'Confirmar y Radicar'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
