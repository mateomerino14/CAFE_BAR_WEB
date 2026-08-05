import { CatalogCard } from './CatalogCard';

const styles = { wrapper: 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6' };

export const CatalogGrid = ({ items, type, onSelect }) => {
  return (
    <div className={styles.wrapper}>
      {items.map((item) => (
        <CatalogCard
          key={type === 'products' ? item.id_prod : item.id_prom}
          name={type === 'products' ? item.nom_prod : item.nom_prom}
          image={type === 'products' ? item.img_prod : item.img_prom}
          price={type === 'products' ? item.precio_venta : item.precio_prom}
          cost={type === 'products' ? item.costo_fabricacion : undefined}
          onViewDetails={() => onSelect(item)}
        />
      ))}
    </div>
  );
};