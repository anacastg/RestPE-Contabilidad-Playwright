# INFORME DE DESCUBRIMIENTO FUNCIONAL — RestPE Contabilidad

> **Fecha:** 2026-07-03
> **Ambiente:** https://panel.dev.contabilidad.restaurant.pe
> **Usuario:** pcastillo
> **Empresa:** PESQUERA CANTABRIA S.A.

---

## 1. Resumen

| Métrica | Valor |
|:--------|:------|
| Pantallas exploradas | 30 |
| APIs capturadas | 114 |
| Módulos sidebar | 9 |
| En doc y app | 30 |
| Solo en doc | 0 |
| Solo en app | 0 |
| Con diferencias | 0 |

---

## 2. Sidebar Descubierto

- **Almacén** → ``
- **Compras** → ``
- **Ventas** → ``
- **Finanzas** → ``
- **Contabilidad** → ``
- **Activos fijos** → ``
- **RR.HH** → ``
- **Producción** → ``
- **Configuración** → ``

---

## 3. Inventario de Pantallas

| Módulo | Pantalla | Ruta intentada | URL real | Acceso |
|:-------|:---------|:---------------|:---------|:------:|
| Compras | Gestión Proveedores | `/compras/tabla/gestion-proveedores` | `/compras/tabla/gestion-proveedores` | ✅ |
| Compras | Generar OC | `/compras/operaciones/ordenes-compra` | `/compras/operaciones/ordenes-compra` | ✅ |
| Compras | Aprobar OC | `/compras/operaciones/aprobar-compra` | `/compras/operaciones/aprobar-compra` | ✅ |
| Compras | Registro Comprobantes | `/compras/operaciones/registro-comprobantes` | `/compras/operaciones/registro-comprobantes` | ✅ |
| Compras | Gestión Compras | `/compras/reportes/gestion-compras` | `/compras/reportes/gestion-compras` | ✅ |
| Ventas | Facturación Regalías | `/ventas/facturacion-de-regalias` | `/ventas/facturacion-de-regalias` | ✅ |
| Finanzas | Consulta Saldos | `/finanzas/consultas/consultas-saldos-caja-bancos` | `/finanzas/consultas/consultas-saldos-caja-bancos` | ✅ |
| Finanzas | Mov Cuentas | `/finanzas/tesoreria/mov-cuentas-banc-y-cajas` | `/finanzas/tesoreria/mov-cuentas-banc-y-cajas` | ✅ |
| Finanzas | Tipos Documento | `/finanzas/documentos/tipos-documentos` | `/finanzas/documentos/tipos-documentos` | ✅ |
| Finanzas | Conceptos Financieros | `/finanzas/concepto-financiero` | `/finanzas/concepto-financiero` | ✅ |
| Finanzas | Flujo de Caja | `/finanzas/flujo-caja` | `/finanzas/flujo-caja` | ✅ |
| Finanzas | Solicitud Adelantos | `/finanzas/solicitud-adelantos` | `/finanzas/solicitud-adelantos` | ✅ |
| Finanzas | Cartera Pagos | `/finanzas/tesoreria/cartera-pagos` | `/finanzas/tesoreria/cartera-pagos` | ✅ |
| Finanzas | Transferencias | `/finanzas/transferencias` | `/finanzas/transferencias` | ✅ |
| Contabilidad | Plan Contable | `/contabilidad/plan-contable` | `/contabilidad/plan-contable` | ✅ |
| Contabilidad | Centros Costo | `/contabilidad/centros-costo` | `/contabilidad/centros-costo` | ✅ |
| Contabilidad | Tipo Cambio | `/contabilidad/tipo-cambio` | `/contabilidad/tipo-cambio` | ✅ |
| Contabilidad | Formatos SUNAT | `/contabilidad/formatos-sunat` | `/contabilidad/formatos-sunat` | ✅ |
| Contabilidad | Libros Electrónicos | `/contabilidad/libros-electronicos` | `/contabilidad/libros-electronicos` | ✅ |
| Activos Fijos | Maestro AF | `/activos/maestro` | `/activos/maestro` | ✅ |
| Activos Fijos | Parámetros AF | `/activos/parametros` | `/activos/parametros` | ✅ |
| Activos Fijos | Operaciones AF | `/activos/operaciones` | `/activos/operaciones` | ✅ |
| Activos Fijos | Procesos AF | `/activos/procesos` | `/activos/procesos` | ✅ |
| RRHH | Datos Personal | `/rrhh/maestro-personal/datos-contacto` | `/` | ✅ |
| RRHH | Cargos | `/rrhh/maestro-personal/definicion-cargos` | `/rrhh/maestro-personal/definicion-cargos` | ✅ |
| RRHH | Tipo Contrato | `/rrhh/parametros/tipo-contrato` | `/rrhh/parametros/tipo-contrato` | ✅ |
| RRHH | Asistencias | `/rrhh/asistencias-jornadas/asistencias-HE` | `/rrhh/asistencias-jornadas/asistencias-HE` | ✅ |
| RRHH | Cálculo Planilla | `/rrhh/calculo-planilla` | `/rrhh/calculo-planilla` | ✅ |
| RRHH | Liquidaciones | `/rrhh/liquidaciones` | `/rrhh/liquidaciones` | ✅ |
| Dashboard | Inicio | `/inicio` | `/inicio` | ✅ |

