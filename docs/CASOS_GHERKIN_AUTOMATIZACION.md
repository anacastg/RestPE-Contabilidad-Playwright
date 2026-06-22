# Casos de Prueba en Gherkin — Restaurante.pe V2

> **Propósito:** Casos en formato Gherkin listos para automatización (Cypress/Playwright).
>
> **Origen:** `Listado de funcionalidades y flujos por probar por sprint - Hoja 1.csv`
>
> **Responsable:** QA Automation
>
> **Fecha:** 17/06/2026

---

## Convenciones

- **Tags**: `@Sprint1` `@Sprint2` `@Sprint3` `@Sprint4` | `@critical` `@high` `@medium` | `@module-compras` `@module-finanzas` `@module-activos` `@module-rrhh` | `@smoke` `@regression`
- `# N` al inicio del Scenario = referencia al ítem del CSV
- `sp_*` / `fn_*` = stored procedure/función backend involucrada

---

# Sprint 1 — Módulo Compras + Maestros Core + Finanzas Base

---

## Feature: Gestión de Proveedores — HU-COM-001 (#1)

> **Trazabilidad:** HU-COM-001 v1.0 — Gestión de Proveedores
> **Ruta:** Menú Principal > Compras > Tablas > Proveedores
> **Módulo:** Compras > Tablas > Proveedores

```gherkin
@Sprint1 @module-compras @critical @smoke
Feature: Gestión de Proveedores — CRUD e Inactivación
  Como usuario del sistema contable de Restaurant.pe
  Quiero registrar, consultar, modificar e inactivar proveedores
  Para mantener un maestro único de proveedores actualizado
  Que sirva de base para las compras, cuentas por pagar e integración contable

  # ============================================================
  # CONSULTA Y LISTADO
  # ============================================================

  @Sprint1 @critical @smoke
  Scenario: #1.1 Visualizar listado de proveedores con columnas correctas
    Given el usuario autenticado navega a "Compras > Tablas > Proveedores"
    Then la tabla de proveedores debe cargarse con las columnas:
      | Código interno | Razón Social | Nombre Comercial | RUC/NIT/RNC/NIF | País | Teléfono | Estado | Condiciones de Pago | Acciones |
    And las acciones disponibles por fila deben ser: Ver | Editar | Inactivar | Exportar (Excel/PDF)
    And la barra de búsqueda debe ser visible
    And los filtros deben ser visibles para: Razón Social, Identificación Fiscal, Estado, País
    And la paginación debe ser funcional

  @Sprint1 @medium
  Scenario: #1.2 Estado loading y empty state
    Given no existen proveedores en el sistema
    When el usuario navega al listado
    Then debe mostrar mensaje "No se encontraron proveedores"
    And debe mostrar un CTA "Crear primer proveedor"

  @Sprint1 @high
  Scenario: #1.3 Búsqueda y filtros combinados en listado
    Given existen múltiples proveedores cargados de distintos países
    When el usuario busca por Identificación Fiscal exacta
    Then debe encontrar coincidencia exacta
    When busca por razón social parcial
    Then debe mostrar múltiples resultados
    When filtra por Estado "Activo"
    Then solo debe mostrar proveedores activos
    When filtra por País "Perú"
    Then solo debe mostrar proveedores peruanos
    When combina filtros: Razón Social parcial + Estado + País
    Then la combinación de filtros debe funcionar correctamente
    When exporta el listado a Excel
    Then el archivo debe contener todas las columnas visibles
    When exporta el listado a PDF
    Then el PDF debe contener todas las columnas visibles

  # ============================================================
  # ALTA DE PROVEEDOR
  # ============================================================

  @Sprint1 @critical
  Scenario: #1.4 Validar campos obligatorios en alta de proveedor
    Given el usuario navega a "Compras > Tablas > Proveedores > Nuevo"
    When deja todos los campos vacíos
    And intenta guardar
    Then debe mostrar mensajes de validación en los campos obligatorios:
      | Razón Social | Tipo de Identificación | Número de Identificación Fiscal | Dirección Fiscal |
    And el botón Guardar debe permanecer deshabilitado

  @Sprint1 @high
  Scenario: #1.5 Validar campos condicionales en alta de proveedor
    Given el usuario está en la pantalla de nuevo proveedor
    When selecciona Tipo de Identificación de la lista: RUC, NIT, RNC, NIF, RUT, CUIT, CPF, CIF, RTN, RFC, RIF, Otros
    And selecciona Condición de Pago "Crédito"
    And deja el campo Plazo de Crédito vacío
    And intenta guardar
    Then debe mostrar validación "Plazo de Crédito es obligatorio cuando la condición es crédito"
    When ingresa Plazo de Crédito en días
    And registra un Banco
    And deja Número de cuenta vacío
    And intenta guardar
    Then debe mostrar validación "Número de cuenta es obligatorio cuando se registra un banco"
    When ingresa Número de cuenta
    And deja Código Interbancario vacío
    And intenta guardar
    Then debe mostrar validación "Código Interbancario es obligatorio cuando se registra un banco"

  @Sprint1 @critical
  Scenario: #1.6 Alta exitosa de proveedor nacional con datos completos
    Given el usuario completa el formulario de proveedor con datos válidos:
      | Razón Social         | Distribuidora Andina S.A.C.           |
      | Nombre Comercial     | Andina Distribución                   |
      | Tipo de Identificación | RUC                                 |
      | Número de Identificación Fiscal | 20512345678                  |
      | Dirección Fiscal     | Av. Javier Prado 1234, Lima           |
      | Teléfono             | 987654321                             |
      | Correo electrónico   | contacto@andina.com                   |
      | Estado               | Activo                                |
      | Proveedor Nacional o Extranjero | Nacional                      |
      | Banco                | BCP                                   |
      | Número de cuenta     | 1941234567890                         |
      | Código Interbancario | 002194001234567890123                 |
      | Tipo de Cuenta       | Corriente                             |
      | Moneda               | Soles y Dólares (multimoneda)         |
      | Condiciones de Pago  | Crédito                               |
      | Plazo de Crédito     | 30 días                               |
    When guarda el proveedor
    Then debe mostrar toast "Proveedor creado exitosamente"
    And el proveedor debe aparecer en el listado con estado Activo
    And el Código interno debe generarse automáticamente
    And todos los campos deben persistirse correctamente

  @Sprint1 @high
  Scenario: #1.7 Alta de proveedor extranjero con identificación fiscal de su país
    Given el usuario completa el formulario de proveedor extranjero:
      | Razón Social         | Global Foods LLC                      |
      | Tipo de Identificación | RUT                                 |
      | Número de Identificación Fiscal | 901234567-8                   |
      | País                 | Colombia                              |
      | Proveedor Nacional o Extranjero | Extranjero                    |
      | Dirección Fiscal     | Calle 100, Bogotá                     |
    When guarda el proveedor
    Then el proveedor debe crearse correctamente
    And el número de identificación debe respetar el formato del país de origen
    And la validación de unicidad debe aplicarse solo dentro del mismo país

  # ============================================================
  # VALIDACIÓN DE IDENTIFICACIÓN FISCAL
  # ============================================================

  @Sprint1 @high
  Scenario: #1.8 Validación de Identificación Fiscal duplicada por país
    Given existe un proveedor nacional con RUC "20100012345" en Perú
    When el usuario crea un nuevo proveedor nacional con el mismo RUC "20100012345"
    Then debe mostrar mensaje "El número de identificación fiscal ya existe para este país"
    And no debe duplicarse el registro

  @Sprint1 @high
  Scenario: #1.9 Validación de Identificación Fiscal — mismo número en distinto país
    Given existe un proveedor en Perú con RUC "20100012345"
    When el usuario crea un nuevo proveedor en Colombia con el mismo número "20100012345"
    Then el sistema debe permitir el registro
    And no debe mostrar error de duplicado porque pertenece a distinto país

  # ============================================================
  # EDICIÓN
  # ============================================================

  @Sprint1 @high
  Scenario: #1.10 Edición de proveedor existente
    Given existe un proveedor activo en el sistema
    When el usuario selecciona el proveedor
    And hace clic en "Editar"
    And modifica la razón social y el teléfono
    And guarda los cambios
    Then los cambios deben reflejarse en el listado
    And el cambio debe registrarse en el log de auditoría contable

  @Sprint1 @critical
  Scenario: #1.11 Campos informativos de solo lectura en formulario
    Given el usuario abre el formulario de un proveedor existente
    Then el campo "Razón Social activa" debe ser de solo lectura (informativo)
    And el campo "País" debe ser de solo lectura (informativo)
    When el usuario intenta editar estos campos
    Then los campos deben permanecer bloqueados

  # ============================================================
  # INACTIVACIÓN (NO ELIMINACIÓN)
  # ============================================================

  @Sprint1 @critical
  Scenario: #1.12 Inactivación de proveedor sin movimientos asociados
    Given existe un proveedor activo sin movimientos asociados (compras, facturas, pagos)
    When el usuario selecciona la acción "Inactivar"
    And confirma en el modal
    Then el estado del proveedor debe cambiar a Inactivo
    And debe poder filtrarse por Estado "Inactivo"
    And el cambio debe registrarse en el log de auditoría contable

  @Sprint1 @critical
  Scenario: #1.13 Impedir eliminación de proveedor con movimientos asociados
    Given existe un proveedor con movimientos asociados (compras, facturas, pagos)
    When el usuario intenta eliminar el proveedor
    Then el sistema debe impedir la eliminación
    And debe mostrar mensaje "No es posible eliminar el proveedor porque tiene movimientos asociados"
    And solo debe permitir la inactivación

  # ============================================================
  # DATOS BANCARIOS
  # ============================================================

  @Sprint1 @medium
  Scenario: #1.14 Registrar múltiples cuentas bancarias por proveedor
    Given existe un proveedor activo en el sistema
    When el usuario agrega una primera cuenta bancaria en Soles
    And agrega una segunda cuenta bancaria en Dólares
    And guarda
    Then ambas cuentas deben persistir correctamente
    And cada cuenta debe tener: Banco, Número de cuenta, Código Interbancario, Tipo de Cuenta, Moneda
    And al registrar pagos, el usuario debe poder seleccionar entre las cuentas disponibles

  @Sprint1 @medium
  Scenario: #1.15 Cuenta de detracción del Banco de la Nación
    Given el usuario registra un proveedor para servicios/compras sujetas a detracción
    When ingresa la Cuenta de detracción del Banco de la Nación
    And guarda
    Then la cuenta de detracción debe persistir
    And debe aparecer disponible al registrar facturas con detracción

  # ============================================================
  # CARGA MASIVA
  # ============================================================

  @Sprint1 @high
  Scenario: #1.16 Carga masiva de proveedores vía Excel
    Given el usuario navega a "Compras > Tablas > Proveedores > Carga Masiva"
    When descarga la plantilla Excel
    Then la plantilla debe contener las columnas obligatorias
    When llena la plantilla con 10 proveedores válidos
    And importa el archivo
    Then debe mostrar resumen: "10 registros exitosos, 0 errores"
    And los 10 proveedores deben aparecer en el listado

  @Sprint1 @high
  Scenario: #1.17 Carga masiva con validación de duplicados y campos obligatorios
    Given el usuario importa un Excel con proveedores
    But 2 filas tienen RUC duplicado con proveedores existentes en el mismo país
    And 1 fila tiene Razón Social vacía
    When el sistema valida el archivo
    Then debe mostrar resumen: "X registros exitosos, 3 errores"
    And los errores deben indicar: fila, campo, motivo (duplicado / obligatorio)
    And los registros con error no deben importarse
    And los registros válidos sí deben importarse

  # ============================================================
  # AUDITORÍA E INTEGRACIÓN
  # ============================================================

  @Sprint1 @high
  Scenario: #1.18 Log de auditoría contable registra todos los cambios
    Given el usuario realiza un alta, una edición y una inactivación de proveedores
    When consulta el log de auditoría contable
    Then cada cambio debe registrar: usuario, fecha, hora, acción (alta/edición/inactivación)
    And el log debe ser accesible desde el módulo de auditoría

  @Sprint1 @high
  Scenario: #1.19 Integración con Órdenes de Compra, Cuentas por Pagar y Contabilidad
    Given existe un proveedor activo registrado en el maestro
    When el usuario crea una Orden de Compra
    Then el proveedor debe aparecer en el selector de proveedores
    When el usuario registra una factura en Cuentas por Pagar
    Then el proveedor debe estar disponible para asociar la factura
    When el usuario configura asientos contables
    Then las cuentas contables del proveedor deben estar disponibles
```

