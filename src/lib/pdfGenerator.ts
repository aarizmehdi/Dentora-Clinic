import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, Clinic, ClinicalSOAPNote, ToothCondition, Provider, Invoice } from '../types/dental';

const getBase64ImageFromURL = async (url: string): Promise<{ dataUrl: string, ratio: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ dataUrl, ratio: img.height / img.width });
      } else {
        reject(new Error('Canvas context failed'));
      }
    };
    img.onerror = error => reject(error);
  });
};

export const generateClinicalRecord = async (
  patient: Patient,
  clinic: Clinic | null,
  groupedVisits: Map<string, { notes: ClinicalSOAPNote[], procedures: ToothCondition[] }>,
  providers: Provider[],
  singleVisitDate?: string,
  currentUser?: any,
  returnBase64: boolean = false
): Promise<string | void> => {
  const doc = new jsPDF();
  
  let topY = 22;
  if (clinic?.logoUrl) {
    try {
      const { dataUrl, ratio } = await getBase64ImageFromURL(clinic.logoUrl);
      let width = 35;
      let height = width * ratio;
      // Restrict height so large logos don't take up half the page
      if (height > 25) {
        height = 25;
        width = height / ratio;
      }
      doc.addImage(dataUrl, 'PNG', 14, 10, width, height, undefined, 'FAST');
      topY = 10 + height + 10;
    } catch (e) {
      console.warn("Failed to render logo on PDF:", e);
    }
  }

  const getProviderName = (id: string) => {
    if (id === 'sys' || (currentUser && id === currentUser.id)) {
      return currentUser?.name || 'Primary Dental Provider';
    }
    return providers.find(p => p.id === id)?.name || 'Unknown Provider';
  };

  // 1. Letterhead
  doc.setFontSize(20);
  doc.setTextColor(15, 118, 110); // Teal 600
  doc.text(clinic?.name || 'Dentora Dental Clinic', 14, topY);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  if (clinic?.taxId) {
    doc.text(`Tax / Registration ID: ${clinic.taxId}`, 14, topY + 8);
  }
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, topY + 13);

  const contentStartY = topY + 23;
  // 2. Patient Info Block
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(14, contentStartY, 182, 30, 3, 3, 'FD');
  
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('Clinical Record', 20, contentStartY + 10);
  
  doc.setFontSize(10);
  doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, 20, contentStartY + 20);
  doc.text(`DOB: ${patient.dob} | Gender: ${patient.gender}`, 100, contentStartY + 20);
  doc.text(`Chart #: ${patient.chartNumber}`, 20, contentStartY + 25);

  let currentY = contentStartY + 40;

  // 3. Clinical Timeline
  const availableDates = singleVisitDate ? (groupedVisits.has(singleVisitDate) ? [singleVisitDate] : []) : Array.from(groupedVisits.keys());
  const sortedDates = availableDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sortedDates.length === 0) {
    doc.setFontSize(12);
    doc.text('No clinical records found for this patient.', 14, currentY);
  } else {
    sortedDates.forEach(date => {
      const visit = groupedVisits.get(date)!;
      
      // Page break check
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Date Header
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 14, currentY);
      currentY += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY, 196, currentY);
      currentY += 6;

      // Procedures Table
      const printProcedures = visit.procedures.filter(p => p.status !== 'existing');
      if (printProcedures.length > 0) {
        const procData = printProcedures.map(p => [
          p.cdtCode || 'N/A',
          `Tooth #${p.toothNumber} ${p.surfaces && p.surfaces.length > 0 ? '(' + p.surfaces.join('') + ')' : ''}`,
          p.description,
          getProviderName(p.providerId)
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['CDT Code', 'Tooth / Surface', 'Procedure Description', 'Provider']],
          body: procData,
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
          styles: { fontSize: 9 },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // SOAP Notes
      if (visit.notes.length > 0) {
        visit.notes.forEach(note => {
          if (currentY > 240) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Signed SOAP Progress Note', 14, currentY);
          currentY += 5;

          const printSOAPLine = (label: string, text: string) => {
            if (!text) return;
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 14, currentY);
            doc.setFont('helvetica', 'normal');
            
            const splitText = doc.splitTextToSize(text, 150);
            doc.text(splitText, 40, currentY);
            currentY += (splitText.length * 5) + 2;
          };

          printSOAPLine('Subjective', note.subjective);
          printSOAPLine('Objective', note.objective);
          printSOAPLine('Assessment', note.assessment);
          printSOAPLine('Plan', note.plan);
          
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`Digitally signed by ${getProviderName(note.providerId)}`, 14, currentY);
          
          currentY += 10;
          doc.setTextColor(15, 23, 42); // reset color
        });
      }
      currentY += 5;
    });
  }

  // Generate Document
  if (returnBase64) {
    const dataUri = doc.output('datauristring');
    return dataUri.substring(dataUri.indexOf(',') + 1);
  } else {
    doc.save(`${patient.lastName}_${patient.firstName}_ClinicalRecord.pdf`);
  }
};

