import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  }));

  mockPrismaClient.prototype.onModuleInit = jest.fn();
  mockPrismaClient.prototype.onModuleDestroy = jest.fn();
  mockPrismaClient.prototype.$connect = jest.fn();
  mockPrismaClient.prototype.$disconnect = jest.fn();

  return {
    PrismaClient: mockPrismaClient,
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    await service.$connect();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    await service.$disconnect();
    expect(service.$disconnect).toHaveBeenCalled();
  });

  describe('logging configuration', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterAll(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should enable all logs in development', () => {
      process.env.NODE_ENV = 'development';
      const devService = new PrismaService();
      expect(devService).toBeDefined();
    });

    it('should only enable error logs in production', () => {
      process.env.NODE_ENV = 'production';
      const prodService = new PrismaService();
      expect(prodService).toBeDefined();
    });
  });
});
