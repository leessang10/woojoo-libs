import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {
  static forRoot() {
    return {
      module: CommonModule,
      global: true,
    };
  }
}
