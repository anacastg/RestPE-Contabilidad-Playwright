# COMPONENTES IMPLEMENTADOS — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026  
> **Fase:** 7 — Biblioteca de Componentes Reutilizables

---

## Resumen

| # | Componente | Extiende | Métodos públicos | Tipo |
|:-:|:-----------|:---------|:----------------:|:-----|
| 1 | `AgGridComponent` | `BaseComponent` | 23 | Grid |
| 2 | `IonSelectComponent` | `BaseComponent` | 10 | Formulario |
| 3 | `TabsComponent` | `BaseComponent` | 7 | Navegación |
| 4 | `ModalComponent` | `BaseComponent` | 10 | Overlay |
| 5 | `ToastComponent` | `BaseComponent` | 7 | Notificación |
| 6 | `DatePickerComponent` | `BaseComponent` | 6 | Formulario |
| 7 | `UploadComponent` | `BaseComponent` | 5 | Archivo |
| 8 | `SidebarComponent` | `BaseComponent` | 7 | Navegación |
| 9 | `HeaderComponent` | `BaseComponent` | 5 | Layout |
| 10 | `BreadcrumbComponent` | `BaseComponent` | 4 | Navegación |
| **Total** | | | **84** | |

---

## 1. AgGridComponent

**Archivo:** `components/AgGridComponent.ts`  
**Propósito:** Abstracción completa de AG Grid — buscar, filtrar, paginar, ordenar, seleccionar y exportar.  
**Dependencias:** `BaseComponent`, `Logger`, `retry`, `SHARED_SELECTORS`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `waitForRows(min)` | Espera N+ filas visibles con retry |
| `waitForEmpty()` | Espera grid vacío |
| `getRowCount()` | Número de filas visibles |
| `getColumnNames()` | Nombres de columnas |
| `getCellValue(row, col)` | Valor de celda por índice + nombre |
| `rowExists(text)` | ¿Existe fila con este texto? |
| `getRowText(row)` | Contenido completo de fila |
| `getColumns()` | Columnas con índice, nombre, sortable |
| `search(text)` | Búsqueda vía ion-searchbar |
| `clearSearch()` | Limpia búsqueda |
| `filterColumn(name, val)` | Filtro por columna (floating filter) |
| `sortBy(name)` | Click en header para ordenar |
| `clickRow(i)` | Click en fila (abre split-view) |
| `doubleClickRow(i)` | Doble click |
| `clickRowAction(i, text)` | Acción en columna Acciones |
| `selectRow(i)` | Checkbox de selección |
| `selectAll()` | Seleccionar todo |
| `getTotalPages()` | Páginas del paginador |
| `nextPage()` / `previousPage()` / `goToPage(n)` | Navegación de páginas |
| `exportToExcel()` / `exportToPDF()` | Exportación |
| `assertEmptyState(msg)` | Validar estado vacío |
| `assertHasRows()` | Validar que tiene datos |

---

## 2. IonSelectComponent

**Archivo:** `components/IonSelectComponent.ts`  
**Propósito:** Abstracción de ion-select — apertura, selección por texto/índice, lectura de opciones.  
**Dependencias:** `BaseComponent`, `Logger`, `dismissAllOverlays`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `open()` | Abre el popover/alert del select |
| `selectByText(text)` | Selecciona por texto visible |
| `selectByIndex(i)` | Selecciona por índice |
| `getOptions()` | Todas las opciones como string[] |
| `getSelectedText()` | Texto de la opción seleccionada |
| `waitForValue(expected)` | Espera hasta que tenga un valor |
| `close()` | Cierra sin seleccionar |
| `isDisabled()` | ¿Está deshabilitado? |
| `searchInOptions(text)` | Búsqueda dentro del popover |

---

## 3. TabsComponent

**Archivo:** `components/TabsComponent.ts`  
**Propósito:** Navegación entre tabs de ion-segment-button.  
**Dependencias:** `BaseComponent`, `Logger`, `dismissOverlay`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `getTabNames()` | Nombres de todos los tabs |
| `switchTo(name)` | Cambia a tab por nombre |
| `getActiveTab()` | Nombre del tab activo |
| `assertActive(name)` | Verifica tab activo |
| `getCount()` | Número de tabs |
| `withTab(name, fn)` | Ejecuta callback en un tab y vuelve |

---

## 4. ModalComponent

