# Catálogo de Eventos — Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `02-CONCEPTOS.md`, `03-ARQUITECTURA.md`, `06-CATALOGO_COMPONENTES.md`  
**Eventos documentados:** 33

---

## 1. Introducción

### 1.1 Propósito

Este documento cataloga **todos los eventos de dominio** que el motor de asientos v2 consume para generar asientos contables. Cada evento representa un hecho de negocio ocurrido en un módulo operativo (compras, ventas, tesorería, etc.).

### 1.2 Arquitectura de eventos

```
Módulo operativo                Motor de Asientos v2
       │                                │
       │  POST /procesar-evento         │
       │  { evento, payload... }        │
       │──────────────────────────────> │
       │                                │
       │                        ┌───────┴───────┐
       │                        │  1. RECIBIR   │
       │                        │  Validar      │
       │                        └───────┬───────┘
       │                                │
       │                        ┌───────┴───────┐
       │                        │  2. ACTIVAR   │
       │                        │  reglas →     │
       │                        │  componentes  │
       │                        └───────┬───────┘
       │                                │
       │                        ┌───────┴───────┐
       │                        │  3. RESOLVER  │
       │                        │  roles →      │
       │                        │  cuentas      │
       │                        └───────┬───────┘
       │                                │
       │                        ┌───────┴───────┐
       │                        │  4. CALCULAR  │
       │                        │  montos por   │
       │                        │  tipo         │
       │                        └───────┬───────┘
       │                                │
       │                        ┌───────┴───────┐
       │                        │  5→10 PASOS   │
       │                        │  ordenar,     │
       │                        │  validar,     │
       │                        │  persistir... │
       │                        └───────┬───────┘
       │                                │
       │  { asiento_id, estado }        │
       │<────────────────────────────── │
```

### 1.3 Convenciones usadas en este documento

- **Roles** (componentes) se muestran en VERSALITA: `PROVEEDOR`, `IVA_CREDITO`, `VENTA`
- **Cuentas de ejemplo** siguen el PCGE Perú (Plan Contable General Empresarial). Son referenciales — el motor resuelve cuentas según reglas por empresa + país
- **Patrón de asiento** muestra la distribución Debe/Haber usando roles. Las cuentas concretas se resuelven en tiempo de ejecución
- Los montos son ilustrativos. El motor calcula base imponible vs impuesto según las tasas configuradas por país

### 1.4 Payload Base (Común a todos los eventos)

Todo evento comparte esta estructura base en el payload:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `pais_id` | UUID | Sí | País de la transacción (PE, CO, EC) |
| `sucursal_id` | UUID | Sí* | Sucursal donde ocurre la operación |
| `fecha_contable` | Date | Sí | Fecha del asiento contable |
| `periodo_contable_id` | UUID | Sí | Periodo contable al que pertenece |
| `moneda_id` | UUID | Sí | Moneda de la transacción (PEN, USD, COP) |
| `tipo_cambio` | Decimal(12,4) | Condicional | Obligatorio si moneda ≠ moneda funcional |
| `diario_id` | UUID | Sí | Diario/libro contable destino (compras, ventas, caja…) |
| `glosa` | String(500) | Sí | Descripción del asiento |
| `origen` | String(30) | Sí | Módulo origen: `compras`, `ventas`, `tesoreria`, `activos_fijos`, `planillas`, `inventario` |
| `origen_id` | UUID | Sí | ID del registro origen (idempotencia: unique origen + origen_id) |
| `lineas[]` | Array | Sí | Líneas del detalle operativo (1 o más) |

#### Estructura de cada línea en `lineas[]`

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `tipo_transaccion` | String(30) | Sí | `mercaderia`, `servicio`, `activo_fijo`, `honorario`, `planilla`, `comision` |
| `partner_id` | UUID | Condicional | Obligatorio si el componente requiere tercero (proveedor, cliente) |
| `monto` | Decimal(14,2) | Sí | Monto total de la línea (incluye impuestos) |
| `monto_base` | Decimal(14,2) | Condicional | Base imponible (si difiere del monto) |
| `afecta_iva` | Boolean | Sí | ¿La línea está afecta a IVA/IVA? |
| `tiene_detraccion` | Boolean | Sí | ¿La línea tiene detracción? |
| `clasificacion_operacion` | String(20) | Sí | `gravado`, `exonerado`, `inafecto`, `exportacion` |
| `tasa_impuesto` | Decimal(5,2) | Condicional | Tasa de IVA/IVA si aplica (anula la configurada por defecto) |
| `porcentaje_detraccion` | Decimal(5,2) | Condicional | % de detracción si aplica |
| `centro_costo_id` | UUID | No | Centro de costo (si la cuenta lo requiere) |
| `cantidad` | Decimal(14,4) | Condicional | Cantidad de unidades (inventario/producción) |
| `costo_unitario` | Decimal(14,4) | Condicional | Costo unitario (inventario/producción) |
| `producto_id` | UUID | Condicional | Producto (inventario/producción) |
| `producto_categoria_id` | UUID | No | Categoría del producto (influencia en resolución de cuenta) |

> **\*** Los eventos de planillas pueden omitir `sucursal_id` y `centro_costo_id` si la planilla es centralizada — la configuración del motor decide cómo asignarlos.

---

## 2. Convención de Numeración

Los eventos se numeran `2.X` dentro de este catálogo, donde `X` es secuencial dentro de cada módulo:

| Rango | Módulo | Cantidad |
|---|---|---|
| 2.1 – 2.5 | Compras | 5 |
| 2.6 – 2.13 | Ventas | 8 |
| 2.14 – 2.19 | Tesorería | 6 |
| 2.20 – 2.24 | Activos Fijos | 5 |
| 2.25 – 2.27 | Planillas | 3 |
| 2.28 – 2.32 | Producción / Inventario | 5 |
| 2.33 | Extornos | 1 |

---

## 3. Eventos de Compras

### 3.1 COMPRA_REGISTRADA (`COMPRA_REGISTRADA`)

**Cuándo ocurre:** Se registra una factura de compra al crédito (proveedor emite factura, la empresa la recibe y aprueba).  
**Origen:** `compras`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `tipo_comprobante_id` | UUID | Sí | Factura, RH, etc. |
| `serie` | String(10) | Sí | Serie del comprobante |
| `numero` | String(20) | Sí | Número del comprobante |
| `fecha_emision` | Date | Sí | Fecha de emisión del comprobante |
| `fecha_vencimiento` | Date | No | Fecha de vencimiento de la CxP |
| `total` | Decimal(14,2) | Sí | Total del comprobante |
| `tiene_detraccion` | Boolean | Sí | ¿Aplica detracción? |
| `porcentaje_detraccion` | Decimal(5,2) | Condicional | % de detracción (ej: 12% para servicios) |
| `anticipo_id` | UUID | No | ID del anticipo aplicado (si aplica) |
| `monto_anticipo` | Decimal(14,2) | No | Monto del anticipo aplicado |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | haber | siempre |
| `COMPRA` | gasto | 2 | debe | siempre |
| `IVA_CREDITO` | impuesto | 3 | debe | `afecta_iva = true` |
| `DETRACCION` | puente | 4 | haber | `tiene_detraccion = true` |
| `PERCEPCION` | puente | 4 | debe | `tiene_percepcion = true` |
| `RETENCION` | puente | 4 | haber | `tiene_retencion = true` |

**Asiento(s) que genera:** 1 asiento en el diario de compras.

**Patrón de asiento** (compra de mercadería gravada por S/ 1,180, sin detracción):

| Rol | Debe | Haber |
|---|---|---|
| `COMPRA` | 1,000.00 | — |
| `IVA_CREDITO` | 180.00 | — |
| `PROVEEDOR` | — | 1,180.00 |

*Cuentas de referencia PCGE: COMPRA → 60 Compras / IVA_CREDITO → 40111 IVA Crédito / PROVEEDOR → 421 Proveedores*

> **Nota:** El motor calcula `COMPRA = total / (1 + tasa_impuesto)` e `IVA_CREDITO = base × tasa_impuesto` según el tipo de componente.

**Efectos secundarios:**
- Crear/actualizar CxP (cuenta por pagar al proveedor)
- Actualizar libro de compras (registro de comprobante)
- Si tiene detracción: crear registro de detracción pendiente
- Si hay anticipo aplicado: cerrar anticipo y marcar como usado

---

### 3.2 COMPRA_CONTADO (`COMPRA_CONTADO`)

**Cuándo ocurre:** Se registra una compra pagada al contado (caja o banco en el momento de la compra).  
**Origen:** `compras`

