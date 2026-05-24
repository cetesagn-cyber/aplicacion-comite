import { useState } from 'react';
import { Search, Phone, Mail, Calendar, Scissors, Star, Plus, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  visits: number;
  lastService: string;
  notes: string;
  barber?: string;
}

const CLIENTS: Client[] = [
  { id: '1', name: 'Juan Pérez',        phone: '+57 300 123 4567', email: 'juan.perez@gmail.com',       lastVisit: '2026-05-20', visits: 8,  lastService: 'Corte de Cabello', notes: 'Prefiere corte clásico con fade bajo.',        barber: 'Mateo'    },
  { id: '2', name: 'Carlos Rodríguez',  phone: '+57 310 234 5678', email: 'carlos.rod@hotmail.com',     lastVisit: '2026-05-15', visits: 12, lastService: 'Corte + Barba',    notes: 'Cliente VIP. Paga en efectivo.',               barber: 'Mateo'    },
  { id: '3', name: 'Miguel Torres',     phone: '+57 320 345 6789', email: '',                            lastVisit: '2026-05-10', visits: 5,  lastService: 'Arreglo de Barba', notes: '',                                             barber: 'Santiago' },
  { id: '4', name: 'Andrés Morales',    phone: '+57 315 456 7890', email: 'andres.m@gmail.com',         lastVisit: '2026-05-23', visits: 3,  lastService: 'Corte de Cabello', notes: 'Nuevo cliente. 20% OFF primera visita.',       barber: 'Santiago' },
  { id: '5', name: 'Felipe Vargas',     phone: '+57 305 567 8901', email: 'felipevargas@gmail.com',     lastVisit: '2026-05-18', visits: 20, lastService: 'Corte + Barba',    notes: 'VIP — siempre puntual, prefiere 11:00.',      barber: 'Mateo'    },
  { id: '6', name: 'Diego Suárez',      phone: '+57 312 678 9012', email: 'diego.suarez@outlook.com',   lastVisit: '2026-05-12', visits: 7,  lastService: 'Arreglo de Barba', notes: '',                                             barber: 'Santiago' },
  { id: '7', name: 'Sebastián Castro',  phone: '+57 301 789 0123', email: '',                            lastVisit: '2026-04-28', visits: 2,  lastService: 'Corte de Cabello', notes: '',                                             barber: 'Mateo'    },
  { id: '8', name: 'Alejandro Gómez',   phone: '+57 318 890 1234', email: 'alejandro.g@gmail.com',      lastVisit: '2026-05-05', visits: 15, lastService: 'Corte + Barba',    notes: 'Desde 2022. Siempre con Mateo.',              barber: 'Mateo'    },
  { id: '9', name: 'Camilo Herrera',    phone: '+57 316 901 2345', email: 'camiloh@gmail.com',          lastVisit: '2026-05-19', visits: 9,  lastService: 'Corte de Cabello', notes: 'Estudiante. Aplica descuento 10%.',            barber: 'Santiago' },
  { id:'10', name: 'Nicolás Reyes',     phone: '+57 311 012 3456', email: 'n.reyes@empresa.co',         lastVisit: '2026-05-22', visits: 11, lastService: 'Corte + Barba',    notes: 'Ejecutivo. Prefiere cita en horas del almuerzo.', barber: 'Mateo' },
];

const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  'linear-gradient(135deg, #1f3515, #3a6025)',
  'linear-gradient(135deg, #162810, #2a4a18)',
  'linear-gradient(135deg, #1a2a10, #344a20)',
  'linear-gradient(135deg, #1e3818, #38601e)',
];

const daysSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7)  return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  return `hace ${Math.floor(days / 30)} mes`;
};

export default function Libreta() {
  const [query, setQuery]       = useState('');
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  );

  const vipCount     = CLIENTS.filter(c => c.visits >= 10).length;
  const activeMonth  = CLIENTS.filter(c => {
    const diff = Date.now() - new Date(c.lastVisit).getTime();
    return diff < 30 * 86400000;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '12px' }}>
        {[
          { label: 'Total clientes',  value: String(CLIENTS.length), color: 'var(--accent-gold)',    glow: 'var(--accent-gold-glow)'   },
          { label: 'Activos este mes', value: String(activeMonth),    color: 'var(--success)',        glow: 'rgba(26,155,110,0.10)'     },
          { label: 'Clientes VIP',    value: String(vipCount),        color: 'var(--accent-copper)',  glow: 'var(--accent-copper-glow)' },
          { label: 'Promedio visitas', value: (CLIENTS.reduce((s,c)=>s+c.visits,0)/CLIENTS.length).toFixed(1), color: 'var(--info)', glow: 'rgba(59,130,246,0.10)' },
        ].map(k => (
          <div key={k.label} className="glass-panel" style={{ padding: '16px 18px', borderLeft: `3px solid ${k.color}` }}>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color, marginTop: '2px', fontFamily: 'var(--font-header)' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Search + add */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '10px 12px 10px 36px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-copper)')}
            onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ padding: '10px 16px', gap: '6px' }}
        >
          <Plus size={14} /> Nuevo Cliente
        </button>
      </div>

      {/* Client grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '14px' }}>
        {filtered.map((c, i) => (
          <div
            key={c.id}
            className="glass-panel"
            style={{ padding: '20px', cursor: 'pointer', transition: 'border-color var(--transition-fast), transform var(--transition-fast)', borderColor: selected?.id === c.id ? 'var(--accent-copper)' : undefined }}
            onClick={() => setSelected(selected?.id === c.id ? null : c)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = selected?.id === c.id ? 'var(--accent-copper)' : 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-header)', fontSize: '0.8rem', fontWeight: 800,
                color: 'var(--accent-gold)', flexShrink: 0,
                border: '1px solid rgba(201,168,76,0.2)',
              }}>
                {initials(c.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</p>
                  {c.visits >= 10 && (
                    <span style={{ flexShrink: 0, fontSize: '0.62rem', fontFamily: 'var(--font-header)', fontWeight: 700, color: 'var(--accent-gold)', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 'var(--radius-full)', padding: '1px 7px' }}>
                      VIP
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={11} /> {c.phone}
                </p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <Scissors size={10} /> {c.lastService}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <Calendar size={10} /> {daysSince(c.lastVisit)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-copper)' }}>
                    <Star size={10} /> {c.visits} visitas
                  </span>
                </div>

                {/* Expanded */}
                {selected?.id === c.id && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {c.email && (
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={11} /> {c.email}
                      </p>
                    )}
                    {c.barber && (
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        Barbero preferido: <strong style={{ color: 'var(--text-primary)' }}>{c.barber}</strong>
                      </p>
                    )}
                    {c.notes && (
                      <p style={{ fontSize: '0.76rem', color: 'var(--accent-copper)', fontStyle: 'italic' }}>
                        "{c.notes}"
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '7px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g,'')}?text=Hola ${c.name.split(' ')[0]}, te recordamos tu cita en Rústico Barbershop.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #25D36644', background: 'rgba(37,211,102,0.06)', color: '#25D366', fontSize: '0.7rem', fontFamily: 'var(--font-header)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Phone size={10} /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <X size={28} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p>No se encontraron clientes para "{query}".</p>
        </div>
      )}

    </div>
  );
}
