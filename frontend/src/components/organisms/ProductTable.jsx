import { Pencil } from 'lucide-react';
import { ImageBox } from '../atoms/ImageBox';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[700px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  editButton: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${colors.buttonPrimary}`
};

export const ProductTable = ({ products, onEdit }) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            <th className={styles.th}>Producto</th>
            <th className={styles.th}>Categoría / Subcategoría</th>
            <th className={styles.th}>Precio</th>
            <th className={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id_prod}>
              <td className={styles.td}>
                <ImageBox src={product.img_prod} alt={product.nom_prod} className="h-12 w-12" />
              </td>
              <td className={`${styles.td} ${styles.name}`}>{product.nom_prod}</td>
              <td className={styles.td}>{product.subcategoria?.categoria?.nombre_categoria} / {product.subcategoria?.nombre}</td>
              <td className={styles.td}>Bs {Number(product.precio_venta).toFixed(2)}</td>
              <td className={styles.td}>
                <button type="button" className={styles.editButton} onClick={() => onEdit(product)}>
                  <Pencil size={14} /> EDITAR
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};