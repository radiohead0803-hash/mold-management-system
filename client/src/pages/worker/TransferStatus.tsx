import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, Package } from 'lucide-react';

interface TransferRecord {
  id: string;
  fromCompany: string;
  toCompany: string;
  transferDate: string;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected';
  requestedAt: string;
  contactPerson: string;
}

const TransferStatus: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/transfer-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTransfers(data.transfers || []);
      } else {
        // Mock data for testing
        setTransfers([
          {
            id: '1',
            fromCompany: '현대자동차 울산공장',
            toCompany: 'ABC금형',
            transferDate: '2024-12-15',
            status: 'pending',
            requestedAt: '2024-11-12',
            contactPerson: '김철수'
          },
          {
            id: '2',
            fromCompany: 'ABC금형',
            toCompany: '현대자동차 아산공장',
            transferDate: '2024-11-20',
            status: 'approved',
            requestedAt: '2024-11-05',
            contactPerson: '이영희'
          },
          {
            id: '3',
            fromCompany: '현대자동차 아산공장',
            toCompany: 'XYZ금형수리',
            transferDate: '2024-11-25',
            status: 'in_transit',
            requestedAt: '2024-11-10',
            contactPerson: '박민수'
          },
          {
            id: '4',
            fromCompany: 'XYZ금형수리',
            toCompany: '현대자동차 울산공장',
            transferDate: '2024-10-30',
            status: 'completed',
            requestedAt: '2024-10-15',
            contactPerson: '정수진'
          },
          {
            id: '5',
            fromCompany: '현대자동차 울산공장',
            toCompany: 'DEF금형제작',
            transferDate: '2024-11-08',
            status: 'rejected',
            requestedAt: '2024-11-01',
            contactPerson: '최동욱'
          }
        ]);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // Mock data for testing on error
      setTransfers([
        {
          id: '1',
          fromCompany: '현대자동차 울산공장',
          toCompany: 'ABC금형',
          transferDate: '2024-12-15',
          status: 'pending',
          requestedAt: '2024-11-12',
          contactPerson: '김철수'
        },
        {
          id: '2',
          fromCompany: 'ABC금형',
          toCompany: '현대자동차 아산공장',
          transferDate: '2024-11-20',
          status: 'approved',
          requestedAt: '2024-11-05',
          contactPerson: '이영희'
        },
        {
          id: '3',
          fromCompany: '현대자동차 아산공장',
          toCompany: 'XYZ금형수리',
          transferDate: '2024-11-25',
          status: 'in_transit',
          requestedAt: '2024-11-10',
          contactPerson: '박민수'
        },
        {
          id: '4',
          fromCompany: 'XYZ금형수리',
          toCompany: '현대자동차 울산공장',
          transferDate: '2024-10-30',
          status: 'completed',
          requestedAt: '2024-10-15',
          contactPerson: '정수진'
        },
        {
          id: '5',
          fromCompany: '현대자동차 울산공장',
          toCompany: 'DEF금형제작',
          transferDate: '2024-11-08',
          status: 'rejected',
          requestedAt: '2024-11-01',
          contactPerson: '최동욱'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: '승인대기' },
      approved: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', text: '승인완료' },
      in_transit: { icon: Package, color: 'bg-purple-100 text-purple-800', text: '이관중' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: '완료' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: '반려' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${badge.color}`}>
        <Icon className="h-4 w-4" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-purple-900">금형 이관 현황</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">요청일</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">출발지</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">목적지</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">이관일</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">담당자</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      이관 기록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setShowDetailModal(true);
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900">{transfer.requestedAt}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{transfer.fromCompany}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{transfer.toCompany}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{transfer.transferDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{transfer.contactPerson}</td>
                      <td className="px-6 py-4">{getStatusBadge(transfer.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">이관 상세 정보</h2>
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
              {/* 상태 배지 */}
              <div className="mb-6 flex justify-center">
                {getStatusBadge(selectedTransfer.status)}
              </div>

              {/* 기본 정보 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">요청일</label>
                    <p className="text-base font-medium text-slate-900">{selectedTransfer.requestedAt}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">이관 예정일</label>
                    <p className="text-base font-medium text-slate-900">{selectedTransfer.transferDate}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">출발지</label>
                  <p className="text-base font-medium text-slate-900">{selectedTransfer.fromCompany}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">목적지</label>
                  <p className="text-base font-medium text-slate-900">{selectedTransfer.toCompany}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">담당자</label>
                  <p className="text-base font-medium text-slate-900">{selectedTransfer.contactPerson}</p>
                </div>

                {/* 이관 사유 (mock data) */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">이관 사유</label>
                  <p className="text-sm text-slate-700">
                    금형 수리 및 점검을 위한 이관입니다. 정기 점검 주기에 따라 금형 상태를 확인하고 
                    필요한 보수 작업을 진행할 예정입니다.
                  </p>
                </div>

                {/* 체크리스트 요약 */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <label className="text-xs font-semibold text-purple-700 uppercase block mb-3">체크리스트 완료 현황</label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">관리 현황</span>
                      <span className="text-sm font-bold text-green-600">4/4 완료</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-700">점검 내용</span>
                      <span className="text-sm font-bold text-green-600">10/10 완료</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                {/* 타임라인 */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-3">진행 타임라인</label>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">이관 요청</p>
                        <p className="text-xs text-slate-500">{selectedTransfer.requestedAt}</p>
                      </div>
                    </div>
                    {selectedTransfer.status !== 'pending' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">체크리스트 검토 완료</p>
                          <p className="text-xs text-slate-500">2024-11-13 10:30</p>
                        </div>
                      </div>
                    )}
                    {(selectedTransfer.status === 'in_transit' || selectedTransfer.status === 'completed') && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">관리자 승인</p>
                          <p className="text-xs text-slate-500">2024-11-14 14:20</p>
                        </div>
                      </div>
                    )}
                    {selectedTransfer.status === 'completed' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">이관 완료</p>
                          <p className="text-xs text-slate-500">{selectedTransfer.transferDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

export default TransferStatus;
