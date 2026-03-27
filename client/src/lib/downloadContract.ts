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

export interface ContractData {
  _id: string;
  title: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  terms: string;
  paymentFrequency: string;
  signedAt?: string | null;
  signature?: string | null;
  client?: { name?: string; email?: string; companyName?: string; phone?: string };
}

export async function downloadContractPDF(contract: ContractData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentW = pageW - margin * 2;

  // ── Header Section ──────────────────────────────────────────────
  doc.setFillColor(34, 38, 89); // #222659
  doc.rect(0, 0, pageW, 120, 'F');

  try {
    const { dataUrl, width, height } = await loadImageAsBase64('/logo2.png');
    const aspectRatio = width / height;
    const logoH = 80;
    const logoW = logoH * aspectRatio;
    doc.addImage(dataUrl, 'PNG', margin, 20, logoW, logoH);
  } catch {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ServiceFlow CRM', margin, 70);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SERVICE AGREEMENT', pageW - margin, 60, { align: 'right' });
  doc.setFontSize(8);
  doc.text(`ID: #${contract._id.toUpperCase()}`, pageW - margin, 75, { align: 'right' });

  // ── Title & Intro ───────────────────────────────────────────────
  let currentY = 160;
  doc.setTextColor(34, 38, 89);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(contract.title, margin, currentY);
  currentY += 25;

  doc.setDrawColor(242, 99, 35); // #F26323 (Orange)
  doc.setLineWidth(2);
  doc.line(margin, currentY, margin + 50, currentY);
  currentY += 30;

  // ── Parties ────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('BETWEEN:', margin, currentY);
  currentY += 15;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.text('ServiceFlow CRM (The Provider)', margin, currentY);
  currentY += 20;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('AND:', margin, currentY);
  currentY += 15;

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.text(`${contract.client?.name || 'The Client'} ${contract.client?.companyName ? `(${contract.client.companyName})` : ''}`, margin, currentY);
  if (contract.client?.email) {
    currentY += 14;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(contract.client.email, margin, currentY);
  }
  currentY += 35;

  // ── Contract Details Table ──────────────────────────────────────
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(margin, currentY, contentW, 70, 5, 5, 'F');
  
  const colW = contentW / 3;
  let tableY = currentY + 25;

  // Row 1 Labels
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150, 150, 150);
  doc.text('CONTRACT VALUE', margin + 20, tableY);
  doc.text('FREQUENCY', margin + colW + 20, tableY);
  doc.text('STATUS', margin + colW * 2 + 20, tableY);

  tableY += 18;
  // Row 1 Values
  doc.setFontSize(11);
  doc.setTextColor(34, 38, 89);
  doc.text(`Ksh ${contract.amount.toLocaleString()}`, margin + 20, tableY);
  doc.text(contract.paymentFrequency.toUpperCase(), margin + colW + 20, tableY);
  doc.text(contract.status.toUpperCase(), margin + colW * 2 + 20, tableY);

  currentY += 90;

  // ── Dates ──────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('AGREEMENT PERIOD:', margin, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const dateStr = `${new Date(contract.startDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}  to  ${new Date(contract.endDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  doc.text(dateStr, margin + 120, currentY);
  
  currentY += 30;

  // ── Terms & Conditions ──────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 38, 89);
  doc.text('TERMS AND CONDITIONS', margin, currentY);
  currentY += 10;
  
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageW - margin, currentY);
  currentY += 20;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const termsLines = doc.splitTextToSize(contract.terms || "No specific terms provided.", contentW);
  
  // Check if we need a new page for terms
  if (currentY + (termsLines.length * 12) > pageH - 150) {
    doc.text(termsLines.slice(0, 30), margin, currentY); // Print some on first page
    doc.addPage();
    currentY = 50;
    doc.text(termsLines.slice(30), margin, currentY);
    currentY += (termsLines.slice(30).length * 12) + 40;
  } else {
    doc.text(termsLines, margin, currentY);
    currentY += (termsLines.length * 12) + 40;
  }

  // ── Signatures ──────────────────────────────────────────────────
  if (currentY > pageH - 220) {
    doc.addPage();
    currentY = 60;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 38, 89);
  doc.text('SIGNATURES & ACCEPTANCE', margin, currentY);
  currentY += 40;

  const sigBoxW = 200;
  const sigBoxH = 80;

  // Provider side
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('FOR SERVICEFLOW CRM:', margin, currentY);
  
  currentY += 10;
  // Placeholder for provider "stamp" or signature
  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(margin, currentY, sigBoxW, sigBoxH, 4, 4, 'FD');
  
  // Add a faint logo or watermark for provider
  try {
    const { dataUrl } = await loadImageAsBase64('/logo2.png');
    doc.addImage(dataUrl, 'PNG', margin + 40, currentY + 10, 120, 60, undefined, 'FAST');
  } catch {}

  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 10, currentY + sigBoxH - 20, margin + sigBoxW - 10, currentY + sigBoxH - 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Authorized Representative', margin + sigBoxW / 2, currentY + sigBoxH - 8, { align: 'center' });

  // Client side
  const clientX = pageW - margin - sigBoxW;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('FOR THE CLIENT:', clientX, currentY - 10);

  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(252, 252, 252);
  doc.roundedRect(clientX, currentY, sigBoxW, sigBoxH, 4, 4, 'FD');

  if (contract.signature) {
    try {
      // Ensure we're using the base64 string correctly
      const sigData = contract.signature.startsWith('data:') 
        ? contract.signature 
        : `data:image/png;base64,${contract.signature}`;
      
      doc.addImage(sigData, 'PNG', clientX + 10, currentY + 5, sigBoxW - 20, sigBoxH - 30, undefined, 'MEDIUM');
    } catch (e) {
      console.error("Failed to add signature to PDF", e);
      doc.setFontSize(8);
      doc.setTextColor(200, 0, 0);
      doc.text('[Signature Rendering Error]', clientX + sigBoxW/2, currentY + sigBoxH/2, { align: 'center' });
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('Awaiting Signature', clientX + sigBoxW/2, currentY + sigBoxH/2, { align: 'center' });
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(clientX + 10, currentY + sigBoxH - 20, clientX + sigBoxW - 10, currentY + sigBoxH - 20);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(contract.client?.name || 'Authorized Signatory', clientX + sigBoxW / 2, currentY + sigBoxH - 8, { align: 'center' });

  currentY += sigBoxH + 20;

  if (contract.signedAt) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentW, 30, 4, 4, 'F');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const signedDate = new Date(contract.signedAt).toLocaleString('en-KE', { 
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    doc.text(`✓ Digitally verified and signed by ${contract.client?.name || 'Client'} on ${signedDate}`, margin + 15, currentY + 18);
  }

  // ── Footer ────────────────────────────────────────────────────────
  const footerY = pageH - 40;
  doc.setDrawColor(220, 222, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 10, pageW - margin, footerY - 10);
  doc.setTextColor(150, 150, 170);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`ServiceFlow CRM Agreement • Generated on ${new Date().toLocaleDateString()}`, pageW / 2, footerY + 5, { align: 'center' });

  doc.save(`Contract-${contract._id.slice(-6)}.pdf`);
}
