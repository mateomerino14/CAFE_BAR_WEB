import {useNavigate} from 'react-router-dom';
import {Button} from '../components/atoms/Button';
import {Footer} from '../components/organisms/Footer';
import {useMouseTilt} from '../hooks/useMouseTilt';
import {colors, typography} from '../constants/theme';

const styles = {
  wrapper: `relative flex min-h-screen flex-col overflow-hidden ${colors.background}`,
  content: 'flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center',
  code: `${typography.title} text-7xl sm:text-8xl md:text-9xl ${colors.textPrimary}`,
  message: `max-w-sm ${typography.body} ${colors.textSecondary}`,
  cupWrapper: 'relative flex flex-col items-center',
  steamRow: 'mb-1 flex gap-2',
  steamDot: 'steam-wisp h-2 w-2 rounded-full bg-slate-400/70',
  cup: 'text-7xl sm:text-8xl transition-transform duration-150 ease-out'
};


/*Pagina en caso de 404 o not found, al acceder a una ruta no existente */
export const NotFoundPage = () => {
  const navigate = useNavigate();
  const tilt = useMouseTilt(10);
  return (
    <div className={styles.wrapper}>
      <style>{`
        @keyframes steam-rise {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-40px) scale(0.4); opacity: 0; }
        }
        .steam-wisp {
          animation: steam-rise 2.2s ease-in infinite;
        }
        .steam-wisp:nth-child(2) { animation-delay: 0.4s; }
        .steam-wisp:nth-child(3) { animation-delay: 0.8s; }
      `}</style>
      <div className={styles.content}>
        <div className={styles.cupWrapper}>
          <div className={styles.steamRow}>
            <span className={styles.steamDot} />
            <span className={styles.steamDot} />
            <span className={styles.steamDot} />
          </div>
          <span
            className={styles.cup}
            style={{ transform: `rotate(${tilt.x}deg) translateY(${tilt.y}px)` }}
          >
            ☕
          </span>
        </div>
        <h1 className={styles.code}>404</h1>
        <p className={styles.message}>
          Esta página no existe o no tienes acceso a ella. Prueba volver al inicio.
        </p>
        <Button onClick={() => navigate('/')}>VOLVER AL INICIO</Button>
      </div>
      <Footer />
    </div>
  );
};