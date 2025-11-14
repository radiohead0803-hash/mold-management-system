// 금형 체크리스트 데이터 구조
export interface CheckItem {
  id: string;
  item: string;
  spec?: string;
  specType?: 'checkbox' | 'input' | 'checkbox-inspection' | 'text' | 'select-inspection' | 'date-inspection';
  specOptions?: string[];
  specValue?: string;
  inspectionValue?: string;
  checked: boolean;
}

export interface CategorySection {
  id: string;
  title: string;
  enabled: boolean;
  items: CheckItem[];
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

// Ⅰ. 원재료 (Material)
export const materialCategory: CategorySection = {
  id: 'material',
  title: 'Ⅰ. 원재료 (Material)',
  enabled: true,
  items: [
    { id: 'mat1', item: '수축률', specType: 'input', specValue: '6/1000', checked: false },
    { id: 'mat2', item: '소재 (MS SPEC)', specType: 'input', specValue: 'PA66-GF30 (MS211-47)', checked: false },
    { id: 'mat3', item: '공급 업체', specType: 'input', specValue: '', checked: false }
  ],
  attachments: []
};

// Ⅱ. 금형 (Mold)
export const moldCategory: CategorySection = {
  id: 'mold',
  title: 'Ⅱ. 금형 (Mold)',
  enabled: true,
  items: [
    // 1. 기본 정보
    { id: 'mold1', item: '금형 발주 품번·품목 아이템 사양 일치', specType: 'checkbox-inspection', specOptions: ['확인', '미확인'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold2', item: '양산차 조건 제작 사양 반영', specType: 'checkbox-inspection', specOptions: ['유', '무'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold3', item: '수축률', specType: 'input', specValue: '6/1000', checked: false },
    { id: 'mold4', item: '금형 중량', specType: 'input', specValue: '0.6 ton', checked: false },
    { id: 'mold5', item: '범퍼 히든파팅 적용', specType: 'checkbox-inspection', specOptions: ['적용', '미적용', '사양 상이'], specValue: '', inspectionValue: '', checked: false },
    
    // 2. 재질
    { id: 'mold6', item: '캐비티 재질', specType: 'select-inspection', specOptions: ['HS-PA (KP4)', 'CENA G', 'HPA4MA', 'KP-1', 'KP-4', 'KP-4M', 'NAK-80'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold7', item: '코어 재질', specType: 'select-inspection', specOptions: ['HS-PA (KP4)', 'CENA G', 'HPA4MA', 'KP-1', 'KP-4', 'KP-4M', 'NAK-80'], specValue: '', inspectionValue: '', checked: false },
    
    // 3. 게이트 구성
    { id: 'mold8', item: '캐비티 수', specType: 'checkbox-inspection', specOptions: ['1', '2', '3', '4', '5', '6'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold9', item: '게이트 형식', specType: 'checkbox-inspection', specOptions: ['오픈', '밸브'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold10', item: '게이트 수', specType: 'checkbox-inspection', specOptions: ['1', '2', '3', '4', '5', '6'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold11', item: '게이트 위치 적정성', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold12', item: '게이트 사이즈 확인', specType: 'checkbox-inspection', specOptions: ['확인', '미확인'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold13', item: '게이트 컷팅 형상 적정성', specType: 'checkbox-inspection', specOptions: ['캐비티', '오버랩'], specValue: '', inspectionValue: '', checked: false },
    
    // 4. 이젝트·냉각·센서
    { id: 'mold14', item: '이젝핀', specType: 'checkbox-inspection', specOptions: ['원형', '사각', '취출 불량 여부'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold15', item: '노즐·게이트 금형 각인', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold16', item: '냉각라인 위치·스케일 20mm 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold17', item: '온도센서 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold18', item: '온도센서 수(캐비티/코어)', specType: 'input', specValue: '', checked: false },
    
    // 5. 금형 일반 구조 및 상태
    { id: 'mold19', item: '금형 스페어 리스트 접수(소금부 아이템)', specType: 'date-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold20', item: '금형 인자표 초도 T/O일정 접수', specType: 'date-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold21', item: '금형 정보 접수(사이즈·톤수·캐비티 수·형체력)', specType: 'date-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold22', item: '금형 정보 전산 등록', specType: 'date-inspection', specOptions: ['완료', '미완료'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold23', item: '금형 외관 도색 상태', specType: 'date-inspection', specOptions: ['양호', '불량'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold24', item: '금형 먕판 부착', specType: 'date-inspection', specOptions: ['부착', '미부착'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold25', item: '금형 켈린더 및 제질 각인', specType: 'date-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold26', item: '파팅 구조 적정성(찍힘/손상/버 발생 가능)', specType: 'checkbox-inspection', specOptions: ['양호', '불량'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold27', item: '내구성 확인(측면 습합 등 금형 크랙 여부)', specType: 'checkbox-inspection', specOptions: ['양호', '불량'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold28', item: '소프트 게이트 적용', specType: 'checkbox-inspection', specOptions: ['적용', '미적용'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold29', item: '콜드 슬러그 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mold30', item: '기타 특이사항 1', specType: 'input', specValue: '', checked: false },
    { id: 'mold31', item: '기타 특이사항 2', specType: 'input', specValue: '', checked: false },
    { id: 'mold32', item: '기타 특이사항 3', specType: 'input', specValue: '', checked: false },
    { id: 'mold33', item: '기타 특이사항 4', specType: 'input', specValue: '', checked: false },
    { id: 'mold34', item: '기타 특이사항 5', specType: 'input', specValue: '', checked: false }
  ],
  attachments: []
};

// Ⅲ. 가스 배기 (Gas Vent)
export const gasVentCategory: CategorySection = {
  id: 'gasvent',
  title: 'Ⅲ. 가스 배기 (Gas Vent)',
  enabled: true,
  items: [
    { id: 'gas1', item: '가스 빼기 금형 전반 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'gas2', item: '가스 빼기 2/100 또는 3/100 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'gas3', item: '가스 빼기 피차간 거리 30mm 간격 유지', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'gas4', item: '가스 빼기 폭 7mm 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'gas5', item: '가스 빼기 위치 적절성', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'gas6', item: '가스 발생 예상 구간 추가 벤트 여부', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false }
  ],
  attachments: []
};

// Ⅳ. 성형 해석 (Moldflow 등)
export const moldflowCategory: CategorySection = {
  id: 'moldflow',
  title: 'Ⅳ. 성형 해석 (Moldflow 등)',
  enabled: true,
  items: [
    { id: 'flow1', item: '중 대물류 및 도금 아이템 성형 해석 실행', specType: 'date-inspection', specOptions: ['실행', '미실행'], specValue: '', inspectionValue: '', checked: false },
    { id: 'flow2', item: '성형성 확인(미성형 발생부 확인)', specType: 'checkbox-inspection', specOptions: ['확인', '미확인'], specValue: '', inspectionValue: '', checked: false },
    { id: 'flow3', item: '변형발생 구조 확인(제품두께,날판구조 확인)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'flow4', item: '웰드라인 위치 확인', specType: 'checkbox-inspection', specOptions: ['확인', '미확인'], specValue: '', inspectionValue: '', checked: false },
    { id: 'flow5', item: '웰드라인 구조 형상 삭제 검토', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'flow6', item: '가스 발생 부위 확인', specType: 'checkbox-inspection', specOptions: ['확인', '미확인'], specValue: '', inspectionValue: '', checked: false }
  ],
  attachments: []
};

// Ⅴ. 싱크마크 (Sink Mark)
export const sinkMarkCategory: CategorySection = {
  id: 'sinkmark',
  title: 'Ⅴ. 싱크마크 (Sink Mark)',
  enabled: true,
  items: [
    { id: 'sink1', item: '전체 리브 0.6t 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'sink2', item: '싱크 발생 구조(제품 두께 편차)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'sink3', item: '예각 부위 구조 확인(제품 살빼기 반영)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false }
  ],
  attachments: []
};

// Ⅵ. 취출 (Ejection)
export const ejectionCategory: CategorySection = {
  id: 'ejection',
  title: 'Ⅵ. 취출 (Ejection)',
  enabled: true,
  items: [
    { id: 'eject1', item: '제품 취출 구조(범퍼 하단 매칭부)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'eject2', item: '제품 취출구조(범퍼 휠아치)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'eject3', item: '언더컷 구조 확인', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'eject4', item: '빼기 구배 3~5도', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'eject5', item: '제품 취출 구조(보스 구배)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'eject6', item: '제품 취출 구조(도그하우스 취출)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'eject7', item: '제품 취출 언더컷 위치 및 엠보 확인', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false }
  ],
  attachments: []
};

// Ⅶ. MIC 제품 (MICA 스펙클 등)
export const micCategory: CategorySection = {
  id: 'mic',
  title: 'Ⅶ. MIC 제품 (MICA 스펙클 등)',
  enabled: true,
  items: [
    { id: 'mic1', item: 'MIC 사양 게이트 형상 반영(고객사 제안 게이트)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mic2', item: '성형해석 통한 제품 두께 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mic3', item: '웰드라인 확인 및 도장 사양', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'mic4', item: 'A,B면 외관 플레이크 확인', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false }
  ],
  attachments: []
};

// Ⅷ. 도금 (Coating)
export const coatingCategory: CategorySection = {
  id: 'coating',
  title: 'Ⅷ. 도금 (Coating)',
  enabled: true,
  items: [
    { id: 'coat1', item: '게이트 위치/개수 최적화(ABS:250mm·PC+ABS:200m)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat2', item: '수축률', specType: 'input', specValue: '/1000', checked: false },
    { id: 'coat3', item: '보스 조립부 엣지 1R 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat4', item: '보스 십자리브 R값 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat5', item: '보스 내경(M4=3.6, M5=4.6 등)', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat6', item: '액고임 방지구조', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat7', item: '제품 두께 3.0t', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat8', item: '도금성확보를 위한 제품각도 적절성', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat9', item: '차폐막 형상 도면 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat10', item: '차폐막 컷팅 외곽 미노출', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat11', item: '게이트 컷팅 외곽 미노출', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'coat12', item: 'TPO와 도금 스크류 조립홀 금형 도면 이원화', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false }
  ],
  attachments: []
};

// Ⅸ. 리어 백빔 (Rear Back Beam)
export const rearBeamCategory: CategorySection = {
  id: 'rearbeam',
  title: 'Ⅸ. 리어 백빔 (Rear Back Beam)',
  enabled: true,
  items: [
    { id: 'beam1', item: '리어 백빔 금형구배 5도 이상', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'beam2', item: '리어 백빔 제품 끝단부 두께 5.0t 이상', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'beam3', item: '후가공 홀 각인 금형 반영', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'beam4', item: '후가공 홀 핀: 탭 타입', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'beam5', item: '가이드핀 용접부 음각형상', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false },
    { id: 'beam6', item: '가이드핀 위치 및 유동', specType: 'checkbox-inspection', specOptions: ['반영', '미반영'], specValue: '', inspectionValue: '', checked: false }  ],
  attachments: []
};

export const allCategories = [
  materialCategory,
  moldCategory,
  gasVentCategory,
  moldflowCategory,
  sinkMarkCategory,
  ejectionCategory,
  micCategory,
  coatingCategory,
  rearBeamCategory
];
