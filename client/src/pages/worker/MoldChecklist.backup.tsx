import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Upload, AlertCircle } from 'lucide-react';

interface CheckItem {
  id: string;
  item: string;
  spec?: string;
  specType?: 'checkbox' | 'radio' | 'input' | 'text' | 'checkbox-repair';
  specOptions?: string[];
  specValue?: string;
  repairValue?: string;
  checked: boolean;
}

interface CategorySection {
  id: string;
  title: string;
  enabled: boolean;
  items: CheckItem[];
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

const MoldChecklist: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<any>(null);
  const [productImage, setProductImage] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved'>('pending');
  
  // 금형제작처에서 입력 가능한 항목들
  const [vehicleModel, setVehicleModel] = useState('NO5 (기본차)');
  const [manufacturer, setManufacturer] = useState('지금강');
  const [supplier, setSupplier] = useState('아이에이테크');
  const [injectionMachine, setInjectionMachine] = useState('- ton');
  const [clampingForce, setClampingForce] = useState('650ton');
  const [eoCutDate, setEoCutDate] = useState('2020.09.08');
  const [initialToDate, setInitialToDate] = useState('2020.11.20');

  // 검증 내용
  const [verificationItems, setVerificationItems] = useState<CheckItem[]>([
    { id: 'v1', item: '금형 번호 중복, 금형 아이템 번호 중복 확인', specType: 'checkbox', specOptions: ['완전', '미완전'], specValue: '완전', checked: false },
    { id: 'v2', item: '양산처 금형 제작 사양서 반영', specType: 'checkbox', specOptions: ['완전', '미 반영'], specValue: '완전', checked: false },
    { id: 'v3', item: '수축률', specType: 'input', specValue: '8/1000', checked: false },
    { id: 'v4', item: '금형 중량', specType: 'input', specValue: '4.9ton', checked: false },
    { id: 'v5', item: '범퍼 어드밴싱 적용', specType: 'checkbox', specOptions: ['적용', '미 적용', '사양 삭제'], specValue: '사양 삭제', checked: false },
    { id: 'v6', item: '캐비티 재질', specType: 'input', specValue: 'KP4', checked: false },
    { id: 'v7', item: '코어 재질', specType: 'input', specValue: 'KP4', checked: false },
    { id: 'v8', item: '캐비티 수', specType: 'radio', specOptions: ['1', '2', '3', '4', '5', '6'], specValue: '2', checked: false },
    { id: 'v9', item: '게이트', specType: 'checkbox', specOptions: ['오드', '밸브'], specValue: '오드', checked: false },
    { id: 'v10', item: '게이트 수', specType: 'radio', specOptions: ['1', '2', '3', '4', '5', '6'], specValue: '1', checked: false },
    { id: 'v11', item: '게이트 위치 적정성', specType: 'checkbox', specOptions: ['반영', '미 반영'], specValue: '미 반영', checked: false },
    { id: 'v12', item: '게이트 사이즈 확인', specType: 'checkbox', specOptions: ['완전', '미 확인'], specValue: '완전', checked: false },
    { id: 'v13', item: '게이트 컷팅 형상 적정성', specType: 'checkbox', specOptions: ['캐비티', '코어', '외형'], specValue: '코어', checked: false },
    { id: 'v14', item: '이젝트 핀', specType: 'checkbox', specOptions: ['완전', '자리', '위치', '직경'], specValue: '완전,자리,위치,직경', checked: false },
    { id: 'v15', item: '노즐 및 게이트 금형 간인', specType: 'checkbox', specOptions: ['반영', '미 반영'], specValue: '미 반영', checked: false },
    { id: 'v16', item: '냉각라인 위치 적정성 (제품 두께 20mm 이상 확인)', specType: 'checkbox', specOptions: ['반영', '미 반영'], specValue: '반영', checked: false },
    { id: 'v17', item: '온도센서 반영', specType: 'checkbox', specOptions: ['반영', '미 반영'], specValue: '반영', checked: false },
    { id: 'v18', item: '온도 센서 수(캐비티 / 코어)', specType: 'input', specValue: '1/1', checked: false }
  ]);

  // 성형예상
  const [moldingItems, setMoldingItems] = useState<CheckItem[]>([
    { id: 'm1', item: '충 대료를 및 도금 아이템 성형 예상(충돌 예상) 실시', spec: '2020. 09 . 18 .', checked: false },
    { id: 'm2', item: '금형 확인 (미 성형 반영본 확인)', spec: '■완전 □미 확인', checked: false },
    { id: 'm3', item: '금형 확인 (제품 투계, 날판 구조 확인)', spec: '■완전 □미 확인', checked: false },
    { id: 'm4', item: '웰드라인 위치 확인', spec: '□확인 ■미 확인', checked: false },
    { id: 'm5', item: '웰드라인 구조 형상 수정', spec: '□확인 ■미 확인', checked: false },
    { id: 'm6', item: '가스 발생 부위 확인', spec: '□확인 ■미 확인', checked: false }
  ]);

