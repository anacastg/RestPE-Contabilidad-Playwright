# ARQUITECTURA DEL FRAMEWORK DE AUTOMATIZACIÓN — RestPE Contabilidad

> **Versión:** 1.0 · **Fecha:** 04/07/2026  
> **Arquitecto:** QA Automation Lead  
> **Stack:** Playwright 1.61 · Node.js 22 · JavaScript (migrable a TypeScript)

---

## 1. VISIÓN ARQUITECTÓNICA

### 1.1 Principios rectores

| Principio | Aplicación |
|:----------|:-----------|
| **Page Objects desacoplados de la UI** | Cada Page Object expone acciones de negocio, no selectores CSS |
| **Componentes sobre herencia** | Las abstracciones (AG Grid, Tabs, Modales) son composables, no heredables |
| **Fixture-first** | Toda prueba recibe contexto pre-configurado: autenticación, empresa, sucursal, país |
| **Datos externos** | Datos de prueba en JSON/CSV, nunca hardcodeados en tests |
| **Fail-fast en setup** | Si la autenticación falla, ninguna prueba se ejecuta |
| **Selectores por estabilidad** | formControlName > placeholder > texto visible. Nunca XPath absoluto. |
| **Zero `waitForTimeout`** | Esperas explícitas solo vía `waitForResponse`, `waitForSelector`, `waitForURL` |

### 1.2 Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│  TESTS (spec files)                                     │
│  Describe escenarios de negocio en Gherkin-like steps   │
├─────────────────────────────────────────────────────────┤
│  PAGE OBJECTS                                           │
│  Métodos de negocio: crearProveedor(), aprobarOC()      │
│  Orquestan componentes, no manipulan DOM directamente   │
├─────────────────────────────────────────────────────────┤
│  COMPONENTS (reusables)                                 │
│  AgGrid, Tabs, Modal, SelectPicker, DatePicker, Toast   │
│  Encapsulan interacción con widgets Angular/Ionic       │
├─────────────────────────────────────────────────────────┤
│  DRIVERS (low-level)                                     │
│  IonInput, IonSelect, IonButton, IonCheckbox             │
│  Wrappers sobre locators Playwright con retry y logs    │
├─────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                         │
│  API client, Auth session, Data factories, Fixtures,    │
│  Config, Logger, Reporter, Evidence collector           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. CAPAS EN DETALLE

### 2.1 Capa de Infraestructura

| Módulo | Responsabilidad | Implementación |
|:-------|:----------------|:---------------|
| **AuthSession** | Login → Empresa → Sucursal. Almacena tokens/sesión en `storageState`. | Fixture global `setup` que persiste `auth.json` |
| **ApiClient** | Wrapper sobre `page.request` para llamadas REST. Maneja autenticación, retries, logging. | Clase con métodos `get`, `post`, `put`. Usa `APIRequestContext`. |
| **DataFactory** | Genera datos de prueba determinísticos con prefijos que los identifican (`TEST-AUTO-{timestamp}`). | Funciones puras: `generateProvider()`, `generateOC()`, `generateEmployee()`. |
| **Config** | Ambiente, URLs, credenciales, timeouts, feature flags. | `config.ts` que lee de `playwright.config.js` + `.env`. |
| **Logger** | Log estructurado de cada acción con timestamp, pantalla, resultado. | Wrapper sobre `console` con niveles. Escribe a archivo en CI. |
| **Reporter** | Extiende el reporter HTML de Playwright con metadata de negocio. | Custom reporter que inyecta: módulo, HU, tag @sprint. |
| **Evidence** | Screenshots, videos, traces, DOM dumps. | Config en `playwright.config.ts` + helper `attachEvidence()`. |

### 2.2 Capa de Drivers

Cada driver encapsula un tipo de widget Angular/Ionic:

| Driver | Selector base | Métodos |
|:-------|:--------------|:--------|
| **IonInput** | `ion-input[formcontrolname="{name}"] input` | `fill(value)`, `clear()`, `getValue()`, `isDisabled()`, `assertError(msg)` |
| **IonSelect** | `ion-select[formcontrolname="{name}"]` | `open()`, `selectOption(text)`, `getSelected()`, `getOptions()` |
| **IonButton** | `button:has-text("{text}"), ion-button:has-text("{text}")` | `click()`, `isDisabled()`, `waitEnabled()` |
| **IonCheckbox** | `ion-checkbox[formcontrolname="{name}"]` | `check()`, `uncheck()`, `isChecked()` |
| **IonTextarea** | `ion-textarea[formcontrolname="{name}"] textarea` | `fill(value)`, `getValue()` |
| **IonToast** | `ion-toast` | `waitForMessage(text)`, `getMessage()`, `dismiss()` |
| **IonSegment** (Tabs) | `ion-segment-button` | `switchTo(name)`, `getActive()` |

