import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Mold, DailyCheck, Inspection, Repair, Shot } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 임시로 인증 미들웨어 비활성화 (개발용)
// router.use(authenticateToken);

// KPI 데이터 조회
router.get('/kpi', async (req, res) => {
  try {
    // 임시 목업 데이터 (개발용)
    const mockData = {
      totalMolds: 156,
      checkRate: '87.3%',
      pendingInspections: 12,
      activeRepairs: 3,
      moldsByStatus: {
        production: 141,
        repair: 3,
        inspection: 12
      }
    };

    res.json(mockData);

  } catch (error) {
    console.error('Get KPI error:', error);
    res.status(500).json({ error: 'KPI 데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 차트 데이터 조회
router.get('/charts', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 일별 점검 현황
    const dailyChecks = await DailyCheck.findAll({
      where: {
        checked_at: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('DATE', col('checked_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('checked_at'))],
      order: [[fn('DATE', col('checked_at')), 'ASC']]
    });

    // 일별 타수 현황
    const dailyShots = await Shot.findAll({
      where: {
        recorded_at: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('DATE', col('recorded_at')), 'date'],
        [fn('SUM', col('count_increment')), 'total_shots']
      ],
      group: [fn('DATE', col('recorded_at'))],
      order: [[fn('DATE', col('recorded_at')), 'ASC']]
    });

    // 수리 요청 현황 (상태별)
    const repairsByStatus = await Repair.findAll({
      where: {
        requested_at: { [Op.gte]: startDate }
      },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    // 제조사별 금형 분포
    const moldsByManufacturer = await Mold.findAll({
      attributes: [
        'manufacturer',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['manufacturer'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    });

    // 차종별 금형 분포
    const moldsByVehicle = await Mold.findAll({
      attributes: [
        'vehicle_model',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['vehicle_model'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      dailyChecks: dailyChecks.map((item: any) => ({
        date: item.getDataValue('date'),
        count: parseInt(item.getDataValue('count'))
      })),
      dailyShots: dailyShots.map((item: any) => ({
        date: item.getDataValue('date'),
        totalShots: parseInt(item.getDataValue('total_shots'))
      })),
      repairsByStatus: repairsByStatus.map((item: any) => ({
        status: item.status,
        count: parseInt(item.getDataValue('count'))
      })),
      moldsByManufacturer: moldsByManufacturer.map((item: any) => ({
        manufacturer: item.manufacturer,
        count: parseInt(item.getDataValue('count'))
      })),
      moldsByVehicle: moldsByVehicle.map((item: any) => ({
        vehicleModel: item.vehicle_model,
        count: parseInt(item.getDataValue('count'))
      }))
    });

  } catch (error) {
    console.error('Get charts data error:', error);
    res.status(500).json({ error: '차트 데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 최근 활동 조회
router.get('/activities', async (req, res) => {
  try {
    // 임시 목업 데이터 (개발용)
    const mockActivities = [
      {
        id: 'check_1',
        type: 'check',
        message: 'M001-A (엔진 블록 금형) 일상점검 완료',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
        status: 'completed',
        moldId: 1
      },
      {
        id: 'repair_1',
        type: 'repair',
        message: 'M002-B (트랜스미션 케이스) 수리 요청',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
        status: 'requested',
        moldId: 2
      },
      {
        id: 'check_2',
        type: 'check',
        message: 'M003-C (실린더 헤드) 일상점검 완료',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4시간 전
        status: 'completed',
        moldId: 3
      },
      {
        id: 'repair_2',
        type: 'repair',
        message: 'M004-D (오일팬 금형) 수리 완료',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6시간 전
        status: 'completed',
        moldId: 4
      },
      {
        id: 'check_3',
        type: 'check',
        message: 'M005-E (브레이크 디스크) 일상점검 완료',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8시간 전
        status: 'completed',
        moldId: 5
      }
    ];

    res.json(mockActivities);

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: '활동 내역 조회 중 오류가 발생했습니다.' });
  }
});

// 알림 조회
router.get('/notifications', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 예정된 점검 알림
    const upcomingInspections = await Inspection.findAll({
      where: {
        status: 'scheduled',
        scheduled_date: { [Op.between]: [now, sevenDaysFromNow] }
      },
      include: [{
        model: Mold,
        as: 'mold',
        attributes: ['id', 'part_number', 'part_name']
      }],
      order: [['scheduled_date', 'ASC']],
      limit: 10
    });

    // 긴급 수리 요청
    const urgentRepairs = await Repair.findAll({
      where: {
        status: { [Op.in]: ['requested', 'in_progress'] },
        urgency: 'high'
      },
      include: [{
        model: Mold,
        as: 'mold',
        attributes: ['id', 'part_number', 'part_name']
      }],
      order: [['requested_at', 'DESC']],
      limit: 5
    });

    const notifications = [
      ...upcomingInspections.map((inspection: any) => ({
        id: `inspection_${inspection.id}`,
        type: 'inspection',
        title: '점검 예정',
        message: `${inspection.mold.part_number} 정기점검이 ${new Date(inspection.scheduled_date).toLocaleDateString()}에 예정되어 있습니다.`,
        timestamp: inspection.scheduled_date,
        priority: 'medium',
        moldId: inspection.mold_id
      })),
      ...urgentRepairs.map((repair: any) => ({
        id: `repair_${repair.id}`,
        type: 'repair',
        title: '긴급 수리',
        message: `${repair.mold.part_number} 긴급 수리가 필요합니다.`,
        timestamp: repair.requested_at,
        priority: 'high',
        moldId: repair.mold_id
      }))
    ].sort((a, b) => {
      // 우선순위별 정렬 (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    res.json(notifications);

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
