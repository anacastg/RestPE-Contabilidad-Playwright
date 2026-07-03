# Catálogo de Componentes Contables — Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `02-CONCEPTOS.md`, `03-ARQUITECTURA.md`, `04-ESQUEMA_DATOS.md`

---

## 0. Introducción

### 0.1 ¿Qué es un componente?

Un **componente contable** es un rol atómico que participa en un asiento. Cada componente
representa **qué papel juega** una línea contable en el evento de negocio (ingreso, gasto,
impuesto, contrapartida, etc.). No es una cuenta — es un *rol*. La cuenta concreta se
resuelve en tiempo de ejecución mediante reglas de prioridad (ver `03-ARQUITECTURA.md`
paso 3).

### 0.2 Propiedades del modelo

| Propiedad | Descripción |
|---|---|
| **Tipo** | Naturaleza económica del componente: `ingreso`, `gasto`, `impuesto`, `contrapartida`, `puente`, `ajuste` |
| **Posición** | Orden de aplicación en el asiento: 1=terceros, 2=base, 3=impuestos, 4=puente, 5=ajuste |
| **Dirección** | Debe/Haber fijo o `ambos` (depende del contexto) |
| **Es batch** | `true` si se procesa en lote (planillas, inventarios masivos) |
| **Descripción** | Qué rol contable representa este componente |
| **Cálculo** | Cómo se determina el monto |
| **Resolución** | Cadena de prioridad para determinar la cuenta contable |
| **Usado en eventos** | Qué eventos del dominio activan este componente |
| **Países** | Perú (PE), Colombia (CO), Ecuador (EC), todos (all) |

### 0.3 Convenciones

- **Monto base** = importe de la línea del evento (sin impuestos)
- **Monto operación** = monto base + impuestos aplicables (total factura)
- **PCGE** = Plan Contable General Empresarial (Perú)
- **PUC** = Plan Único de Cuentas (Colombia)

---

## VENTAS

Componentes activados por eventos de venta, facturación electrónica, notas de crédito/débito,
liquidaciones de cobro, conciliaciones de medios de pago.

---

### VENTA — Ingreso por Venta

| Propiedad | Valor |
|---|---|
| **Tipo** | `ingreso` |
| **Posición** | 2 (base) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Ingreso principal por venta de bienes o servicios. Representa el valor de venta neto (sin IVA) de la operación gravada, exonerada o inafecta. |
| **Cálculo** | `monto_linea - descuentos - IVA` para gravadas; `monto_linea` para exoneradas/inafectas. El cálculo respeta la clasificación de la operación (`gravado`, `exonerado`, `inafecto`, `gratuito`). |
| **Resolución** | ① Partner → categoría producto → `regla_cuenta_componente` con filtros (país, tipo_transacción, clasificación_operación, tipo_comprobante). ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 701 (Mercaderías) / 702 (Productos terminados) / 703 (Subproductos) / 704 (Servicios). |
| **Usado en eventos** | `VENTA_REGISTRADA`, `FACTURA_EMITIDA`, `BOLETA_EMITIDA`, `NOTA_CREDITO` (inverso), `NOTA_DEBITO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Factura gravada por S/ 1,180 → Componente VENTA = S/ 1,000 (haber) en cuenta 70111 (Mercaderías - Terceros).

---

### VENTA_DESCUENTO — Descuento en Venta

| Propiedad | Valor |
|---|---|
| **Tipo** | `ingreso` (reductor) |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Rebaja sobre el precio de venta. Puede ser descuento comercial (línea), descuento por volumen, descuento promocional o descuento global (factura). Se registra en el debe para reducir el ingreso neto. |
| **Cálculo** | `monto_descuento` (desde la línea del evento o total factura). Para descuentos globales se prorratea entre líneas según el peso relativo de cada una. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_descuento. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 709 (Descuentos concedidos). |
| **Usado en eventos** | `VENTA_REGISTRADA` (si descuento > 0), `NOTA_CREDITO` (si es por descuento) |
| **Países** | all |

**Ejemplo PCGE Perú:** Descuento de S/ 50 en factura → S/ 50 (debe) en cuenta 70911 (Descuentos concedidos - Terceros).

---

### VENTA_EXPORTACION — Exportación

| Propiedad | Valor |
|---|---|
| **Tipo** | `ingreso` |
| **Posición** | 2 (base) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Ingreso por venta al exterior (exportación definitiva). Sin IVA (operación gravada con tasa 0%). |
| **Cálculo** | `monto_linea_en_moneda_base` (conversión al TC de la fecha de embarque). El monto se calcula sobre el valor FOB declarado. |
| **Resolución** | ① `regla_cuenta_componente` con filtro pais_destino + tipo_exportacion. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 702 (Exportaciones) / 7041 (Servicios al exterior). |
| **Usado en eventos** | `EXPORTACION_REGISTRADA`, `VENTA_REGISTRADA` (con país destino ≠ PE) |
| **Países** | all (cuando aplica) |

**Ejemplo PCGE Perú:** Exportación FOB por USD 10,000 → S/ 37,000 (haber, TC 3.70) en cuenta 70211 (Exportaciones - Mercaderías).

---

### CLIENTE — Cuenta por Cobrar (Cliente)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Contrapartida por cobrar al cliente. Es la deuda comercial que el cliente tiene con la empresa por la venta realizada. Se genera SIEMPRE que la venta sea al crédito. Se ubica en posición 1 porque involucra a un tercero. |
| **Cálculo** | `total_factura - pagos_al_contado` (monto operación total menos lo pagado en el acto). Para crédito total: `total_factura`. Para mixto: solo la porción al crédito. |
| **Resolución** | ① Partner específico (`partner_cliente.cuenta_contable_id`) → categoría_cliente → `regla_cuenta_componente` con filtro tipo_venta (credito/contado). ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 121 (Clientes - Facturas por cobrar) / 123 (Clientes - Letras por cobrar). |
| **Usado en eventos** | `VENTA_REGISTRADA` (condición crédito o mixto), `NOTA_CREDITO` (inverso si aplica) |
| **Países** | all |

**Ejemplo PCGE Perú:** Venta al crédito por S/ 1,180 → S/ 1,180 (debe) en cuenta 12121 (Facturas por cobrar - Terceros).

---

### CAJA_VENTA — Caja de Ventas (Contado)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Contrapartida cuando la venta es al contado (efectivo). Representa el dinero recibido inmediatamente en caja del establecimiento o punto de venta. |
| **Cálculo** | `monto_efectivo_recibido` (porción contado del total). Si es 100% contado: `total_factura`. Si es mixto: solo el efectivo recibido. |
| **Resolución** | ① Sucursal (`sucursal.caja_default`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 101 (Caja) / 1041 (Caja chica). |
| **Usado en eventos** | `VENTA_REGISTRADA` (condición contado), `COBRO_REGISTRADO`, `LIQUIDACION_TURNO`, `CIERRE_CAJA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Venta al contado por S/ 118 → S/ 118 (debe) en cuenta 10111 (Caja - Moneda Nacional).

---

### BANCO_VENTA — Banco de Ventas (Tarjeta/Transferencia)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Contrapartida cuando el cobro de la venta es con tarjeta (débito/crédito), transferencia bancaria, depósito, o cualquier otro medio electrónico. |
| **Cálculo** | `monto_total_cobro` - `comisión_del_medio_de_pago` (si la comisión se netea). Alternativamente, se registra el bruto y por separado la comisión como gasto. |
| **Resolución** | ① Medio de pago (`medio_pago.cuenta_contable_id`) → `regla_cuenta_componente` con filtro medio_pago_tipo. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 104 (Cuentas corrientes) / 106 (Cuentas de ahorros). |
| **Usado en eventos** | `VENTA_REGISTRADA` (condición tarjeta/transferencia), `COBRO_REGISTRADO` (con medio bancario), `LIQUIDACION_TARJETA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Venta con tarjeta Visa S/ 590 → S/ 590 (debe) en cuenta 10411 (Cuentas corrientes - BCP).

---

### PROPINA — Propinas por Pagar

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` (pasivo) |
| **Posición** | 3 (impuestos) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Propina incluida en la cuenta del cliente. Es un pasivo porque la empresa recauda la propina en nombre de los trabajadores y debe entregarla. |
| **Cálculo** | `monto_base_propina` o `porcentaje × total_consumo`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_propina + sucursal. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 461 (Propinas por pagar). |
| **Usado en eventos** | `VENTA_REGISTRADA` (con propina), `CIERRE_MESA` (restaurantes) |
| **Países** | PE, CO |

**Ejemplo PCGE Perú:** Consumo S/ 200 + propina 10% = S/ 20 → S/ 20 (haber) en cuenta 46111 (Propinas por pagar).

---

### CANAL_COMISION — Comisión por Canal de Venta

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Comisión pagada a canales de venta externos (delivery apps, marketplaces, agentes comisionistas, franquicias). |
| **Cálculo** | `porcentaje_comision × monto_venta` (o tarifa fija por transacción). |
| **Resolución** | ① Canal (`canal_venta.cuenta_comision_id`) → `regla_cuenta_componente` con filtro canal. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 651 (Comisiones por canal de venta). |
| **Usado en eventos** | `VENTA_REGISTRADA` (con canal externo), `LIQUIDACION_CANAL`, `CONCILIACION_DELIVERY` |
| **Países** | all |

