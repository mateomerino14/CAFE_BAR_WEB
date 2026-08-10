import {colors} from '../../constants/theme';

const styles = {
  base: `w-full rounded-lg border-2 ${colors.border} ${colors.surface} px-3 py-2 text-base focus:outline-none`
};

export const TextInput = ({ className = '', ...props }) => {
  return <input className={`${styles.base} ${className}`} {...props} />;
};