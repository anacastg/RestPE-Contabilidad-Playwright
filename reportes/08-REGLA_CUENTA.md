# Resolución de Cuentas — Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `06-CATALOGO_COMPONENTES.md`, `07-REGLA_ACTIVACION.md`
**Gestión operativa:** `10-GESTION_REGLAS.md` — cómo cambiar cuentas, agregar reglas, debuguear resoluciones

---

## 1. Concepto

Una vez que el motor determina qué componentes se activan (Paso 2 del pipeline), cada componente debe traducirse a una **cuenta contable concreta**. La `regla_cuenta_componente` es el mecanismo que resuelve esa traducción usando **fallback progresivo**: busca la cuenta más específica y, si no la encuentra, sube un nivel de generalidad.

```
Componente: CLIENTE
  Contexto: empresa=E1, pais=PE, partner=ClienteX
    → 1. partner_cliente.cuenta_contable_id?        → NULL
    → 2. regla_cuenta_componente(CLIENTE, partner=ClienteX)? → NULL
    → 3. regla_cuenta_componente(CLIENTE, pais=PE)?  → 121201 Clientes
    → 4. USAR 121201
```

---

## 2. Orden de Resolución por Componente

### 2.1 Cadena genérica de fallback

Para cada componente, el motor ejecuta esta secuencia:

```
1. Dato específico del partner/producto (si aplica)
   └── partner_cliente.cuenta_contable_id
   └── partner_proveedor.cuenta_contable_id
   └── producto_categoria.cuenta_venta_default_id
   └── producto_categoria.cuenta_compra_default_id
   └── cuenta_bancaria.cuenta_contable_id

2. regla_cuenta_componente con TODOS los filtros del contexto
   └── componente_id + tipo_transaccion + categoria_id + partner_tipo + clasificacion_operacion + moneda_id

3. Sacando filtros uno por uno (de más específico a menos):
   └── Sin concepto_financiero_id
   └── Sin moneda_id
   └── Sin clasificacion_operacion_id
   └── Sin partner_tipo
   └── Sin producto_categoria_id
   └── Sin tipo_transaccion
   └── Solo pais_id + componente_id

4. Error: CUENTA_NO_CONFIGURADA
```

### 2.2 Cadena específica por grupo de componentes

#### CLIENTE
1. `partner_cliente.cuenta_contable_id` para este partner
2. `regla_cuenta_componente(CLIENTE, pais, partner_tipo=cliente)`
3. `regla_cuenta_componente(CLIENTE, pais)` (sin filtros)
4. **Error**

#### PROVEEDOR
1. `partner_proveedor.cuenta_contable_id` para este partner
2. `regla_cuenta_componente(PROVEEDOR, pais, partner_tipo=proveedor)`
3. `regla_cuenta_componente(PROVEEDOR, pais)`
4. **Error**

#### VENTA
1. `producto_categoria.cuenta_venta_default_id`
2. `regla_cuenta_componente(VENTA, pais, tipo_transaccion, categoria_id)`
3. `regla_cuenta_componente(VENTA, pais, tipo_transaccion)`
4. `regla_cuenta_componente(VENTA, pais)`
5. **Error**

#### COMPRA
1. `producto_categoria.cuenta_compra_default_id`
2. `regla_cuenta_componente(COMPRA, pais, tipo_transaccion, categoria_id)`
3. `regla_cuenta_componente(COMPRA, pais, tipo_transaccion)`
4. `regla_cuenta_componente(COMPRA, pais)`
5. **Error**

#### IVA
1. `regla_cuenta_componente(IVA, pais, evento)` — el evento determina si es débito o crédito
2. `regla_cuenta_componente(IVA, pais)`
3. **Error**

#### BANCO
1. `cuenta_bancaria.cuenta_contable_id` (la cuenta 10.x asociada a la cuenta bancaria)
2. `regla_cuenta_componente(BANCO, pais)`
3. **Error**

#### AGREGADOR
1. `partner_agregador_pago.cuenta_por_liquidar_id`
2. **Error** (no hay fallback — debe estar configurado)

#### COMISION / GASTO_FINANCIERO
1. Si viene con `concepto_financiero_id`: `regla_cuenta_componente(COMISION, concepto_financiero_id, pais)`
2. `partner_agregador_pago.cuenta_comision_id` (si aplica)
3. `regla_cuenta_componente(COMISION, pais)`
4. **Error**

