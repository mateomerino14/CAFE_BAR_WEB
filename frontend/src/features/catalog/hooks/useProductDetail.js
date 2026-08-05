import { useEffect, useState } from 'react';
import { getProductCatalogDetail } from '../services/catalogService';

export const useProductDetail = (idProd) => {
  const [detail, setDetail] = useState(null);
  useEffect(() => {
    getProductCatalogDetail(idProd).then(setDetail);
  }, [idProd]);
  if (!detail) return { ready: false };
  const ingredientRows = detail.ingredients.map((row) => ({
    nombre: row.stock?.nom_ing,
    necesario: Number(row.cantidad_ing_necesitada) || 0,
    stock: Number(row.stock?.cantidad_stock) || 0,
    unidad: row.stock?.unidad_medida || ''
  }));
  let maxUnits = Infinity;
  ingredientRows.forEach((row) => {
    if (row.necesario > 0) {
      maxUnits = Math.min(maxUnits, Math.floor(row.stock / row.necesario));
    }
  });
  if (ingredientRows.length === 0) maxUnits = null;
  return { ready: true, descripcion: detail.descripcion, ingredientRows, maxUnits };
};