**Payload específico:** Mismos campos que `COMPRA_REGISTRADA` más:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `medio_pago` | String(20) | Sí | `caja`, `banco`, `tarjeta_credito`, `tarjeta_debito` |
| `cuenta_bancaria_id` | UUID | Condicional | Obligatorio si medio_pago = banco |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CAJA_COMPRA` | contrapartida | 1 | haber | `medio_pago = caja` |
| `BANCO_COMPRA` | contrapartida | 1 | haber | `medio_pago = banco` |
| `COMPRA` | gasto | 2 | debe | siempre |
| `IVA_CREDITO` | impuesto | 3 | debe | `afecta_iva = true` |
| `DETRACCION` | puente | 4 | haber | `tiene_detraccion = true` |

**Asiento(s) que genera:** 1 asiento en el diario de compras.

**Patrón de asiento** (compra contado de servicio por S/ 590, banco):

| Rol | Debe | Haber |
|---|---|---|
| `COMPRA` | 500.00 | — |
| `IVA_CREDITO` | 90.00 | — |
| `BANCO_COMPRA` | — | 590.00 |

**Efectos secundarios:**
- Disminuir saldo bancario / caja
- Actualizar libro de compras

---

### 3.3 NC_COMPRA (`NC_COMPRA`)

**Cuándo ocurre:** Se recibe una Nota de Crédito del proveedor (devolución total/parcial, descuento, corrección de precio).  
**Origen:** `compras`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `compra_original_id` | UUID | Sí | ID de la compra original que se corrige |
| `tipo_nc` | String(20) | Sí | `devolucion_total`, `devolucion_parcial`, `descuento`, `correccion_precio` |
| `porcentaje_reversado` | Decimal(5,2) | Condicional | % de reversión si aplica |
| `motivo` | String(500) | Sí | Motivo de la NC |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | debe | siempre |
| `COMPRA` | gasto | 2 | haber | siempre |
| `IVA_CREDITO` | impuesto | 3 | haber | `afecta_iva = true` en la compra original |

**Asiento(s) que genera:** 1 asiento en el diario de compras. La NC revierte el asiento original (mismos conceptos, lado opuesto).

**Patrón de asiento** (NC de S/ 590 sobre compra original de S/ 1,180, devolución parcial 50%):

| Rol | Debe | Haber |
|---|---|---|
| `PROVEEDOR` | 590.00 | — |
| `COMPRA` | — | 500.00 |
| `IVA_CREDITO` | — | 90.00 |

**Efectos secundarios:**
- Reducir CxP del proveedor
- Actualizar libro de compras (NC anula comprobante original parcial/totalmente)
- Si afectó inventario: reversar entrada de kárdex

---

### 3.4 ANTICIPO_PROVEEDOR (`ANTICIPO_PROVEEDOR`)

**Cuándo ocurre:** Se entrega un adelanto a un proveedor (anticipo antes de recibir la factura).  
**Origen:** `compras`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `monto_anticipo` | Decimal(14,2) | Sí | Monto del anticipo |
| `afecta_iva` | Boolean | Sí | ¿El anticipo genera IVA? |
| `cuenta_bancaria_id` | UUID | Condicional | Cuenta bancaria desde donde se gira |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `BANCO_SALIDA` | contrapartida | 1 | haber | siempre |
| `ANTICIPO_PROVEEDOR` | puente | 4 | debe | siempre |
| `IVA_ANTICIPO` | impuesto | 3 | debe | `afecta_iva = true` |

**Asiento(s) que genera:** 1 asiento en el diario de caja/tesorería.

**Patrón de asiento** (anticipo de S/ 590 a proveedor):

| Rol | Debe | Haber |
|---|---|---|
| `ANTICIPO_PROVEEDOR` | 500.00 | — |
| `IVA_ANTICIPO` | 90.00 | — |
| `BANCO_SALIDA` | — | 590.00 |

*Cuentas de referencia PCGE: ANTICIPO_PROVEEDOR → 431 Anticipo a Proveedores*

**Efectos secundarios:**
- Reducir saldo bancario
- Registrar anticipo en CxP (saldo a favor del proveedor)

---

### 3.5 APLICACION_ANTICIPO (`APLICACION_ANTICIPO`)

**Cuándo ocurre:** El anticipo entregado al proveedor se aplica contra una factura de compra.  
**Origen:** `compras`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `compra_id` | UUID | Sí | ID de la compra donde se aplica |
| `anticipo_id` | UUID | Sí | ID del anticipo a aplicar |
| `monto_aplicado` | Decimal(14,2) | Sí | Monto a aplicar |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | debe | siempre (reduce la CxP) |
| `ANTICIPO_PROVEEDOR` | puente | 4 | haber | siempre (cancela el anticipo) |

**Asiento(s) que genera:** 1 asiento en un diario auxiliar de aplicaciones (o en compras). En muchos sistemas, este evento no genera asiento independiente sino que modifica los montos del asiento de `COMPRA_REGISTRADA`. Se documenta como evento separado para flexibilidad.

**Patrón de asiento** (aplicación de S/ 590 de anticipo contra factura de S/ 1,180):

| Rol | Debe | Haber |
|---|---|---|
| `PROVEEDOR` | 590.00 | — |
| `ANTICIPO_PROVEEDOR` | — | 590.00 |

*La CxP neta resultante = 1,180 - 590 = 590*

**Efectos secundarios:**
- Marcar anticipo como aplicado
- Reducir CxP del proveedor (neto)

---

## 4. Eventos de Ventas

### 4.1 VENTA_EMITIDA (`VENTA_EMITIDA`)

**Cuándo ocurre:** Se emite un comprobante de venta (factura o boleta). Determina si es contado o crédito según el tipo de pago.  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `tipo_comprobante_id` | UUID | Sí | Factura, Boleta, etc. |
| `serie` | String(10) | Sí | Serie del comprobante |
| `numero` | String(20) | Sí | Número del comprobante |
| `fecha_emision` | Date | Sí | Fecha de emisión |
| `fecha_vencimiento` | Date | No | Vencimiento (crédito) |
| `tipo_pago` | String(10) | Sí | `contado`, `credito` |
| `medio_pago` | String(20) | Condicional | `caja`, `banco`, `tarjeta`, `yape`, `plin` |
| `total` | Decimal(14,2) | Sí | Total del comprobante |
| `es_exportacion` | Boolean | Sí | ¿Es exportación? |
| `tiene_propina` | Boolean | No | ¿Incluye propina? |
| `tiene_detraccion` | Boolean | No | ¿Aplica detracción? |
| `tipo_venta` | String(20) | No | `bien`, `servicio`, `mixto` |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CLIENTE` | contrapartida | 1 | debe | `tipo_pago = credito` |
| `CAJA_VENTA` | contrapartida | 1 | debe | `tipo_pago = contado, medio_pago = efectivo` |
| `BANCO_VENTA` | contrapartida | 1 | debe | `tipo_pago = contado, medio_pago = tarjeta / transferencia` |
| `AGREGADOR` | contrapartida | 1 | debe | `tipo_pago = credito, canal = delivery_app` |
| `VENTA` | ingreso | 2 | haber | `clasificacion_operacion = gravado, exonerado o inafecto` |
| `VENTA_EXPORTACION` | ingreso | 2 | haber | `es_exportacion = true` |
| `VENTA_DESCUENTO` | ingreso (reductor) | 2 | debe | `tiene_descuento_comercial = true` |
| `IVA` | impuesto | 3 | haber | `afecta_iva = true` |
| `PROPINA` | puente | 4 | haber | `tiene_propina = true` |
| `PERCEPCION` | puente | 4 | debe | `tiene_percepcion = true` (PE) |
| `CLIENTE_PERCEPCION` | impuesto | 3 | debe | `cliente_sujeto_percepcion = true` (PE) |
| `RETENCION_CLIENTE` | impuesto | 3 | haber | `cliente_agente_retencion = true` (PE) |
| `ICBPER` | impuesto | 3 | haber | `tiene_icbper = true` (PE) |
| `INC` | impuesto | 3 | haber | `tiene_inc = true` (CO) |
| `PUNTO_FIDELIDAD` | puente | 4 | haber | `redime_puntos = true` |
| `GIFT_CARD` | puente | 4 | haber | `usa_gift_card = true` |
| `SALDO_FAVOR_CLIENTE` | puente | 4 | haber | `usa_saldo_favor = true` |
| `DESCUENTO_CONCEDIDO` | gasto | 2 | debe | `tiene_descuento_financiero = true` |
| `CANAL_COMISION` | gasto | 5 | debe | `canal_comision = true` |
| `COSTO_VENTA` | gasto | 2 | debe | `inventario_permanente = true` |

**Asiento(s) que genera:** 1 asiento en el diario de ventas.

**Patrón de asiento** (venta al crédito gravada por S/ 1,180):

| Rol | Debe | Haber |
|---|---|---|
| `CLIENTE` | 1,180.00 | — |
| `VENTA` | — | 1,000.00 |
| `IVA_DEBITO` | — | 180.00 |

*Cuentas de referencia PCGE: CLIENTE → 121 Clientes / VENTA → 701 Ventas / IVA_DEBITO → 40111 IVA Débito*

**Patrón de asiento** (venta al contado gravada por S/ 118):

| Rol | Debe | Haber |
|---|---|---|
| `CAJA_VENTA` | 118.00 | — |
| `VENTA` | — | 100.00 |
| `IVA_DEBITO` | — | 18.00 |

**Efectos secundarios:**
- Crear CxC (si crédito) o registrar ingreso de caja/banco (si contado)
- Actualizar libro de ventas (registro de comprobante)
- Disminuir inventario si es venta de bienes (vía evento separado o integrado)
- Actualizar kárdex de producto

---

### 4.2 COBRO_REGISTRADO (`COBRO_REGISTRADO`)

**Cuándo ocurre:** Se recibe un pago de un cliente por una o varias facturas emitidas al crédito.  
**Origen:** `ventas` (o `tesoreria` — puede ser dual)

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `medio_pago` | String(20) | Sí | `banco`, `caja`, `tarjeta`, `yape`, `plin`, `canje` |
| `cuenta_bancaria_id` | UUID | Condicional | Si medio de pago = banco |
| `fecha_pago` | Date | Sí | Fecha del cobro |
| `cobros_detalle[]` | Array | Sí | Detalle de facturas canceladas |

**Cada `cobros_detalle`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `venta_id` | UUID | Sí | Factura que se cancela |
| `monto_aplicado` | Decimal(14,2) | Sí | Monto aplicado a esa factura |
| `monto_interes` | Decimal(14,2) | No | Interés por mora |
| `diferencia_cambio` | Decimal(14,2) | No | Diferencia de tipo de cambio |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `BANCO_ENTRADA` | contrapartida | 1 | debe | `medio_pago = banco` |
| `CAJA_ENTRADA` | contrapartida | 1 | debe | `medio_pago = caja` |
| `TARJETA_PENDIENTE` | contrapartida | 1 | debe | `medio_pago = tarjeta` |
| `CLIENTE` | contrapartida | 1 | haber | siempre (reduce CxC) |
| `COMISION_BANCARIA` | gasto | 5 | debe | `comision > 0` |
| `DIF_CAMBIO` | ajuste | 5 | según TC | `moneda_venta != moneda_pago` o TC cambiante |

**Asiento(s) que genera:** 1 asiento en el diario de caja/tesorería.

**Patrón de asiento** (cobro de S/ 1,180 de factura al crédito, depositado en banco):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO_ENTRADA` | 1,180.00 | — |
| `CLIENTE` | — | 1,180.00 |

**Patrón de asiento** (cobro parcial de factura en USD con diferencia de cambio):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO_ENTRADA` | 950.00 | — |
| `CLIENTE` | — | 1,000.00 |
| `DIF_CAMBIO` | 50.00 | — |

*DIF_CAMBIO en el Debe cuando el TC de pago es menor al TC de emisión (pérdida por diferencia de cambio)*

**Efectos secundarios:**
- Reducir CxC del cliente
- Aumentar saldo bancario / caja
- Si total es mayor a la deuda: registrar crédito a favor del cliente

---

### 4.3 NOTA_CREDITO_EMITIDA (`NOTA_CREDITO_EMITIDA`)

**Cuándo ocurre:** Se emite una Nota de Crédito al cliente (devolución, descuento posterior, anulación de venta).  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `venta_original_id` | UUID | Sí | Venta original que se corrige |
| `tipo_nc` | String(30) | Sí | `devolucion_total`, `devolucion_parcial`, `descuento_comercial`, `descuento_pronto_pago`, `anulacion` |
| `total` | Decimal(14,2) | Sí | Monto de la NC |
| `motivo` | String(500) | Sí | Motivo de emisión |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CLIENTE` | contrapartida | 1 | haber | `tipo_pago = credito` en venta original |
| `CAJA_VENTA` | contrapartida | 1 | haber | `tipo_pago = contado` en venta original |
| `VENTA` | ingreso | 2 | debe | siempre (revierte ingreso) |
| `IVA` | impuesto | 3 | debe | venta original gravada |

**Asiento(s) que genera:** 1 asiento en el diario de ventas. La NC invierte el asiento de la venta original.

**Patrón de asiento** (NC de S/ 590 por devolución parcial, venta original crédito):

| Rol | Debe | Haber |
|---|---|---|
| `VENTA` | 500.00 | — |
| `IVA_DEBITO` | 90.00 | — |
| `CLIENTE` | — | 590.00 |

**Efectos secundarios:**
- Reducir CxC del cliente (si crédito) o generar nota a favor
- Actualizar libro de ventas (NC anula comprobante)
- Si fue venta de bienes: revertir salida de kárdex (entrada por devolución)

---

### 4.4 NOTA_DEBITO_EMITIDA (`NOTA_DEBITO_EMITIDA`)

**Cuándo ocurre:** Se emite una Nota de Débito al cliente (interés por mora, ajuste de precio, diferencia de cambio).  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `venta_original_id` | UUID | Sí | Venta original relacionada |
| `tipo_nd` | String(30) | Sí | `interes_mora`, `ajuste_precio`, `diferencia_cambio`, `gastos_cobranza` |
| `total` | Decimal(14,2) | Sí | Monto de la ND |
| `motivo` | String(500) | Sí | Motivo |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CLIENTE` | contrapartida | 1 | debe | siempre (aumenta CxC) |
| `VENTA` | ingreso | 2 | haber | `tipo_nd = ajuste_precio` |
| `OTROS_INGRESOS` | ingreso | 2 | haber | `tipo_nd = interes_mora` o `gastos_cobranza` |
| `IVA` | impuesto | 3 | haber | si la ND está gravada |

**Asiento(s) que genera:** 1 asiento en el diario de ventas.

**Patrón de asiento** (ND por interés moratorio S/ 59, gravado):

| Rol | Debe | Haber |
|---|---|---|
| `CLIENTE` | 59.00 | — |
| `OTROS_INGRESOS` | — | 50.00 |
| `IVA_DEBITO` | — | 9.00 |

**Efectos secundarios:**
- Aumentar CxC del cliente
- Actualizar libro de ventas

---

### 4.5 LIQUIDACION_AGREGADOR (`LIQUIDACION_AGREGADOR`)

**Cuándo ocurre:** Una plataforma agregadora (Rappi, Uber Eats, PedidosYa, etc.) liquida las ventas realizadas a través de su plataforma, detallando comisiones, propinas, y monto neto a transferir.  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `agregador_id` | UUID | Sí | Partner agregador (Rappi, Uber, etc.) |
| `periodo_liquidacion` | String(10) | Sí | Periodo liquidado (semana/mes) |
| `total_ventas_bruto` | Decimal(14,2) | Sí | Ventas brutas del periodo |
| `comision` | Decimal(14,2) | Sí | Comisión del agregador |
| `propina` | Decimal(14,2) | No | Propina recaudada |
| `neto_a_recibir` | Decimal(14,2) | Sí | Monto neto a transferir |
| `iva_comision` | Decimal(14,2) | Sí | IVA de la comisión |
| `detalle_ventas[]` | Array | Sí | IDs de ventas incluidas |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `AGREGADOR` | contrapartida | 1 | debe | siempre (CxC al agregador) |
| `BANCO` | contrapartida | 1 | debe | `neto_a_recibir > 0` |
| `COMISION_AGREGADOR` | gasto | 2 | debe | `comision > 0` |
| `IVA_COMISION` | impuesto | 3 | debe | `iva_comision > 0` |
| `PROPINA_PENDIENTE` | puente | 4 | haber | `propina > 0` |

**Asiento(s) que genera:** 1 asiento en el diario de ventas.

**Patrón de asiento** (liquidación Rappi: S/ 10,000 ventas, S/ 1,200 comisión + S/ 216 IVA, S/ 500 propina):

