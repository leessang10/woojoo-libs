import { Injectable } from '@nestjs/common';
import { Fill, Workbook } from 'exceljs';
import { Response } from 'express';
import { ExcelOptions } from './interfaces/excel-options.interface';

/**
 * Excel 파일 생성을 위한 서비스
 * @description
 * - ExcelJS를 사용하여 Excel 파일을 생성합니다.
 * - 스트리밍 모드를 지원하여 대용량 데이터 처리에 최적화되어 있습니다.
 * - 헤더 스타일링을 지원합니다.
 */
@Injectable()
export class ExcelService {
  /**
   * Excel 파일을 생성합니다.
   * @param data - Excel 파일로 변환할 데이터 배열
   * @param options - Excel 생성 옵션
   * @returns Promise<Buffer> - 생성된 Excel 파일의 버퍼
   * @throws Error - 데이터 구조가 유효하지 않은 경우
   */
  async generateExcel<T extends Record<string, any>>(data: T[], options: ExcelOptions): Promise<Buffer> {
    if (!this.validateData(data, options)) {
      throw new Error('데이터 구조가 유효하지 않습니다. 모든 필수 컬럼이 포함되어 있는지 확인해주세요.');
    }

    try {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Excel 파일 생성 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new Error('Excel 파일 생성 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 스트리밍 모드로 Excel 파일을 생성합니다.
   * @param data - Excel 파일로 변환할 데이터 배열
   * @param options - Excel 생성 옵션
   * @returns Promise<Buffer> - 생성된 Excel 파일의 버퍼
   */
  private async generateExcelStreaming<T extends Record<string, any>>(data: T[], options: ExcelOptions): Promise<Buffer> {
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

  /**
   * Excel 파일을 HTTP 응답으로 전송합니다.
   * @param res - Express Response 객체
   * @param filename - 다운로드될 파일명
   * @param excelBuffer - Excel 파일 버퍼
   */
  async sendExcelResponse(res: Response, filename: string, excelBuffer: Buffer): Promise<void> {
    try {
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=${encodeURIComponent(filename)}`,
        'Content-Length': excelBuffer.length,
      });

      res.send(excelBuffer);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Excel 파일 전송 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new Error('Excel 파일 전송 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 데이터 구조의 유효성을 검사합니다.
   * @param data - 검사할 데이터 배열
   * @param options - Excel 옵션
   * @returns boolean - 데이터 구조가 유효한지 여부
   */
  private validateData<T extends Record<string, any>>(data: T[], options: ExcelOptions): boolean {
    if (!Array.isArray(data) || !options.columns) {
      return false;
    }

    const requiredKeys = options.columns.map((col) => col.key);
    return data.every((item) => requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(item, key)));
  }
}
