export const checkPrintAgentHealth = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) throw new Error('No se pudo conectar');
  return response.json();
};

export const getPrinters = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/printers`);
  if (!response.ok) throw new Error('No se pudo obtener la lista de impresoras');
  return response.json();
};

export const getPrinterAssignment = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/config`);
  if (!response.ok) throw new Error('No se pudo obtener la configuración');
  return response.json();
};

export const savePrinterAssignment = async (baseUrl, ticketPrinter, cocinaPrinter) => {
  const response = await fetch(`${baseUrl}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketPrinter, cocinaPrinter })
  });
  if (!response.ok) throw new Error('No se pudo guardar la configuración');
  return response.json();
};

export const sendPrintJob = async (baseUrl, tipo, text) => {
  const response = await fetch(`${baseUrl}/print`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, text })
  });
  if (!response.ok) throw new Error('No se pudo imprimir');
  return response.json();
};