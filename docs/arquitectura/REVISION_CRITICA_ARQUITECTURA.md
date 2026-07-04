# REVISIÓN CRÍTICA DE ARQUITECTURA (Architecture Review)

> **Fecha:** 04/07/2026  
> **Revisor:** Principal Software Architect  
> **Documentos revisados:** ARQUITECTURA_FRAMEWORK, ESTRUCTURA_PROYECTO, CONVENCIONES_DESARROLLO, COMPONENTES_REUTILIZABLES, GUIA_IMPLEMENTACION, DECISIONES_ARQUITECTURALES

---

## 0. RESUMEN EJECUTIVO

**Veredicto:** ⚠️ Arquitectura aprobada con mejoras recomendadas

La arquitectura tiene fundamentos sólidos (composición sobre herencia, storageState para auth, selectores centralizados). Hay **3 problemas estructurales** y **2 sobreingenierías** que deben resolverse antes de escribir la primera línea de código del framework. El resto son mejoras incrementales que pueden aplicarse durante la implementación.

---

## 1. PROBLEMAS ESTRUCTURALES

### 🔴 CRÍTICO — La capa de Drivers añade indirección sin valor

**Evidencia:** `ARQUITECTURA_FRAMEWORK.md` §2.2 define 7 drivers (IonInput, IonSelect, IonButton, IonCheckbox, IonTextarea, IonToast, IonSegment). Cada uno es un wrapper de ~15 líneas sobre `page.locator()`.

```javascript
// IonInput.js — propuesto
fill(formControlName, value) {
  const selector = `ion-input[formcontrolname="${formControlName}"] input`;
  return this.page.locator(selector).fill(value);
}
```

**Problema:** Esto es una función de 2 líneas envuelta en una clase. Multiplicado por 7 drivers = ~100 líneas de código que no hacen nada que `page.locator(selector).fill(value)` no haga ya. La única lógica real está en el `selector` (que debería venir del JSON de selectores) y en el retry (que debería ser un helper transversal).

**Riesgo:** Cuando alguien nuevo lea un Page Object, verá `this.drivers.razonSocial.fill(valor)` y tendrá que navegar 3 archivos (Page → Driver → selector JSON) para entender qué pasó.

**Recomendación:** **Eliminar la capa de Drivers.** Consolidar en una única función helper:

```javascript
// utils/form-helper.js
async function fillField(page, formControlName, value) {
  const selector = `ion-input[formcontrolname="${formControlName}"] input`;
  await page.locator(selector).fill(value);
  await page.locator(selector).press('Tab'); // necesario para Angular change detection
}
```

Esto reduce 7 archivos a 1, elimina 6 clases, y hace que los Page Objects sean más legibles. Si en el futuro Ionic cambia su API, se modifica UN archivo (`form-helper.js`), que es exactamente el mismo argumento que justificaba los Drivers.

---

### 🔴 CRÍTICO — AgGridWrapper es un "God Component"

**Evidencia:** `COMPONENTES_REUTILIZABLES.md` §1 define `AgGridWrapper` con 17 métodos públicos: `waitForLoad`, `waitForEmpty`, `buscar`, `filtrarColumna`, `ordenarPor`, `irAPagina`, `getRowCount`, `getColumnNames`, `getCellValue`, `rowExists`, `getCellByRowAndColumn`, `clickRow`, `clickRowAction`, `selectRow`, `selectAll`, `exportToExcel`, `exportToPDF`, `getTotalPages`, `nextPage`, `previousPage`.

**Problema:** 20 métodos en una clase. Si la aplicación migra de AG Grid a otro componente de tabla (ej: PrimeNG Table), esta clase entera debe reescribirse. Además, mezcla preocupaciones: lectura (getRowCount), navegación (irAPagina), interacción (clickRow), exportación (exportToExcel).

**Recomendación:** Dividir en 3 componentes más pequeños, componibles:

```javascript
class GridReader {  // Solo lectura
  async getRowCount() { ... }
  async getColumnNames() { ... }
  async getCellValue(row, col) { ... }
  async rowExists(text) { ... }
}

class GridActions {  // Solo interacción
  async clickRow(index) { ... }
  async clickRowAction(index, actionText) { ... }
  async selectRow(index) { ... }
  async selectAll() { ... }
}

class GridExporter {  // Solo exportación
  async toExcel() { ... }
  async toPDF() { ... }
}
```

El Page Object compone los 3:

```javascript
class ProveedoresPage {
  constructor(page) {
    this.grid = new GridReader(page);
    this.gridActions = new GridActions(page);
  }
}
```

