import { useEffect, useState } from 'react';
import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { Toast } from '../../../components/atoms/Toast';
import { PosOrderHeader } from '../../../components/organisms/PosOrderHeader';
import { PosProductBrowser } from '../../../components/organisms/PosProductBrowser';
import { PosCartList } from '../../../components/organisms/PosCartList';
import { TablePickerModal } from '../../../components/organisms/TablePickerModal';
import { EmployeePickerModal } from '../../../components/organisms/EmployeePickerModal';
import { ProductCustomizeModal } from '../../../components/organisms/ProductCustomizeModal';
import { PromotionAddModal } from '../../../components/organisms/PromotionAddModal';
import { PendingOrdersModal } from '../../../components/organisms/PendingOrdersModal';
import { PrintModal } from '../../../components/organisms/PrintModal';
import { PasswordConfirmModal } from '../../../components/organisms/PasswordConfirmModal';
import { CheckoutModal } from '../../../components/organisms/CheckoutModal';
import { useCajaPage } from '../hooks/useCajaPage';
import { useOrderTicket } from '../hooks/useOrderTicket';
import { useKitchenTicket } from '../hooks/useKitchenTicket';
import { usePrintGuard } from '../hooks/usePrintGuard';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { getSectionsWithTables, getEmployeesForPos, getUnmarkedCount } from '../services/posService';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { buildTicketText, buildKitchenText } from '../utils/ticketFormat';

const styles = {
  wrapper: 'flex flex-col gap-4',
  layout: 'grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]',
  left: 'flex flex-col gap-4',
  right: 'flex flex-col gap-4',
  navButtons: 'flex gap-2',
  printButtons: 'flex gap-2',
  hint: 'text-center text-xs font-semibold text-orange-600'
};

