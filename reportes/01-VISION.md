# Visión General — Motor de Asientos v2

**Versión:** 1.0  
**Fecha:** 2026-06-30  
**Proyecto:** restpe-contabilidad-back-end  
**Países objetivo:** Perú (PE) · Colombia (CO) · Ecuador (EC)

---

## 1. Estado Actual del Motor

### 1.1 Arquitectura existente

El motor actual usa una arquitectura de **matriz fija**:

```
Documento operativo (CxP, Caja, etc.)
  → concepto_financiero (catalogo de conceptos)
    → matriz_contable (plantilla de asiento)
      → matriz_contable_det (2 líneas fijas: D/H mismo monto)
        → cntbl_asiento + cntbl_asiento_det
```

### 1.2 Problemas identificados

| Problema | Impacto | Evidencia |
|---|---|---|
| **Un solo país** | No escala a CO/EC | `PAIS_PERU_ID = 1L` hardcodeado, columnas `cnta_cntbl_sunat`, `importe_sol/dol` |
| **Mismo monto en D y H** | No soporta IVA + gasto + contrapartida | 709 matrices, 362 de 2 líneas con mismo importe |
| **Fórmulas no evaluadas** | 982/1093 líneas ignoradas | `generarLineasDesdeConcepto()` nunca llama a `getFormula()` |
| **IVA roto** | Impuestos no se generan | 42 registros en `core.tipos_impuesto` con `plan_contable_det_id = NULL` |
| **Cobertura 19%** | 11/16 escenarios de compra rotos | Ver `GAP_MOTOR_ASIENTOS_VS_MANUAL.md` |
| **Sin extornos** | NC/ND sin trazabilidad | No existe `asiento_original_id` |
| **14 endpoints específicos** | Mantenimiento costoso | 1 endpoint por tipo de operación |

### 1.3 Causa raíz

El motor actual fue diseñado para un modelo contable **simple** (2 líneas por concepto, sin IVA automático, sin roles). La matriz contable era una solución válida para Perú básico pero **no fue diseñada** para:

- Múltiples países con planes de cuenta distintos
- Múltiples líneas con montos variables por línea
- Evaluación de fórmulas para calcular base imponible vs impuesto
- Eventos que generan múltiples asientos (compra + inventario)
- Roles abstractos que se resuelven según contexto

---

## 2. El Nuevo Motor: Component-Based Engine

### 2.1 Principio fundamental

> **Ningún módulo operativo conoce un número de cuenta.**  
> Los módulos describen eventos. El motor resuelve cuentas mediante reglas configurables.

### 2.2 Cambio de paradigma

| Aspecto | Motor Actual (v1) | Motor Nuevo (v2) |
|---|---|---|
| **Input** | `conceptoFinancieroId` + `monto` | `evento` + `payload` con contexto completo |
| **Resolución** | Matriz fija por concepto | Reglas de activación → componentes → reglas de cuenta |
| **Montos** | Mismo importe en todas las líneas | Calculados por tipo de componente (base/impuesto/total) |
| **Líneas** | Fijas (2 por matriz) | Dinámicas (N componentes activos) |
| **País** | Hardcodeado (`PAIS_PERU_ID = 1L`) | Dato en tabla `pais`, discriminado por tenant DB (1 BD por empresa) |
| **Extornos** | No existen | `asiento_original_id` + asiento de reversión |
| **Endpoints** | 14 específicos | 1 genérico (`POST /procesar-evento`) |
| **Fórmulas** | Texto decorativo en BD | Motor calcula base/impuesto/total |

### 2.3 Pipeline de 10 pasos

```
Evento + Payload
    │
    ▼
┌─ 1. RECIBIR ──────────────────────┐  Validar payload contra esquema del evento
└───────────────────────────────────┘
    │
    ▼
┌─ 2. EVALUAR REGLAS ───────────────┐  regla_activacion → componentes activos
└───────────────────────────────────┘
    │
    ▼
┌─ 3. RESOLVER CUENTAS ─────────────┐  regla_cuenta_componente → cuenta_id
└───────────────────────────────────┘
    │
    ▼
┌─ 4. CALCULAR MONTOS ──────────────┐  Según tipo de componente (ingreso/impuesto/contrapartida)
└───────────────────────────────────┘
    │
    ▼
┌─ 5. ORDENAR Y POSICIONAR ─────────┐  Terceros → Base → Impuestos → Puente → Ajuste
└───────────────────────────────────┘
    │
    ▼
┌─ 6. VALIDAR ──────────────────────┐  Debe=Haber, cuentas activas, periodo abierto
└───────────────────────────────────┘
    │
    ▼
┌─ 7. PERSISTIR ────────────────────┐  INSERT asiento + detalle en TX
└───────────────────────────────────┘
    │
    ▼
┌─ 8. EFECTOS SECUNDARIOS ──────────┐  Crear CxC/CxP, actualizar kárdex, presupuesto
└───────────────────────────────────┘
    │
    ▼
┌─ 9. EMITIR EVENTO SALIDA ─────────┐  AsientoContabilizado, CompraContabilizada...
└───────────────────────────────────┘
    │
    ▼
┌─ 10. EXPORTAR REPORTES ───────────┐  Mapeo → serializer → autoridad (SUNAT/DIAN/SRI)
└───────────────────────────────────┘
```

