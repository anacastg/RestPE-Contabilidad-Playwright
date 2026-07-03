# Arquitectura del Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `02-CONCEPTOS.md`

---

## 1. Pipeline Completo (10 Pasos)

El pipeline es el corazón del motor. Cada paso transforma el payload de entrada. Si algún paso falla, el asiento no se persiste.

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAYLOAD DEL EVENTO                          │
│  { evento, pais_id, sucursal_id, fecha,             │
│    periodo, moneda, tc, diario, glosa, origen, origen_id,       │
│    lineas: [{ tipo_transaccion, partner_id, monto, ... }] }     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. RECIBIR                                                     │
│  Validar payload contra esquema del evento.                     │
│  - Campos obligatorios según el tipo de evento                  │
│  - Si moneda ≠ base: validar tipo_cambio                        │
│  - Si tiene_detraccion: validar porcentaje                      │
│  Salida: payload validado o PAYLOAD_INVALIDO                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. EVALUAR REGLAS DE ACTIVACIÓN                                │
│  Consultar regla_activacion para el evento + país.              │
│  Evaluar cada condición JSONB contra el payload.                │
│  - Cada regla que cumple → agrega/reemplaza/omite componente    │
│  - Salida: lista de componentes_contable activos por línea      │
│  Error: SIN_COMPONENTES (ninguna regla se activó)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. RESOLVER CUENTAS CONTABLES                                  │
│  Cada componente (rol) → cuenta_contable concreta.              │
│  Orden de resolución (de más específico a más general):         │
│    1. Partner específico (partner_cliente.cuenta_contable_id)   │
│    2. Categoría producto (producto_categoria.cuenta_default_id) │
│    3. regla_cuenta_componente con todos los filtros             │
│    4. Fallback: sacar filtros uno por uno                       │
│    5. Solo componente_id (contexto de tenant ya aísla empresa)  │
│    6. Error: CUENTA_NO_CONFIGURADA                              │
│  Salida: cada componente con su cuenta_id resuelta              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. CALCULAR MONTOS                                             │
│  Según tipo del componente, distribuir el monto base:           │
│  - ingreso/gasto: monto / (1 + tasa_impuesto)                  │
│  - impuesto: base_gravada × tasa_impuesto                      │
│  - contrapartida: suma de montos del lado opuesto              │
│  - puente: total × porcentaje_configurado                      │
│  - ajuste: monto × (TC_nuevo - TC_original)                    │
│  Salida: cada componente con su monto (debe/haber)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. ORDENAR Y POSICIONAR                                        │
│  Ordenar líneas según posicion del componente:                  │
│    1 = TERCEROS   (CLIENTE, PROVEEDOR, BANCO)                  │
│    2 = BASE       (VENTA, COMPRA, COMISION, COSTO)              │
│    3 = IMPUESTOS  (IVA, ISC, ICBPER)                      │
│    4 = PUENTE     (DETRACCION, PERCEPCION, RETENCION, ANTICIPO) │
│    5 = AJUSTE     (DIF_CAMBIO, COMISION_BANCARIA)              │
│  Consolidar: mismo componente + misma cuenta = sumar montos     │
│  Salida: líneas ordenadas y consolidadas                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. VALIDAR                                                     │
│  Validaciones OBLIGATORIAS (rechazan el asiento):               │
│  - Debe = Haber (tolerancia 0.01)                               │
│  - Cuentas existen y activas                                    │
│  - Cuentas aceptan movimiento (es_imputable = true)             │
│  - Periodo abierto                                              │
│  - Fecha dentro del periodo                                     │
│  - Diario activo                                                │
│  - Idempotencia: mismo origen+origen_id no duplica            │
│  Validaciones de ADVERTENCIA (alertan, no bloquean):            │
│  - Centro de costo no asignado                                  │
│  - Monto cero                                                   │
│  - Partner sin datos de contacto                                │
│  Salida: ASIENTO_INVALIDO o asiento validado                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. PERSISTIR                                                   │
│  INSERT asiento + N × INSERT asiento_detalle en TX:            │
│  BEGIN;                                                          │
│    INSERT INTO asiento (...);                                    │
│    FOR EACH linea:                                               │
│      INSERT INTO asiento_detalle (...);                          │
│  COMMIT;                                                         │
│  TODO dentro de la misma transacción.                           │
│  Salida: asiento_id                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. EFECTOS SECUNDARIOS                                         │
│  FUERA de la transacción del asiento.                           │
│  - Crear/actualizar CxC (cuenta_por_cobrar)                     │
│  - Crear/actualizar CxP (cuenta_por_pagar)                      │
│  - Actualizar kárdex (si afecta inventario)                     │
│  - Actualizar presupuesto                                       │
│  - Registrar venta/compra en libros tributarios                 │
│  Si falla → log de efecto pendiente para reintento             │
│  Salida: efectos secundarios aplicados                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  9. EMITIR EVENTO DE SALIDA                                     │
│  Publicar evento para otros módulos:                            │
│  - AsientoContabilizado{asiento_id, evento_original}            │
│  - CompraContabilizada{compra_id, asiento_id}                   │
│  - VentaContabilizada{venta_id, asiento_id}                     │
│  Salida: evento publicado                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  10. EXPORTAR REPORTES (async)                                  │
│  Según país, formato requerido:                                 │
│  - Perú: estructura PLE (Libro Diario, Registro Ventas/Compras) │
│  - Colombia: formato DIAN (información exógena)                 │
│  - Ecuador: formato SRI (anexos ATS)                            │
│  Salida: reporte generado / pendiente para exportación          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenancy y Aislamiento

