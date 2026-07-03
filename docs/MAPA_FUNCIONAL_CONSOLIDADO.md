# MAPA FUNCIONAL CONSOLIDADO — RestPE Contabilidad

> **Fecha:** 03/07/2026
> **Proyecto Frontend:** `restpe-contabilidad-playwright` (Playwright E2E)
> **Proyecto Backend:** `restpe-contabilidad-back-end` (Java, Motor de Asientos v2)
> **Dominio:** `panel.dev.contabilidad.restaurant.pe`
> **Países:** PE (Perú) · CO (Colombia) · EC (Ecuador)

---

## 1. ARQUITECTURA DEL SISTEMA

### 1.1 Capas

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Angular 15+ / Ionic 6)                   │
│  RESTAURANTE contabilidad SPA                       │
│  panel.dev.contabilidad.restaurant.pe               │
│  AuthGuard → Login → Empresa → Sucursal → Dashboard │
├─────────────────────────────────────────────────────┤
│  MIDDLEWARE (Feign Clients / REST APIs)             │
│  ms-compras · ms-ventas · ms-tesoreria · ms-almacen │
│  ms-activos · ms-planilla · ms-contabilidad         │
├─────────────────────────────────────────────────────┤
│  BACKEND — MOTOR DE ASIENTOS (Java)                 │
│  POST /procesar-evento → Pipeline 10 pasos          │
│  evento + payload → componentes → cuentas → asiento │
├─────────────────────────────────────────────────────┤
│  DATABASE (Multi-tenant: 1 BD por empresa)          │
│  Security DB → master.empresa                       │
│  Tenant DB → cntbl_asiento, plan_contable_det, etc. │
└─────────────────────────────────────────────────────┘
```

### 1.2 Stack Técnico

| Capa | Tecnología | Versión / Detalle |
|------|-----------|-------------------|
| Frontend | Angular + Ionic | Lazy loading, AG Grid, Light DOM |
| Auth | AuthGuard | `/auth/signin` → `/auth/seleccion-razon-social` → Sucursal |
| APIs Frontend | REST JSON | `POST /auth/login`, `GET /auth/empresas`, etc. |
| Middleware | Java Spring | ms-compras, ms-ventas, ms-tesoreria, etc. |
| Motor Asientos | Java | PipelineOrchestrator (10 pasos), 1 endpoint genérico |
| DB | PostgreSQL | 1 BD por tenant, esquemas: core, contabilidad, finanzas, etc. |
| Motor v1 (legacy) | `GenerarAsientoServiceImpl` | 770 matrices fijas, fórmulas no evaluadas, Perú-only |
| Motor v2 (diseño) | Component-Based Engine | 33 eventos, ~80 componentes, multi-país |

### 1.3 Ambientes

| Ambiente | URL |
|----------|-----|
| Dev | `https://panel.dev.contabilidad.restaurant.pe/` |
| Usuario QA | `pcastillo` |
| Empresa QA | PESQUERA CANTABRIA S.A. (RUC 20504595863) |
| Sucursal QA | LIMA |

---

## 2. MÓDULOS DEL SISTEMA (Frontend Sidebar)

| # | Módulo | Icono | Ruta Base | Sprint | Estado Motor v1 |
|---|--------|-------|-----------|--------|----------------|
| 1 | **Almacén** | warehouse | `/almacen` | — | ~30% |
| 2 | **Compras** | cart-shopping | `/compras` | S1 | 19% (3/16 escenarios) |
| 3 | **Finanzas** | chart-line | `/finanzas` | S1, S2 | ~25% |
| 4 | **Ventas** | — | `/ventas` | S1 | ~30% |
| 5 | **Contabilidad** | calculator | `/contabilidad` | S2 | N/A para motor actual |
| 6 | **Activos Fijos** | building | `/activos` | S3 | ~40% |
| 7 | **RR.HH** | users | `/rrhh` | S3, S4 | ~0% |
| 8 | **Producción** | box | `/produccion` | — | ~0% |
| 9 | **Configuración** | cog | `/configuracion` | — | N/A |

---

## 3. EVENTOS DE DOMINIO (Alineación Frontend ↔ Backend)

### 3.1 Módulo Compras — Sprint 1