#### DESTINO_INVENTARIO
1. `producto_categoria.cuenta_compra_default_id` (misma cuenta de destino, ej: 20 Mercaderías)
2. `regla_cuenta_componente(DESTINO_INVENTARIO, pais)`
3. **Error**

#### DIF_CAMBIO
1. `regla_cuenta_componente(DIF_CAMBIO, pais, tipo=perdida|ganancia)`
2. `regla_cuenta_componente(DIF_CAMBIO, pais)`
3. **Error**

#### DETRACCION / PERCEPCION / RETENCION
1. `regla_cuenta_componente(componente, pais)`
2. **Error**

#### ANTICIPO_PROVEEDOR / ANTICIPO_CLIENTE
1. `partner.cuenta_anticipo_id` (cuenta específica para anticipos)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### RETE_FUENTE / RETE_IVA / RETE_ICA / ICBPER / INC / ISD / GMF (país-específicos)
1. `regla_cuenta_componente(componente, pais)`
2. **Error**

#### VENTA_DESCUENTO
1. `regla_cuenta_componente(VENTA_DESCUENTO, pais, tipo_descuento)`
2. `regla_cuenta_componente(VENTA_DESCUENTO, pais)`
3. **Error**

#### VENTA_EXPORTACION
1. `regla_cuenta_componente(VENTA_EXPORTACION, pais, pais_destino, tipo_exportacion)`
2. `regla_cuenta_componente(VENTA_EXPORTACION, pais)`
3. **Error**

#### CAJA_VENTA / BANCO_VENTA
1. Sucursal / medio de pago (`sucursal.caja_default`, `medio_pago.cuenta_contable_id`)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### PROPINA
1. `regla_cuenta_componente(PROPINA, pais, tipo_propina, sucursal)`
2. `regla_cuenta_componente(PROPINA, pais)`
3. **Error**

#### CANAL_COMISION
1. Canal (`canal_venta.cuenta_comision_id`)
2. `regla_cuenta_componente(CANAL_COMISION, pais)`
3. **Error**

