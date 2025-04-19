import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from '../src/common.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CommonModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonModule.forRoot()],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  describe('forRoot', () => {
    it('should return a dynamic module configuration', () => {
      const moduleConfig = CommonModule.forRoot();

      expect(moduleConfig).toEqual({
        module: CommonModule,
        global: true,
      });
    });
  });
});
