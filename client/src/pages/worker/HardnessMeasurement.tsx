import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, Save, AlertCircle } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  productNumber?: string;
  productName?: string;
  msSpec?: string;
  coreMaterial?: string;
  cavityMaterial?: string;
  moldType?: string;
  cavityCount?: number;
  tonage?: number;
}

interface HardnessStandard {
  material: string;
  hardnessRange: string;
  note?: string;
}

interface MeasurementData {
  location: string;
  image?: string;
  measurement1?: number;
  measurement2?: number;
  measurement3?: number;
  average?: number;
}

const HardnessMeasurement: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  
  // 금형 재질별 경도 기준
  const hardnessStandards: HardnessStandard[] = [
    { material: 'S45C, HP1A (HP1)', hardnessRange: 'HRC 10 ~ 18', note: '' },
    { material: 'HP4A (HP4), HS-PA', hardnessRange: 'HRC 28 ~ 32', note: '' },
    { material: 'HP4MA (HP4M)', hardnessRange: 'HRC 31 ~ 34', note: '' },
    { material: 'CENA G', hardnessRange: 'HRC 35 ~ 41', note: '핫스탬핑 부품에 적용' },
    { material: 'NAK-80', hardnessRange: 'HRC 37 ~ 41', note: '투명 제품 등 고광택을 중시하는 제품에 적용' },
    { material: 'SKD61', hardnessRange: 'HRC 48 ~ 52', note: '' }
  ];

  // 측정 데이터
  const [cavityData, setCavityData] = useState<MeasurementData>({
    location: '상측 (Cavity)',
    measurement1: undefined,
    measurement2: undefined,
    measurement3: undefined
  });

  const [coreData, setCoreData] = useState<MeasurementData>({
    location: '하측 (Core)',
    measurement1: undefined,
    measurement2: undefined,
    measurement3: undefined
  });

  const [selectedStandard, setSelectedStandard] = useState<HardnessStandard | null>(null);
  const [referenceImage, setReferenceImage] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('데이터 로드 실패');

      const data = await response.json();
      setMoldInfo({
        moldId: data.moldId || moldId || '',
        name: data.name || '금형명 없음',
        productNumber: data.productNumber,
        productName: data.productName,
        msSpec: data.msSpec,
        coreMaterial: data.coreMaterial,
        cavityMaterial: data.cavityMaterial,
        moldType: data.moldType,
        cavityCount: data.cavityCount
      });

      // 금형 재질에 따라 자동으로 경도 기준 설정
      if (data.coreMaterial || data.cavityMaterial) {
        const material = data.coreMaterial || data.cavityMaterial;
        const standard = hardnessStandards.find(s => 
          s.material.includes(material) || material.includes(s.material.split(',')[0].trim())
        );
        if (standard) {
          setSelectedStandard(standard);
        }
      }

      // 기존 경도측정 데이터 로드 (있는 경우)
      const hardnessResponse = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/hardness`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (hardnessResponse.ok) {
        const hardnessData = await hardnessResponse.json();
        if (hardnessData.cavity) setCavityData(hardnessData.cavity);
        if (hardnessData.core) setCoreData(hardnessData.core);
        if (hardnessData.referenceImage) setReferenceImage(hardnessData.referenceImage);
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (m1?: number, m2?: number, m3?: number): number | undefined => {
    const values = [m1, m2, m3].filter(v => v !== undefined) as number[];
    if (values.length === 0) return undefined;
    return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      
      const saveData = {
        moldId,
        cavity: {
          ...cavityData,
          average: calculateAverage(cavityData.measurement1, cavityData.measurement2, cavityData.measurement3)
        },
        core: {
          ...coreData,
          average: calculateAverage(coreData.measurement1, coreData.measurement2, coreData.measurement3)
        },
        referenceImage,
        standard: selectedStandard,
        measuredAt: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/hardness`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) throw new Error('저장 실패');

      alert('경도측정 데이터가 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleImageUpload = (type: 'reference' | 'cavity' | 'core', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'reference') {
          setReferenceImage(result);
        } else if (type === 'cavity') {
          setCavityData({ ...cavityData, image: result });
        } else {
          setCoreData({ ...coreData, image: result });
        }
      };
      reader.readAsDataURL(file);
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
              <button
                onClick={() => navigate(`/worker/mold/${moldId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">경도측정</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              저장
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 기본 정보 섹션 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3">
            <h2 className="text-lg font-bold text-white">📋 기본 정보</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">품번</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.productNumber || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">품명</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.productName || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">MS SPEC</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.msSpec || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">금형 타입</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.moldType || '사출금형'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">금형 번호</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.moldId || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">금형명</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.name || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">캐비티 수</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.cavityCount ? `${moldInfo.cavityCount}개` : '2개'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">적용 톤수</label>
                <p className="text-base font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded border border-slate-200">
                  {moldInfo?.tonage ? `${moldInfo.tonage}톤` : '350톤'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 금형 재질 정보 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">🔧 금형 재질</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="text-sm font-medium text-blue-900 mb-2 block">상측 (Cavity)</label>
              <select
                value={moldInfo?.cavityMaterial || ''}
                onChange={(e) => {
                  if (moldInfo) {
                    setMoldInfo({ ...moldInfo, cavityMaterial: e.target.value });
                    // 선택한 재질에 맞는 경도 기준 자동 설정
                    const standard = hardnessStandards.find(s => 
                      s.material.includes(e.target.value) || e.target.value.includes(s.material.split(',')[0].trim())
                    );
                    if (standard) setSelectedStandard(standard);
                  }
                }}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white text-blue-700 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {hardnessStandards.map((std, idx) => (
                  <option key={idx} value={std.material.split(',')[0].trim()}>
                    {std.material}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label className="text-sm font-medium text-orange-900 mb-2 block">하측 (Core)</label>
              <select
                value={moldInfo?.coreMaterial || ''}
                onChange={(e) => {
                  if (moldInfo) {
                    setMoldInfo({ ...moldInfo, coreMaterial: e.target.value });
                    // 선택한 재질에 맞는 경도 기준 자동 설정
                    const standard = hardnessStandards.find(s => 
                      s.material.includes(e.target.value) || e.target.value.includes(s.material.split(',')[0].trim())
                    );
                    if (standard) setSelectedStandard(standard);
                  }
                }}
                className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-white text-orange-700 font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {hardnessStandards.map((std, idx) => (
                  <option key={idx} value={std.material.split(',')[0].trim()}>
                    {std.material}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedStandard && (
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900">적용 경도 기준</p>
                  <p className="text-sm text-green-800 mt-1">
                    <span className="font-semibold">{selectedStandard.material}</span> - {selectedStandard.hardnessRange}
                  </p>
                  {selectedStandard.note && (
                    <p className="text-xs text-green-700 mt-1">{selectedStandard.note}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 금형 재질별 경도 기준표 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">📊 금형 재질별 경도 기준</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">No.</th>
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">강종</th>
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">경도 (HRC, 로크웰)</th>
                  <th className="border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">특성</th>
                </tr>
              </thead>
              <tbody>
                {hardnessStandards.map((standard, index) => (
                  <tr 
                    key={index}
                    className={`hover:bg-slate-50 ${selectedStandard?.material === standard.material ? 'bg-green-100' : ''}`}
                  >
                    <td className="border border-slate-300 px-4 py-2 text-center text-sm">{String(index + 1).padStart(2, '0')}</td>
                    <td className="border border-slate-300 px-4 py-2 text-sm font-medium">{standard.material}</td>
                    <td className="border border-slate-300 px-4 py-2 text-center text-sm font-bold text-blue-700">{standard.hardnessRange}</td>
                    <td className="border border-slate-300 px-4 py-2 text-sm text-slate-600">{standard.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 명판 사진 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">📷 명판 사진</h2>
          <div className="flex flex-col items-center gap-4">
            {referenceImage ? (
              <img src={referenceImage} alt="명판" className="max-w-md rounded-lg border-2 border-slate-300 shadow-md" />
            ) : (
              <div className="w-full max-w-md h-64 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                <p className="text-slate-400">명판 사진을 업로드하세요</p>
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              명판 사진 업로드
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('reference', e)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 측정 데이터 - 상측 (Cavity) */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">🔵 상측 (Cavity) 측정</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 금형 사진 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">금형 사진</label>
              {cavityData.image ? (
                <img src={cavityData.image} alt="Cavity" className="w-full rounded-lg border-2 border-blue-300 shadow-md" />
              ) : (
                <div className="w-full h-64 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                  <p className="text-blue-400">금형 사진을 업로드하세요</p>
                </div>
              )}
              <label className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors w-full justify-center">
                <Camera className="h-4 w-4" />
                사진 업로드
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('cavity', e)}
                  className="hidden"
                />
              </label>
            </div>

            {/* 측정값 입력 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">측정 #1</label>
                <input
                  type="number"
                  step="0.1"
                  value={cavityData.measurement1 || ''}
                  onChange={(e) => setCavityData({ ...cavityData, measurement1: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HRC 값 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">측정 #2</label>
                <input
                  type="number"
                  step="0.1"
                  value={cavityData.measurement2 || ''}
                  onChange={(e) => setCavityData({ ...cavityData, measurement2: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HRC 값 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">측정 #3</label>
                <input
                  type="number"
                  step="0.1"
                  value={cavityData.measurement3 || ''}
                  onChange={(e) => setCavityData({ ...cavityData, measurement3: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HRC 값 입력"
                />
              </div>
              <div className="pt-4 border-t-2 border-blue-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">평균값</label>
                <div className="text-2xl font-bold text-blue-700">
                  {calculateAverage(cavityData.measurement1, cavityData.measurement2, cavityData.measurement3)?.toFixed(1) || '-'} HRC
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 측정 데이터 - 하측 (Core) */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-orange-900 mb-4">🟠 하측 (Core) 측정</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 금형 사진 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">금형 사진</label>
              {coreData.image ? (
                <img src={coreData.image} alt="Core" className="w-full rounded-lg border-2 border-orange-300 shadow-md" />
              ) : (
                <div className="w-full h-64 bg-orange-50 rounded-lg border-2 border-dashed border-orange-300 flex items-center justify-center">
                  <p className="text-orange-400">금형 사진을 업로드하세요</p>
                </div>
              )}
              <label className="mt-2 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors w-full justify-center">
                <Camera className="h-4 w-4" />
                사진 업로드
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('core', e)}
                  className="hidden"
                />
              </label>
            </div>

            {/* 측정값 입력 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">측정 #1</label>
                <input
                  type="number"
                  step="0.1"
                  value={coreData.measurement1 || ''}
                  onChange={(e) => setCoreData({ ...coreData, measurement1: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="HRC 값 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">측정 #2</label>
                <input
                  type="number"
                  step="0.1"
                  value={coreData.measurement2 || ''}
                  onChange={(e) => setCoreData({ ...coreData, measurement2: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="HRC 값 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">측정 #3</label>
                <input
                  type="number"
                  step="0.1"
                  value={coreData.measurement3 || ''}
                  onChange={(e) => setCoreData({ ...coreData, measurement3: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="HRC 값 입력"
                />
              </div>
              <div className="pt-4 border-t-2 border-orange-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">평균값</label>
                <div className="text-2xl font-bold text-orange-700">
                  {calculateAverage(coreData.measurement1, coreData.measurement2, coreData.measurement3)?.toFixed(1) || '-'} HRC
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 측정 결과 요약 */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">📊 측정 결과 요약</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h3 className="font-bold text-blue-300 mb-2">상측 (Cavity)</h3>
              <p className="text-3xl font-bold">{calculateAverage(cavityData.measurement1, cavityData.measurement2, cavityData.measurement3)?.toFixed(1) || '-'} HRC</p>
              <p className="text-sm text-slate-300 mt-2">
                측정값: {cavityData.measurement1 || '-'}, {cavityData.measurement2 || '-'}, {cavityData.measurement3 || '-'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <h3 className="font-bold text-orange-300 mb-2">하측 (Core)</h3>
              <p className="text-3xl font-bold">{calculateAverage(coreData.measurement1, coreData.measurement2, coreData.measurement3)?.toFixed(1) || '-'} HRC</p>
              <p className="text-sm text-slate-300 mt-2">
                측정값: {coreData.measurement1 || '-'}, {coreData.measurement2 || '-'}, {coreData.measurement3 || '-'}
              </p>
            </div>
          </div>
          {selectedStandard && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur">
              <p className="text-sm">
                <span className="font-bold">기준 경도:</span> {selectedStandard.hardnessRange}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HardnessMeasurement;
