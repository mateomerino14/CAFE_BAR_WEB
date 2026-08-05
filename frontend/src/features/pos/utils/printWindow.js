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