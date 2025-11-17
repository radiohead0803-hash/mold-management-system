import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, AlertCircle, Camera, MapPin, CheckCircle, XCircle, Save } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  status: string;
  currentShotCount: number;
}

interface CleaningCheckItem {
  id: string;
  category: string;
  item: string;
  description: string;
  status: 'good' | 'bad' | null;
  notes: string;
}

const Cleaning: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [checkItems, setCheckItems] = useState<CleaningCheckItem[]>([]);
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
      const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}`, {
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
    const items: CleaningCheckItem[] = [
      { id: 'cln_1', category: '캐비티', item: '캐비티 표면 청결', description: '캐비티 표면의 수지 잔류물 및 이물질 제거 상태', status: null, notes: '' },
      { id: 'cln_2', category: '캐비티', item: '캐비티 광택', description: '캐비티 표면 광택 상태 확인', status: null, notes: '' },
      { id: 'cln_3', category: '캐비티', item: '캐비티 손상', description: '캐비티 표면 스크래치 및 손상 여부', status: null, notes: '' },
      { id: 'cln_4', category: '게이트', item: '게이트 청결', description: '게이트 부위 수지 잔류물 제거 상태', status: null, notes: '' },
      { id: 'cln_5', category: '게이트', item: '게이트 막힘', description: '게이트 막힘 및 변형 여부', status: null, notes: '' },
      { id: 'cln_6', category: '냉각라인', item: '냉각라인 청결', description: '냉각라인 내부 이물질 및 스케일 제거', status: null, notes: '' },
      { id: 'cln_7', category: '냉각라인', item: '냉각수 흐름', description: '냉각수 흐름 원활성 확인', status: null, notes: '' },
      { id: 'cln_8', category: '냉각라인', item: '냉각라인 누수', description: '냉각라인 누수 여부 확인', status: null, notes: '' },
      { id: 'cln_9', category: '이젝터 핀', item: '이젝터 핀 청결', description: '이젝터 핀 표면 수지 및 이물질 제거', status: null, notes: '' },
      { id: 'cln_10', category: '이젝터 핀', item: '이젝터 핀 작동', description: '이젝터 핀 작동 시 걸림 여부', status: null, notes: '' },
      { id: 'cln_11', category: '파팅면', item: '파팅면 청결', description: '파팅면 수지 잔류물 및 이물질 제거', status: null, notes: '' },
      { id: 'cln_12', category: '파팅면', item: '파팅면 밀착', description: '파팅면 밀착 상태 확인', status: null, notes: '' },
      { id: 'cln_13', category: '기타', item: '에어 벤트 청결', description: '에어 벤트 막힘 및 청결 상태', status: null, notes: '' },
      { id: 'cln_14', category: '기타', item: '런너 청결', description: '런너 부위 수지 잔류물 제거', status: null, notes: '' }
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
      alert('세척 점검이 완료되었습니다.');
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
  };

  const groupedItems = checkItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CleaningCheckItem[]>);

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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 세척 점검</h1>
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
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-3">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            점검 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cleaning;
