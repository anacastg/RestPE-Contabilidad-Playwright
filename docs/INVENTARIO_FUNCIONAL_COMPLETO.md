# INVENTARIO FUNCIONAL COMPLETO
## RestaurantPE Contabilidad — Automatización

> **Fecha:** 17/06/2026 — **Actualizado:** 03/07/2026 (motor v2)
> **App:** Angular/Ionic SPA
> **Dominio:** panel.dev.contabilidad.restaurant.pe
> **Capas:** Frontend (este documento) + Backend Motor de Asientos v2 (`01-VISION.md` a `11-REVISION_COMPLETA.md`)
> **Países:** PE (Perú) · CO (Colombia) · EC (Ecuador)

> **🆕 ACTUALIZACIÓN 03/07/2026:** Se agregó la Sección 8 (Arquitectura Backend — Motor v2) con mapeo de pantallas a eventos de dominio, catálogo de componentes contables y contexto multi-país. Se agregaron §8.9 (Admin APIs), §8.10 (Cadenas de Resolución de Cuentas) y §8.11 (Modelo Operativo) desde `08-REGLA_CUENTA.md` y `10-GESTION_REGLAS.md`. Ver `MAPA_FUNCIONAL_CONSOLIDADO.md` para la visión integrada.

---

## 1. MAPEO DE PANTALLAS

### 1.1 LoginPage

| Campo | Valor |
|-------|-------|
| **URL** | `/auth/signin` |
| **Título** | Restaurant Contabilidad |
| **Ruta Angular** | `AuthModule` (chunk 72930) |

#### Elementos Identificados

| Elemento | Tipo | Localizador CSS | Atributo clave |
|----------|------|-----------------|----------------|
| Campo Usuario | `input[type="text"]` | `input[placeholder='usuario@empresa.com']` | `formcontrolname="usuario_nombre"` |
| Campo Contraseña | `input[type="password"]` | `input[placeholder='**********']` | `formcontrolname="usuario_clave"` |
| Checkbox Guardar | `ion-checkbox` | `ion-checkbox[formcontrolname='guardar_datos']` | `formcontrolname="guardar_datos"` |
| Botón Iniciar Sesión | `ion-button[type="submit"]` | `ion-button.button-login` | Text: "Iniciar Sesión" |
| Link Olvidaste contraseña | `ion-button[fill="clear"]` | `ion-button.btn-underline` | Text: "¿Olvidaste tu contraseña?" |
| Toggle password | `ion-button[fill="clear"]` | `ion-button[slot="end"]` | Botón de ojo (show/hide password) |

#### API Involucrada
- `POST /auth/login` — Body: `{ email, password, ipAddress, ipPrivada, browser, sistemaOperativo }`

#### Riesgos de Automatización
- Los `<input>` están en el LIGHT DOM (NO shadow DOM), accesibles directamente por placeholder
- `ion-input` no tiene shadowRoot accesible desde Selenium 4 `getShadowRoot()`
- Angular requiere eventos `input`+`change`+`blur` para detectar cambios en el formulario
- `sendKeys()` directo sobre `input` funciona correctamente

---

### 1.2 SeleccionEmpresaPage

| Campo | Valor |
|-------|-------|
| **URL** | `/auth/seleccion-razon-social` |
| **Título** | Seleccionar Empresa |

