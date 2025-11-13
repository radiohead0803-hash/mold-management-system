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
  FileText,
  Wrench,
  Droplet,
  X
} from 'lucide-react';

interface AssemblyCleaningRecord {
  id: number;
  recordNumber: string;
  moldId: string;
  moldName: string;
  partnerName: string;
  inspector: string;
  workDate: string;
  workType: 'assembly' | 'cleaning' | 'both';
  location: string;
  status: 'completed' | 'inProgress' | 'pending';
  assemblyItems?: {
    disassembly: boolean;
    cleaning: boolean;
    inspection: boolean;
    reassembly: boolean;
    testing: boolean;
  };
  cleaningItems?: {
    cavity: boolean;
    ejector: boolean;
    coolingChannel: boolean;
    surface: boolean;
    lubrication: boolean;
  };
  overallStatus: 'normal' | 'attention' | 'abnormal';
  notes: string;
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
  partnerName: string;
  workType: string;
  status: string;
}

const AssemblyCleaningHistory: React.FC = () => {
  const navigate = useNavigate();
  
  const [records, setRecords] = useState<AssemblyCleaningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AssemblyCleaningRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    moldId: '',
    partnerName: '',
    workType: '',
    status: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [filters, searchTerm]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test data
      const testRecords: AssemblyCleaningRecord[] = [
        {
          id: 1,
          recordNumber: 'AC-2024-001',
          moldId: 'M-2024-001',
          moldName: '스마트폰 케이스 금형',
          partnerName: '정밀금형 주식회사',
          inspector: '이기술',
          workDate: new Date().toISOString().split('T')[0],
          workType: 'both',
          location: 'A구역-01',
          status: 'completed',
          assemblyItems: {
            disassembly: true,
            cleaning: true,
            inspection: true,
            reassembly: true,
            testing: true
          },
          cleaningItems: {
            cavity: true,
            ejector: true,
            coolingChannel: true,
            surface: true,
            lubrication: true
          },
          overallStatus: 'normal',
          notes: '모든 작업 정상 완료. 특이사항 없음.',
          adminFeedback: '작업 완료 확인했습니다. 수고하셨습니다.',
          adminReviewer: '김관리',
          reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          recordNumber: 'AC-2024-002',
          moldId: 'M-2024-002',
          moldName: '자동차 부품 금형',
          partnerName: '대한금형 주식회사',
          inspector: '박세척',
          workDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          workType: 'cleaning',
          location: 'B구역-03',
          status: 'completed',
          cleaningItems: {
            cavity: true,
            ejector: true,
            coolingChannel: true,
            surface: true,
            lubrication: true
          },
          overallStatus: 'normal',
          notes: '정기 세척 완료',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          recordNumber: 'AC-2024-003',
          moldId: 'M-2024-003',
          moldName: '전자제품 하우징 금형',
          partnerName: '정밀금형 주식회사',
          inspector: '최습합',
          workDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          workType: 'assembly',
          location: 'C구역-05',
          status: 'inProgress',
          assemblyItems: {
            disassembly: true,
            cleaning: true,
            inspection: true,
            reassembly: false,
            testing: false
          },
          overallStatus: 'attention',
          notes: '재조립 진행 중. 일부 부품 교체 필요.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setRecords(testRecords);
    } catch (error) {
      console.error('Fetch records error:', error);
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

  const getWorkTypeText = (type: string) => {
    switch (type) {
      case 'assembly': return '습합';
      case 'cleaning': return '세척';
      case 'both': return '습합+세척';
      default: return type;
    }
  };

  const getWorkTypeColor = (type: string) => {
    switch (type) {
      case 'assembly': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cleaning': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'both': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
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

  const handleViewDetail = (record: AssemblyCleaningRecord) => {
    setSelectedRecord(record);
    setFeedback(record.adminFeedback || '');
    setShowDetail(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedRecord) return;
    
    try {
      setSubmittingFeedback(true);
      
      // API call would go here
      alert('피드백이 성공적으로 등록되었습니다.');
      setShowDetail(false);
      fetchRecords();
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert(error instanceof Error ? error.message : '피드백 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.moldId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.moldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDateFrom = !filters.dateFrom || record.workDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || record.workDate <= filters.dateTo;
    const matchesPartner = !filters.partnerName || record.partnerName.includes(filters.partnerName);
    const matchesWorkType = !filters.workType || record.workType === filters.workType;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesPartner && matchesWorkType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">습합/세척 이력을 불러오는 중...</p>
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
                <h1 className="text-2xl font-bold text-neutral-900">협력사 습합세척 이력</h1>
                <p className="text-sm text-neutral-600">협력사 금형 습합 및 세척 기록 조회</p>
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
                onClick={fetchRecords}
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">협력사</label>
              <input
                type="text"
                value={filters.partnerName}
                onChange={(e) => setFilters(prev => ({ ...prev, partnerName: e.target.value }))}
                placeholder="협력사명"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">작업 유형</label>
              <select
                value={filters.workType}
                onChange={(e) => setFilters(prev => ({ ...prev, workType: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">전체</option>
                <option value="assembly">습합</option>
                <option value="cleaning">세척</option>
                <option value="both">습합+세척</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  dateTo: new Date().toISOString().split('T')[0],
                  moldId: '',
                  partnerName: '',
                  workType: '',
                  status: ''
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
            placeholder="금형 ID, 금형명, 협력사로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Work Type Distribution Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">작업 유형별 분포</h3>
            <div className="h-64">
              <DoughnutChart
                data={{
                  labels: ['습합', '세척', '습합+세척'],
                  datasets: [{
                    data: [
                      filteredRecords.filter(r => r.workType === 'assembly').length,
                      filteredRecords.filter(r => r.workType === 'cleaning').length,
                      filteredRecords.filter(r => r.workType === 'both').length
                    ],
                    backgroundColor: [
                      'rgba(147, 51, 234, 0.8)',
                      'rgba(6, 182, 212, 0.8)',
                      'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: [
                      'rgb(147, 51, 234)',
                      'rgb(6, 182, 212)',
                      'rgb(59, 130, 246)'
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

          {/* Partner Work Status Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">협력사별 작업 현황</h3>
            <div className="h-64">
              <BarChart
                data={{
                  labels: Array.from(new Set(filteredRecords.map(r => r.partnerName))),
                  datasets: [
                    {
                      label: '정상',
                      data: Array.from(new Set(filteredRecords.map(r => r.partnerName))).map(partner =>
                        filteredRecords.filter(r => r.partnerName === partner && r.overallStatus === 'normal').length
                      ),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgb(34, 197, 94)',
                      borderWidth: 1
                    },
                    {
                      label: '주의',
                      data: Array.from(new Set(filteredRecords.map(r => r.partnerName))).map(partner =>
                        filteredRecords.filter(r => r.partnerName === partner && r.overallStatus === 'attention').length
                      ),
                      backgroundColor: 'rgba(234, 179, 8, 0.8)',
                      borderColor: 'rgb(234, 179, 8)',
                      borderWidth: 1
                    },
                    {
                      label: '비정상',
                      data: Array.from(new Set(filteredRecords.map(r => r.partnerName))).map(partner =>
                        filteredRecords.filter(r => r.partnerName === partner && r.overallStatus === 'abnormal').length
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
                <p className="text-sm text-neutral-600">총 작업 건수</p>
                <p className="text-xl font-bold text-neutral-900">{filteredRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">습합 작업</p>
                <p className="text-xl font-bold text-purple-600">
                  {filteredRecords.filter(r => r.workType === 'assembly' || r.workType === 'both').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Droplet className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">세척 작업</p>
                <p className="text-xl font-bold text-cyan-600">
                  {filteredRecords.filter(r => r.workType === 'cleaning' || r.workType === 'both').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">완료</p>
                <p className="text-xl font-bold text-green-600">
                  {filteredRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">작업번호</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">협력사</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">금형ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">금형명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">작업구분</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">작업일</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">위치</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id}
                    onClick={() => handleViewDetail(record)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.recordNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.partnerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {record.moldId}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {record.moldName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getWorkTypeColor(record.workType)}`}>
                        {getWorkTypeText(record.workType)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.workDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(record.overallStatus)}`}>
                        {getStatusIcon(record.overallStatus)}
                        <span>{getStatusText(record.overallStatus)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(record);
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

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">습합/세척 이력이 없습니다</h3>
            <p className="text-neutral-600">검색 조건을 변경하거나 새로운 작업을 기다려주세요.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">습합/세척 작업 상세 내역</h2>
                  <p className="text-cyan-100 text-sm mt-1">Assembly & Cleaning Work Details</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedRecord(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">기본 정보</h3>
                  <div className="flex gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getWorkTypeColor(selectedRecord.workType)}`}>
                      {getWorkTypeText(selectedRecord.workType)}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(selectedRecord.overallStatus)}`}>
                      {getStatusIcon(selectedRecord.overallStatus)}
                      <span className="ml-1">{getStatusText(selectedRecord.overallStatus)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">작업 번호</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRecord.recordNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">작업일</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRecord.workDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">작업자</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRecord.inspector}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">작업 위치</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRecord.location}</p>
                  </div>
                </div>
              </div>

              {/* Mold Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  금형 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-500 mb-1">금형 ID</p>
                    <p className="text-lg font-bold text-blue-700">{selectedRecord.moldId}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-500 mb-1">금형명</p>
                    <p className="text-base font-semibold text-gray-900">{selectedRecord.moldName}</p>
                  </div>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  협력사 정보
                </h3>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-lg font-bold text-purple-700">{selectedRecord.partnerName}</p>
                  <p className="text-sm text-gray-600 mt-1">Partner Company</p>
                </div>
              </div>

              {/* Assembly Items */}
              {(selectedRecord.workType === 'assembly' || selectedRecord.workType === 'both') && selectedRecord.assemblyItems && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    습합 작업 항목
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.assemblyItems.disassembly ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">분해</span>
                        {selectedRecord.assemblyItems.disassembly ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.assemblyItems.cleaning ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">세척</span>
                        {selectedRecord.assemblyItems.cleaning ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.assemblyItems.inspection ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">검사</span>
                        {selectedRecord.assemblyItems.inspection ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.assemblyItems.reassembly ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">재조립</span>
                        {selectedRecord.assemblyItems.reassembly ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.assemblyItems.testing ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">테스트</span>
                        {selectedRecord.assemblyItems.testing ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cleaning Items */}
              {(selectedRecord.workType === 'cleaning' || selectedRecord.workType === 'both') && selectedRecord.cleaningItems && (
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border-2 border-cyan-200">
                  <h3 className="text-xl font-bold text-cyan-900 mb-4 flex items-center gap-2">
                    <Droplet className="h-5 w-5" />
                    세척 작업 항목
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.cleaningItems.cavity ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">캐비티 청소</span>
                        {selectedRecord.cleaningItems.cavity ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.cleaningItems.ejector ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">이젝터 청소</span>
                        {selectedRecord.cleaningItems.ejector ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.cleaningItems.coolingChannel ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">냉각수로 청소</span>
                        {selectedRecord.cleaningItems.coolingChannel ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.cleaningItems.surface ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">표면 청소</span>
                        {selectedRecord.cleaningItems.surface ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${selectedRecord.cleaningItems.lubrication ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">윤활 작업</span>
                        {selectedRecord.cleaningItems.lubrication ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    특이사항
                  </h3>
                  <div className="bg-white rounded-lg p-5 border border-amber-200">
                    <p className="text-base text-gray-900 leading-relaxed">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}

              {/* Admin Feedback Section */}
              <div className="border-t-2 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  관리자 피드백
                </h3>
                
                {selectedRecord.adminFeedback && (
                  <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">기존 피드백</span>
                      {selectedRecord.reviewedAt && (
                        <span className="text-xs text-blue-600">
                          {formatDate(selectedRecord.reviewedAt)} - {selectedRecord.adminReviewer}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-800">{selectedRecord.adminFeedback}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    피드백 작성 {selectedRecord.adminFeedback && '(수정)'}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="협력사에 전달할 피드백을 작성하세요..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback || !feedback.trim()}
                      className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submittingFeedback ? '등록 중...' : selectedRecord.adminFeedback ? '피드백 수정' : '피드백 등록'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDetail(false);
                        setSelectedRecord(null);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
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

export default AssemblyCleaningHistory;
