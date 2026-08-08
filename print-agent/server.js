import express from 'express';
import cors from 'cors';
import https from 'https';
import {getOrCreateCertificate} from './src/certificate.js';
import {listPrinters, printText} from './src/printers.js';
import {readConfig, writeConfig} from './src/config.js';


/* Inicializa la aplicación Express y habilita CORS y el procesamiento de solicitudes JSON. */
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4443;


/* Proporciona una ruta de comprobación para verificar que el agente de impresión esté funcionando. */
app.get('/health', (req, res) => {
  res.json({status: 'ok', message: 'Print Agent Cafebar funcionando'});
});


/* Obtiene y devuelve la lista de impresoras disponibles en el equipo donde se ejecuta el agente. */
app.get('/printers', async (req, res) => {
  try {
    const printers = await listPrinters();
    res.json(printers);
  } 
  catch (error) {
    res.status(500).json({message: 'No se pudo obtener la lista de impresoras', error: error.message});
  }
});


/* Obtiene la configuración actual de las impresoras asignadas para tickets y pedidos de cocina. */
app.get('/config', (req, res) => {
  res.json(readConfig());
});


/* Guarda la configuración de las impresoras seleccionadas para tickets y pedidos de cocina. */
app.post('/config', (req, res) => {
  const { ticketPrinter, cocinaPrinter } = req.body;
  writeConfig({ ticketPrinter: ticketPrinter || '', cocinaPrinter: cocinaPrinter || '' });
  res.json({message: 'Configuración guardada correctamente'});
});


/* Valida los datos recibidos, determina la impresora configurada según el tipo de impresión y envía el contenido a la impresora correspondiente. */
app.post('/print', async (req, res) => {
  const { tipo, text } = req.body;
  if (!tipo || !text) {
    return res.status(400).json({message: 'Faltan datos para imprimir'});
  }
  const config = readConfig();
  const printerName = tipo === 'cocina' ? config.cocinaPrinter : config.ticketPrinter;
  if (!printerName) {
    return res.status(400).json({message: `No hay una impresora configurada para "${tipo}"`});
  }
  try {
    await printText(printerName, text);
    res.json({message: 'Impreso correctamente'});
  } 
  catch (error) {
    res.status(500).json({message: 'Error al imprimir', error: error.message});
  }
});


/* Obtiene o genera el certificado SSL y utiliza HTTPS para iniciar de forma segura el agente local de impresión. */
const start = async () => {
  const {key, cert} = await getOrCreateCertificate();
  https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`Print Agent Cafebar escuchando en https://localhost:${PORT}`);
  });
};


start();