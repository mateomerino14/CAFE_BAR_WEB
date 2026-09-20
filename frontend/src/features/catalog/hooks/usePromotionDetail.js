import { useEffect, useState } from 'react';
import { getPromotionCatalogDetail } from '../services/catalogService';
import { getPromotionProductsIngredients } from '../../pos/services/posService';
import { DAYS_OF_WEEK } from '../../../constants/days';

const isNowWithinSchedule = (promotion, days) => {
  const now = new Date();
  if (promotion.fecha_especifica) {
    const target = new Date(`${promotion.fecha_especifica}T00:00:00`);
    if (target.toDateString() !== now.toDateString()) return false;
  } else if (promotion.fecha_inicio && promotion.fecha_fin) {
    const start = new Date(`${promotion.fecha_inicio}T00:00:00`);
    const end = new Date(`${promotion.fecha_fin}T23:59:59`);
    if (now < start || now > end) return false;
  }
  if (days.length > 0) {
    const todayIndex = (now.getDay() + 6) % 7;
    if (!days.includes(todayIndex)) return false;
  }
  if (promotion.hora_inicio && promotion.hora_fin) {
    const current = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = promotion.hora_inicio.split(':').map(Number);
    const [endH, endM] = promotion.hora_fin.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    if (current < start || current > end) return false;
  }
  return true;
};

const formatDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatTime = (time) => time.slice(0, 5);

const buildDateLabel = (promotion) => {
  if (promotion.fecha_especifica) {
    return { text: `Fecha específica: ${formatDate(promotion.fecha_especifica)}`, type: 'date' };
  }
  if (promotion.fecha_inicio && promotion.fecha_fin) {
    return { text: `Período: ${formatDate(promotion.fecha_inicio)} - ${formatDate(promotion.fecha_fin)}`, type: 'date' };
  }
  return { text: 'Sin restricción de fechas', type: 'info' };
};

const buildTimeLabel = (promotion) => {
  const isAllDay = !promotion.hora_inicio || !promotion.hora_fin || (promotion.hora_inicio === '00:00:00' && promotion.hora_fin === '23:59:59');
  if (isAllDay) {
    return { text: 'Todo el día', type: 'info' };
  }
  return { text: `${formatTime(promotion.hora_inicio)} - ${formatTime(promotion.hora_fin)}`, type: 'time' };
};

/* Calcula un estimado de cuántas unidades de la promoción se podrían fabricar con el stock actual,
   sumando lo que necesita cada producto componente (multiplicado por cuántos de ese producto lleva
   la promoción), y tomando el ingrediente "cuello de botella" que primero se agote. Solo informativo. */
const calculateMaxPromotions = (productsWithIngredients) => {
  const neededByIngredient = new Map();
  for (const product of productsWithIngredients) {
    for (const ing of product.ingredients || []) {
      const necesario = Number(ing.cantidad_ing_necesitada) || 0;
      if (necesario <= 0) continue;
      const totalNecesario = necesario * (Number(product.cantidadPromo) || 1);
      const prev = neededByIngredient.get(ing.id_ing) || { necesario: 0, stock: Number(ing.cantidad_stock) || 0 };
      neededByIngredient.set(ing.id_ing, { necesario: prev.necesario + totalNecesario, stock: prev.stock });
    }
  }
  if (neededByIngredient.size === 0) return null;
  let maxPromos = Infinity;
  for (const { necesario, stock } of neededByIngredient.values()) {
    maxPromos = Math.min(maxPromos, Math.floor(stock / necesario));
  }
  return maxPromos;
};

export const usePromotionDetail = (idProm) => {
  const [detail, setDetail] = useState(null);
  const [maxPromotions, setMaxPromotions] = useState(null);
  useEffect(() => {
    getPromotionCatalogDetail(idProm).then(setDetail);
    getPromotionProductsIngredients(idProm).then((productsWithIngredients) => {
      setMaxPromotions(calculateMaxPromotions(productsWithIngredients));
    });
  }, [idProm]);
  if (!detail) return { ready: false };
  const dayLabels = detail.days
    .map((value) => DAYS_OF_WEEK.find((day) => day.value === value)?.label)
    .filter(Boolean);
  const isActiveNow = isNowWithinSchedule(detail.promotion, detail.days);
  return {
    ready: true,
    products: detail.products,
    dayLabels,
    dateLabel: buildDateLabel(detail.promotion),
    timeLabel: buildTimeLabel(detail.promotion),
    isActiveNow,
    maxPromotions
  };
};