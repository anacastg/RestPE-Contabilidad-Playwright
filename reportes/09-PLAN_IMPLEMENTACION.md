# Plan de Implementación — Motor de Asientos v2

**Versión:** 3.0  
**Estimación:** 10-14 semanas · **Equipo:** variable (1-3 personas)  
**Proyecto:** restpe-contabilidad-back-end (sin clientes en producción)

---

## 1. Estrategia

**Big Bang.** Al no tener clientes en producción, construimos el nuevo motor completo, migramos datos existentes, y cortamos. Sin convivencia de motores.

### Principios

1. **Primero el pipeline, después la configuración** — el motor debe funcionar antes de cargar reglas de país
2. **Un flujo de negocio por vez** — compras primero (es el más complejo y documentado), luego tesorería, ventas, activos, planillas
3. **Validación contra el gap analysis** — cada fase debe demostrar que los escenarios documentados en `GAP_MOTOR_ASIENTOS_VS_MANUAL.md` funcionan
4. **Tests primero** — cada paso del pipeline debe tener test de unidad + integración

---

## 2. Fases

### Fase 0 — Preparación y Análisis (1-2 semanas)

**Objetivo:** Tener todo listo para empezar a codificar sin dudas.

**Narrativa:** Esta fase no produce código. Produce los insumos que las fases siguientes necesitan: el mapeo de reglas contables actuales a componentes, los contratos de eventos, y los datos base (países, monedas, corrección de tipos de impuesto). La tarea crítica es **0.1-0.3**: entender qué hace cada una de las 770 matrices actuales para traducirlo a componentes y reglas de activación. Sin eso, las fases 2 y 3 no tienen base.

| # | Tarea | Depende de | Paralela con |
|---|---|---|---|
| 0.1 | Revisar matrices actuales (770) y extraer reglas contables implícitas | — | 0.4, 0.5, 0.6, 0.7 |
| 0.2 | Mapear matrices CP-xxx a componentes equivalentes | 0.1 | — |
| 0.3 | Validar matrices FI-xxx (pagos directos) | 0.1 | 0.2 |
| 0.4 | Definir payload de cada evento (contrato API v1) | — | 0.1, 0.5, 0.6, 0.7 |
| 0.5 | Cargar `core.pais` con PE, CO, EC + datos básicos | — | 0.1, 0.4, 0.6, 0.7 |
| 0.6 | Cargar `core.moneda` con PEN, USD, COP | — | 0.1, 0.4, 0.5, 0.7 |
| 0.7 | Configurar `core.tipos_impuesto` (plan_contable_det_id) | — | 0.1, 0.4, 0.5, 0.6 |

**Flujo:** 0.1 → 0.2 + 0.3 (cadena porque 0.2 y 0.3 necesitan el análisis de 0.1). 0.4, 0.5, 0.6, 0.7 son independientes de 0.1 y entre sí.

---

#### 0.1 — Revisar matrices actuales y extraer reglas contables implícitas

**⏱ Estimación:** 3-5 días  
**👤 Perfil:** Arquitecto contable + Backend senior

**Input:**
- BD `restaurant_pe_emp_cantabria` — tablas `matriz_contable`, `matriz_contable_det`, `plan_contable_det`
- Documento: `GAP_MOTOR_ASIENTOS_VS_MANUAL.md` (sección 4.2 — ejemplos de matrices CP-xxx)
- Catálogo de componentes: `06-CATALOGO_COMPONENTES.md` (79 componentes)

**Proceso:**
```
1. Conectar a BD real y ejecutar:
   SELECT mc.codigo, mc.descripcion, mcd.secuencia, mcd.flag_deb_hab,
          pcd.cnta_ctbl, pcd.desc_cnta, mcd.formula
   FROM matriz_contable mc
   JOIN matriz_contable_det mcd ON mcd.matriz_contable_id = mc.id
   LEFT JOIN plan_contable_det pcd ON pcd.id = mcd.plan_contable_det_id
   WHERE mc.codigo LIKE 'CP-%'
   ORDER BY mc.codigo, mcd.secuencia;

2. Clasificar cada matriz por patrón de cuentas:
   ┌─ Patrón 1: 421(D) + 421(H)              → Provisión CxP (Cuenta por recibir vs pagar)
   ├─ Patrón 2: 94/92/91(D) + 421(H)         → Gasto + CxP (servicios)
   ├─ Patrón 3: 94/92/91(D) + 424/46(H)      → Gasto + proveedor especial
   └─ Otros: identificar manualmente

3. Por cada patrón, determinar qué componentes del catálogo 06 se activan:
   └── Ver tabla de correspondencia en 4.1

4. Generar un archivo CSV/spreadsheet con:
   ┌─ matriz_codigo, matriz_desc, cuenta_debe, cuenta_haber,
   │  patron_tipo, componentes_activados[], condiciones_jsonb
   └─ ej: CP-001, Provision compras MN, 42102104, 42102101, CXP,
            [COMPRA, PROVEEDOR], {"tipo_pago": "credito"}
```

**Output:**
- Archivo `mapeo-matrices-a-componentes.csv` (o spreadsheet) con el cruce matriz → componente
- Lista de excepciones (matrices que no encajan en ningún patrón conocido)

**Validación:**
- Cada matriz CP-xxx debe mapear a 1+ componentes del catálogo
- No debe quedar ninguna matriz sin clasificar
- El total de componentes mapeados debe estar entre 2 y 5 por matriz (nunca 0)

**Ejemplo concreto:**
```
Matriz CP-011 "ENERGIA ELECTRICA - OFICINAS MN"
  Sec 1: D 94103501 (Energía eléctrica) → componente COMPRA
  Sec 2: H 42102101 (CxP MN)           → componente PROVEEDOR
  Fórmula: TOTAL,[IVA18]               → componente IVA (se pierde hoy)
  → Reglas generadas:
    regla_activacion: COMPRA_REGISTRADA + tipo_transaccion=servicio → COMPRA + IVA + PROVEEDOR
    regla_cuenta_componente: COMPRA + tipo_transaccion=servicio + pais=PE → 94103501
```

---

#### 0.2 — Mapear matrices CP-xxx a componentes equivalentes

**⏱ Estimación:** 3-5 días  
**👤 Perfil:** Backend senior (mismo que 0.1)  
**⚠️ Depende de:** 0.1 terminado

**Input:**
- Output de 0.1: `mapeo-matrices-a-componentes.csv`
- Catálogo de componentes: `06-CATALOGO_COMPONENTES.md`
- Reglas de activación: `07-REGLA_ACTIVACION.md`

**Proceso:**
```
1. Por cada fila del mapeo, generar INSERT a regla_activacion:
   ┌─ evento: inferir del módulo (CP-xxx → COMPRA_REGISTRADA)
   ├─ componente_id: del mapeo
   ├─ condicion: según el patrón (tipo_pago, tipo_transaccion, etc.)
   ├─ accion: AGREGAR (default)
   └─ orden: secuencial por evento

2. Por cada cuenta contable identificada, generar INSERT a regla_cuenta_componente:
   ┌─ componente_id: del mapeo
   ├─ pais_id: PE (inicial)
   ├─ tipo_transaccion: del contexto de la matriz
   ├─ cuenta_id: el plan_contable_det_id original
   └─ prioridad: 100 (default para reglas específicas)

3. Para los conceptos_financieros existentes:
   UPDATE concepto_financiero SET componente_id = $id
   WHERE matriz_contable_id = $id;
   └── Esto migra la FK de matriz a componente
```

**Output:**
- Script SQL `seed-reglas-desde-matrices.sql` con ~300-500 INSERTs
- Script SQL `migrar-concepto-financiero.sql` con ~50-80 UPDATEs

**Validación:**
- Correr `SELECT * FROM regla_activacion WHERE evento = 'COMPRA_REGISTRADA'` — deben existir al menos COMPRA + IVA + PROVEEDOR
- Para cada `concepto_financiero` verificar que `componente_id` no sea NULL
- Simular el pipeline con un payload de prueba → debe activar los mismos componentes que la matriz original

**Ejemplo:**
```sql
-- CP-011 → COMPRA_REGISTRADA + servicio
INSERT INTO regla_activacion (evento, componente_id, condicion, accion, orden)
SELECT 'COMPRA_REGISTRADA', id, '{"tipo_transaccion": "servicio"}', 'AGREGAR', 10
FROM componente_contable WHERE codigo = 'COMPRA';

INSERT INTO regla_cuenta_componente (componente_id, pais_id, tipo_transaccion, cuenta_id, prioridad)
SELECT c.id, p.id, 'servicio', 94103501, 100
FROM componente_contable c, core.pais p
WHERE c.codigo = 'COMPRA' AND p.codigo = 'PE';
```

---

#### 0.3 — Validar matrices FI-xxx (pagos directos)

**⏱ Estimación:** 1-2 días  
**👤 Perfil:** Backend senior  
**⚠️ Depende de:** 0.1 terminado

**Input:**
- Output de 0.1 filtrado por matrices FI-xxx
- Eventos de tesorería: `05-CATALOGO_EVENTOS.md` (PAGO_PROVEEDOR, COBRO_REGISTRADO, etc.)

