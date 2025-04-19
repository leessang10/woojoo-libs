# woojoo-excel

NestJS 기반 프로젝트를 위한 Excel 변환 모듈입니다. ExcelJS를 기반으로 하며, 데이터를 Excel 파일로 쉽게 변환할 수 있습니다.

## 주요 기능

- 데이터 배열을 Excel 파일로 변환
- 시트 이름, 컬럼 설정 커스터마이징
- 헤더 스타일 (폰트, 배경색) 설정
- 컬럼 너비 조정
- Buffer 또는 파일로 출력
- HTTP 응답으로 직접 전송 지원

## 설치

```bash
npm install woojoo-excel
```

## 사용 방법

### 1. 모듈 임포트

```typescript
import { ExcelModule } from 'woojoo-excel';

@Module({
  imports: [ExcelModule],
})
export class AppModule {}
```

### 2. 서비스 주입

```typescript
import { ExcelService } from 'woojoo-excel';

@Injectable()
export class YourService {
  constructor(private readonly excelService: ExcelService) {}
}
```

### 3. Excel 생성

#### Buffer로 반환받기

```typescript
const data = [
  { name: '홍길동', age: 20, email: 'hong@test.com' },
  { name: '김철수', age: 25, email: 'kim@test.com' },
];

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

// Buffer로 반환
const buffer = await this.excelService.generateExcel(data, options);

// 파일로 저장
fs.writeFileSync('users.xlsx', buffer);
```

#### HTTP 응답으로 직접 전송

```typescript
@Controller()
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('download')
  async downloadExcel(@Res() res: Response) {
    const data = [
      { name: '홍길동', age: 20, email: 'hong@test.com' },
      { name: '김철수', age: 25, email: 'kim@test.com' },
    ];

    const options = {
      sheetName: '사용자 목록',
      filename: 'users.xlsx', // 다운로드될 파일 이름
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

    await this.excelService.sendExcelResponse(res, data, options);
  }
}
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

## 실제 사용 예시

### 1. 기본 사용

```typescript
const basicOptions = {
  columns: [
    { header: '이름', key: 'name' },
    { header: '나이', key: 'age' },
  ],
};
```

### 2. 스타일 적용

```typescript
const styledOptions = {
  sheetName: '회원 목록',
  columns: [
    { header: '이름', key: 'name', width: 20 },
    { header: '나이', key: 'age', width: 10 },
    { header: '이메일', key: 'email', width: 30 },
  ],
  headerStyle: {
    font: {
      bold: true,
      size: 12,
      color: { argb: 'FF000000' },
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E5E5' },
    },
  },
};
```

## 주의사항

1. 데이터 객체의 키는 `columns` 옵션의 `key`와 정확히 일치해야 합니다.
2. 색상은 ARGB 형식의 16진수 문자열로 지정해야 합니다 (예: 'FF000000').
3. 파일 크기가 큰 경우 메모리 사용량에 주의해야 합니다.

## 성능 및 제한사항

### 메모리 사용량

ExcelJS는 메모리 내에서 Excel 파일을 생성하므로, 대용량 데이터를 처리할 때는 메모리 사용량에 주의해야 합니다.

#### 제한사항

- Excel 2007+ (.xlsx) 파일의 최대 행 수: 1,048,576 행
- Excel 2007+ (.xlsx) 파일의 최대 열 수: 16,384 열 (XFD)
- Node.js의 기본 메모리 제한: 약 2GB (32비트 시스템) 또는 4GB (64비트 시스템)

#### 권장사항

1. 대용량 데이터 처리 시:

   - 데이터를 청크(chunk) 단위로 나누어 처리
   - 스트리밍 방식으로 파일 생성 고려
   - Node.js 실행 시 `--max-old-space-size` 옵션으로 메모리 제한 증가

2. 메모리 사용량 예시:
   - 10,000행 × 10열: 약 5-10MB
   - 100,000행 × 10열: 약 50-100MB
   - 1,000,000행 × 10열: 약 500MB-1GB

### 대용량 데이터 처리 예시

```typescript
import { ExcelService } from 'woojoo-excel';
import * as fs from 'fs';
import { createWriteStream } from 'fs';

@Injectable()
export class LargeDataService {
  constructor(private readonly excelService: ExcelService) {}

