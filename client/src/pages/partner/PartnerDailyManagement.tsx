import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  AlertCircle,
  X,
  CheckCircle,
  User,
  Camera,
  Upload
} from 'lucide-react';

interface MoldData {
  id: number;
  moldId: string;
  name: string;
  location: string;
  status: string;
  shotCount: number;
  maxShotCount: number;
  manager: string;
}

interface DailyCheckItem {
  id: string;
  category: string;
  item: string;
  type: 'visual' | 'measurement' | 'function' | 'cleaning';
  required: boolean;
  unit?: string;
  normalRange?: { min: number; max: number };
}

interface DailyManagementRecord {
  moldId: string;
  moldName: string;
  partnerName: string;
  inspector: string;
  checkDate: string;
  shift: 'day' | 'night';
  operatingHours: number;
  productionCount: number;
  checkItems: {
    [key: string]: {
      status: 'ok' | 'warning' | 'ng';
      value?: number;
      notes?: string;
    };
  };
  overallStatus: 'normal' | 'attention' | 'abnormal';
  notes: string;
  images: File[];
  gpsLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

const PartnerDailyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { moldId } = useParams<{ moldId: string }>();
  
  const [moldData, setMoldData] = useState<MoldData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [managementRecord, setManagementRecord] = useState<DailyManagementRecord>({
    moldId: moldId || '',
    moldName: '',
    partnerName: '정밀금형 주식회사',
    inspector: '',
    checkDate: new Date().toISOString().split('T')[0],
    shift: 'day',
    operatingHours: 0,
    productionCount: 0,
    checkItems: {},
    overallStatus: 'normal',
    notes: '',
    images: [],
    gpsLocation: null
  });

  const dailyCheckItems: DailyCheckItem[] = [
    // 외관 점검
    { id: 'visual_1', category: '외관 점검', item: '금형 표면 상태', type: 'visual', required: true },
    { id: 'visual_2', category: '외관 점검', item: '균열 및 손상', type: 'visual', required: true },
    { id: 'visual_3', category: '외관 점검', item: '부식 및 오염', type: 'visual', required: true },
    
    // 기능 점검
    { id: 'function_1', category: '기능 점검', item: '개폐 동작', type: 'function', required: true },
    { id: 'function_2', category: '기능 점검', item: '이젝터 동작', type: 'function', required: true },
    { id: 'function_3', category: '기능 점검', item: '냉각수 순환', type: 'function', required: true },
    
    // 측정 점검
    { id: 'measure_1', category: '측정 점검', item: '금형 온도', type: 'measurement', required: true, unit: '°C', normalRange: { min: 20, max: 80 } },
    { id: 'measure_2', category: '측정 점검', item: '냉각수 압력', type: 'measurement', required: true, unit: 'bar', normalRange: { min: 2, max: 6 } },
    { id: 'measure_3', category: '측정 점검', item: '캐비티 치수', type: 'measurement', required: false, unit: 'mm' },
    
    // 청소 및 정리
    { id: 'cleaning_1', category: '청소 및 정리', item: '캐비티 청소', type: 'cleaning', required: true },
    { id: 'cleaning_2', category: '청소 및 정리', item: '이젝터 청소', type: 'cleaning', required: true },
    { id: 'cleaning_3', category: '청소 및 정리', item: '주변 정리정돈', type: 'cleaning', required: true }
  ];

  useEffect(() => {
    if (moldId) {
      loadMoldData();
      getCurrentLocation();
    }
  }, [moldId]);

  const loadMoldData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/molds/${moldId}/partner-info`);
      if (response.ok) {
        const data = await response.json();
        setMoldData(data);
        setManagementRecord(prev => ({
          ...prev,
          moldName: data.name
        }));
      }
    } catch (error) {
      console.error('금형 데이터 로드 실패:', error);
      setError('금형 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`;
            
