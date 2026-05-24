import React from 'react';
import { useBookingStore } from '../../store/booking.store';
import type { Service } from '../../store/booking.store';
import SelectService from '../booking/SelectService';
import SelectProfessional from '../booking/SelectProfessional';
import SelectDateTime from '../booking/SelectDateTime';
import Confirmation from '../booking/Confirmation';
import { Check, ArrowRight, Scissors, MapPin, Phone, Instagram } from 'lucide-react';
import './LandingPage.css';

const STEPS = [
  { step: 1, label: 'Servicio' },
  { step: 2, label: 'Barbero' },
  { step: 3, label: 'Fecha & Hora' },
  { step: 4, label: 'Confirmar' },
];

const MOCK_SERVICES: Record<string, Service> = {
  corte: { id: 'e1e11111-1111-1111-1111-111111111111', name: 'Corte de Cabello', description: 'Corte personalizado con lavado premium, masaje capilar y peinado con cera artesanal.', duration_min: 30, price_cop: 50000, category: 'Cabello' },
  barba: { id: 'e2e22222-2222-2222-2222-222222222222', name: 'Arreglo de Barba', description: 'Diseño de barba con toalla caliente, afeitado a navaja, hidratación y aceites nutritivos.', duration_min: 30, price_cop: 50000, category: 'Barba' },
  combo: { id: 'e3e33333-3333-3333-3333-333333333333', name: 'Corte + Barba', description: 'El combo completo: corte de cabello y arreglo de barba en una sola sesión.', duration_min: 60, price_cop: 100000, category: 'Combo' },
};

const BARBERS_DATA = [
  { id: 'd1d11111-1111-1111-1111-111111111111', name: 'Mateo Silva',  role: 'Senior Barber',   initials: 'MS', photoClass: 'lp-barber-photo--mateo'    },
  { id: 'd2d22222-2222-2222-2222-222222222222', name: 'Santiago Ruíz', role: 'Style Director', initials: 'SR', photoClass: 'lp-barber-photo--santiago' },
  { id: null,                                   name: 'Tu Elección',  role: 'Disponible',      initials: '✦', photoClass: 'lp-barber-photo--any'      },
];

interface Props {
  onAdminClick: () => void;
}

