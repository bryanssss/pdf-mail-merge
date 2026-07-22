import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { TemplateField, DataRecord } from '../types';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
}

export async function generateMergedPDF(
  templatePdfBytes: ArrayBuffer,
  fields: TemplateField[],
  record: DataRecord
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templatePdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const field of fields) {
    const value = record[field.name] || '';
    if (!value) continue;

    const pageIndex = field.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const { r, g, b } = hexToRgb(field.color);
    const selectedFont = field.fontWeight === 'bold' ? fontBold : font;

    page.drawText(value, {
      x: field.x,
      y: page.getHeight() - field.y - field.fontSize,
      size: field.fontSize,
      font: selectedFont,
      color: rgb(r, g, b),
      maxWidth: field.maxWidth || undefined,
    });
  }

  return pdfDoc.save();
}

export async function generateAllMergedPDFs(
  templatePdfBytes: ArrayBuffer,
  fields: TemplateField[],
  records: DataRecord[],
  onProgress?: (current: number, total: number) => void
): Promise<{ name: string; data: Uint8Array }[]> {
  const results: { name: string; data: Uint8Array }[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const pdfBytes = await generateMergedPDF(templatePdfBytes, fields, record);

    // Generate a filename from the first field value or index
    const firstFieldValue = Object.values(record)[0] || `document_${i + 1}`;
    const safeName = firstFieldValue.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    
    results.push({
      name: `${safeName}_${i + 1}.pdf`,
      data: pdfBytes,
    });

    onProgress?.(i + 1, records.length);
  }

  return results;
}

export async function getPDFPageDimensions(
  pdfBytes: ArrayBuffer
): Promise<{ width: number; height: number; pageCount: number }> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  return {
    width: firstPage.getWidth(),
    height: firstPage.getHeight(),
    pageCount: pages.length,
  };
}
