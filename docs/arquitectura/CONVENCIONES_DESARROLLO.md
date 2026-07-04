# CONVENCIONES DE DESARROLLO — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026

---

## 1. NOMENCLATURA

### 1.1 Archivos

| Tipo | Convención | Ejemplo |
|:-----|:-----------|:--------|
| Test spec | `{modulo}.spec.js` | `proveedores.spec.js` |
| Page Object | `{Pantalla}Page.js` | `ProveedoresPage.js` |
| Componente | `{NombreComponente}.js` | `AgGridWrapper.js` |
| Driver | `{IonWidget}.js` | `IonInput.js` |
| Factory | `{entidad}.factory.js` | `proveedor.factory.js` |
| Fixture | `{contexto}.fixture.js` | `authenticated.fixture.js` |
| Selector JSON | `{modulo}_{pantalla}.json` | `compras_proveedores.json` |
| Config | `{dominio}.js` | `ambientes.js` |
| Util | `{funcion}.js` | `date-utils.js` |

### 1.2 Clases y métodos

| Elemento | Convención | Ejemplo |
|:---------|:-----------|:--------|
| Clase Page Object | `{Modulo}{Pantalla}Page` | `ComprasProveedoresPage` |
| Clase Componente | `{Nombre}Wrapper` | `AgGridWrapper` |
| Clase Driver | `Ion{Widget}` | `IonInput` |
| Método de negocio | verbo en español | `crearProveedor()`, `buscarPorRUC()` |
| Método privado | `_` prefijo | `_esperarGridCargue()` |
| Constante | `UPPER_SNAKE` | `DEFAULT_TIMEOUT` |

### 1.3 Tests

```javascript
test.describe('Sprint {N} — {Módulo} — {Funcionalidad}', () => {
  test('@sprint{N} @critical @{modulo} CP-{id} {descripción}', async ({ page }) => {
    // Arrange: preparar datos y navegar
    // Act: ejecutar acción de negocio
    // Assert: verificar resultado
  });
});
```

**Tags obligatorios:** `@sprint{N}` + nivel (`@smoke`|`@critical`|`@high`|`@medium`)  
**Tags opcionales:** `@e2e`, `@PE`/`@CO`/`@EC`, `@skip`, `@bloqueado`, `@flaky`

---

## 2. SELECTORES

### 2.1 Política oficial

**NUNCA usar en Page Objects:**
- Selectores por índice (`:nth-child(3)`)
- Clases CSS de Angular (`ng-star-inserted`, `ng-untouched`)
- XPath absoluto
- IDs auto-generados por Ionic (`#ion-input-0`)

**SIEMPRE preferir (en orden):**

```javascript
// 1. formControlName — ALTA estabilidad
page.locator('ion-input[formcontrolname="razonSocial"] input')

// 2. placeholder — MEDIA estabilidad
page.locator('input[placeholder="Proveedor ejemplo S.A.C"]')

// 3. texto visible — MEDIA estabilidad
page.locator('button:has-text("Registrar")')

// 4. aria-label — ALTA estabilidad, si existe
page.locator('[aria-label="Cerrar modal"]')
```

### 2.2 Registro de selectores

Cada pantalla tiene su archivo `selectors/pantallas/{modulo}_{pantalla}.json`:

```json
{
  "pantalla": "GestionProveedores",
  "ruta": "/compras/tabla/gestion-proveedores",
  "campos": {
    "razonSocial": {
      "selector": "ion-input[formcontrolname=\"razonSocial\"] input",
      "estabilidad": "ALTA",
      "placeholder": "Proveedor ejemplo S.A.C"
    }
  },
  "botones": {
    "registrar": { "selector": "button:has-text(\"Registrar\")" }
  },
  "tabs": {
    "general": { "selector": "ion-segment-button:has-text(\"General\")" }
  },
  "grid": {
    "container": ".ag-theme-alpine",
    "columnas": ["Código", "Razón social", "Documento fiscal", "Cargo", "Estado"]
  }
}
```

---

## 3. ESPERAS (WAITS)

### 3.1 Reglas

