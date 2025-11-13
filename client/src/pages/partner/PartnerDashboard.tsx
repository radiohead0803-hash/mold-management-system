import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode,
  Camera,
  MapPin,
  Bell,
  Settings,
  Wrench,
  CheckCircle,
  Calendar,
  AlertCircle,
  Clock,
  User,
  Building,
  Phone
} from 'lucide-react';

interface MoldData {
  id: number;
  moldId: string;
  name: string;
  location: string;
  status: string;
  shotCount: number;
  maxShotCount: number;
  lastMaintenance: string;
  nextMaintenance: string;
  manager: string;
  partner: string;
  partnerContact: string;
}

interface Notification {
  id: number;
  type: 'inspection' | 'maintenance' | 'repair';
  moldId: string;
  moldName: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  isRead: boolean;
}

interface InspectionNotification {
  moldId: string;
  moldName: string;
  currentShotCount: number;
  maxShotCount: number;
  inspectionType: 'shot_count' | 'scheduled' | 'manual';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  partnerInfo: {
    name: string;
    contact: string;
    email?: string;
  };
}

interface PartnerInfo {
  name: string;
  contact: string;
  email: string;
  address: string;
}

interface WorkHistoryItem {
  id: string;
  type: 'repair' | 'inspection' | 'daily';
  moldId: string;
  moldName: string;
  technician: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
}

