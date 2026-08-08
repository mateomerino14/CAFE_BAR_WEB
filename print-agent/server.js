import express from 'express';
import cors from 'cors';
import https from 'https';
import {getOrCreateCertificate} from './src/certificate.js';
import { Bonjour } from 'bonjour-service';
import {listPrinters, printText} from './src/printers.js';
import {readConfig, writeConfig} from './src/config.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4443;

app.get('/health', (req, res) => {
  res.json({status: 'ok', message: 'Print Agent Cafebar funcionando'});
});

app.get('/printers', async (req, res) => {
  try {
    const printers = await listPrinters();
    res.json(printers);
  } 
  catch (error) {
    res.status(500).json({message: 'No se pudo obtener la lista de impresoras', error: error.message});
  }
});

app.get('/config', (req, res) => {
  res.json(readConfig());
});

app.post('/config', (req, res) => {
  const { ticketPrinter, cocinaPrinter } = req.body;
  writeConfig({ ticketPrinter: ticketPrinter || '', cocinaPrinter: cocinaPrinter || '' });
  res.json({message: 'Configuración guardada correctamente'});
});

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

const start = async () => {
  const { key, cert } = await getOrCreateCertificate();

  https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`Print Agent Cafebar escuchando en https://localhost:${PORT}`);
    console.log(`También accesible en la red local como https://cafebar-caja.local:${PORT}`);

    const bonjour = new Bonjour();
    bonjour.publish({
      name: 'Cafebar Print Agent',
      host: 'cafebar-caja.local',
      type: 'https',
      port: PORT
    });
  });
};

start();