| Rol | Debe | Haber |
|---|---|---|
| `AGREGADOR` | 9,084.00 | — |
| `COMISION_VENTA` | 1,200.00 | — |
| `IVA_CREDITO` | 216.00 | — |
| `PROPINA_PENDIENTE` | — | 500.00 |
| (Diferencia: neto a recibir + propina = comisión e IVA ya fueron deducidos) | | |

*Nota: Este asiento puede variar según la estructura del convenio con el agregador. Si el agregador factura la comisión, `IVA_CREDITO` es un componente impuesto en el Debe.*

**Efectos secundarios:**
- Crear CxC al agregador por el neto
- Registrar comisión como gasto deducible
- Vincular ventas del periodo con la liquidación

---

### 4.6 CONTRACARGO_RESUELTO (`CONTRACARGO_RESUELTO`)

**Cuándo ocurre:** Un cliente disputa un consumo con tarjeta y el banco emisor resuelve el contracargo a favor del cliente o del comercio.  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `venta_id` | UUID | Sí | Venta original del contracargo |
| `monto_contracargo` | Decimal(14,2) | Sí | Monto del contracargo |
| `comision_contracargo` | Decimal(14,2) | Sí | Comisión que cobra el banco |
| `resultado` | String(20) | Sí | `perdida_comercio`, `ganada_comercio` |

**Componentes que activa (si se pierde el contracargo — resultado = pérdida del comercio):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CLIENTE` | contrapartida | 1 | haber | siempre (reduce CxC original) |
| `PERDIDA_CONTRACARGO` | gasto | 2 | debe | siempre |
| `IVA_CREDITO` | impuesto | 3 | debe | comisión gravada |
| `BANCO` | contrapartida | 1 | haber | si ya se había cobrado |

**Asiento(s) que genera:** 1 asiento en el diario de ventas o caja.

**Patrón de asiento** (contracargo perdido de S/ 118 + comisión S/ 23.60):

| Rol | Debe | Haber |
|---|---|---|
| `PERDIDA_CONTRACARGO` | 100.00 | — |
| `IVA_CREDITO` | 18.00 | — |
| `COMISION_BANCARIA` | 20.00 | — |
| `IVA_CREDITO` | 3.60 | — |
| `CLIENTE` | — | 141.60 |

**Efectos secundarios:**
- Reducir CxC del cliente (o revertir cobro previo)
- Registrar pérdida como gasto deducible (o no, según legislación local)

---

### 4.7 ANTICIPO_CLIENTE (`ANTICIPO_CLIENTE`)

**Cuándo ocurre:** Un cliente entrega un adelanto antes de recibir la factura (seña, depósito en garantía, prepago).  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `monto_anticipo` | Decimal(14,2) | Sí | Monto del anticipo |
| `medio_pago` | String(20) | Sí | `banco`, `caja`, `tarjeta` |
| `cuenta_bancaria_id` | UUID | Condicional | Si medio_pago = banco |
| `afecta_iva` | Boolean | Sí | ¿El anticipo genera IVA? |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `BANCO_ENTRADA` | contrapartida | 1 | debe | `medio_pago = banco` |
| `CAJA_ENTRADA` | contrapartida | 1 | debe | `medio_pago = caja` |
| `ANTICIPO_CLIENTE` | puente | 4 | haber | siempre |
| `IVA_DEBITO` | impuesto | 3 | haber | `afecta_iva = true` |

**Asiento(s) que genera:** 1 asiento en el diario de caja.

**Patrón de asiento** (anticipo de cliente S/ 590 depositado en banco):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO_ENTRADA` | 590.00 | — |
| `ANTICIPO_CLIENTE` | — | 500.00 |
| `IVA_DEBITO` | — | 90.00 |

*Cuentas de referencia PCGE: ANTICIPO_CLIENTE → 121 Clientes - Anticipos (o 122 Anticipos de Clientes, subcuenta de pasivo)*

**Efectos secundarios:**
- Aumentar saldo bancario
- Registrar anticipo (pasivo por entregar)

---

### 4.8 APLICACION_ANTICIPO_CLIENTE (`APLICACION_ANTICIPO_CLIENTE`)

**Cuándo ocurre:** El anticipo recibido se aplica contra la factura final emitida al cliente.  
**Origen:** `ventas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cliente_id` | UUID | Sí | Partner cliente |
| `venta_id` | UUID | Sí | Factura donde se aplica |
| `anticipo_id` | UUID | Sí | Anticipo a aplicar |
| `monto_aplicado` | Decimal(14,2) | Sí | Monto a aplicar |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `ANTICIPO_CLIENTE` | puente | 4 | debe | siempre (cancela el pasivo) |
| `CLIENTE` | contrapartida | 1 | haber | siempre (reduce la CxC neta) |

**Asiento(s) que genera:** 1 asiento auxiliar. Similar a `APLICACION_ANTICIPO`, puede integrarse en la factura final o ser evento separado.

**Patrón de asiento** (aplicación de S/ 590 de anticipo contra factura de S/ 1,180):

| Rol | Debe | Haber |
|---|---|---|
| `ANTICIPO_CLIENTE` | 590.00 | — |
| `CLIENTE` | — | 590.00 |

*CxC neta = 1,180 - 590 = 590*

**Efectos secundarios:**
- Marcar anticipo como aplicado
- Reducir CxC del cliente

---

## 5. Eventos de Tesorería

### 5.1 PAGO_PROVEEDOR (`PAGO_PROVEEDOR`)

**Cuándo ocurre:** Se realiza un pago a un proveedor que cancela una o varias facturas registradas al crédito.  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `medio_pago` | String(20) | Sí | `banco`, `caja`, `cheque`, `canje` |
| `cuenta_bancaria_id` | UUID | Condicional | Si medio_pago = banco |
| `fecha_pago` | Date | Sí | Fecha de la operación |
| `tipo_operacion` | String(20) | Sí | `normal`, `bancarizado`, `sin_bancarizar` |
| `pagos_detalle[]` | Array | Sí | Detalle de facturas canceladas |

**Cada `pagos_detalle`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `compra_id` | UUID | Sí | Factura que se paga |
| `monto_aplicado` | Decimal(14,2) | Sí | Monto aplicado |
| `monto_detraccion` | Decimal(14,2) | No | Detracción si aplica |
| `diferencia_cambio` | Decimal(14,2) | No | Diferencia de TC |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | debe | siempre (reduce CxP) |
| `BANCO_SALIDA` | contrapartida | 1 | haber | `medio_pago = banco` |
| `CAJA_SALIDA` | contrapartida | 1 | haber | `medio_pago = caja` |
| `DIF_CAMBIO` | ajuste | 5 | según TC | moneda compra ≠ moneda pago |
| `GMF` | impuesto | 3 | debe | `aplica_gmf = true` (CO) |
| `ISD` | impuesto | 3 | debe | `aplica_isd = true` (EC) |

**Asiento(s) que genera:** 1 asiento en el diario de caja/tesorería.

**Patrón de asiento** (pago de S/ 1,180 a proveedor por banco):

| Rol | Debe | Haber |
|---|---|---|
| `PROVEEDOR` | 1,180.00 | — |
| `BANCO_SALIDA` | — | 1,180.00 |

**Patrón de asiento** (pago parcial con diferencia de cambio — compra en USD, TC original 3.75, TC pago 3.80):

| Rol | Debe | Haber |
|---|---|---|
| `PROVEEDOR` | 3,750.00 | — |
| `DIF_CAMBIO` | 50.00 | — |
| `BANCO_SALIDA` | — | 3,800.00 |

*`DIF_CAMBIO` en el Debe = gasto por diferencia de cambio (TC subió)*

**Efectos secundarios:**
- Reducir CxP del proveedor
- Reducir saldo bancario / caja
- Registrar pago en libro de tesorería

---

### 5.2 PAGO_DETRACCION (`PAGO_DETRACCION`)

**Cuándo ocurre:** Se efectúa el pago de una detracción al SOLES (Cuenta de Detracciones del Banco de la Nación en Perú) o ente recaudador equivalente en otros países.  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `compra_id` | UUID | Sí | Compra que originó la detracción |
| `monto_detraccion` | Decimal(14,2) | Sí | Monto depositado |
| `fecha_pago` | Date | Sí | Fecha del depósito |
| `numero_constancia` | String(50) | Sí | Número de constancia de depósito |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `DETRACCION` | puente | 4 | debe | siempre (cancela el pasivo de detracción) |
| `BANCO_SALIDA` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (depósito de detracción S/ 354):

| Rol | Debe | Haber |
|---|---|---|
| `DETRACCION` | 354.00 | — |
| `BANCO_SALIDA` | — | 354.00 |

*Cuentas de referencia PCGE: DETRACCION → 4022 Cuenta Corriente de Detracciones / BANCO → 104 Bancos*

**Efectos secundarios:**
- Reducir saldo bancario
- Actualizar registro de detracción como pagada

---

### 5.3 TRANSFERENCIA_INTERNA (`TRANSFERENCIA_INTERNA`)

**Cuándo ocurre:** Se transfiere dinero entre cuentas bancarias de la misma empresa (misma moneda o distinta moneda).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `cuenta_origen_id` | UUID | Sí | Cuenta bancaria origen |
| `cuenta_destino_id` | UUID | Sí | Cuenta bancaria destino |
| `monto_origen` | Decimal(14,2) | Sí | Monto debitado de la cuenta origen |
| `monto_destino` | Decimal(14,2) | Sí | Monto acreditado en la cuenta destino |
| `moneda_origen_id` | UUID | Sí | Moneda de la cuenta origen |
| `moneda_destino_id` | UUID | Sí | Moneda de la cuenta destino |
| `tipo_cambio_aplicado` | Decimal(12,4) | Condicional | TC si monedas distintas |
| `motivo` | String(200) | Sí | `traspaso_fondos`, `conversion_moneda`, `centralizacion` |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `TRANSFERENCIA_ORIGEN` | contrapartida | 1 | haber | siempre |
| `TRANSFERENCIA_DESTINO` | contrapartida | 1 | debe | siempre |
| `DIF_CAMBIO` | ajuste | 5 | según TC | moneda_origen ≠ moneda_destino |
| `ITF` | impuesto | 3 | debe | `aplica_itf = true` (PE) |
| `GMF` | impuesto | 3 | debe | `aplica_gmf = true` (CO) |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería (caja/banco).

**Patrón de asiento** (transferencia entre cuentas misma moneda, S/ 5,000):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO_DESTINO` | 5,000.00 | — |
| `BANCO_ORIGEN` | — | 5,000.00 |

**Patrón de asiento** (conversión de USD a PEN, USD 1,000 a TC 3.75, reciben S/ 3,750):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO_DESTINO` (S/ PEN) | 3,750.00 | — |
| `BANCO_ORIGEN` (cuenta USD) | — | 3,750.00 |

**Efectos secundarios:**
- Disminuir saldo cuenta origen
- Aumentar saldo cuenta destino
- Registrar la operación en movimientos bancarios

---

### 5.4 APERTURA_CAJA_CHICA (`APERTURA_CAJA_CHICA`)

**Cuándo ocurre:** Se constituye un fondo de caja chica (efectivo asignado para gastos menores).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `caja_chica_id` | UUID | Sí | Identificador del fondo |
| `monto_apertura` | Decimal(14,2) | Sí | Monto del fondo asignado |
| `responsable_id` | UUID | Sí | Empleado responsable |
| `cuenta_bancaria_origen_id` | UUID | Sí | Cuenta de donde se retira el efectivo |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CAJA_CHICA` | contrapartida | 1 | debe | siempre |
| `BANCO_SALIDA` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (apertura de caja chica S/ 2,000, retirado de banco):

| Rol | Debe | Haber |
|---|---|---|
| `CAJA_CHICA` | 2,000.00 | — |
| `BANCO_SALIDA` | — | 2,000.00 |

*Cuentas de referencia PCGE: CAJA_CHICA → 101 Caja / BANCO → 104 Bancos*

**Efectos secundarios:**
- Reducir saldo bancario
- Registrar el fondo de caja chica (saldo disponible)

---

### 5.5 GASTO_CAJA_CHICA (`GASTO_CAJA_CHICA`)

**Cuándo ocurre:** Se realiza un gasto menor pagado con el fondo de caja chica (movilidad, útiles, refrigerios, etc.).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `caja_chica_id` | UUID | Sí | Fondo de caja chica |
| `monto` | Decimal(14,2) | Sí | Monto del gasto |
| `tipo_gasto` | String(30) | Sí | `movilidad`, `utiles`, `refrigerio`, `servicio_menor`, `otro` |
| `responsable_id` | UUID | Sí | Quién rinde el gasto |
| `comprobante_ref` | String(50) | No | Referencia del comprobante (boleta, ticket) |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `GASTO_CC` | gasto | 2 | debe | siempre |
| `CAJA_CHICA` | contrapartida | 1 | haber | siempre (reduce el fondo) |

**Asiento(s) que genera:** 1 asiento en el diario de caja chica (o tesorería).

**Patrón de asiento** (gasto de S/ 85 en movilidad):

| Rol | Debe | Haber |
|---|---|---|
| `GASTO_CC` | 85.00 | — |
| `CAJA_CHICA` | — | 85.00 |

*Cuentas de referencia PCGE: GASTO_CC → 63 Gastos de personal / servicios / CAJA_CHICA → 101 Caja*

**Efectos secundarios:**
- Reducir saldo del fondo de caja chica

---

### 5.6 REPOSICION_CAJA_CHICA (`REPOSICION_CAJA_CHICA`)

**Cuándo ocurre:** Se repone el fondo de caja chica (se gira dinero del banco para devolver el fondo a su monto original).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `caja_chica_id` | UUID | Sí | Fondo a reponer |
| `monto_reposicion` | Decimal(14,2) | Sí | Monto a reponer |
| `cuenta_bancaria_origen_id` | UUID | Sí | Cuenta de donde se retira |
| `gastos_detalle[]` | Array | Sí | Detalle de gastos rendidos |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CAJA_CHICA` | contrapartida | 1 | debe | siempre (recupera el fondo) |
| `BANCO_SALIDA` | contrapartida | 1 | haber | siempre |
| `GASTO_CC` | gasto | 2 | debe | si no se contabilizó en el gasto individual (según configuración) |

