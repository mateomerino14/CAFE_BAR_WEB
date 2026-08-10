import {useState} from 'react';
import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Checkbox} from '../atoms/Checkbox';
import {FormField} from '../molecules/FormField';
import {Toast} from '../atoms/Toast';
import {usePromotionCustomization} from '../../features/pos/hooks/usePromotionCustomization';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  section: 'mt-4 flex flex-col gap-3',
  typeRow: 'flex gap-3',
  typeButton: 'flex-1 rounded-lg border-2 px-3 py-2 text-center text-sm font-bold transition-colors',
  typeActive: 'border-blue-500 bg-blue-50 text-blue-700',
  typeInactive: 'border-slate-200 bg-white text-slate-500',
  productTabsRow: 'mt-3 flex flex-wrap gap-2',
  productTabButton: 'rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors',
  productTabActive: 'border-indigo-500 bg-indigo-50 text-indigo-700',
  productTabInactive: 'border-slate-200 bg-white text-slate-500',
  subTabRow: 'flex gap-3',
  subTabButton: 'flex-1 rounded-lg border-2 px-3 py-2 text-center text-sm font-bold transition-colors',
  subTabExclusionActive: 'border-red-500 bg-red-50 text-red-700',
  subTabExtraActive: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  subTabInactive: 'border-slate-200 bg-white text-slate-500',
  ingredientRow: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  ingredientList: 'max-h-40 overflow-y-auto',
  total: 'mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm font-bold text-blue-700',
  actions: 'mt-4 flex flex-col gap-2',
  groupsList: 'mt-3 flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200',
  groupRow: 'flex items-center justify-between gap-2 px-3 py-2 text-sm',
  groupInfo: 'min-w-0 flex-1',
  groupMeta: 'text-xs text-slate-500',
  removeGroupBtn: 'shrink-0 text-xs font-bold text-red-600 hover:underline',
  remaining: 'mt-2 text-sm font-semibold text-orange-600',
  hint: 'mt-2 text-xs text-slate-400',
  loading: 'mt-4 rounded-lg bg-slate-50 p-6 text-center text-sm font-semibold text-blue-500'
};

