import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Toast} from '../atoms/Toast';
import {PasswordField} from '../molecules/PasswordField';
import {FormField} from '../molecules/FormField';
import {useForgotPassword} from '../../features/auth/hooks/useForgotPassword';
import {colors, typography} from '../../constants/theme';

const styles = {
  title: `${typography.title} text-lg ${colors.textPrimary}`,
  message: `mt-2 text-sm ${colors.textSecondary}`,
  form: 'mt-4 flex flex-col gap-4',
  actions: 'mt-4 flex flex-col gap-2'
};

export const ForgotPasswordModal = ({onClose}) => {
  const {
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
  } = useForgotPassword(onClose);
  return (
    <Modal onClose={handleClose}>
      {step === 'email' && (
        <form onSubmit={handleRequestCode}>
          <h2 className={styles.title}>Recuperar contraseña</h2>
          <p className={styles.message}>Ingrese el correo asociado a su cuenta de empleado.</p>
          <div className={styles.form}>
            <FormField label="CORREO">
              <TextInput
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </FormField>
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={loading}>{loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}</Button>
            <Button type="button" variant="danger" onClick={handleClose}>CANCELAR</Button>
          </div>
        </form>
      )}
      {step === 'not-found' && (
        <div>
          <h2 className={styles.title}>Correo no encontrado</h2>
          <p className={styles.message}>No encontramos ninguna cuenta de empleado asociada a ese correo.</p>
          <div className={styles.actions}>
            <Button type="button" onClick={handleClose}>ENTENDIDO</Button>
          </div>
        </div>
      )}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode}>
          <h2 className={styles.title}>Verifica tu correo</h2>
          <p className={styles.message}>Ingresa el código de 6 dígitos que enviamos a {email}.</p>
          <div className={styles.form}>
            <FormField label="CÓDIGO">
              <TextInput
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </FormField>
            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || resending}
            >
              {resending ? 'REENVIANDO...' : resendCooldown > 0 ? `REENVIAR CÓDIGO (${resendCooldown}s)` : 'REENVIAR CÓDIGO'}
            </Button>
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={loading}>{loading ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}</Button>
            <Button type="button" variant="danger" onClick={handleClose}>CANCELAR</Button>
          </div>
        </form>
      )}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword}>
          <h2 className={styles.title}>Nueva contraseña</h2>
          <p className={styles.message}>Elige una nueva contraseña para tu cuenta.</p>
          <div className={styles.form}>
            <FormField label="NUEVA CONTRASEÑA">
              <PasswordField
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </FormField>
            <FormField label="CONFIRMAR CONTRASEÑA">
              <PasswordField
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita la contraseña"
              />
            </FormField>
          </div>
          <div className={styles.actions}>
            <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}</Button>
          </div>
        </form>
      )}
      {step === 'success' && (
        <div>
          <h2 className={styles.title}>¡Contraseña cambiada!</h2>
          <p className={styles.message}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <div className={styles.actions}>
            <Button type="button" onClick={handleClose}>CERRAR</Button>
          </div>
        </div>
      )}
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};