import jsPDF from 'jspdf';

function loadImageAsBase64(url: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export interface InvoiceData {
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  paymentDate?: string | null;
  paymentMethod?: string;
  mpesaReceiptNumber?: string | null;
  client?: { name?: string; email?: string; companyName?: string; phone?: string };
  serviceRequest?: { title?: string } | null;
  contract?: { title?: string } | null;
  createdAt?: string;
}

export async function downloadInvoicePDF(inv: InvoiceData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;

  // ── Brand header bar ──────────────────────────────────────────────
  const headerH = 100;
  doc.setFillColor(43, 49, 102); // #2b3166
  doc.rect(0, 0, pageW, headerH, 'F');

  // Logo image — scale to fill the header, let aspect ratio clip naturally
  try {
    const { dataUrl, width, height } = await loadImageAsBase64('/logo2.png');
    const aspectRatio = width / height;
    const logoH = headerH * 1.6;          // taller than header so whitespace is cropped
    const logoW = logoH * aspectRatio;
    const logoX = margin - 10;
    const logoY = (headerH - logoH) / 2;  // vertically centered (overflows clipped by header)
    doc.addImage(dataUrl, 'PNG', logoX, logoY, logoW, logoH);
  } catch {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ServiceFlow CRM', margin, headerH / 2 + 8);
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 205, 230);
  doc.text('INVOICE', pageW - margin, headerH / 2 + 4, { align: 'right' });

  // ── Invoice meta ──────────────────────────────────────────────────
  doc.setTextColor(30, 30, 60);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #${inv.invoiceNumber}`, margin, 135);

  const issuedDate = inv.createdAt
    ? new Date(inv.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  const dueDate = new Date(inv.dueDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  doc.text(`Issued: ${issuedDate}`, margin, 152);
  doc.text(`Due: ${dueDate}`, margin, 167);

  // Status badge (right side)
  const statusColors: Record<string, [number, number, number]> = {
    paid: [34, 197, 94],
    unpaid: [239, 68, 68],
    'partially-paid': [234, 179, 8],
    cancelled: [156, 163, 175],
  };
  const [r, g, b] = statusColors[inv.status] ?? [156, 163, 175];
  doc.setFillColor(r, g, b);
  doc.roundedRect(pageW - margin - 70, 125, 70, 22, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(inv.status.toUpperCase(), pageW - margin - 35, 140, { align: 'center' });

  // ── Divider ───────────────────────────────────────────────────────
  doc.setDrawColor(220, 222, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 185, pageW - margin, 185);

  // ── Bill To ───────────────────────────────────────────────────────
  doc.setTextColor(100, 100, 120);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, 205);

  doc.setTextColor(30, 30, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(inv.client?.name || 'Client', margin, 220);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 100);
  let billY = 235;
  if (inv.client?.companyName) { doc.text(inv.client.companyName, margin, billY); billY += 14; }
  if (inv.client?.email) { doc.text(inv.client.email, margin, billY); billY += 14; }
  if (inv.client?.phone) { doc.text(inv.client.phone, margin, billY); }

  // ── Service description ───────────────────────────────────────────
  const description = inv.serviceRequest?.title || inv.contract?.title || 'Service Payment';

  // Table header
  const tableTop = 290;
  doc.setFillColor(43, 49, 102);
  doc.rect(margin, tableTop, contentW, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', margin + 10, tableTop + 17);
  doc.text('AMOUNT', pageW - margin - 10, tableTop + 17, { align: 'right' });

  // Table row
  doc.setFillColor(248, 249, 255);
  doc.rect(margin, tableTop + 26, contentW, 36, 'F');
  doc.setTextColor(30, 30, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(description, margin + 10, tableTop + 49);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ksh ${inv.amount.toLocaleString()}`, pageW - margin - 10, tableTop + 49, { align: 'right' });

  // Total row
  doc.setFillColor(43, 49, 102);
  doc.rect(margin, tableTop + 62, contentW, 30, 'F');
  doc.setTextColor(200, 205, 230);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DUE', margin + 10, tableTop + 82);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text(`Ksh ${inv.amount.toLocaleString()}`, pageW - margin - 10, tableTop + 82, { align: 'right' });

  // ── Payment info (if paid) ────────────────────────────────────────
  if (inv.status === 'paid') {
    const paidY = tableTop + 120;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, paidY, contentW, 60, 4, 4, 'FD');

    doc.setTextColor(21, 128, 61);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('✓  Payment Confirmed', margin + 14, paidY + 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 100, 70);
    if (inv.paymentDate) {
      doc.text(`Date: ${new Date(inv.paymentDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin + 14, paidY + 34);
    }
    if (inv.paymentMethod) {
      doc.text(`Method: ${inv.paymentMethod.toUpperCase()}`, margin + 14, paidY + 48);
    }
    if (inv.mpesaReceiptNumber) {
      doc.text(`M-Pesa Receipt: ${inv.mpesaReceiptNumber}`, margin + 160, paidY + 48);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(220, 222, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 10, pageW - margin, footerY - 10);
  doc.setTextColor(150, 150, 170);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ServiceFlow CRM  •  Generated automatically', pageW / 2, footerY + 5, { align: 'center' });

  doc.save(`Invoice-${inv.invoiceNumber}.pdf`);
}
