import { useLayoutEffect, useState } from 'react';

/* Decide si un menú desplegable debe abrirse hacia abajo o hacia arriba, según el espacio
   disponible en la pantalla en el momento de abrirlo — para que nunca se salga de la ventana,
   sin importar en qué parte del formulario esté el campo (arriba, en medio, o casi al final). */
export const useDropdownDirection = (wrapperRef, isOpen, estimatedMenuHeight = 180) => {
  const [direction, setDirection] = useState('down');

  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
      setDirection('up');
    } else {
      setDirection('down');
    }
  }, [isOpen, wrapperRef, estimatedMenuHeight]);

  return direction;
};
