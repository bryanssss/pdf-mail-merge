export interface DataRecord {
  [key: string]: string;
}

export interface TemplateField {
  name: string;
  x: number;
  y: number;
  page: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  maxWidth?: number;
}

export interface MergeTemplate {
  id: string;
  name: string;
  fields: TemplateField[];
  pdfFileName: string;
  createdAt: string;
}

export type AppStep = 'upload-pdf' | 'upload-data' | 'map-fields' | 'preview' | 'generate';

export interface PDFPageInfo {
  width: number;
  height: number;
  pageIndex: number;
}
