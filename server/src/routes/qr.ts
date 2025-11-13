import express from 'express';
import { Mold, DailyCheck, Repair, Shot } from '../models';
import { authenticateQRSession } from '../middleware/auth';

const router = express.Router();

// QR 세션 기반 금형 정보 조회
router.get('/mold/:moldId', async (req, res) => {
  try {
    const { moldId } = req.params;

    const mold = await Mold.findByPk(moldId, {
      attributes: [
        'id', 'part_number', 'part_name', 'vehicle_model', 
        'manufacturer', 'location', 'qr_code'
      ]
    });

    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // 최근 점검 정보
    const latestCheck = await DailyCheck.findOne({
      where: { mold_id: moldId },
      order: [['checked_at', 'DESC']],
      attributes: ['checked_at', 'checklist_data']
    });

    // 최근 타수 정보
    const latestShot = await Shot.findOne({
      where: { mold_id: moldId },
      order: [['recorded_at', 'DESC']],
      attributes: ['count_total', 'recorded_at']
    });

    res.json({
      mold,
      lastCheck: latestCheck,
      totalShots: latestShot?.count_total || 0
    });

  } catch (error) {
    console.error('Get QR mold info error:', error);
    res.status(500).json({ error: '금형 정보 조회 중 오류가 발생했습니다.' });
  }
});

// 일상점검 등록
router.post('/mold/:moldId/daily-check', authenticateQRSession, async (req, res) => {
  try {
    const { moldId } = req.params;
    const { checklist_data, photos, gps_coordinates, notes } = req.body;

    // 금형 존재 확인
    const mold = await Mold.findByPk(moldId);
    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // QR 세션의 금형 ID와 일치하는지 확인
    if (req.qrSession?.moldId !== parseInt(moldId)) {
      return res.status(403).json({ error: '해당 금형에 대한 권한이 없습니다.' });
    }

    // 일상점검 데이터 생성
    const dailyCheck = await DailyCheck.create({
      mold_id: moldId,
      checklist_data,
      photos: photos || [],
      gps_coordinates,
      notes,
      checked_at: new Date()
    });

    res.status(201).json({
      message: '일상점검이 성공적으로 등록되었습니다.',
      dailyCheck
    });

  } catch (error) {
    console.error('Create daily check error:', error);
    res.status(500).json({ error: '일상점검 등록 중 오류가 발생했습니다.' });
  }
});

// 수리요청 등록
router.post('/mold/:moldId/repair', authenticateQRSession, async (req, res) => {
  try {
    const { moldId } = req.params;
    const { symptoms, description, urgency, photos, gps_coordinates } = req.body;

    // 금형 존재 확인
    const mold = await Mold.findByPk(moldId);
    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // QR 세션의 금형 ID와 일치하는지 확인
    if (req.qrSession?.moldId !== parseInt(moldId)) {
      return res.status(403).json({ error: '해당 금형에 대한 권한이 없습니다.' });
    }

    // 수리요청 데이터 생성
    const repair = await Repair.create({
      mold_id: moldId,
      symptoms,
      description,
      urgency: urgency || 'medium',
      photos: photos || [],
      gps_coordinates,
      status: 'requested',
      requested_at: new Date()
    });

    res.status(201).json({
      message: '수리요청이 성공적으로 등록되었습니다.',
      repair
    });

  } catch (error) {
    console.error('Create repair request error:', error);
    res.status(500).json({ error: '수리요청 등록 중 오류가 발생했습니다.' });
  }
});

// 타수 기록
router.post('/mold/:moldId/shot', authenticateQRSession, async (req, res) => {
  try {
    const { moldId } = req.params;
    const { count_increment, run_state, downtime_reason, notes } = req.body;

    // 금형 존재 확인
    const mold = await Mold.findByPk(moldId);
    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    // QR 세션의 금형 ID와 일치하는지 확인
    if (req.qrSession?.moldId !== parseInt(moldId)) {
      return res.status(403).json({ error: '해당 금형에 대한 권한이 없습니다.' });
    }

    // 최근 타수 기록 조회
    const latestShot = await Shot.findOne({
      where: { mold_id: moldId },
      order: [['recorded_at', 'DESC']]
    });

    const previousTotal = latestShot?.count_total || 0;
    const newTotal = previousTotal + (count_increment || 0);

    // 타수 기록 생성
    const shot = await Shot.create({
      mold_id: moldId,
      count_increment: count_increment || 0,
      count_total: newTotal,
      run_state: run_state || 'running',
      downtime_reason,
      notes,
      recorded_at: new Date()
    });

    res.status(201).json({
      message: '타수가 성공적으로 기록되었습니다.',
      shot,
      totalShots: newTotal
    });

  } catch (error) {
    console.error('Record shot error:', error);
    res.status(500).json({ error: '타수 기록 중 오류가 발생했습니다.' });
  }
});

// 금형 이력 조회 (작업자용)
router.get('/mold/:moldId/history', async (req, res) => {
  try {
    const { moldId } = req.params;
    const { type = 'all', limit = 10 } = req.query;

    const mold = await Mold.findByPk(moldId);
    if (!mold) {
      return res.status(404).json({ error: '금형을 찾을 수 없습니다.' });
    }

    const history: any = {};

    if (type === 'all' || type === 'checks') {
      history.dailyChecks = await DailyCheck.findAll({
        where: { mold_id: moldId },
        order: [['checked_at', 'DESC']],
        limit: Number(limit),
        attributes: ['id', 'checklist_data', 'checked_at', 'notes']
      });
    }

    if (type === 'all' || type === 'repairs') {
      history.repairs = await Repair.findAll({
        where: { mold_id: moldId },
        order: [['requested_at', 'DESC']],
        limit: Number(limit),
        attributes: ['id', 'symptoms', 'status', 'requested_at', 'urgency']
      });
    }

    if (type === 'all' || type === 'shots') {
      history.shots = await Shot.findAll({
        where: { mold_id: moldId },
        order: [['recorded_at', 'DESC']],
        limit: Number(limit),
        attributes: ['id', 'count_increment', 'count_total', 'run_state', 'recorded_at']
      });
    }

    res.json(history);

  } catch (error) {
    console.error('Get mold history error:', error);
    res.status(500).json({ error: '이력 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
