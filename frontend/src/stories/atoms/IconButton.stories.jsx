import {ChevronLeft, Trash2} from 'lucide-react';
import {IconButton} from '../../components/atoms/IconButton';

export default {
  title: 'Atoms/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' }
  }
};

export const Default = {
  args: {
    icon: ChevronLeft,
    size: 22
  }
};

export const DangerIcon = {
  args: {
    icon: Trash2,
    size: 18
  }
};

export const Disabled = {
  args: {
    icon: ChevronLeft,
    disabled: true
  }
};