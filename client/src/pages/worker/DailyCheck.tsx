import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Save,
  HelpCircle,
  Info,
  AlertCircle
} from 'lucide-react';

interface CheckItem {
  id: string;
  category: string;
  item: string;
  description: string;
  isRequired: boolean;
  status: 'good' | 'warning' | 'bad' | null;
  notes: string;
  imageUrl?: string;
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

const DailyCheck: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState<number>(0);
  const [previousShotCount, setPreviousShotCount] = useState<number>(0);

  useEffect(() => {
    fetchMoldInfo();
    initializeCheckItems();
    getCurrentLocation();
  }, [moldId]);

  const fetchMoldInfo = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      if (!token) {
        throw new Error('QR 세션이 만료되었습니다.');
      }

      const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('금형 정보를 불러올 수 없습니다.');
      }

      const data = await response.json();
      setMoldInfo({
        moldNumber: data.moldId,
        name: data.name,
        location: data.location,
        currentShotCount: data.shotCount || 0
      });
      setPreviousShotCount(data.shotCount || 0);
      setShotCount(data.shotCount || 0);
    } catch (error) {
      console.error('Mold info fetch error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
            // 실제로는 역지오코딩 API를 사용하여 주소를 가져올 수 있습니다
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
          maximumAge: 300000 // 5분
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setIsGettingLocation(false);
    }
  };

  const initializeCheckItems = () => {
    const items: CheckItem[] = [
      // 1. 정결관리
      {
        id: 'clean_1',
        category: '1. 정결관리',
        item: '성형부 청결',
        description: '캐비티, 코어, 파팅면, 게이트, 벤트부 이물(수지, 가스, 오일 등) 확인',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'clean_2',
        category: '1. 정결관리',
        item: '파팅면 상태',
        description: '파팅라인에 수지잔사, 찌꺼기 등 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 2. 작동부 점검
      {
        id: 'operation_1',
        category: '2. 작동부 점검',
        item: '슬라이드 작동상태',
        description: '슬라이드 이동 시 걸림/이상음 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'operation_2',
        category: '2. 작동부 점검',
        item: '가이드핀/리테인핀',
        description: '핀손, 마모, 윤활상태 확인',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'operation_3',
        category: '2. 작동부 점검',
        item: '밀핀/제품핀',
        description: '작동 시 떨림, 박힘, 변형 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 3. 냉각관리
      {
        id: 'cooling_1',
        category: '3. 냉각관리',
        item: '냉각라인 상태',
        description: '압출수 라인 연결부 누수/막힘 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'cooling_2',
        category: '3. 냉각관리',
        item: '냉각수 유량',
        description: '좌/우 온도차 5℃ 이하',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 4. 온도·전기·계통
      {
        id: 'temp_1',
        category: '4. 온도·전기·계통',
        item: '히터/온도센서 작동',
        description: '단선, 접촉불량, 과열 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'temp_2',
        category: '4. 온도·전기·계통',
        item: '배선/커넥터',
        description: '피복 손상, 접촉불량 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 5. 체결상태
      {
        id: 'fastening_1',
        category: '5. 체결상태',
        item: '금형 체결볼트',
        description: '풀림, 균열 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'fastening_2',
        category: '5. 체결상태',
        item: '로케이트링/스프루부',
        description: '위치이탈, 손상 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 6. 취출계통
      {
        id: 'ejection_1',
        category: '6. 취출계통',
        item: '취출핀/스트리퍼',
        description: '정상작동, 박힘·마모 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 7. 윤활관리
      {
        id: 'lubrication_1',
        category: '7. 윤활관리',
        item: '슬라이드, 핀류',
        description: '그리스 도포 상태 양호',
        isRequired: true,
        status: null,
        notes: ''
      },
      {
        id: 'lubrication_2',
        category: '7. 윤활관리',
        item: '엘글리/리프트핀',
        description: '그리스 도포 상태 양호',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 8. 이상유무
      {
        id: 'abnormal_1',
        category: '8. 이상유무',
        item: '누유/누수 여부',
        description: '냉각수, 오일, 에어라인 이상 無',
        isRequired: true,
        status: null,
        notes: ''
      },
      // 9. 외관상태
      {
        id: 'appearance_1',
        category: '9. 외관상태',
        item: '금형 외관/명판',
        description: '파손, 식별불가 無',
        isRequired: false,
        status: null,
        notes: ''
      },
      // 10. 방청관리(비가동 시)
      {
        id: 'rust_1',
        category: '10. 방청관리(비가동 시)',
        item: '방청유 도포',
        description: '보관 시 성형면 방청처리',
        isRequired: false,
        status: null,
        notes: ''
      }
    ];
    setCheckItems(items);
  };

  const updateCheckItem = (id: string, field: keyof CheckItem, value: any) => {
    setCheckItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
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

  const canSubmit = () => {
    const requiredItems = checkItems.filter(item => item.isRequired);
    const allItemsChecked = requiredItems.every(item => item.status !== null);
    const shotCountValid = shotCount >= previousShotCount && shotCount > 0;
    return allItemsChecked && shotCountValid;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      alert('필수 점검 항목을 모두 완료해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('qr_session_token');
      
      // 전체 상태 평가
      const badItems = checkItems.filter(item => item.status === 'bad');
      const warningItems = checkItems.filter(item => item.status === 'warning');
      
      let overallStatus = 'normal';
      if (badItems.length > 0) {
        overallStatus = 'abnormal';
      } else if (warningItems.length > 0) {
        overallStatus = 'attention';
      }
      
      const inspectionData = {
        moldId: moldId!,
        moldName: moldInfo?.name || moldId!,
        inspector: '작업자', // 실제로는 로그인한 사용자 정보
        checkDate: new Date().toISOString().split('T')[0],
        checkItems: checkItems.reduce((acc, item) => {
          acc[item.id] = {
            category: item.category,
            item: item.item,
            status: item.status,
            notes: item.notes,
            imageUrl: item.imageUrl
          };
          return acc;
        }, {} as any),
        overallStatus: overallStatus,
        notes: checkItems.filter(item => item.notes).map(item => `${item.item}: ${item.notes}`).join('; '),
        location: moldInfo?.location || '미확인',
        gpsLocation: gpsLocation ? {
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          accuracy: gpsLocation.accuracy,
          address: gpsLocation.address,
          timestamp: gpsLocation.timestamp
        } : null,
        shotCount: shotCount,
        previousShotCount: previousShotCount,
        shotDifference: shotCount - previousShotCount
      };
      
      const response = await fetch(`${API_BASE_URL}/api/worker/daily-inspection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inspectionData)
      });

      if (!response.ok) {
        throw new Error('일상점검 등록에 실패했습니다.');
      }

      const result = await response.json();
      
      alert(`일상점검이 성공적으로 등록되었습니다!\n점검번호: ${result.inspection.inspectionNumber}\n관리자에게 알림이 전송되었습니다.`);
      navigate(`/worker/mold/${moldId}`);
    } catch (error) {
      console.error('Submit error:', error);
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
          <button
            onClick={() => navigate(`/worker/mold/${moldId}`)}
            className="w-full btn-primary"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const groupedItems = checkItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CheckItem[]>);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-neutral-900">일상점검</h1>
              {moldInfo && (
                <p className="text-sm text-neutral-600">{moldInfo.moldNumber} - {moldInfo.name}</p>
              )}
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-neutral-500 hover:text-neutral-700"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">점검 방법</h3>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• 각 항목을 꼼꼼히 확인하고 상태를 선택하세요</li>
                <li>• 필수 항목(*)은 반드시 점검해야 합니다</li>
                <li>• 문제가 발견되면 메모에 상세히 기록하세요</li>
                <li>• 필요시 사진을 첨부할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 space-y-3">
        {/* Mold Info */}
        {moldInfo && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm text-neutral-600">금형 위치</p>
                <p className="font-medium text-neutral-900">{moldInfo.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* 기본 정보 */}
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
                <p className="text-sm font-semibold text-neutral-900">{moldInfo?.moldNumber || moldId}</p>
              </div>
            </div>

            {/* 금형명 */}
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">금형명</label>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <p className="text-sm font-semibold text-neutral-900">{moldInfo?.name || '-'}</p>
              </div>
            </div>

            {/* 현재 위치 */}
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">현재 위치</label>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <p className="text-sm font-semibold text-neutral-900">{moldInfo?.location || '-'}</p>
              </div>
            </div>

            {/* 누적 쇼트수 */}
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">누적 쇼트수</label>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <p className="text-sm font-semibold text-neutral-900">
                  {previousShotCount.toLocaleString()} 회
                  <span className="text-xs text-neutral-500 ml-1">일상점검 데이터 반영</span>
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

        {/* 일상점검 안내 */}
        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-white border-2 border-blue-300 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-blue-900 mb-1">📋 일상점검 안내</h4>
              <p className="text-xs text-blue-700 mb-2">매일 작업 시작 전 금형 상태를 점검하여 안전한 생산을 보장합니다.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
              <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm">
                <span className="text-blue-600">✓</span> 점검 주기
              </h5>
              <p className="text-xs text-gray-700">• <span className="font-semibold">매일 작업 시작 전</span> 필수 점검</p>
              <p className="text-xs text-gray-700">• 작업 중 이상 발견 시 즉시 점검</p>
            </div>

            <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
              <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm">
                <span className="text-blue-600">✓</span> 점검 항목
              </h5>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                <p>• 금형 외관 상태</p>
                <p>• 냉각수 누수</p>
                <p>• 게이트/런너 상태</p>
                <p>• 에젝터 핀 작동</p>
                <p>• 슬라이드 작동</p>
                <p>• 안전장치 작동</p>
              </div>
            </div>

            <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
              <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm">
                <span className="text-blue-600">✓</span> 누적타수 관리
              </h5>
              <p className="text-xs text-gray-700">• 금형에 표시된 현재 누적타수를 정확히 입력</p>
              <p className="text-xs text-gray-700">• 일상점검 시 자동으로 타수 이력 관리</p>
              <p className="text-xs text-gray-700">• 정기점검 및 세척/습합 주기 알림에 활용</p>
            </div>
          </div>

          <div className="mt-3 p-2 bg-white/60 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <span className="font-semibold">중요:</span> 이상 발견 시 즉시 작업을 중단하고 관리자에게 보고해주세요.
            </p>
          </div>
        </div>

        {/* Check Items by Category */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">{category}</h3>
            
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="border border-neutral-200 rounded-lg p-2 flex items-center gap-2">
                  {/* Item Name */}
                  <div className="min-w-[120px]">
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
                      // TODO: Implement camera functionality
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

        {/* Submit Button */}
        <div className="pb-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || submitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              canSubmit() && !submitting
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>등록 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-4 w-4" />
                <span>일상점검 완료</span>
              </div>
            )}
          </button>
          
          {!canSubmit() && (
            <div className="text-sm text-red-600 text-center mt-2 space-y-1">
              {checkItems.filter(item => item.isRequired && item.status === null).length > 0 && (
                <p>• 필수 점검 항목(*)을 모두 완료해주세요.</p>
              )}
              {(shotCount < previousShotCount || shotCount === 0) && (
                <p>• 현재 누적타수를 정확히 입력해주세요.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyCheck;
