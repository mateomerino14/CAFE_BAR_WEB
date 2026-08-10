import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {usePromotionDetail} from '../../features/catalog/hooks/usePromotionDetail';
import {colors} from '../../constants/theme';

const styles = {
  title: `text-lg font-bold ${colors.textPrimary}`,
  section: 'mt-4',
  sectionTitle: `text-sm font-bold ${colors.textPrimary}`,
  row: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  scheduleRow: 'mt-1 flex items-center gap-2 text-sm',
  scheduleDate: 'font-semibold text-orange-600',
  scheduleTime: 'font-semibold text-blue-600',
  scheduleInfo: 'text-slate-400 italic',
  status: 'mt-4 rounded-lg p-3 text-center text-sm font-bold',
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-red-50 text-red-700',
  actions: 'mt-4'
};

const scheduleTextClass = (type) => {
  if (type === 'date') return styles.scheduleDate;
  if (type === 'time') return styles.scheduleTime;
  return styles.scheduleInfo;
};

export const PromotionDetailModal = ({promotion, onClose}) => {
  const { ready, products, dayLabels, dateLabel, timeLabel, isActiveNow } = usePromotionDetail(promotion.id_prom);
  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>{promotion.nom_prom}</h2>
      {ready && (
        <>
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Productos incluidos</p>
            {products.map((item) => (
              <div key={item.id_prod} className={styles.row}>
                <span>{item.producto?.nom_prod}</span>
                <span className="font-semibold">x{item.cantidad_prod_prom}</span>
              </div>
            ))}
          </div>
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Disponibilidad</p>
            <p className={`${styles.scheduleRow} ${scheduleTextClass(dateLabel.type)}`}>{dateLabel.text}</p>
            <p className={`${styles.scheduleRow} ${scheduleTextClass(timeLabel.type)}`}>Horario: {timeLabel.text}</p>
            {dayLabels.length > 0 && (
              <p className="mt-1 text-sm font-semibold text-purple-600">Días disponibles: {dayLabels.join(', ')}</p>
            )}
          </div>
          <div className={`${styles.status} ${isActiveNow ? styles.active : styles.inactive}`}>
            {isActiveNow ? 'Promoción activa ahora' : 'Promoción no disponible ahora'}
          </div>
        </>
      )}
      <Button type="button" variant="danger" className={styles.actions} onClick={onClose}>CERRAR</Button>
    </Modal>
  );
};