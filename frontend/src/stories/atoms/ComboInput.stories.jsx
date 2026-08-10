import {ComboInput} from '../../components/atoms/ComboInput';

export default {
  title: 'Atoms/ComboInput',
  component: ComboInput,
  tags: ['autodocs']
};

export const Default = {
  args: {
    listId: 'combo-default',
    options: [],
    placeholder: 'Escriba o elija una opción'
  }
};

export const WithOptions = {
  args: {
    listId: 'combo-with-options',
    options: ['Efectivo', 'Qr', 'Mixto'],
    placeholder: 'Método de pago'
  }
};