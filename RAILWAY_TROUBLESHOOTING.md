# Railway 배포 문제 해결 가이드

## ❌ 빌드 오류: "tsc: not found"

### 오류 메시지
```
sh: 1: tsc: not found
ERROR: failed to build: failed to solve: process "npm run build" did not complete successfully: exit code: 127
```

### 원인
TypeScript 컴파일러(`tsc`)가 `devDependencies`에 있어서 프로덕션 빌드 시 설치되지 않음

### 해결 방법

#### ✅ 방법 1: nixpacks.toml 사용 (권장)
프로젝트 루트에 `nixpacks.toml` 파일이 이미 생성되어 있습니다.

```toml
[phases.install]
cmds = [
  'npm ci --include=dev'
]
```

이 설정으로 devDependencies도 설치됩니다.

#### ✅ 방법 2: Railway 설정에서 Install Command 변경
1. Railway 서비스 → **Settings** 탭
2. **Install Command** 찾기
3. 다음으로 변경:
   ```
   npm ci --include=dev
   ```

#### ✅ 방법 3: package.json 수정 (이미 적용됨)
`client/package.json`에서 빌드에 필요한 패키지를 `dependencies`로 이동:
- `typescript`
- `vite`
- `@vitejs/plugin-react`

---

## ❌ 데이터베이스 연결 오류

### 오류 메시지
```
Error: connect ECONNREFUSED
Error: getaddrinfo ENOTFOUND
```

### 해결 방법

1. **환경 변수 확인**
   - Railway 서비스 → **Variables** 탭
   - `DATABASE_URL` 또는 `DB_HOST`, `DB_PORT` 등이 올바른지 확인

2. **PostgreSQL 서비스 연결**
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   - `${{Postgres.DATABASE_URL}}` 형식으로 참조

3. **PostgreSQL 서비스 실행 확인**
   - Railway 대시보드에서 PostgreSQL 서비스가 "Active" 상태인지 확인

---

## ❌ CORS 오류

### 오류 메시지
```
Access to fetch at 'https://api.railway.app' from origin 'https://app.vercel.app' 
has been blocked by CORS policy
```

### 해결 방법

1. **백엔드 환경 변수 설정**
   ```env
   CLIENT_URL=https://your-frontend.vercel.app
   ```

2. **여러 도메인 허용** (필요시)
   ```env
   CLIENT_URL=https://app1.vercel.app,https://app2.vercel.app
   ```

3. **서버 코드 확인**
   `server/src/index.ts` 또는 `server/simple-server.js`에서:
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true
   }));
   ```

---

## ❌ 파일 업로드 실패

### 오류 메시지
```
Error: ENOENT: no such file or directory
Error: EROFS: read-only file system
```

### 원인
Railway는 임시 파일 시스템을 사용하며, 재배포 시 파일이 삭제됨

### 해결 방법

#### 권장: 외부 스토리지 사용
1. **Cloudinary** (이미지)
   ```bash
   npm install cloudinary
   ```

2. **AWS S3** (모든 파일)
   ```bash
   npm install @aws-sdk/client-s3
   ```

3. **환경 변수 추가**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

---

## ❌ 빌드 타임아웃

### 오류 메시지
```
Build exceeded maximum time limit
```

### 해결 방법

1. **node_modules 캐싱 활성화**
   `nixpacks.toml`에 추가:
   ```toml
   [phases.install]
   cacheDirectories = ['node_modules']
   ```

2. **불필요한 빌드 제거**
   - 프론트엔드와 백엔드를 별도 서비스로 분리
   - 백엔드만 Railway에 배포

3. **빌드 최적화**
   ```json
   "scripts": {
     "build": "tsc --skipLibCheck"
   }
   ```

---

## ❌ 환경 변수가 적용되지 않음

### 해결 방법

1. **변수 추가 후 재배포**
   - Railway는 환경 변수 변경 시 자동 재배포하지 않음
   - **Settings** → **Redeploy** 클릭

2. **변수 이름 확인**
   - 대소문자 구분
   - 공백 없이 입력

3. **참조 형식 확인**
   ```env
   # PostgreSQL 서비스 참조
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # 직접 입력
   JWT_SECRET=my-secret-key
   ```

---

## ❌ 포트 바인딩 오류

### 오류 메시지
```
Error: listen EADDRINUSE: address already in use :::5000
```

### 해결 방법

1. **Railway의 PORT 환경 변수 사용**
   ```javascript
   const PORT = process.env.PORT || 5000;
   ```

2. **Railway 자동 할당 포트 사용**
   - Railway는 자동으로 `PORT` 환경 변수를 설정
   - 하드코딩된 포트 제거

---

## ❌ 데이터베이스 마이그레이션 실패

### 해결 방법

1. **Railway Data 탭에서 수동 실행**
   - PostgreSQL 서비스 → **Data** 탭
   - `server/init-database.sql` 내용 복사 & 실행

2. **로컬에서 Railway DB에 연결**
   ```powershell
   # Railway DATABASE_URL 복사
   $env:DATABASE_URL="postgresql://..."
   
   # SQL 실행
   psql $env:DATABASE_URL -f server/init-database.sql
   ```

3. **빌드 스크립트에 추가**
   ```json
   "scripts": {
     "build": "npm run migrate && npm run compile",
     "migrate": "node scripts/migrate.js"
   }
   ```

---

## ❌ 메모리 부족 오류

### 오류 메시지
```
JavaScript heap out of memory
```

### 해결 방법

1. **Node.js 메모리 증가**
   `package.json`:
   ```json
   "scripts": {
     "build": "NODE_OPTIONS='--max-old-space-size=4096' npm run compile"
   }
   ```

2. **Railway 플랜 업그레이드**
   - 무료 플랜: 512MB RAM
   - Pro 플랜: 더 많은 메모리

---

## 🔍 디버깅 팁

### 1. 로그 확인
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 실시간 로그
railway logs
```

### 2. 로컬에서 프로덕션 빌드 테스트
```powershell
# 환경 변수 설정
$env:NODE_ENV="production"
$env:DATABASE_URL="your-railway-db-url"

# 빌드 테스트
npm run build

# 실행 테스트
npm start
```

### 3. Railway Shell 접속
Railway 서비스 → **Settings** → **Service Shell**

---

## 📞 추가 지원

- **Railway 문서**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **GitHub Issues**: 프로젝트 저장소에 이슈 생성

---

## ✅ 배포 체크리스트

배포 전 확인사항:
- [ ] `nixpacks.toml` 파일 존재
- [ ] `client/package.json`에 TypeScript가 dependencies에 있음
- [ ] `.gitignore`에 `.env` 포함
- [ ] 환경 변수 모두 설정
- [ ] PostgreSQL 서비스 실행 중
- [ ] 데이터베이스 초기화 완료
- [ ] CORS 설정 확인
- [ ] 로컬에서 프로덕션 빌드 테스트 완료

배포 후 확인사항:
- [ ] 빌드 로그 확인
- [ ] 런타임 로그 확인
- [ ] API 엔드포인트 테스트
- [ ] 데이터베이스 연결 확인
- [ ] 프론트엔드 연동 확인