---

## Feature: Orden de Compra — HU-COM-003 (#2)

> **Trazabilidad:** HU-COM-003 v1.0 — Generar Orden de Compra
> **Ruta:** Menú Principal > Compras > Operaciones > Órdenes de Compra > Generar Orden de Compra
> **Numeración:** OC-YYYY-CORRELATIVO por razón social y sucursal

```gherkin
@Sprint1 @module-compras @critical @smoke
Feature: Orden de Compra — Creación y gestión (HU-COM-003)
  Como usuario del sistema contable de Restaurant.pe
  Quiero crear y gestionar órdenes de compra de bienes o servicios
  Para formalizar el requerimiento de adquisiciones a proveedores
  Y asegurar la integración con inventarios, finanzas y contabilidad

  # ============================================================
  # VISUALIZACIÓN DEL FORMULARIO
  # ============================================================

  @Sprint1 @critical
  Scenario: #2.1 Visualizar pantalla de nueva OC
    Given el usuario navega a "Compras > Operaciones > Órdenes de Compra > Generar Orden de Compra"
    And hace clic en "Nueva OC"
    Then debe mostrar número de OC autogenerado con formato "OC-YYYY-CORRELATIVO"
    And debe mostrar las secciones: Cabecera (Datos Generales), Detalle (Artículos), Totales
    And en Datos Generales debe mostrar: Proveedor, Fecha Emisión, Fecha Entrega, Dirección Entrega, Moneda, Condición de Pago
    And el campo Fecha de Emisión debe tener como default la fecha actual
    And los campos "Emite" y "Autoriza" deben estar visibles
    And el selector de proveedor debe tener autocompletado filtrando solo activos

  # ============================================================
  # CREACIÓN DE OC — FLUJO COMPLETO
  # ============================================================

  @Sprint1 @critical
  Scenario: #2.2 Crear OC con líneas de detalle — flujo completo
    Given existe un proveedor activo y artículos clasificados
    When el usuario selecciona un proveedor
    And selecciona moneda y condición de pago
    And ingresa fecha de emisión y fecha de entrega (entrega >= emisión)
    And ingresa dirección de entrega
    And agrega una línea con artículo válido, cantidad (>0) y precio unitario (>0.0001)
    And agrega una segunda línea
    And guarda la OC
    Then la OC debe guardarse con numeración "OC-YYYY-CORRELATIVO"
    And el estado debe ser "Pendiente"
    And debe mostrar toast de éxito
    And los cálculos deben ser correctos: subtotal = Σ(cantidad × precio unitario), impuestos, total

  @Sprint1 @high
  Scenario: #2.2b Crear OC en moneda extranjera con tipo de cambio
    Given existe un proveedor activo y artículos clasificados
    When el usuario selecciona un proveedor
    And selecciona moneda "USD"
    Then el campo Tipo de Cambio debe ser obligatorio y estar visible
    When ingresa tipo de cambio vigente
    And completa los datos de cabecera y detalle
    And guarda la OC
    Then la OC debe guardarse en USD con TC registrado
    And los totales deben mostrar: total MN, total ME, TC aplicado

  # ============================================================
  # VALIDACIONES
  # ============================================================

  @Sprint1 @critical
  Scenario: #2.3a Validar proveedor activo en OC
    Given existe un proveedor en estado "Inactivo" en el maestro
    When el usuario intenta seleccionarlo en el campo Proveedor de la OC
    Then el proveedor inactivo no debe aparecer en el autocompletado
    And debe mostrar solo proveedores con estado "Activo"

  @Sprint1 @high
  Scenario: #2.3b Validaciones de detalle de OC
    Given el usuario tiene un proveedor seleccionado en la cabecera
    When intenta agregar línea sin artículo
    Then debe validar "Seleccione un artículo"
    When ingresa cantidad 0 o negativa
    Then debe validar "Cantidad debe ser mayor a 0"
    When ingresa precio unitario < 0.0001
    Then debe validar "Precio mínimo 0.0001"
    When ingresa precio con más de 4 decimales
    Then debe validar "Máximo 4 decimales"
    When selecciona fecha de entrega anterior a fecha de emisión
    Then debe validar "La fecha de entrega debe ser >= fecha de emisión"

  @Sprint1 @high
  Scenario: #2.3c Validar artículos del maestro de artículos
    Given existe un artículo clasificado en el maestro de artículos
    When el usuario busca el artículo por código en el detalle de OC
    Then la descripción y unidad de medida deben cargarse automáticamente
    When busca un código inexistente
    Then debe mostrar "Artículo no encontrado"

  # ============================================================
  # ACCIONES SOBRE OC: PDF, EDICIÓN, BLOQUEO
  # ============================================================

  @Sprint1 @high
  Scenario: #2.4 Generar PDF de OC
    Given existe una OC guardada
    When el usuario abre la OC
    And hace clic en "Generar PDF"
    Then debe descargarse un PDF con: logo empresa, N° OC, datos proveedor, fecha emisión/entrega, dirección entrega, moneda, TC, condición de pago, detalle de líneas (código, descripción, UMed, cantidad, precio unitario 4 decimales, subtotal, impuestos, total línea), subtotal general, impuestos, total orden, usuario que emite y quien autoriza

  @Sprint1 @high
  Scenario: #2.7a Bloqueo de edición en OC aprobada
    Given existe una OC en estado "Aprobada"
    When el usuario intenta editar campos o agregar/quitar líneas
    Then los campos deben estar deshabilitados
    And debe mostrar mensaje "No es posible modificar una orden de compra aprobada"

  @Sprint1 @high
  Scenario: #2.7b Bloqueo de edición en OC Cerrada
    Given existe una OC en estado "Cerrada"
    When el usuario intenta modificar la OC
    Then los campos deben estar deshabilitados
    And debe mostrar mensaje "No es posible modificar una orden de compra cerrada"

  @Sprint1 @high
  Scenario: #2.7c Edición permitida en OC Pendiente y Rechazada
    Given existe una OC en estado "Pendiente"
    When el usuario modifica la cantidad de una línea
    And guarda los cambios
    Then los cambios deben persistir correctamente
    Given existe una OC en estado "Rechazada"
    When el usuario modifica el proveedor y guarda
    Then los cambios deben persistir

  # ============================================================
  # LISTADO, BÚSQUEDA Y FILTROS
  # ============================================================

  @Sprint1 @critical
  Scenario: #2.5 Listado de OC con columnas y filtros
    Given existen múltiples OC en distintos estados
    When el usuario navega al listado de OC
    Then debe mostrar las columnas:
      | N° OC | Doc del Proveedor | Proveedor | Sucursal | Almacén | Dirección Fiscal | Fecha de registro | Fecha de entrega | Dirección de entrega | Moneda | Tipo de cambio | Condición de pago | Estado |
    And las acciones disponibles deben ser: Ver | Editar | Aprobar | Anular | Exportar (Excel/PDF)
    When filtra por N° OC, proveedor, estado, fecha y sucursal combinados
    Then los filtros combinados deben funcionar
    When exporta a Excel/PDF
    Then la exportación debe incluir todas las columnas

  # ============================================================
  # CARGA MASIVA
  # ============================================================

  @Sprint1 @high
  Scenario: #2.6 Carga masiva de OC desde Excel
    Given el usuario tiene un proveedor seleccionado en cabecera
    When descarga la plantilla Excel
    Then la plantilla debe contener las columnas: Código producto (*) | Descripción | Cantidad (*) | Costo unitario (*) | Total
    When llena la plantilla con datos válidos
    And importa el archivo
    Then debe mostrar resumen: N líneas válidas, N errores
    And los errores deben ser corregibles línea por línea

  # ============================================================
  # AUDITORÍA
  # ============================================================

  @Sprint1 @high
  Scenario: #2.9 Log de auditoría registra todas las acciones de OC
    Given el usuario crea, modifica y aprueba una OC
    When consulta el log de auditoría contable
    Then cada acción debe registrar: usuario, fecha, hora, acción (crear/modificar/anular/aprobar)
    And la OC debe aparecer referenciada en el log con su número

  # ============================================================
  # ESTADOS DE ERROR
  # ============================================================

  @Sprint1 @medium
  Scenario: #2.8 Estado de error en listado OC
    Given el servicio de OC no está disponible
    When el usuario carga el listado
    Then debe mostrar mensaje "Error al cargar órdenes de compra. Intente nuevamente"
    And debe mostrar botón "Reintentar"
```

---

## Feature: Aprobación de OC (#3)