Ventaja: si migran de AG Grid a otro componente, `GridReader` probablemente sobrevive (la API de lectura es similar), `GridActions` se adapta, `GridExporter` se reescribe.

---

### 🟡 ALTO — Los JSON de selectores no justifican su costo de mantenimiento

**Evidencia:** `CONVENCIONES_DESARROLLO.md` §2.2 y ADR-003 proponen 1 archivo JSON por pantalla (~48 archivos) con selectores para cada campo, botón, tab y grid.

**Problema:** 48 archivos JSON con ~15 entradas cada uno = 720 líneas de JSON. Cada vez que un desarrollador frontend renombra un `formControlName`, QA debe:
1. Ejecutar el test → falla
2. Abrir el JSON de selectores → encontrar el campo
3. Actualizar el nombre
4. Re-ejecutar

El argumento era "un solo lugar para cambiar". Pero si el `formControlName` se usa en 1 sola pantalla (que es lo normal), cambiarlo en el Page Object directamente es 1 edición vs 1 edición en el JSON. No hay ganancia.

**Excepción válida:** Selectores compartidos entre pantallas (CountrySelector, ToastNotifier, header). Estos SÍ justifican un lugar centralizado. Pero son ~5, no ~720.

**Recomendación:** **Eliminar `selectors/pantallas/`.** Mantener solo `selectors/compartidos.json` para los 5-8 selectores que aparecen en múltiples pantallas (país, toast, header, sidebar). Los selectores específicos de cada pantalla van inline en el Page Object como constantes privadas:

```javascript
class ProveedoresPage {
  static SELECTORS = {
    razonSocial: 'ion-input[formcontrolname="razonSocial"] input',
    identFiscal: 'ion-input[formcontrolname="identfiscal"] input',
    btnRegistrar: 'button:has-text("Registrar")',
    tabGeneral: 'ion-segment-button:has-text("General")',
    gridContainer: '.ag-theme-alpine',
  };
}
```

Esto elimina 48 archivos del proyecto y reduce la fricción de mantenimiento sin perder trazabilidad.

---

## 2. SOBREINGENIERÍA

### 🟡 ALTO — SplitViewLayout no justifica ser un componente reutilizable

**Evidencia:** `COMPONENTES_REUTILIZABLES.md` §9 define `SplitViewLayout` como componente para "4 pantallas split-view".

**Problema:** 4 pantallas no justifican una abstracción. El "split-view" en Proveedores (grid izquierda + form derecha con flecha de expandir) es radicalmente distinto al de Cartera Pagos (tabs internos + grid + form). La abstracción forzaría un mínimo común denominador tan genérico que no aporta valor.

**Recomendación:** **Eliminar `SplitViewLayout`.** Cada Page Object maneja su layout específico. Si un patrón emerge en 8+ pantallas, se abstrae en ese momento.

---

### 🟢 MEDIO — `AppAutocomplete` es redundante con `SelectPicker`

**Evidencia:** `COMPONENTES_REUTILIZABLES.md` §7 define `AppAutocomplete` como wrapper sobre `input[placeholder*="..."]`.

**Problema:** Es un `IonInput` con búsqueda. Ya tenemos `fillField()` como helper. La diferencia es que `AppAutocomplete` busca resultados — pero la interacción es `fill(texto) + waitForDropdown() + clickFirstResult()`. Esto es dominio del Page Object, no de un componente genérico.

**Recomendación:** **Eliminar `AppAutocomplete`.** Agregar un helper `utils/autocomplete.js` con `async function searchAndSelect(page, placeholder, searchText, resultText)`.

---

## 3. OMISIONES

### 🔴 CRÍTICO — Sin estrategia para Angular change detection

**Evidencia:** El test existente `sprint-1.spec.js` es intermitente porque Angular no detecta cambios cuando `fill()` se ejecuta sin `press('Tab')` o `dispatchEvent`. La arquitectura menciona `snooze(1000)` como workaround para tabs, pero no aborda el problema raíz.

**Problema:** Todos los `ion-input.fill()` requieren un evento `input` + `change` + `blur` para que Angular actualice el modelo. Sin esto, el botón "Guardar" permanece deshabilitado aunque los campos tengan datos visibles.

**Recomendación:** Agregar esta lógica en `fillField()`:

```javascript
async function fillField(page, formControlName, value) {
  const input = page.locator(`ion-input[formcontrolname="${formControlName}"] input`);
  await input.fill(value);
  await input.dispatchEvent('ionChange');  // ← crítico para Angular
  await input.press('Tab');               // ← dispara blur
  await page.waitForTimeout(200);         // ← Angular digest cycle
}
```

