/**
 * Selectores compartidos entre múltiples pantallas.
 * Los selectores específicos de cada pantalla van inline en su Page Object.
 */

export const SHARED_SELECTORS = {
  /** Selector de país en el header */
  paisSelect: 'app-header ion-select[placeholder="País"]',

  /** Toast de notificación */
  toast: 'ion-toast',
  toastMessage: 'ion-toast .toast-message, ion-toast .toast-content',

  /** Overlay que bloquea clicks en el grid */
  filtrosAbsolutos: '.filtros-absolutos',

  /** Sidebar */
  sidebar: 'app-sidebar',
  sidebarLinks: 'app-sidebar a',

  /** Header */
  header: 'app-header',

  /** Loading spinner */
  loading: 'ion-loading',

  /** Modal genérico */
  modal: 'ion-modal, [role="dialog"]',

  /** Botones comunes */
  btnGuardar: 'button:has-text("Guardar"), ion-button:has-text("Guardar")',
  btnRegistrar: 'button:has-text("Registrar"), ion-button:has-text("Registrar")',
  btnCancelar: 'button:has-text("Cancelar"), ion-button:has-text("Cancelar")',
  btnNuevo: 'button:has-text("Nuevo"), ion-button:has-text("Nuevo")',

  /** AG Grid genérico */
  gridContainer: '.ag-theme-alpine',
  gridRow: '.ag-row:visible',
  gridHeader: '.ag-header-cell-text',
  gridPagination: '.ag-paging-panel',

  /** Login */
  loginUser: 'input[placeholder="usuario@empresa.com"]',
  loginPass: 'input[placeholder="**********"]',
  loginBtn: 'ion-button.button-login',

  /** Selección de empresa/sucursal */
  empresaRow: 'tr.cursor-pointer',
  empresaName: 'tr.cursor-pointer p.text-xxs',
} as const;
