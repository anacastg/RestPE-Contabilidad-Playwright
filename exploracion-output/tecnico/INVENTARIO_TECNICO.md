# INVENTARIO TÉCNICO PARA AUTOMATIZACIÓN — RestPE Contabilidad

> **Fecha:** 2026-07-04
> **Pantallas analizadas:** 24

---

## Resumen por Pantalla

| Pantalla | Campos | Botones | Tabs | Grid Cols | Grid Rows | Mensajes |
|:---------|:------:|:-------:|:----:|:---------:|:---------:|:--------:|
| GestionProveedores | 11 | 2 | 3 | 11 | 11 | 0 |
| GenerarOC | 15 | 5 | 0 | 15 | 4 | 0 |
| AprobarOC | 17 | 1 | 0 | 13 | 2 | 0 |
| RegistroComprobantes | 9 | 7 | 4 | 20 | 19 | 0 |
| GestionCompras | 12 | 0 | 0 | 13 | 0 | 0 |
| TiposDocumento | 5 | 2 | 0 | 5 | 20 | 0 |
| ConceptosFinancieros | 6 | 2 | 0 | 5 | 20 | 0 |
| CarteraPagos | 3 | 1 | 2 | 8 | 1 | 0 |
| CarteraCobros | 17 | 2 | 0 | 10 | 0 | 0 |
| CuentaBancaria | 15 | 2 | 0 | 9 | 20 | 0 |
| OrdenesGiro | 12 | 5 | 0 | 8 | 7 | 0 |
| RendicionGastos | 15 | 5 | 0 | 11 | 0 | 0 |
| PlanContable | 5 | 4 | 4 | 3 | 1 | 0 |
| CentrosCosto | 10 | 4 | 0 | 8 | 20 | 0 |
| TipoCambio | 8 | 4 | 0 | 6 | 20 | 0 |
| MaestroAF | 16 | 2 | 8 | 7 | 11 | 0 |
| OperacionesTabla | 11 | 2 | 0 | 6 | 8 | 0 |
| VentaActivos | 8 | 4 | 3 | 6 | 5 | 0 |
| CalculoDepreciacion | 8 | 3 | 0 | 8 | 4 | 0 |
| DatosPersonales | 19 | 3 | 3 | 11 | 20 | 0 |
| Cargos | 9 | 4 | 0 | 7 | 1 | 0 |
| TipoContrato | 4 | 2 | 0 | 3 | 6 | 0 |
| CalculoPlanilla | 4 | 6 | 0 | 9 | 0 | 0 |
| RegistrarLiquidacion | 18 | 3 | 0 | 7 | 0 | 0 |

---

## INVENTARIO DE CAMPOS

### Compras > GestionProveedores

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar proveedor código o por razón social | ❌ | ❌ | ❌ | `input[placeholder="Buscar proveedor código o por razón social"]` | MEDIA |
| ion-input | `tipoIdentificacion` |  | text |  | ✅ | ✅ | ❌ | `ion-input[formcontrolname="tipoIdentificacion"] input` | ALTA |
| ion-input | `identfiscal` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="identfiscal"] input` | ALTA |
| ion-input | `razonSocial` |  | text | Proveedor ejemplo S.A.C | ❌ | ❌ | ❌ | `ion-input[formcontrolname="razonSocial"] input` | ALTA |
| ion-input | `nombreComercial` |  | text | Proveedor ejemplo | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombreComercial"] input` | ALTA |
| ion-input | `direccionFiscal` |  | text | Ingresar dirección fiscal | ❌ | ❌ | ❌ | `ion-input[formcontrolname="direccionFiscal"] input` | ALTA |
| ion-input | `email` |  | email | Ingresa un correo electrónico | ❌ | ❌ | ❌ | `ion-input[formcontrolname="email"] input` | ALTA |
| ion-input | `telefono` |  | text | Ingresa un número | ❌ | ❌ | ❌ | `ion-input[formcontrolname="telefono"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(9)` | BAJA |
| ion-select | `estado` | Activo | undefined | Activo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |
| ion-select | `proveedor` | Nacional | undefined | Nacional | ❌ | ❌ | ❌ | `ion-select[formcontrolname="proveedor"]` | ALTA |

