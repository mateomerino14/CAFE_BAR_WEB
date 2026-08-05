import { SocialIcon } from '../atoms/SocialIcon';
import { InstagramIcon } from '../atoms/InstagramIcon';
import { TikTokIcon } from '../atoms/TikTokIcon';
import { FacebookIcon } from '../atoms/FacebookIcon';
import { colors, typography } from '../../constants/theme';

const styles = {
  wrapper: `flex w-full flex-col items-center justify-center gap-2 ${colors.navBackground} px-4 py-2 text-center sm:flex-row sm:justify-between sm:px-6 sm:py-3 sm:text-left`,
  text: `${typography.footer} text-white/90`,
  socials: 'flex items-center gap-2'
};

export const Footer = () => {
  return (
    <footer className={styles.wrapper}>
      <p className={styles.text}>© 2026 Sistema Cafebar - Todos los derechos reservados</p>
      <div className={styles.socials}>
        <SocialIcon href="https://www.instagram.com/incantatio_cafe_tematico/" label="Instagram">
          <InstagramIcon size={18} />
        </SocialIcon>
        <SocialIcon href="https://www.tiktok.com/@incantatio" label="TikTok">
          <TikTokIcon size={18} />
        </SocialIcon>
        <SocialIcon href="https://www.facebook.com/profile.php?id=100064226643379&locale=es_LA" label="Facebook">
          <FacebookIcon size={18} />
        </SocialIcon>
      </div>
    </footer>
  );
};