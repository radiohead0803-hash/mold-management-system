# Railway 프론트엔드 API 연결 수정 완료

## 문제
Railway 프론트엔드에서 API를 호출할 수 없는 문제가 발생했습니다.

## 원인
대부분의 worker 페이지 파일들이 `http://localhost:5001`로 하드코딩되어 있어, Railway 배포 환경에서 백엔드 API에 접근할 수 없었습니다.

## 해결 방법

### 1. 수정된 파일 목록 (총 23개)
모든 worker 페이지에서 하드코딩된 URL을 `API_BASE_URL`로 변경했습니다:

✅ TransferStatus.tsx
✅ TransferRequest.tsx
✅ TransferChecklist.tsx
✅ TechnicalSpecs.tsx
✅ ShotCountRecord.tsx
✅ RepairStatus.tsx
✅ RepairRequest.tsx
✅ RepairProgress.tsx
✅ PeriodicCheck.tsx
✅ MoldChecklist.tsx
✅ ManufacturingSpecs.tsx
✅ Lubrication.tsx
✅ InjectionRevision.tsx
✅ InjectionConditionsInput.tsx
✅ DailyCheck.tsx
✅ DevelopmentProgress.tsx
✅ HardnessMeasurement.tsx
✅ Cleaning.tsx
✅ CleaningLubrication.tsx
✅ Fitting.tsx
✅ InjectionChangeHistory.tsx
✅ InjectionConditions.tsx
✅ MoldInfo.tsx (이미 수정되어 있었음)

### 2. API 설정 파일
`client/src/config/api.ts`에서 환경 변수를 사용하도록 설정되어 있습니다:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

### 3. Railway 환경 변수 설정 필요

Railway Dashboard에서 프론트엔드 서비스의 환경 변수를 설정해야 합니다:

#### 프론트엔드 환경 변수
```
VITE_API_BASE_URL=https://your-backend-service.railway.app
```

**중요**: 백엔드 서비스의 실제 Railway URL로 교체해야 합니다.

## Railway 환경 변수 설정 방법

### 단계별 가이드

1. **Railway Dashboard 접속**
   - https://railway.app/dashboard

2. **프론트엔드 프로젝트 선택**
   - 금형관리 시스템 프론트엔드 서비스 클릭

3. **Variables 탭 이동**
   - 상단 메뉴에서 **Variables** 클릭

4. **환경 변수 추가**
   - **New Variable** 버튼 클릭
   - Variable Name: `VITE_API_BASE_URL`
   - Variable Value: `https://your-backend-service.railway.app`
   - **Add** 버튼 클릭

5. **재배포**
   - 환경 변수 추가 후 자동으로 재배포됩니다
   - 또는 **Deployments** 탭에서 수동으로 재배포

## 백엔드 URL 확인 방법

1. Railway Dashboard에서 백엔드 서비스 선택
2. **Settings** 탭 클릭
3. **Domains** 섹션에서 Public Domain 확인
4. 예: `mold-management-backend.railway.app`
5. 전체 URL: `https://mold-management-backend.railway.app`

## 로컬 개발 환경 설정

로컬에서 개발할 때는 `.env` 파일을 생성하세요:

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:5001
```

## 테스트 방법

### 1. 브라우저 콘솔 확인
프론트엔드 접속 후 브라우저 개발자 도구(F12)를 열고 Console 탭에서:
```
🌐 API Base URL: https://your-backend-service.railway.app
```
메시지가 표시되는지 확인

### 2. Network 탭 확인
- QR 코드 스캔 또는 금형 정보 조회 시
- Network 탭에서 API 요청 URL 확인
- `https://your-backend-service.railway.app/api/worker/mold/...` 형식이어야 함

### 3. API 응답 확인
- 200 OK 응답이 오는지 확인
- CORS 에러가 없는지 확인

## 문제 해결

### CORS 에러가 발생하는 경우
백엔드의 CORS 설정에 프론트엔드 URL이 포함되어 있는지 확인:

```typescript
// server/src/index.ts
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-service.railway.app'
];
```

### API 호출이 실패하는 경우
1. 백엔드 서비스가 정상 작동하는지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 실제 호출되는 URL 확인

### 환경 변수가 적용되지 않는 경우
1. Railway에서 재배포 필요
2. 빌드 로그에서 환경 변수 확인
3. `VITE_` 접두사가 있는지 확인 (Vite 필수)

## 변경 사항 요약

- ✅ 23개 worker 페이지 파일 수정
- ✅ 하드코딩된 `http://localhost:5001` 제거
- ✅ `API_BASE_URL` 사용으로 통일
- ✅ 환경 변수 기반 설정으로 변경
- ✅ Railway 배포 환경 대응

## 다음 단계

1. Railway 프론트엔드 환경 변수 설정
2. 재배포 확인
3. QR 코드 스캔 기능 테스트
4. 모든 worker 기능 테스트

## 참고
- 모든 변경사항은 Git에 커밋되었습니다
- 백업 파일(.backup, .backup2)은 수정하지 않았습니다
- RepairRequest.tsx의 타입 에러는 기존 코드 문제로 별도 수정 필요
