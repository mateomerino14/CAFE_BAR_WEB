import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { useIngredientStaging } from '../../../hooks/useIngredientStaging';
import { isValidProductName, isValidDecimal } from '../../../utils/validators';
import { getProduct, updateProduct, getCategoryOptions, getSubcategoryOptions, getStockOptions } from '../services/productService';

export const useEditProduct = (productSummary, onSaved) => {
  const [values, setValues] = useState({
    nombre: '',
    descripcion: '',
    precioVenta: '',
    costoFabricacion: '',
    idCategoria: '',
    idSubcategoria: ''
  });
  const { preview, handleFileChange, file, setPreview } = useFileWithPreview();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const staging = useIngredientStaging();
  useAutoDismiss(error, () => setError(''));
  useEffect(() => {
    Promise.all([getProduct(productSummary.id_prod), getCategoryOptions(), getStockOptions()]).then(
      ([{ product, ingredients }, categories, stock]) => {
        setValues({
          nombre: product.nom_prod,
          descripcion: product.descripcion || '',
          precioVenta: String(product.precio_venta),
          costoFabricacion: String(product.costo_fabricacion),
          idCategoria: product.subcategoria?.id_categoria || '',
          idSubcategoria: product.id_subcategoria
        });
        setPreview(product.img_prod);
        setCategoryOptions(categories);
        setStockOptions(stock);
        staging.setItems(
          ingredients.map((item) => ({
            id_ing: item.id_ing,
            nom_ing: item.stock?.nom_ing,
            descripcion: item.stock?.descripcion,
            unidad_medida: item.stock?.unidad_medida,
            cantidad: String(item.cantidad_ing_necesitada)
          }))
        );
        setReady(true);
      }
    );
  }, [productSummary]);
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

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.nombre.trim() || !values.precioVenta || !values.costoFabricacion || !values.idSubcategoria) {
      setError('Debe llenar los campos obligatorios');
      return;
    }
    if (!isValidProductName(values.nombre)) {
      setError('El nombre contiene caracteres no permitidos');
      return;
    }
    if (!isValidDecimal(values.precioVenta) || !isValidDecimal(values.costoFabricacion)) {
      setError('Precio y costo deben ser valores numéricos válidos');
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
    if (file) formData.append('photo', file);
    setLoading(true);
    try {
      await updateProduct(productSummary.id_prod, formData);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo modificar el producto');
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    updateField,
    preview,
    handleFileChange,
    categoryOptions,
    subcategoryOptions,
    stockOptions,
    staging,
    handleAddIngredient,
    ready,
    error,
    loading,
    handleSave
  };
};