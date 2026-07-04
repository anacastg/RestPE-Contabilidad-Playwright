# COMPONENTES REUTILIZABLES — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026  
> **Fuente:** Fase 4 — Deep Technical Scout

---

## 1. AG GRID WRAPPER

**Aplica en:** 23+ pantallas (Proveedores, OC, Aprobación, Registro Comprobantes, Cartera Pagos, Cartera Cobros, Datos Personales, Cálculo Planilla, Maestro AF, Operaciones AF...)

**Cada instancia se configura con el `containerSelector` de su pantalla.**

```javascript
class AgGridWrapper {
  constructor(page, options = {}) {
    this.page = page;
    this.container = options.container || '.ag-theme-alpine';
    this.searchInput = options.searchInput || 'input[placeholder*="Buscar"]';
  }

  // ── Esperas ──
  async waitForLoad(minRows = 0, timeout = 10000) { ... }
  async waitForEmpty(timeout = 5000) { ... }

  // ── Navegación ──
  async buscar(texto) { ... }                    // ion-searchbar sobre el grid
  async filtrarColumna(nombreColumna, valor) { ... }
  async ordenarPor(nombreColumna) { ... }
  async irAPagina(numero) { ... }

  // ── Lectura ──
  async getRowCount() { ... }
  async getColumnNames() { ... }
  async getCellValue(rowIndex, columnName) { ... }
  async rowExists(textoParcial) { ... }
  async getCellByRowAndColumn(rowIndex, colIndex) { ... }

  // ── Interacción ──
  async clickRow(rowIndex) { ... }              // Selecciona fila
  async clickRowAction(rowIndex, actionText) { ... }  // Botón en columna Acciones
  async selectRow(rowIndex) { ... }             // Checkbox de selección
  async selectAll() { ... }

  // ── Exportación ──
  async exportToExcel() { ... }
  async exportToPDF() { ... }

  // ── Paginación ──
  async getTotalPages() { ... }
  async nextPage() { ... }
  async previousPage() { ... }
}
```

**Selectores internos:**
- Filas: `.ag-row:visible`
- Columnas: `.ag-header-cell-text`
- Celda: `.ag-row[row-index="${i}"] [col-id="${colId}"]`
- Paginación: `.ag-paging-panel`
- Checkbox selección: `.ag-checkbox input`

---

## 2. TAB NAVIGATOR

**Aplica en:** Proveedores (3 tabs), MaestroAF (8 tabs), Registro Comprobantes (4 tabs), Cartera Pagos (2 tabs), Datos Personales (3 tabs), Plan Contable (4 tabs)

```javascript
class TabNavigator {
  constructor(page) { this.page = page; }

  async switchTo(tabName) { ... }
  async getActiveTab() { ... }
  async getTabNames() { ... }

  // Específico para tabs que navegan entre secciones del formulario
  async withTab(tabName, callback) {
    await this.switchTo(tabName);
    await callback();
  }
}
```

**Selector base:** `ion-segment-button:has-text("{tabName}")` — requiere `force: true` porque los tabs suelen estar detrás de overlays del grid.

---

## 3. MODAL DIALOG

**Aplica en:** "Nuevo producto" (GenerarOC), "Agregar cuenta" (Proveedores > Bancaria), modales de confirmación (Aprobar/Rechazar OC), "Importar" (cualquier pantalla)

```javascript
class ModalDialog {
  constructor(page) { this.page = page; }

  async open(triggerButtonText) { ... }
  async close() { ... }                       // Escape
  async cancel() { ... }                      // Botón "Cancelar"
  async confirm() { ... }                     // Botón "Guardar"/"Aceptar"
  async getTitle() { ... }
  async isVisible() { ... }
  async fillField(formControlName, value) { ... }
  async getFieldValue(formControlName) { ... }
}
```

**Selector:** `ion-modal:visible, [role="dialog"]:visible`

---

## 4. SELECT PICKER (extiende IonSelect)

**Aplica en:** Selector de país (header), Moneda, Estado, Tipo Proveedor, Tipo Planilla, Tipo Cese, Periodicidad Pago