```gherkin
@Sprint1 @module-compras @critical
Feature: Aprobación de Orden de Compra
  Como aprobador
  Quiero aprobar, rechazar o retornar OC pendientes
  Para controlar las compras antes de su ejecución

  @Sprint1 @critical
  Scenario: #3.1 Listado de OC pendientes de aprobación
    Given existen OC en estado "Pendiente de aprobación"
    When el usuario navega a "Aprobación de OC"
    Then debe mostrar columnas: N° OC, Proveedor, Fecha, Monto, Estado
    And debe mostrar botones "Aprobar", "Rechazar", "Retornar" por fila
    And solo deben mostrarse OC con estado Pendiente

  @Sprint1 @critical
  Scenario: #3.2 Aprobar OC — flujo exitoso
    Given existe una OC pendiente creada por un usuario distinto al aprobador
    When el aprobador hace clic en "Aprobar"
    And confirma en el modal
    Then la OC debe cambiar a estado "Aprobada"
    And debe desaparecer del listado de pendientes
    And el creador debe recibir notificación

  @Sprint1 @high
  Scenario: #3.3 Rechazar OC con comentario obligatorio
    Given existe una OC pendiente
    When el aprobador hace clic en "Rechazar"
    And no ingresa comentario
    Then el botón de confirmación debe estar deshabilitado
    When ingresa motivo de rechazo
    And confirma
    Then la OC debe cambiar a estado "Rechazada"
    And el motivo debe ser visible en el detalle

  @Sprint1 @high
  Scenario: #3.4 Retornar OC para correcciones
    Given existe una OC pendiente
    When el aprobador hace clic en "Retornar"
    And ingresa comentario con observaciones
    And confirma
    Then la OC debe cambiar a estado "Retornada"
    And el creador debe poder editar y reenviar la OC

  @Sprint1 @high
  Scenario: #3.5 Aprobación multinivel por monto > S/20,000
    Given existe una OC con monto total > S/20,000
    When el primer aprobador aprueba la OC
    Then la OC debe quedar en estado "Pendiente 2° nivel"
    When el segundo aprobador (gerente finanzas) aprueba
    Then la OC debe pasar a estado "Aprobada"
    And cada aprobación debe registrarse en log con usuario y fecha

  @Sprint1 @high
  Scenario: #3.6 Notificaciones automáticas al creador
    Given existe una OC pendiente creada por Usuario A
    When un aprobador rechaza la OC
    Then Usuario A debe recibir notificación
    When un aprobador retorna la OC
    Then Usuario A debe recibir notificación
    When un aprobador aprueba la OC
    Then Usuario A debe recibir notificación
    And el mensaje debe incluir: N° OC, proveedor, monto, acción, usuario que ejecutó
```

---

## Feature: Orden de Servicios (#4, #5)

```gherkin
@Sprint1 @module-compras @high
Feature: Orden de Servicios — Generación y Aprobación
  Como usuario de Compras
  Quiero crear y aprobar órdenes de servicio
  Para gestionar servicios contratados a proveedores

  @Sprint1 @high
  Scenario: #4.1 Crear OS vinculada a proveedor/servicio
    Given existen proveedores de servicios y catálogo de servicios
    When el usuario navega a "Orden de Servicios > Nueva"
    And selecciona un proveedor con autocompletado
    And selecciona tipo de servicio
    And ingresa descripción, monto y fechas
    And guarda
    Then la OS debe crearse con numeración automática
    And debe mostrar estado "Pendiente"

  @Sprint1 @medium
  Scenario: #4.2 Validaciones en formulario de OS
    When el usuario intenta guardar sin proveedor
    Then debe mostrar error de validación
    When intenta guardar con monto 0 o negativo
    Then debe mostrar error de validación
    When selecciona fecha fin anterior a fecha inicio
    Then debe mostrar error de validación

  @Sprint1 @high
  Scenario: #5.1 Aprobar OS con acta de conformidad
    Given existe una OS en estado "Pendiente de aprobación"
    When el aprobador revisa el detalle del servicio
    And marca conformidad
    Then la OS debe pasar a estado "Conforme"
    And debe aparecer en CxP para facturación
```

---

## Feature: Cuentas por Pagar — Registro CxP (#6)

```gherkin
@Sprint1 @module-finanzas @critical @smoke
Feature: Cuentas por Pagar — Registro de facturas
  Como usuario de Finanzas
  Quiero registrar facturas de proveedores vinculadas o no a OC
  Para gestionar las cuentas por pagar

  @Sprint1 @critical
  Scenario: #6.1 Importar factura desde Almacén vinculada a OC
    Given existe una OC aprobada con recepción en Almacén registrada
    When el usuario navega a "Cuentas por Pagar > Ingreso de Facturas"
    And importa la factura desde Almacén
    Then los datos de la OC y recepción deben precargarse
    And si cantidades/montos coinciden: estado "Validada"
    And si hay diferencia: debe mostrar alerta de discrepancia

  @Sprint1 @critical
  Scenario: #6.2 Factura directa sin OC — servicios
    Given existe un proveedor activo con cuentas contables configuradas
    When el usuario selecciona "Nuevo Registro Manual > Factura Directa"
    And selecciona un proveedor
    Then Razón Social y País deben ser solo lectura
    When ingresa N° Factura, Fecha Emisión, Vencimiento, Moneda, Tipo Gasto, CC, Cuenta Contable
    And ingresa Subtotal e IGV
    And guarda
    Then la factura debe quedar en estado "Pendiente de Validación"

  @Sprint1 @high
  Scenario: #6.3 Validación duplicado de factura
    Given existe una factura F001-000123 para Proveedor X en 2026
    When el usuario crea una nueva factura con el mismo proveedor y número F001-000123
    Then debe mostrar mensaje "La factura ya se encuentra registrada para este proveedor"

  @Sprint1 @high
  Scenario: #6.4 Detracción en factura con OC
    Given existe una OC > S/700 con catálogo de detracciones configurado
    When el usuario registra factura vinculada a la OC
    And marca "Aplica detracción"
    And selecciona el código de detracción
    Then debe verificar el % de detracción
    And el sistema debe generar documento DE por pagar
    And el saldo factura = total - detracción

  @Sprint1 @critical
  Scenario: #6.5 Aprobación de factura — asiento contable automático
    Given existe una factura en estado "Pendiente de Validación"
    When un Supervisor Financiero hace clic en "Aprobar Factura"
    Then la factura debe pasar a estado "Aprobada"
    And debe generarse asiento automático: Débito Gasto/Activo, Crédito CxP
    And la factura aprobada debe estar bloqueada para edición

  @Sprint1 @medium
  Scenario: #6.6 Consulta de CxP con filtros avanzados
    Given existen múltiples facturas en distintos estados
    When el usuario filtra por estado, proveedor, fechas, tipo comprobante, moneda
    Then los filtros combinados deben funcionar
    And el detalle debe mostrar: cabecera, líneas, documentos vinculados, asiento
    And el saldo pendiente debe ser visible

  @Sprint1 @high
  Scenario: #6.7 Anular factura antes de contabilización
    Given existe una factura en estado "Pendiente" o "Validada"
    When el usuario hace clic en "Anular"
    And ingresa motivo
    And confirma
    Then la factura debe cambiar a estado "Anulada"
```

---

## Feature: Nota Débito / Crédito y Ajustes de Deuda (#7)

```gherkin
@Sprint1 @module-finanzas @high
Feature: Nota Débito / Crédito — Ajustes de deuda
  Como usuario de Finanzas
  Quiero emitir NC/ND vinculadas a facturas CxP
  Para ajustar saldos pendientes

  @Sprint1 @high
  Scenario: #7.1 Emitir NC vinculada a factura con saldo pendiente
    Given existe una factura CxP con saldo > 0
    When el usuario navega a "Registro de Ajustes > Nuevo"
    And selecciona tipo "Nota de Crédito"
    And vincula la factura
    And ingresa serie/número, monto y motivo (mín 10 caracteres)
    And guarda
    Then el ajuste debe quedar vinculado a la factura
    And el saldo de la factura debe reducirse

  @Sprint1 @high
  Scenario: #7.2 Validación — monto ajuste <= saldo pendiente
    Given existe una factura con saldo S/1,000
    When el usuario crea una NC por S/1,200
    Then debe mostrar mensaje "Monto supera saldo pendiente"
    And no debe permitir aplicar

  @Sprint1 @medium
  Scenario: #7.3 Validación de moneda y tipo de cambio
    Given existe una factura en USD con TC
    When el usuario crea un ajuste en PEN contra la factura USD
    Then el sistema debe detectar moneda diferente
    And debe mostrar el TC aplicado

  @Sprint1 @high
  Scenario: #7.4 Bloqueo ajuste sobre factura cancelada
    Given existe una factura en estado "Cancelada"
    When el usuario intenta crear una NC vinculada a esta factura
    Then debe mostrar mensaje "Factura cancelada. No posible registrar ajustes"

  @Sprint1 @medium
  Scenario: #7.5 Adjuntar XML y control duplicidad
    When el usuario adjunta un XML a una NC
    Then el archivo debe subirse correctamente
    When intenta crear otra NC con misma serie/número para el mismo proveedor
    Then debe mostrar "Documento ya existe para este proveedor"

  @Sprint1 @high
  Scenario: #7.6 Anular ajuste con reverso contable
    Given existe un ajuste en estado "Aplicado"
    When el usuario hace clic en "Anular"
    And ingresa motivo
    And confirma
    Then el estado debe cambiar a "Anulado"
    And debe generarse asiento reverso
    And el saldo de la factura debe restaurarse
```

---

## Feature: Documentos por Pagar Directo — Individual (#8)

```gherkin
@Sprint1 @module-finanzas @medium
Feature: Documentos por Pagar Directo — DPD
  Como usuario de Finanzas
  Quiero crear, modificar y consultar DPD
  Para registrar pagos directos a proveedores

  @Sprint1 @medium
  Scenario: #8.1 DPD — alta, modificación y consulta
    Given existe un proveedor en el sistema
    When el usuario completa los datos del DPD
    And guarda
    Then el DPD debe registrarse y aparecer en el listado
    When el usuario modifica el monto
    And guarda
    Then la modificación debe persistir correctamente
    When consulta el DPD
    Then los datos deben mostrarse correctamente
```

---

## Feature: Reportes de Compras (#9)

