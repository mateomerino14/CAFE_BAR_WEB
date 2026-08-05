import { useEffect, useState } from 'react';
import { getProductIngredients } from '../../products/services/productService';

let nextGroupId = 1;

export const useProductCustomization = (product) => {
  const [cantidadTotal, setCantidadTotal] = useState('1');
  const [tipoConsumo, setTipoConsumo] = useState('Local');
  const [ingredients, setIngredients] = useState([]);
  const [subGroupsMode, setSubGroupsMode] = useState(false);
  const [groups, setGroups] = useState([]);

  const [draftCantidad, setDraftCantidad] = useState('1');
  const [draftExcludedIds, setDraftExcludedIds] = useState([]);
  const [draftExtraQuantities, setDraftExtraQuantities] = useState({});

  useEffect(() => {
    getProductIngredients(product.id_prod).then(setIngredients).catch(() => setIngredients([]));
  }, [product]);

  const toggleExclusion = (idIng) => {
    setDraftExcludedIds((prev) => (prev.includes(idIng) ? prev.filter((id) => id !== idIng) : [...prev, idIng]));
  };

  const setExtraQuantity = (idIng, cantidadExtra) => {
    setDraftExtraQuantities((prev) => ({ ...prev, [idIng]: cantidadExtra }));
  };

  const buildExclusiones = (excludedIds) =>
    ingredients.filter((ing) => excludedIds.includes(ing.id_ing)).map((ing) => ({ idIng: ing.id_ing, nomIng: ing.nom_ing }));

  const buildExtras = (extraQuantities) =>
    ingredients
      .filter((ing) => Number(extraQuantities[ing.id_ing]) > 0)
      .map((ing) => ({
        idIng: ing.id_ing,
        nomIng: ing.nom_ing,
        cantidadExtra: Number(extraQuantities[ing.id_ing]),
        precioExtra: ing.precio_extra
      }));

  const cantidadTotalNumerica = Number(cantidadTotal) || 0;
  const asignado = groups.reduce((sum, g) => sum + g.cantidad, 0);
  const restante = cantidadTotalNumerica - asignado;

  const addGroup = () => {
    const cantidadGrupo = Number(draftCantidad) || 0;
    if (cantidadGrupo <= 0 || cantidadGrupo > restante) return false;

    setGroups((prev) => [
      ...prev,
      {
        id: nextGroupId++,
        cantidad: cantidadGrupo,
        exclusiones: buildExclusiones(draftExcludedIds),
        extras: buildExtras(draftExtraQuantities)
      }
    ]);
    const nuevoRestante = restante - cantidadGrupo;
    setDraftCantidad(nuevoRestante > 0 ? String(nuevoRestante) : '');
    setDraftExcludedIds([]);
    setDraftExtraQuantities({});
    return true;
  };

  const removeGroup = (id) => setGroups((prev) => prev.filter((g) => g.id !== id));

  const simpleExclusiones = buildExclusiones(draftExcludedIds);
  const simpleExtras = buildExtras(draftExtraQuantities);
  const simpleExtraCost = simpleExtras.reduce((sum, e) => sum + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
  const simpleUnitPrice = Number(product.precio_venta) + simpleExtraCost;
  const simpleTotal = simpleUnitPrice * cantidadTotalNumerica;

  const groupExtraCost = (group) => group.extras.reduce((sum, e) => sum + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
  const groupsTotal = groups.reduce((sum, g) => sum + (Number(product.precio_venta) + groupExtraCost(g)) * g.cantidad, 0);

  return {
    cantidadTotal, setCantidadTotal,
    tipoConsumo, setTipoConsumo,
    ingredients,
    subGroupsMode, setSubGroupsMode,
    groups, addGroup, removeGroup,
    draftCantidad, setDraftCantidad,
    draftExcludedIds, toggleExclusion,
    draftExtraQuantities, setExtraQuantity,
    restante,
    simpleExclusiones, simpleExtras, simpleUnitPrice, simpleTotal,
    groupsTotal
  };
};