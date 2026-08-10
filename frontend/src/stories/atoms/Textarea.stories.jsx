import {Textarea} from '../../components/atoms/Textarea';

export default {
  title: 'Atoms/Textarea',
  component: Textarea,
  tags: ['autodocs']
};

export const Default = {
  args: {
    placeholder: 'Escriba una descripción...'
  }
};

export const WithValue = {
  args: {
    defaultValue: 'Hamburguesa clásica con carne, queso, lechuga y tomate.'
  }
};

export const Disabled = {
  args: {
    defaultValue: 'Este campo no se puede editar',
    disabled: true
  }
};