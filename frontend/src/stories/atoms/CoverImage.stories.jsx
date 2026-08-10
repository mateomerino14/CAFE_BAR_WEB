import {CoverImage} from '../../components/atoms/CoverImage';

export default {
  title: 'Atoms/CoverImage',
  component: CoverImage,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 120, height: 120 }}>
        <Story />
      </div>
    )
  ]
};

export const WithImage = {
  args: {
    src: 'https://i.pravatar.cc/300?img=8',
    alt: 'Foto de perfil'
  }
};

export const Placeholder = {
  args: {
    src: null,
    alt: 'Sin foto'
  }
};