# MATRIZ DE TRAZABILIDAD COMPLETA — RestPE Contabilidad

> **Línea base:** 03/07/2026  
> **Alcance:** Sprints 1–4, 9 módulos, 33 eventos, 79 componentes, 380+ casos  
> **Leyenda cobertura:** ✅ Cubierto · ⚠️ Parcial · ❌ No cubierto · 🔲 Pendiente

---

## Sprint 1 — Compras + Maestros Core + Finanzas Base

### 1.1 Proveedores

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Compras |
| **HU** | HU-COM-001 v1.0 |
| **Reglas de negocio** | RUC/DNI único por país · Solo activos en OC · Impedir eliminación con movimientos · Baja lógica (no física) · Log de auditoría |
| **Pantalla** | `Compras > Tablas > Proveedores` |
| **Ruta** | `/compras/tabla/gestion-proveedores` |
| **APIs** | `GET /api/core/relaciones-comerciales?esProveedor=true` · CRUD backend |
| **Evento motor v2** | (maestro — no genera evento contable) |
| **Componentes** | `PROVEEDOR` (tipo=contrapartida, pos=1, haber) |
| **CPs manuales** | CP-S1-001 al CP-S1-008 |
| **Gherkin** | #1.1 al #1.17 (Feature: Gestión de Proveedores) |
| **Playwright** | `tests/e2e/sprint-1/sprint-1.spec.js` — CRUD Proveedor |
| **Cobertura** | ⚠️ Automatización intermitente (Angular change detection). Columnas reales difieren de HU. |

### 1.2 Orden de Compra — Generación

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Compras |
| **HU** | HU-COM-003 v1.0 |
| **Reglas de negocio** | Proveedor activo · Artículo clasificado · Numeración `CH2026000002` · Moneda + TC si ME · Fecha entrega ≥ fecha emisión · Precio ≥ 0.0001 · Máx 4 decimales · Solo editar Pendiente/Rechazada · Bloqueo en Aprobada/Cerrada |
| **Pantalla** | `Compras > Operaciones > Generar OC` |
| **Ruta** | `/compras/operaciones/ordenes-compra` |
| **APIs** | `GET /api/core/relaciones-comerciales?esProveedor=true&nroDocumento=...` |
| **Evento motor v2** | (intención — no genera evento contable) |
| **Componentes** | (el asiento se genera vía `COMPRA_REGISTRADA` al convertir en factura) |
| **CPs manuales** | CP-S1-009 al CP-S1-016 |
| **Gherkin** | #2.1 al #2.9 (Feature: Orden de Compra) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | ❌ **Bloqueado** — usuario pcastillo sin permiso COM-002 "comprador activo" (bug #006) |

### 1.3 Aprobación de OC

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Compras |
| **HU** | HU-COM-004 v1.0 |
| **Reglas de negocio** | Aprobador ≠ creador · Comentario obligatorio en Rechazo/Retorno · Multinivel > S/20,000 (2 aprobadores) · Notificación automática al creador |
| **Pantalla** | `Compras > Operaciones > Aprobar OC` |
| **Ruta** | `/compras/operaciones/aprobar-compra` |
| **APIs** | (endpoint de aprobación — error 403 para pcastillo) |
| **Evento motor v2** | (workflow — no genera evento contable) |
| **Componentes** | — |
| **CPs manuales** | CP-S1-017 al CP-S1-022 |
| **Gherkin** | #3.1 al #3.6 (Feature: Aprobación de OC) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | ❌ **Bloqueado** — error 403 COM-022 "no es aprobador configurado" (bug #010). Aprobación: ❌ · Rechazo: ✅ · Retorno: ✅ |

### 1.4 Orden de Servicios

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Compras |
| **HU** | (sin HU explícita en docs) |
| **Reglas de negocio** | Proveedor activo · Servicio existente · Monto > 0 · Fechas válidas · Acta de conformidad |
| **Pantalla** | `Compras > Operaciones > Generar OS / Aprobar OS` |
| **Ruta** | 🔲 Pendiente de mapear |
| **APIs** | 🔲 Pendiente |
| **Evento motor v2** | (intención — el asiento se genera al facturar el servicio) |
| **Componentes** | — |
| **CPs manuales** | CP-S1-023 al CP-S1-025 |
| **Gherkin** | #4.1, #4.2, #5.1 (Feature: Orden de Servicios) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente — ruta no mapeada |