Todo Page Object que use `fillField` hereda esta corrección sin saberlo.

---

### 🔴 CRÍTICO — Sin estrategia de limpieza para ejecución paralela

**Evidencia:** `ARQUITECTURA_FRAMEWORK.md` menciona `DataFactory` con prefijo `TEST-AUTO-` y "limpieza posterior". `GUIA_IMPLEMENTACION.md` no tiene fase de cleanup/teardown.

**Problema:** 3 workers en paralelo creando proveedores con `razonSocial: 'PROVEEDOR TEST 1234567890'`. Si dos workers generan el mismo timestamp, hay colisión. Si un test falla y no limpia, el siguiente test encuentra datos residuales.

**Recomendación:**

```javascript
// data/factories/proveedor.factory.js
function generateProvider({ workerId } = {}) {
  const worker = workerId || process.env.TEST_WORKER_INDEX || 0;
  const ts = Date.now();
  return {
    razonSocial: `TEST-AUTO-W${worker}-${ts}`,
    identfiscal: `${worker}${String(ts).slice(-10)}`,
    // ...
  };
}
```

Agregar `utils/cleanup.js` con `async function cleanupByPrefix(page, prefix)` que use la API para eliminar registros creados durante la suite.

---

### 🟡 ALTO — Sin estrategia para el flujo Empresa → Sucursal multi-tenant

**Evidencia:** `auth.setup.ts` hardcodea `PESQUERA CANTABRIA S.A.` y `LIMA`. ADR-004 menciona `storageState`.

**Problema:** Si se necesita probar con otra empresa (ej: CHIFA CAPON) u otra sucursal, `auth.json` no sirve. Hay que re-ejecutar el setup con otros parámetros. Para tests multi-país (CO, EC), se necesita un tenant diferente.

**Recomendación:** Parametrizar `auth.setup.ts`:

```javascript
// auth.setup.ts
const empresa = process.env.TEST_EMPRESA || 'PESQUERA CANTABRIA S.A.';
const sucursal = process.env.TEST_SUCURSAL || 'LIMA';
// Guardar en auth-{empresa}.json
```

Y generar un `auth.json` por tenant. El fixture `authenticatedPage` acepta `{ empresa, sucursal }` como opción.

---

### 🟡 ALTO — Sin Page Object para el Login Flow

**Evidencia:** `GUIA_IMPLEMENTACION.md` Fase 5.4 lista Page Objects de Compras y Finanzas pero omite `LoginPage`, `EmpresaSelectionPage`, `SucursalSelectionPage`.

**Problema:** Si el flujo de login cambia (ej: agregan 2FA, cambian el placeholder del input), `auth.setup.ts` se rompe y no hay Page Object que encapsule esa lógica. El setup está acoplado a selectores crudos.

**Recomendación:** Agregar `pages/auth/LoginPage.js`, `pages/auth/EmpresaSelectionPage.js`, `pages/auth/SucursalSelectionPage.js` en Fase 5.4. `auth.setup.ts` USA estos Page Objects, no selectores crudos.

---

## 4. CONSISTENCIA INTERNA

| Inconsistencia | Documentos | Corrección |
|:---------------|:-----------|:-----------|
| "Zero `waitForTimeout`" vs `snooze(1000)` en tabs | ARQUITECTURA §1.1 vs ARQUITECTURA §5 | Documentar `snooze(1000)` como excepción explícita documentada para Angular change detection |
| Drivers como capa vs `fillField()` helper | ARQUITECTURA §2.2 vs ADR-001 | Eliminar capa Drivers, consolidar en helpers |
| "selectores nunca en Page Objects" vs JSON selectors eliminados | ADR-003 vs esta revisión | Actualizar ADR-003: cancelado. Selectores inline en Page Objects como constantes estáticas |
| GUIA_IMPLEMENTACION 20 días vs ADR-006 TypeScript después | GUIA §1 vs ADR-006 | La Fase 6 (TypeScript) debería ocurrir ANTES de expandir a Sprints 2-4, no después de S1 |

---

## 5. ESCENARIOS DE ESTRÉS