#### Estructura DOM
```html
<div class="flex flex-col ng-star-inserted">
  <span class="text-2xl font-semibold text-text-85">Seleccionar Empresa</span>
  <span>Haz click en una empresa para ingresar al sistema</span>
  <ion-searchbar>
    <input placeholder="Buscar por razón social o RUC">
  </ion-searchbar>
  <table>
    <thead>
      <tr><th>Empresa</th><th>RUC</th></tr>
    </thead>
    <tbody>
      <tr class="cursor-pointer hover:bg-light ng-star-in">
        <td class="p-2">
          <p class="text-xxs font-semibold text-text-85 truncate">NOMBRE EMPRESA</p>
        </td>
        <td class="p-2 text-xxs text-text-65 truncate">RUC</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Elementos Identificados

| Elemento | Tipo | Localizador CSS | Nota |
|----------|------|-----------------|------|
| Título | `span` | `span.text-2xl.font-semibold` | Texto: "Seleccionar Empresa" |
| Subtítulo | `span` | `span` following título | "Haz click en una empresa..." |
| Buscador | `input` | `input[placeholder*='Buscar']` | Filtra empresas en tiempo real |
| Tabla empresas | `table` | `table` | Contiene thead + tbody |
| Fila empresa | `tr` | `tr.cursor-pointer` | Click para seleccionar |
| Nombre empresa | `p` | `p.text-xxs.font-semibold` | Dentro de `<tr>` |
| RUC empresa | `td` | `td.text-xxs.text-text-65` | Segunda columna |

#### Empresas Disponibles (por RUC)

| # | Razón Social | RUC |
|---|-------------|-----|
| 1 | GRUPO ONCE S.A.C. | 20125986880 |
| 2 | HOTELERIA PERUANA S.A.C. | 20536047906 |
| 3 | NESSUS HOTELES PERU S.A. | 20505670443 |
| 4 | PANADERIA EL HORNITO E.I.R.L. | 20602552871 |
| 5 | PANADERIA SAN JORGE S.A. | 20100093830 |
| 6 | **PESQUERA CANTABRIA S.A.** | **20504595863** |
| 7 | RESTAURANT CEVICHERIA EL AJICITO LIMO E.I.R.L. | 20612289205 |
| 8 | RESTAURANT CHIFA CAPON E.I.R.L. | 20513307579 |

#### API Involucrada
- `GET /auth/empresas`
- `POST /auth/seleccionar-empresa` — Body: `{ empresaId }`

#### Riesgos de Automatización
- Hacer clic en el `<p>` interno NO funciona. Debe hacerse clic en el `<tr>` padre
- La tabla no tiene id, usar `tr.cursor-pointer` como selector
- El buscador filtra en tiempo real; puede borrar resultados si se escribe muy rápido
- Después de hacer clic, la navegación puede ser inmediata o requerir botón "Continuar"
- No hay botón de confirmación visible (el click en la fila debe disparar la selección)

---

### 1.3 SeleccionSucursalPage

| Campo | Valor |
|-------|-------|
| **URL** | Probable: `/auth/seleccion-sucursal` |
| **Estructura esperada** | Similar a SeleccionEmpresaPage (tabla con cursor-pointer) |

> **Nota:** No se pudo navegar a esta pantalla porque la selección de empresa no completó la transición. La API `POST /auth/seleccionar-empresa` debe responder correctamente para avanzar.

#### API Involucrada
- `GET /core/empresas/{id}/sucursales/mias`
- `POST /auth/seleccionar-empresa` (incluye sucursalId)

---

### 1.4 DashboardPage

| Campo | Valor |
|-------|-------|
| **URL** | `/inicio` |
| **Componentes** | `app-layout` → `app-header` + `app-sidebar` + `ion-router-outlet` |

#### Componentes Identificados (del análisis del bundle JS)

| Componente | Selector | Descripción |
|-----------|----------|-------------|
| Layout principal | `app-layout` | Shell: header + sidebar + content |
| Header | `app-header` | Logo, selector país, datos empresa/sucursal, usuario |
| Sidebar | `app-sidebar` | Menú multi-nivel con mega-menú |
| Chat IA | `app-chat-ia` | Widget flotante |
| Router Outlet | `ion-router-outlet` | Contenido dinámico |

#### Menú del Sidebar (Keys del bundle)

| Key | Label | Icon | Ruta |
|-----|-------|------|------|
| `dashboard` | Almacén | warehouse | `/almacen` |
| `clientes` | Compras | cart-shopping | `/compras` |
| `tesoreria` | Finanzas | chart-line | `/finanzas` |
| `proveed` | Ventas | — | — |
| `invent` | Contabilidad | calculator | `/contabilidad` |
| `conta` | Activos fijos | building | `/activos` |
| `rrhh` | RR.HH | users | `/rrhh` |
| `sueldos` | Producción | box | `/produccion` |
| `config` | Configuración | cog | `/configuracion` |

#### Guard de Autenticación (AuthGuard)
- `isAuthenticated()` debe ser true
- `user.temporal` debe ser false (si true → mostrar selección empresa/sucursal)
- `user.empresaId` debe existir
- `user.sucursalId` debe existir
- Si falla → `clearSession()` + redirect a `/auth/signin`

---

## 2. INVENTARIO DE COMPONENTES UI REUTILIZABLES

| Componente | Selector | Propiedades |
|-----------|----------|-------------|
| Input | `ion-input` | `formcontrolname`, `fill`, `placeholder` |
| Botón | `ion-button` | `type`, `fill`, `color`, `slot` |
| Card | `ion-card` | No se usa extensivamente |
| Item | `ion-item` | No se usa extensivamente |
| Checkbox | `ion-checkbox` | `formcontrolname` |
| Select | `ion-select` | Para dropdowns |
| Toast | `ion-toast` | Notificaciones |
| Loading | `ion-loading` | Spinner de carga |
| Searchbar | `ion-searchbar` | Búsqueda tipo Google |

### Toast Service (Clase `F1`)

| Método | Uso |
|--------|-----|
| `success(título, descripción)` | Duración 6s |
| `warning(título, descripción)` | Duración 6s |
| `danger(título, descripción)` | Duración 6s |
| `show(tipo, título, descripción)` | Duración 2s por defecto |

---

## 3. LOCALIZADORES RECOMENDADOS POR PRIORIDAD

### Prioridad: 1. ID | 2. Name/Formcontrolname | 3. CSS | 4. XPath

| Pantalla | Elemento | Localizador Recomendado |
|----------|----------|------------------------|
| Login | Usuario | `input[placeholder='usuario@empresa.com']` |
| Login | Password | `input[placeholder='**********']` |
| Login | Botón Login | `ion-button.button-login` |
| Login | Error | `ion-text[color='danger'], ion-toast` |
| Empresa | Buscador | `input[placeholder*='Buscar']` |
| Empresa | Fila empresa | `tr.cursor-pointer` |
| Empresa | Nombre empresa | `tr.cursor-pointer p.text-xxs` |
| Empresa | RUC empresa | `tr.cursor-pointer td:last-child` |
| Sucursal | Buscador | `input[placeholder*='Buscar']` (esperado) |
| Dashboard | Header | `app-header, ion-header` |
| Dashboard | Sidebar | `app-sidebar` |
| Dashboard | Menú | `app-sidebar a` |

---

## 4. PATRONES Y ESTRATEGIAS DE AUTOMATIZACIÓN

### 4.1 Flujo de Login
```java
driver.findElement(By.cssSelector("input[placeholder='usuario@empresa.com']")).sendKeys("username");
driver.findElement(By.cssSelector("input[placeholder='**********']")).sendKeys("password");
driver.findElement(By.cssSelector("ion-button.button-login")).click();
```

### 4.2 Flujo de Selección de Empresa
```java
// Esperar a que carguen las filas
List<WebElement> rows = wait.until(ExpectedConditions
    .presenceOfAllElementsLocatedBy(By.cssSelector("tr.cursor-pointer")));