export default function LandingPage({ onAdminClick }: Props) {
  const currentStep  = useBookingStore((s) => s.currentStep);
  const selectService = useBookingStore((s) => s.selectService);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleService = (key: keyof typeof MOCK_SERVICES) => {
    selectService(MOCK_SERVICES[key]);
    setTimeout(() => scrollTo('reservar'), 80);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <SelectService />;
      case 2: return <SelectProfessional />;
      case 3: return <SelectDateTime />;
      case 4: return <Confirmation />;
      default: return <SelectService />;
    }
  };

  return (
    <div className="lp-root">

      {/* ════════════════════════════════════
          SECCIÓN 1: TOP GRID
          HERO (izquierda) | BARBEROS + SERVICIO (derecha)
          ════════════════════════════════════ */}
      <div className="lp-top-grid">

        {/* ── HERO ── */}
        <section className="lp-hero" id="inicio">
          <div className="lp-hero-bg" />

          {/* Barra social vertical */}
          <aside className="lp-hero-social">
            <span className="lp-hero-social-label">EXCLUSIVE</span>
            <a href="https://instagram.com/rusticobarbershop_official" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={13} /></a>
            <a href="tel:+573133930398" aria-label="Llamar"><Phone size={13} /></a>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo('contacto'); }} aria-label="Ubicación"><MapPin size={13} /></a>
          </aside>

          {/* Contenido principal del hero */}
          <div className="lp-hero-content">
            <p className="lp-hero-tagline">Corte clásico. Estilo propio.</p>
            <h1 className="lp-hero-headline">
              MÁS QUE UN CORTE,<br />ES UNA EXPERIENCIA.
            </h1>
            <p className="lp-hero-sub">
              Cortes modernos. Barba artesanal.<br />
              Experiencia premium para el hombre moderno.
            </p>
            <button type="button" className="lp-hero-cta" onClick={() => scrollTo('reservar')}>
              RESERVA TU TURNO <ArrowRight size={15} />
            </button>
          </div>

          {/* Contador slide */}
          <div className="lp-hero-counter">
            <span className="lp-counter-num">01</span>
            <div className="lp-counter-line" />
            <span className="lp-counter-num">03</span>
            <div className="lp-counter-btns">
              <button type="button" className="lp-counter-btn" aria-label="Anterior">‹</button>
              <button type="button" className="lp-counter-btn" aria-label="Siguiente">›</button>
            </div>
          </div>

          {/* Badge circular */}
          <div className="lp-hero-badge" aria-hidden="true">
            <Scissors size={13} />
            <span>RÚSTICO · BOGOTÁ</span>
          </div>
        </section>

        {/* ── PANEL DERECHO ── */}
        <div className="lp-right-stack">

          {/* BARBEROS (crema) */}
          <section className="lp-barbers-panel" id="barberos">
            <div className="lp-barbers-header">
              <p className="lp-eyebrow-dark">NUESTROS BARBEROS</p>
              <h2 className="lp-barbers-title">MAESTROS DEL<br />ESTILO MODERNO</h2>
              <p className="lp-barbers-sub">
                Manos expertas. Verdadera pasión.<br />
                Conoce a los artistas detrás de tu look.
              </p>
            </div>
            <div className="lp-barbers-grid">
              {BARBERS_DATA.map((b) => (
                <a
                  key={b.id ?? 'any'}
                  className="lp-barber-card"
                  href="#reservar"
                  onClick={(e) => { e.preventDefault(); scrollTo('reservar'); }}
                  title={`Reservar con ${b.name}`}
                >
                  <div className={`lp-barber-photo ${b.photoClass}`}>
                    <span className="lp-barber-initial">{b.initials}</span>
                    <div className="lp-barber-overlay">
                      <span className="lp-barber-name">{b.name}</span>
                      <span className="lp-barber-role">{b.role}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <span className="lp-letter-watermark" aria-hidden="true">B</span>
          </section>

          {/* SERVICIO CARD */}
          <section className="lp-service-card" id="servicios">
            <a
              className="lp-service-photo-link"
              href="#reservar"
              onClick={(e) => { e.preventDefault(); handleService('barba'); }}
              title="Reservar Arreglo de Barba"
            >
              <div className="lp-service-photo">
                <Scissors size={40} className="lp-service-icon" />
              </div>
            </a>
            <div className="lp-service-info">
              <h3 className="lp-service-title">ARREGLO<br />DE BARBA</h3>
              <p className="lp-service-desc">Toalla caliente, navaja artesanal y aceites premium.</p>
              <a
                className="lp-service-cta"
                href="#reservar"
                onClick={(e) => { e.preventDefault(); handleService('barba'); }}
              >
                RESERVAR <ArrowRight size={12} />
              </a>
            </div>
          </section>

        </div>
      </div>

      {/* ════════════════════════════════════
          SECCIÓN 2: BOOKING (ancho completo, oscuro)
          ════════════════════════════════════ */}
      <section className="lp-booking" id="reservar">
        <div className="app-container lp-booking-inner">
          <div className="lp-booking-header">
            <p className="lp-eyebrow-light">AGENDA</p>
            <h2 className="lp-booking-title">
              RESERVA TU <span className="gold-gradient-text">TURNO</span>
            </h2>
          </div>

          {/* Step tracker */}
          <div className="step-tracker">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className={`step-item${currentStep === s.step ? ' step-item--active' : ''}${currentStep > s.step ? ' step-item--done' : ''}`}>
                  <div className="step-bubble">
                    {currentStep > s.step ? <Check size={13} strokeWidth={3} /> : s.step}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`step-line${currentStep > s.step ? ' step-line--done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="booking-step-content">
            {renderStep()}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          SECCIÓN 3: SERVICIOS (crema, ancho completo)
          ════════════════════════════════════ */}
      <section className="lp-services-row">
        <div className="app-container lp-services-inner">
          <div className="lp-services-left">
            <p className="lp-eyebrow-dark">NUESTROS SERVICIOS</p>
            <h2 className="lp-services-title">LO QUE<br />HACEMOS MEJOR</h2>
          </div>
          <div className="lp-services-cards">
            {([
              { key: 'corte', label: 'Corte de Cabello', price: '$50.000', desc: 'Corte personalizado con lavado y peinado artesanal.' },
              { key: 'barba', label: 'Arreglo de Barba', price: '$50.000', desc: 'Navaja, toalla caliente y aceites premium.' },
              { key: 'combo', label: 'Corte + Barba', price: '$100.000', desc: 'El combo completo en una sola sesión.' },
            ] as const).map((svc) => (
              <a
                key={svc.key}
                className="lp-svc-card"
                href="#reservar"
                onClick={(e) => { e.preventDefault(); handleService(svc.key); }}
              >
                <div className="lp-svc-card-photo">
                  <Scissors size={28} className="lp-svc-card-icon" />
                </div>
                <div className="lp-svc-card-body">
                  <h3 className="lp-svc-card-name">{svc.label}</h3>
                  <p className="lp-svc-card-desc">{svc.desc}</p>
                  <span className="lp-svc-card-price">{svc.price}</span>
                </div>
                <span className="lp-svc-card-link">RESERVAR <ArrowRight size={11} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          SECCIÓN 4: BOTTOM GRID
          ABOUT (izquierda crema) | PROMO (derecha oscura)
          ════════════════════════════════════ */}
      <div className="lp-bottom-grid">

        {/* ABOUT (crema) */}
        <section className="lp-about" id="nosotros">
          <span className="lp-scissors-bg" aria-hidden="true">✂</span>
          <div className="lp-about-text">
            <p className="lp-eyebrow-dark">NOSOTROS</p>
            <h2 className="lp-about-title">HECHO PARA<br />LA CONFIANZA</h2>
            <p className="lp-about-body">
              Mezclamos tradición con tendencia para ofrecer más que un servicio
              — ofrecemos confianza y estilo propio. Desde 2018, somos el punto
              de encuentro del hombre moderno en Bogotá.
            </p>
            <a
              className="lp-about-btn"
              href="#reservar"
              onClick={(e) => { e.preventDefault(); scrollTo('reservar'); }}
            >
              RESERVA AHORA
            </a>
          </div>
          <a
            className="lp-about-photo-link"
            href="#reservar"
            onClick={(e) => { e.preventDefault(); scrollTo('reservar'); }}
            title="Ver agenda"
          >
            <div className="lp-about-photo">
              <img src="/rustico-hero.jpeg" alt="Interior Rústico Barbershop" className="lp-about-img" />
            </div>
          </a>
          <span className="lp-est-watermark" aria-hidden="true">EST. 2018</span>
        </section>

        {/* PROMO (oscura) */}
        <section className="lp-promo">
          <div className="lp-promo-bg" />
          <div className="lp-promo-content">
            <p className="lp-promo-eyebrow">DESCUENTO ESPECIAL</p>
            <p className="lp-promo-title">PRIMER<br />CORTE</p>
            <p className="lp-promo-percent">20% OFF</p>
            <p className="lp-promo-sub">
              Muéstranos este aviso y obtén tu descuento en el primer servicio.
            </p>
            <p className="lp-promo-days">LUNES – JUEVES</p>
            <a
              className="lp-promo-cta"
              href="#reservar"
              onClick={(e) => { e.preventDefault(); scrollTo('reservar'); }}
            >
              APROVECHAR <ArrowRight size={12} />
            </a>
          </div>
          <span className="lp-promo-letter" aria-hidden="true">C</span>
        </section>

      </div>

      {/* ════════════════════════════════════
          BANDA DE CONTACTO
          ════════════════════════════════════ */}
      <section className="lp-contact" id="contacto">
        <div className="app-container lp-contact-inner">
          <div className="lp-contact-item">
            <MapPin size={15} className="lp-contact-icon" />
            <span>Cra. 13 #78-17, Bogotá</span>
          </div>
          <div className="lp-contact-div" />
          <div className="lp-contact-item">
            <Phone size={15} className="lp-contact-icon" />
            <a href="tel:+573133930398">+57 313 3930398</a>
          </div>
          <div className="lp-contact-div" />
          <div className="lp-contact-item">
            <Instagram size={15} className="lp-contact-icon" />
            <a href="https://instagram.com/rusticobarbershop_official" target="_blank" rel="noopener noreferrer">
              @rusticobarbershop_official
            </a>
          </div>
        </div>
      </section>

      {/* ── Acceso admin (oculto al público) ── */}
      <div className="lp-admin-access">
        <button type="button" className="lp-admin-link" onClick={onAdminClick}>
          Panel Admin
        </button>
      </div>

    </div>
  );
}
