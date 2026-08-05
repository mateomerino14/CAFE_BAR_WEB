import { Button } from '../atoms/Button';

const styles = { wrapper: 'flex flex-wrap gap-2' };

export const DeletionSelectionControls = ({ onSelectAll, onDeselectAll, onInvert }) => {
  return (
    <div className={styles.wrapper}>
      <Button type="button" size="sm" onClick={onSelectAll}>SELECCIONAR TODOS</Button>
      <Button type="button" variant="warning" size="sm" onClick={onDeselectAll}>DESELECCIONAR TODOS</Button>
      <Button type="button" variant="danger" size="sm" onClick={onInvert}>INVERTIR SELECCIÓN</Button>
    </div>
  );
};