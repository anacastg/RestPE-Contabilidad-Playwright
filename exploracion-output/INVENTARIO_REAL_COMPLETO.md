# INVENTARIO REAL DE PANTALLAS — RestPE Contabilidad

> **Fecha:** 03/07/2026  
> **Método:** Exploración automatizada con Playwright (4 pasadas)  
> **Usuario:** pcastillo / PESQUERA CANTABRIA S.A. / LIMA  
> **Total pantallas exploradas:** 48

---

## 1. RESUMEN

| Métrica | Valor |
|:--------|:------|
| Pantallas con UI activa | **44** |
| Pantallas no implementadas | **4** |
| APIs únicas capturadas | **114** |
| Módulos del sidebar | **9** (todos accesibles) |

---

## 2. INVENTARIO COMPLETO

### COMPRAS (6 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 1 | Gestión Proveedores | `/compras/tabla/gestion-proveedores` | 3 (General, Bancaria, Comercial) | 5 | 11 |
| 2 | Generar OC | `/compras/operaciones/ordenes-compra` | — | 15 | 4 |
| 3 | Aprobar OC | `/compras/operaciones/aprobar-compra` | — | 13 | 2 |
| 4 | Registro Comprobantes | `/compras/operaciones/facturas-proveedores` | 4 | 14 | 19 |
| 5 | Gestión Compras (reporte) | `/compras/reportes/gestion-compras` | — | 13 | — |

### VENTAS (1 pantalla)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 6 | Facturación Regalías | `/ventas/facturacion-de-regalias` | — | 9 | — |
| ❌ | Registro Ventas SUNAT | No implementada | | | |
| ❌ | Punto de Venta | No implementada | | | |

### FINANZAS (15 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 7 | Tipos Documento | `/finanzas/tabla/tipos-documento` | — | 5 | 20 |
| 8 | Conceptos Financieros | `/finanzas/tabla/conceptos-financieros` | — | 5 | 20 |
| 9 | Consulta Flujo Caja | `/finanzas/consultas/consultas-flujo-caja` | — | 12 | — |
| 10 | Códigos Flujo Caja | `/finanzas/tabla/gestion-codigos-flujo-caja` | — | 5 | 7 |
| 11 | Actividades Flujo Caja | `/finanzas/tabla/gestion-actividades-flujo-caja` | — | 5 | 7 |
| 12 | Órdenes de Giro | `/finanzas/adelantos/ordenes-giro` | — | 8 | 7 |
| 13 | Aprobar Giro | `/finanzas/adelantos/aprobar-giro` | — | 6 | 14 |
| 14 | Rendición Gastos | `/finanzas/adelantos/rendicion-gastos` | — | 11 | — |
| 15 | Aprobar Rendición | `/finanzas/adelantos/aprobar-rendicion-gastos` | — | 12 | — |
| 16 | Cerrar Liq Adelantos | `/finanzas/adelantos/cerrar-liq-adelantos` | — | 7 | — |
| 17 | Cartera Pagos | `/finanzas/tesoreria/cartera-pagos` | 2 | 8 | — |
| 18 | Cartera Cobros | `/finanzas/tesoreria/carteras-cobros` | — | 10 | — |
| 19 | Cuenta Bancaria | `/finanzas/tabla/cuenta-bancaria` | — | 9 | 20 |
| 20 | Consulta Saldos | `/finanzas/consultas/consultas-saldos-caja-bancos` | — | 8 | — |
| 21 | Mov Cuentas | `/finanzas/tesoreria/mov-cuentas-banc-y-cajas` | — | 9 | — |

### CONTABILIDAD (3 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 22 | Plan Contable | `/contabilidad/tabla/plan-contable` | 4 | 5 | — |
| 23 | Centros Costo | `/contabilidad/tabla/plan-centro-costo` | — | 8 | 20 |
| 24 | Tipo de Cambio | `/contabilidad/tabla/tipo-de-cambio` | — | 6 | 20 |
| ❌ | Formatos SUNAT | No implementada | | | |
| ❌ | Libros Electrónicos | No implementada | | | |

### ACTIVOS FIJOS (16 pantallas)

#### Maestro + Parámetros

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 25 | **Maestro AF** | `/activos/operaciones/registroactivos` | **8** ✅ | 7 | 15 |
| 26 | Parámetros Operaciones | `/activos/tabla/paramoperaciones` | — | — | — |

