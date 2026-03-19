# 모의고사 분석 (Mock Exam Analysis)

모의고사 성적 입력 및 분석 서비스입니다.

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 폴더 구조

```
MyExam/
├── app/
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈 페이지 (메뉴 네비게이션)
│   └── my-exam/                 # 모의고사 분석 페이지들
│       ├── layout.tsx           # 모의고사 분석 레이아웃 (탭 네비게이션)
│       ├── input/               # 입력 페이지
│       │   ├── page.tsx         # 시험 선택 (연도/학년/월)
│       │   ├── form/            # 답안 입력
│       │   │   ├── page.tsx
│       │   │   └── loading.tsx
│       │   └── score/           # 점수 입력
│       │       ├── page.tsx
│       │       └── loading.tsx
│       ├── management/          # 분석과 오답 관리
│       ├── prediction/          # 대학 예측
│       ├── score-analysis/      # 성적 분석
│       ├── score-input/         # 점수 입력 (placeholder)
│       ├── statistics/          # 누적 분석/통계
│       ├── target-university/   # 목표 대학
│       └── wrong-answers/       # 오답 분석
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   └── progress.tsx
│   ├── navigation.tsx           # 네비게이션 메뉴 (참고용)
│   ├── footer.tsx               # 푸터 (참고용)
│   └── theme-provider.tsx       # 테마 프로바이더
├── lib/
│   └── utils.ts                 # cn() 유틸리티 함수
├── styles/
│   └── globals.css              # 글로벌 스타일
├── components.json              # shadcn/ui 설정
├── package.json                 # 의존성 목록
├── next.config.ts               # Next.js 설정
├── tsconfig.json                # TypeScript 설정
├── postcss.config.mjs           # PostCSS 설정
└── README.md                    # 이 파일
```

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 페이지 (메뉴 네비게이션) |
| `/my-exam/input` | 모의고사 시험 선택 (연도, 학년, 월) |
| `/my-exam/input/form` | 답안 직접 입력 |
| `/my-exam/input/score` | 점수 직접 입력 |
| `/my-exam/score-analysis` | 성적 분석 결과 |
| `/my-exam/prediction` | 대학 합격 예측 |
| `/my-exam/statistics` | 누적 성적 통계 |
| `/my-exam/management` | 분석 관리 및 오답 |
| `/my-exam/target-university` | 목표 대학 설정 |
| `/my-exam/wrong-answers` | 오답 노트 |

## 기술 스택

- **Framework**: Next.js 16.x (App Router, Turbopack)
- **UI**: React 19 + Tailwind CSS 4.x
- **Components**: shadcn/ui (Radix UI 기반)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Language**: TypeScript

## 기능 설명

### 1. 모의고사 입력
- 연도, 학년, 월 선택
- 점수 직접 입력 또는 답안 입력
- 학년별 다른 과목 구성 (고1: 통합사회/통합과학, 고2/고3: 탐구과목)

### 2. 성적 분석
- 과목별 점수, 등급, 백분위 분석
- 반영비율에 따른 대학별 점수 비교
- 조합별 성적 분석

### 3. 대학 예측
- 지역별, 계열별 대학 필터링
- 대학별 점수 범위와 내 성적 비교
- 합격 가능성 시각화

### 4. 누적 분석
- 전과목/과목별 분석 모드
- 등급/원점수/표준점수/백분위 그래프
- 월별 성적 추이 분석

### 5. 목표 대학
- 목표 대학 등급컷 차트
- 수시/정시 등급컷 비교

### 6. 오답 노트
- 틀린 문항 표시
- 정답 및 문항 유형 분석

## 주의사항

- 이 패키지는 독립 실행 가능한 Next.js 프로젝트입니다.
- 다른 프로젝트에 통합 시 UI 컴포넌트(`components/ui/`)가 이미 있다면 충돌에 주의하세요.
- Tailwind CSS 4.x를 사용하므로 기존 Tailwind 3.x 프로젝트와 설정이 다를 수 있습니다.
