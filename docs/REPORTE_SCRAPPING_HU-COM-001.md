# Reporte de Scrapping Profundo — HU-COM-001 vs Implementación Real
## Módulo: Gestión de Proveedores

> **Fecha:** 18/06/2026
> **Método:** Scraping automatizado con Selenium sobre panel.dev.contabilidad.restaurant.pe
> **Usuario:** pcastillo / PESQUERA CANTABRIA S.A. / Sucursal LIMA
> **URL real:** `/compras/tabla/gestion-proveedores`

---

## 1. Columnas del Listado (AG Grid)

| HU-COM-001 requiere | Columna real detectada | Estado |
|---------------------|----------------------|--------|
| Código interno | ✅ **Código** | ✅ Implementado |
| Razón Social | ✅ **Razón social** | ✅ Implementado |
| Nombre Comercial | ❌ No existe | ⚠️ **Faltante** |
| RUC/NIT/RNC/NIF | ✅ **Documento fiscal** | ✅ Implementado (renombrado) |
| País | ❌ No existe como columna | ⚠️ **Faltante** (es filtro global) |
| Teléfono | ❌ No existe | ⚠️ **Faltante** |
| Estado | ✅ **Estado** | ✅ Implementado |
| Condiciones de Pago | ❌ No existe | ⚠️ **Faltante** |
| Acciones | ✅ **Cargo** + columna Acciones | ⚠️ Parcial |

**Columnas reales:** `Código | Razón social | Documento fiscal | Cargo | Estado`

**Datos reales encontrados (25 proveedores):**
- PROVEEDOR DEMO S.A.C. (Código 1, Doc: 24885187, Director, Activo)
- CLIENTE DEMO E.I.R.L. (Código 2, Doc: 2056789015407365, Analista, Activo)
- Distribuidora Actualizada 9913 (Código 13, Doc: 99139506, Jefe de Compras, Activo)
- PROVEEDOR QA 185 (Código 16, Doc: 2056789018519934, Analista, Activo)
- ... 25 proveedores total, paginación: 20 por página, 2 páginas

---

## 2. Filtros del Listado

| HU-COM-001 requiere | Detectado | Estado |
|---------------------|-----------|--------|
| Filtro por Razón Social | ✅ Input "Buscar proveedor código o por razón social" | ✅ Implementado |
| Filtro por Identificación Fiscal | ⚠️ El search es genérico (código o razón social) | ⚠️ Parcial |
| Filtro por Estado | ✅ Tabs: Todos / Activos / Inactivos + `formcontrolname="filtroEstado"` | ✅ Implementado |
| Filtro por País | ✅ Selector global de país en header (Perú/Colombia/Ecuador/Guatemala) | ✅ Implementado (global) |

---

## 3. Acciones del Listado

| HU-COM-001 requiere | Detectado | Estado |
|---------------------|-----------|--------|
| Ver | ⚠️ No se detectó botón "Ver" explícito | 🔲 Pendiente |
| Editar | ⚠️ "Selecciona un proveedor para visualizarlo o editarlo" | ✅ Implementado (clic en fila) |
| Inactivar | ⚠️ No se detectó explícitamente | 🔲 Pendiente |
| Exportar (Excel/PDF) | ❌ **No se encontró** | ❌ **Faltante** |

**Acciones reales detectadas:** "Nuevo proveedor", "Registrar", "Cancelar"

---

## 4. Formulario de Proveedor — Secciones

| HU-COM-001 dice | Detectado | Estado |
|----------------|-----------|--------|
| Datos Generales | ✅ Tab **"General"** | ✅ Implementado |
| Datos Bancarios | ✅ Tab **"Bancaria"** | ✅ Implementado |
| Datos Comerciales | ✅ Tab **"Comercial"** | ✅ Implementado |

**Secciones reales:** `General | Bancaria | Comercial` (3 pestañas)

---

## 5. Campos del Formulario — Tab "General"

