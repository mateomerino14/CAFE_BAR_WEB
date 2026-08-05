import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { useMarkCards } from '../../features/pos/hooks/useMarkCards';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  columns: 'mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3',
  localColumn: 'rounded-xl bg-blue-50 p-3',
  llevarColumn: 'rounded-xl bg-red-50 p-3',
  faltantesColumn: 'rounded-xl bg-orange-50 p-3',
  columnTitle: 'mb-2 text-center text-sm font-bold uppercase tracking-wide',
  localTitle: 'text-blue-700',
  llevarTitle: 'text-red-700',
  faltantesTitle: 'text-orange-700',
  columnBody: 'flex flex-col gap-3',
  card: 'rounded-xl border-2 bg-white p-3',
  local: 'border-blue-300',
  llevar: 'border-red-300',
  name: 'font-bold text-slate-800',
  tag: 'mt-1 inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700',
  extraTag: 'mt-1 inline-block rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700',
  progressBar: 'mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200',
  progressFill: 'h-full bg-blue-500',
  counts: 'mt-1 flex justify-between text-xs font-semibold text-slate-600',
  actions: 'mt-2 flex gap-2',
  empty: 'text-center text-sm text-slate-400',
  faltanteRow: 'rounded-lg bg-white px-3 py-2 text-sm font-semibold text-orange-700',
  completo: 'rounded-lg bg-white px-3 py-3 text-center text-sm font-bold text-emerald-700',
  footer: 'mt-4 flex flex-col gap-3',
  unsavedNotice: 'flex items-center justify-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700'
};

const Card = ({ card, cardIndex, markCount, unmarkOne, variant }) => {
  const listos = card.listos.length;
  const total = card.total;
  const percent = total > 0 ? (listos / total) * 100 : 0;

  return (
    <div className={`${styles.card} ${variant === 'Local' ? styles.local : styles.llevar}`}>
      <p className={styles.name}>{card.nombre}</p>
      {card.exclusiones.length > 0 && <p className={styles.tag}>sin: {card.exclusiones.join(', ')}</p>}
      {card.extrasTexto && <p className={styles.extraTag}>{card.extrasTexto}</p>}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.counts}>
        <span>Listos: {listos}</span>
        <span>Faltan: {card.pendientes.length}</span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="danger" size="sm" onClick={() => unmarkOne(cardIndex)}>-1</Button>
        <Button type="button" size="sm" onClick={() => markCount(cardIndex, 1)}>+1</Button>
        <Button type="button" variant="warning" size="sm" onClick={() => markCount(cardIndex, card.pendientes.length)}>TODOS</Button>
      </div>
    </div>
  );
};

export const MarkCardsModal = ({ fecha, onClose }) => {
  const { cards, markCount, unmarkOne, loading, saving, hasPendingChanges, save } = useMarkCards(fecha);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveAndClose = async () => {
    setError('');
    try {
      await save();
      onClose();
    } catch (err) {
      setError('No se pudieron guardar los cambios, intenta de nuevo');
    }
  };

  const handleSave = async () => {
    setError('');
    try {
      await save();
      setSuccess('Cambios guardados correctamente');
    } catch (err) {
      setError('No se pudieron guardar los cambios, intenta de nuevo');
    }
  };

  const cardsWithIndex = cards.map((card, index) => ({ card, index }));
  const locales = cardsWithIndex.filter((c) => c.card.tipo === 'Local');
  const llevar = cardsWithIndex.filter((c) => c.card.tipo !== 'Local');
  const totalFaltantes = cards.reduce((sum, c) => sum + c.pendientes.length, 0);

  return (
    <Modal onClose={handleSaveAndClose} size="xl">  
      <h2 className={styles.title}>Marcar productos listos</h2>
      {loading && <p className={styles.empty}>Cargando...</p>}
      {!loading && cards.length === 0 && <p className={styles.empty}>No hay productos pendientes por marcar</p>}
      {!loading && cards.length > 0 && (
        <div className={styles.columns}>
          <div className={styles.localColumn}>
            <p className={`${styles.columnTitle} ${styles.localTitle}`}>Local</p>
            <div className={styles.columnBody}>
              {locales.length === 0 && <p className={styles.empty}>—</p>}
              {locales.map(({ card, index }) => (
                <Card key={index} card={card} cardIndex={index} markCount={markCount} unmarkOne={unmarkOne} variant="Local" />
              ))}
            </div>
          </div>
          <div className={styles.llevarColumn}>
            <p className={`${styles.columnTitle} ${styles.llevarTitle}`}>Para llevar</p>
            <div className={styles.columnBody}>
              {llevar.length === 0 && <p className={styles.empty}>—</p>}
              {llevar.map(({ card, index }) => (
                <Card key={index} card={card} cardIndex={index} markCount={markCount} unmarkOne={unmarkOne} variant="Llevar" />
              ))}
            </div>
          </div>
          <div className={styles.faltantesColumn}>
            <p className={`${styles.columnTitle} ${styles.faltantesTitle}`}>Faltantes</p>
            <div className={styles.columnBody}>
              {totalFaltantes === 0 && <p className={styles.completo}>Todos los productos están listos</p>}
{cards.filter((c) => c.pendientes.length > 0).map((card, index) => {
  const detalle = [
    card.exclusiones.length ? `sin ${card.exclusiones.join(', ')}` : '',
    card.extrasTexto ? `extra ${card.extrasTexto}` : ''
  ].filter(Boolean).join(' | ');

  return (
    <p key={index} className={styles.faltanteRow}>
      {card.nombre} ({card.tipo}){detalle ? ` — ${detalle}` : ''}: {card.pendientes.length} faltantes
    </p>
  );
})}
            </div>
          </div>
        </div>
      )}
      <div className={styles.footer}>
        {hasPendingChanges && <p className={styles.unsavedNotice}>Tienes cambios sin guardar</p>}
        <Button type="button" onClick={handleSave} disabled={saving || !hasPendingChanges}>
          {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </Button>
        <Button type="button" variant="danger" onClick={handleSaveAndClose}>CERRAR</Button>
      </div>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </Modal>
  );
};