export const PromotionAddModal = ({promotion, onClose, onConfirm}) => {
  const {
    products, loading,
    activeProductIndex, setActiveProductIndex,
    activeProduct,
    groupsByProduct, addUnitGroup, removeUnitGroup, getRestante, getAssigned,
    draftCantidadByProduct, setDraftCantidad,
    draftExcludedByProduct, toggleExclusion,
    draftExtrasByProduct, setExtraQuantity,
    buildAllProductCustomizations,
    totalExtraCost
  } = usePromotionCustomization(promotion);

  const [cantidad, setCantidad] = useState('1');
  const [tipoConsumo, setTipoConsumo] = useState('Local');
  const [tab, setTab] = useState('exclusiones');
  const [error, setError] = useState('');
  const cantidadNumerica = Number(cantidad) || 0;
  const canCustomize = products.some((p) => p.ingredients.length > 0);
  const total = Number(promotion.precio_prom) * cantidadNumerica + (canCustomize ? totalExtraCost : 0);
  const activeGroups = activeProduct ? groupsByProduct[activeProduct.idProd] || [] : [];
  const activeRestante = activeProduct ? getRestante(activeProduct.idProd, activeProduct.cantidadPromo * cantidadNumerica) : 0;
  const activeAssigned = activeProduct ? getAssigned(activeProduct.idProd) : 0;

  const handleAddGroup = () => {
    setError('');
    if (!activeProduct) return;
    const ok = addUnitGroup(activeProduct.idProd, activeProduct.cantidadPromo * cantidadNumerica);
    if (!ok) setError('Ingrese una cantidad válida (no puede superar las unidades restantes de este producto)');
  };

  const handleConfirm = () => {
    setError('');
    if (!cantidadNumerica || cantidadNumerica < 1) {
      setError('Ingrese una cantidad válida');
      return;
    }
    const productCustomizations = canCustomize ? buildAllProductCustomizations(cantidadNumerica) : [];
    onConfirm({ promotion, cantidad: cantidadNumerica, tipoConsumo, productCustomizations });
    onClose();
  };

  return (
    <Modal onClose={onClose} size={!loading && canCustomize ? 'xl' : 'sm'}>
      <h2 className={styles.title}>{promotion.nom_prom}</h2>
      <div className={styles.section}>
        <FormField label="CANTIDAD">
          <TextInput value={cantidad} onChange={(event) => setCantidad(event.target.value.replace(/\D/g, ''))} maxLength={3} />
        </FormField>
        <div className={styles.typeRow}>
          <button type="button" className={`${styles.typeButton} ${tipoConsumo === 'Local' ? styles.typeActive : styles.typeInactive}`} onClick={() => setTipoConsumo('Local')}>Local</button>
          <button type="button" className={`${styles.typeButton} ${tipoConsumo === 'Para llevar' ? styles.typeActive : styles.typeInactive}`} onClick={() => setTipoConsumo('Para llevar')}>Para llevar</button>
        </div>
      </div>
      {loading && <p className={styles.loading}>Cargando productos de la promoción...</p>}
      {!loading && canCustomize && (
        <div className={styles.section}>
          <div className={styles.productTabsRow}>
            {products.map((product, index) => (
              <button
                key={product.idProd}
                type="button"
                className={`${styles.productTabButton} ${activeProductIndex === index ? styles.productTabActive : styles.productTabInactive}`}
                onClick={() => setActiveProductIndex(index)}
              >
                {product.nombre} ({getAssigned(product.idProd)}/{product.cantidadPromo * cantidadNumerica})
              </button>
            ))}
          </div>
          {activeProduct && (
            <>
              <FormField label={`CANTIDAD DEL GRUPO PARA "${activeProduct.nombre}" (restan ${activeRestante} de ${activeProduct.cantidadPromo * cantidadNumerica})`}>
                <TextInput
                  value={draftCantidadByProduct[activeProduct.idProd] || ''}
                  onChange={(event) => setDraftCantidad(activeProduct.idProd, event.target.value.replace(/\D/g, ''))}
                  maxLength={2}
                />
              </FormField>

              <div className={styles.subTabRow}>
                <button
                  type="button"
                  className={`${styles.subTabButton} ${tab === 'exclusiones' ? styles.subTabExclusionActive : styles.subTabInactive}`}
                  onClick={() => setTab('exclusiones')}
                >
                  Sin ingredientes
                </button>
                <button
                  type="button"
                  className={`${styles.subTabButton} ${tab === 'extras' ? styles.subTabExtraActive : styles.subTabInactive}`}
                  onClick={() => setTab('extras')}
                >
                  Extras
                </button>
              </div>
              <div className={styles.ingredientList}>
                {tab === 'exclusiones' && activeProduct.ingredients.map((ing) => (
                  <div key={ing.id_ing} className={styles.ingredientRow}>
                    <Checkbox
                      label={ing.nom_ing}
                      checked={!(draftExcludedByProduct[activeProduct.idProd] || []).includes(ing.id_ing)}
                      onChange={() => toggleExclusion(activeProduct.idProd, ing.id_ing)}
                    />
                  </div>
                ))}
                {tab === 'extras' && activeProduct.ingredients.map((ing) => (
                  <div key={ing.id_ing} className={styles.ingredientRow}>
                    <span>{ing.nom_ing} (Bs {Number(ing.precio_extra || 0).toFixed(2)} c/u)</span>
                    <TextInput
                      value={(draftExtrasByProduct[activeProduct.idProd] || {})[ing.id_ing] || ''}
                      onChange={(event) => setExtraQuantity(activeProduct.idProd, ing.id_ing, event.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      maxLength={3}
                      style={{ width: '3.5rem', textAlign: 'center' }}
                    />
                  </div>
                ))}
              </div>
              <Button type="button" variant="warning" size="sm" onClick={handleAddGroup}>AÑADIR GRUPO PARA ESTE PRODUCTO</Button>
              {activeRestante > 0 && activeAssigned > 0 && (
                <p className={styles.remaining}>Las {activeRestante} unidades restantes de "{activeProduct.nombre}" quedarán sin personalizar</p>
              )}
              {activeGroups.length > 0 && (
                <div className={styles.groupsList}>
                  {activeGroups.map((group) => (
                    <div key={group.id} className={styles.groupRow}>
                      <div className={styles.groupInfo}>
                        <p>{group.cantidad}x {activeProduct.nombre}</p>
                        <p className={styles.groupMeta}>
                          {[
                            group.exclusiones.length ? `sin ${group.exclusiones.map((e) => e.nomIng).join(', ')}` : '',
                            group.extras.length ? `extra ${group.extras.map((e) => `${e.cantidadExtra}x ${e.nomIng}`).join(', ')}` : ''
                          ].filter(Boolean).join(' | ') || 'sin personalizar'}
                        </p>
                      </div>
                      <button type="button" className={styles.removeGroupBtn} onClick={() => removeUnitGroup(activeProduct.idProd, group.id)}>Quitar</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!loading && (
        <>
          <div className={styles.total}>Total: Bs {total.toFixed(2)}</div>
          <div className={styles.actions}>
            <Button type="button" onClick={handleConfirm}>AGREGAR AL PEDIDO</Button>
            <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
          </div>
        </>
      )}
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};