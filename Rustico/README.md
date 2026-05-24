<div align="center">

<br/>

<img src="Rustico/Logo nuevo 1.png" alt="Rústico Barber & Concept Shop" width="560"/>

<br/><br/>

*Sistema de Gestión Integral · Bogotá, Colombia · Est. 2018*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React_%2B_Vite-PWA-61DAFB?style=flat-square&logo=react&logoColor=black)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-aaaaaa?style=flat-square)](LICENSE)

[![Estado](https://img.shields.io/badge/Estado-En_Desarrollo-B87333?style=flat-square&labelColor=1a1a1a)](.)
[![DIAN](https://img.shields.io/badge/Facturaci%C3%B3n-DIAN_%C2%B7_UBL_2.1-2B5741?style=flat-square&labelColor=1a1a1a)](https://www.dian.gov.co)
[![Instagram](https://img.shields.io/badge/Instagram-rusticobarbershop__official-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/rusticobarbershop_official)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-%2B57_313_3930398-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/573133930398)

</div>

---

## Visión General

**BarberAdmin** es la plataforma de administración diseñada para **Rústico Barber & Concept Shop** y el mercado colombiano. Centraliza agenda inteligente, CRM de clientes, facturación electrónica DIAN, comisiones de barberos e inventario en un solo sistema — eliminando hojas de cálculo, agendas físicas y cálculos manuales.

<br/>

<div align="center">

| 📍 Ubicación | 📅 Fundación | ✂️ Concepto | 🇨🇴 País |
|:---:|:---:|:---:|:---:|
| Cra. 13 #78-17, Bogotá | Est. 2018 | Barber & Concept Shop | Cumplimiento DIAN |

</div>

---

## Módulos del Sistema

| # | Módulo | Descripción | Estado |
|:---:|---|---|:---:|
| 1 | 📅 **Agenda Inteligente** | Reservas 24/7 vía WhatsApp, Instagram y widget web embebible | 🔄 En desarrollo |
| 2 | 👤 **CRM de Clientes** | Historial completo, notas del barbero y segmentación automática | 🔄 En desarrollo |
| 3 | 💰 **Caja & Facturación DIAN** | Factura electrónica UBL 2.1, caja diaria y reportes de rentabilidad | 📋 Planeado |
| 4 | ✂️ **Gestión de Personal** | Esquemas de comisión, asistencia y liquidación de nómina | 📋 Planeado |
| 5 | 📦 **Inventario & Insumos** | Stock mínimo configurable, alertas y gestión de proveedores | 📋 Planeado |

<br/>

<details>
<summary><strong>📅 Agenda Inteligente — Detalles</strong></summary>
<br/>

El núcleo operativo del negocio. Gestiona el flujo completo de citas desde la reserva hasta la confirmación.

- Reservas 24/7 vía WhatsApp Business API, Instagram y widget web embebible
- Calendario por barbero con disponibilidad en tiempo real
- Recordatorios automáticos por WhatsApp/SMS a las 24h y 1h antes de la cita
- Gestión de no-shows: bloqueo configurable de clientes reincidentes
- Servicios combinados (ej. corte + barba) con estimación de duración

**Entidades:** `Appointment` · `TimeSlot` · `ServiceType` · `Reminder`

</details>

<details>
<summary><strong>👤 CRM de Clientes — Detalles</strong></summary>
<br/>

Base de datos relacional para fidelización y personalización del servicio.

- Ficha del cliente con historial completo: servicios, productos y barbero asignado
- Notas privadas del barbero (preferencias, alergias, contexto personal)
- Segmentación automática: **VIP** · **Frecuente** · **En riesgo** · **Inactivo**
- Envío de promociones personalizadas vía WhatsApp o correo por segmento
- Estadísticas por cliente: ticket promedio, frecuencia y último servicio

**Entidades:** `Client` · `ClientNote` · `ServiceHistory` · `Segment`

</details>

<details>
<summary><strong>💰 Caja & Facturación DIAN — Detalles</strong></summary>
<br/>

Cumplimiento fiscal colombiano con control financiero en tiempo real.

- **Facturación electrónica** conforme al Decreto 358 de 2020 (UBL 2.1)
- Caja diaria por método de pago: efectivo · tarjeta · Nequi · Daviplata · transferencia
- Gastos operativos por categoría: insumos, arriendo, servicios públicos, nómina
- Reportes de rentabilidad: márgenes por servicio, comparativos mensuales, proyecciones
- Cuadre de caja al cierre del día con exportación PDF/Excel

> ⚠️ Para emitir facturas electrónicas en Colombia es necesario gestionar la habilitación ante la DIAN o contratar un Proveedor Autorizado Tecnológico (PAT).

**Entidades:** `Transaction` · `Invoice` · `DailyClosing` · `Expense` · `PaymentMethod`

</details>

<details>
<summary><strong>✂️ Gestión de Personal & Comisiones — Detalles</strong></summary>
<br/>

Automatización del ciclo de nómina para eliminar errores de cálculo y disputas.

- Esquemas de comisión configurables por barbero y tipo de servicio (porcentaje o monto fijo)
- Control de asistencia con entrada/salida y cálculo de horas laboradas
- Dashboard de productividad: servicios generados, ingresos y ticket promedio por barbero
- Liquidación periódica: reporte listo para pago (semanal / quincenal / mensual)
- Perfil de cada barbero con portafolio de servicios y valoraciones de clientes

**Entidades:** `Barber` · `CommissionRule` · `Attendance` · `Payroll`

</details>

<details>
<summary><strong>📦 Inventario & Insumos — Detalles</strong></summary>
<br/>

Control de materiales para evitar quiebres de stock y maximizar el ticket de venta.

- Stock mínimo configurable con alertas automáticas de reabastecimiento
- Categorías: insumos de trabajo (cuchillas, aceites, champú) y productos de venta al cliente
- Venta cruzada: sugerencia de productos al registrar el cierre de una cita
- Historial de consumo por barbero para detectar desperdicios
- Registro de proveedores y órdenes de compra

**Entidades:** `Product` · `StockMovement` · `Supplier` · `PurchaseOrder`

</details>

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| **Backend** | Node.js · Express / NestJS | Ecosystem robusto, soporte async nativo |
| **Base de datos** | PostgreSQL 15+ | Relacional, cumplimiento ACID, soporte JSON |
| **ORM** | Prisma | Type-safe, migraciones versionadas |
| **Frontend** | React + Vite | SPA con PWA para uso móvil en la barbería |
| **Notificaciones** | Twilio · Meta Cloud API | WhatsApp Business oficial |
| **Facturación** | API DIAN (UBL 2.1) | Obligatorio para Colombia |
| **Autenticación** | JWT + Refresh Tokens | Roles: admin · barbero · recepción |

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                         Clientes                         │
│      WhatsApp Bot     Instagram API     Web App (PWA)    │
└──────────────┬──────────────┬─────────────┬─────────────┘
               │              │             │
               └──────────────▼─────────────┘
                       API Gateway (REST)
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
     ┌─────▼─────┐    ┌───────▼──────┐    ┌──────▼──────┐
     │  Agenda   │    │    CRM /     │    │  Finanzas / │
     │  Service  │    │  Clientes    │    │    DIAN     │
     └─────┬─────┘    └───────┬──────┘    └──────┬──────┘
           │                  │                  │
           └──────────────────▼──────────────────┘
                        PostgreSQL DB
                              │
               ┌──────────────┼──────────────┐
               │              │              │
        Notification     File Storage    Reporting
        Service          (S3/Local)      Engine
       (WhatsApp/SMS)
```

---

## Estructura del Proyecto

```
barberAdmin/
│
├── docs/
│   ├── api/                       # Especificaciones OpenAPI / Swagger
│   ├── database/                  # Diagramas ER y migraciones
│   └── architecture/              # Diagramas de arquitectura
│
├── src/
│   ├── modules/                   # Módulos de negocio (feature-based)
│   │   ├── agenda/                # controller · service · repository · schema · types
│   │   ├── clientes/
│   │   ├── caja/
│   │   ├── personal/
│   │   └── inventario/
│   │
│   ├── shared/
│   │   ├── components/            # Componentes UI reutilizables (frontend)
│   │   ├── hooks/                 # Custom hooks React
│   │   ├── utils/                 # Fechas, formato moneda colombiana, etc.
│   │   └── types/                 # Tipos e interfaces globales TypeScript
│   │
│   ├── services/
│   │   ├── notifications/         # WhatsApp · SMS · Email
│   │   └── dian/                  # Facturación electrónica
│   │
│   └── config/                    # database.ts · env.ts · constants.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/workflows/             # CI/CD — GitHub Actions
│   ├── ci.yml                     # Lint, tests y build en cada PR
│   └── deploy.yml                 # Despliegue a producción en merge a main
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Instalación

### Con Docker *(recomendado)*

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/barberAdmin.git && cd barberAdmin

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# 5. Cargar datos semilla (opcional)
docker-compose exec app npm run seed
```

La aplicación estará disponible en `http://localhost:3000`.

### Sin Docker

```bash
git clone https://github.com/tu-usuario/barberAdmin.git && cd barberAdmin
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

---

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```env
# ── Base de datos ─────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/barber_admin"

# ── Autenticación ─────────────────────────────────────────────────────────────
JWT_SECRET="secreto-de-al-menos-32-caracteres"
JWT_EXPIRY="8h"
REFRESH_TOKEN_EXPIRY="30d"

# ── WhatsApp Business API (Meta Cloud) ────────────────────────────────────────
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
WHATSAPP_PHONE_NUMBER_ID="tu-phone-number-id"
WHATSAPP_ACCESS_TOKEN="tu-token-permanente"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="secreto-webhook"

# ── Facturación Electrónica DIAN ──────────────────────────────────────────────
DIAN_NIT="tu-nit-sin-digito-verificacion"
DIAN_API_URL="https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc"
# DIAN_API_URL="https://vpfe.dian.gov.co/WcfDianCustomerServices.svc"   # Producción
DIAN_CERTIFICATE_PATH="./certs/firma_electronica.p12"
DIAN_CERTIFICATE_PASSWORD="clave-del-certificado"

# ── Almacenamiento ────────────────────────────────────────────────────────────
STORAGE_PROVIDER="local"   # "local" | "s3"

# ── Aplicación ────────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

> 🔒 El archivo `.env` está en `.gitignore`. Nunca lo subas al repositorio.

---

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Compilación para producción (TypeScript → JS)
npm run start        # Servidor en modo producción
npm run test         # Suite completa de pruebas
npm run test:unit    # Solo pruebas unitarias
npm run test:e2e     # Pruebas end-to-end
npm run lint         # Análisis estático (ESLint)
npm run format       # Formateo automático (Prettier)
npm run migrate      # Migraciones pendientes de BD
npm run seed         # Datos de ejemplo en BD
npm run studio       # Prisma Studio (explorador visual de BD)
```

---

## API Reference

Documentación interactiva disponible en `/api/docs` (Swagger UI) cuando el servidor corre en modo desarrollo.

| Método | Ruta | Descripción | Auth |
|:---:|---|---|:---:|
| `GET` | `/api/v1/agenda` | Listar citas del día | ✅ |
| `POST` | `/api/v1/agenda` | Crear nueva cita | ✅ |
| `PATCH` | `/api/v1/agenda/:id/estado` | Confirmar / cancelar cita | ✅ |
| `GET` | `/api/v1/clientes` | Listar clientes con paginación | ✅ |
| `GET` | `/api/v1/clientes/:id/historial` | Historial de servicios del cliente | ✅ |
| `POST` | `/api/v1/caja/transaccion` | Registrar ingreso o gasto | ✅ |
| `POST` | `/api/v1/caja/factura` | Emitir factura electrónica DIAN | ✅ |
| `GET` | `/api/v1/personal/:id/comisiones` | Comisiones de un barbero por período | ✅ |
| `GET` | `/api/v1/inventario/alertas` | Productos con stock bajo mínimo | ✅ |
| `POST` | `/api/v1/webhooks/whatsapp` | Recibir mensajes entrantes de WhatsApp | 🔓 |

---

## Roadmap

```
2025 Q3 ── v0.1.0  MVP Agenda
           ✓  Estructura base del proyecto y CI/CD
           ○  Módulo de agenda: CRUD de citas
           ○  Autenticación JWT con roles
           ○  Vista de calendario por barbero

2025 Q4 ── v0.2.0  CRM & Notificaciones
           ○  Módulo CRM: ficha de cliente e historial
           ○  Integración WhatsApp Business API
           ○  Recordatorios automáticos de citas

2026 Q1 ── v0.3.0  Finanzas & DIAN
           ○  Módulo de caja diaria
           ○  Emisión de facturas electrónicas DIAN
           ○  Reportes de rentabilidad

2026 Q2 ── v1.0.0  Plataforma Completa
           ○  Módulo de personal y comisiones
           ○  Control de inventario con alertas
           ○  App móvil PWA para barberos
           ○  Dashboard ejecutivo consolidado
```

---

## Contribuciones

Las contribuciones son bienvenidas.

1. Haz un fork del repositorio
2. Crea una rama descriptiva: `git checkout -b feat/recordatorios-whatsapp`
3. Realiza tus cambios siguiendo la guía de estilo del proyecto
4. Escribe o actualiza las pruebas correspondientes
5. Abre un Pull Request describiendo los cambios y su motivación

Consulta [CONTRIBUTING.md](docs/CONTRIBUTING.md) para más detalles.

---

<div align="center">

<br/>

<img src="Rustico/Rustico5.png" alt="Rústico — Bogotá, Est. 2018" width="160"/>

<br/><br/>

[![Instagram](https://img.shields.io/badge/Instagram-rusticobarbershop__official-E4405F?style=flat-square&logo=instagram&logoColor=white)](https://instagram.com/rusticobarbershop_official)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-%2B57_313_3930398-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/573133930398)
[![Ubicación](https://img.shields.io/badge/Bogot%C3%A1-Cra._13_%2378--17-2B5741?style=flat-square&logo=googlemaps&logoColor=white)](https://maps.google.com/?q=Cra+13+%2378-17+Bogot%C3%A1)

<br/>

*Construido para* **Rústico Barber & Concept Shop** *· Bogotá, Colombia 🇨🇴*

*Distribuido bajo la [Licencia MIT](LICENSE)*

<br/>

</div>
