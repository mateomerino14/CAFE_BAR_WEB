import {Avatar} from '../../components/atoms/Avatar';

export default {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' }
  }
};

export const WithImage = {
  args: {
    src: 'https://i.pravatar.cc/150?img=12',
    alt: 'Empleado de ejemplo'
  }
};

export const WithoutImage = {
  args: {
    src: null,
    alt: 'Sin imagen'
  }
};

export const CustomSize = {
  args: {
    src: 'https://i.pravatar.cc/150?img=5',
    alt: 'Tamaño personalizado',
    className: 'h-24 w-24'
  }
};