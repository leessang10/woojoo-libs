import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HbsToPdfOptions } from '../interfaces/pdf-options.interface';
import { PdfService } from '../pdf.service';

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hbsToPdf', () => {
    it('should generate PDF buffer from HBS template', async () => {
      const options: HbsToPdfOptions = {
        template: '<h1>{{title}}</h1>',
        data: { title: '테스트 문서' },
        styles: 'h1 { color: blue; }',
      };

      const result = await service.hbsToPdf(options);
      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle template without data', async () => {
      const options: HbsToPdfOptions = {
        template: '<h1>정적 내용</h1>',
      };

      const result = await service.hbsToPdf(options);
      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply PDF options', async () => {
      const options: HbsToPdfOptions = {
        template: '<h1>테스트</h1>',
        options: {
          format: 'A4' as const,
          landscape: true,
        },
      };

      const result = await service.hbsToPdf(options);
      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('sendPdfResponse', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
    });

    it('should set correct headers for download', async () => {
      const buffer = Buffer.from('test');
      const filename = 'test.pdf';

      await service.sendPdfResponse(mockResponse as Response, filename, buffer);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename*=UTF-8\'\'test.pdf',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(buffer);
    });

    it('should set correct headers for inline viewing', async () => {
      const buffer = Buffer.from('test');
      const filename = 'test.pdf';
      const options = { inline: true };

      await service.sendPdfResponse(mockResponse as Response, filename, buffer, options);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline; filename*=UTF-8\'\'test.pdf',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(buffer);
    });

    it('should handle filenames with Korean characters', async () => {
      const buffer = Buffer.from('test');
      const filename = '테스트.pdf';

      await service.sendPdfResponse(mockResponse as Response, filename, buffer);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename*=UTF-8\'\'%ED%85%8C%EC%8A%A4%ED%8A%B8.pdf',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(buffer);
    });
  });
}); 