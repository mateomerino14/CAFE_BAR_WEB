import {Toast} from '../../components/atoms/Toast';

export default {
  title: 'Atoms/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['error', 'success'] }
  }
};

export const ErrorVariant = {
  args: {
    variant: 'error',
    children: 'No se pudo registrar la venta'
  }
};

export const SuccessVariant = {
  args: {
    variant: 'success',
    children: 'Venta N° 12 registrada con éxito'
  }
};