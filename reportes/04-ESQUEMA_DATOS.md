# Esquema de Datos — Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `02-CONCEPTOS.md`, `03-ARQUITECTURA.md`

---

## 1. Mapeo: Tablas Actuales → Nuevas

| Tabla Actual | Acción | Detalle |
|---|---|---|
| `plan_contable` | 🗑️ Deprecar (fusión implícita en plan_contable_det) | Solo 2 registros. El plan se infiere de las cuentas. |
| `plan_contable_det` | ✏️ **ALTER** ADD columnas | ADD: `cuenta_padre_id`, `naturaleza`, `tipo`, `codigo_autoridad`. No se renombra. |
| `cntbl_asiento` | ✏️ **ALTER** ADD columnas | ADD: `numero_asiento`, `periodo_contable_id`, `origen_id`, `estado`, `asiento_original_id`, `tipo_reversion`, `total_debe`, `total_haber`. |
| `cntbl_asiento_det` | ✏️ **ALTER** ADD columnas | ADD: `linea`, `debe`, `haber`, `moneda_id`, `monto_original`, `sucursal_id`, `partner_id`. |
| `cntbl_libro` | ✏️ **ALTER** ADD columna | ADD: `tipo` (compras/ventas/caja/banco/diario) |
| `cntbl_cierre` | ✏️ **ALTER** ADD columnas | ADD: `id` UUID PK, `fecha_inicio`, `fecha_fin`, `estado` |
| `numerador_asiento` | ✏️ **ALTER** ADD columna | ADD: `formato` VARCHAR(50) |
| `cntbl_preasiento` | ✏️ **ALTER** ADD columnas | ADD: `estado`, `asiento_id` |
| `cntbl_preasiento_det` | ✏️ **ALTER** ADD columnas | ADD: `debe`, `haber` |
| `centros_costo` | ✅ Mantener as-is | Sin cambios |
| `concepto_financiero` | ✏️ **UPDATE** FK value | Cambiar `matriz_contable_id` → `componente_id` |
| — | 🆕 **CREATE** `componente_contable` | Nueva, sin contraparte |
| — | 🆕 **CREATE** `regla_activacion` | Nueva, sin contraparte |
| — | 🆕 **CREATE** `regla_cuenta_componente` | Nueva, sin contraparte |
| — | 🆕 **CREATE** `tasa_impuesto` | Nueva, complementa core.tipos_impuesto |
| — | 🆕 **CREATE** `configuracion_fiscal_pais` | Nueva |
| — | 🆕 **CREATE** `auditoria_asiento` | Nueva |
| — | 🆕 **CREATE** `posicion_fiscal` + `posicion_fiscal_regla` | Nueva (cross-border) |
| — | 🆕 **CREATE** `posicion_fiscal` + `posicion_fiscal_regla` | Nueva |
| `matriz_contable` | 🗑️ **DEPRECAR** → _legacy | RENAME TO |
| `matriz_contable_det` | 🗑️ **DEPRECAR** → _legacy | RENAME TO |
| `grupo_matriz_cntbl` | 🗑️ **DEPRECAR** → _legacy | RENAME TO |
| `grupo_contable` | 🗑️ **DEPRECAR** → _legacy | RENAME TO |
| `tipo_mov_matriz_subcat` | 🗑️ **DEPRECAR** → _legacy | RENAME TO |

---

## 2. DDL Conceptual — Nuevas Tablas

### 2.1 `componente_contable` — Catálogo de roles

```sql
CREATE TABLE componente_contable (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo      VARCHAR(30) UNIQUE NOT NULL,   -- VENTA, COMPRA, IVA, CLIENTE, PROVEEDOR...
    nombre      VARCHAR(100) NOT NULL,
    tipo        VARCHAR(20) NOT NULL,          -- ingreso, gasto, impuesto, contrapartida, puente, ajuste
    posicion    INTEGER NOT NULL,              -- 1=terceros, 2=base, 3=impuestos, 4=puente, 5=ajuste
    direccion   VARCHAR(10) NOT NULL,          -- debe, haber, ambos
    es_batch    BOOLEAN DEFAULT FALSE,         -- true para planillas (consolidación)
    activo      BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE componente_contable IS 'Roles contables atómicos que forman un asiento';
COMMENT ON COLUMN componente_contable.tipo IS 'ingreso|gasto|impuesto|contrapartida|puente|ajuste';
COMMENT ON COLUMN componente_contable.posicion IS '1=terceros, 2=base, 3=impuestos, 4=puente, 5=ajuste';
COMMENT ON COLUMN componente_contable.direccion IS 'debe|haber|ambos';
```

