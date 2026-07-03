# Conceptos Fundamentales — Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `01-VISION.md`

---

## 1. Los 4 Conceptos Clave

El nuevo motor se basa en 4 conceptos que reemplazan a la antigua `matriz_contable`:

```
EVENTO                          ¿Qué pasó en el negocio?
  └── activa COMPONENTES        ¿Qué roles contables participan?
        └── REGLA_CUENTA        ¿A qué cuenta concreta va cada rol?
              └── ASIENTO       El asiento contable resultante (Debe = Haber)
```

---

## 2. Evento de Dominio

### 2.1 Definición

Un **evento de dominio** es el hecho de negocio que ocurrió, descrito en lenguaje del negocio y con todas sus dimensiones, **antes** de pensar en cuentas.

Los módulos operativos publican eventos; el motor los consume y produce asientos.

### 2.2 Estructura de un evento

```json
{
  "evento": "COMPRA_REGISTRADA",
  "payload": {
    "pais_id": "uuid",
    "sucursal_id": "uuid",
    "fecha_contable": "2026-06-30",
    "periodo_contable_id": "uuid",
    "moneda_id": "uuid",
    "tipo_cambio": 3.75,
    "diario_id": "uuid",
    "glosa": "Factura F001-12345 - Proveedor Carnes SAC",
    "origen": "compras",
    "origen_id": "uuid-de-la-compra",
    "lineas": [
      {
        "tipo_transaccion": "mercaderia",
        "partner_id": "uuid-proveedor",
        "monto": 1180.00,
        "afecta_iva": true,
        "tiene_detraccion": false,
        "clasificacion_operacion": "gravado",
        "centro_costo_id": "uuid"
      }
    ]
  }
}
```

### 2.3 Principios

- **Un evento → uno o más asientos** (la mayoría genera 1, compra+inventario genera 2)
- **Evento ≠ Asiento**: el evento describe el hecho; el asiento es su representación contable
- **Separación devengo/cobro-pago**: `VENTA_EMITIDA` y `COBRO_REGISTRADO` son eventos distintos, aunque ocurran el mismo día

---

## 3. Componente Contable (Rol)

### 3.1 Definición

Un **componente contable** es la **unidad atómica del motor** — representa un **rol** dentro de un asiento. No es una cuenta contable, es un rol que después se resuelve a una cuenta concreta.

### 3.2 Anatomía de un componente

| Campo | Descripción | Ejemplos |
|---|---|---|
| `codigo` | Identificador único del rol | `VENTA`, `CLIENTE`, `IVA`, `DETRACCION` |
| `nombre` | Nombre legible | "Venta", "Cliente", "IVA Débito" |
| `tipo` | Cómo se calcula su monto | `ingreso`, `gasto`, `impuesto`, `contrapartida`, `puente`, `ajuste` |
| `posicion` | Orden en el asiento (1-5) | `1=terceros`, `2=base`, `3=impuestos`, `4=puente`, `5=ajuste` |
| `direccion` | ¿Debe o Haber? | `debe`, `haber`, `ambos` |
| `es_batch` | ¿Se consolida? (planillas) | `false` (default), `true` |

### 3.3 Ejemplos

| Componente | Tipo | Posición | Dirección | ¿Qué representa? |
|---|---|---|---|---|
| `VENTA` | `ingreso` | 2 | haber | El ingreso sin impuesto |
| `COMPRA` | `gasto` | 2 | debe | El gasto sin impuesto |
| `CLIENTE` | `contrapartida` | 1 | debe | Cuenta por cobrar |
| `PROVEEDOR` | `contrapartida` | 1 | haber | Cuenta por pagar |
| `CAJA_VENTA` | `contrapartida` | 1 | debe | Caja por venta contado |
| `BANCO` | `contrapartida` | 1 | debe/haber | Entrada/salida de banco |
| `IVA` | `impuesto` | 3 | según caso | IVA débito o crédito |
| `DETRACCION` | `puente` | 4 | según caso | Detracción por pagar/aplicar |
| `PERCEPCION` | `puente` | 4 | debe | Percepción por aplicar |
| `RETENCION` | `puente` | 4 | haber | Retención por pagar |
| `DIF_CAMBIO` | `ajuste` | 5 | según TC | Diferencia de cambio |

### 3.4 Diferencia clave con la matriz actual

```
HOY (matriz_contable_det):           NUEVO (componente_contable):
  plan_contable_det_id = 42102101      codigo = "PROVEEDOR"
  flag_deb_hab = 'H'                   tipo = "contrapartida"
  formula = "total" (no evaluada)      direccion = "haber"
  importe = monto (fijo)               posicion = 1
                                       → monto se calcula según tipo
                                       → cuenta se resuelve por regla
```

---

## 4. Regla de Activación

### 4.1 Definición

La **regla de activación** define **qué componentes** se activan cuando ocurre un evento, y **bajo qué condiciones**.

### 4.2 Estructura

```sql
regla_activacion (
    evento          varchar(30),    -- COMPRA_REGISTRADA, VENTA_EMITIDA, etc.
    pais_id         uuid?,          -- NULL = aplica a todos los países
    componente_id   uuid,           -- el componente que se activa
    condicion       jsonb,          -- {"afecta_iva": true, "tiene_detraccion": false}
    accion          varchar(30),    -- AGREGAR, REEMPLAZAR, OMITIR
    orden           int
);
```

