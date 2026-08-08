
/* Verifica que el valor contenga únicamente letras, espacios y caracteres del alfabeto español. */
export const isLettersOnly = (value) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(value.trim());

/* Verifica que el valor contenga únicamente caracteres numéricos. */
export const isNumeric = (value) => /^[0-9]+$/.test(value);

/* Verifica que el nombre de un producto contenga únicamente letras, números, espacios y caracteres especiales permitidos. */
export const isValidProductName = (value) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9°%.,\-\s]+$/.test(value.trim());

/* Verifica que el valor sea un número decimal con hasta ocho dígitos enteros y dos decimales. */
export const isValidDecimal = (value) => /^[0-9]{1,8}(\.[0-9]{1,2})?$/.test(value);