### Compras > GenerarOC

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por n° de orden de compra o proveedor | ❌ | ❌ | ❌ | `input[placeholder="Buscar por n° de orden de compra o proveedor"]` | MEDIA |
| ion-input | `documentoproveedorinput` |  | text | Ingrese documento | ❌ | ❌ | ❌ | `ion-input[formcontrolname="documentoproveedorinput"] input` | ALTA |
| ion-input | `proveedor` |  | text | Proveeedor Ejemplo | ✅ | ❌ | ❌ | `ion-input[formcontrolname="proveedor"] input` | ALTA |
| ion-input | `fechaRegistro` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaRegistro"] input` | ALTA |
| ion-input | `null` |  | text | Seleccionar almacén | ❌ | ❌ | ❌ | `input[placeholder="Seleccionar almacén"]` | MEDIA |
| ion-input | `null` |  | text | Buscar sucursal... | ❌ | ❌ | ❌ | `input[placeholder="Buscar sucursal..."]` | MEDIA |
| ion-input | `direccionEntrega` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="direccionEntrega"] input` | ALTA |
| ion-input | `null` |  | text | Buscar centro de costos | ❌ | ❌ | ❌ | `input[placeholder="Buscar centro de costos"]` | MEDIA |
| ion-input | `tipoCambio` |  | text |  | ✅ | ✅ | ❌ | `ion-input[formcontrolname="tipoCambio"] input` | ALTA |
| ion-input | `estado` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="estado"] input` | ALTA |
| ion-input | `null` |  | text | Buscar producto por nombre o código... | ❌ | ❌ | ❌ | `input[placeholder="Buscar producto por nombre o código..."]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(12)` | BAJA |
| ion-select | `null` | De registro | undefined | De registro | ❌ | ❌ | ❌ | `ion-select:nth-child(13)` | BAJA |
| ion-select | `moneda` | Selecciona una moneda | undefined | Selecciona una moneda | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |
| ion-textarea | `observaciones` | undefined | undefined | Agregar notas adicionales | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="observaciones"] textarea` | ALTA |

### Compras > AprobarOC

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar órdenes de compra | ❌ | ❌ | ❌ | `input[placeholder="Buscar órdenes de compra"]` | MEDIA |
| ion-input | `documentoproveedorinput` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="documentoproveedorinput"] input` | ALTA |
| ion-input | `proveedor` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="proveedor"] input` | ALTA |
| ion-input | `direccionFiscal` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="direccionFiscal"] input` | ALTA |
| ion-input | `almacen` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="almacen"] input` | ALTA |
| ion-input | `centroCosto` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="centroCosto"] input` | ALTA |
| ion-input | `fechaRegistro` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaRegistro"] input` | ALTA |
| ion-input | `fechaEntrega` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaEntrega"] input` | ALTA |
| ion-input | `direccionEntrega` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="direccionEntrega"] input` | ALTA |
| ion-input | `moneda` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="moneda"] input` | ALTA |
| ion-input | `tipoCambio` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="tipoCambio"] input` | ALTA |
| ion-input | `condicionPago` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="condicionPago"] input` | ALTA |
| ion-input | `estado` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="estado"] input` | ALTA |
| ion-input | `null` |  | text | Buscar producto por nombre o código... | ✅ | ❌ | ❌ | `input[placeholder="Buscar producto por nombre o código..."]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(15)` | BAJA |
| ion-select | `null` | De registro | undefined | De registro | ❌ | ❌ | ❌ | `ion-select:nth-child(16)` | BAJA |
| ion-textarea | `null` | undefined | undefined | Observaciones | ❌ | ❌ | ❌ | `` | BAJA |

### Compras > RegistroComprobantes

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar facturas de proveedores | ❌ | ❌ | ❌ | `input[placeholder="Buscar facturas de proveedores"]` | MEDIA |
| ion-input | `serie` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="serie"] input` | ALTA |
| ion-input | `numero` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="numero"] input` | ALTA |
| ion-input | `documentoproveedorinput` |  | number |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="documentoproveedorinput"] input` | ALTA |
| ion-input | `proveedor` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="proveedor"] input` | ALTA |
| ion-input | `null` |  | text | Buscar el producto o servicio por nombre o código | ❌ | ❌ | ❌ | `input[placeholder="Buscar el producto o servicio por nombre o código"]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(7)` | BAJA |
| ion-select | `null` | De emisión | undefined | De registro | ❌ | ❌ | ❌ | `ion-select:nth-child(8)` | BAJA |
| ion-select | `moneda` | Soles | undefined |  | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |

### Compras > GestionCompras

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por n° de orden, Nombre del producto o razón social | ❌ | ❌ | ❌ | `input[placeholder="Buscar por n° de orden, Nombre del producto o razón social"]` | MEDIA |
| ion-input | `nombreProducto` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="nombreProducto"] input` | ALTA |
| ion-input | `precioPorUnidad` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="precioPorUnidad"] input` | ALTA |
| ion-input | `diasCredito` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="diasCredito"] input` | ALTA |
| ion-input | `fechaVencimiento` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaVencimiento"] input` | ALTA |
| ion-input | `razonSoc` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="razonSoc"] input` | ALTA |
| ion-input | `moneda` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="moneda"] input` | ALTA |
| ion-input | `sucursalAlmacen` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="sucursalAlmacen"] input` | ALTA |
| ion-input | `estadoPago` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="estadoPago"] input` | ALTA |
| ion-input | `null` |  | text | Buscar producto | ❌ | ❌ | ❌ | `input[placeholder="Buscar producto"]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(11)` | BAJA |
| ion-textarea | `null` | undefined | undefined | Observaciones | ❌ | ❌ | ❌ | `` | BAJA |

### Finanzas > TiposDocumento

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o nombre | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o nombre"]` | MEDIA |
| ion-input | `nombreD` |  | text | Ingrese un nombre | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombreD"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(3)` | BAJA |
| ion-select | `sunatCodigo` | Selecciona un tipo de documento | undefined | Selecciona un tipo de documento | ❌ | ❌ | ❌ | `ion-select[formcontrolname="sunatCodigo"]` | ALTA |
| ion-select | `estado` | Activo | undefined | Activo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |

### Finanzas > ConceptosFinancieros

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o nombre | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o nombre"]` | MEDIA |
| ion-input | `fechaCreacion` |  | text |  | ✅ | ✅ | ❌ | `ion-input[formcontrolname="fechaCreacion"] input` | ALTA |
| ion-input | `nombre` |  | text | Ingresar un nombre | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombre"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(4)` | BAJA |
| ion-select | `matrizContableId` | Selecciona una matriz contable | undefined | Selecciona una matriz contable | ❌ | ❌ | ❌ | `ion-select[formcontrolname="matrizContableId"]` | ALTA |
| ion-select | `flagEstado` | Activo | undefined | Seleccionar | ❌ | ❌ | ❌ | `ion-select[formcontrolname="flagEstado"]` | ALTA |

### Finanzas > CarteraPagos

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código"]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(2)` | BAJA |
| ion-textarea | `observaciones` | undefined | undefined | Ingresa aquí tus observaciones | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="observaciones"] textarea` | ALTA |

### Finanzas > CarteraCobros

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por cliente o tipo de documento | ❌ | ❌ | ❌ | `input[placeholder="Buscar por cliente o tipo de documento"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona un cliente | ❌ | ❌ | ❌ | `input[placeholder="Selecciona un cliente"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona tipo | ❌ | ❌ | ❌ | `input[placeholder="Selecciona tipo"]` | MEDIA |
| ion-input | `null` |  | text | Busca cuenta por cobrar | ❌ | ❌ | ❌ | `input[placeholder="Busca cuenta por cobrar"]` | MEDIA |
| ion-input | `fechaEmision` |  | date |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="fechaEmision"] input` | ALTA |
| ion-input | `fechaVencimiento` |  | date |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="fechaVencimiento"] input` | ALTA |
| ion-input | `tipoCambio` |  | text | S/ 3.40 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="tipoCambio"] input` | ALTA |
| ion-input | `montoTotal` |  | text | S/ 1,500.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="montoTotal"] input` | ALTA |
| ion-input | `montoTotal` |  | text | S/ 1,500.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="montoTotal"] input` | ALTA |
| ion-input | `null` |  | text | La Molina, Lima | ❌ | ❌ | ❌ | `input[placeholder="La Molina, Lima"]` | MEDIA |
| ion-input | `asientoContable` |  | text | ASC-2025-000148 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="asientoContable"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(12)` | BAJA |
| ion-select | `null` | De emisión | undefined | De emisión | ❌ | ❌ | ❌ | `ion-select:nth-child(13)` | BAJA |
| ion-select | `moneda` | Soles (S/) | undefined | Soles (S/) | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |
| ion-select | `estado` | Pendiente | undefined | Pendiente | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |
| ion-checkbox | `null` |  | undefined | undefined | ❌ | ❌ | ❌ | `` | BAJA |
| ion-textarea | `observacion` | undefined | undefined | Escribe aquí... | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="observacion"] textarea` | ALTA |

