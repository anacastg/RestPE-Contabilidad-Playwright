# Reglas de Activación — Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `05-CATALOGO_EVENTOS.md`, `06-CATALOGO_COMPONENTES.md`
**Gestión operativa:** `10-GESTION_REGLAS.md` — cómo agregar, modificar y debuguear reglas en el día a día

---

## 1. Concepto

Las reglas de activación definen **qué componentes contables se activan** cuando ocurre un evento, y **bajo qué condiciones**. Cada regla tiene una condición JSONB que se evalúa contra el payload del evento.

```
Evento + Payload
  │
  └── regla_activacion: ¿cumple condicion?
        │ SI → AGREGAR componente a la lista activa
        │ SI (accion=REEMPLAZAR) → reemplazar componente existente
        │ SI (accion=OMITIR) → evitar que se active
        │ NO → siguiente regla
```

---

## 2. Matriz de Activación

### 2.1 Ventas

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `VENTA_EMITIDA` | `CLIENTE` | `{"tipo_pago": "credito"}` | AGREGAR | all |
| `VENTA_EMITIDA` | `CAJA_VENTA` | `{"tipo_pago": "contado", "medio_pago": "efectivo"}` | AGREGAR | all |
| `VENTA_EMITIDA` | `BANCO_VENTA` | <code>{"tipo_pago": "contado", "medio_pago": "tarjeta&#124;transferencia"}</code> | AGREGAR | all |
| `VENTA_EMITIDA` | `AGREGADOR` | `{"tipo_pago": "credito", "canal": "delivery_app"}` | AGREGAR | all |
| `VENTA_EMITIDA` | `VENTA` | <code>{"clasificacion_operacion": "gravado&#124;exonerado&#124;inafecto"}</code> | AGREGAR | all |
| `VENTA_EMITIDA` | `VENTA_EXPORTACION` | `{"es_exportacion": true}` | REEMPLAZAR(VENTA) | all |
| `VENTA_EMITIDA` | `IVA` | `{"afecta_iva": true, "clasificacion_operacion": "gravado"}` | AGREGAR | all |
| `VENTA_EMITIDA` | `PROPINA` | `{"tiene_propina": true}` | AGREGAR | PE |
| `VENTA_EMITIDA` | `PERCEPCION` | `{"tiene_percepcion": true}` | AGREGAR | PE |
| `VENTA_EMITIDA` | `CLIENTE_PERCEPCION` | `{"cliente_sujeto_percepcion": true}` | AGREGAR | PE |
| `VENTA_EMITIDA` | `RETENCION_CLIENTE` | `{"cliente_agente_retencion": true}` | AGREGAR | PE |
| `VENTA_EMITIDA` | `ICBPER` | `{"tiene_icbper": true}` | AGREGAR | PE |
| `VENTA_EMITIDA` | `INC` | `{"tiene_inc": true}` | AGREGAR | CO |
| `VENTA_EMITIDA` | `PUNTO_FIDELIDAD` | `{"redime_puntos": true}` | AGREGAR | all |
| `VENTA_EMITIDA` | `GIFT_CARD` | `{"usa_gift_card": true}` | AGREGAR | all |
| `VENTA_EMITIDA` | `SALDO_FAVOR_CLIENTE` | `{"usa_saldo_favor": true}` | AGREGAR | all |
| `VENTA_EMITIDA` | `VENTA_DESCUENTO` | `{"tiene_descuento_comercial": true}` | AGREGAR | all |
| `VENTA_EMITIDA` | `DESCUENTO_CONCEDIDO` | `{"tiene_descuento_financiero": true}` | AGREGAR | all |
| `VENTA_EMITIDA` | `CANAL_COMISION` | `{"canal_comision": true}` | AGREGAR | all |
| `VENTA_EMITIDA` | `COSTO_VENTA` | `{"inventario_permanente": true}` | AGREGAR | all |