### 1.5 Cuentas por Pagar — Registro CxP

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Finanzas |
| **HU** | HU-FIN-OPE-001 · HU-FIN-OP-CP-001 |
| **Reglas de negocio** | Factura duplicada: Razón Social + Proveedor + N° + Año · Solo Supervisor Financiero aprueba · Asiento automático al aprobar · Factura aprobada bloquea edición · Anular solo Pendiente/Validada (no Aprobada) · Detracción si OC > S/700 · Saldo = total − detracción |
| **Pantalla** | `Compras > Operaciones > Registro de comprobantes` |
| **Ruta** | `/compras/operaciones/registro-comprobantes` |
| **APIs** | `POST /procesar-evento` (motor v2 futuro) · CRUD facturas |
| **Evento motor v2** | `COMPRA_REGISTRADA` (1 asiento diario compras) · `COMPRA_CONTADO` (1 asiento) |
| **Componentes** | `PROVEEDOR` (contrapartida, haber) · `COMPRA` (gasto, debe) · `IVA_CREDITO` (impuesto, debe) · `DETRACCION` (puente, haber, si aplica) · `PERCEPCION` (impuesto, debe, PE) · `RETENCION` (impuesto, haber, PE) |
| **CPs manuales** | CP-S1-026 al CP-S1-032 |
| **Gherkin** | #6.1 al #6.7 (Feature: Cuentas por Pagar) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente · 9 casos CSV Compras con soporte ✅ SÍ |

### 1.6 NC/ND y Ajustes de Deuda

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Finanzas |
| **HU** | HU-COM-OPE-003 |
| **Reglas de negocio** | Monto ajuste ≤ saldo pendiente · Bloqueo sobre factura cancelada · Serie/número único por proveedor+tipo · Motivo mín 10 caracteres · Anulación con asiento reverso · Adjunto XML + control duplicidad |
| **Pantalla** | `Compras > Operaciones > Notas crédito/débito` |
| **Ruta** | 🔲 Pendiente de mapear |
| **APIs** | (endpoint de ajustes) |
| **Evento motor v2** | `NC_COMPRA` (1 asiento — revierte original) · `NOTA_DEBITO_EMITIDA` · `NOTA_CREDITO_EMITIDA` |
| **Componentes** | NC: `PROVEEDOR` (debe) · `COMPRA` (haber) · `IVA_CREDITO` (haber) — todos invertidos |
| **CPs manuales** | CP-S1-033 al CP-S1-038 |
| **Gherkin** | #7.1 al #7.6 (Feature: Nota Débito / Crédito) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente — ruta no mapeada |

### 1.7 Documentos por Pagar Directo

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Finanzas |
| **HU** | HU-FIN-OP-CP-001 |
| **Reglas de negocio** | Proveedor existente · Montos válidos |
| **Pantalla** | `Compras > Cuentas por Pagar > DPD Individual` |
| **Ruta** | 🔲 Pendiente de mapear |
| **APIs** | 🔲 Pendiente |
| **Evento motor v2** | (similar a `COMPRA_REGISTRADA`) |
| **Componentes** | `PROVEEDOR` · `COMPRA` · `IVA_CREDITO` |
| **CPs manuales** | CP-S1-039 |
| **Gherkin** | #8.1 (Feature: DPD) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 1.8 Reportes de Compras

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Compras |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Filtros combinados · Exportar Excel/PDF · Sin datos: mensaje + exportar deshabilitado |
| **Pantalla** | `Compras > Reportes > Gestión de compras` |
| **Ruta** | `/compras/reportes/gestion-compras` |
| **APIs** | `sp_generar_reporte_compras` |
| **Evento motor v2** | (reporte — no genera evento contable) |
| **Componentes** | — |
| **CPs manuales** | CP-S1-040, CP-S1-041 |
| **Gherkin** | #9.1, #9.2 (Feature: Reportes de Compras) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 1.9 Reportes de Ventas SUNAT + Tributario

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Ventas |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Formato SUNAT: RUC, tipo, serie, número, base imponible, IGV, total · IGV débito/crédito consistentes entre reportes |
| **Pantalla** | `Ventas > Reportes` |
| **Ruta** | 🔲 Pendiente de mapear |
| **APIs** | `ventas.sp_generar_registro_ventas` · reporte tributario |
| **Evento motor v2** | (reporte — no genera evento) |
| **Componentes** | — |
| **CPs manuales** | CP-S1-042, CP-S1-043 |
| **Gherkin** | #10.1, #11.1 (Feature: Reportes de Ventas) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente — ruta no mapeada |