| Escenario | ¿Soporta? | Observación |
|:----------|:---------:|:------------|
| **Nuevo país** (México) | ✅ | `CountrySelector.select('MX')` + `DataFactory.generateProvider({ pais: 'MX' })`. 0 cambios de arquitectura. |
| **Nuevo módulo** (ej: Producción) | ✅ | Crear `pages/produccion/`, spec, JSON de selectores. Usar componentes existentes. |
| **Cambio completo del menú** | ⚠️ | Solo `auth.setup.ts` y navegación se rompen. Page Objects usan `page.goto(ruta)` no navegación por menú. Si las rutas también cambian, actualizar constantes. |
| **Reemplazo de AG Grid** | ❌ | `GridReader` + `GridActions` + `GridExporter` necesitan reescritura completa. Pero solo 3 archivos vs 1 God component. Ver recomendación de split en §1. |
| **Cambio masivo de selectores** | ⚠️ | Si 200 `formControlName` cambian, hay que actualizar 200 constantes en Page Objects. Con JSONs externos serían 200 líneas en 48 archivos. La diferencia es marginal. |
| **Migración a TypeScript** | ⚠️ | ADR-006 la posterga. Cada día en JS acumula deuda. Recomendación: TS desde el día 1, no desde la Fase 6. |
| **CI/CD** | ✅ | `storageState` + workers=3 + retries=1. Playwright tiene soporte nativo para GitHub Actions. |
| **Ejecución distribuida** | ⚠️ | `storageState` se comparte vía artifact. `TEST_WORKER_INDEX` para isolación de datos. Pero sin BD dedicada por worker, hay riesgo de colisión. |

---

## 6. PLAN DE IMPLEMENTACIÓN REVISADO

### Orden corregido (basado en críticas de esta revisión)

| # | Tarea | Cambio vs plan original |
|---|-------|------------------------|
| **0** | Migrar a TypeScript **ahora** (`tsconfig.json`, renombrar `.js` → `.ts`) | ADR-006 revertido. Hacerlo antes de escribir cualquier línea nueva. |
| **1** | `auth.setup.ts` + `pages/auth/*Page.ts` (Login, Empresa, Sucursal) | Agregado: Page Objects para auth flow |
| **2** | `utils/form-helper.ts` (fillField, selectOption, clickButton) | Reemplaza 7 drivers con 1 archivo |
| **3** | `utils/angular-helpers.ts` (dismissOverlay, triggerChangeDetection, snooze) | Nuevo: centraliza workarounds de Angular |
| **4** | `components/GridReader.ts` + `GridActions.ts` + `GridExporter.ts` | Reemplaza AgGridWrapper monolítico |
| **5** | `components/TabNavigator.ts` + `components/ModalDialog.ts` + `components/ToastNotifier.ts` | Sin cambios |
| **6** | `components/CountrySelector.ts` + `components/DatePicker.ts` | Sin cambios |
| **7** | `data/factories/*.ts` con `workerId` para ejecución paralela | Agregado: isolación por worker |
| **8** | `utils/cleanup.ts` para limpieza post-suite | Nuevo |
| **9** | `fixtures/authenticated.fixture.ts` con soporte multi-tenant | Extendido: `{ empresa, sucursal }` |
| **10** | `pages/compras/ProveedoresPage.ts` (primer Page Object) | Orden original: Fase 5.4 |
| **11** | `tests/e2e/sprint-1/proveedores.spec.ts` | Refactorizar desde spec existente |

### Lo que se elimina del plan original

| Eliminado | Motivo |
|:----------|:-------|
| 7 archivos `drivers/Ion*.js` | Reemplazados por `utils/form-helper.ts` |
| `components/AgGridWrapper.js` | Dividido en GridReader + GridActions + GridExporter |
| `components/SplitViewLayout.js` | No justifica abstracción para 4 pantallas |
| `components/AppAutocomplete.js` | Reemplazado por helper `searchAndSelect()` |
| 48 archivos `selectors/pantallas/*.json` | Selectores inline en Page Objects como constantes estáticas |
| `selectors/pantallas/` (directorio completo) | Solo se mantiene `selectors/compartidos.json` |

---

## 7. CLASIFICACIÓN DE RIESGOS

### 🔴 Críticos (resolver antes de escribir código)

| Riesgo | Impacto | Probabilidad | Recomendación |
|:-------|:--------|:------------:|:--------------|
| Drivers como capa añaden indirección innecesaria | Mantenimiento inflado, onboarding lento | Alta | Eliminar capa, consolidar en `utils/form-helper.ts` |
| AgGridWrapper monolítico se vuelve inmantenible con 23 pantallas | Rotura en cascada ante migración de grid | Alta | Dividir en GridReader + GridActions + GridExporter |
| Sin estrategia Angular change detection | Tests flaky desde el día 1 | Muy alta | `ionChange` event + `press('Tab')` + 200ms snooze en `fillField()` |
| Sin isolación para ejecución paralela | Colisiones de datos entre workers | Media | `workerId` en factories + `cleanup.ts` |

