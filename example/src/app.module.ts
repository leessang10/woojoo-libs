import { Module } from '@nestjs/common';
import { ExcelModule } from '@woojoo/excel';
import { AppController } from './app.controller';

@Module({
  imports: [ExcelModule],
  controllers: [AppController],
})
export class AppModule {}
