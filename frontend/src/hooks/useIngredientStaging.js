import { useState } from 'react';

export const useIngredientStaging = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);
  const [ingredientInput, setIngredientInput] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (value) => {
    setIngredientInput(value);
    setSelectedIngredient(null);
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setIngredientInput(ingredient.nom_ing);
  };

  const handleAdd = () => {
    setError('');
    if (!selectedIngredient || selectedIngredient.nom_ing !== ingredientInput) {
      setError('Seleccione un ingrediente válido de la lista');
      return false;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Ingrese una cantidad válida');
      return false;
    }
    const alreadyAdded = items.some((item) => item.id_ing === selectedIngredient.id_ing);
    if (alreadyAdded) {
      setError('El ingrediente ya está registrado');
      return false;
    }
    setItems((prev) => [
      ...prev,
      {
        id_ing: selectedIngredient.id_ing,
        nom_ing: selectedIngredient.nom_ing,
        descripcion: selectedIngredient.descripcion,
        unidad_medida: selectedIngredient.unidad_medida,
        cantidad: quantity
      }
    ]);
    setIngredientInput('');
    setSelectedIngredient(null);
    setQuantity('');
    return true;
  };

  const handleRemove = (idIng) => {
    setItems((prev) => prev.filter((item) => item.id_ing !== idIng));
  };

  const handleUpdateQuantity = (idIng, newQuantity) => {
    setItems((prev) => prev.map((item) => (item.id_ing === idIng ? { ...item, cantidad: newQuantity } : item)));
  };

  const reset = () => {
    setItems([]);
    setIngredientInput('');
    setSelectedIngredient(null);
    setQuantity('');
  };

  return { items, ingredientInput, handleInputChange, handleSelectIngredient, quantity, setQuantity, handleAdd, handleRemove, handleUpdateQuantity, error, reset, setItems };
};