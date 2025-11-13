import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  AlertTriangle,
  Wrench,
  Camera,
  MapPin,
  Save,
  Upload,
  X
} from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  location: string;
}

interface RepairRequestData {
  moldId: string;
  moldName: string;
  requester: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  issueType: string;
  description: string;
  location: string;
  images: File[];
  gpsLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

const RepairRequest: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // 워크플로우 단계 관리
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // 단계별 사진 관리
  const [step1Photos, setStep1Photos] = useState<File[]>([]);
  const [step2Photos, setStep2Photos] = useState<File[]>([]);
  const [step3Photos, setStep3Photos] = useState<File[]>([]);
  
  const [requestData, setRequestData] = useState<RepairRequestData>({
    moldId: moldId || '',
    moldName: '',
    requester: '',
    urgency: 'medium',
    issueType: '',
    description: '',
    location: '',
    images: [],
    gpsLocation: null
  });

  const issueTypes = [
    '기계적 결함',
    '전기적 문제',
    '냉각 시스템',
    '이젝터 문제',
    '표면 손상',
    '치수 불량',
    '기타'
  ];

  useEffect(() => {
    if (moldId) {
      fetchMoldInfo();
      getCurrentLocation();
    }
  }, [moldId]);

  const fetchMoldInfo = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      if (!token) {
        throw new Error('QR 세션이 만료되었습니다.');
      }

      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('금형 정보를 불러올 수 없습니다.');
      }

      const data = await response.json();
      setMoldInfo({
        moldId: data.moldId,
        name: data.name,
        location: data.location
      });
      
      setRequestData(prev => ({
        ...prev,
        moldName: data.name,
        location: data.location
      }));
    } catch (error) {
      console.error('Mold info fetch error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
            
            setRequestData(prev => ({
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

  const handleInputChange = (field: keyof RepairRequestData, value: any) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setRequestData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setRequestData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleStep2PhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setStep2Photos(prev => [...prev, ...files]);
  };

  const removeStep2Photo = (index: number) => {
    setStep2Photos(prev => prev.filter((_, i) => i !== index));
  };

  const handleStep3PhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setStep3Photos(prev => [...prev, ...files]);
  };

  const removeStep3Photo = (index: number) => {
    setStep3Photos(prev => prev.filter((_, i) => i !== index));
  };

  const fillTestData = () => {
    setRequestData(prev => ({
      ...prev,
      requester: '작업자A',
      urgency: 'high',
      issueType: '이젝터 문제',
      description: '이젝터 핀이 제대로 작동하지 않습니다. 제품이 금형에서 분리되지 않아 생산이 중단되었습니다. 긴급 수리가 필요합니다.'
    }));
  };

  const handleSubmit = async () => {
    if (!requestData.requester || !requestData.issueType || !requestData.description) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('qr_session_token');
      
      const response = await fetch('http://localhost:5001/api/worker/repair-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('수리 요청 등록에 실패했습니다.');
      }

      const result = await response.json();
      
      alert(`수리 요청이 성공적으로 등록되었습니다!\n요청번호: ${result.repairRequest.requestNumber}\n관리자에게 긴급 알림이 전송되었습니다.`);
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
              <h1 className="text-lg font-semibold text-neutral-900">수리 요청</h1>
              <p className="text-sm text-neutral-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fillTestData}
                className="btn-secondary text-sm"
              >
                테스트 데이터
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                {submitting ? '전송 중...' : '요청 전송'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* 금형 정보 */}
        {moldInfo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Wrench className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{moldInfo.moldId}</h3>
                <p className="text-neutral-600">{moldInfo.name}</p>
                <p className="text-sm text-neutral-500">위치: {moldInfo.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* 진행 단계 표시 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-neutral-900 mb-6">수리 진행 단계</h3>
          <div className="flex items-center justify-between mb-6">
            {/* 1단계 */}
            <div className="flex-1 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-4 transition-all ${
                currentStep === 1 ? 'bg-blue-500 text-white border-blue-600 scale-110' : 
                currentStep > 1 ? 'bg-green-500 text-white border-green-600' : 'bg-gray-300 text-gray-600 border-gray-400'
              }`}>
                1
              </div>
              <p className="mt-2 text-sm font-bold text-center">생산처 신고</p>
              <p className="text-xs text-gray-500 text-center">문제 발생 보고</p>
            </div>
            
            {/* 연결선 1-2 */}
            <div className="flex-1 h-2 bg-gray-300 mx-4 rounded-full overflow-hidden">
              <div className={`h-full bg-green-500 transition-all duration-500`} 
                style={{ width: currentStep >= 2 ? '100%' : '0%' }}></div>
            </div>

            {/* 2단계 */}
            <div className="flex-1 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-4 transition-all ${
                currentStep === 2 ? 'bg-blue-500 text-white border-blue-600 scale-110' : 
                currentStep > 2 ? 'bg-green-500 text-white border-green-600' : 'bg-gray-300 text-gray-600 border-gray-400'
              }`}>
                2
              </div>
              <p className="mt-2 text-sm font-bold text-center">수리처 수리</p>
              <p className="text-xs text-gray-500 text-center">수리 작업 진행</p>
            </div>

            {/* 연결선 2-3 */}
            <div className="flex-1 h-2 bg-gray-300 mx-4 rounded-full overflow-hidden">
              <div className={`h-full bg-green-500 transition-all duration-500`} 
                style={{ width: currentStep >= 3 ? '100%' : '0%' }}></div>
            </div>

            {/* 3단계 */}
            <div className="flex-1 flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-4 transition-all ${
                currentStep === 3 ? 'bg-blue-500 text-white border-blue-600 scale-110' : 'bg-gray-300 text-gray-600 border-gray-400'
              }`}>
                3
              </div>
              <p className="mt-2 text-sm font-bold text-center">생산처 확인</p>
              <p className="text-xs text-gray-500 text-center">수리 완료 검수</p>
            </div>
          </div>
          
          {/* 단계 전환 버튼 (테스트용) */}
          <div className="flex gap-2 justify-center pt-4 border-t border-gray-200">
            <button 
              onClick={() => setCurrentStep(1)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentStep === 1 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              1단계 보기
            </button>
            <button 
              onClick={() => setCurrentStep(2)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentStep === 2 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              2단계 보기
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentStep === 3 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              3단계 보기
            </button>
          </div>
        </div>

        {/* ========== 1단계: 생산처 신고 ========== */}
        {currentStep === 1 && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>📝</span> 1단계: 생산처 신고
              </h2>
              <p className="text-blue-700">금형에 문제가 발생했을 때 생산처에서 작성하는 섹션입니다.</p>
            </div>

            {/* 기본 금형 정보 (자동 입력) */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-2 border-gray-300 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <span>📋</span> 기본 금형 정보 (자동 입력)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">금형번호</label>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">{moldInfo?.moldId || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">금형명</label>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">{moldInfo?.name || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">현재 위치</label>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">{moldInfo?.location || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">누적 쇼트수</label>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">0 회</p>
                    <p className="text-xs text-gray-500 mt-1">일상점검 데이터 연동</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">신고 일시</label>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900">{new Date().toLocaleString('ko-KR')}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">GPS 위치</label>
                  <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg">
                    {isGettingLocation ? (
                      <p className="text-sm text-blue-600">위치 확인 중...</p>
                    ) : requestData.gpsLocation ? (
                      <p className="text-sm text-green-600">✓ 위치 확인됨</p>
                    ) : (
                      <button
                        onClick={getCurrentLocation}
                        className="text-sm text-blue-600 hover:text-blue-800 underline">
                        위치 가져오기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 신고자 정보 */}
            <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">신고자 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    신고자명 *
                  </label>
                  <input
                    type="text"
                    value={requestData.requester}
                    onChange={(e) => handleInputChange('requester', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="이름"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    부서/업체
                  </label>
                  <input
                    type="text"
                    value={requestData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="소속"
                  />
                </div>
              </div>
            </div>

            {/* 문제 정보 */}
            <div className="bg-white rounded-lg border-2 border-orange-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">문제 정보</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      긴급도 *
                    </label>
                    <select
                      value={requestData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      문제 유형 *
                    </label>
                    <select
                      value={requestData.issueType}
                      onChange={(e) => handleInputChange('issueType', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                      <option value="">문제 유형을 선택하세요</option>
                      {issueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    현상 (발생한 문제) *
                  </label>
                  <textarea
                    value={requestData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="어떤 문제가 발생했는지 구체적으로 설명해주세요 (예: 제품이 금형에서 분리되지 않음)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    발생 원인 (추정)
                  </label>
                  <textarea
                    value={requestData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="문제가 발생한 원인을 추정하여 작성해주세요 (예: 이젝터 핀 마모로 인한 작동 불량 추정)"
                  />
                  <p className="text-xs text-gray-500 mt-1">※ 정확한 원인을 모르는 경우 비워두셔도 됩니다</p>
                </div>

                {/* 문제 사진 첨부 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    문제 사진 첨부
                  </label>
                  <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center bg-orange-50">
                    <Camera className="mx-auto h-10 w-10 text-orange-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">문제 상황을 보여주는 사진을 업로드하세요</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setStep1Photos(prev => [...prev, ...files]);
                      }}
                      className="hidden"
                      id="step1-photo-upload"
                    />
                    <label
                      htmlFor="step1-photo-upload"
                      className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600">
                      사진 선택
                    </label>
                  </div>
                  
                  {/* 업로드된 사진 미리보기 */}
                  {step1Photos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">업로드된 사진 ({step1Photos.length}장)</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {step1Photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`문제 사진 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              onClick={() => setStep1Photos(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                              사진 {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                <Save className="h-5 w-5" />
                {submitting ? '전송 중...' : '신고 제출 및 수리처로 전달'}
              </button>
            </div>
          </>
        )}

        {/* ========== 2단계: 수리처 수리 ========== */}
        {currentStep === 2 && (
          <>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
              <h2 className="text-2xl font-bold text-green-900 mb-2 flex items-center gap-2">
                <span>🔧</span> 2단계: 수리처 수리
              </h2>
              <p className="text-green-700">수리처에서 수리 작업을 진행하고 결과를 기록하는 섹션입니다.</p>
            </div>

            {/* 수리 접수 정보 */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">수리 접수 정보</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      접수일자 *
                    </label>
                    <input
                      type="date"
                      value={requestData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      수리 담당자 *
                    </label>
                    <input
                      type="text"
                      value={requestData.reporter}
                      onChange={(e) => handleInputChange('reporter', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="담당자명"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 원인 분석 */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">원인 분석</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    불량 원인 *
                  </label>
                  <select
                    value={requestData.issueType}
                    onChange={(e) => handleInputChange('issueType', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">원인을 선택하세요</option>
                    <option value="마모">마모</option>
                    <option value="파손">파손</option>
                    <option value="변형">변형</option>
                    <option value="부식">부식</option>
                    <option value="조립불량">조립불량</option>
                    <option value="설계결함">설계결함</option>
                    <option value="재질불량">재질불량</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    원인 상세 설명 *
                  </label>
                  <textarea
                    value={requestData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="불량 원인을 상세히 기록해주세요"
                    required
                  />
                </div>

                {/* 원인 분석 사진 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    원인 분석 사진
                  </label>
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center bg-green-50">
                    <Camera className="mx-auto h-10 w-10 text-green-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">불량 원인을 보여주는 사진을 업로드하세요</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleStep2PhotoUpload}
                      className="hidden"
                      id="step2-cause-photo"
                    />
                    <label
                      htmlFor="step2-cause-photo"
                      className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600"
                    >
                      사진 선택
                    </label>
                  </div>
                  {step2Photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {step2Photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`원인 사진 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={() => removeStep2Photo(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 수리 작업 내용 */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">수리 작업 내용</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    수리 방법 *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">수리 방법을 선택하세요</option>
                    <option value="연마">연마</option>
                    <option value="용접">용접</option>
                    <option value="부품교체">부품 교체</option>
                    <option value="재가공">재가공</option>
                    <option value="조립조정">조립 조정</option>
                    <option value="표면처리">표면 처리</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    작업 내용 *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="수행한 수리 작업을 상세히 기록해주세요"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      교체 부품
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="교체한 부품명 (해당시)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      작업 시간
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="예: 4시간"
                    />
                  </div>
                </div>

                {/* 수리 작업 사진 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    수리 작업 사진 (전/후)
                  </label>
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center bg-green-50">
                    <Camera className="mx-auto h-10 w-10 text-green-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">수리 전후 비교 사진을 업로드하세요</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleStep2PhotoUpload}
                      className="hidden"
                      id="step2-work-photo"
                    />
                    <label
                      htmlFor="step2-work-photo"
                      className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600"
                    >
                      사진 선택
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 수리 결과 */}
            <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">수리 결과</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    수리 완료 여부 *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className="p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="font-bold text-green-800">수리 완료</p>
                        <p className="text-xs text-gray-600 mt-1">정상 작동 확인</p>
                      </div>
                    </button>
                    <button
                      className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="font-bold text-gray-800">부분 완료</p>
                        <p className="text-xs text-gray-600 mt-1">추가 작업 필요</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    특이사항 및 권장사항
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="생산처에 전달할 특이사항이나 권장사항을 기록해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                이전 단계
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 flex items-center gap-2">
                <Save className="h-5 w-5" />
                수리 완료 및 생산처로 전달
              </button>
            </div>
          </>
        )}

        {/* ========== 3단계: 생산처 확인 ========== */}
        {currentStep === 3 && (
          <>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 shadow-lg">
              <h2 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span>✅</span> 3단계: 생산처 확인
              </h2>
              <p className="text-purple-700">수리 완료된 금형을 생산처에서 검수하고 최종 승인하는 섹션입니다.</p>
            </div>

            {/* 검수 기본 정보 */}
            <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">검수 기본 정보</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      검수일자 *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      검수자 *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="검수자명"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 외관 검사 */}
            <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">외관 검사</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    수리 부위 외관 상태 *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">✅</div>
                        <p className="text-sm font-medium">양호</p>
                      </div>
                    </button>
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚠️</div>
                        <p className="text-sm font-medium">주의</p>
                      </div>
                    </button>
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">❌</div>
                        <p className="text-sm font-medium">불량</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    표면 마감 상태
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">✅</div>
                        <p className="text-sm font-medium">양호</p>
                      </div>
                    </button>
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚠️</div>
                        <p className="text-sm font-medium">주의</p>
                      </div>
                    </button>
                    <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
                      <div className="text-center">
                        <div className="text-2xl mb-1">❌</div>
                        <p className="text-sm font-medium">불량</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    외관 검사 의견
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="외관 검사 결과 및 의견을 기록해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 기능 테스트 */}
            <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">기능 테스트</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    작동 테스트 *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                      <div className="text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="font-bold text-green-800">정상 작동</p>
                        <p className="text-xs text-gray-600 mt-1">모든 기능 정상</p>
                      </div>
                    </button>
                    <button className="p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
                      <div className="text-center">
                        <div className="text-3xl mb-2">❌</div>
                        <p className="font-bold text-red-800">작동 불량</p>
                        <p className="text-xs text-gray-600 mt-1">재수리 필요</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    시험 생산 결과
                  </label>
                  <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">선택하세요</option>
                    <option value="excellent">우수 (불량률 0%)</option>
                    <option value="good">양호 (불량률 1% 미만)</option>
                    <option value="acceptable">허용 (불량률 1-3%)</option>
                    <option value="poor">불량 (불량률 3% 이상)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    테스트 샷수
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="예: 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    기능 테스트 의견
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="기능 테스트 결과 및 의견을 기록해주세요"
                  />
                </div>

                {/* 테스트 사진 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    테스트 결과 사진
                  </label>
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 text-center bg-purple-50">
                    <Camera className="mx-auto h-10 w-10 text-purple-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">테스트 결과 사진을 업로드하세요</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleStep3PhotoUpload}
                      className="hidden"
                      id="step3-test-photo"
                    />
                    <label
                      htmlFor="step3-test-photo"
                      className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg cursor-pointer hover:bg-purple-600"
                    >
                      사진 선택
                    </label>
                  </div>
                  {step3Photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {step3Photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`테스트 사진 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={() => removeStep3Photo(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 최종 승인 */}
            <div className="bg-white rounded-lg border-2 border-purple-200 p-6 shadow-md">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">최종 승인</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    검수 결과 *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-5 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors">
                      <div className="text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-bold text-green-800 text-lg">승인</p>
                        <p className="text-xs text-gray-600 mt-1">생산 투입 가능</p>
                      </div>
                    </button>
                    <button className="p-5 border-2 border-gray-300 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                      <div className="text-center">
                        <div className="text-4xl mb-2">⚠️</div>
                        <p className="font-bold text-yellow-800 text-lg">조건부 승인</p>
                        <p className="text-xs text-gray-600 mt-1">주의하여 사용</p>
                      </div>
                    </button>
                    <button className="p-5 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors">
                      <div className="text-center">
                        <div className="text-4xl mb-2">❌</div>
                        <p className="font-bold text-red-800 text-lg">반려</p>
                        <p className="text-xs text-gray-600 mt-1">재수리 필요</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    종합 의견 *
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="검수 결과에 대한 종합 의견을 작성해주세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    특이사항 및 권장사항
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="향후 관리를 위한 특이사항이나 권장사항을 기록해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
                이전 단계
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2">
                <Save className="h-5 w-5" />
                {submitting ? '제출 중...' : '최종 승인 완료'}
              </button>
            </div>
          </>
        )}

        {/* GPS 위치 정보 (숨김) */}
        <div className="hidden bg-white rounded-lg border p-4">
          <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            위치 정보
          </h4>
          
          {isGettingLocation ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-700">위치 정보를 가져오는 중...</span>
            </div>
          ) : requestData.gpsLocation ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">위치 정보 확인됨</p>
                  <p className="text-sm text-green-700 mt-1">{requestData.gpsLocation.address}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
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

        {/* 사진 첨부 */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-lg font-medium text-neutral-900 mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5" />
            문제 사진
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
          
          {requestData.images.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-neutral-700 mb-2">업로드된 이미지</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {requestData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`문제 사진 ${index + 1}`}
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
  );
};

export default RepairRequest;