export const CajaPage = () => {
  const {
    seccion, mesa, mesero, handleSelectTable, handleSelectMesero, cart,
    error, success, loading,
    lastOrderId, lastBatchFecha, lastNumVenta, previewNumVenta,
    ticketPrinted, cocinaPrinted,
    ensureOrderRegistered, markTicketPrinted, markCocinaPrinted
  } = useCajaPage();

  const tablePicker = useDisclosure(false);
  const employeePicker = useDisclosure(false);
  const pendingOrders = useDisclosure(false);
  const ticketPrint = useDisclosure(false);
  const kitchenPrint = useDisclosure(false);
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [addingPromotion, setAddingPromotion] = useState(null);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [checkoutTicket, setCheckoutTicket] = useState(null);
  const checkoutPrint = useDisclosure(false);
  const [printingType, setPrintingType] = useState(null);
  const ticket = useOrderTicket(lastOrderId);
  const kitchenTicket = useKitchenTicket(lastOrderId, lastBatchFecha);
  const printGuard = usePrintGuard();

  useAutoDismiss(checkoutError, () => setCheckoutError(''));
  useAutoDismiss(checkoutSuccess, () => setCheckoutSuccess(''));

  useEffect(() => {
    if (!lastOrderId) printGuard.resetCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOrderId]);

  useEffect(() => {
    if (tablePicker.isOpen) {
      setLoadingSections(true);
      getSectionsWithTables()
        .then(setSections)
        .catch(() => setSections([]))
        .finally(() => setLoadingSections(false));
    }
  }, [tablePicker.isOpen]);

  useEffect(() => {
    if (employeePicker.isOpen) {
      setLoadingEmployees(true);
      getEmployeesForPos()
        .then(setEmployees)
        .catch(() => setEmployees([]))
        .finally(() => setLoadingEmployees(false));
    }
  }, [employeePicker.isOpen]);

  const handleRequestCheckout = async (selectedSeccion, selectedMesa) => {
    setCheckoutError('');
    try {
      const unmarked = await getUnmarkedCount(selectedSeccion.id_seccion, selectedMesa.id_mesa);
      if (unmarked > 0) {
        setCheckoutError(`Esta mesa tiene ${unmarked} unidad(es) sin marcar como listas`);
        return;
      }
      setCheckoutTarget({ seccion: selectedSeccion, mesa: selectedMesa });
    } catch (err) {
      setCheckoutError('No se pudo verificar el estado de la mesa');
    }
  };

  const handlePrintTicket = async () => {
    setPrintingType('ticket');
    const result = await ensureOrderRegistered();
    setPrintingType(null);
    if (!result) return;
    printGuard.requestPrint('ticket', () => ticketPrint.open());
  };

  const handlePrintCocina = async () => {
    setPrintingType('cocina');
    const result = await ensureOrderRegistered();
    setPrintingType(null);
    if (!result) return;
    printGuard.requestPrint('cocina', () => kitchenPrint.open());
  };

  return (
    <>
      <MainLayout title="REGISTRAR PEDIDO">
        <div className={styles.wrapper}>
          <PosOrderHeader seccion={seccion} mesa={mesa} mesero={mesero} numVenta={seccion && mesa ? (lastNumVenta || previewNumVenta) : null} />
          <div className={styles.layout}>
            <div className={styles.left}>
              <div className={styles.printButtons}>
                <Button type="button" className="flex-1" onClick={handlePrintTicket} disabled={printingType !== null}>
                  {printingType === 'ticket' ? 'PROCESANDO...' : 'IMPRIMIR TICKET'}
                </Button>
                <Button type="button" variant="warning" className="flex-1" onClick={handlePrintCocina} disabled={printingType !== null}>
                  {printingType === 'cocina' ? 'PROCESANDO...' : 'ENVIAR COCINA'}
                </Button>
              </div>
              {lastOrderId && !(ticketPrinted && cocinaPrinted) && (
                <p className={styles.hint}>
                  Debe imprimir el ticket y enviar a cocina antes de pasar a la siguiente venta
                  {ticketPrinted && ' — ticket ya impreso'}
                  {cocinaPrinted && ' — cocina ya enviada'}
                </p>
              )}
              {mesa && !mesa.disponible && (
                <Button type="button" variant="warning" onClick={pendingOrders.open}>VER PEDIDOS / MARCAR LISTOS</Button>
              )}
              <PosCartList items={cart.items} onRemove={cart.removeItem} onUpdateQuantity={cart.updateQuantity} total={cart.total} />
            </div>
            <div className={styles.right}>
              <div className={styles.navButtons}>
                <Button type="button" className="flex-1" onClick={tablePicker.open}>SALONES / MESAS</Button>
                <Button type="button" variant="warning" className="flex-1" onClick={employeePicker.open}>EMPLEADOS</Button>
              </div>
              <PosProductBrowser
                onAddProduct={(product) => setCustomizingProduct(product)}
                onAddPromotion={(promotion) => setAddingPromotion(promotion)}
              />
            </div>
          </div>
        </div>
      </MainLayout>
      {tablePicker.isOpen && (
        <TablePickerModal
          sections={sections}
          loading={loadingSections}
          onClose={tablePicker.close}
          onSelect={(selectedSeccion, selectedMesa) => {
            handleSelectTable(selectedSeccion, selectedMesa);
            tablePicker.close();
          }}
          onCheckout={(selectedSeccion, selectedMesa) => {
            tablePicker.close();
            handleRequestCheckout(selectedSeccion, selectedMesa);
          }}
        />
      )}
      {employeePicker.isOpen && (
        <EmployeePickerModal
          employees={employees}
          loading={loadingEmployees}
          onClose={employeePicker.close}
          onSelect={(employee) => {
            handleSelectMesero(employee);
            employeePicker.close();
          }}
        />
      )}
      {customizingProduct && (
        <ProductCustomizeModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onConfirm={cart.addProduct}
        />
      )}
      {addingPromotion && (
        <PromotionAddModal
          promotion={addingPromotion}
          onClose={() => setAddingPromotion(null)}
          onConfirm={cart.addPromotion}
        />
      )}
      {pendingOrders.isOpen && mesa && (
        <PendingOrdersModal seccion={seccion} mesa={mesa} onClose={pendingOrders.close} />
      )}
      {ticketPrint.isOpen && ticket && (
        <PrintModal
          onClose={ticketPrint.close}
          title={`Ticket Venta ${lastNumVenta || ''}`}
          text={buildTicketText(ticket)}
          tipo="ticket"
          onPrinted={() => {
            markTicketPrinted();
            printGuard.recordPrint('ticket');
          }}
          onCompletedWithoutCounting={() => {
            markTicketPrinted();
          }}
        />
      )}
      {kitchenPrint.isOpen && kitchenTicket && (
        <PrintModal
          onClose={kitchenPrint.close}
          title={`Cocina Venta ${lastNumVenta || ''}`}
          text={buildKitchenText(kitchenTicket)}
          tipo="cocina"
          onPrinted={() => {
            markCocinaPrinted();
            printGuard.recordPrint('cocina');
          }}
          onCompletedWithoutCounting={() => {
            markCocinaPrinted();
          }}
        />
      )}
      {printGuard.pendingAction && (
        <PasswordConfirmModal
          onClose={printGuard.cancelPending}
          onConfirm={printGuard.confirmWithPassword}
          error={printGuard.error}
        />
      )}
      {checkoutTarget && (
        <CheckoutModal
          seccion={checkoutTarget.seccion}
          mesa={checkoutTarget.mesa}
          onClose={() => setCheckoutTarget(null)}
          onConfirmed={(ticketData) => {
            setCheckoutSuccess(`Pago de la Mesa ${checkoutTarget.mesa.id_mesa} registrado correctamente`);
            setCheckoutTicket(ticketData);
            setCheckoutTarget(null);
            printGuard.requestPrint('ticket', () => checkoutPrint.open());
          }}
        />
      )}
      {checkoutPrint.isOpen && checkoutTicket && (
        <PrintModal
          onClose={checkoutPrint.close}
          title={`Ticket Venta ${checkoutTicket.numVenta || ''}`}
          text={buildTicketText(checkoutTicket)}
          tipo="ticket"
          onPrinted={() => printGuard.recordPrint('ticket')}
          onCompletedWithoutCounting={() => {}}
        />
      )}
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
      {checkoutError && <Toast>{checkoutError}</Toast>}
      {checkoutSuccess && <Toast variant="success">{checkoutSuccess}</Toast>}
    </>
  );
};