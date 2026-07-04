# GUÍA DE USO DE COMPONENTES — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026

---

## Principios

1. **Cada componente se instancia en el constructor del Page Object.**
2. **Nunca se usa `page.locator()` directamente en un Page Object.** La interacción con la UI pasa siempre por un componente o helper.
3. **Los componentes son stateless.** No guardan estado entre operaciones. Cada método es independiente.

---

## Ejemplos por componente

### AgGridComponent

```typescript
import { AgGridComponent } from '@components/AgGridComponent';

class ProveedoresPage extends BasePage {
  readonly grid = new AgGridComponent(this.page);

  async buscarProveedor(ruc: string): Promise<boolean> {
    await this.grid.search(ruc);
    await this.grid.waitForRows(1);
    return this.grid.rowExists(ruc);
  }

  async verificarColumnas(expected: string[]): Promise<void> {
    const cols = await this.grid.getColumnNames();
    for (const c of expected) {
      if (!cols.includes(c)) throw new Error(`Columna "${c}" no encontrada`);
    }
  }

  async exportarExcel(): Promise<void> {
    await this.grid.exportToExcel();
  }
}
```

### IonSelectComponent

```typescript
const estado = new IonSelectComponent(this.page, 'estado');
await estado.selectByText('Activo');

const moneda = new IonSelectComponent(this.page, 'moneda');
const opciones = await moneda.getOptions();
// ['Soles', 'Dolares Americanos', 'Peso Colombiano', 'Quetzal Guatemalteco']
```

### TabsComponent

```typescript
const tabs = new TabsComponent(this.page);
await tabs.switchTo('Bancaria');
// ... interactuar con campos del tab Bancaria ...
await tabs.switchTo('General');
```

### ModalComponent

```typescript
const modal = new ModalComponent(this.page);
await modal.open('Nuevo producto');
await modal.fillField('codigo', 'PROD-001');
await modal.fillField('descripcion', 'Producto de prueba');
await modal.confirm();
await modal.waitForClose();
```

### ToastComponent

```typescript
const toast = new ToastComponent(this.page);
await toast.assertSuccess(/creado exitosamente|Relación comercial creada/);
await toast.waitForDisappear();
```

### DatePickerComponent

```typescript
const fecha = new DatePickerComponent(this.page, 'fechaEntrega');
await fecha.setDate('2026-07-15');
// o
await fecha.setToday();
```

### UploadComponent

```typescript
const upload = new UploadComponent(this.page);
await upload.uploadFile('input[type="file"]', './fixtures/factura.xml');
await upload.assertFileUploaded('.file-name', 'factura.xml');
```

### SidebarComponent

```typescript
const sidebar = new SidebarComponent(this.page);
await sidebar.navigateTo('Compras', 'Proveedores');
```

### HeaderComponent

```typescript
const header = new HeaderComponent(this.page);
await header.changeCountry('Colombia');
```

### BreadcrumbComponent

```typescript
const bc = new BreadcrumbComponent(this.page);
await bc.assertCurrentPage('Gestión de Proveedores');
```

---

## Patrón típico de Page Object

```typescript
import { BasePage } from '@pages/BasePage';
import { AgGridComponent } from '@components/AgGridComponent';
import { TabsComponent } from '@components/TabsComponent';
import { ToastComponent } from '@components/ToastComponent';
import { IonSelectComponent } from '@components/IonSelectComponent';
import { RUTAS } from '@constants/index';
import { fillField } from '@utils/form-helper';

export class ProveedoresPage extends BasePage {
  // Componentes
  readonly grid = new AgGridComponent(this.page);
  readonly tabs = new TabsComponent(this.page);
  readonly toast = new ToastComponent(this.page);

  // Selects
  private readonly estadoSelect = new IonSelectComponent(this.page, 'estado');
  private readonly proveedorSelect = new IonSelectComponent(this.page, 'proveedor');

  protected get ruta(): string { return RUTAS.PROVEEDORES; }
  protected get nombre(): string { return 'Gestión de Proveedores'; }

  protected async esperarCarga(): Promise<void> {
    await this.grid.waitForRows(0);
  }

  async llenarFormulario(datos: ProviderData): Promise<void> {
    await fillField(this.page, 'razonSocial', datos.razonSocial);
    await fillField(this.page, 'identfiscal', datos.identfiscal);
    await fillField(this.page, 'direccionFiscal', datos.direccionFiscal);
    if (datos.email) await fillField(this.page, 'email', datos.email);
    if (datos.telefono) await fillField(this.page, 'telefono', datos.telefono);
  }

  async guardar(): Promise<void> {
    const { clickButton } = require('@utils/form-helper');
    await clickButton(this.page, 'Registrar');
    await this.toast.assertSuccess(/cread/);
  }
}
```

---

## Helpers disponibles (sin instanciar)

Los helpers en `utils/form-helper.ts` son funciones puras que no requieren instanciación:

```typescript
import { fillField, selectOption, clickButton, clearField, getFieldValue } from '@utils/form-helper';
import { snooze, dismissOverlay, dismissAllOverlays } from '@utils/helpers';
import { today, daysFromNow } from '@utils/date-utils';
import { Logger } from '@utils/logger';
```
