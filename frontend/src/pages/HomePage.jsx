import {useAuth} from '../context/AuthContext';
import {MainLayout} from '../components/templates/MainLayout';
import {WelcomeBanner} from '../components/molecules/WelcomeBanner';
import {CoverImagePicker} from '../components/molecules/CoverImagePicker';
import {useImagePreview} from '../hooks/useImagePreview';
import loginLogo from '../assets/login-logo.jpg';

const styles = {
  content: 'flex h-full flex-col items-center justify-center gap-5 py-2 sm:gap-6'
};


/*Pagina principal del sitio web */
export const HomePage = () => {
  const { session } = useAuth();
  const { src, handleFileChange } = useImagePreview(loginLogo);
  return (
    <MainLayout title="PÁGINA PRINCIPAL">
      <div className={styles.content}>
        <WelcomeBanner />
        <CoverImagePicker src={src} alt={`Portada de ${session?.alias}`} onFileChange={handleFileChange} />
      </div>
    </MainLayout>
  );
};