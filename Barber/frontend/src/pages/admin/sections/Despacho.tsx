import { useState } from 'react';
import { Package, MapPin, Phone, CheckCircle, Truck, Clock, ExternalLink } from 'lucide-react';

type OrderStatus = 'pending' | 'dispatched' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  client: string;
  phone: string;
  address: string;
  products: string[];
  total: number;
  status: OrderStatus;
  date: string;
  notes?: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: 'ORD-001', client: 'Juan Pérez',       phone: '+57 300 123 4567', address: 'Cra. 15 #80-23, Bogotá',    products: ['Pomada Matte 100g'],                              total: 35000, status: 'pending',    date: '2026-05-23 10:30' },
  { id: 'ORD-002', client: 'Carlos Rodríguez', phone: '+57 310 234 5678', address: 'Ak. 19 #127A-30, Bogotá',  products: ['Kit Barba Completo', 'Aceite Nutritivo'],          total: 95000, status: 'dispatched', date: '2026-05-23 09:00', notes: 'Dejar con portería' },
  { id: 'ORD-003', client: 'Miguel Torres',    phone: '+57 320 345 6789', address: 'Cl. 100 #15-20, Bogotá',   products: ['Cera Artesanal', 'Shampoo Premium'],               total: 58000, status: 'delivered',  date: '2026-05-22 15:00' },
  { id: 'ORD-004', client: 'Andrés Morales',   phone: '+57 315 456 7890', address: 'Cra. 7 #63-18, Bogotá',   products: ['Pomada Matte 100g'],                              total: 35000, status: 'pending',    date: '2026-05-23 11:15', notes: 'Llamar antes de enviar' },
  { id: 'ORD-005', client: 'Felipe Vargas',    phone: '+57 305 567 8901', address: 'Cl. 127 #7-49, Bogotá',   products: ['Kit Barba Completo'],                             total: 85000, status: 'pending',    date: '2026-05-23 12:00' },
  { id: 'ORD-006', client: 'Diego Suárez',     phone: '+57 312 678 9012', address: 'Cra. 11 #90-12, Bogotá',  products: ['Aftershave Premium', 'Aceite Nutritivo'],          total: 73000, status: 'delivered',  date: '2026-05-21 14:30' },
];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Pendiente',   color: 'var(--warning)', bg: 'rgba(212,146,14,0.10)', icon: Clock        },
  dispatched:{ label: 'Despachado',  color: 'var(--info)',    bg: 'rgba(59,130,246,0.10)', icon: Truck        },
  delivered: { label: 'Entregado',   color: 'var(--success)', bg: 'rgba(26,155,110,0.10)', icon: CheckCircle  },
  cancelled: { label: 'Cancelado',   color: 'var(--danger)',  bg: 'rgba(232,69,69,0.10)',  icon: Package      },
};

type Filter = 'all' | OrderStatus;

const TABS: { id: Filter; label: string }[] = [
  { id: 'all',        label: 'Todos'      },
  { id: 'pending',    label: 'Pendiente'  },
  { id: 'dispatched', label: 'Despachado' },
  { id: 'delivered',  label: 'Entregado'  },
];

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

