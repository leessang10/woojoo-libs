import { Module } from '@nestjs/common';
import { ExcelModule } from 'woojoo-excel';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ExcelModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
