import { Module } from '@nestjs/common';
import { PdfModule as WoojooPdfModule } from '@woojoo/pdf';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [WoojooPdfModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