### Finanzas > CuentaBancaria

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar cuenta bancaria por número de cuenta, CCI o razón social. | ❌ | ❌ | ❌ | `input[placeholder="Buscar cuenta bancaria por número de cuenta, CCI o razón social."]` | MEDIA |
| ion-input | `fechaCreacion` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaCreacion"] input` | ALTA |
| ion-input | `codigo` |  | text | Ej: CTA-001 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="codigo"] input` | ALTA |
| ion-input | `numeroCuenta` |  | text | 00000000000000 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="numeroCuenta"] input` | ALTA |
| ion-input | `cci` |  | text | 00000000000000000 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="cci"] input` | ALTA |
| ion-input | `saldoContable` |  | number | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="saldoContable"] input` | ALTA |
| ion-input | `null` |  | text | Selecciona cuenta contable | ❌ | ❌ | ❌ | `input[placeholder="Selecciona cuenta contable"]` | MEDIA |
| ion-input | `correlativoCheque` |  | number | 0 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="correlativoCheque"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(9)` | BAJA |
| ion-select | `bancoId` | Selecciona un banco | undefined | Selecciona un banco | ❌ | ❌ | ❌ | `ion-select[formcontrolname="bancoId"]` | ALTA |
| ion-select | `tipoCuenta` | Selecciona un tipo de cuenta | undefined | Selecciona un tipo de cuenta | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoCuenta"]` | ALTA |
| ion-select | `moneda` | Selecciona una moneda | undefined | Selecciona una moneda | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |
| ion-select | `sucursalId` | Selecciona una sucursal | undefined | Selecciona una sucursal | ❌ | ❌ | ❌ | `ion-select[formcontrolname="sucursalId"]` | ALTA |
| ion-select | `estado` | Activo | undefined | Seleccionar | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |
| ion-textarea | `descripcion` | undefined | undefined | Descripción de la cuenta | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="descripcion"] textarea` | ALTA |

### Finanzas > OrdenesGiro

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por número, monto, motivo o estado | ❌ | ❌ | ❌ | `input[placeholder="Buscar por número, monto, motivo o estado"]` | MEDIA |
| ion-input | `null` |  | text | Buscar OC aprobada | ❌ | ❌ | ❌ | `input[placeholder="Buscar OC aprobada"]` | MEDIA |
| ion-input | `referenciaSolicitudAdelanto` |  | text | Se autollena desde la OC | ✅ | ✅ | ❌ | `ion-input[formcontrolname="referenciaSolicitudAdelanto"] input` | ALTA |
| ion-input | `fecha` |  | date |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="fecha"] input` | ALTA |
| ion-input | `null` |  | text | Buscar sucursal | ❌ | ❌ | ❌ | `input[placeholder="Buscar sucursal"]` | MEDIA |
| ion-input | `estado` |  | text |  | ✅ | ✅ | ❌ | `ion-input[formcontrolname="estado"] input` | ALTA |
| ion-input | `null` |  | text | Buscar centro de costo | ❌ | ❌ | ❌ | `input[placeholder="Buscar centro de costo"]` | MEDIA |
| ion-input | `monto` |  | number | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="monto"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(9)` | BAJA |
| ion-select | `null` | Todos los estados | undefined | Estado | ❌ | ❌ | ❌ | `ion-select:nth-child(10)` | BAJA |
| ion-select | `tipoSolicitud` | Orden de Giro | undefined | Selecciona un tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoSolicitud"]` | ALTA |
| ion-textarea | `motivo` | undefined | undefined | Escribe aquí... | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="motivo"] textarea` | ALTA |

### Finanzas > RendicionGastos

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por N° liquidación, importe o estado | ❌ | ❌ | ❌ | `input[placeholder="Buscar por N° liquidación, importe o estado"]` | MEDIA |
| ion-input | `fechaLiquidacion` |  | date |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="fechaLiquidacion"] input` | ALTA |
| ion-input | `tasaCambio` |  | number |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="tasaCambio"] input` | ALTA |
| ion-input | `null` |  | text |  | ❌ | ✅ | ❌ | `ion-input:nth-child(4) input` | BAJA |
| ion-input | `estado` |  | text |  | ✅ | ✅ | ❌ | `ion-input[formcontrolname="estado"] input` | ALTA |
| ion-input | `null` | Concepto | number | Importe | ❌ | ❌ | ❌ | `input[placeholder="Importe"]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(7)` | BAJA |
| ion-select | `solicitudGiroId` | Selecciona una solicitud aprobada | undefined | Selecciona una solicitud aprobada | ❌ | ❌ | ❌ | `ion-select[formcontrolname="solicitudGiroId"]` | ALTA |
| ion-select | `tipoAdelanto` | Colaborador | undefined | Selecciona el tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoAdelanto"]` | ALTA |
| ion-select | `conceptoFinancieroId` | Selecciona un concepto | undefined | Selecciona un concepto | ❌ | ❌ | ❌ | `ion-select[formcontrolname="conceptoFinancieroId"]` | ALTA |
| ion-select | `monedaId` | Selecciona moneda | undefined | Selecciona moneda | ❌ | ❌ | ❌ | `ion-select[formcontrolname="monedaId"]` | ALTA |
| ion-select | `cntblLibroId` | Selecciona el libro contable | undefined | Selecciona el libro contable | ❌ | ❌ | ❌ | `ion-select[formcontrolname="cntblLibroId"]` | ALTA |
| ion-select | `null` | Concepto | undefined | Concepto | ❌ | ❌ | ❌ | `ion-select:nth-child(13)` | BAJA |
| ion-select | `null` | Concepto | undefined | Cuenta por pagar | ❌ | ❌ | ❌ | `ion-select:nth-child(14)` | BAJA |
| ion-textarea | `observacion` | undefined | undefined | Escribe aquí... | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="observacion"] textarea` | ALTA |

### Contabilidad > PlanContable

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o nombre | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o nombre"]` | MEDIA |
| ion-input | `codigo` |  | number | Ingresar cuenta contable | ❌ | ❌ | ❌ | `ion-input[formcontrolname="codigo"] input` | ALTA |
| ion-input | `nombreD` |  | text | Ingresar nombre o descripción | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombreD"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(4)` | BAJA |
| ion-select | `nivel` | 01 | undefined | 01 | ❌ | ❌ | ❌ | `ion-select[formcontrolname="nivel"]` | ALTA |

### Contabilidad > CentrosCosto

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código, nombre o usuario que registra | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código, nombre o usuario que registra"]` | MEDIA |
| ion-input | `fechaC` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaC"] input` | ALTA |
| ion-input | `nombre` |  | text | Ingresa un nombre | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombre"] input` | ALTA |
| ion-input | `null` |  | text | Selecciona una cuenta | ❌ | ❌ | ❌ | `input[placeholder="Selecciona una cuenta"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona una cuenta | ❌ | ❌ | ❌ | `input[placeholder="Selecciona una cuenta"]` | MEDIA |
| ion-input | `factor` |  | number |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="factor"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(7)` | BAJA |
| ion-select | `clasificacion` | Selecciona una Tipo | undefined | Selecciona una Tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="clasificacion"]` | ALTA |
| ion-select | `estado` | Activo | undefined | Selecciona un estado | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |
| ion-textarea | `descripcion` | undefined | undefined | null | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="descripcion"] textarea` | ALTA |

