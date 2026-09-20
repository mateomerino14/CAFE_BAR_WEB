import { useEffect, useState } from 'react';

const CART_STORAGE_KEY = 'cafebar_cart_backup';

let nextId = 1;

const sameIngredientSet = (a = [], b = []) => {
  const idsA = a.map((i) => i.idIng).sort().join(',');
  const idsB = b.map((i) => i.idIng).sort().join(',');
  return idsA === idsB;
};

const sameExtraSet = (a = [], b = []) => {
  const keyA = a.map((e) => `${e.idIng}:${e.cantidadExtra}`).sort().join(',');
  const keyB = b.map((e) => `${e.idIng}:${e.cantidadExtra}`).sort().join(',');
  return keyA === keyB;
};

const productCustomizationKey = (pc) =>
  `${pc.idProd}|${(pc.exclusiones || []).map((e) => e.idIng).sort().join(',')}|${(pc.extras || []).map((e) => `${e.idIng}:${e.cantidadExtra}`).sort().join(',')}`;

const sameProductCustomizations = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const keyA = a.map(productCustomizationKey).sort().join(';');
  const keyB = b.map(productCustomizationKey).sort().join(';');
  return keyA === keyB;
};

export const usePosCart = () => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const maxId = parsed.reduce((max, item) => Math.max(max, item.cartId || 0), 0);
      nextId = maxId + 1;
      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (items.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // si falla el guardado local, no interrumpe el uso normal del carrito
    }
  }, [items]);

  const addProduct = ({ product, cantidad, tipoConsumo, exclusiones, extras }) => {
    const extraCost = extras.reduce((sum, e) => sum + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
    const unitPrice = Number(product.precio_venta) + extraCost;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.type === 'product' &&
          item.idProd === product.id_prod &&
          item.tipoConsumo === tipoConsumo &&
          sameIngredientSet(item.exclusiones, exclusiones) &&
          sameExtraSet(item.extras, extras)
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) => (index === existingIndex ? { ...item, cantidad: item.cantidad + cantidad } : item));
      }

      return [
        ...prev,
        {
          cartId: nextId++,
          type: 'product',
          idProd: product.id_prod,
          nombre: product.nom_prod,
          unitPrice,
          cantidad,
          tipoConsumo,
          exclusiones,
          extras
        }
      ];
    });
  };

  const addPromotion = ({ promotion, cantidad, tipoConsumo, productCustomizations }) => {
  const extraCost = (productCustomizations || []).reduce((sum, pc) => {
    return sum + (pc.unitGroups || []).reduce((s, g) => {
      const groupExtraCost = (g.extras || []).reduce((es, e) => es + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
      return s + groupExtraCost * g.cantidad;
    }, 0);
  }, 0);

  const subtotal = Number(promotion.precio_prom) * cantidad + extraCost;
  const unitPrice = subtotal / cantidad;

  setItems((prev) => {
    const existingIndex = prev.findIndex(
      (item) =>
        item.type === 'promotion' &&
        item.idProm === promotion.id_prom &&
        item.tipoConsumo === tipoConsumo &&
        sameProductCustomizations(item.productCustomizations, productCustomizations || [])
    );

    if (existingIndex !== -1) {
      return prev.map((item, index) => (index === existingIndex ? { ...item, cantidad: item.cantidad + cantidad } : item));
    }

    return [
      ...prev,
      {
        cartId: nextId++,
        type: 'promotion',
        idProm: promotion.id_prom,
        nombre: promotion.nom_prom,
        unitPrice,
        cantidad,
        tipoConsumo,
        exclusiones: [],
        extras: [],
        productCustomizations: productCustomizations || []
      }
    ];
  });
};

  const updateQuantity = (cartId, cantidad) => {
  setItems((prev) =>
    prev.map((item) => {
      if (item.cartId !== cartId) return item;
      const isLocked = item.type === 'promotion' && item.productCustomizations?.some((pc) => pc.unitGroups?.length > 0);
      if (isLocked) return item;
      return { ...item, cantidad };
    })
  );
};

  const removeItem = (cartId) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const reset = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.unitPrice * Number(item.cantidad || 0), 0);

  return { items, addProduct, addPromotion, updateQuantity, removeItem, reset, total };
};