# Revisión Completa — Tablas: Salvar vs Crear

**Versión:** 1.0  
**Basado en:** Contraste con BD real (`restaurant_pe_emp_cantabria`) + dependencias de esquemas  
**Objetivo:** Decidir tabla por tabla si se salva (con cambios mínimos) o se reemplaza por una nueva.

---

## 1. Criterios de Decisión

| Salvamos si... | Reemplazamos si... |
|---|---|
| La estructura base es correcta y solo necesita columnas adicionales | La lógica que representa es totalmente distinta |
| Tiene datos existentes que migrar (7,649 cuentas, 30 asientos) | No tiene datos que valga la pena migrar |
| Tiene FKs desde otros esquemas (evitar romper módulos existentes) | Su función se cubre con tablas nuevas sin pérdida |
| Los cambios son ADD COLUMN, no DELETE COLUMN | Requiere cambiar la PK o la semántica por completo |

---

## 2. Decisión por Tabla

### ✅ SALVAR (ALTER in-place)

Son tablas que existen, tienen datos útiles, y solo necesitan que les agreguemos columnas.

| Tabla | Data actual | Cambios necesarios | FKs externas afectadas |
|---|---|---|---|
| **`plan_contable_det`** | 7,649 cuentas PCGE | ADD: `cuenta_padre_id`, `naturaleza`, `tipo`, `codigo_autoridad` (rename de `cnta_cntbl_sunat`). No renombrar la tabla. | `finanzas.banco_cnta`, `core.tipos_impuesto`, `cntbl_asiento_det`, `cntbl_preasiento_det`, `distribucion_contable` → **ninguna se rompe** porque no renombramos |
| **`cntbl_asiento`** | 30 asientos | ADD: `numero_asiento`, `periodo_contable_id`, `origen_id`, `estado`, `asiento_original_id`, `tipo_reversion`, `total_debe`, `total_haber`. `naturaleza_asiento` → `origen` (cambiar valores). | `finanzas.cntas_pagar`, `ventas.cntas_cobrar` → FKs existentes siguen funcionando |
| **`cntbl_asiento_det`** | 78 líneas | ADD: `linea`, `debe`, `haber`, `moneda_id`, `monto_original`, `sucursal_id`, `partner_id`. `importe_sol/dol` → NULL允许 (datos legacy). | `cntbl_asiento` FK sigue igual. Las 7 FKs específicas (cntas_pagar_id, etc.) se dejan NULL允许, no se eliminan (para no romper datos legacy) |
| **`cntbl_libro`** | 56 libros | ADD: `tipo` (compras/ventas/caja/banco/diario). Opcional: `empresa_id` (aunque en tenant no hace falta). | Ninguna FK externa |
| **`cntbl_cierre`** | 0 filas | ADD: `id` UUID PK, `fecha_inicio`, `fecha_fin`, `estado`. O mantener PK (ano, mes). | Ninguna FK externa |
| **`numerador_asiento`** | 10 registros | ADD: `formato` VARCHAR(50) con plantilla configurable. | Ninguna FK externa |
| **`cntbl_preasiento`** | 4 pre-asientos | ADD: `estado`, `asiento_id`. `modulo_origen` → `origen`. | Ninguna FK externa |
| **`cntbl_preasiento_det`** | 7 líneas | ADD: `debe`, `haber`. Igual que asiento_detalle. | FK a preasiento se mantiene |
| **`centros_costo`** | 873 centros | Mínimos cambios. ADD: `activo` BOOLEAN si se quiere, pero `flag_estado` ya sirve. | 18+ FKs desde otros esquemas → **NO TOCAR** |

**Beneficio de salvar:** Todas las FKs externas siguen funcionando sin migración. Los datos existentes (7,649 cuentas, 30 asientos) no se pierden. Los módulos existentes (ms-finanzas, ms-compras, ms-ventas, ms-almacen) **no se rompen**.

### ✅ MANTENER (as-is, sin cambios)

Son tablas que no necesitan modificarse porque su estructura ya es válida para el nuevo motor.

| Tabla | Data actual | Por qué se mantiene |
|---|---|---|
| **`concepto_financiero`** | 639 registros | Solo cambia la FK: `matriz_contable_id` → `componente_id`. La tabla se queda igual, solo se actualiza el valor de la FK. |
| **`distribucion_contable`** | 0+ registros | Se mantiene como está. Si no se usa en el nuevo motor, simplemente se ignora. |

### 🆕 CREAR (tablas nuevas, sin contraparte legacy)

No existe ninguna tabla actual que pueda adaptarse para estos propósitos.

