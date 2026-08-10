import {colors} from '../../constants/theme';

const styles = {
  base: 'rounded-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  primary: colors.buttonPrimary,
  danger: colors.buttonDanger,
  warning: colors.buttonWarning,
  size: {
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-5 py-2.5 text-sm sm:text-base'
  }
};

export const Button = ({children, variant = 'primary', size = 'md', className = '', ...props}) => {
  return (
    <button className={`${styles.base} ${styles[variant]} ${styles.size[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};