### 2.2 `regla_activacion` — Activación de componentes por evento

```sql
CREATE TABLE regla_activacion (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais_id                     UUID REFERENCES core.pais(id),
    evento                      VARCHAR(30) NOT NULL,  -- COMPRA_REGISTRADA, VENTA_EMITIDA...
    componente_id               UUID NOT NULL REFERENCES componente_contable(id),
    condicion                   JSONB,                 -- {"afecta_igv": true, "tiene_detraccion": false}
    accion                      VARCHAR(30) NOT NULL DEFAULT 'AGREGAR',  -- AGREGAR, REEMPLAZAR, OMITIR
    componente_reemplazo_id     UUID REFERENCES componente_contable(id),  -- si accion=REEMPLAZAR
    orden                       INTEGER NOT NULL,
    activo                      BOOLEAN DEFAULT TRUE,
    UNIQUE (evento, componente_id, pais_id)
);

CREATE INDEX idx_regla_activacion_evento ON regla_activacion(evento, pais_id);
COMMENT ON TABLE regla_activacion IS 'Define qué componentes se activan según evento + condiciones';
```

### 2.3 `regla_cuenta_componente` — Resolución cuenta por componente

```sql
CREATE TABLE regla_cuenta_componente (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    componente_id               UUID NOT NULL REFERENCES componente_contable(id),
    pais_id                     UUID REFERENCES core.pais(id),
    tipo_transaccion            VARCHAR(30),          -- mercaderia, servicio, activo_fijo, honorario
    producto_categoria_id       UUID,                 -- FK a producto_categoria
    partner_tipo                VARCHAR(30),          -- proveedor, cliente, empleado
    clasificacion_operacion_id  UUID,                 -- gravado, exonerado, inafecto, exportacion
    moneda_id                   UUID REFERENCES core.moneda(id),
    concepto_financiero_id      UUID,                 -- para eventos financieros (comision, interes, itf)
    prioridad                   INTEGER NOT NULL DEFAULT 0,
    cuenta_id                   UUID NOT NULL REFERENCES cuenta_contable(id),
    activo                      BOOLEAN DEFAULT TRUE,
    UNIQUE (componente_id, prioridad)
);

CREATE INDEX idx_regla_cuenta_componente ON regla_cuenta_componente(componente_id);
COMMENT ON TABLE regla_cuenta_componente IS 'Resuelve un componente + contexto a una cuenta contable concreta por país';
```

### 2.4 `auditoria_asiento` — Log de auditoría

```sql
CREATE TABLE auditoria_asiento (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asiento_id      BIGINT REFERENCES contabilidad.cntbl_asiento(id),
    accion          VARCHAR(30) NOT NULL,     -- CREAR, CONTABILIZAR, EXTORNAR, ANULAR
    usuario_id      UUID,
    timestamp       TIMESTAMPTZ DEFAULT NOW(),
    datos_antes     JSONB,
    datos_despues   JSONB,
    ip_origen       VARCHAR(50)
);

CREATE INDEX idx_auditoria_asiento ON auditoria_asiento(asiento_id, timestamp);
```

### 2.6 `posicion_fiscal` y `posicion_fiscal_regla` — Cross-border

```sql
CREATE TABLE posicion_fiscal (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais_id         UUID REFERENCES core.pais(id),
    codigo          VARCHAR(20) NOT NULL,
    nombre          VARCHAR(200),
    auto_aplicar    BOOLEAN DEFAULT FALSE,
    activa          BOOLEAN DEFAULT TRUE,
    UNIQUE (codigo)
);

CREATE TABLE posicion_fiscal_regla (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posicion_fiscal_id      UUID NOT NULL REFERENCES posicion_fiscal(id),
    tipo_origen             VARCHAR(20) NOT NULL,   -- componente, impuesto, cuenta
    origen_id               UUID NOT NULL,
    destino_id              UUID NOT NULL
);
```

