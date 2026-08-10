import {InstagramIcon} from '../../components/atoms/InstagramIcon';

export default {
  title: 'Atoms/Icons/InstagramIcon',
  component: InstagramIcon,
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