| # CSV | Frontend (pantalla) | Evento Backend (v2) | Asiento(s) | Componentes activos |
|-------|---------------------|---------------------|------------|---------------------|
| 1 | **Proveedores** `/compras/tabla/gestion-proveedores` | (maestro, no genera evento) | — | — |
| 2 | **Generar OC** `/compras/operaciones/ordenes-compra` | (intención, no genera asiento) | — | — |
| 3 | **Aprobar OC** `/compras/operaciones/aprobar-compra` | (workflow, no genera asiento) | — | — |
| 4 | **Generar OS** | (similar a OC) | — | — |
| 6 | **Registro CxP** `/compras/operaciones/registro-comprobantes` | `COMPRA_REGISTRADA` / `COMPRA_CONTADO` | 1 en diario compras | PROVEEDOR, COMPRA, IVA_CREDITO, DETRACCION, PERCEPCION, RETENCION |
| 7 | **NC/ND CxP** | `NC_COMPRA` | 1 (revierte) | PROVEEDOR↔, COMPRA↔, IVA_CREDITO↔ |
| 9 | **Reporte Compras** `/compras/reportes/gestion-compras` | (reporte, no genera evento) | — | `sp_generar_reporte_compras` |
| — | **Anticipo Proveedor** | `ANTICIPO_PROVEEDOR` | 1 en tesorería | BANCO_SALIDA, ANTICIPO_PROVEEDOR, IVA_ANTICIPO |
| — | **Aplicación Anticipo** | `APLICACION_ANTICIPO` | 1 auxiliar | PROVEEDOR↔, ANTICIPO_PROVEEDOR↔ |
| — | **Entrega a Rendir** | (frontend: Finanzas-Rendición) | 1 | entregas_a_rendir, CAJA/BANCO |

### 3.2 Módulo Ventas — Sprint 1

| # CSV | Frontend (pantalla) | Evento Backend (v2) | Asiento(s) | Componentes activos |
|-------|---------------------|---------------------|------------|---------------------|
| 10 | **Registro Ventas SUNAT** | (reporte) | — | `ventas.sp_generar_registro_ventas` |
| 11 | **Reporte Tributario** | (reporte) | — | — |
| — | **Punto de Venta** | `VENTA_EMITIDA` | 1 en diario ventas | CLIENTE/CAJA_VENTA/BANCO_VENTA, VENTA, IVA_DEBITO, PROPINA, PERCEPCION, ICBPER, INC |
| — | **Cobro Cliente** | `COBRO_REGISTRADO` | 1 en tesorería | BANCO_ENTRADA, CLIENTE↔, DIF_CAMBIO, COMISION_BANCARIA |
| — | **NC Emitida** | `NOTA_CREDITO_EMITIDA` | 1 (revierte) | CLIENTE↔, VENTA↔, IVA_DEBITO↔ |
| — | **ND Emitida** | `NOTA_DEBITO_EMITIDA` | 1 | CLIENTE, VENTA/OTROS_INGRESOS, IVA_DEBITO |
| — | **Liquidación Agregador** | `LIQUIDACION_AGREGADOR` | 1 en diario ventas | AGREGADOR, COMISION_AGREGADOR, IVA_COMISION, PROPINA_PENDIENTE |
| — | **Anticipo Cliente** | `ANTICIPO_CLIENTE` | 1 en caja | BANCO_ENTRADA, ANTICIPO_CLIENTE, IVA_DEBITO |

### 3.3 Módulo Finanzas — Sprint 2

| # CSV | Frontend (pantalla) | Evento Backend (v2) | Asiento(s) |
|-------|---------------------|---------------------|------------|
| 12 | Tipos Documento | (maestro) | — |
| 13 | Conceptos Financieros | (maestro) | — |
| 14 | Flujo de Caja | (maestro) | — |
| 18 | OG — Creación | (intención) | — |
| 19 | OG — Aprobación | (workflow) | — |
| 20 | Rendición Gastos | (workflow) | — |
| 23 | **Cartera Pagos** | `PAGO_PROVEEDOR` | 1 en tesorería: PROVEEDOR, BANCO_SALIDA, DIF_CAMBIO, GMF, ISD |
| — | **Pago Detracción** | `PAGO_DETRACCION` | 1 en tesorería: DETRACCION↔, BANCO_SALIDA |
| 24 | **Cartera Cobros** | `COBRO_REGISTRADO` | 1 en tesorería |
| 25 | Aplicación Documentos | (workflow) | — |
| 26 | Anulación Cartera | `EXTORNO_ASIENTO` | 1 (inversión de líneas) |
| 27 | **Transferencias** | `TRANSFERENCIA_INTERNA` | 1: BANCO_ORIGEN, BANCO_DESTINO, DIF_CAMBIO, ITF, GMF |
| — | **Apertura Caja Chica** | `APERTURA_CAJA_CHICA` | 1: CAJA_CHICA, BANCO_SALIDA |
| — | **Gasto Caja Chica** | `GASTO_CAJA_CHICA` | 1: GASTO_CC, CAJA_CHICA↔ |
| — | **Reposición Caja Chica** | `REPOSICION_CAJA_CHICA` | 1: CAJA_CHICA, BANCO_SALIDA |
| — | **Préstamo Desembolso** | `PRESTAMO_DESEMBOLSADO` | 1: BANCO, PRESTAMO_CAPITAL |
| — | **Cuota Préstamo** | `PRESTAMO_CUOTA_PAGADA` | 1: PRESTAMO_CAPITAL, INTERES_POR_PAGAR, BANCO |
| — | **Factoring** | `LIQUIDACION_FACTORING` | 1: BANCO, GASTO_FINANCIERO, CLIENTE↔ |

