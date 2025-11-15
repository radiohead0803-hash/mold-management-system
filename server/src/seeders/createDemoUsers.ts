import bcrypt from 'bcryptjs';
import { User } from '../models';

export const createDemoUsers = async () => {
  try {
    console.log('Creating demo users...');

    // 기존 사용자 확인
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    const existingManager = await User.findOne({ where: { username: 'manager' } });

    if (!existingAdmin) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@moldmanagement.com',
        password_hash: adminPasswordHash,
        full_name: '시스템 관리자',
        role: 'admin',
        department: 'IT',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Admin user created: admin / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    if (!existingManager) {
      const managerPasswordHash = await bcrypt.hash('manager123', 10);
      await User.create({
        username: 'manager',
        email: 'manager@moldmanagement.com',
        password_hash: managerPasswordHash,
        full_name: '생산 관리자',
        role: 'manager',
        department: '생산부',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Manager user created: manager / manager123');
    } else {
      console.log('ℹ️ Manager user already exists');
    }

    console.log('Demo users setup completed!');
  } catch (error) {
    console.error('Error creating demo users:', error);
  }
};
