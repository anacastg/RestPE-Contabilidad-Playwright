# ESTRUCTURA DEL PROYECTO — RestPE Contabilidad Playwright

> **Versión:** 1.0 · **Fecha:** 04/07/2026

```
restpe-contabilidad-playwright/
│
├── playwright.config.js           # Configuración central de Playwright
├── .env                           # Credenciales y URLs (NO commiteado)
├── .env.example                   # Template sin valores reales
├── package.json
├── tsconfig.json                  # Si se migra a TypeScript
│
├── auth/                          # 🔐 Autenticación y sesiones
│   └── auth.setup.ts              # Fixture global: login → empresa → sucursal → storageState
│
├── tests/                         # 🧪 Casos de prueba
│   ├── smoke/                     # Smoke tests (login, navegación básica)
│   │   └── login.spec.js
│   ├── e2e/                       # Tests end-to-end por sprint
│   │   ├── sprint-1/
│   │   │   ├── proveedores.spec.js
│   │   │   ├── oc.spec.js
│   │   │   ├── aprobacion-oc.spec.js
│   │   │   ├── cxp.spec.js
│   │   │   └── e2e-flujo-completo.spec.js
│   │   ├── sprint-2/
│   │   ├── sprint-3/
│   │   └── sprint-4/
│   ├── api/                       # Tests de contrato de API
│   │   ├── auth.api.spec.js
│   │   └── motor-asientos.api.spec.js
│   └── exploracion/               # Scripts de descubrimiento (Fases 3-4)
│       ├── descubrir.spec.js
│       ├── techscout.spec.js
│       └── deepscout.spec.js
│
├── pages/                         # 📄 Page Objects (1 por pantalla)
│   ├── compras/
│   │   ├── ProveedoresPage.js
│   │   ├── GenerarOCPage.js
│   │   ├── AprobarOCPage.js
│   │   └── RegistroComprobantesPage.js
│   ├── finanzas/
│   │   ├── CarteraPagosPage.js
│   │   ├── CarteraCobrosPage.js
│   │   └── CuentaBancariaPage.js
│   ├── contabilidad/
│   │   ├── PlanContablePage.js
│   │   └── TipoCambioPage.js
│   ├── activos-fijos/
│   │   └── MaestroAFPage.js
│   └── rrhh/
│       ├── DatosPersonalesPage.js
│       ├── CalculoPlanillaPage.js
│       └── LiquidacionPage.js
│
├── components/                    # 🧩 Componentes reutilizables
│   ├── AgGridWrapper.js           # Abstracción de AG Grid (buscar, filtrar, paginar, exportar)
│   ├── TabNavigator.js            # Navegación entre tabs (ion-segment-button)
│   ├── ModalDialog.js             # Abstracción de modales (ion-modal)
│   ├── SplitViewLayout.js         # Layout grid-izquierda + formulario-derecha
│   ├── SelectPicker.js            # Selector con búsqueda (app-autocomplete)
│   ├── DatePicker.js              # Selector de fecha (app-base-calendar-new)
│   ├── ToastNotifier.js           # Notificaciones toast (ion-toast)
│   └── CountrySelector.js         # Selector de país en header
│
├── drivers/                       # 🔌 Drivers de bajo nivel (1:1 con widgets Ionic)
│   ├── IonInput.js                # ion-input[formcontrolname="X"] input
│   ├── IonSelect.js               # ion-select[formcontrolname="X"]
│   ├── IonButton.js               # button:has-text("X")
│   ├── IonCheckbox.js             # ion-checkbox[formcontrolname="X"]
│   ├── IonTextarea.js             # ion-textarea[formcontrolname="X"]
│   ├── IonToast.js                # ion-toast
│   └── IonSegment.js              # ion-segment-button (tabs)
│
├── fixtures/                      # 🎭 Fixtures Playwright
│   ├── authenticated.fixture.js   # Extiende test con página autenticada
│   ├── api-context.fixture.js     # APIRequestContext pre-configurado
│   └── storage/                   # storageState persistido
│       └── auth.json              # Generado por auth.setup.ts
│
├── data/                          # 📊 Datos de prueba
│   ├── factories/                 # Generadores de datos
│   │   ├── proveedor.factory.js
│   │   ├── oc.factory.js
│   │   ├── trabajador.factory.js
│   │   └── factura.factory.js
│   ├── fixtures/                  # Datos estáticos por dominio
│   │   ├── proveedores.json
│   │   ├── articulos.json
│   │   ├── trabajadores.json
│   │   └── paises/
│   │       ├── PE.json            # Datos específicos de Perú
│   │       ├── CO.json
│   │       └── EC.json
│   └── cleanup/                   # Scripts de limpieza post-test
│       └── cleanup-by-prefix.js
│
├── selectors/                     # 🎯 Registro centralizado de selectores
│   └── pantallas/
│       ├── compras_proveedores.json
│       ├── compras_generar-oc.json
│       ├── compras_registro-comprobantes.json
│       ├── activos_maestro-af.json
│       ├── rrhh_datos-personales.json
│       └── ...                    # 1 JSON por pantalla (generado desde Fase 4)
│
├── utils/                         # 🛠 Utilidades
│   ├── logger.js                  # Log estructurado
│   ├── helpers.js                 # snooze, dismissOverlay, scrollIntoView
│   ├── retry.js                   # Retry con backoff para operaciones flaky
│   ├── date-utils.js              # Formateo de fechas para inputs Ionic
│   └── file-utils.js              # Lectura de JSON, CSV, descarga de archivos
│
├── config/                        # ⚙️ Configuración
│   ├── ambientes.js               # dev, staging, prod
│   ├── timeouts.js                # Timeouts por operación
│   ├── feature-flags.js           # MOTOR_V2_AVAILABLE, CAJA_CHICA_AVAILABLE
│   └── permisos.js                # Mapeo de roles a permisos (COM-002, COM-022)
│
├── api/                           # 🌐 API Client
│   ├── ApiClient.js               # Wrapper sobre APIRequestContext
│   ├── endpoints.js               # Catálogo de endpoints
│   └── contracts/                 # Tipos/validación de respuestas
│       └── auth.contract.js
│
├── reporters/                     # 📊 Reportes
│   └── custom-reporter.js         # Extiende reporter HTML con metadata de negocio
│
├── docs/                          # 📚 Documentación (fuera del código)
│   ├── arquitectura/              # Documentos de esta Fase 5
│   ├── CASOS_PRUEBA_FRONTEND_POR_SPRINT.md
│   ├── CASOS_GHERKIN_AUTOMATIZACION.md
│   ├── MATRIZ_TRAZABILIDAD.md
│   ├── MAPA_FUNCIONAL_CONSOLIDADO.md
│   └── ...
│
├── reportes/                      # 📋 Documentación del motor v2 (back end)
│   ├── 01-VISION.md ... 11-REVISION_COMPLETA.md
│   └── CASOS POR MODULO - *.csv
│
├── exploracion-output/            # 📸 Evidencia de Fases 3-4 (fuera de git)
│   ├── screenshots/
│   ├── html/
│   ├── tecnico/
│   └── inventario-real-completo.md
│
└── playwright-report/             # 📊 Reportes HTML generados (fuera de git)
```

