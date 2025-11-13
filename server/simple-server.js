const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// 미들웨어
app.use(cors({
  origin: function(origin, callback) {
    // 모든 origin 허용 (개발 환경용)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// 추가 CORS 헤더 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// KPI 데이터 API
app.get('/api/dash/kpi', (req, res) => {
  res.json({
    totalMolds: 156,
    checkRate: '87.3%',
    pendingInspections: 12,
    activeRepairs: 3,
    moldsByStatus: {
      production: 141,
      repair: 3,
      inspection: 12
    }
  });
});

// 활동 내역 API
app.get('/api/dash/activities', (req, res) => {
  const { limit = 10 } = req.query;
  
  const activities = [
    {
      id: 'check_1',
      type: 'check',
      message: 'M001-A (엔진 블록 금형) 일상점검 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'completed',
      moldId: 1
    },
    {
      id: 'repair_1',
      type: 'repair',
      message: 'M002-B (범퍼 금형) 수리 요청 접수',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'pending',
      moldId: 2
    },
    {
      id: 'check_2',
      type: 'check',
      message: 'M003-C (도어 패널 금형) 일상점검 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'completed',
      moldId: 3
    },
    {
      id: 'maintenance_1',
      type: 'maintenance',
      message: 'M001-A (엔진 블록 금형) 정기 유지보수 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      status: 'completed',
      moldId: 1
    },
    {
      id: 'alert_1',
      type: 'alert',
      message: 'M004-D (헤드라이트 금형) 온도 이상 감지',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      status: 'warning',
      moldId: 4
    }
  ];
  
  res.json(activities.slice(0, parseInt(limit)));
});

// 금형 위치 데이터 API
app.get('/api/dash/mold-locations', (req, res) => {
  res.json([
    {
      id: 1,
      moldId: 'M-2024-001',
      name: '스마트폰 케이스 금형',
      location: 'A구역-01',
      status: 'in_use',
      x: 100,
      y: 150,
      zone: 'A'
    },
    {
      id: 2,
      moldId: 'M-2024-002',
      name: '자동차 부품 금형',
      location: 'B구역-03',
      status: 'in_use',
      x: 250,
      y: 200,
      zone: 'B'
    },
    {
      id: 3,
      moldId: 'M-2024-003',
      name: '플라스틱 용기 금형',
      location: 'C구역-02',
      status: 'maintenance',
      x: 180,
      y: 300,
      zone: 'C'
    },
    {
      id: 4,
      moldId: 'M-2024-004',
      name: '전자부품 하우징 금형',
      location: 'D구역-05',
      status: 'in_use',
      x: 320,
      y: 180,
      zone: 'D'
    },
    {
      id: 5,
      moldId: 'M-2024-005',
      name: '의료기기 부품 금형',
      location: 'E구역-01',
      status: 'urgent_repair',
      x: 80,
      y: 280,
      zone: 'E'
    }
  ]);
});

// 작업자 타수 기록 등록 API
app.post('/api/worker/shot-record', (req, res) => {
  const shotData = req.body;
  
  const newShotRecord = {
    id: Date.now(),
    recordNumber: `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...shotData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  shotRecords.push(newShotRecord);
  
  // 관리자 알림 생성
  const notification = {
    id: Date.now() + 1,
    type: 'shot_record',
    title: '타수 기록 등록',
    message: `${shotData.moldId} 금형의 타수 기록이 등록되었습니다. (${shotData.shotCount} 타수)`,
    moldId: shotData.moldId,
    operator: shotData.operator,
    priority: shotData.shotCount > 1000 ? 'high' : 'medium',
    isRead: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(notification);
  
  res.status(201).json({
    message: '타수 기록이 성공적으로 등록되었습니다.',
    shotRecord: newShotRecord,
    notification: notification
  });
});

// 작업자 타수 기록 조회 API
app.get('/api/worker/shot-records/:moldId', (req, res) => {
  const { moldId } = req.params;
  const today = new Date().toISOString().split('T')[0];
  
  // 해당 금형의 오늘 타수 기록들 필터링
  const todayRecords = shotRecords.filter(record => 
    record.moldId === moldId && 
    record.createdAt.split('T')[0] === today
  );
  
  res.json({
    records: todayRecords,
    total: todayRecords.length
  });
});

// 관리자 타수 기록 조회 API
app.get('/api/admin/shot-records', (req, res) => {
  const { page = 1, limit = 10, moldId, operator, date } = req.query;
  
  let filteredRecords = [...shotRecords];
  
  // 필터링
  if (moldId) {
    filteredRecords = filteredRecords.filter(record => 
      record.moldId.toLowerCase().includes(moldId.toLowerCase())
    );
  }
  
  if (operator) {
    filteredRecords = filteredRecords.filter(record => 
      record.operator.toLowerCase().includes(operator.toLowerCase())
    );
  }
  
  if (date) {
    filteredRecords = filteredRecords.filter(record => 
      record.createdAt.split('T')[0] === date
    );
  }
  
  // 정렬 (최신순)
  filteredRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 페이지네이션
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
  
  res.json({
    shotRecords: paginatedRecords,
    total: filteredRecords.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredRecords.length / limit)
  });
});

// 타수 기록 통계 API
app.get('/api/admin/shot-statistics', (req, res) => {
  const { moldId, period = 'today' } = req.query;
  
  let filteredRecords = [...shotRecords];
  
  if (moldId) {
    filteredRecords = filteredRecords.filter(record => record.moldId === moldId);
  }
  
  // 기간별 필터링
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  filteredRecords = filteredRecords.filter(record => 
    new Date(record.createdAt) >= startDate
  );
  
  // 통계 계산
  const totalShots = filteredRecords.reduce((sum, record) => sum + record.shotCount, 0);
  const totalDefects = filteredRecords.reduce((sum, record) => sum + (record.defectCount || 0), 0);
  const averageShots = filteredRecords.length > 0 ? Math.round(totalShots / filteredRecords.length) : 0;
  const defectRate = totalShots > 0 ? ((totalDefects / totalShots) * 100).toFixed(2) : 0;
  
  // 시간대별 생산량
  const hourlyProduction = {};
  filteredRecords.forEach(record => {
    const hour = new Date(record.createdAt).getHours();
    hourlyProduction[hour] = (hourlyProduction[hour] || 0) + record.shotCount;
  });
  
  // 작업자별 생산량
  const operatorProduction = {};
  filteredRecords.forEach(record => {
    operatorProduction[record.operator] = (operatorProduction[record.operator] || 0) + record.shotCount;
  });
  
  res.json({
    statistics: {
      totalShots,
      totalDefects,
      averageShots,
      defectRate: parseFloat(defectRate),
      recordCount: filteredRecords.length,
      period
    },
    hourlyProduction,
    operatorProduction,
    records: filteredRecords.slice(0, 10) // 최근 10개 기록
  });
});

// QR 세션 생성 API
app.post('/api/auth/qr-session', (req, res) => {
  const { moldId } = req.body;
  
  if (!moldId) {
    return res.status(400).json({ error: '금형 ID가 필요합니다.' });
  }
  
  // QR 세션 토큰 생성
  const sessionToken = `qr-session-${Date.now()}-${moldId}`;
  
  res.json({
    success: true,
    sessionToken: sessionToken,
    moldId: moldId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후 만료
  });
});

// 로그인 API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if ((username === 'admin' && password === 'admin123') || 
      (username === 'manager' && password === 'manager123')) {
    res.json({
      message: '로그인 성공',
      token: `demo-token-${username}`,
      user: {
        id: username === 'admin' ? '1' : '2',
        username,
        email: `${username}@moldmanagement.com`,
        full_name: username === 'admin' ? '시스템 관리자' : '생산 관리자',
        role: username === 'admin' ? 'admin' : 'manager',
        department: username === 'admin' ? 'IT' : '생산부'
      }
    });
  } else {
    res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }
});

// 토큰 검증 API
app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && token.startsWith('demo-token-')) {
    const username = token.replace('demo-token-', '');
    res.json({
      id: username === 'admin' ? '1' : '2',
      username,
      email: `${username}@moldmanagement.com`,
      full_name: username === 'admin' ? '시스템 관리자' : '생산 관리자',
      role: username === 'admin' ? 'admin' : 'manager',
      department: username === 'admin' ? 'IT' : '생산부'
    });
  } else {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
});

// KPI 데이터 API
app.get('/api/dash/kpi', (req, res) => {
  res.json({
    totalMolds: 156,
    checkRate: '87.3%',
    pendingInspections: 12,
    activeRepairs: 3,
    moldsByStatus: {
      production: 141,
      repair: 3,
      inspection: 12
    }
  });
});

// 활동 내역 API
app.get('/api/dash/activities', (req, res) => {
  res.json([
    {
      id: 'check_1',
      type: 'check',
      message: 'M001-A (엔진 블록 금형) 일상점검 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'completed',
      moldId: 1
    },
    {
      id: 'repair_1',
      type: 'repair',
      message: 'M002-B (트랜스미션 케이스) 수리 요청',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'requested',
      moldId: 2
    },
    {
      id: 'check_2',
      type: 'check',
      message: 'M003-C (실린더 헤드) 일상점검 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'completed',
      moldId: 3
    },
    {
      id: 'repair_2',
      type: 'repair',
      message: 'M004-D (오일팬 금형) 수리 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      status: 'completed',
      moldId: 4
    },
    {
      id: 'check_3',
      type: 'check',
      message: 'M005-E (브레이크 디스크) 일상점검 완료',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      status: 'completed',
      moldId: 5
    }
  ]);
});

// QR 세션 생성 API
app.post('/api/auth/qr-session', (req, res) => {
  const { moldId } = req.body;
  res.json({
    message: 'QR 세션이 생성되었습니다.',
    sessionToken: `qr-session-${moldId}`,
    moldId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
});

// 금형 위치 데이터 API
app.get('/api/dash/mold-locations', (req, res) => {
  // Mock 금형 위치 데이터
  const mockLocationData = [
    { 
      id: 1, name: 'M-001', location: 'A구역-01', zone: 'A', status: 'production', 
      lastMaintenance: '2024-10-15', nextMaintenance: '2024-11-15', 
      coordinates: { x: 20, y: 30 },
      gpsCoordinates: { lat: 37.5675, lng: 127.0790 },
      building: '제1공장', floor: 1
    },
    { 
      id: 2, name: 'M-002', location: 'A구역-02', zone: 'A', status: 'maintenance', 
      lastMaintenance: '2024-10-20', nextMaintenance: '2024-11-20', 
      coordinates: { x: 40, y: 30 },
      gpsCoordinates: { lat: 37.5680, lng: 127.0790 },
      building: '제1공장', floor: 1
    },
    { 
      id: 3, name: 'M-003', location: 'B구역-01', zone: 'B', status: 'production', 
      lastMaintenance: '2024-10-10', nextMaintenance: '2024-11-10', 
      coordinates: { x: 20, y: 60 },
      gpsCoordinates: { lat: 37.5675, lng: 127.0795 },
      building: '제1공장', floor: 2
    },
    { 
      id: 4, name: 'M-004', location: 'B구역-02', zone: 'B', status: 'idle', 
      lastMaintenance: '2024-10-25', nextMaintenance: '2024-11-25', 
      coordinates: { x: 40, y: 60 },
      gpsCoordinates: { lat: 37.5680, lng: 127.0795 },
      building: '제1공장', floor: 2
    },
    { 
      id: 5, name: 'M-005', location: 'C구역-01', zone: 'C', status: 'repair', 
      lastMaintenance: '2024-10-05', nextMaintenance: '2024-11-05', 
      coordinates: { x: 60, y: 30 },
      gpsCoordinates: { lat: 37.5685, lng: 127.0790 },
      building: '제2공장', floor: 1
    },
    { 
      id: 6, name: 'M-006', location: 'C구역-02', zone: 'C', status: 'production', 
      lastMaintenance: '2024-10-18', nextMaintenance: '2024-11-18', 
      coordinates: { x: 80, y: 30 },
      gpsCoordinates: { lat: 37.5690, lng: 127.0790 },
      building: '제2공장', floor: 1
    },
    { 
      id: 7, name: 'M-007', location: 'D구역-01', zone: 'D', status: 'production', 
      lastMaintenance: '2024-10-12', nextMaintenance: '2024-11-12', 
      coordinates: { x: 60, y: 60 },
      gpsCoordinates: { lat: 37.5685, lng: 127.0795 },
      building: '제2공장', floor: 2
    },
    { 
      id: 8, name: 'M-008', location: 'D구역-02', zone: 'D', status: 'maintenance', 
      lastMaintenance: '2024-10-22', nextMaintenance: '2024-11-22', 
      coordinates: { x: 80, y: 60 },
      gpsCoordinates: { lat: 37.5690, lng: 127.0795 },
      building: '제2공장', floor: 2
    }
  ];

  res.json(mockLocationData);
});

// 금형 등록 API
app.post('/api/molds', (req, res) => {
  const moldData = req.body;
  
  // 간단한 유효성 검사
  if (!moldData.moldId || !moldData.name || !moldData.location || !moldData.zone) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다.',
      required: ['moldId', 'name', 'location', 'zone']
    });
  }
  
  // Mock 응답 - 실제로는 데이터베이스에 저장
  const newMold = {
    id: Date.now(), // 임시 ID 생성
    ...moldData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '금형이 성공적으로 등록되었습니다.',
    mold: newMold
  });
});

// 금형 목록 조회 API
app.get('/api/molds', (req, res) => {
  // Mock 금형 데이터
  const allMolds = [
    {
      id: 1,
      moldId: 'M-2024-001',
      name: '스마트폰 케이스 금형',
      category: 'injection',
      manufacturer: '정밀금형',
      location: 'A구역-01',
      zone: 'A',
      status: 'available',
      manager: '김철수',
      department: 'production',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 2,
      moldId: 'M-2024-002',
      name: '자동차 부품 금형',
      category: 'press',
      manufacturer: '대한금형',
      location: 'B구역-02',
      zone: 'B',
      status: 'in_use',
      manager: '이영희',
      department: 'production',
      createdAt: '2024-02-10T14:30:00Z'
    },
    {
      id: 3,
      moldId: 'M-2024-003',
      name: '플라스틱 용기 금형',
      category: 'injection',
      manufacturer: '정밀금형',
      location: 'A구역-03',
      zone: 'A',
      status: 'maintenance',
      manager: '박민수',
      department: 'production',
      createdAt: '2024-03-01T10:00:00Z'
    },
    {
      id: 4,
      moldId: 'M-2024-004',
      name: '전자부품 하우징 금형',
      category: 'injection',
      manufacturer: '테크금형',
      location: 'C구역-01',
      zone: 'C',
      status: 'repair',
      manager: '정수연',
      department: 'quality',
      createdAt: '2024-03-15T14:20:00Z'
    },
    {
      id: 5,
      moldId: 'M-2024-005',
      name: '의료기기 케이스 금형',
      category: 'injection',
      manufacturer: '메디컬금형',
      location: 'B구역-05',
      zone: 'B',
      status: 'available',
      manager: '한지원',
      department: 'production',
      createdAt: '2024-04-01T09:30:00Z'
    }
  ];

  const { search } = req.query;
  
  let filteredMolds = allMolds;
  
  // 검색 기능
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredMolds = allMolds.filter(mold => 
      mold.moldId.toLowerCase().includes(searchTerm) ||
      mold.name.toLowerCase().includes(searchTerm) ||
      mold.location.toLowerCase().includes(searchTerm) ||
      mold.manufacturer.toLowerCase().includes(searchTerm)
    );
  }
  
  res.json(filteredMolds);
});

// 특정 금형 조회 API
app.get('/api/molds/:id', (req, res) => {
  const moldId = req.params.id;
  
  // Mock 데이터
  const mold = {
    id: moldId,
    moldId: 'M-2024-001',
    name: '스마트폰 케이스 금형',
    category: 'injection',
    manufacturer: '정밀금형',
    purchaseDate: '2024-01-15',
    material: 'steel',
    weight: 150.5,
    dimensions: { length: 300, width: 200, height: 100 },
    cavityCount: 4,
    maxPressure: 120.0,
    location: 'A구역-01',
    zone: 'A',
    status: 'available',
    manager: '김철수',
    department: 'production',
    description: '스마트폰 케이스 제조용 사출금형',
    maintenanceInterval: 30,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  };
  
  res.json(mold);
});

// 금형 수정 API
app.put('/api/molds/:id', (req, res) => {
  const moldId = req.params.id;
  const updateData = req.body;
  
  // Mock 응답
  const updatedMold = {
    id: moldId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: '금형 정보가 성공적으로 수정되었습니다.',
    mold: updatedMold
  });
});

// 금형 삭제 API
app.delete('/api/molds/:id', (req, res) => {
  const moldId = req.params.id;
  
  res.json({
    message: '금형이 성공적으로 삭제되었습니다.',
    deletedId: moldId
  });
});

// 수리 요청 등록 API
app.post('/api/repair-requests', (req, res) => {
  const repairData = req.body;
  
  // 간단한 유효성 검사
  if (!repairData.moldId || !repairData.reportedBy || !repairData.description || !repairData.symptoms) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다.',
      required: ['moldId', 'reportedBy', 'description', 'symptoms']
    });
  }
  
  // Mock 응답 - 실제로는 데이터베이스에 저장
  const newRepairRequest = {
    id: Date.now(), // 임시 ID 생성
    requestNumber: `REP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...repairData,
    status: 'pending', // 대기중
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '수리 요청이 성공적으로 등록되었습니다.',
    repairRequest: newRepairRequest
  });
});

// 수리 요청 목록 조회 API
app.get('/api/repair-requests', (req, res) => {
  // Mock 수리 요청 데이터
  const repairRequests = [
    {
      id: 1,
      requestNumber: 'REP-2024-001',
      moldId: 'M-2024-001',
      moldName: '스마트폰 케이스 금형',
      reportedBy: '김철수',
      department: 'production',
      reportDate: '2024-11-01',
      issueType: 'mechanical',
      priority: 'high',
      status: 'in_progress',
      description: '금형 내부 스프링 파손으로 인한 제품 불량 발생',
      symptoms: '제품 이젝션 시 불완전한 분리, 제품 표면 긁힘',
      estimatedDowntime: 8,
      createdAt: '2024-11-01T09:00:00Z'
    },
    {
      id: 2,
      requestNumber: 'REP-2024-002',
      moldId: 'M-2024-003',
      moldName: '플라스틱 용기 금형',
      reportedBy: '박민수',
      department: 'production',
      reportDate: '2024-11-02',
      issueType: 'wear',
      priority: 'medium',
      status: 'pending',
      description: '캐비티 표면 마모로 인한 제품 치수 불량',
      symptoms: '제품 두께 편차 증가, 표면 거칠기 악화',
      estimatedDowntime: 12,
      createdAt: '2024-11-02T14:30:00Z'
    }
  ];
  
  res.json(repairRequests);
});

// 특정 수리 요청 조회 API
app.get('/api/repair-requests/:id', (req, res) => {
  const requestId = req.params.id;
  
  // Mock 데이터
  const repairRequest = {
    id: requestId,
    requestNumber: 'REP-2024-001',
    moldId: 'M-2024-001',
    moldName: '스마트폰 케이스 금형',
    reportedBy: '김철수',
    department: 'production',
    reportDate: '2024-11-01',
    issueType: 'mechanical',
    priority: 'high',
    status: 'in_progress',
    description: '금형 내부 스프링 파손으로 인한 제품 불량 발생',
    symptoms: '제품 이젝션 시 불완전한 분리, 제품 표면 긁힘',
    estimatedDowntime: 8,
    repairLocation: '현장 수리',
    contactInfo: '010-1234-5678',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z'
  };
  
  res.json(repairRequest);
});

// 수리 요청 상태 업데이트 API
app.put('/api/repair-requests/:id/status', (req, res) => {
  const requestId = req.params.id;
  const { status, notes } = req.body;
  
  res.json({
    message: '수리 요청 상태가 업데이트되었습니다.',
    requestId,
    status,
    notes,
    updatedAt: new Date().toISOString()
  });
});

// 일상관리 기록 등록 API
app.post('/api/daily-management', (req, res) => {
  const managementData = req.body;
  
  // 간단한 유효성 검사
  if (!managementData.moldId || !managementData.inspector) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다.',
      required: ['moldId', 'inspector']
    });
  }
  
  // Mock 응답 - 실제로는 데이터베이스에 저장
  const newRecord = {
    id: Date.now(),
    recordNumber: `DM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...managementData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '일상관리 기록이 성공적으로 등록되었습니다.',
    record: newRecord
  });
});

// 일상관리 기록 목록 조회 API
app.get('/api/daily-management', (req, res) => {
  // Mock 일상관리 기록 데이터
  const records = [
    {
      id: 1,
      recordNumber: 'DM-2024-001',
      moldId: 'M-2024-001',
      moldName: '스마트폰 케이스 금형',
      checkDate: '2024-11-04',
      inspector: '김철수',
      department: 'production',
      shift: 'day',
      operatingHours: 8.5,
      productionCount: 1200,
      overallStatus: 'normal',
      notes: '정상 작동, 특이사항 없음',
      createdAt: '2024-11-04T09:00:00Z'
    },
    {
      id: 2,
      recordNumber: 'DM-2024-002',
      moldId: 'M-2024-003',
      moldName: '플라스틱 용기 금형',
      checkDate: '2024-11-04',
      inspector: '박민수',
      department: 'production',
      shift: 'night',
      operatingHours: 7.2,
      productionCount: 800,
      overallStatus: 'attention',
      notes: '냉각수 압력 약간 낮음, 모니터링 필요',
      createdAt: '2024-11-04T21:00:00Z'
    }
  ];
  
  res.json(records);
});

// 특정 일상관리 기록 조회 API
app.get('/api/daily-management/:id', (req, res) => {
  const recordId = req.params.id;
  
  // Mock 데이터
  const record = {
    id: recordId,
    recordNumber: 'DM-2024-001',
    moldId: 'M-2024-001',
    moldName: '스마트폰 케이스 금형',
    checkDate: '2024-11-04',
    inspector: '김철수',
    department: 'production',
    shift: 'day',
    operatingHours: 8.5,
    productionCount: 1200,
    checkItems: {
      'visual_1': { status: 'ok', notes: '표면 상태 양호' },
      'visual_2': { status: 'ok', notes: '균열 없음' },
      'function_1': { status: 'ok', notes: '개폐 동작 정상' },
      'measure_1': { status: 'ok', value: 45, notes: '온도 정상' }
    },
    overallStatus: 'normal',
    notes: '정상 작동, 특이사항 없음',
    nextCheckDate: '2024-11-05',
    createdAt: '2024-11-04T09:00:00Z',
    updatedAt: '2024-11-04T09:00:00Z'
  };
  
  res.json(record);
});

// 점검 일정 등록 API
app.post('/api/maintenance-schedules', (req, res) => {
  const scheduleData = req.body;
  
  // 간단한 유효성 검사
  if (!scheduleData.moldId || !scheduleData.scheduleName || !scheduleData.assignedTo) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다.',
      required: ['moldId', 'scheduleName', 'assignedTo']
    });
  }
  
  // Mock 응답 - 실제로는 데이터베이스에 저장
  const newSchedule = {
    id: Date.now(),
    ...scheduleData,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '점검 일정이 성공적으로 등록되었습니다.',
    schedule: newSchedule
  });
});

// 점검 일정 목록 조회 API
app.get('/api/maintenance-schedules', (req, res) => {
  // Mock 점검 일정 데이터
  const schedules = [
    {
      id: 1,
      moldId: 'M-2024-001',
      moldName: '스마트폰 케이스 금형',
      scheduleType: 'monthly',
      scheduleName: '정기 점검 및 청소',
      description: '월간 정기 점검으로 금형 상태 확인, 캐비티 청소, 이젝터 점검을 포함합니다.',
      assignedTo: '이정수',
      department: 'maintenance',
      scheduledDate: '2024-11-15',
      estimatedDuration: 4,
      priority: 'high',
      status: 'scheduled',
      notes: '생산 일정과 조율하여 진행',
      createdAt: '2024-11-01T09:00:00Z',
      updatedAt: '2024-11-01T09:00:00Z'
    },
    {
      id: 2,
      moldId: 'M-2024-003',
      moldName: '플라스틱 용기 금형',
      scheduleType: 'weekly',
      scheduleName: '주간 상태 점검',
      description: '주간 정기 점검으로 외관 상태 및 기본 기능을 확인합니다.',
      assignedTo: '박민수',
      department: 'production',
      scheduledDate: '2024-11-08',
      estimatedDuration: 2,
      priority: 'medium',
      status: 'in_progress',
      notes: '특이사항 없음',
      createdAt: '2024-11-01T14:00:00Z',
      updatedAt: '2024-11-04T10:00:00Z'
    },
    {
      id: 3,
      moldId: 'M-2024-002',
      moldName: '자동차 부품 금형',
      scheduleType: 'quarterly',
      scheduleName: '분기별 정밀 점검',
      description: '분기별 정밀 점검으로 치수 측정, 마모도 확인, 부품 교체를 포함합니다.',
      assignedTo: '최영호',
      department: 'quality',
      scheduledDate: '2024-10-30',
      estimatedDuration: 8,
      priority: 'urgent',
      status: 'overdue',
      notes: '긴급 점검 필요',
      createdAt: '2024-10-15T08:00:00Z',
      updatedAt: '2024-10-30T16:00:00Z'
    },
    {
      id: 4,
      moldId: 'M-2024-004',
      moldName: '전자부품 하우징 금형',
      scheduleType: 'monthly',
      scheduleName: '월간 예방 점검',
      description: '예방 차원의 월간 점검으로 냉각 시스템 및 전기 계통을 확인합니다.',
      assignedTo: '김수진',
      department: 'maintenance',
      scheduledDate: '2024-10-25',
      estimatedDuration: 3,
      priority: 'medium',
      status: 'completed',
      notes: '점검 완료, 이상 없음',
      createdAt: '2024-10-01T11:00:00Z',
      updatedAt: '2024-10-25T15:30:00Z'
    }
  ];
  
  res.json(schedules);
});

// 특정 점검 일정 조회 API
app.get('/api/maintenance-schedules/:id', (req, res) => {
  const scheduleId = req.params.id;
  
  // Mock 데이터
  const schedule = {
    id: scheduleId,
    moldId: 'M-2024-001',
    moldName: '스마트폰 케이스 금형',
    scheduleType: 'monthly',
    scheduleName: '정기 점검 및 청소',
    description: '월간 정기 점검으로 금형 상태 확인, 캐비티 청소, 이젝터 점검을 포함합니다.',
    assignedTo: '이정수',
    department: 'maintenance',
    scheduledDate: '2024-11-15',
    estimatedDuration: 4,
    priority: 'high',
    status: 'scheduled',
    notes: '생산 일정과 조율하여 진행',
    recurring: true,
    recurringInterval: 1,
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-01T09:00:00Z'
  };
  
  res.json(schedule);
});

// 점검 일정 상태 업데이트 API
app.put('/api/maintenance-schedules/:id/status', (req, res) => {
  const scheduleId = req.params.id;
  const { status } = req.body;
  
  res.json({
    message: '점검 일정 상태가 업데이트되었습니다.',
    scheduleId,
    status,
    updatedAt: new Date().toISOString()
  });
});

// 자동 일정 생성 API
app.post('/api/maintenance-schedules/auto-generate', (req, res) => {
  const settings = req.body;
  
  // Mock 자동 일정 생성 로직
  const generatedCount = Math.floor(Math.random() * 5) + 1; // 1-5개 랜덤 생성
  
  res.json({
    message: '자동 점검 일정이 생성되었습니다.',
    generatedCount,
    settings,
    createdAt: new Date().toISOString()
  });
});

// 협력사 알림 전송 API
app.post('/api/maintenance-schedules/:id/notify-partner', (req, res) => {
  const scheduleId = req.params.id;
  
  res.json({
    message: '협력사에 알림이 전송되었습니다.',
    scheduleId,
    sentAt: new Date().toISOString()
  });
});


// 점검 알림 전송 API
app.post('/api/inspection-notifications/send', (req, res) => {
  const notificationData = req.body;
  
  // Mock 알림 전송 로직
  res.json({
    message: '점검 알림이 성공적으로 전송되었습니다.',
    notification: notificationData,
    sentAt: new Date().toISOString(),
    deliveryStatus: 'sent'
  });
});

// 작업자 QR 세션 생성 API
app.post('/api/auth/qr-session', (req, res) => {
  const { qrCode } = req.body;
  
  // QR 코드에서 금형 ID 추출
  const moldId = qrCode;
  
  // Mock 세션 토큰 생성
  const sessionToken = `qr_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    message: 'QR 세션이 생성되었습니다.',
    token: sessionToken,
    moldId: moldId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후 만료
  });
});