*Nota: Si `GASTO_CAJA_CHICA` ya contabilizó cada gasto, la reposición solo recarga el fondo (CAJA_CHICA vs BANCO). La configuración por empresa decide si los gastos se contabilizan en el gasto individual o al reponer.*

**Asiento(s) que genera:** 1 asiento en el diario de tesorería (o caja chica).

**Patrón de asiento** (reposición de S/ 1,800 que recupera el fondo a S/ 2,000):

| Rol | Debe | Haber |
|---|---|---|
| `CAJA_CHICA` | 1,800.00 | — |
| `BANCO_SALIDA` | — | 1,800.00 |

**Patrón de asiento** (reposición con contabilización de gastos al reponer):

| Rol | Debe | Haber |
|---|---|---|
| `CAJA_CHICA` | 2,000.00 | — |
| `GASTO_CC` (Movilidad) | 400.00 | — |
| `GASTO_CC` (Útiles) | 600.00 | — |
| `GASTO_CC` (Refrigerio) | 800.00 | — |
| `GASTO_CC` (Servicios) | 200.00 | — |
| `BANCO_SALIDA` | — | 2,000.00 |

*En este patrón, la reposición también reconoce los gastos. El fondo queda en S/ 2,000 nuevamente.*

**Efectos secundarios:**
- Reducir saldo bancario
- Aumentar saldo del fondo de caja chica a su nivel original
- Si aplica: contabilizar gastos rendidos

---

### 5.7 PRESTAMO_DESEMBOLSADO (`PRESTAMO_DESEMBOLSADO`)

**Cuándo ocurre:** Se recibe un desembolso de préstamo bancario o financiero.  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `entidad_financiera_id` | UUID | Sí | Banco / entidad |
| `monto_desembolsado` | Decimal(14,2) | Sí | Monto recibido |
| `plazo_meses` | Integer | Sí | Plazo en meses |
| `tasa_interes` | Decimal(5,2) | Sí | Tasa anual |
| `cuenta_bancaria_id` | UUID | Sí | Cuenta donde se deposita |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `BANCO` | contrapartida | 1 | debe | siempre |
| `PRESTAMO_CAPITAL` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (préstamo BCP S/ 100,000 depositado en cta. cte.):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO` | 100,000.00 | — |
| `PRESTAMO_CAPITAL` | — | 100,000.00 |

**Efectos secundarios:**
- Aumentar saldo bancario
- Registrar deuda en control de préstamos

---

### 5.8 PRESTAMO_CUOTA_PAGADA (`PRESTAMO_CUOTA_PAGADA`)

**Cuándo ocurre:** Se paga una cuota de préstamo (capital + intereses).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `prestamo_id` | UUID | Sí | Préstamo |
| `cuota_numero` | Integer | Sí | Número de cuota |
| `amortizacion` | Decimal(14,2) | Sí | Amortización de capital |
| `interes` | Decimal(14,2) | Sí | Interés de la cuota |
| `total_cuota` | Decimal(14,2) | Sí | Total pagado |
| `cuenta_bancaria_id` | UUID | Sí | Cuenta de cargo |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PRESTAMO_CAPITAL` | contrapartida | 1 | debe | `amortizacion > 0` |
| `INTERES_POR_PAGAR` | puente | 5 | debe | `interes > 0` |
| `BANCO` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (cuota S/ 12,000: capital S/ 10,000 + interés S/ 2,000):

| Rol | Debe | Haber |
|---|---|---|
| `PRESTAMO_CAPITAL` | 10,000.00 | — |
| `INTERES_POR_PAGAR` | 2,000.00 | — |
| `BANCO` | — | 12,000.00 |

**Efectos secundarios:**
- Reducir saldo bancario
- Actualizar cronograma de préstamo

---

### 5.9 LIQUIDACION_FACTORING (`LIQUIDACION_FACTORING`)

**Cuándo ocurre:** Se liquida una operación de factoring (cesión de facturas por cobrar a cambio de liquidez inmediata menos comisión).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `entidad_factoring_id` | UUID | Sí | Entidad financiera |
| `monto_cedido` | Decimal(14,2) | Sí | Monto de facturas cedidas |
| `comision` | Decimal(14,2) | Sí | Comisión del factoring |
| `neto_recibido` | Decimal(14,2) | Sí | Monto neto recibido |
| `cuenta_bancaria_id` | UUID | Sí | Cuenta de abono |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `BANCO` | contrapartida | 1 | debe | siempre |
| `GASTO_FINANCIERO` | gasto | 5 | debe | `comision > 0` |
| `CLIENTE` | contrapartida | 1 | haber | siempre (reduce CxC) |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (factoring S/ 50,000, comisión 3% = S/ 1,500, neto S/ 48,500):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO` | 48,500.00 | — |
| `GASTO_FINANCIERO` | 1,500.00 | — |
| `CLIENTE` | — | 50,000.00 |

**Efectos secundarios:**
- Aumentar saldo bancario
- Reducir CxC del cliente
- Registrar operación de factoring

---

### 5.10 CIERRE_CAJA (`CIERRE_CAJA`)

**Cuándo ocurre:** Se cierra la caja / turno y se determina si hay faltante o sobrante de efectivo.  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `caja_id` | UUID | Sí | Caja / punto de venta |
| `efectivo_esperado` | Decimal(14,2) | Sí | Efectivo esperado según sistema |
| `efectivo_contado` | Decimal(14,2) | Sí | Efectivo real contado |
| `diferencia` | Decimal(14,2) | Sí | Diferencia (positiva = sobrante, negativa = faltante) |
| `resultado` | String(10) | Sí | `faltante`, `sobrante` |

**Componentes que activa (faltante):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `FALTANTE_CAJA` | gasto | 5 | debe | `resultado = faltante` |

**Componentes que activa (sobrante):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `FALTANTE_CAJA` | ingreso | 5 | haber | `resultado = sobrante` |

**Asiento(s) que genera:** 1 asiento en el diario de caja.

**Patrón de asiento** (faltante de S/ 50 en cierre de caja):

| Rol | Debe | Haber |
|---|---|---|
| `FALTANTE_CAJA` | 50.00 | — |

*La contrapartida queda pendiente (se define en la liquidación del turno).*

**Efectos secundarios:**
- Registrar diferencia para conciliación
- Notificar al responsable de caja

---

### 5.11 LIQUIDACION_TARJETA (`LIQUIDACION_TARJETA`)

**Cuándo ocurre:** El banco / medio de pago liquida las transacciones con tarjeta del período.  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `medio_pago_id` | UUID | Sí | Medio de pago (Visa, MC, etc.) |
| `periodo_liquidacion` | String(10) | Sí | Período liquidado |
| `monto_bruto` | Decimal(14,2) | Sí | Monto bruto de transacciones |
| `comision` | Decimal(14,2) | Sí | Comisión del medio de pago |
| `monto_neto` | Decimal(14,2) | Sí | Neto depositado |
| `monto_esperado` | Decimal(14,2) | Sí | Monto esperado según sistema |
| `cuenta_bancaria_id` | UUID | Sí | Cuenta donde se deposita |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `BANCO` | contrapartida | 1 | debe | siempre (neto) |
| `COMISION_BANCARIA` | gasto | 5 | debe | `comision > 0` |
| `DIFERENCIA_LIQUIDACION` | gasto / ingreso | 5 | según TC | `monto_neto != monto_esperado` |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (liquidación Visa: S/ 10,000 bruto, S/ 300 comisión, S/ 9,700 neto):

| Rol | Debe | Haber |
|---|---|---|
| `BANCO` | 9,700.00 | — |
| `COMISION_BANCARIA` | 300.00 | — |
| `AGREGADOR` | — | 10,000.00 |

*Alternativa: si la comisión ya se contabilizó al momento de la venta, solo entra el neto.*

**Efectos secundarios:**
- Aumentar saldo bancario
- Conciliar transacciones pendientes

---

### 5.12 COMPENSACION_REGISTRADA (`COMPENSACION_REGISTRADA`)

**Cuándo ocurre:** Se compensan cuentas por cobrar y por pagar del mismo tercero (neteo).  
**Origen:** `tesoreria`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `partner_id` | UUID | Sí | Tercero (cliente y proveedor) |
| `monto_cxc` | Decimal(14,2) | Sí | Saldo por cobrar |
| `monto_cxp` | Decimal(14,2) | Sí | Saldo por pagar |
| `monto_compensado` | Decimal(14,2) | Sí | Menor de los dos saldos |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `COMPENSACION_CXC` | contrapartida | 1 | haber | siempre (reduce CxC) |
| `COMPENSACION_CXP` | contrapartida | 1 | debe | siempre (reduce CxP) |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería (o auxiliar).

**Patrón de asiento** (cliente debe S/ 10,000 y proveedor cobra S/ 3,000. Se compensan S/ 3,000):

| Rol | Debe | Haber |
|---|---|---|
| `COMPENSACION_CXP` | 3,000.00 | — |
| `COMPENSACION_CXC` | — | 3,000.00 |

**Efectos secundarios:**
- Actualizar saldos CxC y CxP del partner
- Registrar compensación para control interno

---

## 6. Eventos de Activos Fijos

### 6.1 COMPRA_ACTIVO_FIJO (`COMPRA_ACTIVO_FIJO`)

**Cuándo ocurre:** Se adquiere un activo fijo (maquinaria, vehículo, equipo de cómputo, mobiliario, etc.) y se incorpora al patrimonio de la empresa.  
**Origen:** `activos_fijos`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `activo_fijo_id` | UUID | Sí | ID del activo |
| `tipo_activo` | String(30) | Sí | `maquinaria`, `vehiculo`, `equipo_computo`, `mobiliario`, `edificio`, `terreno`, `otro` |
| `costo_adquisicion` | Decimal(14,2) | Sí | Costo total de adquisición |
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `fecha_adquisicion` | Date | Sí | Fecha de compra |
| `vida_util` | Integer | Sí | Vida útil en meses |
| `metodo_depreciacion` | String(20) | Sí | `linea_recta`, `saldos_decrecientes` |
| `tiene_iva` | Boolean | Sí | ¿La compra tiene IVA? |
| `tipo_compra` | String(20) | Sí | `contado`, `credito` |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | haber | `tipo_compra = credito` |
| `BANCO_SALIDA` | contrapartida | 1 | haber | `tipo_compra = contado` |
| `ACTIVO_FIJO` | gasto (activable) | 2 | debe | siempre |
| `IVA_CREDITO` | impuesto | 3 | debe | `tiene_iva = true` |

**Asiento(s) que genera:** 1 asiento en el diario de activos fijos (o compras especiales).

**Patrón de asiento** (compra de vehículo S/ 50,000 + IVA S/ 9,000, crédito):

| Rol | Debe | Haber |
|---|---|---|
| `ACTIVO_FIJO` | 50,000.00 | — |
| `IVA_CREDITO` | 9,000.00 | — |
| `PROVEEDOR` | — | 59,000.00 |

*Cuentas de referencia PCGE: ACTIVO_FIJO → 33 Inmuebles, Maquinaria y Equipo / PROVEEDOR → 421 Proveedores*

**Efectos secundarios:**
- Crear ficha de activo fijo con costo y vida útil
- Crear CxP (si crédito)
- Programar cronograma de depreciación

---

### 6.2 DEPRECIACION_MENSUAL (`DEPRECIACION_MENSUAL`)

**Cuándo ocurre:** Se ejecuta el proceso mensual de depreciación de activos fijos. Generalmente es un proceso batch que deprecia todos los activos activos del mes.  
**Origen:** `activos_fijos`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `periodo_contable_id` | UUID | Sí | Periodo (mes/año) a depreciar |
| `depreciaciones[]` | Array | Sí | Detalle de depreciaciones del periodo |

**Cada `depreciaciones[]`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `activo_fijo_id` | UUID | Sí | Activo a depreciar |
| `monto_depreciacion` | Decimal(14,2) | Sí | Monto del mes |
| `depreciacion_acumulada` | Decimal(14,2) | Sí | Depreciación acumulada total |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `DEPRECIACION` | gasto | 2 | debe | siempre |
| `DEPRECIACION_ACUM` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento consolidado por periodo (puede ser por activo o agrupado según configuración).

**Patrón de asiento** (depreciación del mes — varios activos, total S/ 5,200):

| Rol | Debe | Haber |
|---|---|---|
| `DEPRECIACION` (total consolidado) | 5,200.00 | — |
| `DEPRECIACION_ACUM` (total consolidado) | — | 5,200.00 |

*Cuentas de referencia PCGE: DEPRECIACION → 68 Provisiones del Ejercicio / DEPRECIACION_ACUM → 39 Depreciación Acumulada*

*Alternativa: Puede ir por centro de costo: `DEPRECIACION` + `centro_costo_id` en cada línea.*

**Efectos secundarios:**
- Actualizar depreciación acumulada del activo
- Verificar que no exceda la vida útil

---

### 6.3 BAJA_ACTIVO (`BAJA_ACTIVO`)

**Cuándo ocurre:** Un activo fijo se da de baja por obsolescencia, pérdida, robo, destrucción o donación. No hay contraprestación económica.  
**Origen:** `activos_fijos`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `activo_fijo_id` | UUID | Sí | Activo a dar de baja |
| `costo_original` | Decimal(14,2) | Sí | Costo original |
| `depreciacion_acumulada` | Decimal(14,2) | Sí | Depreciación acumulada hasta la fecha |
| `valor_libros` | Decimal(14,2) | Sí | Valor neto contable (costo - depreciación) |
| `motivo_baja` | String(30) | Sí | `obsolescencia`, `perdida`, `robo`, `destruccion`, `donacion` |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `DEPRECIACION_ACUM` | contrapartida | 1 | debe | siempre |
| `ACTIVO_FIJO` | gasto (activable) | 2 | haber | siempre (da de baja el activo) |
| `PERDIDA_BAJA` | gasto | 2 | debe | si valor_libros > 0 |

**Asiento(s) que genera:** 1 asiento en el diario de activos fijos.

**Patrón de asiento** (baja de equipo de cómputo: costo S/ 10,000, depreciación acumulada S/ 8,000):

| Rol | Debe | Haber |
|---|---|---|
| `DEPRECIACION_ACUM` | 8,000.00 | — |
| `PERDIDA_BAJA` | 2,000.00 | — |
| `ACTIVO_FIJO` | — | 10,000.00 |

*PERDIDA_BAJA reconoce el valor no depreciado como gasto.*

**Efectos secundarios:**
- Retirar activo del registro de activos fijos (desactivar)
- Ajustar depreciaciones futuras

---

### 6.4 VENTA_ACTIVO (`VENTA_ACTIVO`)

**Cuándo ocurre:** Se vende un activo fijo a un tercero (hay contraprestación económica).  
**Origen:** `activos_fijos`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `activo_fijo_id` | UUID | Sí | Activo vendido |
| `cliente_id` | UUID | Sí | Comprador |
| `precio_venta` | Decimal(14,2) | Sí | Precio de venta (sin impuesto) |
| `iva_venta` | Decimal(14,2) | Sí | IVA de la venta |
| `costo_original` | Decimal(14,2) | Sí | Costo original |
| `depreciacion_acumulada` | Decimal(14,2) | Sí | Depreciación acumulada |
| `valor_libros` | Decimal(14,2) | Sí | Valor neto contable |
| `tipo_pago` | String(10) | Sí | `contado`, `credito` |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CLIENTE` | contrapartida | 1 | debe | `tipo_pago = credito` |
| `CAJA_ENTRADA` | contrapartida | 1 | debe | `tipo_pago = contado` |
| `DEPRECIACION_ACUM` | contrapartida | 1 | debe | siempre |
| `ACTIVO_FIJO` | gasto (activable) | 2 | haber | siempre (da de baja) |
| `VENTA_ACTIVO` | ingreso | 2 | haber | siempre (ingreso por venta) |
| `GANANCIA_VENTA_AF` | ingreso | 2 | haber | si precio > valor_libros |
| `PERDIDA_VENTA_AF` | gasto | 2 | debe | si precio < valor_libros |
| `IVA_DEBITO` | impuesto | 3 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de activos fijos (o ventas especiales). La resolución decide si usar `GANANCIA_VENTA_AF` o `PERDIDA_VENTA_AF` según el cálculo automático que hace el motor comparando precio vs valor libros.

