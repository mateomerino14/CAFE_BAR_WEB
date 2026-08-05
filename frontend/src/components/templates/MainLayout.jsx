import { useLocation } from 'react-router-dom';
import { TopBar } from '../organisms/TopBar';
import { NavMenu } from '../organisms/NavMenu';
import { Footer } from '../organisms/Footer';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: `flex min-h-screen flex-col ${colors.background}`,
  content: 'p-3 sm:p-6',
  contentGrow: 'flex-1 p-3 sm:p-6'
};

export const MainLayout = ({ title, stickyFooter = true, children }) => {
  const location = useLocation();

  return (
    <div className={styles.wrapper}>
      <TopBar title={title} />
      <NavMenu />
      <main
        key={location.pathname}
        className={`${stickyFooter ? styles.contentGrow : styles.content} animate-fade-in-up`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};