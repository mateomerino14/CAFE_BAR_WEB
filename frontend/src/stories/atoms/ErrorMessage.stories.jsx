import {ErrorMessage} from '../../components/atoms/ErrorMessage';

export default {
  title: 'Atoms/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs']
};

export const Default = {
  args: {
    children: 'La subcategoría ya está registrada'
  }
};

export const LongMessage = {
  args: {
    children: 'Esta mesa tiene 3 unidad(es) sin marcar como listas antes de poder cobrar'
  }
};