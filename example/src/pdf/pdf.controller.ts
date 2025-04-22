import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('invoice')
  async generateInvoice(@Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateInvoice();
    await this.pdfService.sendPdfResponse(res, 'invoice.pdf', pdfBuffer);
  }
}
