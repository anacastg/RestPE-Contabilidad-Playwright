/** Códigos de permisos documentados mapeados a su HU de origen. */
export const PERMISOS = {
  COM_002: {
    codigo: 'COM-002',
    hu: 'HU-COM-002',
    descripcion: 'Comprador activo — permite crear órdenes de compra',
    modulo: 'Compras',
    bugRelacionado: '#006',
  },
  COM_022: {
    codigo: 'COM-022',
    hu: 'HU-COM-004',
    descripcion: 'Aprobador configurado — permite aprobar/rechazar OC',
    modulo: 'Compras',
    bugRelacionado: '#010',
  },
} as const;
