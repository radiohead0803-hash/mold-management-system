# 금형관리 전산시스템 - 데이터베이스 스키마

## 개요
- **DBMS**: PostgreSQL
- **Database**: mold_management
- **ORM**: Sequelize
- **타임스탬프**: 모든 테이블에 `created_at`, `updated_at` 자동 관리

---

## 핵심 테이블 (현재 구현됨)

### 1. users (사용자 관리)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- admin, manager, operator
  department VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. molds (금형 정보)
```sql
CREATE TABLE molds (
  id UUID PRIMARY KEY,
  part_number VARCHAR(50) UNIQUE NOT NULL,
  part_name VARCHAR(200) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  item_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100) NOT NULL,
  investment_cost INTEGER NOT NULL,
  progress_stage VARCHAR(20) NOT NULL, -- E0, E1, E2, E3, PPAP, SOP
  manufacturing_method VARCHAR(100) NOT NULL,
  supplier_planned VARCHAR(100) NOT NULL,
  supplier_actual VARCHAR(100),
  completion_planned TIMESTAMP NOT NULL,
  completion_actual TIMESTAMP,
  cvt_quantity INTEGER NOT NULL,
  mold_weight DECIMAL(10,2) NOT NULL,
  hot_runner BOOLEAN DEFAULT false,
  gate_count INTEGER NOT NULL,
  shrinkage_rate DECIMAL(5,3) NOT NULL,
  storage_location VARCHAR(100) NOT NULL,
  storage_position VARCHAR(100) NOT NULL,
  main_image TEXT,
  gallery_images TEXT[],
  attachments TEXT[],
  qr_code TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. daily_checks (일일 점검)
```sql
CREATE TABLE daily_checks (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  checklist_data JSONB NOT NULL,
  photos TEXT[],
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  notes TEXT,
  checked_at TIMESTAMP NOT NULL,
  source VARCHAR(20) NOT NULL, -- qr, manual
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 4. inspections (정기 점검)
```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  due_by_shots INTEGER,
  due_by_date TIMESTAMP,
  status VARCHAR(20) NOT NULL, -- scheduled, in_progress, completed, overdue
  result VARCHAR(20), -- pass, fail, conditional
  notes TEXT,
  photos TEXT[],
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. repairs (수리 이력)
```sql
CREATE TABLE repairs (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  symptom TEXT NOT NULL,
  cause TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  status VARCHAR(20) NOT NULL, -- requested, in_progress, completed, cancelled
  photos TEXT[],
  requested_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 6. shots (타수 기록)
```sql
CREATE TABLE shots (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  count_delta INTEGER NOT NULL,
  count_total INTEGER NOT NULL,
  run_state VARCHAR(20) NOT NULL, -- running, stopped, maintenance
  downtime_reason VARCHAR(200),
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 7. qr_sessions (QR 세션)
```sql
CREATE TABLE qr_sessions (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 8. notifications (알림)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- info, warning, error, success
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 9. audit_logs (감사 로그)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

---

## 추가 필요 테이블 (프론트엔드 기능 기반)

### 10. injection_conditions (사출 조건)
```sql
CREATE TABLE injection_conditions (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  version VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  nozzle_temp DECIMAL(5,1) NOT NULL,
  cylinder1_temp DECIMAL(5,1) NOT NULL,
  cylinder2_temp DECIMAL(5,1) NOT NULL,
  cylinder3_temp DECIMAL(5,1) NOT NULL,
  mold_temp DECIMAL(5,1) NOT NULL,
  injection_pressure DECIMAL(6,1) NOT NULL,
  holding_pressure DECIMAL(6,1) NOT NULL,
  back_pressure DECIMAL(6,1) NOT NULL,
  injection_speed DECIMAL(6,1) NOT NULL,
  screw_speed DECIMAL(6,1) NOT NULL,
  holding_time DECIMAL(5,2) NOT NULL,
  cooling_time DECIMAL(5,2) NOT NULL,
  cycle_time DECIMAL(5,2) NOT NULL,
  cushion DECIMAL(5,2) NOT NULL,
  material VARCHAR(50),
  material_grade VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 11. mold_transfers (금형 이관)
```sql
CREATE TABLE mold_transfers (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  from_company VARCHAR(100) NOT NULL,
  to_company VARCHAR(100) NOT NULL,
  transfer_reason TEXT NOT NULL,
  transfer_date TIMESTAMP NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- requested, approved, in_transit, completed, rejected
  checklist_data JSONB NOT NULL,
  documents TEXT[],
  notes TEXT,
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 12. lubrication_checks (윤활 점검)
```sql
CREATE TABLE lubrication_checks (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  checklist_data JSONB NOT NULL,
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  photos TEXT[],
  notes TEXT,
  checked_by UUID REFERENCES users(id),
  checked_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 13. hardness_measurements (경도 측정)
```sql
CREATE TABLE hardness_measurements (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  core_material VARCHAR(50),
  cavity_material VARCHAR(50),
  cavity_location VARCHAR(100),
  cavity_image TEXT,
  cavity_measurement1 DECIMAL(5,2),
  cavity_measurement2 DECIMAL(5,2),
  cavity_measurement3 DECIMAL(5,2),
  cavity_average DECIMAL(5,2),
  core_location VARCHAR(100),
  core_image TEXT,
  core_measurement1 DECIMAL(5,2),
  core_measurement2 DECIMAL(5,2),
  core_measurement3 DECIMAL(5,2),
  core_average DECIMAL(5,2),
  measured_by UUID REFERENCES users(id),
  measured_at TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 14. fitting_works (피팅 작업)
```sql
CREATE TABLE fitting_works (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  work_type VARCHAR(50) NOT NULL,
  work_description TEXT NOT NULL,
  before_photos TEXT[],
  after_photos TEXT[],
  measurement_data JSONB,
  status VARCHAR(20) NOT NULL, -- in_progress, completed, on_hold
  worker_id UUID REFERENCES users(id),
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 15. development_progress (개발 진행)
```sql
CREATE TABLE development_progress (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  stage VARCHAR(20) NOT NULL, -- E0, E1, E2, E3, PPAP, SOP
  status VARCHAR(20) NOT NULL, -- in_progress, completed, delayed
  progress_percentage INTEGER DEFAULT 0,
  planned_start_date TIMESTAMP,
  planned_end_date TIMESTAMP,
  actual_start_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  milestone_data JSONB,
  issues TEXT[],
  photos TEXT[],
  documents TEXT[],
  responsible_person UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 16. technical_specs (기술 사양)
```sql
CREATE TABLE technical_specs (
  id UUID PRIMARY KEY,
  mold_id UUID REFERENCES molds(id),
  spec_type VARCHAR(50) NOT NULL, -- manufacturing, technical
  spec_data JSONB NOT NULL,
  drawings TEXT[],
  documents TEXT[],
  version VARCHAR(50),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## ER 다이어그램 관계

```
users (1) ----< (N) molds
users (1) ----< (N) notifications
users (1) ----< (N) injection_conditions
users (1) ----< (N) mold_transfers

molds (1) ----< (N) daily_checks
molds (1) ----< (N) inspections
molds (1) ----< (N) repairs
molds (1) ----< (N) shots
molds (1) ----< (N) qr_sessions
molds (1) ----< (N) injection_conditions
molds (1) ----< (N) mold_transfers
molds (1) ----< (N) lubrication_checks
molds (1) ----< (N) hardness_measurements
molds (1) ----< (N) fitting_works
molds (1) ----< (N) development_progress
molds (1) ----< (N) technical_specs
```

---

## 주요 인덱스 전략

### 검색 최적화
- `users`: username, email, role, is_active
- `molds`: part_number, vehicle_model, manufacturer, progress_stage
- `daily_checks`: mold_id, checked_at, (mold_id + checked_at)
- `shots`: mold_id, recorded_at
- `qr_sessions`: session_token, mold_id, is_active

### 성능 최적화
- JSONB 필드에 GIN 인덱스 고려
- 날짜 범위 검색이 많은 필드에 BRIN 인덱스 고려
- 복합 인덱스로 자주 함께 조회되는 필드 최적화

---

## JSONB 데이터 구조

### daily_checks.checklist_data
```json
{
  "cleanliness": "good" | "bad",
  "rust_prevention": "applied" | "not_applied",
  "cooling_leak": "good" | "bad",
  "gate_wear": "good" | "bad",
  "cavity_damage": "good" | "bad",
  "ejection_pin": "good" | "bad",
  "bolt_tightness": "good" | "bad",
  "slide_operation": "good" | "bad",
  "area_cleanliness": "good" | "bad",
  "surface_temperature": "normal" | "abnormal"
}
```

### mold_transfers.checklist_data
```json
{
  "management": {
    "cleaning_cycle": true,
    "cleaning_grade": true,
    "lubrication_grade": true,
    "injection_spec": true
  },
  "inspection": {
    "product_burr": true,
    "eye_bolt": true,
    "fixing_plate": true,
    "hardness": true,
    "surface_scratch": true,
    "parting_line": true
  }
}
```

### lubrication_checks.checklist_data
```json
{
  "slide_core": { "status": "good" | "bad", "notes": "string" },
  "lifter": { "status": "good" | "bad", "notes": "string" },
  "ejector_pin": { "status": "good" | "bad", "notes": "string" },
  "guide_pin": { "status": "good" | "bad", "notes": "string" }
}
```

---

## ENUM 타입 정의

### users.role
- `admin`: 관리자 (모든 권한)
- `manager`: 관리자 (승인 권한)
- `operator`: 작업자 (기본 권한)

### molds.progress_stage
- `E0`: 초기 설계
- `E1`: 1차 시제품
- `E2`: 2차 시제품
- `E3`: 3차 시제품
- `PPAP`: 양산 승인
- `SOP`: 양산 시작

### inspections.status
- `scheduled`: 예정됨
- `in_progress`: 진행중
- `completed`: 완료
- `overdue`: 지연됨

### inspections.result
- `pass`: 합격
- `fail`: 불합격
- `conditional`: 조건부 합격

### repairs.status
- `requested`: 요청됨
- `in_progress`: 진행중
- `completed`: 완료
- `cancelled`: 취소됨

### shots.run_state
- `running`: 가동중
- `stopped`: 중단됨
- `maintenance`: 정비중

### daily_checks.source
- `qr`: QR 스캔
- `manual`: 수동 입력

### notifications.type
- `info`: 정보
- `warning`: 경고
- `error`: 오류
- `success`: 성공

### audit_logs.action
- `CREATE`: 생성
- `UPDATE`: 수정
- `DELETE`: 삭제

### mold_transfers.status
- `requested`: 요청됨
- `approved`: 승인됨
- `in_transit`: 이송중
- `completed`: 완료
- `rejected`: 거부됨

### fitting_works.status
- `in_progress`: 진행중
- `completed`: 완료
- `on_hold`: 보류

### development_progress.status
- `in_progress`: 진행중
- `completed`: 완료
- `delayed`: 지연됨
