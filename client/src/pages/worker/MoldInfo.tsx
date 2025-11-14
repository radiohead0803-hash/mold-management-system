import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Camera,
  X,
  Bell,
  Clock,
  Wrench,
  TrendingUp,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  ChevronDown,
  ChevronRight,
  Info,
  ClipboardList,
  Droplet,
  Thermometer
} from 'lucide-react';

interface MoldData {
  id: number;
  moldId: string;
  name: string;
  status: string;
  location: string;
  shotCount: number;
  maxShotCount: number;
  lastMaintenance: string;
  nextMaintenance: string;
  manager: string;
  description: string;
  specifications: {
    material: string;
    weight: string;
    dimensions: string;
    cavities: number;
  };
  injectionConditions?: {
    injectionTemperature: string;
    moldTemperature: string;
    injectionPressure: string;
    injectionSpeed: string;
    holdingPressure: string;
    holdingTime: string;
    coolingTime: string;
    cycleTime: string;
    screwSpeed: string;
    backPressure: string;
  };
  images?: {
    moldImage: string;
    productImage: string;
    thumbnails: {
      moldThumbnail: string;
      productThumbnail: string;
    };
  };
  maintenanceHistory: Array<{
    date: string;
    type: string;
    description: string;
    technician: string;
  }>;
}

interface DailyCheckRecord {
  id: number;
  date: string;
  inspector: string;
  status: string;
  items: string[];
  notes?: string;
}

interface DailyCheckItem {
  category: string;
  checkItem: string;
  checkContent: string;
  inputType: string;
  note: string;
}

interface PeriodicCheckItem {
  category: string;
  checkItem: string;
  checkContent: string;
  inputType: string;
  note: string;
}

interface CheckCycle {
  level: string;
  shotCount: number;
  description: string;
  items: string[];
}

interface RepairRecord {
  id: number;
  date: string;
  requester: string;
  status: string;
  issue: string;
  priority: string;
}

interface ShotRecord {
  id: number;
  date: string;
  recorder: string;
  previousCount: number;
  newCount: number;
  difference: number;
}

type HistoryViewType = 'daily' | 'repair' | 'shot' | null;
type ReportViewType = 'monthly' | 'performance' | 'activity' | null;

interface Notification {
  id: number;
  type: 'maintenance' | 'repair' | 'shot' | 'warning';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  isRead: boolean;
}