### 2.2 Ventas — Notas y Contracargos

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `NOTA_CREDITO_EMITIDA` | `VENTA` | `{}` | AGREGAR (invertido) | all |
| `NOTA_CREDITO_EMITIDA` | `IVA` | `{"afecta_iva": true}` | AGREGAR (invertido) | all |
| `NOTA_CREDITO_EMITIDA` | `CLIENTE` | `{"tipo_pago": "credito"}` | AGREGAR (invertido) | all |
| `NOTA_CREDITO_EMITIDA` | `CAJA_VENTA` | `{"tipo_pago": "contado"}` | AGREGAR (invertido) | all |
| `NOTA_DEBITO_EMITIDA` | `VENTA` | `{"tipo_nd": "ajuste_precio"}` | AGREGAR | all |
| `NOTA_DEBITO_EMITIDA` | `OTROS_INGRESOS` | <code>{"tipo_nd": "interes_mora&#124;gastos_cobranza"}</code> | AGREGAR | all |
| `NOTA_DEBITO_EMITIDA` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `NOTA_DEBITO_EMITIDA` | `CLIENTE` | `{}` | AGREGAR | all |
| `CONTRACARGO_RESUELTO` | `CONTRACARGO` | `{"resultado": "perdido"}` | AGREGAR | all |
| `CONTRACARGO_RESUELTO` | `CONTRACARGO_RECUPERADO` | `{"resultado": "ganado"}` | AGREGAR | all |
| `CONTRACARGO_RESUELTO` | `IVA` | `{"afecta_iva": true, "resultado": "perdido"}` | AGREGAR | all |

### 2.3 Ventas — Cobros y Anticipos

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `COBRO_REGISTRADO` | `BANCO` | <code>{"medio_pago": "tarjeta&#124;transferencia&#124;deposito"}</code> | AGREGAR | all |
| `COBRO_REGISTRADO` | `CAJA_VENTA` | `{"medio_pago": "efectivo"}` | AGREGAR | all |
| `COBRO_REGISTRADO` | `CLIENTE` | `{}` | AGREGAR | all |
| `COBRO_REGISTRADO` | `COMISION_BANCARIA` | `{"comision": true}` | AGREGAR | all |
| `COBRO_REGISTRADO` | `DIF_CAMBIO` | `{"tiene_diferencia_cambio": true}` | AGREGAR | all |
| `LIQUIDACION_AGREGADOR` | `BANCO` | `{}` | AGREGAR | all |
| `LIQUIDACION_AGREGADOR` | `AGREGADOR` | `{}` | AGREGAR | all |
| `LIQUIDACION_AGREGADOR` | `COMISION_AGREGADOR` | `{"comision": true}` | AGREGAR | all |
| `LIQUIDACION_AGREGADOR` | `IVA_COMISION` | `{"afecta_iva": true}` | AGREGAR | all |
| `LIQUIDACION_AGREGADOR` | `PROPINA_PENDIENTE` | `{"propina": true}` | AGREGAR | all |
| `ANTICIPO_CLIENTE` | `BANCO` | `{}` | AGREGAR | all |
| `ANTICIPO_CLIENTE` | `ANTICIPO_CLIENTE` | `{}` | AGREGAR | all |
| `APLICACION_ANTICIPO_CLIENTE` | `CLIENTE` | `{}` | AGREGAR | all |
| `APLICACION_ANTICIPO_CLIENTE` | `ANTICIPO_CLIENTE` | `{}` | AGREGAR | all |

### 2.4 Compras

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `COMPRA_REGISTRADA` | `COMPRA` | `{}` | AGREGAR | all |
| `COMPRA_REGISTRADA` | `COMPRA_EXPORTACION` | `{"es_importacion": true}` | REEMPLAZAR(COMPRA) | all |
| `COMPRA_REGISTRADA` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `COMPRA_REGISTRADA` | `PROVEEDOR` | `{"tipo_pago": "credito"}` | AGREGAR | all |
| `COMPRA_REGISTRADA` | `CAJA_COMPRA` | `{"tipo_pago": "contado"}` | AGREGAR | all |
| `COMPRA_REGISTRADA` | `DESTINO_INVENTARIO` | `{"afecta_inventario": true}` | AGREGAR | all |
| `COMPRA_REGISTRADA` | `DETRACCION` | `{"tiene_detraccion": true}` | AGREGAR | PE |
| `COMPRA_REGISTRADA` | `PERCEPCION` | `{"tiene_percepcion": true}` | AGREGAR | PE |
| `COMPRA_REGISTRADA` | `RETENCION` | `{"tiene_retencion": true}` | AGREGAR | PE |
| `COMPRA_REGISTRADA` | `RETE_FUENTE` | `{"tiene_retefuente": true}` | AGREGAR | CO |
| `COMPRA_REGISTRADA` | `RETE_IVA` | `{"tiene_reteiva": true}` | AGREGAR | CO |
| `COMPRA_REGISTRADA` | `RETE_ICA` | `{"tiene_reteica": true}` | AGREGAR | CO |
| `COMPRA_REGISTRADA` | `ANTICIPO_PROVEEDOR` | `{"aplica_anticipo": true}` | AGREGAR | all |
| `NC_COMPRA` | `COMPRA` | `{}` | AGREGAR (invertido) | all |
| `NC_COMPRA` | `IVA` | `{"afecta_iva": true}` | AGREGAR (invertido) | all |
| `NC_COMPRA` | `PROVEEDOR` | `{}` | AGREGAR (invertido) | all |