| HU-COM-001 requiere | Campo real detectado | formcontrolname | placeholder | Estado |
|---------------------|---------------------|-----------------|-------------|--------|
| Razón Social (obligatorio) | ✅ `razonSocial` | `razonSocial` | "Proveedor ejemplo S.A.C" | ✅ Implementado |
| Nombre Comercial (opcional) | ✅ `nombreComercial` | `nombreComercial` | "Proveedor ejemplo" | ✅ Implementado |
| Tipo de Identificación (lista) | ✅ `tipoIdentificacion` | `tipoIdentificacion` | — | ✅ Implementado (**readonly** = autodetectado) |
| Número de Identificación Fiscal | ✅ `identfiscal` | `identfiscal` | — | ✅ Implementado |
| Dirección Fiscal (obligatorio) | ✅ `direccionFiscal` | `direccionFiscal` | "Ingresar dirección fiscal" | ✅ Implementado |
| Teléfono (opcional) | ✅ `telefono` | `telefono` | "Ingresa un número" | ✅ Implementado |
| Correo electrónico (opcional) | ✅ `email` | `email` | "Ingresa un correo electrónico" | ✅ Implementado |
| Estado (Activo/Inactivo) | ✅ `estado` | `estado` | "Activo" | ✅ Implementado |
| Proveedor Nacional o Extranjero | ✅ `proveedor` | `proveedor` | "Nacional" | ✅ Implementado |

### Opciones de Selects detectadas:

| Select | Opciones | Estado |
|--------|----------|--------|
| Estado | Activo / Inactivo | ✅ Correcto |
| Proveedor | Nacional / Extranjero | ✅ Correcto |
| País (global) | Perú / Colombia / Ecuador / Guatemala | ✅ Implementado |
| Tipo de Identificación | ⚠️ Campo **readonly** (autodetectado según país) | ⚠️ Diferencia con HU |

### ⚠️ Diferencia importante: Tipo de Identificación
La HU dice que debe ser una **lista desplegable** con opciones: RUC, NIT, RNC, NIF, RUT, CUIT, CPF, CIF, RTN, RFC, RIF, Otros.
La implementación lo tiene como campo **readonly** (`readonly: true`), lo que sugiere que se autodetecta según el país seleccionado. Esto es una diferencia con la HU.

---

## 6. Campos del Formulario — Tab "Bancaria"

| HU-COM-001 requiere | Detectado | Estado |
|---------------------|-----------|--------|
| Banco (lista desplegable) | ⚠️ No se inspeccionó (tab no activa) | 🔲 Pendiente |
| Número de cuenta | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Código Interbancario | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Tipo de Cuenta | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Moneda (multimoneda) | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Cuenta de detracción BN | ⚠️ No se inspeccionó | 🔲 Pendiente |

> **Nota:** Las tabs "Bancaria" y "Comercial" existen pero no se activaron en este scraping. Se requiere hacer clic en cada tab para mapear sus campos.

---

## 7. Campos del Formulario — Tab "Comercial"

| HU-COM-001 requiere | Detectado | Estado |
|---------------------|-----------|--------|
| Nombre de Contacto | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Teléfono de Contacto | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Email de Contacto | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Condiciones de Pago | ⚠️ No se inspeccionó | 🔲 Pendiente |
| Plazo de Crédito (días) | ⚠️ No se inspeccionó | 🔲 Pendiente |

---

## 8. Campos Informativos de Solo Lectura

| HU-COM-001 requiere | Detectado | Estado |
|---------------------|-----------|--------|
| Razón Social activa (solo lectura) | ❌ `razonSocial` es editable | ⚠️ Diferencia |
| País (solo lectura) | ⚠️ País es selector global, no del formulario | ⚠️ Diferencia |

---

## 9. Botones del Formulario

| Botón | Detectado | Estado |
|-------|-----------|--------|
| Guardar/Registrar | ✅ "Registrar" | ✅ Implementado |
| Cancelar | ✅ "Cancelar" | ✅ Implementado |

---

## 10. Funcionalidades No Detectadas

| HU-COM-001 requiere | Detectado | Estado |
|---------------------|-----------|--------|
| Exportar Excel/PDF | ❌ No encontrado | ❌ **Faltante** |
| Carga masiva Excel | ❌ No encontrado | ❌ **Faltante** |
| Log de auditoría contable | ❌ No visible en UI | 🔲 No verificable por scraping |
| Validación RUC duplicado por país | ⚠️ Requiere intentar crear duplicado | 🔲 Pendiente |
| Impedir eliminación con movimientos | ⚠️ Requiere intentar eliminar | 🔲 Pendiente |
| Múltiples cuentas bancarias | ⚠️ Requiere inspeccionar tab Bancaria | 🔲 Pendiente |
| Validación SUNAT/DIAN/DGII | ⚠️ No visible en UI | 🔲 No verificable |

