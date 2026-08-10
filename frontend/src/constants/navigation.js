
export const NAV_ITEMS = [
  {label: 'HOME', permission: 'Home', path: '/'},
  {label: 'FAMILIA', permission: 'VER_FAMILIA', path: '/familia'},
  {
    label: 'CAJA',
    permission: 'Caja',
    items: [
      {label: 'Registrar Pedido', permission: 'REGISTRAR_PEDIDO', path: '/caja/registrar-pedido'}
    ]
  },
  {
    label: 'ADMINISTRACION',
    permission: 'Administracion',
    items: [
      {label: 'Configuración', permission: 'CONFIGURACION', path: '/administracion/configuracion'}
    ]
  },
  {
    label: 'PRODUCTOS',
    permission: 'Productos',
    items: [
      {label: 'Registrar Categoría', permission: 'REGISTRAR_CATEGORIA', path: '/productos/registrar-categoria'},
      {label: 'Modificar Categoría', permission: 'MODIFICAR_CATEGORIA', path: '/productos/modificar-categoria'},
      {label: 'Dar de Baja Categoría', permission: 'BAJA_CATEGORIA', path: '/productos/baja-categoria'},
      {label: 'Registrar Producto', permission: 'REGISTRAR_PRODUCTO', path: '/productos/registrar-producto'},
      {label: 'Modificar Producto', permission: 'MODIFICAR_PRODUCTO', path: '/productos/modificar-producto'},
      {label: 'Dar de Baja Producto', permission: 'BAJA_PRODUCTO', path: '/productos/baja-producto'}
    ]
  },
  {
    label: 'SECCIONES',
    permission: 'Secciones',
    items: [
      {label: 'Administrar Secciones', permission: 'ADMIN_SECCIONES', path: '/secciones'}
    ]
  },
  {
    label: 'STOCK',
    permission: 'Stock',
    items: [
      {label: 'Registrar Ingredientes', permission: 'REGISTRAR_INGREDIENTES', path: '/stock/registrar-ingredientes'},
      {label: 'Modificar Ingredientes', permission: 'MODIFICAR_INGREDIENTES', path: '/stock/modificar-ingredientes'}
    ]
  },
  {
    label: 'PROMOCIONES',
    permission: 'Promociones',
    items: [
      {label: 'Registrar Promociones', permission: 'REGISTRAR_PROMOCIONES', path: '/promociones/registrar'},
      {label: 'Modificar Promociones', permission: 'MODIFICAR_PROMOCIONES', path: '/promociones/modificar'},
      {label: 'Dar de Baja Promociones', permission: 'BAJA_PROMOCIONES', path: '/promociones/baja'}
    ]
  },
  {
    label: 'EMPLEADOS',
    permission: 'Empleados',
    items: [
      {label: 'Registrar Cargos', permission: 'REGISTRAR_CARGOS', path: '/empleados/registrar-cargos'},
      {label: 'Modificación Cargos', permission: 'MODIFICAR_CARGOS', path: '/empleados/modificar-cargos'},
      {label: 'Registrar Empleados', permission: 'REGISTRAR_EMPLEADOS', path: '/empleados/registrar'},
      {label: 'Modificar Empleados', permission: 'MODIFICAR_EMPLEADOS', path: '/empleados/modificar'},
      {label: 'Dar de Baja Empleados', permission: 'BAJA_EMPLEADOS', path: '/empleados/baja'}
    ]
  },
  {
    label: 'REPORTES',
    permission: 'Reportes',
    items: [
      {label: 'Ver Reportes', permission: 'VER_REPORTES', path: '/reportes'}
    ]
  }
];