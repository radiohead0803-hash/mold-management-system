import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, Factory, Package, FileText, Ruler, Layers, Settings, Info } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  productNumber?: string;
  productName?: string;
}

interface SpecItem {
  label: string;
  value: string;
  status?: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  submittedDate?: string;
}

const ManufacturingSpecs: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  
  // 시스템 자동 입력 항목
  const [productInfo, setProductInfo] = useState<SpecItem[]>([]);
  
  // 제작처 입력 항목 (승인 대기/승인 완료)
  const [basicInfo, setBasicInfo] = useState<SpecItem[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<SpecItem[]>([]);
  const [moldSpecs, setMoldSpecs] = useState<SpecItem[]>([]);
  
  // 승인 상태
  const [approvalStatus, setApprovalStatus] = useState({
    basic: 'approved' as 'pending' | 'approved' | 'rejected',
    schedule: 'approved' as 'pending' | 'approved' | 'rejected',
    specs: 'pending' as 'pending' | 'approved' | 'rejected'
  });

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
        productNumber: data.productNumber,
        productName: data.productName
      });

      // 제품 정보 (테스트 데이터 포함)
      const productData: SpecItem[] = [];
      productData.push({ label: '품번', value: data.productNumber || 'P-2024-1001' });
      productData.push({ label: '품명', value: data.productName || '자동차 범퍼 금형' });
      productData.push({ label: '모델명', value: data.productModel || 'BP-F150-2024' });
      productData.push({ label: '고객사', value: data.customer || '현대자동차' });
      setProductInfo(productData);


      // 필수 관리 항목 1: 기본 정보
      const basicData: SpecItem[] = [];
      basicData.push({ label: '제작업체', value: data.manufacturer || '(주)정밀금형' });
      basicData.push({ label: '제작담당자', value: data.manufacturingPerson || '이금형' });
      basicData.push({ label: '연락처', value: data.contactNumber || '010-1234-5678' });
      basicData.push({ label: '도면번호', value: data.drawingNumber || 'DWG-2024-1001' });
      setBasicInfo(basicData);

      // 필수 관리 항목 2: 일정 관리
      const scheduleData: SpecItem[] = [];
      scheduleData.push({ label: '제작시작일', value: data.manufacturingDate ? new Date(data.manufacturingDate).toLocaleDateString('ko-KR') : '2024-10-01' });
      scheduleData.push({ label: '제작완료일', value: data.manufacturingEndDate ? new Date(data.manufacturingEndDate).toLocaleDateString('ko-KR') : '2024-11-15' });
      scheduleData.push({ label: '납품예정일', value: data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString('ko-KR') : '2024-11-20' });
      scheduleData.push({ label: '진행상태', value: data.progressStatus || '제작중' });
      setScheduleInfo(scheduleData);

      // 필수 관리 항목 3: 제작사양 (금형 정보)
      const specsData: SpecItem[] = [];
      specsData.push({ label: '금형 타입', value: data.moldType || '사출금형' });
      specsData.push({ label: '캐비티 수', value: data.cavityCount ? `${data.cavityCount}개` : '2개' });
      specsData.push({ label: '금형 크기 (L×W×H)', value: data.moldSize || '1200 x 800 x 600 mm' });
      specsData.push({ label: '금형 중량', value: data.moldWeight ? `${data.moldWeight}kg` : '3500kg' });
      specsData.push({ label: '적용 톤수', value: data.tonage ? `${data.tonage}톤` : '350톤' });
      specsData.push({ label: '코어 재질', value: data.coreMaterial || 'NAK80' });
      specsData.push({ label: '캐비티 재질', value: data.cavityMaterial || 'S50C' });
      specsData.push({ label: '러너 타입', value: data.runnerType || 'Hot Runner' });
      specsData.push({ label: '게이트 타입', value: data.gateType || 'Pin Gate' });
      specsData.push({ label: '이젝션 방식', value: data.ejectionType || 'Ejector Pin' });
      specsData.push({ label: '냉각 방식', value: data.coolingType || '수냉식' });
      specsData.push({ label: '냉각 채널 수', value: data.coolingChannels ? `${data.coolingChannels}개` : '12개' });
      specsData.push({ label: '슬라이드 수', value: data.slideCount ? `${data.slideCount}개` : '4개' });
      specsData.push({ label: '리프터 수', value: data.lifterCount ? `${data.lifterCount}개` : '2개' });
      setMoldSpecs(specsData);

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const renderSpecSection = (title: string, icon: React.ReactNode, items: SpecItem[], gradient: string) => {
    if (items.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-white">□</span> {title}
          </h2>
          <span className="text-white text-xs">Creative Auto Module System</span>
        </div>
        
        <div className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/worker/mold/${moldId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">제작사양</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 워크플로우 안내 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">제작사양 입력 프로세스</h4>
              <p className="text-sm text-blue-800">
                ① 제품정보: 시스템 자동 입력 → ② 제작처: 각 단계별 정보 입력 → ③ 관리자: 승인 처리 → ④ 시스템: 자동 등록
              </p>
            </div>
          </div>
        </div>

        {/* 시스템 자동 입력: 제품 정보 */}
        <div className="bg-gradient-to-r from-slate-400 to-slate-500 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-2">✅ 시스템 자동 입력</h2>
          <p className="text-sm opacity-90">품번, 품명 기반으로 자동 생성된 제품 정보</p>
        </div>

        {/* 제품 정보 */}
        {renderSpecSection(
          '📦 제품 정보',
          <Package className="h-5 w-5 text-white" />,
          productInfo,
          'bg-gradient-to-r from-blue-500 to-cyan-600'
        )}

        {/* 제작처 필수 관리 항목 */}
        <div className="bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl p-6 text-white shadow-lg mt-8">
          <h2 className="text-xl font-bold mb-2">📋 제작처 필수 관리 항목</h2>
          <p className="text-sm opacity-90">제작처가 입력 후 관리자 승인 대기 중 (필수 항목만 포함)</p>
        </div>

        {/* 1. 기본 정보 */}
        <div className="relative">
          {approvalStatus.basic === 'approved' && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-slate-500 text-white text-xs font-bold rounded-full">승인완료</span>
            </div>
          )}
          {approvalStatus.basic === 'pending' && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-slate-400 text-white text-xs font-bold rounded-full">승인대기</span>
            </div>
          )}
          {renderSpecSection(
            '1️⃣ 기본 정보',
            <Factory className="h-5 w-5 text-white" />,
            basicInfo,
            'bg-gradient-to-r from-blue-500 to-indigo-600'
          )}
        </div>

        {/* 2. 일정 관리 */}
        <div className="relative">
          {approvalStatus.schedule === 'approved' && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-slate-500 text-white text-xs font-bold rounded-full">승인완료</span>
            </div>
          )}
          {approvalStatus.schedule === 'pending' && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-slate-400 text-white text-xs font-bold rounded-full">승인대기</span>
            </div>
          )}
          {renderSpecSection(
            '2️⃣ 일정 관리',
            <FileText className="h-5 w-5 text-white" />,
            scheduleInfo,
            'bg-gradient-to-r from-purple-500 to-pink-600'
          )}
        </div>

        {/* 3. 제작사양 */}
        <div className="relative">
          {approvalStatus.specs === 'approved' && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-slate-500 text-white text-xs font-bold rounded-full">승인완료</span>
            </div>
          )}
          {approvalStatus.specs === 'pending' && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3 py-1 bg-slate-400 text-white text-xs font-bold rounded-full">승인대기</span>
            </div>
          )}
          {renderSpecSection(
            '3️⃣ 제작사양 (금형 정보)',
            <Settings className="h-5 w-5 text-white" />,
            moldSpecs,
            'bg-gradient-to-r from-orange-500 to-amber-600'
          )}
        </div>

        {/* 데이터 없음 메시지 */}
        {productInfo.length === 0 && basicInfo.length === 0 && scheduleInfo.length === 0 &&
         moldSpecs.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">제작사양 정보가 없습니다</h3>
            <p className="text-sm text-slate-500">제작처가 정보를 입력하면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManufacturingSpecs;
