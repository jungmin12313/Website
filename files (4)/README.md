# 웹사이트 로고 파일 패키지

## 📁 파일 목록 및 용도

| 파일명 | 크기 | 용도 |
|--------|------|------|
| `favicon.ico` | 멀티(16~64px) | 브라우저 탭 아이콘 (IE 포함 모든 브라우저) |
| `favicon-16x16.png` | 16×16 | 브라우저 탭 (모던) |
| `favicon-32x32.png` | 32×32 | 브라우저 탭 (레티나) |
| `apple-touch-icon.png` | 192×192 | iOS 홈 화면 추가 아이콘 |
| `icon-192x192.png` | 192×192 | PWA 아이콘 (Android/Chrome) |
| `icon-512x512.png` | 512×512 | PWA 스플래시 스크린 |
| `og-image.png` | 1200×630 | OG / 카카오톡 / 링크 미리보기 (밝은 배경) |
| `og-image-dark.png` | 1200×630 | OG / 링크 미리보기 (어두운 배경) |
| `logo.png` | 원본 | 투명 배경 로고 (파란색) |
| `logo-cropped.png` | 여백 제거 | 투명 배경 로고, 여백 없음 |
| `logo-white.png` | 원본 | 흰색 로고 (투명 배경, 어두운 배경용) |
| `logo-on-dark.png` | 원본 | 흰색 로고 + 어두운 배경 |
| `logo-on-light.png` | 원본 | 파란 로고 + 흰색 배경 |
| `logo.svg` | 벡터 | SVG (PNG 내장) |
| `site.webmanifest` | — | PWA 매니페스트 |
| `head-snippet.html` | — | HTML `<head>` 붙여넣기 코드 |

## 🚀 적용 방법

1. 모든 이미지 파일을 프로젝트 루트(또는 `/public`) 에 복사하세요.
2. `head-snippet.html` 의 내용을 모든 페이지의 `<head>` 에 붙여넣으세요.
3. `your-domain.com` 을 실제 도메인으로 교체하세요.
4. OG 이미지 텍스트(제목/설명)도 실제 내용으로 수정하세요.

## 🎨 로고 색상

- 메인 컬러: `#4da6ff` (파란색)
- 사용 위치: `theme-color` 메타태그, CSS 변수 등