### 2.1 Arquitectura: 1 BD por empresa

El sistema usa **multi-tenancy por base de datos**: cada empresa tiene su propia base de datos (tenant).

```
Security DB (restaurant_pe_security)
  └── master.empresa: lista maestra de empresas
        ├── id=2, ruc=20504595863, razon_social="PESQUERA CANTABRIA S.A.", pais_id=174 (PE)
        ├── db_name="restaurant_pe_emp_cantabria"
        ├── id=3, ruc=20513307579, razon_social="RESTAURANT CHIFA CAPON E.I.R.L.", pais_id=174 (PE)
        └── ...

Tenant DB (restaurant_pe_emp_cantabria)
  └── Datos contables de Pesquera Cantabria S.A.
  └── El pais_id se obtiene de master.empresa al conectar el tenant
  └── NO hay columna empresa_id en las tablas (el tenant ya es la empresa)
```

### 2.2 Consecuencias de diseño

- **No hay `empresa_id`** en ninguna tabla del tenant DB. El aislamiento lo da la BD.
- El `pais_id` se obtiene al cargar el contexto del tenant desde `master.empresa` en la security DB.
- La numeración de asientos (`numero_asiento`) es correlativa **por tenant** (única por BD).
- El plan de cuentas (`plan_contable_det`) es **por tenant** (una empresa = un plan).
- Las reglas (`regla_cuenta_componente`) se resuelven por tenant + pais_id.
- Un JOIN entre dos tenant DBs distintas no tiene sentido (son BDs separadas).

### 2.3 Carga del contexto

Cuando el motor procesa un evento:

```
1. El tenant DB ya está conectado (la app sabe qué BD usar según la empresa)
2. El pais_id se carga desde la security DB al iniciar el contexto del tenant
3. El motor usa pais_id para filtrar reglas_activacion y reglas_cuenta_componente
4. El motor NO necesita empresa_id porque los datos ya pertenecen a esa empresa
```

### 2.4 Diferencia con el diseño de beta

El proyecto beta asume **1 BD con N empresas** discriminadas por `empresa_id`. Nuestro proyecto usa **N BDs con 1 empresa cada una**. El motor es el mismo, pero las reglas de resolución no necesitan filtrar por `empresa_id`.

---

## 3. Multi-País

### 3.1 País es dato, no código

El motor **no tiene** un solo `if (pais == "PE")`. Todo es configuración por país:

| Tabla | Perú | Colombia | Ecuador |
|---|---|---|---|
| `plan_contable_det` (plan) | PCGE | PUC | Plan SRI/NIIF |
| `tasa_impuesto` | IVA 18% | IVA 19% | IVA 15% |
| `configuracion_fiscal_pais` | detracción, bancarización S/2000 | ReteICA, GMF 4x1000 | ISD 5% |
| `tipo_comprobante` | Factura 01, Boleta 03, RH | Factura electrónica, NC, ND | Factura, NC, ND |
| `regla_cuenta_componente` | 63 → 421 → 401 | 6210 → 451 → 2408 | 63 → 421 → 401 |

### 3.2 Posiciones fiscales (cross-border)

Cuando `pais_sucursal != pais_partner`, entran las posiciones fiscales. Transforman impuestos y cuentas según el contexto.

Ejemplo: sucursal en Perú compra a proveedor en Colombia:

```
posicion_fiscal_regla (
    posicion_fiscal_id = 'NO_DOM_PER',
    tipo_origen = 'impuesto',
    origen_id = IVA_18,
    destino_id = RET_NO_DOM   -- retención no domiciliados
);
```

---

## 4. Multi-Moneda

### 4.1 Concepto

Cada empresa tiene una **moneda funcional** (PEN en Perú, COP en Colombia, USD en Ecuador). Toda operación en otra moneda se convierte usando el **tipo de cambio (TC)** de la fecha.

### 4.2 Dos momentos, dos TC

- **TC de emisión**: cuando se devenga la operación
- **TC de pago**: cuando se cobra/paga

Si el TC cambió entre ambos, se genera automáticamente el componente `DIF_CAMBIO`.

### 4.3 Estructura en asiento_detalle

```sql
asiento_detalle (
    ...
    debe            decimal(14,2),    -- monto en moneda funcional
    haber           decimal(14,2),    -- monto en moneda funcional
    moneda_id       uuid,             -- moneda original de la transacción
    monto_original  decimal(14,2),    -- monto en moneda original
    ...
);
```

