import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, History, TrendingUp, TrendingDown } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
}

interface ChangeRecord {
  id: string;
  date: string;
  version: string;
  author: string;
  parameter: string;
  oldValue: string;
  newValue: string;
  reason: string;
  effect: 'increase' | 'decrease' | 'neutral';
}

const InjectionChangeHistory: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [changeHistory, setChangeHistory] = useState<ChangeRecord[]>([]);
  const [filterParameter, setFilterParameter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [moldId]);

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
        name: data.name
      });

      // Mock change history data
      const mockHistory: ChangeRecord[] = [
        {
          id: 'ch_001',
          date: '2024-11-10 14:30',
          version: 'v1.3',
          author: '김작업',
          parameter: '노즐 온도',
          oldValue: '220°C',
          newValue: '225°C',
          reason: '제품 표면 광택 개선',
          effect: 'increase'
        },
        {
          id: 'ch_002',
          date: '2024-11-10 14:25',
          version: 'v1.3',
          author: '김작업',
          parameter: '사출압력',
          oldValue: '80 MPa',
          newValue: '85 MPa',
          reason: '충전 불량 개선',
          effect: 'increase'
        },
        {
          id: 'ch_003',
          date: '2024-10-25 10:15',
          version: 'v1.2',
          author: '이기술',
          parameter: '냉각시간',
          oldValue: '20초',
          newValue: '15초',
          reason: '생산성 향상',
          effect: 'decrease'
        },
        {
          id: 'ch_004',
          date: '2024-10-25 10:10',
          version: 'v1.2',
          author: '이기술',
          parameter: '사이클타임',
          oldValue: '30초',
          newValue: '25초',
          reason: '냉각시간 단축에 따른 조정',
          effect: 'decrease'
        },
        {
          id: 'ch_005',
          date: '2024-10-01 16:45',
          version: 'v1.1',
          author: '박금형',
          parameter: '보압',
          oldValue: '50 MPa',
          newValue: '60 MPa',
          reason: '수축 방지',
          effect: 'increase'
        },
        {
          id: 'ch_006',
          date: '2024-10-01 16:40',
          version: 'v1.1',
          author: '박금형',
          parameter: '보압시간',
          oldValue: '2초',
          newValue: '3초',
          reason: '치수 안정성 확보',
          effect: 'increase'
        }
      ];
      setChangeHistory(mockHistory);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredHistory = filterParameter === 'all'
    ? changeHistory
    : changeHistory.filter(record => record.parameter === filterParameter);

  const uniqueParameters = Array.from(new Set(changeHistory.map(r => r.parameter)));

  // 파라미터별 데이터 추출 함수
  const getParameterData = (parameter: string) => {
    return changeHistory
      .filter(r => r.parameter === parameter)
      .reverse()
      .map(r => ({
        date: r.date.split(' ')[0],
        value: parseFloat(r.newValue.replace(/[^0-9.]/g, '')) || 0,
        version: r.version
      }));
  };

  // 그래프 렌더링 함수
  const renderParameterGraph = (parameter: string) => {
    const data = getParameterData(parameter);
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div key={parameter} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{parameter}</h3>
        <div className="relative h-48">
          {/* Y축 라벨 */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500">
            <span>{maxValue.toFixed(0)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
            <span>{minValue.toFixed(0)}</span>
          </div>

          {/* 그래프 영역 */}
          <div className="ml-14 h-full relative">
            {/* 그리드 라인 */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
              <div className="border-t border-slate-200"></div>
            </div>

            {/* 데이터 포인트와 라인 */}
            <svg className="w-full h-full">
              {/* 라인 */}
              {data.map((point, index) => {
                if (index === data.length - 1) return null;
                const nextPoint = data[index + 1];
                const x1 = (index / (data.length - 1)) * 100;
                const x2 = ((index + 1) / (data.length - 1)) * 100;
                const y1 = 100 - ((point.value - minValue) / range) * 100;
                const y2 = 100 - ((nextPoint.value - minValue) / range) * 100;
                
                return (
                  <line
                    key={`line-${index}`}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#6366f1"
                    strokeWidth="2"
                  />
                );
              })}

              {/* 포인트 */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((point.value - minValue) / range) * 100;
                
                return (
                  <g key={`point-${index}`}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="5"
                      fill="#6366f1"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={`${x}%`}
                      y={`${y - 10}%`}
                      textAnchor="middle"
                      className="text-xs font-bold fill-indigo-600"
                    >
                      {point.value.toFixed(0)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* X축 라벨 */}
          <div className="ml-14 mt-2 flex justify-between text-xs text-slate-500">
            {data.map((point, index) => (
              <div key={`label-${index}`} className="flex flex-col items-center">
                <span>{point.date}</span>
                <span className="text-indigo-600 font-semibold">{point.version}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 변화량 표시 */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-sm text-slate-600">최초값: </span>
            <span className="font-bold text-slate-900">{data[0].value.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-sm text-slate-600">현재값: </span>
            <span className="font-bold text-slate-900">{data[data.length - 1].value.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-sm text-slate-600">변화량: </span>
            <span className={`font-bold ${data[data.length - 1].value > data[0].value ? 'text-red-600' : 'text-blue-600'}`}>
              {data[data.length - 1].value > data[0].value ? '+' : ''}
              {(data[data.length - 1].value - data[0].value).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/worker/mold/${moldId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <History className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 변경이력 현황표</h1>
                  <p className="text-sm text-slate-600">{moldInfo?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-1">총 변경 횟수</p>
            <p className="text-3xl font-bold text-indigo-600">{changeHistory.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-1">최근 변경일</p>
            <p className="text-xl font-bold text-slate-900">{changeHistory[0]?.date.split(' ')[0] || 'N/A'}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-1">변경 파라미터 수</p>
            <p className="text-3xl font-bold text-purple-600">{uniqueParameters.length}</p>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">파라미터 필터</label>
          <select
            value={filterParameter}
            onChange={(e) => setFilterParameter(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 보기</option>
            {uniqueParameters.map(param => (
              <option key={param} value={param}>{param}</option>
            ))}
          </select>
        </div>

        {/* 파라미터별 그래프 시각화 */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            파라미터 변화 추이
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {uniqueParameters.map(param => renderParameterGraph(param))}
          </div>
        </div>

        {/* 변경이력 테이블 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">일시</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">버전</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">파라미터</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">변경 전</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">→</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">변경 후</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">변경 사유</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">작업자</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                        {record.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.parameter}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.oldValue}</td>
                    <td className="px-6 py-4 text-center">
                      {getEffectIcon(record.effect)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{record.newValue}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.reason}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.author}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">변경 이력이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InjectionChangeHistory;