```gherkin
@Sprint1 @module-compras @high
Feature: Reportes de Compras
  Como usuario de Compras
  Quiero ejecutar y exportar reportes de gestión de compras
  Para analizar las transacciones del período

  @Sprint1 @high
  Scenario: #9.1 Ejecutar reporte de gestión de compras al detalle (sp_generar_reporte_compras)
    Given existen datos de compras en el período seleccionado
    When el usuario selecciona un rango de fechas
    And ejecuta el reporte
    Then debe mostrar tabla con: proveedor, OC, fecha, monto, estado
    And debe poder exportar a Excel/PDF
    And debe mostrar indicador de carga durante la ejecución

  @Sprint1 @medium
  Scenario: #9.2 Reporte sin datos
    Given no existen compras en el período seleccionado
    When el usuario ejecuta el reporte
    Then debe mostrar mensaje "No se encontraron registros"
    And el botón de exportar debe estar deshabilitado
```

---

## Feature: Reportes de Ventas — SUNAT + Tributario (#10, #11)

```gherkin
@Sprint1 @module-ventas @high
Feature: Reportes de Ventas
  Como usuario de Ventas
  Quiero generar reportes de ventas en formato SUNAT y tributario
  Para cumplir con obligaciones fiscales

  @Sprint1 @high
  Scenario: #10.1 Registro de Ventas — Formato SUNAT (ventas.sp_generar_registro_ventas)
    Given existen ventas registradas en el período
    When el usuario selecciona el período
    And ejecuta el reporte
    Then debe mostrar tabla con formato SUNAT: RUC, tipo comprobante, serie, número, base imponible, IGV, total

  @Sprint1 @high
  Scenario: #11.1 Reporte tributario por período (IGV, Retenciones)
    Given existen operaciones mensuales registradas
    When el usuario selecciona el período
    And ejecuta el reporte tributario
    Then debe mostrar resumen: IGV débito, IGV crédito, retenciones
    And los totales deben ser correctos
```

---

## Feature: Maestros Financieros Base (#15, #16, #17, #33)

```gherkin
@Sprint1 @module-finanzas @high @smoke
Feature: Maestros Financieros Base
  Como usuario de Finanzas
  Quiero gestionar catálogos base: cuentas bancarias, medios/forma de pago, tipo de cambio
  Para configurar el módulo financiero

  @Sprint1 @high
  Scenario: #15.1 CRUD Cuenta Bancaria
    When el usuario crea una cuenta bancaria con datos válidos
    Then la cuenta debe guardarse correctamente
    When edita el número de cuenta
    Then los cambios deben persistir
    When desactiva la cuenta
    Then la cuenta no debe aparecer en combos de transacciones

  @Sprint1 @medium
  Scenario: #16.1 CRUD Medios de Pago SUNAT
    When el usuario crea un medio de pago con código SUNAT único
    Then debe guardarse correctamente
    When edita la descripción
    Then los cambios deben persistir
    When intenta eliminar un medio referenciado
    Then debe mostrar mensaje de bloqueo

  @Sprint1 @medium
  Scenario: #17.1 CRUD Formas de Pago SUNAT
    When el usuario crea una forma de pago con código SUNAT
    Then el CRUD completo debe funcionar

  @Sprint1 @high
  Scenario: #33.1 CRUD Tipo de Cambio — validar fn_obtener_tipo_cambio
    Given no existe TC para la fecha 2026-06-17
    When el usuario registra TC compra/venta para esa fecha
    Then debe guardarse correctamente
    And al crear una OC en moneda extranjera, el TC debe cargarse automáticamente

  @Sprint1 @high
  Scenario: #33.2 Tipo de Cambio — fecha duplicada
    Given existe un TC registrado para 2026-06-17
    When el usuario intenta crear otro TC para la misma fecha
    Then debe mostrar mensaje "Ya existe TC para esta fecha"
    And debe ofrecer opción de editar el existente
```

---

## Feature: E2E Scripteados — Sprint 1

```gherkin
@Sprint1 @critical @smoke @e2e
Feature: E2E Sprint 1 — Flujos transversales

  @Sprint1 @critical @e2e
  Scenario: E2E-01 Compras completo: Proveedor → OC → Aprobación → Factura CxP → Reporte
    Given datos maestros básicos cargados en el sistema
    When el usuario crea un nuevo proveedor
    And crea una OC con líneas de detalle
    And envía la OC a aprobación
    And el aprobador aprueba la OC
    And el usuario registra una factura CxP vinculada a la OC
    And ejecuta el reporte de gestión de compras
    Then los datos deben fluir correctamente entre cada paso
    And los totales de la OC deben coincidir con la factura
    And el reporte debe incluir la transacción

  @Sprint1 @high @e2e
  Scenario: E2E-02 Ventas: Registro Ventas SUNAT + Reporte Tributario
    Given existen ventas registradas en el período
    When el usuario genera el Registro de Ventas SUNAT
    And genera el Reporte Tributario para el mismo período
    Then los totales de IGV deben coincidir entre ambos reportes

  @Sprint1 @high @e2e
  Scenario: E2E-03 Finanzas Base: Cuenta + Medio Pago + Forma Pago + TC
    When el usuario crea una cuenta bancaria
    And crea un medio de pago
    And crea una forma de pago
    And registra un tipo de cambio
    Then todos los maestros deben aparecer en los selectores de transacciones CxP
```

---

# Sprint 2 — Módulo Finanzas + Contabilidad

---

## Feature: Tablas Financieras (#12, #13, #14)

```gherkin
@Sprint2 @module-finanzas @high
Feature: Tablas Financieras
  Como usuario de Finanzas
  Quiero mantener catálogos financieros: tipos de documento, conceptos financieros, flujo de caja
  Para configurar la base del módulo financiero

  @Sprint2 @high
  Scenario: #12.1 CRUD Tipos de Documento
    When el usuario navega a "Finanzas > Documentos > Tipos de Documentos"
    And crea un tipo con código SUNAT único
    Then debe guardarse correctamente
    When edita el tipo
    Then los cambios deben persistir
    When desactiva el tipo
    Then debe dejar de aparecer en combos

  @Sprint2 @high
  Scenario: #13.1 CRUD Conceptos Financieros
    When el usuario crea un concepto financiero con tipo (ingreso/gasto)
    And asocia una cuenta contable
    Then debe guardarse correctamente
    And debe aparecer en el listado jerárquico

  @Sprint2 @high
  Scenario: #14.1 CRUD Grupos de Flujo de Caja
    When el usuario crea un grupo de flujo de caja
    Then debe guardarse correctamente
    And debe permitir crear códigos dentro del grupo

  @Sprint2 @high
  Scenario: #14.2 Validación dependencia al eliminar grupo
    Given existe un grupo con códigos asociados
    When el usuario intenta eliminar el grupo
    Then debe mostrar mensaje de dependencia y bloquear eliminación
```

---

## Feature: Solicitud de Adelantos — Órdenes de Giro (#18, #19)

```gherkin
@Sprint2 @module-finanzas @critical
Feature: Órdenes de Giro — Creación y Aprobación
  Como usuario de Finanzas
  Quiero crear y aprobar órdenes de giro para adelantos
  Para gestionar solicitudes de adelanto

  @Sprint2 @critical
  Scenario: #18.1 Crear Orden de Giro
    Given existe un colaborador/proveedor y concepto financiero configurado
    When el usuario navega a "Solicitud de Adelantos > Generación de OG"
    And selecciona beneficiario, ingresa monto, concepto y fecha
    And guarda
    Then la OG debe crearse con numeración automática
    And el estado debe ser "Pendiente de aprobación"

  @Sprint2 @high
  Scenario: #19.1 Aprobar Orden de Giro
    Given existe una OG en estado "Pendiente de aprobación"
    When el aprobador hace clic en "Aprobar"
    Then la OG debe pasar a estado "Aprobada"

  @Sprint2 @high
  Scenario: #19.2 Rechazar Orden de Giro
    Given existe una OG pendiente
    When el aprobador hace clic en "Rechazar"
    And no ingresa motivo
    Then el botón de confirmación debe estar deshabilitado
    When ingresa motivo obligatorio
    And confirma
    Then la OG debe pasar a estado "Rechazada"
    And el motivo debe ser visible

  @Sprint2 @medium
  Scenario: #18.2 Validaciones en OG — montos y fechas
    When el usuario ingresa un monto mayor al saldo disponible
    Then debe mostrar error de validación
    When ingresa fecha de adelanto posterior a la fecha actual
    Then debe mostrar error de validación
```

---

## Feature: Rendición de Gastos (#20, #21, #22)

```gherkin
@Sprint2 @module-finanzas @high
Feature: Rendición de Gastos
  Como usuario de Finanzas
  Quiero rendir, aprobar y cerrar liquidaciones de gastos
  Para gestionar la rendición de adelantos

  @Sprint2 @high
  Scenario: #20.1 Liquidación de gastos — colaborador/proveedor
    Given existe una OG aprobada
    When el usuario navega a "Rendición de Gastos"
    And selecciona la OG aprobada
    And agrega comprobantes de gasto con tipo, monto y archivo adjunto
    And guarda la liquidación
    Then cada gasto debe registrarse como detalle
    And el total rendido no debe exceder el monto de la OG

  @Sprint2 @high
  Scenario: #21.1 Aprobación de rendición
    Given existe una liquidación de gastos enviada
    When el aprobador revisa los comprobantes
    And aprueba totalmente
    Then la rendición debe quedar aprobada
    When existen observaciones
    And el aprobador aprueba parcialmente
    Then la línea observada debe actualizarse

  @Sprint2 @high
  Scenario: #22.1 Cierre de liquidación de adelantos
    Given existe una rendición aprobada
    When el usuario cierra la liquidación
    Then el estado debe cambiar a "Cerrada"
    And no debe poder modificarse después del cierre
```

---

## Feature: Tesorería — Cartera de Pagos y Cobros (#23, #24, #25, #26)

```gherkin
@Sprint2 @module-finanzas @critical
Feature: Tesorería — Cartera de Pagos y Cobros
  Como usuario de Tesorería
  Quiero gestionar pagos y cobros en cartera
  Para administrar la liquidez

  @Sprint2 @critical
  Scenario: #23.1 Programar y registrar pago en cartera de pagos
    Given existe una CxP pendiente de pago
    When el usuario navega a "Cartera de Pagos"
    And selecciona el documento para pago
    And ingresa fecha, forma de pago y cuenta bancaria
    And confirma el pago
    Then la CxP debe marcarse como pagada
    And el saldo de la cuenta bancaria debe actualizarse

  @Sprint2 @high
  Scenario: #24.1 Registrar cobro en cartera de cobros
    Given existe un documento de venta pendiente de cobro
    When el usuario navega a "Cartera de Cobros"
    And selecciona el documento
    And ingresa monto, fecha y forma de cobro
    And confirma
    Then el documento debe marcarse como cobrado

  @Sprint2 @high
  Scenario: #25.1 Aplicación de documentos
    Given existen un pago registrado y documentos abiertos
    When el usuario navega a "Aplicación de Documentos"
    And selecciona el pago
    And lo aplica a uno o varios documentos
    Then el monto debe distribuirse entre los documentos seleccionados
    And los saldos individuales deben actualizarse

  @Sprint2 @high
  Scenario: #26.1 Anulación de pago en cartera
    Given existe un pago registrado
    When el usuario navega a "Cartera de Pagos > Anulación"
    And busca el pago
    And confirma anulación con motivo obligatorio
    Then el pago debe reversarse
    And el documento original debe volver a estado Pendiente
```

