import {Button} from '../../components/atoms/Button';

export default {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'danger', 'warning'] },
    size: { control: 'select', options: ['sm', 'md'] },
    onClick: { action: 'clicked' }
  }
};

export const Primary = {
  args: {
    children: 'GUARDAR',
    variant: 'primary'
  }
};

export const Danger = {
  args: {
    children: 'CANCELAR',
    variant: 'danger'
  }
};

export const Warning = {
  args: {
    children: 'ADVERTENCIA',
    variant: 'warning'
  }
};

export const Small = {
  args: {
    children: 'EDITAR',
    size: 'sm'
  }
};

export const Disabled = {
  args: {
    children: 'PROCESANDO...',
    disabled: true
  }
};