# Registro de cambios — Módulo Gestión (`frontend/src/pages/Gestion.tsx`)

---

## 1. Campo: Entregado

**Tipo:** Lista desplegable (`select`)
**Antes:** `['', 'Alexander', 'Juan David', 'Neida']`
**Después:**
```
['', 'Alexander', 'Diana', 'Juan David', 'Neida', 'Recepción', 'Yibley']
```
**Añadidos:** Diana, Recepción, Yibley

---

## 2. Campo: Contabilizado Por

**Tipo:** Lista desplegable (`select`)
**Antes:** Reutilizaba `ENTREGADO_OPTIONS`
**Después:** Array propio `CONTABILIZADO_POR_OPTIONS`
```
['', 'Alexander', 'Asignado pero no causa', 'Devuelta', 'Diana', 'Juan David', 'Neida', 'Yibley']
```

---

## 3. Campo: Área

**Tipo:** Lista desplegable (`select`)
**Antes (14 opciones):**
Administrativo, Calidad, Comercial, Distribución, Financiera, Mantenimiento, Materia Prima, Minas, Mortero, Producción, Sistemas, Transporte Materia Prima, TTHH

**Después (22 opciones):**
```
Administrativo, Calidad, Comercial, Compras, Contabilidad,
Distribución, Financiera, Gestión Ambiental, Gestión Social,
Importación, Jurídica, Mantenimiento, Materia Prima, Minas,
Morteros, Presidencia, Producción, Recepción Fuera de Fecha,
SISO, Sistemas, Transp Materia Prima, TTHH
```
**Añadidos:** Compras, Contabilidad, Gestión Ambiental, Gestión Social, Importación, Jurídica, Presidencia, Recepción Fuera de Fecha, SISO
**Corregidos:** Mortero → Morteros, Transporte Materia Prima → Transp Materia Prima

---

## 4. Campo: Motivo Devolución

**Tipo antes:** Campo de texto libre (`textarea`)
**Tipo después:** Lista desplegable (`select`)
**Opciones:**
```
Cuenta contable erronea
Diferencia en valores
Documento que afecta fue rechazado anteriormente
Duplicado
Fuera de fecha
No coincide el NIT vs orden de compra
No hay entrada
Proveedor factura erroneamente imptos
Sin autorizacion del area financiera
Sin documentos soportes
Sin orden de compra
Sin requisitos de facturacion electronica
```

---

## 5. Campo: Motivo Demora

**Tipo antes:** Campo de texto libre (`textarea`)
**Tipo después:** Lista desplegable (`select`)
**Opciones:**
```
Correo caja menor
Diferencia en valores
Faltan soportes
No hay OC
Pendiente confirmacion
Pendiente entrada
Tiempo revision contabilidad
```

---

## 6. Campos cambiados a tipo Fecha

Los siguientes campos cambiaron de `select` (SI/NO o texto) a selector de **fecha** (`date`):

| Campo | Tipo anterior | Tipo nuevo |
|---|---|---|
| Acuse Recibido DIAN | select (SI / NO) | date |
| Recibo de Mercancía | select (SI / NO) | date |
| Aceptación o Rechazo | select (Aceptación / Rechazo) | date |

---

## 7. F. Alerta — cálculo automático

Se agregó la función `computeAlerta(fechaRadicado: string)` que calcula el estado de alerta según los días hábiles transcurridos desde `fecha_emision` (F. Radicado) hasta la fecha actual.

### Reglas
| Días hábiles desde F. Radicado | Estado   | Color de badge |
|-------------------------------|----------|----------------|
| 0 – 3                         | A tiempo | Verde          |
| 4 – 6                         | Demorado | Naranja        |
| Más de 6                      | Vencido  | Rojo           |

### Comportamiento
- **Frontend (tiempo real):** cada fila calcula y muestra el estado al renderizar, siempre con la fecha actual como referencia.
- **Base de datos (sincronización automática):** al cargar la lista de facturas (`fetchFacturas`), los registros cuyo valor almacenado difiera del calculado se actualizan automáticamente en segundo plano mediante `PATCH /api/facturas/:id` (fire and forget, sin bloquear la UI).

---

## Archivos modificados

| Archivo | Descripción |
|---|---|
| `frontend/src/pages/Gestion.tsx` | Todos los cambios anteriores |
