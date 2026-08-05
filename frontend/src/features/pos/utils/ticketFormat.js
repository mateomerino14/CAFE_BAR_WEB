const WIDTH = 44;

const center = (text) => {
  const padding = Math.max(0, WIDTH - text.length);
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
};

const padRight = (text, length) => {
  const str = String(text);
  return str.length >= length ? str.slice(0, length) : str + ' '.repeat(length - str.length);
};

const padLeft = (text, length) => {
  const str = String(text);
  return str.length >= length ? str.slice(0, length) : ' '.repeat(length - str.length) + str;
};

const wrapText = (text, width) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += width) {
    chunks.push(text.slice(i, i + width));
  }
  return chunks;
};

const nowStrings = () => {
  const now = new Date();
  return {
    fecha: now.toLocaleDateString('es-BO'),
    hora: now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: true })
  };
};

export const buildTicketText = (ticket) => {
  if (!ticket) return '';

  const { fecha, hora } = nowStrings();
  const lines = [];
  lines.push('='.repeat(WIDTH));
  lines.push(center('CAFEBAR RESTAURANTE'));
  lines.push('='.repeat(WIDTH));
  lines.push(`Fecha: ${fecha}  Hora: ${hora}`);
  lines.push(`Nro. Venta: ${ticket.numVenta}`);
  lines.push(`Mesa: ${ticket.mesa} - ${ticket.seccion}`);
  lines.push(`Mesero: ${ticket.mesero}`);
  lines.push('-'.repeat(WIDTH));
  lines.push(`${padRight('CANT', 5)}${padRight('DESCRIPCION', 22)}${padRight('T', 3)}${padLeft('SUBTOTAL', 14)}`);
  lines.push('-'.repeat(WIDTH));

  ticket.items.forEach((item) => {
    let prod = item.producto;
    if (prod.length > 19) prod = `${prod.slice(0, 16)}...`;
    const tipoCod = item.tipo === 'Local' ? 'L' : 'LL';
    lines.push(`${padRight(item.cantidad, 5)}${padRight(prod, 22)}${padRight(tipoCod, 3)}${padLeft(item.subtotal.toFixed(2), 14)}`);

    if (item.personalizacion) {
      item.personalizacion.split('|').map((p) => p.trim()).filter(Boolean).forEach((parte) => {
        wrapText(parte, 38).forEach((fragmento) => {
          lines.push(`     ${fragmento}`);
        });
      });
    }
  });

  lines.push('='.repeat(WIDTH));
  lines.push(`${padLeft('TOTAL:', 30)}${padLeft(Number(ticket.total).toFixed(2), 14)} Bs`);
  lines.push('='.repeat(WIDTH));

  return lines.join('\n');
};

export const buildKitchenText = (ticket) => {
  if (!ticket) return '';

  const { fecha, hora } = nowStrings();
  const lines = [];
  lines.push('='.repeat(WIDTH));
  lines.push(center('PEDIDO COCINA'));
  lines.push('='.repeat(WIDTH));
  lines.push(`Fecha: ${fecha}  Hora: ${hora}`);
  lines.push(`Nro. Venta: ${ticket.numVenta}`);
  lines.push(`Mesero: ${ticket.mesero}`);
  lines.push(`Salon: ${ticket.seccion}  Mesa: ${ticket.mesa}`);
  lines.push('-'.repeat(WIDTH));
  lines.push(`${padRight('CANT', 5)}${padRight('PRODUCTO', 32)}${padRight('T', 3)}`);
  lines.push('-'.repeat(WIDTH));

  ticket.items.forEach((item) => {
    let prod = item.producto;
    if (prod.length > 29) prod = `${prod.slice(0, 26)}...`;
    const tipoCod = item.tipo === 'Local' ? 'L' : 'LL';
    lines.push(`${padRight(item.cantidad, 5)}${padRight(prod, 32)}${padRight(tipoCod, 3)}`);

    if (item.personalizacion) {
      item.personalizacion.split('|').map((p) => p.trim()).filter(Boolean).forEach((parte) => {
        const esExtra = parte.toLowerCase().startsWith('extra');
        const prefijo = esExtra ? 'extra: ' : 'sin: ';
        const texto = parte.replace(/^extra:\s*/i, '').replace(/^sin:\s*/i, '');
        wrapText(texto, esExtra ? 34 : 36).forEach((fragmento) => {
          lines.push(`     ${prefijo}${fragmento}`);
        });
      });
    }
  });

  lines.push('='.repeat(WIDTH));

  return lines.join('\n');
};