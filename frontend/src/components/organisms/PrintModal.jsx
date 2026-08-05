import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { printPlainText } from '../../features/pos/utils/printWindow';

const styles = {
  preview: 'flex max-h-[60vh] justify-center overflow-auto rounded-lg bg-slate-50 p-3',
  pre: 'whitespace-pre font-mono text-[11px] leading-tight text-black',
  actions: 'mt-4 flex flex-col gap-2'
};

export const PrintModal = ({ onClose, title, text, onPrinted }) => {
  const handlePrint = () => {
    printPlainText(title, text);
    onPrinted();
    onClose();
  };

  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.preview}>
        <pre className={styles.pre}>{text}</pre>
      </div>
      <div className={styles.actions}>
        <Button type="button" onClick={handlePrint}>IMPRIMIR</Button>
        <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
      </div>
    </Modal>
  );
};