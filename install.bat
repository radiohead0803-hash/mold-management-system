@echo off
echo ========================================
echo 금형관리 전산화 시스템 설치 스크립트
echo ========================================
echo.

echo [1/4] 루트 의존성 설치 중...
call npm install
if %errorlevel% neq 0 (
    echo 루트 의존성 설치 실패!
    pause
    exit /b 1
)

echo.
echo [2/4] 클라이언트 의존성 설치 중...
cd client
call npm install
if %errorlevel% neq 0 (
    echo 클라이언트 의존성 설치 실패!
    pause
    exit /b 1
)

echo.
echo [3/4] 서버 의존성 설치 중...
cd ..\server
call npm install
if %errorlevel% neq 0 (
    echo 서버 의존성 설치 실패!
    pause
    exit /b 1
)

echo.
echo [4/4] 환경 설정 파일 생성 중...
if not exist .env (
    copy .env.example .env
    echo .env 파일이 생성되었습니다. 필요에 따라 수정하세요.
) else (
    echo .env 파일이 이미 존재합니다.
)

cd ..

echo.
echo ========================================
echo 설치 완료!
echo ========================================
echo.
echo 다음 명령어로 개발 서버를 시작할 수 있습니다:
echo   npm run dev
echo.
echo 또는 개별적으로 실행:
echo   클라이언트: cd client && npm run dev
echo   서버:      cd server && npm run dev
echo.
echo 데이터베이스 설정을 확인하고 PostgreSQL이 실행 중인지 확인하세요.
echo.
pause