// Hacer clic en la fila específica (NO en el <p> interno)
for (WebElement row : rows) {
    if (row.getText().contains("PESQUERA CANTABRIA S.A.")) {
        row.click();
        break;
    }
}
```

### 4.3 Esperas Angular/Ionic
```java
// Esperar a que Angular termine
((JavascriptExecutor) driver).executeScript(
    "return window.getAllAngularTestabilities && " +
    "window.getAllAngularTestabilities().every(t => t.isStable())");

// Esperar a que Ionic loading desaparezca
wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("ion-loading")));
```

### 4.4 Shadow DOM
Los `ion-input` NO tienen Shadow DOM accesible. Los `<input>` están en el Light DOM normal y son directamente accesibles mediante selectores CSS.

---

## 5. RIESGOS GENERALES DE AUTOMATIZACIÓN

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **IDs auto-generados** | `ion-input-0`, `ion-input-1` cambian | Usar placeholder o formcontrolname |
| **CSS classes dinámicas** | `ng-star-inserted`, `ng-untouched` | No depender de clases Angular |
| **Lazy loading** | Módulos cargados bajo demanda | Usar `waitForAngular()` |
| **AuthGuard** | Redirige si falta empresa/sucursal | Completar flujo de selección |
| **API 405** | `/auth/login` devuelve 405 con JSON | La app usa Angular HTTP, no fetch directo |
| **Transiciones lentas** | Navegación SPA sin indicador | Usar `waitForUrlToContain()` |
| **Sin data-testid** | No hay atributos de prueba dedicados | Usar placeholder y formcontrolname |
| **Sin botón confirmar empresa** | La selección es directa sobre `<tr>` | Hacer clic en la fila, no en el texto |

---

## 6. EVIDENCIAS CAPTURADAS

Las screenshots se encuentran en `screenshots/`:
- `*_01_login_page_*.png` — LoginPage con formulario visible
- `*_02_SeleccionEmpresa_*.png` — Página de selección de empresa
- `*_03_PostEmpresa_*.png` — Después de intentar seleccionar empresa

---

## 7. PRÓXIMOS PASOS RECOMENDADOS

1. Completar el flujo de selección de empresa (depurar API o interacción con `<tr>`)
2. Mapear SeleccionSucursalPage con la misma estructura
3. Explorar Dashboard y cada módulo del sidebar
4. Identificar DataTable, formularios CRUD, modales en cada módulo
5. Mapear APIs específicas de cada módulo
6. Generar Page Objects para los 9 módulos del sidebar
7. Implementar pruebas de regresión visual

---

## 8. ARQUITECTURA BACKEND — Motor de Asientos v2 🆕

> **Fuente:** `01-VISION.md` a `11-REVISION_COMPLETA.md`
> **Proyecto:** `restpe-contabilidad-back-end` (Java)
> **Estado:** Diseño — no implementado aún

### 8.1 Paradigma

```
MOTOR ACTUAL (v1 — legacy):           MOTOR NUEVO (v2 — diseño):
concepto_financiero                    evento + payload
  → matriz_contable (fija)               → regla_activacion (dinámica)
    → plan_contable_det (cuenta fija)      → componente_contable (rol)
      → asiento (2 líneas, mismo monto)      → regla_cuenta_componente (resolución)
                                                → asiento (N líneas, montos calculados)
