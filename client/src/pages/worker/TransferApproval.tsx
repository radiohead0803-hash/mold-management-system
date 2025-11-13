import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  fromCompany: string;
  toCompany: string;
  transferDate: string;
  transferReason: string;
  contactPerson: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const TransferApproval: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  useEffect(() => {
    // Mock data - replace with API call
    setRequests([
      {
        id: '1',
        fromCompany: '현대자동차',
        toCompany: 'ABC금형',
        transferDate: '2024-12-01',
        transferReason: '금형 수리 필요',
        contactPerson: '홍길동',
        requestedAt: '2024-11-12',
        status: 'pending'
      }
    ]);
  }, [moldId]);

  const handleApprove = async (id: string) => {
    if (confirm('이관을 승인하시겠습니까?')) {
      // API call to approve
      alert('승인되었습니다.');
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('이관을 반려하시겠습니까?')) {
      // API call to reject
      alert('반려되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-purple-900">이관 승인</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">승인 대기중인 이관 요청이 없습니다.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
                <h2 className="text-lg font-bold text-white">이관 요청 #{request.id}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">요청일</label>
                    <p className="text-base font-medium text-slate-900">{request.requestedAt}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">출발지</label>
                    <p className="text-base font-medium text-slate-900">{request.fromCompany}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">목적지</label>
                    <p className="text-base font-medium text-slate-900">{request.toCompany}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">희망 이관일</label>
                    <p className="text-base font-medium text-slate-900">{request.transferDate}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-500">이관 사유</label>
                  <p className="text-base text-slate-900 mt-2 p-4 bg-slate-50 rounded-lg">{request.transferReason}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4" />
                    반려
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransferApproval;
