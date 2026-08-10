import {useClock} from '../../hooks/useClock';
import {typography} from '../../constants/theme';

const styles = {
  wrapper: 'w-full max-w-xl rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 text-center shadow-lg shadow-blue-500/30 sm:px-10 sm:py-6',
  title: `${typography.title} text-xl text-white sm:text-2xl`,
  subtitle: 'mt-1 text-xs font-medium text-white/90 sm:text-sm'
};

export const WelcomeBanner = () => {
  const { date, time } = useClock();
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Bienvenido a Cafebar</h2>
      <p className={styles.subtitle}>{date} • {time}</p>
    </div>
  );
};