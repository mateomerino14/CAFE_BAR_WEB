import {exec} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

/* Obtiene la lista de impresoras instaladas en el sistema operativo mediante PowerShell. */
export const listPrinters = () => {
  return new Promise((resolve, reject) => {
    exec('powershell -Command "Get-Printer | Select-Object -ExpandProperty Name"', (error, stdout) => {
      if (error) {
        return reject(error);
      }
      const printers = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      resolve(printers);
    });
  });
};

/* Envía un texto a una impresora específica utilizando un archivo temporal y PowerShell. */
export const printText = (printerName, text) => {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `print_${Date.now()}.txt`);
    fs.writeFileSync(tempFile, text, 'utf8');
    const command = `powershell -Command "Get-Content -Path '${tempFile}' -Encoding UTF8 | Out-Printer -Name '${printerName}'"`;
    exec(command, (error) => {
      fs.unlink(tempFile, () => {});
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};