---

## Feature: Transferencias entre Cuentas (#27)

```gherkin
@Sprint2 @module-finanzas @high
Feature: Transferencias entre Cuentas
  Como usuario de Tesorería
  Quiero crear y confirmar transferencias entre cuentas bancarias
  Para mover fondos entre cuentas

  @Sprint2 @high
  Scenario: #27.1 Alta y confirmación de transferencia
    Given existen dos cuentas bancarias activas
    When el usuario navega a "Transferencias > Nueva"
    And selecciona cuenta origen y destino
    And ingresa monto, fecha y concepto
    And guarda
    Then la transferencia debe quedar en estado "Pendiente confirmación"
    When el usuario confirma la transferencia
    Then el saldo de origen debe disminuir
    And el saldo de destino debe aumentar
    And si el monto excede el saldo de origen, debe mostrar error
```

---

## Feature: Tablas Contables (#28, #29, #30, #31, #32, #34)

```gherkin
@Sprint2 @module-contabilidad @high
Feature: Tablas Contables
  Como usuario de Contabilidad
  Quiero mantener la base contable: plan de cuentas, centros de costo, matriz contable, detracciones, impuestos, UIT
  Para configurar el módulo contable

  @Sprint2 @high
  Scenario: #28.1 CRUD/Import Plan Contable
    When el usuario navega a "Contabilidad > Plan Contable"
    Then debe mostrar árbol de cuentas expandible
    When crea una cuenta hija
    Then debe validar código de cuenta por nivel
    When importa desde Excel
    Then debe mostrar resumen de cuentas creadas

  @Sprint2 @medium
  Scenario: #29.1 Árbol de centros de costo
    When el usuario navega a "Plan de Centros de Costo"
    Then debe mostrar estructura jerárquica colapsable/expandible
    When agrega un nodo
    Then el CRUD debe funcionar correctamente

  @Sprint2 @high
  Scenario: #30.1 Matriz Contable — mantener
    Given existen conceptos financieros y plan contable configurados
    When el usuario navega a "Matriz Contable"
    And selecciona un concepto
    And asocia cuenta contable (debe/haber)
    And guarda
    Then la asociación debe persistir
    And debe validarse que la cuenta existe en el plan contable

  @Sprint2 @high
  Scenario: #31.1 CRUD Detracciones/Retenciones
    When el usuario crea un tipo de detracción con código SUNAT y %
    Then debe guardarse correctamente
    And el porcentaje debe validarse en rango 0-100

  @Sprint2 @high
  Scenario: #32.1 CRUD Impuestos
    When el usuario crea un impuesto con código, nombre y porcentaje
    Then debe guardarse correctamente
    And el impuesto activo debe aparecer en combos de documentos

  @Sprint2 @medium
  Scenario: #34.1 CRUD UIT Vigente
    When el usuario registra una UIT con año y monto
    Then debe guardarse correctamente
    When intenta registrar otra UIT para el mismo año
    Then debe mostrar validación de año duplicado
```

---

## Feature: Reportes y Procesos Contables (#35, #36, #37)

```gherkin
@Sprint2 @module-contabilidad @high
Feature: Reportes y Procesos Contables SUNAT
  Como usuario de Contabilidad
  Quiero generar reportes SUNAT y procesar libros electrónicos
  Para cumplir con obligaciones contables

  @Sprint2 @high
  Scenario: #35.1 Formato 5.2 — Libro Diario Simplificado (sp_generar_libro_diario_simplificado)
    Given existen asientos contables registrados
    When el usuario navega a "Formatos SUNAT > Formato 5.2"
    And selecciona período
    And ejecuta
    Then debe mostrar tabla con formato SUNAT: cuenta, descripción, debe, haber
    And los totales deben coincidir (debe = haber)
    And debe poder exportar

  @Sprint2 @high
  Scenario: #36.1 Generar reporte SUNAT formatos básicos (sp_generar_reporte_sunat)
    Given existen datos contables en el período
    When el usuario navega a "Contabilidad > Formatos SUNAT (básicos)"
    And selecciona período
    And ejecuta el reporte
    Then debe generarse el reporte SUNAT exitosamente
    And debe mostrar los datos en formato estructurado
    And debe permitir exportación

  @Sprint2 @high
  Scenario: #37.1 Procesar PLE — Libros Electrónicos (sp_generar_libros_electronicos)
    Given existen datos contables del período
    When el usuario navega a "Libros Electrónicos > Procesar PLE"
    And selecciona período y libros a incluir
    And ejecuta
    Then debe mostrar indicador de progreso
    And debe mostrar resumen: registros procesados, errores
    And debe generar archivos TXT/PDF para SUNAT
```

---

## Feature: E2E Scripteados — Sprint 2

```gherkin
@Sprint2 @critical @smoke @e2e
Feature: E2E Sprint 2 — Flujos transversales

  @Sprint2 @critical @e2e
  Scenario: E2E-01 Adelantos → Tesorería completo: OG → aprobación → liquidación → cierre → cartera pagos
    Given existen colaborador, conceptos y cuentas bancarias configurados
    When el usuario crea una OG
    And es aprobada
    And se rinden gastos con comprobantes adjuntos
    And la rendición es aprobada
    And se cierra la liquidación
    And se programa el pago en cartera
    Then todos los estados fluyen secuencialmente
    And los montos cuadran en cada paso
    And el pago se refleja en la cuenta bancaria

  @Sprint2 @high @e2e
  Scenario: E2E-02 Cartera CxC: cobro → aplicación → anulación
    Given existe un documento de venta pendiente
    When el usuario registra un cobro en cartera
    And aplica el pago al documento
    Then el documento debe marcarse como cobrado
    When anula el pago
    Then el documento debe volver a estado Pendiente

  @Sprint2 @high @e2e
  Scenario: E2E-03 Contabilidad: Plan Contable + Libro Diario + PLE
    Given existen asientos contables registrados
    When el usuario verifica el plan contable
    And genera el libro diario Formato 5.2
    And procesa el PLE para los mismos datos
    Then los SPs se ejecutan sin errores
    And los datos del libro diario coinciden con los libros electrónicos
```

---

# Sprint 3 — Módulo Activos Fijos + RR.HH (Inicio)

---

## Feature: Maestro Activos Fijos (#38)

```gherkin
@Sprint3 @module-activos @critical @smoke
Feature: Maestro Activos Fijos — Ficha completa multi-pestaña
  Como usuario de Activos Fijos
  Quiero registrar y gestionar activos fijos con ficha completa de 8 pestañas
  Para mantener el control de los activos de la empresa

  @Sprint3 @critical
  Scenario: #38.1 Alta de activo fijo — Datos Generales
    Given existe clasificación de activos y numerador configurados
    When el usuario navega a "Activos Fijos > Maestro > Nuevo"
    Then debe mostrar código autogenerado
    When completa: descripción, clasificación, marca/modelo/serie, proveedor, fecha adquisición, moneda, valor
    And guarda
    Then el activo debe crearse con estado "Activo"
    And las pestañas restantes deben estar habilitadas

  @Sprint3 @high
  Scenario: #38.2 Navegación y guardado por pestañas
    Given existe un activo creado con datos generales
    When el usuario navega por las 8 pestañas
    Then debe ver: Datos Generales, Complementarios, Accesorios, Depreciación, Incidencias, Adaptaciones, Traslados, Asignaciones
    When completa datos en Complementarios (ubicación, garantías)
    And guarda
    Then los cambios deben persistir sin afectar otras pestañas

  @Sprint3 @high
  Scenario: #38.3 Pestaña Accesorios y Depreciación
    Given existe un activo existente
    When en la pestaña Accesorios agrega accesorio con código, descripción y valor
    And en Depreciación selecciona método Lineal, tasa anual, fecha inicio y valor residual
    Then los valores de accesorios deben sumarse al valor total
    And los parámetros de depreciación deben guardarse correctamente

  @Sprint3 @high
  Scenario: #38.4 Pestañas Incidencias, Adaptaciones, Traslados, Asignaciones
    Given existe un activo existente
    When registra una incidencia con fecha, tipo, descripción y costo
    And registra una adaptación con valor incremental
    And registra un traslado con origen/destino
    And registra una asignación con responsable y centro de costo
    Then cada registro debe persistir en su pestaña
    And la adaptación debe incrementar el valor neto

  @Sprint3 @high
  Scenario: #38.5 Bloqueo en activo dado de baja
    Given existe un activo en estado "Baja"
    When el usuario intenta modificar depreciación
    Then debe mostrar mensaje "No es posible modificar un activo dado de baja"
    And los campos deben estar deshabilitados
```

---

## Feature: Parámetros y Configuración de Activos (#39, #40, #41, #42)

```gherkin
@Sprint3 @module-activos @high
Feature: Parámetros de Activos Fijos
  Como usuario de Activos Fijos
  Quiero configurar tipos de operación, incidencias, aseguradoras y matriz contable
  Para parametrizar el módulo

  @Sprint3 @high
  Scenario: #39.1 CRUD Tipos de Operación
    Given existe plan contable configurado
    When el usuario crea un tipo de operación con código único, naturaleza y cuenta contable
    Then debe guardarse correctamente
    When intenta eliminar un tipo usado en transacciones
    Then debe mostrar mensaje de bloqueo

  @Sprint3 @high
  Scenario: #40.1 CRUD Tipos de Incidencia
    When el usuario crea un tipo de incidencia con código, descripción e impacto
    And si el impacto es "Contable", asocia cuenta contable obligatoria
    Then debe guardarse correctamente

  @Sprint3 @high
  Scenario: #41.1 CRUD Aseguradoras
    When el usuario crea una aseguradora con RUC validado por país
    Then debe guardarse correctamente
    And debe estar disponible en selector de pólizas
    When desactiva una aseguradora con pólizas activas
    Then debe requerir confirmación

  @Sprint3 @high
  Scenario: #42.1 Matriz Contable por Subclase
    Given existen subclases de activo y plan contable activo
    When el usuario asocia: cuenta activo fijo, depreciación acumulada, gasto depreciación, ganancia/pérdida venta
    And guarda
    Then la configuración debe persistir
    When intenta registrar un activo sin matriz configurada
    Then debe bloquear el registro
```

