import { Controller, Get, Res } from '@nestjs/common';
import { Fill } from 'exceljs';
import { Response } from 'express';
import { ExcelService } from 'woojoo-excel';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('download')
  async downloadExcel(@Res() res: Response) {
    const data = [
      { name: '홍길동', age: 20, email: 'hong@test.com' },
      { name: '김철수', age: 25, email: 'kim@test.com' },
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
          type: 'pattern' as const,
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        } as Partial<Fill>,
      },
    };

    const excelBuffer = await this.excelService.generateExcel(data, options);
    await this.excelService.sendExcelResponse(res, 'users.xlsx', excelBuffer);
  }

  @Get('download-large')
  async downloadLargeExcel(@Res() res: Response) {
    // 100,000행의 대용량 데이터 생성
    const data = Array.from({ length: 100000 }, (_, i) => ({
      id: i + 1,
      name: `사용자_${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: Math.floor(Math.random() * 50) + 20,
      department: ['개발팀', '디자인팀', '마케팅팀', '영업팀'][Math.floor(Math.random() * 4)],
      joinDate: new Date(2020, 0, 1 + i).toISOString().split('T')[0],
    }));

    const options = {
      sheetName: '대용량_사용자_목록',
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: '이름', key: 'name', width: 20 },
        { header: '이메일', key: 'email', width: 30 },
        { header: '나이', key: 'age', width: 10 },
        { header: '부서', key: 'department', width: 15 },
        { header: '입사일', key: 'joinDate', width: 15 },
      ],
      headerStyle: {
        font: { bold: true, size: 12 },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid',
          fgColor: { argb: 'FFE5E5E5' },
        } as Partial<Fill>,
      },
      streaming: {
        enabled: true,
        chunkSize: 10000,
      },
    };

    const excelBuffer = await this.excelService.generateExcel(data, options);
    await this.excelService.sendExcelResponse(res, 'large-users.xlsx', excelBuffer);
  }
}