```

### 8.2 Pipeline de 10 pasos

```
Evento + Payload → 1.RECIBIR → 2.EVALUAR REGLAS → 3.RESOLVER CUENTAS
→ 4.CALCULAR MONTOS → 5.ORDENAR → 6.VALIDAR → 7.PERSISTIR
→ 8.EFECTOS SECUNDARIOS → 9.EMITIR EVENTO → 10.EXPORTAR REPORTES
```

### 8.3 Mapeo Pantalla Frontend → Evento Backend

| Pantalla (Frontend) | Evento de Dominio (Motor v2) | Asientos |
|:---------------------|:-----------------------------|:---------|
| Gestión Proveedores | (maestro — no genera evento) | — |
| Generar OC | (intención — no genera evento) | — |
| Registro Comprobantes | `COMPRA_REGISTRADA` | 1 en diario compras |
| NC/ND x Pagar | `NC_COMPRA` | 1 (revierte original) |
| Punto de Venta | `VENTA_EMITIDA` | 1 en diario ventas |
| Cartera de Pagos | `PAGO_PROVEEDOR` | 1 en tesorería |
| Cartera de Cobros | `COBRO_REGISTRADO` | 1 en tesorería |
| Transferencias | `TRANSFERENCIA_INTERNA` | 1 en tesorería |
| Caja Chica | `APERTURA_CAJA_CHICA` / `GASTO_CAJA_CHICA` / `REPOSICION_CAJA_CHICA` | 1 c/u |
| Maestro Activos Fijos | `COMPRA_ACTIVO_FIJO` | 1 en AF |
| Cálculo Depreciación | `DEPRECIACION_MENSUAL` | 1 en AF |
| Baja de Activos | `BAJA_ACTIVO` / `VENTA_ACTIVO` | 1 en AF |
| Cálculo Planilla | `PLANILLA_DEVENGADA` | 1 en planillas |
| Pago Planilla | `PLANILLA_PAGADA` | 1 en tesorería |
| Liquidaciones | `sp_liquidar_beneficios` | 1 en planillas |
| Registro Facturas (Ventas) | `VENTA_EMITIDA` | 1 en diario ventas |

### 8.4 33 Eventos de Dominio (Catálogo Completo)

| # | Evento | Módulo | Asientos |
|---|--------|--------|----------|
| 1 | `COMPRA_REGISTRADA` | Compras | 1 |
| 2 | `COMPRA_CONTADO` | Compras | 1 |
| 3 | `NC_COMPRA` | Compras | 1 |
| 4 | `ANTICIPO_PROVEEDOR` | Compras | 1 |
| 5 | `APLICACION_ANTICIPO` | Compras | 1 |
| 6 | `VENTA_EMITIDA` | Ventas | 1 |
| 7 | `COBRO_REGISTRADO` | Ventas | 1 |
| 8 | `NOTA_CREDITO_EMITIDA` | Ventas | 1 |
| 9 | `NOTA_DEBITO_EMITIDA` | Ventas | 1 |
| 10 | `LIQUIDACION_AGREGADOR` | Ventas | 1 |
| 11 | `CONTRACARGO_RESUELTO` | Ventas | 1 |
| 12 | `ANTICIPO_CLIENTE` | Ventas | 1 |
| 13 | `APLICACION_ANTICIPO_CLIENTE` | Ventas | 1 |
| 14 | `PAGO_PROVEEDOR` | Tesorería | 1 |
| 15 | `PAGO_DETRACCION` | Tesorería | 1 |
| 16 | `TRANSFERENCIA_INTERNA` | Tesorería | 1 |
| 17 | `APERTURA_CAJA_CHICA` | Tesorería | 1 |
| 18 | `GASTO_CAJA_CHICA` | Tesorería | 1 |
| 19 | `REPOSICION_CAJA_CHICA` | Tesorería | 1 |
| 20 | `COMPRA_ACTIVO_FIJO` | Activos Fijos | 1 |
| 21 | `DEPRECIACION_MENSUAL` | Activos Fijos | 1 |
| 22 | `BAJA_ACTIVO` | Activos Fijos | 1 |
| 23 | `VENTA_ACTIVO` | Activos Fijos | 1 |
| 24 | `REVALUACION_ACTIVO` | Activos Fijos | 1 |
| 25 | `PLANILLA_DEVENGADA` | Planillas | 1 |
| 26 | `PLANILLA_PAGADA` | Planillas | 1 |
| 27 | `PROVISION_LABORAL` | Planillas | 1 |
| 28 | `COMPRA_INVENTARIO` | Inventario | **2** |
| 29 | `CONSUMO_PRODUCCION` | Inventario | 1 |
| 30 | `PRODUCCION_TERMINADA` | Inventario | 1 |
| 31 | `MERMA_REGISTRADA` | Inventario | 1 |
| 32 | `AJUSTE_INVENTARIO` | Inventario | 1 |
| 33 | `EXTORNO_ASIENTO` | Contabilidad | 1 |

### 8.5 56 Componentes Contables (Roles Atómicos)

| Tipo | Posición | Ejemplos |
|:-----|:---------|:---------|
| **contrapartida** | 1 (terceros) | PROVEEDOR, CLIENTE, BANCO, CAJA_VENTA, CAJA_CHICA |
| **ingreso** | 2 (base) | VENTA, VENTA_EXPORTACION, GANANCIA_VENTA_AF |
| **gasto** | 2 (base) | COMPRA, SUELDOS_GASTO, DEPRECIACION_GASTO, MERMA_NORMAL |
| **impuesto** | 3 (impuestos) | IVA, DETRACCION, PERCEPCION, RETENCION, ITF, GMF, ISD |
| **puente** | 4 (puente) | DESTINO_INVENTARIO, ONP_AFP_PAGAR, GRATIFICACION_PASIVO, GIFT_CARD |
| **ajuste** | 5 (ajuste) | DIF_CAMBIO, COMISION_BANCARIA, FALTANTE_CAJA |

### 8.6 Multi-País: Tasas y Planes Contables

| | Perú (PE) | Colombia (CO) | Ecuador (EC) |
|:--|:----------|:--------------|:-------------|
| **IVA** | 18% | 19% | 15% |
| **Plan Contable** | PCGE | PUC | SRI/NIIF |
| **Impuestos extra** | Detracción, Percepción, ITF, ICBPER | ReteFuente, ReteIVA, ReteICA, GMF, INC | ISD |
| **Autoridad** | SUNAT | DIAN | SRI |

### 8.7 Bases de Datos

| Recurso | Cantidad | Acción v2 |
|:--------|:---------|:----------|
| Tablas NUEVAS | 8 | `componente_contable`, `regla_activacion`, `regla_cuenta_componente`, `auditoria_asiento`, `posicion_fiscal`, `posicion_fiscal_regla`, `tasa_impuesto`, `configuracion_fiscal_pais` |
| Tablas ADAPTADAS | 12 | `plan_contable_det`, `cntbl_asiento`, `cntbl_asiento_det`, `cntbl_libro`, etc. (ALTER ADD COLUMN) |
| Tablas DEPRECADAS | 5 | `matriz_contable`, `matriz_contable_det`, `grupo_matriz_cntbl`, `grupo_contable`, `tipo_mov_matriz_subcat` (→ `_legacy`) |

### 8.8 Gaps Funcionales Detectados (CSVs Casos por Módulo)

| # | Gap | Módulo | Estado |
|---|-----|--------|--------|
| 1 | Pantalla de Caja Chica no existe | Finanzas | ❌ NO |
| 2 | Pago parcial de factura | Finanzas | ⚠️ PARCIAL |
| 3 | Pago mixto (efectivo + transferencia) | Finanzas | ⚠️ PARCIAL |
| 4 | Pago con tarjeta de crédito corporativa | Finanzas | ⚠️ PARCIAL |
| 5 | Anticipo a proveedor sin documento | Compras | ⚠️ PARCIAL |
| 6 | Registro de flete en factura | Compras | ⚠️ PARCIAL |
| 7 | Rendición con reembolso de exceso | Finanzas | ⚠️ PARCIAL |
| 8 | Venta mixta cobro/crédito | Ventas | ⚠️ PARCIAL |
| 9 | Factura con detracción del cliente | Ventas | ⚠️ PARCIAL |
| 10 | IGV prorrata (parcialmente recuperable) | Compras | ❌ NO |
| 11 | Compra centralizada multi-sucursal | Compras | ⚠️ PARCIAL |
| 12 | Gasto anticipado con devengo mensual | Compras | ❌ NO |
| 13 | Diferencia de cambio en pago ME | Tesorería | ❌ NO |
| 14 | Reposición de caja chica | Finanzas | ❌ NO |
| 15 | Importación con DAM/DUA | Compras | ❌ NO |

### 8.9 Admin APIs — Motor de Asientos v2 🆕

> **Fuente:** `10-GESTION_REGLAS.md` §7
> **Nota:** Estos endpoints no aparecen en `03-ARQUITECTURA.md`. Están documentados exclusivamente en `10-GESTION_REGLAS.md`.

#### Gestión de Componentes

| Método | Endpoint | Propósito |
|:-------|:---------|:----------|
| `GET` | `/api/admin/componentes` | Listar todos los componentes contables |
| `GET` | `/api/admin/componentes/{id}` | Detalle de un componente |
| `POST` | `/api/admin/componentes` | Crear nuevo componente (requiere backend) |
| `PUT` | `/api/admin/componentes/{id}` | Actualizar tipo, posición, dirección |
| `DELETE` | `/api/admin/componentes/{id}` | Desactivar (soft delete) |

#### Gestión de Reglas de Activación

| Método | Endpoint | Propósito |
|:-------|:---------|:----------|
| `GET` | `/api/admin/reglas-activacion?evento=VENTA_EMITIDA` | Listar reglas por evento |
| `POST` | `/api/admin/reglas-activacion` | Crear regla (evento, componente, condición JSONB, acción) |
| `PUT` | `/api/admin/reglas-activacion/{id}` | Actualizar condición, acción, orden |
| `DELETE` | `/api/admin/reglas-activacion/{id}` | Desactivar regla |
| `POST` | `/api/admin/reglas-activacion/validar` | Validar condición contra un payload de prueba |

#### Gestión de Reglas de Cuenta

| Método | Endpoint | Propósito |
|:-------|:---------|:----------|
| `GET` | `/api/admin/reglas-cuenta?componente=CLIENTE` | Listar reglas por componente |
| `POST` | `/api/admin/reglas-cuenta` | Crear regla (componente, filtros, prioridad, cuenta) |
| `PUT` | `/api/admin/reglas-cuenta/{id}` | Cambiar cuenta, prioridad, filtros |
| `DELETE` | `/api/admin/reglas-cuenta/{id}` | Desactivar regla |
| `POST` | `/api/admin/reglas-cuenta/simular` | Simular qué cuenta se resolvería para un contexto dado |

#### Simulación y Debugging

| Método | Endpoint | Propósito |
|:-------|:---------|:----------|
| `POST` | `/api/admin/asientos/simular` | Ejecuta pipeline hasta paso 6 (VALIDAR) sin persistir. Devuelve asiento borrador + trazabilidad. |
| `POST` | `/api/admin/asientos/trazar` | Igual que simular + detalle de cada decisión: "Componente X se activó por regla Y, condición Z → cuenta W" |
| `GET` | `/api/admin/asientos/{id}/trazabilidad` | Dado un asiento contabilizado, muestra la cadena de decisiones que lo generó |

#### Gestión de Países

| Método | Endpoint | Propósito |
|:-------|:---------|:----------|
| `GET` | `/api/admin/paises` | Listar países configurados |
| `POST` | `/api/admin/paises` | Agregar nuevo país |
| `GET` | `/api/admin/paises/{id}/configuracion` | Ver configuración fiscal del país |
| `GET` | `/api/admin/paises/{id}/cobertura` | Ver reglas, componentes y cuentas configurados para este país |

**Total: 22 endpoints de administración** (no listados en `03-ARQUITECTURA.md`).

### 8.10 Cadenas de Resolución de Cuentas por Componente 🆕

> **Fuente:** `08-REGLA_CUENTA.md` §2
> **Mecanismo:** Fallback progresivo — busca la cuenta más específica primero; si no encuentra, sube un nivel de generalidad.

#### Cadena genérica (aplica a todos los componentes)

```
1. Dato específico del partner/producto
   └── partner.cuenta_contable_id / producto_categoria.cuenta_default_id / cuenta_bancaria.cuenta_contable_id

