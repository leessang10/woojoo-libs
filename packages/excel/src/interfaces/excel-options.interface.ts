import { Fill, Font } from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelOptions {
  sheetName?: string;
  columns: ExcelColumn[];
  headerStyle?: {
    font?: Partial<Font>;
    fill?: Partial<Fill>;
  };
  streaming?: {
    enabled: boolean;
    chunkSize?: number;
    outputPath?: string;
  };
}
