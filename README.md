# RestPE Contabilidad — Playwright E2E

Tests E2E automatizados con Playwright para Restaurante.pe Contabilidad.

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
    │   └── sprint-1.spec.js   # 3 E2E tests del Sprint 1
    ├── sprint-2/               # Pendiente
    ├── sprint-3/               # Pendiente
    └── sprint-4/               # Pendiente
docs/                           # Documentos de referencia
playwright.config.js            # Configuración de Playwright
```

## Tags

- `@smoke` — Smoke tests
- `@critical` — Tests críticos
- `@sprint1..4` — Tests por sprint
- `@e2e` — Tests E2E completos

## Nota técnica

Node.js v22 tiene una incompatibilidad con Playwright 1.61 al usar `require()` de archivos locales.
Los page objects están inline en los specs. Pendiente migrar a módulos separados cuando se resuelva la compatibilidad.