---

## 4. Componentes por Pantalla

| Pantalla | Botones | Inputs | Tabs | Columnas | Filtros |
|:---------|:-------:|:------:|:----:|:--------:|:-------:|
| Gestión Proveedores | 2 | 16 | 3 | 5 | 2 |
| Generar OC | 5 | 22 | 0 | 15 | 5 |
| Aprobar OC | 1 | 30 | 0 | 13 | 4 |
| Registro Comprobantes | 0 | 0 | 0 | 0 | 0 |
| Gestión Compras | 0 | 20 | 0 | 13 | 4 |
| Facturación Regalías | 4 | 20 | 0 | 9 | 2 |
| Consulta Saldos | 2 | 2 | 0 | 8 | 0 |
| Mov Cuentas | 3 | 8 | 0 | 9 | 2 |
| Tipos Documento | 0 | 0 | 0 | 0 | 0 |
| Conceptos Financieros | 0 | 0 | 0 | 0 | 0 |
| Flujo de Caja | 0 | 0 | 0 | 0 | 0 |
| Solicitud Adelantos | 0 | 0 | 0 | 0 | 0 |
| Cartera Pagos | 1 | 10 | 2 | 8 | 2 |
| Transferencias | 0 | 0 | 0 | 0 | 0 |
| Plan Contable | 0 | 0 | 0 | 0 | 0 |
| Centros Costo | 0 | 0 | 0 | 0 | 0 |
| Tipo Cambio | 0 | 0 | 0 | 0 | 0 |
| Formatos SUNAT | 0 | 0 | 0 | 0 | 0 |
| Libros Electrónicos | 0 | 0 | 0 | 0 | 0 |
| Maestro AF | 0 | 0 | 0 | 0 | 0 |
| Parámetros AF | 0 | 0 | 0 | 0 | 0 |
| Operaciones AF | 0 | 0 | 0 | 0 | 0 |
| Procesos AF | 0 | 0 | 0 | 0 | 0 |
| Datos Personal | 2 | 22 | 3 | 11 | 2 |
| Cargos | 4 | 12 | 0 | 7 | 2 |
| Tipo Contrato | 2 | 4 | 0 | 3 | 2 |
| Asistencias | 0 | 2 | 0 | 13 | 2 |
| Cálculo Planilla | 0 | 0 | 0 | 0 | 0 |
| Liquidaciones | 0 | 0 | 0 | 0 | 0 |
| Inicio | 5 | 0 | 0 | 0 | 0 |

---

## 5. APIs Capturadas

- `/api/almacen/almacenes?page=0&size=1000`
- `/api/auth/empresas`
- `/api/auth/login`
- `/api/auth/seleccionar-empresa`
- `/api/compras/ordenes-compra/1`
- `/api/compras/ordenes-compra/3`
- `/api/compras/ordenes-compra/4`
- `/api/compras/ordenes-compra/5`
- `/api/compras/ordenes-compra/pendientes-aprobacion?page=0&size=1000&sort=id,desc`
- `/api/compras/ordenes-compra?page=0&size=1000&sort=id,desc`
- `/api/compras/reportes/gestion-compras?page=0&size=2000`
- `/api/contabilidad/centros-costo?page=0&size=1000`
- `/api/contabilidad/centros-costo?size=1000`
- `/api/core/articulos?page=0&size=1000`
- `/api/core/empresas/2/sucursales/mias`
- `/api/core/empresas/2/sucursales?page=0&size=1000`
- `/api/core/formas-pago?page=0&size=1000`
- `/api/core/formas-pago?page=0&size=200`
- `/api/core/geografia/paises?size=100`
- `/api/core/impuestos?page=0&size=1000`
- `/api/core/monedas`
- `/api/core/monedas?page=0&size=1000`
- `/api/core/monedas?size=100`
- `/api/core/relaciones-comerciales/1`
- `/api/core/relaciones-comerciales/10`
- `/api/core/relaciones-comerciales/11`
- `/api/core/relaciones-comerciales/12`
- `/api/core/relaciones-comerciales/13`
- `/api/core/relaciones-comerciales/14`
- `/api/core/relaciones-comerciales/4`
- `/api/core/relaciones-comerciales/6`
- `/api/core/relaciones-comerciales/7`
- `/api/core/relaciones-comerciales/8`
- `/api/core/relaciones-comerciales/9`
- `/api/core/relaciones-comerciales?esProveedor=true&activo=true&page=0&size=1000`
- `/api/core/relaciones-comerciales?esProveedor=true&page=0&size=1000`
- `/api/core/sucursales?page=0&size=1000`
- `/api/core/sucursales?size=1000`
- `/api/core/tipos-documento`
- `/api/core/tipos-documento-identidad`
- `/api/finanzas/bancos?size=1000`
- `/api/finanzas/caja-bancos?flagTipoTransaccion=P&size=100`
- `/api/finanzas/caja-bancos?flagTipoTransaccion=T&size=100`
- `/api/finanzas/cuentas-bancarias?page=0&size=1000`
- `/api/finanzas/cuentas-pagar?page=0&size=1000`
- `/api/notificaciones`
- `/api/rrhh/admin-afp/activos`
- `/api/rrhh/areas?size=1000&sort=nombre,asc`
- `/api/rrhh/asistencias?size=1000`
- `/api/rrhh/cargos?size=1000&sort=nombre,asc`
- `/api/rrhh/estados-civiles/activos`
- `/api/rrhh/motivos-cese?size=1000&sort=nombre,asc`
- `/api/rrhh/ocupaciones-rtps?size=1000&sort=nombre,asc`
- `/api/rrhh/pensiones-rtps?size=1000&sort=nombre,asc`
- `/api/rrhh/regimenes-laborales?size=1000&sort=codigo,asc`
- `/api/rrhh/regimenes-pensionario?size=1000&sort=nombre,asc`
- `/api/rrhh/secciones?size=1000&sort=nombre,asc`
- `/api/rrhh/sexos?size=100`
- `/api/rrhh/tipos-contrato/activos`
- `/api/rrhh/tipos-contrato?size=1000&sort=nombre,asc`
- `/api/rrhh/tipos-sangre?size=1000&sort=nombre,asc`
- `/api/rrhh/tipos-trabajador-rtps?size=1000&sort=nombre,asc`
- `/api/rrhh/tipos-trabajador?size=1000&sort=nombre,asc`
- `/api/rrhh/tipos-via?size=1000&sort=nombre,asc`
- `/api/rrhh/tipos-vivienda?size=1000&sort=nombre,asc`
- `/api/rrhh/tipos-zona?size=1000&sort=nombre,asc`
- `/api/rrhh/trabajadores?size=1000&sort=codigoTrabajador,asc`

