import {useMemo, useRef, useState} from 'react';
import {Search} from 'lucide-react';
import {TextInput} from '../atoms/TextInput';
import {useClickOutside} from '../../hooks/useClickOutside';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'flex w-full max-w-xs items-center gap-2',
  inputWrapper: 'relative flex-1',
  button: 'flex shrink-0 items-center justify-center rounded-lg bg-blue-500 p-2.5 text-white transition-colors hover:bg-blue-600',
  menu: `absolute left-0 top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 ${colors.navMenuBg} py-1 shadow-xl`,
  menuItem: `block w-full px-4 py-2 text-left text-sm font-medium ${colors.navMenuText} transition-colors ${colors.navMenuHover}`
};


export const SearchBar = ({value, onChange, onSubmit, onSelectSuggestion, suggestions = [], placeholder}) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useClickOutside(ref, () => setIsOpen(false));
  const filteredSuggestions = useMemo(() => {
    if (!value) return [];
    return suggestions.filter((option) => option.toLowerCase().startsWith(value.toLowerCase()));
  }, [suggestions, value]);
  const handleSelect = (option) => {
    onSelectSuggestion(option);
    setIsOpen(false);
  };
  return (
    <form onSubmit={onSubmit} className={styles.wrapper}>
      <div className={styles.inputWrapper} ref={ref}>
        <TextInput
          value={value}
          onChange={(event) => {
            onChange(event);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        {isOpen && filteredSuggestions.length > 0 && (
          <div className={styles.menu}>
            {filteredSuggestions.map((option) => (
              <button key={option} type="button" className={styles.menuItem} onClick={() => handleSelect(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className={styles.button}>
        <Search size={18} />
      </button>
    </form>
  );
};