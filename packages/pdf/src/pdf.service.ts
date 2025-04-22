import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { PdfModuleOptions } from './interfaces/pdf-module-options.interface';
import { PdfOptions, PdfTemplate } from './interfaces/pdf-options.interface';

@Injectable()
export class PdfService {
  private readonly options: PdfModuleOptions;

  constructor(options: PdfModuleOptions) {
    this.options = options;
  }

  async generatePdf(template: PdfTemplate): Promise<Buffer> {
    const { template: templateName, data, options } = template;
    const browser = await puppeteer.launch({
      headless: 'new',
    });

    try {
      const page = await browser.newPage();
      const templateContent = await this.loadTemplate(templateName);
      const html = Handlebars.compile(templateContent)(data);

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const pdfOptions = this.mergeOptions(options);
      const pdfBuffer = await page.pdf(pdfOptions);

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    // TODO: 실제 파일 시스템에서 템플릿 로드 구현
    return '';
  }

  private mergeOptions(options?: PdfOptions): PdfOptions {
    return {
      ...this.options.defaultOptions,
      ...options,
    };
  }
} 