# Railway 업데이트 가이드

## 현재 상태
✅ 최신 커밋이 GitHub에 푸시됨 (3016434)
- 테스트용 QR 코드 기반 금형 데이터 추가 (M-2024-001 ~ M-2024-006)

## Railway 자동 배포 확인 방법

### 1. Railway 대시보드에서 확인
1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. 프로젝트 선택
3. **Deployments** 탭에서 배포 상태 확인
   - 🟢 **Success**: 배포 완료
   - 🟡 **Building**: 빌드 중
   - 🔴 **Failed**: 배포 실패

### 2. GitHub Actions 확인 (설정된 경우)
1. GitHub 저장소 접속
2. **Actions** 탭 확인
3. 최근 워크플로우 실행 상태 확인

## Railway CLI 설치 (선택사항)

Railway CLI를 설치하면 터미널에서 직접 배포 상태를 확인할 수 있습니다.

### Windows (PowerShell)
```powershell
# Scoop 사용
scoop install railway

# 또는 npm 사용
npm install -g @railway/cli
```

### 설치 후 사용법
```bash
# Railway 로그인
railway login

# 프로젝트 연결
railway link

# 배포 상태 확인
railway status

# 로그 확인
railway logs

# 수동 배포 (필요시)
railway up
```

## 자동 배포가 작동하지 않는 경우

### 1. GitHub 연결 확인
- Railway Dashboard → Settings → GitHub
- 저장소가 올바르게 연결되어 있는지 확인

### 2. 배포 트리거 설정 확인
- Railway Dashboard → Settings → Deployments
- **Deploy on Push** 옵션이 활성화되어 있는지 확인
- **Branch**: `main` 또는 `master`로 설정되어 있는지 확인

### 3. 빌드 설정 확인
Railway Dashboard → Settings → Build에서:

#### 백엔드 (서버)
```
Build Command: cd server && npm install && npm run build
Start Command: cd server && npm start
Root Directory: /
```

#### 프론트엔드 (클라이언트)
```
Build Command: cd client && npm install && npm run build
Start Command: cd client && npm run preview
Root Directory: /
```

## 수동 배포 방법

Railway CLI가 설치되어 있지 않은 경우:

### 방법 1: 빈 커밋으로 재배포 트리거
```bash
git commit --allow-empty -m "Trigger Railway deployment"
git push origin main
```

### 방법 2: Railway Dashboard에서 수동 배포
1. Railway Dashboard 접속
2. 프로젝트 선택
3. **Deployments** 탭
4. **Deploy** 버튼 클릭
5. 배포할 커밋 선택

## 배포 확인

### 백엔드 API 확인
```bash
# Health check
curl https://your-backend-url.railway.app/health

# API 버전 확인
curl https://your-backend-url.railway.app/api
```

### 프론트엔드 확인
브라우저에서 프론트엔드 URL 접속:
```
https://your-frontend-url.railway.app
```

## 현재 배포된 기능

### 최신 업데이트 (커밋 3016434)
✅ 테스트용 QR 코드 금형 데이터
- M-2024-001: 스마트폰 케이스 (정상)
- M-2024-002: 자동차 부품 (정상)
- M-2024-003: 플라스틱 용기 (주의)
- M-2024-004: 전자부품 (주의)
- M-2024-005: 의료기기 (긴급)
- M-2024-006: 가전제품 (긴급)

### 테스트 방법
1. 프론트엔드 접속
2. 작업자 페이지로 이동
3. QR 코드 스캔 기능 테스트
4. M-2024-001 ~ M-2024-006 입력하여 테스트

## 문제 해결

### 배포가 실패하는 경우
1. Railway Dashboard에서 로그 확인
2. 빌드 에러 메시지 확인
3. 환경 변수 설정 확인
4. 데이터베이스 연결 확인

### 로그 확인 방법
- Railway Dashboard → 프로젝트 → **Logs** 탭
- 실시간 로그 스트리밍 확인

## 환경 변수 확인

Railway Dashboard → Settings → Variables에서 다음 변수들이 설정되어 있는지 확인:

### 백엔드
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
CREATE_SAMPLE_DATA=true  # 테스트 데이터 생성
```

### 프론트엔드
```
VITE_API_URL=https://your-backend-url.railway.app
```

## 참고 문서
- [Railway 공식 문서](https://docs.railway.app/)
- [Railway GitHub 연동](https://docs.railway.app/deploy/github)
- [Railway 환경 변수](https://docs.railway.app/develop/variables)
