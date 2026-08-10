import {useState} from 'react';
import {SearchableSelect} from '../../components/molecules/SearchableSelect';

export default {
  title: 'Molecules/SearchableSelect',
  component: SearchableSelect,
  tags: ['autodocs']
};

const options = [
  {value: 1, label: 'Cafetería'},
  {value: 2, label: 'Bebidas'},
  {value: 3, label: 'Cervezas & Licores'},
  {value: 4, label: 'Comidas & Snacking'}
];

export const Interactive = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <SearchableSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    options,
    placeholder: 'Buscar categoría'
  }
};

export const WithSelection = {
  render: (args) => {
    const [value, setValue] = useState(2);
    return <SearchableSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    options,
    placeholder: 'Buscar categoría'
  }
};

export const Empty = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <SearchableSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    options: [],
    placeholder: 'Primero seleccione una categoría'
  }
};

export const Disabled = {
  args: {
    options,
    value: '',
    onChange: () => {},
    placeholder: 'Primero seleccione una categoría',
    disabled: true
  }
};