### 4.3 Ejemplo

Para el evento `VENTA_EMITIDA`:

| Componente | Condición | Acción |
|---|---|---|
| `CLIENTE` | `{"tipo_pago": "credito"}` | AGREGAR |
| `CAJA_VENTA` | `{"tipo_pago": "contado"}` | AGREGAR |
| `VENTA` | `{}` (siempre) | AGREGAR |
| `IVA` | `{"afecta_iva": true}` | AGREGAR |
| `VENTA_EXPORTACION` | `{"es_exportacion": true}` | REEMPLAZAR(VENTA) |
| `PROPINA` | `{"tiene_propina": true}` | AGREGAR |
| `DETRACCION` | `{"tiene_detraccion": true}` | AGREGAR |

### 4.4 Tipos de acción

| Acción | Comportamiento |
|---|---|
| `AGREGAR` | Añade el componente a la lista activa |
| `REEMPLAZAR` | Reemplaza un componente existente por otro (ej: VENTA → VENTA_EXPORTACION) |
| `OMITIR` | Impide que se active un componente que normalmente se activaría |

---

## 5. Regla de Cuenta (Account Resolution)

### 5.1 Definición

La **regla de cuenta** traduce un componente + contexto a una **cuenta contable concreta**. Usa **fallback progresivo**: busca la más específica primero, y si no encuentra, va subiendo de nivel.

### 5.2 Estructura

```sql
regla_cuenta_componente (
    componente_id           uuid,
    tipo_transaccion        varchar(30)?,   -- mercaderia, servicio, activo_fijo
    producto_categoria_id   uuid?,           -- categoría del producto
    partner_tipo            varchar(30)?,    -- proveedor, cliente, empleado
    clasificacion_operacion uuid?,           -- gravado, exonerado, inafecto
    moneda_id               uuid?,           -- PEN, USD, COP
    prioridad               int,             -- más alto = más específico
    cuenta_id               uuid             -- FK a cuenta_contable
);
```

### 5.3 Orden de resolución

Para cada componente, el motor busca en este orden:

1. Partner específico (`partner_cliente.cuenta_contable_id`)
2. Categoría de producto (`producto_categoria.cuenta_default_id`)
3. Regla más específica (todos los filtros)
4. Sacando filtros uno por uno (moneda → clasificación → partner_tipo → categoría → tipo_transacción)
5. Solo `pais_id + componente_id`
6. Error: `CUENTA_NO_CONFIGURADA`

---

## 6. Asiento Contable

### 6.1 Definición

El **asiento** es el registro contable inmutable. Se compone de una cabecera y N líneas (mínimo 2). La suma del Debe siempre es igual a la suma del Haber.

### 6.2 Estructura

```
ASIENTO (cabecera)
├── numero_asiento (correlativo x empresa)
├── fecha_contable, periodo_contable_id
├── diario_id (libro: compras, ventas, caja...)
├── glosa, origen, origen_id
├── moneda_id, tipo_cambio
├── total_debe, total_haber
├── estado (borrador → contabilizado → anulado)
├── asiento_original_id (si es extorno)
│
└── LÍNEAS (mínimo 2; suma Debe = suma Haber)
    ├── cuenta_contable_id
    ├── debe, haber (montos en moneda funcional)
    ├── moneda_id, monto_original (si aplica)
    ├── centro_costo_id, sucursal_id
    ├── partner_id (tercero)
    └── documento_ref, glosa
```

### 6.3 Estados

```
CREAR → BORRADOR → CONTABILIZADO → (persiste)
                       │
                       └── si hay error: EXTORNO → ANULADO (nuevo asiento que revierte)
```

- `BORRADOR`: existe pero no afecta saldos. Puede editarse
- `CONTABILIZADO`: afecta el Mayor. **Inmutable**. No se edita ni borra
- `ANULADO`: se llega contabilizando un asiento de reversión. El original persiste

---

## 7. Comparativa: Motor Actual vs Motor v2

| Concepto | Motor Actual (v1) | Motor v2 |
|---|---|---|
| **Input** | `conceptoFinancieroId` + `monto` | `evento` + `payload` con contexto |
| **Resolución** | `concepto → matriz → cuenta fija` | `evento → reglas activación → componentes → reglas cuenta` |
| **Líneas por asiento** | Fijas (2, mismo monto) | Dinámicas (N, montos calculados) |
| **IVA** | Mecanismo separado, roto | Componente integrado (tipo=impuesto) |
| **Fórmulas** | Texto decorativo en BD | Motor las ejecuta según `tipo` del componente |
| **Extornos** | No existen | `asiento_original_id` + asiento reversión |
| **Multi-país** | `PAIS_PERU_ID` hardcodeado | `pais_id` en tablas de configuración |
| **Multi-asiento** | No (1 evento = 1 asiento) | Sí (1 evento = N asientos) |
| **Endpoints** | 14 específicos | 1 genérico (`POST /procesar-evento`) |
| **Configuración** | En código Java | En tablas (`regla_activacion`, `regla_cuenta_componente`) |