---

## 6. Comparación Documentación vs Aplicación

### 6.1 Coinciden (30)

| Pantalla | Módulo | Botones | Inputs | Tabs | Columnas |
|:---------|:-------|:-------:|:------:|:----:|:--------:|
| Gestión Proveedores | Compras | 2 | 16 | 3 | 5 |
| Generar OC | Compras | 5 | 22 | 0 | 15 |
| Aprobar OC | Compras | 1 | 30 | 0 | 13 |
| Registro Comprobantes | Compras | 0 | 0 | 0 | 0 |
| Gestión Compras | Compras | 0 | 20 | 0 | 13 |
| Facturación Regalías | Ventas | 4 | 20 | 0 | 9 |
| Consulta Saldos | Finanzas | 2 | 2 | 0 | 8 |
| Mov Cuentas | Finanzas | 3 | 8 | 0 | 9 |
| Tipos Documento | Finanzas | 0 | 0 | 0 | 0 |
| Conceptos Financieros | Finanzas | 0 | 0 | 0 | 0 |
| Flujo de Caja | Finanzas | 0 | 0 | 0 | 0 |
| Solicitud Adelantos | Finanzas | 0 | 0 | 0 | 0 |
| Cartera Pagos | Finanzas | 1 | 10 | 2 | 8 |
| Transferencias | Finanzas | 0 | 0 | 0 | 0 |
| Plan Contable | Contabilidad | 0 | 0 | 0 | 0 |
| Centros Costo | Contabilidad | 0 | 0 | 0 | 0 |
| Tipo Cambio | Contabilidad | 0 | 0 | 0 | 0 |
| Formatos SUNAT | Contabilidad | 0 | 0 | 0 | 0 |
| Libros Electrónicos | Contabilidad | 0 | 0 | 0 | 0 |
| Maestro AF | Activos Fijos | 0 | 0 | 0 | 0 |
| Parámetros AF | Activos Fijos | 0 | 0 | 0 | 0 |
| Operaciones AF | Activos Fijos | 0 | 0 | 0 | 0 |
| Procesos AF | Activos Fijos | 0 | 0 | 0 | 0 |
| Datos Personal | RRHH | 2 | 22 | 3 | 11 |
| Cargos | RRHH | 4 | 12 | 0 | 7 |
| Tipo Contrato | RRHH | 2 | 4 | 0 | 3 |
| Asistencias | RRHH | 0 | 2 | 0 | 13 |
| Cálculo Planilla | RRHH | 0 | 0 | 0 | 0 |
| Liquidaciones | RRHH | 0 | 0 | 0 | 0 |
| Inicio | Dashboard | 5 | 0 | 0 | 0 |

### 6.2 Solo en Documentación (0)



### 6.3 Solo en Aplicación (0)



### 6.4 Diferencias / Errores (0)



---

## 7. Hallazgos Clasificados

| Tipo | Pantalla | Descripción |
|:-----|:---------|:------------|




---

*Informe generado automáticamente por Playwright — Fase 3 Descubrimiento Funcional*
