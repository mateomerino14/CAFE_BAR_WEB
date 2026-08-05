import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { requestPasswordResetCode, verifyPasswordResetCode, submitNewPassword } from '../services/passwordResetService';

const RESEND_COOLDOWN_SECONDS = 30;

export const useForgotPassword = (onClose) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useAutoDismiss(error, () => setError(''));

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const interval = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setError('');
    if (!email) {
      setError('Ingrese su correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordResetCode(email);
      setStep('code');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err.response?.status === 404) {
        setStep('not-found');
      } else {
        setError('No se pudo enviar el código, intente nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setResending(true);
    try {
      await requestPasswordResetCode(email);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError('No se pudo reenviar el código, intente nuevamente');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    setError('');

    if (!code) {
      setError('Ingrese el código recibido');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetCode(email, code);
      setStep('reset');
    } catch (err) {
      setError('Código incorrecto o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Rellene los campos solicitados');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await submitNewPassword(email, code, newPassword);
      setStep('success');
    } catch (err) {
      setError('No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setResendCooldown(0);
    onClose();
  };

  return {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    loading,
    resending,
    resendCooldown,
    handleRequestCode,
    handleResendCode,
    handleVerifyCode,
    handleResetPassword,
    handleClose
  };
};