### 2.3 Capa de Componentes Reutilizables

| Componente | Abstracción | Pantallas donde aplica |
|:-----------|:------------|:-----------------------|
| **AgGrid** | `AgGridWrapper` | 23+ pantallas con AG Grid |
| **Tabs** | `TabNavigator` | Proveedores(3), MaestroAF(8), RegistroComprobantes(4), CarteraPagos(2), DatosPersonales(3) |
| **Modal** | `ModalDialog` | "Nuevo producto", "Agregar cuenta", modales de confirmación |
| **SelectPicker** | `SelectPicker` (extiende IonSelect) | País, Moneda, Estado, Proveedor |
| **DatePicker** | `DatePicker` (app-base-calendar-new) | Fecha emisión, Fecha entrega, Fecha inicio depreciación |
| **AppAutocomplete** | `AutocompleteSearch` | Buscador de proveedor, buscador de producto |
| **SplitView** | `SplitViewLayout` | Patrón grid-izquierda + formulario-derecha |
| **ToastNotification** | `ToastNotifier` | Mensajes de éxito/error globales |
| **CountrySelector** | `CountrySelector` (extiende SelectPicker) | Selector de país en header |
| **EntitySelector** | `EntitySelector` | Selección de empresa y sucursal (Login flow) |

### 2.4 Capa de Page Objects

**Regla:** Un Page Object por pantalla. Si una pantalla tiene tabs con formularios independientes, cada tab es un sub-componente.

**Convención de nombres:**
- Archivo: `{Modulo}{Pantalla}Page.js`
- Clase: `{Modulo}{Pantalla}Page`
- Métodos: verbos de negocio en español: `crearProveedor(datos)`, `buscarPorRUC(ruc)`, `aprobarOC(comentario)`

**Responsabilidad exclusiva del Page Object:**
- Exponer métodos de negocio
- Orquestar componentes (AgGrid, Tabs, Modales)
- NO exponer selectores CSS
- NO hacer `page.locator()` directamente (usar drivers)

### 2.5 Capa de Tests

```javascript
// Ejemplo de estructura esperada
test.describe('Sprint 1 — Compras — Proveedores', () => {
  test('@critical @sprint1 CP-S1-003 Alta exitosa de proveedor nacional', async ({ authenticatedPage }) => {
    const proveedores = new ProveedoresPage(authenticatedPage);
    const datos = DataFactory.generateProvider({ pais: 'PE', tipo: 'Nacional' });
    await proveedores.navegar();
    await proveedores.tabs.switchTo('General');
    await proveedores.llenarFormulario(datos);
    await proveedores.guardar();
    await proveedores.toast.assertSuccess(/Relación comercial creada/);
    await proveedores.grid.buscar(datos.ruc);
    expect(await proveedores.grid.getRowCount()).toBeGreaterThan(0);
  });
});
```

---

## 3. FLUJO DE DATOS

```
Fixture (auth.setup.ts)
  │ storageState ─────────────────────────────────────────────┐
  ▼                                                           │
test.describe                                                   │
  │ test.beforeEach → page + fixtures + API context            │
  ▼                                                           │
Page Object                                                    │
  │ this.page (Playwright Page)                                │
  │ this.grid = new AgGridWrapper(this.page)                   │
  │ this.tabs = new TabNavigator(this.page)                    │
  │ this.toast = new ToastNotifier(this.page)                  │
  ▼                                                           │
Driver (IonInput / IonSelect)                                  │
  │ page.locator('ion-input[formcontrolname="razonSocial"]')  │
  │ Built from page-registry.json (Phase 4 output)             │
  ▼                                                           │
Playwright API                                                 │
  │ click, fill, waitForResponse                              │
  ▼                                                           │
Browser / App                                                  │
```

---

## 4. ESTRATEGIA DE SELECTORES

### 4.1 Jerarquía de prioridad

| Prioridad | Tipo | Ejemplo | Riesgo de rotura |
|:---------:|:-----|:--------|:-----------------|
| 1 | `formControlName` | `ion-input[formcontrolname="razonSocial"] input` | Bajo — solo cambia si se modifica el modelo del formulario |
| 2 | `placeholder` | `input[placeholder="Proveedor ejemplo S.A.C"]` | Medio — el placeholder puede cambiar con UX |
| 3 | `id` | `#ion-input-0` | Alto — IDs auto-generados por Ionic cambian entre builds |
| 4 | texto visible | `button:has-text("Registrar")` | Medio — cambia con i18n o rename |
| 5 | `aria-label` | `[aria-label="Cerrar"]` | Bajo — atributo de accesibilidad, estable |
| 6 | XPath | `/html/body/app-root/.../div[3]` | Muy alto — cualquier cambio de DOM lo rompe |

