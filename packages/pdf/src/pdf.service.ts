import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { HbsToPdfOptions, IPdfService, PdfResponseOptions } from './interfaces/pdf-options.interface';

@Injectable()
export class PdfService implements IPdfService {
  constructor() {}

  /**
   * Handlebars 템플릿을 PDF로 변환합니다.
   * @param options HBS 템플릿과 PDF 생성 옵션
   * @returns PDF 버퍼
   */
  async hbsToPdf(options: HbsToPdfOptions): Promise<Buffer> {
    const { template, data, options: pdfOptions, styles } = options;

    // Puppeteer가 자동으로 Chrome을 찾거나 다운로드합니다
    const browser = await this.createBrowser();

    try {
      const page = await browser.newPage();
      
      // HBS 템플릿에 데이터 주입
      const hbsTemplate = Handlebars.compile(template);
      const html = hbsTemplate(data || {});

      // HTML에 스타일 추가
      const htmlWithStyles = this.wrapWithHtml(html, styles);

      // HTML 렌더링
      await page.setContent(htmlWithStyles, {
        waitUntil: 'networkidle0',
      });

      // PDF 생성
      const pdfBuffer = await page.pdf(pdfOptions || {});

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * PDF 버퍼를 HTTP 응답으로 전송합니다.
   * @param res Express Response 객체
   * @param filename 다운로드될 파일 이름
   * @param buffer PDF 버퍼
   * @param options 응답 옵션
   */
  async sendPdfResponse(
    res: Response,
    filename: string,
    buffer: Buffer,
    options?: PdfResponseOptions
  ): Promise<void> {
    const { inline = false, charset = 'UTF-8' } = options || {};
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename*=${charset}''${encodeURIComponent(filename)}`
    );
    res.send(buffer);
  }

  private wrapWithHtml(content: string, styles?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${styles ? `<style>${styles}</style>` : ''}
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
  }

  private async createBrowser() {
    return puppeteer.launch({
      headless: true as const,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }
} 