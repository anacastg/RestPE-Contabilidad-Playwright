# Plantilla de Ejecución Manual — Sprint 1

> **Responsable:** 
> **Fecha de prueba:** 
> **Ambiente:** `https://panel.dev.contabilidad.restaurant.pe/`
> **Usuario:** pcastillo
> **Empresa:** PESQUERA CANTABRIA S.A.
> **Sucursal:** LIMA
> **Navegador/App:** `[Chrome / Edge / App móvil]`
> **Actualizado:** 03/07/2026 — Agregados 31 nuevos casos de CSVs Compras/Ventas 🆕

---

## Flujo de Ingreso

1. Ir a `https://panel.dev.contabilidad.restaurant.pe/`
2. Ingresar usuario y contraseña → clic **Iniciar Sesión**
3. Seleccionar **PESQUERA CANTABRIA S.A.**
4. Seleccionar sucursal **LIMA**
5. Dashboard → `https://panel.dev.contabilidad.restaurant.pe/inicio`

---

## Módulos del Sidebar (Compras)

```
Almacén | Compras | Ventas | Finanzas | Contabilidad | Activos fijos | RR.HH | Producción | Configuración
```

> **Nota:** El sidebar usa un mega-menú que se despliega al hacer hover sobre cada módulo, no al hacer clic.
> Si una ruta del CSV no coincide exactamente con la navegación real, anotalo en Observaciones.

### Submenú del módulo Compras (detectado en scrapping)

| Categoría | Opciones |
|:----------|:---------|
| **Tablas** | Proveedores, Condiciones de pago |
| **Operaciones** | Generar OC, Aprobar OC, Generar OS, Aprobar OS, Registro de comprobantes, Notas crédito/débito, Facturas que pertenecen a gastos |
| **Cotizaciones** | Registrar cotización |
| **Reportes** | Reportes de compras, Compras en tránsito, Compras por ingresar, Análisis de proveedores, Compras por categorías, Gestión de compras, Compras sugeridas |

---

## Rutas Reales Mapeadas (confirmadas en web + scrapping)

| # CSV | Módulo | Ruta Web | URL / routerLink | Estado |
|:-----:|:-------|:---------|:-----------------|:------:|
| — | Dashboard | `Inicio` | `/inicio` | ✅ |
| 1 | Compras > Proveedores | Gestión de Proveedores | `/compras/tabla/gestion-proveedores` | ✅ |
| 2 | Compras > Generar OC | Generar Orden de Compra | `/compras/operaciones/ordenes-compra` | ✅ |
| 3 | Compras > Aprobar OC | Aprobar Orden de Compra | `/compras/operaciones/aprobar-compra` | ✅ |
| 4 | Compras > Generar OS | (pendiente de mapear) | `?` | 🔲 |
| 6 | Compras > Facturas CxP | Registro de comprobantes | `/compras/operaciones/registro-comprobantes` | ✅ |
| 7 | Compras > NC/ND | Notas crédito/débito | `?` | 🔲 |
| 8 | Compras > DPD | (pendiente) | `?` | 🔲 |
| 9 | Compras > Gestión de compras | Reporte de compras | `/compras/reportes/gestion-compras` | ✅ |
| 10 | Ventas > Registro SUNAT | (pendiente) | `?` | 🔲 |
| 11 | Ventas > Reporte Tributario | (pendiente) | `?` | 🔲 |
| 15 | Finanzas > Cuentas Bancos | (pendiente) | `?` | 🔲 |
| 16 | Finanzas > Medios de Pago | (pendiente) | `?` | 🔲 |
| 17 | Finanzas > Formas de Pago | (pendiente) | `?` | 🔲 |
| 33 | Contabilidad > Tipo de Cambio | (pendiente) | `?` | 🔲 |
| — | Ventas | Registro de facturas | `/ventas/facturacion-de-regalias` | ✅ |
| — | Finanzas | Consulta saldos caja/bancos | `/finanzas/consultas/consultas-saldos-caja-bancos` | ✅ |
| — | Finanzas | Mov. cuentas bancarias y cajas | `/finanzas/tesoreria/mov-cuentas-banc-y-cajas` | ✅ |

> **Importante:** Las rutas marcadas con 🔲 se mapean durante las pruebas manuales.
> Cuando navegues a una pantalla, anotá la URL completa del navegador.

---

## Instrucciones

1. Probá cada caso listado abajo.
2. Marcá **Resultado** como ✅ Pasó / ❌ Falló / ⚠️ Bloqueado / ➖ No aplica.
3. Si falla: completá **Observaciones** (paso exacto donde falla, mensaje de error, comportamiento actual vs esperado).
4. Adjuntá **evidencias** en la ruta que indiques o pegá el link.
5. Si una ruta/pantalla no se encuentra exactamente como describe el CSV, anotalo.
6. **Importante:** Al navegar, anotá la URL exacta del navegador para actualizar el mapa de rutas.

