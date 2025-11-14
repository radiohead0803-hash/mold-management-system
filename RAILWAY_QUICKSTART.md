# Railway DB 구축 - 빠른 시작 가이드 ⚡

5분 안에 Railway에 데이터베이스를 구축하는 방법입니다.

---

## 🎯 단계 1: Railway PostgreSQL 생성 (1분)

1. https://railway.app 접속 → GitHub 로그인
2. **"New Project"** → **"Provision PostgreSQL"** 클릭
3. 완료! PostgreSQL이 자동 생성됩니다

---

## 🎯 단계 2: 데이터베이스 초기화 (2분)

1. 생성된 **PostgreSQL** 서비스 클릭
2. **"Data"** 탭 클릭
3. **"Query"** 버튼 클릭
4. 아래 파일 내용을 복사하여 붙여넣기:
   ```
   📁 server/init-database.sql
   ```
5. **"Run Query"** 클릭
6. 성공 메시지 확인! ✅

---

## 🎯 단계 3: 연결 정보 복사 (1분)

1. PostgreSQL 서비스에서 **"Variables"** 탭 클릭
2. **DATABASE_URL** 값 복사
3. 로컬 프로젝트의 `.env` 파일에 붙여넣기:
   ```env
   DATABASE_URL=postgresql://postgres:password@host:port/railway
   ```

---

## 🎯 단계 4: 테스트 (1분)

Railway Data 탭에서 쿼리 실행:

```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 관리자 계정 확인
SELECT username, email, role FROM users;
```

결과가 나오면 성공! 🎉

---

## 📱 다음 단계

### 로컬에서 Railway DB 사용
```powershell
# server 폴더로 이동
cd server

# .env 파일 생성
Copy-Item .env.example .env

# .env 파일 수정
# DATABASE_URL을 Railway 값으로 변경

# 서버 실행
npm run dev
```

### 백엔드를 Railway에 배포
자세한 내용은 `RAILWAY_DEPLOYMENT.md` 참조

---

## 🔑 기본 로그인 정보

- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **첫 로그인 후 반드시 비밀번호 변경!**

---

## 💡 팁

### Railway 무료 플랜
- 월 $5 크레딧 제공
- 신용카드 등록 불필요
- 소규모 프로젝트에 충분

### 데이터베이스 접속 도구
Railway DB는 외부 접속 가능:
- **pgAdmin**
- **DBeaver**
- **DataGrip**
- **VS Code PostgreSQL 확장**

연결 정보는 Railway Variables 탭에서 확인!

---

## ❓ 문제 해결

### "Query failed" 오류
- SQL 스크립트를 처음부터 끝까지 전체 복사했는지 확인
- 다시 실행해도 안전함 (IF NOT EXISTS 사용)

### 연결 오류
- DATABASE_URL이 정확히 복사되었는지 확인
- 따옴표나 공백이 없는지 확인

---

**완료! 이제 Railway에서 PostgreSQL을 사용할 수 있습니다! 🚀**

더 자세한 배포 가이드는 `RAILWAY_DEPLOYMENT.md`를 참조하세요.
