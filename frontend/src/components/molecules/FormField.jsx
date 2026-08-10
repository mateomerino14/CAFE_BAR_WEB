import {colors, typography} from '../../constants/theme';

const styles = {
  wrapper: 'flex w-full flex-col gap-3',
  label: `text-left ${typography.label} ${colors.textPrimary}`
};

export const FormField = ({label, children}) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  );
};