```javascript
class SelectPicker {
  constructor(page, formControlName) {
    this.page = page;
    this.fcName = formControlName;
    this.locator = page.locator(`ion-select[formcontrolname="${formControlName}"]`);
  }

  async open() { await this.locator.click(); }
  async selectOption(text) {
    await this.open();
    // Buscar en ion-alert o ion-popover
    const option = this.page.locator(`ion-alert button:has-text("${text}"), .alert-radio-label:has-text("${text}")`);
    await option.click();
    await snooze(300);
  }
  async getSelected() { ... }
  async getOptions() { ... }          // Abre y captura todas las opciones
  async selectByIndex(index) { ... }
}
```

---

## 5. COUNTRY SELECTOR

**Aplica en:** Header de todas las pantallas

```javascript
class CountrySelector extends SelectPicker {
  constructor(page) {
    super(page, null);  // El selector de país no tiene formControlName fijo
    this.locator = page.locator('app-header ion-select').first();
    // o: page.locator('ion-select[placeholder="País"]')
  }

  async select(pais) {  // 'PE', 'CO', 'EC', 'GT'
    await this.selectOption(
      pais === 'PE' ? 'Perú' :
      pais === 'CO' ? 'Colombia' :
      pais === 'EC' ? 'Ecuador' : 'Guatemala'
    );
  }
}
```

---

## 6. DATE PICKER

**Aplica en:** Fecha emisión, Fecha entrega (OC), Fecha inicio depreciación (MaestroAF), Fechas de proceso (Planilla)

```javascript
class DatePicker {
  constructor(page, formControlName) {
    this.page = page;
    this.input = page.locator(`ion-input[formcontrolname="${formControlName}"] input`);
  }

  async setDate(date) {  // '2026-07-15' o Date object
    const value = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    await this.input.fill(value);
    await this.input.press('Tab');
  }

  async getDate() { ... }
}
```

---

## 7. APP AUTOCOMPLETE

**Aplica en:** Buscador de proveedor (OC, Registro Comprobantes), Buscador de producto (GenerarOC)

```javascript
class AppAutocomplete {
  constructor(page, placeholder) {
    this.page = page;
    this.input = page.locator(`input[placeholder*="${placeholder}"]`);
  }

  async search(text) { ... }
  async selectFirstResult() { ... }
  async selectResult(text) { ... }
  async clear() { ... }
}
```

---

## 8. TOAST NOTIFIER

**Aplica en:** Todas las pantallas (global)

```javascript
class ToastNotifier {
  constructor(page) { this.page = page; }

  async waitForMessage(pattern, timeout = 6000) { ... }  // string o RegExp
  async assertSuccess(pattern) { ... }
  async assertError(pattern) { ... }
  async assertWarning(pattern) { ... }
  async dismiss() { ... }
  async getMessage() { ... }
}
```

**Selector:** `ion-toast .toast-message, ion-toast .toast-content`

---

## 9. SPLIT VIEW LAYOUT

**Aplica en:** Proveedores, OC, Aprobación OC, Cartera Pagos (grid izquierda + formulario derecha)

```javascript
class SplitViewLayout {
  constructor(page) {
    this.page = page;
    this.gridPanel = page.locator('.ag-theme-alpine').first();
    this.formPanel = page.locator('form, [class*="formulario"], [class*="detalle"]').first();
  }

  async expandForm() { ... }         // Click en flecha para expandir formulario
  async collapseForm() { ... }
  async isFormVisible() { ... }
  async getSelectedRowData() { ... } // Datos de la fila seleccionada en el grid
}
```

---

## 10. GRAFO DE DEPENDENCIAS

```
Page Object
  ├── AgGridWrapper         (23 pantallas)
  ├── TabNavigator          (5 pantallas con tabs)
  ├── ModalDialog           (4 pantallas con modales)
  ├── SplitViewLayout       (4 pantallas split-view)
  │
  ├── SelectPicker          (todas las pantallas con ion-select)
  │   └── CountrySelector   (header global)
  ├── DatePicker            (OC, MaestroAF, Planilla)
  ├── AppAutocomplete       (OC, Registro Comprobantes)
  ├── ToastNotifier         (todas las pantallas)
  │
  └── drivers/
      ├── IonInput
      ├── IonSelect
      ├── IonButton
      ├── IonCheckbox
      ├── IonTextarea
      ├── IonToast
      └── IonSegment
```