  // 싱크마크
  const [sinkMarkItems, setSinkMarkItems] = useState<CheckItem[]>([
    { id: 's1', item: '전체 리브 0.7t 반영', spec: '■반영 □미 반영', checked: false },
    { id: 's2', item: '싱크 발생 구조 (제품 투계 확인)', spec: '■반영 □미 반영', checked: false },
    { id: 's3', item: '예각 부위 확인 - 제품 실물기 반영', spec: '■반영 □미 반영', checked: false }
  ]);

  // 취출
  const [ejectionItems, setEjectionItems] = useState<CheckItem[]>([
    { id: 'e1', item: '제품 취출 구조 - 범퍼 후드 매칭부', spec: '□반영 □미 반영 ■사양 삭제', checked: false },
    { id: 'e2', item: '제품 취출 구조 - 범퍼 후드 매칭부', spec: '□반영 □미 반영 ■사양 삭제', checked: false },
    { id: 'e3', item: '언더컷 구조 확인', spec: '■반영 □미 반영', checked: false },
    { id: 'e4', item: '빠기 구멍 4도 반영', spec: '■반영 □미 반영', checked: false }
  ]);

  // MIC 제품
  const [micItems, setMicItems] = useState<CheckItem[]>([
    { id: 'mic1', item: 'MIC 사양 게이트 형상 반영 (HKMC 스프루 제작 가이드)', spec: '□반영 □미 반영 ■사양 삭제', checked: false },
    { id: 'mic2', item: '성형안전성 확보 제품 투계 반영', spec: '□반영 □미 반영 ■사양 삭제', checked: false }
  ]);

  // 기타 검토사항
  const [otherItems, setOtherItems] = useState<CheckItem[]>([
    { id: 'o1', item: 'TPO 보스 내경 M4 : Φ3.2 / M5 : Φ4.2', spec: '■반영 □미 반영 □사양 삭제', checked: false },
    { id: 'o2', item: '플러터 0.5mm 위치 아동 (외관 매칭성 개선)', spec: '■반영 □미 반영 □사양 삭제', checked: false }
  ]);

  // 도금
  const [platingItems, setPlatingItems] = useState<CheckItem[]>([
    { id: 'p1', item: '게이트 위치 / 가스 환경성 - ABS : 250mm ↓ - PC+ABS : 200mm ↓', spec: '□반영 □미 반영 ■사양 삭제', checked: false },
    { id: 'p2', item: '수축률', spec: '□반영 □미 반영 ■사양 삭제', checked: false },
    { id: 'p3', item: '보스 조립본 엇지 1R 반영', spec: '□반영 □미 반영 ■사양 삭제', checked: false }
  ]);

