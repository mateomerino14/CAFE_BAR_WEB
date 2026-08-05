import { useMemo, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { TextInput } from '../atoms/TextInput';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'relative w-full',
  menu: `absolute left-0 top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 ${colors.navMenuBg} py-1 shadow-xl`,
  menuItem: `block w-full px-4 py-2 text-left text-sm font-medium ${colors.navMenuText} transition-colors ${colors.navMenuHover}`,
  empty: 'px-4 py-2 text-sm text-slate-400'
};

export const Combobox = ({ value, onChange, options = [], placeholder, maxLength }) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(ref, () => setIsOpen(false));

  const filteredOptions = useMemo(() => {
    if (!value) return options;
    return options.filter((option) => option.toLowerCase().includes(value.toLowerCase()));
  }, [options, value]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <TextInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {isOpen && (
        <div className={styles.menu}>
          {filteredOptions.length === 0 && <span className={styles.empty}>Sin coincidencias</span>}
          {filteredOptions.map((option) => (
            <button key={option} type="button" className={styles.menuItem} onClick={() => handleSelect(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};