# Railway 프론트엔드 배포 가이드

## 📋 개요

이 가이드는 React + Vite 프론트엔드를 Railway에 배포하는 방법을 설명합니다.

---

## 🚀 배포 단계

### 1. Railway 프로젝트 접속

1. [Railway 대시보드](https://railway.app/dashboard) 접속
2. 기존 `mold-management-system` 프로젝트 선택

### 2. 새 서비스 추가

1. **+ New** 버튼 클릭
2. **GitHub Repo** 선택
3. `radiohead0803-hash/mold-management-system` 저장소 선택
4. **Add Service** 클릭

### 3. 서비스 설정

#### 3-1. Root Directory 설정

1. 새로 생성된 서비스 클릭
2. **Settings** 탭 이동
3. **Root Directory** 섹션에서:
   - `client` 입력
   - **Update** 클릭

#### 3-2. 서비스 이름 변경

1. **Settings** 탭에서
2. **Service Name** 섹션:
   - `mold-management-frontend` 입력
   - **Update** 클릭

### 4. 환경 변수 설정

1. **Variables** 탭 이동
2. 다음 환경 변수 추가:

```bash
# 백엔드 API URL (Railway 백엔드 서비스 URL)
VITE_API_BASE_URL=https://mold-management-system-production.up.railway.app

# Node 환경
NODE_ENV=production
```

**중요:** `VITE_API_BASE_URL`은 백엔드 서비스의 실제 URL로 설정해야 합니다.

### 5. 배포 시작

환경 변수를 설정하면 자동으로 배포가 시작됩니다.

**Deploy Logs**에서 다음을 확인:
```
✓ Building...
✓ Build completed
✓ Starting server...
```

### 6. 도메인 확인

1. **Settings** 탭 이동
2. **Domains** 섹션에서:
   - Railway가 자동 생성한 도메인 확인
   - 예: `https://mold-management-frontend-production.up.railway.app`
   - 또는 **Generate Domain** 클릭

### 7. 백엔드 CORS 설정 업데이트

프론트엔드 배포 후, 백엔드에서 프론트엔드 도메인을 허용해야 합니다.

1. Railway 백엔드 서비스 선택
2. **Variables** 탭 이동
3. `CLIENT_URL` 환경 변수 추가/수정:

```bash
CLIENT_URL=https://mold-management-frontend-production.up.railway.app
```

4. 백엔드 서비스가 자동으로 재배포됩니다.

---

## ✅ 배포 확인

### 1. 프론트엔드 접속

브라우저에서 Railway 프론트엔드 도메인 접속:
```
https://mold-management-frontend-production.up.railway.app
```

### 2. 로그인 테스트

데모 계정으로 로그인:
- **관리자**: `admin` / `admin123`
- **매니저**: `manager` / `manager123`

### 3. API 연결 확인

브라우저 개발자 도구(F12) → Console 탭에서:
```
🌐 API Base URL: https://mold-management-system-production.up.railway.app
```

Network 탭에서 API 요청이 성공하는지 확인

---

## 🔧 문제 해결

### 문제 1: "Failed to fetch" 에러

**원인:** 백엔드 CORS 설정에 프론트엔드 도메인이 없음

**해결:**
1. Railway 백엔드 서비스 → Variables
2. `CLIENT_URL` 환경 변수에 프론트엔드 도메인 추가
3. 백엔드 재배포 대기

### 문제 2: 빌드 실패

**원인:** TypeScript 컴파일 에러

**해결:**
1. Deploy Logs에서 에러 메시지 확인
2. 로컬에서 `npm run build` 실행하여 에러 수정
3. Git 커밋 & 푸시

### 문제 3: 환경 변수가 적용되지 않음

**원인:** Vite는 빌드 시점에 환경 변수를 번들에 포함

**해결:**
1. Railway Variables에서 `VITE_API_BASE_URL` 확인
2. 서비스 재배포 (Settings → Redeploy)

### 문제 4: 404 Not Found

**원인:** SPA 라우팅 문제

**해결:**
- Vite preview 서버는 기본적으로 SPA를 지원합니다
- 문제가 지속되면 `vite.config.ts`에서 `preview.spa: true` 확인

---

## 📊 배포 구조

```
Railway Project: mold-management-system
├── PostgreSQL Service (cozy-gratitude)
│   └── DATABASE_URL
├── Backend Service (mold-management-system)
│   ├── Root Directory: server
│   ├── Environment:
│   │   ├── DATABASE_URL=${{Postgres.DATABASE_URL}}
│   │   ├── CLIENT_URL=https://frontend-domain.up.railway.app
│   │   ├── NODE_ENV=production
│   │   └── JWT_SECRET=...
│   └── Domain: https://mold-management-system-production.up.railway.app
└── Frontend Service (mold-management-frontend)
    ├── Root Directory: client
    ├── Environment:
    │   ├── VITE_API_BASE_URL=https://backend-domain.up.railway.app
    │   └── NODE_ENV=production
    └── Domain: https://mold-management-frontend-production.up.railway.app
```

---

## 🎯 다음 단계

1. ✅ 프론트엔드 Railway 배포 완료
2. ✅ 백엔드 CORS 설정 업데이트
3. ✅ 로그인 및 API 연결 테스트
4. 🔄 커스텀 도메인 설정 (선택사항)
5. 🔄 HTTPS 강제 설정 (선택사항)

---

## 📝 참고

- **Railway 문서**: https://docs.railway.app
- **Vite 배포 가이드**: https://vitejs.dev/guide/static-deploy.html
- **프로젝트 README**: [README.md](./README.md)