#### CONTRACARGO / CONTRACARGO_RECUPERADO
1. `regla_cuenta_componente(componente, pais, motivo_chargeback, medio_pago)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### PUNTO_FIDELIDAD / GIFT_CARD / SALDO_FAVOR_CLIENTE
1. Partner / programa (`partner_cliente.cuenta_saldo_favor`, `programa_fidelidad.cuenta`)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### DESCUENTO_CONCEDIDO
1. `regla_cuenta_componente(DESCUENTO_CONCEDIDO, pais)`
2. **Error**

#### CLIENTE_PERCEPCION / RETENCION_CLIENTE
1. Partner (`partner_cliente.tasa_percepcion`, `partner_cliente.es_agente_retencion`)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### COMISION_AGREGADOR / IVA_COMISION
1. Agregador (`agregador.cuenta_comision_id` para comisión; `regla_cuenta_componente` para IVA)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### CAJA_COMPRA
1. `regla_cuenta_componente(CAJA_COMPRA, pais, tipo_pago)`
2. `regla_cuenta_componente(CAJA_COMPRA, pais)`
3. **Error**

#### COMPRA_EXPORTACION
1. `regla_cuenta_componente(COMPRA_EXPORTACION, pais, tipo_importacion, pais_origen)`
2. `regla_cuenta_componente(COMPRA_EXPORTACION, pais)`
3. **Error**

#### BANCO_DETRACCIONES
1. Empresa (`empresa.cuenta_detraccion_id`)
2. `regla_cuenta_componente(BANCO_DETRACCIONES, pais)`
3. **Error**

#### TRANSFERENCIA_ORIGEN / TRANSFERENCIA_DESTINO
1. Cuenta bancaria (`cuenta_bancaria.cuenta_contable_id`)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### CAJA_CHICA
1. Sucursal (`sucursal.caja_chica_id`)
2. `regla_cuenta_componente(CAJA_CHICA, pais)`
3. **Error**

#### COMISION_BANCARIA
1. `regla_cuenta_componente(COMISION_BANCARIA, pais, tipo_comision, banco)`
2. `regla_cuenta_componente(COMISION_BANCARIA, pais)`
3. **Error**

#### ITF
1. `regla_cuenta_componente(ITF, pais)`
2. **Error**

#### COMPENSACION_CXC / COMPENSACION_CXP
1. Partner (`partner.cuenta_contable_id`)
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### ACTIVO_FIJO
1. Tipo de activo (`tipo_activo.cuenta_contable_id`)
2. `regla_cuenta_componente(ACTIVO_FIJO, pais, clase_activo)`
3. `regla_cuenta_componente(ACTIVO_FIJO, pais)`
4. **Error**

#### DEPRECIACION_GASTO / DEPRECIACION_ACUMULADA
1. `regla_cuenta_componente(componente, pais, clase_activo, centro_costo)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### BAJA_ACTIVO / REVALUACION_ACTIVO / MEJORA_ACTIVO
1. `regla_cuenta_componente(componente, pais, motivo_baja / clase_activo)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### LEASING_ACTIVO / LEASING_PASIVO
1. `regla_cuenta_componente(componente, pais, contrato, tipo_bien)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### PLANILLA_DEVENGADA / PLANILLA_PAGADA / APORTES_PAGADOS
1. `regla_cuenta_componente(componente, pais, centro_costo, tipo_aportacion)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### PROVISION_LABORAL
1. `regla_cuenta_componente(PROVISION_LABORAL, pais, tipo_provision, centro_costo)`
2. `regla_cuenta_componente(PROVISION_LABORAL, pais)`
3. **Error**

#### COSTO_PRODUCCION / INVENTARIO_MP / INVENTARIO_PT / MERMA_PRODUCCION / MERMA_TRANSITO
1. Producto (`producto.cuenta_inventario_id` para inventarios; `regla_cuenta_componente` para costos/mermas)
2. `regla_cuenta_componente(componente, pais, centro_costo, tipo_proceso)`
3. `regla_cuenta_componente(componente, pais)`
4. **Error**

#### COSTO_VENTA
1. Producto (`producto.cuenta_costo_venta_id`)
2. `regla_cuenta_componente(COSTO_VENTA, pais)`
3. **Error**

#### INTER_EMPRESA_VENTA / INTER_EMPRESA_COSTO_VENTA / INTER_EMPRESA_COMPRA / INTER_EMPRESA_INVENTARIO
1. `regla_cuenta_componente(componente, pais, empresa_relacionada, tipo_operacion)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### ISO_ACREDITABLE (Guatemala)
1. `regla_cuenta_componente(ISO_ACREDITABLE, pais)`
2. **Error**

#### FALTANTE_CAJA / DIFERENCIA_LIQUIDACION
1. `regla_cuenta_componente(componente, pais, sucursal, tipo_faltante)`
2. `regla_cuenta_componente(componente, pais)`
3. **Error**

#### GASTO_FINANCIERO / INTERES_POR_PAGAR / PRESTAMO_CAPITAL
1. Contrato / entidad financiera
2. `regla_cuenta_componente(componente, pais, tipo_gasto_financiero / tipo_prestamo, contrato)`
3. `regla_cuenta_componente(componente, pais)`
4. **Error**

---


### 3.1 Cálculo de montos según tipo

| Tipo | Estrategia | Fórmula | Ejemplo (IVA 18%, total 118) |
|---|---|---|---|
| `ingreso` | Extraer base del total | `total / (1 + tasa)` | VENTA: 118 / 1.18 = 100 |
| `gasto` | Extraer base del total | `total / (1 + tasa)` | COMPRA: 118 / 1.18 = 100 |
| `impuesto` | Aplicar tasa a base | `base × tasa` | IVA: 100 × 0.18 = 18 |
| `contrapartida` | Suma del lado opuesto | `∑(montos opuestos)` | CLIENTE: 100 + 18 = 118 |
| `puente` | Porcentaje del total | `total × %` | DETRACCION: 118 × 0.10 = 11.80 |
| `ajuste` | Diferencia entre TC | `monto × (TC_nuevo − TC_original)` | DIF_CAMBIO: 1000 × (3.80 − 3.70) = 100 |

### 3.2 Regla de redondeo

Para prevenir descuadres de S/ 0.01:

