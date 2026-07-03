# Motor de Asientos v2 — Documentación Completa

**Versión:** 1.0  
**Proyecto:** restpe-contabilidad-back-end  
**Países:** Perú · Colombia · Ecuador  
**Estrategia:** Big Bang (sin clientes en producción)

---

## Cómo usar esta documentación

| Si querés... | Empezá por... |
|---|---|
| Entender el QUÉ y POR QUÉ | `01-VISION.md` |
| Entender los conceptos del nuevo motor | `02-CONCEPTOS.md` |
| Ver la arquitectura técnica (pipeline, endpoints) | `03-ARQUITECTURA.md` |
| Ver el esquema de base de datos (DDL) | `04-ESQUEMA_DATOS.md` |
| Saber qué eventos y payloads existen | `05-CATALOGO_EVENTOS.md` |
| Saber qué componentes (roles) existen | `06-CATALOGO_COMPONENTES.md` |
| Saber qué activa cada componente | `07-REGLA_ACTIVACION.md` |
| Saber cómo se resuelven las cuentas | `08-REGLA_CUENTA.md` |
| Planificar la implementación | `09-PLAN_IMPLEMENTACION.md` |
| Entender cómo se gestionan las reglas en el día a día | `10-GESTION_REGLAS.md` |
| Ver qué tablas se salvan, cuáles se crean y cuáles se deprecan | `11-REVISION_COMPLETA.md` |
| Planificar la implementación | `09-PLAN_IMPLEMENTACION.md` |
| Ver el análisis de tablas (salvar vs crear vs deprecar) | `11-REVISION_COMPLETA.md` |

---

## Índice de Documentos

| # | Documento | Descripción | Archivo |
|---|---|---|---|
| 00 | **INDEX** | Este documento | `INDEX.md` |
| 01 | **Visión General** | Estado actual, problemas, enfoque de solución, cobertura objetivo | [`01-VISION.md`](01-VISION.md) |
| 02 | **Conceptos Fundamentales** | Evento, componente, regla de activación, regla de cuenta, asiento | [`02-CONCEPTOS.md`](02-CONCEPTOS.md) |
| 03 | **Arquitectura** | Pipeline de 10 pasos, multi-tenant, multi-país, multi-moneda, inmutabilidad, backend Java | [`03-ARQUITECTURA.md`](03-ARQUITECTURA.md) |
| 04 | **Esquema de Datos** | Mapeo tablas v1→v2, DDL conceptual de todas las tablas (nuevas y adaptadas), relaciones | [`04-ESQUEMA_DATOS.md`](04-ESQUEMA_DATOS.md) |
| 05 | **Catálogo de Eventos** | ~40 eventos con payload, componentes activos, patrón de asiento, efectos secundarios | [`05-CATALOGO_EVENTOS.md`](05-CATALOGO_EVENTOS.md) |
| 06 | **Catálogo de Componentes** | ~80 roles contables con tipo, posición, dirección, cálculo, resolución | [`06-CATALOGO_COMPONENTES.md`](06-CATALOGO_COMPONENTES.md) |
| 07 | **Reglas de Activación** | Matriz completa evento→componente con condiciones JSONB | [`07-REGLA_ACTIVACION.md`](07-REGLA_ACTIVACION.md) |
| 08 | **Resolución de Cuentas** | Fallback progresivo, cadena por componente, ejemplos por país, algoritmo SQL | [`08-REGLA_CUENTA.md`](08-REGLA_CUENTA.md) |
| 09 | **Plan de Implementación** | 5 fases, tareas, timeline, equipo, riesgos, hitos | [`09-PLAN_IMPLEMENTACION.md`](09-PLAN_IMPLEMENTACION.md) |
| 10 | **Gestión de Reglas** | Narrativa operativa: cómo agregar un país, cambiar una regla, debuguear, simular, qué puede hacer cada rol sin backend | [`10-GESTION_REGLAS.md`](10-GESTION_REGLAS.md) |
| 11 | **Revisión Completa** | Análisis definitivo tabla por tabla: salvar (ALTER in-place), mantener as-is, crear nuevas, deprecar legacy. Con dependencias de FKs y tareas paralelizables. | [`11-REVISION_COMPLETA.md`](11-REVISION_COMPLETA.md) |

---

## Resumen Ejecutivo

### Problema
El motor actual usa matrices fijas (709 matrices, 90% con fórmulas ignoradas), está hardcodeado para Perú (`PAIS_PERU_ID = 1L`), no soporta IVA automático, y solo cubre ~19% de los escenarios contables necesarios.

### Solución
Motor basado en **componentes** (roles contables atómicos) con **activación dinámica** por evento + condiciones, **resolución de cuentas** por reglas con fallback progresivo, y **pipeline de 10 pasos** que reemplaza 14 endpoints específicos por 1 genérico.

### Multi-país
País es **dato**, no código. Cada país tiene su configuración en tablas: `regla_cuenta_componente`, `tasa_impuesto`, `cuenta_contable`, `configuracion_fiscal_pais`. No hay `if (pais == "PE")` en el código del motor.

### Tablas
| Acción | Cantidad |
|---|---|
| Tablas nuevas | `componente_contable`, `regla_activacion`, `regla_cuenta_componente`, `auditoria_asiento`, `posicion_fiscal`, `posicion_fiscal_regla`, `tasa_impuesto`, `configuracion_fiscal_pais` |
| Tablas adaptadas (ALTER) | `plan_contable_det`, `cntbl_asiento`, `cntbl_asiento_det`, `cntbl_libro`, `cntbl_cierre`, `numerador_asiento`, `cntbl_preasiento`, `cntbl_preasiento_det`, `centros_costo`, `concepto_financiero` |
| Tablas deprecadas | `matriz_contable`, `matriz_contable_det`, `grupo_matriz_cntbl` |

### Timeline estimado
**10-14 semanas** con 2 backends dedicados.

### Dependencia clave
Esta documentación se complementa con:
- `GAP_MOTOR_ASIENTOS_VS_MANUAL.md` — gap analysis del motor actual vs Manual Contable
- `Manual_Contable_Financiero.md` — el manual funcional completo (Partes 1-8)
- Proyecto `beta/` — referencia conceptual del motor de componentes

---

## Convenciones

- `PE` = Perú, `CO` = Colombia, `EC` = Ecuador
- `PCGE` = Plan Contable General Empresarial (Perú)
- `PUC` = Plan Único de Cuentas (Colombia)
- `SRI` = Servicio de Rentas Internas (Ecuador)
- `CxC` = Cuentas por Cobrar
- `CxP` = Cuentas por Pagar
- `TC` = Tipo de Cambio
