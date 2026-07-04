import type { Page } from '@playwright/test';

// ─── Datos de prueba ─────────────────────────────────────

export interface ProviderData {
  razonSocial: string;
  nombreComercial?: string;
  identfiscal: string;
  direccionFiscal: string;
  email?: string;
  telefono?: string;
  estado?: 'Activo' | 'Inactivo';
  proveedor?: 'Nacional' | 'Extranjero';
}

export interface OCLineData {
  producto?: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OCData {
  proveedorDocFiscal: string;
  fechaEntrega?: string;
  moneda?: string;
  tipoCambio?: number;
  condicionPago?: string;
  lineas: OCLineData[];
}

export interface EmployeeData {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  sexo?: string;
  email?: string;
  telefono?: string;
}

// ─── Configuración ───────────────────────────────────────

export interface AmbienteConfig {
  baseURL: string;
  apiURL: string;
  credentials: { username: string; password: string };
  empresa: string;
  sucursal: string;
  pais: 'PE' | 'CO' | 'EC';
}

export interface TimeoutConfig {
  NAVEGACION: number;
  GRID_CARGA: number;
  MODAL: number;
  TOAST: number;
  SELECT_POPOVER: number;
  API_RESPONSE: number;
  ACCION_RAPIDA: number;
  ANGULAR_DIGEST: number;
  TAB_CHANGE: number;
  OVERLAY_DISMISS: number;
  LOGIN_TOTAL: number;
}

// ─── AgGrid ──────────────────────────────────────────────

export interface GridColumn {
  index: number;
  name: string;
  sortable: boolean;
}

export interface GridRowAction {
  text: string;
  icon?: string;
  selector: string;
}

// ─── Tab ─────────────────────────────────────────────────

export interface TabInfo {
  index: number;
  name: string;
  selector: string;
}

// ─── Test tags ───────────────────────────────────────────

export type SprintTag = '@sprint1' | '@sprint2' | '@sprint3' | '@sprint4';
export type LevelTag = '@smoke' | '@critical' | '@high' | '@medium';
export type CountryTag = '@PE' | '@CO' | '@EC';
export type TestTag = SprintTag | LevelTag | CountryTag | '@e2e' | '@skip' | '@bloqueado' | '@flaky';
