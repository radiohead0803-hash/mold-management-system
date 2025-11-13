import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Search,
  AlertCircle,
  X,
  Wrench,
  User,
  FileText,
  Camera,
  Upload
} from 'lucide-react';

interface MoldData {
  id: number;
  moldId: string;
  name: string;
  location: string;
  status: string;
  manager: string;
  lastMaintenance: string;
}

interface MoldSearchResult {
  id: number;
  moldId: string;
  name: string;
  location: string;
  status: string;
}

interface RepairRequest {
  moldId: string;
  moldName: string;
  reportedBy: string;
  department: string;
  reportDate: string;
  issueType: 'mechanical' | 'electrical' | 'wear' | 'damage' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  symptoms: string;
  estimatedDowntime: number;
  repairLocation: string;
  contactInfo: string;
  images: File[];
}

const MoldRepair: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [searchMode, setSearchMode] = useState(!id);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MoldSearchResult[]>([]);
  const [selectedMold, setSelectedMold] = useState<MoldData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [repairRequest, setRepairRequest] = useState<RepairRequest>({
    moldId: '',
    moldName: '',
    reportedBy: '',
    department: '',
    reportDate: new Date().toISOString().split('T')[0],
    issueType: 'mechanical',
    priority: 'medium',
    description: '',
    symptoms: '',
    estimatedDowntime: 0,
    repairLocation: '',
    contactInfo: '',
    images: []
  });

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
      setRepairRequest(prev => ({
        ...prev,
        moldId: moldData.moldId,
        moldName: moldData.name
      }));
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
      setSearchResults(molds.slice(0, 10));
    } catch (error) {
      console.error('금형 검색 실패:', error);
      setError('검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoldSelect = async (mold: MoldData | number) => {
    if (typeof mold === 'number') {
      await loadMoldData(mold.toString());
    } else {
      setSelectedMold(mold);
      setRepairRequest(prev => ({
        ...prev,
        moldId: mold.moldId,
        moldName: mold.name
      }));
      setSearchMode(false);
    }
  };

  const handleInputChange = (field: keyof RepairRequest, value: any) => {
    setRepairRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setRepairRequest(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setRepairRequest(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const fillTestData = () => {
    setRepairRequest(prev => ({
      ...prev,
      reportedBy: '김철수',
      department: 'production',
      contactInfo: '010-1234-5678',
      issueType: 'mechanical',
      priority: 'high',
      estimatedDowntime: 8,
      repairLocation: '현장 수리',
      symptoms: '제품 이젝션 시 불완전한 분리 현상이 발생하고 있으며, 제품 표면에 긁힘이 생기고 있습니다. 금형 개폐 시 이상한 소음이 들립니다.',
      description: '금형 내부 스프링이 파손되어 이젝터 동작에 문제가 발생한 것으로 추정됩니다. 스프링 교체 및 이젝터 핀 점검이 필요하며, 캐비티 표면도 함께 점검해야 할 것 같습니다. 생산 중단을 최소화하기 위해 긴급 수리가 필요합니다.'
    }));
  };

  const handleSubmit = async () => {
    if (!selectedMold) return;

    // 필수 필드 검증
    if (!repairRequest.reportedBy || !repairRequest.description || !repairRequest.symptoms) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/repair-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(repairRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '수리 요청 등록에 실패했습니다.');
      }

      const result = await response.json();
      console.log('수리 요청 등록 성공:', result);
      
      // TODO: 이미지 업로드 처리
      if (repairRequest.images.length > 0) {
        console.log('업로드할 이미지:', repairRequest.images);
      }
      
      alert('수리 요청이 성공적으로 등록되었습니다!');
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('수리 요청 등록 실패:', error);
      setError(error instanceof Error ? error.message : '등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSearchMode = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Search className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">수리할 금형 검색</h3>
        <p className="text-neutral-600">수리가 필요한 금형을 검색하세요</p>
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

  const renderRepairForm = () => {
    if (!selectedMold) return null;

    return (
      <div className="space-y-8">
        {/* 금형 정보 헤더 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Wrench className="h-6 w-6 text-red-600" />
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

        {/* 신고자 정보 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            신고자 정보
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                신고자 *
              </label>
              <input
                type="text"
                value={repairRequest.reportedBy}
                onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="신고자명"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                부서
              </label>
              <select
                value={repairRequest.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">부서 선택</option>
                <option value="production">생산부</option>
                <option value="quality">품질부</option>
                <option value="maintenance">보전부</option>
                <option value="development">개발부</option>
                <option value="other">기타</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                신고일자
              </label>
              <input
                type="date"
                value={repairRequest.reportDate}
                onChange={(e) => handleInputChange('reportDate', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                연락처
              </label>
              <input
                type="text"
                value={repairRequest.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="연락처 (전화번호, 이메일 등)"
              />
            </div>
          </div>
        </div>

        {/* 수리 요청 정보 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            수리 요청 정보
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                문제 유형 *
              </label>
              <select
                value={repairRequest.issueType}
                onChange={(e) => handleInputChange('issueType', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="mechanical">기계적 문제</option>
                <option value="electrical">전기적 문제</option>
                <option value="wear">마모</option>
                <option value="damage">손상</option>
                <option value="other">기타</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                우선순위 *
              </label>
              <select
                value={repairRequest.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                예상 중단 시간 (시간)
              </label>
              <input
                type="number"
                value={repairRequest.estimatedDowntime}
                onChange={(e) => handleInputChange('estimatedDowntime', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                수리 위치
              </label>
              <input
                type="text"
                value={repairRequest.repairLocation}
                onChange={(e) => handleInputChange('repairLocation', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="현장 수리 / 외부 수리업체 등"
              />
            </div>
          </div>
        </div>

        {/* 문제 상세 설명 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            문제 상세 설명
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                발생한 증상 *
              </label>
              <textarea
                value={repairRequest.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="어떤 증상이 발생했는지 구체적으로 설명해주세요"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                상세 설명 *
              </label>
              <textarea
                value={repairRequest.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="문제 발생 경위, 원인 추정, 필요한 수리 작업 등을 자세히 설명해주세요"
                required
              />
            </div>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5" />
            문제 상황 사진
          </h4>
          
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600 mb-2">문제 상황을 보여주는 사진을 업로드하세요</p>
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
          
          {repairRequest.images.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-neutral-700 mb-2">업로드된 이미지</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {repairRequest.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`문제 상황 ${index + 1}`}
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
              <h1 className="text-3xl font-semibold text-neutral-900">금형 수리 등록</h1>
              <p className="text-neutral-600 mt-1">수리가 필요한 금형을 신고하세요</p>
            </div>
          </div>
          
          {selectedMold && (
            <div className="flex gap-3">
              <button
                onClick={fillTestData}
                className="btn-secondary flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                테스트 데이터
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? '등록 중...' : '수리 요청 등록'}
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
            {searchMode ? renderSearchMode() : renderRepairForm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoldRepair;