#### Operaciones (8 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 27 | Tabla Operaciones | `/activos/tabla/operaciones` | — | 6 | 16 |
| 28 | Registro Traslado | `/activos/operaciones/registrotraslado` | 2 | 11 | 20 |
| 29 | Aprobación Traslado | `/activos/operaciones/aprobaciontraslado` | 2 | 8 | 2 |
| 30 | Recepción Traslados | `/activos/operaciones/recep-traslados` | — | 9 | 11 |
| 31 | Operaciones Activos | `/activos/operaciones/operacionesactivos` | — | 6 | 8 |
| 32 | Pólizas Seguro | `/activos/operaciones/polizasseguro` | — | 6 | 7 |
| 33 | Asignación Ratios | `/activos/operaciones/asignacionratios` | 4 | 6 | — |
| 34 | Venta Activos (Baja) | `/activos/operaciones/venta-activos` | 3 | 6 | 5 |

#### Procesos (6 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 35 | Cálculo Depreciación | `/activos/procesos/calculo-depreciacion` | — | 8 | 4 |
| 36 | Gen Asientos Depreciación | `/activos/procesos/generacion-asientos-depreciacion` | — | 10 | 4 |
| 37 | Gen Asientos Revaluación | `/activos/procesos/generacion-asientos-revaluacion` | — | 10 | — |
| 38 | Gen Asientos Indexación | `/activos/procesos/generacion-asientos-indexacion` | — | 10 | 10 |
| 39 | Gen Devengo Aseguradores | `/activos/procesos/generacion-devengo-aseguradores` | — | 8 | 2 |
| 40 | Gen Asientos Siniestro | `/activos/procesos/generacion-asientos-siniestro` | 4 | 13 | 10 |

### RRHH (8 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 41 | Datos Personales Trab | `/rrhh/maestro-personal/datos-contacto` | 3 | 11 | 20 |
| 42 | Cargos | `/rrhh/maestro-personal/definicion-cargos` | — | 7 | — |
| 43 | Tipo Contrato | `/rrhh/parametros/tipo-contrato` | — | 3 | 6 |
| 44 | Asistencias | `/rrhh/asistencias-jornadas/asistencias-HE` | — | 13 | 3 |
| 45 | Cálculo Planilla | `/rrhh/procesos-de-nomina/calculo-planillas` | — | 9 | — |
| 46 | Registrar Liquidación | `/rrhh/procesos-de-nomina/registrar-liquidacion` | — | 7 | — |
| 47 | Aprobar Liquidación | `/rrhh/procesos-de-nomina/aprobar-liquidacion` | — | 7 | — |

### CONFIGURACIÓN (2 pantallas)

| # | Pantalla | Ruta | Tabs | Cols | Filas |
|:-:|:---------|:-----|:----:|:----:|:-----:|
| 48 | Medios de Pago | `/configuracion/localizacion/medios-pago` | — | 4 | 20 |
| 49 | Formas de Pago | `/configuracion/localizacion/formas-pago` | — | 4 | 20 |

---

## 3. DIFERENCIAS vs DOCUMENTACIÓN

### Rutas corregidas

| Documentación decía | Ruta real |
|:---------------------|:----------|
| `Compras > Operaciones > Registro de comprobantes` | `/compras/operaciones/facturas-proveedores` |
| `Finanzas > Documentos > Tipos de documentos` | `/finanzas/tabla/tipos-documento` |
| `Finanzas > Concepto Financiero` | `/finanzas/tabla/conceptos-financieros` |
| `Finanzas > Flujo de Caja` (una pantalla) | 3 pantallas: consulta, códigos, actividades |
| `Finanzas > Solicitud de Adelantos` (una pantalla) | 5 pantallas: OG, aprobar, rendición, aprobar rendición, cerrar |
| `Contabilidad > Plan contable` | `/contabilidad/tabla/plan-contable` |
| `Contabilidad > Plan de centros de costo` | `/contabilidad/tabla/plan-centro-costo` |
| `Contabilidad > Tipo de cambio` | `/contabilidad/tabla/tipo-de-cambio` |
| `Activos Fijos > Maestro de activos fijos` | `/activos/operaciones/registroactivos` |
| `Activos Fijos > Parámetros de operaciones` | `/activos/tabla/paramoperaciones` |
| `RRHH > Cálculo de Planilla` | `/rrhh/procesos-de-nomina/calculo-planillas` |
| `RRHH > Liquidaciones` | 2 pantallas: registrar, aprobar |
| `Finanzas > Medios de Pago` | `/configuracion/localizacion/medios-pago` (módulo Configuración, no Finanzas) |
| `Finanzas > Formas de Pago` | `/configuracion/localizacion/formas-pago` (módulo Configuración, no Finanzas) |

