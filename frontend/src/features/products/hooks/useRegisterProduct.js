import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { useIngredientStaging } from '../../../hooks/useIngredientStaging';
import { isValidProductName, isValidDecimal } from '../../../utils/validators';
import { createProduct, getCategoryOptions, getSubcategoryOptions, getStockOptions } from '../services/productService';

const INITIAL_VALUES = {
  nombre: '',
  descripcion: '',
  precioVenta: '',
  costoFabricacion: '',
  idCategoria: '',
  idSubcategoria: ''
};

export const useRegisterProduct = () => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const { file: photo, preview: photoPreview, handleFileChange, reset: resetPhoto } = useFileWithPreview();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const staging = useIngredientStaging();
  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));
  useEffect(() => {
    getCategoryOptions().then(setCategoryOptions).catch(() => setCategoryOptions([]));
    getStockOptions().then(setStockOptions).catch(() => setStockOptions([]));
  }, []);
  useEffect(() => {
    if (!values.idCategoria) {
      setSubcategoryOptions([]);
      return;
    }
    getSubcategoryOptions(values.idCategoria).then(setSubcategoryOptions).catch(() => setSubcategoryOptions([]));
  }, [values.idCategoria]);
  const updateField = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'idCategoria') next.idSubcategoria = '';
      return next;
    });
  };

  const handleAddIngredient = (event) => {
    event.preventDefault();
    staging.handleAdd();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.nombre.trim() || !values.precioVenta || !values.costoFabricacion || !values.idCategoria || !values.idSubcategoria) {
      setError('Debe llenar los campos obligatorios');
      return;
    }
    if (!isValidProductName(values.nombre)) {
      setError('El nombre contiene caracteres no permitidos');
      return;
    }
    if (!isValidDecimal(values.precioVenta) || !isValidDecimal(values.costoFabricacion)) {
      setError('Precio y costo deben ser números válidos (máximo 8 dígitos enteros y 2 decimales, sin letras ni negativos)');
      return;
    }
    if (staging.items.length === 0) {
      setError('El producto debe contener por lo menos un ingrediente');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', values.nombre.trim());
    formData.append('descripcion', values.descripcion.trim());
    formData.append('precioVenta', values.precioVenta);
    formData.append('costoFabricacion', values.costoFabricacion);
    formData.append('idSubcategoria', values.idSubcategoria);
    formData.append('ingredients', JSON.stringify(staging.items.map((item) => ({ idIng: item.id_ing, cantidad: item.cantidad }))));
    if (photo) formData.append('photo', photo);
    setLoading(true);
    try {
      await createProduct(formData);
      setSuccess('Se ha registrado con éxito el producto');
      setValues(INITIAL_VALUES);
      resetPhoto();
      staging.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el producto');
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    updateField,
    photoPreview,
    handleFileChange,
    categoryOptions,
    subcategoryOptions,
    stockOptions,
    staging,
    handleAddIngredient,
    error,
    success,
    loading,
    handleSubmit
  };
};