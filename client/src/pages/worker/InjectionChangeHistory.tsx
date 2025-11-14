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

      // Mock change history data - 테스트 버전 (추세 분석용 데이터 추가)
      const mockHistory: ChangeRecord[] = [
        // 노즐 온도 변화 추이 (200 → 210 → 220 → 225)
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
          id: 'ch_007',
          date: '2024-10-25 09:00',
          version: 'v1.2',
          author: '이기술',
          parameter: '노즐 온도',
          oldValue: '210°C',
          newValue: '220°C',
          reason: '유동성 개선',
          effect: 'increase'
        },
        {
          id: 'ch_008',
          date: '2024-10-01 15:00',
          version: 'v1.1',
          author: '박금형',
          parameter: '노즐 온도',
          oldValue: '200°C',
          newValue: '210°C',
          reason: '초기 설정 조정',
          effect: 'increase'
        },
        {
          id: 'ch_009',
          date: '2024-09-15 10:00',
          version: 'v1.0',
          author: '최설계',
          parameter: '노즐 온도',
          oldValue: '0°C',
          newValue: '200°C',
          reason: '초기 설정',
          effect: 'increase'
        },
        // 사출압력 변화 추이 (70 → 75 → 80 → 85)
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
          id: 'ch_010',
          date: '2024-10-25 09:30',
          version: 'v1.2',
          author: '이기술',
          parameter: '사출압력',
          oldValue: '75 MPa',
          newValue: '80 MPa',
          reason: '충전율 향상',
          effect: 'increase'
        },
        {
          id: 'ch_011',
          date: '2024-10-01 15:30',
          version: 'v1.1',
          author: '박금형',
          parameter: '사출압력',
          oldValue: '70 MPa',
          newValue: '75 MPa',
          reason: '압력 최적화',
          effect: 'increase'
        },
        {
          id: 'ch_012',
          date: '2024-09-15 10:30',
          version: 'v1.0',
          author: '최설계',
          parameter: '사출압력',
          oldValue: '0 MPa',
          newValue: '70 MPa',
          reason: '초기 설정',
          effect: 'increase'
        },
        // 냉각시간 변화 추이 (25 → 22 → 18 → 15)
        {
          id: 'ch_003',
          date: '2024-11-10 14:20',
          version: 'v1.3',
          author: '김작업',
          parameter: '냉각시간',
          oldValue: '18초',
          newValue: '15초',
          reason: '생산성 향상',
          effect: 'decrease'
        },
        {
          id: 'ch_013',
          date: '2024-10-25 10:15',
          version: 'v1.2',
          author: '이기술',
          parameter: '냉각시간',
          oldValue: '22초',
          newValue: '18초',
          reason: '냉각 효율 개선',
          effect: 'decrease'
        },
        {
          id: 'ch_014',
          date: '2024-10-01 16:00',
          version: 'v1.1',
          author: '박금형',
          parameter: '냉각시간',
          oldValue: '25초',
          newValue: '22초',
          reason: '사이클 단축',
          effect: 'decrease'
        },
        {
          id: 'ch_015',
          date: '2024-09-15 11:00',
          version: 'v1.0',
          author: '최설계',
          parameter: '냉각시간',
          oldValue: '0초',
          newValue: '25초',
          reason: '초기 설정',
          effect: 'increase'
        },
        // 사이클타임 변화 추이 (35 → 30 → 27 → 25)
        {
          id: 'ch_004',
          date: '2024-11-10 14:15',
          version: 'v1.3',
          author: '김작업',
          parameter: '사이클타임',
          oldValue: '27초',
          newValue: '25초',
          reason: '냉각시간 단축에 따른 조정',
          effect: 'decrease'
        },
        {
          id: 'ch_016',
          date: '2024-10-25 10:10',
          version: 'v1.2',
          author: '이기술',
          parameter: '사이클타임',
          oldValue: '30초',
          newValue: '27초',
          reason: '전체 공정 최적화',
          effect: 'decrease'
        },
        {
          id: 'ch_017',
          date: '2024-10-01 16:10',
          version: 'v1.1',
          author: '박금형',
          parameter: '사이클타임',
          oldValue: '35초',
          newValue: '30초',
          reason: '생산성 개선',
          effect: 'decrease'
        },
        {
          id: 'ch_018',
          date: '2024-09-15 11:30',
          version: 'v1.0',
          author: '최설계',
          parameter: '사이클타임',
          oldValue: '0초',
          newValue: '35초',
          reason: '초기 설정',
          effect: 'increase'
        },
        // 보압 변화 추이 (45 → 50 → 55 → 60)
        {
          id: 'ch_005',
          date: '2024-11-10 14:10',
          version: 'v1.3',
          author: '김작업',
          parameter: '보압',
          oldValue: '55 MPa',
          newValue: '60 MPa',
          reason: '수축 방지',
          effect: 'increase'
        },
        {
          id: 'ch_019',
          date: '2024-10-25 10:00',
          version: 'v1.2',
          author: '이기술',
          parameter: '보압',
          oldValue: '50 MPa',
          newValue: '55 MPa',
          reason: '치수 정밀도 향상',
          effect: 'increase'
        },
        {
          id: 'ch_020',
          date: '2024-10-01 16:45',
          version: 'v1.1',
          author: '박금형',
          parameter: '보압',
          oldValue: '45 MPa',
          newValue: '50 MPa',
          reason: '보압 최적화',
          effect: 'increase'
        },
        {
          id: 'ch_021',
          date: '2024-09-15 12:00',
          version: 'v1.0',
          author: '최설계',
          parameter: '보압',
          oldValue: '0 MPa',
          newValue: '45 MPa',
          reason: '초기 설정',
          effect: 'increase'
        },
        // 보압시간 변화 추이 (2 → 2.5 → 3 → 3.5)
        {
          id: 'ch_006',
          date: '2024-11-10 14:05',
          version: 'v1.3',
          author: '김작업',
          parameter: '보압시간',
          oldValue: '3초',
          newValue: '3.5초',
          reason: '치수 안정성 확보',
          effect: 'increase'
        },
        {
          id: 'ch_022',
          date: '2024-10-25 09:50',
          version: 'v1.2',
          author: '이기술',
          parameter: '보압시간',
          oldValue: '2.5초',
          newValue: '3초',
          reason: '보압 시간 연장',
          effect: 'increase'
        },
        {
          id: 'ch_023',
          date: '2024-10-01 16:40',
          version: 'v1.1',
          author: '박금형',
          parameter: '보압시간',
          oldValue: '2초',
          newValue: '2.5초',
          reason: '초기 조정',
          effect: 'increase'
        },
        {
          id: 'ch_024',
          date: '2024-09-15 12:30',
          version: 'v1.0',
          author: '최설계',
          parameter: '보압시간',
          oldValue: '0초',
          newValue: '2초',
          reason: '초기 설정',
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

  // 선택된 파라미터의 추세 데이터 생성
  const getTrendData = () => {
    if (filterParameter === 'all') return null;
    
    const data = changeHistory
      .filter(r => r.parameter === filterParameter)
      .reverse()
      .map(r => ({
        date: r.date.split(' ')[0],
        value: parseFloat(r.newValue.replace(/[^0-9.]/g, '')) || 0,
        version: r.version
      }));
    
    return data;
  };

  const trendData = getTrendData();

  // 추세 분석 코멘트 생성
  const getTrendComment = () => {
    if (!trendData || trendData.length < 2) return null;
    
    const firstValue = trendData[0].value;
    const lastValue = trendData[trendData.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = ((change / firstValue) * 100).toFixed(1);
    
    let trend = '';
    let recommendation = '';
    let status: 'good' | 'warning' | 'info' = 'info';
    
    switch (filterParameter) {
      case '노즐 온도':
        if (change > 0) {
          trend = '지속적인 온도 상승 추세';
          recommendation = change > 20 ? '온도 상승폭이 큽니다. 재료 특성 및 제품 품질을 면밀히 모니터링하세요.' : '적정 범위 내 조정으로 판단됩니다.';
          status = change > 20 ? 'warning' : 'good';
        } else {
          trend = '온도 하강 추세';
          recommendation = '유동성 저하 가능성을 확인하세요.';
          status = 'warning';
        }
        break;
        
      case '사출압력':
        if (change > 0) {
          trend = '압력 증가 추세';
          recommendation = change > 15 ? '압력 상승폭이 큽니다. 금형 손상 및 제품 응력을 주의하세요.' : '충전율 개선을 위한 적절한 조정입니다.';
          status = change > 15 ? 'warning' : 'good';
        } else {
          trend = '압력 감소 추세';
          recommendation = '충전 불량 발생 가능성을 확인하세요.';
          status = 'warning';
        }
        break;
        
      case '냉각시간':
        if (change < 0) {
          trend = '냉각시간 단축 추세';
          recommendation = Math.abs(change) > 8 ? '급격한 단축으로 제품 변형 가능성이 있습니다. 품질 검사를 강화하세요.' : '생산성 향상을 위한 효과적인 최적화입니다.';
          status = Math.abs(change) > 8 ? 'warning' : 'good';
        } else {
          trend = '냉각시간 증가 추세';
          recommendation = '생산성 저하를 검토하세요.';
          status = 'info';
        }
        break;
        
      case '사이클타임':
        if (change < 0) {
          trend = '사이클 단축 추세';
          recommendation = Math.abs(change) > 8 ? '급격한 단축입니다. 품질 안정성을 확인하세요.' : '생산 효율 개선이 이루어지고 있습니다.';
          status = Math.abs(change) > 8 ? 'warning' : 'good';
        } else {
          trend = '사이클 증가 추세';
          recommendation = '생산성 저하 원인을 분석하세요.';
          status = 'warning';
        }
        break;
        
      case '보압':
        if (change > 0) {
          trend = '보압 증가 추세';
          recommendation = change > 12 ? '과도한 보압은 제품 응력을 유발할 수 있습니다.' : '치수 안정성 확보를 위한 적절한 조정입니다.';
          status = change > 12 ? 'warning' : 'good';
        } else {
          trend = '보압 감소 추세';
          recommendation = '수축 및 변형 발생 가능성을 확인하세요.';
          status = 'warning';
        }
        break;
        
      case '보압시간':
        if (change > 0) {
          trend = '보압시간 증가 추세';
          recommendation = change > 1.2 ? '과도한 보압시간은 사이클 타임을 증가시킵니다.' : '치수 정밀도 향상을 위한 적절한 조정입니다.';
          status = change > 1.2 ? 'info' : 'good';
        } else {
          trend = '보압시간 감소 추세';
          recommendation = '치수 안정성 저하를 확인하세요.';
          status = 'warning';
        }
        break;
        
      default:
        trend = '데이터 분석 중';
        recommendation = '추가 모니터링이 필요합니다.';
        status = 'info';
    }
    
    return {
      trend,
      recommendation,
      change,
      changePercent,
      status
    };
  };

  const trendComment = getTrendComment();

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
                <h1 className="text-2xl font-bold">변경이력 추이분석</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 변경이력 추이분석 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white">□</span> 변경이력 추이분석
            </h2>
            <span className="text-white text-xs">Creative Auto Module System</span>
          </div>

          <div className="p-6 bg-slate-50">
            {/* 통계 요약 */}
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">총 변경 횟수</p>
                  <p className="text-4xl font-bold text-blue-600">{changeHistory.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">최근 변경일</p>
                  <p className="text-2xl font-bold text-slate-900">{changeHistory[0]?.date.split(' ')[0] || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">변경 파라미터 수</p>
                  <p className="text-4xl font-bold text-slate-700">{uniqueParameters.length}</p>
                </div>
              </div>
            </div>

            {/* 필터 */}
            <div className="bg-white rounded-lg border-2 border-slate-300 p-4 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">파라미터 필터 (추세 분석)</label>
              <select
                value={filterParameter}
                onChange={(e) => setFilterParameter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 보기</option>
                {uniqueParameters.map(param => (
                  <option key={param} value={param}>{param}</option>
                ))}
              </select>
            </div>

            {/* 추세 분석 그래프 */}
            {trendData && trendData.length > 0 && (
              <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
                <h3 className="text-base font-bold mb-4 text-slate-800">{filterParameter} 추세 분석</h3>
                
                {/* 그래프 영역 */}
                <div className="relative h-64 mb-4">
                  {/* Y축 라벨 */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-500">
                    <span>{Math.max(...trendData.map(d => d.value)).toFixed(0)}</span>
                    <span>{(Math.max(...trendData.map(d => d.value)) / 2).toFixed(0)}</span>
                    <span>{Math.min(...trendData.map(d => d.value)).toFixed(0)}</span>
                  </div>

                  {/* 그래프 */}
                  <div className="ml-20 h-full relative bg-slate-50 rounded-lg border border-slate-200 p-4">
                    {/* 그리드 라인 */}
                    <div className="absolute inset-4 flex flex-col justify-between">
                      <div className="border-t border-slate-300"></div>
                      <div className="border-t border-slate-300"></div>
                      <div className="border-t border-slate-300"></div>
                    </div>

                    {/* 데이터 시각화 */}
                    <svg className="w-full h-full relative z-10">
                      {/* 라인 */}
                      {trendData.map((point, index) => {
                        if (index === trendData.length - 1) return null;
                        const nextPoint = trendData[index + 1];
                        const maxVal = Math.max(...trendData.map(d => d.value));
                        const minVal = Math.min(...trendData.map(d => d.value));
                        const range = maxVal - minVal || 1;
                        
                        const x1 = (index / (trendData.length - 1)) * 100;
                        const x2 = ((index + 1) / (trendData.length - 1)) * 100;
                        const y1 = 100 - ((point.value - minVal) / range) * 90;
                        const y2 = 100 - ((nextPoint.value - minVal) / range) * 90;
                        
                        return (
                          <line
                            key={`line-${index}`}
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke="#3b82f6"
                            strokeWidth="3"
                          />
                        );
                      })}

                      {/* 포인트 */}
                      {trendData.map((point, index) => {
                        const maxVal = Math.max(...trendData.map(d => d.value));
                        const minVal = Math.min(...trendData.map(d => d.value));
                        const range = maxVal - minVal || 1;
                        
                        const x = (index / (trendData.length - 1)) * 100;
                        const y = 100 - ((point.value - minVal) / range) * 90;
                        
                        return (
                          <g key={`point-${index}`}>
                            <circle
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="6"
                              fill="#3b82f6"
                              stroke="white"
                              strokeWidth="3"
                            />
                            <text
                              x={`${x}%`}
                              y={`${y - 3}%`}
                              textAnchor="middle"
                              className="text-xs font-bold fill-blue-600"
                            >
                              {point.value.toFixed(0)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* X축 라벨 */}
                  <div className="ml-20 mt-2 flex justify-between text-xs text-slate-600">
                    {trendData.map((point, index) => (
                      <div key={`label-${index}`} className="flex flex-col items-center">
                        <span className="font-semibold text-blue-600">{point.version}</span>
                        <span>{point.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 통계 정보 */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">최초값</p>
                    <p className="text-xl font-bold text-slate-900">{trendData[0].value.toFixed(0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">현재값</p>
                    <p className="text-xl font-bold text-blue-600">{trendData[trendData.length - 1].value.toFixed(0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">변화량</p>
                    <p className={`text-xl font-bold ${trendData[trendData.length - 1].value > trendData[0].value ? 'text-red-600' : 'text-blue-600'}`}>
                      {trendData[trendData.length - 1].value > trendData[0].value ? '+' : ''}
                      {(trendData[trendData.length - 1].value - trendData[0].value).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* 추세 분석 코멘트 */}
                {trendComment && (
                  <div className={`mt-4 p-4 rounded-lg border-2 ${
                    trendComment.status === 'good' ? 'bg-green-50 border-green-200' :
                    trendComment.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${
                        trendComment.status === 'good' ? 'text-green-600' :
                        trendComment.status === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {trendComment.status === 'good' ? '✓' : trendComment.status === 'warning' ? '⚠' : 'ℹ'}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm mb-1 ${
                          trendComment.status === 'good' ? 'text-green-900' :
                          trendComment.status === 'warning' ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>
                          {trendComment.trend} ({trendComment.changePercent}%)
                        </h4>
                        <p className={`text-sm ${
                          trendComment.status === 'good' ? 'text-green-800' :
                          trendComment.status === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {trendComment.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 변경이력 테이블 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 변경이력 목록
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300">
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">일시</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 w-24">버전</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">파라미터</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">변경 전</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 w-16">→</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">변경 후</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">변경 사유</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 w-24">작업자</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{record.date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {record.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{record.parameter}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.oldValue}</td>
                      <td className="px-4 py-3 text-center">
                        {getEffectIcon(record.effect)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{record.newValue}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.reason}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
