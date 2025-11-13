import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Search,
  AlertCircle,
  X,
  Calendar,
  Wrench,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface MoldData {
  id: number;
  moldId: string;
  name: string;
  category: string;
  manufacturer: string;
  purchaseDate: string;
  material: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cavityCount: number;
  maxPressure: number;
  location: string;
  zone: string;
  status: 'available' | 'in_use' | 'maintenance' | 'repair';
  manager: string;
  department: string;
  description: string;
  maintenanceInterval: number;
  createdAt: string;
  updatedAt: string;
}

interface MoldSearchResult {
  id: number;
  moldId: string;
  name: string;
  location: string;
  status: string;
}

const MoldEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [searchMode, setSearchMode] = useState(!id); // URL에 ID가 있으면 검색 모드 비활성화
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MoldSearchResult[]>([]);
  const [selectedMold, setSelectedMold] = useState<MoldData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  // Mock history data
  const historyData = {
    dailyChecks: [
      { id: 1, date: '2024-11-06', inspector: '김작업', status: 'normal', notes: '정상 작동 확인' },
      { id: 2, date: '2024-11-05', inspector: '이작업', status: 'attention', notes: '냉각수 온도 약간 높음' },
      { id: 3, date: '2024-11-04', inspector: '박작업', status: 'normal', notes: '이상 없음' },
    ],
    repairs: [
      { id: 1, date: '2024-10-15', type: '긴급수리', issue: '냉각수 누수', technician: '정비팀', status: 'completed', cost: 850000 },
      { id: 2, date: '2024-09-20', type: '정기점검', issue: '부품 교체', technician: '유지보수팀', status: 'completed', cost: 450000 },
    ],
    maintenance: [
      { id: 1, date: '2024-10-01', type: '1차 정기점검', shotCount: 100000, result: '양호', technician: '점검팀' },
      { id: 2, date: '2024-07-15', type: '초기점검', shotCount: 50000, result: '정상', technician: '점검팀' },
    ],
    shotHistory: [
      { id: 1, date: '2024-11-06', previousCount: 145000, newCount: 145500, difference: 500, recorder: '김작업' },
      { id: 2, date: '2024-11-05', previousCount: 144500, newCount: 145000, difference: 500, recorder: '이작업' },
      { id: 3, date: '2024-11-04', previousCount: 144000, newCount: 144500, difference: 500, recorder: '박작업' },
    ]
  };

  // URL에 ID가 있으면 해당 금형 데이터를 바로 로드
  useEffect(() => {
    if (id) {
      loadMoldData(id);
    }
  }, [id]);

  const loadMoldData = async (moldId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/molds/${moldId}`);
      if (!response.ok) {
        throw new Error('금형 데이터를 불러올 수 없습니다.');
      }
      
      const moldData = await response.json();
      setSelectedMold(moldData);
      setSearchMode(false);
    } catch (error) {
      console.error('금형 데이터 로드 실패:', error);
      setError(error instanceof Error ? error.message : '데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
      setSearchResults(molds.slice(0, 10)); // 최대 10개 결과만 표시
    } catch (error) {
      console.error('금형 검색 실패:', error);
      setError('검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoldSelect = async (moldId: number) => {
    await loadMoldData(moldId.toString());
  };

  const handleInputChange = (field: keyof MoldData, value: any) => {
    if (!selectedMold) return;
    
    setSelectedMold(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const handleDimensionChange = (dimension: keyof MoldData['dimensions'], value: number) => {
    if (!selectedMold) return;
    
    setSelectedMold(prev => prev ? {
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    } : null);
  };

  const handleSave = async () => {
    if (!selectedMold) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/molds/${selectedMold.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(selectedMold)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '금형 정보 수정에 실패했습니다.');
      }

      const result = await response.json();
      console.log('금형 수정 성공:', result);
      
      alert('금형 정보가 성공적으로 수정되었습니다!');
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('금형 수정 실패:', error);
      setError(error instanceof Error ? error.message : '수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSearchMode = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Search className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">수정할 금형 검색</h3>
        <p className="text-neutral-600">금형 ID, 이름, 또는 위치로 검색하세요</p>
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
        <button
          onClick={searchMolds}
          disabled={isLoading || !searchTerm.trim()}
          className="w-full mt-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <h4 className="text-lg font-medium text-neutral-900 mb-4">검색 결과</h4>
          <div className="space-y-2">
            {searchResults.map((mold) => (
              <button
                key={mold.id}
                onClick={() => handleMoldSelect(mold.id)}
                className="w-full p-4 text-left border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-neutral-900">{mold.moldId}</div>
                    <div className="text-sm text-neutral-600">{mold.name}</div>
                    <div className="text-sm text-neutral-500">{mold.location}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mold.status === 'available' ? 'bg-green-100 text-green-800' :
                    mold.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                    mold.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {mold.status === 'available' ? '사용가능' :
                     mold.status === 'in_use' ? '사용중' :
                     mold.status === 'maintenance' ? '정비중' : '수리중'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEditForm = () => {
    if (!selectedMold) return null;

    return (
      <div className="space-y-8">
        {/* 금형 정보 헤더 */}
        <div className="bg-neutral-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">{selectedMold.moldId}</h3>
              <p className="text-neutral-600">{selectedMold.name}</p>
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

        {/* 기본 정보 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4">기본 정보</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                금형 ID
              </label>
              <input
                type="text"
                value={selectedMold.moldId}
                onChange={(e) => handleInputChange('moldId', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                금형명
              </label>
              <input
                type="text"
                value={selectedMold.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                카테고리
              </label>
              <select
                value={selectedMold.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="injection">사출금형</option>
                <option value="press">프레스금형</option>
                <option value="die-casting">다이캐스팅금형</option>
                <option value="forging">단조금형</option>
                <option value="other">기타</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                제조업체
              </label>
              <input
                type="text"
                value={selectedMold.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 사양 정보 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4">사양 정보</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                재질
              </label>
              <select
                value={selectedMold.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">재질 선택</option>
                <option value="steel">강철</option>
                <option value="aluminum">알루미늄</option>
                <option value="stainless">스테인리스</option>
                <option value="carbon-steel">탄소강</option>
                <option value="other">기타</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                중량 (kg)
              </label>
              <input
                type="number"
                value={selectedMold.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              치수 (mm)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  value={selectedMold.dimensions.length}
                  onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="길이"
                  min="0"
                />
                <span className="text-xs text-neutral-500 mt-1 block">길이</span>
              </div>
              <div>
                <input
                  type="number"
                  value={selectedMold.dimensions.width}
                  onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="너비"
                  min="0"
                />
                <span className="text-xs text-neutral-500 mt-1 block">너비</span>
              </div>
              <div>
                <input
                  type="number"
                  value={selectedMold.dimensions.height}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="높이"
                  min="0"
                />
                <span className="text-xs text-neutral-500 mt-1 block">높이</span>
              </div>
            </div>
          </div>
        </div>

        {/* 위치 및 상태 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4">위치 및 상태</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                설치 위치
              </label>
              <input
                type="text"
                value={selectedMold.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                구역
              </label>
              <select
                value={selectedMold.zone}
                onChange={(e) => handleInputChange('zone', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="A">A구역</option>
                <option value="B">B구역</option>
                <option value="C">C구역</option>
                <option value="D">D구역</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                현재 상태
              </label>
              <select
                value={selectedMold.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="available">사용 가능</option>
                <option value="in_use">사용 중</option>
                <option value="maintenance">정비 중</option>
                <option value="repair">수리 중</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                담당자
              </label>
              <input
                type="text"
                value={selectedMold.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4">설명 및 특이사항</h4>
          <textarea
            value={selectedMold.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
            placeholder="금형에 대한 추가 설명이나 특이사항을 입력하세요"
          />
        </div>

        {/* 금형 이력 카드 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-neutral-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              금형 이력 관리
            </h4>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showHistory ? '접기' : '펼치기'}
            </button>
          </div>

          {showHistory && (
            <div className="space-y-6">
              {/* 일상점검 이력 */}
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-neutral-900">일상점검 이력</h5>
                  <span className="ml-auto text-sm text-neutral-600">{historyData.dailyChecks.length}건</span>
                </div>
                <div className="space-y-2">
                  {historyData.dailyChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          check.status === 'normal' ? 'bg-green-500' :
                          check.status === 'attention' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{check.date}</p>
                          <p className="text-xs text-neutral-600">{check.notes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">점검자</p>
                        <p className="text-sm font-medium text-neutral-900">{check.inspector}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수리 이력 */}
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-orange-600" />
                  </div>
                  <h5 className="font-semibold text-neutral-900">수리 이력</h5>
                  <span className="ml-auto text-sm text-neutral-600">{historyData.repairs.length}건</span>
                </div>
                <div className="space-y-2">
                  {historyData.repairs.map((repair) => (
                    <div key={repair.id} className="p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{repair.date}</p>
                          <p className="text-xs text-orange-600 font-medium">{repair.type}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {repair.status === 'completed' ? '완료' : '진행중'}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 mb-1">{repair.issue}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <span>담당: {repair.technician}</span>
                        <span className="font-medium text-neutral-900">{repair.cost.toLocaleString()}원</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 정기점검 이력 */}
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-neutral-900">정기점검 이력</h5>
                  <span className="ml-auto text-sm text-neutral-600">{historyData.maintenance.length}건</span>
                </div>
                <div className="space-y-2">
                  {historyData.maintenance.map((maint) => (
                    <div key={maint.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{maint.type}</p>
                        <p className="text-xs text-neutral-600">{maint.date} · 타수: {maint.shotCount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-600">결과</p>
                        <p className="text-sm font-medium text-green-600">{maint.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 타수 기록 이력 */}
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-neutral-900">타수 기록 이력</h5>
                  <span className="ml-auto text-sm text-neutral-600">{historyData.shotHistory.length}건</span>
                </div>
                <div className="space-y-2">
                  {historyData.shotHistory.map((shot) => (
                    <div key={shot.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{shot.date}</p>
                        <p className="text-xs text-neutral-600">기록자: {shot.recorder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900">
                          {shot.previousCount.toLocaleString()} → {shot.newCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 font-medium">+{shot.difference.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 통계 요약 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{historyData.dailyChecks.length}</p>
                  <p className="text-xs text-neutral-600 mt-1">일상점검</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{historyData.repairs.length}</p>
                  <p className="text-xs text-neutral-600 mt-1">수리이력</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{historyData.maintenance.length}</p>
                  <p className="text-xs text-neutral-600 mt-1">정기점검</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{historyData.shotHistory[0]?.newCount.toLocaleString()}</p>
                  <p className="text-xs text-neutral-600 mt-1">현재타수</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-semibold text-neutral-900">금형 정보 수정</h1>
              <p className="text-neutral-600 mt-1">기존 금형의 정보를 수정하세요</p>
            </div>
          </div>
          
          {selectedMold && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? '저장 중...' : '변경사항 저장'}
            </button>
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
            {searchMode ? renderSearchMode() : renderEditForm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoldEdit;
