"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/molds', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status, manufacturer, vehicleModel, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { part_number: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { part_name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { vehicle_model: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ];
        }
        if (manufacturer) {
            whereClause.manufacturer = manufacturer;
        }
        if (vehicleModel) {
            whereClause.vehicle_model = vehicleModel;
        }
        const { rows: molds, count: totalCount } = await models_1.Mold.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: models_1.User,
                    as: 'creator',
                    attributes: ['id', 'full_name', 'username']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: Number(limit),
            offset
        });
        const moldsWithStatus = await Promise.all(molds.map(async (mold) => {
            const [latestCheck, latestShot, activeRepairs] = await Promise.all([
                models_1.DailyCheck.findOne({
                    where: { mold_id: mold.id },
                    order: [['checked_at', 'DESC']]
                }),
                models_1.Shot.findOne({
                    where: { mold_id: mold.id },
                    order: [['recorded_at', 'DESC']]
                }),
                models_1.Repair.count({
                    where: {
                        mold_id: mold.id,
                        status: { [sequelize_1.Op.in]: ['requested', 'in_progress'] }
                    }
                })
            ]);
            return {
                ...mold.toJSON(),
                lastCheck: latestCheck?.checked_at || null,
                totalShots: latestShot?.count_total || 0,
                activeRepairs,
                status: activeRepairs > 0 ? '수리중' : '생산중'
            };
        }));
        res.json({
            molds: moldsWithStatus,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalCount / Number(limit)),
                totalCount,
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Get molds error:', error);
        res.status(500).json({ error: '금형 목록 조회 중 오류가 발생했습니다.' });
    }
});
router.get('/molds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const mold = await models_1.Mold.findByPk(id, {
            include: [
                {
                    model: models_1.User,
                    as: 'creator',
                    attributes: ['id', 'full_name', 'username']
                },
                {
                    model: models_1.DailyCheck,
                    as: 'dailyChecks',
                    limit: 10,
                    order: [['checked_at', 'DESC']]
                },
                {
                    model: models_1.Inspection,
                    as: 'inspections',
                    limit: 5,
                    order: [['created_at', 'DESC']]
                },
                {
                    model: models_1.Repair,
                    as: 'repairs',
                    limit: 5,
                    order: [['requested_at', 'DESC']]
                }
            ]
        });
        if (!mold) {
            return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
        }
        const latestShot = await models_1.Shot.findOne({
            where: { mold_id: id },
            order: [['recorded_at', 'DESC']]
        });
        res.json({
            ...mold.toJSON(),
            totalShots: latestShot?.count_total || 0,
            lastShotUpdate: latestShot?.recorded_at || null
        });
    }
    catch (error) {
        console.error('Get mold detail error:', error);
        res.status(500).json({ error: '금형 상세 조회 중 오류가 발생했습니다.' });
    }
});
router.post('/molds', async (req, res) => {
    try {
        const moldData = {
            ...req.body,
            created_by: req.user.userId
        };
        const existingMold = await models_1.Mold.findOne({
            where: { part_number: moldData.part_number }
        });
        if (existingMold) {
            return res.status(400).json({ error: '이미 존재하는 품번입니다.' });
        }
        const mold = await models_1.Mold.create(moldData);
        res.status(201).json({
            message: '금형이 성공적으로 등록되었습니다.',
            mold
        });
    }
    catch (error) {
        console.error('Create mold error:', error);
        res.status(500).json({ error: '금형 등록 중 오류가 발생했습니다.' });
    }
});
router.put('/molds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const mold = await models_1.Mold.findByPk(id);
        if (!mold) {
            return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
        }
        if (updateData.part_number && updateData.part_number !== mold.part_number) {
            const existingMold = await models_1.Mold.findOne({
                where: {
                    part_number: updateData.part_number,
                    id: { [sequelize_1.Op.ne]: id }
                }
            });
            if (existingMold) {
                return res.status(400).json({ error: '이미 존재하는 품번입니다.' });
            }
        }
        await mold.update(updateData);
        res.json({
            message: '금형 정보가 성공적으로 수정되었습니다.',
            mold
        });
    }
    catch (error) {
        console.error('Update mold error:', error);
        res.status(500).json({ error: '금형 수정 중 오류가 발생했습니다.' });
    }
});
router.delete('/molds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const mold = await models_1.Mold.findByPk(id);
        if (!mold) {
            return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
        }
        const [dailyCheckCount, repairCount, shotCount] = await Promise.all([
            models_1.DailyCheck.count({ where: { mold_id: id } }),
            models_1.Repair.count({ where: { mold_id: id } }),
            models_1.Shot.count({ where: { mold_id: id } })
        ]);
        if (dailyCheckCount > 0 || repairCount > 0 || shotCount > 0) {
            return res.status(400).json({
                error: '관련 데이터가 존재하는 금형은 삭제할 수 없습니다.'
            });
        }
        await mold.destroy();
        res.json({ message: '금형이 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        console.error('Delete mold error:', error);
        res.status(500).json({ error: '금형 삭제 중 오류가 발생했습니다.' });
    }
});
router.post('/molds/bulk-upload', async (req, res) => {
    try {
        const { molds } = req.body;
        if (!Array.isArray(molds) || molds.length === 0) {
            return res.status(400).json({ error: '업로드할 금형 데이터가 없습니다.' });
        }
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (let i = 0; i < molds.length; i++) {
            try {
                const moldData = {
                    ...molds[i],
                    created_by: req.user.userId
                };
                const existingMold = await models_1.Mold.findOne({
                    where: { part_number: moldData.part_number }
                });
                if (existingMold) {
                    results.failed++;
                    results.errors.push({
                        row: i + 1,
                        part_number: moldData.part_number,
                        error: '이미 존재하는 품번입니다.'
                    });
                    continue;
                }
                await models_1.Mold.create(moldData);
                results.success++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    row: i + 1,
                    part_number: molds[i].part_number,
                    error: error.message
                });
            }
        }
        res.json({
            message: `일괄 업로드 완료: 성공 ${results.success}건, 실패 ${results.failed}건`,
            results
        });
    }
    catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ error: '일괄 업로드 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map