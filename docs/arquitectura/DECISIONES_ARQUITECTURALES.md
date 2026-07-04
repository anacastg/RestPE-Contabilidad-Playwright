# DECISIONES ARQUITECTURALES (ADR) — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026  
> **Formato:** Architecture Decision Record (ADR)

---

## ADR-001: Drivers separados por tipo de widget Ionic

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

La aplicación usa Ionic 6+ con componentes como `ion-input`, `ion-select`, `ion-button`, `ion-checkbox`, `ion-segment-button`, `ion-toast`, `ion-textarea`, `ion-modal`. Cada uno tiene comportamiento distinto (Shadow DOM, eventos Angular, popovers para selects).

### Decisión

Crear una capa de **Drivers** (1 archivo por tipo de widget Ionic) que encapsula la interacción con cada componente. Los Page Objects usan estos drivers, nunca `page.locator()` directamente.

### Alternativas consideradas

| Alternativa | Rechazo |
|:------------|:--------|
| Page Objects con `page.locator()` directo | Duplica lógica de interacción con Ionic entre pantallas. Un cambio en `ion-select` requeriría modificar 20+ Page Objects. |
| Page Objects con herencia de clase base | Acoplamiento fuerte. Una pantalla con grid + tabs + modal necesitaría herencia múltiple. |

### Consecuencias

- ✅ Si Ionic cambia la API de `ion-select`, solo se modifica `drivers/IonSelect.js`
- ✅ Cada driver es testeable independientemente
- ❌ Mayor cantidad de archivos (7 drivers)

---

## ADR-002: Componentes reutilizables como composición, no herencia

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

23 pantallas usan AG Grid. 5 pantallas tienen tabs. 4 pantallas son split-view. Un Page Object podría necesitar grid + tabs + modal simultáneamente.

### Decisión

Los componentes (`AgGridWrapper`, `TabNavigator`, `ModalDialog`, `SplitViewLayout`) se **componen** en el Page Object, no se heredan. Cada Page Object instancia solo los componentes que necesita.

```javascript
class ProveedoresPage {
  constructor(page) {
    this.grid = new AgGridWrapper(page);
    this.tabs = new TabNavigator(page);
    this.toast = new ToastNotifier(page);
    // No tiene ModalDialog porque Proveedores no usa modales para CRUD
  }
}
```

### Alternativas consideradas

| Alternativa | Rechazo |
|:------------|:--------|
| Herencia de `BasePage` con grid, tabs, modal | Obliga a todas las pantallas a tener grid aunque no lo usen. Difícil de razonar. |
| Traits/Mixins | JavaScript no los soporta nativamente. Requiere librería externa. |

### Consecuencias

- ✅ Cada Page Object declara explícitamente qué componentes usa
- ✅ Fácil de testear: se puede mockear un componente individual
- ❌ Ligera repetición en constructores (3-4 líneas de instanciación)

---

## ADR-003: Selectores en archivos JSON externos

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

La aplicación tiene ~200 campos con `formControlName` descubiertos en la Fase 4. Estos nombres pueden cambiar si el desarrollador renombra el modelo del formulario Angular.

### Decisión

Todos los selectores se almacenan en `selectors/pantallas/{modulo}_{pantalla}.json`. Los drivers reciben el `formControlName` como string (no el selector CSS). El driver construye el selector a partir del nombre.

```javascript
// IonInput.js — el driver construye el selector
fill(formControlName, value) {
  const selector = `ion-input[formcontrolname="${formControlName}"] input`;
  return this.page.locator(selector).fill(value);
}

// Page Object — solo pasa el nombre
await this.razonSocial.fill('razonSocial', 'Mi Empresa SAC');
```

### Alternativas consideradas

| Alternativa | Rechazo |
|:------------|:--------|
| Selectores hardcodeados en Page Objects | Un cambio de nombre requiere buscar/reemplazar en múltiples archivos. |
| Archivo central `selectors.js` con constantes | Acopla todos los selectores en un solo archivo. Dificulta el mantenimiento por pantalla. |

### Consecuencias

- ✅ Si `razonSocial` cambia a `razon_social`, se actualiza en los specs y en el JSON de selectores (2 lugares predecibles)
- ✅ El JSON de selectores se puede regenerar automáticamente desde el scraper técnico
- ❌ Una capa más de indirección

---

## ADR-004: `auth.setup.ts` como proyecto Playwright independiente

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

El login requiere 3 pasos (credenciales → empresa → sucursal) y toma ~10 segundos. Ejecutarlo antes de cada test duplicaría el tiempo total.

### Decisión

Usar el mecanismo `storageState` de Playwright. Un proyecto `setup` ejecuta el login UNA vez, guarda cookies/tokens en `auth.json`. Los proyectos de test cargan `auth.json` y omiten el login.

### Alternativas consideradas

| Alternativa | Rechazo |
|:------------|:--------|
| Login en `beforeEach` | 30 tests × 10s = 5 minutos solo en login |
| API login (sin UI) | No refleja el flujo real. No detecta bugs en la pantalla de login. |
| `globalSetup` | No persiste cookies entre workers en paralelo. `storageState` sí. |

### Consecuencias