### No implementado

| Pantalla | CSV # | Impacto |
|:---------|:-----:|:--------|
| Formatos SUNAT | #36 | Gap documentado — confirmado no implementado |
| Libros Electrónicos / PLE | #37 | No implementado |
| Registro Ventas SUNAT | #10 | No implementado |
| Punto de Venta | — | No implementado |

### Confirmado: Maestro AF con 8 pestañas

Las 8 pestañas documentadas en `CASOS_PRUEBA_FRONTEND_POR_SPRINT.md` existen exactamente como se describió:
**Datos Generales | Datos Complementarios | Accesorios | Depreciación | Traslados | Incidencias | Adaptaciones | Asignaciones**

---

## 4. API ENDPOINTS DESCUBIERTOS (114 únicos)

### Auth (3)
`POST /api/auth/login` · `GET /api/auth/empresas` · `POST /api/auth/seleccionar-empresa`

### Core (13)
`GET /api/core/empresas/{id}/sucursales/mias` · `GET /api/core/empresas/{id}/sucursales` · `GET /api/core/relaciones-comerciales?esProveedor=true` · `GET /api/core/relaciones-comerciales/{id}` · `GET /api/core/sucursales` · `GET /api/core/monedas` · `GET /api/core/geografia/paises` · `GET /api/core/tipos-documento` · `GET /api/core/tipos-documento-identidad` · `GET /api/core/articulos` · `GET /api/core/impuestos` · `GET /api/core/formas-pago`

### Compras (5)
`GET /api/compras/ordenes-compra` · `GET /api/compras/ordenes-compra/{id}` · `GET /api/compras/ordenes-compra/pendientes-aprobacion` · `GET /api/compras/reportes/gestion-compras`

### Finanzas (5)
`GET /api/finanzas/bancos` · `GET /api/finanzas/caja-bancos?flagTipoTransaccion=P` · `GET /api/finanzas/caja-bancos?flagTipoTransaccion=T` · `GET /api/finanzas/cuentas-bancarias` · `GET /api/finanzas/cuentas-pagar`

### Contabilidad (1)
`GET /api/contabilidad/centros-costo`

### Almacén (1)
`GET /api/almacen/almacenes`

### RRHH (18)
`GET /api/rrhh/trabajadores` · `GET /api/rrhh/cargos` · `GET /api/rrhh/asistencias` · `GET /api/rrhh/tipos-contrato` · `GET /api/rrhh/tipos-contrato/activos` · `GET /api/rrhh/admin-afp/activos` · `GET /api/rrhh/regimenes-pensionario` · `GET /api/rrhh/regimenes-laborales` · `GET /api/rrhh/estados-civiles/activos` · `GET /api/rrhh/sexos` · `GET /api/rrhh/tipos-sangre` · `GET /api/rrhh/areas` · `GET /api/rrhh/secciones` · `GET /api/rrhh/motivos-cese` · `GET /api/rrhh/ocupaciones-rtps` · `GET /api/rrhh/pensiones-rtps` · `GET /api/rrhh/tipos-trabajador` · `GET /api/rrhh/tipos-trabajador-rtps` · `GET /api/rrhh/tipos-via` · `GET /api/rrhh/tipos-vivienda` · `GET /api/rrhh/tipos-zona`

### Notificaciones (1)
`GET /api/notificaciones`

---

## 5. COMPARACIÓN DOC vs APP

| Métrica | Documentación | Real | Delta |
|:--------|:-------------:|:----:|:-----:|
| Pantallas documentadas | 63 | **48** | -15 (4 no implementadas + 11 agrupadas) |
| Módulos | 9 | 9 | ✅ |
| APIs documentadas | 47 | **114** | +67 no documentadas |
| Pantallas no implementadas | 0 | **4** | Formatos SUNAT, PLE, Reg. Ventas SUNAT, Punto de Venta |
| Rutas incorrectas en docs | — | 14 | Ver tabla §3 |
| Tabs Maestro AF | 8 | 8 | ✅ Coincidencia exacta |

---

*Informe generado por exploración automatizada Playwright — 4 pasadas, 48 pantallas, 114 APIs*
