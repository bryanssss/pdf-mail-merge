import Papa from 'papaparse';
import type { DataRecord } from '../types';

export function parseCSV(file: File): Promise<{ headers: string[]; records: DataRecord[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const records = results.data as DataRecord[];
        resolve({ headers, records });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function parseCSVFromText(text: string): { headers: string[]; records: DataRecord[] } {
  const results = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });
  const headers = results.meta.fields || [];
  const records = results.data as DataRecord[];
  return { headers, records };
}

export function generateSampleCSV(): string {
  return `First Name,Last Name,Email,Company,Address,City,State,Zip
John,Doe,john@example.com,Acme Corp,123 Main St,Springfield,IL,62701
Jane,Smith,jane@example.com,Widget Inc,456 Oak Ave,Portland,OR,97201
Bob,Johnson,bob@example.com,Tech Solutions,789 Pine Rd,Austin,TX,78701
Alice,Williams,alice@example.com,Data Co,321 Elm St,Denver,CO,80201
Charlie,Brown,charlie@example.com,Cloud Nine,654 Maple Dr,Seattle,WA,98101`;
}