### Contabilidad > TipoCambio

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por moneda, fecha, monto o estado | ❌ | ❌ | ❌ | `input[placeholder="Buscar por moneda, fecha, monto o estado"]` | MEDIA |
| ion-input | `fechaCreacion` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaCreacion"] input` | ALTA |
| ion-input | `tcCompra` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="tcCompra"] input` | ALTA |
| ion-input | `tcVenta` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="tcVenta"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(5)` | BAJA |
| ion-select | `moneda` | Selecciona una moneda | undefined | Selecciona una moneda | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |
| ion-select | `fuente` | Selecciona una fuente | undefined | Selecciona una fuente | ❌ | ❌ | ❌ | `ion-select[formcontrolname="fuente"]` | ALTA |
| ion-select | `estado` | Activo | undefined | Activo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |

### ActivosFijos > MaestroAF

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o descripción | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o descripción"]` | MEDIA |
| ion-input | `nombreActivo` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombreActivo"] input` | ALTA |
| ion-input | `null` |  | text | Selecciona una clasificación | ❌ | ❌ | ❌ | `input[placeholder="Selecciona una clasificación"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona una subclasificación | ❌ | ❌ | ❌ | `input[placeholder="Selecciona una subclasificación"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona una sub clasificación | ❌ | ❌ | ❌ | `input[placeholder="Selecciona una sub clasificación"]` | MEDIA |
| ion-input | `marcaModelo` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="marcaModelo"] input` | ALTA |
| ion-input | `null` |  | text | Selecciona un proveedor | ❌ | ❌ | ❌ | `input[placeholder="Selecciona un proveedor"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona un documento | ❌ | ❌ | ❌ | `input[placeholder="Selecciona un documento"]` | MEDIA |
| ion-input | `tasadecambio` |  | text |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="tasadecambio"] input` | ALTA |
| ion-input | `valorAdquisicion` |  | number |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="valorAdquisicion"] input` | ALTA |
| ion-input | `valorSoles` |  | number |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="valorSoles"] input` | ALTA |
| ion-input | `valorDolares` |  | number |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="valorDolares"] input` | ALTA |
| ion-input | `vidaUtil` |  | number |  | ❌ | ❌ | ❌ | `ion-input[formcontrolname="vidaUtil"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(14)` | BAJA |
| ion-select | `moneda` | Soles | undefined | Selecciona moneda | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |
| ion-select | `estado` | Activo | undefined | Activo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |

### ActivosFijos > OperacionesTabla

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o descripción | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o descripción"]` | MEDIA |
| ion-input | `null` |  | text | Buscar cuenta contable | ❌ | ❌ | ❌ | `input[placeholder="Buscar cuenta contable"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona centro de costo | ❌ | ❌ | ❌ | `input[placeholder="Selecciona centro de costo"]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(4)` | BAJA |
| ion-select | `naturaleza` | Aumento | undefined | Aumento | ❌ | ❌ | ❌ | `ion-select[formcontrolname="naturaleza"]` | ALTA |
| ion-select | `tipoCalculo` | Depreciación | undefined | Depreciación | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoCalculo"]` | ALTA |
| ion-select | `metodoCalculo` | Seleccione método | undefined | Seleccione método | ❌ | ❌ | ❌ | `ion-select[formcontrolname="metodoCalculo"]` | ALTA |
| ion-select | `estado` | Activo | undefined | Activo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |
| ion-checkbox | `afectaContabilidad` |  | undefined | undefined | ❌ | ❌ | ❌ | `ion-checkbox[formcontrolname="afectaContabilidad"]` | ALTA |
| ion-textarea | `descripcion` | undefined | undefined | null | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="descripcion"] textarea` | ALTA |
| ion-textarea | `observaciones` | undefined | undefined | null | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="observaciones"] textarea` | ALTA |

### ActivosFijos > VentaActivos

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código de baja, código o nombre de activo | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código de baja, código o nombre de activo"]` | MEDIA |
| ion-input | `null` |  | text | Buscar cuenta contable... | ❌ | ❌ | ❌ | `input[placeholder="Buscar cuenta contable..."]` | MEDIA |
| ion-input | `estado` |  | text | En proceso | ✅ | ❌ | ❌ | `ion-input[formcontrolname="estado"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(4)` | BAJA |
| ion-select | `tipoDebaja` | Obsolescencia | undefined | null | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoDebaja"]` | ALTA |
| ion-select | `motivoObsolescencia` | Tecnológica | undefined | null | ❌ | ❌ | ❌ | `ion-select[formcontrolname="motivoObsolescencia"]` | ALTA |
| ion-select | `moneda` | Soles | undefined | null | ❌ | ❌ | ❌ | `ion-select[formcontrolname="moneda"]` | ALTA |
| ion-textarea | `descripcionObsolescencia` | undefined | undefined | null | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="descripcionObsolescencia"] textarea` | ALTA |

### ActivosFijos > CalculoDepreciacion

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o usuario | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o usuario"]` | MEDIA |
| ion-input | `fechaE` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaE"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(3)` | BAJA |
| ion-select | `tipoC` | Mensual | undefined | Selecciona un tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoC"]` | ALTA |
| ion-select | `tipoD` | Selecciona un tipo | undefined | Selecciona un tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoD"]` | ALTA |
| ion-select | `metodoC` | Selecciona un método | undefined | Selecciona un método | ❌ | ❌ | ❌ | `ion-select[formcontrolname="metodoC"]` | ALTA |
| ion-checkbox | `incluirAR` |  | undefined | undefined | ❌ | ❌ | ❌ | `ion-checkbox[formcontrolname="incluirAR"]` | ALTA |
| ion-checkbox | `incluirAM` |  | undefined | undefined | ❌ | ❌ | ❌ | `ion-checkbox[formcontrolname="incluirAM"]` | ALTA |

