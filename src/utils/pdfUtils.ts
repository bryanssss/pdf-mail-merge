import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib';
import type { DataRecord, TemplateField } from '../types';

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

function cleanPdfText(value: unknown): string {
  return String(value ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .normalize('NFC')
    .trim();
}

function canEncodeWithStandardFont(font: PDFFont, text: string): boolean {
  try {
    font.encodeText(text);
    return true;
  } catch {
    return false;
  }
}

function toSafeWinAnsi(text: string, font: PDFFont): string {
  const substitutions: Record<string, string> = {
    '\u00a0': ' ',
    '\u2010': '-',
    '\u2011': '-',
    '\u2012': '-',
    '\u2013': '-',
    '\u2014': '-',
    '\u2015': '-',
    '\u2018': "'",
    '\u2019': "'",
    '\u201a': ',',
    '\u201b': "'",
    '\u201c': '"',
    '\u201d': '"',
    '\u201e': '"',
    '\u2022': '*',
    '\u2026': '...',
    '\u2032': "'",
    '\u2033': '"',
    '\u2212': '-',
  };

  let result = '';
  for (const character of Array.from(text)) {
    const candidate = substitutions[character] ?? character;
    if (canEncodeWithStandardFont(font, candidate)) {
      result += candidate;
    } else {
      result += '?';
    }
  }
  return result;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number | undefined,
): string[] {
  const sourceLines = text.split('\n');
  if (!maxWidth || maxWidth <= 0) return sourceLines;

  const lines: string[] = [];

  for (const sourceLine of sourceLines) {
    const words = sourceLine.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let currentLine = '';
    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
  }

  return lines;
}

async function drawUnicodeTextAsImage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  field: TemplateField,
  text: string,
): Promise<boolean> {
  if (typeof document === 'undefined') return false;

  const scale = Math.max(2, Math.min(4, window.devicePixelRatio || 2));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return false;

  const fontFamily = 'Arial, Helvetica, "Segoe UI", sans-serif';
  const fontWeight = field.fontWeight === 'bold' ? '700' : '400';
  const canvasFontSize = field.fontSize * scale;
  context.font = `${fontWeight} ${canvasFontSize}px ${fontFamily}`;

  const maxCanvasWidth = field.maxWidth
    ? Math.max(1, field.maxWidth * scale)
    : undefined;
  const lines = wrapCanvasText(context, text, maxCanvasWidth);
  const measuredWidth = Math.max(
    1,
    ...lines.map((line) => context.measureText(line || ' ').width),
  );
  const padding = Math.ceil(2 * scale);
  const lineHeight = Math.ceil(canvasFontSize * 1.25);

  canvas.width = Math.max(
    1,
    Math.ceil(Math.min(measuredWidth, maxCanvasWidth ?? measuredWidth) + padding * 2),
  );
  canvas.height = Math.max(1, lineHeight * Math.max(1, lines.length) + padding * 2);

  // Resizing a canvas resets its drawing state.
  const drawContext = canvas.getContext('2d');
  if (!drawContext) return false;
  drawContext.font = `${fontWeight} ${canvasFontSize}px ${fontFamily}`;
  drawContext.textBaseline = 'top';
  drawContext.fillStyle = field.color;

  lines.forEach((line, index) => {
    drawContext.fillText(
      line,
      padding,
      padding + index * lineHeight,
      maxCanvasWidth,
    );
  });

  const image = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
  const imageWidth = canvas.width / scale;
  const imageHeight = canvas.height / scale;

  page.drawImage(image, {
    x: field.x,
    y: page.getHeight() - field.y - imageHeight,
    width: imageWidth,
    height: imageHeight,
  });

  return true;
}

async function drawFieldText(
  pdfDoc: PDFDocument,
  page: PDFPage,
  field: TemplateField,
  text: string,
  standardFont: PDFFont,
): Promise<void> {
  const cleanedText = cleanPdfText(text);
  if (!cleanedText) return;

  const { r, g, b } = hexToRgb(field.color);

  if (canEncodeWithStandardFont(standardFont, cleanedText)) {
    page.drawText(cleanedText, {
      x: field.x,
      y: page.getHeight() - field.y - field.fontSize,
      size: field.fontSize,
      font: standardFont,
      color: rgb(r, g, b),
      maxWidth: field.maxWidth || undefined,
      lineHeight: field.fontSize * 1.2,
    });
    return;
  }

  // Browser canvas supports the user's installed Unicode fonts. Rendering only
  // unsupported text as a transparent PNG prevents pdf-lib's WinAnsi crash
  // while keeping normal Latin text as selectable vector text.
  const renderedAsImage = await drawUnicodeTextAsImage(
    pdfDoc,
    page,
    field,
    cleanedText,
  );

  if (!renderedAsImage) {
    page.drawText(toSafeWinAnsi(cleanedText, standardFont), {
      x: field.x,
      y: page.getHeight() - field.y - field.fontSize,
      size: field.fontSize,
      font: standardFont,
      color: rgb(r, g, b),
      maxWidth: field.maxWidth || undefined,
      lineHeight: field.fontSize * 1.2,
    });
  }
}

export async function generateMergedPDF(
  templatePdfBytes: ArrayBuffer,
  fields: TemplateField[],
  record: DataRecord,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templatePdfBytes.slice(0));
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const field of fields) {
    const value = cleanPdfText(record[field.name]);
    if (!value) continue;

    const pageIndex = field.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const selectedFont = field.fontWeight === 'bold' ? fontBold : font;
    await drawFieldText(pdfDoc, pages[pageIndex], field, value, selectedFont);
  }

  return pdfDoc.save();
}

export async function generateAllMergedPDFs(
  templatePdfBytes: ArrayBuffer,
  fields: TemplateField[],
  records: DataRecord[],
  onProgress?: (current: number, total: number) => void,
): Promise<{ name: string; data: Uint8Array }[]> {
  const results: { name: string; data: Uint8Array }[] = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const pdfBytes = await generateMergedPDF(templatePdfBytes, fields, record);
    const firstFieldValue = cleanPdfText(Object.values(record)[0]);
    const safeName =
      firstFieldValue
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 50) || `document_${index + 1}`;

    results.push({
      name: `${safeName}_${index + 1}.pdf`,
      data: pdfBytes,
    });
    onProgress?.(index + 1, records.length);
  }

  return results;
}

export async function getPDFPageDimensions(
  pdfBytes: ArrayBuffer,
): Promise<{ width: number; height: number; pageCount: number }> {
  const pdfDoc = await PDFDocument.load(pdfBytes.slice(0));
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  if (!firstPage) {
    throw new Error('The PDF does not contain any pages.');
  }

  return {
    width: firstPage.getWidth(),
    height: firstPage.getHeight(),
    pageCount: pages.length,
  };
}