2. regla_cuenta_componente con TODOS los filtros del contexto

3. Sacando filtros uno por uno (de más específico a menos):
   └── Sin concepto_financiero_id → Sin moneda_id → Sin clasificacion → Sin partner_tipo
   └── Sin producto_categoria_id → Sin tipo_transaccion → Solo pais_id + componente_id

4. Error: CUENTA_NO_CONFIGURADA (con sugerencia de INSERT en el mensaje)
```

#### Cálculo de montos por tipo de componente

| Tipo | Fórmula | Ejemplo (total=118, IVA=18%) |
|:-----|:--------|:------------------------------|
| `ingreso` / `gasto` | `base = total / (1 + tasa)` | VENTA: 118 / 1.18 = **100** |
| `impuesto` | `base × tasa` | IVA: 100 × 0.18 = **18** |
| `contrapartida` | `Σ(montos opuestos)` | CLIENTE: 100 + 18 = **118** |
| `puente` | `total × %` | DETRACCION: 118 × 0.10 = **11.80** |
| `ajuste` | `monto × (TC_nuevo − TC_original)` | DIF_CAMBIO: 1000 × (3.80−3.70) = **100** |

**Regla de redondeo:** `impuesto = total - base` (NO calcular por separado) para prevenir descuadres de S/0.01.

#### Ejemplos por país — COMPRA_REGISTRADA (servicio gravado, crédito)

| Componente | Perú (PCGE) | Colombia (PUC) | Ecuador (SRI) |
|:-----------|:------------|:---------------|:--------------|
| COMPRA | 63 Servicios | 6210 Servicios informática | 63 Servicios |
| IVA | 40111 IVA crédito fiscal | 240801 IVA descontable | 4011 IVA crédito fiscal |
| PROVEEDOR | 421 Facturas por pagar | 451 Proveedores | 421 Proveedores |
| Impuestos extra | — | ReteFuente (2365), ReteIVA (2367), ReteICA (2368) | ISD (63) |

#### Algoritmo SQL de resolución

```sql
SELECT rcc.cuenta_id
FROM regla_cuenta_componente rcc
WHERE rcc.componente_id = $componente_id
  AND (rcc.pais_id = $pais_id OR rcc.pais_id IS NULL)
  AND (rcc.tipo_transaccion = $tipo OR rcc.tipo_transaccion IS NULL)
  AND (rcc.producto_categoria_id = $cat_id OR rcc.producto_categoria_id IS NULL)
  AND (rcc.partner_tipo = $partner_tipo OR rcc.partner_tipo IS NULL)
  AND (rcc.clasificacion_operacion_id = $clasif OR rcc.clasificacion_operacion_id IS NULL)
  AND (rcc.concepto_financiero_id = $concepto OR rcc.concepto_financiero_id IS NULL)
  AND (rcc.moneda_id IS NULL OR rcc.moneda_id = $moneda_id)
  AND rcc.activo = true
