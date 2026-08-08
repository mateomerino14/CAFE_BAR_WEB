import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { printPlainText, downloadPlainTextAsPdf, isMobileDevice, tryPrintViaAgent, openPrintAgentAuthorization } from '../../features/pos/utils/printWindow';

const styles = {
  preview: 'max-h-[60vh] overflow-auto rounded-lg bg-slate-50 p-3',
  pre: 'whitespace-pre font-mono text-[11px] leading-tight text-black',
  actions: 'mt-4 flex flex-col gap-2'
};

export const PrintModal = ({ onClose, title, text, tipo, onPrinted, onCompletedWithoutCounting }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const isMobile = isMobileDevice();

  const handlePrintDirect = async () => {
    setError('');
    setSending(true);
    const result = await tryPrintViaAgent(tipo, text);
    setSending(false);

    if (result.success) {
      onPrinted();
      onClose();
      return;
    }

    if (isMobile) {
      setError('No se pudo conectar con el servicio de impresión. Verifica el WiFi del local.');
    } else {
      printPlainText(title, text);
      onPrinted();
      onClose();
    }
  };

  const handleDownloadPdf = () => {
    downloadPlainTextAsPdf(title, text);
    onCompletedWithoutCounting();
    onClose();
  };

  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.preview}>
        <pre className={styles.pre}>{text}</pre>
      </div>

      <div className={styles.actions}>
        <Button type="button" onClick={handlePrintDirect} disabled={sending}>
          {sending ? 'IMPRIMIENDO...' : 'IMPRIMIR'}
        </Button>
        <Button type="button" variant="warning" onClick={openPrintAgentAuthorization}>
          AUTORIZAR IMPRESORA (primera vez)
        </Button>
        {isMobile && (
          <Button type="button" variant="warning" onClick={handleDownloadPdf}>DESCARGAR PDF</Button>
        )}
        <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
      </div>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};