# KB금융 고객 문의 자동 분류 시스템

Gemini AI가 고객 문의를 자동 분류하고 Supabase에 저장하는 웹앱입니다.

## 기술 스택

- **프론트엔드**: React + TypeScript + Vite + Tailwind CSS v4
- **AI**: Google Gemini 3 Flash Preview (`@google/genai`)
- **데이터베이스**: Supabase (PostgreSQL)
- **배포**: Vercel

## 로컬 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
# .env.example을 참고하여 .env 파일 생성
cp .env.example .env
# .env 파일에 실제 API 키 입력

# 3. 개발 서버 실행
npm run dev
```

## Supabase 설정

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 → **SQL Editor** 클릭
3. **New query** → `supabase_setup.sql` 파일 내용을 붙여넣기
4. **Run** 클릭 → `Success` 확인

## 환경변수 (.env)

| 변수명 | 설명 |
|---|---|
| `VITE_GEMINI_API_KEY` | Google Gemini API 키 |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public 키 |

## Vercel 배포 방법

1. GitHub에 코드 push
2. [Vercel](https://vercel.com) → **Import Project** → GitHub 레포 선택
3. **Environment Variables**에 위 3개 환경변수 입력
4. **Deploy** 클릭

> ⚠️ 이 프로젝트는 실습/프로토타입 용도입니다. 프로덕션 환경에서는 API 키를 서버 사이드에서 관리하세요.