const MoldInfo: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [moldData, setMoldData] = useState<MoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyView, setHistoryView] = useState<HistoryViewType>(null);
  const [dailyCheckHistory, setDailyCheckHistory] = useState<DailyCheckRecord[]>([]);
  const [repairHistory, setRepairHistory] = useState<RepairRecord[]>([]);
  const [shotHistory, setShotHistory] = useState<ShotRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({});
  const [showUserModal, setShowUserModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<'mold' | 'product' | null>(null);

  // 정기점검 주기 정의
  const checkCycles: CheckCycle[] = [
    {
      level: '1차 정기점검',
      shotCount: 100000,
      description: '기본 외관, 냉각라인, 게이트 확인',
      items: ['금형 외관', '냉각라인', '게이트 확인']
    },
    {
      level: '2차 정기점검',
      shotCount: 500000,
      description: '캐비티·코어, 마모, 슬라이드·에젝터 점검',
      items: ['캐비티/코어', '마모 점검', '슬라이드', '에젝터']
    },
    {
      level: '3차 정기점검',
      shotCount: 1000000,
      description: '전체 분해 점검, 주요 부품 교체 판단',
      items: ['전체 분해', '주요 부품 교체']
    }
  ];


  useEffect(() => {
    fetchMoldData();
  }, [moldId]);

  useEffect(() => {
    if (moldData) {
      fetchNotifications();
    }
  }, [moldData]);

  const fetchMoldData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('qr_session_token');
      console.log('QR 세션 토큰:', token ? '존재함' : '없음');

      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`금형 정보를 불러올 수 없습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log('금형 데이터 로드 성공:', data);
      
      // Add default images if not present - 범퍼 테스트 이미지
      if (!data.images) {
        data.images = {
          moldImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop', // 금형 제작 이미지
          productImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop', // 자동차 범퍼 이미지
          thumbnails: {
            moldThumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=150&fit=crop',
            productThumbnail: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=150&fit=crop'
          }
        };
      }
      
      setMoldData(data);
    } catch (error) {
      console.error('Mold data fetch error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_use': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'urgent_repair': return 'bg-red-100 text-red-800';
      case 'repair_needed': return 'bg-orange-100 text-orange-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'end_of_life': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_use': return '사용중';
      case 'maintenance': return '점검중';
      case 'urgent_repair': return '긴급수리';
      case 'repair_needed': return '수리필요';
      case 'new': return '신규';
      case 'end_of_life': return '수명종료';
      default: return '알 수 없음';
    }
  };

  // formatDate 함수 (향후 사용 예정)
  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('ko-KR', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric'
  //   });
  // };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageUpload = async (type: 'mold' | 'product', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(type);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('moldId', moldId || '');
      formData.append('imageType', type);

      // TODO: Replace with actual API endpoint
      // const response = await fetch('http://localhost:5001/api/mold/upload-image', {
      //   method: 'POST',
      //   body: formData
      // });

      // For now, create a local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        
        if (moldData) {
          const currentImages = moldData.images || { moldImage: '', productImage: '', thumbnails: { moldThumbnail: '', productThumbnail: '' } };
          setMoldData({
            ...moldData,
            images: {
              moldImage: type === 'mold' ? imageUrl : (currentImages.moldImage || ''),
              productImage: type === 'product' ? imageUrl : (currentImages.productImage || ''),
              thumbnails: {
                moldThumbnail: type === 'mold' ? imageUrl : (currentImages.thumbnails?.moldThumbnail || ''),
                productThumbnail: type === 'product' ? imageUrl : (currentImages.thumbnails?.productThumbnail || '')
              }
            }
          });
        }

        alert(`${type === 'mold' ? '금형' : '제품'} 이미지가 업로드되었습니다.`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(null);
      // Reset input
      event.target.value = '';
    }
  };

  const fetchDailyCheckHistory = async () => {
    setHistoryLoading(true);
    try {
      // TODO: API 호출로 실제 데이터 가져오기
      // const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/daily-checks`);
      // const data = await response.json();
      
      // 임시 더미 데이터
      const dummyData: DailyCheckRecord[] = [
        {
          id: 1,
          date: new Date().toISOString(),
          inspector: '김작업',
          status: 'completed',
          items: ['외관 점검', '작동 확인', '청소 완료'],
          notes: '정상 작동 중'
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000).toISOString(),
          inspector: '이작업',
          status: 'completed',
          items: ['외관 점검', '작동 확인'],
          notes: '이상 없음'
        }
      ];
      setDailyCheckHistory(dummyData);
    } catch (error) {
      console.error('일상점검 이력 조회 실패:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchRepairHistory = async () => {
    setHistoryLoading(true);
    try {
      // TODO: API 호출로 실제 데이터 가져오기
      const dummyData: RepairRecord[] = [
        {
          id: 1,
          date: new Date(Date.now() - 172800000).toISOString(),
          requester: '김작업',
          status: 'completed',
          issue: '냉각수 누수',
          priority: 'high'
        },
        {
          id: 2,
          date: new Date(Date.now() - 604800000).toISOString(),
          requester: '박작업',
          status: 'in_progress',
          issue: '사출 압력 불안정',
          priority: 'medium'
        }
      ];
      setRepairHistory(dummyData);
    } catch (error) {
      console.error('수리요청 이력 조회 실패:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchShotHistory = async () => {
    setHistoryLoading(true);
    try {
      // TODO: API 호출로 실제 데이터 가져오기
      const dummyData: ShotRecord[] = [
        {
          id: 1,
          date: new Date().toISOString(),
          recorder: '김작업',
          previousCount: 45000,
          newCount: 45500,
          difference: 500
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000).toISOString(),
          recorder: '이작업',
          previousCount: 44500,
          newCount: 45000,
          difference: 500
        }
      ];
      setShotHistory(dummyData);
    } catch (error) {
      console.error('타수기록 이력 조회 실패:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryView = (type: HistoryViewType) => {
    setHistoryView(type);
    if (type === 'daily') {
      fetchDailyCheckHistory();
    } else if (type === 'repair') {
      fetchRepairHistory();
    } else if (type === 'shot') {
      fetchShotHistory();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRepairStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchNotifications = async () => {
    try {
      // TODO: API 호출로 실제 알림 데이터 가져오기
      // const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/notifications`);
      // const data = await response.json();
      
      // 임시 더미 알림 데이터
      const dummyNotifications: Notification[] = [];
      
      // 점검 알림 생성 (다음 점검일이 3일 이내면 알림)
      if (moldData) {
        const nextMaintenanceDate = new Date(moldData.nextMaintenance);
        const today = new Date();
        const daysUntilMaintenance = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilMaintenance <= 3 && daysUntilMaintenance >= 0) {
          dummyNotifications.push({
            id: 1,
            type: 'maintenance',
            title: '점검 예정',
            message: `${daysUntilMaintenance}일 후 정기 점검이 예정되어 있습니다.`,
            priority: daysUntilMaintenance <= 1 ? 'high' : 'medium',
            date: new Date().toISOString(),
            isRead: false
          });
        }
        
        // 샷수 기반 정기점검 알림
        const currentShot = moldData.shotCount;
        
        // 각 점검 주기별로 알림 생성
        checkCycles.forEach((cycle, index) => {
          const remainingShots = cycle.shotCount - (currentShot % cycle.shotCount);
          const shotPercentage = ((currentShot % cycle.shotCount) / cycle.shotCount) * 100;
          
          // 95% 도달 시 긴급 알림
          if (shotPercentage >= 95) {
            dummyNotifications.push({
              id: 10 + index * 2,
              type: 'maintenance',
              title: `${cycle.level} 긴급`,
              message: `${cycle.level}이 임박했습니다! (남은 샷수: ${remainingShots.toLocaleString()}회)`,
              priority: 'high',
              date: new Date().toISOString(),
              isRead: false
            });
          }
          // 90% 도달 시 일반 알림
          else if (shotPercentage >= 90) {
            dummyNotifications.push({
              id: 10 + index * 2 + 1,
              type: 'maintenance',
              title: `${cycle.level} 예정`,
              message: `${cycle.level}이 다가오고 있습니다. (남은 샷수: ${remainingShots.toLocaleString()}회)`,
              priority: 'medium',
              date: new Date().toISOString(),
              isRead: false
            });
          }
        });
        
        // 샷수 알림 (90% 이상이면 알림)
        const shotPercentage = (moldData.shotCount / moldData.maxShotCount) * 100;
        if (shotPercentage >= 90) {
          dummyNotifications.push({
            id: 2,
            type: 'shot',
            title: '샷수 임계치 도달',
            message: `현재 샷수가 ${shotPercentage.toFixed(1)}%에 도달했습니다. 교체를 고려하세요.`,
            priority: shotPercentage >= 95 ? 'high' : 'medium',
            date: new Date().toISOString(),
            isRead: false
          });
        }
      }
      
      // 기타 알림 예시
      dummyNotifications.push({
        id: 3,
        type: 'warning',
        title: '작동 온도 주의',
        message: '금형 온도가 설정값보다 5도 높습니다.',
        priority: 'medium',
        date: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      });
      
      setNotifications(dummyNotifications);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return Clock;
      case 'repair': return Wrench;
      case 'shot': return TrendingUp;
      case 'warning': return AlertTriangle;
      default: return Bell;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-50 to-orange-50 border-red-200';
      case 'medium': return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'low': return 'from-blue-50 to-indigo-50 border-blue-200';
      default: return 'from-slate-50 to-gray-50 border-slate-200';
    }
  };

  const getNotificationIconColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-amber-600';
      case 'low': return 'from-blue-500 to-indigo-600';
      default: return 'from-slate-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">금형 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">오류 발생</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchMoldData}
              className="w-full btn-primary"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate('/worker/scan')}
              className="w-full btn-secondary"
            >
              QR 스캔으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!moldData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="sticky top-0 z-40 bg-gradient-to-br from-slate-50/95 via-blue-50/95 to-indigo-50/95 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="p-3 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{moldData.moldId}</h1>
                  <p className="text-sm text-slate-600 font-medium">{moldData.name}</p>
                </div>
              </div>
              
              {/* 상단 메뉴 */}
              <div className="flex items-center gap-2">
                {/* 금형정보 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setExpandedMenus(prev => ({...prev, moldInfo: !prev.moldInfo}))}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 transition-all duration-200"
                >
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">금형정보</span>
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                </button>
                
                {expandedMenus.moldInfo && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                    {/* 금형개발 - 중첩 메뉴 */}
                    <div className="relative">
                      <button
                        onClick={() => setExpandedMenus(prev => ({...prev, moldDevelopment: !prev.moldDevelopment}))}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700 flex items-center justify-between"
                      >
                        <span>금형개발</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      
                      {expandedMenus.moldDevelopment && (
                        <div className="bg-slate-50 border-l-2 border-blue-300">
                          <button
                            onClick={() => {
                              navigate(`/worker/mold/${moldId}/development-progress`);
                              setExpandedMenus({});
                            }}
                            className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-600"
                          >
                            개발계획
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/worker/mold/${moldId}/mold-checklist`);
                              setExpandedMenus({});
                            }}
                            className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-600"
                          >
                            금형 체크리스트
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/worker/mold/${moldId}/mold-nurturing`);
                              setExpandedMenus({});
                            }}
                            className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-600"
                          >
                            금형육성
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/worker/mold/${moldId}/hardness-measurement`);
                              setExpandedMenus({});
                            }}
                            className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-600"
                          >
                            경도측정
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/manufacturing-specs`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      금형사양
                    </button>
                  </div>
                )}
              </div>

              {/* 사출정보 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setExpandedMenus(prev => ({...prev, injectionConditions: !prev.injectionConditions}))}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200 transition-all duration-200"
                >
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">사출정보</span>
                  <ChevronDown className="h-4 w-4 text-orange-600" />
                </button>
                
                {expandedMenus.injectionConditions && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/injection-conditions`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      사출조건 관리
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/injection-conditions-input`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      사출조건 수정관리
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/injection-revision`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      리비전관리
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/injection-change-history`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      변경이력 현황표
                    </button>
                  </div>
                )}
              </div>

              {/* 금형수리 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setExpandedMenus(prev => ({...prev, moldRepair: !prev.moldRepair}))}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200 transition-all duration-200"
                >
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">금형수리</span>
                  <ChevronDown className="h-4 w-4 text-orange-600" />
                </button>
                
                {expandedMenus.moldRepair && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/repair-request`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      수리요청
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/repair-inspection`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      금형수리 현황표
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/repair-progress`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      금형수리 진행현황
                    </button>
                  </div>
                )}
              </div>

              {/* 금형점검 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setExpandedMenus(prev => ({...prev, moldCheck: !prev.moldCheck}))}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200 transition-all duration-200"
                >
                  <ClipboardList className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">금형점검</span>
                  <ChevronDown className="h-4 w-4 text-green-600" />
                </button>
                
                {expandedMenus.moldCheck && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                          {/* 일상점검 - 2단계 메뉴 */}
                          <div>
                            <button
                              onClick={() => setExpandedMenus(prev => ({...prev, dailyCheck: !prev.dailyCheck}))}
                              className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-700 flex items-center justify-between"
                            >
                              <span>일상점검</span>
                              <ChevronRight className={`h-3 w-3 text-slate-400 transition-transform ${expandedMenus.dailyCheck ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedMenus.dailyCheck && (
                              <div className="bg-slate-100 py-1">
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/daily-check`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  일상점검
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/daily-check-status`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  일상점검 현황표
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* 정기점검 - 2단계 메뉴 */}
                          <div>
                            <button
                              onClick={() => setExpandedMenus(prev => ({...prev, periodicCheck: !prev.periodicCheck}))}
                              className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-700 flex items-center justify-between"
                            >
                              <span>정기점검</span>
                              <ChevronRight className={`h-3 w-3 text-slate-400 transition-transform ${expandedMenus.periodicCheck ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedMenus.periodicCheck && (
                              <div className="bg-slate-100 py-1">
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/periodic-check`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  정기점검
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/periodic-check-status`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  정기점검 현황표
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* 습합점검 - 2단계 메뉴 */}
                          <div>
                            <button
                              onClick={() => setExpandedMenus(prev => ({...prev, lubrication: !prev.lubrication}))}
                              className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-700 flex items-center justify-between"
                            >
                              <span>습합점검</span>
                              <ChevronRight className={`h-3 w-3 text-slate-400 transition-transform ${expandedMenus.lubrication ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedMenus.lubrication && (
                              <div className="bg-slate-100 py-1">
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/lubrication`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  습합점검
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/lubrication-status`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  습합점검 현황표
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* 세척점검 - 2단계 메뉴 */}
                          <div>
                            <button
                              onClick={() => setExpandedMenus(prev => ({...prev, cleaning: !prev.cleaning}))}
                              className="w-full px-8 py-2 text-left hover:bg-white text-sm text-slate-700 flex items-center justify-between"
                            >
                              <span>세척점검</span>
                              <ChevronRight className={`h-3 w-3 text-slate-400 transition-transform ${expandedMenus.cleaning ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedMenus.cleaning && (
                              <div className="bg-slate-100 py-1">
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/cleaning`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  세척점검
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/worker/mold/${moldId}/cleaning-status`);
                                    setExpandedMenus({});
                                  }}
                                  className="w-full px-12 py-2 text-left hover:bg-white text-sm text-slate-600"
                                >
                                  세척점검 현황표
                                </button>
                              </div>
                            )}
                          </div>
                  </div>
                )}
              </div>

              {/* 금형이관 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setExpandedMenus(prev => ({...prev, moldTransfer: !prev.moldTransfer}))}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl border border-purple-200 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">금형이관</span>
                  <ChevronDown className="h-4 w-4 text-purple-600" />
                </button>
                
                {expandedMenus.moldTransfer && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/transfer-request`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      이관요청
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/transfer-status`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      이관현황
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/transfer-checklist`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      이관 체크리스트
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/worker/mold/${moldId}/transfer-approval`);
                        setExpandedMenus({});
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm text-slate-700"
                    >
                      승인
                    </button>
                  </div>
                )}
              </div>
              
              {/* 사용자 정보 */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 rounded-xl border border-slate-200 transition-all duration-200"
                >
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">내 정보</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowUserModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <User className="h-4 w-4" />
                      회원정보 관리
                    </button>
                    <button
                      onClick={() => {
                        setShowUserModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <Lock className="h-4 w-4" />
                      비밀번호 변경
                    </button>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('qr_session_token');
                        navigate('/');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mold Image */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">금형 이미지</h3>
            </div>
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border-2 border-slate-300 flex items-center justify-center">
              {moldData.images?.moldImage ? (
                <img 
                  src={moldData.images.moldImage} 
                  alt="금형 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <Camera className="h-16 w-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">금형 이미지가 없습니다</p>
                  <p className="text-sm text-slate-500 mt-1">이미지를 업로드해주세요</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('mold', e)}
                  className="hidden"
                  disabled={uploadingImage !== null}
                />
                <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg text-center">
                  <Camera className="inline-block h-4 w-4 mr-2" />
                  {uploadingImage === 'mold' ? '업로드 중...' : '이미지 업로드'}
                </div>
              </label>
              {moldData.images?.moldImage && (
                <button 
                  onClick={() => window.open(moldData.images?.moldImage, '_blank')}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium text-sm"
                  title="이미지 크게 보기"
                >
                  <Eye className="inline-block h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Product Image */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">제품 이미지</h3>
            </div>
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border-2 border-slate-300 flex items-center justify-center">
              {moldData.images?.productImage ? (
                <img 
                  src={moldData.images.productImage} 
                  alt="제품 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <Camera className="h-16 w-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">제품 이미지가 없습니다</p>
                  <p className="text-sm text-slate-500 mt-1">이미지를 업로드해주세요</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('product', e)}
                  className="hidden"
                  disabled={uploadingImage !== null}
                />
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg text-center">
                  <Camera className="inline-block h-4 w-4 mr-2" />
                  {uploadingImage === 'product' ? '업로드 중...' : '이미지 업로드'}
                </div>
              </label>
              {moldData.images?.productImage && (
                <button 
                  onClick={() => window.open(moldData.images?.productImage, '_blank')}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium text-sm"
                  title="이미지 크게 보기"
                >
                  <Eye className="inline-block h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 현재상태, 위치, 샷수진행률, 담당자 - 한 줄 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 현재 상태 */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">현재 상태</p>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(moldData.status)}`}>
                  {getStatusText(moldData.status)}
                </span>
              </div>
            </div>

            {/* 위치 */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">위치</p>
                <p className="text-lg font-bold text-blue-600">{moldData.location}</p>
              </div>
            </div>

            {/* 샷수 진행률 */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 mb-1">샷수 진행률</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                      style={{ width: `${(moldData.shotCount / moldData.maxShotCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{((moldData.shotCount / moldData.maxShotCount) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* 담당자 */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">담당자</p>
                <p className="text-lg font-bold text-orange-600">{moldData.manager}</p>
              </div>
            </div>
          </div>
        </div>


        {/* 금형관리 알림, 금형점검 바로가기 - 한 줄 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 금형관리 알림 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">금형관리 알림</h3>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {notifications.slice(0, 3).map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className={`p-3 bg-gradient-to-r ${getNotificationColor(notification.priority)} rounded-lg border text-sm`}>
                        <div className="flex items-start gap-2">
                          <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                            <p className="text-xs text-slate-700">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">알림이 없습니다</p>
              )}
            </div>

            {/* 금형점검 바로가기 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">금형점검 바로가기</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/worker/mold/${moldId}/daily-check`)}
                  className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 transition-all"
                >
                  <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">일상점검</p>
                </button>
                <button
                  onClick={() => navigate(`/worker/mold/${moldId}/periodic-check`)}
                  className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-lg border border-purple-200 transition-all"
                >
                  <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">정기점검</p>
                </button>
                <button
                  onClick={() => navigate(`/worker/mold/${moldId}/lubrication`)}
                  className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-lg border border-teal-200 transition-all"
                >
                  <Droplet className="h-5 w-5 text-teal-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">습합점검</p>
                </button>
                <button
                  onClick={() => navigate(`/worker/mold/${moldId}/cleaning`)}
                  className="p-3 bg-gradient-to-br from-cyan-50 to-sky-50 hover:from-cyan-100 hover:to-sky-100 rounded-lg border border-cyan-200 transition-all"
                >
                  <Activity className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">세척점검</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 사출조건 관리 - 한 줄 */}
        {moldData?.injectionConditions && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                  <Thermometer className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900">사출조건 관리</h3>
              </div>
              <button
                onClick={() => navigate(`/worker/mold/${moldId}/injection-conditions`)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 text-sm font-medium"
              >
                상세보기
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100">
                <p className="text-xs font-semibold text-red-600 mb-1">사출온도</p>
                <p className="text-sm font-bold text-red-700">{moldData.injectionConditions.injectionTemperature}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-1">사출압력</p>
                <p className="text-sm font-bold text-blue-700">{moldData.injectionConditions.injectionPressure}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <p className="text-xs font-semibold text-green-600 mb-1">사출속도</p>
                <p className="text-sm font-bold text-green-700">{moldData.injectionConditions.injectionSpeed}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                <p className="text-xs font-semibold text-purple-600 mb-1">사이클타임</p>
                <p className="text-sm font-bold text-purple-700">{moldData.injectionConditions.cycleTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* 금형사양 - 한 줄 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900">금형사양</h3>
            </div>
            <button
              onClick={() => navigate(`/worker/mold/${moldId}/manufacturing-specs`)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 text-sm font-medium"
            >
              상세보기
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 mb-1">재질</p>
              <p className="text-sm font-bold text-blue-800">{moldData.specifications.material}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <p className="text-xs font-semibold text-purple-600 mb-1">중량</p>
              <p className="text-sm font-bold text-purple-800">{moldData.specifications.weight}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <p className="text-xs font-semibold text-green-600 mb-1">치수</p>
              <p className="text-sm font-bold text-green-800">{moldData.specifications.dimensions}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <p className="text-xs font-semibold text-orange-600 mb-1">캐비티</p>
              <p className="text-sm font-bold text-orange-800">{moldData.specifications.cavities}개</p>
            </div>
          </div>
        </div>

        {/* 금형수리 진행현황 - 한 줄 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900">금형수리 진행현황</h3>
            </div>
            <button
              onClick={() => navigate(`/worker/mold/${moldId}/repair-progress`)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 text-sm font-medium"
            >
              상세보기
            </button>
          </div>
          <div className="relative">
            {/* 진행 바 배경 */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
            
            {/* 단계 */}
            <div className="relative flex justify-between">
              {/* 1단계: 요청접수 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center shadow-lg z-10">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-orange-600 mt-2">요청접수</p>
              </div>

              {/* 2단계: 작업배정 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-lg z-10">
                  <User className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-blue-600 mt-2">작업배정</p>
              </div>

              {/* 3단계: 수리진행 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-lg z-10">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-gray-600 mt-2">수리진행</p>
              </div>

              {/* 4단계: 검수완료 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-lg z-10">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <p className="text-xs font-bold text-gray-600 mt-2">검수완료</p>
              </div>

              {/* 5단계: 최종승인 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-lg z-10">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                <p className="text-xs font-bold text-gray-600 mt-2">최종승인</p>
              </div>
            </div>
          </div>
        </div>

        {/* 기존 사이드바 섹션 모두 삭제 */}
        <div className="hidden">
          {/* 삭제된 섹션들 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              {false && notifications.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg relative">
                      <Bell className="h-4 w-4 text-white" />
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                          {notifications.filter(n => !n.isRead).length}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">알림</h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 bg-gradient-to-r ${getNotificationColor(notification.priority)} rounded-lg border transition-all duration-200 hover:shadow-md`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`p-1.5 bg-gradient-to-br ${getNotificationIconColor(notification.priority)} rounded-lg flex-shrink-0 mt-0.5`}>
                              <IconComponent className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-xs font-bold text-slate-900 leading-tight">{notification.title}</p>
                                {notification.priority === 'high' && (
                                  <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-xs font-bold flex-shrink-0">
                                    긴급
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 leading-snug mb-1">{notification.message}</p>
                              <p className="text-xs text-slate-500">{formatDateTime(notification.date)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 금형 수리 진행현황 */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">금형 수리 진행현황</h3>
                </div>

                {/* 진행 단계 표시 */}
                <div className="relative">
                  {/* 진행 바 배경 */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                  
                  {/* 단계 */}
                  <div className="relative flex justify-between">
                    {/* 1단계: 생산처 신고 */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-orange-600">생산처 신고</p>
                        <p className="text-xs text-gray-500">문제 발생</p>
                        <p className="text-xs text-orange-600 font-semibold mt-1">완료</p>
                      </div>
                    </div>

                    {/* 2단계: 협력사 출고 */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-blue-600">협력사 출고</p>
                        <p className="text-xs text-gray-500">수리처 이동</p>
                        <p className="text-xs text-blue-600 font-semibold mt-1">진행중</p>
                      </div>
                    </div>

                    {/* 3단계: 수리처 수리 */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-gray-600">수리처 수리</p>
                        <p className="text-xs text-gray-500">수리 작업</p>
                        <p className="text-xs text-gray-500 font-semibold mt-1">대기중</p>
                      </div>
                    </div>

                    {/* 4단계: 협력사 입고 */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-sm">4</span>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-gray-600">협력사 입고</p>
                        <p className="text-xs text-gray-500">검수 완료</p>
                        <p className="text-xs text-gray-500 font-semibold mt-1">대기중</p>
                      </div>
                    </div>

                    {/* 5단계: 생산처 확인 */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center shadow-lg z-10">
                        <span className="text-white font-bold text-sm">5</span>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-gray-600">생산처 확인</p>
                        <p className="text-xs text-gray-500">최종 승인</p>
                        <p className="text-xs text-gray-500 font-semibold mt-1">대기중</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 현재 상태 정보 */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-900 mb-1">현재 진행 상태</p>
                      <p className="text-xs text-blue-700">협력사로 출고 중입니다. 예상 도착: 2024-11-07</p>
                      <p className="text-xs text-blue-600 mt-1">담당자: 김철수 (010-1234-5678)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 작업 액션 버튼 - 한 줄 배치 */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-3">작업 메뉴</h3>
                <div className="grid grid-cols-3 gap-2">
                  {/* 일상점검 */}
                  <button
                    onClick={() => navigate(`/worker/mold/${moldId}/daily-check`)}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900">일상점검</p>
                      <p className="text-xs text-slate-600">Daily Check</p>
                    </div>
                  </button>

                  {/* 수리요청 */}
                  <button
                    onClick={() => navigate(`/worker/mold/${moldId}/repair-request`)}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-xl border border-red-200 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900">수리요청</p>
                      <p className="text-xs text-slate-600">Repair</p>
                    </div>
                  </button>

                  {/* 정기점검 */}
                  <button
                    onClick={() => navigate(`/worker/mold/${moldId}/periodic-check`)}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl border border-purple-200 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900">정기점검</p>
                      <p className="text-xs text-slate-600">Periodic</p>
                    </div>
                  </button>

                  {/* 습합 세척 관리 */}
                  <button
                    onClick={() => navigate(`/worker/mold/${moldId}/cleaning-lubrication`)}
                    className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-xl border border-teal-200 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-900">습합세척</p>
                      <p className="text-xs text-slate-600">Clean/Lube</p>
                    </div>
                  </button>
                </div>
                
                {/* 타수 자동관리 안내 */}
                <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-800">
                      <span className="font-bold">타수 자동관리:</span> 일상점검 시 누적타수가 자동으로 기록됩니다
                    </p>
                  </div>
                </div>
              </div>

              {/* 사출조건 - Compact */}
              {moldData?.injectionConditions && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">사출조건</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border border-red-100">
                      <p className="text-xs font-semibold text-red-600 mb-0.5">온도</p>
                      <p className="text-xs font-bold text-red-700">{moldData.injectionConditions.injectionTemperature}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-600 mb-0.5">압력</p>
                      <p className="text-xs font-bold text-blue-700">{moldData.injectionConditions.injectionPressure}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <p className="text-xs font-semibold text-green-600 mb-0.5">속도</p>
                      <p className="text-xs font-bold text-green-700">{moldData.injectionConditions.injectionSpeed}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-semibold text-purple-600 mb-0.5">사이클</p>
                      <p className="text-xs font-bold text-purple-700">{moldData.injectionConditions.cycleTime}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 작업 이력 조회 */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">작업 이력 조회</h3>
                </div>
                <div className="space-y-2">
                  {/* 일상점검 이력 */}
                  <button 
                    className="w-full p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 transition-all duration-200 text-left group"
                    onClick={() => handleHistoryView('daily')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">일상점검 이력</span>
                      </div>
                      <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 ml-6">점검 기록 조회</p>
                  </button>

                  {/* 수리요청 이력 */}
                  <button 
                    className="w-full p-2.5 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-lg border border-red-200 transition-all duration-200 text-left group"
                    onClick={() => handleHistoryView('repair')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-slate-900">수리요청 이력</span>
                      </div>
                      <span className="text-xs text-red-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 ml-6">수리 내역 조회</p>
                  </button>

                  {/* 타수기록 이력 */}
                  <button 
                    className="w-full p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg border border-green-200 transition-all duration-200 text-left group"
                    onClick={() => handleHistoryView('shot')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-900">타수기록 이력</span>
                      </div>
                      <span className="text-xs text-green-600 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 ml-6">타수 변경 내역</p>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 이력 조회 모달 */}
      {historyView && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {historyView === 'daily' && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">일상점검 이력</h3>
                  </>
                )}
                {historyView === 'repair' && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">수리요청 이력</h3>
                  </>
                )}
                {historyView === 'shot' && (
                  <>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">타수기록 이력</h3>
                  </>
                )}
              </div>
              <button
                onClick={() => setHistoryView(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* 일상점검 이력 */}
                  {historyView === 'daily' && (
                    <div className="space-y-3">
                      {dailyCheckHistory.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">이력이 없습니다.</p>
                      ) : (
                        dailyCheckHistory.map((record) => (
                          <div key={record.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900 mb-1">점검일: {formatDateTime(record.date)}</p>
                                <p className="text-xs text-slate-600">점검자: {record.inspector}</p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                완료
                              </span>
                            </div>
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-slate-700 mb-1">점검 항목:</p>
                              <div className="flex flex-wrap gap-1">
                                {record.items.map((item, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-white text-blue-700 rounded text-xs border border-blue-200">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {record.notes && (
                              <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded border border-blue-100">
                                메모: {record.notes}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 수리요청 이력 */}
                  {historyView === 'repair' && (
                    <div className="space-y-3">
                      {repairHistory.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">이력이 없습니다.</p>
                      ) : (
                        repairHistory.map((record) => (
                          <div key={record.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900 mb-1">요청일: {formatDateTime(record.date)}</p>
                                <p className="text-xs text-slate-600">요청자: {record.requester}</p>
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                                  {record.priority === 'high' ? '높음' : record.priority === 'medium' ? '보통' : '낮음'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRepairStatusColor(record.status)}`}>
                                  {record.status === 'completed' ? '완료' : record.status === 'in_progress' ? '진행중' : '대기'}
                                </span>
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-red-100">
                              <p className="text-xs font-semibold text-slate-700 mb-1">문제 내용:</p>
                              <p className="text-sm text-slate-900">{record.issue}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 타수기록 이력 */}
                  {historyView === 'shot' && (
                    <div className="space-y-3">
                      {shotHistory.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">이력이 없습니다.</p>
                      ) : (
                        shotHistory.map((record) => (
                          <div key={record.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900 mb-1">기록일: {formatDateTime(record.date)}</p>
                                <p className="text-xs text-slate-600">기록자: {record.recorder}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                record.difference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {record.difference > 0 ? '+' : ''}{record.difference.toLocaleString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white p-2 rounded-lg border border-green-100 text-center">
                                <p className="text-xs text-slate-600 mb-1">이전 타수</p>
                                <p className="text-sm font-bold text-slate-900">{record.previousCount.toLocaleString()}</p>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-green-100 text-center">
                                <p className="text-xs text-slate-600 mb-1">현재 타수</p>
                                <p className="text-sm font-bold text-green-700">{record.newCount.toLocaleString()}</p>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-green-100 text-center">
                                <p className="text-xs text-slate-600 mb-1">증가량</p>
                                <p className="text-sm font-bold text-blue-700">{record.difference.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사용자 정보 관리 모달 */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">회원정보 관리</h3>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">아이디</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <User className="h-4 w-4 text-slate-500" />
                  <input type="text" defaultValue="worker01" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input type="email" defaultValue="worker@example.com" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">연락처</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <input type="tel" defaultValue="010-1234-5678" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">비밀번호 변경</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input type="password" placeholder="새 비밀번호" className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all">
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoldInfo;