### 2.7 `tasa_impuesto` — Tasas por país + vigencia

```sql
CREATE TABLE tasa_impuesto (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais_id         UUID NOT NULL REFERENCES core.pais(id),
    codigo          VARCHAR(20) NOT NULL,       -- IVA, ISC, ICBPER...
    nombre          VARCHAR(100),
    tasa            DECIMAL(5,2) NOT NULL,
    vigente_desde   DATE NOT NULL,
    vigente_hasta   DATE,
    activo          BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_tasa_impuesto_pais ON tasa_impuesto(pais_id, vigente_desde);
```

### 2.8 `configuracion_fiscal_pais` — Reglas fiscales por país

```sql
CREATE TABLE configuracion_fiscal_pais (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais_id         UUID NOT NULL REFERENCES core.pais(id),
    reglas          JSONB NOT NULL,  -- {"umbral_bancarizacion": 2000, "requiere_detraccion": true, ...}
    activo          BOOLEAN DEFAULT TRUE
);
```

---

## 3. DDL Conceptual — Tablas Adaptadas (ALTER in-place)

Estrategia: Las tablas existentes se modifican mediante ALTER TABLE (ADD COLUMN). No se crean tablas nuevas ni se renombran. Las columnas legacy se conservan para no romper consultas existentes.

### 3.1 `plan_contable_det` — ALTER in-place

```sql
-- Agregar columnas para compatibilidad con nuevo motor
ALTER TABLE contabilidad.plan_contable_det 
  ADD COLUMN IF NOT EXISTS cuenta_padre_id BIGINT REFERENCES contabilidad.plan_contable_det(id),
  ADD COLUMN IF NOT EXISTS naturaleza VARCHAR(10),  -- DEUDORA/ACREEDORA
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20),         -- activo/pasivo/patrimonio/ingreso/gasto
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Renombrar columna existente (no rompe FKs)
ALTER TABLE contabilidad.plan_contable_det 
  RENAME COLUMN cnta_cntbl_sunat TO codigo_autoridad;
```

### 3.2 `cntbl_asiento` — ALTER in-place

```sql
ALTER TABLE contabilidad.cntbl_asiento
  ADD COLUMN IF NOT EXISTS numero_asiento INTEGER,
  ADD COLUMN IF NOT EXISTS periodo_contable_id BIGINT,
  ADD COLUMN IF NOT EXISTS origen_id BIGINT,
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'contabilizado',
  ADD COLUMN IF NOT EXISTS asiento_original_id BIGINT REFERENCES contabilidad.cntbl_asiento(id),
  ADD COLUMN IF NOT EXISTS tipo_reversion VARCHAR(20),
  ADD COLUMN IF NOT EXISTS total_debe NUMERIC(18,4),
  ADD COLUMN IF NOT EXISTS total_haber NUMERIC(18,4);
```

### 3.3 `cntbl_asiento_det` — ALTER in-place

```sql
ALTER TABLE contabilidad.cntbl_asiento_det
  ADD COLUMN IF NOT EXISTS linea INTEGER,
  ADD COLUMN IF NOT EXISTS debe NUMERIC(18,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS haber NUMERIC(18,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moneda_id BIGINT REFERENCES core.moneda(id),
  ADD COLUMN IF NOT EXISTS monto_original NUMERIC(18,4),
  ADD COLUMN IF NOT EXISTS sucursal_id BIGINT,
  ADD COLUMN IF NOT EXISTS partner_id BIGINT;
-- Las columnas legacy (importe_sol, importe_dol, flag_debe_haber) se dejan como están
-- No se eliminan para no romper queries existentes
```

### 3.4 `cntbl_libro` — ALTER in-place

```sql
ALTER TABLE contabilidad.cntbl_libro
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(30);  -- compras, ventas, caja, banco, diario
```

### 3.5 `cntbl_cierre` — ALTER in-place

