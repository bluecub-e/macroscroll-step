# Macroscroll Step For OVSE - 배포 가이드 (Vercel + PostgreSQL)

## 1. Vercel 프로젝트 설정

### 1-1. Vercel 가입 및 프로젝트 생성
1. [Vercel](https://vercel.com)에 로그인하고 대시보드에서 **Add New... > Project** 클릭
2. GitHub 리포지토리를 연결하여 프로젝트 생성

### 1-2. Vercel Postgres 데이터베이스 생성
1. Vercel 프로젝트 대시보드 상단 탭에서 **Storage** 클릭
2. **Create Database** -> **Postgres** 선택 -> **Create** 클릭
3. 생성 완료 후 **.env.local** 탭을 클릭하여 환경 변수 확인
   - `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` 등
   - **Show Secret**을 눌러 값을 복사하거나, **Pull .env** 명령어로 로컬에 가져올 수 있음

### 1-3. 환경 변수 설정
Vercel 프로젝트 설정 > **Settings > Environment Variables**에 다음 변수를 추가합니다.
- `DATABASE_URL`: Postgres 연결 URL (예: `postgres://user:password@host:5432/dbname?sslmode=require`)

## 2. 코드 베이스 준비

### 2-1. Prisma 스키마 변경 (완료됨)
`prisma/schema.prisma` 파일이 `provider = "postgresql"`로 설정되어 있습니다.

### 2-2. 마이그레이션 실행
로컬 터미널에서 **Vercel Postgres에 연결된 상태**로 마이그레이션을 실행해야 합니다.

1. 로컬 `.env` 파일을 수정하여 Postgres 접속 정보를 입력합니다.
   ```env
   # .env 예시
   DATABASE_URL="postgres://user:password@host:5432/dbname?sslmode=require"
   ```
2. 마이그레이션 실행:
   ```bash
   npx prisma migrate dev --name init_postgres
   ```
   *주의: 기존 SQLite 데이터(`dev.db`)는 사라지며, 새 DB에 테이블이 생성됩니다.*

3. 변경 사항을 GitHub에 푸시하면 Vercel이 자동으로 재배포합니다.

## 3. 상시 시뮬레이션 설정 (외부 Cron)

Vercel의 기본 Cron은 실행 횟수 제한이 있으므로, 외부 무료 서비스를 이용하여 시뮬레이션을 돌립니다.

### 3-1. cron-job.org 가입 및 설정
1. [cron-job.org](https://cron-job.org) 회원가입 (무료)
2. **Create Cronjob** 클릭
3. **URL**: `https://당신의-프로젝트-주소.vercel.app/api/stocks`
4. **Execution schedule**: `Every 1 minute` 선택
5. **Create** 저장

이제 1분마다 `/api/stocks`가 호출되어 주가 시뮬레이션이 백그라운드에서 계속 진행됩니다.
(사용자가 접속하지 않아도 주가가 변동하고 기록이 쌓입니다)

## 4. 로컬 개발 팁
- 로컬에서도 Vercel Postgres에 연결해서 개발하면 데이터가 동기화되어 편리합니다.
- 인터넷 연결이 필요하며, 레이턴시가 발생할 수 있습니다.
- 로컬 전용으로 Docker 등에 PostgreSQL을 띄워 사용하려면 `.env`만 로컬 DB 주소로 바꿔주면 됩니다.