  // 리어 램프
  const [rearLampItems, setRearLampItems] = useState<CheckItem[]>([
    { id: 'r1', item: '리어 램프 - 보스 : 5도 이상', spec: '□반영 □미 반영 ■사양 삭제', checked: false },
    { id: 'r2', item: '리어 램프 - 보스 : 투계 5.0t 이상', spec: '□반영 □미 반영 ■사양 삭제', checked: false }
  ]);

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
        setMoldInfo(data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckToggle = (items: CheckItem[], setItems: any, id: string) => {
    setItems(items.map((item: CheckItem) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSpecChange = (items: CheckItem[], setItems: any, id: string, value: string) => {
    setItems(items.map((item: CheckItem) => 
      item.id === id ? { ...item, specValue: value } : item
    ));
  };

  const handleCheckboxToggle = (items: CheckItem[], setItems: any, id: string, option: string) => {
    setItems(items.map((item: CheckItem) => {
      if (item.id === id) {
        const currentValues = item.specValue?.split(',') || [];
        const newValues = currentValues.includes(option)
          ? currentValues.filter(v => v !== option)
          : [...currentValues, option];
        return { ...item, specValue: newValues.join(',') };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const saveData = {
        moldId,
        vehicleModel,
        manufacturer,
        supplier,
        injectionMachine,
        clampingForce,
        eoCutDate,
        initialToDate,
        verificationItems,
        moldingItems,
        sinkMarkItems,
        ejectionItems,
        micItems,
        otherItems,
        platingItems,
        rearLampItems,
        productImage,
        approvalStatus: 'pending',
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        alert('체크리스트가 저장되었습니다. 관리자 승인 대기 중입니다.');
        setApprovalStatus('pending');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderSpecField = (item: CheckItem, items: CheckItem[], setItems: any) => {
    if (item.specType === 'input') {
      return (
        <input
          type="text"
          value={item.specValue || ''}
          onChange={(e) => handleSpecChange(items, setItems, item.id, e.target.value)}
          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
          disabled={approvalStatus === 'approved'}
        />
      );
    }
    
    if (item.specType === 'radio' && item.specOptions) {
      return (
        <div className="flex flex-wrap gap-2 justify-center">
          {item.specOptions.map((option) => (
            <label key={option} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={item.id}
                value={option}
                checked={item.specValue === option}
                onChange={() => handleSpecChange(items, setItems, item.id, option)}
                className="cursor-pointer"
                disabled={approvalStatus === 'approved'}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      );
    }
    
    if (item.specType === 'checkbox' && item.specOptions) {
      const selectedValues = item.specValue?.split(',') || [];
      return (
        <div className="flex flex-wrap gap-2 justify-center">
          {item.specOptions.map((option) => (
            <label key={option} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxToggle(items, setItems, item.id, option)}
                className="cursor-pointer"
                disabled={approvalStatus === 'approved'}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      );
    }
    
    return <span className="text-sm">{item.spec || item.specValue || '-'}</span>;
  };

  const renderTable = (title: string, items: CheckItem[], setItems: any) => (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-3">
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold w-16">No.</th>
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold">항목</th>
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold w-64">규격/사양</th>
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold w-24">확인</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: CheckItem, index: number) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="border border-slate-300 px-4 py-2 text-center text-sm">{index + 1}</td>
                <td className="border border-slate-300 px-4 py-2 text-sm">{item.item}</td>
                <td className="border border-slate-300 px-4 py-2 text-sm">
                  {renderSpecField(item, items, setItems)}
                </td>
                <td className="border border-slate-300 px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleCheckToggle(items, setItems, item.id)}
                    className="w-5 h-5 cursor-pointer"
                    disabled={approvalStatus === 'approved'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">금형 체크리스트</h1>
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
                  점검완료 및 승인요청
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white text-center">금형 체크리스트</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-[2fr,1fr] gap-6">
              <div>
                <table className="w-full border-2 border-slate-400">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">차종</td>
                      <td className="border border-slate-400 px-4 py-2 text-center" colSpan={3}>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">PART NUMBER</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">{moldInfo?.partNumber || '86563/4-P1010'}</td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">PART NAME</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">{moldInfo?.partName || 'COVER-FOG LAMP, L/RH'}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">작성일</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">2020.09.18</td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">작성자</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">오일특과장</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">양산처</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={manufacturer}
                          onChange={(e) => setManufacturer(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">제작처</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">양산 사출기</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={injectionMachine}
                          onChange={(e) => setInjectionMachine(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">형체력</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={clampingForce}
                          onChange={(e) => setClampingForce(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">EO CUT</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={eoCutDate}
                          onChange={(e) => setEoCutDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">초도 T/O 일정</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={initialToDate}
                          onChange={(e) => setInitialToDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col items-center justify-start">
                <label className="text-sm font-bold mb-2">부품 그림</label>
                {productImage ? (
                  <img src={productImage} alt="제품" className="max-w-full max-h-64 h-auto rounded-lg border-2 border-slate-300 object-contain" />
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <p className="text-slate-400 text-sm">제품 이미지</p>
                  </div>
                )}
                <label className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 cursor-pointer">
                  <Upload className="h-3 w-3" />
                  이미지 업로드
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 검증 내용 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>▶</span> 검증 내용
          </h2>
          {renderTable('금형', verificationItems, setVerificationItems)}
        </div>

        {/* 성형예상 */}
        {renderTable('성형예상', moldingItems, setMoldingItems)}

        {/* 싱크마크 */}
        {renderTable('싱크마크', sinkMarkItems, setSinkMarkItems)}

        {/* 취출 */}
        {renderTable('취출', ejectionItems, setEjectionItems)}

        {/* MIC 제품 */}
        {renderTable('MIC 제품', micItems, setMicItems)}

        {/* 기타 검토사항 */}
        {renderTable('기타 검토사항', otherItems, setOtherItems)}

        {/* 도금 */}
        {renderTable('도금', platingItems, setPlatingItems)}

        {/* 리어 램프 */}
        {renderTable('리어 램프', rearLampItems, setRearLampItems)}
      </div>
    </div>
  );
};

export default MoldChecklist;