---

## Feature: Operaciones de Activos Fijos (#43, #44)

```gherkin
@Sprint3 @module-activos @high
Feature: Operaciones de Activos Fijos
  Como usuario de Activos Fijos
  Quiero registrar operaciones especiales y procesar bajas
  Para gestionar el ciclo de vida de los activos

  @Sprint3 @high
  Scenario: #43.1 Operación especial — mejora capitalizable
    Given existe un activo activo
    When el usuario registra una mejora capitalizable con monto y nueva vida útil
    And contabiliza
    Then el valor neto del activo debe incrementar
    And la base depreciable debe recalcularse
    And debe generarse asiento contable

  @Sprint3 @high
  Scenario: #43.2 Operación especial — cambio de clasificación
    Given existe un activo activo y nueva clasificación con matriz contable
    When el usuario reclasifica el activo
    Then la clasificación debe validarse contra el catálogo jerárquico
    And las cuentas contables deben actualizarse

  @Sprint3 @critical
  Scenario: #44.1 Baja de activo por venta (sp_baja_activo_venta)
    Given existe un activo activo
    When el usuario inicia proceso de baja por venta
    And ingresa valor venta, comprador y documento
    Then el sistema debe calcular depreciación acumulada hasta la fecha
    And debe mostrar ganancia o pérdida (Valor Venta − Valor Neto Contable)
    When confirma la baja
    Then el activo debe cambiar a estado "BAJ-V"
    And debe generarse asiento contable automático

  @Sprint3 @high
  Scenario: #44.2 Baja de activo por siniestro
    Given existe un activo activo
    When el usuario inicia baja por siniestro con parte policial
    Then el valor venta debe ser 0 automáticamente
    And el activo debe cambiar a estado "BAJ-S"

  @Sprint3 @high
  Scenario: #44.3 Baja por obsolescencia
    Given existe un activo activo
    When el usuario inicia baja por obsolescencia con informe técnico
    Then el activo debe cambiar a estado "BAJ-O"
```

---

## Feature: Procesos de Activos Fijos (#45, #46, #47, #48, #49, #50, #51, #52)

```gherkin
@Sprint3 @module-activos @high
Feature: Procesos y Reportes de Activos Fijos
  Como usuario de Activos Fijos
  Quiero ejecutar procesos de depreciación, revaluación y generar reportes
  Para mantener la contabilidad de activos actualizada

  @Sprint3 @high
  Scenario: #46.1 Configuración de tasas y métodos de depreciación
    Given existe un activo con valor de adquisición
    When el usuario configura método Lineal, tasa contable 20% y valor residual <= 20%
    And distribuye 60% CC1, 40% CC2
    Then la simulación debe mostrar proyección correcta
    And las validaciones: tasa 0-100, residual <= 20%, distribución suma 100%

  @Sprint3 @high
  Scenario: #45.1 Revaluación técnica — wizard completo (sp_revaluacion_activo)
    Given existe un activo activo con matriz contable configurada
    When el usuario inicia revaluación tipo "Técnica"
    And sigue el wizard de 5 pasos: selección, valores, cálculo, previsualización, contabilización
    Then si nuevo valor > valor neto: debe generar superávit
    And si nuevo valor < valor neto: debe generar pérdida (cta 67xx)
    And el asiento debe estar balanceado

  @Sprint3 @medium
  Scenario: #45.2 Validaciones de revaluación
    Given existe un activo en estado "Baja"
    When el usuario intenta revaluarlo
    Then debe mostrar mensaje de bloqueo

  @Sprint3 @critical
  Scenario: #49.1 Cálculo masivo de depreciación mensual (sp_calcular_depreciacion)
    Given existen activos con tasas configuradas y período contable abierto
    When el usuario ejecuta cálculo masivo en modo "Prueba"
    Then debe mostrar barra de progreso y tabla temporal
    When ejecuta en modo "Definitivo"
    Then los datos deben persistir
    And no debe permitir ejecutar sobre período cerrado

  @Sprint3 @high
  Scenario: #50.1 Asientos contables de depreciación
    Given existe cálculo de depreciación ejecutado en modo definitivo
    When el usuario genera asientos de depreciación
    Then deben generarse pre-asientos en estado "Pendiente"
    And debe validarse balance débito = crédito
    And las cuentas deben ser: gasto depreciación (débito), depreciación acumulada (crédito)

  @Sprint3 @high
  Scenario: #51.1 Asientos contables de revaluación
    Given existe una revaluación en estado "Aprobado"
    When el usuario genera asientos de revaluación
    Then deben incluir: activo, depreciación acumulada, superávit/pérdida
    And el asiento debe estar balanceado

  @Sprint3 @medium
  Scenario: #52.1 Devengo mensual de primas de seguros
    Given existen pólizas vigentes y período contable abierto
    When el usuario ejecuta devengo mensual
    Then solo deben procesarse pólizas vigentes
    And el cálculo debe ser prima total / meses cobertura
    And el asiento debe ser: gasto seguro (débito), seguro diferido (crédito)

  @Sprint3 @medium
  Scenario: #47.1 Resumen Activo Fijo — listado (fn_valor_neto_activo)
    Given existen activos registrados con depreciación
    When el usuario genera el listado general
    And filtra por clase, ubicación, centro costo, estado
    Then debe mostrar: código, descripción, valor adquisición, depreciación acumulada, valor neto
    And debe poder exportar a Excel y PDF

  @Sprint3 @medium
  Scenario: #48.1 Depreciación Anual por Activo
    Given existe depreciación calculada en el período
    When el usuario consulta depreciación anual por activo
    Then debe mostrar: año, depreciación mensual, anual, acumulada, valor neto
    And debe mostrar proyección hasta fin de vida útil
```

---

## Feature: RR.HH — Configuración Inicial (#53, #54, #55)

```gherkin
@Sprint3 @module-rrhh @high
Feature: RR.HH — Parámetros de Configuración
  Como usuario de RR.HH
  Quiero configurar períodos de nómina, RMV y parámetros de control
  Para preparar el módulo de planillas

  @Sprint3 @high
  Scenario: #53.1 Definir períodos de nómina
    When el usuario navega a "RRHH > Configuración > Parámetros de Fechas"
    And crea un período con mes/año, fecha inicio, fecha fin, fecha pago
    Then debe guardarse correctamente
    And no debe permitir solapamiento de períodos

  @Sprint3 @medium
  Scenario: #54.1 Registrar Remuneración Mínima Vital
    When el usuario registra RMV con monto y fecha de vigencia
    Then debe guardarse correctamente
    And no debe permitir más de una RMV vigente por período

  @Sprint3 @medium
  Scenario: #55.1 Parámetros de Control RRHH
    When el usuario configura % ESSALUD, SNP, SPP
    Then los porcentajes deben validarse en rango 0-100
    And deben aplicarse en cálculo de planilla
```

---

## Feature: RR.HH — Datos del Personal (#56, #58)

```gherkin
@Sprint3 @module-rrhh @critical
Feature: RR.HH — Maestro de Personal
  Como usuario de RR.HH
  Quiero registrar trabajadores y definir cargos
  Para gestionar los datos del personal

  @Sprint3 @critical
  Scenario: #56.1 Ficha de trabajador — datos personales y contacto
    Given existen tipos de documento cargados
    When el usuario navega a "RRHH > Datos del Personal > Datos Generales"
    And ingresa: nombres, apellidos, tipo/nro documento, fecha nacimiento, sexo, contacto
    And guarda
    Then debe crearse con código de trabajador
    And debe validar DNI (8 dígitos) / CE (12 dígitos)

  @Sprint3 @high
  Scenario: #56.2 Validaciones de ficha de trabajador
    When el usuario ingresa DNI inválido (< 8 dígitos)
    Then debe mostrar error de validación
    When ingresa fecha de nacimiento futura
    Then debe mostrar error
    When ingresa email sin @
    Then debe mostrar error

  @Sprint3 @high
  Scenario: #58.1 Cargos y bandas salariales
    When el usuario navega a "Categorías/Cargos"
    And crea un cargo con nombre y banda salarial (mínimo, máximo)
    Then debe guardarse correctamente
    And al asignar a un trabajador, el salario debe validar contra la banda
```

---

## Feature: E2E Scripteados — Sprint 3

```gherkin
@Sprint3 @critical @smoke @e2e
Feature: E2E Sprint 3 — Flujos transversales

  @Sprint3 @critical @e2e
  Scenario: E2E-01 AF completo: Alta activo → Cálculo depreciación → Asientos
    Given existe clasificación con cuentas contables y parámetros de depreciación
    When el usuario crea un activo con clasificación y método depreciación
    And calcula la depreciación del período
    And genera asientos de depreciación
    Then los asientos deben usar las cuentas definidas en la clasificación

  @Sprint3 @high @e2e
  Scenario: E2E-02 Revaluación + Asientos de Revaluación
    Given existe un activo con antigüedad
    When el usuario ejecuta la revaluación del activo
    Then el activo debe reflejar el nuevo valor
    When genera asientos de revaluación
    Then deben debitar/acreditar cuentas de activo y patrimonio

  @Sprint3 @high @e2e
  Scenario: E2E-03 RRHH Maestros: Período + Trabajador + Cargo
    When el usuario crea un período de nómina
    And crea un cargo con banda salarial
    And crea un trabajador asignándole el cargo y salario
    Then los tres maestros deben crearse correctamente
    And el salario debe validar contra la banda del cargo
```

---

# Sprint 4 — Módulo RR.HH Completo

---

## Feature: Maestros RR.HH (#57, #59, #60)

```gherkin
@Sprint4 @module-rrhh @high @smoke
Feature: Maestros RR.HH
  Como usuario de RR.HH
  Quiero configurar tipos de contrato, AFP/EPS y calendarios
  Para preparar los maestros de planillas

  @Sprint4 @high
  Scenario: #57.1 CRUD Tipos de Contrato
    When el usuario crea un tipo de contrato con código, nombre y duración máxima
    Then debe guardarse correctamente
    And debe aparecer en combo de ficha de trabajador

  @Sprint4 @high
  Scenario: #59.1 CRUD AFP y EPS
    When el usuario crea una AFP con nombre, código SPP y tasa
    And crea una EPS
    Then deben guardarse correctamente
    And deben aparecer en selector de la ficha de trabajador

  @Sprint4 @medium
  Scenario: #60.1 Calendario de feriados y turnos
    When el usuario agrega feriados con fecha y descripción
    And crea un calendario laboral con turnos
    Then los feriados deben guardarse sin duplicados
    And los turnos deben asignarse correctamente a trabajadores
```

