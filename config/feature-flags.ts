/**
 * Feature flags para funcionalidades no disponibles.
 * Cuando una funcionalidad se implementa, cambiar de false a true.
 */
export const FEATURES = {
  /** POST /api/contabilidad/asientos/procesar-evento disponible */
  MOTOR_V2_AVAILABLE: false,

  /** Pantalla de Caja Chica implementada */
  CAJA_CHICA_AVAILABLE: false,

  /** Formato SUNAT (item #36) implementado */
  FORMATOS_SUNAT_AVAILABLE: false,

  /** Libros Electrónicos PLE (item #37) implementado */
  PLE_AVAILABLE: false,

  /** Registro de Ventas SUNAT (item #10) implementado */
  REGISTRO_VENTAS_SUNAT_AVAILABLE: false,

  /** Punto de Venta implementado */
  PUNTO_VENTA_AVAILABLE: false,
} as const;

/**
 * Permisos del usuario QA — bloquean tests si están en false.
 */
export const PERMISSIONS = {
  /** Bug #006 — pcastillo no tiene COM-002 "comprador activo" */
  OC_CREAR_DISPONIBLE: false,

  /** Bug #010 — pcastillo no tiene COM-022 "aprobador configurado" */
  APROBAR_OC_DISPONIBLE: false,
} as const;
