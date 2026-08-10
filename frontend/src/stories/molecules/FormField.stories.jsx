import {FormField} from '../../components/molecules/FormField';
import {TextInput} from '../../components/atoms/TextInput';
import {Select} from '../../components/atoms/Select';

export default {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs']
};

export const WithTextInput = {
  args: {
    label: 'USUARIO',
    children: <TextInput placeholder="Ingrese su nombre de usuario" />
  }
};

export const WithSelect = {
  args: {
    label: 'MÉTODO DE PAGO',
    children: (
      <Select
        placeholder="Seleccione un método"
        options={[
          { value: 'efectivo', label: 'Efectivo' },
          { value: 'qr', label: 'Qr' }
        ]}
      />
    )
  }
};