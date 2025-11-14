import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, AlertCircle, Plus, Trash2, Upload, X, FileText, Clock, CheckSquare } from 'lucide-react';

interface MoldInfo {
  moldId: string;
  name: string;
  partNumber?: string;
  manufacturer?: string;
  moldType?: string;
}

interface ScheduleItem {
  id: string;
  phase: string;
  startDate: string;
  endDate: string;
  status: string;
  note?: string;
  progress?: string;
}

const DevelopmentProgress: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldInfo | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // 제작사양 정보
  const [vehicleModel, setVehicleModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [toDate, setToDate] = useState('');
  const [testStart, setTestStart] = useState(false);
  const [testProduction, setTestProduction] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  const [manufacturingMethod, setManufacturingMethod] = useState('');
  const [shrinkageRate, setShrinkageRate] = useState('');
  const [cavityMaterial, setCavityMaterial] = useState(''); // 상형(캐비티) 재질
  const [coreMaterial, setCoreMaterial] = useState(''); // 하형(코어) 재질
  const [partWeight, setPartWeight] = useState('');
  const [rawMaterial, setRawMaterial] = useState('');
  const [gateType, setGateType] = useState('');
  const [productImage, setProductImage] = useState('');

  // 금형 재질 옵션 (체크리스트와 동일)
  const moldMaterialOptions = ['HS-PA (KP4)', 'CENA G', 'HPA4MA', 'KP-1', 'KP-4', 'KP-4M', 'NAK-80'];

  // 주진계획 - 고정 단계별 일정 (테스트 데이터: 완료 4개 / 진행중 4개 / 진행예정 4개)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    // 완료 (초록색) - 4개
    { id: '1', phase: '도면접수', startDate: '2024-09-01', endDate: '2024-09-05', status: '', note: '완료', progress: 'D+00' },
    { id: '2', phase: '몰드베이스 발주', startDate: '2024-09-06', endDate: '2024-09-15', status: '', note: '완료', progress: 'D+00' },
    { id: '3', phase: '금형설계', startDate: '2024-09-16', endDate: '2024-10-10', status: '', note: '완료', progress: 'D+00' },
    { id: '4', phase: '도면검도회', startDate: '2024-10-11', endDate: '2024-10-31', status: '', note: '완료', progress: 'D+00' },
    // 진행중 (파란색) - 4개
    { id: '5', phase: '상형가공', startDate: '2024-11-01', endDate: '2024-11-20', status: '', note: '진행중', progress: 'D+00' },
    { id: '6', phase: '하형가공', startDate: '2024-11-01', endDate: '2024-11-20', status: '', note: '진행중', progress: 'D+00' },
    { id: '7', phase: '코어가공', startDate: '2024-11-05', endDate: '2024-11-18', status: '', note: '진행중', progress: 'D+00' },
    { id: '8', phase: '방전', startDate: '2024-11-10', endDate: '2024-11-25', status: '', note: '진행중', progress: 'D+00' },
    // 진행예정 (회색) - 4개
    { id: '9', phase: '격면사상', startDate: '2024-11-26', endDate: '2024-12-05', status: '', note: '진행예정', progress: 'D+00' },
    { id: '10', phase: '금형조립', startDate: '2024-12-06', endDate: '2024-12-10', status: '', note: '진행예정', progress: 'D+00' },
    { id: '11', phase: '습합', startDate: '2024-12-11', endDate: '2024-12-15', status: '', note: '진행예정', progress: 'D+00' },
    { id: '12', phase: '초도 T/O', startDate: '2024-12-16', endDate: '2024-12-20', status: '', note: '진행예정', progress: 'D+00' }
  ]);

  // 일정 계산 함수
  const calculateProgress = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return 'D+00';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (elapsedDays < 0) return 'D-' + Math.abs(elapsedDays).toString().padStart(2, '0');
    if (elapsedDays > totalDays) return 'D+' + (elapsedDays - totalDays).toString().padStart(2, '0');
    
    return 'D+' + elapsedDays.toString().padStart(2, '0');
  };

  // 상태 자동 계산 함수
  const calculateStatus = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '진행예정';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // 시작일 이전
    if (today < start) return '진행예정';
    
    // 종료일 이후
    if (today > end) return '완료';
    
    // 진행 중
    return '진행중';
  };

  // 상태별 색상 클래스
  const getStatusColor = (status: string): string => {
    switch (status) {
      case '진행예정':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case '진행중':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case '완료':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // 전체 제작일정 계산 (모든 공정의 총 일수)
  const calculateTotalSchedule = (): string => {
    if (scheduleItems.length === 0) return 'D+0';
    
    let totalDays = 0;
    scheduleItems.forEach(item => {
      if (item.startDate && item.endDate) {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        totalDays += Math.max(0, days);
      }
    });
    
    return `D+${totalDays}`;
  };

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMoldInfo({
          moldId: data.moldId || moldId || '',
          name: data.name || '금형명 없음',
          partNumber: data.partNumber,
          manufacturer: data.manufacturer,
          moldType: data.moldType
        });
        // 스키마 데이터 자동 입력
        setVehicleModel(data.vehicleModel || '');
        setManufacturer(data.manufacturer || '');
        setPartNumber(data.partNumber || '');
        setManufacturingMethod(data.manufacturingMethod || '');
        setShrinkageRate(data.shrinkageRate ? `${data.shrinkageRate}/1000` : '');
        setPartWeight(data.partWeight || '');
        setRawMaterial(data.rawMaterial || '');
        setGateType(data.gateType || '');
        if (data.mainImage) setProductImage(data.mainImage);
      }

      // 기존 개발진행 데이터 로드
      const progressResponse = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/development-progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (progressData.vehicleModel) setVehicleModel(progressData.vehicleModel);
        if (progressData.scheduleItems) setScheduleItems(progressData.scheduleItems);
        if (progressData.approvalStatus) setApprovalStatus(progressData.approvalStatus);
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      phase: '',
      startDate: '',
      endDate: '',
      status: '',
      note: ''
    };
    setScheduleItems([...scheduleItems, newItem]);
  };

  const handleRemoveSchedule = (id: string) => {
    setScheduleItems(scheduleItems.filter(item => item.id !== id));
  };

  const handleScheduleChange = (id: string, field: keyof ScheduleItem, value: string) => {
    setScheduleItems(scheduleItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const saveData = {
        moldId,
        vehicleModel,
        manufacturer,
        partNumber,
        manufacturingMethod,
        shrinkageRate,
        cavityMaterial,
        coreMaterial,
        partWeight,
        rawMaterial,
        gateType,
        productImage,
        toDate,
        testStart,
        testProduction,
        scheduleItems,
        approvalStatus: 'pending',
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/development-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        alert('개발진행 계획이 저장되었습니다. 관리자 승인 대기 중입니다.');
        setApprovalStatus('pending');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">개발계획</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {approvalStatus === 'approved' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-bold">승인완료</span>
                </div>
              )}
              {approvalStatus === 'pending' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-bold">승인대기</span>
                </div>
              )}
              {approvalStatus !== 'approved' && (
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  저장 및 승인요청
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 제작사양 및 추진일정 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white">□</span> 제작사양 및 추진일정
            </h2>
            <span className="text-white text-xs">Creative Auto Module System</span>
          </div>

          {/* 제작사양 */}
          <div className="p-6 bg-slate-50">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 제작사양
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-slate-400">
                <tbody>
                  {/* 첫 번째 행 */}
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">차종</td>
                    <td className="border border-slate-400 px-4 py-2 w-32">
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">제작처</td>
                    <td className="border border-slate-400 px-4 py-2 w-32">
                      <input
                        type="text"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">T/O일정</td>
                    <td className="border border-slate-400 px-4 py-2 w-32">
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-20">시작</td>
                    <td className="border border-slate-400 px-4 py-2 w-16 text-center">
                      <input
                        type="checkbox"
                        checked={testStart}
                        onChange={(e) => setTestStart(e.target.checked)}
                        className="w-5 h-5"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-20">양산</td>
                    <td className="border border-slate-400 px-4 py-2 w-16 text-center">
                      <input
                        type="checkbox"
                        checked={testProduction}
                        onChange={(e) => setTestProduction(e.target.checked)}
                        className="w-5 h-5"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                  </tr>
                  {/* 두 번째 행 */}
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">형번</td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}>
                      <input
                        type="text"
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                        placeholder="품번"
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">제작일정</td>
                    <td className="border border-slate-400 px-4 py-2">
                      <input
                        type="text"
                        value={calculateTotalSchedule()}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-center bg-blue-50 font-bold text-blue-700"
                        disabled
                        readOnly
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">수축률</td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}>
                      <input
                        type="text"
                        value={shrinkageRate}
                        onChange={(e) => setShrinkageRate(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                        placeholder="6/1000"
                      />
                    </td>
                  </tr>
                  {/* 세 번째 행 */}
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">품명</td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}>
                      <input
                        type="text"
                        value={moldInfo?.name || ''}
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-slate-50"
                        disabled
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center" rowSpan={2}>금형<br/>재질</td>
                    <td className="border border-slate-400 px-4 py-2" rowSpan={2}>
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-xs font-bold text-slate-600 mb-1 block">상형 (캐비티)</label>
                          <select
                            value={cavityMaterial}
                            onChange={(e) => setCavityMaterial(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                            disabled={approvalStatus === 'approved'}
                          >
                            <option value="">재질 선택</option>
                            {moldMaterialOptions.map((material) => (
                              <option key={material} value={material}>
                                {material}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 mb-1 block">하형 (코어)</label>
                          <select
                            value={coreMaterial}
                            onChange={(e) => setCoreMaterial(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                            disabled={approvalStatus === 'approved'}
                          >
                            <option value="">재질 선택</option>
                            {moldMaterialOptions.map((material) => (
                              <option key={material} value={material}>
                                {material}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center" colSpan={2}>부품중량(g)</td>
                    <td className="border border-slate-400 px-4 py-2 text-center align-middle" rowSpan={2} colSpan={2}>
                      <div className="flex flex-col items-center gap-2">
                        {productImage ? (
                          <div className="relative group">
                            <img src={productImage} alt="제품" className="max-h-24 mx-auto rounded border border-slate-300" />
                            {approvalStatus !== 'approved' && (
                              <button
                                onClick={() => setProductImage('')}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="이미지 삭제"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="w-full h-24 bg-slate-100 rounded border-2 border-dashed border-slate-300 flex items-center justify-center">
                              <span className="text-slate-400 text-sm">이미지 없음</span>
                            </div>
                            {approvalStatus !== 'approved' && (
                              <label className="cursor-pointer px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                <Upload className="h-3 w-3 inline mr-1" />
                                이미지 업로드
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* 네 번째 행 */}
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">원재료</td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}>
                      <input
                        type="text"
                        value={rawMaterial}
                        onChange={(e) => setRawMaterial(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                        placeholder="원재료"
                      />
                    </td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={2}>
                      <input
                        type="text"
                        value={partWeight}
                        onChange={(e) => setPartWeight(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                        disabled={approvalStatus === 'approved'}
                        placeholder="중량"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 추진계획 단계 시각화 */}
          <div className="p-6 pt-0 bg-slate-50">
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
              <div className="grid grid-cols-12 gap-2 relative">
                {/* 연결선 */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-300 z-0"></div>
                
                {/* 12개 단계 한 줄로 */}
                {scheduleItems.map((item) => {
                  const status = calculateStatus(item.startDate, item.endDate);
                  const bgColor = status === '완료' ? 'bg-green-500' : status === '진행중' ? 'bg-blue-500' : 'bg-slate-300';
                  
                  return (
                    <div key={item.id} className="flex flex-col items-center z-10 bg-white px-1">
                      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mb-1 shadow-lg`}>
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mb-0.5 text-center leading-tight">{item.phase}</h4>
                      <p className="text-xs text-slate-600 text-center">{status}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 주진계획 */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>▶</span> 주진계획
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-slate-400">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-32" rowSpan={2}>구분</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center" colSpan={3}>제작일정</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-48" rowSpan={2}>비고</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-24" rowSpan={2}>일정</th>
                  </tr>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-40">시작일</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-40">종료일</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-32">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">
                        <div className="w-full px-2 py-1 text-sm font-medium text-slate-700 text-center">
                          {item.phase}
                        </div>
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="date"
                          value={item.startDate || ''}
                          onChange={(e) => {
                            handleScheduleChange(item.id, 'startDate', e.target.value);
                            const progress = calculateProgress(e.target.value, item.endDate);
                            handleScheduleChange(item.id, 'progress', progress);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="date"
                          value={item.endDate || ''}
                          onChange={(e) => {
                            handleScheduleChange(item.id, 'endDate', e.target.value);
                            const progress = calculateProgress(item.startDate, e.target.value);
                            handleScheduleChange(item.id, 'progress', progress);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        {(() => {
                          const status = calculateStatus(item.startDate, item.endDate);
                          const colorClass = getStatusColor(status);
                          return (
                            <div className={`w-full px-3 py-1 text-sm font-medium text-center rounded border ${colorClass}`}>
                              {status}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => handleScheduleChange(item.id, 'note', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                          disabled={approvalStatus === 'approved'}
                          placeholder="비고"
                        />
                      </td>
                      <td className="border border-slate-400 px-4 py-2 text-center">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-bold text-sm">
                          {item.progress || calculateProgress(item.startDate, item.endDate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 안내 메시지 */}
        {approvalStatus === 'pending' && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">승인 대기 중</h3>
                <p className="text-sm text-yellow-800">
                  개발진행 계획이 제출되었습니다. 관리자의 승인을 기다리고 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {approvalStatus === 'approved' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">승인 완료</h3>
                <p className="text-sm text-green-800">
                  개발진행 계획이 관리자에 의해 승인되었습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentProgress;
