import { Module } from '@nestjs/common';
import { ExcelModule } from 'woojoo-excel';
import { UsersModule } from './excel/users.module';

@Module({
  imports: [ExcelModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