| Regla | Descripción |
|:------|:------------|
| **Prohibido `waitForTimeout` sin comentario** | Si se usa, debe tener un comentario explicando por qué no hay mejor alternativa |
| **Preferir `waitForResponse`** sobre `waitForTimeout` después de acciones que disparan APIs |
| **Preferir `waitForSelector`** sobre `waitForTimeout` para esperar elementos |
| **`networkidle` solo en navegación** | No usar en interacciones dentro de la misma pantalla |

### 3.2 Timeouts por defecto

```javascript
// config/timeouts.js
module.exports = {
  NAVEGACION: 15_000,       // page.waitForURL
  GRID_CARGA: 10_000,       // .ag-row visible
  MODAL_APERTURA: 5_000,    // ion-modal visible
  TOAST: 6_000,             // ion-toast visible (el sistema usa 6s)
  SELECT_POPOVER: 5_000,    // ion-popover visible
  API_RESPONSE: 15_000,     // POST/PUT que modifican datos
  ACCION_RAPIDA: 3_000,     // click en botón, cambio de tab
};
```

---

## 4. FIXTURES

### 4.1 Fixture de autenticación

```javascript
// fixtures/authenticated.fixture.js
const base = require('@playwright/test');

exports.test = base.test.extend({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'fixtures/storage/auth.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

### 4.2 Fixture de API

```javascript
exports.test = base.test.extend({
  apiClient: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: process.env.API_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
    });
    await use(new ApiClient(request));
    await request.dispose();
  },
});
```

---

## 5. LOGGING

### 5.1 Niveles

```javascript
Logger.suite('Sprint 1 — Proveedores');
Logger.test('CP-S1-003 Alta exitosa', ['@critical', '@sprint1']);
Logger.step('Navegar a gestión de proveedores');
Logger.action('llenar razonSocial', true);
Logger.api('POST', '/api/core/relaciones-comerciales', 200);
Logger.error('No se encontró el proveedor en el grid');
Logger.screenshot('screenshots/error-alta-proveedor.png');
```

### 5.2 Salida esperada

```
🏁 SUITE: Sprint 1 — Proveedores
  🧪 CP-S1-003 Alta exitosa [@critical, @sprint1]
    📍 Navegar a gestión de proveedores
      🔧 llenar razonSocial → ✅
      🔧 llenar identfiscal → ✅
      🌐 POST /api/core/relaciones-comerciales → 201
      📸 screenshots/proveedor-creado.png
    ✅ Test passed (4.2s)
```

---

## 6. MANEJO DE ERRORES

### 6.1 En Page Objects

```javascript
async crearProveedor(datos) {
  Logger.step('Crear proveedor');
  for (const [campo, valor] of Object.entries(datos)) {
    try {
      await this.drivers[campo].fill(valor);
      Logger.action(`llenar ${campo}`, true);
    } catch (e) {
      Logger.action(`llenar ${campo}`, false);
      throw new Error(`No se pudo llenar el campo "${campo}": ${e.message}`);
    }
  }
}
```

### 6.2 En tests

```javascript
test('CP-S1-003 Alta exitosa', async ({ authenticatedPage }) => {
  test.info().annotations.push({ type: 'CP', description: 'CP-S1-003' });
  // Si falla, Playwright automáticamente captura screenshot + trace
});
```

---

## 7. FEATURE FLAGS

```javascript
// config/feature-flags.js
module.exports = {
  MOTOR_V2_AVAILABLE: false,       // Cambiar a true cuando el endpoint exista
  CAJA_CHICA_AVAILABLE: false,     // Pantalla no implementada aún
  OC_CREAR_DISPONIBLE: false,      // Bug #006 — falta permiso COM-002
  APROBAR_OC_DISPONIBLE: false,    // Bug #010 — falta permiso COM-022
};
```

Uso en tests:

```javascript
test('@sprint1 CP-S1-010 Crear OC', async ({ page }) => {
  test.skip(!FEATURES.OC_CREAR_DISPONIBLE, 'Bug #006 — falta permiso COM-002');
  // ...
});
```

---

## 8. VERSIONADO DE SELECTORES

Cuando un `formControlName` cambia:

1. Actualizar `selectors/pantallas/{modulo}_{pantalla}.json`
2. Si el cambio es breaking, el test fallará en el driver `IonInput.fill()`
3. El Page Object no necesita modificación
4. Solo se actualiza UN archivo JSON