---

## Feature: Asistencias y Jornadas (#61)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Asistencias y Horas Extra
  Como usuario de RR.HH
  Quiero registrar asistencias con cálculo automático de HE
  Para controlar la jornada laboral

  @Sprint4 @high
  Scenario: #61.1 Registrar asistencia con horas extra
    Given existe un trabajador activo con calendario asignado
    When el usuario navega a "Asistencias y HE"
    And selecciona trabajador y fecha
    And marca hora de ingreso y salida
    And guarda
    Then las horas extra deben calcularse automáticamente
    And si la salida supera la jornada, las HE deben aparecer resaltadas

  @Sprint4 @medium
  Scenario: #61.2 Validaciones de asistencia
    When el usuario ingresa hora de salida < hora de entrada
    Then debe mostrar error de validación
    When ingresa fecha futura
    Then debe mostrar error
    When registra asistencia duplicada para la misma fecha
    Then debe mostrar opción de editar
```

---

## Feature: Vacaciones (#63)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Vacaciones por Trabajador
  Como usuario de RR.HH
  Quiero gestionar solicitudes de vacaciones
  Para controlar los días de descanso del personal

  @Sprint4 @high
  Scenario: #63.1 Solicitud de vacaciones y saldo (trg_actualizar_dias_gozados)
    Given existe un trabajador con días de vacaciones acumulados
    When el usuario navega a "Vacaciones por Trabajador"
    And selecciona el trabajador
    Then debe mostrar el saldo disponible
    When ingresa fecha inicio y fin
    And guarda la solicitud
    Then el saldo debe actualizarse dinámicamente
    And no debe permitir solicitar más días del saldo disponible

  @Sprint4 @medium
  Scenario: #63.2 Validación de fechas de vacaciones
    When el usuario ingresa fecha inicio > fecha fin
    Then debe mostrar error de validación
    When solicita más días del saldo disponible
    Then debe mostrar error
```

---

## Feature: Conceptos Fijos (Sueldo, Asignaciones, Descuentos) (#64)

```gherkin
@Sprint4 @module-rrhh @critical
Feature: Ganancias y Descuentos Fijos
  Como usuario de RR.HH
  Quiero configurar conceptos fijos de planilla
  Para definir los ingresos y descuentos recurrentes

  @Sprint4 @critical
  Scenario: #64.1 CRUD de concepto fijo — clasificación y vigencia
    When el usuario crea un concepto "Sueldo Base" tipo Ingreso, modo Fijo
    And crea "Préstamo" tipo Descuento, modo Porcentaje
    And crea "Essalud" tipo Aporte Patronal
    And asigna fechas de vigencia Desde/Hasta
    Then cada concepto debe guardarse con su clasificación correcta
    And el concepto no debe aplicarse fuera de su rango de fechas

  @Sprint4 @high
  Scenario: #64.2 Asociación de concepto fijo a trabajador/cargo
    Given existen conceptos fijos configurados
    When el usuario asocia un concepto a un trabajador específico
    And asocia otro concepto a un cargo completo
    Then ambos trabajadores deben tener los conceptos en su detalle de planilla

  @Sprint4 @high
  Scenario: #64.3 Concepto fijo con modo Porcentaje y Fórmula
    When el usuario crea un concepto "Comisión" modo Porcentaje (5%)
    And crea "Bono Producción" modo Fórmula
    Then en el detalle pre-confirmación los montos deben calcularse correctamente

  @Sprint4 @medium
  Scenario: #64.4 Detalle pre-confirmación de planilla
    Given existen conceptos fijos asignados a trabajadores
    When el usuario navega a "Cálculo de Planilla"
    And selecciona período
    And hace clic en "Simular"
    Then debe mostrar tabla expandible por trabajador con cada concepto y su monto

  @Sprint4 @high
  Scenario: #64.5 Importación masiva de conceptos fijos desde Excel
    Given existen conceptos maestros creados
    When el usuario descarga la plantilla Excel
    And la llena con trabajadores, conceptos y montos
    And importa
    Then debe mostrar resumen: N registros exitosos, N con errores

  @Sprint4 @medium
  Scenario: #64.6 Validación — no duplicar sueldo base por trabajador
    Given existe un trabajador con Sueldo Base ya asignado
    When el usuario asigna un segundo Sueldo Base al mismo trabajador
    Then debe mostrar mensaje de validación de duplicado

  @Sprint4 @medium
  Scenario: #64.7 Exportar reporte de conceptos fijos
    Given existen trabajadores con conceptos fijos asignados
    When el usuario exporta el reporte filtrado por sede
    Then el archivo debe contener: trabajador, concepto, tipo, monto, vigencia, estado
```

---

## Feature: Carga Masiva de Variables (HE, Bonos, Comisiones) (#65)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Ganancias y Descuentos Variables
  Como usuario de RR.HH
  Quiero cargar variables de planilla masivamente
  Para procesar HE, bonos y comisiones

  @Sprint4 @high
  Scenario: #65.1 Importación masiva desde archivo Excel/CSV
    Given existe una plantilla de carga descargada
    When el usuario selecciona un archivo Excel con HE y bonos
    Then el sistema debe validar estructura y columnas: periodo, ID trabajador, tipo variable, monto
    And debe mostrar resumen de registros válidos e inválidos

  @Sprint4 @medium
  Scenario: #65.2 Corrección de errores post-importación
    Given existen errores en la importación
    When el usuario edita el monto de una fila con error
    And revalida
    Then el registro debe marcarse como válido
    And solo debe permitir confirmar cuando todos los errores estén resueltos

  @Sprint4 @high
  Scenario: #65.3 Integración de variables con cálculo de planilla
    Given existen HE y bonos cargados para el período
    When el usuario navega a "Cálculo de Planilla" para el mismo período
    Then las HE deben aparecer en ingresos del trabajador
    And los bonos deben aparecer como concepto variable

  @Sprint4 @medium
  Scenario: #65.4 Programación automática de carga
    When el usuario configura una carga automática desde biométrico con frecuencia semanal
    Then la fuente debe mostrar "Automática (API)"
    And la bitácora debe registrar la ejecución programada
```

---

## Feature: Propinas — Distribución Automática (#66)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Distribución de Propinas (RestPE)
  Como usuario de RR.HH
  Quiero definir reglas y ejecutar distribución de propinas
  Para integrar propinas a la nómina (sp_calcular_propinas)

  @Sprint4 @high
  Scenario: #66.1 Definir regla de distribución de propinas
    When el usuario crea una regla tipo "% Fijo" con 10%
    And crea una regla "Por Rol" con % distinto por rol
    Then las reglas deben guardarse con código y descripción

  @Sprint4 @high
  Scenario: #66.2 Ejecutar distribución de propinas
    Given existen ventas del período con propinas registradas
    When el usuario selecciona período, sede y regla de distribución
    And ejecuta "Calcular Distribución"
    Then el monto total debe obtenerse automáticamente de Ventas/POS
    And los montos asignados deben respetar el % máximo legal

  @Sprint4 @medium
  Scenario: #66.3 Ajuste manual supervisado con trazabilidad
    Given existe una distribución en estado Pendiente
    When el usuario ajusta el monto de un trabajador
    And ingresa motivo del ajuste
    Then el log de auditoría debe registrar: usuario, fecha, monto anterior, nuevo, motivo

  @Sprint4 @high
  Scenario: #66.4 Validar, confirmar e integrar con planilla
    Given existe una distribución en estado Pendiente
    When el usuario valida y confirma la distribución
    Then el estado debe cambiar a "Aplicado"
    And en el cálculo de planilla del período, las propinas deben aparecer como concepto de ingreso

  @Sprint4 @medium
  Scenario: #66.5 Reportes de propinas
    Given existe una distribución confirmada
    When el usuario visualiza el reporte resumido por período y sede
    Then debe mostrar: total recaudado, total distribuido, trabajadores
    And debe poder exportar a Excel y PDF
```

---

## Feature: Recargo al Consumo (#67)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Recargo al Consumo (RestPE)
  Como usuario de RR.HH
  Quiero parametrizar y calcular la distribución del recargo al consumo
  Para integrarlo a la nómina (sp_calcular_recargo_consumo)

  @Sprint4 @high
  Scenario: #67.1 Parametrización de reglas de distribución
    When el usuario crea una regla "Proporcional por horas trabajadas"
    And crea una regla "Por rol (Mozo 60%, Bartender 25%, Cajero 15%)"
    Then las reglas deben almacenarse con versión histórica

  @Sprint4 @high
  Scenario: #67.2 Seleccionar período y visualizar monto total recaudado
    Given existen ventas del período registradas
    When el usuario selecciona un período de nómina
    Then el sistema debe mostrar el monto total del recargo (solo lectura)
    And el dato debe coincidir con Ventas/POS

  @Sprint4 @high
  Scenario: #67.3 Calcular distribución del recargo al consumo
    Given existe período seleccionado y regla activa
    When el usuario aplica la regla seleccionada
    Then debe mostrar detalle: colaborador, horas/días, % participación, monto asignado
    And solo colaboradores activos deben ser incluidos

  @Sprint4 @medium
  Scenario: #67.4 Bloqueo de redistribución y reversión controlada
    Given existe una distribución confirmada para el período
    When el usuario intenta ejecutar distribución nuevamente
    Then debe mostrar mensaje de bloqueo
    When usa "Revertir Distribución" con justificación
    Then la reversión debe registrarse en auditoría
    And debe permitir redistribuir después de revertir

  @Sprint4 @medium
  Scenario: #67.5 Reporte de recargo al consumo
    Given existe una distribución confirmada
    When el usuario exporta a Excel
    Then el archivo debe incluir: periodo, colaborador, horas, %, monto, estado