### 3.4 Módulo Contabilidad — Sprint 2

| # CSV | Funcionalidad | SP/API |
|-------|--------------|--------|
| 28 | Plan Contable | CRUD/Import |
| 29 | Centros de Costo | Árbol |
| 30 | Matriz Contable | (legacy → deprecar) |
| 31 | Detracciones/Retenciones | CRUD |
| 32 | Impuestos | CRUD |
| 34 | UIT | CRUD |
| 35 | Formato 5.2 Libro Diario | `sp_generar_libro_diario_simplificado` |
| 36 | Formatos SUNAT básicos | `sp_generar_reporte_sunat` |
| 37 | PLE Libros Electrónicos | `sp_generar_libros_electronicos` |

### 3.5 Módulo Activos Fijos — Sprint 3

| # CSV | Frontend | Evento Backend (v2) | Asiento(s) |
|-------|----------|---------------------|------------|
| 38 | Maestro AF (8 pestañas) | (maestro) | — |
| 39-42 | Parámetros AF | (maestro) | — |
| — | **Compra AF** | `COMPRA_ACTIVO_FIJO` | 1: ACTIVO_FIJO, IVA_CREDITO, PROVEEDOR/BANCO |
| 46 | Ratios Depreciación | (configuración) | — |
| 49 | **Cálculo Depreciación** | `DEPRECIACION_MENSUAL` | 1: DEPRECIACION_GASTO, DEPRECIACION_ACUMULADA |
| 50 | **Asientos Depreciación** | (batch desde 49) | — |
| 44 | **Baja Activo** | `BAJA_ACTIVO` / `VENTA_ACTIVO` | 1: DEPRECIACION_ACUM, ACTIVO_FIJO↔, VENTA_ACTIVO, GANANCIA/PERDIDA, IVA |
| 45 | **Revaluación** | `REVALUACION_ACTIVO` | 1: ACTIVO_FIJO, EXCEDENTE_REVALUACION / PERDIDA_REVALUACION |
| 43 | Mejora Capitalizable | `MEJORA_ACTIVO` | 1: MEJORA_ACTIVO, PROVEEDOR |
| — | **Leasing** | `LEASING_INICIADO` | 1: LEASING_ACTIVO, LEASING_PASIVO, IVA |
| 52 | Devengo Seguros | (batch) | 1: gasto seguro, seguro diferido |

### 3.6 Módulo RR.HH — Sprint 3 + 4

| # CSV | Frontend | Evento Backend (v2) | Asiento(s) |
|-------|----------|---------------------|------------|
| 53-60 | Maestros RRHH | (maestro) | — |
| 61 | Asistencias + HE | (operación) | — |
| 69 | **Cálculo Planilla** | `PLANILLA_DEVENGADA` | 1: SUELDOS_GASTO, ESSALUD_GASTO, SCTR_GASTO, SUELDOS_PAGAR, ONP_AFP_PAGAR, ESSALUD_PAGAR |
| — | **Pago Planilla** | `PLANILLA_PAGADA` | 1: SUELDOS_PAGAR↔, ONP_AFP_PAGAR↔, ESSALUD_PAGAR↔, BANCO_SALIDA |
| 70 | **Liquidación Trabajador** | `sp_liquidar_beneficios` | — |
| 71 | **Gratificación** | `PROVISION_GRATIFICACION` | 1: PROVISION_LABORAL, GRATIFICACION_PASIVO |
| 71 | **CTS** | `PROVISION_CTS` | 1: PROVISION_LABORAL, CTS_PASIVO |
| — | **Provisión Vacaciones** | `PROVISION_VACACIONES` | 1: PROVISION_LABORAL, VACACIONES_PASIVO |
| 72 | Saldos CC | `sp_generar_pago_remuneraciones` | — |
| 73 | Boletas | `sp_generar_boleta_pago` | — |

