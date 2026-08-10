import {Eye, EyeOff} from 'lucide-react';
import {TextInput} from '../atoms/TextInput';
import {IconButton} from '../atoms/IconButton';
import {useToggle} from '../../hooks/useToggle';

const styles = {
  wrapper: 'relative w-full',
  icon: 'absolute right-3 top-1/2 -translate-y-1/2'
};

export const PasswordField = ({value, onChange, placeholder}) => {
  const [visible, toggleVisible] = useToggle(false);
  return (
    <div className={styles.wrapper}>
      <TextInput
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
      />
      <IconButton icon={visible ? EyeOff : Eye} onClick={toggleVisible} className={styles.icon} />
    </div>
  );
};