import { Mold, User, Repair, DailyCheck, Inspection } from '../models';

/**
 * 샘플 금형 데이터 생성
 */
export async function createSampleMolds() {
  console.log('📦 Creating sample molds...');

  const progressStages = ['설계중', '제작중', '완료', '보관중'];
  const manufacturers = ['현대', '기아', '제네시스'];
  const itemTypes = ['외판', '내판', '구조물'];
  const locations = ['A-01', 'A-02', 'A-03', 'B-01', 'B-02', 'B-03', 'C-01', 'C-02', 'C-03', 'D-01'];
  const vehicleModels = ['G80', 'GV70', 'GV80', 'K5', 'K8', 'Sonata', 'Tucson', 'Santa Fe'];
  
  // 관리자 사용자 찾기
  const adminUser = await User.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    console.log('⚠️ Admin user not found. Please create demo users first.');
    return [];
  }

  const molds = [];
  
  for (let i = 1; i <= 30; i++) {
    const partNumber = `P-2024-${String(i).padStart(3, '0')}`;
    const progressStage = progressStages[Math.floor(Math.random() * progressStages.length)];
    const storageLocation = locations[Math.floor(Math.random() * locations.length)];
    const vehicleModel = vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
    const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    
    // 계획 완료일 (1-180일 후)
    const completionPlanned = new Date();
    completionPlanned.setDate(completionPlanned.getDate() + Math.floor(Math.random() * 180) + 30);
    
    // 실제 완료일 (완료 상태인 경우만)
    const completionActual = progressStage === '완료' ? new Date() : undefined;

    const mold = await Mold.create({
      part_number: partNumber,
      part_name: `${vehicleModel} ${itemType} ${i}`,
      vehicle_model: vehicleModel,
      item_type: itemType,
      manufacturer,
      investment_cost: Math.floor(Math.random() * 50000000) + 10000000,
      progress_stage: progressStage,
      manufacturing_method: ['프레스', '사출', '다이캐스팅'][Math.floor(Math.random() * 3)],
      supplier_planned: ['공급사A', '공급사B', '공급사C'][Math.floor(Math.random() * 3)],
      supplier_actual: progressStage === '완료' ? ['공급사A', '공급사B'][Math.floor(Math.random() * 2)] : undefined,
      completion_planned: completionPlanned,
      completion_actual: completionActual,
      cvt_quantity: [1, 2, 4][Math.floor(Math.random() * 3)],
      mold_weight: Math.floor(Math.random() * 5000) + 500,
      hot_runner: Math.random() > 0.5,
      gate_count: [2, 4, 8][Math.floor(Math.random() * 3)],
      shrinkage_rate: parseFloat((Math.random() * 0.02 + 0.98).toFixed(4)),
      storage_location: storageLocation,
      storage_position: `${storageLocation}-${Math.floor(Math.random() * 10) + 1}`,
      qr_code: `QR-${partNumber}`,
      created_by: adminUser.id
    });

    molds.push(mold);
  }

  console.log(`✅ Created ${molds.length} sample molds`);
  return molds;
}

/**
 * 샘플 수리 기록 생성
 */
export async function createSampleRepairs() {
  console.log('🔧 Creating sample repair records...');

  const molds = await Mold.findAll();
  const users = await User.findAll();
  
  if (molds.length === 0 || users.length === 0) {
    console.log('⚠️ No molds or users found. Skipping repair records.');
    return [];
  }

  const symptoms = ['금형 파손', '표면 마모', '냉각수 누수', '이젝터 핀 고장', '게이트 막힘'];
  const causes = ['과부하', '노후화', '부적절한 사용', '재질 불량', '설계 결함'];
  const actions = ['부품 교체', '표면 연마', '용접 수리', '청소 및 윤활', '전체 오버홀'];
  const statuses: ('requested' | 'in_progress' | 'completed' | 'cancelled')[] = ['requested', 'in_progress', 'completed'];
  const records = [];

  // 각 금형당 1-2개의 수리 기록 생성
  for (const mold of molds) {
    const recordCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < recordCount; i++) {
      const requestedAt = new Date();
      requestedAt.setDate(requestedAt.getDate() - Math.floor(Math.random() * 180));
      
      const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
      const cause = causes[Math.floor(Math.random() * causes.length)];
      const actionTaken = actions[Math.floor(Math.random() * actions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const record = await Repair.create({
        mold_id: mold.id,
        symptom,
        cause,
        action_taken: actionTaken,
        status,
        photos: [],
        requested_at: requestedAt,
        completed_at: status === 'completed' ? new Date(requestedAt.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) : undefined
      });

      records.push(record);
    }
  }

  console.log(`✅ Created ${records.length} sample repair records`);
  return records;
}

/**
 * 모든 샘플 데이터 생성
 */
export async function createAllSampleData() {
  try {
    console.log('🚀 Starting sample data creation...');
    
    const molds = await createSampleMolds();
    const repairs = await createSampleRepairs();
    
    console.log('✅ Sample data creation completed!');
    console.log(`   - Molds: ${molds.length}`);
    console.log(`   - Repairs: ${repairs.length}`);
    
    return { molds, repairs };
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}