**Proceso:**
```
1. Listar matrices FI-xxx:
   SELECT * FROM matriz_contable WHERE codigo LIKE 'FI-%';

2. Clasificar por uso:
   ┌─ FI-124 → PAGO_PROVEEDOR (dif_cambio)
   ├─ FI-002 → APERTURA_CAJA_CHICA / REPOSICION_CAJA_CHICA
   └─ Otras  → mapear a eventos de tesorería

3. Verificar que las reglas en 07-REGLA_ACTIVACION.md cubren estos casos.
   Si falta algún componente, agregarlo.
```

**Output:**
- Lista de verificación: cada matriz FI-xxx → evento de tesorería
- Reglas faltantes identificadas (si alguna no está cubierta en 07)

**Validación:**
- Toda matriz FI debe corresponder a un evento de tesorería existente
- Ningún evento de tesorería debe quedar sin payload definido

---

#### 0.4 — Definir payload de cada evento (contrato API)

**⏱ Estimación:** 2-3 días  
**👤 Perfil:** Backend senior + Tech Lead  
**📄 Input:** `05-CATALOGO_EVENTOS.md`

**Proceso:**
```
1. Por cada evento en 05-CATALOGO_EVENTOS.md:
   ┌─ Tomar la tabla "Payload específico"
   ├─ Traducir a JSON Schema (o clases Java DTO)
   ├─ Validar que cada campo obligatorio tenga tipo definido
   └─ Validar que las condiciones en 07-REGLA_ACTIVACION.md tengan su campo correspondiente

2. Crear archivos de contrato:
   ┌─ Para backend Java: crear EventoRequest.java con herencia por tipo de evento
   │   class EventoRequest {
   │     String evento;          // COMPRA_REGISTRADA, VENTA_EMITIDA...
   │     Payload payload;        // genérico, cada evento usa sus campos
   │   }
   └─ Para documentación: generar tabla de campos por evento

3. Congelar contratos: una vez aprobados, no se modifican sin aprobación del equipo
```

**Output:**
- Clase(s) Java `EventoRequest.java`, `LineaEvento.java` en `dto/`
- Tabla resumen: qué campos tiene cada evento
- Contrato API: `POST /procesar-evento`

**Validación:**
- Cada campo en `regla_activacion.condicion` debe existir en el payload del evento
- No debe haber campos en el payload que no se usen en ninguna regla
- Validar contra los 16 escenarios de compra (GAP) que los campos necesarios existan

---

#### 0.5 — Cargar `core.pais` con PE, CO, EC + datos básicos

**⏱ Estimación:** 0.5 días  
**👤 Perfil:** Cualquier desarrollador con acceso a BD  
**📄 Input:** `04-ESQUEMA_DATOS.md`

**Proceso:**
```sql
-- Verificar si ya existen
SELECT id, codigo, nombre FROM core.pais;

-- Si faltan, insertar:
INSERT INTO core.pais (codigo, nombre, codigo_moneda)
VALUES 
  ('PE', 'Perú', 'PEN'),
  ('CO', 'Colombia', 'COP'),
  ('EC', 'Ecuador', 'USD');
  
-- Verificar monedas
INSERT INTO core.moneda (codigo, nombre, simbolo, activo)
VALUES 
  ('PEN', 'Sol peruano', 'S/', true),
  ('USD', 'US Dollar', '$', true),
  ('COP', 'Peso colombiano', '$', true);
```

**Output:** 3 registros en `core.pais`, 3 en `core.moneda`

**Validación:** `SELECT * FROM core.pais` debe devolver 3 filas.

---

#### 0.6 — Cargar `core.moneda` con PEN, USD, COP

Mismo alcance que 0.5 ya que se hace junto. Ver proceso arriba.

---

#### 0.7 — Configurar `core.tipos_impuesto` (plan_contable_det_id)

**⏱ Estimación:** 1-2 días  
**👤 Perfil:** Contador + Backend  
**⚠️ Criticidad:** ALTA — los 42 registros tienen `plan_contable_det_id = NULL`

**Input:**
- BD actual: `SELECT * FROM core.tipos_impuesto WHERE plan_contable_det_id IS NULL;`
- Plan de cuentas: `plan_contable_det`

**Proceso:**
```
1. Obtener lista de impuestos sin cuenta:
   SELECT id, tipo_impuesto, desc_impuesto, tasa_impuesto, flag_dh_cxp
   FROM core.tipos_impuesto
   WHERE plan_contable_det_id IS NULL AND flag_estado = '1';

2. Para cada impuesto, determinar la cuenta contable correcta:
   ┌─ IGV18 (tasa 18%, D) → 40101101 IGV crédito fiscal
   ├─ IGV10 (tasa 10%, D) → 40101101 IGV crédito fiscal
   ├─ ISC   (tasa 13%, D) → 40102101 ISC por pagar
   ├─ IRLC  (tasa 3%,  H) → 40103101 Retención IGV por pagar
   ├─ IR4T8 (tasa 8%,  H) → 40104101 Retención renta 4ta
   ├─ FISE  (tasa 1%,  D) → 40105101 FISE por pagar
   └─ ... por cada uno de los 42

3. Ejecutar UPDATEs:
   UPDATE core.tipos_impuesto SET plan_contable_det_id = $cuenta_id
   WHERE id = $id;
```

**Output:** 42 UPDATEs ejecutados en BD

**Validación:**
```sql
-- Verificar que ya no hay NULLs
SELECT COUNT(*) FROM core.tipos_impuesto 
WHERE plan_contable_det_id IS NULL AND flag_estado = '1';
-- → 0
```

**Ejemplo concreto:**
```sql
-- Antes:
SELECT id, tipo_impuesto, plan_contable_det_id FROM core.tipos_impuesto WHERE id = 21;
-- 21 | IGV18 | NULL

-- Después:
UPDATE core.tipos_impuesto SET plan_contable_det_id = 40101101 WHERE id = 21;
-- 21 | IGV18 | 40101101
```

---

**Flujo:** 0.1 → 0.2 + 0.3 (cadena porque 0.2 y 0.3 necesitan el análisis de 0.1). 0.4, 0.5, 0.6, 0.7 son independientes de 0.1 y entre sí. Si hay 1 persona: 0.1 → 0.2/0.3 → 0.4 → 0.5-0.7. Si hay 2: uno hace 0.1-0.3, otro hace 0.4-0.7.

---

### Fase 1 — Core del Motor (3-4 semanas)

**Objetivo:** Pipeline funcionando de principio a fin con datos de prueba.

**Narrativa:** Esta fase construye el esqueleto del nuevo motor. Se divide en 5 sub-fases que tienen una secuencia obligatoria (DDL → Interfaces → Pipeline + Entidades en paralelo → Integración). El DDL (1.1-1.3) debe terminar primero porque tanto el pipeline como las entidades JPA lo necesitan. Una vez que el DDL está listo, el pipeline (1.4) y las entidades (1.5) pueden construirse en paralelo porque los steps del pipeline trabajan contra interfaces, no contra las entidades concretas.

> **secuencia obligatoria:** 1.1 + 1.2 + 1.3 (DDL) antes de 1.4 (pipeline) y 1.5 (entidades). Después 1.4 y 1.5 en paralelo.

| # | Tarea | Depende de | Paralela con |
|---|---|---|---|
| 1.1 | CREATE tablas nuevas (componente_contable, regla_activacion, etc.) | — | 1.2, 1.3 |
| 1.2 | ALTER tablas existentes (plan_contable_det, cntbl_asiento, etc.) | — | 1.1, 1.3 |
| 1.3 | RENAME TO _legacy tablas matriz_contable y relacionadas | 1.1 + 1.2 | — |
| 1.4 | Pipeline (steps 1-10) | DDL listo | 1.5 |
| 1.5 | Entidades JPA + repositorios | DDL listo | 1.4 |

---
#### 1.1 — Base de datos: Tablas NUEVAS (CREATE TABLE)

**⏱ Estimación:** 1-2 días  
**👤 Perfil:** Backend (DDL SQL)  
**📄 Input:** `04-ESQUEMA_DATOS.md` secciones 2.1 a 2.8

**Proceso:**
```
1. Tomar los DDL conceptuales de 04-ESQUEMA_DATOS.md y convertirlos en SQL migratorio (Flyway o similar).

2. Crear las 7 tablas en orden (aunque no tienen dependencias, es más limpio):
   ┌─ 1.1.1 componente_contable
   ├─ 1.1.2 regla_activacion
   ├─ 1.1.3 regla_cuenta_componente
   ├─ 1.1.4 tasa_impuesto + configuracion_fiscal_pais
   ├─ 1.1.5 auditoria_asiento
   └─ 1.1.6 posicion_fiscal + posicion_fiscal_regla

3. Seed de componente_contable:
   INSERT INTO componente_contable (codigo, nombre, tipo, posicion, direccion, es_batch)
   VALUES
     ('VENTA', 'Ingreso por Venta', 'ingreso', 2, 'haber', false),
     ('COMPRA', 'Gasto / Costo de Compra', 'gasto', 2, 'debe', false),
     ('IVA', 'IVA Débito/Crédito', 'impuesto', 3, 'ambos', false),
     ('CLIENTE', 'Cuenta por Cobrar', 'contrapartida', 1, 'debe', false),
     ...
   └── La lista completa está en 06-CATALOGO_COMPONENTES.md Apéndice C (~79 registros)
```