```sql
ALTER TABLE contabilidad.cntbl_cierre
  ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
  ADD COLUMN IF NOT EXISTS fecha_fin DATE,
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'abierto';
```

### 3.6 `numerador_asiento` — ALTER in-place

```sql
ALTER TABLE contabilidad.numerador_asiento
  ADD COLUMN IF NOT EXISTS formato VARCHAR(50) DEFAULT '{sucursal}{anio}{mes}{diario}{secuencial:6d}';
```

### 3.7 `concepto_financiero` — ALTER FK

```sql
-- Agregar nueva FK a componente_contable; matriz_contable_id queda como legacy
ALTER TABLE contabilidad.concepto_financiero 
  ADD COLUMN IF NOT EXISTS componente_id BIGINT REFERENCES componente_contable(id);
```

### 3.8 `cntbl_preasiento` — ALTER in-place

```sql
ALTER TABLE contabilidad.cntbl_preasiento
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente',  -- pendiente, importado, anulado
  ADD COLUMN IF NOT EXISTS asiento_id BIGINT REFERENCES contabilidad.cntbl_asiento(id);
```

### 3.9 `cntbl_preasiento_det` — ALTER in-place

```sql
ALTER TABLE contabilidad.cntbl_preasiento_det
  ADD COLUMN IF NOT EXISTS debe NUMERIC(18,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS haber NUMERIC(18,4) DEFAULT 0;
```

---

## 4. Tablas del Core (Referenciadas, No Cambian)

Estas tablas existen en `core` y son referenciadas por el nuevo motor. Se asume que ya existen o se crean si es necesario:

```sql
-- core.pais: Perú, Colombia, Ecuador
-- core.empresa: cada RUC/NIT
-- core.sucursal: locales por empresa
-- core.moneda: PEN, USD, COP
-- core.entidad_contribuyente: entidad unificada (cliente + proveedor + empleado)
-- core.tipo_comprobante: Factura, Boleta, NC, ND...
```

---

## 5. Diagrama de Relaciones

```
Tablas del esquema tenant (cada DB aísla por empresa):

plan_contable_det (plan de cuentas — ALTER in-place)
cntbl_libro (libros — ALTER in-place)
cntbl_cierre (periodos — ALTER in-place)
numerador_asiento (correlativo + formato — ALTER in-place)

regla_cuenta_componente (resolución de cuentas)
  └── componente_contable (catálogo de roles)

regla_activacion (qué componentes activa cada evento)
  └── componente_contable

cntbl_asiento → cntbl_asiento_det (asientos contables — ALTER in-place)
  └── plan_contable_det

cntbl_preasiento → cntbl_preasiento_det (batch — ALTER in-place)

auditoria_asiento (log)
```

---

## 6. Resumen: Tablas Legacy vs Adaptadas vs Nuevas

| Grupo | Tablas Legacy (_legacy) | Tablas Adaptadas (ALTER) | Tablas Nuevas (CREATE) |
|---|---|---|---|
| **Roles** | `matriz_contable`, `matriz_contable_det`, `grupo_matriz_cntbl`, `grupo_contable`, `tipo_mov_matriz_subcat` | — | `componente_contable`, `regla_activacion`, `regla_cuenta_componente` |
| **Plan cuentas** | `plan_contable` | `plan_contable_det` | — |
| **Asientos** | — | `cntbl_asiento`, `cntbl_asiento_det` | — |
| **Libros** | — | `cntbl_libro` | — |
| **Periodos** | — | `cntbl_cierre` | — |
| **Numeración** | — | `numerador_asiento` | — |
| **Puente** | — | `concepto_financiero` (FK → componente_id) | — |
| **Pre-asientos** | — | `cntbl_preasiento`, `cntbl_preasiento_det` | — |
| **Centros costo** | — | `centros_costo` (sin cambios) | — |
| **Fiscal** | — | — | `tasa_impuesto`, `configuracion_fiscal_pais` |
| **Auditoría** | — | — | `auditoria_asiento` |
| **Posición Fiscal** | — | — | `posicion_fiscal`, `posicion_fiscal_regla` |
