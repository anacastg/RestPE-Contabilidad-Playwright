# Gestión de Reglas — Operación del Motor de Asientos v2

**Versión:** 1.0  
**Relacionado:** `07-REGLA_ACTIVACION.md`, `08-REGLA_CUENTA.md`, `11-REVISION_COMPLETA.md`

---

## 1. ¿Quién gestiona las reglas?

El motor está diseñado para que **distintos roles** interactúen con las reglas según su responsabilidad:

| Rol | Qué hace | Cómo |
|---|---|---|
| **Contador / Configurador** | Define qué cuenta va en cada regla, activa/desactiva componentes | Admin web → tablas `regla_cuenta_componente`, `regla_activacion` |
| **Arquitecto / Backend** | Crea nuevos componentes, define tipos y cálculos | Código + SQL → tabla `componente_contable` |
| **Product Owner** | Decide qué eventos genera el negocio | Define contratos de eventos |
| **Soporte / QA** | Debuguea por qué un asiento no se genera o no cuadra | Endpoint de simulación + logs |

---

## 2. Ciclo de Vida de una Regla

### 2.1 Narrativa: "El contador quiere cambiar la cuenta de ventas"

> **Escenario:** El contador de la empresa peruana RUC-X decide que las ventas de bebidas ya no van a la cuenta `701101` sino a `701201` (nueva subcuenta creada por el contador).

**Lo que NO tiene que pasar:** Que un backend modifique código Java, recompile y redeploy.

**Lo que SÍ pasa:**

```
Paso 1: El contador crea la cuenta 701201 en el plan de cuentas
   → INSERT INTO plan_contable_det (codigo, nombre, es_imputable, ...)
   → El sistema valida: código único, nivel correcto, padre existe

Paso 2: El contador modifica la regla de cuenta
   → Busca en regla_cuenta_componente:
     componente = VENTA, producto_categoria = BEBIDAS
   → Cambia cuenta_id de 701101 a 701201
   → UPDATE regla_cuenta_componente SET cuenta_id = $nueva WHERE id = $regla_id

Paso 3: El sistema valida la consistencia
   → ¿La cuenta 701201 existe y está activa? ✅
   → ¿Es imputable (acepta movimientos)? ✅
   → ¿No hay otra regla con la misma prioridad que pueda entrar en conflicto? ✅

Paso 4: A partir del siguiente evento VENTA_EMITIDA, el motor usa la nueva cuenta
   → 0 código nuevo. 0 deploy. 0 downtime.
```

### 2.2 Narrativa: "Hay que agregar un nuevo impuesto en Colombia"

> **Escenario:** Colombia introduce un nuevo impuesto municipal (ej: "Impuesto al consumo de comida rápida") que debe aparecer como una línea separada en los asientos de ventas. La tasa es 8%.

**Lo que pasa:**

```
Paso 1: Se verifica si existe un componente que represente este rol
   → No existe. Hay que crear el componente.

Paso 2: El backender crea el componente
   → INSERT INTO componente_contable (codigo='IMP_CONSUMO_RAPIDO', tipo='impuesto', 
     posicion=3, direccion='haber')

Paso 3: El contador colombiano (o el configurador) define la activación
   → INSERT INTO regla_activacion (evento='VENTA_EMITIDA', componente_id=IMP_CONSUMO_RAPIDO,
     condicion='{"tipo_establecimiento": "comida_rapida", "pais_id": "COL"}', accion='AGREGAR')

Paso 4: El contador define la cuenta contable
   → INSERT INTO regla_cuenta_componente (pais_id=COL,
     componente_id=IMP_CONSUMO_RAPIDO, cuenta_id=$nueva_cuenta_puc)

Paso 5: Se prueba
   → POST /api/contabilidad/asientos/simular con el payload de prueba
   → Se verifica que el asiento generado incluya la línea del nuevo impuesto
```

**Sin deploy. Sin compilar. Sin tocar el pipeline.** Solo datos nuevos en tablas.

---

## 3. Gestión de Países

### 3.1 Narrativa: "Agregar un nuevo país"

> **Escenario:** El sistema ya tiene Perú, Colombia, Ecuador. Ahora entra México.

**Checklist para agregar México:**

