import { Global, Module } from '@nestjs/common';
@Global()
@Module({})
export class CommonModule {
  static forRoot() {
    return {
      module: CommonModule,
      global: true,
    };
  }
}
