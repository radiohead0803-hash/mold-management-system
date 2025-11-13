import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoughnutChart from '../../components/charts/DoughnutChart';
import BarChart from '../../components/charts/BarChart';
import { 
  ArrowLeft, 
  Search,
  Filter,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  Clock,
  Activity,
  FileText
} from 'lucide-react';

interface DailyInspection {
  id: number;
  inspectionNumber: string;
  moldId: string;
  moldName: string;
  inspector: string;
  partnerName?: string;
  checkDate: string;
  location: string;
  checkItems: {
    [key: string]: {
      category: string;
      item: string;
      status: 'good' | 'warning' | 'bad';
      notes?: string;
      imageUrl?: string;
    };
  };
  overallStatus: 'normal' | 'attention' | 'abnormal';
  notes: string;
  status: 'completed';
  adminFeedback?: string;
  adminReviewer?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  moldId: string;
  inspector: string;
  status: string;
  overallStatus: string;
}

const DailyInspectionHistory: React.FC = () => {
  const navigate = useNavigate();
  
  const [inspections, setInspections] = useState<DailyInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<DailyInspection | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    moldId: '',
    inspector: '',
    status: '',
    overallStatus: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchInspections();
  }, [filters, pagination.page, searchTerm]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);

      // 테스트 데이터
      const testInspections: DailyInspection[] = [
        {
          id: 1,
          inspectionNumber: 'DI-2024-001',
          moldId: 'M-2024-001',
          moldName: '스마트폰 케이스 금형',
          inspector: '이점검',
          partnerName: '정밀금형 주식회사',
          checkDate: new Date().toISOString().split('T')[0],
          location: 'A구역-01',
          checkItems: {
            'visual_1': { category: '외관 점검', item: '금형 표면 상태', status: 'good', notes: '표면 상태 양호' },
            'visual_2': { category: '외관 점검', item: '균열 및 손상', status: 'good', notes: '균열 및 손상 없음' },
            'visual_3': { category: '외관 점검', item: '부식 및 오염', status: 'warning', notes: '약간의 오염 발견, 청소 완료' },
            'function_1': { category: '기능 점검', item: '개폐 동작', status: 'good', notes: '개폐 동작 정상' },
            'function_2': { category: '기능 점검', item: '이젝터 동작', status: 'good', notes: '이젝터 동작 원활' },
            'function_3': { category: '기능 점검', item: '냉각수 순환', status: 'good', notes: '냉각수 순환 정상' },
            'measure_1': { category: '측정 점검', item: '금형 온도', status: 'good', notes: '온도 45°C, 정상 범위' },
            'measure_2': { category: '측정 점검', item: '냉각수 압력', status: 'warning', notes: '압력 2.2 bar, 약간 낮음' },
            'measure_3': { category: '측정 점검', item: '캐비티 치수', status: 'good', notes: '치수 125.5mm, 정상' },
            'cleaning_1': { category: '청소 및 정리', item: '캐비티 청소', status: 'good', notes: '캐비티 청소 완료' },
            'cleaning_2': { category: '청소 및 정리', item: '이젝터 청소', status: 'good', notes: '이젝터 청소 완료' },
            'cleaning_3': { category: '청소 및 정리', item: '주변 정리정돈', status: 'good', notes: '주변 정리정돈 완료' }
          },
          overallStatus: 'attention',
          notes: '전반적으로 양호한 상태이나 냉각수 압력이 약간 낮아 지속적인 모니터링이 필요합니다.',
          status: 'completed',
          adminFeedback: '냉각수 압력 모니터링 잘 부탁드립니다. 다음 점검 시 압력 상태를 재확인해주세요.',
          adminReviewer: '김관리',
          reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          inspectionNumber: 'DI-2024-002',
          moldId: 'M-2024-002',
          moldName: '자동차 부품 금형',
          inspector: '박작업',
          partnerName: '대한금형 주식회사',
          checkDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          location: 'B구역-03',
          checkItems: {
            'visual_1': { category: '외관 점검', item: '금형 표면 상태', status: 'good', notes: '표면 깨끗함' },
            'visual_2': { category: '외관 점검', item: '균열 및 손상', status: 'good', notes: '이상 없음' },
            'visual_3': { category: '외관 점검', item: '부식 및 오염', status: 'good', notes: '부식 없음' },
            'function_1': { category: '기능 점검', item: '개폐 동작', status: 'good', notes: '정상 작동' },
            'function_2': { category: '기능 점검', item: '이젝터 동작', status: 'good', notes: '원활함' },
            'function_3': { category: '기능 점검', item: '냉각수 순환', status: 'good', notes: '순환 정상' },
            'measure_1': { category: '측정 점검', item: '금형 온도', status: 'good', notes: '온도 50°C' },
            'measure_2': { category: '측정 점검', item: '냉각수 압력', status: 'good', notes: '압력 4.5 bar' },
            'measure_3': { category: '측정 점검', item: '캐비티 치수', status: 'good', notes: '치수 정상' },
            'cleaning_1': { category: '청소 및 정리', item: '캐비티 청소', status: 'good', notes: '청소 완료' },
            'cleaning_2': { category: '청소 및 정리', item: '이젝터 청소', status: 'good', notes: '청소 완료' },
            'cleaning_3': { category: '청소 및 정리', item: '주변 정리정돈', status: 'good', notes: '정리 완료' }
          },
          overallStatus: 'normal',
          notes: '모든 항목 정상. 특이사항 없음.',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          inspectionNumber: 'DI-2024-003',
          moldId: 'M-2024-003',
          moldName: '전자제품 하우징 금형',
          inspector: '최점검',
          partnerName: '정밀금형 주식회사',
          checkDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          location: 'C구역-05',
          checkItems: {
            'visual_1': { category: '외관 점검', item: '금형 표면 상태', status: 'warning', notes: '표면에 미세한 스크래치 발견' },
            'visual_2': { category: '외관 점검', item: '균열 및 손상', status: 'bad', notes: '코너 부분에 미세 균열 발견' },
            'visual_3': { category: '외관 점검', item: '부식 및 오염', status: 'warning', notes: '일부 부식 흔적 있음' },
            'function_1': { category: '기능 점검', item: '개폐 동작', status: 'warning', notes: '개폐 시 약간의 저항 있음' },
            'function_2': { category: '기능 점검', item: '이젝터 동작', status: 'bad', notes: '이젝터 핀 2개 작동 불량' },
            'function_3': { category: '기능 점검', item: '냉각수 순환', status: 'warning', notes: '냉각수 유량 감소' },
            'measure_1': { category: '측정 점검', item: '금형 온도', status: 'warning', notes: '온도 85°C, 높음' },
            'measure_2': { category: '측정 점검', item: '냉각수 압력', status: 'bad', notes: '압력 1.5 bar, 매우 낮음' },
            'measure_3': { category: '측정 점검', item: '캐비티 치수', status: 'warning', notes: '치수 오차 발생' },
            'cleaning_1': { category: '청소 및 정리', item: '캐비티 청소', status: 'good', notes: '청소 완료' },
            'cleaning_2': { category: '청소 및 정리', item: '이젝터 청소', status: 'warning', notes: '청소 필요' },
            'cleaning_3': { category: '청소 및 정리', item: '주변 정리정돈', status: 'good', notes: '정리 완료' }
          },
          overallStatus: 'abnormal',
          notes: '긴급 수리 필요. 이젝터 핀 교체 및 냉각 시스템 점검 필요. 균열 부분 정밀 검사 요청.',
          status: 'completed',
          adminFeedback: '즉시 작업 중단하고 수리 진행해주세요. 이젝터 핀 교체 및 냉각 시스템 전면 점검이 필요합니다. 균열 부분은 전문가 검사를 받으시기 바랍니다.',
          adminReviewer: '김관리',
          reviewedAt: new Date(Date.now() - 172800000 + 3600000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setInspections(testInspections);
      setPagination(prev => ({
        ...prev,
        total: testInspections.length,
        totalPages: 1
      }));

      // 실제 API 호출 (주석 처리)
      /*
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { moldId: searchTerm }),
        ...(filters.overallStatus && { status: filters.overallStatus })
      });

      const response = await fetch(`http://localhost:5001/api/admin/daily-inspections?${params}`);
      
      if (!response.ok) {
        throw new Error('일상점검 이력을 불러올 수 없습니다.');
      }

      const data = await response.json();
      setInspections(data.inspections);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
      }));
      */
    } catch (error) {
      console.error('Fetch inspections error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abnormal': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '정상';
      case 'attention': return '주의';
      case 'abnormal': return '비정상';
      default: return '미확인';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'attention': return <AlertTriangle className="h-4 w-4" />;
      case 'abnormal': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetail = (inspection: DailyInspection) => {
    setSelectedInspection(inspection);
    setFeedback(inspection.adminFeedback || '');
    setShowDetail(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedInspection) return;
    
    try {
      setSubmittingFeedback(true);
      
      const response = await fetch(`http://localhost:5001/api/admin/daily-inspections/${selectedInspection.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          feedback: feedback,
          reviewer: '관리자' // 실제로는 로그인한 관리자 정보 사용
        })
      });

      if (!response.ok) {
        throw new Error('피드백 등록에 실패했습니다.');
      }

      alert('피드백이 성공적으로 등록되었습니다.');
      setShowDetail(false);
      fetchInspections();
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert(error instanceof Error ? error.message : '피드백 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = !searchTerm || 
      inspection.moldId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.moldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDateFrom = !filters.dateFrom || inspection.checkDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || inspection.checkDate <= filters.dateTo;
    const matchesInspector = !filters.inspector || inspection.inspector.includes(filters.inspector);
    const matchesStatus = !filters.overallStatus || inspection.overallStatus === filters.overallStatus;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesInspector && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">일상점검 이력을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">일상점검 이력</h1>
                <p className="text-sm text-neutral-600">협력사 일상점검 기록 조회 및 피드백</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary ${showFilters ? 'bg-primary-50 text-primary-700' : ''}`}
              >
                <Filter className="mr-2 h-4 w-4" />
                필터
              </button>
              <button
                onClick={fetchInspections}
                className="btn-secondary"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">시작일</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">종료일</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">점검자</label>
              <input
                type="text"
                value={filters.inspector}
                onChange={(e) => setFilters(prev => ({ ...prev, inspector: e.target.value }))}
                placeholder="점검자명"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">전체 상태</label>
              <select
                value={filters.overallStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, overallStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">전체</option>
                <option value="normal">정상</option>
                <option value="attention">주의</option>
                <option value="abnormal">비정상</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  dateTo: new Date().toISOString().split('T')[0],
                  moldId: '',
                  inspector: '',
                  status: '',
                  overallStatus: ''
                })}
                className="w-full btn-secondary"
              >
                초기화
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="금형 ID, 금형명, 점검자로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Distribution Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">점검 상태별 분포</h3>
            <div className="h-64">
              <DoughnutChart
                data={{
                  labels: ['정상', '주의', '비정상'],
                  datasets: [{
                    data: [
                      filteredInspections.filter(i => i.overallStatus === 'normal').length,
                      filteredInspections.filter(i => i.overallStatus === 'attention').length,
                      filteredInspections.filter(i => i.overallStatus === 'abnormal').length
                    ],
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',
                      'rgba(234, 179, 8, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                      'rgb(34, 197, 94)',
                      'rgb(234, 179, 8)',
                      'rgb(239, 68, 68)'
                    ],
                    borderWidth: 2
                  }]
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Partner Inspection Status Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">협력사별 점검 현황</h3>
            <div className="h-64">
              <BarChart
                data={{
                  labels: Array.from(new Set(filteredInspections.map(i => i.partnerName || '내부'))),
                  datasets: [
                    {
                      label: '정상',
                      data: Array.from(new Set(filteredInspections.map(i => i.partnerName || '내부'))).map(partner =>
                        filteredInspections.filter(i => (i.partnerName || '내부') === partner && i.overallStatus === 'normal').length
                      ),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgb(34, 197, 94)',
                      borderWidth: 1
                    },
                    {
                      label: '주의',
                      data: Array.from(new Set(filteredInspections.map(i => i.partnerName || '내부'))).map(partner =>
                        filteredInspections.filter(i => (i.partnerName || '내부') === partner && i.overallStatus === 'attention').length
                      ),
                      backgroundColor: 'rgba(234, 179, 8, 0.8)',
                      borderColor: 'rgb(234, 179, 8)',
                      borderWidth: 1
                    },
                    {
                      label: '비정상',
                      data: Array.from(new Set(filteredInspections.map(i => i.partnerName || '내부'))).map(partner =>
                        filteredInspections.filter(i => (i.partnerName || '내부') === partner && i.overallStatus === 'abnormal').length
                      ),
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                      borderColor: 'rgb(239, 68, 68)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">총 점검 건수</p>
                <p className="text-xl font-bold text-neutral-900">{filteredInspections.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">정상</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredInspections.filter(i => i.overallStatus === 'normal').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">주의</p>
                <p className="text-xl font-bold text-yellow-600">
                  {filteredInspections.filter(i => i.overallStatus === 'attention').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">비정상</p>
                <p className="text-xl font-bold text-red-600">
                  {filteredInspections.filter(i => i.overallStatus === 'abnormal').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Table */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">점검번호</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">협력사</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">금형ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">금형명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">점검자</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">점검일</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">위치</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInspections.map((inspection) => (
                  <tr 
                    key={inspection.id}
                    onClick={() => handleViewDetail(inspection)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inspection.inspectionNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inspection.partnerName || '내부'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {inspection.moldId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {inspection.moldName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inspection.inspector}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(inspection.checkDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {inspection.location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(inspection.overallStatus)}`}>
                        {getStatusIcon(inspection.overallStatus)}
                        <span>{getStatusText(inspection.overallStatus)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(inspection);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="상세보기"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="다운로드"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredInspections.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">일상점검 이력이 없습니다</h3>
            <p className="text-neutral-600">검색 조건을 변경하거나 새로운 점검을 기다려주세요.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">일상점검 상세 정보</h2>
                  <p className="text-sm text-neutral-600">#{selectedInspection.inspectionNumber}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">기본 정보</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">금형 ID:</span>
                      <span className="font-medium">{selectedInspection.moldId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">금형명:</span>
                      <span className="font-medium">{selectedInspection.moldName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">점검자:</span>
                      <span className="font-medium">{selectedInspection.inspector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">위치:</span>
                      <span className="font-medium">{selectedInspection.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">점검일:</span>
                      <span className="font-medium">{formatDate(selectedInspection.checkDate)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">점검 결과</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">전체 상태:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedInspection.overallStatus)}`}>
                        {getStatusIcon(selectedInspection.overallStatus)}
                        <span className="ml-1">{getStatusText(selectedInspection.overallStatus)}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">점검 항목 수:</span>
                      <span className="font-medium">{Object.keys(selectedInspection.checkItems).length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">정상 항목:</span>
                      <span className="font-medium text-green-600">
                        {Object.values(selectedInspection.checkItems).filter(item => item.status === 'good').length}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">주의 항목:</span>
                      <span className="font-medium text-yellow-600">
                        {Object.values(selectedInspection.checkItems).filter(item => item.status === 'warning').length}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">불량 항목:</span>
                      <span className="font-medium text-red-600">
                        {Object.values(selectedInspection.checkItems).filter(item => item.status === 'bad').length}개
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check Items Detail */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">점검 항목 상세</h3>
                <div className="space-y-3">
                  {Object.entries(selectedInspection.checkItems).map(([key, item]) => (
                    <div key={key} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-neutral-700">{item.category}</span>
                          <h4 className="font-semibold text-neutral-900">{item.item}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'good' ? 'bg-green-100 text-green-700' :
                          item.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status === 'good' ? '양호' : item.status === 'warning' ? '주의' : '불량'}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded mt-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedInspection.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">특이사항</h3>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-neutral-700">{selectedInspection.notes}</p>
                  </div>
                </div>
              )}

              {/* Admin Feedback Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">관리자 피드백</h3>
                
                {selectedInspection.adminFeedback && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">기존 피드백</span>
                      {selectedInspection.reviewedAt && (
                        <span className="text-xs text-blue-600">
                          {formatDate(selectedInspection.reviewedAt)} - {selectedInspection.adminReviewer}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-800">{selectedInspection.adminFeedback}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700">
                    피드백 작성 {selectedInspection.adminFeedback && '(수정)'}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="협력사에 전달할 피드백을 작성하세요..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback || !feedback.trim()}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingFeedback ? '등록 중...' : selectedInspection.adminFeedback ? '피드백 수정' : '피드백 등록'}
                    </button>
                    <button
                      onClick={() => setShowDetail(false)}
                      className="btn-secondary"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyInspectionHistory;
