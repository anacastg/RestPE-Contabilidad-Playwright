# GUÍA DE IMPLEMENTACIÓN — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026  
> **Estado actual:** 2 specs, Page Objects inline, sin componentes reutilizables  
> **Estado objetivo:** Framework completo con 7 capas, 15+ componentes, cobertura S1 completa

---

## 1. ORDEN DE IMPLEMENTACIÓN

### Fase 5.1 — Infraestructura (día 1-2)

| # | Tarea | Depende de | Output |
|---|-------|-----------|--------|
| 1.1 | Crear estructura de carpetas vacía | — | `pages/`, `components/`, `drivers/`, etc. |
| 1.2 | `auth.setup.ts` — Login global con `storageState` | — | `auth/auth.setup.ts` |
| 1.3 | `playwright.config.js` — Agregar dependencia `setup` project | 1.2 | Config actualizada |
| 1.4 | `config/ambientes.js` + `config/timeouts.js` + `config/feature-flags.js` | — | Archivos de configuración |
| 1.5 | `utils/logger.js` + `utils/helpers.js` (snooze, dismissOverlay) | — | Utilidades base |
| 1.6 | `fixtures/authenticated.fixture.js` | 1.2 | Fixture que inyecta `authenticatedPage` |

**Criterio de aceptación:** `npx playwright test --project=setup` genera `auth.json`. Un test dummy con `authenticatedPage` carga `/inicio` sin re-login.

### Fase 5.2 — Drivers (día 3-4)

| # | Tarea | Depende de | Output |
|---|-------|-----------|--------|
| 2.1 | `drivers/IonInput.js` | 1.5 | `fill(value)`, `clear()`, `getValue()`, `isDisabled()` |
| 2.2 | `drivers/IonSelect.js` | 1.5 | `open()`, `selectOption()`, `getSelected()` |
| 2.3 | `drivers/IonButton.js` | 1.5 | `click()`, `isDisabled()`, `waitEnabled()` |
| 2.4 | `drivers/IonToast.js` | 1.5 | `waitForMessage()`, `getMessage()`, `assertSuccess()` |
| 2.5 | `drivers/IonCheckbox.js` + `IonTextarea.js` + `IonSegment.js` | 1.5 | Drivers restantes |

**Criterio de aceptación:** Test unitario de cada driver contra una pantalla real (ej: `IonInput.fill('razonSocial', 'Test')` en Proveedores).

### Fase 5.3 — Componentes (día 5-7)

| # | Tarea | Depende de | Output |
|---|-------|-----------|--------|
| 3.1 | `components/AgGridWrapper.js` | 2.x | Buscar, filtrar, paginar, clickRow, getRowCount |
| 3.2 | `components/TabNavigator.js` | 2.5 | switchTo, getActive, getTabNames |
| 3.3 | `components/ToastNotifier.js` | 2.4 | assertSuccess, assertError |
| 3.4 | `components/SelectPicker.js` | 2.2 | selectOption por texto, getOptions |
| 3.5 | `components/ModalDialog.js` | 2.x | open, close, confirm |
| 3.6 | `components/DatePicker.js` | 2.1 | setDate, getDate |
| 3.7 | `components/CountrySelector.js` | 3.4 | select('PE'), select('CO') |

**Criterio de aceptación:** `AgGridWrapper` puede buscar, contar filas y hacer clic en una fila del grid de Proveedores.

### Fase 5.4 — Page Objects Sprint 1 (día 8-12)

| # | Tarea | Pantalla | Prioridad |
|---|-------|----------|:---------:|
| 4.1 | `pages/compras/ProveedoresPage.js` | Gestión Proveedores | 🔴 Crítica |
| 4.2 | `pages/compras/GenerarOCPage.js` | Generar OC | 🔴 Crítica |
| 4.3 | `pages/compras/AprobarOCPage.js` | Aprobar OC | 🔴 Crítica |
| 4.4 | `pages/compras/RegistroComprobantesPage.js` | Registro Comprobantes | 🟡 Alta |
| 4.5 | `pages/finanzas/CarteraPagosPage.js` | Cartera Pagos | 🟡 Alta |
| 4.6 | `pages/finanzas/CuentaBancariaPage.js` | Cuenta Bancaria | 🟢 Media |

**Cada Page Object incluye:**
- Constructor con inicialización de componentes (grid, tabs, toast)
- Método `navegar()` que va a la ruta
- Métodos de negocio: `crearProveedor(datos)`, `buscarProveedor(ruc)`, `editarProveedor(datos)`
- Los datos de formulario se pasan como objeto `{}`, no como parámetros individuales

