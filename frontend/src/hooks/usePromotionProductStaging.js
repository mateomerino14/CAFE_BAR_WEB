import { useState } from 'react';

export const usePromotionProductStaging = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);
  const [productInput, setProductInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (value) => {
    setProductInput(value);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setProductInput(product.nom_prod);
  };

  const handleAdd = () => {
    setError('');
    if (!selectedProduct || selectedProduct.nom_prod !== productInput) {
      setError('Seleccione un producto válido de la lista');
      return false;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError('Ingrese una cantidad válida');
      return false;
    }
    const alreadyAdded = items.some((item) => item.id_prod === selectedProduct.id_prod);
    if (alreadyAdded) {
      setError('El producto ya está registrado');
      return false;
    }
    setItems((prev) => [
      ...prev,
      { id_prod: selectedProduct.id_prod, nom_prod: selectedProduct.nom_prod, precio_venta: selectedProduct.precio_venta, cantidad: quantity }
    ]);
    setProductInput('');
    setSelectedProduct(null);
    setQuantity('');
    return true;
  };

  const handleRemove = (idProd) => {
    setItems((prev) => prev.filter((item) => item.id_prod !== idProd));
  };

  const handleUpdateQuantity = (idProd, newQuantity) => {
    setItems((prev) => prev.map((item) => (item.id_prod === idProd ? { ...item, cantidad: newQuantity } : item)));
  };

  const reset = () => {
    setItems([]);
    setProductInput('');
    setSelectedProduct(null);
    setQuantity('');
  };
  const total = items.reduce((sum, item) => sum + Number(item.precio_venta) * Number(item.cantidad || 0), 0);
  return { items, productInput, handleInputChange, handleSelectProduct, quantity, setQuantity, handleAdd, handleRemove, handleUpdateQuantity, error, reset, setItems, total };
};