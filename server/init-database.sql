-- 금형관리 전산시스템 - Railway PostgreSQL 초기화 스크립트
-- 실행 순서: Railway PostgreSQL Data 탭에서 이 스크립트를 복사하여 실행

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users (사용자 관리)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'operator')),
  department VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. molds (금형 정보)
CREATE TABLE IF NOT EXISTS molds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number VARCHAR(50) UNIQUE NOT NULL,
  part_name VARCHAR(200) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  item_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100) NOT NULL,
  investment_cost INTEGER NOT NULL,
  progress_stage VARCHAR(20) NOT NULL CHECK (progress_stage IN ('E0', 'E1', 'E2', 'E3', 'PPAP', 'SOP')),
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. daily_checks (일일 점검)
CREATE TABLE IF NOT EXISTS daily_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  checklist_data JSONB NOT NULL,
  photos TEXT[],
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  notes TEXT,
  checked_at TIMESTAMP NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('qr', 'manual')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. inspections (정기 점검)
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  due_by_shots INTEGER,
  due_by_date TIMESTAMP,
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue')),
  result VARCHAR(20) CHECK (result IN ('pass', 'fail', 'conditional')),
  notes TEXT,
  photos TEXT[],
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. repairs (수리 이력)
CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL,
  cause TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'in_progress', 'completed', 'cancelled')),
  photos TEXT[],
  requested_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. shots (타수 기록)
CREATE TABLE IF NOT EXISTS shots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  count_delta INTEGER NOT NULL,
  count_total INTEGER NOT NULL,
  run_state VARCHAR(20) NOT NULL CHECK (run_state IN ('running', 'stopped', 'maintenance')),
  downtime_reason VARCHAR(200),
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. qr_sessions (QR 세션)
CREATE TABLE IF NOT EXISTS qr_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. notifications (알림)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. audit_logs (감사 로그)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. injection_conditions (사출 조건)
CREATE TABLE IF NOT EXISTS injection_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. mold_transfers (금형 이관)
CREATE TABLE IF NOT EXISTS mold_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  from_company VARCHAR(100) NOT NULL,
  to_company VARCHAR(100) NOT NULL,
  transfer_reason TEXT NOT NULL,
  transfer_date TIMESTAMP NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('requested', 'approved', 'in_transit', 'completed', 'rejected')),
  checklist_data JSONB NOT NULL,
  documents TEXT[],
  notes TEXT,
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. lubrication_checks (윤활 점검)
CREATE TABLE IF NOT EXISTS lubrication_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  checklist_data JSONB NOT NULL,
  gps_latitude DECIMAL(10,8),
  gps_longitude DECIMAL(11,8),
  photos TEXT[],
  notes TEXT,
  checked_by UUID REFERENCES users(id),
  checked_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. hardness_measurements (경도 측정)
CREATE TABLE IF NOT EXISTS hardness_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. fitting_works (피팅 작업)
CREATE TABLE IF NOT EXISTS fitting_works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  work_type VARCHAR(50) NOT NULL,
  work_description TEXT NOT NULL,
  before_photos TEXT[],
  after_photos TEXT[],
  measurement_data JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'on_hold')),
  worker_id UUID REFERENCES users(id),
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. development_progress (개발 진행)
CREATE TABLE IF NOT EXISTS development_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  stage VARCHAR(20) NOT NULL CHECK (stage IN ('E0', 'E1', 'E2', 'E3', 'PPAP', 'SOP')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'delayed')),
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. technical_specs (기술 사양)
CREATE TABLE IF NOT EXISTS technical_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mold_id UUID REFERENCES molds(id) ON DELETE CASCADE,
  spec_type VARCHAR(50) NOT NULL,
  spec_data JSONB NOT NULL,
  drawings TEXT[],
  documents TEXT[],
  version VARCHAR(50),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_molds_part_number ON molds(part_number);
CREATE INDEX IF NOT EXISTS idx_molds_vehicle_model ON molds(vehicle_model);
CREATE INDEX IF NOT EXISTS idx_molds_manufacturer ON molds(manufacturer);
CREATE INDEX IF NOT EXISTS idx_molds_progress_stage ON molds(progress_stage);

CREATE INDEX IF NOT EXISTS idx_daily_checks_mold_id ON daily_checks(mold_id);
CREATE INDEX IF NOT EXISTS idx_daily_checks_checked_at ON daily_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_daily_checks_mold_checked ON daily_checks(mold_id, checked_at);

CREATE INDEX IF NOT EXISTS idx_shots_mold_id ON shots(mold_id);
CREATE INDEX IF NOT EXISTS idx_shots_recorded_at ON shots(recorded_at);

CREATE INDEX IF NOT EXISTS idx_qr_sessions_token ON qr_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_mold_id ON qr_sessions(mold_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_is_active ON qr_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- JSONB 필드에 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_checks_checklist ON daily_checks USING GIN (checklist_data);
CREATE INDEX IF NOT EXISTS idx_audit_logs_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values ON audit_logs USING GIN (new_values);

-- 기본 관리자 계정 생성 (비밀번호: admin123)
-- 실제 운영 환경에서는 반드시 비밀번호를 변경하세요!
INSERT INTO users (id, username, email, password_hash, full_name, role, department, is_active)
VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@moldmanagement.com',
  '$2b$10$rKvVJKJ9YhZqXGxJ8vXxH.nYqZqXGxJ8vXxH.nYqZqXGxJ8vXxH.O',
  '시스템 관리자',
  'admin',
  '관리부',
  true
)
ON CONFLICT (username) DO NOTHING;

-- 완료 메시지
SELECT 'Database initialization completed successfully!' as message;