### 3.7 Módulo Inventario / Producción

| Evento Backend (v2) | Descripción | Asientos |
|---------------------|-------------|----------|
| `COMPRA_INVENTARIO` | Compra de mercadería con entrada a almacén | **2**: (A) compras + (B) entrada inventario |
| `CONSUMO_PRODUCCION` | Consumo de materia prima para producción | 1: CONSUMO_PP, INVENTARIO↔ |
| `PRODUCCION_TERMINADA` | Producto terminado entra a almacén | 1: PROD_TERMINADA, CONSUMO_PP↔ |
| `MERMA_REGISTRADA` | Merma normal/extraordinaria | 1: MERMA, INVENTARIO↔ |
| `AJUSTE_INVENTARIO` | Sobrante/faltante post-conteo físico | 1: INVENTARIO, AJUSTE_INVENTARIO |
| `TRANSFERENCIA_ALMACEN` | Traslado entre almacenes | 1: INVENTARIO destino/origen |

---

## 4. CATÁLOGO DE COMPONENTES (Roles Contables)

### 4.1 Tipos de Componente

| Tipo | Posición | Descripción | Dirección típica |
|------|----------|-------------|------------------|
| **contrapartida** | 1 (terceros) | Tercero (cliente, proveedor, banco, caja) | debe/haber según contexto |
| **ingreso** | 2 (base) | Ingreso por venta o ganancia | haber |
| **gasto** | 2 (base) | Gasto, costo, consumo | debe |
| **impuesto** | 3 (impuestos) | IVA, percepción, retención, ITF, ICBPER | debe/haber según crédito/débito |
| **puente** | 4 (puente) | Detracción, anticipos, pasivo laboral, gift cards | haber (pasivo), debe (activo) |
| **ajuste** | 5 (ajuste) | Diferencia de cambio, comisión bancaria, faltante | según cálculo |

### 4.2 Componentes por Módulo (79 documentados)

#### Ventas
`VENTA`, `VENTA_EXPORTACION`, `VENTA_DESCUENTO`, `CLIENTE`, `CAJA_VENTA`, `BANCO_VENTA`, `PROPINA`, `CANAL_COMISION`, `CONTRACARGO`, `CONTRACARGO_RECUPERADO`, `PUNTO_FIDELIDAD`, `DESCUENTO_CONCEDIDO`, `GIFT_CARD`, `SALDO_FAVOR_CLIENTE`, `FALTANTE_CAJA`, `DIFERENCIA_LIQUIDACION`, `CLIENTE_PERCEPCION`, `RETENCION_CLIENTE`, `AGREGADOR`, `COMISION_AGREGADOR`, `IVA_COMISION`

#### Compras
`COMPRA`, `COMPRA_EXPORTACION`, `PROVEEDOR`, `CAJA_COMPRA`, `IVA` (crédito/débito), `DETRACCION`, `PERCEPCION`, `RETENCION`, `DESTINO_INVENTARIO`, `ANTICIPO_PROVEEDOR`

#### Bancos / Tesorería
`BANCO`, `BANCO_DETRACCIONES`, `TRANSFERENCIA_ORIGEN`, `TRANSFERENCIA_DESTINO`, `CAJA_CHICA`, `COMISION_BANCARIA`, `ITF`, `COMPENSACION_CXC`, `COMPENSACION_CXP`, `ANTICIPO_CLIENTE`, `DIF_CAMBIO`, `GASTO_FINANCIERO`, `INTERES_POR_PAGAR`, `PRESTAMO_CAPITAL`

#### Activos Fijos
`ACTIVO_FIJO`, `DEPRECIACION_GASTO`, `DEPRECIACION_ACUMULADA`, `BAJA_ACTIVO`, `REVALUACION_ACTIVO`, `MEJORA_ACTIVO`, `LEASING_ACTIVO`, `LEASING_PASIVO`

#### Planillas
`PLANILLA_DEVENGADA`, `PLANILLA_PAGADA`, `APORTES_PAGADOS`, `PROVISION_LABORAL`, `PLANILLA_BATCH` (técnico), `VACACIONES_PASIVO`, `CTS_PASIVO`, `GRATIFICACION_PASIVO`

#### Producción / Inventario
`COSTO_PRODUCCION`, `INVENTARIO_MP`, `INVENTARIO_PT`, `MERMA_PRODUCCION`, `MERMA_TRANSITO`, `COSTO_VENTA`

#### Inter-Company
`INTER_EMPRESA_VENTA`, `INTER_EMPRESA_COSTO_VENTA`, `INTER_EMPRESA_COMPRA`, `INTER_EMPRESA_INVENTARIO`

