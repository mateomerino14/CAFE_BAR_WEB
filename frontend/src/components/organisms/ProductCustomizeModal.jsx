import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Checkbox } from '../atoms/Checkbox';
import { FormField } from '../molecules/FormField';
import { Toast } from '../atoms/Toast';
import { useProductCustomization } from '../../features/pos/hooks/useProductCustomization';
import { usePagination } from '../../hooks/usePagination';

const PAGE_SIZE = 6;

const styles = {
  title: 'text-lg font-bold text-slate-800',
  section: 'mt-4 flex flex-col gap-3',
  typeRow: 'flex gap-3',
  typeButton: 'flex-1 rounded-lg border-2 px-3 py-2 text-center text-sm font-bold transition-colors',
  typeActive: 'border-blue-500 bg-blue-50 text-blue-700',
  typeInactive: 'border-slate-200 bg-white text-slate-500',
  subTabRow: 'flex gap-3',
  subTabButton: 'flex-1 rounded-lg border-2 px-3 py-2 text-center text-sm font-bold transition-colors',
  subTabExclusionActive: 'border-red-500 bg-red-50 text-red-700',
  subTabExtraActive: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  subTabInactive: 'border-slate-200 bg-white text-slate-500',
  ingredientRow: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  total: 'mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm font-bold text-blue-700',
  actions: 'mt-4 flex flex-col gap-2',
  groupsList: 'mt-3 flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200',
  groupRow: 'flex items-center justify-between gap-2 px-3 py-2 text-sm',
  groupInfo: 'min-w-0 flex-1',
  groupMeta: 'text-xs text-slate-500',
  removeGroupBtn: 'shrink-0 text-xs font-bold text-red-600 hover:underline',
  remaining: 'mt-2 text-sm font-semibold text-orange-600',
  loading: 'mt-4 rounded-lg bg-slate-50 p-6 text-center text-sm font-semibold text-blue-500'
};

export const ProductCustomizeModal = ({ product, onClose, onConfirm }) => {
  const {
    cantidadTotal, setCantidadTotal,
    tipoConsumo, setTipoConsumo,
    ingredients, loading,
    subGroupsMode, setSubGroupsMode,
    groups, addGroup, removeGroup,
    draftCantidad, setDraftCantidad,
    draftExcludedIds, toggleExclusion,
    draftExtraQuantities, setExtraQuantity,
    restante,
    simpleExclusiones, simpleExtras, simpleUnitPrice, simpleTotal,
    groupsTotal
  } = useProductCustomization(product);
  const [tab, setTab] = useState('exclusiones');
  const [error, setError] = useState('');
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(ingredients, PAGE_SIZE);

  const handleAddGroup = () => {
    setError('');
    const ok = addGroup();
    if (!ok) setError('Ingrese una cantidad válida (no puede superar lo restante)');
  };

  const handleConfirm = () => {
    setError('');
    const cantidadNumerica = Number(cantidadTotal);

    if (!cantidadNumerica || cantidadNumerica < 1) {
      setError('Ingrese una cantidad válida');
      return;
    }

    if (subGroupsMode) {
      if (restante !== 0) {
        setError(`Aún faltan ${restante} unidades por asignar a un grupo`);
        return;
      }
      groups.forEach((group) => {
        onConfirm({ product, cantidad: group.cantidad, tipoConsumo, exclusiones: group.exclusiones, extras: group.extras });
      });
    } else {
      onConfirm({ product, cantidad: cantidadNumerica, tipoConsumo, exclusiones: simpleExclusiones, extras: simpleExtras });
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>{product.nom_prod}</h2>

      <div className={styles.section}>
        <FormField label="CANTIDAD TOTAL">
          <TextInput value={cantidadTotal} onChange={(event) => setCantidadTotal(event.target.value.replace(/\D/g, ''))} maxLength={3} />
        </FormField>
        <div className={styles.typeRow}>
          <button type="button" className={`${styles.typeButton} ${tipoConsumo === 'Local' ? styles.typeActive : styles.typeInactive}`} onClick={() => setTipoConsumo('Local')}>Local</button>
          <button type="button" className={`${styles.typeButton} ${tipoConsumo === 'Para llevar' ? styles.typeActive : styles.typeInactive}`} onClick={() => setTipoConsumo('Para llevar')}>Para llevar</button>
        </div>
        {!loading && ingredients.length > 0 && Number(cantidadTotal) > 1 && (
          <Checkbox
            label="Dividir en grupos con distinta personalización"
            checked={subGroupsMode}
            onChange={() => setSubGroupsMode((prev) => !prev)}
          />
        )}
      </div>

      {loading && <p className={styles.loading}>Cargando ingredientes...</p>}

      {!loading && ingredients.length > 0 && (
        <div className={styles.section}>
          {subGroupsMode && (
            <FormField label={`CANTIDAD DEL GRUPO (restan ${restante})`}>
              <TextInput value={draftCantidad} onChange={(event) => setDraftCantidad(event.target.value.replace(/\D/g, ''))} maxLength={3} />
            </FormField>
          )}

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

          <div>
            {tab === 'exclusiones' && visible.map((ing) => (
              <div key={ing.id_ing} className={styles.ingredientRow}>
                <Checkbox
                  label={ing.nom_ing}
                  checked={!draftExcludedIds.includes(ing.id_ing)}
                  onChange={() => toggleExclusion(ing.id_ing)}
                />
              </div>
            ))}

            {tab === 'extras' && visible.map((ing) => (
              <div key={ing.id_ing} className={styles.ingredientRow}>
                <span>{ing.nom_ing} (Bs {Number(ing.precio_extra || 0).toFixed(2)} c/u)</span>
                <TextInput
                  value={draftExtraQuantities[ing.id_ing] || ''}
                  onChange={(event) => setExtraQuantity(ing.id_ing, event.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  maxLength={3}
                  style={{ width: '3.5rem', textAlign: 'center' }}
                />
              </div>
            ))}
          </div>

          {ingredients.length > PAGE_SIZE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              canGoLeft={canGoLeft}
              canGoRight={canGoRight}
              onPrev={goLeft}
              onNext={goRight}
            />
          )}

          {subGroupsMode && (
            <>
              <Button type="button" variant="warning" size="sm" onClick={handleAddGroup}>AÑADIR GRUPO</Button>
              {restante > 0 && <p className={styles.remaining}>Restan {restante} unidades por asignar</p>}
              {groups.length > 0 && (
                <div className={styles.groupsList}>
                  {groups.map((group) => (
                    <div key={group.id} className={styles.groupRow}>
                      <div className={styles.groupInfo}>
                        <p>{group.cantidad}x</p>
                        <p className={styles.groupMeta}>
                          {[
                            group.exclusiones.length ? `sin ${group.exclusiones.map((e) => e.nomIng).join(', ')}` : '',
                            group.extras.length ? `extra ${group.extras.map((e) => `${e.cantidadExtra}x ${e.nomIng}`).join(', ')}` : ''
                          ].filter(Boolean).join(' | ') || 'sin personalizar'}
                        </p>
                      </div>
                      <button type="button" className={styles.removeGroupBtn} onClick={() => removeGroup(group.id)}>Quitar</button>
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
          <div className={styles.total}>Total: Bs {(subGroupsMode ? groupsTotal : simpleTotal).toFixed(2)}</div>
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