ORDER BY rcc.prioridad DESC
LIMIT 1;
```

#### Errores posibles

| Error | Causa | Mensaje incluye |
|:------|:------|:----------------|
| `CUENTA_NO_CONFIGURADA` | Ninguna regla matchea | Sugerencia: `INSERT INTO regla_cuenta_componente (...)` |
| `CUENTA_INACTIVA` | Cuenta no está activa | ID y nombre de la cuenta inactiva |
| `CUENTA_SIN_MOVIMIENTO` | Cuenta no es imputable (es de agrupación) | ID y nombre de la cuenta |

### 8.11 Modelo Operativo del Motor 🆕

> **Fuente:** `10-GESTION_REGLAS.md` §1, §2, §4, §10

#### Roles y responsabilidades

| Rol | Qué hace | Cómo |
|:----|:---------|:-----|
| **Contador / Configurador** | Define cuentas, activa/desactiva componentes y reglas | Admin web → tablas `regla_cuenta_componente`, `regla_activacion` |
| **Arquitecto / Backend** | Crea nuevos componentes, define tipos y cálculos | Código + SQL → tabla `componente_contable` |
| **Product Owner** | Decide qué eventos genera el negocio | Define contratos de eventos |
| **Soporte / QA** | Debuguea por qué un asiento falla | Endpoint de simulación + logs |

#### Lo que NO requiere deploy (90% de cambios diarios)

| Acción | ¿Sin backend? |
|:-------|:-------------:|
| Crear cuenta contable nueva | ✅ `INSERT INTO plan_contable_det` |
| Cambiar cuenta de un componente | ✅ `UPDATE regla_cuenta_componente` |
| Activar/desactivar un componente | ✅ `UPDATE regla_activacion SET activo` |
| Agregar regla de activación nueva | ✅ `INSERT INTO regla_activacion` |
| Agregar regla de cuenta nueva | ✅ `INSERT INTO regla_cuenta_componente` |
| Cambiar tasa de impuesto | ✅ `UPDATE tasa_impuesto` |
| Agregar nuevo país (con datos fiscales) | ✅ (~3-5 días hábiles) |
| **Crear componente nuevo** | ❌ Requiere backend (una vez + documentación) |
| **Modificar el pipeline** (pasos 1-10) | ❌ Siempre requiere backend |
| **Agregar nuevo evento** (cambiar contrato) | ❌ Requiere backend (una vez + documentación) |

#### Guía de debugging para QA

**Problema: "El asiento no genera líneas de IVA"**
1. Verificar que el componente IVA existe: `SELECT * FROM componente_contable WHERE codigo = 'IVA'`
2. Verificar regla de activación: `SELECT * FROM regla_activacion WHERE evento = 'VENTA_EMITIDA' AND componente_id = (SELECT id FROM componente_contable WHERE codigo = 'IVA')`
3. Verificar que la condición matchea: `condicion = {"afecta_iva": true}` vs payload real
4. Verificar regla de cuenta: `SELECT * FROM regla_cuenta_componente WHERE componente_id = ...`
5. Verificar cuenta activa e imputable: `SELECT * FROM plan_contable_det WHERE id = $cuenta_id AND activo = true AND es_imputable = true`

**Problema: "La cuenta resuelta no es la esperada"**
1. Verificar si el partner tiene cuenta específica: `partner.cuenta_contable_id`
2. Verificar categoría de producto: `producto_categoria.cuenta_default_id`
3. Consultar reglas ordenadas por prioridad: `SELECT * FROM regla_cuenta_componente ... ORDER BY prioridad DESC`
4. Usar endpoint de simulación: `POST /api/admin/asientos/simular` → devuelve trazabilidad completa
