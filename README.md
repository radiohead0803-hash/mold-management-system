# CAMS 금형관리 시스템 Ver.03

![CAMS 주식회사 캠스 Logo](client/public/ams-logo.png)

**주식회사 캠스 CAMS** 금형관리 전산화 시스템 - 현대적이고 직관적인 금형관리 솔루션입니다.

## 🎯 주요 기능

### 관리자 (본사/보전/품질/개발)
- ID/PASS 로그인 방식
- 금형 기본정보 관리 (웹폼 + 엑셀 일괄등록)
- 통합 대시보드 (자산/점검/타수/위치/SLA 시각화)
- 점검/수리/생산/개발 이력 관리

### 작업자 (협력사 현장)
- QR 코드 스캔 접근 (로그인 불필요)
- 일상점검, 정기점검 결과 등록
- 금형수정 등록, 생산이력 입력
- GPS 자동 기록 + 촬영 이미지 + 실시간 전송

## 🎨 디자인 시스템

## 디자인 시스템
Apple Human Interface Guidelines 기반의 클린하고 직관적인 디자인:
- **색상**: 화이트, 미드 그레이, 딥 블루 기반 팔레트
- **타이포그래피**: San Francisco 시스템 폰트
- **컴포넌트**: 둥근 모서리, 얇은 구분선, 부드러운 그림자
- **애니메이션**: 자연스러운 전환 효과

## 프로젝트 구조
```
Ver03/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 공통 컴포넌트
│   │   ├── contexts/       # React Context
│   │   ├── pages/          # 페이지 컴포넌트
│   │   └── ...
├── server/                 # Node.js 백엔드
│   ├── src/
│   │   ├── models/         # 데이터베이스 모델
│   │   ├── routes/         # API 라우트
│   │   └── ...
└── install.bat            # 설치 스크립트
```

## 설치 및 실행

### 로컬 개발 환경

#### 자동 설치 (Windows)
```bash
# 설치 스크립트 실행
install.bat
```

#### 수동 설치
```bash
# 루트 의존성 설치
npm install

# 클라이언트 의존성 설치
cd client
npm install

# 서버 의존성 설치
cd ../server
npm install
```

#### 환경 설정
1. `server/.env.example`을 `server/.env`로 복사
2. 데이터베이스 연결 정보 수정
3. PostgreSQL 서버 실행 확인

#### 개발 서버 시작
```bash
# 전체 개발 서버 (루트에서)
npm run dev

# 또는 개별 실행
# 클라이언트
cd client && npm run dev

# 서버
cd server && npm run dev
```

### 환경 변수 설정

#### 프론트엔드 (client/.env.development)
```bash
VITE_API_BASE_URL=http://localhost:5000
```

#### 백엔드 (server/.env)
```bash
PORT=5000
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mold_management
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-secret-key
```

자세한 설정은 `server/.env.example` 및 `client/.env.example` 참조
```

### 프로덕션 배포 (Railway)

#### 빠른 시작
1. GitHub에 코드 푸시
2. Railway에서 PostgreSQL + 백엔드 배포
3. Vercel에서 프론트엔드 배포

#### 상세 가이드
- **Git 및 Railway 배포**: [`GIT_DEPLOYMENT_GUIDE.md`](./GIT_DEPLOYMENT_GUIDE.md) 참조
- **Railway 배포 가이드**: [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) 참조
- **빠른 시작 가이드**: [`RAILWAY_QUICKSTART.md`](./RAILWAY_QUICKSTART.md) 참조
- **문제 해결**: [`RAILWAY_TROUBLESHOOTING.md`](./RAILWAY_TROUBLESHOOTING.md) 참조

## 기술 스택

### Frontend
- **React 18**: 최신 React 기능 활용
- **TypeScript**: 타입 안정성 보장
- **Vite**: 빠른 개발 환경
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **React Router**: SPA 라우팅
- **Lucide React**: 아이콘 라이브러리

### Backend
- **Node.js**: JavaScript 런타임
- **Express**: 웹 프레임워크
- **TypeScript**: 서버사이드 타입 안정성
- **Sequelize**: PostgreSQL ORM
- **JWT**: 인증 토큰
- **Multer**: 파일 업로드

### Database
- **PostgreSQL**: 관계형 데이터베이스
- **Sequelize**: ORM 및 마이그레이션

### 개발 도구
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Nodemon**: 서버 자동 재시작

## 데이터베이스 스키마

### 주요 테이블
- **users**: 관리자 계정 정보
- **molds**: 금형 기본 정보
- **daily_checks**: 일상점검 기록
- **inspections**: 정기점검 관리
- **repairs**: 수리 요청 및 이력
- **shots**: 타수 기록
- **qr_sessions**: QR 세션 관리
- **notifications**: 알림 관리
- **audit_logs**: 감사 로그

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 관리자 로그인
- `POST /api/auth/qr/session` - QR 세션 생성

### 관리자
- `GET /api/admin/molds` - 금형 목록 조회
- `POST /api/admin/molds` - 금형 등록
- `POST /api/admin/molds/bulk-upload` - 엑셀 일괄 업로드

### 작업자 (QR 기반)
- `POST /api/qr/molds/:id/daily-checks` - 일상점검 등록
- `POST /api/qr/molds/:id/repairs` - 수리요청 등록

### 대시보드
- `GET /api/dash/kpi` - KPI 데이터
- `GET /api/dash/charts` - 차트 데이터

## 개발 현황

### 완료된 작업 
- [x] 프로젝트 구조 설정 및 기본 파일 생성
- [x] 데이터베이스 스키마 설계 및 모델 생성
- [x] Apple Design 스타일 UI 컴포넌트 구축
- [x] 기본 레이아웃 및 네비게이션
- [x] 관리자 로그인 페이지
- [x] 대시보드 기본 구조
- [x] 금형 관리 페이지

### 진행 예정 작업 
- [ ] 관리자 금형정보 등록 폼 구현
- [ ] 엑셀 일괄등록 기능 구현
- [ ] 관리자 대시보드 및 차트 시각화
- [ ] 작업자 QR 스캔 기반 폼 구현
- [ ] 일상점검 폼 및 도움말 시스템
- [ ] API 엔드포인트 구현
- [ ] GPS 및 이미지 업로드 기능

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.