---

## 5. Inmutabilidad y Extornos

### 5.1 Regla de oro

Los asientos contabilizados **no se editan ni se borran**. Si algo está mal, se **extorna**: se crea un asiento nuevo que invierte el original.

### 5.2 Mecanismo de extorno

```
Asiento original #42 (venta errónea):
  Debe:  10 Caja POS              100.00
  Haber: 70 Ventas                 84.75
         40 IVA por pagar          15.25

Asiento de extorno #89 (revierte #42):
  Debe:  70 Ventas                 84.75
         40 IVA por pagar          15.25
  Haber: 10 Caja POS              100.00
  asiento_original_id = 42
  tipo_reversion = 'extorno_total'
```

### 5.3 Estructura

```sql
asiento (
    ...
    asiento_original_id  uuid?,     -- NULL si no es reversión
    tipo_reversion       varchar?,  -- extorno_total, extorno_parcial, correccion
    motivo_reversion     text?,
    revertido            boolean DEFAULT false  -- true si este asiento fue revertido
);
```

---

## 6. Idempotencia

Cada evento debe generar **exactamente un asiento**. La clave de idempotencia es:

```sql
UNIQUE (origen, origen_id)
-- Nota: no incluye empresa_id porque el tenant DB ya aísla los datos por empresa
```

Si se reintenta el mismo evento, el motor detecta el duplicado y responde con el asiento existente (no crea otro). Esto es crítico en procesamiento por colas/reintentos.

---

## 7. Auditoría

Toda acción contable se registra:

```sql
auditoria_asiento (
    id              uuid PK,
    asiento_id      uuid,
    accion          varchar(30),   -- CREAR, CONTABILIZAR, EXTORNAR, ANULAR
    usuario_id      uuid,
    timestamp       timestamptz,
    datos_antes     jsonb?,        -- para modificaciones
    datos_despues   jsonb?,        -- para modificaciones
    ip_origen       varchar(50)
);
```

---

## 8. Arquitectura de Backend (Java)

### 8.1 Paquetes propuestos

```
ms-contabilidad/
  engine/
    PipelineOrchestrator.java       ← coordina los 10 pasos
    ReceiverStep.java               ← Paso 1: validar payload
    ActivationEvaluatorStep.java    ← Paso 2: evaluar reglas
    AccountResolverStep.java        ← Paso 3: resolver cuentas
    AmountCalculatorStep.java       ← Paso 4: calcular montos
    LineSorterStep.java             ← Paso 5: ordenar
    ValidatorStep.java              ← Paso 6: validar
    PersistenceStep.java            ← Paso 7: persistir
    SideEffectStep.java             ← Paso 8: efectos secundarios
    EventEmitterStep.java           ← Paso 9: emitir evento
    ReportExporterStep.java         ← Paso 10: exportar reportes
  controller/
    AsientoEventController.java     ← POST /api/contabilidad/asientos/procesar-evento
    AsientoCrudController.java      ← GET/PUT asientos manuales (solo borrador)
    AsientoExtornoController.java   ← POST /api/contabilidad/asientos/{id}/extornar
  service/
    ComponenteContableService.java
    ReglaActivacionService.java
    ReglaCuentaComponenteService.java
    AsientoService.java
  dto/
    EventoRequest.java
    AsientoResponse.java
    LineaEvento.java
  mapper/
    AsientoMapper.java
```

### 8.2 Endpoints

| Método | Endpoint | Propósito |
|---|---|---|
| `POST` | `/api/contabilidad/asientos/procesar-evento` | Pipeline completo: recibe evento, devuelve asiento |
| `POST` | `/api/contabilidad/asientos/{id}/extornar` | Extorna un asiento contabilizado |
| `GET` | `/api/contabilidad/asientos/{id}` | Consulta asiento con detalles |
| `GET` | `/api/contabilidad/asientos?origen=X&origen_id=Y` | Busca asiento por origen |
| `GET` | `/api/contabilidad/componentes` | CRUD componente_contable |
| `GET` | `/api/contabilidad/reglas-activacion` | CRUD regla_activacion |
| `GET` | `/api/contabilidad/reglas-cuenta` | CRUD regla_cuenta_componente |

---

## 9. Diagrama de Dependencias

```
ms-compras ──┐
ms-ventas  ──┤
ms-tesoreria─┼──→ POST /procesar-evento ──→ PipelineOrchestrator ──→ asiento + asiento_detalle
ms-almacen ──┤                                     │
ms-planilla──┘                                     │
                                          ┌────────┴────────┐
                                          │                  │
                                   regla_activacion   regla_cuenta_componente
                                          │                  │
                                    componente_contable  plan_contable_det
```

Los módulos operativos emiten eventos HTTP. El motor los procesa y persiste los asientos. Los módulos **no conocen cuentas contables** — solo describen lo que pasó.