#### País Específico
`ICBPER` (PE), `INC` (CO), `ISD` (EC), `GMF` (CO), `RETE_ICA` (CO), `RETE_FUENTE` (CO), `RETE_IVA` (CO), `ISO_ACREDITABLE` (GT)

---

## 5. ACTORES Y PERMISOS

| Actor | Permisos clave | Módulos |
|-------|---------------|---------|
| **Comprador** | COM-002 "comprador activo" | OC, OS |
| **Aprobador N1** (Jefe Compras) | COM-022 | Aprobación OC nivel 1 |
| **Aprobador N2** (Gerente Finanzas) | COM-022 | Aprobación OC > S/20,000 |
| **Supervisor Financiero** | Aprobar facturas | CxP, asientos |
| **Usuario Tesorería** | Cartera, transferencias | Pagos, cobros |
| **Usuario Contabilidad** | Plan contable, PLE, reportes SUNAT | Contabilidad |
| **Usuario Activos Fijos** | AF, depreciación, revaluación, bajas | Activos Fijos |
| **Usuario RRHH** | Personal, planillas, liquidaciones | RRHH |
| **pcastillo** (QA) | Acceso limitado | **NO tiene COM-002 ni COM-022** ⚠️ |

### Bloqueantes Conocidos

| Bug | Error | Impacto |
|-----|-------|---------|
| #006 | pcastillo sin COM-002 "comprador activo" | 🔴 Bloquea creación de OC |
| #010 | pcastillo sin COM-022 "aprobador configurado" | 🔴 Bloquea aprobación de OC |

---

## 6. MATRIZ DE REGLAS DE NEGOCIO CONSOLIDADA

| Regla | Módulo | Responsable | Motor v2 |
|-------|--------|-------------|----------|
| RUC/DNI único por país | Proveedores | Frontend | Validación en `regla_cuenta_componente.partner_tipo` |
| Solo proveedores activos en OC | OC | Frontend autocompletado | Condición en payload `partner_id` |
| OC no editable en Aprobada/Cerrada | OC | Frontend bloquea UI | — |
| Aprobación multinivel > S/20,000 | OC | Frontend workflow | — |
| Aprobador ≠ creador de OC | OC | Frontend/API validation | — |
| Factura duplicada: Razón + Proveedor + N° + Año | CxP | API validation | Paso 6: idempotencia (`origen + origen_id`) |
| Factura Aprobada solo anulable vía NC | CxP | Frontend bloquea | `EXTORNO_ASIENTO` (inmutable + reversión) |
| Monto ajuste ≤ saldo pendiente | NC/ND | API validation | Paso 6: validación del payload |
| Bloqueo ajuste sobre factura cancelada | NC/ND | API validation | Validación `estado != "Cancelada"` |
| Detracción solo OC > S/700 | CxP | API validation | Condición `tiene_detraccion = true` |
| Saldo = total - detracción | CxP | Motor v2 | Paso 4: cálculo `total - (total × %detraccion)` |
| Tasa depreciación 0-100%, residual ≤ 20% | AF | Frontend validation | — |
| Distribución depreciación suma 100% por CC | AF | Frontend validation | — |
| Solo una matriz activa por subclase | AF | Frontend/API | `regla_cuenta_componente` única por `componente_id` |
| Períodos nómina sin solapamiento | RRHH | Frontend validation | — |
| Una RMV vigente por período | RRHH | Frontend validation | — |
| Préstamo tope % del sueldo | RRHH | API validation | — |
| Vacaciones: no exceder saldo disponible | RRHH | `trg_actualizar_dias_gozados` | — |
| Planilla no recalcular si período cerrado | RRHH | API validation | Paso 6: validación de período abierto |
| Boletas requieren planilla calculada | RRHH | API validation | — |
| Inmutabilidad contable | TODOS | Motor v2 | Paso 7 + 9: `asiento_original_id` + extorno |
| Idempotencia | TODOS | Motor v2 | `UNIQUE (origen, origen_id)` |
| Debe = Haber (tolerancia 0.01) | TODOS | Motor v2 | Paso 6: validación final |

---

## 7. RUTAS DEL FRONTEND MAPEADAS

### Confirmadas (Sprinter)

