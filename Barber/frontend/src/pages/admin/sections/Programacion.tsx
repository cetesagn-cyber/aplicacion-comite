import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, X, Clock } from 'lucide-react';
import { ApiClient } from '../../../services/api.client';
import './Programacion.css';

const SLOT_H    = 52;           // px por bloque de 30 min
const OPEN_H    = 9;
const CLOSE_H   = 19;
const N_SLOTS   = (CLOSE_H - OPEN_H) * 2;  // 20 bloques

const SLOTS = Array.from({ length: N_SLOTS }, (_, i) => {
  const totalMin = OPEN_H * 60 + i * 30;
  const h = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const m = String(totalMin % 60).padStart(2, '0');
  return { totalMin, label: `${h}:${m}`, isHour: totalMin % 60 === 0 };
});

const BARBERS = [
  { id: 'd1d11111-1111-1111-1111-111111111111', name: 'Mateo Silva',    role: 'Senior Barber',   initials: 'MS' },
  { id: 'd2d22222-2222-2222-2222-222222222222', name: 'Santiago Ruíz', role: 'Style Director',   initials: 'SR' },
];

interface Booking {
  id: string;
  start_at: string;
  end_at: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  service_name: string;
  client_name: string;
  client_phone: string;
  price_cop: number;
  professional_id: string;
  duration_min: number;
  notes: string | null;
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending:     { label: 'Pendiente',  bg: 'rgba(212,146,14,0.10)',  text: '#d4920e', border: 'rgba(212,146,14,0.30)'  },
  confirmed:   { label: 'Confirmado', bg: 'rgba(201,168,76,0.10)',  text: '#c9a84c', border: 'rgba(201,168,76,0.30)'  },
  in_progress: { label: 'En curso',   bg: 'rgba(26,155,110,0.12)',  text: '#1aab78', border: 'rgba(26,155,110,0.30)'  },
  completed:   { label: 'Completado', bg: 'rgba(60,80,64,0.15)',    text: '#8a9e7a', border: 'rgba(60,80,64,0.30)'    },
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const toMin = (iso: string) => {
  const [h, m] = (iso.split('T')[1] ?? '').split(':').map(Number);
  return h * 60 + m;
};

export default function Programacion() {
  const [date, setDate]         = useState(() => new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const load = async (d: string) => {
    setLoading(true);
    try {
      const data = await ApiClient.getAdminAgenda('c1c11111-1111-1111-1111-111111111111', d);
      setBookings(data.bookings ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(date); }, [date]);

  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'no_show');
  const totalRevenue   = activeBookings.reduce((s, b) => s + b.price_cop, 0);
  const blocksUsed     = activeBookings.reduce((s, b) => s + Math.ceil(b.duration_min / 30), 0);
  const totalFree      = BARBERS.length * N_SLOTS - blocksUsed;

  const renderBarberCol = (barber: typeof BARBERS[0]) => {
    const cells: React.ReactNode[] = [];
    let si = 0;

    while (si < SLOTS.length) {
      const slot = SLOTS[si];
      const bk = activeBookings.find(
        b => b.professional_id === barber.id && toMin(b.start_at) === slot.totalMin
      );

      if (bk) {
        const span = Math.max(1, Math.ceil(bk.duration_min / 30));
        const meta = STATUS_META[bk.status] ?? STATUS_META.pending;
        cells.push(
          <div
            key={`bk-${bk.id}`}
            className="prog-booking-cell"
            style={{
              height: `${span * SLOT_H - 1}px`,
              background: meta.bg,
              borderLeft: `3px solid ${meta.text}`,
              borderColor: meta.border,
            }}
            onClick={() => setSelected(bk)}
          >
            <p className="prog-bk-service">{bk.service_name}</p>
            <p className="prog-bk-client">{bk.client_name}</p>
            <div className="prog-bk-footer">
              <span className="prog-bk-time"><Clock size={10} /> {slot.label}</span>
              <span className="prog-bk-status" style={{ color: meta.text }}>{meta.label}</span>
            </div>
          </div>
        );
        si += span;
      } else {
        cells.push(
          <div key={`free-${barber.id}-${slot.totalMin}`} className={`prog-free-cell${slot.isHour ? ' prog-free-cell--hour' : ''}`}>
            <button type="button" className="prog-add-btn" aria-label="Agregar reserva">
              <Plus size={11} />
            </button>
          </div>
        );
        si++;
      }
    }
    return cells;
  };

  return (
    <div className="prog-root">

      {/* Controls */}
      <div className="prog-controls">
        <div className="prog-date-group">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="prog-date-input"
          />
          <button type="button" className="prog-refresh-btn" onClick={() => load(date)} disabled={loading} aria-label="Actualizar">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="prog-metrics">
          <span className="prog-metric">
            <span className="prog-metric-val">{activeBookings.length}</span> reservas
          </span>
          <span className="prog-metric-sep" />
          <span className="prog-metric">
            <span className="prog-metric-val">{totalFree}</span> slots libres
          </span>
          <span className="prog-metric-sep" />
          <span className="prog-metric">
            <span className="prog-metric-val">{formatCOP(totalRevenue)}</span> proyectado
          </span>
        </div>
      </div>

      {/* Status legend */}
      <div className="prog-legend">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <span key={key} className="prog-legend-item">
            <span className="prog-legend-dot" style={{ background: meta.text }} />
            {meta.label}
          </span>
        ))}
        <span className="prog-legend-item">
          <span className="prog-legend-dot prog-legend-dot--free" />
          Disponible
        </span>
      </div>