**Patrón de asiento** (venta de vehículo con ganancia: costo S/ 60,000, depreciación S/ 20,000, venta S/ 45,000 + IVA S/ 8,100):

| Rol | Debe | Haber |
|---|---|---|
| `CLIENTE` | 53,100.00 | — |
| `DEPRECIACION_ACUM` | 20,000.00 | — |
| `ACTIVO_FIJO` | — | 60,000.00 |
| `VENTA_ACTIVO` | — | 45,000.00 |
| `GANANCIA_VENTA_AF` | — | 5,000.00 |
| `IVA_DEBITO` | — | 8,100.00 |

*Explicación: El motor determina ganancia vs pérdida automáticamente: precio_venta (45K) vs valor_libros (40K) → ganancia de 5K.*

**Efectos secundarios:**
- Retirar activo del registro (desactivar)
- Crear CxC (si crédito)
- Actualizar libro de ventas

---

### 6.5 REVALUACION_ACTIVO (`REVALUACION_ACTIVO`)

**Cuándo ocurre:** Se revalúa un activo fijo (generalmente por peritaje o política contable, permitido bajo NIIF).  
**Origen:** `activos_fijos`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `activo_fijo_id` | UUID | Sí | Activo revaluado |
| `valor_libros_anterior` | Decimal(14,2) | Sí | Valor neto antes de revaluación |
| `valor_revaluado` | Decimal(14,2) | Sí | Valor neto después de revaluación |
| `diferencia` | Decimal(14,2) | Sí | Diferencia (positiva = aumento, negativa = disminución) |
| `fecha_revaluacion` | Date | Sí | Fecha del peritaje |
| `tipo_revaluacion` | String(20) | Sí | `aumento`, `disminucion` |

**Componentes que activa (aumento):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `ACTIVO_FIJO` | gasto (activable) | 2 | debe | siempre (aumenta valor del activo) |
| `EXCEDENTE_REVALUACION` | patrimonio | 2 | haber | `tipo_revaluacion = aumento` |

**Componentes que activa (disminución):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PERDIDA_REVALUACION` | gasto | 2 | debe | `tipo_revaluacion = disminucion` |
| `ACTIVO_FIJO` | gasto (activable) | 2 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de activos fijos.

**Patrón de asiento** (revaluación de edificio: de S/ 200,000 a S/ 280,000):

| Rol | Debe | Haber |
|---|---|---|
| `ACTIVO_FIJO` | 80,000.00 | — |
| `EXCEDENTE_REVALUACION` | — | 80,000.00 |

*Cuentas de referencia PCGE: ACTIVO_FIJO → 33 Inmuebles, Maquinaria y Equipo / EXCEDENTE_REVALUACION → 57 Excedente de Revaluación*

**Patrón de asiento** (disminución de S/ 200,000 a S/ 150,000):

| Rol | Debe | Haber |
|---|---|---|
| `PERDIDA_REVALUACION` | 50,000.00 | — |
| `ACTIVO_FIJO` | — | 50,000.00 |

**Efectos secundarios:**
- Actualizar valor contable del activo
- Ajustar el cronograma de depreciación (nueva vida útil o nuevo valor)
- Si hay excedente previo: primero consume el excedente antes de reconocer pérdida

---

### 6.6 LEASING_INICIADO (`LEASING_INICIADO`)

**Cuándo ocurre:** Se inicia un contrato de arrendamiento financiero (leasing) que debe reconocerse como activo por derecho de uso (NIIF 16 / NIC 17).  
**Origen:** `activos_fijos`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `activo_id` | UUID | Sí | Activo arrendado |
| `proveedor_id` | UUID | Sí | Entidad financiera / arrendador |
| `valor_presente` | Decimal(14,2) | Sí | Valor presente de los pagos futuros |
| `plazo_meses` | Integer | Sí | Plazo del contrato |
| `tasa_interes` | Decimal(5,2) | Sí | Tasa implícita del arrendamiento |
| `tiene_iva` | Boolean | Sí | ¿Aplica IVA? |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `LEASING_ACTIVO` | activo | 2 | debe | siempre |
| `LEASING_PASIVO` | pasivo | 1 | haber | siempre |
| `IVA` | impuesto | 3 | debe | `tiene_iva = true` |

**Asiento(s) que genera:** 1 asiento en el diario de activos fijos.

**Patrón de asiento** (leasing vehículo VP = S/ 180,000, IVA = S/ 32,400):

| Rol | Debe | Haber |
|---|---|---|
| `LEASING_ACTIVO` | 180,000.00 | — |
| `IVA` | 32,400.00 | — |
| `LEASING_PASIVO` | — | 212,400.00 |

**Efectos secundarios:**
- Registrar activo por derecho de uso
- Programar cronograma de pagos y amortización

---

### 6.7 LEASING_CUOTA_PAGADA (`LEASING_CUOTA_PAGADA`)

**Cuándo ocurre:** Se paga una cuota del arrendamiento financiero, incluyendo amortización de capital e intereses.  
**Origen:** `activos_fijos` (o `tesoreria`)

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `leasing_id` | UUID | Sí | Contrato de leasing |
| `cuota_numero` | Integer | Sí | Número de cuota |
| `amortizacion` | Decimal(14,2) | Sí | Amortización de capital |
| `interes` | Decimal(14,2) | Sí | Interés de la cuota |
| `total_cuota` | Decimal(14,2) | Sí | Total pagado |
| `cuenta_bancaria_id` | UUID | Sí | Cuenta desde donde se paga |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `LEASING_PASIVO` | pasivo | 1 | debe | siempre (reduce pasivo) |
| `GASTO_FINANCIERO` | gasto | 5 | debe | `interes > 0` |
| `BANCO` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería.

**Patrón de asiento** (cuota S/ 8,500: capital S/ 6,000 + interés S/ 2,500):

| Rol | Debe | Haber |
|---|---|---|
| `LEASING_PASIVO` | 6,000.00 | — |
| `GASTO_FINANCIERO` | 2,500.00 | — |
| `BANCO` | — | 8,500.00 |

**Efectos secundarios:**
- Reducir saldo bancario
- Actualizar cronograma de leasing (cuota pagada)
- El interés es gasto financiero deducible

---

## 7. Eventos de Planillas

### 7.1 PLANILLA_DEVENGADA (`PLANILLA_DEVENGADA`)

**Cuándo ocurre:** Se devenga (reconoce) la planilla mensual de remuneraciones del personal. Es el momento en que la empresa reconoce el gasto y las obligaciones laborales.  
**Origen:** `planillas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `periodo_planilla` | String(7) | Sí | Periodo (YYYY-MM) |
| `tipo_planilla` | String(20) | Sí | `mensual`, `quincenal`, `semanal` |
| `empleados[]` | Array | Sí | Detalle por empleado |

