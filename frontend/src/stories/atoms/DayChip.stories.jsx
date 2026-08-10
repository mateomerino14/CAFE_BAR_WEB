import {DayChip} from '../../components/atoms/DayChip';

export default {
  title: 'Atoms/DayChip',
  component: DayChip,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' }
  }
};

export const Active = {
  args: {
    label: 'L',
    active: true
  }
};

export const Inactive = {
  args: {
    label: 'M',
    active: false
  }
};