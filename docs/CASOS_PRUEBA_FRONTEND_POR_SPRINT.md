# Casos de Prueba Frontend — Restaurante.pe V2

> **Propósito:** Casos de prueba para revisión frontend organizados por sprint, cubriendo validación de UI, flujos funcionales, manejo de errores, estados y edge cases.
>
> **Fuente:** `Listado de funcionalidades y flujos por probar por sprint - Hoja 1.csv`
>
> **Responsable:** QA Senior — Frontend Testing
>
> **Fecha:** 17/06/2026 — **Actualizado:** 03/07/2026 (motor v2, multi-país, casos por módulo)
>
> **🆕 Referencias complementarias:**
> - `reportes/CASOS POR MODULO - COMPRAS.csv` — 60 casos con asientos manuales de referencia
> - `reportes/CASOS POR MODULO - VENTAS.csv` — 49 casos con asientos manuales de referencia
> - `reportes/MAPA_FUNCIONAL_CONSOLIDADO.md` — Mapa integrado frontend + backend
> - `reportes/01-VISION.md` a `11-REVISION_COMPLETA.md` — Motor de Asientos v2

> **HU Referenciadas:**
>
> | HU | Funcionalidad | Sprint | Evento Motor v2 🆕 |
> |:---|:---|:---:|:---|
> | `HU-FIN-OPE-001` | Ingreso de Facturas de Proveedores desde Compras | S1 | `COMPRA_REGISTRADA` |
> | `HU-FIN-OP-CP-001` | Registro de Facturas No Asociadas a Compras | S1 | `COMPRA_REGISTRADA` |
> | `HU-COM-OPE-003` | Registro de Ajustes / NC / ND de Deuda | S1 | `NC_COMPRA` |
> | `HU-RRHH-PN-CP-001` | Configuración y Cálculo de Conceptos Fijos | S4 | `PLANILLA_DEVENGADA` |
> | `HU-RRHH-PN-CP-002` | Carga Masiva o Automática de Variables | S4 | `PLANILLA_DEVENGADA` |
> | `HU-RRHH-PN-CP-003` | Distribución de Propinas Automática | S4 | `sp_calcular_propinas` |
> | `HU-RRH-NOM-CP-007` | Distribución del Recargo al Consumo | S4 | `sp_calcular_recargo_consumo` |
> | `HU-RRHH-NOM-CC-001` | Gestión de Adelantos, Préstamos y Amortizaciones | S4 | `PRESTAMO_DESEMBOLSADO` / `PRESTAMO_CUOTA_PAGADA` |
> | `HU-RRHH-NOM-AR-001` | Cálculo de Impuestos y Contribuciones Sociales | S4 | `PLANILLA_DEVENGADA` |
> | `HU-RRHH-NOM-LIQ-001` | Liquidación de Vacaciones, Indemnizaciones y Beneficios | S4 | `sp_liquidar_beneficios` |

---

## Convenciones

| Etiqueta | Significado |
|:--------:|-------------|
| ✅ **CP-XXX** | Caso de prueba |
| 🔵 **Funcional** | Flujo funcional happy path / alternativo |
| 🟢 **UI** | Validación visual, layout, componentes |
| 🟡 **Validación** | Validación de formularios, campos, formatos |
| 🔴 **Error** | Manejo de errores, mensajes, excepciones |
| 🟣 **Estado** | Loading, empty, success, transiciones |
| ⚫ **Edge** | Casos límite, caracteres especiales, datos extremos |
| 🔗 **Integración** | Navegación entre pantallas, dependencias, flujos cruzados |
| 🆕 **Motor v2** | Alineación con evento de dominio del Motor de Asientos v2 |
| 🆕 **Multi-país** | Comportamiento varía según país (PE/CO/EC) |

---

# Sprint 1 — Módulo Compras + Maestros Core + Finanzas Base

## 1.1 Maestro Proveedores — Ficha de Proveedores (#1)

> Ruta: `Compras > Maestro Proveedores > Ficha de Proveedores`
>
> Operaciones: Alta, edición, baja lógica y consulta

### CP-S1-001: Visualización del listado de proveedores
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **Descripción** | Verificar que la pantalla de listado de proveedores carga correctamente |
| **Precondiciones** | Usuario autenticado con permisos de Compras |
| **Pasos** | 1. Navegar a Compras > Maestro Proveedores. 2. Validar que se muestre el listado |
| **Esperado** | Tabla con columnas: RUC/DNI, Razón Social, Tipo, Estado, Teléfono, Acciones. Barra de búsqueda y filtros visibles. Paginación funcional |

### CP-S1-002: Formulario de alta de proveedor — campos obligatorios
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Verificar validación de campos obligatorios al crear un proveedor |
| **Precondiciones** | Estar en la pantalla de nuevo proveedor |
| **Pasos** | 1. Hacer clic en "Nuevo". 2. Dejar todos los campos vacíos. 3. Intentar guardar |
| **Esperado** | Mensajes de validación en rojo para: Razón Social, Tipo Documento, Nro Documento, Dirección. El botón Guardar permanece deshabilitado o muestra errores |

### CP-S1-003: Alta de proveedor — flujo exitoso
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Crear un proveedor con datos válidos y verificar que se guarda correctamente |
| **Precondiciones** | Datos de proveedor listos |
| **Pasos** | 1. Completar formulario con datos válidos. 2. Guardar. 3. Ver toast de éxito. 4. Buscar el proveedor en el listado |
| **Esperado** | Toast "Proveedor creado exitosamente". El proveedor aparece en el listado con estado Activo. Todos los campos se persisten correctamente |

### CP-S1-004: Edición de proveedor
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Modificar datos de un proveedor existente |
| **Precondiciones** | Proveedor activo existente |
| **Pasos** | 1. Seleccionar proveedor del listado. 2. Hacer clic en "Editar". 3. Modificar razón social y teléfono. 4. Guardar |
| **Esperado** | Los cambios se reflejan en el listado. Los datos anteriores se sobrescriben correctamente |

### CP-S1-005: Baja lógica de proveedor
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Desactivar un proveedor y verificar que se marca como inactivo |
| **Precondiciones** | Proveedor activo sin OC/OS pendientes |
| **Pasos** | 1. Seleccionar proveedor. 2. "Dar de baja". 3. Confirmar en modal. 4. Verificar estado |
| **Esperado** | Modal de confirmación con advertencia. Estado cambia a Inactivo. El proveedor puede filtrarse por "Inactivos" |

### CP-S1-006: Búsqueda y filtros en listado de proveedores
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **Descripción** | Validar que la búsqueda y filtros funcionan correctamente |
| **Precondiciones** | Múltiples proveedores cargados |
| **Pasos** | 1. Buscar por RUC exacto. 2. Buscar por razón social parcial. 3. Filtrar por estado. 4. Combinar filtros |
| **Esperado** | Resultados se filtran en tiempo real. Búsqueda por RUC encuentra coincidencia exacta. Búsqueda parcial muestra múltiples resultados. Filtro combinado funciona |

### CP-S1-007: Validación de RUC/DNI duplicado
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Intentar crear un proveedor con un RUC/DNI ya registrado |
| **Precondiciones** | Proveedor existente con RUC 20100012345 |
| **Pasos** | 1. Crear nuevo proveedor. 2. Ingresar RUC 20100012345. 3. Completar otros campos. 4. Guardar |
| **Esperado** | Mensaje de error: "El número de documento ya existe". No se duplica el registro |

### CP-S1-008: Estado loading y empty state del listado
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟣 Estado |
| **Descripción** | Verificar indicador de carga y pantalla vacía cuando no hay datos |
| **Precondiciones** | Variable según el caso |
| **Pasos** | 1. Con carga lenta: validar spinner/skeleton. 2. Sin proveedores: validar mensaje "No se encontraron proveedores" |
| **Esperado** | Skeleton loader o spinner durante la carga. Empty state con icono, mensaje claro y CTA "Crear primer proveedor" |

---

## 1.2 Orden de Compra — Generación (#2)

> **HU asociada:** `HU-COM-003` — Generar Orden de Compra
>
> Ruta: `Compras > Orden de Compra > Edición General`
>
> Operaciones: Crear OC, grabar líneas, numeración, consulta, generar PDF. Carga masiva

### CP-S1-009: Pantalla de creación de OC — estructura y layout
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-COM-003 — CA#1 |
| **Descripción** | Verificar que la pantalla de nueva OC muestra todos los campos, secciones y numeración autogenerada |
| **Precondiciones** | Usuario autenticado |
| **Pasos** | 1. Navegar a Compras > Orden de Compra. 2. Hacer clic en "Nueva OC" |
| **Esperado** | Número de OC autogenerado con formato OC-YYYY-CORRELATIVO (ej. OC-2026-000001). Secciones: Cabecera (proveedor, fecha emisión default hoy, fecha entrega, dirección entrega, moneda, TC si aplica, condición de pago), Detalle (tabla de líneas editable), Totales. Selector de proveedor con autocompletado + solo activos |

### CP-S1-010: Crear OC con líneas de detalle — flujo completo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-003 — CA#1, CA#3 |
| **Descripción** | Crear OC con líneas de artículo validando proveedor activo, artículo clasificado y moneda |
| **Precondiciones** | Proveedor activo, artículos clasificados en el maestro |
| **Pasos** | 1. Seleccionar proveedor (validar: solo activos). 2. Seleccionar moneda. 3. Si moneda distinta a local, ingresar tipo de cambio. 4. Elegir condición de pago. 5. Agregar línea: buscar artículo (solo clasificados), ingresar cantidad y precio unitario (≥ 0.0001). 6. Agregar segunda línea. 7. Guardar OC |
| **Esperado** | Cálculo automático: subtotal por línea, impuestos según país, total general. OC se guarda con numeración OC-YYYY-CORRELATIVO. Estado "Pendiente". Toast de éxito |

### CP-S1-011: Validaciones de detalle de OC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-COM-003 — CA (validaciones) |
| **Descripción** | Verificar reglas de validación en líneas de detalle |
| **Precondiciones** | Proveedor seleccionado en cabecera |
| **Pasos** | 1. Agregar línea sin artículo. 2. Cantidad 0 o negativa. 3. Precio unitario < 0.0001. 4. Precio con más de 4 decimales. 5. Fecha de entrega anterior a fecha de emisión |
| **Esperado** | Validaciones por campo: "Seleccione un artículo", "Cantidad debe ser mayor a 0", "Precio mínimo 0.0001", "Máximo 4 decimales", "La fecha de entrega debe ser ≥ fecha de emisión" |

### CP-S1-012: Generación de PDF de OC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-003 — CA#8 |
| **Descripción** | Generar PDF de OC y verificar contenido completo |
| **Precondiciones** | OC guardada |
| **Pasos** | 1. Abrir OC. 2. "Generar PDF". 3. Validar contenido del PDF |
| **Esperado** | PDF con: logo empresa, N° OC (OC-2026-000001), datos proveedor, fecha emisión/entrega, dirección entrega, moneda, TC, condición de pago, detalle (código, descripción, UMed, cantidad, precio unitario 4 decimales, subtotal, impuestos, total línea), subtotal general, impuestos, total orden, usuario que emite y quien autoriza |

### CP-S1-013: Consulta y búsqueda de OC con filtros
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-COM-003 — CA#9 |
| **Descripción** | Validar el listado de OC con filtros avanzados y columnas completas |
| **Precondiciones** | Múltiples OC en distintos estados |
| **Pasos** | 1. Listado de OC. 2. Verificar columnas: N° OC, Doc Proveedor, Proveedor, Sucursal, Almacén, Dirección Fiscal, Fecha Registro, Fecha Entrega, Dirección Entrega, Moneda, TC, Condición Pago, Estado. 3. Filtrar por N° OC, proveedor, estado, fecha, sucursal. 4. Exportar listado a Excel/PDF |
| **Esperado** | Todos los filtros funcionan combinados. Exportación incluye columnas completas. Paginación funcional |

### CP-S1-014: Carga masiva de OC desde Excel
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-003 — Comentarios |
| **Descripción** | Cargar múltiples líneas de detalle de OC mediante plantilla Excel |
| **Precondiciones** | Proveedor seleccionado en cabecera |
| **Pasos** | 1. Descargar plantilla Excel. 2. Llenar: código producto (*), descripción, cantidad (*), costo unit (*), total. 3. Importar. 4. Validar resumen |
| **Esperado** | La plantilla se descarga con columnas requeridas. Validación de estructura. Resumen: N líneas válidas, N errores. Errores corregibles línea por línea |

### CP-S1-015: Bloqueo de edición en OC aprobada
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-COM-003 — CA#6 |
| **Descripción** | Verificar que no se puede modificar una OC en estado Aprobada o Cerrada |
| **Precondiciones** | OC en estado "Aprobada" |
| **Pasos** | 1. Abrir OC aprobada. 2. Intentar editar campos. 3. Intentar agregar/quitar líneas |
| **Esperado** | Campos deshabilitados. Botón "Editar" no visible o deshabilitado. Mensaje: "No es posible modificar una orden de compra aprobada". Solo edición permitida en estados Pendiente y Rechazada |

### CP-S1-016: Estado loading y error en listado OC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟣 Estado |
| **Descripción** | Verificar comportamiento cuando el servicio de OC falla |
| **Precondiciones** | API de OC no disponible |
| **Pasos** | 1. Cargar listado con servicio caído |
| **Esperado** | Mensaje: "Error al cargar órdenes de compra. Intente nuevamente". Botón "Reintentar". No muestra error técnico |

---

## 1.3 Aprobación de OC (#3)

> **HU asociada:** `HU-COM-004` — Aprobación de Orden de Compra
>
> Ruta: `Compras > Aprobación de OC`
>
> Operaciones: Aprobar/rechazar/retornar OC pendiente. Flujo multinivel

### CP-S1-017: Listado de OC pendientes de aprobación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-COM-004 — CA#1, CA#9 |
| **Descripción** | Validar vista de OC pendientes con columnas y filtros completos |
| **Precondiciones** | OC en estado "Pendiente de aprobación" |
| **Pasos** | 1. Navegar a Aprobación de OC. 2. Revisar columnas: N° OC, Doc Proveedor, Proveedor, Sucursal, Almacén, Centro Costos, Fecha Registro, Fecha Entrega, Moneda, TC, Condición Pago, Monto, Estado. 3. Filtrar por estado, fecha, sucursal |
| **Esperado** | Columnas completas y visibles. Filtros combinados funcionan. Botones "Aprobar", "Rechazar", "Retornar" por fila. Solo se muestran OC con estado Pendiente |

