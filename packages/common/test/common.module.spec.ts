import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from '../src/common.module';

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