**Output:** 
- Archivo SQL migratorio: `V1__motor-asientos-v2-nuevas-tablas.sql`
- Seed de componentes: ~79 INSERTs

**Validación:**
```sql
SELECT COUNT(*) FROM componente_contable; -- 79
SELECT COUNT(*) FROM regla_activacion;    -- depende de Fase 2, inicialmente vacía
SELECT COUNT(*) FROM regla_cuenta_componente; -- inicialmente vacía
```

---

#### 1.2 — Base de datos: Tablas EXISTENTES (ALTER in-place)

**⏱ Estimación:** 2-3 días  
**👤 Perfil:** Backend senior (conocimiento del esquema legacy)  
**⚠️ Riesgo:** ALTER en tablas con datos existentes  
**📄 Input:** `04-ESQUEMA_DATOS.md` sección 3

**Proceso:**
```
1. Para cada tabla legacy, ejecutar ALTER TABLE ADD COLUMN:

   1.2.1 plan_contable_det:
     ALTER TABLE plan_contable_det 
       ADD COLUMN IF NOT EXISTS cuenta_padre_id BIGINT,
       ADD COLUMN IF NOT EXISTS naturaleza VARCHAR(10),
       ADD COLUMN IF NOT EXISTS tipo VARCHAR(20),
       ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
     -- RENAME columna legacy
     ALTER TABLE plan_contable_det 
       RENAME COLUMN cnta_cntbl_sunat TO codigo_autoridad;

   1.2.2 cntbl_asiento:
     ALTER TABLE cntbl_asiento
       ADD COLUMN IF NOT EXISTS numero_asiento INTEGER,
       ADD COLUMN IF NOT EXISTS periodo_contable_id BIGINT,
       ADD COLUMN IF NOT EXISTS origen_id BIGINT,
       ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'contabilizado',
       ADD COLUMN IF NOT EXISTS asiento_original_id BIGINT,
       ADD COLUMN IF NOT EXISTS total_debe NUMERIC(18,4),
       ADD COLUMN IF NOT EXISTS total_haber NUMERIC(18,4);

   1.2.3 cntbl_asiento_det:
     ALTER TABLE cntbl_asiento_det
       ADD COLUMN IF NOT EXISTS linea INTEGER,
       ADD COLUMN IF NOT EXISTS debe NUMERIC(18,4) DEFAULT 0,
       ADD COLUMN IF NOT EXISTS haber NUMERIC(18,4) DEFAULT 0,
       ADD COLUMN IF NOT EXISTS moneda_id BIGINT,
       ADD COLUMN IF NOT EXISTS monto_original NUMERIC(18,4),
       ADD COLUMN IF NOT EXISTS sucursal_id BIGINT,
       ADD COLUMN IF NOT EXISTS partner_id BIGINT;

   1.2.4 cntbl_libro → ADD tipo VARCHAR(30)
   1.2.5 cntbl_cierre → ADD id UUID, fecha_inicio, fecha_fin, estado
   1.2.6 numerador_asiento → ADD formato VARCHAR(50)
   1.2.7 cntbl_preasiento → ADD estado, asiento_id
   1.2.8 cntbl_preasiento_det → ADD debe, haber

   1.2.9 UPDATE concepto_financiero:
     -- Cambiar FK de matriz_contable_id a componente_id
     ALTER TABLE concepto_financiero
       ADD COLUMN IF NOT EXISTS componente_id BIGINT REFERENCES componente_contable(id);
     -- Poblar componente_id basado en el mapeo de 0.2
     UPDATE concepto_financiero SET componente_id = $id WHERE matriz_contable_id = $old_id;
```

**Output:** Archivo SQL migratorio: `V2__motor-asientos-v2-alter-tablas.sql`

**Validación:**
```sql
-- Verificar que las nuevas columnas existen
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cntbl_asiento' AND column_name = 'numero_asiento';
-- → 1 fila
```

---

#### 1.3 — Deprecar tablas legacy (RENAME TO _legacy)

**⏱ Estimación:** 0.5 días  
**👤 Perfil:** Backend  
**⚠️ Depende de:** 1.1 + 1.2 completos

**Proceso:**
```sql
ALTER TABLE matriz_contable RENAME TO matriz_contable_legacy;
ALTER TABLE matriz_contable_det RENAME TO matriz_contable_det_legacy;
ALTER TABLE grupo_matriz_cntbl RENAME TO grupo_matriz_cntbl_legacy;
ALTER TABLE grupo_contable RENAME TO grupo_contable_legacy;
ALTER TABLE tipo_mov_matriz_subcat RENAME TO tipo_mov_matriz_subcat_legacy;
-- Evaluar distribucion_contable: si ningún flujo la usa, deprecar
```

**Output:** Archivo SQL migratorio: `V3__motor-asientos-v2-legacy-rename.sql`
**Validación:** `SELECT * FROM matriz_contable` → ERROR (tabla no existe). `SELECT * FROM matriz_contable_legacy` → OK.

---

#### 1.4 — Backend: Pipeline (steps 1-10)

**⏱ Estimación:** 2-3 semanas  
**👤 Perfil:** Backend senior (2 personas)  
**📦 Paquete:** `ms-contabilidad/src/main/java/pe/restaurant/contabilidad/engine/`

**Arquitectura:**
```
Cada step implementa una interfaz específica. El PipelineOrchestrator los coordina.
Las interfaces permiten que los steps se escriban en paralelo.

engine/
├── PipelineOrchestrator.java       ← coordina los 10 steps
├── steps/
│   ├── ReceiverStep.java           ← Paso 1: validar payload
│   ├── ActivationEvaluatorStep.java ← Paso 2: evaluar reglas_activacion
│   ├── AccountResolverStep.java    ← Paso 3: resolver cuentas (fallback)
│   ├── AmountCalculatorStep.java   ← Paso 4: calcular montos por tipo
│   ├── LineSorterStep.java         ← Paso 5: ordenar y consolidar
│   ├── ValidatorStep.java          ← Paso 6: validar balanceo
│   ├── PersistenceStep.java        ← Paso 7: INSERT asiento
│   ├── SideEffectStep.java         ← Paso 8: dispatcher de handlers
│   ├── EventEmitterStep.java       ← Paso 9: publicar evento salida
│   └── ReportExporterStep.java     ← Paso 10: exportar a SUNAT/DIAN
├── handlers/
│   └── SideEffectHandler.java      ← interfaz para Paso 8
└── dto/
    ├── EventoRequest.java
    ├── LineaEvento.java
    └── AsientoResponse.java
```

**Proceso detallado por step:**

##### Paso 1 — RECIBIR (ReceiverStep.java)
**Input:** JSON del endpoint → `EventoRequest`  
**Proceso:**
```
1. Validar que el payload tenga estructura mínima:
   ┌─ evento: not null, existe en la tabla de eventos
   ├─ payload.pais_id: not null, existe en core.pais
   ├─ payload.fecha_contable: not null, dentro del periodo abierto
   ├─ payload.lineas[]: not empty
   └─ payload.origen + origen_id: not null (para idempotencia)

2. Validar por tipo de evento (ver 05-CATALOGO_EVENTOS.md sección 13):
   ┌─ COMPRA_REGISTRADA: proveedor_id not null, serie+numero únicos
   ├─ VENTA_EMITIDA: cliente_id not null, serie+numero únicos
   └─ ... cada evento con sus reglas específicas

3. Si moneda ≠ moneda_funcional: validar tipo_cambio not null
```
**Output:** Payload validado o error `PAYLOAD_INVALIDO`

##### Paso 2 — EVALUAR REGLAS DE ACTIVACIÓN (ActivationEvaluatorStep.java)
**Input:** Payload validado  
**📄 Input:** `07-REGLA_ACTIVACION.md`  
**Proceso:**
```
1. Consultar regla_activacion:
   SELECT ra.*, cc.codigo, cc.tipo, cc.posicion, cc.direccion
   FROM regla_activacion ra
   JOIN componente_contable cc ON cc.id = ra.componente_id
   WHERE ra.evento = $evento
     AND (ra.pais_id = $pais_id OR ra.pais_id IS NULL)
     AND ra.activo = true
   ORDER BY ra.orden ASC;

2. Por cada regla, evaluar la condición JSONB contra el payload:
   ┌─ {"tipo_pago": "credito"}     → payload.tipo_pago == "credito"
   ├─ {"afecta_iva": true}          → payload.lineas[0].afecta_iva == true
   ├─ {"tipo_pago": "contado", "medio_pago": "efectivo"} → AND
   └─ {"es_exportacion": false}     → payload.es_exportacion != true

3. Si la condición se cumple:
   ┌─ accion=AGREGAR    → agregar componente a lista activa
   ├─ accion=REEMPLAZAR → reemplazar componente existente
   └─ accion=OMITIR     → quitar componente de lista activa

4. Si ninguna regla se activa → error SIN_COMPONENTES
```
**Output:** Lista de `{componente, tipo, posicion, direccion}` activos por línea del payload

