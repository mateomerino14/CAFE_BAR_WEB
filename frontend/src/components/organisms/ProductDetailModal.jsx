import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {useProductDetail} from '../../features/catalog/hooks/useProductDetail';
import {colors} from '../../constants/theme';

const styles = {
  title: `text-lg font-bold ${colors.textPrimary}`,
  section: 'mt-4',
  sectionTitle: `text-sm font-bold ${colors.textPrimary}`,
  description: 'mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 break-words whitespace-pre-wrap',
  row: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  ingName: 'font-semibold text-slate-700',
  stockOk: 'text-emerald-600',
  stockLow: 'text-orange-500',
  stockZero: 'text-red-600',
  summary: 'mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm font-bold text-blue-700',
  actions: 'mt-4'
};

export const ProductDetailModal = ({product, onClose}) => {
  const { ready, descripcion, ingredientRows, maxUnits } = useProductDetail(product.id_prod);
  const stockClass = (stock) => {
    if (stock === 0) return styles.stockZero;
    if (stock < 10) return styles.stockLow;
    return styles.stockOk;
  };

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>{product.nom_prod}</h2>
      {ready && (
        <>
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Descripción</p>
            <p className={styles.description}>{descripcion || 'Sin descripción'}</p>
          </div>
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Ingredientes necesarios</p>
            {ingredientRows.length === 0 && <p className="mt-1 text-sm text-slate-400">Sin ingredientes registrados</p>}
            {ingredientRows.map((row) => (
              <div key={row.nombre} className={styles.row}>
                <span className={styles.ingName}>{row.nombre}</span>
                <span className={stockClass(row.stock)}>{row.necesario} / {row.stock} {row.unidad}</span>
              </div>
            ))}
          </div>
          <div className={styles.summary}>
            {maxUnits === null && 'Sin datos suficientes para calcular producción'}
            {maxUnits === Infinity && 'Producción ilimitada'}
            {typeof maxUnits === 'number' && Number.isFinite(maxUnits) && `Se pueden fabricar aproximadamente ${Math.max(0, maxUnits)} unidades`}
          </div>
        </>
      )}
      <Button type="button" variant="danger" className={styles.actions} onClick={onClose}>CERRAR</Button>
    </Modal>
  );
};