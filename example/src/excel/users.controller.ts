import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExcelService } from 'woojoo-excel';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly excelService: ExcelService, private readonly usersService: UsersService) {}

  @Get('excel/export')
  async downloadExcel(@Res() res: Response) {
    const excelBuffer = await this.usersService.generateUsersExcel();
    await this.excelService.sendExcelResponse(res, 'users.xlsx', excelBuffer);
  }

  @Get('excel/export-large')
  async downloadLargeExcel(@Res() res: Response) {
    const excelBuffer = await this.usersService.generateLargeUsersExcel();
    await this.excelService.sendExcelResponse(res, 'large-users.xlsx', excelBuffer);
  }
}