### RRHH > DatosPersonales

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código o nombre de empleado | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código o nombre de empleado"]` | MEDIA |
| ion-input | `empleado_documento` |  | text | Ingrese documento | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_documento"] input` | ALTA |
| ion-input | `empleado_nombres_apellidos` |  | text | Ingrese nombres y apellidos | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_nombres_apellidos"] input` | ALTA |
| ion-input | `empleado_direccion` |  | text | Ingrese dirección | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_direccion"] input` | ALTA |
| ion-input | `empleado_celular1` |  | text | Ingrese celular principal | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_celular1"] input` | ALTA |
| ion-input | `empleado_celular2` |  | text | Ingrese celular alterno | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_celular2"] input` | ALTA |
| ion-input | `empleado_telefono_fijo` |  | text | Ingrese teléfono fijo | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_telefono_fijo"] input` | ALTA |
| ion-input | `empleado_codigo_tel_ciudad` |  | text | Ej. 043 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_codigo_tel_ciudad"] input` | ALTA |
| ion-input | `empleado_correo_privado` |  | text | Ingrese correo | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_correo_privado"] input` | ALTA |
| ion-input | `empleado_contacto_emergencia_nombre` |  | text | Ingrese nombre de contacto | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_contacto_emergencia_nombre"] input` | ALTA |
| ion-input | `empleado_contacto_emergencia_telefono` |  | number | Ingrese teléfono | ❌ | ❌ | ❌ | `ion-input[formcontrolname="empleado_contacto_emergencia_telefono"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(12)` | BAJA |
| ion-select | `empleado_tipo_documento` |  | undefined |  | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_tipo_documento"]` | ALTA |
| ion-select | `empleado_sexo` | Seleccione sexo | undefined | Seleccione sexo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_sexo"]` | ALTA |
| ion-select | `empleado_nacionalidad` | Seleccione una nacionalidad | undefined | Seleccione una nacionalidad | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_nacionalidad"]` | ALTA |
| ion-select | `empleado_pais` | Seleccione un país | undefined | Seleccione un país | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_pais"]` | ALTA |
| ion-select | `empleado_departamento` | Seleccione un departamento | undefined | Seleccione un departamento | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_departamento"]` | ALTA |
| ion-select | `empleado_provincia` | Seleccione una provincia | undefined | Seleccione una provincia | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_provincia"]` | ALTA |
| ion-select | `empleado_distrito` | Seleccione un distrito | undefined | Seleccione un distrito | ❌ | ❌ | ❌ | `ion-select[formcontrolname="empleado_distrito"]` | ALTA |

### RRHH > Cargos

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar cargos por código o descripción | ❌ | ❌ | ❌ | `input[placeholder="Buscar cargos por código o descripción"]` | MEDIA |
| ion-input | `fechaCreacion` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="fechaCreacion"] input` | ALTA |
| ion-input | `nombres` |  | text | Ingresa un nombre | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombres"] input` | ALTA |
| ion-input | `SalarialMin` |  | number | Ingresa un monto | ❌ | ❌ | ❌ | `ion-input[formcontrolname="SalarialMin"] input` | ALTA |
| ion-input | `SalarialProm` |  | number | Ingresa un monto | ❌ | ❌ | ❌ | `ion-input[formcontrolname="SalarialProm"] input` | ALTA |
| ion-input | `SalarialMax` |  | number | Ingresa un monto | ❌ | ❌ | ❌ | `ion-input[formcontrolname="SalarialMax"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(7)` | BAJA |
| ion-select | `cargo_nivel` | Selecciona un nivel | undefined | Selecciona un nivel | ❌ | ❌ | ❌ | `ion-select[formcontrolname="cargo_nivel"]` | ALTA |
| ion-select | `cargo_estado` | Activo | undefined | Selecciona un estado | ❌ | ❌ | ❌ | `ion-select[formcontrolname="cargo_estado"]` | ALTA |

### RRHH > TipoContrato

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código"]` | MEDIA |
| ion-input | `nombre` |  | text | Ingrese un nombre | ❌ | ❌ | ❌ | `ion-input[formcontrolname="nombre"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(3)` | BAJA |
| ion-select | `estado` | Activo | undefined | null | ❌ | ❌ | ❌ | `ion-select[formcontrolname="estado"]` | ALTA |

### RRHH > CalculoPlanilla

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar configuraciones por código o nombre | ❌ | ❌ | ❌ | `input[placeholder="Buscar configuraciones por código o nombre"]` | MEDIA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(2)` | BAJA |
| ion-select | `tipoPlanilla` | Selecciona un tipo | undefined | Selecciona un tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="tipoPlanilla"]` | ALTA |
| ion-select | `periodicidadPago` | Selecciona una periodicidad | undefined | Selecciona una periodicidad | ❌ | ❌ | ❌ | `ion-select[formcontrolname="periodicidadPago"]` | ALTA |

### RRHH > RegistrarLiquidacion

| Tag | formControlName | Label | Type | Placeholder | Disabled | Readonly | Required | Selector | Estabilidad |
|:----|:----------------|:------|:-----|:------------|:--------:|:--------:|:--------:|:---------|:----------:|
| ion-input | `null` |  | text | Buscar por código | ❌ | ❌ | ❌ | `input[placeholder="Buscar por código"]` | MEDIA |
| ion-input | `null` |  | text | Selecciona un trabajador | ❌ | ❌ | ❌ | `input[placeholder="Selecciona un trabajador"]` | MEDIA |
| ion-input | `liquidacion_sueldo_basico` |  | text | 0.00 | ✅ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_sueldo_basico"] input` | ALTA |
| ion-input | `liquidacion_asignacion_familiar` |  | text | 0.00 | ✅ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_asignacion_familiar"] input` | ALTA |
| ion-input | `liquidacion_promedio_gratificacion` |  | text | 0.00 | ✅ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_promedio_gratificacion"] input` | ALTA |
| ion-input | `liquidacion_fecha_inicio` |  | date |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_fecha_inicio"] input` | ALTA |
| ion-input | `liquidacion_cts_total` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_cts_total"] input` | ALTA |
| ion-input | `liquidacion_gratificacion_total` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_gratificacion_total"] input` | ALTA |
| ion-input | `liquidacion_otros_beneficios` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_otros_beneficios"] input` | ALTA |
| ion-input | `liquidacion_vacaciones_total` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_vacaciones_total"] input` | ALTA |
| ion-input | `liquidacion_bonificacion_extraordinaria` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_bonificacion_extraordinaria"] input` | ALTA |
| ion-input | `liquidacion_descuento_rr` |  | text | 0.00 | ❌ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_descuento_rr"] input` | ALTA |
| ion-input | `liquidacion_total_pagar` |  | text | 0.00 | ✅ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_total_pagar"] input` | ALTA |
| ion-input | `liquidacion_estado` |  | text |  | ✅ | ❌ | ❌ | `ion-input[formcontrolname="liquidacion_estado"] input` | ALTA |
| ion-select | `null` | Perú | undefined | País | ❌ | ❌ | ❌ | `ion-select:nth-child(15)` | BAJA |
| ion-select | `liquidacion_tipo_cese` | Selecciona un tipo | undefined | Selecciona un tipo | ❌ | ❌ | ❌ | `ion-select[formcontrolname="liquidacion_tipo_cese"]` | ALTA |
| ion-select | `trabajadorSelect` | No | undefined | null | ❌ | ❌ | ❌ | `ion-select[formcontrolname="trabajadorSelect"]` | ALTA |
| ion-textarea | `liquidacion_observaciones` | undefined | undefined | Escribe aqui... | ❌ | ❌ | ❌ | `ion-textarea[formcontrolname="liquidacion_observaciones"] textarea` | ALTA |


