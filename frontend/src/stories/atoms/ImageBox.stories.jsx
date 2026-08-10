import {ImageBox} from '../../components/atoms/ImageBox';

export default {
  title: 'Atoms/ImageBox',
  component: ImageBox,
  tags: ['autodocs']
};

export const WithImage = {
  args: {
    src: 'https://picsum.photos/200',
    alt: 'Producto de ejemplo'
  }
};

export const Placeholder = {
  args: {
    src: null,
    alt: 'Sin imagen'
  }
};

export const SmallSize = {
  args: {
    src: null,
    alt: 'Miniatura',
    className: 'h-12 w-12'
  }
};