import cron from 'node-cron';
import { runScheduledReportCheck } from './services/scheduledReportService.js';

/* Inicia la tarea programada para verificar y enviar reportes */
export const startCronJobs = () => {
  cron.schedule('* * * * *', () => {
    runScheduledReportCheck().catch((error) => console.error('Error en cron de reportes:', error.message));
  });
};
