import { Test, TestingModule } from '@nestjs/testing';
import { Fill, Font, Workbook } from 'exceljs';
import { ExcelService } from '../excel.service';
import { ExcelColumn, ExcelOptions } from '../interfaces/excel-options.interface';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelService],
    }).compile();

    service = module.get<ExcelService>(ExcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateExcel', () => {
    const testData = [
      { name: '홍길동', age: 20, email: 'hong@test.com' },
      { name: '김철수', age: 25, email: 'kim@test.com' },
    ];

    const options: ExcelOptions = {
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

    it('should generate excel buffer with correct data', async () => {
      const buffer = await service.generateExcel(testData, options);
      expect(buffer).toBeInstanceOf(Buffer);

      // 생성된 엑셀 파일 검증
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(options.sheetName || 'Sheet1');
      expect(worksheet).toBeDefined();

      if (!worksheet) return;

      // 헤더 검증
      options.columns.forEach((col: ExcelColumn, index: number) => {
        const cell = worksheet.getCell(1, index + 1);
        expect(cell.value).toBe(col.header);
      });

      // 데이터 검증
      testData.forEach((row, rowIndex) => {
        options.columns.forEach((col: ExcelColumn, colIndex: number) => {
          const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
          expect(cell.value).toBe(row[col.key as keyof typeof row]);
        });
      });
    });

    it('should apply header styles correctly', async () => {
      const buffer = await service.generateExcel(testData, options);
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(options.sheetName || 'Sheet1');
      if (!worksheet || !options.headerStyle?.font || !options.headerStyle?.fill) return;

      const headerRow = worksheet.getRow(1);

      headerRow.eachCell((cell) => {
        const font = cell.font as Partial<Font>;
        const fill = cell.fill as Partial<Fill>;

        expect(font.bold).toBe(options.headerStyle?.font?.bold);
        expect(font.size).toBe(options.headerStyle?.font?.size);
        expect(fill.type).toBe(options.headerStyle?.fill?.type);
        if ('pattern' in fill) {
          expect(fill.pattern).toBe((options.headerStyle?.fill as any)?.pattern);
        }
      });
    });

    it('should throw error for invalid data', async () => {
      const invalidData = [{ invalidKey: 'value' }];
      await expect(service.generateExcel(invalidData, options)).rejects.toThrow('Invalid data structure');
    });
  });
});