| Módulo | Ruta | Pantalla | # CSV |
|--------|------|----------|-------|
| Auth | `/auth/signin` | Login | — |
| Auth | `/auth/seleccion-razon-social` | Seleccionar Empresa | — |
| Dashboard | `/inicio` | Inicio | — |
| Compras | `/compras/tabla/gestion-proveedores` | Gestión Proveedores | 1 |
| Compras | `/compras/operaciones/ordenes-compra` | Generar OC | 2 |
| Compras | `/compras/operaciones/aprobar-compra` | Aprobar OC | 3 |
| Compras | `/compras/operaciones/registro-comprobantes` | Registro Comprobantes | 6 |
| Compras | `/compras/reportes/gestion-compras` | Gestión Compras | 9 |
| Ventas | `/ventas/facturacion-de-regalias` | Registro Facturas | — |
| Finanzas | `/finanzas/consultas/consultas-saldos-caja-bancos` | Consulta Saldos | — |
| Finanzas | `/finanzas/tesoreria/mov-cuentas-banc-y-cajas` | Mov. Cuentas | — |

### Pendientes de Mapear (~40 rutas)

| # CSV | Pantalla | Módulo |
|-------|----------|--------|
| 4 | OS → Generación | Compras |
| 5 | OS → Aprobación | Compras |
| 7 | NC/ND x Pagar | Compras |
| 8 | DPD Individual | Compras |
| 10 | Registro Ventas SUNAT | Ventas |
| 11 | Reporte Tributario | Ventas |
| 15 | Cuenta Bancaria | Finanzas |
| 16 | Medios de Pago SUNAT | Finanzas |
| 17 | Formas de Pago SUNAT | Finanzas |
| 33 | Tipo de Cambio | Contabilidad |
| 12-14 | Tablas Financieras | Finanzas |
| 18-22 | OG + Rendición | Finanzas |
| 23-27 | Cartera Pagos/Cobros/Transferencias | Finanzas |
| 28-37 | Tablas Contables + Reportes SUNAT | Contabilidad |
| 38-42 | Maestro AF + Parámetros | Activos Fijos |
| 43-44 | Operaciones Especiales + Bajas | Activos Fijos |
| 45-52 | Procesos AF | Activos Fijos |
| 53-58 | Maestros RRHH | RRHH |
| 61-73 | Operaciones + Procesos RRHH | RRHH |

---

## 8. ESTADO ACTUAL DE AUTOMATIZACIÓN (Playwright)

### Implementado

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| `tests/smoke/login.spec.js` | Login flow completo (1 test) | ✅ Funcional |
| `tests/e2e/sprint-1/sprint-1.spec.js` | CRUD proveedor + navegación E2E (2 tests) | ⚠️ Intermitente (Angular detección de cambios) |
| `playwright.config.js` | Config base: chromium, 3 workers, baseURL | ✅ |

### Sin Implementar

- [ ] Sprint 1 completo (~48 CP sin automatizar)
- [ ] Sprint 2 completo (25 CP)
- [ ] Sprint 3 completo (33 CP)
- [ ] Sprint 4 completo (56 CP)
- [ ] Page Objects como módulos separados
- [ ] ~40 rutas por mapear
- [ ] Usuario QA con permisos (COM-002, COM-022)

---

## 9. GAPS FUNCIONALES (Fuente: CSVs Casos por Módulo)

### Compras (60 casos analizados)

| Soporte | Cantidad | Temas |
|---------|----------|-------|
| ✅ SÍ | ~28 | Factura + stock, OC, recepción, NC/ND, detracción, percepción, activo fijo |
| ⚠️ PARCIAL | ~12 | Pago parcial, pago mixto, caja chica, anticipo sin documento, tarjeta crédito, flete, rendición con reembolso |
| ❌ NO | ~3 | Creación pantalla caja chica, reposición caja chica |

### Ventas (49 casos analizados)

| Soporte | Cantidad | Temas |
|---------|----------|-------|
| ✅ SÍ | ~30 | Venta efectivo, tarjeta, billeteras, agregadores, gift cards, ecommerce |
| ⚠️ PARCIAL | ~5 | Venta mixta cobro/crédito, detracción cliente, prorrata IGV |
| ❌ NO | ~3 | Factura con detracción del cliente, anticipos sin factura |

---

## 10. MOTOR DE ASIENTOS v2 — PLAN DE MIGRACIÓN

### 10.1 Datos Actuales

| Recurso | Cantidad | Acción |
|---------|----------|--------|
| Matrices contables | 770 | 🗑️ Deprecar → `_legacy` |
| Líneas de matriz | 1,093 | 🗑️ Deprecar → `_legacy` |
| Cuentas PCGE | 7,649 | ✏️ ALTER (ADD columnas) |
| Asientos | 30 | ✏️ ALTER (ADD columnas) |
| Tablas nuevas | 8 | 🆕 CREATE |

