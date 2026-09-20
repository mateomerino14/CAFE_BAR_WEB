const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const formatHora = (hora) => {
  if (!hora) return '—';
  const [horaStr, minutoStr] = hora.split(':');
  const horaNum = Number(horaStr);
  const periodo = horaNum >= 12 ? 'PM' : 'AM';
  const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
  return `${hora12}:${minutoStr} ${periodo}`;
};

/* Convierte una fecha en formato AAAA-MM-DD (o un ISO completo) a DD/MM/AAAA para mostrarla. */
const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const soloFecha = fecha.slice(0, 10);
  const [anio, mes, dia] = soloFecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

const wrapDocument = (titulo, bodyHtml) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(titulo)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 15px; margin-top: 24px; }
        p.periodo { color: #64748b; margin-top: 0; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
        th { background: #f1f5f9; }
        tfoot td { font-weight: bold; background: #f8fafc; }
        .venta-detalle { margin-top: 16px; page-break-inside: avoid; }
        .venta-detalle h3 { font-size: 13px; margin: 0 0 4px 0; background: #f1f5f9; padding: 6px 8px; border-radius: 4px; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px; }
        .items-table th, .items-table td { border: 1px solid #e2e8f0; padding: 4px 6px; text-align: left; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(titulo)}</h1>
      ${bodyHtml}
    </body>
  </html>
`;

const buildTable = (headers, rows) => `
  <table>
    <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
`;

const buildPersonalizacionText = (grupos) => {
  return (grupos || [])
    .map((g) => {
      const bits = [];
      if (g.exclusiones?.length) bits.push(`Sin: ${g.exclusiones.join(', ')}`);
      if (g.extras?.length) bits.push(`Extra: ${g.extras.join(', ')}`);
      if (bits.length === 0) return null;
      const prefix = g.cantidad !== null && g.cantidad !== undefined ? `(${g.cantidad}x) ${g.producto || ''} ` : '';
      return `${prefix}${bits.join(' | ')}`;
    })
    .filter(Boolean)
    .join('<br/>');
};

const buildVentaDetalleBlock = (venta) => {
  const itemsHtml = (venta.items || [])
    .map((item) => `
      <tr>
        <td>${escapeHtml(item.cantidad)}x ${escapeHtml(item.producto)}</td>
        <td>${escapeHtml(item.tipoConsumo)}</td>
        <td>${escapeHtml(item.mesero || '—')}</td>
        <td>Bs ${Number(item.subtotal).toFixed(2)}</td>
        <td>${buildPersonalizacionText(item.personalizacionGrupos)}</td>
      </tr>
    `)
    .join('');

  return `
    <div class="venta-detalle">
      <h3>Venta N° ${escapeHtml(venta.numVenta)} — ${formatFecha(venta.fecha)} ${escapeHtml(formatHora(venta.hora))} — Mesa ${escapeHtml(venta.mesa)}</h3>
      <table class="items-table">
        <thead><tr><th>Producto</th><th>Tipo</th><th>Mesero</th><th>Subtotal</th><th>Personalización</th></tr></thead>
        <tbody>${itemsHtml || '<tr><td colspan="5">Sin productos</td></tr>'}</tbody>
      </table>
    </div>
  `;
};

export const buildDetailedReportHtml = (rows, periodo) => {
  const headers = ['N° Venta', 'Fecha', 'Hora', 'Mesero', 'Cajero', 'Salón', 'Mesa', 'Total', 'Efectivo', 'QR', 'Estado'];
  const body = rows.map((r) => [
    r.numVenta, formatFecha(r.fecha), formatHora(r.hora), r.meseroApertura, r.cajero, r.salon, r.mesa,
    `Bs ${r.total.toFixed(2)}`, `Bs ${r.efectivo.toFixed(2)}`, `Bs ${r.qr.toFixed(2)}`, r.estado
  ]);

  const detalleBlocks = rows.map(buildVentaDetalleBlock).join('');

  return wrapDocument(
    'Ventas Detalladas',
    `<p class="periodo">Período: ${periodo}</p>
     ${buildTable(headers, body)}
     <h2>Detalle de productos por venta</h2>
     ${detalleBlocks}`
  );
};

export const buildSummaryByDateReportHtml = (rows, granTotal, periodo) => {
  const headers = ['Fecha', 'Cajero', 'N° Ventas', 'Total Monto', 'Efectivo', 'QR'];
  const body = rows.map((r) => [
    formatFecha(r.fecha), r.cajero, r.totalVentas, `Bs ${r.totalMonto.toFixed(2)}`, `Bs ${r.efectivo.toFixed(2)}`, `Bs ${r.qr.toFixed(2)}`
  ]);
  return wrapDocument('Resumen por Fechas', `<p class="periodo">Período: ${periodo}</p>${buildTable(headers, body)}<p><strong>Total general: Bs ${granTotal.toFixed(2)}</strong></p>`);
};

export const buildTopProductsReportHtml = (rows, periodo) => {
  const headers = ['Tipo', 'Nombre', 'Cantidad', 'Ingreso', 'Costo', 'Ganancia'];
  const body = rows.map((r) => [
    r.tipo === 'promocion' ? 'Promoción' : 'Producto',
    r.nombre,
    r.cantidad,
    `Bs ${r.ingreso.toFixed(2)}`,
    `Bs ${r.costo.toFixed(2)}`,
    `Bs ${r.ganancia.toFixed(2)}`
  ]);
  const totalIngreso = rows.reduce((sum, r) => sum + r.ingreso, 0);
  const totalCosto = rows.reduce((sum, r) => sum + r.costo, 0);
  const totalGanancia = rows.reduce((sum, r) => sum + r.ganancia, 0);

  const promoDetailBlocks = rows
    .filter((r) => r.tipo === 'promocion' && r.productosConsumidos?.length > 0)
    .map((r) => {
      const itemsHtml = r.productosConsumidos
        .map((pc) => `<tr><td>${escapeHtml(pc.nombre)}</td><td>${escapeHtml(pc.cantidad)}</td></tr>`)
        .join('');
      return `
        <div class="venta-detalle">
          <h3>${escapeHtml(r.nombre)}</h3>
          <table class="items-table">
            <thead><tr><th>Producto</th><th>Cantidad consumida</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
      `;
    })
    .join('');

  return wrapDocument(
    'Productos y Promociones (Ganancia)',
    `<p class="periodo">Período: ${periodo}</p>
     ${buildTable(headers, body)}
     <p><strong>Total general — Ingreso: Bs ${totalIngreso.toFixed(2)} | Costo: Bs ${totalCosto.toFixed(2)} | Ganancia: Bs ${totalGanancia.toFixed(2)}</strong></p>
     ${promoDetailBlocks ? `<h2>Productos consumidos por promoción</h2>${promoDetailBlocks}` : ''}`
  );
};

export const buildEmployeePieReportHtml = (cajeroRows, meseroRows, periodo) => {
  const headers = ['Empleado', 'N° Ventas'];
  const cajeroTabla = buildTable(headers, cajeroRows.map((r) => [r.empleado, r.totalVentas]));
  const meseroTabla = buildTable(headers, meseroRows.map((r) => [r.empleado, r.totalVentas]));
  return wrapDocument(
    'Resumen por Empleado',
    `<p class="periodo">Período: ${periodo}</p><h2>Por Cajero</h2>${cajeroTabla}<h2>Por Mesero</h2>${meseroTabla}`
  );
};

export const printReportHtml = (html) => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onafterprint = () => printWindow.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
};