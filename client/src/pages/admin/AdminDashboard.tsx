import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Settings,
  RefreshCw,
  X,
  Plus,
  Wrench,
  Activity,
  Menu,
  Search,
  Filter,
  Eye,
  Navigation,
  ChevronDown,
  QrCode,
  Bell,
  BellRing,
  User,
  Calendar,
  FileText,
  Users,
  UserPlus,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import DoughnutChart from '../../components/charts/DoughnutChart';

interface KPIData {
  totalMolds: number;
  checkRate: string;
  pendingInspections: number;
  activeRepairs: number;
  moldsByStatus: {
    production: number;
    repair: number;
    inspection: number;
  };
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: string;
  moldId?: number;
}

interface MoldLocation {
  id: number;
  name: string;
  location: string;
  zone: string;
  status: 'production' | 'maintenance' | 'idle' | 'repair';
  lastMaintenance: string;
  nextMaintenance: string;
  coordinates: { x: number; y: number };
  gpsCoordinates: { lat: number; lng: number };
  building: string;
  floor: number;
}

interface Notification {
  id: number;
  type: 'daily_inspection' | 'repair_request' | 'status_update';
  title: string;
  message: string;
  moldId: string;
  moldName?: string;
  inspector?: string;
  requester?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
}

interface RealtimeStats {
  todayInspections: number;
  todayRepairRequests: number;
  pendingRepairs: number;
  urgentIssues: number;
  unreadNotifications: number;
  recentActivity: Array<{
    type: 'inspection' | 'repair_request';
    moldId: string;
    status?: string;
    urgency?: string;
    time: string;
    inspector?: string;
    requester?: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [moldLocations, setMoldLocations] = useState<MoldLocation[]>([]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'factory' | 'gps'>('factory');
  const [selectedMold, setSelectedMold] = useState<MoldLocation | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPartnerMenu, setShowPartnerMenu] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [showRepairDetails, setShowRepairDetails] = useState(false);
  const [selectedRepairStatus, setSelectedRepairStatus] = useState<'all' | 'requested' | 'inProgress' | 'completed'>('all');
  const [showRepairCard, setShowRepairCard] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [partners, setPartners] = useState([
    { id: 1, name: '협력사 A', contact: '홍길동', phone: '010-1234-5678', email: 'partner1@example.com', address: '서울시 강남구', username: 'partnerA', password: '****' },
    { id: 2, name: '협력사 B', contact: '김철수', phone: '010-2345-6789', email: 'partner2@example.com', address: '서울시 서초구', username: 'partnerB', password: '****' },
    { id: 3, name: '협력사 C', contact: '이영희', phone: '010-3456-7890', email: 'partner3@example.com', address: '경기도 성남시', username: 'partnerC', password: '****' },
    { id: 4, name: '협력사 D', contact: '박민수', phone: '010-4567-8901', email: 'partner4@example.com', address: '인천시 남동구', username: 'partnerD', password: '****' },
    { id: 5, name: '협력사 E', contact: '정수진', phone: '010-5678-9012', email: 'partner5@example.com', address: '부산시 해운대구', username: 'partnerE', password: '****' }
  ]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [kpiResponse, activitiesResponse, locationsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/dash/kpi', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch('http://localhost:5001/api/dash/activities?limit=10', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch('http://localhost:5001/api/dash/mold-locations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ]);

      if (!kpiResponse.ok || !activitiesResponse.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      
      // 위치 데이터는 선택적으로 처리
      if (!locationsResponse.ok) {
        console.warn('위치 데이터를 불러올 수 없습니다. Mock 데이터를 사용합니다.');
      }

      // KPI 데이터 처리
      let kpiResult = null;
      try {
        kpiResult = await kpiResponse.json();
      } catch (kpiError) {
        console.warn('KPI 데이터 파싱 실패:', kpiError);
        kpiResult = getDefaultKpiData();
      }

      // 활동 데이터 처리
      let activitiesResult = [];
      try {
        activitiesResult = await activitiesResponse.json();
      } catch (activitiesError) {
        console.warn('활동 데이터 파싱 실패:', activitiesError);
        activitiesResult = getDefaultActivitiesData();
      }
      
      // 위치 데이터 처리
      let locationsResult = [];
      try {
        if (locationsResponse.ok) {
          locationsResult = await locationsResponse.json();
        }
      } catch (locationError) {
        console.warn('위치 데이터 파싱 실패:', locationError);
      }

      setKpiData(kpiResult || getDefaultKpiData());
      setActivities(Array.isArray(activitiesResult) ? activitiesResult : getDefaultActivitiesData());
      setMoldLocations(
        Array.isArray(locationsResult) && locationsResult.length
          ? sanitizeLocations(locationsResult)
          : getMockLocationData()
      );
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.relative')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Default data functions
  const getDefaultKpiData = (): KPIData => ({
    totalMolds: 0,
    checkRate: '0%',
    pendingInspections: 0,
    activeRepairs: 0,
    moldsByStatus: {
      production: 0,
      repair: 0,
      inspection: 0
    }
  });

  const getDefaultActivitiesData = (): Activity[] => ([
    {
      id: 'default_1',
      type: 'check',
      message: '데이터를 불러오는 중입니다...',
      timestamp: new Date().toISOString(),
      status: 'completed',
      moldId: 0
    }
  ]);

  // Mock data for demonstration with GPS coordinates
  const getMockLocationData = (): MoldLocation[] => {
    // 예시: 서울 강남구 일대의 가상의 공장 좌표
    const baseLocation = { lat: 37.5665, lng: 127.0780 }; // 서울 중심부
    
    return [
      { 
        id: 1, name: 'M-001', location: 'A구역-01', zone: 'A', status: 'production', 
        lastMaintenance: '2024-10-15', nextMaintenance: '2024-11-15', 
        coordinates: { x: 20, y: 30 },
        gpsCoordinates: { lat: baseLocation.lat + 0.001, lng: baseLocation.lng + 0.001 },
        building: '제1공장', floor: 1
      },
      { 
        id: 2, name: 'M-002', location: 'A구역-02', zone: 'A', status: 'maintenance', 
        lastMaintenance: '2024-10-20', nextMaintenance: '2024-11-20', 
        coordinates: { x: 40, y: 30 },
        gpsCoordinates: { lat: baseLocation.lat + 0.0015, lng: baseLocation.lng + 0.001 },
        building: '제1공장', floor: 1
      },
      { 
        id: 3, name: 'M-003', location: 'B구역-01', zone: 'B', status: 'production', 
        lastMaintenance: '2024-10-10', nextMaintenance: '2024-11-10', 
        coordinates: { x: 20, y: 60 },
        gpsCoordinates: { lat: baseLocation.lat + 0.001, lng: baseLocation.lng + 0.0015 },
        building: '제1공장', floor: 2
      },
      { 
        id: 4, name: 'M-004', location: 'B구역-02', zone: 'B', status: 'idle', 
        lastMaintenance: '2024-10-25', nextMaintenance: '2024-11-25', 
        coordinates: { x: 40, y: 60 },
        gpsCoordinates: { lat: baseLocation.lat + 0.0015, lng: baseLocation.lng + 0.0015 },
        building: '제1공장', floor: 2
      },
      { 
        id: 5, name: 'M-005', location: 'C구역-01', zone: 'C', status: 'repair', 
        lastMaintenance: '2024-10-05', nextMaintenance: '2024-11-05', 
        coordinates: { x: 60, y: 30 },
        gpsCoordinates: { lat: baseLocation.lat + 0.002, lng: baseLocation.lng + 0.001 },
        building: '제2공장', floor: 1
      },
      { 
        id: 6, name: 'M-006', location: 'C구역-02', zone: 'C', status: 'production', 
        lastMaintenance: '2024-10-18', nextMaintenance: '2024-11-18', 
        coordinates: { x: 80, y: 30 },
        gpsCoordinates: { lat: baseLocation.lat + 0.0025, lng: baseLocation.lng + 0.001 },
        building: '제2공장', floor: 1
      },
      { 
        id: 7, name: 'M-007', location: 'D구역-01', zone: 'D', status: 'production', 
        lastMaintenance: '2024-10-12', nextMaintenance: '2024-11-12', 
        coordinates: { x: 60, y: 60 },
        gpsCoordinates: { lat: baseLocation.lat + 0.002, lng: baseLocation.lng + 0.0015 },
        building: '제2공장', floor: 2
      },
      { 
        id: 8, name: 'M-008', location: 'D구역-02', zone: 'D', status: 'maintenance', 
        lastMaintenance: '2024-10-22', nextMaintenance: '2024-11-22', 
        coordinates: { x: 80, y: 60 },
        gpsCoordinates: { lat: baseLocation.lat + 0.0025, lng: baseLocation.lng + 0.0015 },
        building: '제2공장', floor: 2
      }
    ];
  };

  const sanitizeLocations = (locations: any[]): MoldLocation[] => {
    return locations.map((l: any) => ({
      id: Number(l.id) || 0,
      name: String(l.name ?? l.moldId ?? `M-${l.id ?? 'UNKNOWN'}`),
      location: String(l.location ?? '-'),
      zone: String(l.zone ?? 'A'),
      status: ['production', 'maintenance', 'idle', 'repair'].includes(l.status) ? l.status : 'idle',
      lastMaintenance: String(l.lastMaintenance ?? '-'),
      nextMaintenance: String(l.nextMaintenance ?? '-'),
      coordinates: {
        x: Number(l.coordinates?.x ?? 50),
        y: Number(l.coordinates?.y ?? 50),
      },
      gpsCoordinates: {
        lat: Number(l.gpsCoordinates?.lat ?? 37.5665),
        lng: Number(l.gpsCoordinates?.lng ?? 127.0780),
      },
      building: String(l.building ?? '제1공장'),
      floor: Number(l.floor ?? 1),
    }));
  };

  const getFilteredLocations = () => {
    let filtered = moldLocations;
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(mold => mold.status === locationFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(mold => 
        mold.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mold.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-500';
      case 'repair': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'production': return '생산중';
      case 'maintenance': return '정비중';
      case 'idle': return '대기중';
      case 'repair': return '수리중';
      default: return '알 수 없음';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const getKpiCards = () => {
    if (!kpiData) return [];
    
    return [
      { 
        id: 'totalMolds',
        title: '총 금형 수', 
        value: kpiData.totalMolds.toString(), 
        change: '+0', 
        icon: Settings, 
        color: 'text-primary-600' 
      },
      { 
        id: 'checkRate',
        title: '점검률', 
        value: kpiData.checkRate, 
        change: '+0%', 
        icon: CheckCircle, 
        color: 'text-accent-green' 
      },
      { 
        id: 'pendingInspections',
        title: '예정 점검', 
        value: kpiData.pendingInspections.toString(), 
        change: '+0', 
        icon: AlertTriangle, 
        color: 'text-accent-orange' 
      },
      { 
        id: 'activeRepairs',
        title: '수리 진행', 
        value: kpiData.activeRepairs.toString(), 
        change: '+0', 
        icon: Clock, 
        color: 'text-accent-red' 
      },
    ];
  };

  const handleKPIClick = (kpiId: string) => {
    setSelectedKPI(selectedKPI === kpiId ? null : kpiId);
  };

  const getKPIDetailData = (kpiId: string) => {
    if (!kpiData) return null;

    // 안전한 데이터 접근을 위한 기본값 설정
    const safeKpiData = {
      ...kpiData,
      moldsByStatus: {
        production: kpiData.moldsByStatus?.production || 0,
        repair: kpiData.moldsByStatus?.repair || 0,
        inspection: kpiData.moldsByStatus?.inspection || 0
      }
    };

    switch (kpiId) {
      case 'totalMolds':
        return {
          title: '금형 현황 상세',
          chartType: 'doughnut',
          data: {
            labels: ['생산중', '수리중', '점검중'],
            datasets: [{
              data: [
                safeKpiData.moldsByStatus.production,
                safeKpiData.moldsByStatus.repair,
                safeKpiData.moldsByStatus.inspection
              ],
              backgroundColor: ['#0ea5e9', '#ff3b30', '#ff9500'],
              borderColor: ['#0ea5e9', '#ff3b30', '#ff9500'],
              borderWidth: 2
            }]
          },
          details: [
            { label: '생산중', value: safeKpiData.moldsByStatus.production.toString(), color: 'bg-blue-500' },
            { label: '수리중', value: safeKpiData.moldsByStatus.repair.toString(), color: 'bg-red-500' },
            { label: '점검중', value: safeKpiData.moldsByStatus.inspection.toString(), color: 'bg-orange-500' }
          ]
        };
      case 'checkRate':
        return {
          title: '점검률 추이',
          chartType: 'line',
          data: {
            labels: ['1주전', '6일전', '5일전', '4일전', '3일전', '2일전', '어제', '오늘'],
            datasets: [{
              label: '점검률 (%)',
              data: [82, 85, 87, 84, 89, 86, 88, 87],
              borderColor: '#30d158',
              backgroundColor: 'rgba(48, 209, 88, 0.1)',
              fill: true
            }]
          },
          details: [
            { label: '목표 점검률', value: '90%', color: 'bg-green-500' },
            { label: '현재 점검률', value: safeKpiData.checkRate || '0%', color: 'bg-blue-500' },
            { label: '지난주 평균', value: '85%', color: 'bg-gray-500' }
          ]
        };
      case 'pendingInspections':
        return {
          title: '예정 점검 일정',
          chartType: 'line',
          data: {
            labels: ['오늘', '내일', '모레', '3일후', '4일후', '5일후', '6일후'],
            datasets: [{
              label: '예정 점검 수',
              data: [3, 5, 2, 1, 4, 2, 3],
              backgroundColor: 'rgba(255, 149, 0, 0.1)',
              borderColor: '#ff9500',
              fill: true
            }]
          },
          details: [
            { label: '긴급 점검', value: '2건', color: 'bg-red-500' },
            { label: '정기 점검', value: '8건', color: 'bg-orange-500' },
            { label: '예방 점검', value: '2건', color: 'bg-yellow-500' }
          ]
        };
      case 'activeRepairs':
        return {
          title: '수리 진행 현황',
          chartType: 'line',
          data: {
            labels: ['부품교체', '청소/정비', '전기수리', '기계수리', '기타'],
            datasets: [{
              label: '수리 건수',
              data: [1, 1, 0, 1, 0],
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              borderColor: '#ff3b30',
              fill: true
            }]
          },
          details: [
            { label: '진행중', value: '3건', color: 'bg-red-500' },
            { label: '대기중', value: '0건', color: 'bg-gray-500' },
            { label: '완료 예정', value: '오늘 1건', color: 'bg-green-500' }
          ]
        };
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left Sidebar - Quick Actions */}
      <div className={`${leftSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-neutral-200 flex flex-col overflow-hidden lg:w-64 lg:block ${leftSidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">빠른 작업</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-150">
              설정
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/molds/register')}
                className="w-full p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">새 금형 등록</p>
                    <p className="text-xs text-primary-100 mt-1">금형 정보를 시스템에 추가</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  setSelectedRepairStatus('all');
                  setShowRepairDetails(true);
                }}
                className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <Wrench className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">금형수리 이력관리</p>
                    <p className="text-xs text-red-100 mt-1">협력사 수리 요청 및 진행 현황</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/assembly-cleaning-history')}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">협력사 습합세척 이력</p>
                    <p className="text-xs text-blue-100 mt-1">협력사 습합/세척 기록 조회</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/molds/schedule-management')}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">점검 일정 관리</p>
                    <p className="text-xs text-green-100 mt-1">예정된 점검 일정 확인</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/molds/qr-inspection')}
                className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">QR 점검</p>
                    <p className="text-xs text-purple-100 mt-1">QR 스캔으로 점검 상태 확인</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/daily-inspection-history')}
                className="w-full p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">일상점검 이력</p>
                    <p className="text-xs text-indigo-100 mt-1">작업자 점검 기록 조회</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/admin/notification-settings')}
                className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">알림 설정</p>
                    <p className="text-xs text-orange-100 mt-1">시스템 알림 및 알림 설정</p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="border-t border-neutral-200 pt-4 mt-6">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">리포트 및 분석</h4>
              <div className="space-y-2">
                <button className="w-full p-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-4 w-4 text-neutral-500" />
                    <span>월간 리포트</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-neutral-500" />
                    <span>성능 분석</span>
                  </div>
                </button>
                <button className="w-full p-3 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors duration-150">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-neutral-500" />
                    <span>활동 내역</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-none mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
            title="빠른 작업 메뉴"
          >
            <Menu className="h-5 w-5 text-neutral-600" />
          </button>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-neutral-800">주식회사 캠스</span>
              <span className="text-xs text-neutral-600">CAMS Corporation</span>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-neutral-900">금형관리 시스템</h1>
              <p className="text-neutral-600 mt-1">실시간 금형관리 현황을 한눈에 확인하세요</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* 협력사 관리 */}
          <div className="relative">
            <button
              onClick={() => setShowPartnerMenu(!showPartnerMenu)}
              className="btn-secondary flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              협력사 관리
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showPartnerMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowPartnerModal(true);
                      setShowPartnerMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    협력사 목록
                  </button>
                  <button
                    onClick={() => {
                      setShowPartnerModal(true);
                      setShowPartnerMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    협력사 등록
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 금형 관리 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn-secondary flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              금형 관리
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/admin/molds/register');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    새 금형 등록
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRepairStatus('all');
                      setShowRepairDetails(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    금형수리 이력관리
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/assembly-cleaning-history');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    협력사 습합세척 이력
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      navigate('/admin/molds');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    금형 목록 보기
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={fetchDashboardData}
            className="btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button 
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="btn-secondary lg:hidden"
            title="최근 활동"
          >
            <Activity className="mr-2 h-4 w-4" />
            활동
          </button>
          <button className="btn-secondary hidden sm:flex">
            <BarChart3 className="mr-2 h-4 w-4" />
            리포트
          </button>
          <button className="btn-primary">
            <TrendingUp className="mr-2 h-4 w-4" />
            분석
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/partner/dashboard')}
            title="협력사 대시보드 열기"
          >
            협력사
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !kpiData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-20 mb-3"></div>
                  <div className="h-8 bg-neutral-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {!loading && kpiData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {getKpiCards().map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div 
                key={index} 
                className="card p-6 card-hover cursor-pointer group transition-all duration-200 hover:shadow-lg"
                onClick={() => handleKPIClick(kpi.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-600 truncate">{kpi.title}</p>
                    <p className="text-2xl font-semibold text-neutral-900 mt-2">{kpi.value}</p>
                    <p className={`text-sm mt-1 ${kpi.change.startsWith('+') ? 'text-accent-green' : 'text-accent-red'}`}>
                      {kpi.change} 전월대비
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-neutral-50 group-hover:bg-neutral-100 transition-colors duration-150 ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KPI Detail Section */}
      {selectedKPI && !loading && kpiData && (
        <div className="card p-6 animate-in slide-in-from-top-2 duration-300">
          {(() => {
            const detailData = getKPIDetailData(selectedKPI);
            if (!detailData) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-neutral-900">{detailData.title}</h3>
                  <button 
                    onClick={() => setSelectedKPI(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
                  >
                    <X className="h-5 w-5 text-neutral-500" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart */}
                  <div className="h-80">
                    {detailData && detailData.data ? (
                      detailData.chartType === 'doughnut' ? (
                        <DoughnutChart data={detailData.data} />
                      ) : (
                        <LineChart data={detailData.data} />
                      )
                    ) : (
                      <div className="flex items-center justify-center h-full bg-neutral-50 rounded-lg">
                        <p className="text-neutral-500">차트 데이터를 불러오는 중...</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-neutral-900 mb-4">상세 정보</h4>
                    {detailData && detailData.details && Array.isArray(detailData.details) ? (
                      detailData.details.map((detail, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${detail?.color || 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium text-neutral-700">{detail?.label || '정보 없음'}</span>
                          </div>
                          <span className="text-sm font-semibold text-neutral-900">{detail?.value || '-'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <p className="text-neutral-500 text-sm">상세 정보를 불러오는 중...</p>
                      </div>
                    )}
                    
                    {/* Additional Actions */}
                    <div className="mt-6 pt-4 border-t border-neutral-200">
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-secondary text-sm">
                          <Activity className="mr-2 h-4 w-4" />
                          상세 보고서
                        </button>
                        {selectedKPI === 'pendingInspections' && (
                          <button className="btn-secondary text-sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            일정 관리
                          </button>
                        )}
                        {selectedKPI === 'activeRepairs' && (
                          <button className="btn-secondary text-sm">
                            <Wrench className="mr-2 h-4 w-4" />
                            수리 관리
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Chart 1 - 협력사 금형수리 의뢰 및 진행현황 */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">협력사 금형수리 의뢰 및 진행현황</h3>
              <p className="text-sm text-neutral-500 mt-1">일별 수리 요청 및 처리 현황</p>
            </div>
            <select 
              className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
            >
              <option>최근 7일</option>
              <option>최근 30일</option>
              <option>최근 3개월</option>
            </select>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => {
                setSelectedRepairStatus('requested');
                setShowRepairDetails(true);
              }}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-red-700">총 의뢰</p>
                <div className="p-2 bg-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-700" />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-800">29건</p>
              <p className="text-xs text-red-600 mt-1">주간 누적</p>
            </button>
            <button
              onClick={() => {
                setSelectedRepairStatus('inProgress');
                setShowRepairDetails(true);
              }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-orange-700">진행중</p>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-700" />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-800">24건</p>
              <p className="text-xs text-orange-600 mt-1">처리 대기</p>
            </button>
            <button
              onClick={() => {
                setSelectedRepairStatus('completed');
                setShowRepairDetails(true);
              }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-green-700">완료</p>
                <div className="p-2 bg-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-700" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-800">13건</p>
              <p className="text-xs text-green-600 mt-1">완료율 45%</p>
            </button>
          </div>

          {/* Bar Chart */}
          <div className="h-80">
            <BarChart 
              data={{
                labels: ['11/1', '11/2', '11/3', '11/4', '11/5', '11/6', '11/7'],
                datasets: [
                  {
                    label: '수리 의뢰',
                    data: [3, 5, 4, 2, 6, 4, 5],
                    backgroundColor: '#ff3b30',
                    borderColor: '#ff3b30',
                    borderWidth: 1,
                  },
                  {
                    label: '진행중',
                    data: [2, 3, 4, 3, 5, 4, 3],
                    backgroundColor: '#ff9500',
                    borderColor: '#ff9500',
                    borderWidth: 1,
                  },
                  {
                    label: '완료',
                    data: [1, 2, 2, 1, 3, 2, 2],
                    backgroundColor: '#30d158',
                    borderColor: '#30d158',
                    borderWidth: 1,
                  }
                ]
              }}
            />
          </div>
        </div>

        {/* Chart 2 - 정기점검 현황 */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="text-xl font-semibold text-neutral-900">정기점검 현황</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-success">완료 156</span>
              <span className="badge badge-warning">예정 23</span>
              <span className="badge badge-error">지연 8</span>
            </div>
          </div>
          <div className="h-64">
            <DoughnutChart 
              data={{
                labels: ['완료', '예정', '지연'],
                datasets: [
                  {
                    data: [156, 23, 8],
                    backgroundColor: [
                      '#30d158',
                      '#ff9500', 
                      '#ff3b30'
                    ],
                    borderColor: [
                      '#30d158',
                      '#ff9500',
                      '#ff3b30'
                    ],
                    borderWidth: 2,
                  }
                ]
              }}
            />
          </div>
        </div>
      </div>

      {/* Mold Location Visualization */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">CAMS 금형 위치 현황</h3>
            <p className="text-sm text-neutral-600">주식회사 캠스 실시간 금형 위치 및 상태 모니터링</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="금형 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
              />
            </div>
            
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
            >
              <option value="all">전체 상태</option>
              <option value="production">생산중</option>
              <option value="maintenance">정비중</option>
              <option value="idle">대기중</option>
              <option value="repair">수리중</option>
            </select>
            
            <button className="btn-secondary text-sm">
              <Filter className="mr-2 h-4 w-4" />
              필터
            </button>
            
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button 
                onClick={() => setMapView('factory')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  mapView === 'factory' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                공장 레이아웃
              </button>
              <button 
                onClick={() => setMapView('gps')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  mapView === 'gps' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                GPS 지도
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="xl:col-span-2">
            {mapView === 'factory' ? (
              <div className="bg-neutral-50 rounded-lg p-6 h-96 relative border">
                <h4 className="text-lg font-medium text-neutral-900 mb-4">공장 레이아웃</h4>
              
              {/* Zone Labels */}
              <div className="absolute top-12 left-6 text-xs font-medium text-neutral-600">A구역</div>
              <div className="absolute top-12 right-6 text-xs font-medium text-neutral-600">C구역</div>
              <div className="absolute bottom-12 left-6 text-xs font-medium text-neutral-600">B구역</div>
              <div className="absolute bottom-12 right-6 text-xs font-medium text-neutral-600">D구역</div>
              
              {/* Zone Dividers */}
              <div className="absolute top-16 left-0 right-0 h-px bg-neutral-200"></div>
              <div className="absolute bottom-16 left-0 right-0 h-px bg-neutral-200"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neutral-200"></div>
              
              {/* Mold Positions */}
              {getFilteredLocations().map((mold) => {
                const x = mold.coordinates?.x ?? 50;
                const y = mold.coordinates?.y ?? 50;
                return (
                  <div
                    key={mold.id}
                    className={`absolute w-8 h-8 rounded-full ${
                      getStatusColor(mold.status)
                    } cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center justify-center text-white text-xs font-medium shadow-lg`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedZone(mold.zone)}
                    title={`${mold.name} - ${mold.location} (${getStatusText(mold.status)})`}
                  >
                    {mold.id}
                  </div>
                );
              })}
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-neutral-600">생산중</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-neutral-600">정비중</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-neutral-600">대기중</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-neutral-600">수리중</span>
                </div>
              </div>
            </div>
            ) : (
              /* GPS Map View */
              <div className="bg-neutral-50 rounded-lg p-6 h-96 relative border">
                <h4 className="text-lg font-medium text-neutral-900 mb-4">GPS 위치 지도</h4>
                
                {/* Simple OpenStreetMap-style visualization */}
                <div className="w-full h-80 bg-green-100 rounded-lg relative overflow-hidden border-2 border-green-200">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="border border-green-300"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Roads/Paths */}
                  <div className="absolute top-1/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-2 bg-gray-300 opacity-60"></div>
                  <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-gray-300 opacity-60"></div>
                  <div className="absolute top-0 bottom-0 right-1/3 w-2 bg-gray-300 opacity-60"></div>
                  
                  {/* Buildings */}
                  <div className="absolute top-6 left-6 w-32 h-24 bg-blue-200 rounded border-2 border-blue-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-800">제1공장</span>
                  </div>
                  <div className="absolute top-6 right-6 w-32 h-24 bg-purple-200 rounded border-2 border-purple-400 flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-800">제2공장</span>
                  </div>
                  
                  {/* GPS Markers for Molds */}
                  {getFilteredLocations().map((mold) => {
                    const lng = mold.gpsCoordinates?.lng ?? 127.0780;
                    const lat = mold.gpsCoordinates?.lat ?? 37.5665;
                    const x = ((lng - 127.0780) * 50000) + 50;
                    const y = ((37.5665 - lat) * 50000) + 50;
                    
                    return (
                      <div
                        key={mold.id}
                        className={`absolute w-6 h-6 rounded-full ${
                          getStatusColor(mold.status)
                        } cursor-pointer hover:scale-125 transition-transform duration-200 flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white`}
                        style={{
                          left: `${Math.max(5, Math.min(95, x))}%`,
                          top: `${Math.max(5, Math.min(95, y))}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedMold(selectedMold?.id === mold.id ? null : mold)}
                        title={`${mold.name} - ${mold.building} ${mold.floor}층 (${getStatusText(mold.status)})`}
                      >
                        {mold.id}
                      </div>
                    );
                  })}
                  
                  {/* Compass */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-neutral-200">
                    <div className="text-xs font-bold text-neutral-700">N</div>
                    <div className="absolute top-1 w-0.5 h-4 bg-red-500"></div>
                  </div>
                  
                  {/* Scale */}
                  <div className="absolute bottom-4 left-4 bg-white px-2 py-1 rounded shadow text-xs">
                    100m
                  </div>
                  
                  {/* Coordinates Display */}
                  <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded shadow text-xs">
                    37.5665°N, 127.0780°E
                  </div>
                </div>
                
                {/* GPS Info Panel */}
                {selectedMold && (
                  <div className="absolute top-16 right-6 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-neutral-900">{selectedMold.name}</h5>
                      <button 
                        onClick={() => setSelectedMold(null)}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1 text-xs text-neutral-600">
                      <div>📍 {selectedMold.building} {selectedMold.floor}층</div>
                      <div>🌍 {selectedMold.gpsCoordinates ? selectedMold.gpsCoordinates.lat.toFixed(6) : 'N/A'}°N</div>
                      <div>🌍 {selectedMold.gpsCoordinates ? selectedMold.gpsCoordinates.lng.toFixed(6) : 'N/A'}°E</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedMold.status)}`}></div>
                        <span>{getStatusText(selectedMold.status)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mold List */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-neutral-900">금형 목록</h4>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {getFilteredLocations().map((mold) => (
                <div
                  key={mold.id}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedZone === mold.zone ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedZone(selectedZone === mold.zone ? null : mold.zone)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(mold.status)}`}></div>
                      <span className="font-medium text-sm text-neutral-900">{mold.name}</span>
                    </div>
                    <span className={`badge text-xs ${
                      mold.status === 'production' ? 'badge-success' :
                      mold.status === 'maintenance' ? 'badge-warning' :
                      mold.status === 'idle' ? 'badge-neutral' :
                      'badge-error'
                    }`}>
                      {getStatusText(mold.status)}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span>{mold.location} ({mold.building} {mold.floor}층)</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>다음 정비: {mold.nextMaintenance}</span>
                    </div>
                    {mapView === 'gps' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Navigation className="h-3 w-3" />
                        <span>{mold.gpsCoordinates ? `${mold.gpsCoordinates.lat.toFixed(4)}°N, ${mold.gpsCoordinates.lng.toFixed(4)}°E` : '좌표 없음'}</span>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/partner/mold/${mold.name}/repair`)}
                        className="px-2 py-1 border border-neutral-200 rounded text-xs hover:bg-neutral-50"
                        title="협력사 수리 등록으로 이동"
                      >
                        협력사 수리
                      </button>
                      <button
                        onClick={() => navigate(`/partner/mold/${mold.name}/daily-management`)}
                        className="px-2 py-1 border border-neutral-200 rounded text-xs hover:bg-neutral-50"
                        title="협력사 일상관리로 이동"
                      >
                        협력사 일상
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-neutral-200">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {moldLocations.filter(m => m.status === 'production').length}
                  </div>
                  <div className="text-xs text-green-600">생산중</div>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">
                    {moldLocations.filter(m => m.status === 'repair').length}
                  </div>
                  <div className="text-xs text-red-600">수리중</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions for Location */}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary text-sm">
              <Eye className="mr-2 h-4 w-4" />
              상세 보기
            </button>
            <button className="btn-secondary text-sm">
              <Navigation className="mr-2 h-4 w-4" />
              경로 안내
            </button>
            <button className="btn-secondary text-sm">
              <Settings className="mr-2 h-4 w-4" />
              설정
            </button>
          </div>
        </div>
      </div>

        </div>
      </div>

      {/* Right Sidebar - Recent Activities */}
      <div className={`${rightSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white border-l border-neutral-200 flex flex-col overflow-hidden lg:w-72 lg:block ${rightSidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">최근 활동</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-150">
              전체 보기
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-150 border border-neutral-100">
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                      activity.status === 'completed' ? 'bg-accent-green' :
                      activity.status === 'pending' ? 'bg-accent-orange' :
                      'bg-primary-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900 leading-relaxed">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-neutral-500">{formatTimeAgo(activity.timestamp)}</p>
                        <span className={`badge text-xs ${
                          activity.status === 'completed' ? 'badge-success' :
                          activity.status === 'pending' ? 'badge-warning' :
                          'badge-neutral'
                        }`}>
                          {activity.status === 'completed' ? '완료' :
                           activity.status === 'pending' ? '대기' : '예정'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-neutral-500 text-xs">최근 활동이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 협력사 관리 모달 */}
      {showPartnerModal && !showPartnerForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">협력사 관리</h3>
              </div>
              <button onClick={() => setShowPartnerModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="mb-6">
                <button 
                  onClick={() => {
                    setEditingPartner(null);
                    setShowPartnerForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  새 협력사 등록
                </button>
              </div>
              
              <div className="space-y-3">
                {partners.map((partner) => (
                  <div key={partner.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{partner.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              담당자: {partner.contact}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {partner.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {partner.email}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">주소: {partner.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingPartner(partner);
                            setShowPartnerForm(true);
                          }}
                          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`${partner.name}을(를) 삭제하시겠습니까?`)) {
                              setPartners(partners.filter(p => p.id !== partner.id));
                            }
                          }}
                          className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 협력사 등록/수정 폼 모달 */}
      {showPartnerForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  {editingPartner ? <Building className="h-5 w-5 text-white" /> : <UserPlus className="h-5 w-5 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPartner ? '협력사 수정' : '새 협력사 등록'}
                </h3>
              </div>
              <button onClick={() => {
                setShowPartnerForm(false);
                setEditingPartner(null);
              }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newPartner = {
                id: editingPartner?.id || Date.now(),
                name: formData.get('name') as string,
                contact: formData.get('contact') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                address: formData.get('address') as string,
                username: formData.get('username') as string,
                password: formData.get('password') as string || editingPartner?.password || '****'
              };
              
              if (editingPartner) {
                setPartners(partners.map(p => p.id === editingPartner.id ? newPartner : p));
              } else {
                setPartners([...partners, newPartner]);
              }
              
              setShowPartnerForm(false);
              setEditingPartner(null);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">회사명 *</label>
                <input 
                  type="text" 
                  name="name"
                  defaultValue={editingPartner?.name || ''}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="협력사 이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">담당자 *</label>
                <input 
                  type="text" 
                  name="contact"
                  defaultValue={editingPartner?.contact || ''}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="담당자 이름을 입력하세요"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">연락처 *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    defaultValue={editingPartner?.phone || ''}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="010-0000-0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">이메일 *</label>
                  <input 
                    type="email" 
                    name="email"
                    defaultValue={editingPartner?.email || ''}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">주소</label>
                <input 
                  type="text" 
                  name="address"
                  defaultValue={editingPartner?.address || ''}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="주소를 입력하세요"
                />
              </div>
              
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">로그인 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">아이디 *</label>
                    <input 
                      type="text" 
                      name="username"
                      defaultValue={editingPartner?.username || ''}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="로그인 아이디"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      비밀번호 {editingPartner ? '' : '*'}
                    </label>
                    <input 
                      type="password" 
                      name="password"
                      required={!editingPartner}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={editingPartner ? "변경하려면 입력하세요" : "비밀번호"}
                    />
                    {editingPartner && (
                      <p className="mt-1 text-xs text-slate-500">
                        * 비밀번호를 변경하지 않으려면 비워두세요
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPartnerForm(false);
                    setEditingPartner(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPartner ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repair Details Modal */}
      {showRepairDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    협력사 금형수리 상세 현황
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    {selectedRepairStatus === 'requested' && '수리 의뢰 목록'}
                    {selectedRepairStatus === 'inProgress' && '진행중인 수리 목록'}
                    {selectedRepairStatus === 'completed' && '완료된 수리 목록'}
                  </p>
                </div>
                <button
                  onClick={() => setShowRepairDetails(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Test Data */}
              {(() => {
                const repairRequests = [
                  { id: 'REP-001', moldId: 'M-2024-001', partNumber: 'PN-2024-001', moldName: '스마트폰 케이스 금형', partner: '정밀금형 주식회사', requestDate: '2024-11-05', status: 'requested', priority: 'high', issue: '이젝터 핀 작동 불량', estimatedDays: 3 },
                  { id: 'REP-002', moldId: 'M-2024-002', partNumber: 'PN-2024-002', moldName: '자동차 부품 금형', partner: '대한금형 주식회사', requestDate: '2024-11-04', status: 'requested', priority: 'medium', issue: '냉각수 누수', estimatedDays: 2 },
                  { id: 'REP-003', moldId: 'M-2024-003', partNumber: 'PN-2024-003', moldName: '전자제품 하우징 금형', partner: '정밀금형 주식회사', requestDate: '2024-11-03', status: 'inProgress', priority: 'high', issue: '균열 발견', estimatedDays: 5, progress: 60 },
                  { id: 'REP-004', moldId: 'M-2024-004', partNumber: 'PN-2024-004', moldName: '가전제품 금형', partner: '협력사 A', requestDate: '2024-11-02', status: 'inProgress', priority: 'low', issue: '표면 마모', estimatedDays: 4, progress: 30 },
                  { id: 'REP-005', moldId: 'M-2024-005', partNumber: 'PN-2024-005', moldName: '의료기기 금형', partner: '협력사 B', requestDate: '2024-11-01', status: 'completed', priority: 'high', issue: '슬라이드 작동 불량', completedDate: '2024-11-04', rating: 5 },
                  { id: 'REP-006', moldId: 'M-2024-006', partNumber: 'PN-2024-006', moldName: '산업용 금형', partner: '협력사 C', requestDate: '2024-10-30', status: 'completed', priority: 'medium', issue: '게이트 막힘', completedDate: '2024-11-02', rating: 4 },
                ];

                const filteredRequests = selectedRepairStatus === 'all' 
                  ? repairRequests 
                  : repairRequests.filter(req => req.status === selectedRepairStatus);

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">요청번호</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">협력사</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">품번</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">품명</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">의뢰일</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">우선순위</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">상태</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">진행률</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                          <tr 
                            key={request.id} 
                            onClick={() => {
                              setSelectedRepair(request);
                              setShowRepairCard(true);
                            }}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{request.partner}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{request.partNumber}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{request.moldName}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{request.requestDate}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                request.priority === 'high' ? 'bg-red-100 text-red-700' :
                                request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {request.priority === 'high' && '긴급'}
                                {request.priority === 'medium' && '보통'}
                                {request.priority === 'low' && '낮음'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                request.status === 'requested' ? 'bg-red-100 text-red-700' :
                                request.status === 'inProgress' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {request.status === 'requested' && '수리 의뢰'}
                                {request.status === 'inProgress' && '진행중'}
                                {request.status === 'completed' && '완료'}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                              {request.status === 'inProgress' && request.progress ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full"
                                      style={{ width: `${request.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium">{request.progress}%</span>
                                </div>
                              ) : request.status === 'completed' ? (
                                <span className="text-green-600 font-medium">100%</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredRequests.length === 0 && (
                      <div className="text-center py-12">
                        <Wrench className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">수리 요청이 없습니다</h3>
                        <p className="text-neutral-600">해당 상태의 수리 요청이 없습니다.</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Repair Card Modal */}
      {showRepairCard && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">협력사 금형수리 이력 카드</h2>
                  <p className="text-blue-100 text-sm mt-1">Partner Mold Repair History Card</p>
                </div>
                <button
                  onClick={() => {
                    setShowRepairCard(false);
                    setSelectedRepair(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">수리 요청 정보</h3>
                  <div className="flex gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      selectedRepair.status === 'requested' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                      selectedRepair.status === 'inProgress' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                      'bg-green-100 text-green-700 border-2 border-green-300'
                    }`}>
                      {selectedRepair.status === 'requested' && '수리 의뢰'}
                      {selectedRepair.status === 'inProgress' && '진행중'}
                      {selectedRepair.status === 'completed' && '완료'}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      selectedRepair.priority === 'high' ? 'bg-red-50 text-red-700 border-2 border-red-300' :
                      selectedRepair.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-300' :
                      'bg-blue-50 text-blue-700 border-2 border-blue-300'
                    }`}>
                      {selectedRepair.priority === 'high' && '⚠️ 긴급'}
                      {selectedRepair.priority === 'medium' && '📌 보통'}
                      {selectedRepair.priority === 'low' && '📋 낮음'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">요청 번호</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRepair.id}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">의뢰일</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRepair.requestDate}</p>
                  </div>
                </div>
              </div>

              {/* Mold Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  금형 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200">
                    <span className="text-sm font-medium text-gray-600">금형 ID</span>
                    <span className="text-lg font-bold text-blue-700">{selectedRepair.moldId}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200">
                    <span className="text-sm font-medium text-gray-600">금형명</span>
                    <span className="text-base font-semibold text-gray-900">{selectedRepair.moldName}</span>
                  </div>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  협력사 정보
                </h3>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-lg font-bold text-purple-700">{selectedRepair.partner}</p>
                  <p className="text-sm text-gray-600 mt-1">Partner Company</p>
                </div>
              </div>

              {/* Issue Details */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  수리 내용
                </h3>
                <div className="bg-white rounded-lg p-5 border border-amber-200">
                  <p className="text-base text-gray-900 leading-relaxed">{selectedRepair.issue}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-gray-500 mb-1">예상 소요일</p>
                    <p className="text-2xl font-bold text-amber-700">{selectedRepair.estimatedDays}일</p>
                  </div>
                  {selectedRepair.status === 'completed' && selectedRepair.completedDate && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-gray-500 mb-1">완료일</p>
                      <p className="text-lg font-bold text-green-700">{selectedRepair.completedDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {selectedRepair.status === 'inProgress' && selectedRepair.progress && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    진행 현황
                  </h3>
                  <div className="bg-white rounded-lg p-5 border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">진행률</span>
                      <span className="text-3xl font-bold text-orange-700">{selectedRepair.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${selectedRepair.progress}%` }}
                      >
                        <span className="text-xs text-white font-bold">{selectedRepair.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              {selectedRepair.status === 'completed' && selectedRepair.rating && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    완료 평가
                  </h3>
                  <div className="bg-white rounded-lg p-5 border border-green-200 text-center">
                    <p className="text-5xl text-yellow-500 mb-2">{'★'.repeat(selectedRepair.rating)}{'☆'.repeat(5 - selectedRepair.rating)}</p>
                    <p className="text-sm text-gray-600">수리 품질 평가</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRepairCard(false);
                    setSelectedRepair(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  닫기
                </button>
                {selectedRepair.status === 'requested' && (
                  <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors">
                    승인 처리
                  </button>
                )}
                {selectedRepair.status === 'inProgress' && (
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                    진행 상황 업데이트
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
