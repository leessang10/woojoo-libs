import { Controller, Get, Res } from '@nestjs/common';
import { ExcelService } from '@woojoo/excel';
import { Fill } from 'exceljs';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('excel')
  async generateExcel(@Res() res: Response) {
    const data = [
      { name: '홍길동', age: 20, email: 'hong@test.com' },
      { name: '김철수', age: 25, email: 'kim@test.com' },
      { name: '이영희', age: 30, email: 'lee@test.com' },
    ];

    const options = {
      sheetName: '사용자 목록',
      columns: [
        { header: '이름', key: 'name', width: 15 },
        { header: '나이', key: 'age', width: 10 },
        { header: '이메일', key: 'email', width: 30 },
      ],
      headerStyle: {
        font: { bold: true, size: 12 },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        } as Partial<Fill>,
      },
    };

    const buffer = await this.excelService.generateExcel(data, options);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=users.xlsx',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
