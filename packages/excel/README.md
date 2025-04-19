# @woojoo/excel

NestJS 기반 프로젝트를 위한 Excel 변환 모듈입니다.

## 설치

```bash
npm install @woojoo/excel
```

## 사용 방법

1. 모듈 임포트

```typescript
import { ExcelModule } from '@woojoo/excel';

@Module({
  imports: [ExcelModule],
})
export class AppModule {}
```

2. 서비스 주입

```typescript
import { ExcelService } from '@woojoo/excel';

@Injectable()
export class YourService {
  constructor(private readonly excelService: ExcelService) {}
}
```

3. Excel 생성

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

## 옵션 설명

- `sheetName`: 시트 이름 (기본값: 'Sheet1')
- `columns`: 컬럼 설정
  - `header`: 컬럼 헤더 텍스트
  - `key`: 데이터 객체의 키
  - `width`: 컬럼 너비 (기본값: 15)
- `headerStyle`: 헤더 스타일 설정
  - `font`: 폰트 설정 (bold, size, color 등)
  - `fill`: 배경색 설정 (type, pattern, fgColor)

## 예시

```typescript
// 기본 사용
const basicOptions = {
  columns: [
    { header: '이름', key: 'name' },
    { header: '나이', key: 'age' },
  ],
};

// 스타일 적용
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

## 라이선스

MIT