// 협력사용 금형 정보 조회 API
app.get('/api/molds/:id/partner-info', (req, res) => {
  const moldId = req.params.id;
  
  // Mock 금형 데이터 (협력사용)
  const moldData = {
    'M-2024-001': {
      id: 1,
      moldId: 'M-2024-001',
      name: '스마트폰 케이스 금형',
      location: 'A구역-01',
      status: 'in_use',
      shotCount: 9500,
      maxShotCount: 10000,
      manager: '김철수'
    },
    'M-2024-002': {
      id: 2,
      moldId: 'M-2024-002',
      name: '자동차 부품 금형',
      location: 'B구역-03',
      status: 'in_use',
      shotCount: 12000,
      maxShotCount: 15000,
      manager: '박영희'
    },
    'M-2024-003': {
      id: 3,
      moldId: 'M-2024-003',
      name: '플라스틱 용기 금형',
      location: 'C구역-02',
      status: 'maintenance',
      shotCount: 8000,
      maxShotCount: 12000,
      manager: '이수진'
    },
    'M-2024-004': {
      id: 4,
      moldId: 'M-2024-004',
      name: '전자부품 하우징 금형',
      location: 'D구역-05',
      status: 'in_use',
      shotCount: 18000,
      maxShotCount: 20000,
      manager: '최민호'
    },
    'M-2024-005': {
      id: 5,
      moldId: 'M-2024-005',
      name: '의료기기 부품 금형',
      location: 'E구역-01',
      status: 'urgent_repair',
      shotCount: 21000,
      maxShotCount: 20000,
      manager: '정소영'
    },
    'M-2024-006': {
      id: 6,
      moldId: 'M-2024-006',
      name: '가전제품 외관 금형',
      location: 'F구역-03',
      status: 'repair_needed',
      shotCount: 14500,
      maxShotCount: 15000,
      manager: '한지우'
    },
    'M-2024-NEW': {
      id: 7,
      moldId: 'M-2024-NEW',
      name: '신규 테스트 금형',
      location: 'G구역-01',
      status: 'new',
      shotCount: 0,
      maxShotCount: 25000,
      manager: '신규담당'
    },
    'M-2024-OLD': {
      id: 8,
      moldId: 'M-2024-OLD',
      name: '노후 금형 (교체 예정)',
      location: 'H구역-99',
      status: 'end_of_life',
      shotCount: 50000,
      maxShotCount: 25000,
      manager: '노후관리'
    }
  };
  
  const mold = moldData[moldId];
  if (!mold) {
    return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
  }
  
  res.json(mold);
});

