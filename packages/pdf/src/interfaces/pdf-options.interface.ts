import { Response } from 'express';

export interface PdfOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
  width?: string | number;
  height?: string | number;
}

export interface HbsToPdfOptions {
  template: string;  // Handlebars 템플릿 문자열
  data?: Record<string, any>;  // 템플릿에 주입할 데이터
  options?: PdfOptions;  // PDF 생성 옵션
  styles?: string;  // CSS 스타일
}

export interface PdfTemplate {
  // 템플릿 파일 이름 (옵션)
  template?: string;
  // 직접 HBS 템플릿 문자열 전달 (옵션)
  templateContent?: string;
  // 템플릿에 주입할 데이터
  data: Record<string, any>;
  // PDF 생성 옵션
  options?: PdfOptions;
  // 추가 CSS 스타일 (옵션)
  styles?: string;
}

export interface PdfResponseOptions {
  inline?: boolean;  // true면 브라우저에서 열기, false면 다운로드 (기본값: false)
  charset?: string;  // 파일명 인코딩 (기본값: UTF-8)
}

export interface IPdfService {
  hbsToPdf(options: HbsToPdfOptions): Promise<Buffer>;
  sendPdfResponse(
    res: Response,
    filename: string,
    buffer: Buffer,
    options?: PdfResponseOptions
  ): Promise<void>;
} 