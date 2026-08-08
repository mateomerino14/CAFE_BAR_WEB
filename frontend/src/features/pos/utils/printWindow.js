import jsPDF from 'jspdf';
import { sendPrintJob, checkPrintAgentHealth } from '../../config/services/printAgentService';
import { getPrintAgentUrl } from '../../config/services/configService';

export const printPlainText = (title, text) => {
  const printWindow = window.open('', '_blank', 'width=420,height=640');
  if (!printWindow) return;

  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          body { margin: 0; font-family: 'Courier New', monospace; font-size: 11px; white-space: pre; }
        </style>
      </head>
      <body>${safeText}</body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onafterprint = () => {
    printWindow.close();
  };

  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
};

export const downloadPlainTextAsPdf = (title, text) => {
  const lines = text.split('\n');
  const pageWidth = 80;
  const marginX = 2;
  const marginTop = 5;
  const marginBottom = 5;
  const usableWidth = pageWidth - marginX * 2;

  const forceExactSize = (doc, width, height) => {
    doc.internal.pageSize.setWidth(width);
    doc.internal.pageSize.setHeight(height);
  };

  const measureDoc = new jsPDF({ unit: 'mm', format: [100, 100] });
  forceExactSize(measureDoc, pageWidth, 100);
  measureDoc.setFont('courier', 'normal');

  const longestLine = lines.reduce((longest, line) => (line.length > longest.length ? line : longest), '');

  let fontSize = 10;
  measureDoc.setFontSize(fontSize);
  const widthAtSize = measureDoc.getTextWidth(longestLine || 'A');

  if (widthAtSize > 0) {
    fontSize = fontSize * (usableWidth / widthAtSize);
  }
  fontSize = Math.min(fontSize, 9);

  const lineHeight = fontSize * 0.4;
  const pageHeight = marginTop + marginBottom + lines.length * lineHeight;

  const doc = new jsPDF({ unit: 'mm', format: [100, 100] });
  forceExactSize(doc, pageWidth, pageHeight);
  doc.setFont('courier', 'normal');
  doc.setFontSize(fontSize);

  let y = marginTop;
  lines.forEach((line) => {
    doc.text(line, marginX, y);
    y += lineHeight;
  });

  doc.save(`${title.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`);
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
};

export const tryPrintViaAgent = async (tipo, text) => {
  try {
    const baseUrl = await getPrintAgentUrl();
    if (!baseUrl) return { success: false, reason: 'NOT_CONFIGURED' };

    await checkPrintAgentHealth(baseUrl);
    await sendPrintJob(baseUrl, tipo, text);
    return { success: true };
  } catch (err) {
    return { success: false, reason: 'UNREACHABLE' };
  }
};

export const openPrintAgentAuthorization = async () => {
  const { getPrintAgentUrl } = await import('../../config/services/configService');
  const baseUrl = await getPrintAgentUrl();
  if (!baseUrl) return false;
  window.open(`${baseUrl}/health`, '_blank');
  return true;
};