import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, Wrench, TrendingUp } from 'lucide-react';

interface RepairRequest {
  id: string;
  requestDate: string;
  issueType: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestedBy: string;
  assignedTo?: string;
  completedDate?: string;
  cost?: number;
}

const RepairInspection: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedIssueType, setSelectedIssueType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6months');
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [repairRequests] = useState<RepairRequest[]>([
    // 2024년 11월
    {
      id: 'R-001',
      requestDate: '2024-11-12',
      issueType: '금형 파손',
      description: '코어 부분 크랙 발생, 긴급 수리 필요',
      priority: 'high',
      status: 'in_progress',
      requestedBy: '김철수',
      assignedTo: '이수리',
      cost: 1500000
    },
    {
      id: 'R-002',
      requestDate: '2024-11-10',
      issueType: '표면 마모',
      description: '캠비티 표면 마모로 인한 제품 불량',
      priority: 'medium',
      status: 'pending',
      requestedBy: '박민수',
      cost: 800000
    },
    {
      id: 'R-003',
      requestDate: '2024-11-08',
      issueType: '냉각수 누수',
      description: '냉각 라인 누수 발견',
      priority: 'high',
      status: 'completed',
      requestedBy: '정수진',
      assignedTo: '최기술',
      completedDate: '2024-11-09',
      cost: 500000
    },
    {
      id: 'R-004',
      requestDate: '2024-11-05',
      issueType: '게이트 불량',
      description: '게이트 부분 변형',
      priority: 'medium',
      status: 'completed',
      requestedBy: '이영희',
      assignedTo: '이수리',
      completedDate: '2024-11-07',
      cost: 600000
    },
    {
      id: 'R-005',
      requestDate: '2024-11-01',
      issueType: '이젝터 핀 파손',
      description: '이젝터 핀 3개 교체 필요',
      priority: 'low',
      status: 'completed',
      requestedBy: '김철수',
      assignedTo: '최기술',
      completedDate: '2024-11-03',
      cost: 300000
    },
    // 2024년 10월
    {
      id: 'R-006',
      requestDate: '2024-10-28',
      issueType: '금형 파손',
      description: '캐비티 모서리 균열',
      priority: 'high',
      status: 'completed',
      requestedBy: '김철수',
      assignedTo: '이수리',
      completedDate: '2024-10-30',
      cost: 1200000
    },
    {
      id: 'R-007',
      requestDate: '2024-10-20',
      issueType: '표면 마모',
      description: '슬라이드 표면 거칠음',
      priority: 'medium',
      status: 'completed',
      requestedBy: '박민수',
      assignedTo: '최기술',
      completedDate: '2024-10-22',
      cost: 700000
    },
    {
      id: 'R-008',
      requestDate: '2024-10-15',
      issueType: '이젝터 핀 파손',
      description: '이젝터 핀 5개 교체',
      priority: 'medium',
      status: 'completed',
      requestedBy: '정수진',
      assignedTo: '이수리',
      completedDate: '2024-10-17',
      cost: 450000
    },
    // 2024년 9월
    {
      id: 'R-009',
      requestDate: '2024-09-25',
      issueType: '냉각수 누수',
      description: '냉각 호스 교체',
      priority: 'high',
      status: 'completed',
      requestedBy: '이영희',
      assignedTo: '최기술',
      completedDate: '2024-09-26',
      cost: 600000
    },
    {
      id: 'R-010',
      requestDate: '2024-09-18',
      issueType: '게이트 불량',
      description: '게이트 막힘 현상',
      priority: 'medium',
      status: 'completed',
      requestedBy: '김철수',
      assignedTo: '이수리',
      completedDate: '2024-09-20',
      cost: 550000
    },
    // 2024년 8월
    {
      id: 'R-011',
      requestDate: '2024-08-22',
      issueType: '표면 마모',
      description: '코어 표면 스크래치',
      priority: 'low',
      status: 'completed',
      requestedBy: '박민수',
      assignedTo: '최기술',
      completedDate: '2024-08-24',
      cost: 400000
    },
    {
      id: 'R-012',
      requestDate: '2024-08-10',
      issueType: '이젝터 핀 파손',
      description: '이젝터 핀 2개 교체',
      priority: 'low',
      status: 'completed',
      requestedBy: '정수진',
      assignedTo: '이수리',
      completedDate: '2024-08-12',
      cost: 250000
    },
    // 2024년 7월
    {
      id: 'R-013',
      requestDate: '2024-07-28',
      issueType: '금형 파손',
      description: '캐비티 복합 균열',
      priority: 'high',
      status: 'completed',
      requestedBy: '이영희',
      assignedTo: '이수리',
      completedDate: '2024-07-31',
      cost: 1800000
    },
    {
      id: 'R-014',
      requestDate: '2024-07-15',
      issueType: '냉각수 누수',
      description: '냉각 라인 연결부 누수',
      priority: 'medium',
      status: 'completed',
      requestedBy: '김철수',
      assignedTo: '최기술',
      completedDate: '2024-07-17',
      cost: 500000
    },
    // 2024년 6월
    {
      id: 'R-015',
      requestDate: '2024-06-20',
      issueType: '게이트 불량',
      description: '게이트 크기 불균일',
      priority: 'medium',
      status: 'completed',
      requestedBy: '박민수',
      assignedTo: '이수리',
      completedDate: '2024-06-22',
      cost: 650000
    },
    {
      id: 'R-016',
      requestDate: '2024-06-05',
      issueType: '표면 마모',
      description: '슬라이드 마모',
      priority: 'low',
      status: 'completed',
      requestedBy: '정수진',
      assignedTo: '최기술',
      completedDate: '2024-06-07',
      cost: 350000
    }
  ]);

  useEffect(() => {
    setLoading(false);
  }, [moldId]);

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: '완료' },
      in_progress: { icon: Clock, color: 'bg-blue-100 text-blue-800', text: '진행중' },
      pending: { icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800', text: '대기' },
      cancelled: { icon: AlertCircle, color: 'bg-slate-100 text-slate-600', text: '취소' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { color: 'bg-red-100 text-red-800', text: '긴급' },
      medium: { color: 'bg-orange-100 text-orange-800', text: '보통' },
      low: { color: 'bg-green-100 text-green-800', text: '낮음' }
    };
    const badge = badges[priority as keyof typeof badges] || badges.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // 기간 필터링된 데이터
  const getFilteredRequests = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case 'all':
        return repairRequests;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }
    
    return repairRequests.filter(r => new Date(r.requestDate) >= startDate);
  };

  const filteredByPeriod = getFilteredRequests();

  const filteredRequests = selectedIssueType === 'all'
    ? filteredByPeriod
    : filteredByPeriod.filter(r => r.issueType === selectedIssueType);

  const uniqueIssueTypes = Array.from(new Set(filteredByPeriod.map(r => r.issueType)));

  // 월별 수리 횟수 데이터 생성
  const getMonthlyData = () => {
    const monthlyStats: { [key: string]: { count: number; cost: number } } = {};
    
    filteredByPeriod.forEach(r => {
      const month = r.requestDate.substring(0, 7); // YYYY-MM
      if (!monthlyStats[month]) {
        monthlyStats[month] = { count: 0, cost: 0 };
      }
      monthlyStats[month].count++;
      monthlyStats[month].cost += r.cost || 0;
    });
    
    return Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        count: stats.count,
        cost: stats.cost
      }));
  };

  const monthlyData = getMonthlyData();

  // 월별 추세 분석 코멘트
  const getMonthlyComment = () => {
    if (monthlyData.length < 2) return null;
    
    const latestMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    const avgCount = monthlyData.reduce((sum, m) => sum + m.count, 0) / monthlyData.length;
    const totalCost = monthlyData.reduce((sum, m) => sum + m.cost, 0);
    
    let trend = '';
    let recommendation = '';
    let status: 'good' | 'warning' | 'info' = 'info';
    
    const countChange = latestMonth.count - previousMonth.count;
    
    if (latestMonth.count > avgCount * 1.5) {
      trend = '수리 요청 급증';
      recommendation = `최근 월 수리 요청이 평균 대비 ${((latestMonth.count / avgCount - 1) * 100).toFixed(0)}% 증가했습니다. 금형 상태 점검 및 예방 정비가 시급합니다.`;
      status = 'warning';
    } else if (countChange > 0) {
      trend = '수리 요청 증가 추세';
      recommendation = `전월 대비 ${countChange}건 증가했습니다. 금형 사용 패턴 및 유지보수 주기를 검토하세요.`;
      status = 'info';
    } else if (countChange < 0) {
      trend = '수리 요청 감소 추세';
      recommendation = `전월 대비 ${Math.abs(countChange)}건 감소했습니다. 예방 정비 효과가 나타나고 있습니다.`;
      status = 'good';
    } else {
      trend = '안정적 추세';
      recommendation = '수리 요청이 안정적으로 유지되고 있습니다. 현재 관리 수준을 유지하세요.';
      status = 'good';
    }
    
    return {
      trend,
      recommendation,
      avgCount: avgCount.toFixed(1),
      totalCost,
      latestCount: latestMonth.count,
      status
    };
  };

  const monthlyComment = getMonthlyComment();

  // 문제유형별 추세 데이터 생성
  const getTrendData = () => {
    if (selectedIssueType === 'all') return null;
    
    const data = filteredByPeriod
      .filter(r => r.issueType === selectedIssueType)
      .reverse()
      .map((r, index) => ({
        date: r.requestDate,
        value: r.cost || 0,
        id: r.id,
        index: index + 1
      }));
    
    return data;
  };

  const trendData = getTrendData();

  // 추세 분석 코멘트 생성
  const getTrendComment = () => {
    if (!trendData || trendData.length < 2) return null;
    
    const totalCost = trendData.reduce((sum, d) => sum + d.value, 0);
    const avgCost = totalCost / trendData.length;
    const frequency = trendData.length;
    
    let trend = '';
    let recommendation = '';
    let status: 'good' | 'warning' | 'info' = 'info';
    
    if (frequency >= 3) {
      trend = '빈번한 발생 추세';
      recommendation = `${selectedIssueType} 문제가 ${frequency}회 발생했습니다. 근본 원인 분석 및 예방 조치가 필요합니다.`;
      status = 'warning';
    } else if (frequency === 2) {
      trend = '재발 발생';
      recommendation = '동일 문제가 재발했습니다. 이전 수리 내역을 검토하고 개선이 필요합니다.';
      status = 'info';
    } else {
      trend = '단일 발생';
      recommendation = '첫 발생 사례입니다. 수리 후 지속적인 모니터링이 필요합니다.';
      status = 'good';
    }
    
    return {
      trend,
      recommendation,
      frequency,
      avgCost,
      totalCost,
      status
    };
  };

  const trendComment = getTrendComment();

  const totalCost = filteredByPeriod.reduce((sum, r) => sum + (r.cost || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">금형수리 현황 및 추이분석</h1>
              <p className="text-sm text-slate-600">금형 ID: {moldId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 수리점검 현황 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white">□</span> 금형수리 현황 및 추이분석
            </h2>
            <span className="text-white text-xs">Creative Auto Module System</span>
          </div>
          <div className="p-6 bg-slate-50 space-y-6">
            {/* 기간 선택 */}
            <div className="bg-white rounded-lg border-2 border-slate-300 p-4 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">분석 기간 선택</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium"
              >
                <option value="3months">최근 3개월</option>
                <option value="6months">최근 6개월</option>
                <option value="1year">최근 1년</option>
                <option value="all">전체 기간</option>
              </select>
            </div>

            {/* 전체 통계 */}
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-slate-600">전체 수리 요청</p>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{repairRequests.length}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-slate-600">완료</p>
                  </div>
                  <p className="text-4xl font-bold text-green-600">
                    {repairRequests.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-slate-600">진행중</p>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">
                    {repairRequests.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <p className="text-sm text-slate-600">총 수리 비용</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">
                    {(totalCost / 10000).toFixed(0)}만원
                  </p>
                </div>
              </div>
            </div>

            {/* 월별 수리 횟수 그래프 (기본) */}
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <h3 className="text-base font-bold mb-4 text-slate-800">월별 수리 횟수 추이</h3>
              
              {/* 그래프 영역 */}
              <div className="relative h-64 mb-4">
                {/* Y축 라벨 (횟수) */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-500">
                  <span>{Math.max(...monthlyData.map(d => d.count))}건</span>
                  <span>{Math.ceil(Math.max(...monthlyData.map(d => d.count)) / 2)}건</span>
                  <span>0건</span>
                </div>

                {/* 그래프 */}
                <div className="ml-20 h-full relative bg-slate-50 rounded-lg border border-slate-200 p-4">
                  {/* 그리드 라인 */}
                  <div className="absolute inset-4 flex flex-col justify-between">
                    <div className="border-t border-slate-300"></div>
                    <div className="border-t border-slate-300"></div>
                    <div className="border-t border-slate-300"></div>
                  </div>

                  {/* 데이터 시각화 (막대 그래프) */}
                  <div className="relative z-10 h-full flex items-end justify-around gap-2">
                    {monthlyData.map((point, index) => {
                      const maxVal = Math.max(...monthlyData.map(d => d.count));
                      const height = maxVal > 0 ? (point.count / maxVal) * 90 : 0;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="text-xs font-bold text-purple-600 mb-1">
                            {point.count}건
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500"
                            style={{ height: `${height}%` }}
                            title={`${point.month}: ${point.count}건, ${(point.cost / 10000).toFixed(0)}만원`}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X축 라벨 */}
                <div className="ml-20 mt-2 flex justify-around text-xs text-slate-600">
                  {monthlyData.map((point, index) => (
                    <div key={`label-${index}`} className="flex flex-col items-center flex-1">
                      <span className="font-semibold text-purple-600">{point.month}</span>
                      <span className="text-xs text-slate-500">{(point.cost / 10000).toFixed(0)}만원</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 월별 통계 정보 */}
              {monthlyComment && (
                <>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">월 평균 수리</p>
                      <p className="text-xl font-bold text-slate-900">{monthlyComment.avgCount}건</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">최근 월 수리</p>
                      <p className="text-xl font-bold text-purple-600">{monthlyComment.latestCount}건</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">누적 비용</p>
                      <p className="text-xl font-bold text-orange-600">{(monthlyComment.totalCost / 10000).toFixed(0)}만원</p>
                    </div>
                  </div>

                  {/* 월별 추세 분석 코멘트 */}
                  <div className={`mt-4 p-4 rounded-lg border-2 ${
                    monthlyComment.status === 'good' ? 'bg-green-50 border-green-200' :
                    monthlyComment.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 text-xl ${
                        monthlyComment.status === 'good' ? 'text-green-600' :
                        monthlyComment.status === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {monthlyComment.status === 'good' ? '✓' : monthlyComment.status === 'warning' ? '⚠' : 'ℹ'}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm mb-1 ${
                          monthlyComment.status === 'good' ? 'text-green-900' :
                          monthlyComment.status === 'warning' ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>
                          {monthlyComment.trend}
                        </h4>
                        <p className={`text-sm ${
                          monthlyComment.status === 'good' ? 'text-green-800' :
                          monthlyComment.status === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {monthlyComment.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 필터 */}
            <div className="bg-white rounded-lg border-2 border-slate-300 p-4 mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">문제유형별 상세 분석</label>
              <select
                value={selectedIssueType}
                onChange={(e) => setSelectedIssueType(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 보기</option>
                {uniqueIssueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 추세 분석 그래프 */}
            {trendData && trendData.length > 0 && (
              <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
                <h3 className="text-base font-bold mb-4 text-slate-800">{selectedIssueType} 발생 추이</h3>
                
                {/* 그래프 영역 */}
                <div className="relative h-64 mb-4">
                  {/* Y축 라벨 (비용) */}
                  <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-slate-500">
                    <span>{Math.max(...trendData.map(d => d.value)).toLocaleString()}원</span>
                    <span>{(Math.max(...trendData.map(d => d.value)) / 2).toLocaleString()}원</span>
                    <span>0원</span>
                  </div>

                  {/* 그래프 */}
                  <div className="ml-24 h-full relative bg-slate-50 rounded-lg border border-slate-200 p-4">
                    {/* 그리드 라인 */}
                    <div className="absolute inset-4 flex flex-col justify-between">
                      <div className="border-t border-slate-300"></div>
                      <div className="border-t border-slate-300"></div>
                      <div className="border-t border-slate-300"></div>
                    </div>

                    {/* 데이터 시각화 (막대 그래프) */}
                    <div className="relative z-10 h-full flex items-end justify-around gap-2">
                      {trendData.map((point, index) => {
                        const maxVal = Math.max(...trendData.map(d => d.value));
                        const height = maxVal > 0 ? (point.value / maxVal) * 90 : 0;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="text-xs font-bold text-blue-600 mb-1">
                              {(point.value / 10000).toFixed(0)}만
                            </div>
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                              style={{ height: `${height}%` }}
                              title={`${point.id}: ${point.value.toLocaleString()}원`}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X축 라벨 */}
                  <div className="ml-24 mt-2 flex justify-around text-xs text-slate-600">
                    {trendData.map((point, index) => (
                      <div key={`label-${index}`} className="flex flex-col items-center flex-1">
                        <span className="font-semibold text-blue-600">{point.id}</span>
                        <span>{point.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 통계 정보 */}
                {trendComment && (
                  <>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">발생 횟수</p>
                        <p className="text-xl font-bold text-slate-900">{trendComment.frequency}회</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">평균 비용</p>
                        <p className="text-xl font-bold text-blue-600">{(trendComment.avgCost / 10000).toFixed(0)}만원</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-1">총 비용</p>
                        <p className="text-xl font-bold text-orange-600">{(trendComment.totalCost / 10000).toFixed(0)}만원</p>
                      </div>
                    </div>

                    {/* 추세 분석 코멘트 */}
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
                            {trendComment.trend}
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
                  </>
                )}
              </div>
            )}

            {/* 수리 요청 목록 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 수리 요청 목록
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">요청 ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">요청일</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">문제 유형</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">설명</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">우선순위</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">상태</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">담당자</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">비용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      수리 요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{request.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{request.requestDate}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{request.issueType}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{request.description}</td>
                      <td className="px-6 py-4">{getPriorityBadge(request.priority)}</td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{request.assignedTo || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {request.cost ? `${(request.cost / 10000).toFixed(0)}만원` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

          </div>
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">수리 요청 상세 정보</h2>
                <p className="text-sm text-white/80">{selectedRequest.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* 상태 및 우선순위 */}
              <div className="flex gap-3 mb-6">
                {getStatusBadge(selectedRequest.status)}
                {getPriorityBadge(selectedRequest.priority)}
              </div>

              {/* 기본 정보 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">요청일</label>
                    <p className="text-base font-medium text-slate-900">{selectedRequest.requestDate}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">요청자</label>
                    <p className="text-base font-medium text-slate-900">{selectedRequest.requestedBy}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">문제 유형</label>
                  <p className="text-base font-medium text-slate-900">{selectedRequest.issueType}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">상세 설명</label>
                  <p className="text-sm text-slate-700">{selectedRequest.description}</p>
                </div>

                {selectedRequest.assignedTo && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="text-xs font-semibold text-blue-700 uppercase block mb-1">담당자</label>
                    <p className="text-base font-medium text-blue-900">{selectedRequest.assignedTo}</p>
                  </div>
                )}

                {selectedRequest.completedDate && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="text-xs font-semibold text-green-700 uppercase block mb-1">완료일</label>
                    <p className="text-base font-medium text-green-900">{selectedRequest.completedDate}</p>
                  </div>
                )}

                {selectedRequest.cost && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <label className="text-xs font-semibold text-orange-700 uppercase block mb-1">수리 비용</label>
                    <p className="text-2xl font-bold text-orange-900">
                      {selectedRequest.cost.toLocaleString()}원
                      <span className="text-base ml-2">({(selectedRequest.cost / 10000).toFixed(0)}만원)</span>
                    </p>
                  </div>
                )}

                {/* 진행률 */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">진행률</label>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedRequest.status === 'completed' ? '100%' : 
                       selectedRequest.status === 'in_progress' ? '60%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        selectedRequest.status === 'completed' ? 'bg-green-500' :
                        selectedRequest.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-400'
                      }`}
                      style={{
                        width: selectedRequest.status === 'completed' ? '100%' :
                               selectedRequest.status === 'in_progress' ? '60%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>

                {/* 비고 */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">비고</label>
                  <p className="text-sm text-slate-700">
                    {selectedRequest.status === 'in_progress' 
                      ? '부품 발주 완료, 작업 진행 중'
                      : selectedRequest.status === 'completed'
                      ? '작업 완료 및 테스트 검증 완료'
                      : '작업 대기 중'}
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairInspection;