```

---

## Feature: Cuenta Corriente — Adelantos, Préstamos (#68)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Cuenta Corriente — Adelantos y Préstamos
  Como usuario de RR.HH
  Quiero gestionar adelantos, préstamos y amortizaciones
  Para controlar la cuenta corriente de trabajadores

  @Sprint4 @high
  Scenario: #68.1 Registrar préstamo con cuotas — cálculo automático
    Given existe un trabajador activo
    When el usuario registra un préstamo de S/1,500 a 5 cuotas
    Then el monto por cuota debe calcularse automáticamente (S/300)
    And el estado debe ser "Activo"

  @Sprint4 @high
  Scenario: #68.2 Validación de topes máximos
    Given existe un trabajador con sueldo S/1,200 y tope 40% configurado
    When el usuario registra un préstamo de S/600 (50% del sueldo)
    Then debe mostrar alerta "El monto excede el tope máximo permitido"

  @Sprint4 @medium
  Scenario: #68.3 Pago anticipado y cancelación total
    Given existe un préstamo activo con cuotas pendientes
    When el usuario registra un pago anticipado
    Then el saldo pendiente debe reducirse
    When cancela totalmente el préstamo
    Then el estado debe cambiar a "Cancelado"
    And las cuotas restantes deben descartarse

  @Sprint4 @high
  Scenario: #68.4 Integración de amortizaciones con planilla
    Given existe un préstamo activo con "Descuento en Planilla" marcado
    When el usuario calcula planilla del período
    Then debe aparecer el concepto de descuento del préstamo
    And el monto debe coincidir con la cuota

  @Sprint4 @medium
  Scenario: #68.5 Reporte histórico de préstamos por trabajador
    Given existe un trabajador con múltiples préstamos
    When el usuario consulta el histórico
    Then debe mostrar: código, monto, cuotas, saldo pendiente, estado
    And debe poder exportar
```

---

## Feature: Cálculo de Planilla — Aportes y Retenciones (#69)

```gherkin
@Sprint4 @module-rrhh @critical
Feature: Cálculo de Planilla — Aportes, Retenciones y Ejecución
  Como usuario de RR.HH
  Quiero configurar aportes y ejecutar el cálculo de planilla
  Para procesar la nómina del período (sp_calcular_planilla)

  @Sprint4 @high
  Scenario: #69.1 Configuración de tasas de aportes y retenciones
    When el usuario crea tasa AFP con % y tope máximo
    And crea tasa ESSALUD
    And crea IRPF con tabla por tramos
    And asigna vigencia a cada tasa
    Then las tasas deben guardarse con versión histórica

  @Sprint4 @medium
  Scenario: #69.2 Desglose de contribuciones en detalle de planilla
    Given existe planilla calculada con aportes
    When el usuario visualiza el detalle de un trabajador
    Then debe ver secciones separadas: "Aportes del Trabajador" y "Aportes del Empleador"
    And cada concepto debe mostrar: base, tasa, monto

  @Sprint4 @critical
  Scenario: #69.3 Cálculo de planilla integrando todos los componentes
    Given existe período definido, trabajador con sueldo, HE, propinas y préstamo
    When el usuario ejecuta el cálculo de planilla
    Then debe mostrar indicador de progreso
    And la tabla debe incluir: ingresos (sueldo + HE + propinas), descuentos (AFP + IRPF + préstamo), aportes patronales, neto a pagar

  @Sprint4 @high
  Scenario: #69.4 Recalcular planilla sobreescribiendo
    Given existe una planilla ya calculada para el período
    When el usuario intenta recalcular
    Then debe mostrar modal de confirmación "Ya existe planilla, ¿desea recalcular?"
    And no debe permitir recalcular si el período está cerrado

  @Sprint4 @medium
  Scenario: #69.5 Reporte detallado de aportes por CC
    Given existe planilla calculada
    When el usuario genera reporte de aportes filtrado por CC
    Then debe mostrar: trabajador, tipo fondo, base, tasa, monto
    And debe poder exportar

  @Sprint4 @medium
  Scenario: #69.6 Validación — trabajador sin asistencia
    Given existe un trabajador sin registro de asistencia en el período
    When el usuario calcula la planilla
    Then debe mostrar advertencia junto al nombre del trabajador
    And los descuentos fijos (AFP, préstamo) deben aplicarse igualmente
```

---

## Feature: Liquidaciones de Trabajador (#70)

```gherkin
@Sprint4 @module-rrhh @critical
Feature: Liquidaciones — Finiquito, Vacaciones, Indemnizaciones
  Como usuario de RR.HH
  Quiero liquidar trabajadores al cese
  Para calcular beneficios sociales (sp_liquidar_beneficios)

  @Sprint4 @high
  Scenario: #70.1 Selección de trabajador y tipo de cese
    Given existe un trabajador activo con 1+ año de antigüedad
    When el usuario selecciona el trabajador y el tipo de cese "Renuncia voluntaria"
    Then la fecha de ingreso debe cargarse automáticamente
    And las vacaciones pendientes deben calcularse automáticamente

  @Sprint4 @critical
  Scenario: #70.2 Cálculo completo de liquidación — todos los conceptos
    Given existe un trabajador con tipo de cese y fecha ingresados
    When el usuario ejecuta el cálculo (sp_liquidar_beneficios)
    Then debe mostrar: vacaciones pendientes, indemnización, gratificación trunca, CTS trunca, deducciones
    And el Total a Pagar = suma beneficios - deducciones

  @Sprint4 @high
  Scenario: #70.3 Indemnización según tipo de cese
    When el usuario liquida trabajador A con cese "Renuncia voluntaria"
    And liquida trabajador B con cese "Despido" (misma antigüedad)
    Then la indemnización para despido debe ser mayor (según ley vigente)

  @Sprint4 @high
  Scenario: #70.4 Deducciones integradas con cuenta corriente
    Given existe un trabajador con préstamo activo y saldo pendiente
    When el usuario ejecuta el cálculo de liquidación
    Then el saldo pendiente del préstamo debe deducirse automáticamente

  @Sprint4 @high
  Scenario: #70.5 Aprobación digital antes del pago
    Given existe una liquidación en estado "Calculada"
    When el usuario envía a revisión
    And un aprobador la aprueba
    Then el estado debe cambiar a "Aprobada"
    And debe quedar registrada con usuario, fecha y hora

  @Sprint4 @high
  Scenario: #70.6 Generación de comprobante PDF y XML
    Given existe una liquidación aprobada
    When el usuario genera el comprobante en PDF
    Then el PDF debe incluir: datos empresa, trabajador, desglose de conceptos, total, firma digital
    And debe poder generar XML para SUNAT

  @Sprint4 @medium
  Scenario: #70.7 Validaciones de liquidación
    When el usuario intenta liquidar trabajador con < 3 meses de antigüedad
    Then debe mostrar advertencia informativa
    When ingresa fecha de cese futura
    Then debe mostrar bloqueo
    When intenta liquidar trabajador ya liquidado
    Then debe mostrar bloqueo
```

---

## Feature: Gratificaciones y CTS (#71)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Gratificaciones y CTS
  Como usuario de RR.HH
  Quiero calcular gratificaciones y CTS
  Para procesar beneficios legales (sp_calcular_gratificacion, sp_calcular_cts)

  @Sprint4 @high
  Scenario: #71.1 Cálculo de gratificación
    Given existen trabajadores con 6+ meses de antigüedad
    When el usuario selecciona período y ejecuta (sp_calcular_gratificacion)
    Then los montos deben calcularse según RMV y tiempo laborado
    And no debe permitir duplicar período

  @Sprint4 @high
  Scenario: #71.2 Cálculo de CTS
    Given existen trabajadores con 4+ meses de antigüedad
    When el usuario selecciona período y ejecuta (sp_calcular_cts)
    Then la CTS debe calcularse según antigüedad y remuneración
```

---

## Feature: Saldos de Cuenta Corriente (#72)

```gherkin
@Sprint4 @module-rrhh @medium
Feature: Saldos de Cuenta Corriente
  Como usuario de RR.HH
  Quiero consultar netos, adelantos y saldos
  Para visualizar la situación de cada trabajador (sp_generar_pago_remuneraciones)

  @Sprint4 @medium
  Scenario: #72.1 Consultar saldos de cuenta corriente
    Given existe planilla calculada
    When el usuario navega a "Saldos de Cuenta Corriente"
    And selecciona período
    Then debe mostrar: trabajador, ingresos, descuentos, adelantos, neto a pagar, saldo pendiente
    And debe permitir filtrar por trabajador
    And debe mostrar totales al pie
    And debe permitir exportación
```

---

## Feature: Boletas de Pago (#73)

```gherkin
@Sprint4 @module-rrhh @high
Feature: Emisión de Boletas de Pago
  Como usuario de RR.HH
  Quiero emitir boletas de pago electrónicas
  Para entregar el detalle de remuneraciones a los trabajadores (sp_generar_boleta_pago)

  @Sprint4 @high
  Scenario: #73.1 Emisión de boletas de pago
    Given existe planilla calculada para el período
    When el usuario selecciona período y trabajadores
    And genera las boletas
    Then el PDF debe incluir: datos empresa, trabajador, ingresos, descuentos, neto
    And debe permitir descarga individual o masiva

  @Sprint4 @medium
  Scenario: #73.2 Bloqueo sin planilla calculada
    Given no existe planilla calculada para el período
    When el usuario intenta emitir boletas
    Then debe mostrar mensaje "No existe planilla calculada para este período"
    And debe ofrecer redirección al cálculo
```

---

## Feature: E2E Scripteados — Sprint 4

```gherkin
@Sprint4 @critical @smoke @e2e
Feature: E2E Sprint 4 — Flujos transversales RR.HH

  @Sprint4 @critical @e2e
  Scenario: E2E-01 Asistencia → Variables → Propinas → Planilla → Boletas
    Given existe un trabajador activo con conceptos fijos y ventas con propinas en el período
    When el usuario registra asistencia con horas extra
    And carga bono variable por archivo Excel
    And define regla de propinas y distribuye
    And calcula planilla
    And emite boleta PDF
    Then la boleta debe incluir: sueldo base, HE, bono, propinas, AFP, IRPF, préstamo
    And el neto debe ser correcto

  @Sprint4 @high @e2e
  Scenario: E2E-02 Recargo al Consumo → Aportes → Planilla → Boletas
    Given existen ventas con recargo y tasas de aportes configuradas
    When el usuario configura regla de recargo y distribuye
    And configura tasas AFP y ESSALUD
    And calcula planilla
    And emite boletas
    Then la boleta debe mostrar recargo como ingreso separado
    And los aportes desglosados en dos secciones

  @Sprint4 @high @e2e
  Scenario: E2E-03 Adelantos + Préstamos → Planilla → Reporte
    Given existe un trabajador activo
    When el usuario registra un adelanto de sueldo
    And registra un préstamo con 3 cuotas
    And calcula planilla del período
    Then la planilla debe descontar el adelanto completo + primera cuota
    When consulta saldos de cuenta corriente
    Then el saldo pendiente debe reflejarse correctamente

  @Sprint4 @high @e2e
  Scenario: E2E-04 Liquidación + Gratificación/CTS + Boletas
    Given existe un trabajador con 1+ año de antigüedad
    When el usuario calcula la liquidación
    And calcula gratificación y CTS truncas
    And consulta saldos
    And emite boletas
    Then todos los beneficios truncos deben ser proporcionales
    And los saldos deben ser consistentes
```