---

## 3. Multi-País: País es Dato, No Código

### 3.1 Mecanismos de parametrización

1. **Tenant DB como frontera** — cada empresa tiene su propia base de datos, no se necesita `empresa_id` en las tablas
2. **`pais_id`** en tablas de configuración (tributos, comprobantes, reglas)
3. **Posiciones fiscales** para operaciones cross-border (sucursal país A, partner país B)

### 3.2 Misma transacción, distintos países

**Compra de consultoría por 1,000 moneda local:**

| | Perú (PCGE) | Colombia (PUC) | Ecuador (SRI) |
|---|---|---|---|
| Impuesto | IVA 18% → 180 | IVA 19% → 190 | IVA 15% → 150 |
| Cuenta gasto | 63 Servicios | 6210 Servicios informática | 63 Servicios |
| Cuenta IVA | 40111 IVA CF | 240801 IVA descontable | 4011 IVA CF |
| Cuenta proveedor | 421 Proveedores | 451 Proveedores | 421 Proveedores |

**Mismo código. Cambian los datos en `regla_cuenta_componente`.**

---

## 4. Cobertura Objetivo

| Módulo | Escenarios | Estado actual | Objetivo v2 |
|---|---|---|---|
| **Compras** | 16 escenarios (§4.2.4 Manual) | ~19% (3/16) | 100% |
| **Ventas** | Venta contado/crédito, NC/ND, agregadores, anticipos | ~30% | 100% |
| **Tesorería** | Pagos, cobros, transferencias, detracciones, caja chica | ~25% | 100% |
| **Activos fijos** | Compra, depreciación, baja, revaluación | ~40% | 100% |
| **Planillas** | Devengo, pago, provisiones | ~0% | 100% |
| **Producción** | Consumo, producto terminado, merma | ~0% | 100% |

---

## 5. Principios de Diseño

1. **Inmutabilidad contable**: asientos contabilizados no se editan ni borran — se extornan
2. **Idempotencia**: mismo evento no genera asientos duplicados (clave `origen + origen_id` — el tenant DB ya aísla por empresa)
3. **Trazabilidad**: cada asiento sabe de qué evento nació; cada evento sabe qué asiento generó
4. **País como dato**: cero `if (pais == "PE")` en el código del motor
5. **Rol antes que cuenta**: los módulos describen roles (CLIENTE, VENTA, IVA), el motor resuelve cuentas
6. **Un evento → N asientos**: una compra puede generar asiento de gasto + asiento de inventario

---

## 6. Impacto en el Código Existente

| Componente | Cambio |
|---|---|
| `GenerarAsientoServiceImpl.java` | **Reemplazar** por pipeline de 10 pasos |
| `GenerarPreasientoServiceImpl.java` | **Mantener** para batch (planillas) o reemplazar |
| `AsientoController.java` / `GenerarAsientoController.java` | **Unificar** en 1 endpoint genérico |
| `PlanContableDetServiceImpl.java` | **Eliminar** lógica Peru-specific (`PAIS_PERU_ID`) |
| `CntblAsiento.java` / `CntblAsientoDet.java` | **Adaptar** entidades JPA |
| `MatrizContableServiceImpl.java` | **Deprecar** (solo consulta histórica) |
| Feign clients (`ContabilidadClient.java`) | **Adaptar** payload a nuevo formato de eventos |

---

## 7. Próximos Pasos

Este documento es la visión general. Los siguientes documentos detallan cada aspecto:

| Documento | Contenido |
|---|---|
| `02-CONCEPTOS.md` | Conceptos fundamentales del motor de componentes |
| `03-ARQUITECTURA.md` | Pipeline, multi-país, multi-moneda, inmutabilidad |
| `04-ESQUEMA_DATOS.md` | Tablas, columnas, relaciones, DDL conceptual |
| `05-CATALOGO_EVENTOS.md` | Catálogo de eventos con payloads |
| `06-CATALOGO_COMPONENTES.md` | Los ~80 roles contables |
| `07-REGLA_ACTIVACION.md` | Matriz de activación por evento + condiciones |
| `08-REGLA_CUENTA.md` | Resolución de cuentas con fallback progresivo |
| `09-PLAN_IMPLEMENTACION.md` | Fases, tareas, timeline, equipo |
| `11-REVISION_COMPLETA.md` | Revisión completa de tablas: salvar vs crear vs deprecar |
