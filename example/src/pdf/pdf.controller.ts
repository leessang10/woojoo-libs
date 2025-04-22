import { Controller, Get, Res } from '@nestjs/common';
import { PdfService } from '@woojoo/pdf';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('invoice')
  async generateInvoice(@Res() res: Response) {
    const pdfBuffer = await this.pdfService.generatePdf({
      template: 'invoice',
      data: {
        invoiceNumber: 'INV-2024-001',
        date: new Date().toISOString().split('T')[0],
        items: [
          { name: '상품 A', price: 10000 },
          { name: '상품 B', price: 20000 },
        ],
        total: 30000,
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.send(pdfBuffer);
  }
}