const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [scannedMold, setScannedMold] = useState<MoldData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<InspectionNotification | null>(null);
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [loadingWorkHistory, setLoadingWorkHistory] = useState(false);
  const [partnerInfo] = useState<PartnerInfo>({
    name: '정밀금형 주식회사',
    contact: '02-1234-5678',
    email: 'contact@precision-mold.co.kr',
    address: '경기도 안산시 단원구 공단로 123'
  });

  useEffect(() => {
    loadNotifications();
    loadWorkHistory();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/partner/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
    }
  };

  const loadWorkHistory = async () => {
    setLoadingWorkHistory(true);
    try {
      const response = await fetch('/api/partner/work-history?limit=8');
      if (response.ok) {
        const data = await response.json();
        setWorkHistory(data);
      } else {
        setWorkHistory([
          { id: 'w1', type: 'repair', moldId: 'M-2024-001', moldName: '스마트폰 케이스', technician: '김기술', date: new Date().toISOString(), status: 'completed' },
          { id: 'w2', type: 'daily', moldId: 'M-2024-002', moldName: '자동차 부품', technician: '이점검', date: new Date(Date.now() - 86400000).toISOString(), status: 'in_progress' },
          { id: 'w3', type: 'inspection', moldId: 'M-2024-003', moldName: '플라스틱 용기', technician: '박기사', date: new Date(Date.now() - 2*86400000).toISOString(), status: 'pending' }
        ]);
      }
    } catch (e) {
      setWorkHistory([
        { id: 'w1', type: 'repair', moldId: 'M-2024-001', moldName: '스마트폰 케이스', technician: '김기술', date: new Date().toISOString(), status: 'completed' },
        { id: 'w2', type: 'daily', moldId: 'M-2024-002', moldName: '자동차 부품', technician: '이점검', date: new Date(Date.now() - 86400000).toISOString(), status: 'in_progress' },
        { id: 'w3', type: 'inspection', moldId: 'M-2024-003', moldName: '플라스틱 용기', technician: '박기사', date: new Date(Date.now() - 2*86400000).toISOString(), status: 'pending' }
      ]);
    } finally {
      setLoadingWorkHistory(false);
    }
  };

  const simulateQRScan = async (moldId: string) => {
    setIsScanning(true);
    setError(null);
    
    // 특수 케이스 처리
    if (moldId === 'M-INVALID') {
      setTimeout(() => {
        setError('유효하지 않은 QR 코드입니다. 다시 스캔해주세요.');
        setIsScanning(false);
      }, 1500);
      return;
    }
    
    // 실제 구현에서는 카메라 API를 사용하여 QR 코드를 스캔
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/molds/${moldId}/partner-info`);
        if (!response.ok) {
          throw new Error('금형 정보를 찾을 수 없습니다.');
        }
        
        const moldData = await response.json();
        setScannedMold(moldData);
        
        // 상태별 알림 생성
        let shouldCreateNotification = false;
        let notificationData: InspectionNotification | null = null;
        
        // 샷수 기준 점검
        if (moldData.shotCount >= moldData.maxShotCount) {
          shouldCreateNotification = true;
          notificationData = {
            moldId: moldData.moldId,
            moldName: moldData.name,
            currentShotCount: moldData.shotCount,
            maxShotCount: moldData.maxShotCount,
            inspectionType: 'shot_count',
            priority: 'urgent',
            message: `🚨 긴급! ${moldData.moldId} 금형이 최대 샷수를 초과했습니다. 즉시 점검이 필요합니다.`,
            partnerInfo: {
              name: '정밀금형 주식회사',
              contact: '02-1234-5678'
            }
          };
        } else if (moldData.shotCount >= moldData.maxShotCount * 0.9) {
          shouldCreateNotification = true;
          notificationData = {
            moldId: moldData.moldId,
            moldName: moldData.name,
            currentShotCount: moldData.shotCount,
            maxShotCount: moldData.maxShotCount,
            inspectionType: 'scheduled',
            priority: 'high',
            message: `⚠️ ${moldData.moldId} 금형이 점검 기준에 근접했습니다. 점검 준비가 필요합니다.`,
            partnerInfo: {
              name: '정밀금형 주식회사',
              contact: '02-1234-5678'
            }
          };
        }
        
        // 상태별 추가 알림
        if (moldData.status === 'urgent_repair') {
          shouldCreateNotification = true;
          notificationData = {
            moldId: moldData.moldId,
            moldName: moldData.name,
            currentShotCount: moldData.shotCount,
            maxShotCount: moldData.maxShotCount,
            inspectionType: 'manual',
            priority: 'urgent',
            message: `🔧 긴급 수리 요청! ${moldData.moldId} 금형에 즉시 수리가 필요합니다.`,
            partnerInfo: {
              name: '정밀금형 주식회사',
              contact: '02-1234-5678'
            }
          };
        } else if (moldData.status === 'repair_needed') {
          shouldCreateNotification = true;
          notificationData = {
            moldId: moldData.moldId,
            moldName: moldData.name,
            currentShotCount: moldData.shotCount,
            maxShotCount: moldData.maxShotCount,
            inspectionType: 'manual',
            priority: 'high',
            message: `🔧 ${moldData.moldId} 금형에 수리가 필요합니다. 점검 후 수리 계획을 수립해주세요.`,
            partnerInfo: {
              name: '정밀금형 주식회사',
              contact: '02-1234-5678'
            }
          };
        } else if (moldData.status === 'end_of_life') {
          shouldCreateNotification = true;
          notificationData = {
            moldId: moldData.moldId,
            moldName: moldData.name,
            currentShotCount: moldData.shotCount,
            maxShotCount: moldData.maxShotCount,
            inspectionType: 'manual',
            priority: 'medium',
            message: `📋 ${moldData.moldId} 금형이 수명 종료 단계입니다. 교체 계획을 검토해주세요.`,
            partnerInfo: {
              name: '정밀금형 주식회사',
              contact: '02-1234-5678'
            }
          };
        } else if (moldData.status === 'new') {
          // 신규 금형의 경우 환영 메시지
          alert(`🎉 신규 금형 ${moldData.moldId}이 등록되었습니다! 첫 점검을 시작하세요.`);
        }
        
        if (shouldCreateNotification && notificationData) {
          setNotification(notificationData);
        }
        
      } catch (error) {
        console.error('QR 스캔 실패:', error);
        setError(error instanceof Error ? error.message : 'QR 스캔에 실패했습니다.');
      } finally {
        setIsScanning(false);
      }
    }, 2000);
  };

  const handleServiceSelect = (serviceType: 'repair' | 'daily' | 'inspection') => {
    if (!scannedMold) return;
    
    const routes = {
      repair: `/partner/mold/${scannedMold.moldId}/repair`,
      daily: `/partner/mold/${scannedMold.moldId}/daily-management`,
      inspection: `/partner/mold/${scannedMold.moldId}/inspection`
    };
    
    navigate(routes[serviceType]);
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/partner/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'repair': return <Wrench className="h-4 w-4" />;
      case 'inspection': return <Calendar className="h-4 w-4" />;
      case 'maintenance': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'repair': return '수리';
      case 'inspection': return '점검';
      case 'maintenance': return '유지보수';
      default: return type;
    }
  };

  const renderWorkHistory = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">담당자 작업 이력</h3>
        <span className="text-sm text-neutral-500">{workHistory.length}건</span>
      </div>
      {loadingWorkHistory ? (
        <div className="text-center py-8 text-neutral-500">불러오는 중...</div>
      ) : workHistory.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">작업 이력이 없습니다</div>
      ) : (
        <div className="divide-y divide-neutral-200">
          {workHistory.map((w) => (
            <div key={w.id} className="py-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  {w.type === 'repair' ? <Wrench className="h-4 w-4 text-neutral-600" /> : w.type === 'inspection' ? <Calendar className="h-4 w-4 text-neutral-600" /> : <CheckCircle className="h-4 w-4 text-neutral-600" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-900">{w.moldId} · {getTypeText(w.type)}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">{w.moldName} · 담당자 {w.technician}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${w.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : w.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{w.status === 'completed' ? '완료' : w.status === 'in_progress' ? '진행중' : '대기'}</div>
                <div className="text-xs text-neutral-500 mt-1">{new Date(w.date).toLocaleString('ko-KR')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQRScanner = () => (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center">
        <div className="mx-auto w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
          {isScanning ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          ) : (
            <QrCode className="h-16 w-16 text-blue-500" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          QR 코드를 스캔하세요
        </h3>
        <p className="text-neutral-600 mb-6">
          금형에 부착된 QR 코드를 카메라로 스캔하여 작업을 시작하세요
        </p>

        <button
          onClick={() => simulateQRScan('M-2024-001')}
          disabled={isScanning}
          className="btn-primary flex items-center gap-2 mx-auto mb-4"
        >
          <Camera className="h-4 w-4" />
          {isScanning ? '스캔 중...' : '카메라 시작'}
        </button>

        <div className="mt-6">
          <p className="text-sm text-neutral-500 mb-3">사용 방법</p>
          <div className="space-y-2 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm text-blue-800">금형에 부착된 QR 코드를 찾으세요</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm text-green-800">카메라를 QR 코드에 가까이 대세요</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm text-purple-800">자동으로 인식되면 작업을 시작합니다</span>
            </div>
          </div>
        </div>

        {/* 테스트용 QR 코드 버튼들 */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600 mb-3">테스트용 QR 코드</p>
          
          {/* 정상 상태 금형들 */}
          <div className="mb-4">
            <p className="text-xs text-green-600 font-medium mb-2">✅ 정상 상태 금형</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => simulateQRScan('M-2024-001')}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded text-xs border border-green-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-001</div>
                  <div className="text-xs opacity-75">스마트폰 케이스</div>
                  <div className="text-xs">95% 샷수</div>
                </div>
              </button>
              <button
                onClick={() => simulateQRScan('M-2024-002')}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded text-xs border border-green-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-002</div>
                  <div className="text-xs opacity-75">자동차 부품</div>
                  <div className="text-xs">80% 샷수</div>
                </div>
              </button>
            </div>
          </div>

          {/* 주의 상태 금형들 */}
          <div className="mb-4">
            <p className="text-xs text-orange-600 font-medium mb-2">⚠️ 주의 상태 금형</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => simulateQRScan('M-2024-003')}
                className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-xs border border-orange-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-003</div>
                  <div className="text-xs opacity-75">플라스틱 용기</div>
                  <div className="text-xs">점검 중</div>
                </div>
              </button>
              <button
                onClick={() => simulateQRScan('M-2024-004')}
                className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-xs border border-orange-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-004</div>
                  <div className="text-xs opacity-75">전자부품 하우징</div>
                  <div className="text-xs">90% 샷수</div>
                </div>
              </button>
            </div>
          </div>

          {/* 긴급 상태 금형들 */}
          <div className="mb-4">
            <p className="text-xs text-red-600 font-medium mb-2">🚨 긴급 상태 금형</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => simulateQRScan('M-2024-005')}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs border border-red-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-005</div>
                  <div className="text-xs opacity-75">의료기기 부품</div>
                  <div className="text-xs">105% 샷수</div>
                </div>
              </button>
              <button
                onClick={() => simulateQRScan('M-2024-006')}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs border border-red-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-006</div>
                  <div className="text-xs opacity-75">가전제품 외관</div>
                  <div className="text-xs">수리 필요</div>
                </div>
              </button>
            </div>
          </div>

          {/* 특수 테스트 케이스 */}
          <div className="mb-4">
            <p className="text-xs text-purple-600 font-medium mb-2">🔬 특수 테스트 케이스</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => simulateQRScan('M-2024-NEW')}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-xs border border-purple-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-NEW</div>
                  <div className="text-xs opacity-75">신규 금형</div>
                  <div className="text-xs">0% 샷수</div>
                </div>
              </button>
              <button
                onClick={() => simulateQRScan('M-2024-OLD')}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-xs border border-purple-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-2024-OLD</div>
                  <div className="text-xs opacity-75">노후 금형</div>
                  <div className="text-xs">200% 샷수</div>
                </div>
              </button>
              <button
                onClick={() => simulateQRScan('M-INVALID')}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs border border-gray-200"
              >
                <div className="text-center">
                  <div className="font-medium">M-INVALID</div>
                  <div className="text-xs opacity-75">잘못된 QR</div>
                  <div className="text-xs">오류 테스트</div>
                </div>
              </button>
            </div>
          </div>

          {/* 랜덤 테스트 버튼 */}
          <div className="text-center pt-2 border-t border-neutral-200">
            <button
              onClick={() => {
                const randomMolds = ['M-2024-001', 'M-2024-002', 'M-2024-003', 'M-2024-004', 'M-2024-005', 'M-2024-006'];
                const randomMold = randomMolds[Math.floor(Math.random() * randomMolds.length)];
                simulateQRScan(randomMold);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium"
            >
              🎲 랜덤 QR 스캔
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMoldInfo = () => {
    if (!scannedMold) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-neutral-900">스캔된 금형 정보</h3>
          <button
            onClick={() => setScannedMold(null)}
            className="btn-secondary text-sm"
          >
            다시 스캔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-neutral-900 mb-3">기본 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">금형 ID:</span>
                <span className="font-medium">{scannedMold.moldId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">금형명:</span>
                <span className="font-medium">{scannedMold.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">위치:</span>
                <span className="font-medium">{scannedMold.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">담당자:</span>
                <span className="font-medium">{scannedMold.manager}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-neutral-900 mb-3">상태 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">현재 샷수:</span>
                <span className="font-medium">{scannedMold.shotCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">최대 샷수:</span>
                <span className="font-medium">{scannedMold.maxShotCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">진행률:</span>
                <span className="font-medium">
                  {Math.round((scannedMold.shotCount / scannedMold.maxShotCount) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">마지막 점검:</span>
                <span className="font-medium">{scannedMold.lastMaintenance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-600">샷수 진행률</span>
            <span className="font-medium">
              {scannedMold.shotCount.toLocaleString()} / {scannedMold.maxShotCount.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                (scannedMold.shotCount / scannedMold.maxShotCount) >= 1 ? 'bg-red-500' :
                (scannedMold.shotCount / scannedMold.maxShotCount) >= 0.9 ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min((scannedMold.shotCount / scannedMold.maxShotCount) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* 서비스 선택 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleServiceSelect('repair')}
            className="p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors duration-150"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <Wrench className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="font-medium text-neutral-900 mb-1">금형 수리</h4>
              <p className="text-sm text-neutral-600">수리 작업 및 부품 교체</p>
            </div>
          </button>

          <button
            onClick={() => handleServiceSelect('daily')}
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-150"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-neutral-900 mb-1">일상 관리</h4>
              <p className="text-sm text-neutral-600">일상 점검 및 유지보수</p>
            </div>
          </button>

          <button
            onClick={() => handleServiceSelect('inspection')}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors duration-150"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-neutral-900 mb-1">정기 점검</h4>
              <p className="text-sm text-neutral-600">정기 점검 및 진단</p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          정기 점검 알림
        </h3>
        <span className="text-sm text-neutral-500">
          {notifications.filter(n => !n.isRead).length}개의 새 알림
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
            <p>새로운 알림이 없습니다</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors duration-150 ${
                notification.isRead 
                  ? 'bg-neutral-50 border-neutral-200' 
                  : `${getPriorityColor(notification.priority)} border-2`
              }`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-900">
                        {notification.moldId}
                      </span>
                      <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded">
                        {getTypeText(notification.type)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(notification.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPartnerInfo = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <Building className="h-5 w-5" />
        협력사 정보
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-neutral-500" />
          <div>
            <span className="text-sm text-neutral-600">업체명:</span>
            <span className="ml-2 font-medium">{partnerInfo.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-neutral-500" />
          <div>
            <span className="text-sm text-neutral-600">연락처:</span>
            <span className="ml-2 font-medium">{partnerInfo.contact}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-neutral-500" />
          <div>
            <span className="text-sm text-neutral-600">주소:</span>
            <span className="ml-2 font-medium">{partnerInfo.address}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">협력사 관리 시스템</h1>
                <p className="text-sm text-neutral-600">{partnerInfo.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-neutral-600" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
              <button className="p-2 hover:bg-neutral-100 rounded-lg">
                <Settings className="h-5 w-5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - QR Scanner & Mold Info */}
          <div className="lg:col-span-8 space-y-6">
            {!scannedMold ? renderQRScanner() : renderMoldInfo()}
          </div>

          {/* Right Column - Notifications & Partner Info */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">
            {renderNotifications()}
            {renderWorkHistory()}
            {renderPartnerInfo()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
