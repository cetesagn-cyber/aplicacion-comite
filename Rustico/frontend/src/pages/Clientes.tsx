import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

interface Cliente {
  id: string; nombre: string; telefono: string; email: string;
  segmento: string; total_visitas: number; ticket_promedio: number; ultimo_servicio: string;
}
interface Historial {
  id: string; inicio: string; estado: string; precio_cop: number;
  servicio: string; barbero: string;
}

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
}
function formatFecha(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Bogota' });
}

export default function Clientes() {
  const [clientes, setClientes]     = useState<Cliente[]>([]);
  const [total, setTotal]           = useState(0);
  const [pagina, setPagina]         = useState(1);
  const [totalPag, setTotalPag]     = useState(1);
  const [busqueda, setBusqueda]     = useState('');
  const [cargando, setCargando]     = useState(true);
  const [detalle, setDetalle]       = useState<Cliente | null>(null);
  const [historial, setHistorial]   = useState<Historial[]>([]);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState({ nombre: '', telefono: '', email: '', notas_privadas: '' });
  const [guardando, setGuardando]   = useState(false);
  const [errorForm, setErrorForm]   = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    const data = await api.get<{ clientes: Cliente[]; total: number; totalPaginas: number }>(
      `/clientes?page=${pagina}&q=${encodeURIComponent(busqueda)}&limite=15`
    );
    setClientes(data.clientes);
    setTotal(data.total);
    setTotalPag(data.totalPaginas);
    setCargando(false);
  }, [pagina, busqueda]);

  useEffect(() => { cargar(); }, [cargar]);

  const verDetalle = async (c: Cliente) => {
    setDetalle(c);
    const h = await api.get<Historial[]>(`/clientes/${c.id}/historial`);
    setHistorial(h);
  };

  const crearCliente = async () => {
    if (!form.nombre) { setErrorForm('El nombre es requerido.'); return; }
    setGuardando(true);
    setErrorForm('');
    try {
      await api.post('/clientes', form);
      setModal(false);
      setForm({ nombre: '', telefono: '', email: '', notas_privadas: '' });
      cargar();
    } catch (err: any) { setErrorForm(err.message); }
    finally { setGuardando(false); }
  };

  const SEGMENTO_LABEL: Record<string, string> = { vip: 'VIP', frecuente: 'Frecuente', nuevo: 'Nuevo', en_riesgo: 'En riesgo', inactivo: 'Inactivo' };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--blanco)' }}>Clientes</h1>
          <p style={{ color: 'var(--texto-suave)', marginTop: 4 }}>{total} clientes registrados</p>
        </div>
        <button
          onClick={() => { setModal(true); setErrorForm(''); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--verde)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'var(--blanco)', fontWeight: 600, fontSize: 14 }}
        >
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-suave)' }} />
        <input
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          placeholder="Buscar por nombre, teléfono o correo…"
          style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 8, color: 'var(--texto)', fontSize: 14 }}
        />
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--borde)' }}>
              {['Nombre', 'Teléfono', 'Segmento', 'Visitas', 'Ticket promedio', 'Último servicio'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: 'var(--texto-suave)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--texto-suave)' }}>Cargando…</td></tr>
            ) : clientes.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--texto-suave)' }}>Sin resultados.</td></tr>
            ) : clientes.map(c => (
              <tr
                key={c.id}
                onClick={() => verDetalle(c)}
                style={{ borderBottom: '1px solid var(--borde)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--superficie2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--texto)' }}>{c.nombre}</td>
                <td style={{ padding: '12px 16px', color: 'var(--texto-suave)' }}>{c.telefono || '—'}</td>
                <td style={{ padding: '12px 16px' }}><span className={`badge badge-${c.segmento}`}>{SEGMENTO_LABEL[c.segmento] || c.segmento}</span></td>
                <td style={{ padding: '12px 16px', color: 'var(--texto-suave)' }}>{c.total_visitas}</td>
                <td style={{ padding: '12px 16px', color: 'var(--texto-suave)' }}>{c.ticket_promedio > 0 ? formatCOP(c.ticket_promedio) : '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--texto-suave)' }}>{formatFecha(c.ultimo_servicio)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPag > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--borde)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} style={{ background: 'none', border: '1px solid var(--borde)', borderRadius: 6, padding: '4px 8px', color: 'var(--texto-suave)', cursor: 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>Página {pagina} de {totalPag}</span>
            <button onClick={() => setPagina(p => Math.min(totalPag, p + 1))} disabled={pagina === totalPag} style={{ background: 'none', border: '1px solid var(--borde)', borderRadius: 6, padding: '4px 8px', color: 'var(--texto-suave)', cursor: 'pointer' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Panel detalle cliente */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
          <div style={{ width: 420, background: 'var(--superficie)', borderLeft: '1px solid var(--borde)', overflow: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blanco)' }}>{detalle.nombre}</h2>
              <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none', color: 'var(--texto-suave)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              <span className={`badge badge-${detalle.segmento}`}>{SEGMENTO_LABEL[detalle.segmento]}</span>
              <span style={{ fontSize: 12, color: 'var(--texto-suave)', background: 'var(--superficie2)', padding: '3px 10px', borderRadius: 99 }}>{detalle.total_visitas} visitas</span>
            </div>

            {[
              { l: 'Teléfono', v: detalle.telefono || '—' },
              { l: 'Correo', v: detalle.email || '—' },
              { l: 'Ticket promedio', v: detalle.ticket_promedio > 0 ? formatCOP(detalle.ticket_promedio) : '—' },
              { l: 'Último servicio', v: formatFecha(detalle.ultimo_servicio) },
            ].map(({ l, v }) => (
              <div key={l} style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--superficie2)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--texto-suave)', marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 14, color: 'var(--texto)' }}>{v}</div>
              </div>
            ))}

            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--blanco)', margin: '20px 0 12px' }}>Historial de servicios</h3>
            {historial.length === 0 ? (
              <p style={{ color: 'var(--texto-suave)', fontSize: 13 }}>Sin historial.</p>
            ) : historial.map(h => (
              <div key={h.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--borde)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--texto)' }}>{h.servicio}</span>
                  <span className={`badge badge-${h.estado}`}>{h.estado}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
                  {formatFecha(h.inicio)} · {h.barbero} · {formatCOP(h.precio_cop)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal nuevo cliente */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--superficie)', border: '1px solid var(--borde)', borderRadius: 12, width: '100%', maxWidth: 400, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--blanco)' }}>Nuevo cliente</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--texto-suave)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {[
              { label: 'NOMBRE *', key: 'nombre', type: 'text' },
              { label: 'TELÉFONO', key: 'telefono', type: 'tel' },
              { label: 'CORREO', key: 'email', type: 'email' },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--texto-suave)', marginBottom: 5 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--superficie2)', border: '1px solid var(--borde)', borderRadius: 8, color: 'var(--texto)', fontSize: 14 }} />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--texto-suave)', marginBottom: 5 }}>NOTAS PRIVADAS</label>
              <textarea value={form.notas_privadas} onChange={e => setForm(f => ({ ...f, notas_privadas: e.target.value }))} rows={2}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--superficie2)', border: '1px solid var(--borde)', borderRadius: 8, color: 'var(--texto)', fontSize: 14, resize: 'vertical' }} />
            </div>

            {errorForm && <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 14, background: '#2e1a1a', border: '1px solid #5a2020', color: 'var(--error)', fontSize: 13 }}>{errorForm}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid var(--borde)', background: 'transparent', color: 'var(--texto-suave)', fontSize: 14 }}>Cancelar</button>
              <button onClick={crearCliente} disabled={guardando} style={{ flex: 2, padding: 10, borderRadius: 8, border: 'none', background: 'var(--verde)', color: 'var(--blanco)', fontSize: 14, fontWeight: 600 }}>
                {guardando ? 'Guardando…' : 'Crear cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
