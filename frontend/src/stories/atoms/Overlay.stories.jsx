import {Overlay} from '../../components/atoms/Overlay';

export default {
  title: 'Atoms/Overlay',
  component: Overlay,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' }
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 200, background: '#f1f5f9' }}>
        <Story />
      </div>
    )
  ]
};

export const Default = {
  args: {}
};