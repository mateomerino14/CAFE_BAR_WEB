import {useState} from 'react';
import {Checkbox} from '../../components/atoms/Checkbox';

export default {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs']
};

export const Unchecked = {
  args: {
    label: 'Local',
    checked: false,
    onChange: () => {}
  }
};

export const Checked = {
  args: {
    label: 'Para llevar',
    checked: true,
    onChange: () => {}
  }
};

export const Interactive = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return <Checkbox {...args} checked={checked} onChange={() => setChecked((prev) => !prev)} />;
  },
  args: {
    label: 'Haz clic para alternar'
  }
};