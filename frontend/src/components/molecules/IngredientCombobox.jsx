import {useMemo, useRef, useState} from 'react';
import {useClickOutside} from '../../hooks/useClickOutside';
import {useDropdownDirection} from '../../hooks/useDropdownDirection';
import {TextInput} from '../atoms/TextInput';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'relative w-full',
  menuDown: `absolute left-0 top-full z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-200 ${colors.navMenuBg} py-1 shadow-xl`,
  menuUp: `absolute left-0 bottom-full z-20 mb-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-200 ${colors.navMenuBg} py-1 shadow-xl`,
  menuItem: `block w-full px-4 py-2 text-left text-sm font-medium ${colors.navMenuText} transition-colors ${colors.navMenuHover}`,
  empty: 'px-4 py-2 text-sm text-slate-400'
};

export const IngredientCombobox = ({ value, onInputChange, options, onSelect, placeholder }) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(ref, () => setIsOpen(false));
  const direction = useDropdownDirection(ref, isOpen);
  const filtered = useMemo(() => {
    if (!value) return options;
    return options.filter((option) => option.nom_ing.toLowerCase().includes(value.toLowerCase()));
  }, [options, value]);
  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };
  return (
    <div className={styles.wrapper} ref={ref}>
      <TextInput
        value={value}
        onChange={(event) => {
          onInputChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      {isOpen && (
        <div className={direction === 'up' ? styles.menuUp : styles.menuDown}>
          {filtered.length === 0 && <span className={styles.empty}>Sin coincidencias</span>}
          {filtered.map((option) => (
            <button key={option.id_ing} type="button" className={styles.menuItem} onClick={() => handleSelect(option)}>
              {option.nom_ing}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};