import {NavDropdown} from '../../components/molecules/NavDropdown';

export default {
  title: 'Molecules/NavDropdown',
  component: NavDropdown,
  tags: ['autodocs'],
  argTypes: {
    onNavigate: { action: 'navigated' }
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#1e3a8a', display: 'inline-block' }}>
        <Story />
      </div>
    )
  ]
};

export const WithoutSubmenu = {
  args: {
    label: 'FAMILIA',
    path: '/familia',
    items: []
  }
};

export const WithSubmenu = {
  args: {
    label: 'PRODUCTOS',
    path: '/productos',
    items: [
      {label: 'Registrar Producto', path: '/productos/registrar'},
      {label: 'Modificar Producto', path: '/productos/modificar'},
      {label: 'Dar de Baja Producto', path: '/productos/baja'}
    ]
  }
};