export default function Despacho() {
  const [orders, setOrders]   = useState<Order[]>(INITIAL_ORDERS);
  const [filter, setFilter]   = useState<Filter>('all');

  const advance = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next: Record<OrderStatus, OrderStatus> = { pending: 'dispatched', dispatched: 'delivered', delivered: 'delivered', cancelled: 'cancelled' };
      return { ...o, status: next[o.status] };
    }));
  };

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts  = TABS.map(t => ({ ...t, count: t.id === 'all' ? orders.length : orders.filter(o => o.status === t.id).length }));
  const totalPending = orders.filter(o => o.status === 'pending').reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '14px' }}>
        {[
          { label: 'Pedidos pendientes', value: String(orders.filter(o => o.status === 'pending').length),    color: 'var(--warning)', glow: 'rgba(212,146,14,0.10)', icon: Clock       },
          { label: 'Por despachar',      value: String(orders.filter(o => o.status === 'dispatched').length), color: 'var(--info)',    glow: 'rgba(59,130,246,0.10)', icon: Truck       },
          { label: 'Entregados hoy',     value: String(orders.filter(o => o.status === 'delivered').length),  color: 'var(--success)', glow: 'rgba(26,155,110,0.10)', icon: CheckCircle },
          { label: 'Monto pendiente',    value: formatCOP(totalPending),                                      color: 'var(--accent-gold)', glow: 'var(--accent-gold-glow)', icon: Package },
        ].map(k => (
          <div key={k.label} className="glass-panel" style={{ padding: '18px', display: 'flex', gap: '12px', alignItems: 'center', borderLeft: `3px solid ${k.color}` }}>
            <div style={{ background: k.glow, color: k.color, padding: '10px', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
              <k.icon size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</p>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignSelf: 'flex-start', flexWrap: 'wrap' }}>
        {counts.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: filter === tab.id ? 'var(--bg-tertiary)' : 'transparent',
              color: filter === tab.id ? 'var(--accent-gold)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-header)',
              fontSize: '0.76rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            <span style={{
              background: filter === tab.id ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
              color: filter === tab.id ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-full)',
              padding: '1px 7px',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visible.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>No hay pedidos en esta categoría.</p>
          </div>
        ) : (
          visible.map(order => {
            const meta = STATUS_META[order.status];
            const StatusIcon = meta.icon;
            return (
              <div key={order.id} className="glass-panel" style={{ padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Left: ID + status */}
                <div style={{ minWidth: '90px' }}>
                  <p style={{ fontFamily: 'var(--font-header)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{order.id}</p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px',
                    padding: '3px 8px', borderRadius: 'var(--radius-full)',
                    background: meta.bg, color: meta.color,
                    border: `1px solid ${meta.color}44`,
                    fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-header)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    <StatusIcon size={10} /> {meta.label}
                  </span>
                </div>

                {/* Center: Client + products */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{order.client}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                    {order.products.map(p => (
                      <span key={p} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '2px 8px', color: 'var(--text-secondary)' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} /> {order.address}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> {order.phone}</span>
                  </div>
                  {order.notes && (
                    <p style={{ fontSize: '0.73rem', color: 'var(--accent-copper)', fontStyle: 'italic', marginTop: '6px' }}>
                      Nota: {order.notes}
                    </p>
                  )}
                </div>

                {/* Right: Price + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                  <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>{formatCOP(order.total)}</p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{order.date}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=Hola ${order.client}, su pedido de Rústico ya fue despachado.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)', background: 'transparent',
                        color: 'var(--text-secondary)', fontSize: '0.7rem',
                        fontFamily: 'var(--font-header)', fontWeight: 600,
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                        transition: 'border-color var(--transition-fast), color var(--transition-fast)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#25D366'; e.currentTarget.style.color = '#25D366'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <ExternalLink size={11} /> WA
                    </a>
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => advance(order.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--info)', background: 'rgba(59,130,246,0.08)',
                          color: 'var(--info)', cursor: 'pointer',
                          fontFamily: 'var(--font-header)', fontSize: '0.7rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.16)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
                      >
                        <Truck size={11} /> Despachar
                      </button>
                    )}
                    {order.status === 'dispatched' && (
                      <button
                        type="button"
                        onClick={() => advance(order.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--success)', background: 'rgba(26,155,110,0.08)',
                          color: 'var(--success)', cursor: 'pointer',
                          fontFamily: 'var(--font-header)', fontSize: '0.7rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '4px',
                          transition: 'background var(--transition-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,155,110,0.16)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(26,155,110,0.08)')}
                      >
                        <CheckCircle size={11} /> Entregado
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
