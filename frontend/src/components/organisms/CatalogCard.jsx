import { ImageBox } from '../atoms/ImageBox';
import { Button } from '../atoms/Button';
import { colors } from '../../constants/theme';

const styles = {
  card: 'flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm',
  name: `text-sm font-bold ${colors.textPrimary}`,
  price: 'text-xs font-semibold text-emerald-600',
  cost: 'text-xs font-semibold text-red-500'
};

export const CatalogCard = ({ name, image, price, cost, onViewDetails }) => {
  return (
    <div className={styles.card}>
      <span className={styles.name}>{name}</span>
      <ImageBox src={image} alt={name} className="h-28 w-24" />
      <span className={styles.price}>Venta: Bs {Number(price).toFixed(2)}</span>
      {cost !== undefined && <span className={styles.cost}>Costo: Bs {Number(cost).toFixed(2)}</span>}
      <Button type="button" size="sm" onClick={onViewDetails}>VER DETALLES</Button>
    </div>
  );
};