**Archivo:** `components/ModalComponent.ts`  
**Propósito:** Interacción con modales ion-modal.  
**Dependencias:** `BaseComponent`, `Logger`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `open(triggerText)` | Abre modal vía botón trigger |
| `close()` | Cierra con Escape |
| `cancel()` | Click en Cancelar |
| `confirm()` | Click en Guardar/Aceptar |
| `getTitle()` | Título del modal |
| `assertVisible()` | Verifica visible |
| `assertClosed()` | Verifica cerrado |
| `waitForClose()` | Espera cierre |
| `fillField(fcn, val)` | Llena campo dentro del modal |

---

## 5. ToastComponent

**Archivo:** `components/ToastComponent.ts`  
**Propósito:** Detección y validación de notificaciones toast.  
**Dependencias:** `BaseComponent`, `Logger`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `waitForMessage(pattern)` | Espera toast con texto/RegExp |
| `getMessage()` | Mensaje actual |
| `assertSuccess(pattern)` | Verifica toast de éxito |
| `assertError(pattern)` | Verifica toast de error |
| `waitForDisappear()` | Espera que desaparezca |
| `assertNotVisible()` | Verifica que no hay toast |

---

## 6. DatePickerComponent

**Archivo:** `components/DatePickerComponent.ts`  
**Propósito:** Selección de fecha en ion-input type="date".  
**Dependencias:** `BaseComponent`, `Logger`, `date-utils`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `setDate(date)` | Fecha como string o Date |
| `setToday()` | Fecha de hoy |
| `getDate()` | Fecha actual YYYY-MM-DD |
| `clear()` | Limpia el campo |
| `validateFormat()` | Verifica formato YYYY-MM-DD |
| `isDisabled()` | ¿Está deshabilitado? |

---

## 7. UploadComponent

**Archivo:** `components/UploadComponent.ts`  
**Propósito:** Carga de archivos vía input[type="file"].  
**Dependencias:** `BaseComponent`, `Logger`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `uploadFile(selector, path)` | Carga un archivo |
| `uploadFiles(selector, paths)` | Carga múltiples archivos |
| `getFileName(label)` | Nombre del archivo cargado |
| `removeFile()` | Elimina archivo cargado |
| `assertFileUploaded(label, name)` | Verifica carga exitosa |

---

## 8. SidebarComponent

**Archivo:** `components/SidebarComponent.ts`  
**Propósito:** Navegación por el sidebar (hover menú → submenú → clic).  
**Dependencias:** `BaseComponent`, `Logger`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `navigateTo(modulo, opcion)` | Navega por menú: hover → clic |
| `navigateByRoute(route)` | Navega directo por URL |
| `getModuleNames()` | Módulos del sidebar |
| `assertModuleVisible(mod)` | Verifica módulo visible |
| `expandModule(mod)` | Hover para desplegar submenú |
| `collapseAll()` | Cierra submenús |

---

## 9. HeaderComponent

**Archivo:** `components/HeaderComponent.ts`  
**Propósito:** Interacción con el header (app-header).  
**Dependencias:** `BaseComponent`, `Logger`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `getCurrentUser()` | Usuario actual |
| `changeCountry(pais)` | Cambia país en selector |
| `getCurrentCountry()` | País seleccionado |
| `logout()` | Cerrar sesión |
| `assertVisible()` | Verifica header visible |

---

## 10. BreadcrumbComponent

**Archivo:** `components/BreadcrumbComponent.ts`  
**Propósito:** Lectura y navegación del breadcrumb.  
**Dependencias:** `BaseComponent`

### Métodos

| Método | Descripción |
|:-------|:------------|
| `getPath()` | Ruta como string[] |
| `navigateTo(label)` | Click en nivel del breadcrumb |
| `assertContains(text)` | Verifica que contenga texto |
| `assertCurrentPage(expected)` | Verifica página actual |

---

## Verificación

| Verificación | Resultado |
|:-------------|:--------:|
| `tsc --noEmit` | ✅ 0 errores |
| Todos extienden `BaseComponent` | ✅ 10/10 |
| Sin lógica de negocio | ✅ |
| Sin dependencias circulares | ✅ |
| JSDoc en todos los métodos públicos | ✅ |
| Tipado estricto TypeScript | ✅ |
| Selectores estables (formControlName, texto) | ✅ |