---

## INVENTARIO DE TABLAS

### Compras > GestionProveedores

**Filas:** 11 | **Export:** false | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Razón social | ✅ |
| 2 | Documento fiscal | ✅ |
| 3 | Cargo | ✅ |
| 4 | Estado | ✅ |
| 5 | Banco | ✅ |
| 6 | N° Cuenta | ✅ |
| 7 | CCI | ✅ |
| 8 | Nombre | ✅ |
| 9 | Tipo de condición | ✅ |
| 10 | Plazo pagos días | ✅ |

### Compras > GenerarOC

**Filas:** 4 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Nº Órden de compra | ✅ |
| 1 | Fecha registro | ✅ |
| 2 | Fecha entrega | ✅ |
| 3 | Proveedor | ✅ |
| 4 | Almacen | ✅ |
| 5 | Sucursal | ✅ |
| 6 | Moneda | ✅ |
| 7 | Total | ✅ |
| 8 | Estado | ✅ |
| 9 | PDF | ✅ |
| 10 | Código | ✅ |
| 11 | Descripción | ✅ |
| 12 | Cantidad | ✅ |
| 13 | Unidad | ✅ |
| 14 | Precio unitario | ✅ |

### Compras > AprobarOC

**Filas:** 2 | **Export:** false | **Paginación:** true | **Filtros:** true | **Selección:** true

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 1 | Nº. Órden de compra | ✅ |
| 2 | Fecha registro | ✅ |
| 3 | Fecha entrega | ✅ |
| 4 | Razón social | ✅ |
| 5 | Almacén | ✅ |
| 6 | Sucursal | ✅ |
| 7 | Moneda | ✅ |
| 8 | Total | ✅ |
| 9 | Estado | ✅ |
| 10 | Código | ✅ |
| 11 | Cantidad | ✅ |
| 12 | Unidad | ✅ |
| 13 | Centro de costos | ✅ |

### Compras > RegistroComprobantes

**Filas:** 19 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Nº comprobante | ✅ |
| 1 | Tipo | ✅ |
| 2 | Razón social | ✅ |
| 3 | Fecha de emisión | ✅ |
| 4 | Fecha de vencimiento | ✅ |
| 5 | Monto total | ✅ |
| 6 | Moneda | ✅ |
| 7 | Orden asociada | ✅ |
| 8 | Estado | ✅ |
| 9 | Código | ✅ |
| 10 | Cantidad | ✅ |
| 11 | Descripción | ✅ |
| 12 | Concepto financiero | ✅ |
| 13 | Precio unitario | ✅ |
| 14 | Nro. Doc. Ref. | ✅ |
| 15 | Origen Ref. | ✅ |
| 16 | Ítem / Impuesto | ✅ |
| 17 | Base imponible | ✅ |
| 18 | Cuenta | ✅ |
| 19 | Descripción | ✅ |

### Compras > GestionCompras

**Filas:** 0 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Fecha compra | ✅ |
| 1 | Nº orden | ✅ |
| 2 | Documento fiscal | ✅ |
| 3 | Razón social | ✅ |
| 4 | Producto | ✅ |
| 5 | Categoría de producto | ✅ |
| 6 | Unidad de medida | ✅ |
| 7 | Cantidad comprada | ✅ |
| 8 | Precio venta | ✅ |
| 9 | Código | ✅ |
| 10 | Cantidad comprada | ✅ |
| 11 | Producto | ✅ |
| 12 | Monto acumulado | ✅ |

### Finanzas > TiposDocumento

**Filas:** 20 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Nombre de documento | ✅ |
| 2 | Codigo | ✅ |
| 3 | Nombre | ✅ |
| 4 | Estado | ✅ |

### Finanzas > ConceptosFinancieros

**Filas:** 20 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Nombre | ✅ |
| 2 | Matriz Contable Codigo | ✅ |
| 3 | Matriz Contable Nombre | ✅ |
| 4 | Estado | ✅ |

### Finanzas > CarteraPagos

**Filas:** 1 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Proveedor | ✅ |
| 1 | Tipo registro | ✅ |
| 2 | Tipo de comprobante | ✅ |
| 3 | Serie/N° comprobante | ✅ |
| 4 | Fecha programada | ✅ |
| 5 | Monto total pagado | ✅ |
| 6 | Medio pago | ✅ |
| 7 | Estado | ✅ |

### Finanzas > CarteraCobros

**Filas:** 0 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Cliente | ✅ |
| 1 | Tipo de comprobante | ✅ |
| 2 | Serie/N° comprobante | ✅ |
| 3 | Fecha de emisión | ✅ |
| 4 | Fecha de vencimiento | ✅ |
| 5 | Sucursal | ✅ |
| 6 | Monto total | ✅ |
| 7 | Monto cobrado | ✅ |
| 8 | Monto pendiente | ✅ |
| 9 | Estado | ✅ |

### Finanzas > CuentaBancaria

**Filas:** 20 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Fecha de creación | ✅ |
| 1 | Entidad financiera | ✅ |
| 2 | Tipo de cuenta | ✅ |
| 3 | Moneda | ✅ |
| 4 | N° de cuenta | ✅ |
| 5 | CCI | ✅ |
| 6 | Cuenta Contable | ✅ |
| 7 | Saldo contable | ✅ |
| 8 | Estado | ✅ |

### Finanzas > OrdenesGiro

**Filas:** 7 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | N° de orden de giro | ✅ |
| 1 | N° Solicitud de adelanto/Orden de Compra | ✅ |
| 2 | Fecha de emisión | ✅ |
| 3 | Monto | ✅ |
| 4 | Estado | ✅ |
| 5 | Tipo de solicitud | ✅ |
| 6 | Sucursal | ✅ |
| 7 | Centro de costo | ✅ |

### Finanzas > RendicionGastos

**Filas:** 0 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | N° liquidación | ✅ |
| 1 | Fecha | ✅ |
| 2 | Importe neto | ✅ |
| 3 | Saldo | ✅ |
| 4 | Moneda | ✅ |
| 5 | Libro contable | ✅ |
| 6 | Estado | ✅ |
| 7 | Fecha | ✅ |
| 8 | Concepto financiero | ✅ |
| 9 | Cuenta por pagar | ✅ |
| 10 | Importe | ✅ |

### Contabilidad > PlanContable

**Filas:** 1 | **Export:** false | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | Descripción de cuenta | ✅ |
| 1 | Nivel | ✅ |
| 2 | Estado | ✅ |

### Contabilidad > CentrosCosto

**Filas:** 20 | **Export:** false | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Nombre | ✅ |
| 2 | Factor (%) | ✅ |
| 3 | Tipo | ✅ |
| 4 | Usuario que registra | ✅ |
| 5 | Fecha de creación | ✅ |
| 6 | Última modificación | ✅ |
| 7 | Estado | ✅ |

