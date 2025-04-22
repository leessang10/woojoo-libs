import { Test, TestingModule } from '@nestjs/testing';
import { Fill, Font, Workbook } from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
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
      await expect(service.generateExcel(invalidData, options)).rejects.toThrow('데이터 구조가 유효하지 않습니다');
    });
  });

  describe('대용량 데이터 처리', () => {
    const TEST_FILE_PATH = path.join(__dirname, 'test-large.xlsx');

    afterEach(() => {
      // 테스트 파일 정리
      if (fs.existsSync(TEST_FILE_PATH)) {
        fs.unlinkSync(TEST_FILE_PATH);
      }
    });

    it('10,000행의 데이터를 처리할 수 있어야 함', async () => {
      const data = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `사용자_${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      const options = {
        sheetName: '대용량_테스트',
        columns: [
          { header: 'ID', key: 'id', width: 10 },
          { header: '이름', key: 'name', width: 20 },
          { header: '이메일', key: 'email', width: 30 },
        ],
      };

      const buffer = await service.generateExcel(data, options);
      fs.writeFileSync(TEST_FILE_PATH, buffer);

      // 파일이 생성되었는지 확인
      expect(fs.existsSync(TEST_FILE_PATH)).toBe(true);

      // 파일 크기 확인 (최소 100KB 이상)
      const stats = fs.statSync(TEST_FILE_PATH);
      expect(stats.size).toBeGreaterThan(100 * 1024);
    });

    it('청크 단위로 대용량 데이터를 처리할 수 있어야 함', async () => {
      const CHUNK_SIZE = 5000;
      const TOTAL_ROWS = 20000;
      const columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: '이름', key: 'name', width: 20 },
        { header: '이메일', key: 'email', width: 30 },
      ];

      // 첫 번째 청크 처리
      const firstChunk = Array.from({ length: CHUNK_SIZE }, (_, i) => ({
        id: i + 1,
        name: `사용자_${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      let buffer = await service.generateExcel(firstChunk, {
        sheetName: '청크_1',
        columns,
      });
      fs.writeFileSync(TEST_FILE_PATH, buffer);

      // 두 번째 청크 처리
      const secondChunk = Array.from({ length: CHUNK_SIZE }, (_, i) => ({
        id: CHUNK_SIZE + i + 1,
        name: `사용자_${CHUNK_SIZE + i + 1}`,
        email: `user${CHUNK_SIZE + i + 1}@example.com`,
      }));

      buffer = await service.generateExcel(secondChunk, {
        sheetName: '청크_2',
        columns,
      });
      fs.appendFileSync(TEST_FILE_PATH, buffer);

      // 파일이 생성되었는지 확인
      expect(fs.existsSync(TEST_FILE_PATH)).toBe(true);

      // 파일 크기 확인 (최소 200KB 이상)
      const stats = fs.statSync(TEST_FILE_PATH);
      expect(stats.size).toBeGreaterThan(200 * 1024);
    });
  });

  describe('스트리밍 모드', () => {
    const TEST_FILE_PATH = path.join(__dirname, 'test-streaming.xlsx');

    afterEach(() => {
      if (fs.existsSync(TEST_FILE_PATH)) {
        fs.unlinkSync(TEST_FILE_PATH);
      }
    });

    it('스트리밍 모드로 대용량 데이터를 처리할 수 있어야 함', async () => {
      const data = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `사용자_${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      const options = {
        sheetName: '스트리밍_테스트',
        columns: [
          { header: 'ID', key: 'id', width: 10 },
          { header: '이름', key: 'name', width: 20 },
          { header: '이메일', key: 'email', width: 30 },
        ],
        streaming: {
          enabled: true,
          chunkSize: 2000,
          outputPath: TEST_FILE_PATH,
        },
      };

      const buffer = await service.generateExcel(data, options);
      fs.writeFileSync(TEST_FILE_PATH, buffer);

      // 파일이 생성되었는지 확인
      expect(fs.existsSync(TEST_FILE_PATH)).toBe(true);

      // 파일 크기 확인 (최소 100KB 이상)
      const stats = fs.statSync(TEST_FILE_PATH);
      expect(stats.size).toBeGreaterThan(100 * 1024);

      // 생성된 Excel 파일 검증
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(options.sheetName);
      expect(worksheet).toBeDefined();
      if (worksheet) {
        expect(worksheet.rowCount).toBeGreaterThan(data.length);
      }
    }, 30000); // 타임아웃 30초로 설정

    it('스트리밍 모드에서 청크 크기를 조절할 수 있어야 함', async () => {
      const data = Array.from({ length: 5000 }, (_, i) => ({
        id: i + 1,
        name: `사용자_${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      const options = {
        sheetName: '청크크기_테스트',
        columns: [
          { header: 'ID', key: 'id', width: 10 },
          { header: '이름', key: 'name', width: 20 },
          { header: '이메일', key: 'email', width: 30 },
        ],
        streaming: {
          enabled: true,
          chunkSize: 1000, // 더 작은 청크 크기
          outputPath: TEST_FILE_PATH,
        },
      };

      const buffer = await service.generateExcel(data, options);
      fs.writeFileSync(TEST_FILE_PATH, buffer);

      // 파일이 생성되었는지 확인
      expect(fs.existsSync(TEST_FILE_PATH)).toBe(true);

      // 파일 크기 확인
      const stats = fs.statSync(TEST_FILE_PATH);
      expect(stats.size).toBeGreaterThan(50 * 1024);

      // 생성된 Excel 파일 검증
      const workbook = new Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(options.sheetName);
      expect(worksheet).toBeDefined();
      if (worksheet) {
        expect(worksheet.rowCount).toBeGreaterThan(data.length);
      }
    }, 30000); // 타임아웃 30초로 설정
  });
});
