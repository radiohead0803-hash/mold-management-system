"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const router = express_1.default.Router();
router.get('/kpi', async (req, res) => {
    try {
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
    }
    catch (error) {
        console.error('Get KPI error:', error);
        res.status(500).json({ error: 'KPI 데이터 조회 중 오류가 발생했습니다.' });
    }
});
router.get('/charts', async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        let startDate;
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
        const dailyChecks = await models_1.DailyCheck.findAll({
            where: {
                checked_at: { [sequelize_1.Op.gte]: startDate }
            },
            attributes: [
                [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('checked_at')), 'date'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('checked_at'))],
            order: [[(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('checked_at')), 'ASC']]
        });
        const dailyShots = await models_1.Shot.findAll({
            where: {
                recorded_at: { [sequelize_1.Op.gte]: startDate }
            },
            attributes: [
                [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('recorded_at')), 'date'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('count_increment')), 'total_shots']
            ],
            group: [(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('recorded_at'))],
            order: [[(0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('recorded_at')), 'ASC']]
        });
        const repairsByStatus = await models_1.Repair.findAll({
            where: {
                requested_at: { [sequelize_1.Op.gte]: startDate }
            },
            attributes: [
                'status',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            group: ['status']
        });
        const moldsByManufacturer = await models_1.Mold.findAll({
            attributes: [
                'manufacturer',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            group: ['manufacturer'],
            order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'DESC']],
            limit: 10
        });
        const moldsByVehicle = await models_1.Mold.findAll({
            attributes: [
                'vehicle_model',
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
            ],
            group: ['vehicle_model'],
            order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'DESC']],
            limit: 10
        });
        res.json({
            dailyChecks: dailyChecks.map((item) => ({
                date: item.getDataValue('date'),
                count: parseInt(item.getDataValue('count'))
            })),
            dailyShots: dailyShots.map((item) => ({
                date: item.getDataValue('date'),
                totalShots: parseInt(item.getDataValue('total_shots'))
            })),
            repairsByStatus: repairsByStatus.map((item) => ({
                status: item.status,
                count: parseInt(item.getDataValue('count'))
            })),
            moldsByManufacturer: moldsByManufacturer.map((item) => ({
                manufacturer: item.manufacturer,
                count: parseInt(item.getDataValue('count'))
            })),
            moldsByVehicle: moldsByVehicle.map((item) => ({
                vehicleModel: item.vehicle_model,
                count: parseInt(item.getDataValue('count'))
            }))
        });
    }
    catch (error) {
        console.error('Get charts data error:', error);
        res.status(500).json({ error: '차트 데이터 조회 중 오류가 발생했습니다.' });
    }
});
router.get('/activities', async (req, res) => {
    try {
        const mockActivities = [
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
        ];
        res.json(mockActivities);
    }
    catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: '활동 내역 조회 중 오류가 발생했습니다.' });
    }
});
router.get('/notifications', async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingInspections = await models_1.Inspection.findAll({
            where: {
                status: 'scheduled',
                scheduled_date: { [sequelize_1.Op.between]: [now, sevenDaysFromNow] }
            },
            include: [{
                    model: models_1.Mold,
                    as: 'mold',
                    attributes: ['id', 'part_number', 'part_name']
                }],
            order: [['scheduled_date', 'ASC']],
            limit: 10
        });
        const urgentRepairs = await models_1.Repair.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['requested', 'in_progress'] },
                urgency: 'high'
            },
            include: [{
                    model: models_1.Mold,
                    as: 'mold',
                    attributes: ['id', 'part_number', 'part_name']
                }],
            order: [['requested_at', 'DESC']],
            limit: 5
        });
        const notifications = [
            ...upcomingInspections.map((inspection) => ({
                id: `inspection_${inspection.id}`,
                type: 'inspection',
                title: '점검 예정',
                message: `${inspection.mold.part_number} 정기점검이 ${new Date(inspection.scheduled_date).toLocaleDateString()}에 예정되어 있습니다.`,
                timestamp: inspection.scheduled_date,
                priority: 'medium',
                moldId: inspection.mold_id
            })),
            ...urgentRepairs.map((repair) => ({
                id: `repair_${repair.id}`,
                type: 'repair',
                title: '긴급 수리',
                message: `${repair.mold.part_number} 긴급 수리가 필요합니다.`,
                timestamp: repair.requested_at,
                priority: 'high',
                moldId: repair.mold_id
            }))
        ].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map