**Ejemplo PCGE Perú:** Venta por Rappi S/ 100, comisión 15% = S/ 15 → S/ 15 (debe) en cuenta 65111 (Comisiones por canal de venta).

---

### CONTRACARGO — Contracargo (Chargeback)

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Pérdida por chargeback o contracargo del banco/medio de pago. Ocurre cuando un cliente disputa un cargo y el banco revierte la transacción. |
| **Cálculo** | `monto_chargeback + penalidad_del_banco`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro motivo_chargeback + medio_pago. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 6599 (Pérdida por contracargos). |
| **Usado en eventos** | `CONTRACARGO_RECIBIDO`, `LIQUIDACION_TARJETA`, `CONCILIACION_BANCARIA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Chargeback S/ 118 + penalidad S/ 30 = S/ 148 → S/ 148 (debe) en cuenta 65931 (Pérdida por contracargos - Tarjetas).

---

### CONTRACARGO_RECUPERADO — Contracargo Recuperado

| Propiedad | Valor |
|---|---|
| **Tipo** | `ingreso` |
| **Posición** | 5 (ajuste) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Recuperación de un chargeback previamente contabilizado como pérdida. Ocurre cuando la empresa gana la disputa y el banco revierte el contracargo. |
| **Cálculo** | `monto_chargeback_original + penalidad_recuperada`. |
| **Resolución** | ① `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 7599 (Recuperación de contracargos). |
| **Usado en eventos** | `CONTRACARGO_RECUPERADO`, `CONCILIACION_BANCARIA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Recuperación de S/ 148 → S/ 148 (haber) en cuenta 75991 (Recuperación de contracargos).

---

### PUNTO_FIDELIDAD — Puntos de Fidelidad

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posición** | 4 (puente) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Pasivo por puntos de fidelidad otorgados a clientes en la venta. Representa la obligación futura de entregar productos o descuentos cuando el cliente redima sus puntos. |
| **Cálculo** | `valor_razonable_del_punto × cantidad_puntos_otorgados`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro programa_fidelidad. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 4891 (Programas de fidelidad de clientes). |
| **Usado en eventos** | `VENTA_REGISTRADA` (con programa de fidelidad), `PUNTO_OTORGADO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Venta S/ 1,000, se otorgan 100 puntos valor S/ 0.50 c/u = S/ 50 → S/ 50 (haber) en cuenta 48911 (Programas de fidelidad de clientes).

---

### DESCUENTO_CONCEDIDO — Descuento Financiero Concedido

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Descuento concedido al cliente por pronto pago (descuento financiero, no comercial). Se reconoce como gasto financiero. |
| **Cálculo** | `porcentaje_descuento × monto_factura` o `monto_linea_descuento_financiero`. |
| **Resolución** | ① `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 679 (Descuentos concedidos por pronto pago). |
| **Usado en eventos** | `COBRO_REGISTRADO` (con pronto pago), `NOTA_CREDITO` (por descuento financiero) |
| **Países** | all |

**Ejemplo PCGE Perú:** Descuento por pronto pago S/ 20 sobre factura de S/ 1,000 → S/ 20 (debe) en cuenta 67911 (Descuentos concedidos por pronto pago).

---

### GIFT_CARD — Tarjeta de Regalo / Gift Card

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posición** | 4 (puente) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Pasivo por gift cards vendidas pero aún no redimidas. Representa la obligación de entregar bienes/servicios en el futuro. |
| **Cálculo** | `valor_nominal_de_la_gift_card_vendida`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_gift_card. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 4892 (Gift cards por redimir). |
| **Usado en eventos** | `GIFT_CARD_EMITIDA`, `VENTA_REGISTRADA` (con tipo gift card), `GIFT_CARD_REDIMIDA` (inverso parcial) |
| **Países** | all |

**Ejemplo PCGE Perú:** Gift card vendida por S/ 200 → S/ 200 (haber) en cuenta 48921 (Gift cards por redimir - Terceros).

---

### SALDO_FAVOR_CLIENTE — Saldo a Favor del Cliente

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posición** | 4 (puente) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Pasivo por saldos a favor del cliente (anticipos recibidos, créditos por devoluciones, notas de crédito aplicadas como saldo). |
| **Cálculo** | `monto_nota_credito - monto_aplicado` o `monto_anticipo_pendiente`. |
| **Resolución** | ① Partner (`partner_cliente.cuenta_saldo_favor`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 4893 (Saldo a favor de clientes). |
| **Usado en eventos** | `NOTA_CREDITO` (con opción saldo), `SALDO_FAVOR_REGISTRADO`, `VENTA_REGISTRADA` (aplicación de saldo) |
| **Países** | all |

**Ejemplo PCGE Perú:** Nota de crédito S/ 118 aplicada como saldo → S/ 118 (haber) en cuenta 48931 (Saldo a favor de clientes).

---

### FALTANTE_CAJA — Faltante de Caja

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Diferencia negativa entre el efectivo físico contado y el efectivo esperado según el sistema al cierre de caja / turno. |
| **Cálculo** | `efectivo_esperado - efectivo_contado` (cuando el resultado es negativo). |
| **Resolución** | ① `regla_cuenta_componente` con filtro sucursal + tipo_faltante. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 6594 (Faltante de caja). |
| **Usado en eventos** | `CIERRE_CAJA`, `LIQUIDACION_TURNO`, `ARQUEO_CAJA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Faltante de S/ 50 en cierre de caja → S/ 50 (debe) en cuenta 65941 (Faltante de caja).

---