- ✅ 30 tests sin overhead de login
- ✅ Si el login falla, falla el setup y ningún test se ejecuta (fail-fast)
- ❌ Si la sesión expira durante una suite larga, los tests fallan en cascada. Mitigación: refresh token en `beforeEach` de suites largas.

---

## ADR-005: Idiomas mixtos — código en inglés, negocio en español

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

El dominio de negocio está en español (Proveedores, facturas, retenciones). Playwright y JavaScript usan inglés. Mezclar idiomas en nombres de métodos causa fricción cognitiva.

### Decisión

| Elemento | Idioma | Ejemplo |
|:---------|:-------|:--------|
| Archivos, clases, imports | Inglés | `ProveedoresPage.js`, `class AgGridWrapper` |
| Métodos de Page Object | Español | `crearProveedor()`, `buscarPorRUC()` |
| Variables internas | Inglés | `const rowCount = ...` |
| Tests (describe/it) | Español | `test('CP-S1-003 Alta exitosa de proveedor')` |
| Comentarios | Español | `// Espera que el toast de éxito aparezca` |
| Mensajes de log | Español | `Logger.step('Navegar a gestión de proveedores')` |

### Justificación

Los métodos de Page Object representan acciones de negocio. Expresarlos en español elimina la traducción mental "createProvider → crear proveedor" cada vez que se escribe o lee un test. El código infraestructural (clases, imports) sigue convenciones estándar de JavaScript.

---

## ADR-006: No migrar a TypeScript en Fase 5.1

**Estado:** ✅ Aceptado (con plan de migración)  
**Fecha:** 04/07/2026

### Contexto

TypeScript ofrece tipos, autocompletado y detección temprana de errores. Pero Node.js 22 tiene incompatibilidades conocidas con `require()` y el proyecto actual usa JavaScript.

### Decisión

Comenzar en JavaScript para la Fase 5.1-5.7 (infraestructura + Sprint 1). Migrar a TypeScript en la **Fase 6** (antes de expandir a Sprints 2-4), cuando el framework base esté estable y los patrones estén validados.

### Plan de migración (Fase 6)

1. Agregar `tsconfig.json` con `allowJs: true`
2. Renombrar `.js` → `.ts` progresivamente (drivers → componentes → pages → tests)
3. Agregar tipos para Page Objects y Data Factories
4. Eliminar `require()` en favor de `import`

### Consecuencias

- ✅ No bloquea el inicio de la implementación
- ✅ Los patrones se validan en JS antes de tiparlos
- ❌ Deuda técnica planificada — requiere disciplina para ejecutar Fase 6

---

## ADR-007: Feature flags en lugar de tests condicionales

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

4 pantallas no están implementadas. 2 funcionalidades están bloqueadas por bugs de permisos (#006, #010). El motor v2 no tiene fecha de despliegue.

### Decisión

Centralizar flags en `config/feature-flags.js`. Los tests usan `test.skip()` o `test.fixme()` basado en estos flags.

```javascript
test('@sprint1 CP-S1-010 Crear OC', async ({ page }) => {
  test.fixme(!FEATURES.OC_CREAR_DISPONIBLE, 'Bug #006 — falta permiso COM-002');
  // ...
});
```

### Alternativas consideradas

| Alternativa | Rechazo |
|:------------|:--------|
| Comentar los tests | El test desaparece del reporte. No hay trazabilidad de qué falta. |
| `if (condicion) { test(...) }` | Playwright no soporta tests condicionales en tiempo de ejecución. |
| Archivos separados por feature | Duplica estructura de specs. |

### Consecuencias

- ✅ Los tests bloqueados aparecen en el reporte como "skipped" con motivo
- ✅ Cuando el bug se resuelve, cambiar `false → true` en UN archivo habilita todos los tests
- ❌ Requiere disciplina para mantener los flags actualizados

---

## ADR-008: DataFactory con prefijo `TEST-AUTO-` para trazabilidad

**Estado:** ✅ Aceptado  
**Fecha:** 04/07/2026

### Contexto

Los tests crean registros en BD (proveedores, OC, facturas, trabajadores). Sin un identificador común, la limpieza post-test es imposible.

### Decisión

Toda entidad creada por tests incluye el prefijo `TEST-AUTO-{runId}` en un campo textual distinguible (razón social, nombre, descripción). Esto permite:

1. Identificar visualmente datos de prueba en la UI
2. Limpiar vía API: `DELETE ... WHERE razon_social LIKE 'TEST-AUTO-%'`
3. Evitar colisiones entre ejecuciones paralelas (runId único por CI job)

### Consecuencias

- ✅ Limpieza determinística post-suite
- ✅ Ejecuciones paralelas no interfieren entre sí
- ❌ Requiere que los endpoints de DELETE estén disponibles (no siempre es el caso — mitigación: limpieza manual periódica)

---

## Resumen de ADRs

| ADR | Tema | Decisión |
|:----|:-----|:---------|
| 001 | Drivers | 1 archivo por widget Ionic |
| 002 | Componentes | Composición, no herencia |
| 003 | Selectores | JSON externo por pantalla |
| 004 | Autenticación | `storageState` con proyecto setup |
| 005 | Idiomas | Código EN, negocio ES |
| 006 | TypeScript | Postergar a Fase 6 |
| 007 | Feature flags | Centralizar en `config/` |
| 008 | Datos | Prefijo `TEST-AUTO-{runId}` |
