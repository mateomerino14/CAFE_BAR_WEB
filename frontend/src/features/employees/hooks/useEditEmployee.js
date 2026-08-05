import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { isLettersOnly, isNumeric } from '../../../utils/validators';
import { updateEmployee, getCargoOptions } from '../services/employeeService';

export const useEditEmployee = (employee, onSaved) => {
  const [values, setValues] = useState({
    nombre: employee.nom_emp,
    apellidoPaterno: employee.apell_pat_emp,
    apellidoMaterno: employee.apell_mat_emp,
    ci: String(employee.ci_emp),
    celular: String(employee.num_cel_emp),
    direccion: employee.direccion_emp,
    correo: employee.correo_el_emp || '',
    idCargo: employee.id_cargo
  });
  const [cargoOptions, setCargoOptions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { preview, handleFileChange, file } = useFileWithPreview(employee.img_emp);
  useAutoDismiss(error, () => setError(''));
  useEffect(() => {
    getCargoOptions().then(setCargoOptions).catch(() => setCargoOptions([]));
  }, []);

  const updateField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.nombre.trim() || !values.apellidoPaterno.trim() || !values.apellidoMaterno.trim()) {
      setError('Rellene los campos solicitados');
      return;
    }
    if (!isLettersOnly(values.nombre) || !isLettersOnly(values.apellidoPaterno) || !isLettersOnly(values.apellidoMaterno)) {
      setError('Nombre y apellidos solo deben contener letras');
      return;
    }
    if (!isNumeric(values.ci) || values.ci.length < 5) {
      setError('La cédula de identidad debe tener al menos 5 dígitos');
      return;
    }
    if (!isNumeric(values.celular) || values.celular.length < 7) {
      setError('El número de celular debe tener al menos 7 dígitos');
      return;
    }
    if (!values.direccion.trim()) {
      setError('Ingrese una dirección');
      return;
    }
    if (!values.idCargo) {
      setError('Seleccione un cargo');
      return;
    }
    const formData = new FormData();
    formData.append('nomEmp', values.nombre.trim());
    formData.append('apellPatEmp', values.apellidoPaterno.trim());
    formData.append('apellMatEmp', values.apellidoMaterno.trim());
    formData.append('ciEmp', values.ci);
    formData.append('numCelEmp', values.celular);
    formData.append('direccionEmp', values.direccion.trim());
    formData.append('correoElEmp', values.correo.trim());
    formData.append('idCargo', values.idCargo);
    if (file) formData.append('photo', file);
    setLoading(true);
    try {
      await updateEmployee(employee.cod_emp, formData);
      onSaved();
    } catch (err) {
    setError(err.response?.data?.message || 'No se pudo modificar el empleado');
    } finally {
    setLoading(false);
    }
  };

  return { values, updateField, cargoOptions, preview, handleFileChange, error, loading, handleSave };
};