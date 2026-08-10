import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Toast} from '../atoms/Toast';
import {FormField} from '../molecules/FormField';
import {PrintableTicket} from './PrintableTicket';
import {useCheckout} from '../../features/pos/hooks/useCheckout';
import {getTaxLink} from '../../features/pos/services/posService';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  layout: 'mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]',
  preview: 'max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200',
  form: 'flex flex-col gap-4',
  methodRow: 'grid grid-cols-3 gap-2',
  methodButton: 'rounded-lg border-2 px-2 py-2 text-center text-xs font-bold transition-colors',
  active: 'border-blue-500 bg-blue-50 text-blue-700',
  inactive: 'border-slate-200 bg-white text-slate-500',
  total: 'rounded-lg bg-blue-50 p-3 text-center',
  totalLabel: 'text-xs font-bold text-slate-500',
  totalValue: 'text-xl font-bold text-red-600',
  cambio: 'rounded-lg bg-emerald-50 p-2 text-center text-sm font-bold text-emerald-700',
  actions: 'mt-2 flex flex-col gap-2',
  taxLinkButton: 'mt-2'
};

export const CheckoutModal = ({seccion, mesa, onClose, onConfirmed}) => {
  const {
    ticket, metodo, setMetodo,
    montoEfectivo, setMontoEfectivo,
    montoQr, setMontoQr,
    pagoRecibido, setPagoRecibido,
    total, cambio,
    error, loading, handleConfirm
  } = useCheckout(seccion, mesa, onConfirmed);
  const handleOpenTaxLink = async () => {
    try {
      const enlace = await getTaxLink();
      window.open(enlace, '_blank');
    } catch (err) {
    }
  };
  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>Área de cobro — Mesa {mesa.id_mesa}</h2>
      <div className={styles.layout}>
        <div className={styles.preview}>
          <PrintableTicket ticket={ticket} />
        </div>
        <div className={styles.form}>
          <div className={styles.total}>
            <span className={styles.totalLabel}>TOTAL</span>
            <p className={styles.totalValue}>Bs {total.toFixed(2)}</p>
          </div>
          <FormField label="MÉTODO DE PAGO">
            <div className={styles.methodRow}>
              <button type="button" className={`${styles.methodButton} ${metodo === 'efectivo' ? styles.active : styles.inactive}`} onClick={() => setMetodo('efectivo')}>Efectivo</button>
              <button type="button" className={`${styles.methodButton} ${metodo === 'qr' ? styles.active : styles.inactive}`} onClick={() => setMetodo('qr')}>QR</button>
              <button type="button" className={`${styles.methodButton} ${metodo === 'mixto' ? styles.active : styles.inactive}`} onClick={() => setMetodo('mixto')}>Mixto</button>
            </div>
          </FormField>
          <FormField label="MONTO EFECTIVO">
            <TextInput value={montoEfectivo} onChange={(event) => setMontoEfectivo(event.target.value)} disabled={metodo === 'qr'} />
          </FormField>
          <FormField label="MONTO QR">
            <TextInput value={montoQr} onChange={(event) => setMontoQr(event.target.value)} disabled={metodo === 'efectivo'} />
          </FormField>
          <FormField label="PAGO RECIBIDO (calculadora de cambio)">
            <TextInput value={pagoRecibido} onChange={(event) => setPagoRecibido(event.target.value)} placeholder={total.toFixed(2)} />
          </FormField>
          <div className={styles.cambio}>
            {cambio >= 0 ? `Cambio: Bs ${cambio.toFixed(2)}` : `Falta: Bs ${Math.abs(cambio).toFixed(2)}`}
          </div>
          <div className={styles.actions}>
            <Button type="button" onClick={handleConfirm} disabled={loading}>{loading ? 'CONFIRMANDO...' : 'CONFIRMAR PAGO'}</Button>
            <Button type="button" variant="warning" className={styles.taxLinkButton} onClick={handleOpenTaxLink}>ABRIR PÁGINA DE IMPUESTOS</Button>
            <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
          </div>
        </div>
      </div>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};