// 협력사 알림 조회 API
app.get('/api/partner/notifications', (req, res) => {
  // Mock 알림 데이터
  const notifications = [
    {
      id: 1,
      type: 'inspection',
      moldId: 'M-2024-001',
      moldName: '스마트폰 케이스 금형',
      message: '정기 점검이 예정되어 있습니다. 점검 일정을 확인해주세요.',
      priority: 'high',
      createdAt: '2024-11-04T09:00:00Z',
      isRead: false
    },
    {
      id: 2,
      type: 'repair',
      moldId: 'M-2024-002',
      moldName: '자동차 부품 금형',
      message: '긴급 수리가 필요합니다. 이젝터 핀 교체 작업을 진행해주세요.',
      priority: 'urgent',
      createdAt: '2024-11-03T14:30:00Z',
      isRead: false
    },
    {
      id: 3,
      type: 'maintenance',
      moldId: 'M-2024-003',
      moldName: '플라스틱 용기 금형',
      message: '월간 유지보수 작업이 완료되었습니다.',
      priority: 'medium',
      createdAt: '2024-11-02T11:15:00Z',
      isRead: true
    }
  ];
  
  res.json(notifications);
});

// 협력사 알림 읽음 처리 API
app.put('/api/partner/notifications/:id/read', (req, res) => {
  const notificationId = req.params.id;
  
  res.json({
    message: '알림이 읽음 처리되었습니다.',
    notificationId,
    updatedAt: new Date().toISOString()
  });
});

