import { sequelize } from '../models';
import { createDemoUsers } from '../seeders/createDemoUsers';
import { createTestMoldsWithQR } from '../seeders/createSampleData';

/**
 * 테스트용 QR 코드 기반 금형 데이터만 생성하는 스크립트
 */
async function main() {
  try {
    console.log('🚀 Starting test molds creation...');
    
    // 데이터베이스 연결
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // 테이블 동기화
    await sequelize.sync({ force: false });
    console.log('✅ Database synced');
    
    // 관리자 사용자가 없으면 생성
    const { User } = require('../models');
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.log('📝 Creating demo users first...');
      await createDemoUsers();
    }
    
    // 테스트 금형 생성
    const testMolds = await createTestMoldsWithQR();
    
    console.log('✅ Test molds creation completed!');
    console.log(`   - Created ${testMolds.length} test molds with QR codes`);
    console.log('\n📋 Test Molds:');
    testMolds.forEach(mold => {
      console.log(`   - ${mold.qr_code}: ${mold.part_name} (${mold.progress_stage})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test molds:', error);
    process.exit(1);
  }
}

main();