### CP-S1-018: Aprobar OC — flujo exitoso
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-004 — CA#2, CA#3 |
| **Descripción** | Aprobar una OC pendiente y verificar cambio de estado |
| **Precondiciones** | OC en estado Pendiente, creador de OC distinto al aprobador |
| **Pasos** | 1. Localizar OC pendiente. 2. Ver detalle: proveedor, artículos, montos. 3. Clic "Aprobar". 4. Confirmar en modal. 5. Verificar estado "Aprobada". 6. Verificar notificación al creador |
| **Esperado** | Modal de confirmación con resumen. OC pasa a "Aprobada". Desaparece del listado de pendientes. El creador recibe notificación (sistema/correo). Integración con inventarios y finanzas habilitada |

### CP-S1-019: Rechazar OC con comentario obligatorio
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-004 — CA#2, CA#4 |
| **Descripción** | Rechazar una OC e ingresar motivo de rechazo |
| **Precondiciones** | OC pendiente |
| **Pasos** | 1. Clic "Rechazar". 2. Campo de comentario obligatorio. 3. Ingresar motivo. 4. Confirmar. 5. Verificar estado "Rechazada" |
| **Esperado** | Comentario obligatorio (no permite confirmar sin texto). OC cambia a "Rechazada". Motivo visible en detalle. Notificación al creador. No disponible para recepción ni integración contable |

### CP-S1-020: Retornar OC para correcciones
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-004 — CA#2, CA#5 |
| **Descripción** | Retornar una OC al creador para que realice correcciones |
| **Precondiciones** | OC pendiente |
| **Pasos** | 1. Clic "Retornar". 2. Ingresar comentario obligatorio con observaciones. 3. Confirmar. 4. Verificar estado "Retornada" |
| **Esperado** | Comentario obligatorio. OC cambia a "Retornada" (no "Rechazada"). El creador puede editar la OC y reenviarla. Notificación automática enviada |

### CP-S1-021: Aprobación multinivel por monto (> S/20,000)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-004 — CA#6, CA#10 |
| **Descripción** | Verificar flujo de aprobación multinivel cuando el monto supera S/20,000 |
| **Precondiciones** | OC con monto total > S/20,000 |
| **Pasos** | 1. Primer aprobador (jefe compras) aprueba OC. 2. Estado cambia a "Pendiente 2° nivel". 3. Segundo aprobador (gerente finanzas) revisa y aprueba. 4. Estado final "Aprobada" |
| **Esperado** | La OC requiere 2 aprobaciones consecutivas. Cada aprobación registrada en log con usuario y fecha. Ambos aprobadores deben ser distintos. Notificación al creador solo después de la 2da aprobación |

### CP-S1-022: Notificaciones automáticas al creador de OC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-004 — CA#10 |
| **Descripción** | Verificar que el creador recibe notificación ante cada acción sobre su OC |
| **Precondiciones** | OC pendiente creada por Usuario A |
| **Pasos** | 1. Aprobador rechaza OC. 2. Verificar que Usuario A recibe notificación. 3. Aprobador retorna OC. 4. Verificar notificación. 5. Aprobador aprueba OC. 6. Verificar notificación |
| **Esperado** | Notificaciones visibles en el panel del sistema (campana/badge). Opcionalmente por correo. El mensaje incluye: N° OC, proveedor, monto, acción realizada, usuario que ejecutó |

---

## 1.4 Orden de Servicios — Generación y Aprobación (#4, #5)

### CP-S1-023: Crear OS vinculada a proveedor/servicio
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Generar orden de servicio vinculando proveedor y tipo de servicio |
| **Precondiciones** | Proveedor de servicios y catálogo de servicios existentes |
| **Pasos** | 1. Navegar a Orden de Servicios > Nueva. 2. Seleccionar proveedor (autocompletado). 3. Seleccionar tipo de servicio. 4. Ingresar descripción, monto, fechas. 5. Guardar |
| **Esperado** | La OS se crea con numeración automática. Se muestra en el listado con estado "Pendiente" |

### CP-S1-024: Validaciones en formulario de OS
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Validar campos críticos del formulario de OS |
| **Precondiciones** | — |
| **Pasos** | 1. Intentar guardar sin proveedor. 2. Sin tipo de servicio. 3. Monto 0 o negativo. 4. Fecha fin anterior a fecha inicio |
| **Esperado** | Errores de validación visibles en cada campo. No permite guardar con datos inválidos |

### CP-S1-025: Aprobar OS con acta de conformidad
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Aprobar una orden de servicio y su acta de conformidad |
| **Precondiciones** | OS en estado Pendiente de aprobación con servicio completado |
| **Pasos** | 1. Seleccionar OS pendiente. 2. Revisar detalle del servicio. 3. Aprobar y marcar conformidad |
| **Esperado** | Acta de conformidad se genera/actualiza. OS pasa a estado "Conforme". Aparece en CxP para facturación |

---

## 1.5 Cuentas por Pagar — Registro CxP (#6)

> **HU asociadas:** `HU-FIN-OPE-001` — Ingreso de Facturas desde Compras | `HU-FIN-OP-CP-001` — Facturas No Asociadas a Compras

### CP-S1-026: Importar factura desde Almacén vinculada a OC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-FIN-OPE-001 — CA#1, CA#2, CA#3, CA#4 |
| **Descripción** | Importar una factura de proveedor desde Almacén, vinculada a una OC aprobada, validando que coincida con lo recepcionado |
| **Precondiciones** | OC aprobada, recepción en Almacén registrada |
| **Pasos** | 1. Navegar a Cuentas por Pagar > Ingreso de Facturas de Proveedores. 2. Importar factura desde Almacén (automático o por XML). 3. Verificar que se vincula automáticamente a la OC. 4. Validar productos, cantidades y montos contra recepción. 5. Confirmar registro |
| **Esperado** | Los datos de la OC y recepción se precargan. Si cantidades/montos coinciden: estado "Validada". Si hay diferencia: alerta de discrepancia con detalle. Opción de "Observar" para que Almacén subsane |

### CP-S1-027: Factura directa sin OC — servicios y gastos no inventariables
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-FIN-OP-CP-001 — CA#1, CA#2, CA#8 |
| **Descripción** | Registrar factura por servicios (alquiler, luz, asesoría) sin orden de compra, como "factura directa" |
| **Precondiciones** | Proveedor activo, cuenta contable y centro de costo configurados |
| **Pasos** | 1. "Nuevo Registro Manual" > "Factura Directa". 2. Seleccionar proveedor. 3. Validar que Razón Social y País son solo lectura. 4. Ingresar: N° Factura, Fecha Emisión, Vencimiento, Moneda, Tipo Gasto, Centro Costo, Cuenta Contable. 5. Ingresar Subtotal e IGV. 6. Guardar |
| **Esperado** | Campos obligatorios validados. País y Razón Social solo lectura. Estado "Pendiente de Validación" |

### CP-S1-028: Validación duplicado de factura por proveedor
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-FIN-OP-CP-001 — CA#3 |
| **Descripción** | Intentar registrar factura con mismo número, proveedor y año fiscal |
| **Precondiciones** | Factura F001-000123 para Proveedor X registrada en 2026 |
| **Pasos** | 1. Crear nueva factura. 2. Seleccionar mismo proveedor. 3. Ingresar F001-000123. 4. Guardar |
| **Esperado** | Mensaje: "La factura ya se encuentra registrada para este proveedor". Validación: Razón Social + Proveedor + N° Factura + Año Fiscal |

### CP-S1-029: Detracción en factura con OC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-FIN-OPE-001 — CA#7 |
| **Descripción** | Marcar operación sujeta a detracción y verificar documento DE |
| **Precondiciones** | OC > S/700, catálogo detracciones configurado |
| **Pasos** | 1. Registrar factura con OC. 2. Marcar "Aplica detracción". 3. Seleccionar código. 4. Verificar % de detracción. 5. Confirmar |
| **Esperado** | Sistema genera documento DE por pagar. Saldo factura = total - detracción |

### CP-S1-030: Aprobación de factura — asiento contable automático
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-FIN-OP-CP-001 — CA#4, CA#5, CA#6 |
| **Descripción** | Aprobar factura Pendiente de Validación y verificar asiento |
| **Precondiciones** | Factura en estado "Pendiente de Validación" |
| **Pasos** | 1. Supervisor Financiero. 2. "Aprobar Factura". 3. Verificar estado "Aprobada". 4. Validar asiento: Débito Gasto/Activo, Crédito CxP |
| **Esperado** | Solo Supervisor Financiero aprueba. Asiento automático generado. Log auditoría registra acción. Factura aprobada bloqueada para edición |

### CP-S1-031: Consulta de CxP con filtros avanzados
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-FIN-OP-CP-001 — CA#7 + HU-FIN-OPE-001 — CA#11 |
| **Descripción** | Validar consulta con filtros combinados y exportación |
| **Precondiciones** | Múltiples facturas en distintos estados |
| **Pasos** | 1. Filtrar por: estado, proveedor, fechas, tipo comprobante, moneda. 2. Ver detalle. 3. Exportar Excel/PDF |
| **Esperado** | Filtros combinados funcionan. Detalle: cabecera, líneas, documentos vinculados, asiento. Saldo pendiente visible |

### CP-S1-032: Anular factura antes de contabilización
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-FIN-OP-CP-001 — CA#7 |
| **Descripción** | Anular factura en estado Pendiente o Validada |
| **Precondiciones** | Factura Pendiente o Validada (no Aprobada) |
| **Pasos** | 1. "Anular". 2. Ingresar motivo. 3. Confirmar |
| **Esperado** | Estado "Anulada". Si Aprobada: solo anulable mediante NC (no directo) |

---

## 1.6 Nota Débito / Crédito y Ajustes de Deuda (#7)

> **HU asociada:** `HU-COM-OPE-003` — Registro de documento que reduce o ajusta la deuda

### CP-S1-033: Emitir NC/ND vinculada a factura con saldo pendiente
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-OPE-003 — CA#1, CA#2 |
| **Descripción** | Emitir NC vinculada a factura CxP con saldo pendiente |
| **Precondiciones** | Factura CxP con saldo > 0 |
| **Pasos** | 1. Registro de Ajustes > Nuevo. 2. Tipo "Nota de Crédito". 3. Vincular factura (obligatorio). 4. Serie/número. 5. Monto. 6. Motivo (mín 10 caracteres). 7. Guardar |
| **Esperado** | Ajuste vinculado a factura. Serie/número único por proveedor+tipo. Estado "Pendiente". Saldo factura se reduce |

### CP-S1-034: Validación — monto ajuste ≤ saldo pendiente
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-COM-OPE-003 — CA#3 |
| **Descripción** | Validar que ajuste no supere saldo pendiente |
| **Precondiciones** | Factura con saldo S/1,000 |
| **Pasos** | 1. Crear NC por S/1,200. 2. Aplicar |
| **Esperado** | Mensaje: "Monto supera saldo pendiente". No permite aplicar |

### CP-S1-035: Validación de moneda y tipo de cambio
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-COM-OPE-003 — CA#4 |
| **Descripción** | Validar consistencia de moneda entre ajuste y factura |
| **Precondiciones** | Factura en USD con TC |
| **Pasos** | 1. Ajuste en PEN contra factura USD. 2. Verificar TC. 3. Guardar |
| **Esperado** | Sistema detecta moneda diferente. Muestra TC. Genera asiento por diferencia cambiaria |

### CP-S1-036: Bloqueo ajuste sobre factura cancelada
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-COM-OPE-003 — CA#6 |
| **Descripción** | Bloquear ajustes sobre facturas canceladas |
| **Precondiciones** | Factura estado "Cancelada" |
| **Pasos** | 1. Crear NC vinculada a factura cancelada |
| **Esperado** | Mensaje: "Factura cancelada. No posible registrar ajustes" |

### CP-S1-037: Adjuntar XML y control duplicidad
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-OPE-003 — CA#8, CA#9 |
| **Descripción** | Adjuntar comprobante XML/PDF y validar duplicidad |
| **Precondiciones** | — |
| **Pasos** | 1. Crear NC. 2. Adjuntar XML. 3. Crear otra NC con misma serie/número |
| **Esperado** | Adjunto subido. Control duplicidad: "Documento ya existe para este proveedor" |

### CP-S1-038: Anular ajuste con reverso contable
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-COM-OPE-003 — CA#1, CA#5 |
| **Descripción** | Anular ajuste aplicado y verificar reverso |
| **Precondiciones** | Ajuste en estado "Aplicado" |
| **Pasos** | 1. "Anular". 2. Motivo. 3. Confirmar. 4. Verificar asiento reverso |
| **Esperado** | Estado "Anulado". Asiento reverso generado. Saldo factura restaurado |

---

## 1.7 Documentos por Pagar Directo — Individual (#8)

> **HU asociada:** `HU-FIN-OP-CP-001` (factura directa sin OC cubierta en CP-S1-027)

### CP-S1-039: DPD — alta, modificación, consulta
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Crear, modificar y consultar DPD |
| **Precondiciones** | Proveedor existente |
| **Pasos** | 1. Completar datos. 2. Guardar. 3. Modificar monto. 4. Consultar |
| **Esperado** | DPD registrado y listado. Modificación persiste |

---

## 1.8 Reportes de Compras (#9)

### CP-S1-040: Ejecutar reporte de gestión de compras al detalle
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Generar y exportar reporte de gestión de compras |
| **Precondiciones** | Datos de compras en el período |
| **Pasos** | 1. Seleccionar rango de fechas. 2. Ejecutar. 3. Exportar |
| **Esperado** | Tabla: proveedor, OC, fecha, monto, estado. Exportación Excel/PDF. Indicador de carga |

### CP-S1-041: Reporte sin datos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟣 Estado |
| **Descripción** | Ejecutar reporte en período sin datos |
| **Precondiciones** | Período sin compras |
| **Pasos** | 1. Seleccionar fechas sin datos. 2. Ejecutar |
| **Esperado** | Mensaje: "No se encontraron registros". Exportar deshabilitado |

