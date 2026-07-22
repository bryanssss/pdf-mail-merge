import JSZip from 'jszip';
import Papa from 'papaparse';
import type { DataRecord } from '../types';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function cleanCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(/^\uFEFF/, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .normalize('NFC')
    .trim();
}

function makeUniqueHeaders(values: unknown[]): string[] {
  const used = new Map<string, number>();

  return values.map((value, index) => {
    const base = cleanCellValue(value) || `Column ${index + 1}`;
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base} ${count}`;
  });
}

function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  // UTF-16 LE BOM
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  }

  // UTF-16 BE BOM
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = new Uint8Array(bytes.length - 2);
    for (let i = 2; i + 1 < bytes.length; i += 2) {
      swapped[i - 2] = bytes[i + 1];
      swapped[i - 1] = bytes[i];
    }
    return new TextDecoder('utf-16le').decode(swapped);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    // Many CSV files exported by older Windows/Excel versions use Windows-1252.
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

function parseCsvText(text: string): {
  headers: string[];
  records: DataRecord[];
} {
  const results = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    transformHeader: (header) => cleanCellValue(header),
    transform: (value) => cleanCellValue(value),
  });

  const rawHeaders = results.meta.fields ?? [];
  const headers = makeUniqueHeaders(rawHeaders);

  if (headers.length === 0) {
    throw new Error('No column headings were found in the CSV file.');
  }

  // Papa Parse creates objects with the original header names. Re-map them if
  // duplicate or blank headings had to be renamed.
  const records = results.data
    .map((row) => {
      const record: DataRecord = {};
      rawHeaders.forEach((rawHeader, index) => {
        record[headers[index]] = cleanCellValue(row[rawHeader]);
      });
      return record;
    })
    .filter((record) => Object.values(record).some((value) => value !== ''));

  if (records.length === 0) {
    throw new Error('The CSV file does not contain any data rows.');
  }

  return { headers, records };
}

function columnReferenceToIndex(reference: string): number {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? 'A';
  let index = 0;

  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }

  return index - 1;
}


function elementsByLocalName(
  root: Document | Element,
  localName: string,
): Element[] {
  return Array.from(root.getElementsByTagNameNS('*', localName));
}

function getXmlText(node: Element | null): string {
  return cleanCellValue(node?.textContent ?? '');
}

function resolveWorksheetPath(target: string): string {
  const cleaned = target.replace(/^\//, '');
  if (cleaned.startsWith('xl/')) return cleaned;
  return `xl/${cleaned.replace(/^\.\//, '')}`;
}

async function parseXlsx(file: File): Promise<{
  headers: string[];
  records: DataRecord[];
}> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const workbookFile = zip.file('xl/workbook.xml');
  const relationshipsFile = zip.file('xl/_rels/workbook.xml.rels');

  if (!workbookFile || !relationshipsFile) {
    throw new Error(
      'This Excel file is not a valid .xlsx workbook. Save it as Excel Workbook (.xlsx) and try again.',
    );
  }

  const parser = new DOMParser();
  const workbookXml = parser.parseFromString(
    await workbookFile.async('text'),
    'application/xml',
  );
  const relationshipsXml = parser.parseFromString(
    await relationshipsFile.async('text'),
    'application/xml',
  );

  const workbookError = elementsByLocalName(workbookXml, 'parsererror')[0];
  const relationshipsError = elementsByLocalName(relationshipsXml, 'parsererror')[0];
  if (workbookError || relationshipsError) {
    throw new Error('The Excel workbook structure could not be read.');
  }

  const firstSheet = elementsByLocalName(workbookXml, 'sheet')[0];
  if (!firstSheet) {
    throw new Error('The Excel workbook does not contain a worksheet.');
  }

  const relationshipId =
    firstSheet.getAttribute('r:id') ??
    firstSheet.getAttributeNS(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'id',
    );

  if (!relationshipId) {
    throw new Error('The first worksheet could not be located.');
  }

  const relationship = elementsByLocalName(
    relationshipsXml,
    'Relationship',
  ).find((item) => item.getAttribute('Id') === relationshipId);

  const target = relationship?.getAttribute('Target');
  if (!target) {
    throw new Error('The first worksheet could not be located.');
  }

  const worksheetFile = zip.file(resolveWorksheetPath(target));
  if (!worksheetFile) {
    throw new Error('The first worksheet data is missing from the workbook.');
  }

  const sharedStrings: string[] = [];
  const sharedStringsFile = zip.file('xl/sharedStrings.xml');
  if (sharedStringsFile) {
    const sharedXml = parser.parseFromString(
      await sharedStringsFile.async('text'),
      'application/xml',
    );

    for (const item of elementsByLocalName(sharedXml, 'si')) {
      const text = elementsByLocalName(item, 't')
        .map((node) => node.textContent ?? '')
        .join('');
      sharedStrings.push(cleanCellValue(text));
    }
  }

  const worksheetXml = parser.parseFromString(
    await worksheetFile.async('text'),
    'application/xml',
  );

  if (elementsByLocalName(worksheetXml, 'parsererror')[0]) {
    throw new Error('The Excel worksheet data could not be read.');
  }

  const matrix: string[][] = [];

  for (const rowNode of elementsByLocalName(worksheetXml, 'row')) {
    const row: string[] = [];

    const cells = Array.from(rowNode.children).filter(
      (child) => child.localName === 'c',
    );

    for (const cell of cells) {
      const reference = cell.getAttribute('r') ?? 'A1';
      const columnIndex = columnReferenceToIndex(reference);
      const type = cell.getAttribute('t') ?? 'n';
      let value = '';

      if (type === 'inlineStr') {
        const inlineString = Array.from(cell.children).find(
          (child) => child.localName === 'is',
        );
        value = inlineString
          ? elementsByLocalName(inlineString, 't')
              .map((node) => node.textContent ?? '')
              .join('')
          : '';
      } else {
        const valueNode = Array.from(cell.children).find(
          (child) => child.localName === 'v',
        );
        const rawValue = getXmlText(valueNode ?? null);

        switch (type) {
          case 's':
            value = sharedStrings[Number(rawValue)] ?? '';
            break;
          case 'b':
            value = rawValue === '1' ? 'TRUE' : 'FALSE';
            break;
          case 'e':
            value = '';
            break;
          default:
            value = rawValue;
            break;
        }
      }

      row[columnIndex] = cleanCellValue(value);
    }

    while (row.length > 0 && (row[row.length - 1] ?? '') === '') {
      row.pop();
    }

    if (row.some((value) => value !== '')) {
      matrix.push(row);
    }
  }

  if (matrix.length < 2) {
    throw new Error(
      'The first Excel worksheet must contain a header row and at least one data row.',
    );
  }

  const columnCount = Math.max(...matrix.map((row) => row.length));
  const headers = makeUniqueHeaders(
    Array.from({ length: columnCount }, (_, index) => matrix[0][index] ?? ''),
  );

  const records = matrix
    .slice(1)
    .map((row) => {
      const record: DataRecord = {};
      headers.forEach((header, index) => {
        record[header] = cleanCellValue(row[index] ?? '');
      });
      return record;
    })
    .filter((record) => Object.values(record).some((value) => value !== ''));

  if (records.length === 0) {
    throw new Error('The first Excel worksheet does not contain any data rows.');
  }

  return { headers, records };
}

export async function parseCSV(file: File): Promise<{
  headers: string[];
  records: DataRecord[];
}> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const isXlsx = extension === 'xlsx' || file.type === XLSX_MIME;

  if (isXlsx) {
    return parseXlsx(file);
  }

  if (extension === 'xls') {
    throw new Error(
      'Old .xls files are not supported. Open the file in Excel and save it as .xlsx or .csv.',
    );
  }

  if (extension !== 'csv' && file.type !== 'text/csv' && file.type !== '') {
    throw new Error('Please upload a CSV or XLSX file.');
  }

  return parseCsvText(decodeCsvBuffer(await file.arrayBuffer()));
}

export function parseCSVFromText(text: string): {
  headers: string[];
  records: DataRecord[];
} {
  return parseCsvText(text);
}

export function generateSampleCSV(): string {
  return [
    'First Name,Last Name,Email,Company,Address,City,State,Zip',
    'John,Doe,john@example.com,Acme Corp,123 Main St,Springfield,IL,62701',
    'Jane,Smith,jane@example.com,Widget Inc,456 Oak Ave,Portland,OR,97201',
    'Bob,Johnson,bob@example.com,Tech Solutions,789 Pine Rd,Austin,TX,78701',
    'Alice,Williams,alice@example.com,Data Co,321 Elm St,Denver,CO,80201',
    'Charlie,Brown,charlie@example.com,Cloud Nine,654 Maple Dr,Seattle,WA,98101',
  ].join('\n');
}
