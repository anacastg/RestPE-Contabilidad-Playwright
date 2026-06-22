# Plantilla de Ejecución Manual — Sprint 1

> **Responsable:** 
> **Fecha de prueba:** 
> **Ambiente:** `https://panel.dev.contabilidad.restaurant.pe/`
> **Usuario:** pcastillo
> **Empresa:** PESQUERA CANTABRIA S.A.
> **Sucursal:** LIMA
> **Navegador/App:** `[Chrome / Edge / App móvil]`

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
| 2 | Compras > Generar OC | Generar Orden de Compra | `/compras/operaciones/generar-oc` | ✅ |
| 3 | Compras > Aprobar OC | Aprobar Orden de Compra | `/compras/operaciones/aprobar-oc` | ✅ |
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
| **Layout** | Split-view: AG Grid (izquierda) + Formulario (derecha) |
| **Tabs del formulario** | General | Bancaria | Comercial |
| **Campos (formcontrolname)** | `razonSocial`, `nombreComercial`, `tipoIdentificacion`, `identfiscal`, `direccionFiscal`, `email`, `telefono`, `estado`, `proveedor` (Nac/Ext), `nombre` (contacto), `cargo`, `condicionPago` |
| **Estructura HTML** | Los campos usan `<ion-input formcontrolname="X">` con un `<input>` interno en Light DOM (NO Shadow DOM) |
| **Columnas AG Grid** | Código | Razón social | Documento fiscal | Cargo | Estado |
| **Filas AG Grid** | `<div class="ag-row ag-row-even/odd" role="row">` dentro de `.ag-center-cols-container` |
| **Botón "Nuevo proveedor"** | Se habilita cuando NO hay cambios sin guardar. Si hay datos sucios → modal "descartar cambios" |
| **Botón "Registrar"** | Cambia a "Guardar" cuando se edita un proveedor existente |
| **Overlay** | Hay un `<div class="filtros-absolutos">` que puede interceptar clicks → usar DevTools para identificar elementos bloqueados

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
| 1.1 | Visualizar listado — columnas AG Grid, búsqueda, paginación | | | |
| 1.2 | Validar campos obligatorios en alta | | | |
| 1.3 | Alta exitosa de proveedor | | | |
| 1.4 | Edición de proveedor existente (seleccionar fila → modificar campos → Guardar) | | | |
| 1.5 | Baja lógica + verificar estado Inactivo | | | |
| 1.6 | Búsqueda por RUC y razón social | | | |
| 1.7 | RUC duplicado — mensaje de error | | | |
| 1.8 | Empty state sin proveedores | | | |

---

## 1.2 Orden de Compra (#2)

> **URL:** `/compras/operaciones/generar-oc`
> **Menú:** Compras > Operaciones > Generar OC
> **Operaciones:** Crear OC, grabar líneas, numeración, consulta, PDF, carga masiva

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 2.1 | Pantalla nueva OC — estructura, numeración OC-YYYY-CORRELATIVO | | | |
| 2.2 | Crear OC con líneas — cálculo automático, estado Pendiente | | | |
| 2.3 | Validaciones: artículo vacío, cantidad ≤ 0, precio < 0.0001, decimales, fecha | | | |
| 2.4 | Generar PDF — contenido completo | | | |
| 2.5 | Consulta con filtros combinados + exportación | | | |
| 2.6 | Carga masiva desde Excel — resumen válidos/errores | | | |
| 2.7 | Bloqueo edición en OC Aprobada | | | |
| 2.8 | Error loading — mensaje "Intente nuevamente" + botón Reintentar | | | |

---

## 1.3 Aprobación de OC (#3)

> **URL:** `/compras/operaciones/aprobar-oc`
> **Menú:** Compras > Operaciones > Aprobar OC
> **Operaciones:** Aprobar/rechazar/retornar, multinivel

| # | Caso | Resultado | Evidencia (ruta) | Observaciones |
|:-:|:-----|:---------:|:-----------------|:--------------|
| 3.1 | Listado OC pendientes — columnas, botones por fila | | | |
| 3.2 | Aprobar OC — modal confirmación, cambio estado, notificación | | | |
| 3.3 | Rechazar OC — comentario obligatorio, estado Rechazada | | | |
| 3.4 | Retornar OC — comentario obligatorio, estado Retornada | | | |
| 3.5 | Aprobación multinivel (> S/20,000) — 2 aprobadores | | | |
| 3.6 | Notificaciones — acción, mensaje con N° OC y monto | | | |

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
| ✅ Pasaron | |
| ❌ Fallaron | |
| ⚠️ Bloqueados | |
| ➖ No aplica | |
| **Total ejecutados** | |
| **% Aprobación** | |

---

## Bugs / Issues Reportados

| ID Bug | Funcionalidad | Descripción | Severidad | Link |
|:-------|:-------------|:------------|:---------:|:----:|
| | | | `Alta / Media / Baja` | |
| | | | | |

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

---

## Notas

```
[Espacio para notas adicionales del tester]
```