---

## 1.9 Reportes de Ventas — SUNAT + Tributario (#10, #11)

### CP-S1-042: Registro de Ventas — Formato SUNAT
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Ejecutar registro de ventas formato SUNAT |
| **Precondiciones** | Ventas registradas en el período |
| **Pasos** | 1. Seleccionar período. 2. Ejecutar. 3. Visualizar |
| **Esperado** | Tabla SUNAT: RUC, tipo comprobante, serie, número, base imponible, IGV, total |

### CP-S1-043: Reporte tributario por período
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Generar reporte tributario (IGV, Retenciones) |
| **Precondiciones** | Operaciones mensuales registradas |
| **Pasos** | 1. Seleccionar período. 2. Ejecutar |
| **Esperado** | Resumen IGV (débito/crédito), retenciones. Totales correctos |

---

## 1.10 Maestros Financieros Base (#15, #16, #17, #33)

### CP-S1-044: CRUD Cuenta Bancaria
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Crear, editar, consultar y desactivar cuenta bancaria |
| **Precondiciones** | — |
| **Pasos** | 1. Crear cuenta. 2. Editar número. 3. Desactivar |
| **Esperado** | Validación formato cuenta. CRUD completo. Inactiva no aparece en combos |

### CP-S1-045: CRUD Medios de Pago (SUNAT)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Mantenimiento catálogo medios de pago SUNAT |
| **Precondiciones** | — |
| **Pasos** | 1. Listar. 2. Crear. 3. Editar. 4. Eliminar (baja lógica) |
| **Esperado** | Código SUNAT único. No eliminar si referenciado |

### CP-S1-046: CRUD Formas de Pago (SUNAT)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Mantenimiento catálogo formas de pago SUNAT |
| **Precondiciones** | — |
| **Pasos** | Análogo a CP-045 |
| **Esperado** | Códigos según catálogo SUNAT |

### CP-S1-047: CRUD Tipo de Cambio
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Registrar TC y verificar en pantallas que lo usan |
| **Precondiciones** | — |
| **Pasos** | 1. Registrar TC (compra/venta). 2. Verificar en OC con moneda extranjera |
| **Esperado** | TC se carga automáticamente en documentos. fn_obtener_tipo_cambio invocado |

### CP-S1-048: Tipo de Cambio — fecha duplicada
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Intentar registrar TC para fecha que ya tiene TC |
| **Precondiciones** | TC registrado para 2026-06-17 |
| **Pasos** | 1. Crear TC misma fecha. 2. Guardar |
| **Esperado** | Mensaje: "Ya existe TC para esta fecha". Opción editar existente |

---

## 1.11 Casos E2E Scripteados — Sprint 1

### CP-S1-E2E-01: Compras E2E — Proveedor → OC → Aprobación → Factura CxP → Reporte
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Ejecutar el flujo completo: proveedor → OC → aprobación → factura → reporte |
| **Precondiciones** | Datos maestros básicos cargados |
| **Pasos** | 1. Crear proveedor. 2. Crear OC con líneas. 3. Enviar a aprobación. 4. Aprobar OC. 5. Registrar factura CxP vinculada a la OC. 6. Generar reporte de gestión de compras |
| **Esperado** | Los datos fluyen correctamente entre cada paso. Los totales de la OC coinciden con la factura. El reporte incluye la transacción |

### CP-S1-E2E-02: Ventas Reportes — Registro Ventas + Tributario
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Ejecutar ambos reportes de ventas y verificar consistencia de datos |
| **Precondiciones** | Ventas registradas en el período |
| **Pasos** | 1. Generar Registro de Ventas SUNAT. 2. Generar Reporte Tributario (IGV/Retenciones) para el mismo período. 3. Comparar totales de IGV |
| **Esperado** | Totales de IGV coinciden entre ambos reportes para el mismo período |

### CP-S1-E2E-03: Finanzas Base — Cuenta Banco + Medio/Forma Pago + TC
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Verificar que los maestros financieros base se integran en transacciones |
| **Precondiciones** | — |
| **Pasos** | 1. Crear cuenta bancaria. 2. Crear medio de pago. 3. Crear forma de pago. 4. Registrar TC. 5. Verificar que los datos aparecen en combos de transacciones CxP |
| **Esperado** | Todos los maestros están disponibles en los selectores de las pantallas operativas |

---

# Sprint 2 — Módulo Finanzas + Contabilidad

## 2.1 Tablas Financieras (#12, #13, #14)

### CP-S2-001: CRUD Tipos de Documento
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Mantenimiento de tabla de tipos de documento (Factura, Boleta, NC, ND, etc.) |
| **Precondiciones** | — |
| **Pasos** | 1. Finanzas > Documentos > Tipos de Documentos. 2. Crear tipo con código SUNAT. 3. Editar. 4. Desactivar |
| **Esperado** | Validación de código SUNAT único. CRUD completo. Filtro por tipo de operación (compra/venta) |

### CP-S2-002: CRUD Conceptos Financieros
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Mantenimiento del maestro de conceptos financieros |
| **Precondiciones** | — |
| **Pasos** | 1. Crear concepto con tipo (ingreso/gasto). 2. Asociar cuenta contable. 3. Editar. 4. Ver en listado |
| **Esperado** | Árbol o lista jerárquica de conceptos. Validación de código único. Cuenta contable asociada |

