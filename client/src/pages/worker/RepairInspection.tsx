import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Wrench, TrendingUp } from 'lucide-react';

interface RepairRequest {
  id: string;
  requestDate: string;
  issueType: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestedBy: string;
  assignedTo?: string;
  completedDate?: string;
  cost?: number;
}

const RepairInspection: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [repairRequests] = useState<RepairRequest[]>([
    {
      id: 'R-001',
      requestDate: '2024-11-12',
      issueType: '금형 파손',
      description: '코어 부분 크랙 발생, 긴급 수리 필요',
      priority: 'high',
      status: 'in_progress',
      requestedBy: '김철수',
      assignedTo: '이수리',
      cost: 1500000
    },
    {
      id: 'R-002',
      requestDate: '2024-11-10',
      issueType: '표면 마모',
      description: '캐비티 표면 마모로 인한 제품 불량',
      priority: 'medium',
      status: 'pending',
      requestedBy: '박민수',
      cost: 800000
    },
    {
      id: 'R-003',
      requestDate: '2024-11-08',
      issueType: '냉각수 누수',
      description: '냉각 라인 누수 발견',
      priority: 'high',
      status: 'completed',
      requestedBy: '정수진',
      assignedTo: '최기술',
      completedDate: '2024-11-09',
      cost: 500000
    },
    {
      id: 'R-004',
      requestDate: '2024-11-05',
      issueType: '게이트 불량',
      description: '게이트 부분 변형',
      priority: 'medium',
      status: 'completed',
      requestedBy: '이영희',
      assignedTo: '이수리',
      completedDate: '2024-11-07',
      cost: 600000
    },
    {
      id: 'R-005',
      requestDate: '2024-11-01',
      issueType: '이젝터 핀 파손',
      description: '이젝터 핀 3개 교체 필요',
      priority: 'low',
      status: 'completed',
      requestedBy: '김철수',
      assignedTo: '최기술',
      completedDate: '2024-11-03',
      cost: 300000
    }
  ]);

  useEffect(() => {
    setLoading(false);
  }, [moldId]);

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: '완료' },
      in_progress: { icon: Clock, color: 'bg-blue-100 text-blue-800', text: '진행중' },
      pending: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', text: '대기' },
      cancelled: { icon: AlertCircle, color: 'bg-slate-100 text-slate-600', text: '취소' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { color: 'bg-red-100 text-red-800', text: '긴급' },
      medium: { color: 'bg-orange-100 text-orange-800', text: '보통' },
      low: { color: 'bg-green-100 text-green-800', text: '낮음' }
    };
    const badge = badges[priority as keyof typeof badges] || badges.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const filteredRequests = selectedStatus === 'all'
    ? repairRequests
    : repairRequests.filter(r => r.status === selectedStatus);

  const totalCost = repairRequests.reduce((sum, r) => sum + (r.cost || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">금형수리 점검 현황표</h1>
              <p className="text-sm text-slate-600">금형 ID: {moldId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-slate-600">전체 수리 요청</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{repairRequests.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-slate-600">완료</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {repairRequests.filter(r => r.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-slate-600">진행중</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {repairRequests.filter(r => r.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-slate-600">총 수리 비용</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {(totalCost / 10000).toFixed(0)}만원
            </p>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">상태 필터</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 보기</option>
            <option value="pending">대기</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>

        {/* 수리 요청 목록 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">요청 ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">요청일</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">문제 유형</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">설명</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">우선순위</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">담당자</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">비용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      수리 요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{request.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{request.requestDate}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{request.issueType}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{request.description}</td>
                      <td className="px-6 py-4">{getPriorityBadge(request.priority)}</td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{request.assignedTo || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {request.cost ? `${(request.cost / 10000).toFixed(0)}만원` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 수리 유형별 통계 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">수리 유형별 현황</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">금형 파손</span>
              <span className="text-sm font-bold text-red-600">1건</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">표면 마모</span>
              <span className="text-sm font-bold text-orange-600">1건</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">냉각수 누수</span>
              <span className="text-sm font-bold text-blue-600">1건</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">게이트 불량</span>
              <span className="text-sm font-bold text-green-600">1건</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">이젝터 핀 파손</span>
              <span className="text-sm font-bold text-purple-600">1건</span>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">수리 요청 상세 정보</h2>
                <p className="text-sm text-white/80">{selectedRequest.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* 상태 및 우선순위 */}
              <div className="flex gap-3 mb-6">
                {getStatusBadge(selectedRequest.status)}
                {getPriorityBadge(selectedRequest.priority)}
              </div>

              {/* 기본 정보 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">요청일</label>
                    <p className="text-base font-medium text-slate-900">{selectedRequest.requestDate}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">요청자</label>
                    <p className="text-base font-medium text-slate-900">{selectedRequest.requestedBy}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">문제 유형</label>
                  <p className="text-base font-medium text-slate-900">{selectedRequest.issueType}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">상세 설명</label>
                  <p className="text-sm text-slate-700">{selectedRequest.description}</p>
                </div>

                {selectedRequest.assignedTo && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="text-xs font-semibold text-blue-700 uppercase block mb-1">담당자</label>
                    <p className="text-base font-medium text-blue-900">{selectedRequest.assignedTo}</p>
                  </div>
                )}

                {selectedRequest.completedDate && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="text-xs font-semibold text-green-700 uppercase block mb-1">완료일</label>
                    <p className="text-base font-medium text-green-900">{selectedRequest.completedDate}</p>
                  </div>
                )}

                {selectedRequest.cost && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <label className="text-xs font-semibold text-orange-700 uppercase block mb-1">수리 비용</label>
                    <p className="text-2xl font-bold text-orange-900">
                      {selectedRequest.cost.toLocaleString()}원
                      <span className="text-base ml-2">({(selectedRequest.cost / 10000).toFixed(0)}만원)</span>
                    </p>
                  </div>
                )}

                {/* 진행률 */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">진행률</label>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedRequest.status === 'completed' ? '100%' : 
                       selectedRequest.status === 'in_progress' ? '60%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        selectedRequest.status === 'completed' ? 'bg-green-500' :
                        selectedRequest.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-400'
                      }`}
                      style={{
                        width: selectedRequest.status === 'completed' ? '100%' :
                               selectedRequest.status === 'in_progress' ? '60%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* 비고 */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">비고</label>
                  <p className="text-sm text-slate-700">
                    {selectedRequest.status === 'in_progress' 
                      ? '부품 발주 완료, 작업 진행 중'
                      : selectedRequest.status === 'completed'
                      ? '작업 완료 및 테스트 검증 완료'
                      : '작업 대기 중'}
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairInspection;