##### Paso 3 — RESOLVER CUENTAS (AccountResolverStep.java)
**Input:** Componentes activos por línea  
**📄 Input:** `08-REGLA_CUENTA.md`  
**Proceso:**
```
1. Para cada componente activo, ejecutar fallback progresivo (desde Java, no SQL):
   ┌─ Paso A: buscar partner.cuenta_contable_id (si el componente tiene partner)
   ├─ Paso B: buscar producto_categoria.cuenta_default_id (si aplica)
   ├─ Paso C: ejecutar query con TODOS los filtros del contexto
   ├─ Paso D: sacar filtros uno por uno (moneda → clasif → partner_tipo → categoria → tipo_transaccion)
   └─ Paso E: solo pais_id + componente_id → si no hay → CUENTA_NO_CONFIGURADA

2. El SQL para cada intento de resolución:
   SELECT rcc.cuenta_id
   FROM regla_cuenta_componente rcc
   WHERE rcc.componente_id = $componente_id
     AND (rcc.pais_id = $pais_id OR rcc.pais_id IS NULL)
     AND (rcc.tipo_transaccion = $tipo_transaccion OR rcc.tipo_transaccion IS NULL)
     AND (rcc.producto_categoria_id = $categoria_id OR rcc.producto_categoria_id IS NULL)
     AND (rcc.partner_tipo = $partner_tipo OR rcc.partner_tipo IS NULL)
     AND (rcc.concepto_financiero_id = $concepto_id OR rcc.concepto_financiero_id IS NULL)
     AND rcc.activo = true
   ORDER BY rcc.prioridad DESC
   LIMIT 1;
```
**Output:** Cada componente con su `cuenta_id` resuelta

##### Paso 4 — CALCULAR MONTOS (AmountCalculatorStep.java)
**Input:** Componentes con cuenta + payload  
**📄 Input:** `08-REGLA_CUENTA.md` sección 3.1  
**Proceso:**
```
Por cada componente, calcular monto según su tipo:
┌─ ingreso/gasto:     base = total / (1 + tasa_impuesto)
├─ impuesto:          monto = base × tasa_impuesto
├─ contrapartida:     monto = suma(montos del lado opuesto)
├─ puente:            monto = total × porcentaje_configurado
└─ ajuste:            monto = saldo_ME × (TC_nuevo - TC_original)

Redondeo: base = ROUND(total / (1 + tasa), 2)
          impuesto = total - base   ← así base + impuesto = total exacto
```
**Output:** Cada componente con su `monto_debe` y `monto_haber`

##### Paso 5 — ORDENAR Y POSICIONAR (LineSorterStep.java)
**Proceso:**
```
1. Ordenar líneas por posicion del componente:
   ┌─ 1 = TERCEROS    (CLIENTE, PROVEEDOR, BANCO)
   ├─ 2 = BASE        (VENTA, COMPRA)
   ├─ 3 = IMPUESTOS   (IVA)
   ├─ 4 = PUENTE      (DETRACCION, PERCEPCION, ANTICIPO)
   └─ 5 = AJUSTE      (DIF_CAMBIO, COMISION_BANCARIA)

2. Consolidar: mismo componente + misma cuenta = sumar montos
```
**Output:** Líneas ordenadas y consolidadas

##### Paso 6 — VALIDAR (ValidatorStep.java)
**Proceso:**
```
Validaciones OBLIGATORIAS (rechazan el asiento):
1. SUM(debe) - SUM(haber) <= 0.01 (tolerancia de redondeo)
2. Todas las cuentas existen y activas (plan_contable_det.activo = true)
3. Todas las cuentas son imputables (es_imputable = true)
4. Periodo contable abierto
5. Fecha dentro del periodo
6. Diario activo
7. Idempotencia: no existe otro asiento con mismo origen + origen_id

Validaciones de ADVERTENCIA (log, no bloquean):
1. Centro de costo no asignado
2. Monto cero en alguna línea
3. Partner sin datos de contacto
```
**Output:** Asiento validado o error `ASIENTO_INVALIDO`

##### Paso 7 — PERSISTIR (PersistenceStep.java)
**Proceso:**
```sql
BEGIN;
  INSERT INTO cntbl_asiento (numero_asiento, fecha_contable, periodo_contable_id,
    diario_id, glosa, origen, origen_id, moneda_id, tipo_cambio,
    total_debe, total_haber, estado)
  VALUES ($nro, $fecha, $periodo, $diario, $glosa, $origen, $origen_id,
    $moneda, $tc, $total_debe, $total_haber, 'contabilizado');
  
  FOR EACH linea:
    INSERT INTO cntbl_asiento_det (asiento_id, linea, plan_contable_det_id,
      debe, haber, moneda_id, monto_original, centro_costo_id, partner_id, glosa)
    VALUES ($asiento_id, $nro, $cuenta_id, $debe, $haber, $moneda, $monto_orig,
      $centro_costo, $partner_id, $glosa);
COMMIT;
```
**Output:** asiento_id generado

##### Paso 8 — EFECTOS SECUNDARIOS (SideEffectStep.java) — PREREQUISITO para Fase 3
**Proceso:**
```
1. No tiene lógica directa. Es un dispatcher.
2. Recibe el evento + asiento generado.
3. Busca el SideEffectHandler registrado para ese tipo de evento.
4. Delega la ejecución al handler correspondiente.
```
**Output:** Handler ejecutado (o log si no hay handler registrado)

##### Paso 9 — EMITIR EVENTO SALIDA (EventEmitterStep.java)
**Proceso:** Publicar evento post-contabilización (para que otros módulos reaccionen):
```
┌─ AsientoContabilizado{asiento_id, evento_original, total_debe, total_haber}
├─ CompraContabilizada{compra_id, asiento_id}
├─ VentaContabilizada{venta_id, asiento_id}
└─ (según el tipo de evento original)
```

##### Paso 10 — EXPORTAR REPORTES (ReportExporterStep.java)
**Proceso:** Generar estructura de exportación según país:
```
┌─ PE: estructura PLE (Libro Diario, Registro Ventas/Compras)
├─ CO: formato DIAN (información exógena)
└─ EC: formato SRI (anexos ATS)
```
**Output:** Reporte generado (o marcado como pendiente para exportación async)

---

#### 1.5 — Entidades y Repositorios JPA

**⏱ Estimación:** 2 semanas  
**👤 Perfil:** Backend (1 persona)  
**📄 Input:** `04-ESQUEMA_DATOS.md`

**Proceso:**
```
1. Crear entidades nuevas (1.5.1):
   ┌─ ComponenteContable.java  → tabla componente_contable
   ├─ ReglaActivacion.java     → tabla regla_activacion
   ├─ ReglaCuentaComponente.java → tabla regla_cuenta_componente
   ├─ TasaImpuesto.java        → tabla tasa_impuesto
   ├─ AuditoriaAsiento.java    → tabla auditoria_asiento
   └─ PosicionFiscal.java      → tabla posicion_fiscal

2. Modificar entidades existentes (1.5.2):
   ┌─ PlanContableDet.java     → ADD cuentaPadreId, naturaleza, tipo, activo
   ├─ CntblAsiento.java        → ADD numeroAsiento, periodoContableId, origenId, estado...
   ├─ CntblAsientoDet.java     → ADD linea, debe, haber, monedaId, montoOriginal...
   └─ CntblLibro.java, CntblCierre.java, NumeradorAsiento.java...

3. Crear repositorios con queries de resolución (1.5.3):
   ── ReglaCuentaComponenteRepository.java:
       @Query("SELECT r FROM ReglaCuentaComponente r WHERE r.componenteId = :compId ...")
       List<ReglaCuentaComponente> buscarPorFiltros(...)

4. Crear DTOs (1.5.4):
   ── EventoRequest.java, LineaEvento.java, AsientoResponse.java

5. Eliminar entidades deprecadas (1.5.5):
   ── MatrizContable.java, MatrizContableDet.java, GrupoMatrizCntbl.java
```

**Output:** Clases Java en `entity/`, `repository/`, `dto/`

---

---

### Fase 2 — Configuración Multi-País (2-3 semanas)

**Objetivo:** Reglas de activación y cuentas cargadas para PE, CO, EC.

**Narrativa:** Esta fase es puramente datos (INSERTs en tablas existentes). El pipeline ya funciona desde Fase 1; ahora hay que cargarle las reglas para que sepa cómo contabilizar en cada país. Primero se cargan los componentes (~80 roles) y las reglas de activación genéricas (aplican a todos los países). Después se carga la configuración específica de cada país: reglas de cuenta (qué cuenta usar para cada componente), tasas de impuesto, y configuración fiscal.

Los seeds de Perú, Colombia y Ecuador son **archivos SQL separados** que insertan en tablas compartidas pero con distinto `pais_id`. Pueden ejecutarse en paralelo sin riesgo de conflicto.

**Criterio de aceptación:** El mismo evento (ej: COMPRA_REGISTRADA con payload idéntico) produce asientos distintos según el pais_id (cuentas PCGE para PE, PUC para CO, SRI para EC).

