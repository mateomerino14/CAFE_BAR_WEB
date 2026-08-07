import { useEffect, useState } from 'react';
import { getPromotionProductsIngredients } from '../services/posService';

let nextGroupId = 1;

export const usePromotionCustomization = (promotion) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  const [groupsByProduct, setGroupsByProduct] = useState({});
  const [draftCantidadByProduct, setDraftCantidadByProduct] = useState({});
  const [draftExcludedByProduct, setDraftExcludedByProduct] = useState({});
  const [draftExtrasByProduct, setDraftExtrasByProduct] = useState({});

  useEffect(() => {
    setLoading(true);
    getPromotionProductsIngredients(promotion.id_prom)
      .then((data) => {
        setProducts(data);
        const initialDraftCantidad = {};
        data.forEach((p) => {
          initialDraftCantidad[p.idProd] = String(p.cantidadPromo);
        });
        setDraftCantidadByProduct(initialDraftCantidad);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [promotion]);

  const activeProduct = products[activeProductIndex];

  const toggleExclusion = (idProd, idIng) => {
    setDraftExcludedByProduct((prev) => {
      const current = prev[idProd] || [];
      const next = current.includes(idIng) ? current.filter((id) => id !== idIng) : [...current, idIng];
      return { ...prev, [idProd]: next };
    });
  };

  const setExtraQuantity = (idProd, idIng, cantidad) => {
    setDraftExtrasByProduct((prev) => ({
      ...prev,
      [idProd]: { ...(prev[idProd] || {}), [idIng]: cantidad }
    }));
  };

  const setDraftCantidad = (idProd, value) => {
    setDraftCantidadByProduct((prev) => ({ ...prev, [idProd]: value }));
  };

  const getAssigned = (idProd) => (groupsByProduct[idProd] || []).reduce((sum, g) => sum + g.cantidad, 0);
  const getRestante = (idProd, cantidadPromo) => cantidadPromo - getAssigned(idProd);

  const buildIngredientLists = (idProd) => {
    const product = products.find((p) => p.idProd === idProd);
    const excludedIds = draftExcludedByProduct[idProd] || [];
    const extraQuantities = draftExtrasByProduct[idProd] || {};

    const exclusiones = (product?.ingredients || [])
      .filter((ing) => excludedIds.includes(ing.id_ing))
      .map((ing) => ({ idIng: ing.id_ing, nomIng: ing.nom_ing }));

    const extras = (product?.ingredients || [])
      .filter((ing) => Number(extraQuantities[ing.id_ing]) > 0)
      .map((ing) => ({
        idIng: ing.id_ing,
        nomIng: ing.nom_ing,
        cantidadExtra: Number(extraQuantities[ing.id_ing]),
        precioExtra: ing.precio_extra
      }));

    return { exclusiones, extras };
  };

  const addUnitGroup = (idProd, cantidadPromo) => {
    const cantidadGrupo = Number(draftCantidadByProduct[idProd]) || 0;
    const restante = getRestante(idProd, cantidadPromo);
    if (cantidadGrupo <= 0 || cantidadGrupo > restante) return false;

    const { exclusiones, extras } = buildIngredientLists(idProd);

    setGroupsByProduct((prev) => ({
      ...prev,
      [idProd]: [...(prev[idProd] || []), { id: nextGroupId++, cantidad: cantidadGrupo, exclusiones, extras }]
    }));

    const nuevoRestante = restante - cantidadGrupo;
    setDraftCantidadByProduct((prev) => ({ ...prev, [idProd]: nuevoRestante > 0 ? String(nuevoRestante) : '' }));
    setDraftExcludedByProduct((prev) => ({ ...prev, [idProd]: [] }));
    setDraftExtrasByProduct((prev) => ({ ...prev, [idProd]: {} }));
    return true;
  };

  const removeUnitGroup = (idProd, groupId) => {
    setGroupsByProduct((prev) => ({
      ...prev,
      [idProd]: (prev[idProd] || []).filter((g) => g.id !== groupId)
    }));
  };

  const buildAllProductCustomizations = (bundleCantidad = 1) => {
    return products
      .map((product) => {
        const groups = groupsByProduct[product.idProd] || [];
        if (groups.length === 0) return null;

        const totalUnits = product.cantidadPromo * bundleCantidad;
        const restante = totalUnits - getAssigned(product.idProd);
        const finalGroups = restante > 0
          ? [...groups, { id: 'auto', cantidad: restante, exclusiones: [], extras: [] }]
          : groups;

        return { idProd: product.idProd, nombre: product.nombre, unitGroups: finalGroups };
      })
      .filter(Boolean);
  };

  const totalExtraCost = Object.values(groupsByProduct).reduce((sum, groups) => {
    return sum + groups.reduce((s, g) => {
      const groupExtraCost = (g.extras || []).reduce((es, e) => es + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
      return s + groupExtraCost * g.cantidad;
    }, 0);
  }, 0);

  return {
    products, loading,
    activeProductIndex, setActiveProductIndex,
    activeProduct,
    groupsByProduct, addUnitGroup, removeUnitGroup, getRestante, getAssigned,
    draftCantidadByProduct, setDraftCantidad,
    draftExcludedByProduct, toggleExclusion,
    draftExtrasByProduct, setExtraQuantity,
    buildAllProductCustomizations,
    totalExtraCost
  };
};