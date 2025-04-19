# Woojoo Libs: NestJS 공용 모듈 모노레포 시스템

이 리포지토리는 NestJS 기반 프로젝트들에서 공통적으로 사용되는 기능을 모듈 단위로 분리하여 NPM 패키지 형태로 배포하고 재사용할 수 있도록 구성된 모노레포입니다.

모든 모듈은 `@woojoo/모듈명` 형태로 사용되며, 각 모듈은 NestJS의 Dynamic Module 패턴(`forRoot`)을 지원합니다.

---

## 1. 프로젝트 목표

- 중복되는 기능(인증, 이메일, 엑셀, PDF 등)을 모듈화하여 재사용성과 유지보수성을 높임
- 모든 기능은 NPM 패키지로 배포되고, NestJS 프로젝트에 `npm install`로 쉽게 추가 가능
- 모노레포 기반으로 개발/배포/테스트 자동화
- Prisma를 사용한 DB 접근 통일화 (앱 레벨에서 PrismaClient 단일 생성)

---

## 2. 사용 스택 및 도구

- **프레임워크**: NestJS
- **ORM**: Prisma
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
│   ├── common/         # PrismaService, 유틸 등 공용 로직
├── example/            # 샘플 NestJS 앱 (테스트용)
├── tsconfig.base.json  # 공통 TypeScript 설정
├── package.json        # NPM workspaces 및 스크립트
├── lerna.json          # Lerna 설정
└── .github/workflows/  # CI/CD 자동화 스크립트
```

---

## 4. 초기 설정

```bash
# 리포지토리 클론 및 의존성 설치
$ git clone https://github.com/your-org/woojoo-libs.git
$ cd woojoo-libs
$ npm install

# Lerna bootstrap으로 내부 모듈 연결
$ npm run bootstrap

# 전체 빌드
$ npm run build
```

---

## 5. 주요 모듈 기능 요구사항 및 사용법

### @woojoo/auth
**기능 요구사항**:
- JWT 기반 로그인/로그아웃
- Access Token + Refresh Token 전략
- 다중기기 로그인 세션 관리
- 탈퇴, 비활성화, 복구 상태 처리
- 중복 가입 방지 로직

**구현 구조**:
- `AuthModule`, `AuthService`, `AuthController`, `JwtStrategy`
- `auth_token` 테이블로 토큰 추적
- PrismaService 주입

**사용 예시**:
```ts
AuthModule.forRoot({
  jwtSecret: process.env.JWT_SECRET,
  accessTokenTTL: 3600,
  refreshTokenTTL: 604800,
  multiDevice: true
})
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
  fromEmail: 'no-reply@yourdomain.com'
})
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
    { header: '이메일', key: 'email' }
  ]
})
```

---

## 6. 공통 설정 파일 예시

### package.json (루트)
```json
{
  "name": "woojoo-libs",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "build": "lerna run build",
    "test": "lerna run test",
    "clean": "rimraf packages/*/dist"
  },
  "devDependencies": {
    "lerna": "^7.0.0",
    "typescript": "^5.3.3",
    "rimraf": "^5.0.0"
  }
}
```

### tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist"]
}
```

---

## 7. 모듈 개발 지침

### 공통 원칙
- 모든 모듈은 `forRoot()`로 초기화 가능해야 함
- 직접 `PrismaClient` 생성 금지. `@woojoo/common`의 `PrismaService`를 주입받아 사용
- `src/index.ts`에서 필요한 모든 구성요소 export
- `test/` 폴더 내에 최소 1개 이상의 단위 테스트 포함

---

## 8. 테스트 지침

```bash
# 모든 모듈 테스트 실행
$ npm run test

# 특정 모듈만 테스트
$ cd packages/auth
$ npm run test
```

각 모듈은 `jest` 기반 테스트를 포함해야 하며, 필수 비즈니스 로직은 최소 80% 이상의 커버리지를 유지합니다.

---

## 9. 배포 및 사용

```bash
# 패키지 디렉토리에서 개별 배포
cd packages/auth
npm publish --access public
```

사용 프로젝트에서는 다음과 같이 설치 및 사용합니다:
```bash
npm install @woojoo/auth
```

---

## 10. GitHub Actions 예시

`.github/workflows/release.yml`
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
      - run: npm install
      - run: npm run build
      - run: npx lerna publish from-package --yes
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 11. 향후 확장 예정 모듈

- `@woojoo/notification`: 문자, 푸시 알림 등 통합 알림 모듈
- `@woojoo/feature-toggle`: 기능 플래그 관리 모듈
- `@woojoo/logger`: 외부 로그 수집 연동 모듈

---

## 12. 참고 문서

- [NestJS 공식 문서](https://docs.nestjs.com)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Lerna 공식 문서](https://lerna.js.org)
- [GitHub Actions 가이드](https://docs.github.com/en/actions)

---

## 13. 기여 가이드

- 새로운 모듈을 추가할 경우, `packages/모듈명` 디렉토리에 Nest 구조로 생성합니다.
- 기존 공통 로직은 `@woojoo/common`으로 이동하여 중복 제거합니다.
- 모든 변경사항은 PR로 제출하며, 테스트를 포함해야 합니다.

