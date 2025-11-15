# 배포 체크리스트

Git 및 Railway 배포 전 확인 사항입니다.

---

## ✅ 배포 전 체크리스트

### 1. 코드 준비 상태

- [x] `.gitignore` 파일이 올바르게 설정됨
  - `node_modules/` 제외
  - `.env` 파일 제외
  - `dist/`, `build/` 제외
  - 업로드 파일 제외

- [x] 데이터베이스 연결 설정이 Railway 지원
  - `DATABASE_URL` 환경 변수 우선 사용
  - SSL 연결 지원 (프로덕션)
  - 개별 환경 변수 폴백 지원

- [x] 환경 변수 예시 파일 준비
  - `server/.env.example` 파일 존재
  - 모든 필수 환경 변수 문서화
  - Railway 설정 예시 포함

- [x] 프로덕션 환경 설정
  - `NODE_ENV=production` 지원
  - 데이터베이스 동기화 로직 개선
  - 로그 레벨 조정

### 2. Git 저장소 준비

- [ ] GitHub 계정 준비
- [ ] 새 저장소 생성 (또는 기존 저장소 확인)
- [ ] Git 사용자 정보 설정
  ```powershell
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

### 3. 민감 정보 확인

- [ ] `.env` 파일이 Git에 포함되지 않는지 확인
  ```powershell
  git status
  # .env 파일이 목록에 없어야 함
  ```

- [ ] 하드코딩된 비밀번호나 API 키가 없는지 확인
- [ ] 데이터베이스 연결 정보가 환경 변수로 관리되는지 확인

### 4. 빌드 테스트

- [ ] 로컬에서 프로덕션 빌드 테스트
  ```powershell
  # 서버 빌드
  cd server
  npm run build
  
  # 클라이언트 빌드
  cd ../client
  npm run build
  ```

- [ ] 빌드 에러가 없는지 확인
- [ ] TypeScript 타입 에러가 없는지 확인

---

## 📝 Git 커밋 및 푸시

### 1. 변경사항 확인

```powershell
cd "c:\Users\admin\Documents\Wind surf work\10. 금형관리 전산시스템\Ver03"
git status
```

### 2. 파일 추가 및 커밋

```powershell
# 모든 변경사항 추가
git add .

# 커밋 생성
git commit -m "feat: Railway 배포 지원 추가

- DATABASE_URL 환경 변수 지원
- 프로덕션 환경 설정 개선
- .gitignore 업데이트
- 배포 가이드 문서 추가"
```

### 3. GitHub에 푸시

```powershell
# 원격 저장소 추가 (최초 1회)
git remote add origin https://github.com/YOUR_USERNAME/mold-management-system.git

# 브랜치 설정
git branch -M main

# 푸시
git push -u origin main
```

---

## 🚀 Railway 배포

### 1. Railway 계정 및 프로젝트

- [ ] Railway 계정 생성 (https://railway.app)
- [ ] GitHub 계정 연동
- [ ] 새 프로젝트 생성

### 2. PostgreSQL 데이터베이스

- [ ] PostgreSQL 서비스 프로비저닝
- [ ] 데이터베이스 연결 정보 확인
- [ ] `init-database.sql` 실행

### 3. 백엔드 서버 배포

- [ ] GitHub 저장소에서 배포
- [ ] 빌드 설정 확인 (nixpacks.toml 자동 감지)
- [ ] 환경 변수 설정:
  - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
  - `NODE_ENV=production`
  - `PORT=5000`
  - `JWT_SECRET=랜덤-문자열`
  - `CLIENT_URL=프론트엔드-URL`

### 4. 배포 확인

- [ ] 빌드 로그 확인
- [ ] 런타임 로그 확인
- [ ] Health check 엔드포인트 테스트
  ```
  https://your-backend.up.railway.app/health
  ```

---

## 🌐 프론트엔드 배포 (Vercel)

### 1. Vercel 배포

- [ ] Vercel 계정 생성
- [ ] GitHub 저장소 연결
- [ ] Root Directory: `client` 설정
- [ ] 환경 변수 설정:
  - `VITE_API_URL=https://your-backend.up.railway.app`

### 2. CORS 설정 업데이트

- [ ] Railway 백엔드의 `CLIENT_URL` 업데이트
  ```env
  CLIENT_URL=https://your-app.vercel.app
  ```

---

## 🔐 보안 체크리스트

배포 후 반드시 확인:

- [ ] 기본 관리자 비밀번호 변경
  - Username: `admin`
  - Password: `admin123` → 강력한 비밀번호로 변경

- [ ] `JWT_SECRET` 변경
  - 랜덤한 64자 이상의 문자열 사용
  - PowerShell에서 생성:
    ```powershell
    -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    ```

- [ ] 환경 변수 보안 확인
  - Railway Variables에만 저장
  - 코드에 하드코딩 없음

- [ ] HTTPS 사용 확인
  - Railway: 자동 HTTPS
  - Vercel: 자동 HTTPS

- [ ] CORS 설정 확인
  - 허용된 도메인만 접근 가능

---

## 📊 모니터링 및 유지보수

### 배포 후 모니터링

- [ ] Railway 로그 모니터링 설정
- [ ] 에러 알림 설정
- [ ] 데이터베이스 백업 계획 수립

### 정기 점검

- [ ] 주간 로그 확인
- [ ] 월간 데이터베이스 백업
- [ ] 보안 업데이트 확인

---

## 📞 문제 발생 시

1. **Railway 로그 확인**
   - Deployments 탭에서 빌드/런타임 로그 확인

2. **환경 변수 확인**
   - Variables 탭에서 모든 필수 변수 설정 확인

3. **데이터베이스 연결 확인**
   - PostgreSQL 서비스 상태 확인
   - DATABASE_URL 형식 확인

4. **문서 참조**
   - `GIT_DEPLOYMENT_GUIDE.md`: 전체 배포 가이드
   - `RAILWAY_TROUBLESHOOTING.md`: 문제 해결 가이드

---

## 📚 참고 문서

- [GIT_DEPLOYMENT_GUIDE.md](./GIT_DEPLOYMENT_GUIDE.md) - Git 및 Railway 배포 상세 가이드
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Railway 배포 가이드
- [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md) - 빠른 시작 가이드
- [RAILWAY_TROUBLESHOOTING.md](./RAILWAY_TROUBLESHOOTING.md) - 문제 해결 가이드
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 데이터베이스 스키마

---

**배포 준비 완료! 🎉**

위 체크리스트를 순서대로 확인하고 진행하세요.
