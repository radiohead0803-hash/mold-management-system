import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const router = express.Router();

// 관리자 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    // 사용자 조회
    const user = await User.findOne({
      where: { username, is_active: true }
    });

    if (!user) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 마지막 로그인 시간 업데이트
    await user.update({ last_login: new Date() });

    // 사용자 정보 반환 (비밀번호 제외)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department
    };

    res.json({
      message: '로그인 성공',
      token,
      user: userInfo
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 토큰 검증
router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'username', 'email', 'full_name', 'role', 'department', 'is_active']
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
    }

    res.json(user);

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
});

// QR 세션 생성 (작업자용)
router.post('/qr/session', async (req, res) => {
  try {
    const { moldId } = req.body;

    if (!moldId) {
      return res.status(400).json({ error: '금형 ID가 필요합니다.' });
    }

    // QR 세션 토큰 생성 (24시간 유효)
    const sessionToken = jwt.sign(
      { moldId, type: 'qr_session' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'QR 세션이 생성되었습니다.',
      sessionToken,
      moldId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후
    });

  } catch (error) {
    console.error('QR session creation error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
