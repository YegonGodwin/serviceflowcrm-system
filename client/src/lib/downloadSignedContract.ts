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
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}

function getContainedDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

function formatDate(value?: string | null, includeTime = false) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString(
    'en-KE',
    includeTime
      ? { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: 'long', year: 'numeric' }
  );
}

export interface ContractPdfData {
  _id: string;
  title: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  terms?: string;
  paymentFrequency: string;
  signedAt?: string | null;
  signature?: string | null;
  client?: {
    name?: string;
    email?: string;
    companyName?: string;
    phone?: string;
  } | null;
}

export async function downloadContractPDF(contract: ContractPdfData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentW = pageW - margin * 2;

  let logoImage: { dataUrl: string; width: number; height: number } | null = null;
  let signatureImage: { dataUrl: string; width: number; height: number } | null = null;

  try {
    logoImage = await loadImageAsBase64('/logo2.png');
  } catch {
    logoImage = null;
  }

  if (contract.signature) {
    try {
      const sigData = contract.signature.startsWith('data:')
        ? contract.signature
        : `data:image/png;base64,${contract.signature}`;
      // Try direct load first; loadImageAsBase64 can fail on data URLs due to canvas tainting
      try {
        signatureImage = await loadImageAsBase64(sigData);
      } catch {
        // Fallback: create a synthetic image object using the data URL directly
        signatureImage = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ dataUrl: sigData, width: img.width || 400, height: img.height || 150 });
          img.onerror = reject;
          img.src = sigData;
        });
      }
    } catch {
      signatureImage = null;
    }
  }

  doc.setFillColor(34, 38, 89);
  doc.rect(0, 0, pageW, 136, 'F');
  doc.setFillColor(242, 99, 35);
  doc.rect(0, 136, pageW, 8, 'F');

  if (logoImage) {
    const { width, height } = getContainedDimensions(logoImage.width, logoImage.height, 260, 110);
    doc.addImage(logoImage.dataUrl, 'PNG', margin - 10, 12, width, height);
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ServiceFlow CRM', margin, 74);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SERVICE AGREEMENT', pageW - margin, 64, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`ID: #${contract._id.toUpperCase()}`, pageW - margin, 82, { align: 'right' });
  doc.text(`Signed: ${formatDate(contract.signedAt, true)}`, pageW - margin, 98, { align: 'right' });

  let currentY = 178;

  doc.setTextColor(34, 38, 89);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(contract.title, margin, currentY);
  currentY += 24;

  doc.setDrawColor(242, 99, 35);
  doc.setLineWidth(2);
  doc.line(margin, currentY, margin + 64, currentY);
  currentY += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('BETWEEN:', margin, currentY);
  currentY += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('ServiceFlow CRM (The Provider)', margin, currentY);
  currentY += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('AND:', margin, currentY);
  currentY += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `${contract.client?.name || 'The Client'}${contract.client?.companyName ? ` (${contract.client.companyName})` : ''}`,
    margin,
    currentY
  );

  if (contract.client?.email) {
    currentY += 14;
    doc.setFontSize(9);
    doc.text(contract.client.email, margin, currentY);
  }

  currentY += 34;

  doc.setFillColor(245, 246, 250);
  doc.roundedRect(margin, currentY, contentW, 72, 6, 6, 'F');

  const colW = contentW / 3;
  let tableY = currentY + 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CONTRACT VALUE', margin + 20, tableY);
  doc.text('FREQUENCY', margin + colW + 20, tableY);
  doc.text('STATUS', margin + colW * 2 + 20, tableY);

  tableY += 18;
  doc.setFontSize(11);
  doc.setTextColor(34, 38, 89);
  doc.text(`Ksh ${contract.amount.toLocaleString()}`, margin + 20, tableY);
  doc.text(contract.paymentFrequency.toUpperCase(), margin + colW + 20, tableY);
  doc.text(contract.status.toUpperCase(), margin + colW * 2 + 20, tableY);

  currentY += 92;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('AGREEMENT PERIOD:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`${formatDate(contract.startDate)}  to  ${formatDate(contract.endDate)}`, margin + 120, currentY);

  currentY += 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 38, 89);
  doc.text('TERMS AND CONDITIONS', margin, currentY);
  currentY += 10;

  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  const termsLines = doc.splitTextToSize(contract.terms || 'No specific terms provided.', contentW);
  if (currentY + termsLines.length * 12 > pageH - 240) {
    const firstPageLines = Math.max(1, Math.floor((pageH - 240 - currentY) / 12));
    doc.text(termsLines.slice(0, firstPageLines), margin, currentY);
    doc.addPage();
    currentY = 56;
    doc.text(termsLines.slice(firstPageLines), margin, currentY);
    currentY += (termsLines.length - firstPageLines) * 12 + 42;
  } else {
    doc.text(termsLines, margin, currentY);
    currentY += termsLines.length * 12 + 42;
  }

  if (currentY > pageH - 240) {
    doc.addPage();
    currentY = 60;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(34, 38, 89);
  doc.text('SIGNATURES & ACCEPTANCE', margin, currentY);
  currentY += 38;

  const sigBoxW = 210;
  const sigBoxH = 94;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('FOR SERVICEFLOW CRM:', margin, currentY);

  currentY += 10;
  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(margin, currentY, sigBoxW, sigBoxH, 4, 4, 'FD');

  if (logoImage) {
    const { width, height } = getContainedDimensions(logoImage.width, logoImage.height, 140, 62);
    doc.addImage(logoImage.dataUrl, 'PNG', margin + (sigBoxW - width) / 2, currentY + 10, width, height, undefined, 'FAST');
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 10, currentY + sigBoxH - 20, margin + sigBoxW - 10, currentY + sigBoxH - 20);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Authorized Representative', margin + sigBoxW / 2, currentY + sigBoxH - 8, { align: 'center' });

  const clientX = pageW - margin - sigBoxW;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('FOR THE CLIENT:', clientX, currentY - 10);

  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(clientX, currentY, sigBoxW, sigBoxH, 4, 4, 'FD');

  if (signatureImage) {
    const { width, height } = getContainedDimensions(signatureImage.width, signatureImage.height, sigBoxW - 28, sigBoxH - 34);
    const sigDataUrl = signatureImage.dataUrl.startsWith('data:') ? signatureImage.dataUrl : `data:image/png;base64,${signatureImage.dataUrl}`;
    doc.addImage(
      sigDataUrl,
      'PNG',
      clientX + 14,
      currentY + 10 + (sigBoxH - 34 - height) / 2,
      width,
      height,
      undefined,
      'MEDIUM'
    );
  } else if (contract.signature) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0);
    doc.text('Stored signature could not be rendered', clientX + sigBoxW / 2, currentY + sigBoxH / 2, { align: 'center' });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Awaiting Signature', clientX + sigBoxW / 2, currentY + sigBoxH / 2, { align: 'center' });
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(clientX + 10, currentY + sigBoxH - 20, clientX + sigBoxW - 10, currentY + sigBoxH - 20);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(contract.client?.name || 'Authorized Signatory', clientX + sigBoxW / 2, currentY + sigBoxH - 8, { align: 'center' });

  currentY += sigBoxH + 20;

  if (contract.signedAt) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentW, 32, 4, 4, 'F');
    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      `Digitally verified and signed by ${contract.client?.name || 'Client'} on ${formatDate(contract.signedAt, true)}`,
      margin + 15,
      currentY + 19
    );
  }

  const footerY = pageH - 40;
  doc.setDrawColor(220, 222, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 10, pageW - margin, footerY - 10);
  doc.setTextColor(150, 150, 170);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`ServiceFlow CRM Agreement | Generated on ${new Date().toLocaleDateString('en-KE')}`, pageW / 2, footerY + 5, {
    align: 'center',
  });

  doc.save(`Contract-${contract._id.slice(-6)}.pdf`);
}