### 1.10 Maestros Financieros Base

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 1 |
| **Módulo** | Finanzas / Contabilidad |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Validación formato cuenta · Código SUNAT único · No eliminar si referenciado · TC fecha duplicada · `fn_obtener_tipo_cambio` en pantallas |
| **Pantalla** | `Finanzas > Bancos / Tablas SUNAT` · `Contabilidad > Tipo de Cambio` |
| **Ruta** | 🔲 Pendientes de mapear (4 rutas) |
| **APIs** | CRUD cuentas, medios/forma pago, TC · `fn_obtener_tipo_cambio` |
| **Evento motor v2** | (maestros — no generan eventos) |
| **Componentes** | `BANCO` (contrapartida, ambos) · `CAJA_CHICA` (contrapartida, ambos) |
| **CPs manuales** | CP-S1-044 al CP-S1-048 |
| **Gherkin** | #15.1, #16.1, #17.1, #33.1, #33.2 (Feature: Maestros Financieros) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente — 4 rutas sin mapear |

### 1.11 E2E Sprint 1

| E2E | HU | Evento v2 | CPs | Gherkin | Playwright | Cobertura |
|:----|:---|:----------|:----|:--------|:-----------|:---------:|
| E2E-01 Compras completo | HU-COM-001, HU-COM-003, HU-COM-004, HU-FIN-OPE-001 | `COMPRA_REGISTRADA` | CP-S1-E2E-01 | E2E-01 S1 | 🔲 | ❌ Bloqueado (OC) |
| E2E-02 Ventas Reportes | — | `sp_generar_registro_ventas` | CP-S1-E2E-02 | E2E-02 S1 | 🔲 | 🔲 Pendiente |
| E2E-03 Finanzas Base | — | (maestros) | CP-S1-E2E-03 | E2E-03 S1 | 🔲 | 🔲 Pendiente |

---

## Sprint 2 — Finanzas + Contabilidad