---

## 11. Menú Lateral del Módulo Compras

El sidebar muestra el submenú completo de Compras:
- **Tablas**: Proveedores, Condiciones de pago
- **Operaciones**: Generar OC, Aprobar OC, Generar OS, Aprobar OS, Registro de comprobantes, Notas crédito/débito, Facturas que pertenecen a gastos
- **Cotizaciones**: Registrar cotización
- **Reportes**: Reportes de compras, Compras en tránsito, Compras por ingresar, Análisis de proveedores, Compras por categorías, Gestión de compras, Compras sugeridas

---

## 12. Resumen Ejecutivo Actualizado

| Categoría | Total | ✅ Implementado | ⚠️ Diferencia/Parcial | ❌ Faltante | 🔲 Pendiente |
|-----------|-------|----------------|----------------------|------------|-------------|
| Columnas del listado | 9 | 4 | 1 | 4 | 0 |
| Filtros | 4 | 3 | 1 | 0 | 0 |
| Acciones | 4 | 1 | 0 | 1 | 2 |
| Secciones del formulario | 3 | 3 | 0 | 0 | 0 |
| Campos tab General | 9 | 9 | 1 (Tipo ID readonly) | 0 | 0 |
| Campos tab Bancaria | 6 | 0 | 0 | 0 | 6 |
| Campos tab Comercial | 5 | 0 | 0 | 0 | 5 |
| Campos solo lectura | 2 | 0 | 2 | 0 | 0 |
| Botones | 2 | 2 | 0 | 0 | 0 |
| Funcionalidades avanzadas | 7 | 0 | 0 | 2 | 5 |
| **TOTAL** | **51** | **22** | **5** | **7** | **18** |

### ✅ Implementado correctamente (22/51 = 43%)
- Listado con AG Grid, paginación (25 proveedores, 2 páginas)
- Columnas: Código, Razón social, Documento fiscal, Cargo, Estado
- Filtro por razón social (búsqueda), filtro por estado (tabs), filtro por país (global)
- 3 secciones del formulario: General, Bancaria, Comercial
- Todos los campos de la tab General: razón social, nombre comercial, ID fiscal, dirección, teléfono, email, estado, nacional/extranjero
- Botones Registrar y Cancelar
- 25 proveedores con datos reales cargados

### ⚠️ Diferencias con la HU (5/51 = 10%)
1. **Columnas faltantes:** Nombre Comercial, País, Teléfono, Condiciones de Pago no están en el listado
2. **Tipo de Identificación** es readonly (autodetectado) en vez de lista desplegable
3. **Razón Social** es editable, la HU dice que debe ser solo lectura (informativo)
4. **País** es un selector global del header, no un campo del formulario
5. **Columna "Cargo"** existe pero no está en la HU (campo extra)

### ❌ Faltantes confirmados (7/51 = 14%)
1. **Exportar Excel/PDF** — No se encontró en el listado
2. **Carga masiva Excel** — No se encontró opción
3. **Columna Nombre Comercial** en listado
4. **Columna País** en listado
5. **Columna Teléfono** en listado
6. **Columna Condiciones de Pago** en listado
7. **Acción "Ver"** explícita

### 🔲 Pendientes de verificar (18/51 = 35%)
- Campos de tab Bancaria (6 campos)
- Campos de tab Comercial (5 campos)
- Validación RUC duplicado por país
- Impedir eliminación con movimientos
- Múltiples cuentas bancarias
- Validación SUNAT automática
- Log de auditoría

### Recomendaciones
1. **Hacer scraping de tabs Bancaria y Comercial** para completar el inventario
2. **Probar validación de RUC duplicado** creando un proveedor con documento existente
3. **Verificar si Exportar existe** en otra parte del módulo (puede estar en Reportes)
4. **Corregir la HU-COM-001** actualizando:
   - Ruta: `Compras > Tabla > Gestión de Proveedores` (no "Tablas > Proveedores")
   - Tipo de Identificación: ahora es autodetectado (no lista desplegable manual)
   - Columnas del listado: agregar las faltantes (Nombre Comercial, País, Teléfono, Condiciones de Pago)
   - Campos informativos: Razón Social es editable, no solo lectura
