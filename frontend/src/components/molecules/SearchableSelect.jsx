import {useEffect, useMemo, useRef, useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {useClickOutside} from '../../hooks/useClickOutside';
import {useDropdownDirection} from '../../hooks/useDropdownDirection';
import {TextInput} from '../atoms/TextInput';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'relative w-full',
  inputWrapper: 'relative',
  icon: 'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400',
  menuDown: `absolute left-0 top-full z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-200 ${colors.navMenuBg} py-1 shadow-xl`,
  menuUp: `absolute left-0 bottom-full z-20 mb-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-200 ${colors.navMenuBg} py-1 shadow-xl`,
  menuItem: `block w-full px-4 py-2 text-left text-sm font-medium ${colors.navMenuText} transition-colors ${colors.navMenuHover}`,
  empty: 'px-4 py-2 text-sm text-slate-400'
};


export const SearchableSelect = ({value, onChange, options, placeholder, disabled = false}) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  useClickOutside(ref, () => setIsOpen(false));
  const direction = useDropdownDirection(ref, isOpen);
  const selectedOption = options.find((option) => String(option.value) === String(value));
  useEffect(() => {
    setInputText(selectedOption ? selectedOption.label : '');
  }, [selectedOption?.label]);
  const filtered = useMemo(() => {
    if (!inputText || (selectedOption && inputText === selectedOption.label)) return options;
    return options.filter((option) => option.label.toLowerCase().includes(inputText.toLowerCase()));
  }, [options, inputText, selectedOption]);
  const handleSelect = (option) => {
    onChange(option.value);
    setInputText(option.label);
    setIsOpen(false);
  };
  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.inputWrapper}>
        <TextInput
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-9"
        />
        <ChevronDown size={16} className={styles.icon} />
      </div>
      {isOpen && !disabled && (
        <div className={direction === 'up' ? styles.menuUp : styles.menuDown}>
          {filtered.length === 0 && <span className={styles.empty}>Sin coincidencias</span>}
          {filtered.map((option) => (
            <button key={option.value} type="button" className={styles.menuItem} onClick={() => handleSelect(option)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