### 2.1 Tablas Financieras

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 2 |
| **Módulo** | Finanzas |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Código SUNAT único · Árbol jerárquico conceptos · Validación dependencia al eliminar grupo |
| **Pantalla** | `Finanzas > Documentos / Conceptos / Flujo de Caja` |
| **APIs** | CRUD tipos documento, conceptos, grupos flujo |
| **Evento motor v2** | (maestros — no generan eventos) |
| **Componentes** | `GASTO_FINANCIERO` · `INTERES_POR_PAGAR` · `PRESTAMO_CAPITAL` |
| **CPs manuales** | CP-S2-001 al CP-S2-003 |
| **Gherkin** | #12.1, #13.1, #14.1, #14.2 (Feature: Tablas Financieras) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 2.2 Órdenes de Giro

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 2 |
| **Módulo** | Finanzas |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Monto > 0 · Fecha válida · Beneficiario con cuenta · Motivo obligatorio en rechazo |
| **Pantalla** | `Finanzas > Solicitud de Adelantos > Generación / Aprobación OG` |
| **APIs** | 🔲 Pendiente |
| **Evento motor v2** | (intención — el asiento se genera al pagar la OG) |
| **Componentes** | `BANCO_SALIDA` · `ANTICIPO_PROVEEDOR` (si es a proveedor) |
| **CPs manuales** | CP-S2-004 al CP-S2-006 |
| **Gherkin** | #18.1, #18.2, #19.1, #19.2 (Feature: Órdenes de Giro) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 2.3 Rendición de Gastos

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 2 |
| **Módulo** | Finanzas |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Total rendido ≤ monto OG · Adjuntar comprobantes · Aprobación total/parcial · Cierre inmodificable |
| **Pantalla** | `Finanzas > Solicitud de Adelantos > Rendición / Aprobación / Cierre` |
| **APIs** | 🔲 Pendiente |
| **Evento motor v2** | `GASTO_CAJA_CHICA` · `REPOSICION_CAJA_CHICA` |
| **Componentes** | `GASTO_CC` (gasto, debe) · `CAJA_CHICA` (contrapartida, haber) · `BANCO_SALIDA` |
| **CPs manuales** | CP-S2-007 al CP-S2-009 |
| **Gherkin** | #20.1, #21.1, #22.1 (Feature: Rendición de Gastos) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 2.4 Tesorería — Cartera y Transferencias

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 2 |
| **Módulo** | Finanzas |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Saldo banco suficiente · Monto transferencia ≤ saldo origen · Anulación con motivo obligatorio · Pago actualiza CxP · Cobro actualiza CxC |
| **Pantalla** | `Finanzas > Tesorería > Cartera de pagos / cobros / Aplicación / Transferencias` |
| **APIs** | CRUD cartera · aplicación documentos |
| **Evento motor v2** | `PAGO_PROVEEDOR` (1 asiento) · `COBRO_REGISTRADO` (1) · `TRANSFERENCIA_INTERNA` (1) · `PAGO_DETRACCION` (1, PE) · `APERTURA_CAJA_CHICA` (1) · `GASTO_CAJA_CHICA` (1) · `REPOSICION_CAJA_CHICA` (1) · `PRESTAMO_DESEMBOLSADO` (1) · `PRESTAMO_CUOTA_PAGADA` (1) · `LIQUIDACION_FACTORING` (1) · `COMPENSACION_REGISTRADA` (1) |
| **Componentes** | `PROVEEDOR` · `BANCO_SALIDA` · `BANCO_ENTRADA` · `CLIENTE` · `DIF_CAMBIO` · `DETRACCION` · `CAJA_CHICA` · `TRANSFERENCIA_ORIGEN/DESTINO` · `PRESTAMO_CAPITAL` · `INTERES_POR_PAGAR` · `GASTO_FINANCIERO` · `COMPENSACION_CXC/CXP` |
| **CPs manuales** | CP-S2-010 al CP-S2-014 |
| **Gherkin** | #23.1, #24.1, #25.1, #26.1, #27.1 (Features Tesorería + Transferencias) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 2.5 Tablas Contables

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 2 |
| **Módulo** | Contabilidad |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Código cuenta único por nivel · No crear si existe · Árbol expandible · Porcentaje 0-100 · Código SUNAT único · Una UIT por año |
| **Pantalla** | `Contabilidad > Plan Contable / Centros de Costo / Detracciones / Impuestos / UIT` |
| **APIs** | CRUD plan contable · import Excel · CRUD centros costo · CRUD detracciones/impuestos/UIT |
| **Evento motor v2** | (maestros — no generan eventos) |
| **Componentes** | Todos los 79 componentes usan `plan_contable_det` para resolución de cuentas |
| **CPs manuales** | CP-S2-015 al CP-S2-020 |
| **Gherkin** | #28.1, #29.1, #30.1, #31.1, #32.1, #34.1 (Feature: Tablas Contables) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 2.6 Reportes y Procesos Contables SUNAT

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 2 |
| **Módulo** | Contabilidad |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Período válido · Debe = Haber en libro diario · Totales coinciden entre reportes · Indicador de progreso en PLE · Archivos TXT/PDF para SUNAT |
| **Pantalla** | `Contabilidad > Formatos SUNAT / Libros Electrónicos` |
| **APIs** | `sp_generar_libro_diario_simplificado` · `sp_generar_reporte_sunat` · `sp_generar_libros_electronicos` |
| **Evento motor v2** | (reportes — Pipeline paso 10: exportar SUNAT/DIAN/SRI) |
| **Componentes** | — |
| **CPs manuales** | CP-S2-021, CP-S2-022 |
| **Gherkin** | #35.1, #36.1, #37.1 (Feature: Reportes y Procesos Contables) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | ⚠️ Gap #36 (Formatos SUNAT básicos) sin CP dedicado |

### 2.7 E2E Sprint 2

| E2E | Evento v2 | CPs | Gherkin | Playwright | Cobertura |
|:----|:----------|:----|:--------|:-----------|:---------:|
| E2E-01 Adelantos → Tesorería | `PAGO_PROVEEDOR` | CP-S2-E2E-01 | E2E-01 S2 | 🔲 | 🔲 Pendiente |
| E2E-02 Cartera CxC | `COBRO_REGISTRADO` | CP-S2-E2E-02 | E2E-02 S2 | 🔲 | 🔲 Pendiente |
| E2E-03 Contabilidad + PLE | `sp_generar_libros_electronicos` | CP-S2-E2E-03 | E2E-03 S2 | 🔲 | 🔲 Pendiente |

---

## Sprint 3 — Activos Fijos + RR.HH Inicio

### 3.1 Maestro Activos Fijos (8 pestañas)

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 3 |
| **Módulo** | Activos Fijos |
| **HU** | HU-AF-TABOPE-0091 |
| **Reglas de negocio** | Código autogenerado · Clasificación jerárquica · 8 pestañas independientes · Bloqueo en activo en Baja · Validación matriz contable completa · Adaptación incrementa valor neto |
| **Pantalla** | `Activos Fijos > Maestro de activos fijos` |
| **APIs** | CRUD AF · `fn_valor_neto_activo` |
| **Evento motor v2** | (maestro) · `COMPRA_ACTIVO_FIJO` (al adquirir) |
| **Componentes** | `ACTIVO_FIJO` (contrapartida, debe) · `DEPRECIACION_GASTO` · `DEPRECIACION_ACUMULADA` · `BAJA_ACTIVO` · `REVALUACION_ACTIVO` · `MEJORA_ACTIVO` · `LEASING_ACTIVO` · `LEASING_PASIVO` |
| **CPs manuales** | CP-S3-001 al CP-S3-005 |
| **Gherkin** | #38.1 al #38.5 (Feature: Maestro Activos Fijos) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | ⚠️ Parcial — tabs de configuración implementados; procesos con SPs pendientes |