| # | Tarea | Depende de | Paralela con |
|---|---|---|---|
| 2.1 | INSERT componente_contable (~80 roles) | 1.1.1 (tabla existe) | 2.2 |
| 2.2 | INSERT regla_activacion genérica | 1.1.2 (tabla existe) | 2.1 |
| 2.3 | INSERT regla_cuenta_componente Perú | 2.2 | 2.4, 2.5, 2.6, 2.7 |
| 2.4 | INSERT tasa_impuesto Perú | — | 2.3, 2.5, 2.6, 2.7 |
| 2.5 | INSERT configuracion_fiscal_pais Perú | — | 2.3, 2.4, 2.6, 2.7 |
| 2.6 | UPDATE plan_contable_det Perú (nuevas columnas) | 1.2.1 (ALTER aplicado) | 2.3, 2.4, 2.5, 2.7 |
| 2.7 | UPDATE cntbl_libro (asignar tipo) | 1.2.4 (ALTER aplicado) | 2.3, 2.4, 2.5, 2.6 |
| 2.8 | Repetir 2.3-2.7 para Colombia | 2.1 + 2.2 | 2.9 |
| 2.9 | Repetir 2.3-2.7 para Ecuador | 2.1 + 2.2 | 2.8 |
| 2.10 | INSERT posicion_fiscal cross-border | 1.1.7 (tabla existe) | 2.3-2.9 |
| 2.11 | Tests multi-país | 2.3-2.9 | — |

---
#### 2.1 — INSERT componente_contable (~80 roles)

**⏱ Estimación:** 1 día  
**👤 Perfil:** Backend  
**📄 Input:** `06-CATALOGO_COMPONENTES.md` Apéndice C

**Proceso:**
```sql
-- Tomar los 79 registros del Apéndice C y convertirlos a INSERTs
INSERT INTO componente_contable (codigo, nombre, tipo, posicion, direccion, es_batch) VALUES
  ('VENTA', 'Ingreso por Venta', 'ingreso', 2, 'haber', false),
  ('COMPRA', 'Gasto / Costo de Compra', 'gasto', 2, 'debe', false),
  ('IVA', 'IVA Débito/Crédito', 'impuesto', 3, 'ambos', false),
  ('CLIENTE', 'Cuenta por Cobrar', 'contrapartida', 1, 'debe', false),
  ('PROVEEDOR', 'Cuenta por Pagar', 'contrapartida', 1, 'haber', false),
  ... (completar con los 79)
```
**Output:** `seed-01-componentes.sql`

---

#### 2.2 — INSERT regla_activacion genérica

**⏱ Estimación:** 1-2 días  
**👤 Perfil:** Backend  
**📄 Input:** `07-REGLA_ACTIVACION.md`

**Proceso:**
```sql
-- Tomar la matriz de activación de 07-REGLA_ACTIVACION.md y generar INSERTs
-- Ejemplo para VENTA_EMITIDA:
INSERT INTO regla_activacion (evento, componente_id, condicion, accion, orden) 
SELECT 'VENTA_EMITIDA', id, '{"tipo_pago": "credito"}', 'AGREGAR', 10
FROM componente_contable WHERE codigo = 'CLIENTE';

INSERT INTO regla_activacion (evento, componente_id, condicion, accion, orden)
SELECT 'VENTA_EMITIDA', id, '{"tipo_pago": "contado", "medio_pago": "efectivo"}', 'AGREGAR', 20
FROM componente_contable WHERE codigo = 'CAJA_VENTA';
-- ... completar con todas las reglas de 07
```
**Output:** `seed-02-reglas-activacion.sql`

---

#### 2.3 — INSERT regla_cuenta_componente Perú

**⏱ Estimación:** 2-3 días  
**👤 Perfil:** Contador + Backend  
**📄 Input:** `08-REGLA_CUENTA.md` + plan de cuentas PCGE real de la BD

**Proceso:**
```
1. Por cada componente en 08-REGLA_CUENTA.md, crear INSERTs con las cuentas del PCGE peruano:

   ┌─ COMPRA + tipo_transaccion=servicio     → 63 (Servicios)
   ├─ COMPRA + tipo_transaccion=mercaderia   → 601 (Mercaderías)
   ├─ COMPRA + tipo_transaccion=activo_fijo  → 33 (Inmuebles)
   ├─ IVA + evento=COMPRA_REGISTRADA         → 40111 (IVA crédito fiscal)
   ├─ IVA + evento=VENTA_EMITIDA             → 40112 (IVA débito fiscal)
   ├─ PROVEEDOR                              → 421 (Proveedores)
   ├─ CLIENTE                                → 121 (Clientes)
   └─ ... (completar con todos los componentes)

2. Ejemplo SQL:
   INSERT INTO regla_cuenta_componente (componente_id, pais_id, tipo_transaccion, cuenta_id, prioridad)
   SELECT c.id, p.id, 'servicio', (SELECT id FROM plan_contable_det WHERE cnta_ctbl = '63'), 100
   FROM componente_contable c, core.pais p
   WHERE c.codigo = 'COMPRA' AND p.codigo = 'PE';
```
**Output:** `seed-03-pe-reglas-cuenta.sql`

**Validación:** Ejecutar simulación con evento COMPRA_REGISTRADA + pais_id=PE → debe resolver cuentas PCGE

---

#### 2.4 — INSERT tasa_impuesto Perú

**⏱ Estimación:** 0.5 días  
**📄 Input:** `04-ESQUEMA_DATOS.md` §2.7

```sql
INSERT INTO tasa_impuesto (pais_id, codigo, nombre, tasa, vigente_desde) 
SELECT id, 'IVA', 'IVA 18%', 18.00, '2026-01-01' FROM core.pais WHERE codigo = 'PE';
-- ISC, ICBPER...
```

---

#### 2.5 — INSERT configuracion_fiscal_pais Perú

```sql
INSERT INTO configuracion_fiscal_pais (pais_id, reglas)
SELECT id, '{"umbral_bancarizacion": 2000, "requiere_detraccion": true}'
FROM core.pais WHERE codigo = 'PE';
```

---

#### 2.6 — UPDATE plan_contable_det Perú (nuevas columnas)

**⏱ Estimación:** 1 día  
**👤 Perfil:** Contador  
**Proceso:** Actualizar las nuevas columnas del plan de cuentas peruano (naturaleza, tipo, codigo_autoridad)

---

#### 2.7 — UPDATE cntbl_libro (asignar tipo)

```sql
UPDATE cntbl_libro SET tipo = 'COMPRAS'  WHERE codigo = 'COMPRAS' ...;
```

---

#### 2.8 — Repetir 2.3-2.7 para Colombia

Igual que Perú pero con cuentas PUC colombianas, IVA 19%, ReteFuente, ReteICA, GMF.

---

#### 2.9 — Repetir 2.3-2.7 para Ecuador

Igual que Perú pero con plan SRI, IVA 15%, ISD.

---

#### 2.10 — INSERT posicion_fiscal (cross-border)

**Output:** `seed-10-posiciones-fiscales.sql`

---

#### 2.11 — Tests multi-país

**Proceso:**
```
1. Enviar mismo evento COMPRA_REGISTRADA con pais_id=PE, CO, EC
2. Verificar que los asientos generados usan cuentas distintas según el país
3. Verificar que las tasas de IVA son 18% (PE), 19% (CO), 15% (EC)
```

---

---

### Fase 3 — Migración de Flujos (3-4 semanas)

**Objetivo:** Cada flujo de negocio migrado del motor viejo al nuevo.

**Narrativa:** Acá el motor ya funciona (Fase 1) y tiene reglas cargadas (Fase 2). Ahora hay que conectar los módulos operativos (compras, tesorería, ventas, activos, planillas, producción) al nuevo motor. Cada flujo requiere dos cosas: (1) un **handler** que implemente los efectos secundarios específicos de ese flujo (crear CxP, actualizar banco, crear CxC...), y (2) adaptar el microservicio correspondiente para que emita eventos en vez de llamar a los 14 endpoints viejos.

> **⚠️ Prerequisito:** SideEffectStep como dispatcher (1.4.8) + interfaz SideEffectHandler existentes. Después los handlers son archivos independientes.

| # | Tarea | Depende de | Paralela con |
|---|---|---|---|
| 3.0 | SideEffect dispatcher | Pipeline funcionando (1.4) | — |
| 3.1 | Compras: handler + adaptar ms-finanzas | 3.0 | 3.2, 3.3, 3.4, 3.5, 3.6 |
| 3.2 | Tesorería: handler + adaptar ms-finanzas | 3.0 | 3.1, 3.3, 3.4, 3.5, 3.6 |
| 3.3 | Ventas: handler + adaptar ms-ventas | 3.0 | 3.1, 3.2, 3.4, 3.5, 3.6 |
| 3.4 | Activos fijos: handler + scheduler | 3.0 | 3.1, 3.2, 3.3, 3.5, 3.6 |
| 3.5 | Planillas: handler batch | 3.0 | 3.1, 3.2, 3.3, 3.4, 3.6 |
| 3.6 | Producción/almacén: handler | 3.0 | 3.1, 3.2, 3.3, 3.4, 3.5 |

---
#### 3.0 — Prerequisito: SideEffect dispatcher (2-3 días)

