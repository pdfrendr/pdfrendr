import fs from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';

async function createSimplePDF() {
  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([612, 792]);
  
  // Add some text
  page.drawText('PDFRendr Test Document', {
    x: 50,
    y: 750,
    size: 20,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('This is a simple test PDF for PDFRendr processing.', {
    x: 50,
    y: 700,
    size: 12,
    color: rgb(0, 0, 0)
  });
  
  page.drawText('It contains basic text content and no dynamic objects.', {
    x: 50,
    y: 680,
    size: 12,
    color: rgb(0, 0, 0)
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('simple-test.pdf', pdfBytes);
  
  console.log('Created simple-test.pdf');
}

createSimplePDF().catch(console.error);
