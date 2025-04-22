# Woojoo Libs: NestJS 공용 모듈 모노레포 시스템

[![GitHub](https://img.shields.io/badge/GitHub-leessang10%2Fwoojoo--libs-blue?style=flat-square&logo=github)](https://github.com/leessang10/woojoo-libs)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/@woojoo/excel.svg)](https://www.npmjs.com/package/@woojoo/excel)

이 리포지토리는 NestJS 기반 프로젝트들에서 공통적으로 사용되는 기능을 모듈 단위로 분리하여 NPM 패키지 형태로 배포하고 재사용할 수 있도록 구성된 모노레포입니다.

모든 모듈은 `@woojoo/모듈명` 형태로 사용되며, 각 모듈은 NestJS의 Dynamic Module 패턴(`forRoot`)을 지원합니다.

---

## 1. 프로젝트 목표

- 중복되는 기능(인증, 이메일, 엑셀, PDF 등)을 모듈화하여 재사용성과 유지보수성을 높임
- 모든 기능은 NPM 패키지로 배포되고, NestJS 프로젝트에 `npm install`로 쉽게 추가 가능
- 모노레포 기반으로 개발/배포/테스트 자동화

---

## 2. 사용 스택 및 도구

- **프레임워크**: NestJS
- **모노레포 관리**: Lerna + NPM Workspaces
- **빌드 도구**: TypeScript (`tsc`)
- **테스트 프레임워크**: Jest
- **CI/CD**: GitHub Actions
- **패키지 배포**: NPM Registry
- **문서화**: README 및 각 모듈의 사용 예제 포함

---

## 3. 프로젝트 구조

```
woojoo-libs/
├── packages/
│   ├── auth/           # 인증 모듈 (@woojoo/auth)
│   ├── email/          # 이메일 모듈 (@woojoo/email)
│   ├── excel/          # 엑셀 변환 모듈 (@woojoo/excel)
│   ├── pdf/            # PDF 생성 모듈 (@woojoo/pdf)
│   ├── common/         # 공용 유틸리티 및 인터페이스
├── example/            # 샘플 NestJS 앱 (테스트용)
├── tsconfig.base.json  # 공통 TypeScript 설정
├── package.json        # NPM workspaces 및 스크립트
├── lerna.json          # Lerna 설정
└── .github/workflows/  # CI/CD 자동화 스크립트
```

---

## 4. 설치 및 실행 방법

### 개발 환경 설정

```bash
# 리포지토리 클론
$ git clone https://github.com/leessang10/woojoo-libs.git
$ cd woojoo-libs

# 의존성 설치
$ npm install

# Lerna bootstrap으로 내부 모듈 연결
$ npm run bootstrap

# 전체 빌드
$ npm run build

# 테스트 실행
$ npm run test
```

### 개별 모듈 개발

```bash
# 특정 모듈로 이동
$ cd packages/pdf

# 모듈 의존성 설치
$ npm install

# 모듈 빌드
$ npm run build

# 모듈 테스트
$ npm run test
```

### 샘플 앱 실행

```bash
# 샘플 앱 디렉토리로 이동
$ cd example

# 의존성 설치
$ npm install

# 환경 변수 설정
$ cp .env.example .env
$ vi .env  # 필요한 환경 변수 설정

# 앱 실행
$ npm run start:dev
```

---

## 5. 주요 모듈 기능 요구사항 및 사용법

### @woojoo/pdf

**기능 요구사항**:

- Handlebars(HBS) 템플릿을 기반으로 PDF 파일 생성
- HTML을 PDF로 변환하는 기능
- 커스텀 폰트 지원
- 페이지 크기, 여백, 방향 설정 가능
- 헤더/푸터 설정 가능
- 이미지 삽입 지원
- 다국어 지원 (RTL 포함)
- PDF 메타데이터 설정 (제목, 작성자, 키워드 등)

**구현 구조**:

```
packages/pdf/
├── src/
│   ├── pdf.module.ts
│   ├── pdf.service.ts
│   ├── pdf.controller.ts
│   ├── interfaces/
│   │   ├── pdf-options.interface.ts
│   │   └── pdf-template.interface.ts
│   ├── templates/
│   │   └── default.hbs
│   └── constants/
│       └── pdf.constants.ts
├── test/
│   └── pdf.service.spec.ts
└── package.json
```

**의존성**:

```json
{
  "dependencies": {
    "handlebars": "^4.7.8",
    "puppeteer": "^21.0.0",
    "@types/handlebars": "^4.7.8"
  }
}
```

**사용 예시**:

```ts
// PDF 모듈 설정
PdfModule.forRoot({
  templatePath: './templates',
  defaultOptions: {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm',
    },
    printBackground: true,
  },
});

// PDF 생성 예시
const pdfBuffer = await pdfService.generatePdf({
  template: 'invoice',
  data: {
    invoiceNumber: 'INV-2024-001',
    date: '2024-04-20',
    items: [
      { name: '상품 A', price: 10000 },
      { name: '상품 B', price: 20000 },
    ],
  },
  options: {
    format: 'A4',
    landscape: false,
  },
});
```

### @woojoo/auth

**기능 요구사항**:

- JWT 기반 로그인/로그아웃
- Access Token + Refresh Token 전략
- 다중기기 로그인 세션 관리
- 탈퇴, 비활성화, 복구 상태 처리
- 중복 가입 방지 로직

**구현 구조**:

- `AuthModule`, `AuthService`, `AuthController`, `JwtStrategy`
- 토큰 관리 및 검증 로직

**사용 예시**:

```ts
AuthModule.forRoot({
  jwtSecret: process.env.JWT_SECRET,
  accessTokenTTL: 3600,
  refreshTokenTTL: 604800,
  multiDevice: true,
});
```

### @woojoo/email

**기능 요구사항**:

- SMTP 기반 이메일 발송
- HTML 템플릿 렌더링 지원 (ejs, mustache 등)
- 인증 메일, 알림 메일 구분
- 발송 결과 로깅

**구현 구조**:

- `EmailModule`, `EmailService`, `TemplateRenderer`
- `email_log` 테이블 사용

**사용 예시**:

```ts
EmailModule.forRoot({
  smtpHost: 'smtp.mailtrap.io',
  smtpUser: 'user_id',
  smtpPass: 'user_pass',
  fromEmail: 'no-reply@yourdomain.com',
});
```

### @woojoo/excel

**기능 요구사항**:

- JS 배열 데이터를 엑셀 파일(.xlsx)로 변환
- 시트 이름, 컬럼명, 너비 설정 가능
- Buffer 또는 파일로 리턴

**구현 구조**:

- `ExcelModule`, `ExcelService`
- ExcelJS 라이브러리 활용

**사용 예시**:

```ts
const buffer = await excelService.generateExcelFile(users, {
  sheetName: '회원 목록',
  columns: [
    { header: '이름', key: 'name' },
    { header: '이메일', key: 'email' },
  ],
});
```

---

## 6. 배포 방법

### 단일 패키지 배포

```bash
# 배포할 패키지 디렉토리로 이동
$ cd packages/pdf

# 버전 업데이트
$ npm version patch  # 또는 minor, major

# NPM에 배포
$ npm publish --access public
```

### 전체 패키지 배포

```bash
# 루트 디렉토리에서
$ npm run publish:all
```

### 버전 관리 규칙

- `patch`: 버그 수정, 작은 기능 개선
- `minor`: 새로운 기능 추가 (하위 호환성 유지)
- `major`: 큰 기능 변경 (하위 호환성 깨짐)

---

## 7. GitHub Actions 설정

### CI/CD 워크플로우

- `main` 브랜치에 푸시될 때 자동으로 실행
- 모든 패키지의 테스트 실행
- 성공 시 자동 배포

### 워크플로우 파일

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Publish packages
        run: npx lerna publish from-package --yes
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 환경 변수 설정

1. GitHub 저장소의 Settings > Secrets and variables > Actions
2. `NPM_TOKEN` 추가 (NPM 계정의 Access Token)

---

## 8. 모듈 개발 지침

### 공통 원칙

- 모든 모듈은 `forRoot()`로 초기화 가능해야 함
- `src/index.ts`에서 필요한 모든 구성요소 export
- `test/` 폴더 내에 최소 1개 이상의 단위 테스트 포함

### 코드 스타일

- ESLint + Prettier 사용
- TypeScript strict 모드 준수
- 모든 public 메서드에 JSDoc 주석 추가

---

## 9. 테스트 지침

```bash
# 모든 모듈 테스트 실행
$ npm run test

# 특정 모듈만 테스트
$ cd packages/auth
$ npm run test

# 테스트 커버리지 확인
$ npm run test:cov
```

각 모듈은 `jest` 기반 테스트를 포함해야 하며, 필수 비즈니스 로직은 최소 80% 이상의 커버리지를 유지합니다.

---

## 10. 참고 문서

- [NestJS 공식 문서](https://docs.nestjs.com)
- [Lerna 공식 문서](https://lerna.js.org)
- [GitHub Actions 가이드](https://docs.github.com/en/actions)
- [Handlebars 템플릿 가이드](https://handlebarsjs.com/guide/)
- [Puppeteer API 문서](https://pptr.dev/)

---

## 11. 기여 가이드

- 새로운 모듈을 추가할 경우, `packages/모듈명` 디렉토리에 Nest 구조로 생성합니다.
- 기존 공통 로직은 `@woojoo/common`으로 이동하여 중복 제거합니다.
- 모든 변경사항은 PR로 제출하며, 테스트를 포함해야 합니다.
- PR 제출 전에 `npm run lint`와 `npm run test`를 실행하여 코드 품질을 확인합니다.