            setManagementRecord(prev => ({
              ...prev,
              gpsLocation: {
                latitude,
                longitude,
                address
              }
            }));
          } catch (error) {
            console.error('주소 변환 실패:', error);
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error('위치 정보 획득 실패:', error);
          setError('위치 정보를 가져올 수 없습니다.');
          setIsGettingLocation(false);
        }
      );
    } else {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setIsGettingLocation(false);
    }
  };

  const handleInputChange = (field: keyof DailyManagementRecord, value: any) => {
    setManagementRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckItemChange = (itemId: string, field: string, value: any) => {
    setManagementRecord(prev => ({
      ...prev,
      checkItems: {
        ...prev.checkItems,
        [itemId]: {
          ...prev.checkItems[itemId],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setManagementRecord(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setManagementRecord(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const fillTestData = () => {
    setManagementRecord(prev => ({
      ...prev,
      inspector: '이점검',
      shift: 'day',
      operatingHours: 8.5,
      productionCount: 1250,
      checkItems: {
        'visual_1': { status: 'ok', notes: '표면 상태 양호' },
        'visual_2': { status: 'ok', notes: '균열 및 손상 없음' },
        'visual_3': { status: 'warning', notes: '약간의 오염 발견, 청소 완료' },
        'function_1': { status: 'ok', notes: '개폐 동작 정상' },
        'function_2': { status: 'ok', notes: '이젝터 동작 원활' },
        'function_3': { status: 'ok', notes: '냉각수 순환 정상' },
        'measure_1': { status: 'ok', value: 45, notes: '온도 정상 범위' },
        'measure_2': { status: 'warning', value: 2.2, notes: '압력 약간 낮음, 모니터링 필요' },
        'measure_3': { status: 'ok', value: 125.5, notes: '치수 정상' },
        'cleaning_1': { status: 'ok', notes: '캐비티 청소 완료' },
        'cleaning_2': { status: 'ok', notes: '이젝터 청소 완료' },
        'cleaning_3': { status: 'ok', notes: '주변 정리정돈 완료' }
      },
      overallStatus: 'attention',
      notes: '전반적으로 양호한 상태이나 냉각수 압력이 약간 낮아 지속적인 모니터링이 필요합니다. 오염 부분은 청소를 완료했으며, 다음 점검 시 압력 상태를 재확인해야 합니다.'
    }));
  };

  const handleSubmit = async () => {
    if (!managementRecord.inspector) {
      setError('점검자를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/partner/daily-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(managementRecord)
      });

      if (!response.ok) {
        throw new Error('일상관리 기록 등록에 실패했습니다.');
      }

      alert('일상관리 기록이 성공적으로 등록되었습니다!');
      navigate('/partner/dashboard');
      
    } catch (error) {
      console.error('기록 등록 실패:', error);
      setError(error instanceof Error ? error.message : '등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">금형 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const groupedItems = dailyCheckItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: DailyCheckItem[] });

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/partner/dashboard')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">일상관리 점검</h1>
              <p className="text-neutral-600 mt-1">일상 점검 및 유지보수를 기록하세요</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fillTestData}
              className="btn-secondary flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              테스트 데이터
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? '저장 중...' : '점검 기록 저장'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">오류가 발생했습니다</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* 금형 정보 */}
          {moldData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">{moldData.moldId}</h3>
                  <p className="text-neutral-600">{moldData.name}</p>
                  <p className="text-sm text-neutral-500">위치: {moldData.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* 점검 기본 정보 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              점검 기본 정보
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  점검자 *
                </label>
                <input
                  type="text"
                  value={managementRecord.inspector}
                  onChange={(e) => handleInputChange('inspector', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="점검자명"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  점검일자
                </label>
                <input
                  type="date"
                  value={managementRecord.checkDate}
                  onChange={(e) => handleInputChange('checkDate', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  근무 교대
                </label>
                <select
                  value={managementRecord.shift}
                  onChange={(e) => handleInputChange('shift', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">주간</option>
                  <option value="night">야간</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  가동 시간 (시간)
                </label>
                <input
                  type="number"
                  value={managementRecord.operatingHours}
                  onChange={(e) => handleInputChange('operatingHours', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  생산 수량 (개)
                </label>
                <input
                  type="number"
                  value={managementRecord.productionCount}
                  onChange={(e) => handleInputChange('productionCount', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 점검 항목들 */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg border p-6">
              <h4 className="text-lg font-medium text-neutral-900 mb-4">{category}</h4>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border-b border-neutral-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-neutral-700">
                        {item.item} {item.required && <span className="text-red-500">*</span>}
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <select
                          value={managementRecord.checkItems[item.id]?.status || ''}
                          onChange={(e) => handleCheckItemChange(item.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">상태 선택</option>
                          <option value="ok">양호</option>
                          <option value="warning">주의</option>
                          <option value="ng">불량</option>
                        </select>
                      </div>
                      
                      {item.type === 'measurement' && (
                        <div>
                          <input
                            type="number"
                            value={managementRecord.checkItems[item.id]?.value || ''}
                            onChange={(e) => handleCheckItemChange(item.id, 'value', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`측정값 ${item.unit ? `(${item.unit})` : ''}`}
                            step="0.1"
                          />
                          {item.normalRange && (
                            <p className="text-xs text-neutral-500 mt-1">
                              정상범위: {item.normalRange.min} ~ {item.normalRange.max} {item.unit}
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <input
                          type="text"
                          value={managementRecord.checkItems[item.id]?.notes || ''}
                          onChange={(e) => handleCheckItemChange(item.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="특이사항"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 종합 평가 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4">종합 평가</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  전체 상태
                </label>
                <select
                  value={managementRecord.overallStatus}
                  onChange={(e) => handleInputChange('overallStatus', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">정상</option>
                  <option value="attention">주의</option>
                  <option value="abnormal">이상</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  종합 의견
                </label>
                <textarea
                  value={managementRecord.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="전체적인 상태 및 특이사항을 기록하세요"
                />
              </div>
            </div>
          </div>

          {/* GPS 위치 정보 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              점검 위치 정보
            </h4>
            
            {isGettingLocation ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-blue-700">위치 정보를 가져오는 중...</span>
              </div>
            ) : managementRecord.gpsLocation ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">위치 정보 확인됨</p>
                    <p className="text-sm text-green-700 mt-1">{managementRecord.gpsLocation.address}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800">위치 정보가 필요합니다</span>
                  </div>
                  <button
                    onClick={getCurrentLocation}
                    className="btn-secondary text-sm"
                  >
                    위치 가져오기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 점검 사진 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              점검 사진
            </h4>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <p className="text-neutral-600 mb-2">점검 상황을 보여주는 사진을 업로드하세요</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="btn-primary cursor-pointer"
              >
                파일 선택
              </label>
            </div>
            
            {managementRecord.images.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-neutral-700 mb-2">업로드된 이미지</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {managementRecord.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`점검 사진 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDailyManagement;
