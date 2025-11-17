import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { 
  ArrowLeft, CheckCircle, AlertTriangle, Camera, Save,
  HelpCircle, Info, Calendar, AlertCircle
} from 'lucide-react';

interface CheckItem {
  id: string;
  category: string;
  item: string;
  description: string;
  inputType: string;
  isRequired: boolean;
  status: 'good' | 'warning' | 'bad' | null;
  notes: string;
  imageUrl?: string;
  numericValue?: number;
}

interface MoldBasicInfo {
  moldNumber: string;
  name: string;
  location: string;
  currentShotCount: number;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  timestamp: string;
}

interface CheckLevel {
  level: string;
  shotCount: number;
  description: string;
  isRecommended: boolean;
}

const PeriodicCheck: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [checkResult, setCheckResult] = useState<'good' | 'maintenance' | 'repair' | null>(null);
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState<number>(0);
  const [previousShotCount, setPreviousShotCount] = useState<number>(0);

  const checkLevels: CheckLevel[] = [
    { level: '20,000 SHOT 점검', shotCount: 20000, description: '파팅면/성형면, 벤트/게이트부, 습합, 취출계통, 작동부, 히터/센서, 표면처리, 볼트너트, 냉각/유압 연결부', isRecommended: false },
    { level: '50,000 SHOT 점검', shotCount: 50000, description: '냉각라인, 표준치수/인서트치수 + 20,000 SHOT 항목', isRecommended: false },
    { level: '100,000 SHOT 점검', shotCount: 100000, description: '냉각홀 스케일 + 50,000 SHOT 항목 + 20,000 SHOT 항목', isRecommended: false }
  ];

  useEffect(() => {
    fetchMoldInfo();
    getCurrentLocation();
  }, [moldId]);

  useEffect(() => {
    if (moldInfo) {
      determineRecommendedLevel();
      initializeCheckItems();
    }
  }, [moldInfo]);

  const fetchMoldInfo = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('금형 정보를 불러올 수 없습니다.');
      const data = await response.json();
      const currentShot = data.shotCount || 0;
      setMoldInfo({
        moldNumber: data.moldId,
        name: data.name,
        location: data.location,
        currentShotCount: currentShot
      });
      setPreviousShotCount(currentShot);
      setShotCount(currentShot);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const determineRecommendedLevel = () => {
    if (!moldInfo) return;
    const currentShot = moldInfo.currentShotCount;
    
    // 각 SHOT 레벨에 대해 마지막 점검 이후 경과한 SHOT 수를 계산
    checkLevels.forEach(level => {
      const shotsSinceLastCheck = currentShot % level.shotCount;
      const progress = (shotsSinceLastCheck / level.shotCount) * 100;
      // 90% 이상 도달하면 점검 권장
      level.isRecommended = progress >= 90;
    });
    
    // 권장되는 레벨 중 가장 낮은 SHOT 수의 레벨을 자동 선택
    const recommended = checkLevels
      .filter(l => l.isRecommended)
      .sort((a, b) => a.shotCount - b.shotCount)[0];
      
    if (recommended && !selectedLevel) {
      setSelectedLevel(recommended.level);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            const address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`;
            
            const gpsData: GPSLocation = {
              latitude,
              longitude,
              accuracy,
              address,
              timestamp: new Date().toISOString()
            };
            
            setGpsLocation(gpsData);
          } catch (error) {
            console.error('주소 변환 실패:', error);
            setLocationError('주소 변환에 실패했습니다.');
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error('위치 정보 획득 실패:', error);
          let errorMessage = '위치 정보를 가져올 수 없습니다.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
              break;
          }
          
          setLocationError(errorMessage);
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setIsGettingLocation(false);
    }
  };

  const initializeCheckItems = () => {
    const items: CheckItem[] = [
      // 20,000 SHOT 점검 항목
      { id: 'part_1', category: '1. 파팅면/성형면 (20,000 SHOT)', item: '파팅면 단차, 틈새', description: '단차 ±0.02mm, 이상 시 습합 교정', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'part_2', category: '1. 파팅면/성형면 (20,000 SHOT)', item: '성형면 손상', description: '표면손상 無, 틈으 시 물리싱', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'vent_1', category: '2. 벤트/게이트부 (20,000 SHOT)', item: '벤트홀 청결', description: '막힘 등 → 막힘 시 0.03mm 재가공', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'slide_1', category: '3. 작동부 (20,000 SHOT)', item: '슬라이드 작동상태', description: '작동 시 걸림·이상음·누유 여부 / 원활 작동', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'join_1', category: '7. 습합(접합) (20,000 SHOT)', item: '파팅면 광택 / 단차', description: '상·하 금형 단차, 접촉오차 확인 / ±0.02mm 이내', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'eject_1', category: '8. 취출계통 (20,000 SHOT)', item: '밀핀 / 스트리퍼 작동', description: '취출 시 박힘, 걸림, 변형 여부 / 원활 작동', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'conn_1', category: '9. 냉각/유압 연결부 (20,000 SHOT)', item: '누유 / 누수 여부', description: '조인트, 커넥터, 호스 상태 확인 / 누유·누수 無', inputType: '선택', isRequired: true, status: null, notes: '' },
      
      // 50,000 SHOT 추가 점검 항목
      { id: 'vent_2', category: '2. 벤트/게이트부 (50,000 SHOT)', item: '게이트부 마모', description: '핀, 인서트 마모상태 점검 / 마모 ≤0.05mm', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'slide_2', category: '3. 작동부 (50,000 SHOT)', item: '가이드핀/리테인핀', description: '마모, 유격 측정 / 유격 ±0.02mm', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'slide_3', category: '3. 작동부 (50,000 SHOT)', item: '리프트핀/엘글리', description: '작동 시 마모, 변형 여부 / 이상 無', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'cool_1', category: '4. 냉각라인 (50,000 SHOT)', item: '냉각수 유량 / 온도편차', description: '유량저하, 막힘, 누수 여부 / 유량저하 ±10%, 누수 無', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'heat_1', category: '5. 히터/센서/배선 (50,000 SHOT)', item: '히터 단선, 접촉불량', description: '저항값 정상 ±10% 이내 / 정상저항 유지', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'heat_2', category: '5. 히터/센서/배선 (50,000 SHOT)', item: '온도센서, 배선', description: '피복 손상, 접속상태 확인 / 이상 無', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'coat_1', category: '6. 표면처리(코팅) (50,000 SHOT)', item: '경질 / 크롬층 상태', description: '박리, 변색, 코팅두께 확인 / 이상 無, 틈으 시 재코팅', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'join_2', category: '7. 습합(접합) (50,000 SHOT)', item: '가이드 정렬도', description: '가이드핀 각 수평각 측정 / ±0.02mm 이내', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'eject_2', category: '8. 취출계통 (50,000 SHOT)', item: '취출핀 마모', description: '핀 마모, 손상 여부 / 이상 無', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'bolt_1', category: '12. 볼트너트/볼트게이트 (50,000 SHOT)', item: '작동상태 점검', description: '슬슬 후 작동, 판탈림 여부 / 정상작동', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'bolt_2', category: '12. 볼트너트/볼트게이트 (50,000 SHOT)', item: '배선절연 상태', description: '피복손상, 접속상태 확인 / 이상 無', inputType: '선택', isRequired: true, status: null, notes: '' },
      
      // 100,000 SHOT 추가 점검 항목
      { id: 'cool_2', category: '4. 냉각라인 (100,000 SHOT)', item: '냉각홀 스케일', description: '냉각수홀 스케일, 이물 여부 / 정결 유지, 틈으 시 세척', inputType: '선택', isRequired: true, status: null, notes: '' },
      { id: 'dim_1', category: '13. 표준치수/인서트치수 (100,000 SHOT)', item: '주요 치수 확인', description: '도면대비 편차 확인 / ±0.05mm 이내', inputType: '선택', isRequired: true, status: null, notes: '' }
    ];
    setCheckItems(items);
  };

  const updateCheckItem = (id: string, field: keyof CheckItem, value: any) => {
    setCheckItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const getStatusColor = (status: CheckItem['status']) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bad': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: CheckItem['status']) => {
    switch (status) {
      case 'good': return '양호';
      case 'warning': return '주의';
      case 'bad': return '불량';
      default: return '미점검';
    }
  };

  const getFilteredCheckItems = () => {
    if (!selectedLevel) return checkItems;
    
    // 선택된 SHOT 레벨에 따라 점검 항목 필터링 (누적 방식)
    const shotLevelMap: { [key: string]: string[] } = {
      '20,000 SHOT 점검': [
        '1. 파팅면/성형면 (20,000 SHOT)',
        '2. 벤트/게이트부 (20,000 SHOT)',
        '3. 작동부 (20,000 SHOT)',
        '7. 습합(접합) (20,000 SHOT)',
        '8. 취출계통 (20,000 SHOT)',
        '9. 냉각/유압 연결부 (20,000 SHOT)'
      ],
      '50,000 SHOT 점검': [
        // 20,000 SHOT 항목 포함
        '1. 파팅면/성형면 (20,000 SHOT)',
        '2. 벤트/게이트부 (20,000 SHOT)',
        '3. 작동부 (20,000 SHOT)',
        '7. 습합(접합) (20,000 SHOT)',
        '8. 취출계통 (20,000 SHOT)',
        '9. 냉각/유압 연결부 (20,000 SHOT)',
        // 50,000 SHOT 추가 항목
        '2. 벤트/게이트부 (50,000 SHOT)',
        '3. 작동부 (50,000 SHOT)',
        '4. 냉각라인 (50,000 SHOT)',
        '5. 히터/센서/배선 (50,000 SHOT)',
        '6. 표면처리(코팅) (50,000 SHOT)',
        '7. 습합(접합) (50,000 SHOT)',
        '8. 취출계통 (50,000 SHOT)',
        '12. 볼트너트/볼트게이트 (50,000 SHOT)'
      ],
      '100,000 SHOT 점검': [
        // 모든 항목 포함 (전체 점검)
        '1. 파팅면/성형면 (20,000 SHOT)',
        '2. 벤트/게이트부 (20,000 SHOT)',
        '2. 벤트/게이트부 (50,000 SHOT)',
        '3. 작동부 (20,000 SHOT)',
        '3. 작동부 (50,000 SHOT)',
        '4. 냉각라인 (50,000 SHOT)',
        '4. 냉각라인 (100,000 SHOT)',
        '5. 히터/센서/배선 (50,000 SHOT)',
        '6. 표면처리(코팅) (50,000 SHOT)',
        '7. 습합(접합) (20,000 SHOT)',
        '7. 습합(접합) (50,000 SHOT)',
        '8. 취출계통 (20,000 SHOT)',
        '8. 취출계통 (50,000 SHOT)',
        '9. 냉각/유압 연결부 (20,000 SHOT)',
        '12. 볼트너트/볼트게이트 (50,000 SHOT)',
        '13. 표준치수/인서트치수 (100,000 SHOT)'
      ]
    };
    
    const allowedCategories = shotLevelMap[selectedLevel] || [];
    return checkItems.filter(item => allowedCategories.includes(item.category));
  };

  const canSubmit = () => {
    if (!selectedLevel) return false;
    const filteredItems = getFilteredCheckItems();
    const requiredItems = filteredItems.filter(item => item.isRequired);
    return requiredItems.every(item => item.status !== null) && checkResult !== null;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      alert('필수 점검 항목을 모두 완료하고 점검 결과를 선택해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('qr_session_token');
      const inspectionData = {
        moldId: moldId!,
        moldName: moldInfo?.name || moldId!,
        inspector: '작업자',
        checkDate: new Date().toISOString().split('T')[0],
        checkLevel: selectedLevel,
        shotCount: moldInfo?.currentShotCount || 0,
        checkItems: checkItems.reduce((acc, item) => {
          acc[item.id] = { category: item.category, item: item.item, status: item.status, notes: item.notes, imageUrl: item.imageUrl, numericValue: item.numericValue };
          return acc;
        }, {} as any),
        overallResult: checkResult,
        location: moldInfo?.location || '미확인'
      };
      const response = await fetch(`${API_BASE_URL}/api/worker/periodic-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(inspectionData)
      });
      if (!response.ok) throw new Error('정기점검 등록에 실패했습니다.');
      const result = await response.json();
      alert(`정기점검이 성공적으로 등록되었습니다!\n점검번호: ${result.inspection.inspectionNumber}`);
      navigate(`/worker/mold/${moldId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">금형 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">오류 발생</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="w-full btn-primary">돌아가기</button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredCheckItems();
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CheckItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 text-neutral-500 hover:text-neutral-700"><ArrowLeft className="h-5 w-5" /></button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-neutral-900">정기점검</h1>
              {moldInfo && <p className="text-sm text-neutral-600">{moldInfo.moldNumber} - {moldInfo.name}</p>}
            </div>
            <button onClick={() => setShowHelp(!showHelp)} className="p-2 text-neutral-500 hover:text-neutral-700"><HelpCircle className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="bg-purple-50 border-b border-purple-200 p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-purple-900">정기점검 안내</h3>
              <ul className="text-sm text-purple-800 mt-2 space-y-1">
                <li>• 샷수에 따라 권장 점검 레벨이 자동으로 표시됩니다</li>
                <li>• 각 항목을 꼼꼼히 확인하고 상태를 선택하세요</li>
                <li>• 문제가 발견되면 메모에 상세히 기록하세요</li>
                <li>• 점검 완료 후 종합 결과를 선택해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {/* 기본 정보 */}
        {moldInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-100 rounded">
                <Info className="h-4 w-4 text-orange-600" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">기본 금형 정보 (자동 입력)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 금형번호 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">금형번호</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">{moldInfo.moldNumber}</p>
                </div>
              </div>

              {/* 금형명 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">금형명</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">{moldInfo.name}</p>
                </div>
              </div>

              {/* 현재 위치 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">현재 위치</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">{moldInfo.location}</p>
                </div>
              </div>

              {/* 누적 쇼트수 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">누적 쇼트수</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">
                    {moldInfo.currentShotCount.toLocaleString()} 회
                  </p>
                </div>
              </div>

              {/* 신규 입력 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">신규 입력</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-sm font-semibold text-neutral-900">
                    {new Date().toLocaleString('ko-KR', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* GPS 위치 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">GPS 위치</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg min-h-[48px] flex items-center">
                  {isGettingLocation ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                      <span className="text-xs text-neutral-500">위치 확인 중...</span>
                    </div>
                  ) : locationError ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-red-600">{locationError}</span>
                      <button
                        onClick={getCurrentLocation}
                        className="text-xs text-primary-600 hover:text-primary-700 underline"
                      >
                        다시 시도
                      </button>
                    </div>
                  ) : gpsLocation ? (
                    <div className="w-full">
                      <p className="text-sm font-semibold text-primary-600">
                        {gpsLocation.address}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        정확도: ±{Math.round(gpsLocation.accuracy)}m
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-neutral-500">위치 정보 없음</span>
                  )}
                </div>
              </div>

              {/* 현재 누적타수 입력 */}
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">현재 누적타수 *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={shotCount}
                    onChange={(e) => setShotCount(Number(e.target.value))}
                    className="w-full p-3 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="현재 타수를 입력하세요"
                    min={previousShotCount}
                  />
                  {shotCount < previousShotCount && shotCount > 0 && (
                    <div className="absolute -bottom-6 left-0 right-0">
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        이전 타수보다 작을 수 없습니다
                      </span>
                    </div>
                  )}
                  {shotCount > previousShotCount && (
                    <div className="absolute -bottom-6 left-0 right-0">
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        금일 증가: +{(shotCount - previousShotCount).toLocaleString()} 회
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 정기점검 주기 안내 */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-4 shadow-md">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-purple-900 mb-1">📅 정기점검 주기 구분표 (SHOT 단위 + 기간 병행)</h4>
              <p className="text-xs text-purple-700">금형의 누적 쇼트수와 기간에 따라 정기점검을 실시합니다.</p>
            </div>
          </div>
          
          <div className="bg-white/90 rounded-lg p-3 border border-purple-200 space-y-2">
            {/* 20,000 SHOT 점검 */}
            <div className="border-l-4 border-blue-500 pl-2 py-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">20,000 SHOT 점검</div>
                <span className="text-xs text-gray-600">기간: 3개월</span>
              </div>
              <div className="text-xs text-gray-700 leading-relaxed">
                <span className="font-semibold">1.</span> 파팅면/성형면 <span className="font-semibold">2.</span> 벤트/게이트부 <span className="font-semibold">3.</span> 작동부(슬라이드·핀류) <span className="font-semibold">7.</span> 습합(접합) <span className="font-semibold">8.</span> 취출계통 <span className="font-semibold">9.</span> 냉각/유압 연결부
              </div>
            </div>

            {/* 50,000 SHOT 점검 */}
            <div className="border-l-4 border-purple-500 pl-2 py-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs font-bold">50,000 SHOT 점검</div>
                <span className="text-xs text-gray-600">기간: 6개월</span>
              </div>
              <div className="text-xs text-gray-700 mb-1">
                <span className="text-purple-700 font-semibold">✓ 20,000 SHOT 항목 + 추가 점검</span>
              </div>
              <div className="text-xs text-gray-700 leading-relaxed">
                <span className="font-semibold">2.</span> 게이트부 마모 <span className="font-semibold">3.</span> 가이드핀/리테인핀 <span className="font-semibold">3.</span> 리프트핀/엘글리 <span className="font-semibold">4.</span> 냉각수 유량/온도편차 <span className="font-semibold">5.</span> 히터 단선, 접촉불량 <span className="font-semibold">5.</span> 온도센서, 배선 <span className="font-semibold">6.</span> 경질/크롬층 상태 <span className="font-semibold">7.</span> 가이드 정렬도 <span className="font-semibold">8.</span> 취출핀 마모 <span className="font-semibold">12.</span> 작동상태 점검 <span className="font-semibold">12.</span> 배선절연 상태
              </div>
            </div>

            {/* 100,000 SHOT 점검 */}
            <div className="border-l-4 border-red-500 pl-2 py-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">100,000 SHOT 점검</div>
                <span className="text-xs text-gray-600">기간: 1년</span>
              </div>
              <div className="text-xs text-gray-700 mb-1">
                <span className="text-red-700 font-semibold">✓ 50,000 SHOT 항목 + 20,000 SHOT 항목 + 추가 점검</span>
              </div>
              <div className="text-xs text-gray-700 leading-relaxed">
                <span className="font-semibold">4.</span> 냉각홀 스케일 <span className="font-semibold">13.</span> 주요 치수 확인
              </div>
              <div className="text-xs text-red-700 font-semibold mt-1">※ 전체 종합 점검 및 성능 평가</div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-white/60 rounded-lg">
            <p className="text-xs text-purple-700">
              💡 <span className="font-semibold">자동 알림:</span> 각 점검 주기의 90% 도달 시 자동으로 알림이 발송됩니다.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg"><Calendar className="h-5 w-5 text-purple-600" /></div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">점검 레벨 선택</h3>
              <p className="text-sm text-neutral-600">샷수 기준 권장 레벨</p>
            </div>
          </div>
          <div className="space-y-3">
            {checkLevels.map((level) => {
              const currentShot = moldInfo?.currentShotCount || 0;
              const progress = ((currentShot % level.shotCount) / level.shotCount) * 100;
              const isSelected = selectedLevel === level.level;
              return (
                <button key={level.level} onClick={() => setSelectedLevel(level.level)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected ? 'border-purple-500 bg-purple-50' :
                    level.isRecommended ? 'border-amber-400 bg-amber-50' :
                    'border-slate-200 bg-white hover:border-purple-300'
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-neutral-900">{level.level}</h4>
                        {level.isRecommended && <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold">권장</span>}
                        {isSelected && <CheckCircle className="h-5 w-5 text-purple-600" />}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{level.description}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>기준: {level.shotCount.toLocaleString()}회</span>
                        <span>•</span>
                        <span>진행률: {progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${progress >= 95 ? 'bg-red-500' : progress >= 90 ? 'bg-amber-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedLevel && (
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-base font-bold text-purple-900">선택된 점검: {selectedLevel}</h4>
                <p className="text-xs text-purple-700">
                  총 {filteredItems.length}개 항목 점검 (필수: {filteredItems.filter(i => i.isRequired).length}개)
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.keys(groupedItems).map((category) => (
                <span key={category} className="px-3 py-1 bg-white/80 border border-purple-200 rounded-full text-xs font-medium text-purple-800">
                  {category.split(' (')[0]} ({groupedItems[category].length})
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedLevel && Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">{category}</h3>
            
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="border border-neutral-200 rounded-lg p-2 flex items-center gap-2">
                  {/* Item Name */}
                  <div className="min-w-[140px]">
                    <h4 className="text-xs font-medium text-neutral-900">
                      {item.item}
                      {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-[150px]">
                    <p className="text-xs text-neutral-600">{item.description}</p>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateCheckItem(item.id, 'status', 'good')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        item.status === 'good'
                          ? 'bg-green-100 border border-green-300 text-green-800'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-green-50'
                      }`}
                    >
                      양호
                    </button>
                    <button
                      onClick={() => updateCheckItem(item.id, 'status', 'warning')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        item.status === 'warning'
                          ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-yellow-50'
                      }`}
                    >
                      주의
                    </button>
                    <button
                      onClick={() => updateCheckItem(item.id, 'status', 'bad')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        item.status === 'bad'
                          ? 'bg-red-100 border border-red-300 text-red-800'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-red-50'
                      }`}
                    >
                      불량
                    </button>
                  </div>

                  {/* Notes */}
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateCheckItem(item.id, 'notes', e.target.value)}
                    placeholder="특이사항..."
                    className="w-40 p-1.5 border border-neutral-200 rounded text-xs"
                  />

                  {/* Photo Button */}
                  <button
                    onClick={() => {
                      alert('카메라 기능은 추후 구현 예정입니다.');
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-700 border border-primary-200 rounded hover:bg-primary-50"
                  >
                    <Camera className="h-3 w-3" />
                    사진
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {selectedLevel && (
          <div className="bg-white rounded-xl shadow-lg p-5 border border-purple-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">점검 결과 종합</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={() => setCheckResult('good')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  checkResult === 'good' ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'
                }`}>
                <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${checkResult === 'good' ? 'text-green-600' : 'text-slate-400'}`} />
                <p className="font-bold text-center">양호</p>
                <p className="text-xs text-center text-slate-600 mt-1">정상 사용 가능</p>
              </button>
              <button onClick={() => setCheckResult('maintenance')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  checkResult === 'maintenance' ? 'border-yellow-500 bg-yellow-50' : 'border-slate-200 bg-white hover:border-yellow-300'
                }`}>
                <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${checkResult === 'maintenance' ? 'text-yellow-600' : 'text-slate-400'}`} />
                <p className="font-bold text-center">정비 필요</p>
                <p className="text-xs text-center text-slate-600 mt-1">예방 정비 권장</p>
              </button>
              <button onClick={() => setCheckResult('repair')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  checkResult === 'repair' ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-red-300'
                }`}>
                <AlertTriangle className={`h-8 w-8 mx-auto mb-2 ${checkResult === 'repair' ? 'text-red-600' : 'text-slate-400'}`} />
                <p className="font-bold text-center">수리 필요</p>
                <p className="text-xs text-center text-slate-600 mt-1">즉시 수리 필요</p>
              </button>
            </div>
          </div>
        )}

        <div className="pb-6">
          <button onClick={handleSubmit} disabled={!canSubmit() || submitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              canSubmit() && !submitting ? 'bg-purple-600 text-white hover:bg-purple-700' :
              'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}>
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>등록 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-4 w-4" /><span>정기점검 완료</span>
              </div>
            )}
          </button>
          {!canSubmit() && (
            <div className="text-sm text-red-600 text-center mt-2 space-y-1">
              {!selectedLevel && <p>• 점검 레벨을 선택해주세요.</p>}
              {checkItems.filter(item => item.isRequired && item.id !== '1' && item.id !== '2' && item.status === null).length > 0 && (
                <p>• 필수 점검 항목(*)을 모두 완료해주세요.</p>
              )}
              {!checkResult && <p>• 점검 결과를 선택해주세요.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodicCheck;
