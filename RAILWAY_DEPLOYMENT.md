# Railway 배포 가이드

이 가이드는 금형관리 전산시스템을 Railway에 배포하는 방법을 설명합니다.

## 📋 사전 준비

- GitHub 계정
- Railway 계정 (https://railway.app)
- 프로젝트가 GitHub에 푸시되어 있어야 함

---

## 🗄️ 1단계: PostgreSQL 데이터베이스 생성

### 1.1 Railway 프로젝트 생성
1. https://railway.app 접속
2. **"New Project"** 클릭
3. **"Provision PostgreSQL"** 선택
4. 자동으로 PostgreSQL 인스턴스가 생성됩니다

### 1.2 데이터베이스 연결 정보 확인
1. 생성된 **PostgreSQL** 서비스 클릭
2. **"Variables"** 탭 선택
3. 다음 정보 복사:
   ```
   DATABASE_URL
   PGHOST
   PGPORT
   PGUSER
   PGPASSWORD
   PGDATABASE
   ```

### 1.3 데이터베이스 초기화

#### 방법 A: Railway 웹 콘솔 사용 (추천)
1. PostgreSQL 서비스에서 **"Data"** 탭 클릭
2. **"Query"** 버튼 클릭
3. `server/init-database.sql` 파일 내용 전체를 복사하여 붙여넣기
4. **"Run Query"** 실행
5. 성공 메시지 확인

#### 방법 B: 로컬에서 psql 사용
```powershell
# Railway DATABASE_URL 복사 후
$env:DATABASE_URL="postgresql://postgres:password@host:port/railway"

# SQL 파일 실행
psql $env:DATABASE_URL -f server/init-database.sql
```

---

## 🚀 2단계: 백엔드 서버 배포

### 2.1 GitHub에서 배포
1. Railway 대시보드에서 **"New"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. 저장소 선택: `radiohead0803-hash/mold-management-system`
4. **"Deploy Now"** 클릭

### 2.2 서비스 설정
1. 배포된 서비스 클릭
2. **"Settings"** 탭으로 이동
3. **Root Directory** 설정:
   ```
   server
   ```
4. **Install Command** 설정:
   ```
   npm ci --include=dev
   ```
5. **Build Command** 설정:
   ```
   npm run build
   ```
6. **Start Command** 설정:
   ```
   npm start
   ```

> **참고**: 프로젝트 루트에 `nixpacks.toml` 파일이 있어서 자동으로 설정됩니다.

### 2.3 환경 변수 설정
1. **"Variables"** 탭 클릭
2. 다음 변수들을 추가:

```env
# Database (PostgreSQL 서비스와 연결)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 또는 개별 변수로
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS (프론트엔드 URL)
CLIENT_URL=https://your-frontend-url.vercel.app

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 2.4 도메인 확인
1. **"Settings"** 탭에서 **"Domains"** 섹션 확인
2. Railway가 자동으로 생성한 도메인 복사
   - 예: `https://your-app.up.railway.app`

---

## 🌐 3단계: 프론트엔드 배포 (Vercel 추천)

### 3.1 Vercel에 배포
1. https://vercel.com 접속
2. **"New Project"** 클릭
3. GitHub 저장소 선택
4. **Root Directory** 설정: `client`
5. **Environment Variables** 추가:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app
   ```
6. **"Deploy"** 클릭

### 3.2 백엔드 CORS 업데이트
1. Railway 백엔드 서비스로 돌아가기
2. **"Variables"** 탭에서 `CLIENT_URL` 업데이트:
   ```env
   CLIENT_URL=https://your-app.vercel.app
   ```

---

## ✅ 4단계: 배포 확인

### 4.1 데이터베이스 확인
Railway PostgreSQL Data 탭에서 쿼리 실행:
```sql
-- 테이블 목록 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 관리자 계정 확인
SELECT username, email, role FROM users;
```

### 4.2 백엔드 API 테스트
브라우저에서 접속:
```
https://your-backend.up.railway.app/health
```

### 4.3 프론트엔드 접속
```
https://your-app.vercel.app
```

기본 관리자 계정으로 로그인:
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **반드시 비밀번호를 변경하세요!**

---

## 🔧 추가 설정

### Railway CLI 설치 (선택사항)
```powershell
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 로그 확인
railway logs

# 환경 변수 확인
railway variables
```

### 데이터베이스 백업
1. Railway PostgreSQL 서비스 클릭
2. **"Data"** 탭에서 데이터 확인
3. 정기적으로 백업 수행:
   ```powershell
   pg_dump $env:DATABASE_URL > backup.sql
   ```

### 로그 모니터링
1. Railway 서비스 클릭
2. **"Deployments"** 탭에서 로그 확인
3. 실시간 로그 보기

---

## 💰 비용 정보

### Railway 무료 플랜
- **월 $5 크레딧** 제공
- PostgreSQL + 백엔드 서버 운영 가능
- 소규모 프로젝트에 충분

### Vercel 무료 플랜
- 무제한 배포
- 자동 HTTPS
- 글로벌 CDN

---

## 🐛 문제 해결

### 데이터베이스 연결 오류
```
Error: connect ECONNREFUSED
```
**해결책**: 
- Railway Variables에서 DATABASE_URL이 올바른지 확인
- PostgreSQL 서비스가 실행 중인지 확인

### CORS 오류
```
Access to fetch has been blocked by CORS policy
```
**해결책**:
- 백엔드 `CLIENT_URL` 환경 변수 확인
- 프론트엔드 URL과 정확히 일치하는지 확인

### 파일 업로드 오류
**해결책**:
- Railway는 임시 파일 시스템 사용
- 프로덕션 환경에서는 AWS S3, Cloudinary 등 사용 권장

---

## 📞 지원

문제가 발생하면:
1. Railway 로그 확인
2. GitHub Issues에 문제 보고
3. Railway 커뮤니티 포럼 참조

---

## 🔐 보안 체크리스트

배포 후 반드시 확인:
- [ ] 기본 관리자 비밀번호 변경
- [ ] JWT_SECRET 변경
- [ ] 데이터베이스 백업 설정
- [ ] HTTPS 사용 확인
- [ ] 환경 변수 보안 확인
- [ ] CORS 설정 확인

---

**배포 완료! 🎉**

이제 금형관리 전산시스템을 온라인에서 사용할 수 있습니다.