```
□ 1. Insertar país
   INSERT INTO core.pais (codigo='MEX', nombre='México', codigo_moneda='MXN');

□ 2. Cargar plan de cuentas (SAT Mexicano)
   → Insertar cuentas en plan_contable_det (plantilla base del país)

□ 3. Configurar impuestos
   → INSERT INTO tasa_impuesto (pais_id=MEX, codigo='IVA', tasa=16.00, vigente_desde='2026-01-01')
   → INSERT INTO tasa_impuesto (pais_id=MEX, codigo='ISR', ...)
   → INSERT INTO configuracion_fiscal_pais (pais_id=MEX, reglas='{"requiere_cfdi": true}')

□ 4. Cargar reglas de activación (si aplican diferencias con PE)
   → La mayoría de las reglas_activacion son genéricas (pais_id=NULL) y funcionan para todos
   → Solo las específicas de Perú (detracción, percepción) necesitan pais_id=PE

□ 5. Cargar reglas de cuenta para México
   → regla_cuenta_componente para VENTA, IVA, CLIENTE, PROVEEDOR, etc.
   → Usando las cuentas del SAT mexicano

□ 6. Probar con un evento de ejemplo
   → POST /api/contabilidad/asientos/simular { evento: "VENTA_EMITIDA", pais_id: "MEX", ... }
   → Verificar que el asiento use cuentas mexicanas y tasas mexicanas
```

**Tiempo estimado:** 3-5 días hábiles para un país de complejidad media (sin régimen especial complejo).

### 3.2 Diferencia entre reglas genéricas y específicas por país

| Tipo | pais_id | Ejemplo |
|---|---|---|
| **Genérica** | NULL (aplica a todos) | `VENTA` se activa para VENTA_EMITIDA en cualquier país |
| **Específica** | PE, CO, EC, etc. | `DETRACCION` solo se activa para VENTA_EMITIDA en Perú |

El motor evalúa primero las reglas específicas (con `pais_id` match), después las genéricas (`pais_id IS NULL`). Esto permite que un país herede reglas genéricas pero tenga sus propias excepciones.

---

## 4. Gestión de Componentes

### 4.1 ¿Cuándo se crea un nuevo componente?

Se crea un componente nuevo cuando **no existe un rol contable** que represente el concepto. Ejemplos:

| Situación | ¿Nuevo componente? | Por qué |
|---|---|---|
| Perú tiene ICBPER (impuesto bolsas plásticas) | ✅ Sí | No existe componente para este impuesto específico |
| Colombia retiene ICA municipal | ✅ Sí | `RETE_ICA` es distinto de `RETENCION` |
| Nueva tasa de IVA (19% → 21%) | ❌ No | Solo cambiar tasa en `tasa_impuesto`, no nuevo componente |
| Ventas por delivery con recargo | ❌ No | Usar `VENTA` + `CANAL_COMISION` existentes |
| Nuevo tipo de gasto "publicidad digital" | ❌ No | Usar `COMPRA` + categoría de producto específica |

### 4.2 Anatomía de un componente (cómo se crea correctamente)

```sql
-- Ejemplo: crear ICBPER para Perú
INSERT INTO componente_contable (
    codigo, nombre, tipo, posicion, direccion, es_batch
) VALUES (
    'ICBPER',                                 -- código único
    'Impuesto a las Bolsas Plásticas (Perú)', -- nombre descriptivo
    'impuesto',                               -- tipo de cálculo
    3,                                        -- posición: impuestos (junto a IVA)
    'haber',                                  -- dirección: es un pasivo
    false                                     -- no es batch
);

-- Luego:
-- 1. Crear regla_activacion: evento=VENTA_EMITIDA, condicion={"tiene_icbper": true}
-- 2. Crear regla_cuenta_componente: para Perú (pais_id=PE) con la cuenta del PCGE

-- En el cálculo: el payload de VENTA_EMITIDA incluye "icbper_monto": 0.10 por bolsa
-- El motor tipo=impuesto calcula: monto_icbper = cantidad_bolsas × 0.10
```

---

## 5. Gestión de Reglas de Activación

### 5.1 Interfaz conceptual

Las reglas de activación se gestionan mediante:

```sql
-- CRUD básico
SELECT * FROM regla_activacion WHERE evento = 'VENTA_EMITIDA' AND activo = true;

-- Agregar una condición especial para Colombia
INSERT INTO regla_activacion (evento, pais_id, componente_id, condicion, accion, orden)
VALUES (
    'VENTA_EMITIDA', 
    'uuid-colombia',
    (SELECT id FROM componente_contable WHERE codigo = 'RETE_ICA'),
    '{"tipo_establecimiento": "restaurante", "municipio_reteica": true}',
    'AGREGAR',
    40
);
```