| Tabla Nueva | Por qué no se puede salvar una existente |
|---|---|
| **`componente_contable`** | No existe tabla de "roles contables". `grupo_contable` es una agrupación distinta (solo 3 columnas). |
| **`regla_activacion`** | No existe tabla de "reglas con condiciones JSONB". `matriz_contable` es un mapeo fijo, no dinámico. |
| **`regla_cuenta_componente`** | No existe tabla de "resolución de cuentas con fallback". `matriz_contable_det` tiene cuenta fija + fórmula no evaluada. |
| **`tasa_impuesto`** | `core.tipos_impuesto` existe pero solo tiene tasa + descripción. Le falta vigencia, país, y los 42 registros tienen NULL en cuenta contable. Se complementa, no se reemplaza. |
| **`configuracion_fiscal_pais`** | No existe. No hay tabla con reglas fiscales por país (umbral bancarización, etc.). |
| **`auditoria_asiento`** | No existe log de auditoría contable. |
| _eliminada del diseño_ | — | Se decidió que todo pase por el motor de componentes. Sin caminos alternativos. |
| **`posicion_fiscal` + `posicion_fiscal_regla`** | No existe. Para cross-border. |

### 🗑️ DEPRECAR (tablas que dejan de usarse)

| Tabla | Data actual | Reemplazada por | Qué hacer con los datos |
|---|---|---|---|
| **`matriz_contable`** | 770 matrices | `componente_contable` + `regla_activacion` + `regla_cuenta_componente` | No se migran. Se renombra a `_legacy` para consulta histórica. |
| **`matriz_contable_det`** | 1,093 líneas | — | `ALTER RENAME TO matriz_contable_det_legacy` |
| **`grupo_matriz_cntbl`** | 11 grupos | — | `ALTER RENAME TO grupo_matriz_cntbl_legacy` |
| **`grupo_contable`** | ? | — | `ALTER RENAME TO grupo_contable_legacy` |
| **`tipo_mov_matriz_subcat`** | ? | `regla_activacion` con condiciones | `ALTER RENAME TO tipo_mov_matriz_subcat_legacy` |

---

## 3. Impacto en otros esquemas

### 3.1 Tablas que NO se tocan (no se renombran, no se alteran)

| Esquema | Tabla | FK actual | Riesgo |
|---|---|---|---|
| `finanzas` | `cntas_pagar.cntbl_asiento_id` | → `cntbl_asiento` (se ALTERA, no se renombra) | ✅ Sin riesgo |
| `finanzas` | `banco_cnta.plan_contable_det_id` | → `plan_contable_det` (se ALTERA, no se renombra) | ✅ Sin riesgo |
| `core` | `tipos_impuesto.plan_contable_det_id` | → `plan_contable_det` (se ALTERA, no se renombra) | ✅ Sin riesgo |
| `almacen` | `vale_mov_det.centros_costo_id` | → `centros_costo` (NO se toca) | ✅ Sin riesgo |
| `almacen` | `vale_mov_det.matriz_contable_id` | → `matriz_contable` (se depreca) | ⚠️ Hay que actualizar esta FK o eliminarla |

**Regla:** Si no renombramos la tabla, las FKs existentes NO se rompen. Por eso salvamos `plan_contable_det` y `cntbl_asiento` **sin renombrar**.

### 3.2 Único riesgo real: `vale_mov_det.matriz_contable_id`

La tabla `almacen.vale_mov_det` tiene FK a `matriz_contable`. Cuando deprequemos `matriz_contable`, esta FK se rompe.

**Solución:** Cambiar la FK para que sea NULL允许 y opcional. El nuevo motor usará `regla_activacion` con condiciones para determinar la matriz contable de movimientos de almacén, no una FK directa.

---

## 4. Resumen: Esfuerzo por Tabla

| Tabla | Acción | Líneas de SQL | Riesgo |
|---|---|---|---|
| `plan_contable_det` | ALTER TABLE (ADD 4 columnas) | ~10 | Bajo |
| `cntbl_asiento` | ALTER TABLE (ADD 8 columnas, 1 rename) | ~15 | Bajo |
| `cntbl_asiento_det` | ALTER TABLE (ADD 7 columnas) | ~12 | Bajo |
| `cntbl_libro` | ALTER TABLE (ADD 1 columna) | ~3 | Mínimo |
| `cntbl_cierre` | ALTER TABLE (ADD 4 columnas) | ~6 | Mínimo |
| `numerador_asiento` | ALTER TABLE (ADD 1 columna) | ~3 | Mínimo |
| `cntbl_preasiento` | ALTER TABLE (ADD 3 columnas) | ~5 | Bajo |
| `cntbl_preasiento_det` | ALTER TABLE (ADD 2 columnas) | ~4 | Bajo |
| `centros_costo` | Sin cambios | 0 | Ninguno |
| `concepto_financiero` | UPDATE (cambiar FK de matriz a componente) | ~639 updates | Medio (hay que mapear cada concepto) |
| **NUEVAS:** 8 tablas | CREATE TABLE | ~60 | Ninguno |
| **DEPRECAR:** 5 tablas | RENAME TO _legacy | ~5 | Bajo |

