# Comparativo de Cobertura — CSV vs Casos de Prueba Frontend vs Casos por Módulo

> **Fuente CSV:** `Listado de funcionalidades y flujos por probar por sprint - Hoja 1.csv`
>
> **Fuente MD:** `CASOS_PRUEBA_FRONTEND_POR_SPRINT.md` (165 casos, 27 HU trazadas)
>
> **Fuente CSVs por Módulo 🆕:** `CASOS POR MODULO - COMPRAS.csv` (60 casos) + `CASOS POR MODULO - VENTAS.csv` (49 casos)
>
> **Fuente Motor v2 🆕:** `01-VISION.md` a `05-CATALOGO_EVENTOS.md` (33 eventos, 79 componentes)
>
> **Fecha:** 17/06/2026 — **Actualizado:** 03/07/2026

---

## Resumen

| Sprint | Items CSV | Cubiertos en MD | + Casos Módulo 🆕 | Gaps | % Cobertura MD |
|--------|----------:|:----------------:|:-----------------:|:----:|:--------------:|
| S1 | 14 items + 3 E2E | 51 CP (todos cubiertos) | +109 (Compras 60 + Ventas 49) | Ninguno en MD, 15 en CSVs 🆕 | 100% MD |
| S2 | 18 items + 3 E2E | 25 CP (#36 no cubierto) | — | **#36** | ~95% |
| S3 | 17 items + 3 E2E | 33 CP (todos cubiertos) | — | Ninguno | 100% |
| S4 | 14 items + 4 E2E | 56 CP (todos cubiertos) | — | Ninguno | 100% |
| **Total** | **63 items + 13 E2E** | **165 CP** | **+109 CP** | **1 item MD + 15 gaps CSV** 🆕 | **~98%** |

---

## Detalle por Sprint

### Sprint 1 — Módulo Compras + Maestros Core + Finanzas Base

| # CSV | Funcionalidad | Cubierto | CP(s) asociados |
|:-----:|:---|---:|:---|
| 1 | Maestro Proveedores — Ficha | ✅ | CP-S1-001 al 008 |
| 2 | OC — Crear, líneas, numeración, PDF | ✅ | CP-S1-009 al 016 |
| 3 | Aprobación de OC | ✅ | CP-S1-017 al 022 |
| 4 | OS — Generación | ✅ | CP-S1-023, 024 |
| 5 | OS — Aprobación + Acta | ✅ | CP-S1-025 |
| 6 | CxP — Registro factura | ✅ | CP-S1-026 al 032 |
| 7 | NC/ND CxP | ✅ | CP-S1-033 al 038 |
| 8 | DPD Individual | ✅ | CP-S1-039 |
| 9 | Reporte gestión compras | ✅ | CP-S1-040, 041 |
| 10 | Registro Ventas SUNAT | ✅ | CP-S1-042 |
| 11 | Reporte Tributario | ✅ | CP-S1-043 |
| 15 | CRUD Cuenta Bancaria | ✅ | CP-S1-044 |
| 16 | CRUD Medios de Pago | ✅ | CP-S1-045 |
| 17 | CRUD Formas de Pago | ✅ | CP-S1-046 |
| 33 | CRUD Tipo de Cambio | ✅ | CP-S1-047, 048 |
| E2E-1 | Compras E2E | ✅ | CP-S1-E2E-01 |
| E2E-2 | Ventas Reportes | ✅ | CP-S1-E2E-02 |
| E2E-3 | Finanzas Base | ✅ | CP-S1-E2E-03 |

### Sprint 2 — Módulo Finanzas + Contabilidad

| # CSV | Funcionalidad | Cubierto | CP(s) asociados |
|:-----:|:---|---:|:---|
| 12 | Tipos de Documento | ✅ | CP-S2-001 |
| 13 | Conceptos Financieros | ✅ | CP-S2-002 |
| 14 | Grupos + Conceptos Flujo Caja | ✅ | CP-S2-003 |
| 18 | OG — Creación | ✅ | CP-S2-004, 006 |
| 19 | OG — Aprobación | ✅ | CP-S2-005 |
| 20 | Rendición de Gastos | ✅ | CP-S2-007 |
| 21 | Aprobación Rendición | ✅ | CP-S2-008 |
| 22 | Cierre Liquidación | ✅ | CP-S2-009 |
| 23 | Cartera de Pagos | ✅ | CP-S2-010 |
| 24 | Cartera de Cobros | ✅ | CP-S2-011 |
| 25 | Aplicación Documentos | ✅ | CP-S2-012 |
| 26 | Anulación Cartera | ✅ | CP-S2-013 |
| 27 | Transferencias | ✅ | CP-S2-014 |
| 28 | Plan Contable | ✅ | CP-S2-015 |
| 29 | Centros de Costo | ✅ | CP-S2-016 |
| 30 | Matriz Contable | ✅ | CP-S2-017 |
| 31 | Detracciones/Retenciones | ✅ | CP-S2-018 |
| 32 | Impuestos | ✅ | CP-S2-019 |
| 34 | UIT | ✅ | CP-S2-020 |
| 35 | Formato 5.2 Libro Diario | ✅ | CP-S2-021 |
| **36** | **Formatos SUNAT básicos** | **❌** | **No cubierto** |
| 37 | PLE — Libros Electrónicos | ✅ | CP-S2-022 |
| E2E-1 | Adelantos → Tesorería | ✅ | CP-S2-E2E-01 |
| E2E-2 | Cartera CxC | ✅ | CP-S2-E2E-02 |
| E2E-3 | Contabilidad + PLE | ✅ | CP-S2-E2E-03 |

### Sprint 3 — Activos Fijos + RR.HH (Inicio)

| # CSV | Funcionalidad | Cubierto | CP(s) asociados |
|:-----:|:---|---:|:---|
| 38 | Maestro Activos Fijos | ✅ | CP-S3-001 al 005 |
| 39 | Parámetros Operaciones | ✅ | CP-S3-006 |
| 40 | Incidencias | ✅ | CP-S3-007 |
| 41 | Aseguradoras | ✅ | CP-S3-008 |
| 42 | Clasificación Activos | ✅ | CP-S3-009, 010 |
| 43 | Operaciones Especiales | ✅ | CP-S3-011, 012 |
| 44 | Baja de Activos | ✅ | CP-S3-013 al 015 |
| 45 | Revaluación | ✅ | CP-S3-017, 018 |
| 46 | Ratios Depreciación | ✅ | CP-S3-016 |
| 47 | Resumen Activo Fijo | ✅ | CP-S3-023 |
| 48 | Depreciación Anual | ✅ | CP-S3-024 |
| 49 | Cálculo Depreciación | ✅ | CP-S3-019 |
| 50 | Asientos Depreciación | ✅ | CP-S3-020 |
| 51 | Asientos Revaluación | ✅ | CP-S3-021 |
| 52 | Devengo Aseguradoras | ✅ | CP-S3-022 |
| 53 | Parámetros Fechas | ✅ | CP-S3-025 |
| 54 | Remuneración Mínima | ✅ | CP-S3-026 |
| 55 | Parámetros Control | ✅ | CP-S3-027 |
| 56 | Datos Personales | ✅ | CP-S3-028, 029 |
| 58 | Categorías/Cargos | ✅ | CP-S3-030 |
| E2E-1 | AF E2E | ✅ | CP-S3-E2E-01 |
| E2E-2 | Revaluación | ✅ | CP-S3-E2E-02 |
| E2E-3 | RRHH Maestros | ✅ | CP-S3-E2E-03 |

### Sprint 4 — RR.HH Completo

| # CSV | Funcionalidad | Cubierto | CP(s) asociados |
|:-----:|:---|---:|:---|
| 57 | Tipo Contrato | ✅ | CP-S4-001 |
| 59 | AFP y EPS | ✅ | CP-S4-002 |
| 60 | Calendario Feriados | ✅ | CP-S4-003 |
| 61 | Asistencia + HE | ✅ | CP-S4-004, 005 |
| 63 | Vacaciones | ✅ | CP-S4-006, 007 |
| 64 | Conceptos Fijos | ✅ | CP-S4-008 al 014 |
| 65 | Conceptos Variables | ✅ | CP-S4-015 al 018 |
| 66 | Propinas | ✅ | CP-S4-019 al 023 |
| 67 | Recargo al Consumo | ✅ | CP-S4-024 al 028 |
| 68 | Cuenta Corriente | ✅ | CP-S4-029 al 033 |
| 69 | Cálculo Planilla | ✅ | CP-S4-034 al 039 |
| 70 | Liquidaciones | ✅ | CP-S4-040 al 047 |
| 71 | Gratificación + CTS | ✅ | CP-S4-048, 049 |
| 72 | Saldos CC | ✅ | CP-S4-050 |
| 73 | Boletas de Pago | ✅ | CP-S4-051 |
| E2E-1 | Asistencia → Planilla → Boletas | ✅ | CP-S4-E2E-01 |
| E2E-2 | Recargo → Aportes → Planilla | ✅ | CP-S4-E2E-02 |
| E2E-3 | Adelantos → Planilla → Reporte | ✅ | CP-S4-E2E-03 |
| E2E-4 | Liquidación + Cierre | ✅ | CP-S4-E2E-04 |

---

## Cobertura Casos por Módulo 🆕

### CSV Compras (60 casos)

| Nivel | Cantidad | Soporte | Observación |
|:------|:--------:|:-------:|:------------|
| Fácil | 20 | ✅ 14, ⚠️ 6 | Caja chica, pago parcial, pago mixto no soportados |
| Medio | 27 | ✅ 16, ⚠️ 8, ❌ 3 | Anticipo sin doc, tarjeta crédito, caja chica |
| Complejo | 13 | ✅ 4, ⚠️ 4, ❌ 5 | Importación, diferencia cambio, gasto anticipado, prorrata IGV |
| **Total** | **60** | **✅ 34, ⚠️ 18, ❌ 8** | **57% soporte completo** |

### CSV Ventas (49 casos)

| Nivel | Cantidad | Soporte | Observación |
|:------|:--------:|:-------:|:------------|
| Fácil | 10 | ✅ 10 | Efectivo, Yape, Plin, tarjeta, exonerado |
| Medio | 23 | ✅ 18, ⚠️ 5 | Liquidación, gift card, delivery, anticipo |
| Complejo | 16 | ✅ 8, ⚠️ 5, ❌ 3 | Detracción cliente, multi-sucursal, importación |
| **Total** | **49** | **✅ 36, ⚠️ 10, ❌ 3** | **73% soporte completo** |

---

## Cobertura Motor de Asientos v2 🆕

| Módulo | Eventos documentados | Estado motor v1 | Objetivo v2 |
|:-------|:--------------------:|:---------------:|:-----------:|
| Compras | 5 | ~19% (3/16 escenarios) | 100% |
| Ventas | 8 | ~30% | 100% |
| Tesorería | 12 | ~25% | 100% |
| Activos Fijos | 7 | ~40% | 100% |
| Planillas | 6 | ~0% | 100% |
| Inventario | 6 | ~0% | 100% |
| Extornos/Contab. | 1 | ~0% | 100% |

**Cobertura actual del motor v1: ~19%. Objetivo v2: 100% (33 eventos).**

---

## Gaps Identificados (Actualizado) 🆕

### Item #36 — Formatos SUNAT básicos (existente)

| Campo | Detalle |
|-------|---------|
| **CSV** | `[REPORTES] Contabilidad > Formatos SUNAT (formatos básicos)` — Generar reporte SUNAT (`sp_generar_reporte_sunat`) |
| **MD** | No cubierto explícitamente. |
| **Acción** | Se incluirá en el archivo Gherkin como caso faltante. |

### Gaps CSVs Compras 🆕

| # | Gap | Severidad |
|---|-----|:---------:|
| 1 | Pantalla de Caja Chica no existe (creación, rendición, reposición) | 🔴 Crítica |
| 2 | Pago parcial de factura (solo pago total) | 🟡 Alta |
| 3 | Pago mixto (efectivo + transferencia en misma factura) | 🟡 Alta |
| 4 | Pago con tarjeta de crédito corporativa | 🟡 Alta |
| 5 | Anticipo a proveedor sin documento asociado | 🟡 Alta |
| 6 | Registro de flete como línea separada en factura | 🟡 Alta |
| 7 | Rendición con reembolso de exceso | 🟡 Alta |
| 8 | Importación con DAM/DUA e IGV importación | 🟡 Alta |
| 9 | Diferencia de cambio en pago de factura ME | 🟡 Alta |
| 10 | Gasto anticipado con devengo mensual | 🟢 Media |
| 11 | IGV prorrata (parcialmente recuperable) | 🟢 Media |
| 12 | Compra centralizada multi-sucursal | 🟢 Media |

### Gaps CSVs Ventas 🆕

| # | Gap | Severidad |
|---|-----|:---------:|
| 13 | Factura con detracción del cliente | 🟡 Alta |
| 14 | Venta mixta cobro/crédito | 🟡 Alta |
| 15 | Venta con múltiples medios de pago en mismo ticket | 🟡 Alta |

---

## Observaciones Adicionales

1. **SP names faltantes en MD**: El CSV referencia SPs específicos que el MD no menciona (ej. `fn_obtener_tipo_cambio`, `sp_generar_reporte_compras`, `sp_generar_pago_remuneraciones`). El Gherkin sí los incluirá para trazabilidad.

2. **Numeración duplicada**: El MD tiene 2 casos con CP-S4-046 (boletas y visualización moneda) — error menor de numeración.

3. **Validaciones CSV no explicitadas en MD**: Algunas validaciones que el CSV pide probar no tienen un CP dedicado (ej. "TC automático vía `fn_obtener_tipo_cambio` en pantallas que lo usen").

4. 🆕 **Casos por Módulo exceden el scope original**: Los CSVs de Compras (60) y Ventas (49) cubren escenarios contables completos con asientos manuales de referencia. El MD original solo cubría la validación funcional del frontend. Estos 109 casos requieren validación tanto de UI como de precisión contable del asiento resultante.

5. 🆕 **Motor v2 redefine la cobertura**: El motor actual (v1) cubre ~19% de escenarios de compra. El motor v2 objetivo cubre 100% con 33 eventos. La automatización E2E deberá verificar que el asiento generado coincide con el esperado según los CSVs.

6. 🆕 **Multi-país no cubierto**: Ningún CP existente considera variaciones por país (PE vs CO vs EC). Las tasas de IVA, cuentas contables y reglas fiscales difieren. Se requieren CPs específicos por país.

7. 🆕 **Usuario QA bloqueado**: Los bugs #006 y #010 impiden probar ~30% de los flujos de Compras. Sin permisos COM-002 y COM-022, los E2E de OC y Aprobación no son ejecutables.
