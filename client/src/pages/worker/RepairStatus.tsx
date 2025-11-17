import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, Wrench, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  status: string;
}

interface RepairRecord {
  id: number;
  date: string;
  type: string;
  description: string;
  technician: string;
  status: 'completed' | 'in_progress' | 'pending';
  cost?: number;
  parts?: string;
}

const RepairStatus: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [repairs, setRepairs] = useState<RepairRecord[]>([]);

  useEffect(() => {
    fetchData();
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
        status: data.status
      });

      // 수리 이력 데이터 (더미 데이터)
      const repairsData: RepairRecord[] = [
        {
          id: 1,
          date: '2024-11-10',
          type: '정기 보수',
          description: '냉각라인 청소 및 점검',
          technician: '김기술',
          status: 'completed',
          cost: 500000,
          parts: '냉각호스 교체'
        },
        {
          id: 2,
          date: '2024-10-15',
          type: '긴급 수리',
          description: '에젝터 핀 교체',
          technician: '이수리',
          status: 'completed',
          cost: 300000,
          parts: '에젝터 핀 x5'
        },
        {
          id: 3,
          date: '2024-09-20',
          type: '예방 정비',
          description: '슬라이드 부 윤활 및 조정',
          technician: '박정비',
          status: 'completed',
          cost: 200000,
          parts: '윤활유'
        }
      ];
      setRepairs(repairsData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
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
          <AlertCircle className="h-3 w-3" /> 대기
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

  const totalCost = repairs.reduce((sum, repair) => sum + (repair.cost || 0), 0);
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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 금형수리 현황표</h1>
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
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-700">총 수리 건수</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{repairs.length}건</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-700">완료 건수</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{completedCount}건</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-700">총 수리 비용</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">₩{totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* 수리 이력 테이블 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white">수리 이력</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">유형</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">내용</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">담당자</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">교체부품</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">비용</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {repairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{repair.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{repair.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{repair.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{repair.technician}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{repair.parts || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ₩{repair.cost?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(repair.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairStatus;