### 3.2 Parámetros Activos Fijos

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 3 |
| **Módulo** | Activos Fijos |
| **HU** | HU-AF-001 · HU-AF-002 · HU-AF-TAB-001 · HU-AF-TAB-004 |
| **Reglas de negocio** | Código único · Naturaleza definida · Cuenta contable válida · No eliminar si usado · RUC validado por país · Solo una matriz activa por subclase · Cuentas obligatorias completas |
| **Pantalla** | `Activos Fijos > Parámetros / Incidencias / Aseguradoras / Matriz Contable` |
| **APIs** | CRUD tipos operación, incidencia, aseguradoras, matriz subclase |
| **Evento motor v2** | (maestros) |
| **Componentes** | `ACTIVO_FIJO` · `DEPRECIACION_GASTO` · `BAJA_ACTIVO` |
| **CPs manuales** | CP-S3-006 al CP-S3-010 |
| **Gherkin** | #39.1, #40.1, #41.1, #42.1 (Feature: Parámetros AF) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | ⚠️ Controller implementado; SPs pendientes para procesos |

### 3.3 Operaciones y Procesos Activos Fijos

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 3 |
| **Módulo** | Activos Fijos |
| **HU** | HU-AF-OPE-004 · HU-AF-OPE-006 · HU-AF-OPE-007 · HU-AF-OPE-008 · HU-AF-PRO-001 · HU-AF-PRO-002 · HU-AF-PRO-003 · HU-AF-PRO-005 · HU-AF-REP-001 · HU-AF-REP-002 |
| **Reglas de negocio** | Mejora incrementa valor neto · Baja: ganancia/pérdida = valor venta − valor neto · Siniestro: valor venta = 0 · Obsolescencia: informe técnico · Revaluación wizard 5 pasos · Tasa 0-100% · Residual ≤ 20% · Distribución CC suma 100% · Modo Prueba/Definitivo · Barra de progreso · No período cerrado · Débito = Crédito |
| **Pantalla** | `Activos Fijos > Operaciones / Procesos / Reportes` |
| **APIs** | `sp_baja_activo_venta` · `sp_calcular_depreciacion` · `sp_revaluacion_activo` |
| **Evento motor v2** | `MEJORA_ACTIVO` · `BAJA_ACTIVO` · `VENTA_ACTIVO` · `REVALUACION_ACTIVO` · `DEPRECIACION_MENSUAL` · `LEASING_INICIADO` · `LEASING_CUOTA_PAGADA` |
| **Componentes** | `ACTIVO_FIJO` · `DEPRECIACION_GASTO` · `DEPRECIACION_ACUMULADA` · `BAJA_ACTIVO` · `REVALUACION_ACTIVO` · `MEJORA_ACTIVO` · `LEASING_ACTIVO` · `LEASING_PASIVO` · `GANANCIA_VENTA_AF` · `PERDIDA_VENTA_AF` · `EXCEDENTE_REVALUACION` |
| **CPs manuales** | CP-S3-011 al CP-S3-024 |
| **Gherkin** | #43.1 al #52.1 (Features: Operaciones AF + Procesos AF) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | ⚠️ **6 funcionalidades con SP pendiente** (bloque AF7-AF12 del reporte gerencial) |

### 3.4 RR.HH Configuración Inicial

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 3 |
| **Módulo** | RR.HH |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Períodos sin solapamiento · RMV única por período · Porcentajes 0-100 · Monto > 0 |
| **Pantalla** | `RRHH > Configuración > Parámetros de Fechas / RMV / Parámetros de Control` |
| **APIs** | CRUD períodos, RMV, parámetros |
| **Evento motor v2** | (maestros) |
| **Componentes** | `PLANILLA_DEVENGADA` · `APORTES_PAGADOS` |
| **CPs manuales** | CP-S3-025 al CP-S3-027 |
| **Gherkin** | #53.1, #54.1, #55.1 (Feature: RR.HH Configuración) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 3.5 RR.HH Datos del Personal

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 3 |
| **Módulo** | RR.HH |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | DNI 8 dígitos / CE 12 dígitos · Nacimiento > 14 años · Email formato válido · Salario dentro de banda del cargo · Mín < Máx |
| **Pantalla** | `RRHH > Datos del Personal > Datos Generales / Categorías/Cargos` |
| **Ruta** | `/rrhh/maestro-personal/datos-contacto` · `/rrhh/maestro-personal/definicion-cargos` |
| **APIs** | CRUD trabajador, cargos |
| **Evento motor v2** | (maestros) |
| **Componentes** | `PLANILLA_DEVENGADA` · `PLANILLA_PAGADA` |
| **CPs manuales** | CP-S3-028 al CP-S3-030 |
| **Gherkin** | #56.1, #56.2, #58.1 (Feature: RR.HH Personal) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 3.6 E2E Sprint 3

