import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { IngredientCombobox } from '../molecules/IngredientCombobox';
import { FormField } from '../molecules/FormField';

const styles = {
  wrapper: 'grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end'
};

export const IngredientPicker = ({ ingredientInput, onInputChange, options, onSelect, quantity, onQuantityChange, onAdd }) => {
  return (
    <div className={styles.wrapper}>
      <FormField label="INGREDIENTE">
        <IngredientCombobox
          value={ingredientInput}
          onInputChange={onInputChange}
          options={options}
          onSelect={onSelect}
          placeholder="Buscar ingrediente"
        />
      </FormField>
      <FormField label="CANTIDAD">
        <TextInput value={quantity} onChange={(event) => onQuantityChange(event.target.value)} placeholder="0.00" maxLength={11} />
      </FormField>
      <Button type="button" onClick={onAdd}>AÑADIR</Button>
    </div>
  );
};