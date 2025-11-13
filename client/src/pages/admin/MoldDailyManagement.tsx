import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Search,
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
  lastMaintenance: string;
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
  checkDate: string;
  inspector: string;
  department: string;
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
  nextCheckDate: string;
}

const MoldDailyManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchMode, setSearchMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MoldData[]>([]);
  const [selectedMold, setSelectedMold] = useState<MoldData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [managementRecord, setManagementRecord] = useState<DailyManagementRecord>({
    moldId: '',
    moldName: '',
    checkDate: new Date().toISOString().split('T')[0],
    inspector: '',
    department: '',
    shift: 'day',
    operatingHours: 0,
    productionCount: 0,
    checkItems: {},
    overallStatus: 'normal',
    notes: '',
    images: [],
    nextCheckDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

  const searchMolds = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/molds?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('검색에 실패했습니다.');
      }
      
      const molds = await response.json();
      setSearchResults(molds.slice(0, 10));
    } catch (error) {
      console.error('금형 검색 실패:', error);
      setError('검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoldSelect = (mold: MoldData) => {
    setSelectedMold(mold);
    setManagementRecord(prev => ({
      ...prev,
      moldId: mold.moldId,
      moldName: mold.name
    }));
    setSearchMode(false);
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
      inspector: '박영수',
      department: 'production',
      shift: 'day',
      operatingHours: 8.5,
      productionCount: 1250,
      checkItems: {
        'visual_1': { status: 'ok', notes: '표면 상태 양호' },
        'visual_2': { status: 'ok', notes: '균열 및 손상 없음' },
        'visual_3': { status: 'warning', notes: '약간의 오염 발견, 청소 필요' },
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
    if (!selectedMold) return;

    // 필수 필드 검증
    if (!managementRecord.inspector) {
      setError('점검자를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/daily-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(managementRecord)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '일상관리 기록 등록에 실패했습니다.');
      }

      const result = await response.json();
      console.log('일상관리 기록 등록 성공:', result);
      
      alert('일상관리 기록이 성공적으로 등록되었습니다!');
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('일상관리 기록 등록 실패:', error);
      setError(error instanceof Error ? error.message : '등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSearchMode = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Search className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">관리할 금형 검색</h3>
        <p className="text-neutral-600">일상관리를 수행할 금형을 검색하세요</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMolds()}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="금형 ID, 이름, 위치 검색..."
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={searchMolds}
            disabled={isLoading || !searchTerm.trim()}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '검색 중...' : '검색'}
          </button>
          <button
            onClick={() => {
              const testMold: MoldData = {
                id: 1,
                moldId: 'M-2024-001',
                name: '스마트폰 케이스 금형',
                location: 'A구역-01',
                status: 'in_use',
                lastMaintenance: '2024-10-15',
                manager: '김철수'
              };
              handleMoldSelect(testMold);
            }}
            className="btn-secondary whitespace-nowrap"
          >
            테스트 금형
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h4 className="text-lg font-medium text-neutral-900 mb-4">검색 결과</h4>
          <div className="space-y-2">
            {searchResults.map((mold) => (
              <button
                key={mold.id}
                onClick={() => handleMoldSelect(mold)}
                className="w-full p-4 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-neutral-900">{mold.moldId}</div>
                    <div className="text-sm text-neutral-600">{mold.name}</div>
                    <div className="text-sm text-neutral-500">{mold.location}</div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    마지막 점검: {mold.lastMaintenance}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderManagementForm = () => {
    if (!selectedMold) return null;

    const groupedItems = dailyCheckItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as { [key: string]: DailyCheckItem[] });

    return (
      <div className="space-y-8">
        {/* 금형 정보 헤더 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">{selectedMold.moldId}</h3>
                <p className="text-neutral-600">{selectedMold.name}</p>
                <p className="text-sm text-neutral-500">위치: {selectedMold.location}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedMold(null);
                setSearchMode(true);
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="btn-secondary"
            >
              다른 금형 선택
            </button>
          </div>
        </div>

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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="점검자명"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                부서
              </label>
              <select
                value={managementRecord.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">부서 선택</option>
                <option value="production">생산부</option>
                <option value="quality">품질부</option>
                <option value="maintenance">보전부</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                점검일자
              </label>
              <input
                type="date"
                value={managementRecord.checkDate}
                onChange={(e) => handleInputChange('checkDate', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                근무 교대
              </label>
              <select
                value={managementRecord.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="전체적인 상태 및 특이사항을 기록하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                다음 점검 예정일
              </label>
              <input
                type="date"
                value={managementRecord.nextCheckDate}
                onChange={(e) => handleInputChange('nextCheckDate', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 이미지 업로드 */}
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
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">금형 일상관리</h1>
              <p className="text-neutral-600 mt-1">일상 점검 및 유지보수를 기록하세요</p>
            </div>
          </div>
          
          {selectedMold && (
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
          )}
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-neutral-600">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {searchMode ? renderSearchMode() : renderManagementForm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoldDailyManagement;
