# Git 및 Railway 배포 가이드

이 가이드는 금형관리 전산시스템을 Git에 올리고 Railway로 배포하는 전체 과정을 설명합니다.

---

## 📋 목차

1. [Git 저장소 설정](#1-git-저장소-설정)
2. [코드 커밋 및 푸시](#2-코드-커밋-및-푸시)
3. [Railway 배포](#3-railway-배포)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [배포 확인](#5-배포-확인)

---

## 1. Git 저장소 설정

### 1.1 GitHub 저장소 생성

1. https://github.com 접속 및 로그인
2. **"New repository"** 클릭
3. 저장소 정보 입력:
   - **Repository name**: `mold-management-system`
   - **Description**: `금형관리 전산화 시스템`
   - **Visibility**: Private 또는 Public 선택
   - ⚠️ **"Initialize this repository with a README"는 체크하지 마세요**
4. **"Create repository"** 클릭

### 1.2 로컬 Git 초기화 (이미 완료된 경우 건너뛰기)

프로젝트 폴더에서 PowerShell을 열고:

```powershell
# 현재 디렉토리 확인
cd "c:\Users\admin\Documents\Wind surf work\10. 금형관리 전산시스템\Ver03"

# Git 초기화 (이미 .git 폴더가 있으면 건너뛰기)
git init
```

---

## 2. 코드 커밋 및 푸시

### 2.1 Git 사용자 정보 설정 (최초 1회만)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.2 변경사항 확인

```powershell
# 변경된 파일 확인
git status

# .gitignore가 제대로 작동하는지 확인
# node_modules, .env 등이 목록에 없어야 합니다
```

### 2.3 파일 추가 및 커밋

```powershell
# 모든 파일 스테이징
git add .

# 커밋 생성
git commit -m "Initial commit: 금형관리 전산시스템 with Railway support"
```

### 2.4 GitHub 원격 저장소 연결

GitHub에서 생성한 저장소 URL을 사용:

```powershell
# 원격 저장소 추가 (본인의 GitHub 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/mold-management-system.git

# 기본 브랜치를 main으로 설정
git branch -M main

# 코드 푸시
git push -u origin main
```

### 2.5 푸시 확인

GitHub 저장소 페이지를 새로고침하여 코드가 업로드되었는지 확인합니다.

---

## 3. Railway 배포

### 3.1 Railway 계정 생성 및 로그인

1. https://railway.app 접속
2. **"Login"** 클릭
3. GitHub 계정으로 로그인

### 3.2 PostgreSQL 데이터베이스 생성

1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Provision PostgreSQL"** 선택
3. PostgreSQL 인스턴스가 자동으로 생성됩니다

### 3.3 백엔드 서버 배포

1. 같은 프로젝트에서 **"New"** 버튼 클릭
2. **"Deploy from GitHub repo"** 선택
3. 저장소 선택: `YOUR_USERNAME/mold-management-system`
4. **"Deploy Now"** 클릭

### 3.4 서비스 설정 확인

배포된 서비스를 클릭하고 **"Settings"** 탭에서 확인:

- **Root Directory**: (비워두기 - nixpacks.toml이 자동 처리)
- **Build Command**: `npm run build` (자동 설정됨)
- **Start Command**: `npm start` (자동 설정됨)

> 💡 `nixpacks.toml` 파일이 있어서 Railway가 자동으로 빌드 설정을 감지합니다.

---

## 4. 환경 변수 설정

### 4.1 Railway 환경 변수 추가

백엔드 서비스의 **"Variables"** 탭에서 다음 변수들을 추가:

#### 필수 환경 변수

```env
# Database (PostgreSQL 서비스와 자동 연결)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration (⚠️ 반드시 변경하세요!)
JWT_SECRET=your-super-secret-production-key-change-this-to-random-string
JWT_EXPIRES_IN=24h

# CORS (프론트엔드 배포 후 업데이트)
CLIENT_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

#### 환경 변수 설명

- **DATABASE_URL**: Railway PostgreSQL과 자동 연결 (`${{Postgres.DATABASE_URL}}` 사용)
- **NODE_ENV**: 프로덕션 환경 설정
- **JWT_SECRET**: 보안을 위해 랜덤한 긴 문자열로 변경 필요
- **CLIENT_URL**: 프론트엔드 배포 후 실제 URL로 업데이트

### 4.2 JWT_SECRET 생성 방법

PowerShell에서 랜덤 문자열 생성:

```powershell
# 랜덤 문자열 생성
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

생성된 문자열을 `JWT_SECRET` 값으로 사용하세요.

---

## 5. 배포 확인

### 5.1 데이터베이스 초기화

Railway PostgreSQL 서비스에서:

1. **"Data"** 탭 클릭
2. **"Query"** 버튼 클릭
3. `server/init-database.sql` 파일 내용 전체를 복사하여 붙여넣기
4. **"Run Query"** 실행

### 5.2 백엔드 API 테스트

1. 백엔드 서비스의 **"Settings"** > **"Domains"** 에서 URL 확인
2. 브라우저에서 접속:
   ```
   https://your-backend.up.railway.app/health
   ```
3. 정상 응답 확인:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-11-15T03:37:00.000Z"
   }
   ```

### 5.3 로그 확인

Railway 서비스의 **"Deployments"** 탭에서:

- 빌드 로그 확인
- 런타임 로그 확인
- 에러가 없는지 확인

예상 로그:
```
✅ Database connection established successfully.
✅ Database synchronized (production mode).
🚀 Server running on port 5000
📊 Environment: production
🌐 Client URL: http://localhost:3000
🗄️  Database: Railway PostgreSQL
```

---

## 6. 프론트엔드 배포 (Vercel)

### 6.1 Vercel 배포

1. https://vercel.com 접속 및 로그인
2. **"New Project"** 클릭
3. GitHub 저장소 선택: `YOUR_USERNAME/mold-management-system`
4. **Framework Preset**: Vite 선택
5. **Root Directory**: `client` 입력
6. **Environment Variables** 추가:
   ```env
   VITE_API_URL=https://your-backend.up.railway.app
   ```
7. **"Deploy"** 클릭

### 6.2 백엔드 CORS 업데이트

프론트엔드 배포 완료 후:

1. Railway 백엔드 서비스로 돌아가기
2. **"Variables"** 탭에서 `CLIENT_URL` 업데이트:
   ```env
   CLIENT_URL=https://your-app.vercel.app
   ```
3. 서비스가 자동으로 재배포됩니다

---

## 7. 추가 업데이트 배포

코드를 수정한 후 배포하는 방법:

```powershell
# 변경사항 확인
git status

# 파일 추가
git add .

# 커밋
git commit -m "Update: 변경 내용 설명"

# 푸시
git push origin main
```

Railway는 GitHub에 푸시하면 자동으로 재배포됩니다.

---

## 8. 보안 체크리스트

배포 후 반드시 확인:

- [ ] `.env` 파일이 Git에 업로드되지 않았는지 확인
- [ ] `JWT_SECRET`을 랜덤한 값으로 변경했는지 확인
- [ ] 기본 관리자 비밀번호 변경 (`admin` / `admin123`)
- [ ] `CLIENT_URL`이 실제 프론트엔드 URL로 설정되었는지 확인
- [ ] HTTPS 사용 확인
- [ ] 데이터베이스 백업 계획 수립

---

## 9. 문제 해결

### 데이터베이스 연결 오류

**증상**: `Error: connect ECONNREFUSED`

**해결책**:
1. Railway Variables에서 `DATABASE_URL` 확인
2. PostgreSQL 서비스가 실행 중인지 확인
3. `${{Postgres.DATABASE_URL}}` 형식이 정확한지 확인

### CORS 오류

**증상**: `Access to fetch has been blocked by CORS policy`

**해결책**:
1. 백엔드 `CLIENT_URL` 환경 변수 확인
2. 프론트엔드 URL과 정확히 일치하는지 확인 (trailing slash 주의)
3. Railway 서비스 재배포

### 빌드 실패

**증상**: Railway에서 빌드가 실패함

**해결책**:
1. `package.json`의 `scripts` 확인
2. `nixpacks.toml` 설정 확인
3. Railway 로그에서 구체적인 에러 메시지 확인

---

## 10. 유용한 명령어

### Git 명령어

```powershell
# 현재 상태 확인
git status

# 변경 이력 확인
git log --oneline

# 원격 저장소 확인
git remote -v

# 브랜치 확인
git branch
```

### Railway CLI (선택사항)

```powershell
# Railway CLI 설치
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

---

## 📞 지원

문제가 발생하면:

1. Railway 로그 확인
2. GitHub Issues에 문제 보고
3. [Railway 문서](https://docs.railway.app) 참조
4. [Railway 커뮤니티](https://discord.gg/railway) 참조

---

**배포 완료! 🎉**

이제 금형관리 전산시스템이 온라인에서 운영됩니다.
