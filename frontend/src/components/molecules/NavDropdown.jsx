import { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useClickOutside } from '../../hooks/useClickOutside';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'relative flex-1',
  trigger: `flex w-full items-center justify-center gap-1.5 px-4 py-4 text-sm font-bold tracking-wide ${colors.navText} transition-colors ${colors.navHover}`,
  chevron: 'transition-transform duration-200',
  chevronOpen: 'rotate-180',
  menu: `absolute right-0 top-full z-20 min-w-[240px] rounded-b-lg border border-slate-200 ${colors.navMenuBg} py-2 shadow-xl`,
  menuItem: `block w-full px-4 py-2.5 text-left text-sm font-medium ${colors.navMenuText} transition-colors ${colors.navMenuHover}`
};

export const NavDropdown = ({ label, path, items = [], onNavigate }) => {
  const ref = useRef(null);
  const { isOpen, toggle, close } = useDisclosure(false);
  useClickOutside(ref, close);

  if (items.length === 0) {
    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.trigger} onClick={() => onNavigate(path)}>
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <button type="button" className={styles.trigger} onClick={toggle}>
        {label}
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>
      {isOpen && (
        <div className={styles.menu}>
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              className={styles.menuItem}
              onClick={() => {
                onNavigate(item.path);
                close();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};