### 🟡 Altos (resolver durante Fase 5.1-5.3)

| Riesgo | Recomendación |
|:-------|:--------------|
| Sin Page Objects para auth flow | `pages/auth/LoginPage.ts` + `EmpresaSelectionPage.ts` + `SucursalSelectionPage.ts` |
| `auth.setup.ts` sin parametrización multi-tenant | Soporte para `{ empresa, sucursal }` vía variables de entorno |
| JSON selectors generan 48 archivos de mantenimiento | Eliminar, usar constantes estáticas en Page Objects |
| TypeScript postergado acumula deuda | Migrar AHORA (antes de Fase 5.1) |

### 🟢 Medios (resolver durante Sprints 1-2)

| Riesgo | Recomendación |
|:-------|:--------------|
| `AppAutocomplete` es redundante con `fillField` | Helper `searchAndSelect()` en `utils/` |
| `SplitViewLayout` no justifica abstracción | Eliminar, manejar layout en cada Page Object |
| Sin estrategia de API-level teardown | `ApiClient.delete()` con prefijo `TEST-AUTO-` |

---

## 8. VEREDICTO FINAL

### ⚠️ Arquitectura aprobada con mejoras recomendadas

**Fundamento:**

La arquitectura tiene una **base conceptual correcta**: composición sobre herencia, `storageState` para auth, selectores por `formControlName`, feature flags, DataFactory con prefijos. Estos pilares sobreviven a la revisión.

Los **problemas estructurales** son corregibles sin reescribir la arquitectura: eliminar la capa de Drivers (reemplazar por helpers), dividir `AgGridWrapper` en 3 componentes más pequeños, eliminar los JSON de selectores por pantalla.

Las **omisiones** (Angular change detection, isolación paralela, limpieza) son críticas pero tienen soluciones concretas de ~20 líneas cada una.

Con las correcciones listadas en §6, la arquitectura resultante es **más simple** (menos archivos, menos capas), **más robusta** (maneja Angular correctamente, soporta paralelismo), y **más mantenible** (componentes pequeños y enfocados).

---

## 9. PLAN DE IMPLEMENTACIÓN DEFINITIVO

| Orden | Entregable | Archivos nuevos | Archivos eliminados |
|:-----:|:-----------|:---------------:|:-------------------:|
| 0 | **TypeScript migration** | `tsconfig.json`, renombrar `.js`→`.ts` | — |
| 1 | **Auth infrastructure** | `auth.setup.ts`, `pages/auth/LoginPage.ts`, `pages/auth/EmpresaSelectionPage.ts`, `pages/auth/SucursalSelectionPage.ts` | — |
| 2 | **Form helpers** | `utils/form-helper.ts`, `utils/angular-helpers.ts` | `drivers/` (7 archivos) |
| 3 | **Grid components** | `components/GridReader.ts`, `components/GridActions.ts`, `components/GridExporter.ts` | `components/AgGridWrapper.js` |
| 4 | **UI components** | `components/TabNavigator.ts`, `components/ModalDialog.ts`, `components/ToastNotifier.ts`, `components/CountrySelector.ts`, `components/DatePicker.ts` | `components/SplitViewLayout.js`, `components/AppAutocomplete.js` |
| 5 | **Shared selectors** | `selectors/compartidos.json` (5-8 entradas) | `selectors/pantallas/` (48 archivos) |
| 6 | **Data + Cleanup** | `data/factories/proveedor.factory.ts`, `data/factories/oc.factory.ts`, `utils/cleanup.ts` | — |
| 7 | **Fixtures** | `fixtures/authenticated.fixture.ts`, `fixtures/api-context.fixture.ts` | — |
| 8 | **Page Objects S1** | `pages/compras/ProveedoresPage.ts`, `pages/compras/GenerarOCPage.ts`, `pages/compras/AprobarOCPage.ts`, `pages/compras/RegistroComprobantesPage.ts` | — |
| 9 | **Tests S1** | `tests/e2e/sprint-1/proveedores.spec.ts`, `tests/e2e/sprint-1/oc.spec.ts`, etc. | Refactorizar specs existentes |
| 10 | **CI/CD** | `.github/workflows/playwright.yml` | — |

---

*Revisión completada. Proceder con la implementación siguiendo el orden corregido.*
