import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { 
  ArrowLeft, 
  Save,
  Plus,
  Minus,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  location: string;
  currentShotCount: number;
  maxShotCount: number;
  dailyTarget: number;
}

interface ShotRecord {
  id: string;
  date: string;
  time: string;
  shotCount: number;
  operator: string;
  shift: 'day' | 'night';
  notes?: string;
  productionRate: number;
  defectCount: number;
  efficiency: number;
}

interface DailyStats {
  totalShots: number;
  targetShots: number;
  achievementRate: number;
  averageRate: number;
  defectRate: number;
  efficiency: number;
}

const ShotCountRecord: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [shotRecords, setShotRecords] = useState<ShotRecord[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newRecord, setNewRecord] = useState({
    shotCount: 0,
    operator: '',
    shift: 'day' as 'day' | 'night',
    notes: '',
    defectCount: 0
  });

  useEffect(() => {
    if (moldId) {
      fetchMoldInfo();
      fetchShotRecords();
      fetchDailyStats();
    }
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
        moldId: data.moldId,
        name: data.name,
        location: data.location,
        currentShotCount: data.shotCount || 0,
        maxShotCount: data.maxShotCount || 100000,
        dailyTarget: data.dailyTarget || 1000
      });
    } catch (error) {
      console.error('Mold info fetch error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const fetchShotRecords = async () => {
    try {
      // Mock 데이터 - 실제로는 API에서 가져옴
      const mockRecords: ShotRecord[] = [
        {
          id: '1',
          date: new Date().toISOString().split('T')[0],
          time: '08:00',
          shotCount: 250,
          operator: '작업자A',
          shift: 'day',
          notes: '정상 가동',
          productionRate: 95,
          defectCount: 5,
          efficiency: 92
        },
        {
          id: '2',
          date: new Date().toISOString().split('T')[0],
          time: '12:00',
          shotCount: 480,
          operator: '작업자A',
          shift: 'day',
          notes: '점심시간 후 재가동',
          productionRate: 88,
          defectCount: 12,
          efficiency: 85
        },
        {
          id: '3',
          date: new Date().toISOString().split('T')[0],
          time: '16:00',
          shotCount: 720,
          operator: '작업자B',
          shift: 'day',
          notes: '교대 후 정상 가동',
          productionRate: 92,
          defectCount: 8,
          efficiency: 90
        }
      ];
      
      setShotRecords(mockRecords);
    } catch (error) {
      console.error('Shot records fetch error:', error);
    }
  };

  const fetchDailyStats = async () => {
    try {
      // Mock 통계 데이터
      const mockStats: DailyStats = {
        totalShots: 720,
        targetShots: 1000,
        achievementRate: 72,
        averageRate: 90,
        defectRate: 3.5,
        efficiency: 89
      };
      
      setDailyStats(mockStats);
    } catch (error) {
      console.error('Daily stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (amount: number) => {
    setNewRecord(prev => ({
      ...prev,
      shotCount: Math.max(0, prev.shotCount + amount)
    }));
  };

  const handleSubmit = async () => {
    if (!newRecord.shotCount || !newRecord.operator) {
      alert('타수와 작업자명을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      
      const recordData = {
        moldId: moldId!,
        shotCount: newRecord.shotCount,
        operator: newRecord.operator,
        shift: newRecord.shift,
        notes: newRecord.notes,
        defectCount: newRecord.defectCount,
        timestamp: new Date().toISOString()
      };

      // Mock API 호출
      const response = await fetch('${API_BASE_URL}/api/worker/shot-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('qr_session_token')}`
        },
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        throw new Error('타수 기록 등록에 실패했습니다.');
      }

      // 성공 시 데이터 새로고침
      await fetchShotRecords();
      await fetchDailyStats();
      
      // 입력 폼 초기화
      setNewRecord({
        shotCount: 0,
        operator: '',
        shift: 'day',
        notes: '',
        defectCount: 0
      });

      alert('타수 기록이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const fillTestData = () => {
    setNewRecord({
      shotCount: 150,
      operator: '작업자C',
      shift: 'day',
      notes: '정상 생산 중',
      defectCount: 3
    });
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getShiftText = (shift: string) => {
    return shift === 'day' ? '주간' : '야간';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">타수 기록을 불러오는 중...</p>
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
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-neutral-900">타수 기록</h1>
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
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? '저장 중...' : '기록 저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 금형 정보 및 진행률 */}
        {moldInfo && (
          <div className="bg-white rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-lg inline-block mb-3">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">현재 타수</h3>
                <p className="text-3xl font-bold text-blue-600">{moldInfo.currentShotCount.toLocaleString()}</p>
                <p className="text-sm text-neutral-600">/ {moldInfo.maxShotCount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">일일 목표</h3>
                <p className="text-3xl font-bold text-green-600">{moldInfo.dailyTarget.toLocaleString()}</p>
                <p className="text-sm text-neutral-600">오늘의 목표</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">진행률</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {((moldInfo.currentShotCount / moldInfo.maxShotCount) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-neutral-600">전체 진행률</p>
              </div>
            </div>
            
            {/* 진행률 바 */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>전체 진행률</span>
                <span>{((moldInfo.currentShotCount / moldInfo.maxShotCount) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (moldInfo.currentShotCount / moldInfo.maxShotCount) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* 오늘의 통계 */}
        {dailyStats && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              오늘의 생산 현황
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-neutral-600">누적 타수</p>
                <p className="text-2xl font-bold text-blue-600">{dailyStats.totalShots}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-neutral-600">목표 달성률</p>
                <p className="text-2xl font-bold text-green-600">{dailyStats.achievementRate}%</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-neutral-600">불량률</p>
                <p className="text-2xl font-bold text-yellow-600">{dailyStats.defectRate}%</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-neutral-600">효율성</p>
                <p className="text-2xl font-bold text-purple-600">{dailyStats.efficiency}%</p>
              </div>
            </div>
          </div>
        )}

        {/* 타수 기록 입력 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            새 타수 기록
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  타수 *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickAdd(-50)}
                    className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={newRecord.shotCount}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, shotCount: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    placeholder="타수 입력"
                    min="0"
                  />
                  <button
                    onClick={() => handleQuickAdd(50)}
                    className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleQuickAdd(10)} className="btn-secondary text-sm">+10</button>
                  <button onClick={() => handleQuickAdd(25)} className="btn-secondary text-sm">+25</button>
                  <button onClick={() => handleQuickAdd(50)} className="btn-secondary text-sm">+50</button>
                  <button onClick={() => handleQuickAdd(100)} className="btn-secondary text-sm">+100</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  작업자 *
                </label>
                <input
                  type="text"
                  value={newRecord.operator}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, operator: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="작업자명 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  근무 시간
                </label>
                <select
                  value={newRecord.shift}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, shift: e.target.value as 'day' | 'night' }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">주간 (08:00-20:00)</option>
                  <option value="night">야간 (20:00-08:00)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  불량 개수
                </label>
                <input
                  type="number"
                  value={newRecord.defectCount}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, defectCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="불량 개수"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  메모
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="특이사항이나 메모를 입력하세요"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 타수 기록 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            오늘의 타수 기록
          </h3>
          
          <div className="space-y-4">
            {shotRecords.map((record) => (
              <div key={record.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{record.shotCount} 타수</p>
                      <p className="text-sm text-neutral-600">{record.time} - {record.operator} ({getShiftText(record.shift)})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">생산율: {record.productionRate}%</p>
                    <p className="text-sm text-neutral-600">불량: {record.defectCount}개</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getProgressColor(record.efficiency)}`}></div>
                    <span className="text-neutral-600">효율성: {record.efficiency}%</span>
                  </div>
                  {record.notes && (
                    <span className="text-neutral-500">메모: {record.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShotCountRecord;
