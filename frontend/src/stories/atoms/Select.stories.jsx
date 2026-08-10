import {Select} from '../../components/atoms/Select';

export default {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs']
};

const options = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'qr', label: 'Qr' },
  { value: 'mixto', label: 'Mixto' }
];

export const Default = {
  args: {
    options,
    placeholder: 'Seleccione una opción'
  }
};

export const WithSelection = {
  args: {
    options,
    placeholder: 'Seleccione una opción',
    value: 'qr',
    onChange: () => {}
  }
};