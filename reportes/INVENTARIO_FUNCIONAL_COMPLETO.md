# INVENTARIO FUNCIONAL COMPLETO
## RestaurantPE Contabilidad — Automatización

> **Fecha:** 17/06/2026
> **App:** Angular/Ionic SPA
> **Dominio:** panel.dev.contabilidad.restaurant.pe

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
