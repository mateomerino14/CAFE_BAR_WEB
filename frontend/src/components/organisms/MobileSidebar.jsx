import {X} from 'lucide-react';
import {Overlay} from '../atoms/Overlay';
import {NavAccordionItem } from '../molecules/NavAccordionItem';
import {colors} from '../../constants/theme';

const styles = {
  panel: `fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col overflow-y-auto ${colors.navBackground} shadow-2xl transition-transform duration-300 md:hidden`,
  open: 'translate-x-0',
  closed: '-translate-x-full',
  header: 'flex items-center justify-between border-b border-white/20 p-4',
  title: `text-lg font-bold ${colors.navText}`,
  closeButton: `flex items-center justify-center rounded-lg p-2 ${colors.navText} transition-colors ${colors.navHover}`,
  list: 'flex flex-1 flex-col divide-y divide-white/20'
};

export const MobileSidebar = ({isOpen, onClose, items, openLabel, onToggleSection, onNavigate}) => {
  return (
    <>
      {isOpen && <Overlay onClick={onClose} className="md:hidden" />}
      <div className={`${styles.panel} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.header}>
          <span className={styles.title}>MENÚ</span>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <div className={styles.list}>
          {items.map((item) => (
            <NavAccordionItem
              key={item.label}
              label={item.label}
              path={item.path}
              items={item.items || []}
              isOpen={openLabel === item.label}
              onToggle={() => onToggleSection(item.label)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </>
  );
};