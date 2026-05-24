<div align="center">

<br/>

<img src="frontend/public/logo-rustico.png" alt="Rústico Barber & Concept Shop" width="170" />

<br/><br/>

# RÚSTICO BARBER & CONCEPT SHOP

**Plataforma digital · Bogotá, Colombia · Est. 2018**

[![React](https://img.shields.io/badge/React_18-SPA-c9a84c?style=flat-square&labelColor=111e11&color=c9a84c)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-c9a84c?style=flat-square&labelColor=111e11&color=c9a84c)](#)
[![Vite](https://img.shields.io/badge/Vite-5-c9a84c?style=flat-square&labelColor=111e11&color=c9a84c)](#)
[![Zustand](https://img.shields.io/badge/Zustand-estado_global-c9a84c?style=flat-square&labelColor=111e11&color=c9a84c)](#)
[![Estado](https://img.shields.io/badge/estado-en_producción-1aab78?style=flat-square&labelColor=111e11&color=1aab78)](#)

<br/>

*Corte clásico. Estilo propio.*

</div>

<br/>

---

## ◆ &nbsp;Descripción

Aplicación web premium para **Rústico Barber & Concept Shop**, la barbería de referencia en Bogotá. Unifica en una sola plataforma la experiencia del cliente y la operación interna del negocio:

- **Landing page editorial** fiel al branding de la barbería — reserva en 4 pasos integrados
- **Panel de administración** completo con agenda interactiva, despacho de tienda, finanzas y directorio de clientes
- **Tienda online** de productos de grooming con carrito persistente
- **Mock API inteligente** — funciona sin backend; fallback automático para demos y desarrollo

> *"Mezclamos tradición con tendencia para ofrecer más que un servicio: confianza y estilo propio."*

---

## ◆ &nbsp;Vista General del Sistema

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                 RÚSTICO — Plataforma Digital                    │
  ├──────────────────────────────┬──────────────────────────────────┤
  │       LANDING PÚBLICA        │       PANEL ADMINISTRATIVO        │
  │                              │                                  │
  │  ┌─ Hero ──────────────────┐ │  ┌─ Programación ─────────────┐ │
  │  │  Bebas Neue · CTA       │ │  │  Grilla 09:00–19:00        │ │
  │  │  Barra social · Badge   │ │  │  2 barberos · 30-min bloques│ │
  │  └─────────────────────────┘ │  └────────────────────────────┘ │
  │  ┌─ Barberos ──────────────┐ │  ┌─ Despacho ─────────────────┐ │
  │  │  Cards clicables        │ │  │  Órdenes de tienda         │ │
  │  │  Mateo · Santiago · Any │ │  │  Pendiente→Despachado→OK   │ │
  │  └─────────────────────────┘ │  └────────────────────────────┘ │
  │  ┌─ Booking (4 pasos) ─────┐ │  ┌─ Financiera ───────────────┐ │
  │  │  Servicio               │ │  │  Ingresos · Cierre · Stats  │ │
  │  │  Barbero                │ │  └────────────────────────────┘ │
  │  │  Fecha & Hora           │ │  ┌─ Libreta ──────────────────┐ │
  │  │  Confirmación           │ │  │  CRM · búsqueda · VIP      │ │
  │  └─────────────────────────┘ │  └────────────────────────────┘ │
  │  ┌─ Servicios · About      │ │                                  │
  │  │  Promo 20% · Contacto   │ │  ←  Acceso: "Panel Admin"     │ │
  │  └─────────────────────────┘ │      al pie de la landing       │
  └──────────────────────────────┴──────────────────────────────────┘
                    + Tienda Online (carrito Zustand)
```

---

## ◆ &nbsp;Módulos

### 🌐 &nbsp;Landing Page Pública

| Sección | Descripción |
|---|---|
| **Hero** | Titular Bebas Neue, CTA "RESERVA TU TURNO", barra social vertical, badge circular Rústico · Bogotá |
| **Barberos** | Panel crema — cards clicables de Mateo Silva, Santiago Ruíz y "Tu Elección" |
| **Booking Flow** | Flujo completo de 4 pasos con step tracker animado |
| **Servicios** | Corte · Barba · Combo con hipervínculo directo al formulario de reserva |
| **Nosotros** | Historia de marca, foto interior de la barbería, EST. 2018 |
| **Promo** | 20% OFF primer corte — Lunes a Jueves |
| **Contacto** | Dirección, teléfono y @rusticobarbershop\_official |

### 🛠️ &nbsp;Panel de Administración

| Sección | Contenido |
|---|---|
| **Programación** | Grilla visual hora a hora por barbero · bloques coloreados por estado · modal de detalle al clic · botón "+" en slots libres |
| **Despacho** | Lista de órdenes de tienda con filtros · avance de estado · link WhatsApp al cliente |
| **Financiera** | Sub-tabs: **Ingresos del Día** (tabla + KPIs) · **Cierre Diario** (gastos + neto) · **Estadísticas** (barras semanales) |
| **Libreta** | Directorio de clientes con búsqueda · badge VIP · historial · expandir tarjeta |

### 🛒 &nbsp;Tienda Online

Catálogo de productos de grooming — pomadas, kits de barba, aceites, aftershave. Carrito flotante persistente con Zustand, selección de variantes y flujo de checkout.

---

## ◆ &nbsp;Stack Tecnológico

```
Frontend
├── React 18 + TypeScript 5   — UI tipada con hooks y componentes funcionales
├── Vite 5                    — Build ultrarrápido con HMR
├── Zustand                   — Estado global (booking store + cart store)
├── Lucide React              — Iconografía ligera y consistente
└── CSS puro                  — Design system custom; sin UI frameworks

Backend
├── Node.js + Express         — API REST (en desarrollo activo)
├── PostgreSQL 15             — Base de datos relacional
└── Mock API Client           — Fallback automático con datos realistas

Tipografía (Google Fonts)
├── Bebas Neue                — Headlines editoriales
├── Playfair Display          — Display serif / taglines
├── Outfit                    — UI, navegación, labels
└── Inter                     — Cuerpo de texto

Paleta de diseño — Estilo Editorial Rústico
│
├──  #0d1a0d  ▓  Verde bosque oscuro   — fondo primario
├──  #111e11  ▓  Verde secundario      — fondo navbar / sidebar
├──  #f0e6d2  ░  Crema cálida          — secciones claras
├──  #c9a84c  ▒  Cobre / Oro           — acento primario
└──  #e8c968  ░  Oro claro             — highlights y gradientes
```

---

## ◆ &nbsp;Estructura del Proyecto

```
Barber/
│
├── frontend/                         # SPA React + Vite
│   ├── public/
│   │   ├── logo-rustico.png          # Logo oficial (navaja integrada en la "R")
│   │   └── rustico-hero.jpeg         # Fotografía interior de la barbería
│   │
│   └── src/
│       ├── pages/
│       │   ├── landing/              # Landing pública
│       │   │   ├── LandingPage.tsx   # Layout completo — 5 secciones
│       │   │   └── LandingPage.css
│       │   ├── booking/              # Flujo de reservas
│       │   │   ├── SelectService.tsx
│       │   │   ├── SelectProfessional.tsx
│       │   │   ├── SelectDateTime.tsx   # Grilla de disponibilidad por barbero
│       │   │   └── Confirmation.tsx
│       │   ├── admin/                # Panel administrativo
│       │   │   ├── AdminPanel.tsx    # Shell: sidebar + topbar
│       │   │   ├── AdminPanel.css
│       │   │   └── sections/
│       │   │       ├── Programacion.tsx  # Grilla interactiva
│       │   │       ├── Programacion.css
│       │   │       ├── Despacho.tsx      # Órdenes de tienda
│       │   │       ├── Financiera.tsx    # Tabs financieras
│       │   │       ├── Ventas.tsx
│       │   │       ├── Cierre.tsx
│       │   │       ├── Estadisticas.tsx
│       │   │       └── Libreta.tsx       # CRM de clientes
│       │   └── store/
│       │       ├── Store.tsx
│       │       └── Store.css
│       │
│       ├── store/
│       │   ├── booking.store.ts      # Estado: servicio, barbero, fecha, paso
│       │   └── cart.store.ts         # Estado: items, cantidades, carrito abierto
│       │
│       ├── services/
│       │   └── api.client.ts         # HTTP client con mock automático
│       │
│       ├── components/
│       │   └── Cart.tsx              # Carrito flotante
│       │
│       ├── App.tsx                   # Raíz — alterna Landing ↔ Admin
│       ├── App.css                   # Step tracker, booking flow
│       └── index.css                 # Design system: variables, botones, glass panels
│
├── backend/                          # API REST (en desarrollo)
│   └── src/
│
├── infrastructure/
│   └── docker-compose.yml            # PostgreSQL + pgAdmin
│
├── .gitignore
└── README.md
```

---

## ◆ &nbsp;Instalación

### Modo rápido — solo frontend (mock)

```bash
# Clonar e instalar
git clone https://github.com/tu-usuario/rustico-barber.git
cd rustico-barber/frontend
npm install

# Iniciar
npm run dev
# → http://localhost:5173
```

> La app funciona al 100% con datos **mock** cuando el backend no está disponible. No se requiere base de datos ni variables de entorno para ver el flujo completo.

### Modo completo — frontend + backend + base de datos

```bash
# Terminal 1 — Base de datos
cd infrastructure && docker-compose up -d

# Terminal 2 — Backend
cd backend && npm install && npm run dev

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

---

## ◆ &nbsp;Variables de Entorno

Crea `frontend/.env.local` (opcional):

```env
# URL del backend — si se omite, la app usa mock automáticamente
VITE_API_URL=http://localhost:4000/api
```

---

## ◆ &nbsp;Acceso al Panel Admin

En la landing page, al pie de la banda de contacto hay un enlace discreto **"Panel Admin"**.

```
http://localhost:5173
    └─ [Panel Admin]  ──→  Programación
                      ──→  Despacho
                      ──→  Financiera  (Ingresos · Cierre · Estadísticas)
                      └──→ Libreta
```

> Autenticación con JWT — en desarrollo. Acceso libre en la versión actual.

---

## ◆ &nbsp;Servicios

| Servicio | Duración | Precio |
|---|---|---|
| Corte de Cabello | 30 min | $50.000 COP |
| Arreglo de Barba | 30 min | $50.000 COP |
| Corte + Barba | 60 min | $100.000 COP |

**Promo vigente:** 20% OFF primer servicio · Lunes a Jueves · Presentar este aviso

---

## ◆ &nbsp;Roadmap

```
  ✅  Landing editorial completa — diseño Estilo 1 (verde · crema · oro)
  ✅  Flujo de reserva 4 pasos con step tracker animado
  ✅  Grilla interactiva de barberos (bloques 30 min, modal de detalle)
  ✅  Panel admin: Programación · Despacho · Financiera · Libreta
  ✅  Tienda online con carrito persistente (Zustand)
  ✅  Mock API con datos realistas y fallback automático

  🔄  Autenticación JWT — login seguro con roles (admin / barbero)
  🔄  Backend real — reservas persistentes en PostgreSQL
  🔄  WhatsApp Business API — recordatorios automáticos de citas
  🔄  Comisiones automáticas por barbero

  📋  Facturación electrónica DIAN (Decreto 358 de 2020)
  📋  Reportes exportables a PDF / Excel
  📋  App móvil PWA para gestión desde el celular
  📋  Dashboard de métricas con comparativos mensuales
```

---

## ◆ &nbsp;Licencia

Distribuido bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más información.

---

<div align="center">

<br/>

──────────────────────── ◆ ────────────────────────

<br/>

**RÚSTICO BARBER & CONCEPT SHOP**

Cra. 13 #78-17 · Bogotá, Colombia

[+57 313 3930398](tel:+573133930398) &nbsp;·&nbsp; [@rusticobarbershop\_official](https://instagram.com/rusticobarbershop_official)

<br/>

*Est. 2018 · Bogotá, Colombia · Todos los derechos reservados*

<br/>

</div>