**Cada `empleados[]`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `empleado_id` | UUID | Sí | Partner empleado |
| `sueldo_base` | Decimal(14,2) | Sí | Sueldo o jornal |
| `asignaciones` | Decimal(14,2) | Sí | Bonos, horas extra, comisiones |
| `descuentos` | Decimal(14,2) | Sí | Descuentos (adelantos, faltas, tardanzas) |
| `aporte_empleado_onp` | Decimal(14,2) | Sí | Aporte ONP (empleado) |
| `aporte_empleado_afp` | Decimal(14,2) | Sí | Aporte AFP (empleado) |
| `aporte_empleador_essalud` | Decimal(14,2) | Sí | Aporte Essalud (empleador) |
| `aporte_empleador_onp` | Decimal(14,2) | Sí | Aporte ONP (empleador) |
| `aporte_sctr` | Decimal(14,2) | No | Seguro Complementario Trabajo Riesgo |
| `neto_pagar` | Decimal(14,2) | Sí | Neto a pagar al empleado |
| `centro_costo_id` | UUID | No | Centro de costo del empleado |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `SUELDOS_PAGAR` | contrapartida | 1 | haber | siempre (neto a pagar) |
| `ONP_AFP_PAGAR` | puente | 4 | haber | si hay descuento ONP/AFP |
| `ESSALUD_PAGAR` | puente | 4 | haber | si hay Essalud |
| `SCTR_PAGAR` | puente | 4 | haber | si hay SCTR |
| `SUELDOS_GASTO` | gasto | 2 | debe | siempre (total devengado) |
| `ESSALUD_GASTO` | gasto | 2 | debe | si hay aporte empleador |
| `SCTR_GASTO` | gasto | 2 | debe | si hay SCTR |

**Asiento(s) que genera:** 1 asiento en el diario de planillas. Puede ser por empleado (individual) o consolidado por centro de costo (batch).

**Patrón de asiento** (planilla mensual, total empleados — consolidado S/ 150,000):

| Rol | Debe | Haber |
|---|---|---|
| `SUELDOS_GASTO` | 100,000.00 | — |
| `ESSALUD_GASTO` | 9,000.00 | — |
| `SCTR_GASTO` | 1,000.00 | — |
| `SUELDOS_PAGAR` | — | 75,000.00 |
| `ONP_AFP_PAGAR` | — | 25,000.00 |
| `ESSALUD_PAGAR` | — | 9,000.00 |
| `SCTR_PAGAR` | — | 1,000.00 |

*Cuentas de referencia PCGE: SUELDOS_GASTO → 621 Sueldos / ESSALUD_GASTO → 623 Seguridad Social / SUELDOS_PAGAR → 411 Remuneraciones por Pagar / ONP_AFP_PAGAR → 413 Instituciones de Previsión Social*

**Efectos secundarios:**
- Registrar obligaciones (planilla por pagar)
- Generar reporte de retenciones (PLAME, AFP Net)
- Actualizar libro de planillas

---

### 7.2 PLANILLA_PAGADA (`PLANILLA_PAGADA`)

**Cuándo ocurre:** Se realiza el pago de las remuneraciones a los empleados (transferencia bancaria, efectivo) y se pagan los aportes a ONP/AFP y Essalud.  
**Origen:** `planillas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `periodo_planilla` | String(7) | Sí | Periodo (YYYY-MM) |
| `fecha_pago` | Date | Sí | Fecha del pago |
| `total_neto_pagado` | Decimal(14,2) | Sí | Total neto transferido a empleados |
| `total_onp_afp` | Decimal(14,2) | Sí | Total pagado a ONP/AFP |
| `total_essalud` | Decimal(14,2) | Sí | Total pagado a Essalud |
| `total_sctr` | Decimal(14,2) | No | Total pagado a SCTR |
| `cuenta_bancaria_id` | UUID | Sí | Cuenta desde donde se paga |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `SUELDOS_PAGAR` | contrapartida | 1 | debe | siempre |
| `ONP_AFP_PAGAR` | puente | 4 | debe | siempre |
| `ESSALUD_PAGAR` | puente | 4 | debe | siempre |
| `SCTR_PAGAR` | puente | 4 | debe | si aplica |
| `BANCO_SALIDA` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de tesorería (o planillas).

**Patrón de asiento** (pago de planilla: neto S/ 75,000, ONP/AFP S/ 25,000, Essalud S/ 9,000):

| Rol | Debe | Haber |
|---|---|---|
| `SUELDOS_PAGAR` | 75,000.00 | — |
| `ONP_AFP_PAGAR` | 25,000.00 | — |
| `ESSALUD_PAGAR` | 9,000.00 | — |
| `BANCO_SALIDA` | — | 109,000.00 |

**Efectos secundarios:**
- Disminuir saldo bancario
- Cerrar obligaciones laborales pendientes
- Generar constancias de pago (boletas)

---

### 7.3 PROVISION_LABORAL (`PROVISION_LABORAL`)

**Cuándo ocurre:** Se reconoce la provisión de beneficios laborales (CTS, gratificaciones, vacaciones, utilidades). Generalmente mensual para evitar picos en meses específicos.  
**Origen:** `planillas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `periodo_contable_id` | UUID | Sí | Periodo de la provisión |
| `tipo_provision` | String(30) | Sí | `cts`, `gratificacion`, `vacaciones`, `utilidades` |
| `total_provision` | Decimal(14,2) | Sí | Monto total provisionado |
| `empleados[]` | Array | Sí | Detalle por empleado |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVISION_GASTO` | gasto | 2 | debe | siempre |
| `PROVISION_PAGAR` | contrapartida | 1 | haber | siempre |

**Asiento(s) que genera:** 1 asiento por tipo de provisión, en el diario de planillas.

**Patrón de asiento** (provisión de CTS del mes: S/ 15,000):

| Rol | Debe | Haber |
|---|---|---|
| `PROVISION_GASTO` | 15,000.00 | — |
| `PROVISION_PAGAR` | — | 15,000.00 |

*Cuentas de referencia PCGE: PROVISION_GASTO → 629 Provisiones de Personal / PROVISION_PAGAR → 419 Otras Remuneraciones por Pagar*

**Efectos secundarios:**
- Acumular pasivo por beneficio laboral
- Actualizar registro individual de cada empleado

---

### 7.4 PROVISION_CTS (`PROVISION_CTS`)

**Cuándo ocurre:** Se provisiona la Compensación por Tiempo de Servicios (Perú) — depósito semestral.  
**Origen:** `planillas`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `periodo_contable_id` | UUID | Sí | Periodo de la provisión |
| `total_provision` | Decimal(14,2) | Sí | Monto total provisionado |
| `empleados[]` | Array | Sí | Detalle por empleado |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVISION_LABORAL` | gasto | 2 | debe | siempre |
| `CTS_PASIVO` | puente | 4 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de planillas.

**Patrón de asiento** (provisión CTS del mes: S/ 2,085):

| Rol | Debe | Haber |
|---|---|---|
| `PROVISION_LABORAL` | 2,085.00 | — |
| `CTS_PASIVO` | — | 2,085.00 |

**Efectos secundarios:**
- Acumular pasivo por CTS

---

### 7.5 PROVISION_VACACIONES (`PROVISION_VACACIONES`)

**Cuándo ocurre:** Se provisionan las vacaciones devengadas no gozadas del personal.  
**Origen:** `planillas`

**Payload específico:** Similar a PROVISION_CTS.

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVISION_LABORAL` | gasto | 2 | debe | siempre |
| `VACACIONES_PASIVO` | puente | 4 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de planillas.

**Patrón de asiento** (provisión vacaciones del mes: S/ 12,500):

| Rol | Debe | Haber |
|---|---|---|
| `PROVISION_LABORAL` | 12,500.00 | — |
| `VACACIONES_PASIVO` | — | 12,500.00 |

**Efectos secundarios:**
- Acumular pasivo por vacaciones

---

### 7.6 PROVISION_GRATIFICACION (`PROVISION_GRATIFICACION`)

**Cuándo ocurre:** Se provisionan las gratificaciones legales (Perú: julio y diciembre).  
**Origen:** `planillas`

**Payload específico:** Similar a PROVISION_CTS.

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROVISION_LABORAL` | gasto | 2 | debe | siempre |
| `GRATIFICACION_PASIVO` | puente | 4 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de planillas.

**Efectos secundarios:**
- Acumular pasivo por gratificaciones

---

## 8. Eventos de Producción / Inventario

### 8.1 COMPRA_INVENTARIO (`COMPRA_INVENTARIO`)

**Cuándo ocurre:** Se compran mercaderías, materias primas o suministros destinados al inventario (no para consumo directo). Genera **2 sub-asientos** simultáneos.  
**Origen:** `inventario`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `proveedor_id` | UUID | Sí | Partner proveedor |
| `tipo_inventario` | String(30) | Sí | `mercaderia`, `materia_prima`, `suministro`, `envase` |
| `productos[]` | Array | Sí | Detalle de productos |
| `tipo_compra` | String(10) | Sí | `contado`, `credito` |
| `almacen_destino_id` | UUID | Sí | Almacén que recibe |

**Cada `productos[]`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `producto_id` | UUID | Sí | Producto |
| `cantidad` | Decimal(14,4) | Sí | Cantidad |
| `costo_unitario` | Decimal(14,4) | Sí | Costo unitario sin IVA |
| `costo_total` | Decimal(14,2) | Sí | Costo total sin IVA |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Sub-asiento | Condición |
|---|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | haber | **A** | `tipo_compra = credito` |
| `BANCO_SALIDA` | contrapartida | 1 | haber | **A** | `tipo_compra = contado` |
| `COMPRA_MERCADERIA` | gasto | 2 | debe | **A** | `tipo_inventario ≠ materia_prima` |
| `COMPRA_MATERIA_PRIMA` | gasto | 2 | debe | **A** | `tipo_inventario = materia_prima` |
| `IVA_CREDITO` | impuesto | 3 | debe | **A** | `afecta_iva = true` |
| `DESTINO_INVENTARIO` | puente | 4 | debe | **B** | siempre |
| `INVENTARIO` | activo | 2 | debe | **B** | siempre |
| `ORIGEN_COMPRA_INV` | puente | 4 | haber | **B** | siempre |

**Asiento(s) que genera:** 2 sub-asientos (A y B), ambos en la misma transacción:

- **Sub-asiento A:** Reconocimiento de la compra (gasto en compras o activación directa)
- **Sub-asiento B:** Entrada al almacén (transferencia del costo al inventario)

**Patrón de asientos** (compra de mercadería al crédito por S/ 11,800 — costo S/ 10,000 + IVA S/ 1,800):

**Sub-asiento A — Diario de compras:**

| Rol | Debe | Haber |
|---|---|---|
| `COMPRA_MERCADERIA` | 10,000.00 | — |
| `IVA_CREDITO` | 1,800.00 | — |
| `PROVEEDOR` | — | 11,800.00 |

**Sub-asiento B — Diario de almacén (o inventarios):**

| Rol | Debe | Haber |
|---|---|---|
| `INVENTARIO` | 10,000.00 | — |
| `DESTINO_INVENTARIO` | — | 10,000.00 |

*El componente `DESTINO_INVENTARIO` y `ORIGEN_COMPRA_INV` forman un puente interno del motor que transfiere el costo de la cuenta de compras al inventario.*

> **Nota:** En el sistema de inventario permanente (perpetuo), la configuración puede fusionar ambos sub-asientos: directamente INVENTARIO → PROVEEDOR. En el sistema periódico, se usa el patrón de 2 sub-asientos. La configuración por empresa decide.

**Efectos secundarios:**
- Actualizar kárdex de producto (entrada)
- Crear CxP (si crédito)
- Calcular costo promedio ponderado (si aplica)
- Actualizar libro de compras

---

### 8.2 CONSUMO_PRODUCCION (`CONSUMO_PRODUCCION`)

**Cuándo ocurre:** Se consumen materias primas, insumos o materiales del almacén para iniciar un proceso de producción.  
**Origen:** `inventario`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `orden_produccion_id` | UUID | Sí | Orden de producción |
| `productos[]` | Array | Sí | Productos consumidos |
| `almacen_origen_id` | UUID | Sí | Almacén de donde se retira |

**Cada `productos[]`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `producto_id` | UUID | Sí | Materia prima / insumo |
| `cantidad` | Decimal(14,4) | Sí | Cantidad consumida |
| `costo_unitario` | Decimal(14,4) | Sí | Costo unitario (según método de valuación) |
| `costo_total` | Decimal(14,2) | Sí | Costo total del consumo |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `CONSUMO_PP` | gasto | 2 | debe | siempre |
| `INVENTARIO` | activo | 2 | haber | siempre (reduce inventario) |

**Asiento(s) que genera:** 1 asiento en el diario de almacén/producción.