### 2.5 Tesorería

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `PAGO_PROVEEDOR` | `PROVEEDOR` | `{}` | AGREGAR | all |
| `PAGO_PROVEEDOR` | `BANCO` | <code>{"medio_pago": "transferencia&#124;cheque"}</code> | AGREGAR | all |
| `PAGO_PROVEEDOR` | `CAJA_COMPRA` | `{"medio_pago": "efectivo"}` | AGREGAR | all |
| `PAGO_PROVEEDOR` | `DIF_CAMBIO` | `{"tiene_diferencia_cambio": true}` | AGREGAR | all |
| `PAGO_PROVEEDOR` | `GMF` | `{"aplica_gmf": true}` | AGREGAR | CO |
| `PAGO_PROVEEDOR` | `ISD` | `{"aplica_isd": true}` | AGREGAR | EC |
| `PAGO_DETRACCION` | `PROVEEDOR` | `{}` | AGREGAR | PE |
| `PAGO_DETRACCION` | `BANCO` | `{}` | AGREGAR | PE |
| `PAGO_DETRACCION` | `BANCO_DETRACCIONES` | `{}` | AGREGAR | PE |
| `TRANSFERENCIA_INTERNA` | `TRANSFERENCIA_ORIGEN` | `{}` | AGREGAR | all |
| `TRANSFERENCIA_INTERNA` | `TRANSFERENCIA_DESTINO` | `{}` | AGREGAR | all |
| `TRANSFERENCIA_INTERNA` | `ITF` | `{"aplica_itf": true}` | AGREGAR | PE |
| `TRANSFERENCIA_INTERNA` | `GMF` | `{"aplica_gmf": true}` | AGREGAR | CO |
| `APERTURA_CAJA_CHICA` | `CAJA_CHICA` | `{}` | AGREGAR | all |
| `APERTURA_CAJA_CHICA` | `BANCO` | `{}` | AGREGAR | all |
| `GASTO_CAJA_CHICA` | `COMPRA` | `{}` | AGREGAR | all |
| `GASTO_CAJA_CHICA` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `GASTO_CAJA_CHICA` | `CAJA_CHICA` | `{}` | AGREGAR | all |
| `REPOSICION_CAJA_CHICA` | `CAJA_CHICA` | `{}` | AGREGAR | all |
| `REPOSICION_CAJA_CHICA` | `BANCO` | `{}` | AGREGAR | all |

### 2.6 Activos Fijos

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `COMPRA_ACTIVO_FIJO` | `ACTIVO_FIJO` | `{}` | AGREGAR | all |
| `COMPRA_ACTIVO_FIJO` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `COMPRA_ACTIVO_FIJO` | `PROVEEDOR` | `{"tipo_pago": "credito"}` | AGREGAR | all |
| `COMPRA_ACTIVO_FIJO` | `BANCO` | `{"tipo_pago": "contado"}` | AGREGAR | all |
| `DEPRECIACION_MENSUAL` | `DEPRECIACION_GASTO` | `{}` | AGREGAR | all |
| `DEPRECIACION_MENSUAL` | `DEPRECIACION_ACUMULADA` | `{}` | AGREGAR | all |
| `BAJA_ACTIVO` | `DEPRECIACION_ACUMULADA` | `{}` | AGREGAR | all |
| `BAJA_ACTIVO` | `ACTIVO_FIJO` | `{}` | AGREGAR | all |
| `BAJA_ACTIVO` | `BAJA_ACTIVO` | `{"resultado": "perdida"}` | AGREGAR | all |
| `VENTA_ACTIVO` | `ACTIVO_FIJO` | `{}` | AGREGAR | all |
| `VENTA_ACTIVO` | `DEPRECIACION_ACUMULADA` | `{}` | AGREGAR | all |
| `VENTA_ACTIVO` | `VENTA` | `{}` | AGREGAR | all |
| `VENTA_ACTIVO` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `VENTA_ACTIVO` | `BANCO` | `{}` | AGREGAR | all |
| `VENTA_ACTIVO` | `GANANCIA_VENTA_AF` | `{"resultado": "ganancia"}` | AGREGAR | all |
| `VENTA_ACTIVO` | `PERDIDA_VENTA_AF` | `{"resultado": "perdida"}` | AGREGAR | all |
| `REVALUACION_ACTIVO` | `ACTIVO_FIJO` | `{}` | AGREGAR | all |
| `REVALUACION_ACTIVO` | `REVALUACION_ACTIVO` | `{}` | AGREGAR | all |
| `MEJORA_ACTIVO` | `MEJORA_ACTIVO` | `{}` | AGREGAR | all |
| `MEJORA_ACTIVO` | `PROVEEDOR` | `{"tipo_pago": "credito"}` | AGREGAR | all |