| E2E | Evento v2 | CPs | Gherkin | Playwright | Cobertura |
|:----|:----------|:----|:--------|:-----------|:---------:|
| E2E-01 AF Completo | `DEPRECIACION_MENSUAL` | CP-S3-E2E-01 | E2E-01 S3 | 🔲 | 🔲 Pendiente |
| E2E-02 Revaluación | `REVALUACION_ACTIVO` | CP-S3-E2E-02 | E2E-02 S3 | 🔲 | 🔲 Pendiente |
| E2E-03 RRHH Maestros | (maestros) | CP-S3-E2E-03 | E2E-03 S3 | 🔲 | 🔲 Pendiente |

---

## Sprint 4 — RR.HH Completo

### 4.1 Maestros RR.HH

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | Duración máxima > 0 · Tasa AFP > 0 · Sin feriados duplicados · Turnos asignables |
| **Pantalla** | `RRHH > Tipo de contrato / AFP y EPS / Calendario feriados` |
| **Ruta** | `/rrhh/parametros/tipo-contrato` |
| **APIs** | CRUD contratos, AFP, EPS, feriados |
| **Evento motor v2** | (maestros) |
| **Componentes** | — |
| **CPs manuales** | CP-S4-001 al CP-S4-003 |
| **Gherkin** | #57.1, #59.1, #60.1 (Feature: Maestros RRHH) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.2 Asistencias + Vacaciones

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | (sin HU explícita) |
| **Reglas de negocio** | HE calculadas automáticamente · Salida < entrada: error · No fecha futura · No duplicado · Saldo vacaciones dinámico · No exceder saldo · `trg_actualizar_dias_gozados` |
| **Pantalla** | `RRHH > Asistencias y HE / Vacaciones por Trabajador` |
| **Ruta** | `/rrhh/asistencias-jornadas/asistencias-HE` |
| **APIs** | CRUD asistencia, vacaciones |
| **Evento motor v2** | (operaciones — alimentan `PLANILLA_DEVENGADA`) |
| **Componentes** | `PLANILLA_DEVENGADA` · `VACACIONES_PASIVO` |
| **CPs manuales** | CP-S4-004 al CP-S4-007 |
| **Gherkin** | #61.1, #61.2, #63.1, #63.2 (Features: Asistencias + Vacaciones) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.3 Conceptos Fijos y Variables

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | HU-RRHH-PN-CP-001 · HU-RRHH-PN-CP-002 |
| **Reglas de negocio** | Concepto con vigencia Desde/Hasta · Modo Fijo/Porcentaje/Fórmula · Asociación individual o por cargo · No duplicar Sueldo Base · Importación masiva Excel · Errores corregibles · Programación automática biométrico |
| **Pantalla** | `RRHH > Cálculo de Planilla > Ganancias y Descuentos Fijos / Variables` |
| **APIs** | CRUD conceptos · import Excel · `sp_calcular_planilla` |
| **Evento motor v2** | `PLANILLA_DEVENGADA` (1 asiento batch) |
| **Componentes** | `PLANILLA_DEVENGADA` (gasto, debe) · `PLANILLA_PAGADA` (contrapartida, haber) · `APORTES_PAGADOS` (contrapartida, haber) · `PROVISION_LABORAL` (gasto, debe) |
| **CPs manuales** | CP-S4-008 al CP-S4-018 |
| **Gherkin** | #64.1 al #65.4 (Features: Conceptos Fijos + Variables) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.4 Propinas y Recargo al Consumo

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | HU-RRHH-PN-CP-003 · HU-RRH-NOM-CP-007 |
| **Reglas de negocio** | Reglas % Fijo / Por Rol / Mixto · Monto total desde Ventas/POS (solo lectura) · % máximo legal por país · Ajuste manual con motivo obligatorio · Confirmación bloquea · Bloqueo redistribución · Reversión controlada con justificación |
| **Pantalla** | `RRHH > Propinas / Recargo al Consumo` |
| **APIs** | `sp_calcular_propinas` · `sp_calcular_recargo_consumo` |
| **Evento motor v2** | `VENTA_EMITIDA` (propina como componente) · `LIQUIDACION_AGREGADOR` |
| **Componentes** | `PROPINA` (impuesto, haber, PE/CO) · `PROPINA_PENDIENTE` (puente, haber) |
| **CPs manuales** | CP-S4-019 al CP-S4-028 |
| **Gherkin** | #66.1 al #67.5 (Features: Propinas + Recargo) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.5 Cuenta Corriente — Préstamos

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | HU-RRHH-NOM-CC-001 |
| **Reglas de negocio** | Cuota = monto / N cuotas · Tope % del sueldo · Pago anticipado reduce saldo · Cancelación total descarta cuotas · Integración con planilla · Descuento automático |
| **Pantalla** | `RRHH > Cálculo de Planilla > Cuenta Corriente` |
| **APIs** | CRUD préstamos · amortizaciones |
| **Evento motor v2** | `PRESTAMO_DESEMBOLSADO` (1 asiento) · `PRESTAMO_CUOTA_PAGADA` (1 asiento) |
| **Componentes** | `PRESTAMO_CAPITAL` (contrapartida, ambos) · `INTERES_POR_PAGAR` (puente, haber) · `BANCO` |
| **CPs manuales** | CP-S4-029 al CP-S4-033 |
| **Gherkin** | #68.1 al #68.5 (Feature: Cuenta Corriente) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.6 Cálculo de Planilla

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | HU-RRHH-NOM-AR-001 |
| **Reglas de negocio** | AFP/ONP/ESSALUD según configuración · IRPF por tramos · Desglose trabajador vs empleador · No recalcular período cerrado · Trabajador sin asistencia: advertencia · Indicador de progreso |
| **Pantalla** | `RRHH > Cálculo de Planilla > Cálculo de Planilla` |
| **APIs** | `sp_calcular_planilla` (con sub-SPs) |
| **Evento motor v2** | `PLANILLA_DEVENGADA` (devengo) · `PLANILLA_PAGADA` (pago) |
| **Componentes** | `PLANILLA_DEVENGADA` · `PLANILLA_PAGADA` · `APORTES_PAGADOS` · `PROVISION_LABORAL` · `SUELDOS_GASTO` · `ESSALUD_GASTO` · `SCTR_GASTO` · `SUELDOS_PAGAR` · `ONP_AFP_PAGAR` · `ESSALUD_PAGAR` · `SCTR_PAGAR` |
| **CPs manuales** | CP-S4-034 al CP-S4-039 |
| **Gherkin** | #69.1 al #69.6 (Feature: Cálculo de Planilla) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.7 Liquidaciones, Gratificación, CTS, Boletas