### 4.2 Registro centralizado de selectores

Todos los selectores se definen en `selectors/pantallas/{modulo}_{pantalla}.json`, generados a partir del inventario técnico de la Fase 4. Los Page Objects importan de este registro, nunca hardcodean selectores.

---

## 5. ESTRATEGIA DE ESPERAS

| Situación | Estrategia | Timeout máximo |
|:----------|:-----------|:---------------|
| Navegación entre pantallas | `page.waitForURL(pattern)` | 15s |
| Carga de AG Grid | `grid.locator('.ag-row').first().waitFor({ state: 'visible' })` | 10s |
| Apertura de modal | `page.locator('ion-modal').waitFor({ state: 'visible' })` | 5s |
| Toast notification | `page.locator('ion-toast').waitFor({ state: 'visible' })` | 6s |
| Select abriendo popover | `page.locator('ion-popover, ion-alert').waitFor({ state: 'visible' })` | 5s |
| API response | `page.waitForResponse(r => r.url().includes('/api/') && r.status() === 200)` | 15s |
| Angular stability | `page.waitForLoadState('networkidle')` | 30s |
| Cambio de tab | `snooze(1000)` + dismissOverlay | 2s |

**Regla:** Solo se usa `waitForTimeout` después de acciones de UI que no tienen indicador de carga (cambio de tab, apertura de select).

---

## 6. GESTIÓN DE AUTENTICACIÓN

### 6.1 Fixture de setup (auth.setup.ts)

```javascript
// Ejecutado UNA vez antes de toda la suite
// 1. Navega a /auth/signin
// 2. Llena credenciales (pcastillo)
// 3. Selecciona empresa (PESQUERA CANTABRIA)
// 4. Selecciona sucursal (LIMA)
// 5. Espera dashboard (/inicio)
// 6. Guarda storageState en auth.json
```

### 6.2 Fixture por prueba

Cada test recibe `authenticatedPage` con cookies/tokens ya cargados. No repite login.

```javascript
// playwright.config.ts
projects: [{
  name: 'chromium',
  use: {
    storageState: 'auth.json',  // ← generado por auth.setup.ts
  },
}];
```

Para tests que requieren otro usuario/perfil, se usa un fixture alternativo: `pageAs(role)`.

---

## 7. GESTIÓN DE DATOS DE PRUEBA

### 7.1 Estrategia

| Tipo | Fuente | Limpieza |
|:-----|:-------|:---------|
| **Datos solo-lectura** (maestros, catálogos) | Ya existen en BD dev | No se modifican |
| **Datos creados por el test** | `DataFactory.generate*()` | Prefijo `TEST-AUTO-{runId}` permite limpieza posterior |
| **Datos multi-país** | `fixtures/paises/PE.json`, `fixtures/paises/CO.json` | Fijos, mantenidos manualmente |
| **Credenciales** | `.env` (nunca en código) | — |

### 7.2 DataFactory

```javascript
// data/factories/proveedor.factory.js
function generateProvider({ pais, tipo } = {}) {
  const ts = Date.now();
  return {
    razonSocial: `PROVEEDOR TEST ${ts}`,
    nombreComercial: `Test Auto ${ts}`,
    identfiscal: `${ts}`.slice(-11),
    direccionFiscal: `Av. Prueba ${ts % 10000}, Lima`,
    email: `test-${ts}@qa.restaurant.pe`,
    telefono: `9${ts}`.slice(0, 9),
    estado: 'Activo',
    proveedor: tipo || 'Nacional',
  };
}
```

---

## 8. ABSTRACCIÓN DE AG GRID

```javascript
class AgGridWrapper {
  constructor(page, containerSelector = '.ag-theme-alpine') { ... }

  // Navegación
  async buscar(texto) { ... }          // Usa el ion-searchbar sobre el grid
  async filtrarColumna(colName, valor) { ... }
  async ordenarPor(colName) { ... }

  // Lectura
  async getRowCount() { ... }
  async getCellValue(rowIndex, colName) { ... }
  async getColumnNames() { ... }
  async rowExists(text) { ... }        // ¿Existe fila que contenga este texto?

  // Acciones
  async clickRow(rowIndex) { ... }      // Selecciona fila (abre split-view)
  async clickRowAction(rowIndex, actionText) { ... }  // Botón en columna acciones
  async selectAll() { ... }
  async exportToExcel() { ... }
  async exportToPDF() { ... }

  // Esperas
  async waitForRows(minRows = 1) { ... }
  async waitForEmpty() { ... }
}
```

---

## 9. ABSTRACCIÓN DE TABS

```javascript
class TabNavigator {
  constructor(page) { ... }

  async switchTo(tabName) {
    // 1. Buscar ion-segment-button que contenga tabName
    // 2. Click con force:true (puede estar detrás de overlays)
    // 3. Esperar que el contenido del tab cargue
    // 4. Dismiss overlays
  }

  async getActiveTab() { ... }
  async getTabNames() { ... }
}
```