### 5.2 Validaciones automáticas al guardar una regla

| Validación | Qué chequea | Qué pasa si falla |
|---|---|---|
| **Componente existe** | `componente_id` existe en `componente_contable` | Rechazar INSERT |
| **No duplicados** | No existe otra regla con mismo evento + condiciones + país | Rechazar INSERT con mensaje |
| **Orden consistente** | No hay dos reglas con el mismo `orden` en el mismo `evento` | Rechazar o reordenar automáticamente |
| **Condición JSON válida** | La condición es JSONB válido y los campos existen en el payload | Rechazar con detalle del error |
| **Acción válida** | `accion` es AGREGAR, REEMPLAZAR u OMITIR | Rechazar |
| **REEMPLAZAR tiene destino** | Si accion=REEMPLAZAR, `componente_reemplazo_id` no es NULL | Rechazar |

### 5.3 Debugging: "El asiento no genera líneas de IVA"

```
Problema: Se emite una VENTA_EMITIDA con afecta_igv=true pero el asiento no tiene línea de IVA.

Diagnóstico:

1. Verificar que el componente IVA existe
   SELECT * FROM componente_contable WHERE codigo = 'IVA';
   → Si no existe: crearlo

2. Verificar que hay una regla de activación para VENTA_EMITIDA + IVA
   SELECT * FROM regla_activacion WHERE evento = 'VENTA_EMITIDA' 
     AND componente_id = (SELECT id FROM componente_contable WHERE codigo = 'IVA')
     AND activo = true;
   → Si no existe: crearla

3. Verificar que la condición matchea el payload
   → condicion = '{"afecta_igv": true}'
   → payload tiene "afecta_igv": true?
   → Si condicion requiere true y el payload tiene false, no se activa

4. Verificar que hay una regla de cuenta para IVA
   SELECT * FROM regla_cuenta_componente WHERE componente_id = (SELECT id FROM componente_contable WHERE codigo = 'IVA')
   → Si no existe: el componente se activa pero no encuentra cuenta → error CUENTA_NO_CONFIGURADA

5. Verificar que la cuenta contable existe y está activa
   SELECT * FROM plan_contable_det WHERE id = $cuenta_id AND activo = true AND es_imputable = true;
```

---

## 6. Gestión de Reglas de Cuenta

### 6.1 Interfaz conceptual

```sql
-- Ver qué cuenta resuelve un componente para un contexto dado
SELECT pcd.codigo, pcd.nombre, rcc.prioridad, rcc.tipo_transaccion
FROM regla_cuenta_componente rcc
JOIN plan_contable_det pcd ON pcd.id = rcc.cuenta_id
WHERE rcc.componente_id = (SELECT id FROM componente_contable WHERE codigo = 'CLIENTE')
ORDER BY rcc.prioridad DESC;

-- Agregar una regla específica para un partner
INSERT INTO regla_cuenta_componente (
    componente_id, partner_tipo, prioridad, cuenta_id
) VALUES (
    (SELECT id FROM componente_contable WHERE codigo = 'CLIENTE'),
    'cliente_vip',           -- este partner_tipo existe en la configuración del partner
    100,                     -- prioridad alta → gana sobre reglas genéricas
    $cuenta_especial_id
);
```

### 6.2 Validaciones automáticas al guardar una regla de cuenta

| Validación | Qué chequea | Qué pasa si falla |
|---|---|---|
| **Cuenta existe** | `cuenta_id` existe en `plan_contable_det` | Rechazar |
| **Cuenta activa** | `plan_contable_det.activo = true` | Rechazar |
| **Cuenta imputable** | `plan_contable_det.es_imputable = true` | Rechazar (no se puede asentar en cuentas padre) |
| **Prioridad única** | No hay dos reglas con misma prioridad para mismo componente | Rechazar o forzar cambio de prioridad |
| **Sin conflicto** | La regla nueva no coincide exactamente en todos los filtros con una existente | Advertir: "¿Confirma que quiere reemplazar la regla existente?" |

### 6.3 Debugging: "La cuenta que se resuelve no es la esperada"