  async generateLargeExcel() {
    const CHUNK_SIZE = 10000; // 한 번에 처리할 행 수
    const TOTAL_ROWS = 100000; // 전체 행 수
    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '이름', key: 'name', width: 20 },
      { header: '이메일', key: 'email', width: 30 },
      // ... 추가 컬럼
    ];

    // 청크 단위로 데이터 생성 및 처리
    for (let i = 0; i < TOTAL_ROWS; i += CHUNK_SIZE) {
      const chunkData = this.generateChunkData(i, Math.min(CHUNK_SIZE, TOTAL_ROWS - i));
      const buffer = await this.excelService.generateExcel(chunkData, {
        sheetName: `청크_${i / CHUNK_SIZE + 1}`,
        columns,
      });

      // 파일에 청크 데이터 추가
      if (i === 0) {
        fs.writeFileSync('large_data.xlsx', buffer);
      } else {
        fs.appendFileSync('large_data.xlsx', buffer);
      }
    }
  }

  private generateChunkData(startIndex: number, size: number) {
    return Array.from({ length: size }, (_, index) => ({
      id: startIndex + index + 1,
      name: `사용자_${startIndex + index + 1}`,
      email: `user${startIndex + index + 1}@example.com`,
    }));
  }
}
```

## 라이선스

MIT

## 데이터와 헤더 매핑

### 헤더와 데이터의 관계

Excel 파일에서 헤더는 첫 번째 행에만 표시되며, 데이터는 그 아래 행들에 표시됩니다. `columns` 옵션에서는 각 컬럼의 헤더와 데이터 매핑을 한 번만 정의하면 됩니다.

예시:

```typescript
const data = [
  { name: '홍길동', age: 20, email: 'hong@test.com' }, // 첫 번째 데이터 행
  { name: '김철수', age: 25, email: 'kim@test.com' }, // 두 번째 데이터 행
  { name: '이영희', age: 30, email: 'lee@test.com' }, // 세 번째 데이터 행
  { name: '박민수', age: 28, email: 'park@test.com' }, // 네 번째 데이터 행
  { name: '최지원', age: 35, email: 'choi@test.com' }, // 다섯 번째 데이터 행
];

const options = {
  sheetName: '사용자 목록',
  columns: [
    { header: '이름', key: 'name', width: 15 }, // 헤더는 한 번만 정의
    { header: '나이', key: 'age', width: 10 }, // 헤더는 한 번만 정의
    { header: '이메일', key: 'email', width: 30 }, // 헤더는 한 번만 정의
  ],
};
```

이렇게 설정하면 Excel 파일은 다음과 같이 생성됩니다:

| 이름   | 나이 | 이메일        |
| ------ | ---- | ------------- |
| 홍길동 | 20   | hong@test.com |
| 김철수 | 25   | kim@test.com  |
| 이영희 | 30   | lee@test.com  |
| 박민수 | 28   | park@test.com |
| 최지원 | 35   | choi@test.com |

### 데이터 매핑 규칙

1. `columns` 옵션의 `key` 값은 데이터 객체의 속성 이름과 정확히 일치해야 합니다.
2. 데이터 객체에 `key`에 해당하는 속성이 없는 경우, 해당 셀은 비어있게 됩니다.
3. 데이터 객체에 `columns`에 정의되지 않은 추가 속성이 있더라도 Excel 파일에는 포함되지 않습니다.

### 스트리밍 모드 사용

대용량 데이터를 처리할 때는 스트리밍 모드를 사용할 수 있습니다. 이 모드는 메모리 사용량을 최소화하면서 대용량 데이터를 처리할 수 있습니다.

```typescript
const data = generateLargeData(); // 대용량 데이터 생성

const options = {
  sheetName: '대용량 데이터',
  columns: [
    { header: 'ID', key: 'id', width: 10 },
    { header: '이름', key: 'name', width: 20 },
    { header: '이메일', key: 'email', width: 30 },
  ],
  streaming: {
    enabled: true, // 스트리밍 모드 활성화
    chunkSize: 10000, // 청크 크기 설정 (기본값: 10000)
    outputPath: 'temp.xlsx', // 임시 파일 경로 (기본값: 'temp.xlsx')
  },
};

// 스트리밍 모드로 Excel 생성
const buffer = await excelService.generateExcel(data, options);
```

#### 스트리밍 모드 특징

1. 메모리 효율성:

   - 데이터를 청크 단위로 처리하여 메모리 사용량 최소화
   - 대용량 데이터 처리에 적합

2. 처리 방식:

   - 첫 번째 청크는 헤더를 포함하여 처리
   - 이후 청크들은 헤더 없이 데이터만 추가
   - 각 청크는 별도의 워크북으로 처리 후 스트림에 추가

3. 사용 시 주의사항:
   - 임시 파일이 생성되므로, 처리 후 정리가 필요할 수 있음
   - 청크 크기는 시스템 메모리와 처리 속도를 고려하여 조정
   - 스트리밍 모드에서는 일부 고급 스타일링 기능이 제한될 수 있음