### Estructura de pantallas conocidas (útil para pruebas)

#### Pantalla de Proveedores (`/compras/tabla/gestion-proveedores`)

| Aspecto | Detalle |
|:--------|:--------|
| **Layout** | Split-view: AG Grid (izquierda) + Formulario (derecha) con flecha para expandir a ancho completo |
| **Tabs del formulario** | General | Bancaria | Comercial |
| **Campos (formcontrolname)** | Razón Social, Nombre Comercial, Tipo Identificación, Ident Fiscal, Dirección Fiscal, Email, Teléfono, Estado, Proveedor (Nac/Ext), Nombre Contacto, Cargo, Condición de Pago |
| **Estructura HTML** | Los campos usan `<ion-input formcontrolname="X">` con un `<input>` interno en Light DOM (NO Shadow DOM) |
| **Columnas AG Grid** | Código | Razón social | Documento fiscal | Cargo | Estado |
| **Filas AG Grid** | `<div class="ag-row ag-row-even/odd" role="row">` dentro de `.ag-center-cols-container` |
| **Botón "Nuevo proveedor"** | Se habilita cuando NO hay cambios sin guardar. Si hay datos sucios → modal "descartar cambios" |
| **Botón "Registrar"** | Cambia a "Guardar" cuando se edita un proveedor existente |
| **Overlay** | Hay un `<div class="filtros-absolutos">` que puede interceptar clicks → usar DevTools para identificar elementos bloqueados |

##### Tab General

| Campo | Tipo | Detalle |
|:------|:-----|:--------|
| Documento Fiscal | `input` + lupa + badge | Input muestra tipo doc (RUC), tiene lupa para buscar si ya está registrado (si existe, trae datos automáticamente) |
| Razón Social | `ion-input` | Texto libre |
| Nombre Comercial | `ion-input` | Texto libre |
| Dirección Fiscal | `ion-input` | Texto libre |
| Email | `ion-input` | Email |
| Teléfono | `ion-input` | Número |
| Estado | `ion-select` | Dropdown (Activo / Inactivo) |
| Proveedor | `ion-select` | Dropdown (Nacional / Extranjero) |

##### Tab Bancaria

| Elemento | Tipo | Detalle |
|:---------|:-----|:--------|
| Buscar cuentas | `input` | Placeholder "buscar cuentas bancarias" |
| Nueva cuenta | `button` | Abre modal "Agregar cuenta" |
| Lista cuentas | Tabla | Columnas: Banco, N° Cuenta, CCI, Tipo, Moneda, Estado, Acciones (editar/eliminar) |

**Modal "Agregar cuenta":**
| Campo | Tipo | Detalle |
|:------|:-----|:--------|
| Banco | `ion-select` | Dropdown con lista de bancos |
| Nro de Cuenta | `ion-input` | Texto |
| Código Interbancario | `ion-input` | CCI |
| Tipo de Cuenta | `ion-select` | Dropdown |
| Moneda | `ion-select` | Dropdown |
| Estado | `ion-select` | Dropdown (Activo / Inactivo) — ❓ *¿Debería poderse crear una cuenta bancaria con estado Inactivo?* |
| Cancelar | `button` | Cierra modal sin guardar |
| Agregar cuenta | `button` | Guarda la cuenta |

##### Tab Comercial

| Campo | Tipo | Detalle |
|:------|:-----|:--------|
| Nombre de Contacto | `ion-input` | Texto libre |
| Cargo | `ion-input` | Texto libre |
| Teléfono | `ion-input` | Número |
| Email | `ion-input` | Email |
| Cancelar | `button` | Descarta cambios |
| Registrar | `button` | Guarda proveedor |

---

## Tipos de Evidencia Recomendados

| Tipo | Descripción | Ejemplo |
|:---:|-------------|---------|
| 📸 **Captura de pantalla** | Pantalla completa mostrando el estado actual | `S1-01-listado-proveedores.png` |
| 🎥 **Video / GIF** | Flujo completo grabado (para bugs complejos) | `S1-02-OC-creacion-bug.gif` |
| 📄 **PDF** | Documento generado por el sistema (OC, boleta, reporte) | `OC-2026-000001.pdf` |
| 📊 **Excel/CSV** | Exportación de reportes o datos | `reporte-compras-export.xlsx` |
| 🖼️ **XML** | Comprobante electrónico o estructura de datos | `factura-123.xml` |
| 📝 **DevTools (F12)** | Error de consola, network, peticiones fallidas | Captura pestaña Console/Network |
| 🔗 **URL del navegador** | routerLink de la pantalla actual | `/compras/operaciones/facturas-proveedores` |

