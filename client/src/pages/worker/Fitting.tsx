import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers, Camera, MapPin, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  status: string;
  currentShotCount: number;
}

interface FittingCheckItem {
  id: string;
  category: string;
  item: string;
  description: string;
  status: 'good' | 'bad' | null;
  notes: string;
}

const Fitting: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [checkItems, setCheckItems] = useState<FittingCheckItem[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    fetchData();
    initializeCheckItems();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error('금형 정보를 불러올 수 없습니다.');

      const data = await response.json();
      setMoldInfo({
        moldId: data.moldId,
        name: data.name,
        status: data.status,
        currentShotCount: data.shotCount || 0
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCheckItems = () => {
    const items: FittingCheckItem[] = [
      { id: 'fit_1', category: '파팅면', item: '파팅면 밀착도', description: '상하 금형 파팅면 밀착 상태', status: null, notes: '' },
      { id: 'fit_2', category: '파팅면', item: '단차 측정', description: '파팅면 단차 ±0.02mm 이내', status: null, notes: '' },
      { id: 'fit_3', category: '파팅면', item: '틈새 확인', description: '파팅면 틈새 및 이물질 여부', status: null, notes: '' },
      { id: 'fit_4', category: '가이드핀', item: '가이드핀 정렬', description: '가이드핀 수평각 측정', status: null, notes: '' },
      { id: 'fit_5', category: '가이드핀', item: '가이드핀 마모', description: '가이드핀 마모 및 유격 확인', status: null, notes: '' },
      { id: 'fit_6', category: '습합면', item: '습합면 광택', description: '습합면 광택 상태 확인', status: null, notes: '' },
      { id: 'fit_7', category: '습합면', item: '접촉 오차', description: '상하 금형 접촉 오차 측정', status: null, notes: '' },
      { id: 'fit_8', category: '작동부', item: '슬라이드 작동', description: '슬라이드 작동 시 걸림 여부', status: null, notes: '' },
      { id: 'fit_9', category: '작동부', item: '에젝터 작동', description: '에젝터 핀 작동 확인', status: null, notes: '' }
    ];
    setCheckItems(items);
  };

  const updateCheckItem = (id: string, field: 'status' | 'notes', value: any) => {
    setCheckItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const getLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('위치 정보 가져오기 실패:', error);
          setIsGettingLocation(false);
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      alert('GPS 위치를 먼저 가져와주세요.');
      return;
    }

    const requiredItems = checkItems.filter(item => item.status === null);
    if (requiredItems.length > 0) {
      alert('모든 항목을 점검해주세요.');
      return;
    }

    try {
      // TODO: API 호출
      alert('습합 점검이 완료되었습니다.');
      navigate(`/worker/mold/${moldId}`);
    } catch (error) {
      console.error('제출 실패:', error);
      alert('제출에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
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
  }, {} as Record<string, FittingCheckItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/worker/mold/${moldId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 습합 점검</h1>
                  <p className="text-sm text-slate-600">{moldInfo?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">금형번호</p>
              <p className="font-semibold text-slate-900">{moldInfo?.moldId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">현재 쇼트수</p>
              <p className="font-semibold text-slate-900">{moldInfo?.currentShotCount.toLocaleString()} shot</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">GPS 위치</p>
              <button
                onClick={getLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300"
              >
                <MapPin className="h-4 w-4" />
                {isGettingLocation ? '위치 가져오는 중...' : location ? '위치 확인됨' : '위치 가져오기'}
              </button>
            </div>
          </div>
        </div>

        {/* 점검 항목 */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3">
              <h2 className="text-base font-bold text-white">{category}</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{item.item}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => updateCheckItem(item.id, 'status', 'good')}
                        className={`p-2 rounded-lg transition-colors ${
                          item.status === 'good' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-green-100'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => updateCheckItem(item.id, 'status', 'bad')}
                        className={`p-2 rounded-lg transition-colors ${
                          item.status === 'bad' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-red-100'
                        }`}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 transition-colors">
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={item.notes}
                    onChange={(e) => updateCheckItem(item.id, 'notes', e.target.value)}
                    placeholder="비고 사항 입력..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/worker/mold/${moldId}`)}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            점검 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fitting;