**Input:** Paso 8 del pipeline (SideEffectStep.java) ya creado como stub en Fase 1  
**Proceso:**
```java
// engine/handlers/SideEffectHandler.java
public interface SideEffectHandler {
    void handle(EventoRequest evento, AsientoResponse asiento);
}

// engine/SideEffectStep.java — actualizar el dispatcher
public class SideEffectStep {
    private Map<String, SideEffectHandler> handlers = new HashMap<>();
    
    public void registerHandler(String eventType, SideEffectHandler handler) {
        handlers.put(eventType, handler);
    }
    
    public void execute(EventoRequest evento, AsientoResponse asiento) {
        SideEffectHandler handler = handlers.get(evento.getEvento());
        if (handler != null) {
            handler.handle(evento, asiento);
        } else {
            log.warn("No handler for event: {}", evento.getEvento());
        }
    }
}
```
**Output:** `engine/handlers/SideEffectHandler.java` + `engine/SideEffectStep.java` actualizado

---
#### 3.1 — Compras (1-2 semanas)

**Input:** 
- Evento `COMPRA_REGISTRADA` definido en `05-CATALOGO_EVENTOS.md`
- Reglas cargadas para Perú (Fase 2)
- Módulo `ms-finanzas` con su `CntasPagarServiceImpl`

**Proceso:**
```
1. Crear handler:
   ── handler/ComprasSideEffectHandler.java
   └── Implementar:
       ┌─ Al recibir COMPRA_REGISTRADA:
       │   1. Crear registro en cntas_pagar (cuenta por pagar al proveedor)
       │   2. Si aplica: actualizar kárdex de inventario
       │   3. Si aplica: registrar detracción pendiente
       │   4. Registrar en libro de compras
       └─ Registrar handler en SideEffectStep

2. Adaptar ms-finanzas:
   ── Modificar CntasPagarServiceImpl.java
   └── En vez de llamar POST /api/contabilidad/asientos/generar/registro-cntas-pagar
       → emitir evento COMPRA_REGISTRADA al nuevo pipeline
       → Body: EventoRequest con payload completo

3. Tests E2E:
   ── Probar los 16 escenarios de compra del gap analysis
   └── Cada escenario debe producir un asiento cuadrado con montos correctos
```

**Escenarios a probar:** A (crédito), B (contado), C (inventario), D (activo fijo), E (servicios), F (detracción), G+H (retención+percepción), I (RHE), J (dif.cambio), K (NC), L (anticipos)

**Output:** `handler/ComprasSideEffectHandler.java` + modificación en `ms-finanzas`

---
#### 3.2 — Tesorería (1 semana)

**Proceso:**
```
1. Crear handler:
   ── handler/TesoreriaSideEffectHandler.java
   └── Implementar:
       ┌─ PAGO_PROVEEDOR:    actualizar saldo banco, marcar CxP como pagada
       ├─ COBRO_REGISTRADO:  actualizar saldo banco, marcar CxC como cobrada
       ├─ APERTURA_CAJA_CHICA: crear registro de fondo fijo
       ├─ GASTO_CAJA_CHICA:  reducir saldo de fondo, registrar gasto
       ├─ REPOSICION_CAJA_CHICA: recargar fondo desde banco
       └─ Registrar handlers

2. Adaptar ms-finanzas para emitir eventos de pago/cobro.

3. Tests E2E de tesorería.
```

---
#### 3.3 — Ventas (1 semana)

**Proceso:**
```
1. Crear handler:
   ── handler/VentasSideEffectHandler.java
   └── Implementar:
       ┌─ VENTA_EMITIDA:     crear CxC (si crédito), registrar libros tributarios
       ├─ NOTA_CREDITO:      revertir CxC (invertir asiento original)
       ├─ NOTA_DEBITO:       aumentar CxC
       ├─ LIQUIDACION_AGREGADOR: crear CxC al agregador, registrar comisión
       └─ Registrar handlers

2. Adaptar ms-ventas para emitir VENTA_EMITIDA.
```

---
#### 3.4 — Activos Fijos (3-4 días)

**Proceso:**
```
1. Crear handler:
   ── handler/ActivosFijosSideEffectHandler.java
   └── DEPRECIACION_MENSUAL: programar scheduler mensual
       ┌─ Calcular depreciación del período
       ├─ Generar evento DEPRECIACION_MENSUAL
       └─ Registrar handler
```

---
#### 3.5 — Planillas (3-4 días)

**Proceso:**
```
1. Crear handler:
   ── handler/PlanillasSideEffectHandler.java
   └── PLANILLA_DEVENGADA: modo batch (es_batch=true)
       ┌─ Consolidar N empleados × M conceptos en pocas líneas de asiento
       └─ Agrupar por cuenta contable
```

---
#### 3.6 — Producción / Almacén (3-4 días)

**Proceso:**
```
1. Mantener convivencia con pre-asientos de almacén existentes.
2. Crear handlers para CONSUMO_PRODUCCION, PRODUCCION_TERMINADA.
3. Integrar con ms-almacen vía eventos.
```

---
#### Entregable Fase 3

Cada flujo implementado = escenarios de `GAP_MOTOR_ASIENTOS_VS_MANUAL.md` pasando de ❌ a ✅.

---

### Fase 4 — Verificación y Corte (1-2 semanas)

**Objetivo:** Validar que el nuevo motor reemplaza completamente al viejo y hacer el corte.

**Narrativa:** Esta fase tiene dos tracks independientes. El track de **verificación** (4.1-4.7) ejecuta los tests E2E de todos los flujos, regenera asientos históricos con el nuevo motor, compara saldos contra el motor viejo (deben coincidir), y verifica casos borde (idempotencia, extorno, multi-país). El track de **cleanup** (4.8-4.11) elimina el código legacy: depreca endpoints viejos, remapa lógica Peru-specific, documenta la API nueva. Ambos tracks pueden correr en paralelo porque la verificación no modifica código y el cleanup no ejecuta pruebas.

**Criterio de aceptación:** Todos los tests E2E pasan. Los 14 endpoints legacy responden 410 Gone. No queda código con `PAIS_PERU_ID`.

| # | Tarea | Depende de | Paralela con |
|---|---|---|---|
| 4.1 | Regenerar asientos históricos (comparar vs viejos) | 3.1-3.6 (flujos listos) | 4.8, 4.9, 4.10, 4.11 |
| 4.2 | Comparar saldos por cuenta: viejo vs nuevo | 4.1 | — |
| 4.3 | Tests E2E: 16 escenarios de compra | 3.1.3 | 4.4, 4.5, 4.6, 4.7 |
| 4.4 | Tests E2E: ventas, tesorería, activos, planillas | 3.2-3.6 tests | 4.3, 4.5, 4.6, 4.7 |
| 4.5 | Tests de idempotencia | Pipeline listo | 4.3, 4.4, 4.6, 4.7 |
| 4.6 | Tests de extorno | 1.4.13 | 4.3, 4.4, 4.5, 4.7 |
| 4.7 | Tests multi-país: PE ≠ CO ≠ EC | Fase 2 | 4.3, 4.4, 4.5, 4.6 |
| 4.8 | Deprecar endpoints legacy (14 → 410 Gone) | 3.1-3.6 | 4.1-4.7, 4.9, 4.10, 4.11 |
| 4.9 | Remover PAIS_PERU_ID | 3.1-3.6 | 4.1-4.8, 4.10, 4.11 |
| 4.10 | Deprecar tablas legacy restantes | 1.3 | 4.1-4.9, 4.11 |
| 4.11 | Documentar API nueva | 1.4.12-1.4.13 | 4.1-4.10 |

**Verificación (4.1-4.7) y cleanup (4.8-4.11) son independientes.**

---
#### 4.1 — Regenerar asientos históricos

**Input:** BD real con asientos del motor viejo (cntbl_asiento, cntbl_asiento_det)  
**Depende de:** 3.1-3.6 (flujos listos)

**Proceso:**
```
1. Tomar eventos reales de la BD del último mes:
   ┌─ De cntas_pagar → reconstruir evento COMPRA_REGISTRADA
   ├─ De caja_bancos → reconstruir evento PAGO_PROVEEDOR / COBRO_REGISTRADO
   └─ De cntbl_asiento (naturaleza=1) → reconstruir eventos manuales de prueba

2. Re-enviar cada evento al nuevo pipeline (POST /procesar-evento).

3. Comparar asiento generado vs asiento original:
   ┌─ Debe coincidir el número de líneas
   ├─ Debe coincidir el total (suma Debe = suma Haber)
   └─ Las cuentas pueden diferir (el nuevo motor usa reglas, el viejo usaba matrices fijas)
      ── Si difieren: documentar y decidir si ajustar regla o es correcto
```

**Output:** Reporte de comparación: "Nuevo motor genera mismo asiento que el viejo" para X de Y asientos

---

#### 4.2 — Comparar saldos por cuenta

**Depende de:** 4.1

**Proceso:**
```
1. Para cada cuenta contable:
   SELECT plan_contable_det_id, SUM(debe) - SUM(haber) AS saldo
   FROM cntbl_asiento_det
   WHERE asiento_id IN (asientos viejos del periodo)
   GROUP BY plan_contable_det_id;

2. Hacer mismo cálculo con asientos del nuevo motor.

3. Comparar: los saldos DEBEN coincidir.
   ┌─ Si una cuenta tiene saldo distinto: hay un error en regla_cuenta_componente
   ├─ Si el total general difiere: hay un asiento que el nuevo motor no generó
   └─ Si coinciden todos: ✅ motor nuevo es equivalente al viejo
```