// 협력사 수리 작업 등록 API
app.post('/api/partner/repair-work', (req, res) => {
  const repairData = req.body;
  
  // Mock 응답
  const newRepairWork = {
    id: Date.now(),
    ...repairData,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '수리 작업이 성공적으로 등록되었습니다.',
    repairWork: newRepairWork
  });
});

// 협력사 일상관리 등록 API
app.post('/api/partner/daily-management', (req, res) => {
  const managementData = req.body;
  
  // Mock 응답
  const newManagementRecord = {
    id: Date.now(),
    recordNumber: `DM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...managementData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '일상관리 기록이 성공적으로 등록되었습니다.',
    managementRecord: newManagementRecord
  });
});

// 실시간 데이터 저장소 (메모리 기반)
let dailyInspections = [];
let repairRequests = [];
let notifications = [];
let shotRecords = [];

// 작업자 일상점검 등록 API
app.post('/api/worker/daily-inspection', (req, res) => {
  const inspectionData = req.body;
  
  const newInspection = {
    id: Date.now(),
    inspectionNumber: `DI-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...inspectionData,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 메모리에 저장
  dailyInspections.unshift(newInspection);
  
  // 관리자 알림 생성
  const notification = {
    id: Date.now() + 1,
    type: 'daily_inspection',
    title: '일상점검 완료',
    message: `${inspectionData.moldId} 금형의 일상점검이 완료되었습니다.`,
    moldId: inspectionData.moldId,
    moldName: inspectionData.moldName || inspectionData.moldId,
    inspector: inspectionData.inspector,
    priority: inspectionData.overallStatus === 'abnormal' ? 'urgent' : 
              inspectionData.overallStatus === 'attention' ? 'high' : 'medium',
    isRead: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(notification);
  
  res.status(201).json({
    message: '일상점검이 성공적으로 등록되었습니다.',
    inspection: newInspection,
    notification: notification
  });
});

// 작업자 수리요청 등록 API
app.post('/api/worker/repair-request', (req, res) => {
  const repairData = req.body;
  
  const newRepairRequest = {
    id: Date.now(),
    requestNumber: `RR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    ...repairData,
    status: 'pending',
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 메모리에 저장
  repairRequests.unshift(newRepairRequest);
  
  // 긴급 수리 알림 생성
  const notification = {
    id: Date.now() + 2,
    type: 'repair_request',
    title: '수리 요청',
    message: `${repairData.moldId} 금형에 수리 요청이 접수되었습니다.`,
    moldId: repairData.moldId,
    moldName: repairData.moldName || repairData.moldId,
    requester: repairData.requester,
    priority: repairData.urgency === 'urgent' ? 'urgent' : 
              repairData.urgency === 'high' ? 'high' : 'medium',
    isRead: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(notification);
  
  res.status(201).json({
    message: '수리 요청이 성공적으로 등록되었습니다.',
    repairRequest: newRepairRequest,
    notification: notification
  });
});

// 관리자용 일상점검 목록 조회 API
app.get('/api/admin/daily-inspections', (req, res) => {
  const { page = 1, limit = 10, moldId, status } = req.query;
  
  let filteredInspections = [...dailyInspections];
  
  if (moldId) {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.moldId.includes(moldId)
    );
  }
  
  if (status) {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.overallStatus === status
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedInspections = filteredInspections.slice(startIndex, endIndex);
  
  res.json({
    inspections: paginatedInspections,
    total: filteredInspections.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredInspections.length / limit)
  });
});

// 관리자용 수리요청 목록 조회 API
app.get('/api/admin/repair-requests', (req, res) => {
  const { page = 1, limit = 10, status, priority } = req.query;
  
  let filteredRequests = [...repairRequests];
  
  if (status) {
    filteredRequests = filteredRequests.filter(request => 
      request.status === status
    );
  }
  
  if (priority) {
    filteredRequests = filteredRequests.filter(request => 
      request.urgency === priority
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);
  
  res.json({
    repairRequests: paginatedRequests,
    total: filteredRequests.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredRequests.length / limit)
  });
});

// 관리자용 실시간 알림 조회 API
app.get('/api/admin/notifications', (req, res) => {
  const { unreadOnly = false } = req.query;
  
  let filteredNotifications = [...notifications];
  
  if (unreadOnly === 'true') {
    filteredNotifications = filteredNotifications.filter(notification => 
      !notification.isRead
    );
  }
  
  res.json({
    notifications: filteredNotifications.slice(0, 50), // 최근 50개만
    unreadCount: notifications.filter(n => !n.isRead).length
  });
});

// 알림 읽음 처리 API
app.put('/api/admin/notifications/:id/read', (req, res) => {
  const notificationId = parseInt(req.params.id);
  
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    notification.readAt = new Date().toISOString();
  }
  
  res.json({
    message: '알림이 읽음 처리되었습니다.',
    notification: notification
  });
});

// 수리요청 상태 업데이트 API
app.put('/api/admin/repair-requests/:id/status', (req, res) => {
  const requestId = parseInt(req.params.id);
  const { status, assignedTo, notes } = req.body;
  
  const repairRequest = repairRequests.find(r => r.id === requestId);
  if (repairRequest) {
    repairRequest.status = status;
    repairRequest.assignedTo = assignedTo;
    repairRequest.notes = notes;
    repairRequest.updatedAt = new Date().toISOString();
    
    // 상태 변경 알림 생성
    const notification = {
      id: Date.now() + 3,
      type: 'status_update',
      title: '수리 상태 업데이트',
      message: `${repairRequest.moldId} 수리 요청 상태가 '${status}'로 변경되었습니다.`,
      moldId: repairRequest.moldId,
      priority: 'medium',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    notifications.unshift(notification);
  }
  
  res.json({
    message: '수리 요청 상태가 업데이트되었습니다.',
    repairRequest: repairRequest
  });
});

// 실시간 통계 API
app.get('/api/admin/realtime-stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayInspections = dailyInspections.filter(inspection => 
    inspection.createdAt.startsWith(today)
  );
  
  const todayRepairRequests = repairRequests.filter(request => 
    request.createdAt.startsWith(today)
  );
  
  const pendingRepairs = repairRequests.filter(request => 
    request.status === 'pending'
  );
  
  const urgentIssues = [
    ...dailyInspections.filter(i => i.overallStatus === 'abnormal'),
    ...repairRequests.filter(r => r.urgency === 'urgent' && r.status === 'pending')
  ];
  
  res.json({
    todayInspections: todayInspections.length,
    todayRepairRequests: todayRepairRequests.length,
    pendingRepairs: pendingRepairs.length,
    urgentIssues: urgentIssues.length,
    unreadNotifications: notifications.filter(n => !n.isRead).length,
    recentActivity: [
      ...todayInspections.slice(0, 5).map(i => ({
        type: 'inspection',
        moldId: i.moldId,
        status: i.overallStatus,
        time: i.createdAt,
        inspector: i.inspector
      })),
      ...todayRepairRequests.slice(0, 5).map(r => ({
        type: 'repair_request',
        moldId: r.moldId,
        urgency: r.urgency,
        time: r.createdAt,
        requester: r.requester
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10)
  });
});

// 관리자 일상점검 이력 조회 API
app.get('/api/admin/daily-inspections', (req, res) => {
  const { page = 1, limit = 10, moldId, inspector, dateFrom, dateTo, status, overallStatus } = req.query;
  
  let filteredInspections = [...dailyInspections];
  
  // 필터링
  if (moldId) {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.moldId.toLowerCase().includes(moldId.toLowerCase())
    );
  }
  
  if (inspector) {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.inspector.toLowerCase().includes(inspector.toLowerCase())
    );
  }
  
  if (dateFrom) {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.checkDate >= dateFrom
    );
  }
  
  if (dateTo) {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.checkDate <= dateTo
    );
  }
  
  if (overallStatus && overallStatus !== '') {
    filteredInspections = filteredInspections.filter(inspection => 
      inspection.overallStatus === overallStatus
    );
  }
  
  // 정렬 (최신순)
  filteredInspections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 페이지네이션
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedInspections = filteredInspections.slice(startIndex, endIndex);
  
  res.json({
    inspections: paginatedInspections,
    total: filteredInspections.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredInspections.length / limit)
  });
});

// 작업자용 금형 정보 조회 API
app.get('/api/worker/mold/:id', (req, res) => {
  const moldId = req.params.id;
  
  // Mock 금형 데이터 (작업자용)
  const moldData = {
    'M-2024-001': {
      id: 1,
      moldId: 'M-2024-001',
      name: '스마트폰 케이스 금형',
      location: 'A구역-01',
      status: 'in_use',
      shotCount: 9500,
      maxShotCount: 10000,
      lastMaintenance: '2024-10-15',
      nextMaintenance: '2024-11-15',
      manager: '김철수',
      description: '스마트폰 케이스 제조용 정밀 금형',
      specifications: {
        material: 'SKD61',
        weight: '2.5kg',
        dimensions: '300x200x150mm',
        cavities: 4
      },
      injectionConditions: {
        injectionTemperature: '220°C',
        moldTemperature: '60°C',
        injectionPressure: '80 MPa',
        injectionSpeed: '50 mm/s',
        holdingPressure: '60 MPa',
        holdingTime: '8 sec',
        coolingTime: '15 sec',
        cycleTime: '35 sec',
        screwSpeed: '150 rpm',
        backPressure: '5 MPa'
      },
      images: {
        moldImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&crop=center',
        productImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&crop=center',
        thumbnails: {
          moldThumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop&crop=center',
          productThumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&h=200&fit=crop&crop=center'
        }
      },
      maintenanceHistory: [
        {
          date: '2024-10-15',
          type: '정기점검',
          description: '전체 점검 및 청소 완료',
          technician: '박기술'
        },
        {
          date: '2024-09-15',
          type: '부품교체',
          description: '이젝터 핀 교체',
          technician: '이수리'
        }
      ]
    },
    'M-2024-002': {
      id: 2,
      moldId: 'M-2024-002',
      name: '자동차 부품 금형',
      location: 'B구역-03',
      status: 'in_use',
      shotCount: 12000,
      maxShotCount: 15000,
      lastMaintenance: '2024-09-20',
      nextMaintenance: '2024-12-20',
      manager: '박영희',
      description: '자동차 내장재 부품 제조용 금형',
      specifications: {
        material: 'NAK80',
        weight: '5.2kg',
        dimensions: '450x300x200mm',
        cavities: 2
      },
      injectionConditions: {
        injectionTemperature: '240°C',
        moldTemperature: '80°C',
        injectionPressure: '100 MPa',
        injectionSpeed: '40 mm/s',
        holdingPressure: '75 MPa',
        holdingTime: '12 sec',
        coolingTime: '20 sec',
        cycleTime: '45 sec',
        screwSpeed: '120 rpm',
        backPressure: '8 MPa'
      },
      images: {
        moldImage: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop&crop=center',
        productImage: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=800&h=600&fit=crop&crop=center',
        thumbnails: {
          moldThumbnail: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=300&h=200&fit=crop&crop=center',
          productThumbnail: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=300&h=200&fit=crop&crop=center'
        }
      },
      maintenanceHistory: [
        {
          date: '2024-09-20',
          type: '정기점검',
          description: '냉각 시스템 점검 완료',
          technician: '김점검'
        }
      ]
    },
    'M-2024-003': {
      id: 3,
      moldId: 'M-2024-003',
      name: '플라스틱 용기 금형',
      location: 'C구역-02',
      status: 'maintenance',
      shotCount: 8000,
      maxShotCount: 12000,
      lastMaintenance: '2024-11-01',
      nextMaintenance: '2024-12-01',
      manager: '이수진',
      description: '식품용 플라스틱 용기 제조 금형',
      specifications: {
        material: 'P20',
        weight: '3.8kg',
        dimensions: '350x250x180mm',
        cavities: 8
      },
      injectionConditions: {
        injectionTemperature: '200°C',
        moldTemperature: '40°C',
        injectionPressure: '60 MPa',
        injectionSpeed: '60 mm/s',
        holdingPressure: '45 MPa',
        holdingTime: '6 sec',
        coolingTime: '12 sec',
        cycleTime: '25 sec',
        screwSpeed: '180 rpm',
        backPressure: '3 MPa'
      },
      maintenanceHistory: [
        {
          date: '2024-11-01',
          type: '수리',
          description: '캐비티 표면 연마 작업',
          technician: '최수리'
        }
      ]
    },
    'M-2024-004': {
      id: 4,
      moldId: 'M-2024-004',
      name: '전자부품 하우징 금형',
      location: 'D구역-05',
      status: 'in_use',
      shotCount: 18000,
      maxShotCount: 20000,
      lastMaintenance: '2024-10-01',
      nextMaintenance: '2024-11-30',
      manager: '최민호',
      description: '전자제품 하우징 제조용 정밀 금형',
      specifications: {
        material: 'SKD11',
        weight: '4.1kg',
        dimensions: '400x280x160mm',
        cavities: 6
      },
      maintenanceHistory: [
        {
          date: '2024-10-01',
          type: '정기점검',
          description: '정밀도 측정 및 조정',
          technician: '정정밀'
        }
      ]
    },
    'M-2024-005': {
      id: 5,
      moldId: 'M-2024-005',
      name: '의료기기 부품 금형',
      location: 'E구역-01',
      status: 'urgent_repair',
      shotCount: 21000,
      maxShotCount: 20000,
      lastMaintenance: '2024-08-15',
      nextMaintenance: '2024-11-10',
      manager: '정소영',
      description: '의료기기 부품 제조용 고정밀 금형',
      specifications: {
        material: 'SKH51',
        weight: '6.3kg',
        dimensions: '500x350x220mm',
        cavities: 1
      },
      maintenanceHistory: [
        {
          date: '2024-08-15',
          type: '정기점검',
          description: '표면 처리 및 정밀도 확인',
          technician: '의료기술'
        }
      ]
    },
    'M-2024-006': {
      id: 6,
      moldId: 'M-2024-006',
      name: '가전제품 외관 금형',
      location: 'F구역-03',
      status: 'repair_needed',
      shotCount: 14500,
      maxShotCount: 15000,
      lastMaintenance: '2024-09-10',
      nextMaintenance: '2024-11-20',
      manager: '한지우',
      description: '가전제품 외관 부품 제조 금형',
      specifications: {
        material: 'NAK55',
        weight: '7.2kg',
        dimensions: '600x400x250mm',
        cavities: 2
      },
      maintenanceHistory: [
        {
          date: '2024-09-10',
          type: '부품교체',
          description: '스프링 교체 및 조정',
          technician: '가전수리'
        }
      ]
    }
  };
  
  const mold = moldData[moldId];
  if (!mold) {
    return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
  }
  
  res.json(mold);
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  console.log(`🌐 Client URL: http://localhost:3000`);
});
