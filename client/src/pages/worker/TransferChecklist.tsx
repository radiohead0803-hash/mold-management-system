import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface CheckItem {
  id: string;
  category: string;
  part: string;
  item: string;
  standard: string;
  checked: boolean;
}

const TransferChecklist: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<any>(null);

  // 기본 정보
  const [partNumber, setPartNumber] = useState('86511-O6000');
  const [partName, setPartName] = useState('FRT UPR');
  const [transferDate, setTransferDate] = useState('24.10.31');
  const [manufacturer, setManufacturer] = useState('최 연 상');
  const [requestDate, setRequestDate] = useState('21.09.15');
  const [moldMaker, setMoldMaker] = useState('에이티크로스틱');
  const [moldSize, setMoldSize] = useState('2,500x1,560x1,510');
  const [moldType, setMoldType] = useState('사출 금형');
  const [gateType, setGateType] = useState('밸브 게이트');
  const [cavityCount, setCavityCount] = useState('Ø');
  const [material, setMaterial] = useState('KP-4');
  const [tonage, setTonage] = useState('2,300');
  const [shotCount, setShotCount] = useState('8 / 1,000');
  const [grade, setGrade] = useState('HR530-8002');
  const [moldImage, setMoldImage] = useState('');

  // 관리 현황
  const [managementItems, setManagementItems] = useState([
    { id: 'm1', item: '세척주기', value: '파일 첨부', note: '노즐 SHOT 수', result: '152,238', checked: false },
    { id: 'm2', item: '세척등급', value: 'B', note: '최종 세척 점검 일', result: '24.06', checked: false },
    { id: 'm3', item: '습윤등급', value: 'B', note: '최종 습윤 점검 일', result: '24.06', checked: false },
    { id: 'm4', item: '사출기 사양', value: 'UBE 2,200Ton', note: '관리중량(g)', result: '1,460', checked: false },
    { id: 'm5', item: '특이사항', value: '', note: '', result: '', checked: false }
  ]);

  // 점검 내용
  const [inspectionItems, setInspectionItems] = useState<CheckItem[]>([
    { id: 'i1', category: '습판', part: '코어', item: '제품 BURR', standard: 'BURR 발생부 습윤개소 확인', checked: false },
    { id: 'i2', category: '습판', part: '코어', item: 'EYE BOLT 체결', standard: '피치 마모 및 탈착상태 확인', checked: false },
    { id: 'i3', category: '외관', part: '코어', item: '상·하 고정판 확인', standard: '아름 및 녹 오염상태 확인', checked: false },
    { id: 'i4', category: '외관', part: '코어', item: '경질상태', standard: '냉각호스 걸림 및 오염상태 확', checked: false },
    { id: 'i5', category: '외관', part: '코어', item: '표면 흠집,녹', standard: '표면 흠 녹 녹 발생상태 확인', checked: false },
    { id: 'i6', category: '캐비티', part: '코어', item: '파팅면 오염,타격', standard: '파팅면 오염 및 타격수지 확인', checked: false },
    { id: 'i7', category: '캐비티', part: '코어', item: '파팅면 BURR', standard: '파팅면 끼인 손으로 점수 확인', checked: false },
    { id: 'i8', category: '캐비티', part: '코어', item: '코어핀 트에경스', standard: '코핀 상태확인 및 이물확인', checked: false },
    { id: 'i9', category: '코어', part: '코어', item: '마모', standard: '진동부 마모상태 점검', checked: false },
    { id: 'i10', category: '코어', part: '코어', item: '작동유 관통유', standard: '작동유 관통상태 확인', checked: false },
    { id: 'i11', category: '유압', part: '유압', item: '작동유 누유', standard: '유압 배관 파손 확인', checked: false },
    { id: 'i12', category: '유압', part: '도시', item: '호스 및 배관점', standard: '호스,배선 접속상태 확인', checked: false },
    { id: 'i13', category: '리터', part: '리터', item: '이티단선 누전', standard: '이티단선,누전일(테스터기)', checked: false },
    { id: 'i14', category: '리터', part: '리터', item: '수지 누출', standard: '수지 보관 확인', checked: false }
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
        setPartNumber(data.partNumber || '86511-O6000');
        setPartName(data.partName || 'FRT UPR');
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagementCheck = (id: string) => {
    setManagementItems(items => items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleInspectionCheck = (id: string) => {
    setInspectionItems(items => items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSave = () => {
    alert('체크리스트가 저장되었습니다.');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMoldImage(reader.result as string);
      reader.readAsDataURL(file);
    }
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-purple-900">양산금형이관 체크리스트</h1>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Save className="h-4 w-4" />
              저장
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">기본 정보</h2>
            <span className="text-white text-sm">주식회사 캠스</span>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 좌측 정보 */}
              <div>
                <table className="w-full border-2 border-slate-400">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">차종</td>
                      <td className="border border-slate-400 px-4 py-2 text-center text-blue-600 font-bold" colSpan={3}>AX1</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">PART NUMBER</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600 font-bold" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">PART NAME</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={partName} onChange={(e) => setPartName(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">단산 금형 이관일</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={transferDate} onChange={(e) => setTransferDate(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">작성자</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">금형 이관 연도</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={requestDate} onChange={(e) => setRequestDate(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">금형 제작처</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={moldMaker} onChange={(e) => setMoldMaker(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">금형 사이즈</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={moldSize} onChange={(e) => setMoldSize(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">금형 Type</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={moldType} onChange={(e) => setMoldType(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">게이트 형식</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={gateType} onChange={(e) => setGateType(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">노즐 관경 (Ø)</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={cavityCount} onChange={(e) => setCavityCount(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">재질</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">압체력(Ton)</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={tonage} onChange={(e) => setTonage(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">금형 수축률</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={shotCount} onChange={(e) => setShotCount(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">grade</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-2 py-1 border-0 text-center text-blue-600" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 우측 이미지 */}
              <div className="flex flex-col items-center justify-center border-2 border-slate-300 rounded-lg p-4">
                <label className="text-sm font-bold mb-2">부품 그림</label>
                {moldImage ? (
                  <img src={moldImage} alt="금형" className="max-w-full h-auto rounded-lg" />
                ) : (
                  <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400">금형 이미지</p>
                  </div>
                )}
                <label className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  이미지 업로드
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* 습판 주기 정보 */}
            <div className="mt-4 p-3 bg-slate-100 rounded text-sm">
              <p className="font-bold">습판 주기 : A : 10,000 Shot, B : 20,000 Shot C : 30,000 Shot</p>
              <p className="font-bold">세척 주기 : A : 10,000 Shot, B : 20,000 Shot C : 30,000 Shot</p>
            </div>
          </div>
        </div>

        {/* 관리 현황 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">▶ 관리 현황(인계 업체)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-200">
                <tr>
                  <th className="border border-slate-400 px-4 py-2 font-bold">업체</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold">객소</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold">관리항목</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold">최 연 상</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold w-20">확인</th>
                </tr>
              </thead>
              <tbody>
                {managementItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="border border-slate-400 px-4 py-2 text-center">{item.item}</td>
                    <td className="border border-slate-400 px-4 py-2 text-center text-blue-600">{item.value}</td>
                    <td className="border border-slate-400 px-4 py-2 text-center">{item.note}</td>
                    <td className="border border-slate-400 px-4 py-2 text-center text-blue-600">{item.result}</td>
                    <td className="border border-slate-400 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleManagementCheck(item.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 점검 내용 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">▶ 점검 내용(인수 업체)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-200">
                <tr>
                  <th className="border border-slate-400 px-4 py-2 font-bold" rowSpan={2}>업체</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold" colSpan={3}>인수담당</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold" rowSpan={2}>인<br/>수<br/>자</th>
                </tr>
                <tr>
                  <th className="border border-slate-400 px-4 py-2 font-bold">구분</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold">점검내용</th>
                  <th className="border border-slate-400 px-4 py-2 font-bold">공과</th>
                </tr>
              </thead>
              <tbody>
                {inspectionItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {(index === 0 || inspectionItems[index - 1].category !== item.category) && (
                      <td
                        className="border border-slate-400 px-4 py-2 text-center font-bold bg-slate-100"
                        rowSpan={inspectionItems.filter(i => i.category === item.category).length}
                      >
                        {item.category}
                      </td>
                    )}
                    <td className="border border-slate-400 px-4 py-2 text-center">{item.part}</td>
                    <td className="border border-slate-400 px-4 py-2">{item.item}</td>
                    <td className="border border-slate-400 px-4 py-2">{item.standard}</td>
                    <td className="border border-slate-400 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleInspectionCheck(item.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 서명 및 날짜 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 p-6">
          <p className="text-center font-bold text-lg mb-4">상기 금형 인수 인계업무 중명합니다.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm">*인계 업체명 : (주)캠스</p>
              <p className="text-sm">*인계    일자 : 2024년 10월  05 일</p>
              <p className="text-sm">*인계 담당자 :         최 연 상 PM    (서명)</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm">*인수 업체명 :</p>
              <p className="text-sm">*인수    일자 :          년     월     일</p>
              <p className="text-sm">*인수 담당자 :                    (서명)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferChecklist;
