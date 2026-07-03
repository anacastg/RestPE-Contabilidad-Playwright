# RestPE Contabilidad — Playwright E2E

Tests E2E automatizados con Playwright para Restaurante.pe Contabilidad.

> **Alcance:** Frontend Angular/Ionic SPA + Backend Motor de Asientos v2 (Java)
> **Países:** Perú (PE) · Colombia (CO) · Ecuador (EC)
> **Dominio:** `panel.dev.contabilidad.restaurant.pe`
> **Línea base:** 03/07/2026 — Ver `reportes/MAPA_FUNCIONAL_CONSOLIDADO.md`

## Setup

```bash
npm install
npx playwright install --with-deps chromium
```

## Comandos

### Todos los tests

| Comando | Descripción |
|:--------|:------------|
| `npm test` | Todos los tests en headless (3 workers en paralelo) |
| `npm run test:headed` | Todos los tests con navegador visible |
| `npm run test:report` | Abrir reporte HTML generado |

### Tests individuales (para presentación — uno por uno)

| Comando | Descripción |
|:--------|:------------|
| `npx playwright test tests/smoke/login.spec.js --headed` | Smoke test: login completo |
| `npx playwright test --grep "E2E-01" --headed` | Solo E2E-01: Compras completo |
| `npx playwright test --grep "E2E-02" --headed` | Solo E2E-02: Ventas SUNAT |
| `npx playwright test --grep "E2E-03" --headed` | Solo E2E-03: Finanzas Base |
| `npx playwright test tests/e2e/sprint-1/sprint-1.spec.js --workers=1 --headed` | Todo Sprint 1 secuencial, uno atrás del otro |

### Por sprint

| Comando | Descripción |
|:--------|:------------|
| `npm run test:sprint1` | Sprint 1 E2E en headless |

## Estructura

```
tests/
├── smoke/
│   └── login.spec.js          # Smoke test login flow
└── e2e/
    ├── sprint-1/
    │   └── sprint-1.spec.js   # 2 E2E tests del Sprint 1 (CRUD Proveedor + Navegación)
    ├── sprint-2/               # Pendiente
    ├── sprint-3/               # Pendiente
    └── sprint-4/               # Pendiente
docs/                           # Documentos de referencia (frontend testing)
reportes/                       # Análisis, inventarios, motor v2, CSVs por módulo
playwright.config.js            # Configuración de Playwright
```

## Tags

- `@smoke` — Smoke tests
- `@critical` — Tests críticos
- `@sprint1..4` — Tests por sprint
- `@e2e` — Tests E2E completos
- `@pe` / `@co` / `@ec` — Tests específicos por país (nuevo)

## Documentación del Sistema

| Documento | Contenido |
|:----------|:----------|
| `reportes/MAPA_FUNCIONAL_CONSOLIDADO.md` | Mapa completo: módulos, eventos, componentes, reglas, rutas, gaps |
| `reportes/01-VISION.md` a `11-REVISION_COMPLETA.md` | Motor de Asientos v2 — especificación completa (33 eventos, 56 componentes) |
| `reportes/CASOS POR MODULO - COMPRAS.csv` | 60 casos de compras con asientos manuales de referencia |
| `reportes/CASOS POR MODULO - VENTAS.csv` | 49 casos de ventas con asientos manuales de referencia |
| `docs/CASOS_PRUEBA_FRONTEND_POR_SPRINT.md` | 165 CPs organizados por sprint (S1–S4) |
| `docs/CASOS_GHERKIN_AUTOMATIZACION.md` | 106 escenarios Gherkin listos para automatizar |
| `reportes/INVENTARIO_FUNCIONAL_COMPLETO.md` | Inventario de pantallas, componentes UI, localizadores |
| `reportes/COMPARATIVO_COBERTURA.md` | Comparativo de cobertura CSV vs MD vs Casos por Módulo |
| `reportes/PLANTILLA_EJECUCION_MANUAL_SPRINT1.md` | Resultados de ejecución manual Sprint 1 + bugs reportados |

## Arquitectura General

```
Frontend (Angular/Ionic) → APIs REST → Microservicios Java → Motor de Asientos v2 → PostgreSQL
```

- **Frontend:** 9 módulos (Almacén, Compras, Ventas, Finanzas, Contabilidad, Activos Fijos, RR.HH, Producción, Configuración)
- **Motor v2:** Pipeline de 10 pasos, 33 eventos de dominio, resolución dinámica de cuentas por país
- **Multi-tenant:** 1 BD PostgreSQL por empresa; país como dato, no hardcodeado
- **Legacy:** Motor v1 con 770 matrices fijas (Perú-only, 19% cobertura compras) — en proceso de migración a v2

## Nota técnica

Node.js v22 tiene una incompatibilidad con Playwright 1.61 al usar `require()` de archivos locales.
Los page objects están inline en los specs. Pendiente migrar a módulos separados cuando se resuelva la compatibilidad.

## Bloqueantes Conocidos

| Bug | Error | Impacto |
|-----|-------|---------|
| #006 | pcastillo sin permiso COM-002 "comprador activo" | Bloquea creación de OC |
| #010 | pcastillo sin permiso COM-022 "aprobador configurado" | Bloquea aprobación de OC |
