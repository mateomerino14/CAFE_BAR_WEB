import { Button } from '../../../components/atoms/Button';
import { TextInput } from '../../../components/atoms/TextInput';
import { Logo } from '../../../components/atoms/Logo';
import { Toast } from '../../../components/atoms/Toast';
import { FormField } from '../../../components/molecules/FormField';
import { PasswordField } from '../../../components/molecules/PasswordField';
import { EmployeeCarousel } from '../../../components/organisms/EmployeeCarousel';
import { Footer } from '../../../components/organisms/Footer';
import { ForgotPasswordModal } from '../../../components/organisms/ForgotPasswordModal';
import { useLoginForm } from '../hooks/useLoginForm';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { colors, typography } from '../../../constants/theme';
import loginLogo from '../../../assets/login-logo.jpg';

const styles = {
  wrapper: `flex min-h-screen flex-col ${colors.background}`,
  content: 'flex flex-1 flex-col items-center justify-center gap-3 p-3 sm:gap-4 sm:p-6',
  title: `${typography.title} text-xl sm:text-2xl ${colors.textPrimary}`,
  form: 'flex w-full max-w-md flex-col items-center gap-4',
  forgotLink: 'self-end text-sm font-semibold text-blue-600 hover:underline',
  actions: 'flex w-full flex-col gap-3 sm:flex-row sm:gap-10'
};

export const LoginPage = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    employees,
    error,
    handleSubmit,
    handleDirectorioMode
  } = useLoginForm();
  const { isOpen: isForgotOpen, open: openForgot, close: closeForgot } = useDisclosure(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {employees.length > 0 && (
          <EmployeeCarousel employees={employees} onSelect={setUsername} />
        )}
        <h1 className={styles.title}>INICIO DE SESIÓN</h1>
        <Logo src={loginLogo} alt="Logo Café Bar" />
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="USUARIO">
            <TextInput
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ingrese su nombre de usuario"
            />
          </FormField>
          <FormField label="CONTRASEÑA">
            <PasswordField
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </FormField>
          <button type="button" className={styles.forgotLink} onClick={openForgot}>
            ¿Olvidaste tu contraseña?
          </button>
          <div className={styles.actions}>
            <Button type="submit" className="flex-1">INGRESAR</Button>
            <Button type="button" variant="warning" className="flex-1" onClick={handleDirectorioMode}>
              MODO DIRECTORIO
            </Button>
          </div>
        </form>
      </div>
      <Footer />
      {error && <Toast>{error}</Toast>}
      {isForgotOpen && <ForgotPasswordModal onClose={closeForgot} />}
    </div>
  );
};