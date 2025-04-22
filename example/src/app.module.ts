import { Module } from '@nestjs/common';
import { ExcelModule } from '@woojoo/excel';
import { UsersModule } from './excel/users.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [ExcelModule, PdfModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