```
base = ROUND(total / (1 + tasa), 2)
impuesto = total - base    ← NO calcular por separado
```

Así `base + impuesto = total` exacto.

---

## 4. Configuración por País — Ejemplos

### 4.1 Perú — COMPRA_REGISTRADA (servicio gravado, crédito)

| Componente | Regla | Cuenta PCGE |
|---|---|---|
| `COMPRA` | tipo_transaccion=servicio → | 63 Servicios prestados por terceros |
| `IVA` | evento=COMPRA → | 40111 IVA crédito fiscal |
| `PROVEEDOR` | partner_tipo=proveedor → | 421 Facturas por pagar |

### 4.2 Colombia — COMPRA_REGISTRADA (servicio gravado, crédito)

| Componente | Regla | Cuenta PUC |
|---|---|---|
| `COMPRA` | tipo_transaccion=servicio → | 6210 Servicios de informática |
| `IVA` | evento=COMPRA → | 240801 IVA descontable |
| `PROVEEDOR` | partner_tipo=proveedor → | 451 Proveedores |
| `RETE_FUENTE` | tiene_retefuente=true → | 2365 Retención en la fuente |
| `RETE_IVA` | tiene_reteiva=true → | 2367 Retención IVA |
| `RETE_ICA` | tiene_reteica=true → | 2368 Retención ICA |

### 4.3 Ecuador — COMPRA_REGISTRADA (servicio gravado, crédito)

| Componente | Regla | Cuenta SRI |
|---|---|---|
| `COMPRA` | tipo_transaccion=servicio → | 63 Servicios |
| `IVA` | evento=COMPRA → | 4011 IVA crédito fiscal |
| `PROVEEDOR` | partner_tipo=proveedor → | 421 Proveedores |
| `ISD` | transacción internacional → | 63 ISD |

---

## 5. Algoritmo de `regla_cuenta_componente` (SQL)

```sql
SELECT rcc.cuenta_id, cc.codigo, cc.nombre
FROM regla_cuenta_componente rcc
JOIN plan_contable_det pcd ON rcc.cuenta_id = pcd.id
WHERE rcc.componente_id = $componente_id

  AND (rcc.pais_id = $pais_id OR rcc.pais_id IS NULL)
  AND (rcc.tipo_transaccion = $tipo_transaccion OR rcc.tipo_transaccion IS NULL)
  AND (rcc.producto_categoria_id = $categoria_id OR rcc.producto_categoria_id IS NULL)
  AND (rcc.partner_tipo = $partner_tipo OR rcc.partner_tipo IS NULL)
  AND (rcc.clasificacion_operacion_id = $clasif_id OR rcc.clasificacion_operacion_id IS NULL)
  AND (rcc.concepto_financiero_id = $concepto_fin_id OR rcc.concepto_financiero_id IS NULL)
  AND (rcc.moneda_id IS NULL OR rcc.moneda_id = $moneda_id)
  AND rcc.activo = true
ORDER BY rcc.prioridad DESC    -- más específico primero (prioridad más alta)
LIMIT 1;
```

### Fallback en código (Java)

```java
public UUID resolverCuenta(UUID componenteId, Contexto contexto) {
    // Iterar combinaciones de filtros, de más específico a menos
    List<Filtro> combinaciones = generarCombinaciones(contexto);
    
    for (Filtro combo : combinaciones) {
        UUID cuentaId = buscarRegla(componenteId, combo);
        if (cuentaId != null) return cuentaId;
    }
    throw new CuentaNoConfiguradaException(componenteId, contexto);
}
```

---

## 6. Errores y Manejo

| Error | Causa | Mensaje |
|---|---|---|
| `CUENTA_NO_CONFIGURADA` | Ninguna regla encuentra cuenta para el componente + contexto | "Para el componente {X}: No se encontró cuenta para país={Y}, tipo_transaccion={Z}. Sugerencia: INSERT INTO regla_cuenta_componente (...)" |
| `CUENTA_INACTIVA` | La cuenta encontrada no está activa | "La cuenta {X} ({Y}) está inactiva" |
| `CUENTA_SIN_MOVIMIENTO` | La cuenta no es imputable (es de agrupación) | "La cuenta {X} ({Y}) no acepta movimientos directos" |
