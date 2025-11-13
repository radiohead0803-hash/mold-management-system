import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

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
  const [vehicleModel, setVehicleModel] = useState('LT2');
  const [manufacturer, setManufacturer] = useState('');
  const [productionMethod, setProductionMethod] = useState('D+0');
  const [moldType, setMoldType] = useState('수축률');
  const [productionType, setProductionType] = useState('상형');
  const [partType, setPartType] = useState('게이트');
  const [toDate, setToDate] = useState('25-11-07 전');
  const [testStatus, setTestStatus] = useState('시작');

  // 주진계획 - 공정별 일정
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: '1', phase: '도면접수', startDate: '2024-09-05', endDate: '2024-09-05', status: '완료', note: '', progress: 'D+00' },
    { id: '2', phase: '플드레이스', startDate: '2024-09-30', endDate: '2024-09-30', status: '소재발주', note: '', progress: 'D+00' },
    { id: '3', phase: '금형설계', startDate: '2024-09-30', endDate: '2024-09-30', status: '공정설계', note: '', progress: 'D+00' },
    { id: '4', phase: '도면검도회', startDate: '2024-09-30', endDate: '2024-09-30', status: '검도회', note: '', progress: 'D+00' },
    { id: '5', phase: '상형가공', startDate: '2024-09-30', endDate: '2024-11-05', status: '형식 완성 전도록 오측', note: '형식(10/E) 완성(10/E) 전도록(10/E) 오측(10/E)', progress: 'D+00' },
    { id: '6', phase: '아형가공', startDate: '2024-09-30', endDate: '2024-11-05', status: '형식 완성 전도록 오측', note: '형식(10/E) 완성(10/E) 전도록(10/E) 오측(10/E)', progress: 'D+00' },
    { id: '7', phase: '코어가공', startDate: '2024-11-05', endDate: '2024-11-05', status: '코어가공', note: '', progress: 'D+00' },
    { id: '8', phase: '방전', startDate: '2024-10-30', endDate: '2024-10-30', status: '방전', note: '', progress: 'D+00' },
    { id: '9', phase: '결만사상', startDate: '2024-11-30', endDate: '2024-11-30', status: '사상', note: '', progress: 'D+00' },
    { id: '10', phase: '금형조립', startDate: '2024-11-30', endDate: '2024-11-30', status: '조립', note: '', progress: 'D+00' },
    { id: '11', phase: '습판', startDate: '2024-11-30', endDate: '2024-11-30', status: '습판', note: '', progress: 'D+00' },
    { id: '12', phase: 'T/O', startDate: '2024-11-07', endDate: '2024-11-07', status: 'T/O', note: '', progress: 'D+00' }
  ]);

  // 진도율 계산 함수
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
        setManufacturer(data.manufacturer || '');
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

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const saveData = {
        moldId,
        vehicleModel,
        manufacturer,
        productionMethod,
        moldType,
        productionType,
        partType,
        toDate,
        testStatus,
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
                <h1 className="text-2xl font-bold">개발단계 금형제작 계획</h1>
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
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">□ 제작사양 및 추진일정</h2>
            <span className="text-white text-sm">Creative Auto Module System</span>
          </div>

          {/* 제작사양 */}
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>▶</span> 제작사양
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-slate-400">
                <tbody>
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">차종</td>
                    <td className="border border-slate-400 px-4 py-2">
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">제작처</td>
                    <td className="border border-slate-400 px-4 py-2">
                      <input
                        type="text"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">진행공법</td>
                    <td className="border border-slate-400 px-4 py-2">
                      <input
                        type="text"
                        value={productionMethod}
                        onChange={(e) => setProductionMethod(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">T/O완경</td>
                    <td className="border border-slate-400 px-4 py-2">
                      <input
                        type="text"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">시작</td>
                    <td className="border border-slate-400 px-4 py-2 w-16">
                      <input type="checkbox" className="w-5 h-5" disabled={approvalStatus === 'approved'} />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center w-24">양산</td>
                    <td className="border border-slate-400 px-4 py-2 w-16">
                      <input type="checkbox" className="w-5 h-5" disabled={approvalStatus === 'approved'} />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">형번</td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}>
                      <input
                        type="text"
                        value={moldType}
                        onChange={(e) => setMoldType(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      />
                    </td>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center" rowSpan={2}>제작<br/>사양</td>
                    <td className="border border-slate-400 px-4 py-2">
                      <select
                        value={productionType}
                        onChange={(e) => setProductionType(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      >
                        <option value="상형">상형</option>
                        <option value="아형">아형</option>
                      </select>
                    </td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}>
                      <input
                        type="text"
                        value="부품중량(g)"
                        className="w-full px-2 py-1 border border-slate-300 rounded bg-slate-50"
                        disabled
                      />
                    </td>
                    <td className="border border-slate-400 px-4 py-2 text-center" colSpan={3}>(IMAGE)</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">원재료</td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={3}></td>
                    <td className="border border-slate-400 px-4 py-2">
                      <select
                        value={partType}
                        onChange={(e) => setPartType(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                        disabled={approvalStatus === 'approved'}
                      >
                        <option value="게이트">게이트</option>
                        <option value="기타">기타</option>
                      </select>
                    </td>
                    <td className="border border-slate-400 px-4 py-2" colSpan={6}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 주진계획 */}
          <div className="p-6 pt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>▶</span> 주진계획
              </h3>
              {approvalStatus !== 'approved' && (
                <button
                  onClick={handleAddSchedule}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  공정 추가
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-slate-400">
                <thead>
                  <tr className="bg-slate-200">
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-32">구분</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center" colSpan={3}>제작일정</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-48">비고</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-24">진도</th>
                    {approvalStatus !== 'approved' && (
                      <th className="border border-slate-400 px-4 py-2 font-bold text-center w-20">삭제</th>
                    )}
                  </tr>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center">일정</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-40">시작일</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-40">종료일</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center w-32">상태</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center">비고</th>
                    <th className="border border-slate-400 px-4 py-2 font-bold text-center">진도율</th>
                    {approvalStatus !== 'approved' && <th className="border border-slate-400 px-4 py-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {scheduleItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={item.phase}
                          onChange={(e) => handleScheduleChange(item.id, 'phase', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                          disabled={approvalStatus === 'approved'}
                          placeholder="공정명"
                        />
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="date"
                          value={item.startDate}
                          onChange={(e) => {
                            handleScheduleChange(item.id, 'startDate', e.target.value);
                            const progress = calculateProgress(e.target.value, item.endDate);
                            handleScheduleChange(item.id, 'progress', progress);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="date"
                          value={item.endDate}
                          onChange={(e) => {
                            handleScheduleChange(item.id, 'endDate', e.target.value);
                            const progress = calculateProgress(item.startDate, e.target.value);
                            handleScheduleChange(item.id, 'progress', progress);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={item.status}
                          onChange={(e) => handleScheduleChange(item.id, 'status', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
                          disabled={approvalStatus === 'approved'}
                          placeholder="상태"
                        />
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
                      {approvalStatus !== 'approved' && (
                        <td className="border border-slate-400 px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveSchedule(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 시각화 그래프 */}
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>▶</span> 진행 현황 시각화
              </h3>
              <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
                <div className="space-y-3">
                  {scheduleItems.map((item) => {
                    const start = new Date(item.startDate);
                    const end = new Date(item.endDate);
                    const today = new Date();
                    
                    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                    const elapsedDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
                    
                    let barColor = 'bg-blue-500';
                    if (progressPercent >= 100) barColor = 'bg-green-500';
                    else if (progressPercent >= 75) barColor = 'bg-yellow-500';
                    else if (progressPercent < 0) barColor = 'bg-gray-300';
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-slate-700 truncate">{item.phase}</div>
                        <div className="flex-1">
                          <div className="relative w-full h-8 bg-slate-200 rounded-lg overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-500 flex items-center justify-end px-2`}
                              style={{ width: `${progressPercent}%` }}
                            >
                              {progressPercent > 10 && (
                                <span className="text-white text-xs font-bold">
                                  {Math.round(progressPercent)}%
                                </span>
                              )}
                            </div>
                            {progressPercent <= 10 && progressPercent > 0 && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold">
                                {Math.round(progressPercent)}%
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-slate-500">
                            <span>{item.startDate}</span>
                            <span className="font-bold text-blue-600">
                              {item.progress || calculateProgress(item.startDate, item.endDate)}
                            </span>
                            <span>{item.endDate}</span>
                          </div>
                        </div>
                        <div className="w-24 text-sm text-slate-600 text-right">{item.status}</div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 범례 */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span>시작 전</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>진행 중 (0-75%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>진행 중 (75-99%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>완료</span>
                  </div>
                </div>
              </div>
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