**Output:** Tabla de comparación de saldos por cuenta

---

#### 4.3 — Tests E2E: 16 escenarios de compra

**Input:** Escenarios documentados en GAP_MOTOR_ASIENTOS_VS_MANUAL.md  
**Depende de:** 3.1 completado

**Proceso:**
```
Por cada escenario (A-P):
1. Preparar payload de ejemplo según docs
2. POST /procesar-evento
3. Verificar:
   ┌─ Status 200 (asiento generado)
   ├─ Debe = Haber
   ├─ Componentes activos correctos (según 07-REGLA_ACTIVACION.md)
   └─ Montos calculados correctamente (según tipo de componente)
```

---

#### 4.4 — Tests E2E: ventas, tesorería, activos, planillas

Mismo proceso que 4.3 pero para eventos de otros módulos.

---

#### 4.5 — Tests de idempotencia

**Proceso:**
```
1. Enviar mismo evento 2 veces.
2. Verificar:
   ┌─ Primera vez: 200 (asiento creado)
   └─ Segunda vez: 200 (mismo asiento_id, no duplica)
```

---

#### 4.6 — Tests de extorno

**Proceso:**
```
1. Generar asiento (POST /procesar-evento).
2. Extornar (POST /asientos/{id}/extornar).
3. Verificar:
   ┌─ Nuevo asiento con asiento_original_id = id del extornado
   ├─ Líneas invertidas (Debe ↔ Haber)
   └─ asiento_original.revertido = true
```

---

#### 4.7 — Tests multi-país

**Proceso:**
```
1. Enviar COMPRA_REGISTRADA con pais_id=PE → cuentas PCGE, IVA 18%
2. Enviar COMPRA_REGISTRADA con pais_id=CO → cuentas PUC, IVA 19%
3. Enviar COMPRA_REGISTRADA con pais_id=EC → cuentas SRI, IVA 15%
```

---

#### 4.8 — Deprecar endpoints legacy

**Proceso:**
```
Los 14 endpoints específicos del motor viejo deben responder 410 Gone:
┌─ POST /api/contabilidad/asientos/generar/registro-cntas-pagar
├─ POST /api/contabilidad/asientos/generar/cartera-pagos
├─ POST /api/contabilidad/asientos/generar/registro-cntas-cobrar
└─ ... (todos los que el nuevo reemplaza)
```

---

#### 4.9 — Remover PAIS_PERU_ID

**Proceso:**
```
1. Buscar PAIS_PERU_ID, PAIS_PERU, pais_peru en todo el código Java.
2. Reemplazar cada referencia con consulta al contexto del tenant.
3. Ejemplo:
   ── viejo: if (paisId == PAIS_PERU_ID) { ... }
   ── nuevo: configFiscal = configuracionFiscalService.buscar(paisId);
```

---

#### 4.10 — Deprecar tablas legacy restantes

Si hay tablas legacy que ningún flujo necesita, RENAME TO _legacy.

---

#### 4.11 — Documentar API nueva

**Proceso:**
```
Documentar:
1. POST /api/contabilidad/asientos/procesar-evento:
   ┌─ Body: EventoRequest con evento + payload
   ├─ Response: AsientoResponse con asiento generado
   └─ Ejemplos por tipo de evento (COMPRA, VENTA, PAGO...)

2. POST /api/contabilidad/asientos/{id}/extornar:
   └─ Body: { motivo, usuario_id }

3. CRUD de reglas (admin):
   └─ GET/POST regla_activacion, regla_cuenta_componente
```

---

## 3. Timeline (Gantt Conceptual)

```
Semana   1  2  3  4  5  6  7  8  9 10 11 12 13 14
         │  │  │  │  │  │  │  │  │  │  │  │  │  │
Fase 0   ████████
Fase 1         ████████████████████
Fase 2                    ████████████████
Fase 3                           ████████████████████████
Fase 4                                              ████████
                                                   
         │  │  │  │  │  │  │  │  │  │  │  │  │  │
Hito:   P0 P1       P2          P3                  P4
```

---

## 4. Dependencias entre Fases

```
Fase 0 (preparación)
  └── Fase 1 (core del motor)
        └── Fase 2 (configuración multi-país)
              └── Fase 3 (migración flujos)
                    └── Fase 4 (verificación y corte)
```

- Fase 0 y 1 pueden solaparse parcialmente (mierntras se prepara el análisis, se puede empezar a crear tablas)
- Fase 2 requiere Fase 1 completa (el pipeline debe existir para probar las reglas)
- Fase 3 puede empezar con Perú antes de que CO/EC estén completos

---

## 5. Tareas que Pueden Correr en Paralelo

### 5.0 Vocabulario: ¿Qué es cada cosa?

Antes de mostrar qué tareas corren en paralelo, estas son las piezas que vamos a construir:

| Término | ¿Qué es? | Ejemplo concreto |
|---|---|---|
| **Pipeline** | Secuencia de 10 pasos que transforma un evento en un asiento contable. Cada paso es una clase Java que implementa una interfaz. | `ReceiverStep` (valida el payload), `ValidatorStep` (chequea Debe=Haber) |
| **Step** | Una de las 10 etapas del pipeline. Cada step tiene una interfaz (`IReceiverStep`, `IEvaluatorStep`, etc.) y una implementación. | `ActivationEvaluatorStep` evalúa las condiciones JSONB de `regla_activacion` |
| **Interfaz del step** | Contrato Java que define qué hace un step sin decir cómo lo implementa. Permite que el pipeline se escriba contra la interfaz mientras otro desarrollador implementa el código concreto. | `IAccountResolverStep` define el método `resolverCuentas(Contexto)` |
| **Dispatcher** | Un step especial del pipeline (Paso 8) que no tiene lógica propia: solo recibe el evento terminado y lo redirige al handler correspondiente según el tipo de evento. | `SideEffectStep` ve que el evento es `COMPRA_REGISTRADA` y llama al handler de compras |
| **Handler** | Clase Java con la lógica de efectos secundarios de UN solo flujo de negocio. Cada handler implementa la interfaz `SideEffectHandler` y se registra en el dispatcher. | `ComprasSideEffectHandler` crea la CxP y actualiza kárdex. `VentasSideEffectHandler` crea la CxC y registra en libros tributarios. |
| **Engine** | Paquete Java completo que contiene el pipeline, los steps, los handlers, el orchestrator, y las interfaces. Es el "motor" del nuevo sistema. | `ms-contabilidad/src/main/java/pe/restaurant/contabilidad/engine/` |

**¿Por qué esto permite paralelizar?** Porque cada handler es un archivo Java independiente. Una persona puede escribir `ComprasSideEffectHandler.java` mientras otra escribe `VentasSideEffectHandler.java` — nunca tocan el mismo archivo. Lo mismo con los steps del pipeline: cada uno es su propia clase.

### 5.1 Principio

Dos tareas pueden correr en paralelo si **no tocan los mismos archivos** y **no tienen dependencia de datos** entre sí.

### 5.2 Fase 0 — Preparación

```
GRUPO A (independiente de Grupo B)
└── 0.1 Revisar matrices actuales y extraer reglas contables

GRUPO B (independiente de Grupo A)
├── 0.2 Mapear matrices CP-xxx a componentes equivalentes
├── 0.3 Validar matrices FI-xxx (pagos directos)
├── 0.4 Definir payload de cada evento (contrato API)
├── 0.5 Cargar core.pais con PE, CO, EC + datos básicos
├── 0.6 Cargar core.moneda con PEN, USD, COP
└── 0.7 Configurar core.tipos_impuesto con plan_contable_det_id
```

**Paralelizable:** Sí, Grupo A y B no comparten archivos.
**Dependencia:** 0.4 (contratos) es insumo para Fase 1, pero no bloquea a 0.5-0.7.

### 5.3 Fase 1 — Core del motor

Esta fase tiene una **secuencia obligatoria** al inicio. Después se abre en paralelo.

```
═══ SECUENCIA OBLIGATORIA (Día 1-5) ═══
  1.1 Crear tablas nuevas (componente_contable, regla_activacion, etc.)
  1.2 ALTER tablas existentes (plan_contable_det, cntbl_asiento, etc.)
  1.3 Deprecar tablas legacy (matriz_contable → _legacy)
  ↓
  Definir interfaces del pipeline (IReceiverStep, IEvaluatorStep, ...)
  + DTOs (EventoRequest, AsientoResponse, LineaEvento)
  + Contrato REST (POST /procesar-evento)

═══ TRABAJO PARALELO (Día 6-20) ═══

GRUPO A: Pipeline (no necesita entities JPA, solo interfaces)
├── 1.4.1 Paso 1 — RECIBIR: validador de payload por evento
├── 1.4.2 Paso 2 — EVALUAR REGLAS: evaluador condiciones JSONB
├── 1.4.3 Paso 3 — RESOLVER CUENTAS: fallback progresivo
├── 1.4.4 Paso 4 — CALCULAR MONTOS: por tipo de componente
├── 1.4.5 Paso 5 — ORDENAR Y POSICIONAR
├── 1.4.6 Paso 6 — VALIDAR: balanceo, cuentas, periodo
├── 1.4.7 Paso 7 — PERSISTIR: SQL transaccional
├── 1.4.8 Paso 8 — EFECTOS SECUNDARIOS: dispatcher (interface)
├── 1.4.9 Paso 9 — EMITIR EVENTO SALIDA
├── 1.4.10 Paso 10 — EXPORTAR REPORTES (estructura base)
└── 1.4.11 PipelineOrchestrator + 1.4.12 POST /procesar-evento

GRUPO B: Entidades y repositorios (necesita DDL listo, NO el pipeline)
├── 1.5.1 Entidades nuevas: ComponenteContable, ReglaActivacion, ReglaCuentaComponente
├── 1.5.2 Entidades modificadas: PlanContableDet, CntblAsiento, CntblAsientoDet, etc.
├── 1.5.3 Repositorios con queries de resolución (fallback progresivo)
├── 1.5.4 DTOs Java (EventoRequest, LineaEvento, AsientoResponse)
└── 1.5.5 Eliminar entidades deprecadas: MatrizContable, MatrizContableDet
```

