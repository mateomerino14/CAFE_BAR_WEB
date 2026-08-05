import { requestPasswordReset, verifyResetCode, resetPassword } from '../services/passwordResetService.js';

export const requestResetHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Ingrese un correo electrónico' });
  }

  try {
    const result = await requestPasswordReset(email);

    if (!result.found) {
      return res.status(404).json({ message: 'No encontramos una cuenta asociada a ese correo' });
    }

    return res.json({ message: 'Se envió un código de verificación a su correo' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo enviar el correo de verificación' });
  }
};

export const verifyResetCodeHandler = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Rellene los campos solicitados' });
  }
  try {
    const isValid = await verifyResetCode(email, code);
    if (!isValid) {
      return res.status(400).json({ message: 'Código incorrecto o expirado' });
    }
    return res.json({ message: 'Código válido' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al verificar el código' });
  }
};

export const resetPasswordHandler = async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Rellene los campos solicitados' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const success = await resetPassword(email, code, newPassword);
    if (!success) {
      return res.status(400).json({ message: 'Código incorrecto o expirado' });
    }
    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar la contraseña' });
  }
};