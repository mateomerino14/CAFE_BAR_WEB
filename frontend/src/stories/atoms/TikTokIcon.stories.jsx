import {TikTokIcon} from '../../components/atoms/TikTokIcon';

export default {
  title: 'Atoms/Icons/TikTokIcon',
  component: TikTokIcon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'number' }
  }
};

export const Default = {
  args: {
    size: 18
  }
};

export const Large = {
  args: {
    size: 36
  }
};