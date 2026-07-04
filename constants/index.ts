// ─── Rutas del frontend ────────────────────────────────

export const RUTAS = {
  // Auth
  LOGIN: '/auth/signin',
  SELECCION_EMPRESA: '/auth/seleccion-razon-social',
  DASHBOARD: '/inicio',

  // Compras
  PROVEEDORES: '/compras/tabla/gestion-proveedores',
  ORDENES_COMPRA: '/compras/operaciones/ordenes-compra',
  APROBAR_OC: '/compras/operaciones/aprobar-compra',
  REGISTRO_COMPROBANTES: '/compras/operaciones/facturas-proveedores',
  GESTION_COMPRAS: '/compras/reportes/gestion-compras',

  // Finanzas
  TIPOS_DOCUMENTO: '/finanzas/tabla/tipos-documento',
  CONCEPTOS_FINANCIEROS: '/finanzas/tabla/conceptos-financieros',
  CARTERA_PAGOS: '/finanzas/tesoreria/cartera-pagos',
  CARTERA_COBROS: '/finanzas/tesoreria/carteras-cobros',
  CUENTA_BANCARIA: '/finanzas/tabla/cuenta-bancaria',
  ORDENES_GIRO: '/finanzas/adelantos/ordenes-giro',
  RENDICION_GASTOS: '/finanzas/adelantos/rendicion-gastos',
  CONSULTA_SALDOS: '/finanzas/consultas/consultas-saldos-caja-bancos',
  MOV_CUENTAS: '/finanzas/tesoreria/mov-cuentas-banc-y-cajas',

  // Contabilidad
  PLAN_CONTABLE: '/contabilidad/tabla/plan-contable',
  CENTROS_COSTO: '/contabilidad/tabla/plan-centro-costo',
  TIPO_CAMBIO: '/contabilidad/tabla/tipo-de-cambio',

  // Activos Fijos
  MAESTRO_AF: '/activos/operaciones/registroactivos',
  PARAMETROS_AF: '/activos/tabla/paramoperaciones',
  OPERACIONES_AF: '/activos/tabla/operaciones',
  CALCULO_DEPRECIACION: '/activos/procesos/calculo-depreciacion',

  // RRHH
  DATOS_PERSONALES: '/rrhh/maestro-personal/datos-contacto',
  CARGOS: '/rrhh/maestro-personal/definicion-cargos',
  TIPO_CONTRATO: '/rrhh/parametros/tipo-contrato',
  ASISTENCIAS: '/rrhh/asistencias-jornadas/asistencias-HE',
  CALCULO_PLANILLA: '/rrhh/procesos-de-nomina/calculo-planillas',
  REGISTRAR_LIQUIDACION: '/rrhh/procesos-de-nomina/registrar-liquidacion',
  APROBAR_LIQUIDACION: '/rrhh/procesos-de-nomina/aprobar-liquidacion',

  // Configuración
  MEDIOS_PAGO: '/configuracion/localizacion/medios-pago',
  FORMAS_PAGO: '/configuracion/localizacion/formas-pago',
} as const;

// ─── Módulos ────────────────────────────────────────────

export const MODULOS = [
  'Almacén', 'Compras', 'Ventas', 'Finanzas',
  'Contabilidad', 'Activos fijos', 'RR.HH', 'Producción', 'Configuración',
] as const;

// ─── Países ─────────────────────────────────────────────

export const PAISES = {
  PE: { codigo: 'PE', nombre: 'Perú', moneda: 'PEN', iva: 18 },
  CO: { codigo: 'CO', nombre: 'Colombia', moneda: 'COP', iva: 19 },
  EC: { codigo: 'EC', nombre: 'Ecuador', moneda: 'USD', iva: 15 },
} as const;

// ─── Monedas ────────────────────────────────────────────

export const MONEDAS = {
  PEN: { codigo: 'PEN', nombre: 'Soles', simbolo: 'S/' },
  USD: { codigo: 'USD', nombre: 'Dolares Americanos', simbolo: '$' },
  COP: { codigo: 'COP', nombre: 'Peso Colombiano', simbolo: '$' },
} as const;

// ─── Estados ────────────────────────────────────────────

export const ESTADOS = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  RETORNADA: 'Retornada',
  ANULADA: 'Anulada',
} as const;