### 2.7 Leasing

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `LEASING_INICIADO` | `LEASING_ACTIVO` | `{}` | AGREGAR | all |
| `LEASING_INICIADO` | `LEASING_PASIVO` | `{}` | AGREGAR | all |
| `LEASING_INICIADO` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `LEASING_CUOTA_PAGADA` | `LEASING_PASIVO` | `{}` | AGREGAR | all |
| `LEASING_CUOTA_PAGADA` | `BANCO` | `{}` | AGREGAR | all |
| `LEASING_CUOTA_PAGADA` | `GASTO_FINANCIERO` | `{"tiene_interes": true}` | AGREGAR | all |

### 2.8 Planillas

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `PLANILLA_DEVENGADA` | `PLANILLA_DEVENGADA` | `{}` | AGREGAR | all |
| `PLANILLA_DEVENGADA` | `PROVEEDOR` | `{}` | AGREGAR | all |
| `PLANILLA_DEVENGADA` | `PROVISION_LABORAL` | `{"tiene_provision": true}` | AGREGAR | all |
| `PLANILLA_PAGADA` | `PLANILLA_PAGADA` | `{}` | AGREGAR | all |
| `PLANILLA_PAGADA` | `BANCO` | `{}` | AGREGAR | all |
| `PLANILLA_PAGADA` | `APORTES_PAGADOS` | `{"tiene_aportes": true}` | AGREGAR | all |

### 2.9 Producción / Inventario

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `COMPRA_INVENTARIO` | `COMPRA` | `{}` | AGREGAR | all |
| `COMPRA_INVENTARIO` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `COMPRA_INVENTARIO` | `PROVEEDOR` | `{}` | AGREGAR | all |
| `COMPRA_INVENTARIO` | `DESTINO_INVENTARIO` | `{}` | AGREGAR | all |
| `CONSUMO_PRODUCCION` | `COSTO_PRODUCCION` | `{}` | AGREGAR | all |
| `CONSUMO_PRODUCCION` | `INVENTARIO_MP` | `{}` | AGREGAR | all |
| `PRODUCCION_TERMINADA` | `INVENTARIO_PT` | `{}` | AGREGAR | all |
| `PRODUCCION_TERMINADA` | `COSTO_PRODUCCION` | `{}` | AGREGAR | all |
| `MERMA_REGISTRADA` | `MERMA_PRODUCCION` | `{}` | AGREGAR | all |
| `MERMA_REGISTRADA` | `INVENTARIO_MP` | `{"tipo_merma": "insumo"}` | AGREGAR | all |
| `MERMA_REGISTRADA` | `INVENTARIO_PT` | `{"tipo_merma": "pt"}` | AGREGAR | all |
| `AJUSTE_INVENTARIO` | `INVENTARIO_MP` | `{"tipo_ajuste": "mp"}` | AGREGAR | all |
| `AJUSTE_INVENTARIO` | `INVENTARIO_PT` | `{"tipo_ajuste": "pt"}` | AGREGAR | all |
| `AJUSTE_INVENTARIO` | `COMPRA` | `{"resultado": "faltante"}` | AGREGAR | all |
| `AJUSTE_INVENTARIO` | `VENTA` | `{"resultado": "sobrante"}` | AGREGAR | all |

### 2.10 Inter-Company

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `TRANSFERENCIA_VENTA` | `INTER_EMPRESA_VENTA` | `{}` | AGREGAR | all |
| `TRANSFERENCIA_VENTA` | `INTER_EMPRESA_COSTO_VENTA` | `{}` | AGREGAR | all |
| `TRANSFERENCIA_VENTA` | `IVA` | `{"afecta_iva": true}` | AGREGAR | all |
| `TRANSFERENCIA_COMPRA` | `INTER_EMPRESA_COMPRA` | `{}` | AGREGAR | all |
| `TRANSFERENCIA_COMPRA` | `INTER_EMPRESA_INVENTARIO` | `{}` | AGREGAR | all |