**Patrón de asiento** (consumo de S/ 8,500 en materia prima para orden de producción #123):

| Rol | Debe | Haber |
|---|---|---|
| `CONSUMO_PP` | 8,500.00 | — |
| `INVENTARIO` | — | 8,500.00 |

*Cuentas de referencia PCGE: CONSUMO_PP → 91 Costo de Producción (por elemento) / INVENTARIO → 24 Materias Primas*

**Efectos secundarios:**
- Disminuir kárdex de materia prima (salida)
- Actualizar orden de producción (costo consumido)
- Acumular costo en la orden (WIP — Work in Progress)

---

### 8.3 PRODUCCION_TERMINADA (`PRODUCCION_TERMINADA`)

**Cuándo ocurre:** Productos terminados ingresan al almacén de producto terminado después de completar el proceso productivo.  
**Origen:** `inventario`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `orden_produccion_id` | UUID | Sí | Orden de producción completada |
| `costo_produccion_total` | Decimal(14,2) | Sí | Costo total acumulado de la OP |
| `productos[]` | Array | Sí | Productos terminados |

**Cada `productos[]`:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `producto_id` | UUID | Sí | Producto terminado |
| `cantidad` | Decimal(14,4) | Sí | Unidades producidas |
| `costo_unitario` | Decimal(14,4) | Sí | Costo unitario de producción |
| `costo_total` | Decimal(14,2) | Sí | Costo total transferido |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `PROD_TERMINADA` | activo | 2 | debe | siempre |
| `CONSUMO_PP` | gasto | 2 | haber | siempre (cierra el WIP) |

**Asiento(s) que genera:** 1 asiento en el diario de almacén/producción.

**Patrón de asiento** (se terminan productos por S/ 12,000 — se transfiere de WIP a PT):

| Rol | Debe | Haber |
|---|---|---|
| `PROD_TERMINADA` | 12,000.00 | — |
| `CONSUMO_PP` | — | 12,000.00 |

*Cuentas de referencia PCGE: PROD_TERMINADA → 21 Productos Terminados / CONSUMO_PP (WIP) → 91 Costo de Producción*

**Efectos secundarios:**
- Actualizar kárdex de producto terminado (entrada)
- Cerrar orden de producción (WIP → PT)
- Calcular costo de producción real vs estándar

---

### 8.4 MERMA_REGISTRADA (`MERMA_REGISTRADA`)

**Cuándo ocurre:** Se registra una merma o desmedro de inventario (pérdida por deterioro, rotura, vencimiento, merma de proceso).  
**Origen:** `inventario`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `tipo_merma` | String(30) | Sí | `merma_normal`, `merma_extraordinaria`, `desmedro`, `rotura`, `vencimiento` |
| `producto_id` | UUID | Sí | Producto afectado |
| `cantidad` | Decimal(14,4) | Sí | Cantidad |
| `costo_unitario` | Decimal(14,4) | Sí | Costo unitario |
| `costo_total` | Decimal(14,2) | Sí | Costo total de la merma |
| `almacen_id` | UUID | Sí | Almacén |
| `responsable_id` | UUID | No | Responsable (si aplica) |

**Componentes que activa (merma normal — dentro del proceso productivo):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `MERMA_NORMAL` | gasto | 2 | debe | `tipo_merma = merma_normal` |
| `INVENTARIO` | activo | 2 | haber | siempre |

**Componentes que activa (merma extraordinaria — no recuperable, sospechosa):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `MERMA_EXTRAORDINARIA` | gasto | 2 | debe | `tipo_merma ≠ merma_normal` |
| `INVENTARIO` | activo | 2 | haber | siempre |

**Asiento(s) que genera:** 1 asiento en el diario de almacén.

**Patrón de asiento** (merma normal de S/ 1,200):

| Rol | Debe | Haber |
|---|---|---|
| `MERMA_NORMAL` | 1,200.00 | — |
| `INVENTARIO` | — | 1,200.00 |

**Patrón de asiento** (desmedro por vencimiento de S/ 3,500):

| Rol | Debe | Haber |
|---|---|---|
| `MERMA_EXTRAORDINARIA` | 3,500.00 | — |
| `INVENTARIO` | — | 3,500.00 |

**Efectos secundarios:**
- Disminuir kárdex de producto (salida)
- Notificar a compras/almacén para reposición
- Si es extraordinaria: reporte para seguro (si aplica)

---

### 8.5 AJUSTE_INVENTARIO (`AJUSTE_INVENTARIO`)

**Cuándo ocurre:** Se ajusta el inventario después de un conteo físico (toma de inventarios), diferencias por error de registro, sobrantes o faltantes.  
**Origen:** `inventario`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `tipo_ajuste` | String(20) | Sí | `sobrante`, `faltante`, `reclasificacion` |
| `producto_id` | UUID | Sí | Producto |
| `cantidad_sistema` | Decimal(14,4) | Sí | Cantidad según sistema |
| `cantidad_fisica` | Decimal(14,4) | Sí | Cantidad según conteo físico |
| `diferencia_cantidad` | Decimal(14,4) | Sí | Diferencia |
| `costo_unitario` | Decimal(14,4) | Sí | Costo unitario al momento del ajuste |
| `monto_ajuste` | Decimal(14,2) | Sí | Monto total del ajuste |
| `almacen_id` | UUID | Sí | Almacén |
| `motivo` | String(500) | Sí | Motivo del ajuste |

**Componentes que activa (sobrante):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `INVENTARIO` | activo | 2 | debe | siempre |
| `AJUSTE_INVENTARIO` | ingreso | 2 | haber | `tipo_ajuste = sobrante` |

**Componentes que activa (faltante):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `AJUSTE_INVENTARIO` | gasto | 2 | debe | `tipo_ajuste = faltante` |
| `INVENTARIO` | activo | 2 | haber | siempre |

**Componentes que activa (reclasificación):**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `INVENTARIO_DESTINO` | activo | 2 | debe | siempre (nueva clasificación) |
| `INVENTARIO` | activo | 2 | haber | siempre (clasificación anterior) |

**Asiento(s) que genera:** 1 asiento en el diario de almacén.

**Patrón de asiento** (sobrante de S/ 500):

| Rol | Debe | Haber |
|---|---|---|
| `INVENTARIO` | 500.00 | — |
| `AJUSTE_INVENTARIO` | — | 500.00 |

**Patrón de asiento** (faltante de S/ 800):

| Rol | Debe | Haber |
|---|---|---|
| `AJUSTE_INVENTARIO` | 800.00 | — |
| `INVENTARIO` | — | 800.00 |

**Patrón de asiento** (reclasificación de S/ 2,000 — cambia de categoría):

| Rol | Debe | Haber |
|---|---|---|
| `INVENTARIO_DESTINO` (categoría correcta) | 2,000.00 | — |
| `INVENTARIO` (categoría anterior) | — | 2,000.00 |

*La resolución de cuentas determina las cuentas de origen y destino según `producto_categoria_id`.*

**Efectos secundarios:**
- Actualizar kárdex de producto (ajuste de saldo)
- Conciliar diferencia de inventario

---

### 8.6 TRANSFERENCIA_ALMACEN (`TRANSFERENCIA_ALMACEN`)

**Cuándo ocurre:** Se transfiere inventario entre almacenes de la misma empresa (misma sucursal o distinta sucursal).  
**Origen:** `inventario`

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `almacen_origen_id` | UUID | Sí | Almacén de origen |
| `almacen_destino_id` | UUID | Sí | Almacén de destino |
| `productos[]` | Array | Sí | Detalle de productos |
| `tiene_merma` | Boolean | Sí | ¿Hubo pérdida en el traslado? |
| `monto_merma` | Decimal(14,2) | No | Monto de la merma si aplica |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `INVENTARIO_MP` | activo | 2 | haber | `tipo = mp` |
| `INVENTARIO_MP` | activo | 2 | debe | `tipo = mp` (almacén destino) |
| `INVENTARIO_PT` | activo | 2 | haber | `tipo = pt` |
| `INVENTARIO_PT` | activo | 2 | debe | `tipo = pt` (almacén destino) |
| `MERMA_TRANSITO` | gasto | 5 | debe | `tiene_merma = true` |

**Nota:** El motor genera dos líneas por cada tipo de producto (una salida de origen, una entrada a destino). Si hay merma, se agrega una línea de gasto adicional.

**Asiento(s) que genera:** 1 asiento en el diario de almacén.

**Patrón de asiento** (transferencia de MP por S/ 10,000 con merma de S/ 200):

| Rol | Debe | Haber |
|---|---|---|
| `INVENTARIO_MP` (destino) | 9,800.00 | — |
| `MERMA_TRANSITO` | 200.00 | — |
| `INVENTARIO_MP` (origen) | — | 10,000.00 |

**Efectos secundarios:**
- Actualizar kárdex de productos (salida de origen, entrada a destino)

---

## 9. Eventos de Extornos

### 9.1 EXTORNO_ASIENTO (`EXTORNO_ASIENTO`)

**Cuándo ocurre:** Se requiere revertir un asiento previamente contabilizado porque fue erróneo (monto incorrecto, cuenta equivocada, duplicado, operación anulada).  
**Origen:** `contabilidad` (interno del motor)

**Payload específico:**

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `asiento_original_id` | UUID | Sí | ID del asiento a extornar |
| `tipo_extorno` | String(20) | Sí | `extorno_total`, `extorno_parcial`, `correccion` |
| `motivo` | String(500) | Sí | Motivo del extorno |
| `usuario_id` | UUID | Sí | Usuario que solicita el extorno |

**Componentes que activa:**

| Componente | Tipo | Pos | Dirección | Condición |
|---|---|---|---|---|
| `EXTORNO_X` | — | — | opuesto | por cada línea del asiento original |

*El extorno usa un mecanismo especial: **invierte automáticamente cada línea del asiento original.** Las líneas originales se copian con el lado opuesto (Debe ↔ Haber). El motor NO usa reglas de activación estándar para este evento — usa una lógica de reversión directa.*

**Mecanismo del extorno:**

```
Asiento original #42:
  Debe:   CLIENTE             1,180.00
  Haber:  VENTA               1,000.00
  Haber:  IVA_DEBITO            180.00

Asiento de extorno #89:
  Debe:   VENTA               1,000.00
  Debe:   IVA_DEBITO            180.00
  Haber:  CLIENTE             1,180.00
  asiento_original_id = 42
  glosa: "Extorno total de asiento #42 - Factura anulada"
```

**Patrón de asiento** (extorno total del asiento de venta original):

| Rol | Debe | Haber |
|---|---|---|
| `VENTA` | 1,000.00 | — |
| `IVA_DEBITO` | 180.00 | — |
| `CLIENTE` | — | 1,180.00 |

*Las cuentas resueltas son las mismas que en el asiento original. El motor copia las cuentas, no las resuelve de nuevo.*

**Efectos secundarios:**
- Marcar `asiento_original.revertido = true`
- Si el asiento original tenía efectos secundarios (CxC, CxP, kárdex):
  - Revertir CxC/CxP (crear nota de crédito automática o marcar para revisión manual)
  - Revertir movimiento de kárdex (entrada/salida inversa)
  - Estos efectos secundarios del extorno se registran como **pendientes de revisión** porque pueden requerir aprobación del módulo origen
- Registrar en `auditoria_asiento` la operación de extorno

> **Importante:** El extorno es el ÚNICO evento que no sigue el pipeline completo de activación → resolución → cálculo. Usa un pipeline simplificado: validar que el asiento exista y esté contabilizado → invertir líneas → persistir.

---

## 10. Eventos Futuros (Reservados)

La siguiente tabla lista eventos identificados como necesarios para cobertura total pero que no se implementan en la fase inicial. Se incluyen para mantener consistencia en la numeración y diseño.

| Evento | Módulo | Descripción | Prioridad |
|---|---|---|---|
| `CIERRE_CAMBIO` | tesoreria | Ajuste por diferencia de cambio al cierre de mes | Media |
| `PROVISION_COBRANZA_DUDOSA` | ventas | Provisión de cuentas incobrables | Media |
| `COSTO_VENTA` | inventario | Reconocimiento de costo de venta (sistema periódico) | Media |
| `DEVOLUCION_VENTA` | ventas | Devolución de mercadería de cliente (con entrada a almacén) | Alta (Post-MVP) |
| `DESCUENTO_FINANCIERO` | ventas/compras | Descuento por pronto pago (diferencia entre factura y cobro) | Baja |
| `CONSOLIDACION_PLANILLA` | planillas | Cierre de planilla anual (CTS, gratif. dic) | Baja |
| `VENTA_ACTIVO_INTANGIBLE` | activos_fijos | Venta de intangibles (software, patentes, marcas) | Baja |
| `ARRENDAMIENTO_FINANCIERO` | activos_fijos | Leasing / arrendamiento financiero | Media |
| `COMISION_BANCARIA` | tesoreria | Comisiones, ITF (impuesto a transacciones financieras), portes | Media |

---

## 11. Resumen de Eventos

| # | Código | Módulo | Asientos | Componentes activos (típicos) |
|---|---|---|---|---|
| 1 | `COMPRA_REGISTRADA` | Compras | 1 | PROVEEDOR, COMPRA, IVA_CREDITO, DETRACCION |
| 2 | `COMPRA_CONTADO` | Compras | 1 | CAJA_COMPRA/BANCO_COMPRA, COMPRA, IVA_CREDITO |
| 3 | `NC_COMPRA` | Compras | 1 | PROVEEDOR, COMPRA↔, IVA_CREDITO↔ |
| 4 | `ANTICIPO_PROVEEDOR` | Compras | 1 | BANCO_SALIDA, ANTICIPO_PROVEEDOR, IVA_ANTICIPO |
| 5 | `APLICACION_ANTICIPO` | Compras | 1 | PROVEEDOR, ANTICIPO_PROVEEDOR↔ |
| 6 | `VENTA_EMITIDA` | Ventas | 1 | CLIENTE/CAJA_VENTA, VENTA, IVA_DEBITO |
| 7 | `COBRO_REGISTRADO` | Ventas | 1 | BANCO_ENTRADA, CLIENTE, DIF_CAMBIO |
| 8 | `NOTA_CREDITO_EMITIDA` | Ventas | 1 | CLIENTE↔, VENTA↔, IVA_DEBITO↔ |
| 9 | `NOTA_DEBITO_EMITIDA` | Ventas | 1 | CLIENTE, OTROS_INGRESOS, IVA_DEBITO |
| 10 | `LIQUIDACION_AGREGADOR` | Ventas | 1 | AGREGADOR, COMISION_VENTA, IVA_CREDITO, PROPINA |
| 11 | `CONTRACARGO_RESUELTO` | Ventas | 1 | PERDIDA_CONTRACARGO, CLIENTE, COMISION_BANCARIA |
| 12 | `ANTICIPO_CLIENTE` | Ventas | 1 | BANCO_ENTRADA, ANTICIPO_CLIENTE, IVA_DEBITO |
| 13 | `APLICACION_ANTICIPO_CLIENTE` | Ventas | 1 | ANTICIPO_CLIENTE↔, CLIENTE↔ |
| 14 | `PAGO_PROVEEDOR` | Tesorería | 1 | PROVEEDOR, BANCO_SALIDA, DIF_CAMBIO |
| 15 | `PAGO_DETRACCION` | Tesorería | 1 | DETRACCION↔, BANCO_SALIDA |
| 16 | `TRANSFERENCIA_INTERNA` | Tesorería | 1 | BANCO_ORIGEN, BANCO_DESTINO, DIF_CAMBIO |
| 17 | `APERTURA_CAJA_CHICA` | Tesorería | 1 | CAJA_CHICA, BANCO_SALIDA |
| 18 | `GASTO_CAJA_CHICA` | Tesorería | 1 | GASTO_CC, CAJA_CHICA↔ |
| 19 | `REPOSICION_CAJA_CHICA` | Tesorería | 1 | CAJA_CHICA, BANCO_SALIDA |
| 20 | `COMPRA_ACTIVO_FIJO` | Activos Fijos | 1 | PROVEEDOR, ACTIVO_FIJO, IVA_CREDITO |
| 21 | `DEPRECIACION_MENSUAL` | Activos Fijos | 1 | DEPRECIACION, DEPRECIACION_ACUM |
| 22 | `BAJA_ACTIVO` | Activos Fijos | 1 | DEPRECIACION_ACUM, PERDIDA_BAJA, ACTIVO_FIJO↔ |
| 23 | `VENTA_ACTIVO` | Activos Fijos | 1 | CLIENTE, DEPRECIACION_ACUM, ACTIVO_FIJO↔, VENTA_ACTIVO, GANANCIA/PERDIDA |
| 24 | `REVALUACION_ACTIVO` | Activos Fijos | 1 | ACTIVO_FIJO, EXCEDENTE_REVALUACION/PERDIDA |
| 25 | `PLANILLA_DEVENGADA` | Planillas | 1 | SUELDOS_GASTO, ESSALUD_GASTO, SUELDOS_PAGAR, ONP_AFP_PAGAR |
| 26 | `PLANILLA_PAGADA` | Planillas | 1 | SUELDOS_PAGAR↔, ONP_AFP_PAGAR↔, BANCO_SALIDA |
| 27 | `PROVISION_LABORAL` | Planillas | 1 | PROVISION_GASTO, PROVISION_PAGAR |
| 28 | `COMPRA_INVENTARIO` | Inventario | **2** | A: COMPRA, IVA_CREDITO, PROVEEDOR / B: INVENTARIO, DESTINO_INVENTARIO |
| 29 | `CONSUMO_PRODUCCION` | Inventario | 1 | CONSUMO_PP, INVENTARIO↔ |
| 30 | `PRODUCCION_TERMINADA` | Inventario | 1 | PROD_TERMINADA, CONSUMO_PP↔ |
| 31 | `MERMA_REGISTRADA` | Inventario | 1 | MERMA_NORMAL/EXTRAORDINARIA, INVENTARIO↔ |
| 32 | `AJUSTE_INVENTARIO` | Inventario | 1 | INVENTARIO, AJUSTE_INVENTARIO (debe/haber según sobrante/faltante) |
| 33 | `EXTORNO_ASIENTO` | Contabilidad | 1 | Reversión directa (inversión de líneas) |

**Total: 33 eventos, 34 asientos** (COMPRA_INVENTARIO genera 2).

---

## 12. Glosario de Componentes (Roles) Referenciados

| Componente | Tipo | Pos | Define | Referenciado en |
|---|---|---|---|---|
| `PROVEEDOR` | contrapartida | 1 | hab | Compras, Activos Fijos |
| `COMPRA` | gasto | 2 | deb | Compras |
| `IVA_CREDITO` | impuesto | 3 | deb | Compras, Activos Fijos, Agregador |
| `IVA_DEBITO` | impuesto | 3 | hab | Ventas, Activos Fijos |
| `IVA_ANTICIPO` | impuesto | 3 | deb | Anticipo Proveedor |
| `DETRACCION` | puente | 4 | hab | Compras, Pagos |
| `PERCEPCION` | puente | 4 | deb | Compras |
| `RETENCION` | puente | 4 | hab | Compras |
| `CAJA_COMPRA` | contrapartida | 1 | hab | Compra contado |
| `BANCO_COMPRA` | contrapartida | 1 | hab | Compra contado |
| `BANCO_SALIDA` | contrapartida | 1 | hab | Pagos, Anticipos, Caja Chica, Planillas |
| `BANCO_ENTRADA` | contrapartida | 1 | deb | Cobros, Anticipo Cliente |
| `CAJA_ENTRADA` | contrapartida | 1 | deb | Cobros, Venta contado |
| `CAJA_SALIDA` | contrapartida | 1 | hab | Pagos |
| `CLIENTE` | contrapartida | 1 | deb/hab | Ventas (CxC) |
| `VENTA` | ingreso | 2 | hab | Ventas |
| `VENTA_EXPORTACION` | ingreso | 2 | hab | Ventas (exportación) |
| `CAJA_VENTA` | contrapartida | 1 | deb | Venta contado |
| `ANTICIPO_PROVEEDOR` | puente | 4 | deb | Compras |
| `ANTICIPO_CLIENTE` | puente | 4 | hab | Ventas |
| `DIF_CAMBIO` | ajuste | 5 | — | Cobros, Pagos, Transferencias |
| `COMISION_VENTA` | gasto | 2 | deb | Liquidación Agregador |
| `PROPINA_PENDIENTE` | puente | 4 | hab | Liquidación Agregador |
| `AGREGADOR` | contrapartida | 1 | deb | Liquidación Agregador |
| `PERDIDA_CONTRACARGO` | gasto | 2 | deb | Contracargo |
| `COMISION_BANCARIA` | gasto | 2 | deb | Contracargo, Tesorería |
| `CAJA_CHICA` | contrapartida | 1 | deb/hab | Caja Chica |
| `GASTO_CC` | gasto | 2 | deb | Caja Chica (gastos menores) |
| `ACTIVO_FIJO` | activable | 2 | deb/hab | Activos Fijos |
| `DEPRECIACION` | gasto | 2 | deb | Depreciación |
| `DEPRECIACION_ACUM` | contrapartida | 1 | hab | Depreciación, Baja, Venta |
| `PERDIDA_BAJA` | gasto | 2 | deb | Baja de Activo |
| `VENTA_ACTIVO` | ingreso | 2 | hab | Venta de Activo |
| `GANANCIA_VENTA_AF` | ingreso | 2 | hab | Venta de Activo (ganancia) |
| `PERDIDA_VENTA_AF` | gasto | 2 | deb | Venta de Activo (pérdida) |
| `EXCEDENTE_REVALUACION` | patrimonio | 2 | hab | Revaluación |
| `PERDIDA_REVALUACION` | gasto | 2 | deb | Revaluación (disminución) |
| `SUELDOS_PAGAR` | contrapartida | 1 | hab | Planillas |
| `ONP_AFP_PAGAR` | puente | 4 | hab | Planillas |
| `ESSALUD_PAGAR` | puente | 4 | hab | Planillas |
| `SCTR_PAGAR` | puente | 4 | hab | Planillas |
| `SUELDOS_GASTO` | gasto | 2 | deb | Planillas |
| `ESSALUD_GASTO` | gasto | 2 | deb | Planillas |
| `SCTR_GASTO` | gasto | 2 | deb | Planillas |
| `PROVISION_GASTO` | gasto | 2 | deb | Provisiones laborales |
| `PROVISION_PAGAR` | contrapartida | 1 | hab | Provisiones laborales |
| `COMPRA_MERCADERIA` | gasto | 2 | deb | Compra inventario |
| `COMPRA_MATERIA_PRIMA` | gasto | 2 | deb | Compra materia prima |
| `INVENTARIO` | activo | 2 | deb/hab | Inventario, Consumo, Merma, Ajuste |
| `DESTINO_INVENTARIO` | puente | 4 | deb/hab | Compra inventario (puente interno) |
| `CONSUMO_PP` | gasto | 2 | deb/hab | Producción |
| `PROD_TERMINADA` | activo | 2 | deb | Producción terminada |
| `MERMA_NORMAL` | gasto | 2 | deb | Merma normal |
| `MERMA_EXTRAORDINARIA` | gasto | 2 | deb | Merma extraordinaria |
| `AJUSTE_INVENTARIO` | gasto/ingreso | 2 | — | Ajuste de inventario |
| `OTROS_INGRESOS` | ingreso | 2 | hab | Nota Débito, otros |

> **Total de roles documentados: 56**

*Para la definición completa de cada componente (código, nombre, tipo, posición, dirección), ver `06-CATALOGO_COMPONENTES.md`.*

---

## 13. Reglas de Validación por Evento

Cada evento tiene reglas de validación específicas en el paso 1 (RECIBIR) del pipeline:

| Evento | Validaciones específicas |
|---|---|
| `COMPRA_REGISTRADA` | proveedor existe, tipo_comprobante válido, serie+numero únicos por proveedor |
| `COMPRA_CONTADO` | + medio_pago válido, fondo suficiente si banco |
| `NC_COMPRA` | compra_original existe y está contabilizada, monto ≤ original |
| `ANTICIPO_PROVEEDOR` | proveedor existe, monto > 0 |
| `APLICACION_ANTICIPO` | anticipo no aplicado previamente, monto ≤ saldo anticipo |
| `VENTA_EMITIDA` | cliente existe, serie+numero únicos |
| `COBRO_REGISTRADO` | ventas existen, monto aplicado ≤ saldo CxC |
| `NOTA_CREDITO_EMITIDA` | venta_original contabilizada, monto ≤ monto original |
| `NOTA_DEBITO_EMITIDA` | venta_original contabilizada |
| `LIQUIDACION_AGREGADOR` | periodo único por agregador, ventas no liquidadas previamente |
| `CONTRACARGO_RESUELTO` | venta original existe, contracargo no duplicado |
| `PAGO_PROVEEDOR` | facturas existen, saldo suficiente, monto ≤ saldo CxP |
| `PAGO_DETRACCION` | detracción registrada y no pagada, monto = original |
| `TRANSFERENCIA_INTERNA` | cuentas distintas, saldo suficiente en origen |
| `APERTURA_CAJA_CHICA` | caja chica no aperturada previamente |
| `COMPRA_ACTIVO_FIJO` | tipo_activo válido, vida_util > 0 |
| `DEPRECIACION_MENSUAL` | periodo no depreciado aún |
| `PLANILLA_DEVENGADA` | periodo no duplicado |
| `COMPRA_INVENTARIO` | productos existen, almacén existe, cantidad > 0 |
| `EXTORNO_ASIENTO` | asiento_original existe, está contabilizado, no fue revertido previamente, periodo sigue abierto |

---

*Documento generado como parte de la especificación del Motor de Asientos v2.  
Próximo documento: `06-CATALOGO_COMPONENTES.md`*