### Contabilidad > TipoCambio

**Filas:** 20 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Fecha registro | ✅ |
| 1 | Fecha vigencia | ✅ |
| 2 | Moneda | ✅ |
| 3 | Tipo de cambio compra | ✅ |
| 4 | Tipo de cambio venta | ✅ |
| 5 | Estado | ✅ |

### ActivosFijos > MaestroAF

**Filas:** 11 | **Export:** false | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Descripción | ✅ |
| 2 | Fecha de adquisición | ✅ |
| 3 | Periodo Contable | ✅ |
| 4 | Valor de adquisición | ✅ |
| 5 | Valor neto en libros | ✅ |
| 6 | Estado | ✅ |

### ActivosFijos > OperacionesTabla

**Filas:** 8 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Descripción | ✅ |
| 2 | Naturaleza | ✅ |
| 3 | Tipo de Cálculo | ✅ |
| 4 | Cuenta Contable | ✅ |
| 5 | Estado | ✅ |

### ActivosFijos > VentaActivos

**Filas:** 5 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Cód. de baja | ✅ |
| 1 | Tipo de baja | ✅ |
| 2 | Fecha de baja | ✅ |
| 3 | Nº de activos fijos | ✅ |
| 4 | Valor neto contable | ✅ |
| 5 | Estado | ✅ |

### ActivosFijos > CalculoDepreciacion

**Filas:** 4 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Periodo | ✅ |
| 2 | Fecha ejecución | ✅ |
| 3 | Usuario que ejecutó | ✅ |
| 4 | Total activos | ✅ |
| 5 | Depreciación total | ✅ |
| 6 | Costo de adquisición | ✅ |
| 7 | % Desgaste | ✅ |

### RRHH > DatosPersonales

**Filas:** 20 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Cód. de empleado | ✅ |
| 1 | Apellido paterno | ✅ |
| 2 | Apellido materno | ✅ |
| 3 | Nombre 1 | ✅ |
| 4 | Nombre 2 | ✅ |
| 5 | Tipo de documento | ✅ |
| 6 | Documento | ✅ |
| 7 | Fecha de inicio | ✅ |
| 8 | Tipo de trabajador | ✅ |
| 9 | AFP | ✅ |
| 10 | Fecha inicio afiliación | ✅ |

### RRHH > Cargos

**Filas:** 1 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Nombres de cargo | ✅ |
| 2 | Nivel | ✅ |
| 3 | B. salarial mínimo | ✅ |
| 4 | B. salarial promedio | ✅ |
| 5 | B. salarial máximo | ✅ |
| 6 | Estado | ✅ |

### RRHH > TipoContrato

**Filas:** 6 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Nombre | ✅ |
| 2 | Estado | ✅ |

### RRHH > CalculoPlanilla

**Filas:** 0 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Código | ✅ |
| 1 | Periodo | ✅ |
| 2 | Tipo de planilla | ✅ |
| 3 | Fecha registro | ✅ |
| 4 | Sucursal | ✅ |
| 5 | Cálculo desde | ✅ |
| 6 | Cálculo hasta | ✅ |
| 7 | N° trabajadores | ✅ |
| 8 | Estado | ✅ |

### RRHH > RegistrarLiquidacion

**Filas:** 0 | **Export:** true | **Paginación:** true | **Filtros:** true | **Selección:** false

| # | Columna | Ordenable |
|:-:|:--------|:---------:|
| 0 | Cód. de liquidación | ✅ |
| 1 | Fecha de ingreso | ✅ |
| 2 | Fecha de cese | ✅ |
| 3 | Trabajador | ✅ |
| 4 | Tipo de cese | ✅ |
| 5 | Total a pagar | ✅ |
| 6 | Estado | ✅ |


---

## INVENTARIO DE TABS

### Compras > GestionProveedores

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | General |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("General")` |
| 2 | Bancaria |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Bancaria")` |
| 4 | Comercial |  | `ion-segment-button:nth-child(5), [role="tab"]:has-text("Comercial")` |

### Compras > RegistroComprobantes

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | Registro |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("Registro")` |
| 2 | Referencias |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Referencias")` |
| 4 | Impuestos |  | `ion-segment-button:nth-child(5), [role="tab"]:has-text("Impuestos")` |
| 6 | Asientos |  | `ion-segment-button:nth-child(7), [role="tab"]:has-text("Asientos")` |

### Finanzas > CarteraPagos

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | Pago de documento |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("Pago de documento")` |
| 2 | Pago de planilla |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Pago de planilla")` |

### Contabilidad > PlanContable

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | Identificación Cuenta |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("Identificación Cuenta")` |
| 2 | Clasificación |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Clasificación")` |
| 4 | Parametrización operativa |  | `ion-segment-button:nth-child(5), [role="tab"]:has-text("Parametrización operativa")` |
| 6 | Normativa/Plantilla |  | `ion-segment-button:nth-child(7), [role="tab"]:has-text("Normativa/Plantilla")` |

### ActivosFijos > MaestroAF

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | Datos Generales |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("Datos Generales")` |
| 2 | Datos Complementarios |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Datos Complementarios")` |
| 4 | Accesorios |  | `ion-segment-button:nth-child(5), [role="tab"]:has-text("Accesorios")` |
| 6 | Depreciación |  | `ion-segment-button:nth-child(7), [role="tab"]:has-text("Depreciación")` |
| 8 | Traslados |  | `ion-segment-button:nth-child(9), [role="tab"]:has-text("Traslados")` |
| 10 | Incidencias |  | `ion-segment-button:nth-child(11), [role="tab"]:has-text("Incidencias")` |
| 12 | Adaptaciones |  | `ion-segment-button:nth-child(13), [role="tab"]:has-text("Adaptaciones")` |
| 14 | Asignaciones |  | `ion-segment-button:nth-child(15), [role="tab"]:has-text("Asignaciones")` |

### ActivosFijos > VentaActivos

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | Tipo de baja |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("Tipo de baja")` |
| 2 | Selección del activo |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Selección del activo")` |
| 4 | Resumen del activo |  | `ion-segment-button:nth-child(5), [role="tab"]:has-text("Resumen del activo")` |

### RRHH > DatosPersonales

| # | Nombre | Seleccionado | Selector |
|:-:|:-------|:------------:|:---------|
| 0 | Datos generales del trabajador |  | `ion-segment-button:nth-child(1), [role="tab"]:has-text("Datos generales del trabajador")` |
| 2 | Información laboral |  | `ion-segment-button:nth-child(3), [role="tab"]:has-text("Información laboral")` |
| 4 | Equipamiento |  | `ion-segment-button:nth-child(5), [role="tab"]:has-text("Equipamiento")` |


---

## COMPONENTES REUTILIZABLES