**Paralelizable:** Grupo A y Grupo B NO comparten archivos.
- A crea archivos en `engine/*.java` y `controller/*.java`
- B crea archivos en `entity/*.java`, `repository/*.java`, `dto/*.java`
- Se integran al final: PipelineOrchestrator usa repositorios reales

### 5.4 Fase 2 — Multi-país

```
GRUPO A: Genérico (independiente de B, C, D)
├── 2.1 Cargar componente_contable (~80 roles)
└── 2.2 Cargar regla_activacion para todos los eventos

GRUPO B: Perú (independiente de C, D)
├── 2.3 Cargar regla_cuenta_componente para Perú
├── 2.4 Cargar tasa_impuesto para Perú (IVA 18%, ISC)
├── 2.5 Cargar configuracion_fiscal_pais para Perú
├── 2.6 Cargar plan_contable_det para Perú con nuevas columnas
└── 2.7 Cargar cntbl_libro con tipo

GRUPO C: Colombia (independiente de B, D)
├── 2.8 Idem 2.3-2.7 para Colombia (PUC, IVA 19%, ReteFuente...)
└── 2.10 Cargar posicion_fiscal (cross-border)

GRUPO D: Ecuador (independiente de B, C)
├── 2.9 Idem 2.3-2.7 para Ecuador (plan SRI, IVA 15%, ISD)
└── 2.10 Cargar posicion_fiscal (cross-border)
```

**Paralelizable al 100%:** B, C, D son archivos SQL separados por país. La tabla `regla_cuenta_componente` es compartida pero cada grupo inserta filas con distinto `pais_id`, no hay conflicto.
**Dependencia:** El Grupo A (componentes + reglas genéricas) debería estar listo antes que B/C/D, pero no los bloquea porque las reglas de país pueden cargarse después.

### 5.5 Fase 3 — Flujos de negocio

> **⚠️ Requisito:** Antes de paralelizar, UNA persona debe crear el `SideEffectStep` como dispatcher (3 días). Después, los handlers son independientes.

```
═══ PREREQUISITO (3 días, lo hace UNA persona) ═══
  Crear interfaz SideEffectHandler + SideEffectStep como dispatcher
  └── No tiene lógica de negocio, solo ruthea por tipo de evento
  └── Archivos: engine/SideEffectStep.java, engine/SideEffectHandler.java

═══ TRABAJO PARALELO ═══

GRUPO A: Compras (no toca archivos de B ni C)
├── Crear handler: handler/ComprasSideEffectHandler.java
│   └── Lógica: crear CxP, actualizar kárdex, registrar compras
├── Adaptar ms-compras para emitir evento COMPRA_REGISTRADA
├── Tests E2E de los 16 escenarios de compra
└── Ver escenarios: A, B, C, D, E, F, G, H, I, J, K, L

GRUPO B: Tesorería (no toca archivos de A ni C)
├── Crear handler: handler/TesoreriaSideEffectHandler.java
│   └── Lógica: actualizar banco, caja chica, detracciones
├── Adaptar ms-finanzas para emitir eventos PAGO_PROVEEDOR, COBRO_REGISTRADO
├── Implementar caja chica (apertura, gasto, reposición)
├── Implementar rendiciones de gasto
└── Tests E2E de tesorería

GRUPO C: Ventas (no toca archivos de A ni B)
├── Crear handler: handler/VentasSideEffectHandler.java
│   └── Lógica: crear CxC, libros tributarios, agregadores
├── Adaptar ms-ventas para emitir evento VENTA_EMITIDA
├── Implementar NC/ND, contracargos, anticipos
└── Tests E2E de ventas

GRUPO D: Activos fijos + Planillas (no toca archivos de A, B, C)
├── Migrar pre-asientos de activos fijos → eventos directos
├── Implementar DEPRECIACION_MENSUAL, BAJA_ACTIVO
├── Implementar PLANILLA_DEVENGADA, PLANILLA_PAGADA
└── Tests E2E de activos y planillas
```

**Paralelizable al 100%:** A, B, C, D crean archivos distintos:
- `handler/Compras*.java` vs `handler/Tesoreria*.java` vs `handler/Ventas*.java`
- Cada uno adapta su propio microservicio (`ms-compras`, `ms-finanzas`, `ms-ventas`)
- El `SideEffectStep` no se vuelve a tocar después del prerequisito

### 5.6 Fase 4 — Verificación y Corte

```
GRUPO A: Tests y verificación
├── 4.1 Regenerar asientos históricos con nuevo motor
├── 4.2 Comparar saldos: motor viejo vs nuevo
├── 4.3 Verificar 16 escenarios de compra E2E
├── 4.4 Verificar escenarios de ventas, tesorería, activos, planillas
├── 4.5 Tests de idempotencia
├── 4.6 Tests de extorno
└── 4.7 Tests multi-país

GRUPO B: Cleanup (independiente de A)
├── 4.8 Deprecar tablas legacy
├── 4.9 Deprecar endpoints legacy (14 específicos)
├── 4.10 Remover PAIS_PERU_ID y lógica Peru-specific
└── 4.11 Documentar API nueva
```

**Paralelizable:** Sí, A son pruebas (no modifican código fuente), B es limpieza de código. No comparten archivos.

### 5.7 Diagrama de dependencias entre fases

```
Fase 0 (prep)
  │
  ├── 0.1-0.3 (análisis matrices) ────────┐
  ├── 0.4 (contratos eventos) ────────────┤
  └── 0.5-0.7 (seed datos) ───────────────┤
                                          ▼
Fase 1 (core) ──── secuencia obligatoria ──▶ interfaces + DDL
  │                                          │
  ├── Grupo A: Pipeline (engine/*.java) ─────┤
  ├── Grupo B: Entities (entity/*.java) ─────┤
  └── Integración ───────────────────────────┘
                                          ▼
Fase 2 (países) ──── seed PE ── seed CO ── seed EC (en paralelo)
                                          ▼
Fase 3 (flujos) ─ prerequisito: SideEffectStep dispatcher ────▶
  ├── Grupo A: handler Compras + ms-compras
  ├── Grupo B: handler Tesorería + ms-finanzas
  ├── Grupo C: handler Ventas + ms-ventas
  └── Grupo D: Activos + Planillas
                                          ▼
Fase 4 (verificación) ──── tests (A) ──── cleanup (B) (en paralelo)
```

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Contrato de eventos cambia durante implementación | Alta | Medio | Definir contratos en Fase 0, congelar cambios hasta Fase 4 |
| Matrices actuales tienen datos inconsistentes | Media | Alto | Revisión manual en Fase 0; si hay dudas, crear reglas nuevas |
| Performance: pipeline con 10 pasos puede ser lento | Baja | Medio | Cache de reglas, async para pasos 8-10 |
| Complejidad de condiciones JSONB | Media | Bajo | Evaluador simple al inicio, complejidad progresiva |
| Colombia/Ecuador: falta expertise contable | Media | Alto | Contratar consultor contable por país o usar documentación beta como referencia |

---

## 7. Hitos y Criterios de Aceptación

| Hito | Criterio |
|---|---|
| **P0** | Gap analysis revisado, matrices mapeadas, contratos de eventos definidos |
| **P1** | Pipeline 10 pasos funcionando. Endpoint `/procesar-evento` responde 200 con asiento generado |
| **P2** | 3 países configurados. Tests de integración pasan para PE, CO, EC |
| **P3** | 16 escenarios de compra funcionando. Ventas, tesorería, activos, planillas migrados |
| **P4** | Motor viejo deprecado. Todos los tests E2E pasan. Cobertura 100% |

---

## 8. Backlog Priorizado (MVP)

Para el MVP, enfocar en:

1. **Compras** (16 escenarios) — el gap más documentado y crítico
2. **Tesorería** (pagos, cobros, transferencias) — volumen diario alto
3. **Ventas** (contado, crédito, agregadores) — impacto en facturación
4. **Activos fijos** — mensual, depreciación
5. **Planillas** — mensual, batch

Cada flujo implementado = escenarios de `GAP_MOTOR_ASIENTOS_VS_MANUAL.md` pasando de ❌ a ✅.