### 10.2 Pipeline del Motor v2 (10 Pasos)

```
1. RECIBIR → validar payload
2. EVALUAR REGLAS → regla_activacion + condiciones JSONB
3. RESOLVER CUENTAS → fallback progresivo (partner → categoría → regla → país)
4. CALCULAR MONTOS → según tipo (ingreso/gasto/impuesto/contrapartida/puente/ajuste)
5. ORDENAR → por posición (terceros → base → impuestos → puente → ajuste)
6. VALIDAR → Debe=Haber, cuentas activas, período abierto, idempotencia
7. PERSISTIR → INSERT en transacción
8. EFECTOS SECUNDARIOS → CxC/CxP, kárdex, presupuesto
9. EMITIR EVENTO SALIDA → AsientoContabilizado
10. EXPORTAR REPORTES → SUNAT/DIAN/SRI
```

### 10.3 Timeline Estimado

| Fase | Semanas | Actividad principal |
|------|---------|---------------------|
| 0 | 1-2 | Análisis de 770 matrices, mapeo a componentes |
| 1 | 2-3 | Pipeline, tablas nuevas, endpoint genérico |
| 2 | 2-3 | Resolución de cuentas, cálculos de montos |
| 3 | 2-3 | Validaciones, persistencia, efectos secundarios |
| 4 | 2-3 | Emisión de eventos, reportes, extornos, pruebas E2E |
| **Total** | **10-14** | Con 2 backends dedicados |

---

## 11. SPs Y FUNCIONES REFERENCIADAS

| Tipo | Nombre | Módulo | Sprint |
|------|--------|--------|--------|
| SP | `sp_generar_reporte_compras` | Compras | S1 |
| SP | `sp_generar_registro_ventas` | Ventas | S1 |
| FN | `fn_obtener_tipo_cambio` | Contabilidad | S1 |
| SP | `sp_generar_libro_diario_simplificado` | Contabilidad | S2 |
| SP | `sp_generar_reporte_sunat` | Contabilidad | S2 |
| SP | `sp_generar_libros_electronicos` | Contabilidad | S2 |
| SP | `sp_baja_activo_venta` | Activos Fijos | S3 |
| SP | `sp_calcular_depreciacion` | Activos Fijos | S3 |
| SP | `sp_revaluacion_activo` | Activos Fijos | S3 |
| FN | `fn_valor_neto_activo` | Activos Fijos | S3 |
| SP | `sp_calcular_propinas` | RRHH | S4 |
| SP | `sp_calcular_recargo_consumo` | RRHH | S4 |
| SP | `sp_calcular_planilla` | RRHH | S4 |
| SP | `sp_liquidar_beneficios` | RRHH | S4 |
| SP | `sp_calcular_gratificacion` | RRHH | S4 |
| SP | `sp_calcular_cts` | RRHH | S4 |
| SP | `sp_generar_pago_remuneraciones` | RRHH | S4 |
| SP | `sp_generar_boleta_pago` | RRHH | S4 |

---

## 12. RESULTADOS DE EJECUCIÓN MANUAL (Sprint 1)

