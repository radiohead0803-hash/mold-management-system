import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Upload, CheckCircle, Clock, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface MoldInfo {
  moldId: string;
  name: string;
  partNumber?: string;
  manufacturer?: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
}

const TransferRequest: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldInfo | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // 이관 요청 정보
  const [fromCompany, setFromCompany] = useState('');
  const [toCompany, setToCompany] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // 체크리스트
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 'c1', category: '관리 현황', item: '세척주기 확인', checked: false },
    { id: 'c2', category: '관리 현황', item: '세척등급 확인', checked: false },
    { id: 'c3', category: '관리 현황', item: '습윤등급 확인', checked: false },
    { id: 'c4', category: '관리 현황', item: '사출기 사양 확인', checked: false },
    { id: 'c5', category: '점검 내용', item: '제품 BURR 확인', checked: false },
    { id: 'c6', category: '점검 내용', item: 'EYE BOLT 체결 확인', checked: false },
    { id: 'c7', category: '점검 내용', item: '상·하 고정판 확인', checked: false },
    { id: 'c8', category: '점검 내용', item: '경질상태 확인', checked: false },
    { id: 'c9', category: '점검 내용', item: '표면 흠집,녹 확인', checked: false },
    { id: 'c10', category: '점검 내용', item: '파팅면 오염,타격 확인', checked: false }
  ]);

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMoldInfo(data);
        setFromCompany(data.manufacturer || '');
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistToggle = (id: string) => {
    setChecklistItems(items => items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const loadChecklistFromTransferChecklist = () => {
    // 모달 열기
    setShowChecklistModal(true);
  };

  const handleImportChecklist = () => {
    // 체크리스트 데이터 가져오기 (실제로는 API 호출)
    alert('양산금형 이관 체크리스트 데이터를 불러왔습니다.');
    setShowChecklistModal(false);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const requestData = {
        moldId,
        fromCompany,
        toCompany,
        transferReason,
        transferDate,
        contactPerson,
        contactPhone,
        contactEmail,
        documents,
        notes,
        checklistItems,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}/transfer-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('이관 요청이 제출되었습니다.');
        setCurrentStep(2);
        // navigate(`/worker/mold/${moldId}`);
      }
    } catch (error) {
      console.error('제출 실패:', error);
      alert('제출에 실패했습니다.');
    }
  };

  const approvalSteps = [
    { step: 1, title: '이관 요청', description: '제작처 요청 작성', icon: FileText, status: currentStep >= 1 ? 'completed' : 'pending' },
    { step: 2, title: '체크리스트 검토', description: '이관 체크리스트 확인', icon: CheckCircle, status: currentStep >= 2 ? 'completed' : 'pending' },
    { step: 3, title: '관리자 승인', description: '이관 승인 대기', icon: Clock, status: currentStep >= 3 ? 'completed' : 'pending' },
    { step: 4, title: '인수 확인', description: '인수처 확인 완료', icon: CheckCircle, status: currentStep >= 4 ? 'completed' : 'pending' },
    { step: 5, title: '이관 완료', description: '금형 이관 완료', icon: CheckCircle, status: currentStep >= 5 ? 'completed' : 'pending' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-purple-900">금형 이관 요청</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Send className="h-4 w-4" />
              이관 요청 제출
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 승인 프로세스 시각화 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-purple-900">인계·인수 승인 프로세스</h2>
            {/* 테스트 단계 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
              >
                Step 1
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
              >
                Step 2
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
              >
                Step 3
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
              >
                Step 4
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-3 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
              >
                Step 5
              </button>
            </div>
          </div>
          <div className="relative">
            {/* 프로그레스 바 */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (approvalSteps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* 단계 표시 */}
            <div className="relative flex justify-between">
              {approvalSteps.map((stepInfo, index) => {
                const Icon = stepInfo.icon;
                const isCompleted = stepInfo.status === 'completed';
                const isCurrent = stepInfo.step === currentStep;

                return (
                  <div key={stepInfo.step} className="flex flex-col items-center" style={{ width: `${100 / approvalSteps.length}%` }}>
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-500'
                          : isCurrent
                          ? 'bg-white border-purple-500 animate-pulse'
                          : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      <Icon className={`h-8 w-8 ${isCompleted ? 'text-white' : isCurrent ? 'text-purple-600' : 'text-slate-400'}`} />
                    </div>
                    <div className="mt-3 text-center">
                      <p className={`text-sm font-bold ${isCompleted || isCurrent ? 'text-purple-900' : 'text-slate-500'}`}>
                        {stepInfo.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{stepInfo.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">📋 금형 기본 정보</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">금형 번호</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.moldId}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">금형명</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.name}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">품번</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.partNumber || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">현재 보관처</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.manufacturer || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 양산금형 이관 체크리스트 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">✓ 양산금형 이관 체크리스트</h2>
            <button
              onClick={loadChecklistFromTransferChecklist}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-semibold"
            >
              <Upload className="h-4 w-4" />
              체크리스트 불러오기
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>안내:</strong> 양산금형 이관 체크리스트에서 작성된 항목을 불러올 수 있습니다.
                또는 아래 항목을 직접 체크하여 작성하세요.
              </p>
            </div>

            {/* 카테고리별 체크리스트 */}
            {['관리 현황', '점검 내용'].map(category => (
              <div key={category} className="mb-6">
                <h3 className="text-md font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {checklistItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleChecklistToggle(item.id)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-slate-700">{item.item}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}

            {/* 완료율 표시 */}
            <div className="mt-6 p-4 bg-slate-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">체크리스트 완료율</span>
                <span className="text-sm font-bold text-purple-600">
                  {checklistItems.filter(i => i.checked).length} / {checklistItems.length}
                </span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(checklistItems.filter(i => i.checked).length / checklistItems.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 이관 정보 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">🔄 이관 정보</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">이관 출발지 *</label>
                <input
                  type="text"
                  value={fromCompany}
                  onChange={(e) => setFromCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="현재 보관 업체"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">이관 목적지 *</label>
                <input
                  type="text"
                  value={toCompany}
                  onChange={(e) => setToCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="이관 받을 업체"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">이관 사유 *</label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="이관이 필요한 사유를 상세히 입력해주세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">희망 이관일 *</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* 담당자 정보 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">👤 담당자 정보</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">담당자명 *</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="홍길동"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">연락처 *</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="010-1234-5678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="example@company.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 첨부 서류 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">📎 첨부 서류</h2>
          </div>
          <div className="p-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">클릭하여 파일 업로드</p>
                <p className="text-xs text-slate-500">PDF, 이미지 파일 등</p>
              </div>
              <input type="file" className="hidden" multiple />
            </label>
          </div>
        </div>

        {/* 비고 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">📝 비고</h2>
          </div>
          <div className="p-6">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={4}
              placeholder="추가 전달 사항이 있으면 입력해주세요"
            />
          </div>
        </div>
      </div>

      {/* 체크리스트 불러오기 모달 */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">양산금형 이관 체크리스트 불러오기</h2>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>안내:</strong> 양산금형 이관 체크리스트 페이지에서 작성된 항목을 불러옵니다.
                  불러온 데이터는 이관 요청서에 자동으로 입력됩니다.
                </p>
              </div>

              {/* 체크리스트 미리보기 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">불러올 체크리스트 항목</h3>
                  
                  {/* 관리 현황 */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                      관리 현황 (인계 업체)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-slate-700">세척주기: 파일 첨부 | 노즐 SHOT 수: 152,238</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-slate-700">세척등급: B | 최종 세척 점검 일: 24.06</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-slate-700">습윤등급: B | 최종 습윤 점검 일: 24.06</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-slate-700">사출기 사양: UBE 2,200Ton | 관리중량(g): 1,460</span>
                      </div>
                    </div>
                  </div>

                  {/* 점검 내용 */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                      점검 내용 (인수 업체)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        '제품 BURR 확인',
                        'EYE BOLT 체결 확인',
                        '상·하 고정판 확인',
                        '경질상태 확인',
                        '표면 흠집,녹 확인',
                        '파팅면 오염,타격 확인',
                        '파팅면 BURR 확인',
                        '코어핀 트에경스 확인',
                        '마모 확인',
                        '작동유 관통유 확인'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-xs text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowChecklistModal(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleImportChecklist}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                체크리스트 불러오기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferRequest;
