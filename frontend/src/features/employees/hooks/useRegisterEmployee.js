import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { isLettersOnly, isNumeric, RESERVED_ALIASES } from '../../../utils/validators';
import { createEmployee, getCargoOptions } from '../services/employeeService';

const INITIAL_VALUES = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  ci: '',
  celular: '',
  direccion: '',
  correo: '',
  idCargo: ''
};

export const useRegisterEmployee = () => {
  const [step, setStep] = useState('personal');
  const [values, setValues] = useState(INITIAL_VALUES);
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cargoOptions, setCargoOptions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { file, preview, handleFileChange, reset: resetFile } = useFileWithPreview();
  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));
  useEffect(() => {
    getCargoOptions().then(setCargoOptions).catch(() => setCargoOptions([]));
  }, []);
  const updateField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const validatePersonalData = () => {
    if (!values.nombre.trim() || !values.apellidoPaterno.trim() || !values.apellidoMaterno.trim()) {
      return 'Rellene los campos solicitados';
    }
    if (!isLettersOnly(values.nombre) || !isLettersOnly(values.apellidoPaterno) || !isLettersOnly(values.apellidoMaterno)) {
      return 'Nombre y apellidos solo deben contener letras';
    }
    if (!isNumeric(values.ci) || values.ci.length < 5) {
      return 'La cédula de identidad debe tener al menos 5 dígitos';
    }
    if (!isNumeric(values.celular) || values.celular.length < 7) {
      return 'El número de celular debe tener al menos 7 dígitos';
    }
    if (!values.direccion.trim()) {
      return 'Ingrese una dirección';
    }
    if (!values.idCargo) {
      return 'Seleccione un cargo';
    }
    return '';
  };

  const handleNextStep = (event) => {
    event.preventDefault();
    setError('');
    const validationError = validatePersonalData();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep('credentials');
  };

  const handleBack = () => setStep('personal');
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (alias.trim().length < 4) {
      setError('El alias debe tener al menos 4 caracteres');
      return;
    }
    if (RESERVED_ALIASES.includes(alias.trim().toUpperCase())) {
      setError('Ese alias está reservado, elija otro');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
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
    formData.append('aliasEmp', alias.trim());
    formData.append('contEmp', password);
    if (file) formData.append('photo', file);
    setLoading(true);
    try {
      await createEmployee(formData);
      setSuccess('Empleado registrado con éxito');
      setValues(INITIAL_VALUES);
      setAlias('');
      setPassword('');
      setConfirmPassword('');
      setStep('personal');
      resetFile();
    } catch (err) {
    if (err.response?.status === 409) {
        setError(err.response?.data?.message || 'Ese dato ya está en uso');
    } else {
        setError('No se pudo registrar el empleado');
    }
    } finally {
    setLoading(false);
    }
  };

  return {
    step,
    values,
    updateField,
    alias,
    setAlias,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    cargoOptions,
    preview,
    handleFileChange,
    error,
    success,
    loading,
    handleNextStep,
    handleBack,
    handleSubmit
  };
};