---

## Justificación de carpetas clave

| Carpeta | Justificación |
|:--------|:--------------|
| `drivers/` | Capa de abstracción más baja. Encapsula el hecho de que la app usa Ionic. Si migran a otro UI kit, solo se cambia esta capa. |
| `components/` | Abstracciones de nivel medio: AG Grid, Tabs, Modales. Son agnósticas a la pantalla pero dependen de `drivers/`. |
| `pages/` | Page Objects. Orquestan `components/` + `drivers/`. Un Page Object NUNCA usa `page.locator()` directamente. |
| `selectors/` | Separación estricta de selectores del código. Si un `formControlName` cambia, se actualiza el JSON, no el Page Object. |
| `data/factories/` | Datos de prueba generados programáticamente. Prefijo `TEST-AUTO-` permite identificar y limpiar. |
| `fixtures/storage/` | Sesión persistida en archivo. Evita re-login en cada test. |
| `config/feature-flags.js` | Permite deshabilitar tests de funcionalidades no implementadas sin modificar los specs. |
| `api/` | Cliente HTTP separado del navegador. Permite setup/teardown vía API sin depender de UI. |
| `utils/retry.js` | Centraliza lógica de reintento. Evita `waitForTimeout` dispersos. |

---

## Lo que NO va en el proyecto

| Excluido | Motivo |
|:---------|:-------|
| `node_modules/` | .gitignore |
| `exploracion-output/` | Evidencia de descubrimiento, no es código de automatización |
| `auth.json` | Contiene cookies/tokens, no se versiona |
| `.env` | Credenciales reales, no se versiona |
| `playwright-report/` | Artefactos de ejecución, no código fuente |
