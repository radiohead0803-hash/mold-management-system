import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Droplets, 
  Camera, 
  Save, 
  AlertCircle,
  Info
} from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
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

interface CleaningRecord {
  type: '세척' | '습합';
  date: string;
  shotCount: number;
  worker: string;
  method: string;
  materials: string;
  notes: string;
  photos: File[];
  result: '양호' | '불량' | '';
}

const CleaningLubrication: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [cleaningRecord, setCleaningRecord] = useState<CleaningRecord>({
    type: '세척',
    date: new Date().toISOString().split('T')[0],
    shotCount: 0,
    worker: '',
    method: '',
    materials: '',
    notes: '',
    photos: [],
    result: ''
  });

  useEffect(() => {
    if (moldId) {
      fetchMoldInfo();
      getCurrentLocation();
    }
  }, [moldId]);

  const fetchMoldInfo = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('금형 정보를 불러올 수 없습니다.');
      const data = await response.json();
      setMoldInfo({
        moldId: data.moldId,
        name: data.name,
        location: data.location,
        currentShotCount: data.currentShotCount || 0
      });
      setCleaningRecord(prev => ({ ...prev, shotCount: data.currentShotCount || 0 }));
    } catch (error) {
      console.error('Mold info fetch error:', error);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCleaningRecord(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setCleaningRecord(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!cleaningRecord.worker || !cleaningRecord.method) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // API 호출 로직
      alert(`${cleaningRecord.type} 기록이 저장되었습니다.`);
      navigate(`/worker/mold/${moldId}`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('저장 중 오류가 발생했습니다.');
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

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-neutral-900">습합 / 세척 관리</h1>
              <p className="text-sm text-neutral-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
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
                  <p className="text-sm font-semibold text-neutral-900">{moldInfo.moldId}</p>
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
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-teal-300 rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-teal-600" />
            <div>
              <h4 className="font-bold text-teal-900">습합 / 세척 관리</h4>
              <p className="text-sm text-teal-700">각 섹션별로 작업 내용을 기록하세요. 두 작업을 동시에 기록할 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 세척 관리 섹션 */}
        <div className="bg-white rounded-lg border-2 border-blue-200 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-100">
              <div className="p-2 bg-blue-500 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-blue-900">🧹 세척 관리 (Cleaning)</h4>
                <p className="text-xs text-blue-600">권장 주기: 10,000 shots 마다</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">세척일자 *</label>
                  <input type="date" value={cleaningRecord.date}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, date: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">작업자 *</label>
                  <input type="text" value={cleaningRecord.worker}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, worker: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="QR 스캔 시 자동기록" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">세척방법 *</label>
                  <select value={cleaningRecord.method}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, method: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">선택</option>
                    <option value="초음파">초음파 / 에어 / 수동 / 드라이아이스 등</option>
                    <option value="세척 당당자용">세척 당당자용</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">세척구분</label>
                  <input type="text" value={cleaningRecord.materials}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, materials: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="캐비티 / 게이트 / 냉각라인 등" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">세척내용</label>
                <textarea value={cleaningRecord.notes}
                  onChange={(e) => setCleaningRecord({...cleaningRecord, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3} placeholder="세척 작업 상세 내용" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">세척시간</label>
                <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  placeholder="본 단위" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">세척 전/후 사진</label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center bg-blue-50">
                  <Camera className="mx-auto h-10 w-10 text-blue-400 mb-2" />
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload}
                    className="hidden" id="cleaning-photo-upload" />
                  <label htmlFor="cleaning-photo-upload"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                    사진 선택
                  </label>
                </div>
                {cleaningRecord.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cleaningRecord.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img src={URL.createObjectURL(photo)} alt={`세척 사진 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
                        <button onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">세척 결과</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setCleaningRecord({...cleaningRecord, result: '양호'})}
                    className={`p-3 rounded-lg border-2 font-medium ${
                      cleaningRecord.result === '양호' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300'
                    }`}>
                    ✅ 양호
                  </button>
                  <button onClick={() => setCleaningRecord({...cleaningRecord, result: '불량'})}
                    className={`p-3 rounded-lg border-2 font-medium ${
                      cleaningRecord.result === '불량' ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-gray-300'
                    }`}>
                    ❌ 불량
                  </button>
                </div>
              </div>
            </div>
        </div>

        {/* 습합 관리 섹션 */}
        <div className="bg-white rounded-lg border-2 border-green-200 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-green-100">
              <div className="p-2 bg-green-500 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-green-900">💧 습합 관리 (Lubrication)</h4>
                <p className="text-xs text-green-600">권장 주기: 5,000 shots 마다</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">습합일자 *</label>
                  <input type="date" value={cleaningRecord.date}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, date: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">작업자 *</label>
                  <input type="text" value={cleaningRecord.worker}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, worker: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="자동기록" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">습합방법</label>
                  <input type="text" value={cleaningRecord.method}
                    onChange={(e) => setCleaningRecord({...cleaningRecord, method: e.target.value})}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="습합 담당자용" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">습합부위</label>
                  <select className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="">선택</option>
                    <option value="슬라이드">슬라이드 / 리프터 / 가이드 핀 / 에젝터</option>
                    <option value="다중선택">다중선택</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">습합제종</label>
                <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  placeholder="제품명 / 등급" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">사용량</label>
                <input type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
                  placeholder="g 또는 ml" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">습합상태</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setCleaningRecord({...cleaningRecord, result: '양호'})}
                    className={`p-3 rounded-lg border-2 font-medium ${
                      cleaningRecord.result === '양호' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300'
                    }`}>
                    ✅ 적정 / 과다 / 부족
                  </button>
                  <button className="p-3 rounded-lg border-2 font-medium bg-white border-gray-300">
                    선택
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">습합 전/후 사진</label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center bg-green-50">
                  <Camera className="mx-auto h-10 w-10 text-green-400 mb-2" />
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload}
                    className="hidden" id="lube-photo-upload" />
                  <label htmlFor="lube-photo-upload"
                    className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600">
                    사진 선택
                  </label>
                </div>
                {cleaningRecord.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cleaningRecord.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img src={URL.createObjectURL(photo)} alt={`습합 사진 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
                        <button onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">습합 결과</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setCleaningRecord({...cleaningRecord, result: '양호'})}
                    className={`p-3 rounded-lg border-2 font-medium ${
                      cleaningRecord.result === '양호' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300'
                    }`}>
                    ✅ 양호
                  </button>
                  <button className="p-3 rounded-lg border-2 font-medium bg-white border-gray-300">
                    선택
                  </button>
                </div>
              </div>
            </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
            취소
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-8 py-3 bg-teal-500 text-white rounded-lg font-bold hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2">
            <Save className="h-5 w-5" />
            {submitting ? '저장 중...' : '기록 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleaningLubrication;
