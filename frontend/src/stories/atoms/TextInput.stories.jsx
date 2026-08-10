import {TextInput} from '../../components/atoms/TextInput';

export default {
  title: 'Atoms/TextInput',
  component: TextInput,
  tags: ['autodocs']
};

export const Default = {
  args: {
    placeholder: 'Ingrese su nombre de usuario'
  }
};

export const WithValue = {
  args: {
    defaultValue: 'MATEO67'
  }
};

export const Disabled = {
  args: {
    defaultValue: 'No editable',
    disabled: true
  }
};

export const Number = {
  args: {
    type: 'number',
    placeholder: '0.00'
  }
};