      {/* Grid container */}
      <div className="prog-grid-container">

        {/* Headers */}
        <div className="prog-header-row">
          <div className="prog-time-header" />
          {BARBERS.map(b => (
            <div key={b.id} className="prog-barber-header">
              <div className="prog-barber-avatar">{b.initials}</div>
              <div>
                <p className="prog-barber-name">{b.name}</p>
                <p className="prog-barber-role">{b.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="prog-grid-body">
          {/* Time column */}
          <div className="prog-time-col">
            {SLOTS.map(slot => (
              <div key={slot.totalMin} className={`prog-time-label${slot.isHour ? ' prog-time-label--hour' : ''}`}>
                {slot.isHour ? slot.label : <span className="prog-time-dot">·</span>}
              </div>
            ))}
          </div>

          {/* Barber columns */}
          {BARBERS.map(barber => (
            <div key={barber.id} className="prog-barber-col">
              {renderBarberCol(barber)}
            </div>
          ))}
        </div>

      </div>

      {/* Detail modal */}
      {selected && (
        <div className="prog-overlay" onClick={() => setSelected(null)}>
          <div className="prog-detail" onClick={e => e.stopPropagation()}>
            <div className="prog-detail-head">
              <div>
                <h3 className="prog-detail-service">{selected.service_name}</h3>
                <p className="prog-detail-barber">{BARBERS.find(b => b.id === selected.professional_id)?.name}</p>
              </div>
              <button type="button" className="prog-close-btn" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="prog-detail-body">
              {[
                { label: 'Cliente',   value: selected.client_name },
                { label: 'Teléfono', value: selected.client_phone },
                { label: 'Hora',     value: `${(selected.start_at.split('T')[1] ?? '').slice(0, 5)} — ${(selected.end_at.split('T')[1] ?? '').slice(0, 5)}` },
                { label: 'Duración', value: `${selected.duration_min} min` },
                { label: 'Precio',   value: formatCOP(selected.price_cop), gold: true },
                { label: 'Estado',   value: STATUS_META[selected.status]?.label ?? selected.status, statusColor: STATUS_META[selected.status]?.text },
              ].map(row => (
                <div key={row.label} className="prog-detail-row">
                  <span>{row.label}</span>
                  <strong style={{ color: row.gold ? 'var(--accent-gold)' : row.statusColor ?? '#fff' }}>
                    {row.value}
                  </strong>
                </div>
              ))}
              {selected.notes && (
                <p className="prog-detail-notes">"{selected.notes}"</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
