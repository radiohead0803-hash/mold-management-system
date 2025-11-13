import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  AlertCircle,
  X,
  Wrench,
  User,
  Camera,
  Upload,
  Clock,
  CheckCircle
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

interface RepairWork {
  moldId: string;
  moldName: string;
  partnerName: string;
  technician: string;
  workDate: string;
  workType: 'repair' | 'replacement' | 'maintenance' | 'inspection';
  description: string;
  partsUsed: string;
  workHours: number;
  cost: number;
  beforeImages: File[];
  afterImages: File[];
  gpsLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  notes: string;
  status: 'in_progress' | 'completed' | 'pending_approval';
}

const PartnerMoldRepair: React.FC = () => {
  const navigate = useNavigate();
  const { moldId } = useParams<{ moldId: string }>();
  
  const [moldData, setMoldData] = useState<MoldData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [repairWork, setRepairWork] = useState<RepairWork>({
    moldId: moldId || '',
    moldName: '',
    partnerName: '정밀금형 주식회사',
    technician: '',
    workDate: new Date().toISOString().split('T')[0],
    workType: 'repair',
    description: '',
    partsUsed: '',
    workHours: 0,
    cost: 0,
    beforeImages: [],
    afterImages: [],
    gpsLocation: null,
    notes: '',
    status: 'in_progress'
  });

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
        setRepairWork(prev => ({
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
            // 실제로는 역지오코딩 API 사용
            const address = `위도: ${latitude.toFixed(6)}, 경도: ${longitude.toFixed(6)}`;
            
            setRepairWork(prev => ({
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
          setError('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setIsGettingLocation(false);
    }
  };

  const handleInputChange = (field: keyof RepairWork, value: any) => {
    setRepairWork(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const field = type === 'before' ? 'beforeImages' : 'afterImages';
    
    setRepairWork(prev => ({
      ...prev,
      [field]: [...prev[field], ...files]
    }));
  };

  const removeImage = (type: 'before' | 'after', index: number) => {
    const field = type === 'before' ? 'beforeImages' : 'afterImages';
    
    setRepairWork(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const fillTestData = () => {
    setRepairWork(prev => ({
      ...prev,
      technician: '김기술',
      workType: 'repair',
      description: '이젝터 핀 교체 작업 및 캐비티 표면 연마 작업을 수행했습니다. 기존 이젝터 핀에서 마모가 심하게 발견되어 새 부품으로 교체하였으며, 캐비티 표면의 미세한 스크래치를 제거하기 위해 정밀 연마 작업을 진행했습니다.',
      partsUsed: '이젝터 핀 x4개, 스프링 x2개, 가이드 부시 x1개',
      workHours: 6.5,
      cost: 450000,
      notes: '작업 완료 후 테스트 샷을 진행하여 정상 동작을 확인했습니다. 다음 점검 시 이젝터 핀 상태를 재확인하시기 바랍니다.'
    }));
  };

  const handleSubmit = async () => {
    if (!repairWork.technician || !repairWork.description) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/partner/repair-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repairWork)
      });

      if (!response.ok) {
        throw new Error('작업 등록에 실패했습니다.');
      }

      alert('수리 작업이 성공적으로 등록되었습니다!');
      navigate('/partner/dashboard');
      
    } catch (error) {
      console.error('작업 등록 실패:', error);
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
              <h1 className="text-3xl font-semibold text-neutral-900">금형 수리 작업</h1>
              <p className="text-neutral-600 mt-1">수리 작업 내용을 상세히 기록하세요</p>
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
              {isSaving ? '저장 중...' : '작업 완료 등록'}
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
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">{moldData.moldId}</h3>
                  <p className="text-neutral-600">{moldData.name}</p>
                  <p className="text-sm text-neutral-500">위치: {moldData.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* 작업자 정보 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              작업자 정보
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업자명 *
                </label>
                <input
                  type="text"
                  value={repairWork.technician}
                  onChange={(e) => handleInputChange('technician', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="작업자명"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업일자
                </label>
                <input
                  type="date"
                  value={repairWork.workDate}
                  onChange={(e) => handleInputChange('workDate', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 작업 정보 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              작업 정보
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업 유형
                </label>
                <select
                  value={repairWork.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="repair">수리</option>
                  <option value="replacement">부품 교체</option>
                  <option value="maintenance">유지보수</option>
                  <option value="inspection">점검</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업 시간 (시간)
                </label>
                <input
                  type="number"
                  value={repairWork.workHours}
                  onChange={(e) => handleInputChange('workHours', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업 비용 (원)
                </label>
                <input
                  type="number"
                  value={repairWork.cost}
                  onChange={(e) => handleInputChange('cost', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 작업 상세 내용 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4">작업 상세 내용</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업 설명 *
                </label>
                <textarea
                  value={repairWork.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="수행한 작업 내용을 상세히 설명해주세요"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  사용된 부품/재료
                </label>
                <textarea
                  value={repairWork.partsUsed}
                  onChange={(e) => handleInputChange('partsUsed', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="교체하거나 사용한 부품 및 재료를 기록하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  특이사항 및 권고사항
                </label>
                <textarea
                  value={repairWork.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="향후 주의사항이나 권고사항을 기록하세요"
                />
              </div>
            </div>
          </div>

          {/* GPS 위치 정보 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              작업 위치 정보
            </h4>
            
            {isGettingLocation ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-blue-700">위치 정보를 가져오는 중...</span>
              </div>
            ) : repairWork.gpsLocation ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">위치 정보 확인됨</p>
                    <p className="text-sm text-green-700 mt-1">{repairWork.gpsLocation.address}</p>
                    <div className="text-xs text-green-600 mt-2">
                      <span>위도: {repairWork.gpsLocation.latitude.toFixed(6)}</span>
                      <span className="ml-4">경도: {repairWork.gpsLocation.longitude.toFixed(6)}</span>
                    </div>
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

          {/* 작업 사진 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              작업 사진
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 작업 전 사진 */}
              <div>
                <h5 className="text-sm font-medium text-neutral-700 mb-3">작업 전 사진</h5>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('before', e)}
                    className="hidden"
                    id="before-images"
                  />
                  <label
                    htmlFor="before-images"
                    className="btn-secondary cursor-pointer text-sm"
                  >
                    사진 선택
                  </label>
                </div>
                
                {repairWork.beforeImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {repairWork.beforeImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`작업 전 ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage('before', index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 작업 후 사진 */}
              <div>
                <h5 className="text-sm font-medium text-neutral-700 mb-3">작업 후 사진</h5>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('after', e)}
                    className="hidden"
                    id="after-images"
                  />
                  <label
                    htmlFor="after-images"
                    className="btn-secondary cursor-pointer text-sm"
                  >
                    사진 선택
                  </label>
                </div>
                
                {repairWork.afterImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {repairWork.afterImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`작업 후 ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => removeImage('after', index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerMoldRepair;