### `app-autocomplete`
- **Tipo:** reusable
- **Descripción:** Buscador con autocompletado
- **Usado en:** GestionProveedores, GenerarOC, RegistroComprobantes, CarteraCobros, CuentaBancaria, OrdenesGiro, CentrosCosto, MaestroAF, OperacionesTabla, VentaActivos, RegistrarLiquidacion

### `app-sidebar`
- **Tipo:** layout
- **Descripción:** Sidebar de navegación
- **Usado en:** GestionProveedores, GenerarOC, AprobarOC, RegistroComprobantes, GestionCompras, TiposDocumento, ConceptosFinancieros, CarteraPagos, CarteraCobros, CuentaBancaria, OrdenesGiro, RendicionGastos, PlanContable, CentrosCosto, TipoCambio, MaestroAF, OperacionesTabla, VentaActivos, CalculoDepreciacion, DatosPersonales, Cargos, TipoContrato, CalculoPlanilla, RegistrarLiquidacion

### `app-header`
- **Tipo:** layout
- **Descripción:** Header con selector país/empresa/sucursal
- **Usado en:** GestionProveedores, GenerarOC, AprobarOC, RegistroComprobantes, GestionCompras, TiposDocumento, ConceptosFinancieros, CarteraPagos, CarteraCobros, CuentaBancaria, OrdenesGiro, RendicionGastos, PlanContable, CentrosCosto, TipoCambio, MaestroAF, OperacionesTabla, VentaActivos, CalculoDepreciacion, DatosPersonales, Cargos, TipoContrato, CalculoPlanilla, RegistrarLiquidacion

### `app-selector-busqueda`
- **Tipo:** reusable
- **Descripción:** Selector desplegable con búsqueda
- **Usado en:** GenerarOC, RegistroComprobantes

### `app-base-calendar-new`
- **Tipo:** reusable
- **Descripción:** Componente calendario
- **Usado en:** GenerarOC, AprobarOC, RegistroComprobantes, GestionCompras, CarteraPagos, CarteraCobros, CuentaBancaria, OrdenesGiro, PlanContable, CentrosCosto, TipoCambio, MaestroAF, VentaActivos, CalculoDepreciacion, DatosPersonales, Cargos, CalculoPlanilla, RegistrarLiquidacion


---

## INVENTARIO DE BOTONES

### Compras > GestionProveedores

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Compras > GenerarOC

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Nuevo producto | null | ❌ | null |  | `button:has-text("Nuevo producto"), ion-button:has-text("Nuevo producto")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Compras > AprobarOC

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |

### Compras > RegistroComprobantes

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Nuevo | null | ❌ | null |  | `button:has-text("Nuevo"), ion-button:has-text("Nuevo")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |
| Anular | null | ❌ | danger |  | `button:has-text("Anular"), ion-button:has-text("Anular")` |

### Finanzas > TiposDocumento

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Finanzas > ConceptosFinancieros

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Finanzas > CarteraPagos

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |

### Finanzas > CarteraCobros

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Registrar pago | null | ❌ | null |  | `button:has-text("Registrar pago"), ion-button:has-text("Registrar pago")` |

### Finanzas > CuentaBancaria

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Finanzas > OrdenesGiro

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Nueva orden de giro | null | ❌ | null |  | `button:has-text("Nueva orden de giro"), ion-button:has-text("Nueva orden de giro")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |
| Anular | null | ❌ | danger |  | `button:has-text("Anular"), ion-button:has-text("Anular")` |

### Finanzas > RendicionGastos

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Agregar línea | null | ❌ | null |  | `button:has-text("Agregar línea"), ion-button:has-text("Agregar línea")` |
| Quitar línea | null | ❌ | medium |  | `button:has-text("Quitar línea"), ion-button:has-text("Quitar línea")` |
| Guardar borrador | null | ❌ | medium |  | `button:has-text("Guardar borrador"), ion-button:has-text("Guardar borrador")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Contabilidad > PlanContable

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Siguiente | null | ❌ | null |  | `button:has-text("Siguiente"), ion-button:has-text("Siguiente")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Contabilidad > CentrosCosto

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Acciones | null | ❌ | null |  | `button:has-text("Acciones"), ion-button:has-text("Acciones")` |
| Nuevo centro de costo | null | ❌ | null |  | `button:has-text("Nuevo centro de costo"), ion-button:has-text("Nuevo centro de costo")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### Contabilidad > TipoCambio

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### ActivosFijos > MaestroAF

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Siguiente | null | ❌ | null |  | `button:has-text("Siguiente"), ion-button:has-text("Siguiente")` |

### ActivosFijos > OperacionesTabla

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### ActivosFijos > VentaActivos

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| 01/07/2026 - 04/07/2026 | button | ❌ | null |  | `button:has-text("01/07/2026 - 04/07/2026"), ion-button:has-text("01/07/2026 - 04/07/2026")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Siguiente | null | ❌ | null |  | `button:has-text("Siguiente"), ion-button:has-text("Siguiente")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### ActivosFijos > CalculoDepreciacion

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Exportar | null | ❌ | null |  | `button:has-text("Exportar"), ion-button:has-text("Exportar")` |
| Nuevo cálculo | null | ❌ | null |  | `button:has-text("Nuevo cálculo"), ion-button:has-text("Nuevo cálculo")` |
| Ejecutar cálculo masivo | null | ❌ | null |  | `button:has-text("Ejecutar cálculo masivo"), ion-button:has-text("Ejecutar cálculo masivo")` |

### RRHH > DatosPersonales

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### RRHH > Cargos

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Exportar | null | ❌ | null |  | `button:has-text("Exportar"), ion-button:has-text("Exportar")` |
| Nuevo cargo | null | ❌ | null |  | `button:has-text("Nuevo cargo"), ion-button:has-text("Nuevo cargo")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### RRHH > TipoContrato

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### RRHH > CalculoPlanilla

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Exportar | null | ❌ | null |  | `button:has-text("Exportar"), ion-button:has-text("Exportar")` |
| Nuevo calculo | null | ❌ | null |  | `button:has-text("Nuevo calculo"), ion-button:has-text("Nuevo calculo")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Calcular planilla | null | ❌ | null |  | `button:has-text("Calcular planilla"), ion-button:has-text("Calcular planilla")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

### RRHH > RegistrarLiquidacion

| Texto | Type | Disabled | Color | Icon | Selector |
|:------|:-----|:--------:|:------|:----:|:---------|
| Seleccione una fecha | button | ❌ | null |  | `button:has-text("Seleccione una fecha"), ion-button:has-text("Seleccione una fecha")` |
| Registrar | null | ❌ | null |  | `button:has-text("Registrar"), ion-button:has-text("Registrar")` |
| Cancelar | null | ❌ | medium |  | `button:has-text("Cancelar"), ion-button:has-text("Cancelar")` |