### DIFERENCIA_LIQUIDACION — Diferencia de Liquidación

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Diferencia entre el monto que el sistema espera recibir de un medio de pago y lo que realmente se liquida. |
| **Cálculo** | `|monto_liquidado - monto_esperado|`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro medio_pago + tipo_diferencia. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 6595 (Diferencias de liquidación). |
| **Usado en eventos** | `LIQUIDACION_TARJETA`, `LIQUIDACION_CANAL`, `CONCILIACION_BANCARIA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Liquidación Visa esperada S/ 590, recibida S/ 588 → S/ 2 (debe) en cuenta 65951 (Diferencias de liquidación - Tarjetas).

---

### CLIENTE_PERCEPCION — Percepción del Cliente

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` (activo) |
| **Posición** | 3 (impuestos) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Percepción del IVA que el cliente aplica al pagar una factura (Régimen de Percepciones — Perú). La empresa actúa como agente de percepción. |
| **Cálculo** | `porcentaje_percepcion × monto_factura`. Porcentajes: 3% (bienes), 4% (combustibles), 1.5% o 2% según clasificación del cliente. |
| **Resolución** | ① Partner (`partner_cliente.tasa_percepcion`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 1048 (Percepción por cobrar a SUNAT) / 163 (Percepción del IVA). |
| **Usado en eventos** | `VENTA_REGISTRADA` (con cliente sujeto a percepción), `FACTURA_EMITIDA` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Factura S/ 1,180 + percepción 3% (S/ 35.40) → S/ 35.40 (debe) en cuenta 10481 (Percepción del IVA - SUNAT).

---

### RETENCION_CLIENTE — Retención al Cliente

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` (pasivo) |
| **Posición** | 3 (impuestos) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Retención del IVA aplicada al cliente (Régimen de Retenciones — Perú). Aplica cuando el cliente es un agente de retención designado por SUNAT. |
| **Cálculo** | `porcentaje_retencion × IVA_de_la_factura`. Porcentaje: 6% sobre el IVA. |
| **Resolución** | ① Partner (`partner_cliente.es_agente_retencion`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 463 (Retenciones de IVA por clientes). |
| **Usado en eventos** | `FACTURA_EMITIDA` (cliente agente de retención), `VENTA_REGISTRADA` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Factura S/ 1,180, IVA S/ 180, retención 6% de IVA = S/ 10.80 → S/ 10.80 (haber) en cuenta 46311 (Retenciones del IVA - Terceros).

---

### AGREGADOR — Agregador por Cobrar

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Cuenta por cobrar al agregador de medios de pago (MercadoPago, PayPal, Stripe, Culqi, Izipay). Representa el monto bruto de las ventas procesadas. |
| **Cálculo** | `suma_de_transacciones_del_periodo` (monto bruto procesado por el agregador). |
| **Resolución** | ① Agregador (`agregador.cuenta_contable_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 1219 (Cuentas por cobrar a agregadores de pago). |
| **Usado en eventos** | `VENTA_REGISTRADA` (con agregador), `LIQUIDACION_AGREGADOR`, `CONCILIACION_AGREGADOR` |
| **Países** | all |

**Ejemplo PCGE Perú:** Ventas del día por MercadoPago S/ 5,900 → S/ 5,900 (debe) en cuenta 12191 (Cuentas por cobrar - Agregadores de pago).

---

### COMISION_AGREGADOR — Comisión del Agregador

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Comisión cobrada por el agregador de pago por procesar las transacciones. |
| **Cálculo** | `porcentaje_comision × monto_transaccion + tarifa_fija_por_transaccion`. |
| **Resolución** | ① Agregador (`agregador.cuenta_comision_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 6512 (Comisiones por servicios bancarios y agregadores). |
| **Usado en eventos** | `VENTA_REGISTRADA` (por transacción), `LIQUIDACION_AGREGADOR` (consolidado) |
| **Países** | all |

**Ejemplo PCGE Perú:** Ventas MercadoPago S/ 5,900, comisión 3.99% = S/ 235.41 → S/ 235.41 (debe) en cuenta 65121 (Comisiones por agregadores de pago).

---

### IVA_COMISION — IVA de la Comisión del Agregador

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posición** | 3 (impuestos) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Crédito fiscal del IVA correspondiente a la comisión del agregador de pago. |
| **Cálculo** | `IVA_de_la_comision` (18% de la comisión del agregador). |
| **Resolución** | ① `regla_cuenta_componente` con filtro emite_comprobante_iva. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 40111 (IVA - Crédito fiscal). |
| **Usado en eventos** | `LIQUIDACION_AGREGADOR` (con factura de comisión), `COMPROBANTE_COMISION_RECIBIDO` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Comisión MercadoPago S/ 235.41, IVA 18% = S/ 42.37 → S/ 42.37 (debe) en cuenta 40111 (IVA - Crédito fiscal).

---

## COMPRAS

Componentes activados por eventos de compra, registro de facturas de proveedores,
gastos, importaciones, anticipos y ajustes de compras.

---

### COMPRA — Gasto / Costo de Compra

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Gasto o costo por la adquisición de bienes o servicios. Representa el valor de la compra neto (sin IVA). Puede ser gasto del período o activable como inventario. |
| **Cálculo** | `monto_linea - descuentos - IVA` (para gravadas con derecho a crédito fiscal). Para bienes activables, incluye costos de importación, fletes y seguros. |
| **Resolución** | ① Tipo de gasto / categoría producto → `regla_cuenta_componente` con filtro tipo_gasto + tipo_bien + clasificación_operación. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 601 (Mercaderías) / 602 (Materias primas) / 63 (Servicios). |
| **Usado en eventos** | `COMPRA_REGISTRADA`, `FACTURA_PROVEEDOR_RECIBIDA`, `GASTO_REGISTRADO`, `NOTA_CREDITO_COMPRA` (inverso) |
| **Países** | all |

**Ejemplo PCGE Perú:** Compra de mercadería S/ 1,000 + IVA S/ 180 = S/ 1,180 → COMPRA = S/ 1,000 (debe) en cuenta 60111 (Mercaderías - Terceros).

---

### COMPRA_EXPORTACION — Importación

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Costo de adquisición de bienes o servicios del exterior (importación). Incluye el valor CIF más gastos de internamiento. |
| **Cálculo** | `valor_CIF_al_TC + gastos_internamiento + derechos_aduaneros`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_importacion + pais_origen. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 601 (Importaciones - Mercaderías). |
| **Usado en eventos** | `IMPORTACION_REGISTRADA`, `LIQUIDACION_ADUANA` |
| **Países** | all (cross-border) |

**Ejemplo PCGE Perú:** Importación China CIF USD 5,000 (TC 3.70 = S/ 18,500) + gastos internamiento S/ 2,000 = S/ 20,500 → S/ 20,500 (debe) en cuenta 60112 (Importaciones - Mercaderías).

---

### PROVEEDOR — Cuenta por Pagar (Proveedor)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Contrapartida por pagar al proveedor. Es la deuda comercial que la empresa tiene con el proveedor por la compra realizada. |
| **Cálculo** | `total_factura - pagos_al_contado`. |
| **Resolución** | ① Partner específico → categoría_proveedor → `regla_cuenta_componente` con filtro tipo_compra. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 421 (Facturas por pagar) / 423 (Letras por pagar). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (condición crédito), `FACTURA_PROVEEDOR_RECIBIDA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Compra al crédito S/ 1,180 → S/ 1,180 (haber) en cuenta 42121 (Facturas por pagar - Terceros).

---

### CAJA_COMPRA — Caja para Compra (Contado)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Contrapartida cuando la compra es pagada al contado en efectivo. |
| **Cálculo** | `monto_total_pagado_al_contado`. |
| **Resolución** | ① Sucursal (`sucursal.caja_default`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 101 (Caja) / 1041 (Caja chica). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (condición contado), `GASTO_REGISTRADO` (con pago inmediato) |
| **Países** | all |

**Ejemplo PCGE Perú:** Compra al contado S/ 118 → S/ 118 (haber) en cuenta 10111 (Caja - Moneda Nacional).

---

### IVA — IVA Crédito / Débito Fiscal

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posición** | 3 (impuestos) |
| **Dirección** | ambos (debe = crédito fiscal en compras, haber = débito fiscal en ventas) |
| **Es batch** | false |
| **Descripción** | Impuesto General a las Ventas. Se comporta como crédito fiscal en compras y como débito fiscal en ventas. |
| **Cálculo** | `monto_base_imponible × tasa_IVA`. Tasa general: 18% (PE), 19% (CO), 12% (EC). |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_operacion + clasificación_operación + pais. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 40111 (IVA - Crédito fiscal) en compras, 40112 (IVA - Débito fiscal) en ventas. |
| **Usado en eventos** | `COMPRA_REGISTRADA`, `VENTA_REGISTRADA`, `NOTA_CREDITO`, `NOTA_DEBITO` |
| **Países** | all (cada país con su tasa) |

**Ejemplo PCGE Perú:** Compra S/ 1,000 → IVA S/ 180 (debe) en cuenta 40111. Venta S/ 1,000 → IVA S/ 180 (haber) en cuenta 40112.

---

### DETRACCION — Detracción (SPOT)

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` |
| **Posición** | 4 (puente) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Detracción del SPOT. Porcentaje que el comprador descuenta y deposita en el Banco de la Nación. |
| **Cálculo** | `porcentaje_detraccion × monto_total_operacion`. Porcentajes: 4%-12% según Anexo R.S. 183-2004. |
| **Resolución** | ① Tipo de bien/servicio (tabla SPOT) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 465 (Detracciones por pagar). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (con bien sujeto a detracción), `DEPOSITO_DETRACCION` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Compra S/ 10,000, detracción 9% = S/ 900 → S/ 900 (haber) en cuenta 46511 (Detracciones por pagar - SPOT).

---

### PERCEPCION — Percepción (Proveedor)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` (activo) |
| **Posición** | 3 (impuestos) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Percepción del IVA que la empresa paga a su proveedor (Régimen de Percepciones). El proveedor cobra un % adicional y lo entrega a SUNAT. |
| **Cálculo** | `porcentaje_percepcion × monto_factura`. Porcentajes: 3% (bienes), 4% (combustibles). |
| **Resolución** | ① Proveedor (`partner_proveedor.es_agente_percepcion`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 163 (Percepción del IVA). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (proveedor agente de percepción), `FACTURA_PROVEEDOR_RECIBIDA` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Factura S/ 1,180 + percepción 3% (S/ 35.40) = S/ 1,215.40 → S/ 35.40 (debe) en cuenta 16311 (Percepción del IVA - Terceros).

---

### RETENCION — Retención (Proveedor)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` (pasivo) |
| **Posición** | 3 (impuestos) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Retención del IVA que la empresa (como agente de retención) descuenta al proveedor y entrega a SUNAT. |
| **Cálculo** | `porcentaje_retencion × IVA_de_la_factura`. General: 6% del IVA. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_bien + monto_operacion. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 463 (Retenciones de IVA por pagar). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (empresa agente de retención), `FACTURA_PROVEEDOR_RECIBIDA` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Compra S/ 1,180, IVA S/ 180, retención 6% de IVA = S/ 10.80 → S/ 10.80 (haber) en cuenta 46311 (Retenciones del IVA por pagar).

---

### DESTINO_INVENTARIO — Destino a Inventario

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Contrapartida cuando un gasto se activa como inventario en lugar de gasto del período. Cancela la cuenta de costo y activa la cuenta de inventario. |
| **Cálculo** | `monto_activable` (mismo monto del costo que corresponde a existencias). |
| **Resolución** | ① Categoría producto → `regla_cuenta_componente` con filtro tipo_destino_inventario. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 201 (Materias primas) / 202 (Productos terminados). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (producto mercadería/materia prima), `ALMACEN_INGRESO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Compra de materia prima S/ 1,000 → DESTINO_INVENTARIO = S/ 1,000 (haber) en cuenta 20111 (Materias primas - Terceros).

---

### ANTICIPO_PROVEEDOR — Anticipo a Proveedor

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Anticipo entregado a un proveedor antes de recibir la factura o la mercadería. Activo que se extinguirá cuando se aplique a la factura definitiva. |
| **Cálculo** | `monto_del_anticipo_entregado`. |
| **Resolución** | ① Partner (`partner_proveedor.cuenta_anticipo_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 422 (Anticipos a proveedores). |
| **Usado en eventos** | `ANTICIPO_PROVEEDOR_REGISTRADO`, `PAGO_ANTICIPO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Anticipo a Proveedor SAC por S/ 5,000 → S/ 5,000 (debe) en cuenta 42211 (Anticipos a proveedores - Terceros).

---

### ANTICIPO_CLIENTE — Anticipo de Cliente

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posición** | 4 (puente) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Anticipo recibido de un cliente antes de emitir la factura. Pasivo que se extinguirá cuando se aplique a la factura definitiva. |
| **Cálculo** | `monto_del_anticipo_recibido`. |
| **Resolución** | ① Partner (`partner_cliente.cuenta_anticipo_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 422 (Anticipos de clientes). |
| **Usado en eventos** | `ANTICIPO_CLIENTE_REGISTRADO`, `COBRO_ANTICIPO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Anticipo de Cliente XYZ por S/ 2,000 → S/ 2,000 (haber) en cuenta 42212 (Anticipos de clientes - Terceros).

---

### DIF_CAMBIO — Diferencia de Cambio

| Propiedad | Valor |
|---|---|
| **Tipo** | `ajuste` |
| **Posición** | 5 (ajuste) |
| **Dirección** | ambos (debe = pérdida, haber = ganancia) |
| **Es batch** | false |
| **Descripción** | Ajuste por diferencia de cambio en partidas en moneda extranjera. |
| **Cálculo** | `saldo_ME × (TC_actual - TC_original)`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_partida. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 771 (Diferencia de cambio - Ganancia) / 671 (Diferencia de cambio - Pérdida). |
| **Usado en eventos** | `PAGO_REGISTRADO` (ME), `COBRO_REGISTRADO` (ME), `CIERRE_PERIODO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Factura proveedor USD 1,000 (TC 3.70 = S/ 3,700). Pago a TC 3.80 = S/ 3,800. Pérdida S/ 100 → S/ 100 (debe) en cuenta 67111.

---

### GASTO_FINANCIERO — Gasto Financiero

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Gastos financieros diversos: intereses por financiamiento, comisiones por líneas de crédito, factoring, descuentos financieros. |
| **Cálculo** | `tasa_interes × capital_periodo` o `monto_fijo_según_contrato`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_gasto_financiero + contrato. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 673 (Intereses por préstamos) / 674 (Intereses por obligaciones). |
| **Usado en eventos** | `LIQUIDACION_FACTORING`, `PAGO_REGISTRADO` (con intereses moratorios) |
| **Países** | all |

**Ejemplo PCGE Perú:** Intereses por factoring S/ 1,500 → S/ 1,500 (debe) en cuenta 67311.

---

### INTERES_POR_PAGAR — Interés por Pagar

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posición** | 5 (ajuste) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Interés devengado por pagar (acumulado) no vencido. |
| **Cálculo** | `interes_del_periodo_devengado_no_pagado`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro contrato + tipo_deuda. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 453 (Intereses por pagar). |
| **Usado en eventos** | `DEVENGAMIENTO_INTERES`, `CIERRE_PERIODO`, `PRESTAMO_CUOTA_DEVENGADA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Interés devengado S/ 2,000 → S/ 2,000 (haber) en cuenta 45311 (Intereses por pagar).

---

### PRESTAMO_CAPITAL — Préstamo (Capital)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | ambos (debe = recepción, haber = amortización) |
| **Es batch** | false |
| **Descripción** | Capital de un préstamo o financiación recibida. |
| **Cálculo** | `monto_desembolsado` (al recibir) o `monto_capital_cuota` (al pagar). |
| **Resolución** | ① Contrato / entidad financiera → `regla_cuenta_componente` con filtro entidad + tipo_prestamo. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 451 (Préstamos bancarios C/P) / 452 (Préstamos bancarios L/P). |
| **Usado en eventos** | `PRESTAMO_DESEMBOLSADO`, `PRESTAMO_CUOTA_PAGADA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Desembolso préstamo BCP S/ 100,000 → S/ 100,000 (haber) en cuenta 45111 (Préstamos bancarios - C/P).

---

## BANCOS / TESORERÍA

Componentes para operaciones bancarias, conciliaciones, transferencias, y gestión de efectivo.

---

### BANCO — Cuenta Bancaria

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | ambos (debe = ingreso, haber = salida) |
| **Es batch** | false |
| **Descripción** | Contrapartida para movimientos de cuentas bancarias. |
| **Cálculo** | `monto_del_movimiento_bancario`. |
| **Resolución** | ① Cuenta bancaria (`cuenta_bancaria.cuenta_contable_id`) → `regla_cuenta_componente` con filtro banco + tipo_cuenta. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 104 (Cuentas corrientes) / 106 (Cuentas de ahorros). |
| **Usado en eventos** | `COBRO_REGISTRADO`, `PAGO_REGISTRADO`, `TRANSFERENCIA_REALIZADA`, `CONCILIACION_BANCARIA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Ingreso por cobro S/ 5,000 → S/ 5,000 (debe) en cuenta 10411 (Cuenta corriente BCP).

---

### BANCO_DETRACCIONES — Cuenta Bancaria de Detracciones

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | ambos (debe = depósito, haber = uso) |
| **Es batch** | false |
| **Descripción** | Cuenta bancaria en el Banco de la Nación para depósitos de detracciones (SPOT). |
| **Cálculo** | `monto_del_depósito_de_detracción`. |
| **Resolución** | ① Empresa (`empresa.cuenta_detraccion_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 1047 (Banco de la Nación - Detracciones). |
| **Usado en eventos** | `DEPOSITO_DETRACCION`, `LIBERACION_DETRACCION` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Depósito detracción S/ 900 → S/ 900 (debe) en cuenta 10471.

---

### TRANSFERENCIA_ORIGEN — Origen de Transferencia

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Cuenta de origen de una transferencia bancaria entre cuentas de la misma empresa. |
| **Cálculo** | `monto_total_de_la_transferencia`. |
| **Resolución** | ① Cuenta bancaria origen → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 104 (Cuenta corriente de origen). |
| **Usado en eventos** | `TRANSFERENCIA_REALIZADA`, `TRASLADO_FONDOS` |
| **Países** | all |

**Ejemplo PCGE Perú:** Transferencia BCP→Interbank S/ 10,000 → S/ 10,000 (haber) en cuenta 10411.

---

### TRANSFERENCIA_DESTINO — Destino de Transferencia

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Cuenta de destino de una transferencia bancaria entre cuentas de la misma empresa. |
| **Cálculo** | `monto_total_de_la_transferencia`. |
| **Resolución** | ① Cuenta bancaria destino → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 104 (Cuenta corriente de destino). |
| **Usado en eventos** | `TRANSFERENCIA_REALIZADA`, `TRASLADO_FONDOS` |
| **Países** | all |

**Ejemplo PCGE Perú:** Transferencia BCP→Interbank S/ 10,000 → S/ 10,000 (debe) en cuenta 10412 (Cuenta corriente Interbank).

---

### CAJA_CHICA — Caja Chica

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | ambos (debe = reposición, haber = gasto) |
| **Es batch** | false |
| **Descripción** | Fondo de caja chica o caja menor para gastos operativos de bajo monto. |
| **Cálculo** | `monto_del_gasto_con_caja_chica` o `monto_de_reposición_del_fondo`. |
| **Resolución** | ① Sucursal (`sucursal.caja_chica_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 10112 (Caja chica). |
| **Usado en eventos** | `GASTO_CAJA_CHICA`, `REPOSICION_CAJA_CHICA`, `LIQUIDACION_CAJA_CHICA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Reposición caja chica S/ 500 → S/ 500 (debe) en cuenta 10112.

---

### COMISION_BANCARIA — Comisión Bancaria

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Comisiones y gastos bancarios: mantenimiento, transferencias, portes, etc. |
| **Cálculo** | `monto_fijo_o_variable_según_tarifario_del_banco`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_comision + banco. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 6511 (Comisiones bancarias). |
| **Usado en eventos** | `NOTA_DEBITO_BANCARIA`, `CONCILIACION_BANCARIA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Comisión por transferencia S/ 12 → S/ 12 (debe) en cuenta 65111.

---

### ITF — Impuesto a las Transacciones Financieras

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` / `gasto` |
| **Posición** | 3 (impuestos) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | ITF — impuesto peruano a débitos y créditos en cuentas bancarias. Tasa 0.005%. |
| **Cálculo** | `monto_transaccion × 0.005%`. |
| **Resolución** | ① `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 653 (ITF). |
| **Usado en eventos** | `NOTA_DEBITO_BANCARIA`, `TRANSFERENCIA_REALIZADA`, `CONCILIACION_BANCARIA` |
| **Países** | PE |

**Ejemplo PCGE Perú:** Transferencia S/ 100,000, ITF 0.005% = S/ 5 → S/ 5 (debe) en cuenta 65311.

---

### COMPENSACION_CXC — Compensación de CXC

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Compensación de una cuenta por cobrar contra una cuenta por pagar del mismo tercero. |
| **Cálculo** | `menor_valor_entre_saldo_cxc_y_saldo_cxp_del_mismo_tercero`. |
| **Resolución** | ① Partner → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 121 (Clientes). |
| **Usado en eventos** | `COMPENSACION_REGISTRADA`, `CONCILIACION_CXC_CXP` |
| **Países** | all |

**Ejemplo PCGE Perú:** Cliente tiene S/ 10,000 x cobrar y S/ 3,000 x pagar. Compensación S/ 3,000 → S/ 3,000 (haber) en cuenta 12121.

---

### COMPENSACION_CXP — Compensación de CXP

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Contrapartida de la compensación de cuentas por pagar. |
| **Cálculo** | `monto_compensado` (mismo monto que COMPENSACION_CXC). |
| **Resolución** | ① Partner → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 421 (Proveedores). |
| **Usado en eventos** | `COMPENSACION_REGISTRADA`, `CONCILIACION_CXC_CXP` |
| **Países** | all |

**Ejemplo PCGE Perú:** S/ 3,000 (debe) en cuenta 42121 (Facturas por pagar).

---

## ACTIVOS FIJOS

Componentes para adquisición, depreciación, baja, revaluación y mejora de activos fijos.

---

### ACTIVO_FIJO — Adquisición de Activo Fijo

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Capitalización del costo de adquisición de un activo fijo incluyendo todos los costos necesarios para ponerlo en operación. |
| **Cálculo** | `precio_adquisición + costos_instalación + fletes + seguros + derechos_importación`. |
| **Resolución** | ① Tipo de activo (`tipo_activo.cuenta_contable_id`) → `regla_cuenta_componente` con filtro clase_activo. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 33 (Inmuebles, maquinaria y equipo) / 34 (Intangibles). |
| **Usado en eventos** | `ACTIVO_FIJO_ADQUIRIDO`, `COMPRA_REGISTRADA` (con tipo activo fijo) |
| **Países** | all |

**Ejemplo PCGE Perú:** Compra de camión S/ 120,000 + instalación S/ 5,000 = S/ 125,000 → S/ 125,000 (debe) en cuenta 33411 (Vehículos).

---

### DEPRECIACION_GASTO — Gasto por Depreciación

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Gasto por depreciación del período — distribución sistemática del costo del activo fijo. |
| **Cálculo** | `(costo_activo - valor_residual) / vida_util_en_años / 12` (lineal mensual). |
| **Resolución** | ① Tipo de activo + centro de costo → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 681 (Depreciación de inmuebles, maquinaria y equipo). |
| **Usado en eventos** | `DEPRECIACION_PROCESADA`, `CIERRE_PERIODO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Camión S/ 125,000, vida útil 5 años, VR S/ 25,000 → (125,000-25,000)/60 = S/ 1,666.67 → S/ 1,666.67 (debe) en cuenta 68141.

---

### DEPRECIACION_ACUMULADA — Depreciación Acumulada

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posición** | 2 (base) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Contrapartida de la depreciación. Cuenta de valuación que reduce el valor contable del activo. |
| **Cálculo** | Mismo monto que DEPRECIACION_GASTO. |
| **Resolución** | ① Activo específico → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 391-393 (Depreciación acumulada). |
| **Usado en eventos** | `DEPRECIACION_PROCESADA`, `CIERRE_PERIODO` |
| **Países** | all |

**Ejemplo PCGE Perú:** S/ 1,666.67 (haber) en cuenta 39331 (Depreciación acumulada - Vehículos).

---

### BAJA_ACTIVO — Baja de Activo Fijo

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 5 (ajuste) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Pérdida por baja, venta o retiro de un activo fijo. |
| **Cálculo** | `valor_neto_contable - valor_de_venta`. Si valor_venta > valor_neto: ganancia (haber). |
| **Resolución** | ① `regla_cuenta_componente` con filtro motivo_baja. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 6596 (Pérdida por baja de activo fijo). |
| **Usado en eventos** | `ACTIVO_FIJO_VENTA`, `ACTIVO_FIJO_PERDIDA`, `ACTIVO_FIJO_RETIRO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Baja equipo cómputo valor S/ 10,000, depreciación S/ 8,000, valor neto S/ 2,000 → S/ 2,000 (debe) en cuenta 65961.

---

### REVALUACION_ACTIVO — Revaluación de Activo Fijo

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (patrimonio) |
| **Posición** | 5 (ajuste) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Aumento del valor contable por revaluación voluntaria (NIC 16). Se registra en patrimonio. |
| **Cálculo** | `valor_razonable - valor_neto_contable_actual` (cuando valor_razonable > valor_neto). |
| **Resolución** | ① `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 571 (Excedente de revaluación). |
| **Usado en eventos** | `REVALUACION_ACTIVO`, `ACTUALIZACION_VALOR_RAZONABLE` |
| **Países** | all |

**Ejemplo PCGE Perú:** Terreno S/ 500,000 → tasación S/ 650,000 → incremento S/ 150,000 → S/ 150,000 (haber) en cuenta 57111.

---

### MEJORA_ACTIVO — Mejora de Activo Fijo

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Capitalización de mejoras que aumentan vida útil, capacidad o eficiencia del activo. |
| **Cálculo** | `costo_total_de_la_mejora`. |
| **Resolución** | ① Activo específico → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: misma cuenta del activo fijo (33/34/35). |
| **Usado en eventos** | `MEJORA_ACTIVO_REGISTRADA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Mejora de maquinaria S/ 25,000 → S/ 25,000 (debe) en cuenta 33211.

---

### LEASING_ACTIVO — Activo por Arrendamiento

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | false |
| **Descripción** | Reconocimiento del activo por derecho de uso (NIIF 16). Valor presente de los pagos futuros. |
| **Cálculo** | `valor_presente_de_pagos_futuros_descontados_a_tasa_implícita`. |
| **Resolución** | ① `regla_cuenta_componente` con filtro contrato + tipo_bien. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 336 (Activos por derecho de uso en arrendamiento). |
| **Usado en eventos** | `LEASING_INICIADO`, `CONTRATO_ARRIENDO_FINANCIERO` |
| **Países** | all |

**Ejemplo PCGE Perú:** Leasing vehículo VP = S/ 180,000 → S/ 180,000 (debe) en cuenta 33611.

---

### LEASING_PASIVO — Pasivo por Arrendamiento

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (pasivo) |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | false |
| **Descripción** | Pasivo por arrendamiento (NIIF 16). Contrapartida del activo por derecho de uso. |
| **Cálculo** | Mismo valor que LEASING_ACTIVO al inicio. |
| **Resolución** | ① `regla_cuenta_componente` con filtro contrato + plazo. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 455 (Obligaciones financieras L/P) / 451 (C/P). |
| **Usado en eventos** | `LEASING_INICIADO`, `LEASING_CUOTA_PAGADA` |
| **Países** | all |

**Ejemplo PCGE Perú:** S/ 180,000 (haber) en cuenta 45511 (Obligaciones financieras por arrendamiento L/P).

---

## PLANILLAS

Componentes para procesamiento de planillas, provisiones laborales, beneficios sociales,
y contribuciones al fisco. La mayoría son batch (se procesan en lote mensual).

---

### PLANILLA_DEVENGADA — Planilla Devengada (Gasto)

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | true |
| **Descripción** | Principal gasto de planilla: sueldos, salarios, comisiones, horas extras, bonos. |
| **Cálculo** | `suma_remuneraciones_brutas + horas_extras + bonos + comisiones + asignaciones`. |
| **Resolución** | ① Tipo trabajador + centro de costo → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 621 (Sueldos y salarios) / 622 (Comisiones). |
| **Usado en eventos** | `PLANILLA_PROCESADA`, `PLANILLA_MENSUAL` |
| **Países** | all |

**Ejemplo PCGE Perú:** Planilla mensual S/ 150,000 → S/ 150,000 (debe) en cuenta 62111 (Sueldos - Administración).

---

### PLANILLA_PAGADA — Planilla Pagada (Neto a Trabajadores)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | true |
| **Descripción** | Contrapartida del pago neto de planilla a los trabajadores. |
| **Cálculo** | `suma_netos_a_pagar` (bruto - descuentos legales - descuentos judiciales). |
| **Resolución** | ① Cuenta bancaria de planilla → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 104 (Cuenta corriente de planillas). |
| **Usado en eventos** | `PLANILLA_PAGADA`, `PLANILLA_LIQUIDADA` |
| **Países** | all |

**Ejemplo PCGE Perú:** Neto a pagar S/ 115,000 → S/ 115,000 (haber) en cuenta 10413.

---

### APORTES_PAGADOS — Aportes Seguridad Social

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` |
| **Posición** | 1 (terceros) |
| **Dirección** | haber |
| **Es batch** | true |
| **Descripción** | Pago de aportes empleador y descuentos trabajador: ESSALUD, ONP/AFP, SENATI. |
| **Cálculo** | `aporte_empleador (ESSALUD 9%) + descuento_trabajador (ONP 13% o AFP 10%+comision+prima) + otros`. |
| **Resolución** | ① Entidad recaudadora → `regla_cuenta_componente` con filtro tipo_aporte. ② Fallback: pais_id + componente_id. ③ Cuenta típica PE: 411 (ESSALUD) / 412 (ONP) / 414 (AFP). |
| **Usado en eventos** | `PLANILLA_PROCESADA`, `APORTES_LIQUIDADOS` |
| **Países** | PE |

**Ejemplo PCGE Perú:** ESSALUD S/ 13,500 + AFP S/ 16,000 = S/ 29,500 (haber) en 41111 + 41411.

---

### PROVISION_LABORAL — Provisión Laboral

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posición** | 2 (base) |
| **Dirección** | debe |
| **Es batch** | true |
| **Descripción** | Provision mensual de beneficios sociales: CTS, gratificaciones, vacaciones. |
| **Cálculo** | `porcentaje_mensual x remuneracion_computable`. CTS: ~1.39% mensual. Gratif: ~2.78%. Vacaciones: 8.33%. |
| **Resolución** | ① `regla_cuenta_componente` con filtro tipo_provision + centro_costo. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 687 (CTS) / 688 (Provisiones). |
| **Usado en eventos** | `PLANILLA_PROCESADA`, `PROVISION_MENSUAL`, `CIERRE_PERIODO` |
| **Paises** | PE, CO |

**Ejemplo PCGE Peru:** Provision mensual CTS S/ 2,085 + gratif S/ 4,170 + vacaciones S/ 12,500 = S/ 18,755 (debe) en cuentas 687/688/689.

---

### PLANILLA_BATCH — Marcador de Batch de Planilla

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` |
| **Posicion** | — (marcador interno) |
| **Direccion** | — (consolidacion) |
| **Es batch** | true |
| **Descripcion** | Componente tecnico interno que agrupa todos los componentes de planilla bajo un mismo batch. No genera linea contable directa. |
| **Calculo** | Ninguno (componente de agrupacion logica). |
| **Resolucion** | No aplica. |
| **Usado en eventos** | `PLANILLA_PROCESADA` |
| **Paises** | all |

**Observacion:** PLANILLA_BATCH es un organizador tecnico. El motor lo usa para asegurar que todos los componentes bajo ese marcador se procesen atomicamente. Si falla un componente, falla todo el batch.

---

### VACACIONES_PASIVO — Pasivo por Vacaciones

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posicion** | 4 (puente) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Pasivo acumulado por vacaciones devengadas no gozadas. |
| **Calculo** | `remuneracion_mensual / 12` (provision mensual). |
| **Resolucion** | ① `regla_cuenta_componente` con filtro centro_costo. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 481 (Vacaciones por pagar). |
| **Usado en eventos** | `PROVISION_VACACIONES`, `PLANILLA_PROCESADA`, `VACACIONES_GOCE` (inverso) |
| **Paises** | all |

**Ejemplo PCGE Peru:** Provision vacaciones S/ 12,500 → S/ 12,500 (haber) en cuenta 48111.

---

### CTS_PASIVO — Pasivo por CTS

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posicion** | 4 (puente) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Pasivo por Compensacion por Tiempo de Servicios (Peru). Deposito semestral. |
| **Calculo** | `remuneracion_computable x (1/12) x (meses/6)` por semestre. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro centro_costo. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 482 (CTS por pagar). |
| **Usado en eventos** | `PROVISION_CTS`, `PLANILLA_PROCESADA`, `CTS_DEPOSITADA` (inverso) |
| **Paises** | PE |

**Ejemplo PCGE Peru:** Provision CTS mensual S/ 2,085 → S/ 2,085 (haber) en cuenta 48211.

---

### GRATIFICACION_PASIVO — Pasivo por Gratificaciones

| Propiedad | Valor |
|---|---|
| **Tipo** | `puente` (pasivo) |
| **Posicion** | 4 (puente) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Pasivo acumulado por gratificaciones legales (Peru: julio y diciembre). |
| **Calculo** | `remuneracion_computable x (1/6)` por semestre. Incluye bonificacion ESSALUD (9%). |
| **Resolucion** | ① `regla_cuenta_componente` con filtro centro_costo. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 483 (Gratificaciones por pagar). |
| **Usado en eventos** | `PROVISION_GRATIFICACION`, `PLANILLA_PROCESADA`, `GRATIFICACION_PAGADA` (inverso) |
| **Paises** | PE |

**Ejemplo PCGE Peru:** Provision gratificacion mensual S/ 4,170 → S/ 4,170 (haber) en cuenta 48311.

---

## PRODUCCION / INVENTARIO

Componentes para costos de produccion, inventarios, mermas, costos de venta y transferencias
entre almacenes.

---

### COSTO_PRODUCCION — Costo de Produccion

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 2 (base) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Costo de produccion del periodo: materias primas, MOD, CIF. |
| **Calculo** | `materia_prima_consumida + MOD + CIF + depreciacion_fabrica + energia + mantenimiento`. |
| **Resolucion** | ① Centro de costo + linea_producto → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 921 (MP) / 922 (MOD) / 923 (CIF). |
| **Usado en eventos** | `PRODUCCION_REGISTRADA`, `ORDEN_PRODUCCION_CERRADA` |
| **Paises** | all |

**Ejemplo PCGE Peru:** Consumo MP S/ 300,000 + MOD S/ 80,000 + CIF S/ 120,000 = S/ 500,000 (debe) en cuentas 921/922/923.

---

### INVENTARIO_MP — Inventario de Materia Prima

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posicion** | 2 (base) |
| **Direccion** | ambos (debe = ingreso, haber = consumo/salida) |
| **Es batch** | false |
| **Descripcion** | Inventario de materias primas e insumos en almacen. |
| **Calculo** | `costo_de_adquisicion_MP`. Metodo: promedio ponderado o PEPS. |
| **Resolucion** | ① Producto (`producto.cuenta_inventario_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 201 (Materias primas). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (MP), `CONSUMO_MP_REGISTRADO` (inverso), `ALMACEN_INGRESO` |
| **Paises** | all |

**Ejemplo PCGE Peru:** Ingreso MP S/ 300,000 → S/ 300,000 (debe) en cuenta 20111. Consumo MP S/ 300,000 → S/ 300,000 (haber) en misma cuenta.

---

### INVENTARIO_PT — Inventario de Producto Terminado

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posicion** | 2 (base) |
| **Direccion** | ambos (debe = ingreso por produccion, haber = venta) |
| **Es batch** | false |
| **Descripcion** | Inventario de productos terminados y en proceso. |
| **Calculo** | `costo_de_produccion_unitario x cantidad_producida`. |
| **Resolucion** | ① Producto (`producto.cuenta_pt_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 202 (Productos terminados). |
| **Usado en eventos** | `PRODUCCION_COMPLETADA`, `VENTA_REGISTRADA` (costo de venta), `TRANSFERENCIA_ALMACEN` |
| **Paises** | all |

**Ejemplo PCGE Peru:** Produccion completada S/ 500,000 → S/ 500,000 (debe) en cuenta 20211.

---

### MERMA_PRODUCCION — Merma de Produccion

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 5 (ajuste) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Merma o desperdicio en el proceso productivo (merma anormal, la normal se incorpora al costo). |
| **Calculo** | `cantidad_merma_anormal x costo_unitario_estandar`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro centro_costo + tipo_proceso. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 694 (Perdida por merma de produccion). |
| **Usado en eventos** | `PRODUCCION_COMPLETADA` (con merma), `AJUSTE_INVENTARIO` |
| **Paises** | all |

**Ejemplo PCGE Peru:** Merma anormal 50 kg x S/ 10/kg = S/ 500 → S/ 500 (debe) en cuenta 65971.

---

### MERMA_TRANSITO — Merma en Transito

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 5 (ajuste) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Merma o perdida de inventario durante el transporte entre almacenes o sucursales. |
| **Calculo** | `cantidad_perdida_en_transito x costo_unitario_promedio`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro causa + origen/destino. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 6598 (Merma en transito). |
| **Usado en eventos** | `TRANSFERENCIA_ALMACEN` (con diferencia), `RECEPCION_MERCADERIA` (con faltante) |
| **Paises** | all |

**Ejemplo PCGE Peru:** 10 unidades perdidas en traslado x S/ 50 c/u = S/ 500 → S/ 500 (debe) en cuenta 65981.

---

### DESTINO_INVENTARIO — Destino a Inventario (Contrapartida)

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 2 (base) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Contrapartida que activa un gasto como inventario. Cancela la cuenta de costo y activa la cuenta de inventario. |
| **Calculo** | `monto_activable` (mismo monto del costo). |
| **Resolucion** | ① Categoria producto → `regla_cuenta_componente` con filtro tipo_destino. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 201 (Materias primas) / 202 (Productos terminados). |
| **Usado en eventos** | `COMPRA_REGISTRADA` (bienes activables), `ALMACEN_INGRESO` |
| **Paises** | all |

**Ejemplo PCGE Peru:** Activacion en 201 por S/ 1,000 → S/ 1,000 (haber) en cuenta 20111.

---

### COSTO_VENTA — Costo de Venta

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 2 (base) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Costo de los bienes o servicios vendidos (COGS). Se reconoce simultaneamente con el ingreso. |
| **Calculo** | `cantidad_vendida x costo_unitario_promedio` (o PEPS segun politica). |
| **Resolucion** | ① Producto (`producto.cuenta_costo_venta_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 691 (Costo de ventas). |
| **Usado en eventos** | `VENTA_REGISTRADA` (costo de venta), `NOTA_CREDITO` (inverso) |
| **Paises** | all |

**Ejemplo PCGE Peru:** 100 unidades x costo S/ 250 = S/ 25,000 → S/ 25,000 (debe) en cuenta 69111.

---

## INTER-COMPANY

Componentes para transacciones entre empresas del mismo grupo economico.

---

### INTER_EMPRESA_VENTA — Venta Intercompañia

| Propiedad | Valor |
|---|---|
| **Tipo** | `ingreso` |
| **Posicion** | 2 (base) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Ingreso por venta a empresa del grupo (precio de transferencia arm's length). |
| **Calculo** | `precio_de_transferencia x cantidad`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro empresa_relacionada + tipo_operacion. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 7011 (Ventas intercompañias). |
| **Usado en eventos** | `INTER_COMPANY_VENTA`, `VENTA_REGISTRADA` (con empresa relacionada) |
| **Paises** | all |

**Ejemplo PCGE Peru:** Venta intercompañia S/ 50,000 → S/ 50,000 (haber) en cuenta 70112.

---

### INTER_EMPRESA_COSTO_VENTA — Costo de Venta Intercompañia

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 2 (base) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Costo de venta de bienes vendidos a empresa del grupo. |
| **Calculo** | `costo_unitario_en_libros x cantidad_vendida`. |
| **Resolucion** | ① Producto → `regla_cuenta_componente` con filtro empresa_relacionada. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 6912 (Costo de ventas intercompañias). |
| **Usado en eventos** | `INTER_COMPANY_VENTA`, `VENTA_REGISTRADA` (empresa relacionada) |
| **Paises** | all |

**Ejemplo PCGE Peru:** Costo S/ 35,000 → S/ 35,000 (debe) en cuenta 69121.

---

### INTER_EMPRESA_COMPRA — Compra Intercompañia

| Propiedad | Valor |
|---|---|
| **Tipo** | `gasto` |
| **Posicion** | 2 (base) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Gasto por compra de bienes o servicios a empresa del grupo. |
| **Calculo** | `precio_de_transferencia x cantidad`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro empresa_relacionada + tipo_gasto. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 6012 (Compras intercompañias). |
| **Usado en eventos** | `INTER_COMPANY_COMPRA`, `COMPRA_REGISTRADA` (con empresa relacionada) |
| **Paises** | all |

**Ejemplo PCGE Peru:** Compra intercompañia S/ 50,000 → S/ 50,000 (debe) en cuenta 60121.

---

### INTER_EMPRESA_INVENTARIO — Inventario Intercompañia en Transito

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posicion** | 2 (base) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | Inventario en transito entre empresas del grupo, antes de la recepcion por la compradora. |
| **Calculo** | `costo_de_los_bienes_en_transito`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro empresas_origen_destino. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 208 (Inventario en transito - Intercompañias). |
| **Usado en eventos** | `INTER_COMPANY_ENVIO`, `INTER_COMPANY_RECEPCION` (inverso) |
| **Paises** | all |

**Ejemplo PCGE Peru:** Envio intercompañia en transito S/ 35,000 → S/ 35,000 (debe) en cuenta 20811.

---

## PAIS ESPECIFICO

Componentes especificos de cada pais (Peru, Colombia, Ecuador, Guatemala).
Se activan solo cuando el pais de la empresa corresponde.

---

### ICBPER — Impuesto al Consumo de Bolsas Plasticas (Peru)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | ICBPER. Se aplica por cada bolsa plastica entregada al cliente (Ley 30884). Tasa: S/ 0.10 por bolsa. |
| **Calculo** | `cantidad_bolsas x S/ 0.10`. |
| **Resolucion** | ① `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PE: 40115 (ICBPER por pagar). |
| **Usado en eventos** | `VENTA_REGISTRADA` (con bolsas), `FACTURA_EMITIDA`, `BOLETA_EMITIDA` |
| **Paises** | PE |

**Ejemplo PCGE Peru:** Venta con 5 bolsas → 5 x S/ 0.10 = S/ 0.50 → S/ 0.50 (haber) en cuenta 401151.

---

### INC — Impuesto Nacional al Consumo (Colombia)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | INC aplicado a bienes especificos: vehiculos, embarcaciones, licores, cigarrillos. Tasas: 4%, 8%, 16%. |
| **Calculo** | `porcentaje_INC x base_imponible`. |
| **Resolucion** | ① Producto (`producto.tasa_INC_id`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PUC CO: 240410 (Impuesto al consumo por pagar). |
| **Usado en eventos** | `VENTA_REGISTRADA` (bienes gravados con INC), `FACTURA_EMITIDA` (Colombia) |
| **Paises** | CO |

**Ejemplo PUC Colombia:** Venta vehiculo COP 80,000,000, INC 4% = COP 3,200,000 → COP 3,200,000 (haber) en cuenta 24041001.

---

### ISD — Impuesto de Salida de Divisas (Ecuador)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | ISD sobre transferencias y pagos al exterior. Tasa general: 5% del monto transferido. |
| **Calculo** | `monto_transferido_al_exterior x 5%`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro tipo_operacion + pais_destino. ② Fallback: pais_id + componente_id. ③ Cuenta tipica ECU: ISD por pagar. |
| **Usado en eventos** | `PAGO_REGISTRADO` (al exterior), `TRANSFERENCIA_INTERNACIONAL` |
| **Paises** | EC |

**Ejemplo:** Pago a proveedor China USD 50,000, ISD 5% = USD 2,500 → USD 2,500 (debe) en cuenta ISD por pagar.

---

### GMF — Gravamen a los Movimientos Financieros (Colombia)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | GMF (4x1000) sobre retiros y debitos bancarios en Colombia. Tasa: 0.4%. |
| **Calculo** | `monto_debitado x 0.4%`. |
| **Resolucion** | ① `regla_cuenta_componente` con filtro banco + tipo_operacion. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PUC CO: 532520 (GMF). |
| **Usado en eventos** | `PAGO_REGISTRADO`, `TRANSFERENCIA_REALIZADA`, `CONCILIACION_BANCARIA` |
| **Paises** | CO |

**Ejemplo PUC Colombia:** Retiro COP 20,000,000, GMF 0.4% = COP 80,000 → COP 80,000 (debe) en cuenta 53252001.

---

### RETE_ICA — Retencion de ICA (Colombia)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Retencion del Impuesto de Industria y Comercio. Tasa segun municipio y actividad: 0.2%-1.5%. |
| **Calculo** | `porcentaje_rete_ICA x monto_del_pago`. |
| **Resolucion** | ① Proveedor (`partner.tasa_rete_ICA`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PUC CO: 236510 (Retencion ICA por pagar). |
| **Usado en eventos** | `PAGO_REGISTRADO` (Colombia), `COMPRA_REGISTRADA` (con retencion ICA) |
| **Paises** | CO |

**Ejemplo PUC Colombia:** Pago COP 10,000,000, RETE_ICA 0.5% = COP 50,000 → COP 50,000 (haber) en cuenta 23651001.

---

### RETE_FUENTE — Retencion en la Fuente (Colombia)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Retencion a titulo de Renta. Tasas: 2.5% (servicios), 1% (compras), 10% (honorarios), 20% (arrendamientos). |
| **Calculo** | `porcentaje_rete_fuente x base_de_retencion`. |
| **Resolucion** | ① Proveedor (`partner.tasa_rete_fuente`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PUC CO: 236520 (Retencion en la fuente por pagar). |
| **Usado en eventos** | `PAGO_REGISTRADO` (Colombia), `COMPRA_REGISTRADA` (con retencion) |
| **Paises** | CO |

**Ejemplo PUC Colombia:** Honorarios COP 5,000,000, RETE_FUENTE 10% = COP 500,000 → COP 500,000 (haber) en cuenta 23652001.

---

### RETE_IVA — Retencion de IVA (Colombia)

| Propiedad | Valor |
|---|---|
| **Tipo** | `impuesto` |
| **Posicion** | 3 (impuestos) |
| **Direccion** | haber |
| **Es batch** | false |
| **Descripcion** | Retencion del IVA en Colombia. Tasa: 50% del IVA facturado (9.5% del valor de la operacion con IVA 19%). |
| **Calculo** | `porcentaje_rete_IVA x IVA_facturado`. General: 50% del IVA. |
| **Resolucion** | ① Proveedor (`partner.tasa_rete_IVA`) → `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica PUC CO: 236530 (Retencion IVA por pagar). |
| **Usado en eventos** | `PAGO_REGISTRADO` (Colombia), `FACTURA_PROVEEDOR_RECIBIDA` |
| **Paises** | CO |

**Ejemplo PUC Colombia:** IVA COP 1,900,000, RETE_IVA 50% = COP 950,000 → COP 950,000 (haber) en cuenta 23653001.

---

### ISO_ACREDITABLE — ISO Acreditable (Guatemala)

| Propiedad | Valor |
|---|---|
| **Tipo** | `contrapartida` (activo) |
| **Posicion** | 4 (puente) |
| **Direccion** | debe |
| **Es batch** | false |
| **Descripcion** | ISO pagado que se acredita contra el ISR del periodo. Activo diferido. Tasa: 1% sobre activos netos. |
| **Calculo** | `1% x activos_netos_del_periodo`. |
| **Resolucion** | ① `regla_cuenta_componente`. ② Fallback: pais_id + componente_id. ③ Cuenta tipica GT: ISO acreditable (activo diferido). |
| **Usado en eventos** | `ISO_PAGADO`, `CIERRE_FISCAL`, `LIQUIDACION_ISR_ANUAL` |
| **Paises** | GT |

**Ejemplo Guatemala:** Activos netos GTQ 10,000,000, ISO 1% = GTQ 100,000 → GTQ 100,000 (debe) en cuenta ISO Acreditable.

---

## Apendice A: Estrategias de Calculo por Tipo de Componente

| Tipo | Estrategia de Calculo | Ejemplo |
|---|---|---|
| **ingreso** | `porcentaje_base` o `monto_linea` | VENTA = monto_linea - descuentos - IVA |
| **gasto** | `monto_linea` o `porcentaje_base` | COMPRA = monto_linea - IVA |
| **impuesto** | `porcentaje_base` (tasa x base) | IVA = 18% x base_imponible |
| **contrapartida** | `monto_residual` o `monto_neto` | CLIENTE = total_factura - pagos_contado |
| **puente** | `monto_neto` o `porcentaje_base` | PUNTO_FIDELIDAD = valor_punto x cantidad |
| **ajuste** | `diferencia` o `porcentaje_base` | DIF_CAMBIO = saldo_ME x (TC_nuevo - TC_viejo) |

### Formula `monto_residual` (contrapartidas)

```
monto_componente = suma(haber) - suma(debe)   [si la contrapartida va al debe]
monto_componente = suma(debe) - suma(haber)    [si la contrapartida va al haber]
```

Esto asegura que el asiento siempre cumpla Debe = Haber.

---

## Apendice B: Cadena de Resolucion de Cuentas

```
1. Partner especifico (partner.cuenta_contable_id)
2. Producto / Categoria de producto (producto.cuenta_default_id)
3. regla_cuenta_componente con TODOS los filtros
4. Fallback: Sacar filtros uno por uno
5. Solo pais_id + componente_id (regla general)
6. ERROR: CUENTA_NO_CONFIGURADA
```

---

## Apendice C: Indice de Componentes por Codigo

| Codigo | Nombre | Tipo | Pos | Dir | Paises |
|---|---|---|---|---|---|
| VENTA | Ingreso por Venta | ingreso | 2 | haber | all |
| VENTA_DESCUENTO | Descuento en Venta | ingreso | 2 | debe | all |
| VENTA_EXPORTACION | Exportacion | ingreso | 2 | haber | all |
| CLIENTE | Cuenta por Cobrar | contrapartida | 1 | debe | all |
| CAJA_VENTA | Caja de Ventas | contrapartida | 1 | debe | all |
| BANCO_VENTA | Banco de Ventas | contrapartida | 1 | debe | all |
| PROPINA | Propinas por Pagar | impuesto | 3 | haber | PE, CO |
| CANAL_COMISION | Comision por Canal | gasto | 5 | debe | all |
| CONTRACARGO | Chargeback | gasto | 5 | debe | all |
| CONTRACARGO_RECUPERADO | Chargeback Recuperado | ingreso | 5 | haber | all |
| PUNTO_FIDELIDAD | Puntos de Fidelidad | puente | 4 | haber | all |
| DESCUENTO_CONCEDIDO | Descuento Concedido | gasto | 2 | debe | all |
| GIFT_CARD | Gift Card | puente | 4 | haber | all |
| SALDO_FAVOR_CLIENTE | Saldo a Favor Cliente | puente | 4 | haber | all |
| FALTANTE_CAJA | Faltante de Caja | gasto | 5 | debe | all |
| DIFERENCIA_LIQUIDACION | Diferencia de Liquidacion | gasto | 5 | debe | all |
| CLIENTE_PERCEPCION | Percepcion del Cliente | impuesto | 3 | debe | PE |
| RETENCION_CLIENTE | Retencion al Cliente | impuesto | 3 | haber | PE |
| AGREGADOR | Agregador por Cobrar | contrapartida | 1 | debe | all |
| COMISION_AGREGADOR | Comision del Agregador | gasto | 2 | debe | all |
| IVA_COMISION | IVA de Comision | impuesto | 3 | debe | PE |
| COMPRA | Gasto / Costo de Compra | gasto | 2 | debe | all |
| COMPRA_EXPORTACION | Importacion | gasto | 2 | debe | all |
| PROVEEDOR | Cuenta por Pagar | contrapartida | 1 | haber | all |
| CAJA_COMPRA | Caja para Compra | contrapartida | 1 | haber | all |
| IVA | IVA Credito/Debito | impuesto | 3 | ambos | all |
| DETRACCION | Detraccion SPOT | puente | 4 | haber | PE |
| PERCEPCION | Percepcion Proveedor | impuesto | 3 | debe | PE |
| RETENCION | Retencion Proveedor | impuesto | 3 | haber | PE |
| DESTINO_INVENTARIO | Destino a Inventario | gasto | 2 | haber | all |
| ANTICIPO_PROVEEDOR | Anticipo a Proveedor | contrapartida | 1 | debe | all |
| ANTICIPO_CLIENTE | Anticipo de Cliente | puente | 4 | haber | all |
| DIF_CAMBIO | Diferencia de Cambio | ajuste | 5 | ambos | all |
| GASTO_FINANCIERO | Gasto Financiero | gasto | 5 | debe | all |
| INTERES_POR_PAGAR | Interes por Pagar | puente | 5 | haber | all |
| PRESTAMO_CAPITAL | Prestamo Capital | contrapartida | 1 | ambos | all |
| BANCO | Cuenta Bancaria | contrapartida | 1 | ambos | all |
| BANCO_DETRACCIONES | Banco Detracciones | contrapartida | 1 | ambos | PE |
| TRANSFERENCIA_ORIGEN | Transferencia Origen | contrapartida | 1 | haber | all |
| TRANSFERENCIA_DESTINO | Transferencia Destino | contrapartida | 1 | debe | all |
| CAJA_CHICA | Caja Chica | contrapartida | 1 | ambos | all |
| COMISION_BANCARIA | Comision Bancaria | gasto | 5 | debe | all |
| ITF | ITF Peru | impuesto | 3 | debe | PE |
| COMPENSACION_CXC | Compensacion CXC | contrapartida | 1 | haber | all |
| COMPENSACION_CXP | Compensacion CXP | contrapartida | 1 | debe | all |
| ACTIVO_FIJO | Activo Fijo | contrapartida | 2 | debe | all |
| DEPRECIACION_GASTO | Depreciacion Gasto | gasto | 2 | debe | all |
| DEPRECIACION_ACUMULADA | Depreciacion Acumulada | puente | 2 | haber | all |
| BAJA_ACTIVO | Baja de Activo Fijo | gasto | 5 | debe | all |
| REVALUACION_ACTIVO | Revaluacion Activo | puente | 5 | haber | all |
| MEJORA_ACTIVO | Mejora de Activo | contrapartida | 2 | debe | all |
| LEASING_ACTIVO | Activo por Leasing | contrapartida | 2 | debe | all |
| LEASING_PASIVO | Pasivo por Leasing | contrapartida | 1 | haber | all |
| PLANILLA_DEVENGADA | Planilla Devengada | gasto | 2 | debe | all |
| PLANILLA_PAGADA | Planilla Pagada | contrapartida | 1 | haber | all |
| APORTES_PAGADOS | Aportes Pagados | contrapartida | 1 | haber | all |
| PROVISION_LABORAL | Provision Laboral | gasto | 2 | debe | all |
| PLANILLA_BATCH | Batch Marker | puente | — | — | all |
| VACACIONES_PASIVO | Pasivo Vacaciones | puente | 4 | haber | all |
| CTS_PASIVO | Pasivo CTS | puente | 4 | haber | PE |
| GRATIFICACION_PASIVO | Pasivo Gratificaciones | puente | 4 | haber | PE |
| COSTO_PRODUCCION | Costo Produccion | gasto | 2 | debe | all |
| INVENTARIO_MP | Inventario MP | contrapartida | 2 | ambos | all |
| INVENTARIO_PT | Inventario PT | contrapartida | 2 | ambos | all |
| MERMA_PRODUCCION | Merma Produccion | gasto | 5 | debe | all |
| MERMA_TRANSITO | Merma Transito | gasto | 5 | debe | all |
| COSTO_VENTA | Costo de Venta | gasto | 2 | debe | all |
| INTER_EMPRESA_VENTA | Venta Intercompania | ingreso | 2 | haber | all |
| INTER_EMPRESA_COSTO_VENTA | COGS Intercompania | gasto | 2 | debe | all |
| INTER_EMPRESA_COMPRA | Compra Intercompania | gasto | 2 | debe | all |
| INTER_EMPRESA_INVENTARIO | Inventario Intercompania | contrapartida | 2 | debe | all |
| ICBPER | ICBPER Peru | impuesto | 3 | haber | PE |
| INC | INC Colombia | impuesto | 3 | haber | CO |
| ISD | ISD Ecuador | impuesto | 3 | debe | EC |
| GMF | GMF Colombia | impuesto | 3 | debe | CO |
| RETE_ICA | Retencion ICA | impuesto | 3 | haber | CO |
| RETE_FUENTE | Retencion Fuente | impuesto | 3 | haber | CO |
| RETE_IVA | Retencion IVA | impuesto | 3 | haber | CO |
| ISO_ACREDITABLE | ISO Acreditable | contrapartida | 4 | debe | GT |
