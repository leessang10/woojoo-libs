import { Injectable } from '@nestjs/common';
import { Fill, Workbook } from 'exceljs';
import { Response } from 'express';
import { ExcelOptions } from './interfaces/excel-options.interface';

@Injectable()
export class ExcelService {
  async generateExcel(data: Record<string, any>[], options: ExcelOptions): Promise<Buffer> {
    if (!this.validateData(data, options)) {
      throw new Error('Invalid data structure');
    }

    // 스트리밍 모드가 활성화된 경우
    if (options.streaming?.enabled) {
      return this.generateExcelStreaming(data, options);
    }

    // 기존 메모리 내 처리 방식
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');

    // 컬럼 설정
    worksheet.columns = options.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // 헤더 스타일 적용
    if (options.headerStyle) {
      const headerRow = worksheet.getRow(1);
      if (options.headerStyle.font) {
        headerRow.font = options.headerStyle.font;
      }
      if (options.headerStyle.fill) {
        headerRow.fill = options.headerStyle.fill as Fill;
      }
      headerRow.commit();
    }

    // 데이터 추가
    worksheet.addRows(data);

    // 버퍼로 변환
    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  private async generateExcelStreaming(data: Record<string, any>[], options: ExcelOptions): Promise<Buffer> {
    const chunkSize = options.streaming?.chunkSize || 10000;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');

    // 컬럼 설정
    worksheet.columns = options.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // 헤더 스타일 적용
    if (options.headerStyle) {
      const headerRow = worksheet.getRow(1);
      if (options.headerStyle.font) {
        headerRow.font = options.headerStyle.font;
      }
      if (options.headerStyle.fill) {
        headerRow.fill = options.headerStyle.fill as Fill;
      }
      headerRow.commit();
    }

    // 데이터를 청크 단위로 처리
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
      worksheet.addRows(chunk);
    }

    // 버퍼로 변환
    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  async sendExcelResponse(res: Response, data: Record<string, any>[], options: ExcelOptions & { filename?: string }): Promise<void> {
    const buffer = await this.generateExcel(data, options);
    const filename = options.filename || 'excel.xlsx';

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  private validateData(data: Record<string, any>[], options: ExcelOptions): boolean {
    if (!Array.isArray(data) || !options.columns) {
      return false;
    }

    const requiredKeys = options.columns.map((col) => col.key);
    return data.every((item) => requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(item, key)));
  }
}
