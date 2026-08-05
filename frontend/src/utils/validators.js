export const isLettersOnly = (value) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value.trim());
export const isNumeric = (value) => /^[0-9]+$/.test(value);
export const RESERVED_ALIASES = ['ADMINISTRADOR', 'DIRECTORIO'];
export const isValidProductName = (value) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9°%.,\-\s]+$/.test(value.trim());
export const isValidDecimal = (value) => /^[0-9]{1,8}(\.[0-9]{1,2})?$/.test(value);