export const generateInvoicePDF = async (
  invoice: Invoice, 
  patient: Patient, 
  clinic: Clinic | null,
  returnBase64: boolean = false
): Promise<string | void> => {
  const doc = new jsPDF();

  let topY = 22;
  if (clinic?.logoUrl) {
    try {
      const { dataUrl, ratio } = await getBase64ImageFromURL(clinic.logoUrl);
      let width = 35;
      let height = width * ratio;
      // Restrict height so large logos don't take up half the page
      if (height > 25) {
        height = 25;
        width = height / ratio;
      }
      doc.addImage(dataUrl, 'PNG', 14, 10, width, height, undefined, 'FAST');
      topY = 10 + height + 10;
    } catch (e) {
      console.warn("Failed to render logo on PDF:", e);
    }
  }
  
  // 1. Header (Clinic Info)
  doc.setFontSize(24);
  doc.setTextColor(15, 118, 110);
  doc.text(clinic?.name || 'Dentora Dental Clinic', 14, topY);
  
  let currentY = topY + 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  if (clinic?.locations && clinic.locations.length > 0) {
    doc.text(clinic.locations[0].address || '', 14, currentY);
    currentY += 5;
    doc.text(clinic.locations[0].phone || '', 14, currentY);
    currentY += 5;
  }
  if (clinic?.taxId) {
    doc.text(`Tax / Registration ID: ${clinic.taxId}`, 14, currentY);
    currentY += 5;
  }

  const curr = clinic?.currency || '$';

  // 2. Invoice Meta
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', 140, topY);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Invoice #: INV-${invoice.id.substring(0, 8).toUpperCase()}`, 140, topY + 8);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 140, topY + 13);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, topY + 18);

  const contentStartY = Math.max(currentY, topY + 18) + 10;

  // 3. Bill To (Patient Info)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, contentStartY, 90, 30, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Bill To:', 20, contentStartY + 8);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${patient.firstName} ${patient.lastName}`, 20, contentStartY + 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Chart #: ${patient.chartNumber}`, 20, contentStartY + 20);
  doc.text(patient.phone || '', 20, contentStartY + 25);

  // 4. Items Table
  const tableData = invoice.items.map(item => [
    item.name,
    item.quantity.toString(),
    `${curr}${item.unitPrice.toFixed(2)}`,
    `${curr}${item.total.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: contentStartY + 40,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // 5. Totals
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 140, finalY);
  doc.setTextColor(15, 23, 42);
  doc.text(`${curr}${invoice.subtotal.toFixed(2)}`, 196, finalY, { align: 'right' });
  
  finalY += 6;
  if (invoice.discountValue > 0) {
    const discountStr = invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : `${curr}${invoice.discountValue.toFixed(2)}`;
    doc.setTextColor(100, 116, 139);
    doc.text(`Discount (${discountStr}):`, 140, finalY);
    doc.setTextColor(225, 29, 72); // Rose 600
    doc.text(`-${curr}${(invoice.subtotal - invoice.grandTotal).toFixed(2)}`, 196, finalY, { align: 'right' });
    finalY += 6;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(140, finalY, 196, finalY);
  finalY += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', 140, finalY);
  doc.text(`${curr}${invoice.grandTotal.toFixed(2)}`, 196, finalY, { align: 'right' });

  // 6. Payment Info
  finalY += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  if (invoice.status === 'paid') {
    doc.text(`Payment Method: ${invoice.paymentMethod || 'Cash'}`, 14, finalY);
  } else {
    doc.text('Please remit payment within 15 days.', 14, finalY);
  }

  // Generate Document
  if (returnBase64) {
    const dataUri = doc.output('datauristring');
    return dataUri.substring(dataUri.indexOf(',') + 1);
  } else {
    doc.save(`Invoice_${patient.lastName}_INV-${invoice.id.substring(0, 8)}.pdf`);
  }
};