| Dimensión | Valor |
|:----------|:------|
| **Sprint** | 4 |
| **Módulo** | RR.HH |
| **HU** | HU-RRHH-NOM-LIQ-001 |
| **Reglas de negocio** | Renuncia: sin indemnización · Despido: 1.5 sueldos/año · Deducciones automáticas de CC · Aprobación digital · Comprobante PDF/XML · Moneda local + corporativa · < 3 meses: advertencia · Sin fecha futura · Ya liquidado: bloqueo · Sin planilla: no emitir boletas |
| **Pantalla** | `RRHH > Liquidaciones / Gratificaciones + CTS / Saldos CC / Boletas` |
| **APIs** | `sp_liquidar_beneficios` · `sp_calcular_gratificacion` · `sp_calcular_cts` · `sp_generar_pago_remuneraciones` · `sp_generar_boleta_pago` |
| **Evento motor v2** | `PROVISION_GRATIFICACION` (1) · `PROVISION_CTS` (1, PE) · `PROVISION_VACACIONES` (1) |
| **Componentes** | `PROVISION_LABORAL` · `GRATIFICACION_PASIVO` · `CTS_PASIVO` · `VACACIONES_PASIVO` · `PLANILLA_PAGADA` · `BANCO_SALIDA` |
| **CPs manuales** | CP-S4-040 al CP-S4-051 |
| **Gherkin** | #70.1 al #73.2 (Features: Liquidaciones + Gratificación/CTS + Saldos + Boletas) |
| **Playwright** | 🔲 Sin automatizar |
| **Cobertura** | 🔲 Pendiente |

### 4.8 E2E Sprint 4

