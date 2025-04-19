import { Module } from '@nestjs/common';
import { ExcelModule } from 'woojoo-excel';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExcelController } from './excel/excel.controller';

@Module({
  imports: [ExcelModule],
  controllers: [AppController, ExcelController],
  providers: [AppService],
})
export class AppModule {}