---

## 10. ABSTRACCIÓN DE MODALES

```javascript
class ModalDialog {
  constructor(page) { ... }

  async open(triggerButtonText) { ... }
  async close() { ... }                // Escape o botón Cancelar
  async confirm() { ... }             // Botón Guardar/Aceptar dentro del modal
  async getTitle() { ... }
  async fillField(fcName, value) { ... }  // Campos dentro del modal
}
```

---

## 11. LOGGING

```javascript
// utils/logger.js
const Logger = {
  suite(name) { console.log(`\n🏁 SUITE: ${name}`); },
  test(name, tags) { console.log(`  🧪 ${name} [${tags.join(', ')}]`); },
  step(description) { console.log(`    📍 ${description}`); },
  action(what, result) { console.log(`      🔧 ${what} → ${result ? '✅' : '❌'}`); },
  api(method, url, status) { console.log(`      🌐 ${method} ${url} → ${status}`); },
  screenshot(path) { console.log(`      📸 ${path}`); },
  error(msg) { console.error(`      ❌ ${msg}`); },
};
```

---

## 12. CONFIGURACIÓN

```javascript
// config/ambientes.js
const ENVS = {
  dev: {
    baseURL: 'https://panel.dev.contabilidad.restaurant.pe',
    apiURL: 'https://panel.dev.contabilidad.restaurant.pe/api',
    credentials: { username: process.env.DEV_USER || 'pcastillo', password: process.env.DEV_PASS },
    empresa: 'PESQUERA CANTABRIA S.A.',
    sucursal: 'LIMA',
    pais: 'PE',
  },
  // staging: { ... },
  // prod: { ... }, // solo tests smoke, read-only
};
```

---

## 13. ESCALABILIDAD

### Para agregar un nuevo módulo:

1. Crear `tests/e2e/{modulo}/` con specs
2. Crear `pages/{modulo}/` con Page Objects
3. Agregar selectores en `selectors/pantallas/{modulo}_*.json`
4. Si usa AG Grid/Tabs/Modales → ya hereda las abstracciones existentes
5. Si tiene un widget nuevo → crear Driver en `drivers/`
6. Agregar fixtures de datos en `data/factories/{modulo}.factory.js`

**Cero modificación a la arquitectura existente.**

---

## 14. RIESGOS Y MITIGACIONES

| Riesgo | Impacto | Mitigación |
|:-------|:--------|:-----------|
| IDs auto-generados de Ionic (`ion-input-0`) cambian | Alto | No usar IDs. Usar `formControlName` y `placeholder`. |
| AG Grid actualiza versión | Medio | `AgGridWrapper` encapsula la dependencia. Solo se modifica una clase. |
| Nuevo país (México, Guatemala) | Bajo | `CountrySelector` y `DataFactory` ya soportan parámetro `pais`. |
| Cambio de flujo de login | Alto | `auth.setup.ts` es el único punto. Si cambia, se actualiza UNA sola vez. |
| Permisos de usuario QA insuficientes | Crítico | Feature flag `skipIfNoPermission` + test marcado como `@skip @bloqueado`. |
| Overlays de Ionic interceptan clicks | Medio | `force: true` + `dismissOverlay()` en helpers globales. |
| i18n futuro | Medio | Selectores por `formControlName` sobreviven. Textos visibles requieren archivo de traducción. |

---

## 15. PENDIENTES ARQUITECTÓNICOS

| # | Decisión pendiente | Impacto | Recomendación |
|---|--------------------|:-------:|:--------------|
| 1 | ¿Migrar a TypeScript? | Medio | Hacerlo AHORA, antes de la primera línea de código. Beneficio: tipos para Page Objects, autocompletado en IDE. Costo: tsconfig + migración de specs existentes (2 archivos). |
| 2 | ¿Ejecución paralela o secuencial? | Alto | Paralela para tests independientes (distintos módulos). Secuencial para flujos E2E multi-pantalla (proveedor→OC→aprobación→factura). Usar `test.describe.serial` para S1 E2E. |
| 3 | ¿Base de datos de prueba dedicada? | Alto | Solicitar a DevOps un tenant `restaurant_pe_emp_qa` para datos de prueba, separado de `cantabria`. Así los tests pueden crear/borrar sin afectar datos reales. |
| 4 | ¿Docker para CI? | Medio | Playwright tiene imagen oficial. Si el pipeline usa GitHub Actions, usar `mcr.microsoft.com/playwright`. |
| 5 | ¿Page Objects en español o inglés? | Bajo | Métodos en español (alineados con el dominio de negocio). Clases/archivos en inglés (convención de código). |