**Total DDL:** ~120 líneas de SQL para salvar lo existente + crear lo nuevo.

---

## 5. Comparativa: Enfoque Anterior vs Enfoque Actual

| Aspecto | Enfoque anterior (documentación v1) | Enfoque actual (tras revisión) |
|---|---|---|
| `plan_contable_det` → `cuenta_contable` | Crear tabla nueva, migrar datos, eliminar vieja | **ALTER in-place**. Misma tabla, más columnas. |
| `cntbl_asiento` → `asiento` | Crear tabla nueva, migrar 30 asientos | **ALTER in-place**. Se agregan columnas, datos legacy conviven. |
| `cntbl_asiento_det` → `asiento_detalle` | Crear tabla nueva | **ALTER in-place**. Las 7 FKs específicas se dejan como NULL允许. |
| `core.partner` | Crear tabla nueva unificada | **No se crea**. El motor usa `core.entidad_contribuyente` existente. |
| `empresa_id` en tablas | Agregar columna a todas | **No se agrega**. El tenant DB ya aísla por empresa. |
| Migración de datos | Masiva (mover 7,649 cuentas, 30 asientos) | **Cero**. Los datos se quedan donde están. Solo agregamos columnas nuevas. |

**Conclusión:** Pasamos de un enfoque de "migración y reemplazo" a uno de "evolución in-place". Menos riesgo, menos trabajo, cero impacto en módulos existentes.

---

## 6. Tareas en Paralelo Según Este Análisis

### Fase 1A: DDL (puede hacerlo 1 persona, 3-4 días)

```
TAREAS SECUENCIALES (dependen entre sí):
  DÍA 1: ALTER tablas existentes (plan_contable_det, cntbl_asiento, cntbl_asiento_det, etc.)
  DÍA 2: CREATE tablas nuevas (componente_contable, regla_activacion, regla_cuenta_componente, etc.)
  DÍA 3: RENAME tablas legacy a _legacy
  DÍA 4: Seed inicial: componentes (~80 filas), reglas genéricas
```

### Fase 1B: Backend (pueden hacerlo 2 personas en paralelo)

```
GRUPO A: Interfaces del pipeline + steps 1-7 (no necesita entities)
├── IReceiverStep, IEvaluatorStep, IResolverStep, etc. (5 interfaces)
├── DTOs: EventoRequest, AsientoResponse, LineaEvento
├── Steps 1-7: Receiver → Validator
└── Controller: POST /procesar-evento (esqueleto)

GRUPO B: Entities JPA + repositorios (no necesita steps)
├── Entities: ComponenteContable, ReglaActivacion, ReglaCuentaComponente (nuevas)
├── Entities: PlanContableDet, CntblAsiento, CntblAsientoDet (adaptadas a nuevas columnas)
├── Repositorios: queries de resolución con fallback
└── Repositorio: regla_cuenta_componente con progressive fallback

NO COMPARTEN ARCHIVOS — pueden hacerse en paralelo
```

### Fase 1C: Integración (1 persona, 2-3 días)

```
PipelineOrchestrator conecta steps con repositorios reales.
Steps 8-10: SideEffectStep (dispatcher), EventEmitterStep, ReportExporterStep
POST /procesar-evento completo + POST /asientos/{id}/extornar
```

### Fase 2: Seed por país (3 personas en paralelo)

```
Seed genérico: componentes + reglas activación (1 persona, 2 días)
Seed Perú: reglas cuenta PE + tasas PE (1 persona, 5 días)
Seed Colombia: reglas cuenta CO + tasas CO (1 persona, 5 días)
Seed Ecuador: reglas cuenta EC + tasas EC (1 persona, 5 días)
→ Las semillas de país NO comparten archivos SQL y NO dependen entre sí
```

### Fase 3: Flujos (3 personas en paralelo)

```
PRERREQUISITO (1 persona, 2 días):
  SideEffectHandler interface + SideEffectStep dispatcher

LUEGO EN PARALELO:
  Handler Compras + adaptar ms-compras   (Persona A)
  Handler Tesorería + adaptar ms-finanzas (Persona B)
  Handler Ventas + adaptar ms-ventas    (Persona C)
  Activos Fijos + Planillas              (Persona A después de compras)
  
→ Cada handler es un archivo .java distinto
→ Cada módulo (ms-compras, ms-finanzas, ms-ventas) es un microservicio distinto
→ NO comparten archivos
```

### Fase 4: Verificación (1-2 personas en paralelo)

```
Tests E2E de todos los flujos (1 persona)
Cleanup: deprecar endpoints legacy, remover PAIS_PERU_ID (1 persona)
→ No comparten archivos
```
