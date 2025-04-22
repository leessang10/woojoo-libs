import { Injectable } from '@nestjs/common';
import { PdfService as WoojooPdfService } from '@woojoo/pdf';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PdfService {
  constructor(private readonly pdfService: WoojooPdfService) {}

  /**
   * 테스트용 인보이스 PDF를 생성합니다.
   */
  async generateInvoice(): Promise<Buffer> {
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const items = [
      { name: '상품 A', price: 10000 },
      { name: '상품 B', price: 20000 },
    ];

    // 총액 계산
    const total = items.reduce((sum, item) => sum + item.price, 0);

    // 템플릿 파일 읽기
    const templatePath = join(__dirname, 'templates', 'invoice.hbs');
    const template = readFileSync(templatePath, 'utf-8');

    // PDF 생성
    return this.pdfService.hbsToPdf({
      template,
      data: {
        invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        items,
        total,
      },
      options: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      },
    });
  }

  /**
   * PDF 버퍼를 HTTP 응답으로 전송합니다.
   */
  async sendPdfResponse(
    res: Response,
    filename: string,
    buffer: Buffer,
    options?: {
      inline?: boolean;
      charset?: string;
    },
  ): Promise<void> {
    return this.pdfService.sendPdfResponse(res, filename, buffer, options);
  }
}