### 2.11 Extornos

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `EXTORNO_ASIENTO` | _todos los del asiento original_ | `{}` | AGREGAR (invertido) | all |

### 2.12 Financiero (Préstamos / Factoring)

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `PRESTAMO_DESEMBOLSADO` | `BANCO` | `{}` | AGREGAR | all |
| `PRESTAMO_DESEMBOLSADO` | `PRESTAMO_CAPITAL` | `{}` | AGREGAR | all |
| `PRESTAMO_CUOTA_PAGADA` | `PRESTAMO_CAPITAL` | `{}` | AGREGAR | all |
| `PRESTAMO_CUOTA_PAGADA` | `INTERES_POR_PAGAR` | `{"tiene_interes": true}` | AGREGAR | all |
| `PRESTAMO_CUOTA_PAGADA` | `BANCO` | `{}` | AGREGAR | all |
| `LIQUIDACION_FACTORING` | `BANCO` | `{}` | AGREGAR | all |
| `LIQUIDACION_FACTORING` | `GASTO_FINANCIERO` | `{"comision": true}` | AGREGAR | all |

### 2.13 Caja y Conciliación Bancaria

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `CIERRE_CAJA` | `FALTANTE_CAJA` | `{"resultado": "faltante"}` | AGREGAR | all |
| `LIQUIDACION_TARJETA` | `DIFERENCIA_LIQUIDACION` | `{"tiene_diferencia": true}` | AGREGAR | all |
| `LIQUIDACION_TARJETA` | `COMISION_BANCARIA` | `{"comision_tarjeta": true}` | AGREGAR | all |

### 2.14 Compensaciones CxC / CxP

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `COMPENSACION_REGISTRADA` | `COMPENSACION_CXC` | `{}` | AGREGAR | all |
| `COMPENSACION_REGISTRADA` | `COMPENSACION_CXP` | `{}` | AGREGAR | all |

### 2.15 Transferencia entre Almacenes

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `TRANSFERENCIA_ALMACEN` | `INVENTARIO_MP` | `{"tipo_almacen": "mp"}` | AGREGAR | all |
| `TRANSFERENCIA_ALMACEN` | `INVENTARIO_PT` | `{"tipo_almacen": "pt"}` | AGREGAR | all |
| `TRANSFERENCIA_ALMACEN` | `MERMA_TRANSITO` | `{"tiene_merma": true}` | AGREGAR | all |

### 2.16 Provisiones Laborales Específicas

| Evento | Componente | Condición | Acción | País |
|---|---|---|---|---|
| `PROVISION_CTS` | `PROVISION_LABORAL` | `{}` | AGREGAR | all |
| `PROVISION_CTS` | `CTS_PASIVO` | `{}` | AGREGAR | PE |
| `PROVISION_VACACIONES` | `PROVISION_LABORAL` | `{}` | AGREGAR | all |
| `PROVISION_VACACIONES` | `VACACIONES_PASIVO` | `{}` | AGREGAR | all |
| `PROVISION_GRATIFICACION` | `PROVISION_LABORAL` | `{}` | AGREGAR | all |
| `PROVISION_GRATIFICACION` | `GRATIFICACION_PASIVO` | `{}` | AGREGAR | PE |

---

## 3. Evaluación de Condiciones

Cada condición JSONB se evalúa contra el payload del evento siguiendo estas reglas:

| Operador implícito | Comportamiento |
|---|---|
| `{"afecta_iva": true}` | `payload.lineas[0].afecta_iva == true` |
| `{"tipo_pago": "credito"}` | `payload.tipo_pago == "credito"` |
| `{"tipo_pago": "contado", "medio_pago": "efectivo"}` | AND: ambas deben cumplirse |
| `{"es_exportacion": false}` | `payload.es_exportacion != true` (o no existe) |

### Orden de evaluación

Las reglas se evalúan en orden de `orden ASC`. Si dos reglas tienen el mismo `evento + condicion`, la de `orden` menor se evalúa primero. El `REEMPLAZAR` modifica la lista de componentes activos antes de que se evalúen las reglas siguientes.

### Error: `SIN_COMPONENTES`

Si ninguna regla se activa para un evento, el motor retorna error `SIN_COMPONENTES` y no genera asiento. Esto es válido para eventos que no tienen implicancia contable directa (ej: cambio de precio en producto).
