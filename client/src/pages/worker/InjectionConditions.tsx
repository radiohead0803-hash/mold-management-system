import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, GitBranch, TrendingUp } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  status: string;
  material?: string;
  materialGrade?: string;
}

interface InjectionData {
  version: string;
  lastUpdated: string;
  updatedBy: string;
  temperature: {
    nozzle: number;
    cylinder1: number;
    cylinder2: number;
    cylinder3: number;
    mold: number;
  };
  pressure: {
    injection: number;
    holding: number;
    back: number;
  };
  speed: {
    injection: number;
    screw: number;
  };
  time: {
    holding: number;
    cooling: number;
    cycle: number;
  };
  other: {
    cushion: number;
  };
}

interface MaterialRecommendation {
  material: string;
  nozzleTempRange: string;
  cylinderTempRange: string;
  moldTempRange: string;
  injectionPressureRange: string;
  injectionSpeedRange: string;
  notes: string[];
}

const InjectionConditions: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [injectionData, setInjectionData] = useState<InjectionData | null>(null);
  const [materialRecommendation, setMaterialRecommendation] = useState<MaterialRecommendation | null>(null);

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const getMaterialRecommendation = (material: string): MaterialRecommendation => {
    const recommendations: Record<string, MaterialRecommendation> = {
      'PP': {
        material: 'PP (폴리프로필렌)',
        nozzleTempRange: '220-280°C',
        cylinderTempRange: '200-250°C',
        moldTempRange: '30-60°C',
        injectionPressureRange: '60-120 MPa',
        injectionSpeedRange: '중속-고속',
        notes: [
          '결정성 수지로 냉각 시 수축률이 큼',
          '유동성이 우수하여 박육 성형 가능',
          '금형 온도가 낮으면 광택 저하',
          '게이트 부위 백화 현상 주의'
        ]
      },
      'PE': {
        material: 'PE (폴리에틸렌)',
        nozzleTempRange: '180-240°C',
        cylinderTempRange: '160-220°C',
        moldTempRange: '20-50°C',
        injectionPressureRange: '50-100 MPa',
        injectionSpeedRange: '중속',
        notes: [
          '유동성이 매우 우수함',
          '성형 수축률이 큼 (1.5-3%)',
          '저온 성형 가능',
          '웰드라인 발생 주의'
        ]
      },
      'ABS': {
        material: 'ABS',
        nozzleTempRange: '220-260°C',
        cylinderTempRange: '200-240°C',
        moldTempRange: '50-80°C',
        injectionPressureRange: '70-140 MPa',
        injectionSpeedRange: '중속-고속',
        notes: [
          '치수 안정성 우수',
          '표면 광택이 좋음',
          '온도 과다 시 열분해 발생',
          '수분 흡수성이 있어 건조 필수'
        ]
      },
      'PC': {
        material: 'PC (폴리카보네이트)',
        nozzleTempRange: '280-320°C',
        cylinderTempRange: '260-300°C',
        moldTempRange: '80-120°C',
        injectionPressureRange: '80-150 MPa',
        injectionSpeedRange: '중속',
        notes: [
          '투명성 우수',
          '고온 성형 필요',
          '수분에 민감하여 충분한 건조 필수',
          '내충격성 우수'
        ]
      },
      'PA': {
        material: 'PA (나일론)',
        nozzleTempRange: '260-300°C',
        cylinderTempRange: '240-280°C',
        moldTempRange: '60-100°C',
        injectionPressureRange: '80-150 MPa',
        injectionSpeedRange: '고속',
        notes: [
          '흡수성이 강하여 건조 필수',
          '내마모성 우수',
          '결정화 속도가 빠름',
          '금형 온도 높을수록 결정화도 증가'
        ]
      },
      'POM': {
        material: 'POM (폴리아세탈)',
        nozzleTempRange: '190-220°C',
        cylinderTempRange: '170-200°C',
        moldTempRange: '60-100°C',
        injectionPressureRange: '70-130 MPa',
        injectionSpeedRange: '중속-고속',
        notes: [
          '치수 안정성 매우 우수',
          '유동성 우수',
          '과열 시 분해 가스 발생',
          '기계적 강도 우수'
        ]
      }
    };

    return recommendations[material] || {
      material: '일반 수지',
      nozzleTempRange: '200-250°C',
      cylinderTempRange: '180-230°C',
      moldTempRange: '40-80°C',
      injectionPressureRange: '70-130 MPa',
      injectionSpeedRange: '중속',
      notes: ['재질별 표준 조건을 참고하세요']
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
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
        status: data.status,
        material: data.material || 'PP',
        materialGrade: data.materialGrade
      });

      // Set material recommendation based on material type
      if (data.material) {
        const recommendation = getMaterialRecommendation(data.material);
        setMaterialRecommendation(recommendation);
      }

      // Mock injection conditions data
      const mockData: InjectionData = {
        version: 'v1.3',
        lastUpdated: '2024-11-10 14:30',
        updatedBy: '김작업',
        temperature: {
          nozzle: 225,
          cylinder1: 210,
          cylinder2: 200,
          cylinder3: 190,
          mold: 40
        },
        pressure: {
          injection: 85,
          holding: 60,
          back: 5
        },
        speed: {
          injection: 50,
          screw: 100
        },
        time: {
          holding: 3,
          cooling: 15,
          cycle: 25
        },
        other: {
          cushion: 5
        }
      };
      setInjectionData(mockData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/worker/mold/${moldId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">사출조건 관리</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 제작사양 및 추진일정 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white">□</span> 사출조건 관리
            </h2>
            <span className="text-white text-xs">Creative Auto Module System</span>
          </div>

          {/* 버전 정보 */}
          <div className="p-6 bg-slate-50">
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <GitBranch className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">현재 적용 버전</p>
                    <h2 className="text-3xl font-bold text-slate-900">{injectionData?.version}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">마지막 업데이트</p>
                  <p className="text-lg font-semibold text-slate-900">{injectionData?.lastUpdated}</p>
                  <p className="text-sm text-slate-600">작업자: {injectionData?.updatedBy}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 원재료 정보 및 표준 사출조건 */}
          {materialRecommendation && (
            <div className="p-6 pt-0 bg-slate-50">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span>▶</span> 원재료 정보 및 표준 사출조건
              </h3>
              <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">원재료</p>
                    <p className="text-xl font-bold text-slate-900">{materialRecommendation.material}</p>
                    {moldInfo?.materialGrade && (
                      <p className="text-sm text-slate-600 mt-1">등급: {moldInfo.materialGrade}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">노즐 온도 권장범위</p>
                    <p className="text-xl font-bold text-slate-900">{materialRecommendation.nozzleTempRange}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">실린더 온도 권장범위</p>
                    <p className="text-xl font-bold text-slate-900">{materialRecommendation.cylinderTempRange}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">금형 온도 권장범위</p>
                    <p className="text-xl font-bold text-slate-900">{materialRecommendation.moldTempRange}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">사출압력 권장범위</p>
                    <p className="text-xl font-bold text-slate-900">{materialRecommendation.injectionPressureRange}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">사출속도</p>
                    <p className="text-xl font-bold text-slate-900">{materialRecommendation.injectionSpeedRange}</p>
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold mb-2 text-blue-900">💡 재질별 주의사항</p>
                  <ul className="space-y-1">
                    {materialRecommendation.notes.map((note, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 온도 설정 */}
          <div className="p-6 pt-0 bg-slate-50">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 온도 설정
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200">
                <p className="text-xs text-red-600 font-medium mb-1">노즐 온도</p>
                <p className="text-2xl font-bold text-red-700">{injectionData?.temperature.nozzle}</p>
                <p className="text-xs text-red-500">°C</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-200">
                <p className="text-xs text-orange-600 font-medium mb-1">실린더 1구</p>
                <p className="text-2xl font-bold text-orange-700">{injectionData?.temperature.cylinder1}</p>
                <p className="text-xs text-orange-500">°C</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border-2 border-amber-200">
                <p className="text-xs text-amber-600 font-medium mb-1">실린더 2구</p>
                <p className="text-2xl font-bold text-amber-700">{injectionData?.temperature.cylinder2}</p>
                <p className="text-xs text-amber-500">°C</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-lime-50 rounded-lg p-4 border-2 border-yellow-200">
                <p className="text-xs text-yellow-600 font-medium mb-1">실린더 3구</p>
                <p className="text-2xl font-bold text-yellow-700">{injectionData?.temperature.cylinder3}</p>
                <p className="text-xs text-yellow-500">°C</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-1">금형 온도</p>
                <p className="text-2xl font-bold text-blue-700">{injectionData?.temperature.mold}</p>
                <p className="text-xs text-blue-500">°C</p>
              </div>
              </div>
            </div>
          </div>

          {/* 압력 및 속도 설정 */}
          <div className="p-6 pt-0 bg-slate-50">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 압력 및 속도 설정
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">사출압력</p>
                    <p className="text-xs text-blue-500 mt-1">Injection Pressure</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-700">{injectionData?.pressure.injection}</p>
                    <p className="text-sm text-blue-500">MPa</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div>
                    <p className="text-sm text-cyan-600 font-medium">보압</p>
                    <p className="text-xs text-cyan-500 mt-1">Holding Pressure</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-cyan-700">{injectionData?.pressure.holding}</p>
                    <p className="text-sm text-cyan-500">MPa</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">배압</p>
                    <p className="text-xs text-indigo-500 mt-1">Back Pressure</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-indigo-700">{injectionData?.pressure.back}</p>
                    <p className="text-sm text-indigo-500">MPa</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">사출속도</p>
                    <p className="text-xs text-purple-500 mt-1">Injection Speed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-700">{injectionData?.speed.injection}</p>
                    <p className="text-sm text-purple-500">mm/s</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <div>
                    <p className="text-sm text-pink-600 font-medium">스크류 회전속도</p>
                    <p className="text-xs text-pink-500 mt-1">Screw Speed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-pink-700">{injectionData?.speed.screw}</p>
                    <p className="text-sm text-pink-500">rpm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 시간 설정 */}
          <div className="p-6 pt-0 bg-slate-50">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 시간 설정
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <p className="text-xs text-green-600 font-medium mb-1">보압시간</p>
                <p className="text-2xl font-bold text-green-700">{injectionData?.time.holding}</p>
                <p className="text-xs text-green-500">초</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border-2 border-emerald-200">
                <p className="text-xs text-emerald-600 font-medium mb-1">냉각시간</p>
                <p className="text-2xl font-bold text-emerald-700">{injectionData?.time.cooling}</p>
                <p className="text-xs text-emerald-500">초</p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border-2 border-teal-200">
                <p className="text-xs text-teal-600 font-medium mb-1">사이클타임</p>
                <p className="text-2xl font-bold text-teal-700">{injectionData?.time.cycle}</p>
                <p className="text-xs text-teal-500">초</p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border-2 border-slate-200">
                <p className="text-xs text-slate-600 font-medium mb-1">쿠션</p>
                <p className="text-2xl font-bold text-slate-700">{injectionData?.other.cushion}</p>
                <p className="text-xs text-slate-500">mm</p>
              </div>
              </div>
            </div>
          </div>

          {/* 안내 및 주의사항 */}
          <div className="p-6 pt-0 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">📋 사출조건 안내</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• 현재 표시된 값은 최신 승인된 버전입니다.</li>
                  <li>• 수지 특성 및 환경에 따라 미세 조정이 필요할 수 있습니다.</li>
                  <li>• 조건 변경 시 품질 확인 후 적용하세요.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</h3>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>• 수지 로트 변경 시 조건 재확인 필요</li>
                  <li>• 이상 발생 시 즉시 생산 중단 및 보고</li>
                  <li>• 조건 변경은 승인된 담당자만 가능</li>
                </ul>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InjectionConditions;