### Fase 5.5 — Data Factories (día 13)

| # | Tarea | Output |
|---|-------|--------|
| 5.1 | `data/factories/proveedor.factory.js` | `generateProvider({ pais, tipo })` |
| 5.2 | `data/factories/oc.factory.js` | `generateOC({ proveedor, lineas })` |
| 5.3 | `data/factories/trabajador.factory.js` | `generateEmployee({ tipoDocumento })` |

### Fase 5.6 — Tests Sprint 1 (día 14-18)

| # | Spec | CPs cubiertos | Prioridad |
|---|------|:------------:|:---------:|
| 6.1 | `tests/e2e/sprint-1/proveedores.spec.js` | CP-S1-001 al 008 | 🔴 |
| 6.2 | `tests/e2e/sprint-1/oc.spec.js` | CP-S1-009 al 016 | 🔴 (skip por bug #006) |
| 6.3 | `tests/e2e/sprint-1/aprobacion-oc.spec.js` | CP-S1-017 al 022 | 🔴 (skip por bug #010) |
| 6.4 | `tests/e2e/sprint-1/cxp.spec.js` | CP-S1-026 al 032 | 🟡 |
| 6.5 | `tests/e2e/sprint-1/e2e-flujo-completo.spec.js` | CP-S1-E2E-01 | 🟡 |
| 6.6 | `tests/smoke/login.spec.js` | (existente — refactorizar) | 🔴 |

### Fase 5.7 — CI/CD + Reportes (día 19-20)

| # | Tarea |
|---|-------|
| 7.1 | Configurar GitHub Actions con Playwright |
| 7.2 | `reporters/custom-reporter.js` — metadata de negocio en reporte HTML |
| 7.3 | Integrar `playwright-report` como artefacto de CI |
| 7.4 | Agregar `npm run test:ci` con retries=1, workers=3 |

---

## 2. MIGRACIÓN DE CÓDIGO EXISTENTE

### Lo que se conserva

| Archivo | Acción |
|:--------|:-------|
| `tests/smoke/login.spec.js` | Refactorizar: extraer login a `auth.setup.ts`, convertir spec a uso de `authenticatedPage` |
| `tests/e2e/sprint-1/sprint-1.spec.js` | Dividir en specs separados (proveedores, oc, aprobacion). Migrar a Page Objects. |
| `playwright.config.js` | Extender con proyecto `setup`, feature flags, timeouts |

### Lo que se descarta

| Archivo | Motivo |
|:--------|:-------|
| Page Objects inline en specs | Se migran a `pages/` |
| Selectores hardcodeados en specs | Se migran a `selectors/pantallas/` |
| `waitForTimeout` sin justificación | Se reemplazan por esperas condicionales |

---

## 3. DEPENDENCIAS ENTRE ENTREGABLES

```
auth.setup.ts
  └── fixtures/authenticated.fixture.js
        └── TODOS los Page Objects
              └── TODOS los tests

drivers/
  └── components/AgGridWrapper, TabNavigator, ModalDialog, etc.
        └── pages/ (cada Page Object usa 2-4 componentes)
              └── tests/

data/factories/
  └── tests/ (usan factories para Arrange)
```

---

## 4. MILESTONES

| Hito | Entregable | Criterio |
|:-----|:-----------|:---------|
| **M1** | Infraestructura lista | `auth.json` generado. Test dummy con `authenticatedPage` pasa. |
| **M2** | Drivers completos | 7 drivers con tests unitarios contra pantallas reales. |
| **M3** | Componentes completos | AgGrid, Tabs, Modal, Select, DatePicker, Toast funcionales. |
| **M4** | Sprint 1 Page Objects | 6 Page Objects con métodos de negocio documentados. |
| **M5** | Sprint 1 Tests | 6 specs, ~30 tests. Cobertura >80% de CPs del Sprint 1 no bloqueados. |
| **M6** | CI/CD | Tests ejecutándose en GitHub Actions. Reporte HTML publicado. |

---

## 5. MÉTRICAS DE ÉXITO

| Métrica | Objetivo |
|:--------|:--------|
| Tiempo de ejecución Sprint 1 completo | < 8 minutos (30 tests × ~15s c/u + overhead) |
| Tests flaky en CI (3 ejecuciones consecutivas) | 0 |
| Cobertura de CPs Sprint 1 (no bloqueados) | > 80% |
| Líneas de código duplicadas entre Page Objects | < 5% |
| Tiempo para agregar un nuevo Page Object | < 2 horas |
| Tiempo para agregar un test a un Page Object existente | < 30 minutos |
