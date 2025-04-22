import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
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
      headless: true,
      channel: 'chrome',
      executablePath: process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome'
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

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.options.templatePath, `${templateName}.hbs`);
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Template ${templateName} not found at ${templatePath}`);
    }
  }

  private mergeOptions(options?: PdfOptions): PdfOptions {
    return {
      ...this.options.defaultOptions,
      ...options,
    };
  }
} 