# @woojoo/pdf

NestJS 기반의 PDF 생성 모듈입니다. HTML 템플릿을 PDF로 변환할 수 있습니다.

## 설치

```bash
npm install @woojoo/pdf
```

## 필수 요구사항

이 모듈은 Puppeteer를 사용하여 PDF를 생성하기 때문에 Chrome 브라우저가 필요합니다.

### Chrome 설치 방법

#### 1. Puppeteer를 통한 자동 설치 (권장)
```bash
# npm을 사용하는 경우
npx puppeteer browsers install chrome

# pnpm을 사용하는 경우
pnpm dlx puppeteer browsers install chrome

# yarn을 사용하는 경우
yarn dlx puppeteer browsers install chrome
```

#### 2. 수동 설치

각 운영체제별 Chrome 설치 방법:

**macOS:**
```bash
# Homebrew를 통한 설치
brew install --cask google-chrome
```

**Ubuntu/Debian:**
```bash
# apt를 통한 설치
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
```

**CentOS/RHEL:**
```bash
# yum을 통한 설치
sudo yum install chromium chromium-headless chromium-libs chromedriver
```

**Windows:**
1. [Chrome 공식 웹사이트](https://www.google.com/chrome/)에서 설치 파일 다운로드
2. 다운로드한 설치 파일 실행

## 사용 방법

### 모듈 설정
```typescript
import { Module } from '@nestjs/common';
import { PdfModule } from '@woojoo/pdf';

@Module({
  imports: [PdfModule],
})
export class AppModule {}
```

### PDF 생성 예제

```typescript
import { Injectable } from '@nestjs/common';
import { PdfService } from '@woojoo/pdf';

@Injectable()
export class YourService {
  constructor(private readonly pdfService: PdfService) {}

  async generatePdf() {
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <h1>{{title}}</h1>
          <p>{{content}}</p>
        </body>
      </html>
    `;

    const styles = `
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
    `;

    const pdfBuffer = await this.pdfService.htmlToPdf({
      html,
      data: {
        title: '제목',
        content: '내용',
      },
      options: {
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      },
      styles,
    });

    return pdfBuffer;
  }
}
```

## API 문서

### PdfService

#### htmlToPdf(options: HtmlToPdfOptions): Promise<Buffer>

HTML 문자열을 PDF로 변환합니다.

**매개변수:**
- `options: HtmlToPdfOptions`
  - `html: string` - HTML 템플릿 문자열 (Handlebars 문법 지원)
  - `data?: Record<string, any>` - 템플릿에 주입할 데이터
  - `options?: PdfOptions` - PDF 생성 옵션
  - `styles?: string` - CSS 스타일

**반환값:**
- `Promise<Buffer>` - 생성된 PDF의 버퍼

### 인터페이스

```typescript
interface PdfOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
  width?: string | number;
  height?: string | number;
}

interface HtmlToPdfOptions {
  html: string;
  data?: Record<string, any>;
  options?: PdfOptions;
  styles?: string;
}
```

## 라이선스

MIT 