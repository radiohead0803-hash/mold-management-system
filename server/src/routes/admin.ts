import express from 'express';
import { Op } from 'sequelize';
import { Mold, User, DailyCheck, Inspection, Repair, Shot } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 모든 관리자 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 금형 목록 조회
router.get('/molds', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      manufacturer,
      vehicleModel,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // 검색 조건 구성
    const whereClause: any = {};
    
    if (search) {
      whereClause[Op.or] = [
        { part_number: { [Op.iLike]: `%${search}%` } },
        { part_name: { [Op.iLike]: `%${search}%` } },
        { vehicle_model: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (manufacturer) {
      whereClause.manufacturer = manufacturer;
    }
    
    if (vehicleModel) {
      whereClause.vehicle_model = vehicleModel;
    }

    // 금형 목록 조회
    const { rows: molds, count: totalCount } = await Mold.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'username']
        }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit),
      offset
    });

    // 각 금형의 최신 상태 정보 조회
    const moldsWithStatus = await Promise.all(
      molds.map(async (mold) => {
        const [latestCheck, latestShot, activeRepairs] = await Promise.all([
          DailyCheck.findOne({
            where: { mold_id: mold.id },
            order: [['checked_at', 'DESC']]
          }),
          Shot.findOne({
            where: { mold_id: mold.id },
            order: [['recorded_at', 'DESC']]
          }),
          Repair.count({
            where: { 
              mold_id: mold.id,
              status: { [Op.in]: ['requested', 'in_progress'] }
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
      })
    );

    res.json({
      molds: moldsWithStatus,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        limit: Number(limit)
      }
    });

  } catch (error) {
    console.error('Get molds error:', error);
    res.status(500).json({ error: '금형 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 금형 상세 조회
router.get('/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mold = await Mold.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'username']
        },
        {
          model: DailyCheck,
          as: 'dailyChecks',
          limit: 10,
          order: [['checked_at', 'DESC']]
        },
        {
          model: Inspection,
          as: 'inspections',
          limit: 5,
          order: [['created_at', 'DESC']]
        },
        {
          model: Repair,
          as: 'repairs',
          limit: 5,
          order: [['requested_at', 'DESC']]
        }
      ]
    });

    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // 최신 타수 정보
    const latestShot = await Shot.findOne({
      where: { mold_id: id },
      order: [['recorded_at', 'DESC']]
    });

    res.json({
      ...mold.toJSON(),
      totalShots: latestShot?.count_total || 0,
      lastShotUpdate: latestShot?.recorded_at || null
    });

  } catch (error) {
    console.error('Get mold detail error:', error);
    res.status(500).json({ error: '금형 상세 조회 중 오류가 발생했습니다.' });
  }
});

// 금형 등록
router.post('/molds', async (req, res) => {
  try {
    const moldData = {
      ...req.body,
      created_by: req.user.userId
    };

    // 품번 중복 확인
    const existingMold = await Mold.findOne({
      where: { part_number: moldData.part_number }
    });

    if (existingMold) {
      return res.status(400).json({ error: '이미 존재하는 품번입니다.' });
    }

    const mold = await Mold.create(moldData);

    res.status(201).json({
      message: '금형이 성공적으로 등록되었습니다.',
      mold
    });

  } catch (error) {
    console.error('Create mold error:', error);
    res.status(500).json({ error: '금형 등록 중 오류가 발생했습니다.' });
  }
});

// 금형 수정
router.put('/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const mold = await Mold.findByPk(id);
    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // 품번 중복 확인 (자신 제외)
    if (updateData.part_number && updateData.part_number !== mold.part_number) {
      const existingMold = await Mold.findOne({
        where: { 
          part_number: updateData.part_number,
          id: { [Op.ne]: id }
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

  } catch (error) {
    console.error('Update mold error:', error);
    res.status(500).json({ error: '금형 수정 중 오류가 발생했습니다.' });
  }
});

// 금형 삭제
router.delete('/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mold = await Mold.findByPk(id);
    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // 관련 데이터 확인
    const [dailyCheckCount, repairCount, shotCount] = await Promise.all([
      DailyCheck.count({ where: { mold_id: id } }),
      Repair.count({ where: { mold_id: id } }),
      Shot.count({ where: { mold_id: id } })
    ]);

    if (dailyCheckCount > 0 || repairCount > 0 || shotCount > 0) {
      return res.status(400).json({ 
        error: '관련 데이터가 존재하는 금형은 삭제할 수 없습니다.' 
      });
    }

    await mold.destroy();

    res.json({ message: '금형이 성공적으로 삭제되었습니다.' });

  } catch (error) {
    console.error('Delete mold error:', error);
    res.status(500).json({ error: '금형 삭제 중 오류가 발생했습니다.' });
  }
});

// 엑셀 일괄 업로드
router.post('/molds/bulk-upload', async (req, res) => {
  try {
    const { molds } = req.body;

    if (!Array.isArray(molds) || molds.length === 0) {
      return res.status(400).json({ error: '업로드할 금형 데이터가 없습니다.' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // 각 금형 데이터 처리
    for (let i = 0; i < molds.length; i++) {
      try {
        const moldData = {
          ...molds[i],
          created_by: req.user.userId
        };

        // 품번 중복 확인
        const existingMold = await Mold.findOne({
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

        await Mold.create(moldData);
        results.success++;

      } catch (error) {
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

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: '일괄 업로드 중 오류가 발생했습니다.' });
  }
});

export default router;