### CP-S2-003: CRUD Grupos + Conceptos de Flujo de Caja
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Configurar grupos (#14a) y códigos (#14b) de flujo de caja |
| **Precondiciones** | — |
| **Pasos** | 1. Crear grupo de flujo. 2. Crear códigos dentro del grupo. 3. Editar. 4. Eliminar |
| **Esperado** | Estructura jerárquica grupo → códigos. Validación de dependencia al eliminar grupo |

---

## 2.2 Solicitud de Adelantos — Órdenes de Giro (#18, #19)

### CP-S2-004: Crear Orden de Giro
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Generar una solicitud de adelanto como orden de giro |
| **Precondiciones** | Colaborador/proveedor existente, concepto financiero configurado |
| **Pasos** | 1. Solicitud de Adelantos > Generación de OG. 2. Seleccionar beneficiario. 3. Ingresar monto, concepto, fecha. 4. Guardar |
| **Esperado** | OG se crea con numeración automática. Estado "Pendiente de aprobación". Se muestra en listado |

### CP-S2-005: Aprobación de Orden de Giro
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Aprobar o rechazar una orden de giro pendiente |
| **Precondiciones** | OG en estado Pendiente de aprobación |
| **Pasos** | 1. Aprobación de OG. 2. Ver detalle. 3. Aprobar con comentario opcional. 4. Rechazar (motivo obligatorio) |
| **Esperado** | Aprobación → estado "Aprobada". Rechazo → estado "Rechazada" con motivo visible. Notificaciones actualizadas |

### CP-S2-006: Validaciones en OG — montos y fechas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Validar restricciones del formulario de OG |
| **Precondiciones** | — |
| **Pasos** | 1. Monto > saldo disponible (si aplica). 2. Fecha adelanto > fecha actual. 3. Beneficiario sin cuenta bancaria registrada |
| **Esperado** | Errores visibles por campo. No permite guardar con datos inválidos |

---

## 2.3 Rendición de Gastos (#20, #21, #22)

### CP-S2-007: Liquidación de gastos — colaborador/proveedor
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Rendir gastos vinculados a una OG aprobada |
| **Precondiciones** | OG aprobada |
| **Pasos** | 1. Rendición de Gastos. 2. Seleccionar OG aprobada. 3. Agregar comprobantes de gasto (tipo, monto, archivo adjunto). 4. Guardar liquidación |
| **Esperado** | Cada gasto se registra como detalle. El total rendido no excede el monto de la OG. Se permite adjuntar imágenes/comprobantes |

### CP-S2-008: Aprobación de rendición
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Aprobar o rechazar una rendición de gastos |
| **Precondiciones** | Liquidación de gastos enviada |
| **Pasos** | 1. Aprobación de rendición. 2. Revisar comprobantes. 3. Aprobar parcialmente (observar una línea). 4. Aprobar totalmente |
| **Esperado** | Aprobación parcial actualiza montos. Rechazo con observaciones visibles |

### CP-S2-009: Cierre de liquidación de adelantos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Cerrar definitivamente una liquidación |
| **Precondiciones** | Rendición aprobada |
| **Pasos** | 1. Cerrar liquidación. 2. Verificar cambio de estado a "Cerrada" |
| **Esperado** | No se puede modificar después del cierre. Se generan asientos contables si aplica |

---

## 2.4 Tesorería — Cartera de Pagos y Cobros (#23, #24)

### CP-S2-010: Programar y registrar pago en cartera de pagos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Agregar un documento por pagar a la cartera de pagos y registrar el pago |
| **Precondiciones** | CxP pendiente de pago |
| **Pasos** | 1. Cartera de Pagos. 2. Seleccionar documento para pago. 3. Ingresar fecha, forma de pago, cuenta bancaria. 4. Confirmar pago |
| **Esperado** | El documento aparece en la cartera. Al confirmar, la CxP se marca como pagada. Se actualiza el saldo de la cuenta bancaria |

### CP-S2-011: Registrar cobro en cartera de cobros
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Registrar un cobro de cliente en la cartera de cobros |
| **Precondiciones** | Documento de venta pendiente de cobro |
| **Pasos** | 1. Cartera de Cobros. 2. Seleccionar documento. 3. Ingresar monto, fecha, forma de cobro. 4. Confirmar |
| **Esperado** | Documento de venta se marca como cobrado. Saldo actualizado. Registro en tesorería |

### CP-S2-012: Aplicación de documentos (#25)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Aplicar un pago a documentos abiertos |
| **Precondiciones** | Pago registrado y documentos abiertos |
| **Pasos** | 1. Aplicación de Documentos. 2. Seleccionar pago. 3. Aplicar a uno o varios documentos. 4. Ver distribución del monto |
| **Esperado** | El monto se distribuye entre los documentos seleccionados. Saldos individuales se actualizan |

### CP-S2-013: Anulación de pago en cartera (#26)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Anular un pago emitido en la cartera de pagos |
| **Precondiciones** | Pago registrado |
| **Pasos** | 1. Cartera de Pagos > Anulación. 2. Buscar pago. 3. Confirmar anulación con motivo |
| **Esperado** | Modal de confirmación con motivo obligatorio. Pago se reversa. Documento original vuelve a estado Pendiente |

---

## 2.5 Transferencias (#27)

### CP-S2-014: Alta y confirmación de transferencia entre cuentas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Crear transferencia entre cuentas bancarias y confirmarla |
| **Precondiciones** | Dos cuentas bancarias activas |
| **Pasos** | 1. Transferencias > Nueva. 2. Seleccionar cuenta origen y destino. 3. Ingresar monto, fecha, concepto. 4. Guardar (pendiente confirmación). 5. Confirmar |
| **Esperado** | Al confirmar: saldo origen disminuye, saldo destino aumenta. Validación: el monto no puede exceder el saldo de origen |

---

## 2.6 Tablas Contables (#28, #29, #30, #31, #32, #34)

### CP-S2-015: CRUD/Import Plan Contable
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Visualizar, crear y editar cuentas del plan contable |
| **Precondiciones** | — |
| **Pasos** | 1. Contabilidad > Plan Contable. 2. Explorar árbol de cuentas (niveles). 3. Crear cuenta hija. 4. Editar. 5. Importar desde Excel (si aplica) |
| **Esperado** | Estructura de árbol expandible. Validación de código de cuenta por nivel. No permite crear si el código ya existe. Importación exitosa con resumen de cuentas creadas |

### CP-S2-016: Árbol de centros de costo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **Descripción** | Visualizar y mantener el árbol de centros de costo |
| **Precondiciones** | — |
| **Pasos** | 1. Plan de Centros de Costo. 2. Ver estructura jerárquica. 3. Agregar nodo |
| **Esperado** | Árbol colapsable/expandible. CRUD completo en cada nodo del árbol |

### CP-S2-017: Matriz Contable — mantener (#30)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Mantener la matriz de cuentas contables por concepto financiero |
| **Precondiciones** | Conceptos financieros y plan contable configurados |
| **Pasos** | 1. Matriz Contable. 2. Seleccionar concepto. 3. Asociar cuenta contable (debe/haber). 4. Guardar |
| **Esperado** | La asociación se guarda. Se valida que la cuenta existe en el plan contable |

### CP-S2-018: CRUD Detracciones/Retenciones
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Mantener tipos de detracción y retención |
| **Precondiciones** | — |
| **Pasos** | 1. CRUD tipos. 2. Crear con código SUNAT y % |
| **Esperado** | Porcentaje validado (rango 0-100). Código SUNAT único |

### CP-S2-019: CRUD Impuestos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Configurar impuestos (IGV, ICB, etc.) |
| **Precondiciones** | — |
| **Pasos** | 1. CRUD impuestos. 2. Crear con código, nombre, porcentaje. 3. Marcar como activo |
| **Esperado** | Porcentaje con 2 decimales. Impuesto activo aparece en combos de documentos |

### CP-S2-020: CRUD UIT Vigente
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Registrar UIT vigente para el año fiscal |
| **Precondiciones** | — |
| **Pasos** | 1. CRUD UIT. 2. Crear con año y monto. 3. Editar |
| **Esperado** | Solo una UIT vigente por año. Validación de año duplicado |

---

## 2.7 Reportes y Procesos Contables (#35, #36, #37)

### CP-S2-021: Formato 5.2 — Libro Diario Simplificado (SUNAT)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Generar libro diario simplificado | 
| **Precondiciones** | Asientos contables registrados |
| **Pasos** | 1. Formatos SUNAT > Formato 5.2. 2. Período. 3. Ejecutar. 4. Exportar |
| **Esperado** | Tabla con formato SUNAT. Columnas: cuenta, descripción, debe, haber. Totales deben coincidir |

### CP-S2-022: Procesar PLE (Libros Electrónicos SUNAT)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Ejecutar proceso de generación de libros electrónicos |
| **Precondiciones** | Datos contables del período |
| **Pasos** | 1. Libros Electrónicos > Procesar PLE. 2. Seleccionar período y libros a incluir. 3. Ejecutar. 4. Ver resultado |
| **Esperado** | Indicador de progreso durante la ejecución del SP. Resumen: registros procesados, errores. Archivos TXT/PDF generados para SUNAT |

---

## 2.8 Casos E2E Scripteados — Sprint 2

### CP-S2-E2E-01: Adelantos → Tesorería Completo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Flujo: OG → aprobación → liquidación → aprobación rendición → cierre → cartera pagos |
| **Precondiciones** | Colaborador, conceptos, cuentas bancarias configurados |
| **Pasos** | 1. Crear OG. 2. Aprobar OG. 3. Rendir gastos (adjuntar comprobantes). 4. Aprobar rendición. 5. Cerrar liquidación. 6. Programar pago en cartera |
| **Esperado** | Todos los estados fluyen secuencialmente. Los montos cuadran en cada paso. El pago se refleja en la cuenta bancaria |

### CP-S2-E2E-02: Cartera CxC + Aplicación + Anulación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Flujo de cartera de cobros: cobro → aplicación → anulación opcional |
| **Precondiciones** | Documento de venta pendiente |
| **Pasos** | 1. Crear documento de venta. 2. Registrar cobro en cartera. 3. Aplicar pago al documento. 4. (Opcional) Anular pago |
| **Esperado** | Después de aplicar: documento como cobrado. Anulación: documento vuelve a pendiente |

### CP-S2-E2E-03: Contabilidad — Plan Contable + Libro Diario + PLE
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Configurar plan contable, generar libro diario y procesar PLE |
| **Precondiciones** | Asientos contables registrados |
| **Pasos** | 1. Verificar plan contable. 2. Generar libro diario (Formato 5.2). 3. Procesar PLE para mismos datos. 4. Comparar consistencia |
| **Esperado** | Los SPs se ejecutan sin errores. Los datos del libro diario coinciden con los libros electrónicos |

---

# Sprint 3 — Módulo Activos Fijos + RR.HH (Inicio)

## 3.1 Maestro Activos Fijos — Ficha Completa Multi-Pestaña (#38)

> **HU asociada:** `HU-AF-TABOPE-0091` — Registro Principal de Activos Fijos con Gestión Integral

### CP-S3-001: Alta de activo fijo — pestaña Datos Generales
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-TABOPE-0091 — CA |
| **Descripción** | Registrar activo fijo en pestaña Datos Generales: código automático, clasificación, valor, moneda |
| **Precondiciones** | Clasificación de activos configurada, numerador activo configurado |
| **Pasos** | 1. Activos Fijos > Maestro > Nuevo. 2. Ver código autogenerado (según numerador). 3. Completar: descripción, clasificación (clase/subclase jerárquica), marca/modelo/serie, proveedor, fecha adquisición, moneda, valor adquisición. 4. Guardar |
| **Esperado** | Código autogenerado único. Clasificación válida obligatoria. Valor en moneda local y convertido. Estado "Activo". Pestañas restantes habilitadas |

### CP-S3-002: Ficha de activo — navegación y guardado por pestañas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-AF-TABOPE-0091 — Estructura |
| **Descripción** | Verificar las 8 pestañas del activo y guardado independiente por sección |
| **Precondiciones** | Activo creado con datos generales |
| **Pasos** | 1. Abrir activo existente. 2. Navegar por pestañas: Datos Generales, Complementarios, Accesorios, Depreciación, Incidencias, Adaptaciones, Traslados, Asignaciones. 3. Completar datos en pestaña Complementarios (ubicación física, estado operativo, garantías). 4. Guardar |
| **Esperado** | 8 pestañas visibles y funcionales. Cada pestaña guarda independientemente. Al cambiar de pestaña sin guardar, mensaje de confirmación |

### CP-S3-003: Pestaña Accesorios y Depreciación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-TABOPE-0091 — CA |
| **Descripción** | Agregar accesorios al activo y configurar datos de depreciación en sus pestañas |
| **Precondiciones** | Activo existente |
| **Pasos** | 1. Pestaña Accesorios: agregar accesorio con código, descripción y valor. 2. Pestaña Depreciación: seleccionar método (Lineal), ingresar tasa anual (%), fecha inicio, valor residual. 3. Ver depreciación acumulada y valor neto calculados automáticamente. 4. Guardar |
| **Esperado** | Los valores de accesorios se suman al valor total del activo. Los parámetros de depreciación se guardan correctamente. Depreciación acumulada = 0 inicialmente. Valor neto = valor adquisición - residual |

### CP-S3-004: Pestañas Incidencias, Adaptaciones, Traslados y Asignaciones
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-TABOPE-0091 — CA |
| **Descripción** | Registrar incidencia, adaptación, traslado y asignación en sus respectivas pestañas |
| **Precondiciones** | Activo existente |
| **Pasos** | 1. Incidencias: registrar fecha, tipo (daño), descripción, costo asociado, estado "Abierto". 2. Adaptaciones: mejora con valor incremental. 3. Traslados: origen/destino. 4. Asignaciones: responsable y centro de costo |
| **Esperado** | Cada registro persiste en su pestaña. Adaptación incrementa valor neto. Traslado genera documento automático. Asignación queda vinculada al responsable. Log de auditoría registra cada acción |

### CP-S3-005: Bloqueo de operaciones en activo dado de baja
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-AF-TABOPE-0091 — CA |
| **Descripción** | Verificar que activos con estado "Baja" no permiten depreciación ni traslado |
| **Precondiciones** | Activo en estado "Baja" |
| **Pasos** | 1. Abrir activo en baja. 2. Intentar modificar depreciación. 3. Intentar registrar traslado |
| **Esperado** | Mensaje: "No es posible modificar un activo dado de baja". Campos deshabilitados |

---

## 3.2 Parámetros y Configuración de Activos (#39, #40, #41, #42)

> **HU asociadas:** `HU-AF-001` — Tipos de Operación | `HU-AF-002` — Tipos de Incidencia | `HU-AF-TAB-001` — Aseguradoras | `HU-AF-TAB-004` — Matriz Contable por Subclase

### CP-S3-006: CRUD Tipos de Operación — configuración
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-001 — CA |
| **Descripción** | Configurar tipos de operación con código único, naturaleza (aumento/disminución/neutro) y cuenta contable |
| **Precondiciones** | Plan contable configurado |
| **Pasos** | 1. Tipos de Operación > Nuevo. 2. Ingresar código único, descripción, naturaleza (Aumento), tipo cálculo (Depreciación), cuenta contable asociada. 3. Guardar. 4. Editar cuenta contable. 5. Intentar eliminar si ya usado |
| **Esperado** | Validación código único. Naturaleza definida. Cuenta contable válida. Si usado en transacciones: mensaje bloqueo, no permite eliminar. Modificación registrada en log |

### CP-S3-007: CRUD Tipos de Incidencia — clasificación por impacto
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-002 — CA |
| **Descripción** | Crear tipos de incidencia clasificados por impacto: Físico, Contable o Ubicación |
| **Precondiciones** | — |
| **Pasos** | 1. Tipos de Incidencia > Nuevo. 2. Ingresar código, descripción. 3. Seleccionar tipo impacto: "Contable". 4. Asociar cuenta contable (obligatorio para impacto Contable). 5. Crear otra tipo impacto "Físico" (cuenta contable no requerida). 6. Intentar eliminar si ya usado en movimientos |
| **Esperado** | Código único. Si impacto = Contable, cuenta contable obligatoria. Si ya usado: "No es posible eliminar, asociado a movimientos históricos". Toda modificación en log auditoría |

### CP-S3-008: CRUD Aseguradoras — maestro multi-país
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-TAB-001 — CA |
| **Descripción** | Crear aseguradora con validación de RUC/NIT por país y bloqueo si tiene pólizas activas |
| **Precondiciones** | — |
| **Pasos** | 1. Aseguradoras > Nuevo. 2. Ingresar código, razón social, RUC (validar formato según país), dirección, teléfono, email, contacto, condiciones comerciales. 3. Guardar. 4. Verificar disponible en selector de pólizas. 5. Desactivar (si tiene pólizas activas: confirmación requerida) |
| **Esperado** | RUC/NIT único por país. Formato validado según país. Aseguradora activa visible en pólizas. Desactivación requiere confirmación si tiene pólizas activas. No se puede eliminar, solo desactivar |

### CP-S3-009: Matriz Contable por Subclase — cuentas asociadas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-TAB-004 — CA |
| **Descripción** | Configurar matriz contable completa para una subclase de activo |
| **Precondiciones** | Subclases de activo configuradas, plan contable activo |
| **Pasos** | 1. Matrices Contables > Nuevo. 2. Seleccionar subclase. 3. Asociar: cuenta activo fijo, cuenta depreciación acumulada, cuenta gasto depreciación, cuenta ganancia venta, cuenta pérdida venta, centro de costo. 4. Guardar. 5. Intentar registrar activo sin matriz configurada |
| **Esperado** | Validación de existencia de cada cuenta en plan contable. Solo una configuración activa por subclase. Si no existe matriz: bloquea registro del activo. Desactivación en log auditoría |

### CP-S3-010: Validación — matriz contable incompleta
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-AF-TAB-004 — CA |
| **Descripción** | Validar que no se puede guardar matriz con cuentas faltantes o inválidas |
| **Precondiciones** | — |
| **Pasos** | 1. Crear matriz sin cuenta de gasto depreciación. 2. Intentar guardar. 3. Ingresar cuenta que no existe en plan contable |
| **Esperado** | Error: "Debe completar todas las cuentas obligatorias". "La cuenta X no existe en el plan contable activo" |

---

## 3.3 Operaciones de Activos Fijos (#43, #44)

> **HU asociadas:** `HU-AF-OPE-004` — Operaciones Especiales | `HU-AF-OPE-006` — Baja de Activos

### CP-S3-011: Operación especial — mejora capitalizable
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-004 — CA |
| **Descripción** | Registrar mejora capitalizable que incrementa valor neto y actualiza vida útil |
| **Precondiciones** | Activo activo |
| **Pasos** | 1. Operaciones Especiales > Nuevo. 2. Seleccionar activo. 3. Tipo: "Mejora Capitalizable". 4. Ingresar monto, fecha, documento referencia, descripción. 5. Actualizar nueva vida útil. 6. Validar. 7. Contabilizar |
| **Esperado** | Valor neto del activo incrementa en el monto de mejora. Vida útil actualizada. Base depreciable recalculada. Asiento contable generado. Estado "Contabilizado" |

### CP-S3-012: Operación especial — cambio de clasificación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-004 — CA |
| **Descripción** | Reclasificar activo a otra clase/subclase |
| **Precondiciones** | Activo activo, nueva clasificación configurada con matriz contable |
| **Pasos** | 1. Tipo: "Cambio de Clasificación". 2. Seleccionar nueva subclase. 3. Validar contra catálogo. 4. Guardar |
| **Esperado** | Nueva clasificación validada contra catálogo jerárquico. Las cuentas contables se actualizan según nueva matriz. Log de auditoría registra el cambio |

### CP-S3-013: Baja de activo por venta
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-006 — CA |
| **Descripción** | Procesar baja de activo por venta con cálculo de ganancia/pérdida |
| **Precondiciones** | Activo activo |
| **Pasos** | 1. Proceso de Baja > Nuevo. 2. Seleccionar activo. 3. Tipo: "Venta". 4. Ingresar valor venta, comprador, tipo documento, N° documento. 5. El sistema calcula depreciación acumulada hasta la fecha. 6. Muestra resultado (ganancia o pérdida). 7. Adjuntar comprobante. 8. Confirmar baja |
| **Esperado** | Resultado = Valor Venta − Valor Neto Contable. Si positivo → ganancia (cta 76xx). Si negativo → pérdida (cta 67xx). Se genera asiento contable automático. Activo cambia a estado "BAJ-V". Documento adjunto requerido. Log auditoría registra todo |

### CP-S3-014: Baja de activo por siniestro
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-006 — CA |
| **Descripción** | Procesar baja por siniestro con documento parte policial/seguro |
| **Precondiciones** | Activo activo |
| **Pasos** | 1. Tipo: "Siniestro". 2. Seleccionar tipo (robo/incendio/inundación). 3. Ingresar N° parte policial/póliza, monto indemnización (si aplica), descripción. 4. Adjuntar evidencia. 5. Confirmar |
| **Esperado** | Valor venta = 0 automáticamente. Pérdida total (o parcial si hay indemnización). Estado "BAJ-S". Asiento contable generado |

### CP-S3-015: Baja por obsolescencia
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-006 — CA |
| **Descripción** | Procesar baja por obsolescencia tecnológica o fin de vida útil |
| **Precondiciones** | Activo activo |
| **Pasos** | 1. Tipo: "Obsolescencia". 2. Motivo (tecnológica/dañado/fin vida útil). 3. Descripción técnica. 4. Adjuntar informe técnico. 5. Confirmar |
| **Esperado** | Valor venta = 0. Pérdida por obsolescencia (cta 67xx). Estado "BAJ-O". Informe técnico requerido |

---

## 3.4 Procesos de Activos Fijos (#45, #46, #47, #48, #49, #50, #51, #52)

> **HU asociadas:** `HU-AF-OPE-007` — Revaluación | `HU-AF-OPE-008` — Tasas/Métodos Depreciación | `HU-AF-REP-001` — Listado General | `HU-AF-REP-002` — Depreciación Anual | `HU-AF-PRO-001` — Cálculo Depreciación | `HU-AF-PRO-002` — Asientos Depreciación | `HU-AF-PRO-003` — Asientos Revaluación | `HU-AF-PRO-005` — Devengo Seguros

### CP-S3-016: Configuración de tasas y métodos de depreciación por activo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-008 — CA |
| **Descripción** | Configurar tasas (contable/tributaria), método (lineal), valor residual y distribución por centro de costo |
| **Precondiciones** | Activo existente con valor de adquisición |
| **Pasos** | 1. Asignación de Ratios > Seleccionar activo. 2. Método: Lineal. 3. Tasa anual contable: 20%, tributaria: 25%. 4. Valor residual ≤ 20% del valor adquisición. 5. Fecha inicio ≥ fecha adquisición. 6. Distribuir 60% CC1, 40% CC2. 7. Calcular previo (simulación). 8. Guardar |
| **Esperado** | Validaciones: tasa entre 0-100, residual ≤ 20%, fecha inicio ≥ adquisición, distribución suma 100%. Simulación muestra proyección. Tasa contable y tributaria coexisten. Cambios registrados en log |

### CP-S3-017: Revaluación técnica de activo — flujo wizard completo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-OPE-007 — CA |
| **Descripción** | Ejecutar revaluación técnica de activo con flujo paso a paso: selección → valores → cálculo → contabilización |
| **Precondiciones** | Activo activo, matriz contable configurada |
| **Pasos** | 1. Revaluaciones > Nuevo. 2. Seleccionar activo (solo activo o depreciándose). 3. Tipo: "Técnica". 4. Ingresar nuevo valor, fecha, N° informe tasación, responsable. 5. Sistema calcula nueva base y diferencia. 6. Validar. 7. Revisar vista previa del asiento. 8. Contabilizar |
| **Esperado** | Wizard de 5 pasos. Nuevo valor > valor neto actual → superávit (cta 57xx). Nuevo valor < valor neto → pérdida (cta 67xx). Asiento balanceado: débito = crédito. Activo actualizado con nuevo valor y base depreciable. Log auditoría completo |

### CP-S3-018: Revaluación — validaciones y bloqueos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-AF-OPE-007 — CA |
| **Descripción** | Validar que no se permite revaluar activo en venta/baja/traslado ni duplicar proceso activo |
| **Precondiciones** | Activo en baja. Activo con revaluación en proceso |
| **Pasos** | 1. Intentar revaluar activo en estado "Baja". 2. Intentar segunda revaluación simultánea para mismo activo |
| **Esperado** | Bloqueo: "El activo no está disponible para revaluación". "Ya existe una revaluación activa para este activo" |

### CP-S3-019: Cálculo masivo de depreciación mensual
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-PRO-001 — CA |
| **Descripción** | Ejecutar cálculo masivo de depreciación para el período mensual en modo Prueba y Definitivo |
| **Precondiciones** | Activos con tasas y métodos configurados, período contable abierto |
| **Pasos** | 1. Cálculo de Depreciación > Ejecución Masiva. 2. Seleccionar período, tipo (Mensual), depreciación (Ambas). 3. Modo "Prueba". 4. Ejecutar. 5. Ver barra de progreso y tabla temporal. 6. Revisar resultados. 7. Reprocesar en modo "Definitivo" |
| **Esperado** | Barra de progreso en tiempo real. Solo activos vigentes incluidos. Modo prueba: datos temporales, no afecta contabilidad. Modo definitivo: datos persisten. No permite ejecutar sobre período cerrado. Errores registrados en log. Distribución por CC aplicada |

### CP-S3-020: Asientos contables automáticos de depreciación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-PRO-002 — CA |
| **Descripción** | Generar asientos contables automáticos desde resultados de depreciación calculada |
| **Precondiciones** | Cálculo de depreciación ejecutado en modo definitivo |
| **Pasos** | 1. Generación de Asientos de Depreciación. 2. Validar datos previos (matrices contables completas). 3. Ejecutar generación. 4. Revisar pre-asientos en estado "Pendiente". 5. Verificar balance débito = crédito. 6. Contabilizar en módulo general |
| **Esperado** | Pre-asientos generados por centro de costo y tipo activo. Cuentas: gasto depreciación (débito), depreciación acumulada (crédito). Asientos balanceados. Log con activos procesados y montos totales. Integración con contabilidad general |

### CP-S3-021: Asientos contables de revaluación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-PRO-003 — CA |
| **Descripción** | Generar asientos automáticos desde revaluaciones aprobadas |
| **Precondiciones** | Revaluación en estado "Aprobado" |
| **Pasos** | 1. Contabilización Automática de Revaluación. 2. Validar datos previos. 3. Revisar pre-asientos: activo, depreciación acumulada, superávit/pérdida. 4. Contabilizar |
| **Esperado** | Asientos con cuentas según matriz contable. Superávit (57xx) o pérdida (67xx). Efectos tributarios diferidos si aplica. Balance débito = crédito |

### CP-S3-022: Devengo mensual de primas de seguros
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-AF-PRO-005 — CA |
| **Descripción** | Ejecutar devengamiento mensual de primas de seguros de activos fijos |
| **Precondiciones** | Pólizas vigentes registradas, período contable abierto |
| **Pasos** | 1. Devengo Mensual de Aseguradoras. 2. Validar pólizas vigentes. 3. Calcular devengo (prima total / meses cobertura). 4. Revisar resultados por activo, póliza, CC. 5. Contabilizar devengo |
| **Esperado** | Solo pólizas vigentes procesadas. Cálculo lineal o proporcional según cobertura. Asiento: gasto seguro (débito), seguro diferido (crédito). Distribución por CC del activo. Alertas para pólizas por vencer (30 días) |

### CP-S3-023: Listado General de Activos — reporte con valores y depreciación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-AF-REP-001 — CA |
| **Descripción** | Generar y exportar listado general de activos con filtros dinámicos |
| **Precondiciones** | Activos registrados con depreciación calculada |
| **Pasos** | 1. Resumen Activo Fijo > Listado General. 2. Filtrar por: clase, ubicación, centro costo, estado, rango valor, moneda. 3. Generar. 4. Exportar a Excel. 5. Exportar a PDF formato auditoría |
| **Esperado** | Columnas: código, descripción, clase/subclase, ubicación, fecha adquisición, valor adquisición, depreciación acumulada, valor neto, moneda, estado, CC. Totales por moneda. Filtros combinados. Exportación correcta. Registro en log auditoría |

### CP-S3-024: Depreciación Anual por Activo — reporte detallado
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-AF-REP-002 — CA |
| **Descripción** | Consultar reporte de depreciación anual y proyección por activo |
| **Precondiciones** | Depreciación calculada en el período |
| **Pasos** | 1. Depreciación Anual por Activo. 2. Seleccionar activo. 3. Visualizar tabla: año, depreciación mensual, anual, acumulada, valor neto. 4. Ver proyección futura. 5. Exportar a Excel/PDF |
| **Esperado** | Valores contables y tributarios en columnas separadas. Depreciación acumulada ≤ base depreciable. Proyección hasta fin de vida útil. Activos revaluados reflejan nuevos valores. Exportación con formato auditoría |

---

## 3.5 RR.HH — Configuración Inicial (#53, #54, #55)

### CP-S3-025: Definir períodos de nómina (#53)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Definir fechas de proceso para períodos de nómina |
| **Precondiciones** | — |
| **Pasos** | 1. RRHH > Configuración > Parámetros de Fechas. 2. Crear período (mes/año, fecha inicio, fecha fin, fecha pago). 3. Guardar |
| **Esperado** | No permite solapamiento de períodos. Fechas validadas (inicio < fin). Aparece en selector de planilla |

### CP-S3-026: Registrar Remuneración Mínima Vital (#54)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Registrar la RMV vigente |
| **Precondiciones** | — |
| **Pasos** | 1. Remuneración Mínima. 2. Ingresar monto, fecha de vigencia. 3. Guardar |
| **Esperado** | Validación de fecha única (solo una RMV vigente por período). Monto > 0 |

### CP-S3-027: Parámetros de Control RRHH (#55)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Configurar parámetros de impuestos y aportes |
| **Precondiciones** | — |
| **Pasos** | 1. Parámetros de Control. 2. Configurar % ESSALUD, SNP, SPP |
| **Esperado** | Porcentajes válidos (0-100). Se aplican en cálculo de planilla |

---

## 3.6 RR.HH — Datos del Personal (#56, #58)

### CP-S3-028: Ficha de trabajador — datos personales y contacto
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Crear ficha completa de trabajador |
| **Precondiciones** | Tipos de documento cargados |
| **Pasos** | 1. RRHH > Datos del Personal > Datos Generales. 2. Ingresar nombres, apellidos, tipo y nro documento. 3. Fecha nacimiento, sexo, estado civil. 4. Datos de contacto (teléfono, email, dirección). 5. Guardar |
| **Esperado** | Validación de DNI (8 dígitos) / CE (12 dígitos). Fechas: nacimiento > 14 años. Formato de email validado. Ficha creada con código de trabajador |

### CP-S3-029: Validaciones de ficha de trabajador
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Validar campos críticos del formulario de trabajador |
| **Precondiciones** | — |
| **Pasos** | 1. DNI inválido (menor a 8 dígitos). 2. Fecha nacimiento futura. 3. Email sin @. 4. Campos obligatorios vacíos |
| **Esperado** | Errores visibles con mensajes claros. No permite guardar. Resalte en rojo de campos inválidos |

### CP-S3-030: Cargos y bandas salariales (#58)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Definir cargos con sus bandas salariales |
| **Precondiciones** | — |
| **Pasos** | 1. Categorías/Cargos. 2. Crear cargo: nombre, descripción. 3. Configurar banda salarial (mínimo, máximo). 4. Asignar a trabajador en su ficha |
| **Esperado** | Validación: mínimo < máximo. El salario del trabajador debe estar dentro de la banda del cargo |

---



## 3.7 Casos E2E Scripteados — Sprint 3

### CP-S3-E2E-01: Activos Fijos E2E — Alta → Depreciación → Asientos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Flujo completo: alta activo → cálculo depreciación → generación asientos |
| **Precondiciones** | Clasificación con cuentas contables, parámetros de depreciación |
| **Pasos** | 1. Crear activo con clasificación y método depreciación. 2. Calcular depreciación del período. 3. Generar asientos de depreciación. 4. Verificar asientos en contabilidad |
| **Esperado** | Los asientos contables generados usan las cuentas definidas en la clasificación. Depreciación calculada según método configurado |

### CP-S3-E2E-02: Revaluación + Asientos de Revaluación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Ejecutar revaluación y generar asientos de revaluación |
| **Precondiciones** | Activo con antigüedad |
| **Pasos** | 1. Ejecutar revaluación del activo. 2. Ver nuevo valor. 3. Generar asientos de revaluación |
| **Esperado** | Activo refleja el nuevo valor. Asientos de revaluación debitan/créditan cuentas de activo y patrimonio |

### CP-S3-E2E-03: RRHH Maestros — Período + Trabajador + Cargo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Configurar maestros básicos de RRHH |
| **Precondiciones** | — |
| **Pasos** | 1. Crear período de nómina. 2. Crear cargo con banda salarial. 3. Crear trabajador y asignar cargo y salario |
| **Esperado** | Los tres maestros se crean correctamente. El salario del trabajador valida contra la banda del cargo |

---

# Sprint 4 — Módulo RR.HH Completo

## 4.1 Maestros RR.HH (#57, #59, #60)

### CP-S4-001: CRUD Tipos de Contrato (#57)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Crear tipos de vínculo laboral (indeterminado, plazo fijo, temporal) |
| **Precondiciones** | — |
| **Pasos** | CRUD completo con código, nombre, duración máxima |
| **Esperado** | Validación de duración máxima > 0. Aparece en combo de ficha de trabajador |

### CP-S4-002: CRUD AFP y EPS (#59)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Administrar fondos de pensión (AFP) y EPS |
| **Precondiciones** | — |
| **Pasos** | 1. Administradoras de AFP > Crear: nombre, código SPP, tasa. 2. Crear EPS |
| **Esperado** | Tasa de AFP validada (> 0). Aparecen en selector de la ficha de trabajador (régimen pensionario) |

### CP-S4-003: Calendario de feriados y turnos (#60)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Configurar feriados y calendarios laborales |
| **Precondiciones** | — |
| **Pasos** | 1. Calendario Feriados. 2. Agregar feriados (fecha, descripción). 3. Crear calendario laboral con turnos. 4. Asignar a trabajadores |
| **Esperado** | No permite feriados duplicados para la misma fecha. Calendario/turnos se asignan correctamente. Vista de calendario mensual |

---

## 4.2 Asistencias y Jornadas (#61)

### CP-S4-004: Registrar asistencia con horas extra
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Registrar entrada/salida de un trabajador y ver el cálculo automático de HE |
| **Precondiciones** | Trabajador activo, calendario asignado |
| **Pasos** | 1. Asistencias y HE. 2. Seleccionar trabajador y fecha. 3. Marcar hora de ingreso y salida. 4. Guardar |
| **Esperado** | Las horas extra (HE) se calculan automáticamente al guardar (#62 integrado). Si la salida supera la jornada, las HE aparecen resaltadas en la misma pantalla |

### CP-S4-005: Validaciones de asistencia
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Validar reglas de negocio del registro de asistencia |
| **Precondiciones** | — |
| **Pasos** | 1. Hora salida < hora entrada. 2. Fecha futura. 3. Registro duplicado para misma fecha |
| **Esperado** | Errores de validación visibles. No permite guardar. Si ya existe asistencia, muestra opción de editar |

---

## 4.3 Vacaciones (#63)

### CP-S4-006: Solicitud de vacaciones y saldo disponible
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Solicitar vacaciones y verificar saldo |
| **Precondiciones** | Trabajador con días de vacaciones acumulados |
| **Pasos** | 1. Vacaciones por Trabajador. 2. Seleccionar trabajador. 3. Ver saldo disponible. 4. Ingresar fecha inicio y fin. 5. Guardar solicitud |
| **Esperado** | Saldo se actualiza dinámicamente al seleccionar fechas. No permite solicitar más días del saldo disponible. trg_actualizar_dias_gozados se ejecuta al guardar |

### CP-S4-007: Validación de fechas de vacaciones
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Validar reglas de negocio en solicitud de vacaciones |
| **Precondiciones** | — |
| **Pasos** | 1. Fecha inicio > fecha fin. 2. Fecha inicio en pasado (si restringe). 3. Solicitar más días del saldo |
| **Esperado** | Errores visibles. No permite sobregirar el saldo |

---

## 4.4 Conceptos Fijos (Sueldo Base, Asignaciones, Descuentos) (#64)

> **HU asociada:** `HU-RRHH-PN-CP-001` — Configuración y Cálculo de Conceptos Fijos

### CP-S4-008: CRUD de concepto fijo — clasificación y vigencia
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA#1 |
| **Descripción** | Crear concepto fijo clasificándolo como Ingreso, Descuento o Aporte Patronal, con fechas de vigencia |
| **Precondiciones** | — |
| **Pasos** | 1. Navegar a Conceptos Fijos > Nuevo. 2. Crear concepto "Sueldo Base" tipo Ingreso, modo de cálculo Fijo. 3. Crear concepto "Préstamo" tipo Descuento, modo Porcentaje. 4. Crear concepto "Essalud" tipo Aporte Patronal. 5. Asignar fechas de vigencia Desde/Hasta |
| **Esperado** | Cada concepto se guarda con su clasificación correcta. En la tabla de listado se distingue visualmente el tipo. Las vigencias se respetan: el concepto no se aplica fuera de su rango de fechas |

### CP-S4-009: Asociación de concepto fijo a trabajador/cargo/grupo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA#2 |
| **Descripción** | Asociar un concepto fijo a un trabajador específico, a un cargo o a un grupo |
| **Precondiciones** | Conceptos fijos configurados |
| **Pasos** | 1. Seleccionar concepto "Asignación Familiar". 2. Elegir "Aplicable a: Trabajador". 3. Seleccionar trabajador específico. 4. Guardar. 5. Repetir para un cargo completo. 6. Verificar que ambos trabajadores tienen el concepto en su detalle de planilla |
| **Esperado** | La asociación por trabajador y por cargo funciona. Un trabajador puede heredar conceptos del cargo y tener conceptos individuales adicionales |

### CP-S4-010: Concepto fijo con modo Porcentaje y Fórmula
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA#5 |
| **Descripción** | Configurar concepto con cálculo porcentual y otro con fórmula |
| **Precondiciones** | — |
| **Pasos** | 1. Crear concepto "Comisión" modo Porcentaje (5%). 2. Crear concepto "Bono Producción" modo Fórmula. 3. Ver en el detalle pre-confirmación que los montos se calculan correctamente |
| **Esperado** | El concepto porcentual toma la base imponible definida. El de fórmula evalúa la expresión. Ambos montos se muestran en el detalle de planilla |

### CP-S4-011: Detalle pre-confirmación antes de ejecutar planilla
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA#7 |
| **Descripción** | Visualizar el detalle del cálculo por trabajador antes de confirmar la planilla |
| **Precondiciones** | Conceptos fijos asignados a trabajadores |
| **Pasos** | 1. Ir a Cálculo de Planilla. 2. Seleccionar período. 3. Hacer clic en "Ver Detalle" o "Simular". 4. Revisar trabajador por trabajador: ingresos, descuentos, aportes |
| **Esperado** | Tabla expandible por trabajador. Cada concepto fijo aparece con su monto calculado. Se puede navegar entre trabajadores sin salir de la vista |

### CP-S4-012: Importación masiva de conceptos fijos desde Excel
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA#8 |
| **Descripción** | Cargar múltiples asignaciones de conceptos fijos mediante archivo Excel |
| **Precondiciones** | Conceptos maestros creados |
| **Pasos** | 1. Descargar plantilla Excel. 2. Llenar con trabajadores, conceptos y montos. 3. Importar. 4. Validar resumen de registros cargados. 5. Revisar errores si los hay |
| **Esperado** | La plantilla se descarga con el formato correcto. El sistema valida estructura y tipos antes de importar. Muestra resumen: N registros exitosos, N con errores. Los errores son corregibles línea por línea |

### CP-S4-013: Validación — no duplicar sueldo base por trabajador
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA (compatibilidad) |
| **Descripción** | Validar que un trabajador no tenga dos conceptos "Sueldo Base" activos simultáneamente |
| **Precondiciones** | Trabajador con Sueldo Base ya asignado |
| **Pasos** | 1. Asignar un segundo Sueldo Base al mismo trabajador. 2. Guardar |
| **Esperado** | Mensaje de validación: "El trabajador ya tiene un concepto 'Sueldo Base' activo para este período". No permite la duplicación |

### CP-S4-014: Exportar reporte de conceptos fijos por trabajador/sede
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-PN-CP-001 — CA#11 |
| **Descripción** | Exportar reporte de conceptos fijos agrupados por trabajador con filtro por sede |
| **Precondiciones** | Trabajadores con conceptos fijos asignados |
| **Pasos** | 1. Ir a Conceptos Fijos > Exportar. 2. Seleccionar sede. 3. Elegir formato (Excel/PDF). 4. Exportar |
| **Esperado** | El archivo contiene: trabajador, concepto, tipo, monto, vigencia, estado. Filtro por sede funciona. Datos correctos |

---

## 4.5 Carga Masiva de Variables (HE, Bonos, Comisiones) (#65)

> **HU asociada:** `HU-RRHH-PN-CP-002` — Carga Masiva o Automática de Variables

### CP-S4-015: Importación masiva desde archivo Excel/CSV
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-002 — CA#1 |
| **Descripción** | Cargar archivo Excel con variables de planilla (HE, bonos, comisiones) |
| **Precondiciones** | Plantilla de carga descargada |
| **Pasos** | 1. Carga de Variables > Cargar Archivo. 2. Seleccionar archivo Excel con datos de HE y bonos. 3. El sistema valida estructura y tipos. 4. Confirmar carga |
| **Esperado** | Validación de columnas: periodo, ID trabajador, tipo variable, monto. Errores de formato resaltados por fila. Resumen de registros válidos e inválidos |

### CP-S4-016: Corrección de errores post-importación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-002 — CA#4 |
| **Descripción** | Corregir manualmente registros que fallaron en la validación de importación |
| **Precondiciones** | Archivo con errores de importación |
| **Pasos** | 1. Ver lista de errores. 2. Editar el monto de una fila con error. 3. Revalidar. 4. Confirmar |
| **Esperado** | La edición corrige el error. El registro se marca como válido. Se puede confirmar la carga completa solo cuando todos los errores están resueltos |

### CP-S4-017: Variables importadas se integran al cálculo de planilla
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **HU Ref** | HU-RRHH-PN-CP-002 — CA#6 |
| **Descripción** | Verificar que las variables cargadas aparecen en el cálculo de planilla del período correspondiente |
| **Precondiciones** | Variables cargadas para el período |
| **Pasos** | 1. Cargar HE y bonos para período actual. 2. Ir a Cálculo de Planilla > mismo período. 3. Ver detalle de trabajadores. 4. Verificar que los montos se reflejan |
| **Esperado** | Las HE aparecen en la sección de ingresos del trabajador. Los bonos aparecen como concepto variable. El total de planilla incluye estos montos |

### CP-S4-018: Programación automática de carga (por frecuencia)
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-002 — CA#7 |
| **Descripción** | Configurar una carga automática programada para horas extra desde el biométrico |
| **Precondiciones** | Integración con sistema biométrico configurada |
| **Pasos** | 1. Programar Carga Automática. 2. Seleccionar fuente: "Biométrico". 3. Frecuencia: "Semanal, lunes". 4. Guardar. 5. Esperar la ejecución programada o ejecutar manualmente |
| **Esperado** | La fuente de datos se muestra como "Automática (API)". Los registros se cargan con el usuario del sistema. Bitácora registra la ejecución programada |

---

## 4.6 Propinas — Distribución Automática (#66)

> **HU asociada:** `HU-RRHH-PN-CP-003` — Distribución de Propinas Automática Integrada a Nómina

### CP-S4-019: Definir regla de distribución de propinas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-003 — CA#1 |
| **Descripción** | Configurar regla de distribución de propinas por tipo: % Fijo, Por Ventas, Por Rol o Mixto |
| **Precondiciones** | — |
| **Pasos** | 1. Navegar a Distribución de Propinas > Definir Regla. 2. Seleccionar tipo "% Fijo" e ingresar 10%. 3. Guardar. 4. Crear segunda regla "Por Rol" asignando % distinto a Mesero, Bartender, Cajero. 5. Crear regla "Mixto" combinando % fijo + ponderación por rol |
| **Esperado** | Las reglas se guardan con código, descripción y fecha de aplicación. El catálogo de reglas muestra las configuraciones activas. Se puede seleccionar la regla al ejecutar la distribución |

### CP-S4-020: Ejecutar distribución de propinas — cálculo automático
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-003 — CA#2, CA#3 |
| **Descripción** | Ejecutar la distribución de propinas para un período y sede, validando reglas contra legislación local |
| **Precondiciones** | Ventas del período con propinas registradas. Regla de distribución configurada |
| **Pasos** | 1. Seleccionar período y sede. 2. Elegir regla de distribución. 3. Ver monto total de propinas (solo lectura). 4. Ejecutar "Calcular Distribución". 5. Revisar montos asignados por trabajador |
| **Esperado** | El monto total se obtiene automáticamente de Ventas/POS. Los montos asignados respetan el % máximo legal por país. La tabla muestra: trabajador, rol, horas/días, % participación, monto asignado. Estado "Pendiente" |

### CP-S4-021: Ajuste manual supervisado con trazabilidad
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-003 — CA#4 |
| **Descripción** | Realizar un ajuste manual al monto asignado de un trabajador y verificar que queda registrado en auditoría |
| **Precondiciones** | Distribución calculada en estado Pendiente |
| **Pasos** | 1. Ajustar Montos. 2. Modificar el monto de un trabajador. 3. Ingresar motivo del ajuste. 4. Guardar |
| **Esperado** | El campo monto se vuelve editable. El sistema obliga a ingresar un motivo. El log de auditoría registra: usuario, fecha, monto anterior, monto nuevo, motivo. El trabajador afectado se marca visualmente como "Ajustado" |

### CP-S4-022: Validar, confirmar e integrar con planilla
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-003 — CA#5 |
| **Descripción** | Confirmar la distribución de propinas y verificar que se integra al cálculo de planilla |
| **Precondiciones** | Distribución en estado Pendiente/Válidado |
| **Pasos** | 1. Validar y Confirmar distribución. 2. Estado cambia a "Aplicado". 3. Ir a Cálculo de Planilla del mismo período. 4. Verificar que las propinas aparecen como concepto en los ingresos de cada trabajador |
| **Esperado** | Después de confirmar, la distribución queda bloqueada (solo reversión controlada). En planilla, cada trabajador tiene un concepto "Propinas" con el monto asignado |

### CP-S4-023: Reportes de propinas — resumen y detalle
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-PN-CP-003 — CA#7, CA#8 |
| **Descripción** | Visualizar reporte resumido y detallado de propinas por período y exportar |
| **Precondiciones** | Distribución confirmada |
| **Pasos** | 1. Ver reporte resumido por período y sede: total recaudado, total distribuido, trabajadores participantes. 2. Ver reporte detallado por trabajador. 3. Exportar a Excel. 4. Exportar a PDF |
| **Esperado** | El reporte resumido muestra totales. El detallado muestra cada trabajador y monto. La exportación incluye: periodo, regla aplicada, trabajadores, montos, usuario responsable |

---

## 4.7 Recargo al Consumo (#67)

> **HU asociada:** `HU-RRH-NOM-CP-007` — Distribución del Recargo al Consumo según Periodo y Reglas Definidas

### CP-S4-024: Parametrización de reglas de distribución
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRH-NOM-CP-007 — CA#3, CA#4 |
| **Descripción** | Configurar reglas de distribución del recargo al consumo: por horas, días, rol, monto fijo o combinación |
| **Precondiciones** | — |
| **Pasos** | 1. Ir a Distribución de Recargo > Parametrizar Reglas. 2. Crear regla "Proporcional por horas trabajadas". 3. Crear regla "Por rol (Mozo 60%, Bartender 25%, Cajero 15%)". 4. Asignar prioridad entre reglas. 5. Guardar |
| **Esperado** | Las reglas se almacenan con versión histórica. No permite reglas superpuestas en fechas y locales. Vista previa de ejemplo del cálculo disponible |

### CP-S4-025: Seleccionar período y visualizar monto total recaudado
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRH-NOM-CP-007 — CA#1, CA#2 |
| **Descripción** | Seleccionar período y ver el monto total recaudado por recargo al consumo |
| **Precondiciones** | Ventas del período registradas |
| **Pasos** | 1. Seleccionar período de nómina (semanal/quincenal/mensual). 2. El sistema muestra monto total del recargo. 3. Revisar que el dato coincida con Ventas |
| **Esperado** | El monto total se importa automáticamente desde Ventas/POS. Es un campo de solo lectura. Si el período no tiene recaudación, muestra "0.00" con notificación informativa |

### CP-S4-026: Calcular distribución del recargo al consumo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRH-NOM-CP-007 — CA#7 |
| **Descripción** | Ejecutar el cálculo automático de distribución aplicando la regla seleccionada |
| **Precondiciones** | Período seleccionado, regla activa, colaboradores con datos completos |
| **Pasos** | 1. Aplicar Regla seleccionada. 2. Ver detalle del cálculo. 3. Revisar: colaborador, horas/días, % participación, monto asignado. 4. Confirmar distribución |
| **Esperado** | Cálculo proporcional correcto según regla. Solo colaboradores activos en el período son incluidos. Alertas visuales si hay colaboradores con datos incompletos |

### CP-S4-027: Bloqueo de redistribución y reversión controlada
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-RRH-NOM-CP-007 — CA#8 |
| **Descripción** | Verificar que no se permite redistribuir un período ya distribuido, y que la reversión es controlada |
| **Precondiciones** | Distribución confirmada para el período |
| **Pasos** | 1. Intentar ejecutar distribución nuevamente para el mismo período. 2. Usar "Revertir Distribución". 3. Ingresar justificación. 4. Confirmar reversión. 5. Intentar distribuir de nuevo |
| **Esperado** | Mensaje de bloqueo: "El período ya ha sido distribuido". La reversión requiere justificación y queda registrada en auditoría. Después de revertir, se puede redistribuir |

### CP-S4-028: Reporte de recargo al consumo — exportación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRH-NOM-CP-007 — CA (exportación) |
| **Descripción** | Exportar resultados de distribución a Excel y PDF |
| **Precondiciones** | Distribución confirmada |
| **Pasos** | 1. Exportar a Excel. 2. Exportar a PDF |
| **Esperado** | Excel: columnas completo (razón social, periodo, colaborador, documento, puesto, horas, días, %, monto, estado). PDF: formato apto para impresión y firma |

---

## 4.8 Cuenta Corriente — Adelantos, Préstamos y Amortizaciones (#68)

> **HU asociada:** `HU-RRHH-NOM-CC-001` — Gestión de adelantos, préstamos y amortizaciones por trabajador

### CP-S4-029: Registrar préstamo con cuotas — cálculo automático
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-CC-001 — CA#1, CA#3 |
| **Descripción** | Registrar un préstamo a un trabajador y verificar el cálculo automático de cuotas |
| **Precondiciones** | Trabajador activo |
| **Pasos** | 1. Gestión de Adelantos y Préstamos > Nuevo. 2. Seleccionar trabajador. 3. Tipo: "Préstamo". 4. Ingresar monto total S/1,500. 5. N° cuotas: 5. 6. Verificar monto por cuota calculado (S/300). 7. Marcar "Descuento en Planilla". 8. Guardar |
| **Esperado** | Código de préstamo autogenerado (PR-000XXX). Monto por cuota calculado automáticamente (monto total / cuotas). Estado "Activo". Al guardar, se genera la primera cuota pendiente |

### CP-S4-030: Validación de topes máximos por política
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-RRHH-NOM-CC-001 — CA#2 |
| **Descripción** | Validar que el monto de préstamo no excede los topes configurados (% del sueldo o monto fijo) |
| **Precondiciones** | Trabajador con sueldo S/1,200. Tope configurado: 40% del sueldo |
| **Pasos** | 1. Registrar préstamo por S/600 (50% del sueldo). 2. Intentar guardar |
| **Esperado** | Mensaje de alerta: "El monto excede el tope máximo permitido (40% del sueldo = S/480)". Se puede ajustar el monto o cancelar |

### CP-S4-031: Pago anticipado y cancelación total
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-CC-001 — CA#4 |
| **Descripción** | Registrar un pago anticipado y cancelar totalmente un préstamo |
| **Precondiciones** | Préstamo activo con cuotas pendientes |
| **Pasos** | 1. Seleccionar préstamo activo. 2. "Pago Anticipado". 3. Ingresar monto mayor a la cuota. 4. Confirmar. 5. Para cancelación total: "Cancelar Préstamo". 6. Confirmar |
| **Esperado** | El pago anticipado reduce el saldo pendiente. La cancelación total cambia el estado a "Cancelado". Las cuotas restantes se descartan. Log de auditoría registra la operación |

### CP-S4-032: Integración de amortizaciones con planilla
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **HU Ref** | HU-RRHH-NOM-CC-001 — CA#5 |
| **Descripción** | Verificar que la cuota del préstamo se descuenta automáticamente en la planilla del período |
| **Precondiciones** | Préstamo activo con "Descuento en Planilla" marcado |
| **Pasos** | 1. Calcular planilla del período. 2. Ver detalle del trabajador. 3. Localizar concepto de descuento del préstamo. 4. Confirmar que el monto coincide con la cuota |
| **Esperado** | El descuento aparece como concepto fijo en la sección de descuentos de la planilla. El neto a pagar refleja la deducción |

### CP-S4-033: Reporte histórico de préstamos por trabajador
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-NOM-CC-001 — CA#6, CA#7 |
| **Descripción** | Consultar el histórico completo de préstamos de un trabajador |
| **Precondiciones** | Trabajador con múltiples préstamos registrados |
| **Pasos** | 1. Seleccionar trabajador. 2. Ver histórico: código, monto, cuotas, saldo pendiente, estado. 3. Exportar reporte |
| **Esperado** | Tabla histórica con todos los préstamos. Saldo pendiente actualizado. Exportación a Excel/PDF con datos completos |

---

## 4.9 Cálculo de Planilla — Aportes, Retenciones y Ejecución (#69)

> **HU asociada:** `HU-RRHH-NOM-AR-001` — Cálculo de impuestos al trabajo y contribuciones sociales

### CP-S4-034: Configuración de tasas de aportes y retenciones
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-AR-001 — CA#1, CA#2, CA#5 |
| **Descripción** | Configurar tasas de AFP, ONP, ESSALUD e IRPF con vigencia y topes |
| **Precondiciones** | — |
| **Pasos** | 1. Aportes y Retenciones > Parámetros. 2. Crear tasa AFP con % y tope máximo. 3. Crear tasa ESSALUD. 4. Crear IRPF con tabla por tramos. 5. Asignar vigencia a cada tasa |
| **Esperado** | Las tasas se guardan con versión histórica. Los topes máximos/mínimos se validan. Los cambios de tasa se registran en auditoría con usuario y fecha |

### CP-S4-035: Desglose de contribuciones patronales vs retenciones del trabajador
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-NOM-AR-001 — CA#3 |
| **Descripción** | Visualizar en el detalle de planilla las contribuciones desglosadas por tipo |
| **Precondiciones** | Planilla calculada con aportes |
| **Pasos** | 1. Ver detalle de planilla de un trabajador. 2. Identificar secciones: "Aportes del Trabajador" y "Aportes del Empleador". 3. Verificar montos |
| **Esperado** | Sección separada visualmente para retenciones (AFP/ONP del trabajador) y contribuciones patronales (ESSALUD, SCTR). Cada concepto muestra: base, tasa, monto. Subtotales por sección |

### CP-S4-036: Cálculo de planilla integrando todos los componentes
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-PN-CP-001 + HU-RRHH-NOM-AR-001 |
| **Descripción** | Ejecutar planilla completa con conceptos fijos, variables, propinas y aportes integrados |
| **Precondiciones** | Período definido, trabajador con sueldo, HE cargadas, propinas distribuidas, préstamo activo |
| **Pasos** | 1. Ejecutar cálculo de planilla para el período. 2. Visualizar tabla de resultados |
| **Esperado** | Indicador de progreso (sp_calcular_planilla + sub-SPs). Tabla con: trabajador, ingresos (sueldo + HE + propinas), descuentos (AFP + IRPF + préstamo), aportes patronales (ESSALUD), neto a pagar. No permite recalcular sin confirmación |

### CP-S4-037: Recalcular planilla sobreescribiendo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Recalcular planilla existente con confirmación |
| **Precondiciones** | Planilla ya calculada para el período |
| **Pasos** | 1. Intentar calcular planilla del mismo período. 2. Confirmar en modal "Ya existe planilla, ¿desea recalcular?" |
| **Esperado** | Modal con advertencia de sobreescritura. Al confirmar, los datos anteriores se reemplazan. No permite recalcular si el período está cerrado |

### CP-S4-038: Reporte detallado de aportes por trabajador y centro de costo
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-NOM-AR-001 — CA#7 |
| **Descripción** | Generar reporte desglosado de aportes y retenciones |
| **Precondiciones** | Planilla calculada |
| **Pasos** | 1. Reporte de Aportes. 2. Filtrar por centro de costo. 3. Generar. 4. Exportar |
| **Esperado** | Columnas: trabajador, tipo fondo, base, tasa, monto, total por centro de costo. Exportable |

### CP-S4-039: Validación — trabajador sin asistencia en planilla
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **Descripción** | Verificar comportamiento con trabajadores sin registro de asistencia en el período |
| **Precondiciones** | Trabajador sin asistencia registrada |
| **Pasos** | 1. Calcular planilla. 2. Revisar trabajador sin asistencia |
| **Esperado** | Advertencia visual junto al nombre del trabajador. Ingresos por días trabajados = 0. Descuentos fijos (AFP, préstamo) aún se aplican si corresponde |

---

## 4.10 Liquidaciones de Vacaciones, Indemnizaciones y Beneficios Legales (#70)

> **HU asociada:** `HU-RRHH-NOM-LIQ-001` — Liquidación de vacaciones, indemnizaciones y otros beneficios legales

### CP-S4-040: Selección de trabajador y tipo de cese
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#1 |
| **Descripción** | Iniciar liquidación seleccionando trabajador y tipo de cese, verificar que el sistema cargue datos automáticos |
| **Precondiciones** | Trabajador activo con 1+ año de antigüedad |
| **Pasos** | 1. Liquidaciones > Cálculo de Liquidación de Beneficios. 2. Seleccionar trabajador (autocompletado). 3. Elegir tipo de cese: "Renuncia voluntaria". 4. Verificar que Fecha de Ingreso se carga automáticamente. 5. Ingresar Fecha de Cese. 6. Validar que los días de vacaciones pendientes se calculan |
| **Esperado** | Solo muestra trabajadores activos o en proceso de cese. El tipo de cese determina las fórmulas aplicables (renuncia, despido, jubilación, fallecimiento). Fecha de ingreso es solo lectura. Vacaciones pendientes se calculan automáticamente desde el registro de asistencias |

### CP-S4-041: Cálculo completo de liquidación — todos los conceptos
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#2 |
| **Descripción** | Ejecutar cálculo de liquidación y verificar cada concepto generado |
| **Precondiciones** | Trabajador seleccionado, tipo de cese elegido, fecha de cese ingresada |
| **Pasos** | 1. Ejecutar cálculo (sp_liquidar_beneficios). 2. Visualizar tabla de liquidación. 3. Verificar cada concepto: Vacaciones pendientes (días x valor día). Indemnización por despido (según ley vigente). Gratificación trunca. CTS trunca. Bonificaciones pendientes. Deducciones (préstamos, anticipos). 4. Verificar Total a Pagar |
| **Esperado** | La tabla muestra todos los conceptos aplicables al tipo de cese seleccionado. Los montos calculados se basan en la fecha de ingreso y cese. Las deducciones provienen de cuentas corrientes activas. El Total a Pagar = suma beneficios - deducciones. Campos calculados son solo lectura |

### CP-S4-042: Indemnización según tipo de cese
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#2 (indemnización) |
| **Descripción** | Verificar que la indemnización se calcula distinto según el tipo de cese |
| **Precondiciones** | Dos trabajadores con misma antigüedad |
| **Pasos** | 1. Liquidar Trabajador A con cese "Renuncia voluntaria". 2. Ver monto de indemnización. 3. Liquidar Trabajador B con cese "Despido". 4. Comparar montos de indemnización |
| **Esperado** | Para renuncia: sin indemnización o monto mínimo legal. Para despido: indemnización según ley vigente (ej. 1.5 sueldos por año). El tipo de cese se refleja en el comprobante |

### CP-S4-043: Deducciones integradas con cuenta corriente
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#2 (deducciones), HU-RRHH-NOM-CC-001 |
| **Descripción** | Verificar que los préstamos y anticipos activos se descuentan automáticamente en la liquidación |
| **Precondiciones** | Trabajador con préstamo activo y saldo pendiente |
| **Pasos** | 1. Iniciar liquidación del trabajador. 2. Ejecutar cálculo. 3. Verificar que aparece "Deducciones / Retenciones" con el saldo pendiente del préstamo |
| **Esperado** | El saldo pendiente de préstamos y anticipos se deduce automáticamente. El monto deducido valida contra la cuenta corriente del trabajador. Si no hay deudas, el campo muestra 0.00 |

### CP-S4-044: Aprobación digital antes del pago
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#6 |
| **Descripción** | Registrar aprobación digital de la liquidación antes de proceder al pago |
| **Precondiciones** | Liquidación calculada en estado "Calculada" |
| **Pasos** | 1. Ir a liquidación calculada. 2. Ver estado: "Calculada". 3. Enviar a revisión. 4. Usuario con rol aprobador revisa y aprueba. 5. Estado cambia a "Aprobada" |
| **Esperado** | Flujo de estados: Calculada → En revisión → Aprobada. Solo usuarios autorizados pueden aprobar. La aprobación queda registrada con usuario, fecha y hora. Sin aprobación no se habilita el pago ni la generación del comprobante |

### CP-S4-045: Generación de comprobante PDF y XML
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#5 |
| **Descripción** | Generar comprobante de liquidación en PDF y XML |
| **Precondiciones** | Liquidación aprobada |
| **Pasos** | 1. Liquidación aprobada. 2. "Generar Comprobante". 3. Seleccionar formato PDF. 4. Visualizar PDF. 5. Generar XML. 6. Verificar contenido |
| **Esperado** | PDF con: datos empresa y trabajador, tipo de cese, fecha ingreso/cese, desglose de conceptos, total a pagar, firma digital. XML con estructura para SUNAT/entidad regulatoria (si aplica). Ambos descargables |

### CP-S4-046: Visualización en moneda local y corporativa
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA#9 |
| **Descripción** | Verificar que la liquidación se muestra en moneda local con opción de ver en moneda corporativa |
| **Precondiciones** | Liquidación calculada |
| **Pasos** | 1. Ver liquidación en moneda local (PEN). 2. Alternar a moneda corporativa (USD). 3. Verificar tipo de cambio aplicado |
| **Esperado** | Por defecto muestra en moneda local. Selector de moneda visible. Al cambiar, los montos se convierten usando el TC del día. Ambos valores se almacenan |

### CP-S4-047: Validaciones de liquidación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟡 Validación |
| **HU Ref** | HU-RRHH-NOM-LIQ-001 — CA (general) |
| **Descripción** | Validar reglas de negocio que bloquean o advierten en el proceso de liquidación |
| **Precondiciones** | — |
| **Pasos** | 1. Liquidar trabajador con < 3 meses de antigüedad (advertencia). 2. Fecha de cese futura (bloqueo). 3. Fecha de cese anterior a fecha de ingreso (bloqueo). 4. Trabajador ya liquidado previamente (bloqueo). 5. Trabajador sin datos de cuenta bancaria (advertencia) |
| **Esperado** | < 3 meses: mensaje informativo "El trabajador no acumula beneficios por CTS/gratificación". Fecha cese futura: "La fecha de cese no puede ser posterior a hoy". Fecha cese < ingreso: error en campo. Ya liquidado: "El trabajador ya posee una liquidación registrada". Sin cuenta bancaria: advertencia amarilla |

---

## 4.11 Gratificaciones y CTS (#71)

### CP-S4-048: Cálculo de gratificación
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Ejecutar cálculo de gratificaciones (julio/diciembre) |
| **Precondiciones** | Trabajadores con 6+ meses de antigüedad |
| **Pasos** | 1. Gratificaciones. 2. Seleccionar período. 3. Ejecutar (sp_calcular_gratificacion). 4. Ver detalle por trabajador |
| **Esperado** | Montos calculados según RMV y tiempo laborado. Resumen visible. No permite duplicar período |

### CP-S4-049: Cálculo de CTS
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Ejecutar cálculo de CTS |
| **Precondiciones** | Trabajadores con 4+ meses |
| **Pasos** | 1. CTS. 2. Período. 3. Ejecutar (sp_calcular_cts). 4. Detalle |
| **Esperado** | CTS calculado según antigüedad y remuneración |

---

## 4.12 Saldos de Cuenta Corriente (#72)

### CP-S4-050: Consultar saldos de cuenta corriente
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟢 UI |
| **Descripción** | Visualizar netos, adelantos y saldos de trabajadores |
| **Precondiciones** | Planilla calculada |
| **Pasos** | 1. Saldos de Cuenta Corriente. 2. Seleccionar período. 3. Ver tabla de trabajadores |
| **Esperado** | Columnas: trabajador, ingresos, descuentos, adelantos, neto a pagar, saldo pendiente. Filtro por trabajador. Totales al pie. Exportación |

---

## 4.13 Boletas de Pago (#73)

### CP-S4-051: Emisión de boletas de pago
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔵 Funcional |
| **Descripción** | Generar y visualizar boletas de pago electrónicas |
| **Precondiciones** | Planilla calculada |
| **Pasos** | 1. Emisión de Boletas. 2. Seleccionar período. 3. Marcar trabajadores. 4. Generar (sp_generar_boleta_pago). 5. Visualizar PDF |
| **Esperado** | Boleta PDF: datos empresa + trabajador, ingresos (sueldo, HE, bonos, propinas), descuentos (AFP, IRPF, préstamo), neto. Vista previa web. Descarga individual o masiva |

### CP-S4-046: Boletas — bloqueo sin planilla calculada
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🟣 Estado |
| **Descripción** | Validar que no se emiten boletas sin planilla calculada |
| **Precondiciones** | Período sin planilla |
| **Pasos** | 1. Intentar emitir boletas |
| **Esperado** | Mensaje: "No existe planilla calculada para este período". Botón que redirige al cálculo |

---

## 4.14 Casos E2E Scripteados — Sprint 4

### CP-S4-E2E-01: Asistencia → Variables → Planilla → Boletas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **HU Ref** | HU-RRHH-PN-CP-001 + HU-RRHH-PN-CP-002 + HU-RRHH-PN-CP-003 |
| **Descripción** | Flujo completo: asistencia con HE + carga variables → propinas → planilla → boletas |
| **Precondiciones** | Trabajador activo con conceptos fijos. Ventas con propinas en el período |
| **Pasos** | 1. Registrar asistencia con horas extra. 2. Cargar bono variable por archivo Excel. 3. Definir regla de propinas. 4. Distribuir propinas. 5. Calcular planilla. 6. Emitir boleta PDF |
| **Esperado** | La boleta incluye: sueldo base, HE, bono, propinas (ingresos) y AFP, IRPF, préstamo (descuentos). Neto correcto. Trazabilidad completa: cada componente tiene origen identificable |

### CP-S4-E2E-02: Recargo al Consumo + Aportes → Planilla → Boletas
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **HU Ref** | HU-RRH-NOM-CP-007 + HU-RRHH-NOM-AR-001 |
| **Descripción** | Flujo completo: recargo al consumo + aportes patronales en planilla |
| **Precondiciones** | Ventas con recargo en el período. Tasas de aportes configuradas |
| **Pasos** | 1. Configurar regla de recargo al consumo. 2. Distribuir recargo. 3. Configurar tasas AFP y ESSALUD. 4. Calcular planilla. 5. Verificar desglose de aportes. 6. Emitir boletas |
| **Esperado** | La boleta muestra: recargo al consumo como ingreso separado. Aportes desglosados en dos secciones (trabajador / empleador). Neto calculado correctamente |

### CP-S4-E2E-03: Gestión de Adelantos + Préstamos → Planilla → Reporte
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **HU Ref** | HU-RRHH-NOM-CC-001 |
| **Descripción** | Flujo completo: registrar adelanto/préstamo → descuento en planilla → consultar saldos |
| **Precondiciones** | Trabajador activo |
| **Pasos** | 1. Registrar adelanto de sueldo. 2. Registrar préstamo con 3 cuotas. 3. Verificar tope no excedido. 4. Calcular planilla del período. 5. Verificar descuentos aplicados. 6. Consultar saldos de cuenta corriente. 7. Ver reporte histórico |
| **Esperado** | La planilla descuenta el adelanto completo + la primera cuota del préstamo. Saldo pendiente se refleja en cuenta corriente. Reporte exportable |

### CP-S4-E2E-04: Liquidación + Cierre de Nómina
| Campo | Detalle |
|-------|---------|
| **Tipo** | 🔗 Integración |
| **Descripción** | Liquidar trabajador, procesar gratificación/CTS y emitir boletas |
| **Precondiciones** | Trabajador con 1+ año |
| **Pasos** | 1. Calcular liquidación. 2. Calcular gratificación. 3. Calcular CTS. 4. Consultar saldos. 5. Emitir boletas |
| **Esperado** | Todos los beneficios truncos proporcionales. Saldos consistentes. Boletas con todos los conceptos |

---

# Resumen de Cobertura

| Sprint | Módulo | CP Funcionales | CP UI | CP Validación | CP Estado | CP Integración | **Total** | **HU Trazadas** |
|--------|--------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **S1** | Compras + CxP + Maestros | 30 | 6 | 9 | 3 | 3 | **51** | 5 HU |
| **S2** | Finanzas + Contabilidad | 17 | 2 | 1 | 0 | 5 | **25** | — |
| **S3** | Activos Fijos + RRHH inicio | 23 | 3 | 4 | 0 | 3 | **33** | 15 HU |
| **S4** | RR.HH completo | 32 | 8 | 8 | 1 | 7 | **56** | 7 HU |
| | **Totales** | **102** | **19** | **22** | **4** | **18** | **165** | **27 HU** |

> **HU trazadas en S1 (Compras + CxP):**
> - `HU-COM-003` — Generar Orden de Compra → CP-S1-009 al 016
> - `HU-COM-004` — Aprobación de OC → CP-S1-017 al 022
> - `HU-FIN-OPE-001` — Facturas desde Compras → CP-S1-026, 029
> - `HU-FIN-OP-CP-001` — Facturas No Asociadas a Compras → CP-S1-027, 028, 030, 031, 032
> - `HU-COM-OPE-003` — Ajustes / NC / ND → CP-S1-033 al 038
>
> **HU trazadas en S3 (Activos Fijos):**
> - `HU-AF-TABOPE-0091` — Registro Principal de Activos → CP-S3-001 al 005
> - `HU-AF-001` — Tipos de Operación → CP-S3-006
> - `HU-AF-002` — Tipos de Incidencia → CP-S3-007
> - `HU-AF-TAB-001` — Aseguradoras → CP-S3-008
> - `HU-AF-TAB-004` — Matriz Contable por Subclase → CP-S3-009, 010
> - `HU-AF-OPE-004` — Operaciones Especiales → CP-S3-011, 012
> - `HU-AF-OPE-006` — Baja de Activos → CP-S3-013 al 015
> - `HU-AF-OPE-008` — Tasas y Métodos Depreciación → CP-S3-016
> - `HU-AF-OPE-007` — Revaluación Técnica/Comercial → CP-S3-017, 018
> - `HU-AF-PRO-001` — Cálculo Masivo Depreciación → CP-S3-019
> - `HU-AF-PRO-002` — Asientos Contables Depreciación → CP-S3-020
> - `HU-AF-PRO-003` — Asientos Revaluación → CP-S3-021
> - `HU-AF-PRO-005` — Devengo Seguros → CP-S3-022
> - `HU-AF-REP-001` — Listado General Activos → CP-S3-023
> - `HU-AF-REP-002` — Depreciación Anual por Activo → CP-S3-024
>
> **HU trazadas en S4 (RR.HH Planillas):**
> - `HU-RRHH-PN-CP-001` — Conceptos Fijos → CP-S4-008 al 014
> - `HU-RRHH-PN-CP-002` — Carga Masiva de Variables → CP-S4-015 al 018
> - `HU-RRHH-PN-CP-003` — Distribución de Propinas → CP-S4-019 al 023
> - `HU-RRH-NOM-CP-007` — Recargo al Consumo → CP-S4-024 al 028
> - `HU-RRHH-NOM-CC-001` — Adelantos y Préstamos → CP-S4-029 al 033
> - `HU-RRHH-NOM-AR-001` — Aportes y Retenciones → CP-S4-034 al 038
>
> **Nota:** Los casos **Edge** se incorporan dentro de las validaciones de cada funcionalidad. Se recomienda una ronda adicional de pruebas de **rendimiento** y **seguridad** (OWASP Top 10) fuera del alcance de este documento.

---

*Documento generado el 17/06/2026 — v3.0 — 165 casos, 27 HU trazadas (Compras, CxP, Activos Fijos, RR.HH Planillas) — QA Senior - Frontend Testing*

---

## 🆕 Alineación Backend — Motor de Asientos v2 (03/07/2026)

> **Referencia:** `reportes/01-VISION.md` a `reportes/05-CATALOGO_EVENTOS.md`
> **Nota:** El motor v2 está en fase de diseño. Los CPs de este documento validan la UI. La validación del asiento contable resultante requiere casos adicionales de los CSVs por módulo.

### Mapeo CP → Evento de Dominio

| Sección | CPs | Evento Motor v2 | Asientos |
|:--------|:----|:----------------|:---------|
| 1.1 Proveedores | CP-S1-001 al 008 | (maestro, no genera evento) | — |
| 1.2 OC | CP-S1-009 al 016 | (intención, no genera evento) | — |
| 1.3 Aprobación OC | CP-S1-017 al 022 | (workflow, no genera evento) | — |
| 1.5 CxP | CP-S1-026 al 032 | `COMPRA_REGISTRADA` | 1 |
| 1.6 NC/ND | CP-S1-033 al 038 | `NC_COMPRA` | 1 (revierte) |
| 1.8 Reportes Compras | CP-S1-040, 041 | `sp_generar_reporte_compras` | — |
| 3.1 Maestro AF | CP-S3-001 al 005 | (maestro) | — |
| 3.3 Operaciones AF | CP-S3-011, 012 | `MEJORA_ACTIVO` | 1 |
| 3.3 Baja AF | CP-S3-013 al 015 | `BAJA_ACTIVO` / `VENTA_ACTIVO` | 1 |
| 3.4 Depreciación | CP-S3-016, 019 | `DEPRECIACION_MENSUAL` | 1 |
| 3.4 Revaluación | CP-S3-017, 018 | `REVALUACION_ACTIVO` | 1 |
| 3.4 Asientos | CP-S3-020, 021 | (batch desde depreciación/revaluación) | 1 |
| 3.4 Devengo Seguros | CP-S3-022 | `DEVENGAMIENTO_SEGURO` | 1 |
| 3.5 RRHH Config | CP-S3-025 al 027 | (maestro) | — |
| 3.6 Personal | CP-S3-028 al 030 | (maestro) | — |
| 4.4 Conceptos Fijos | CP-S4-008 al 014 | `PLANILLA_DEVENGADA` | 1 |
| 4.5 Carga Variables | CP-S4-015 al 018 | `PLANILLA_DEVENGADA` | 1 |
| 4.6 Propinas | CP-S4-019 al 023 | `sp_calcular_propinas` | — |
| 4.7 Recargo | CP-S4-024 al 028 | `sp_calcular_recargo_consumo` | — |
| 4.8 Cuenta Corriente | CP-S4-029 al 033 | `PRESTAMO_DESEMBOLSADO` / `PRESTAMO_CUOTA_PAGADA` | 1 |
| 4.9 Cálculo Planilla | CP-S4-034 al 039 | `PLANILLA_DEVENGADA` / `PLANILLA_PAGADA` | 1 cada uno |
| 4.10 Liquidaciones | CP-S4-040 al 047 | `sp_liquidar_beneficios` | — |
| 4.11 Gratificación/CTS | CP-S4-048, 049 | `PROVISION_GRATIFICACION` / `PROVISION_CTS` | 1 cada uno |
| 4.12 Saldos CC | CP-S4-050 | `sp_generar_pago_remuneraciones` | — |
| 4.13 Boletas | CP-S4-051 | `sp_generar_boleta_pago` | — |

### Multi-País 🆕

> **Nota:** Los CPs actuales no consideran variaciones por país. Las diferencias clave por país son:

| Aspecto | PE (Perú) | CO (Colombia) | EC (Ecuador) |
|:--------|:----------|:--------------|:-------------|
| IVA | 18% | 19% | 15% |
| Plan Contable | PCGE | PUC | SRI/NIIF |
| Impuestos extra | Detracción, Percepción, ITF, ICBPER | ReteFuente, ReteIVA, ReteICA, GMF, INC | ISD |
| Autoridad Fiscal | SUNAT | DIAN | SRI |
| Moneda funcional | PEN | COP | USD |
| Formato RUC/DNI | 11 dígitos | NIT | RUC |

> Se requieren CPs adicionales que validen el comportamiento del sistema con configuración de Colombia y Ecuador.

### Gaps Conocidos 🆕

> **Fuente:** `reportes/COMPARATIVO_COBERTURA.md` y `reportes/PLANTILLA_EJECUCION_MANUAL_SPRINT1.md`

| # | Gap | Módulo | Impacto en CPs |
|---|-----|--------|:--------------|
| 1 | Pantalla de Caja Chica no existe | Finanzas | Bloquea ~5 CPs nuevos |
| 2 | Pago parcial de factura | Finanzas | Afecta CP-S1-026 y flujos E2E |
| 3 | Pago mixto | Finanzas | No cubierto por CPs actuales |
| 4 | Pago con tarjeta crédito corporativa | Finanzas | No cubierto |
| 5 | Anticipo sin documento | Compras | No cubierto |
| 6 | Importación con DAM/DUA | Compras | No cubierto |
| 7 | Diferencia de cambio en pago ME | Tesorería | No cubierto |
| 8 | Gasto anticipado con devengo | Compras | No cubierto |
| 9 | Factura con detracción del cliente | Ventas | No cubierto |
