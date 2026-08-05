import { useEffect, useState } from 'react';
import { getMarkCards, applyMarkChanges } from '../services/posService';

export const useMarkCards = (fecha) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMarkCards(fecha)
      .then((data) => {
        setCards(data);
        setChanges(new Map());
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const applyChange = (cardIndex, unitIds, newMarcado) => {
    if (unitIds.length === 0) return;

    setCards((prev) => {
      const next = [...prev];
      const card = { ...next[cardIndex] };
      if (newMarcado) {
        card.pendientes = card.pendientes.filter((id) => !unitIds.includes(id));
        card.listos = [...card.listos, ...unitIds];
      } else {
        card.listos = card.listos.filter((id) => !unitIds.includes(id));
        card.pendientes = [...unitIds, ...card.pendientes];
      }
      next[cardIndex] = card;
      return next;
    });

    setChanges((prev) => {
      const next = new Map(prev);
      unitIds.forEach((id) => next.set(id, newMarcado));
      return next;
    });
  };

  const markCount = (cardIndex, count) => {
    const card = cards[cardIndex];
    const ids = card.pendientes.slice(0, count);
    applyChange(cardIndex, ids, true);
  };

  const unmarkOne = (cardIndex) => {
    const card = cards[cardIndex];
    const ids = card.listos.slice(-1);
    applyChange(cardIndex, ids, false);
  };

  const hasPendingChanges = changes.size > 0;

  const save = async () => {
    if (changes.size === 0) return;
    setSaving(true);
    try {
      const markIds = [];
      const unmarkIds = [];
      changes.forEach((value, id) => (value ? markIds.push(id) : unmarkIds.push(id)));

      await applyMarkChanges(markIds, unmarkIds);

      setChanges(new Map());
    } finally {
      setSaving(false);
    }
  };

  return { cards, markCount, unmarkOne, loading, saving, hasPendingChanges, save };
};