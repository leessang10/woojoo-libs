# @woojoo/excel

[![GitHub](https://img.shields.io/badge/GitHub-leessang10%2Fwoojoo--libs-blue?style=flat-square&logo=github)](https://github.com/leessang10/woojoo-libs)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/@woojoo/excel.svg)](https://www.npmjs.com/package/@woojoo/excel)

NestJS 기반 프로젝트를 위한 Excel 변환 모듈입니다.

ExcelJS를 기반으로 하며, 데이터를 Excel 파일로 쉽게 변환할 수 있습니다.

## 주요 기능

- 데이터 배열을 Excel 파일로 변환
- 시트 이름, 컬럼 설정 커스터마이징
- 헤더 스타일 (폰트, 배경색) 설정
- 컬럼 너비 조정
- Buffer 또는 파일로 출력
- HTTP 응답으로 직접 전송 지원

## 설치

```bash
npm install @woojoo/excel
```

## 사용 방법

### 1. 모듈 임포트

```typescript
import { ExcelModule } from '@woojoo/excel';

@Module({
  imports: [ExcelModule],
})
export class AppModule {}
```

### 2. 서비스 구현

```typescript
import { ExcelService } from '@woojoo/excel';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@woojoo/common';

@Injectable()
export class UserService {
  constructor(private readonly excelService: ExcelService, private readonly prismaService: PrismaService) {}

  async generateUserExcel() {
    // DB에서 사용자 데이터 조회
    const users = await this.prismaService.user.findMany({
      select: {
        name: true,
        age: true,
        email: true,
      },
    });

    // Excel 생성 옵션 설정
    const options = {
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
        },
      },
    };

    // Excel 파일 생성 (Buffer 반환)
    return this.excelService.generateExcel(users, options);
  }
}
```

### 3. 컨트롤러 구현

```typescript
import { ExcelService } from '@woojoo/excel';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private readonly excelService: ExcelService) {}

  @Get('excel')
  async exportUserExcel(@Res() res: Response) {
    // 서비스에서 Excel Buffer 생성
    const buffer = await this.userService.generateUserExcel();

    // HTTP 응답으로 Excel 파일 전송
    await this.excelService.sendExcelResponse(res, 'users.xlsx', buffer);
  }
}
```

### 4. 모듈 구성

```typescript
import { Module } from '@nestjs/common';
import { ExcelModule } from '@woojoo/excel';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [ExcelModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

## 옵션 상세 설명

### ExcelOptions 인터페이스

```typescript
interface ExcelOptions {
  sheetName?: string; // 시트 이름 (기본값: 'Sheet1')
  filename?: string; // 다운로드될 파일 이름 (기본값: 'excel.xlsx')
  columns: ExcelColumn[]; // 컬럼 설정 배열
  headerStyle?: {
    // 헤더 스타일 설정 (선택)
    font?: Partial<Font>; // 폰트 설정
    fill?: Partial<Fill>; // 배경색 설정
  };
}

interface ExcelColumn {
  header: string; // 컬럼 헤더 텍스트
  key: string; // 데이터 객체의 키
  width?: number; // 컬럼 너비 (기본값: 15)
}
```

### 스타일 옵션 예시

#### 폰트 스타일

```typescript
const fontStyle = {
  bold: true, // 굵게
  size: 12, // 크기
  color: { argb: 'FF000000' }, // 색상 (ARGB 형식)
  italic: true, // 이탤릭
  underline: true, // 밑줄
};
```

#### 배경색 스타일

```typescript
const fillStyle = {
  type: 'pattern', // 패턴 타입
  pattern: 'solid', // 패턴 종류
  fgColor: { argb: 'FFE5E5E5' }, // 전경색
  bgColor: { argb: 'FFFFFFFF' }, // 배경색
};
```

## 대용량 데이터 처리

### 메모리 사용량 및 제한사항

- Excel 2007+ (.xlsx) 파일의 최대 행 수: 1,048,576 행
- Excel 2007+ (.xlsx) 파일의 최대 열 수: 16,384 열 (XFD)
- Node.js의 기본 메모리 제한: 약 2GB (32비트 시스템) 또는 4GB (64비트 시스템)

### 메모리 사용량 예시

- 10,000행 × 10열: 약 5-10MB
- 100,000행 × 10열: 약 50-100MB
- 1,000,000행 × 10열: 약 500MB-1GB

### 대용량 데이터 처리 예시

```typescript
import { ExcelService } from '@woojoo/excel';

@Injectable()
export class LargeDataService {
  constructor(private readonly excelService: ExcelService) {}

  async generateLargeExcel() {
    // 대용량 데이터 조회
    const largeData = await this.fetchLargeData();

    // 스트리밍 옵션을 활성화하여 Excel 생성
    const buffer = await this.excelService.generateExcel(largeData, {
      sheetName: '대용량 데이터',
      columns: [
        { header: 'ID', key: 'id', width: 10 },
        { header: '이름', key: 'name', width: 20 },
        { header: '이메일', key: 'email', width: 30 },
      ],
      // 스트리밍 옵션 활성화
      streaming: {
        enabled: true,
        chunkSize: 10000, // 한 번에 처리할 행 수
      },
    });

    return buffer;
  }

  private async fetchLargeData() {
    // 대용량 데이터 조회 로직
    // 예: DB에서 페이지네이션 없이 모든 데이터 조회
    return await this.prismaService.user.findMany();
  }
}
```

### 스트리밍 옵션 설명

```typescript
interface StreamingOptions {
  enabled: boolean; // 스트리밍 활성화 여부
  chunkSize?: number; // 한 번에 처리할 행 수 (기본값: 10000)
}
```

스트리밍 옵션을 활성화하면 내부적으로 데이터를 청크 단위로 나누어 처리하므로, 대용량 데이터를 처리할 때 메모리 사용량을 최적화할 수 있습니다. 이 방식은 사용자가 직접 데이터를 나누어 처리할 필요 없이 서비스 내부에서 자동으로 처리합니다.

## 주의사항

1. 데이터 객체의 키는 `columns` 옵션의 `key`와 정확히 일치해야 합니다.
2. 색상은 ARGB 형식의 16진수 문자열로 지정해야 합니다 (예: 'FF000000').
3. 파일 크기가 큰 경우 메모리 사용량에 주의해야 합니다.
4. 대용량 데이터 처리 시에는 `streaming` 옵션을 활성화하여 메모리 사용량을 최적화하는 것이 좋습니다.

## 라이선스

MIT