```
Problema: Para el componente CLIENTE, el motor resuelve a 121201 en vez de 121202.

Diagnóstico:

1. Verificar si el partner tiene cuenta específica
   SELECT cuenta_contable_id FROM partner_cliente WHERE partner_id = $partner_id;
   → Si tiene: esa cuenta tiene prioridad máxima. Si no es la esperada, actualizar.

2. Verificar si la categoría del producto tiene cuenta default
   SELECT cuenta_venta_default_id FROM producto_categoria WHERE id = $categoria_id;
   → Si tiene: es la segunda prioridad.

3. Verificar las reglas_cuenta_componente ordenadas por prioridad
   SELECT rcc.*, pcd.codigo FROM regla_cuenta_componente rcc
   JOIN plan_contable_det pcd ON pcd.id = rcc.cuenta_id
   WHERE rcc.componente_id = (SELECT id FROM componente_contable WHERE codigo = 'CLIENTE')
     AND (rcc.pais_id = $pais_id OR rcc.pais_id IS NULL)
   ORDER BY rcc.prioridad DESC;
   → Ver qué regla ganó. Si no es la esperada, ajustar prioridades o filtros.

4. Endpoint de simulación
   POST /api/contabilidad/asientos/simular
   Body: { "evento": "VENTA_EMITIDA", "payload": { ... "partner_id": "X" ... } }
   → Devuelve: asiento generado + trazabilidad de cada resolución
   → Ej: "Componente CLIENTE → regla prioridad=50 → cuenta 121201"
```

---

## 7. APIs de Gestión (Admin)

Estos endpoints están pensados para ser consumidos por una interfaz de administración (UI web) o por scripts de automatización:

### 7.1 Gestión de Componentes

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/admin/componentes` | Listar todos los componentes |
| `GET` | `/api/admin/componentes/{id}` | Detalle de un componente |
| `POST` | `/api/admin/componentes` | Crear un nuevo componente |
| `PUT` | `/api/admin/componentes/{id}` | Actualizar componente (tipo, posición, etc.) |
| `DELETE` | `/api/admin/componentes/{id}` | Desactivar componente (no se elimina, se marca inactivo) |

### 7.2 Gestión de Reglas de Activación

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/admin/reglas-activacion?evento=VENTA_EMITIDA` | Listar reglas por evento |
| `POST` | `/api/admin/reglas-activacion` | Crear regla |
| `PUT` | `/api/admin/reglas-activacion/{id}` | Actualizar condición, acción, orden |
| `DELETE` | `/api/admin/reglas-activacion/{id}` | Desactivar regla |
| `POST` | `/api/admin/reglas-activacion/validar` | Validar condición contra un payload de prueba |

### 7.3 Gestión de Reglas de Cuenta

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/admin/reglas-cuenta?componente=CLIENTE` | Listar reglas por componente |
| `POST` | `/api/admin/reglas-cuenta` | Crear regla |
| `PUT` | `/api/admin/reglas-cuenta/{id}` | Cambiar cuenta, prioridad, filtros |
| `DELETE` | `/api/admin/reglas-cuenta/{id}` | Desactivar regla |
| `POST` | `/api/admin/reglas-cuenta/simular` | Simular qué cuenta se resolvería para un contexto dado |

### 7.4 Simulación y Debugging

| Método | Endpoint | Propósito |
|---|---|---|
| `POST` | `/api/admin/asientos/simular` | Ejecuta pipeline hasta paso 6 (VALIDAR) sin persistir. Devuelve asiento borrador + trazabilidad de cada resolución |
| `POST` | `/api/admin/asientos/trazar` | Igual que simular pero además devuelve el detalle de cada decisión: "Componente X se activó por regla Y, condición Z → cuenta W" |
| `GET` | `/api/admin/asientos/{id}/trazabilidad` | Dado un asiento ya contabilizado, muestra la cadena de decisiones que lo generó |

### 7.5 Gestión de Países

| Método | Endpoint | Propósito |
|---|---|---|
| `GET` | `/api/admin/paises` | Listar países configurados |
| `POST` | `/api/admin/paises` | Agregar nuevo país |
| `GET` | `/api/admin/paises/{id}/configuracion` | Ver configuración fiscal del país |
| `GET` | `/api/admin/paises/{id}/cobertura` | Ver qué reglas, componentes y cuentas están configurados para este país |

---

## 8. Migración de Reglas: Cuando Cambia un Plan de Cuentas

### 8.1 Escenario: "El PCGE se actualiza (cuentas nuevas, cuentas obsoletas)"

```
Situación: SUNAT emite una nueva versión del PCGE. La cuenta 42102101 se reemplaza por 42102102.

Proceso:

1. Crear la nueva cuenta
   INSERT INTO plan_contable_det (codigo='42102102', nombre='Facturas por pagar MN v2', ...)

