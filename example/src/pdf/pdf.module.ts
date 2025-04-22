import { Module } from '@nestjs/common';
import { PdfModule as WoojooPdfModule } from '@woojoo/pdf';
import { join } from 'path';
import { PdfController } from './pdf.controller';

@Module({
  imports: [
    WoojooPdfModule.forRoot({
      templatePath: join(__dirname, 'templates'),
      defaultOptions: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      },
    }),
  ],
  controllers: [PdfController],
})
export class PdfModule {}
