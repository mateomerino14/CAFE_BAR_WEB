import {SocialIcon} from '../../components/atoms/SocialIcon';
import {FacebookIcon} from '../../components/atoms/FacebookIcon';
import {InstagramIcon} from '../../components/atoms/InstagramIcon';

export default {
  title: 'Atoms/SocialIcon',
  component: SocialIcon,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ background: '#1e3a8a', padding: 16, borderRadius: 8 }}>
        <Story />
      </div>
    )
  ]
};

export const Facebook = {
  args: {
    href: 'https://facebook.com',
    label: 'Facebook',
    children: <FacebookIcon />
  }
};

export const Instagram = {
  args: {
    href: 'https://instagram.com',
    label: 'Instagram',
    children: <InstagramIcon />
  }
};