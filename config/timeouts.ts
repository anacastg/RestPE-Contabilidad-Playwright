/** Timeouts centralizados por tipo de operación. */
export const TIMEOUTS = {
  /** page.waitForURL en navegación SPA */
  NAVEGACION: 15_000,
  /** Esperar que .ag-row sea visible */
  GRID_CARGA: 10_000,
  /** Apertura de ion-modal */
  MODAL: 5_000,
  /** Toast notification (el sistema usa 6s de duración) */
  TOAST: 7_000,
  /** Apertura de popover/alert de ion-select */
  SELECT_POPOVER: 5_000,
  /** Esperar respuesta de API POST/PUT */
  API_RESPONSE: 15_000,
  /** Click en botón, cambio de tab, interacciones rápidas */
  ACCION_RAPIDA: 3_000,
  /** Angular digest cycle después de fill() */
  ANGULAR_DIGEST: 300,
  /** Espera tras cambio de tab (sin indicador de carga) */
  TAB_CHANGE: 1_500,
  /** Espera tras dismissOverlay */
  OVERLAY_DISMISS: 500,
  /** Login completo (3 pasos) */
  LOGIN_TOTAL: 60_000,
} as const;