| Métrica | Valor |
|---------|-------|
| Total ejecutados | 15 casos |
| Pasaron ✅ | 11 (73%) |
| Fallaron ❌ | 1 (error 403 en aprobación OC) |
| Bloqueados 🚫 | 2 (falta permisos COM-002, COM-022) |
| No aplica ➖ | 1 |
| Bugs reportados | 10 (#001 al #010) |
| Críticos | #006, #010 (permisos de usuario) |

---

## 13. CASOS DE PRUEBA DOCUMENTADOS (Resumen)

| Sprint | CPs Frontend | Gherkin Scenarios | Casos Módulo CSV | Total |
|--------|-------------|-------------------|------------------|-------|
| S1 | 51 | 39 | 60 (Compras) + 49 (Ventas) | 199 |
| S2 | 25 | 18 | — | 43 |
| S3 | 33 | 23 | — | 56 |
| S4 | 56 | 26 | — | 82 |
| **Total** | **165** | **106** | **109** | **380** |

---

## 14. ADMIN APIs — Motor de Asientos v2 🆕

> **Fuente:** `10-GESTION_REGLAS.md` §7 — 22 endpoints no listados en `03-ARQUITECTURA.md`

### Gestión de Componentes

`GET/POST/PUT/DELETE` `/api/admin/componentes` y `/api/admin/componentes/{id}`

### Gestión de Reglas de Activación

`GET/POST/PUT/DELETE` `/api/admin/reglas-activacion` + `POST /validar` (condición vs payload)

### Gestión de Reglas de Cuenta

`GET/POST/PUT/DELETE` `/api/admin/reglas-cuenta` + `POST /simular` (resolución para contexto dado)

### Simulación y Debugging (clave para QA)

| Método | Endpoint | Propósito |
|:-------|:---------|:----------|
| `POST` | `/api/admin/asientos/simular` | Pipeline hasta paso 6 sin persistir → asiento borrador + trazabilidad |
| `POST` | `/api/admin/asientos/trazar` | Simular + detalle: "Componente X → regla Y, condición Z → cuenta W" |
| `GET` | `/api/admin/asientos/{id}/trazabilidad` | Trazabilidad de asiento contabilizado |

### Gestión de Países

`GET/POST` `/api/admin/paises`, `GET /{id}/configuracion`, `GET /{id}/cobertura`

---

## 15. CADENAS DE RESOLUCIÓN DE CUENTAS 🆕

> **Fuente:** `08-REGLA_CUENTA.md`

### 15.1 Fallback Progresivo (para cada componente)

```
1. partner.cuenta_contable_id / producto_categoria.cuenta_default_id
2. regla_cuenta_componente con TODOS los filtros
3. Sacando filtros: concepto → moneda → clasificación → partner_tipo → categoría → tipo_transacción
4. Solo pais_id + componente_id
5. Error: CUENTA_NO_CONFIGURADA (con sugerencia de INSERT)
```

### 15.2 Fórmulas por Tipo de Componente

| Tipo | Fórmula | Ejemplo (118, IVA 18%) |
|:-----|:--------|:------------------------|
| `ingreso`/`gasto` | `base = total / (1 + tasa)` | 100 |
| `impuesto` | `base × tasa` | 18 |
| `contrapartida` | `Σ(montos opuestos)` | 118 |
| `puente` | `total × %` | 11.80 (10%) |
| `ajuste` | `monto × (TC_nuevo − TC_original)` | 100 (Δ0.10) |

**Regla de redondeo:** `impuesto = total − base` (NO calcular por separado).

### 15.3 Ejemplo Multi-País — COMPRA_REGISTRADA

| Componente | Perú (PCGE) | Colombia (PUC) | Ecuador (SRI) |
|:-----------|:------------|:---------------|:--------------|
| COMPRA | 63 Servicios | 6210 Servicios informática | 63 Servicios |
| IVA | 40111 Crédito fiscal | 240801 IVA descontable | 4011 Crédito fiscal |
| PROVEEDOR | 421 | 451 | 421 |
| Imp. extra | — | ReteFuente 2365, ReteIVA 2367, ReteICA 2368 | ISD 63 |

### 15.4 Errores

| Error | Mensaje |
|:------|:--------|
| `CUENTA_NO_CONFIGURADA` | Incluye sugerencia de INSERT |
| `CUENTA_INACTIVA` | ID y nombre de la cuenta |
| `CUENTA_SIN_MOVIMIENTO` | Cuenta no imputable |

---

## 16. MODELO OPERATIVO 🆕

> **Fuente:** `10-GESTION_REGLAS.md` §1, §5.3, §6.3, §8–§10

### 16.1 Roles

| Rol | Qué hace | Cómo |
|:----|:---------|:-----|
| Contador/Configurador | Cuentas, reglas, tasas | SQL / Admin UI (sin deploy) |
| Arquitecto/Backend | Componentes nuevos, pipeline | Código Java |
| PO | Eventos del negocio | Contratos API |
| QA | Debugging | `POST /simular`, `POST /trazar` |

### 16.2 Autoservicio: 90% sin backend

✅ Crear cuenta, cambiar cuenta, activar/desactivar regla, agregar regla, cambiar tasa, agregar país
❌ Crear componente nuevo, modificar pipeline, agregar evento

### 16.3 Debugging para QA

**Sin IVA:** ① `componente_contable WHERE codigo='IVA'` → ② `regla_activacion` → ③ Condición vs payload → ④ `regla_cuenta_componente` → ⑤ Cuenta activa e imputable

**Cuenta incorrecta:** ① `partner.cuenta_contable_id` → ② `producto_categoria.cuenta_default` → ③ Reglas ORDER BY prioridad → ④ `POST /simular`

### 16.4 Migración de Plan de Cuentas

Crear cuenta nueva → `UPDATE reglas` → verificar sin huérfanas → desactivar vieja → `POST /simular`. Rollback desde `auditoria_asiento`.

### 16.5 Versionado (MVP vs Futuro)

**MVP:** Sin vigencia. Reglas vivas. **Futuro:** `vigente_desde/hasta`.
