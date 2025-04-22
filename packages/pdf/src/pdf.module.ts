import { DynamicModule, Module } from '@nestjs/common';
import { PdfModuleOptions } from './interfaces/pdf-module-options.interface';
import { PdfService } from './pdf.service';

@Module({})
export class PdfModule {
  static forRoot(options: PdfModuleOptions): DynamicModule {
    return {
      module: PdfModule,
      providers: [
        {
          provide: PdfService,
          useValue: new PdfService(options),
        },
      ],
      exports: [PdfService],
    };
  }
} 