**Convención para nombrar archivos:** `{SPRINT}-{ITEM}-{DESCRIPCION}.{ext}`

Ej: `S1-01-listado-proveedores.png`, `S1-02-OC-creada.pdf`

---

## 1.1 Maestro Proveedores (#1)

> **URL:** `/compras/tabla/gestion-proveedores`
> **Menú:** Compras > Tablas > Proveedores (hover en "Compras" → "Tablas" → "Proveedores")
> **Operaciones:** Alta, edición, baja lógica, consulta
> **Layout:** Split-view (AG Grid izquierda + Formulario derecha) con tabs General | Bancaria | Comercial
> ⚠️ **Nota:** El botón "Nuevo proveedor" está deshabilitado si hay datos precargados. Seleccioná una fila del grid o actualizá la página para limpiar el formulario.

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 1.1 | Visualizar listado — columnas AG Grid, búsqueda, paginación | ✅ | `S1-1.1-listado-proveedores.png` | URL: `/compras/tabla/gestion-proveedores`. Columnas: Código, Razón social, Documento fiscal, Cargo, Estado. Buscador funcional, filtros Todos/Activos/Inactivos, paginación OK. En acciones desplegable: Exportar Excel ✅, Exportar PDF ✅, Importar proveedores ❌ (#001). Bugs referenciados: #001 (descarga plantilla no funciona), #002 (input búsqueda bancaria no se limpia), #003 (validaciones responsive se pierden al redimensionar). |
| 1.2 | Validar campos obligatorios en alta | ✅ | `S1-1.2-validaciones.png` | Aparece panel en parte superior: "Faltan datos por completar para guardar" listando: General (Documento fiscal, Razón social, Nombre comercial, Dirección fiscal, Email, Teléfono) + Comercial (Nombre de contacto, Teléfono de contacto, Email de contacto). Cada campo muestra "*" y mensaje "requerido". El botón **Registrar** se mantiene HABILITADO (no se bloquea). El botón **Nuevo proveedor** se deshabilita cuando hay datos sucios. |
| 1.3 | Alta exitosa de proveedor | ✅ | `S1-1.3-toast-exito.png` | Toast muestra: "Relación comercial creada" (no "Proveedor creado exitosamente" como esperaba el caso). El proveedor aparece en el AG Grid correctamente. |
| 1.4 | Edición de proveedor existente (seleccionar fila → modificar campos → Guardar) | ✅ | `S1-1.4-toast-guardar.png` | Toast: "Proveedor actualizado correctamente". El botón cambia de "Registrar" a "Guardar" al editar. Los cambios persisten en el listado. |
| 1.5 | Baja lógica + verificar estado Inactivo | ✅ | `S1-1.5-estado-inactivo.png` | Se cambió estado a Inactivo y guardó. El listado refleja el cambio correctamente. Aparece badge rojo "Inactivo". |
| 1.6 | Búsqueda por RUC y razón social | ✅ | `S1-1.6-busqueda-ruc.png` `S1-1.6-busqueda-razon.png` | Búsqueda por RUC exacto y por razón social parcial funcionan correctamente. |
| 1.7 | RUC duplicado — mensaje de error | ✅ | `S1-1.7-ruc-duplicado.png` | Mensaje: "Este proveedor ya está registrado. Ya existe un proveedor con el documento X. Edita el registro existente en lugar de crear uno nuevo." Incluye botón "Editar el registro existente". |
| 1.8 | Empty state sin proveedores | | | |

---

## 1.2 Orden de Compra (#2)

> **URL:** `/compras/operaciones/ordenes-compra`
> **Menú:** Compras > Operaciones > Generar OC
> **Operaciones:** Crear OC, grabar líneas, numeración, consulta, PDF, carga masiva
> **Layout:** Split-view (AG Grid izquierda + Formulario derecha)

##### Estructura del formulario de OC

**Cabecera (formcontrolnames detectados):**
| Campo | formcontrolname | Tipo |
|:------|:----------------|:-----|
| Documento Fiscal | `documentoproveedorinput` | `ion-input` + lupa de búsqueda |
| Razón social | `proveedor` | `ion-input` readonly (se completa al buscar doc) |
| Fecha de registro | `fechaRegistro` | `ion-input type="date"` disabled |
| Fecha de entrega | `fechaEntrega` | Componente calendar (`app-base-calendar-new`) |
| Almacén | `almacen` | `app-autocomplete` con buscador |
| Sucursal | `localentrega` | `app-autocomplete` con buscador |
| Dirección de entrega | `direccionEntrega` | `ion-input` |
| Centro de costos | `centrocosto` | `app-autocomplete` con buscador |
| Moneda | `moneda` | `ion-select` (Soles / Dolares Americanos) |
| Tipo de cambio | `tipoCambio` | `ion-input` readonly (visible si moneda USD) |
| Condición de pago | `condicionPago` | `app-selector-busqueda` |
| Estado | `estado` | `ion-input` disabled |

**Detalle:**
| Elemento | Descripción |
|:---------|:------------|
| Buscador productos | `app-autocomplete` con placeholder "Buscar producto por nombre o código..." |
| Nuevo producto | `ion-button` con ícono `circle-plus` |
| AG Grid columnas | Código, Descripción, Cantidad, Unidad, Precio unitario, Subtotal |
| Observaciones | `ion-textarea formcontrolname="observaciones"` |
| Totales | Subtotal, Impuestos, Total (formato `S/0.00`) |
| Registrar | `ion-button` al final del formulario |
| Cancelar | `ion-button` color="medium" fill="outline" |

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 2.1 | Pantalla nueva OC — estructura, numeración, selector proveedor | ✅ | `S1-2.1-pantalla-oc.png` | URL real: `/compras/operaciones/ordenes-compra`. Formato numeración: `CH2026000002` (no `OC-YYYY-CORRELATIVO` como indica CSV). Mismo patrón split-view que proveedores. Input de búsqueda por N° OC o proveedor (búsqueda en vivo). Dropdowns: Registro, Entrega (con selector fecha). Acciones: Exportar PDF, Exportar Excel, Importar OC (mismo bug #001 - Facebook Pixel). Botón "Nueva OC" deshabilitado si el panel de edición está vacío. |
| 2.2 | Crear OC con líneas — cálculo automático, estado Pendiente | 🟡 Parcial | `S1-2.2-oc-completa.png` | Se pudo agregar productos al detalle. No permite agregar el mismo artículo dos veces (duplicado). El botón **Eliminar** en columna Acciones **NO funciona**. Para crear un nuevo artículo desde "Nuevo producto" se requiere que los dropdowns (Cta Contable Costo, Impuesto Principal, Centro Costos, Cta Contable Inventario) tengan datos cargados, lo cual depende de configuración previa. Endpoint usado para búsqueda de proveedor: `GET /api/core/relaciones-comerciales?esProveedor=true&nroDocumento=...` |
| 2.3 | Validaciones: artículo vacío, cantidad ≤ 0, precio < 0.0001, decimales, fecha | 🚫 Bloqueado | — | No se puede probar: el usuario pcastillo no tiene permiso "comprador activo" (COM-002). Bug #006. |
| 2.4 | Generar PDF — contenido completo | 🚫 Bloqueado | — | No se puede probar: sin OC creada no hay PDF que generar. Bug #006. |
| 2.5 | Consulta con filtros combinados + exportación | 🚫 Bloqueado | — | No se puede probar: sin OC creada no hay datos que consultar. Bug #006. |
| 2.6 | Carga masiva desde Excel — resumen válidos/errores | 🚫 Bloqueado | — | No se puede probar: requiere permiso comprador activo. Bug #006. |
| 2.7 | Bloqueo edición en OC Aprobada | 🚫 Bloqueado | — | No se puede probar: sin OC creada ni aprobada. Bugs #006 y #010. |
| 2.8 | Error loading — mensaje "Intente nuevamente" + botón Reintentar | 🚫 Bloqueado | — | No se puede probar: sin OC en el sistema. Bug #006. |

---

## 1.3 Aprobación de OC (#3)

> **URL:** `/compras/operaciones/aprobar-compra`
> **Menú:** Compras > Operaciones > Aprobar OC
> **Operaciones:** Aprobar/rechazar/retornar, multinivel

##### Estructura de la pantalla

| Elemento | Detalle |
|:---------|:--------|
| **Columnas del listado** | Checkbox (selección), N° Orden de Compra, Fecha Registro, Fecha Entrega, Razón Social, Almacén, Sucursal, Moneda, Total, Estado |
| **Buscador** | Input con placeholder "Buscar órdenes de compra" |
| **Dropdowns** | Registro, Entrega (con selector de fecha al lado) |
| **Acciones** | Lista desplegable con opciones |
| **Botón Aprobar** | Deshabilitado (no se puede aprobar sin seleccionar OC) |
| **Exportar PDF** | Los montos se muestran SIN decimales |
| **Exportar Excel** | Los montos se muestran SIN decimales |
| **Importar ubicaciones** | Mismo modal con botón "Descargar plantilla" que no funciona (mismo bug #001/#005) |

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 3.1 | Listado OC pendientes — columnas, botones por fila | ✅ | `S1-3.1-listado-aprobacion.png` | Columnas correctas. Botón Aprobar deshabilitado. PDF/Excel exportan sin decimales en montos (bug #008). Importar ubicaciones con mismo modal roto (#001). |
| 3.2 | Aprobar OC — modal confirmación, cambio estado, notificación | ❌ | `S1-3.2-error-aprobar.png` | Al intentar aprobar: error 403. API responde: "El usuario no es aprobador configurado para este documento" (COM-022). El usuario pcastillo no tiene permisos de aprobador. Mismo problema de permisos que bug #006. |
| 3.3 | Rechazar OC — comentario obligatorio, estado Rechazada | ✅ | `S1-3.3-rechazar.png` | Modal con campo de nota. Al confirmar: toast "Orden rechazada correctamente". API success con flagEstado="0". El botón **Aprobar** da error 403 por falta de permisos (bug #010). |
| 3.4 | Retornar OC para correcciones | ✅ | `S1-3.4-retornar.png` | Botón "Retornar" funciona correctamente. Toast: "Orden retornada al emisor". API retorna success con flagEstado actualizado. El panel derecho muestra los datos de la OC en modo solo lectura con botones Rechazar, Retornar, Aprobar. Columnas del detalle: Código, Cantidad, Unidad, Centro de costos. Totales visibles con decimales correctos. |
| 3.5 | Aprobación multinivel (> S/20,000) — 2 aprobadores | 🚫 Bloqueado | — | No se puede probar: requiere permisos de aprobador (COM-022) y OC con monto > S/20,000. Bugs #006 y #010. |
| 3.6 | Notificaciones — acción, mensaje con N° OC y monto | 🚫 Bloqueado | — | No se puede probar: las notificaciones dependen de acciones (aprobar/rechazar) que están bloqueadas por permisos. |

---

## 1.4 Orden de Servicios (#4, #5)

> **URL:** Pendiente de mapear
> **Menú:** Compras > Operaciones > Generar OS / Aprobar OS
> ⚠️ **Al navegar, anotá la URL exacta**

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 4.1 | Crear OS — numeración automática, estado Pendiente | | | |
| 4.2 | Validaciones OS — proveedor, monto, fechas | | | |
| 5.1 | Aprobar OS + acta de conformidad — estado Conforme | | | |

---

## 1.5 Cuentas por Pagar — Registro CxP (#6)

> **URL:** `/compras/operaciones/registro-comprobantes`
> **Menú:** Compras > Operaciones > Registro de comprobantes
> **HU:** HU-FIN-OPE-001, HU-FIN-OP-CP-001

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 6.1 | Importar factura desde Almacén vinculada a OC | | | |
| 6.2 | Factura directa sin OC — servicios, campos solo lectura | | | |
| 6.3 | Validación duplicado — mismo proveedor + número | | | |
| 6.4 | Detracción en factura con OC — documento DE | | | |
| 6.5 | Aprobar factura — asiento contable automático | | | |
| 6.6 | Consulta CxP — filtros combinados, detalle, saldo | | | |
| 6.7 | Anular factura pendiente/validada — motivo obligatorio | | | |

---

## 1.6 Nota Débito / Crédito (#7)

> **URL:** Pendiente de mapear (menú: Compras > Operaciones > Notas crédito/débito)
> ⚠️ **Anotar URL al navegar**

| # | Caso | URL descubierta | Resultado | Evidencia | Observaciones |
|:-:|:-----|:---------------|:---------:|:---------|:--------------|
| 7.1 | Emitir NC vinculada a factura — saldo se reduce | | | | |
| 7.2 | Validación monto ≤ saldo pendiente | | | | |
| 7.3 | Validación moneda / TC entre ajuste y factura | | | | |
| 7.4 | Bloqueo ajuste sobre factura Cancelada | | | | |
| 7.5 | Adjuntar XML + control duplicidad | | | | |
| 7.6 | Anular ajuste — asiento reverso, saldo restaurado | | | | |

---

## 1.7 Documentos por Pagar Directo (#8)

> **URL:** Pendiente de mapear
> ⚠️ **Anotar URL al navegar**

| # | Caso | URL descubierta | Resultado | Evidencia | Observaciones |
|:-:|:-----|:---------------|:---------:|:---------|:--------------|
| 8.1 | DPD — alta, modificación, consulta | | | | |

---

## 1.8 Reportes de Compras (#9)

> **URL:** `/compras/reportes/gestion-compras`
> **Menú:** Compras > Reportes > Gestión de compras

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 9.1 | Ejecutar reporte gestión compras + exportación | | | |
| 9.2 | Reporte sin datos — mensaje + exportar deshabilitado | | | |

---

## 1.9 Reportes de Ventas (#10, #11)

> **URL:** Pendiente de mapear
> **Menú:** Ventas > Reportes (?)

| # | Caso | URL descubierta | Resultado | Evidencia | Observaciones |
|:-:|:-----|:---------------|:---------:|:---------|:--------------|
| 10.1 | Registro Ventas Formato SUNAT — columnas correctas | | | | |
| 11.1 | Reporte Tributario — IGV débito/crédito, retenciones | | | | |

---

## 1.10 Maestros Financieros Base (#15, #16, #17, #33)

> **URL:** Pendiente de mapear
> **Menú:** Finanzas (módulo) > buscar submenú de Tablas SUNAT, Bancos, Tipo de Cambio

| # | Caso | URL descubierta | Resultado | Evidencia | Observaciones |
|:-:|:-----|:---------------|:---------:|:---------|:--------------|
| 15.1 | CRUD Cuenta Bancaria — alta, editar, desactivar | | | | |
| 16.1 | CRUD Medios de Pago SUNAT | | | | |
| 17.1 | CRUD Formas de Pago SUNAT | | | | |
| 33.1 | CRUD Tipo de Cambio — verificar en OC moneda extranjera | | | | |
| 33.2 | TC fecha duplicada — mensaje + opción editar | | | | |

---

## 1.11 E2E Scripteados Sprint 1

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| E2E-01 | Compras completo: Proveedor → OC → Aprobación → Factura → Reporte | | | |
| E2E-02 | Ventas: Registro SUNAT + Tributario — IGV consistente | | | |
| E2E-03 | Finanzas Base: Cuenta + Medio/Forma Pago + TC en combos | | | |

---

## Resumen Sprint 1

| Ítem | Totales |
|:-----|--------:|
| ✅ Pasaron | 11 |
| ❌ Fallaron | 1 |
| ⚠️ Bloqueados | 2 |
| ➖ No aplica | 1 |
| **Total ejecutados** | **15** |
| **% Aprobación** | **73%** |

---

## Bugs / Issues Reportados

| ID Bug | Funcionalidad | Descripción | Severidad | Link |
|:-------|:-------------|:------------|:---------:|:----:|
| #001 | Importar proveedores | Botón "Descargar plantilla" cierra modal pero NO descarga archivo. Solo dispara evento a Facebook Pixel. | Alta | |
| #002 | Proveedores > Tab Bancaria | Input de búsqueda de cuentas bancarias no se limpia al cancelar edición o cambiar de proveedor seleccionado en el grid. | Media | |
| #003 | Validación responsive | Al redimensionar la ventana, los mensajes de validación se pierden de vista. | Media | |
| #004 | OC > Buscador proveedores | El input de búsqueda de proveedores no limpia su data incluso después de cerrar sesión. Los datos persisten entre sesiones. | Alta | |
| #005 | OC > Importar OC | Mismo bug que #001: botón "Descargar plantilla" en modal Importar OC envía datos a Facebook Pixel pero no descarga archivo. | Alta | |
| #006 | OC > Creación bloqueada | El usuario pcastillo no tiene permiso "comprador activo" (error COM-002). La OC no se crea en BD. El frontend muestra un falso positivo "Orden creada exitosamente" que se oculta rápidamente, seguido de "Error al guardar orden de compra" sin mostrar el motivo real. El formulario se limpia. Bloqueador total para el módulo de OC. | 🔴 Crítica | |
| #007 | OC > Error ambiguo | El mensaje de error "Error al guardar orden de compra" es genérico y no muestra al usuario la causa real (falta permiso comprador activo). Debería mostrar el mensaje exacto de la API: "El usuario actual no está registrado como comprador activo". | Alta | |
| #008 | Aprobación OC > Exportar | Los montos en PDF y Excel exportados desde Aprobación OC se muestran SIN decimales (ej: 101 en vez de 101.00). | Media | |
| #009 | Aprobación OC > Importar ubicaciones | Mismo bug que #001 y #005: modal "Importar ubicaciones" con botón "Descargar planilla" que no descarga nada, solo dispara evento a Facebook Pixel. | Alta | |
| #010 | OC > Aprobar sin permiso | El usuario pcastillo no es "aprobador configurado" (error COM-022). Al intentar aprobar: error 403 con mensaje "El usuario no es aprobador configurado para este documento". Misma raíz que #006 (faltan permisos de usuario). | 🔴 Crítica | |

---

## Checklist de Evidencias por Funcionalidad

- [ ] **Screenshot** del dashboard principal (`/inicio`) antes de comenzar
- [ ] **Screenshot** del listado principal de cada pantalla
- [ ] **Screenshot** del formulario de alta con datos completos
- [ ] **Screenshot** de validaciones (mensajes en rojo)
- [ ] **Screenshot** del toast/mensaje de éxito después de guardar
- [ ] **Screenshot** del listado mostrando el nuevo registro
- [ ] **PDF** generado (OC, boleta, reporte) — verificar contenido y datos
- [ ] **Excel** exportado — abrir y verificar columnas y datos
- [ ] **DevTools Console** — capturar si hay errores JS o peticiones fallidas (F12 > Console)
- [ ] **DevTools Network** — capturar respuesta de API si hay un error 500/400
- [ ] **routerLink** anotado — registrar la ruta real (URL del navegador) de cada pantalla
- [ ] **Video / GIF** (opcional) para flujos multi-paso o bugs intermitentes

---

## Route Discovery Log (completar durante las pruebas)

| # CSV | Pantalla | URL descubierta | ¿Coincide con CSV? |
|:-----:|:---------|:----------------|:------------------:|
| 4 | Orden de Servicios > Generación | | |
| 5 | Orden de Servicios > Aprobación | | |
| 7 | NC/ND x Pagar | | |
| 8 | DPD Individual | | |
| 10 | Registro Ventas SUNAT | | |
| 11 | Reporte Tributario | | |
| 15 | Cuenta Bancaria | | |
| 16 | Medios de Pago | | |
| 17 | Formas de Pago | | |
| 33 | Tipo de Cambio | | |
| 🆕 | Punto de Venta (efectivo) | | |
| 🆕 | Punto de Venta (tarjeta) | | |
| 🆕 | Punto de Venta (Yape/Plin) | | |
| 🆕 | Cartera de Pagos (pago total) | | |
| 🆕 | Cartera de Pagos (pago parcial) | | |
| 🆕 | Pago de Detracciones | | |
| 🆕 | Caja Chica > Apertura | | |
| 🆕 | Caja Chica > Rendición | | |
| 🆕 | Caja Chica > Reposición | | |
| 🆕 | Rendición de Gastos (empleados) | | |
| 🆕 | Anticipo a Proveedores | | |
| 🆕 | Transferencias entre Cuentas | | |
| 🆕 | Gift Cards > Venta | | |
| 🆕 | Gift Cards > Canje | | |
| 🆕 | Liquidación Agregadores (Rappi/PedidosYa) | | |

---

## Notas

```
⚠️ BLOQUEANTE: El usuario pcastillo tiene múltiples permisos faltantes:
- "comprador activo" (error COM-002) → no puede crear OC
- "aprobador configurado" (error COM-022) → no puede aprobar OC
Sin estos permisos, TODO el flujo de Compras E2E (OC → aprobación → 
factura CxP) queda bloqueado. Se requiere gestión de administrador para asignar 
los permisos.
```

---

## 🆕 Casos Adicionales — CSV Compras (31 nuevos priorizados)

> **Fuente:** `CASOS POR MODULO - COMPRAS.csv`
> **Nota:** Estos casos no estaban en la plantilla original. Se agregan como extensión del Sprint 1.

### Compras con Stock

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 1 | Factura F001-4589 + recepción + CxP (carnes S/1,180) | COMPRAS-REGISTRO DE FACTURA → ALMACEN → FINANZAS-CxP | ✅ SÍ |
| 3 | Factura F002-7781 + recepción + crédito 7 días (pollo S/2,360) | COMPRAS-REGISTRO DE FACTURA → ALMACEN | ⚠️ PARCIAL (caja chica) |
| 21 | OC-00045 por carnes S/5,900 (solo intención) | COMPRAS-GENERAR OC | ✅ SÍ |
| 22 | Recepción RM-00045 sin factura (stock con provisión) | ALMACÉN-ALMACENAMIENTO DE MERCADERÍA | ✅ SÍ |
| 23 | Factura F001-7845 contra recepción RM-00045 (triple match parcial) | COMPRAS-REGISTRO DE FACTURA → FINANZAS-CxP | ✅ SÍ |
| 24 | Triple match completo: OC + recepción + factura (3 cuotas) | COMPRAS → ALMACEN → FINANZAS-CxP | ⚠️ PARCIAL (pago parcial) |

### Compras sin Stock (Gastos)

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 13 | Servilletas y sorbetes S/141.60 (suministro directo a gasto) | COMPRAS-REGISTRO DE FACTURA → FINANZAS-CxP | ✅ SÍ |
| 30 | Flete S/354 (servicio de transporte) | COMPRAS-REGISTRO DE FACTURA → FINANZAS-CxP | ✅ SÍ |
| 31 | Limpieza de campana S/1,770 con detracción 12% | COMPRAS-REGISTRO DE FACTURA → FINANZAS-CxP | ✅ SÍ |

### Pagos

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 2 | Pago por transferencia de F001-4589 (S/1,180) | FINANZAS-CARTERA DE PAGOS | ✅ SÍ |
| 10 | Pago parcial de F003-1022 (S/400 de S/708) | FINANZAS-CARTERA DE PAGOS | ⚠️ PARCIAL |
| 32 | Pago con detracción: S/1,557.60 proveedor + S/212.40 BN | FINANZAS-CARTERA DE PAGOS + PAGO DE DETRACCIONES | ✅ SÍ |

### Caja Chica (NUEVO MÓDULO — sin implementar)

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 43 | Creación caja chica S/1,000 local San Isidro | CAJA CHICA | ❌ NO (pantalla no existe) |
| 44 | Rendición caja chica S/826 (limpieza, movilidad) | CAJA CHICA → RENDICION DE GASTOS | ⚠️ PARCIAL |
| 45 | Reposición caja chica S/826 | CAJA CHICA | ❌ NO (pantalla no existe) |

### Anticipos y Rendiciones

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 39 | Anticipo S/1,000 a Licores Selectos SAC | FINANZAS-CxP → CARTERA DE PAGOS | ⚠️ PARCIAL (anticipo sin doc) |
| 40 | Factura F001-1200 aplicando anticipo S/1,000 | COMPRAS → ALMACEN → FINANZAS-CxP | ✅ SÍ |
| 41 | Entrega S/500 a administrador (fondo por rendir) | FINANZAS-RENDICION DE GASTOS | ✅ SÍ |
| 42 | Rendición Juan Pérez S/531 con reembolso S/31 | FINANZAS-RENDICION → APROBACIÓN → CIERRE | ⚠️ PARCIAL |

### Activos Fijos

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 50 | Refrigeradora industrial S/5,000 al crédito | ACTIVOS-MAESTRO AF → FINANZAS-CxP | ✅ SÍ |
| 51 | Horno industrial S/23,600 con IGV (40% ahora, 60% futuro) | ACTIVOS-MAESTRO AF → FINANZAS-CxP → CARTERA DE PAGOS | ✅ SÍ |
| 52 | Depreciación mensual horno S/333.33 | ACTIVOS-TABLAS-OPERACIONES | ✅ SÍ |

### Notas de Crédito/Débito

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 46 | NC01-077 por S/118 (devolución carne en mal estado) | COMPRAS-REGISTRO DE NC/ND | ✅ SÍ |
| 47 | ND01-033 por S/118 (diferencia de precio) | COMPRAS-REGISTRO DE NC/ND | ✅ SÍ |

---

## 🆕 Casos Adicionales — CSV Ventas (8 nuevos priorizados)

> **Fuente:** `CASOS POR MODULO - VENTAS.csv`

| # CSV | Caso | Ruta | Soporte |
|:-----:|:-----|:-----|:-------:|
| 1 | Venta menú ejecutivo S/118 efectivo | PUNTO DE VENTA | ✅ SÍ |
| 4 | Venta hamburguesa S/59 con Yape | PUNTO DE VENTA | (pendiente validar) |
| 6 | Venta pizza S/118 con tarjeta Visa Izipay | PUNTO DE VENTA | (pendiente validar) |
| 21 | Venta gift card S/500 por transferencia | (pendiente mapear) | (pendiente validar) |
| 22 | Canje gift card S/354 | (pendiente mapear) | (pendiente validar) |
| 26 | Venta Rappi RP-45896 S/118 | (pendiente mapear) | (pendiente validar) |
| 27 | Liquidación Rappi: comisión S/20 + IGV S/3.60 | (pendiente mapear) | (pendiente validar) |
| 31 | Factura con detracción del cliente 12% | (pendiente mapear) | ❌ NO |

---

## 🆕 Gaps Funcionales Detectados (CSVs)

| # | Gap | Severidad | Bloquea casos |
|---|-----|:---------:|:-------------:|
| G1 | Pantalla de Caja Chica no existe | 🔴 Crítica | #43, #44, #45 |
| G2 | Pago parcial de factura no soportado | 🟡 Alta | #10, #24, #29, #48 |
| G3 | Pago mixto (efectivo + transferencia) | 🟡 Alta | #38 |
| G4 | Pago con tarjeta de crédito corporativa | 🟡 Alta | #34, #35 |
| G5 | Anticipo sin documento asociado | 🟡 Alta | #39 |
| G6 | Registro de flete en factura | 🟡 Alta | #29 |
| G7 | Rendición con reembolso de exceso | 🟡 Alta | #42 |
| G8 | Factura con detracción del cliente | 🟡 Alta | VENTAS #31 |
| G9 | Venta mixta cobro/crédito | 🟡 Alta | VENTAS #16 |
| G10 | Importación con DAM/DUA | 🟡 Alta | #56, #57 |
