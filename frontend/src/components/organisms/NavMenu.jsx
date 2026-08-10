import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Menu} from 'lucide-react';
import {NAV_ITEMS} from '../../constants/navigation';
import {NavDropdown} from '../molecules/NavDropdown';
import {MobileSidebar} from './MobileSidebar';
import {useAuth} from '../../context/AuthContext';
import {useDisclosure} from '../../hooks/useDisclosure';
import {colors} from '../../constants/theme';

const styles = {
  bar: `flex items-center justify-between ${colors.navBackground} px-2 sm:px-4`,
  desktopList: 'hidden flex-1 md:flex',
  mobileTrigger: `flex items-center justify-center rounded-lg p-2.5 m-2 ${colors.navText} transition-colors ${colors.navHover} md:hidden`
};

export const NavMenu = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { isOpen, open, close } = useDisclosure(false);
  const [openLabel, setOpenLabel] = useState(null);
  const visibleItems = NAV_ITEMS.map((item) => {
    if (!item.items) return item;
    return { ...item, items: item.items.filter((sub) => hasPermission(sub.permission)) };
  }).filter((item) => {
    if (item.items) return hasPermission(item.permission) || item.items.length > 0;
    return hasPermission(item.permission);
  });
  const handleClose = () => {
    close();
    setOpenLabel(null);
  };
  const handleToggleSection = (label) => {
    setOpenLabel((prev) => (prev === label ? null : label));
  };
  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };
  return (
    <>
      <div className={styles.bar}>
        <div className={styles.desktopList}>
          {visibleItems.map((item) => (
            <NavDropdown
              key={item.label}
              label={item.label}
              path={item.path}
              items={item.items || []}
              onNavigate={navigate}
            />
          ))}
        </div>
        <button type="button" className={styles.mobileTrigger} onClick={open}>
          <Menu size={24} />
        </button>
      </div>
      <MobileSidebar
        isOpen={isOpen}
        onClose={handleClose}
        items={visibleItems}
        openLabel={openLabel}
        onToggleSection={handleToggleSection}
        onNavigate={handleNavigate}
      />
    </>
  );
};