| E2E | Evento v2 | CPs | Gherkin | Playwright | Cobertura |
|:----|:----------|:----|:--------|:-----------|:---------:|
| E2E-01 Asistencia → Planilla → Boletas | `PLANILLA_DEVENGADA` | CP-S4-E2E-01 | E2E-01 S4 | 🔲 | 🔲 |
| E2E-02 Recargo → Aportes → Planilla | `PLANILLA_DEVENGADA` | CP-S4-E2E-02 | E2E-02 S4 | 🔲 | 🔲 |
| E2E-03 Adelantos + Préstamos → Planilla | `PRESTAMO_CUOTA_PAGADA` | CP-S4-E2E-03 | E2E-03 S4 | 🔲 | 🔲 |
| E2E-04 Liquidación + Gratif/CTS + Boletas | `sp_liquidar_beneficios` | CP-S4-E2E-04 | E2E-04 S4 | 🔲 | 🔲 |

---

## Resumen General de Trazabilidad

| Sprint | Áreas funcionales | HUs | Reglas | Pantallas | APIs/SPs | Eventos v2 | Componentes | CPs | Gherkin | Playwright | % Automatizado |
|:------:|:------------------|:---:|:------:|:---------:|:--------:|:----------:|:-----------:|:---:|:-------:|:----------:|:-------------:|
| S1 | 10 (Prov, OC, Aprob, OS, CxP, NC/ND, DPD, Reportes Compras, Reportes Ventas, Maestros Fin) | 4 | 11 | 14 | 5 | 3 (único) | 10 (activados) | 51 | 39 | 2 tests | 4% |
| S2 | 6 (Tablas Fin, OG, Rendición, Tesorería, Tablas Contables, Reportes SUNAT) | 0 | 7 | 18 | 6 | 11 (único) | 24 (activados) | 25 | 18 | 0 | 0% |
| S3 | 6 (Maestro AF, Parámetros AF, Op/Proc AF, RRHH Config, RRHH Personal, E2E) | 1 | 14 | 17 | 5 | 12 (único) | 21 (activados) | 33 | 23 | 0 | 0% |
| S4 | 8 (Maestros RRHH, Asist+Vac, Conceptos, Propinas, Recargo, Préstamos, Planilla, Liquidaciones) | 7 | 29 | 14 | 9 | 7 (único) | 24 (activados) | 56 | 26 | 0 | 0% |
| **Total** | **30 áreas** | **12** | **61** | **63** | **25** | **33** | **79** | **165** | **106** | **2** | **<1%** |

> **Nota sobre totales:**
> - **Reglas (61):** Conteo de menciones en la matriz. El MAPA §6 consolida **23 reglas únicas**.
> - **Eventos (33):** 33 eventos únicos del catálogo. La suma por sprint (33) refleja eventos asignados a cada sprint.
> - **Componentes (79):** 79 componentes únicos del Apéndice C. La columna "activados" cuenta componentes referenciados en la matriz por sprint.
> - **APIs/SPs (25):** Endpoints operativos. Los 22 endpoints admin no se incluyen por ser transversales. Total real: **47 APIs** (25 ops + 22 admin).
> - **CSVs:** 109 casos adicionales (Compras 60 + Ventas 49) con asientos de referencia no incluidos en el conteo de CPs.

---

## Notas

1. **Componentes contables:** 79 del Apéndice C de `06-CATALOGO_COMPONENTES.md`. No todos están activados por cada sprint — la matriz muestra solo los directamente referenciados.
2. **APIs:** 25 endpoints operativos documentados en la matriz + 22 admin (`10-GESTION_REGLAS.md` §7). Total documentado: **47 APIs**.
3. **Reglas:** 23 reglas únicas consolidadas en `MAPA_FUNCIONAL_CONSOLIDADO.md` §6. La matriz muestra 61 menciones (muchas reglas aplican a múltiples áreas funcionales).
4. **Playwright:** Solo 2 tests implementados (`login.spec.js` y `sprint-1.spec.js`). 0 tests validan asientos contables.
5. **CSVs Casos por Módulo:** 109 casos adicionales (Compras 60 + Ventas 49) con asientos de referencia. No incluidos en el conteo de CPs del MD.
6. **Cobertura real de automatización:** <1% del total de casos documentados (2 de ~380).
7. **Bloqueantes:** Bugs #006 y #010 impiden automatizar flujos de OC y Aprobación en S1.
8. **Motor v2:** En fase de diseño. Los eventos y componentes listados son la especificación objetivo. El motor actual (v1) solo cubre ~19% de escenarios de compra.

---

*Matriz generada el 03/07/2026 — Línea base oficial para automatización Playwright*
