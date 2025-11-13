import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  status: string;
}

interface RepairProgress {
  id: number;
  requestDate: string;
  expectedDate: string;
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  technician?: string;
  notes?: string;
}

const RepairProgress: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [repairs, setRepairs] = useState<RepairProgress[]>([]);

  useEffect(() => {
    fetchData();
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
        status: data.status
      });

      // 수리 진행현황 데이터 (더미 데이터)
      const repairsData: RepairProgress[] = [
        {
          id: 1,
          requestDate: '2024-11-12',
          expectedDate: '2024-11-15',
          type: '긴급 수리',
          description: '게이트부 마모 수리',
          priority: 'high',
          status: 'in_progress',
          progress: 60,
          technician: '김기술',
          notes: '부품 발주 완료, 작업 진행 중'
        },
        {
          id: 2,
          requestDate: '2024-11-10',
          expectedDate: '2024-11-18',
          type: '예방 정비',
          description: '냉각라인 전체 점검',
          priority: 'medium',
          status: 'pending',
          progress: 0,
          notes: '일정 조율 중'
        },
        {
          id: 3,
          requestDate: '2024-11-08',
          expectedDate: '2024-11-12',
          type: '정기 보수',
          description: '슬라이드 부 윤활',
          priority: 'low',
          status: 'completed',
          progress: 100,
          technician: '이수리',
          notes: '작업 완료'
        }
      ];
      setRepairs(repairsData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">긴급</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">보통</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">낮음</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> 완료
        </span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <Clock className="h-3 w-3" /> 진행중
        </span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> 대기
        </span>;
      default:
        return null;
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

  const inProgressCount = repairs.filter(r => r.status === 'in_progress').length;
  const pendingCount = repairs.filter(r => r.status === 'pending').length;
  const completedCount = repairs.filter(r => r.status === 'completed').length;

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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 금형수리 진행현황</h1>
                  <p className="text-sm text-slate-600">{moldInfo?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-700">진행중</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{inProgressCount}건</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-slate-700">대기중</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}건</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-700">완료</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{completedCount}건</p>
          </div>
        </div>

        {/* 진행현황 카드 */}
        <div className="space-y-4">
          {repairs.map((repair) => (
            <div key={repair.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{repair.type}</h3>
                    {getPriorityBadge(repair.priority)}
                    {getStatusBadge(repair.status)}
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{repair.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">요청일</p>
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {repair.requestDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">완료예정일</p>
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {repair.expectedDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">담당자</p>
                      <p className="font-semibold text-slate-900">{repair.technician || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">진행률</p>
                      <p className="font-semibold text-blue-600">{repair.progress}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${repair.progress}%` }}
                  ></div>
                </div>
              </div>

              {repair.notes && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">비고</p>
                  <p className="text-sm text-slate-700">{repair.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepairProgress;