2. Actualizar reglas de cuenta
   UPDATE regla_cuenta_componente SET cuenta_id = $nueva
   WHERE cuenta_id = $vieja;

3. Verificar que ningún componente quede sin cuenta
   SELECT * FROM regla_cuenta_componente WHERE cuenta_id = $vieja;
   → 0 filas = todas migradas ✅

4. Desactivar la cuenta vieja
   UPDATE plan_contable_det SET activo = false WHERE id = $vieja;

5. Probar con simulación
   POST /api/admin/asientos/simular → ¿sigue funcionando? ✅
```

### 8.2 Rollback de una regla

Si un cambio de regla produce resultados incorrectos:

```sql
-- Guardar el estado anterior antes de modificar (trigger automático en auditoria_asiento)
INSERT INTO auditoria_asiento (tabla_afectada, registro_id, accion, datos_antes)
VALUES ('regla_cuenta_componente', $id, 'MODIFICACION', 
        row_to_json(OLD));

-- Rollback: restaurar desde auditoría
UPDATE regla_cuenta_componente SET cuenta_id = $cuenta_anterior
WHERE id = $id;
```

---

## 9. Estrategia de Versionado de Reglas

### 9.1 ¿Necesitamos versionado?

Para el MVP, **no**. Las reglas son configuración viva: se cambian y los nuevos asientos usan las reglas vigentes. Los asientos históricos ya están contabilizados con las reglas de su momento.

Si en el futuro se necesita recontabilizar el pasado (por cambio de normativa con efecto retroactivo), se implementa:

```sql
-- Versión futura: agregar vigencia a las reglas
ALTER TABLE regla_cuenta_componente ADD COLUMN vigente_desde DATE NOT NULL DEFAULT '2026-01-01';
ALTER TABLE regla_cuenta_componente ADD COLUMN vigente_hasta DATE;

-- El motor filtra por la fecha del evento:
WHERE (vigente_hasta IS NULL OR vigente_hasta >= $fecha_evento)
  AND vigente_desde <= $fecha_evento;
```

### 9.2 Para el MVP: reglas sin vigencia

En la primera versión, las reglas no tienen fecha de vigencia. Esto simplifica la implementación y la UI. El versionado se agrega después si es necesario.

---

## 10. Resumen: Lo que Puede Hacer Cada Rol Sin Backend

| Acción | Lo hace el contador/configurador (UI/SQL) | Requiere backend |
|---|---|---|
| Crear cuenta contable nueva | ✅ `INSERT INTO plan_contable_det` | ❌ |
| Cambiar cuenta de un componente | ✅ `UPDATE regla_cuenta_componente` | ❌ |
| Activar/desactivar un componente | ✅ `UPDATE regla_activacion SET activo` | ❌ |
| Agregar regla de activación nueva | ✅ `INSERT INTO regla_activacion` | ❌ |
| Agregar regla de cuenta nueva | ✅ `INSERT INTO regla_cuenta_componente` | ❌ |
| Cambiar tasa de impuesto | ✅ `UPDATE tasa_impuesto` | ❌ |
| Agregar nuevo país | ✅ (con datos fiscales) | ❌ |
| **Crear componente nuevo** | ❌ (requiere entender tipo/posición/cálculo) | ✅ Una vez + documentación |
| **Modificar el pipeline** (pasos 1-10) | ❌ | ✅ Siempre |
| **Agregar nuevo evento** (cambiar contrato) | ❌ | ✅ Una vez + documentación |

El objetivo es que el **90% de los cambios del día a día** (cambiar cuentas, ajustar reglas, configurar países) los haga el contador/configurador **sin intervención del equipo backend**.

---

## 11. Glosario Operativo

| Término | Significado para el configurador |
|---|---|
| **Componente** | Un rol contable (VENTA, CLIENTE, IVA). No es una cuenta. |
| **Regla de activación** | "Si pasa X evento y se cumple Y condición, usá este componente" |
| **Regla de cuenta** | "Para este componente en esta empresa, usá esta cuenta contable" |
| **Prioridad** | Número que define qué regla gana cuando varias aplican. Más alto = más específico. |
| **Fallback** | Si no hay regla específica, el motor prueba con reglas más generales. |
| **Evento** | Algo que pasó en el negocio (se vendió, se compró, se pagó). |
| **Payload** | Los datos del evento (quién, cuánto, cuándo, dónde). |
| **Simulación** | Probar un evento sin persistir el asiento. Sirve para verificar que las reglas están bien. |
