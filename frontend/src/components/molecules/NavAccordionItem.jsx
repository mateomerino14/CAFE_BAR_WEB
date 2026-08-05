import { ChevronDown } from 'lucide-react';
import { colors } from '../../constants/theme';

const styles = {
  trigger: `flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-bold tracking-wide ${colors.navText} transition-colors ${colors.navHover}`,
  chevron: 'transition-transform duration-200',
  chevronOpen: 'rotate-180',
  subList: `flex flex-col ${colors.navMenuBg}`,
  subItem: `px-8 py-2.5 text-left text-sm font-medium ${colors.navMenuText} transition-colors ${colors.navMenuHover}`
};

export const NavAccordionItem = ({ label, path, items = [], isOpen, onToggle, onNavigate }) => {
  if (items.length === 0) {
    return (
      <button type="button" className={styles.trigger} onClick={() => onNavigate(path)}>
        {label}
      </button>
    );
  }

  return (
    <div>
      <button type="button" className={styles.trigger} onClick={onToggle}>
        {label}
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>
      {isOpen && (
        <div className={styles.subList}>
          {items.map((item) => (
            <button
              key={item.path}
              type="button"
              className={styles.subItem}
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};