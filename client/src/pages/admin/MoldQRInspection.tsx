import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  QrCode,
  AlertCircle,
  X,
  CheckCircle,
  Send,
  Camera
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

const MoldQRInspection: React.FC = () => {
  const navigate = useNavigate();
  
  const [scannedMold, setScannedMold] = useState<MoldData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<InspectionNotification | null>(null);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // QR 코드 스캔 시뮬레이션 (실제로는 카메라 API 사용)
  const simulateQRScan = (moldId: string) => {
    setIsScanning(true);
    setError(null);
    
    // 실제 구현에서는 카메라 API를 사용하여 QR 코드를 스캔
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/molds/${moldId}/inspection-check`);
        if (!response.ok) {
          throw new Error('금형 정보를 찾을 수 없습니다.');
        }
        
        const moldData = await response.json();
        setScannedMold(moldData);
        
        // 점검 필요 여부 확인
        if (moldData.shotCount >= moldData.maxShotCount * 0.9) {
          const notificationData: InspectionNotification = {
            moldId: moldData.moldId,
            moldName: moldData.name,
            currentShotCount: moldData.shotCount,
            maxShotCount: moldData.maxShotCount,
            inspectionType: moldData.shotCount >= moldData.maxShotCount ? 'shot_count' : 'scheduled',
            priority: moldData.shotCount >= moldData.maxShotCount ? 'urgent' : 'high',
            message: `${moldData.moldId} 금형이 점검 기준에 도달했습니다. 현재 샷수: ${moldData.shotCount}/${moldData.maxShotCount}`,
            partnerInfo: {
              name: moldData.partner,
              contact: moldData.partnerContact
            }
          };
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

  const sendNotificationToPartner = async () => {
    if (!notification) return;
    
    setIsSendingNotification(true);
    try {
      const response = await fetch('/api/inspection-notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error('알림 전송에 실패했습니다.');
      }

      const result = await response.json();
      alert(`협력사 ${notification.partnerInfo.name}에 점검 알림이 전송되었습니다.`);
      
      // 점검 일정 자동 생성
      await createAutoSchedule();
      
    } catch (error) {
      console.error('알림 전송 실패:', error);
      setError(error instanceof Error ? error.message : '알림 전송에 실패했습니다.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const createAutoSchedule = async () => {
    if (!scannedMold) return;
    
    try {
      const scheduleData = {
        moldId: scannedMold.moldId,
        moldName: scannedMold.name,
        scheduleType: 'maintenance',
        scheduleName: `긴급 점검 - 샷수 기준 도달`,
        description: `${scannedMold.moldId} 금형이 최대 샷수에 도달하여 긴급 점검이 필요합니다.`,
        assignedTo: scannedMold.partner,
        department: 'maintenance',
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3일 후
        estimatedDuration: 4,
        priority: 'urgent',
        notes: `현재 샷수: ${scannedMold.shotCount}/${scannedMold.maxShotCount}`,
        recurring: false,
        recurringInterval: 1
      };

      const response = await fetch('/api/maintenance-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        console.log('자동 점검 일정이 생성되었습니다.');
      }
    } catch (error) {
      console.error('자동 일정 생성 실패:', error);
    }
  };

  const resetScan = () => {
    setScannedMold(null);
    setNotification(null);
    setError(null);
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900">금형 QR 점검</h1>
              <p className="text-neutral-600 mt-1">QR 코드를 스캔하여 점검 상태를 확인하세요</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">오류가 발생했습니다</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* QR 스캔 영역 */}
        {!scannedMold && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <div className="mx-auto w-32 h-32 bg-neutral-100 rounded-lg flex items-center justify-center mb-6">
                {isScanning ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                ) : (
                  <QrCode className="h-16 w-16 text-neutral-400" />
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {isScanning ? 'QR 코드 스캔 중...' : 'QR 코드를 스캔하세요'}
              </h3>
              <p className="text-neutral-600 mb-6">
                {isScanning ? '금형 정보를 확인하고 있습니다.' : '금형에 부착된 QR 코드를 카메라로 스캔하세요'}
              </p>

              {!isScanning && (
                <div className="space-y-4">
                  <button
                    onClick={() => simulateQRScan('M-2024-001')}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Camera className="h-4 w-4" />
                    QR 스캔 시작
                  </button>
                  
                  <div className="text-sm text-neutral-500">
                    <p>테스트용 QR 코드:</p>
                    <div className="flex gap-2 justify-center mt-2">
                      <button
                        onClick={() => simulateQRScan('M-2024-001')}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs"
                      >
                        M-2024-001
                      </button>
                      <button
                        onClick={() => simulateQRScan('M-2024-002')}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs"
                      >
                        M-2024-002
                      </button>
                      <button
                        onClick={() => simulateQRScan('M-2024-003')}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs"
                      >
                        M-2024-003
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 스캔된 금형 정보 */}
        {scannedMold && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">스캔된 금형 정보</h3>
                <button
                  onClick={resetScan}
                  className="btn-secondary"
                >
                  다시 스캔
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <h4 className="font-medium text-neutral-900 mb-3">점검 정보</h4>
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
              <div className="mt-6">
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
            </div>

            {/* 점검 알림 */}
            {notification && (
              <div className={`rounded-lg border p-6 ${getPriorityColor(notification.priority)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6" />
                    <div>
                      <h4 className="font-semibold">점검 필요 알림</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(notification.priority)}`}>
                        {getPriorityText(notification.priority)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mb-4">{notification.message}</p>

                <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium mb-2">협력사 정보</h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>업체명:</span>
                      <span className="font-medium">{notification.partnerInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>연락처:</span>
                      <span className="font-medium">{notification.partnerInfo.contact}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={sendNotificationToPartner}
                    disabled={isSendingNotification}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSendingNotification ? '전송 중...' : '협력사에 알림 전송'}
                  </button>
                  <button
                    onClick={() => setNotification(null)}
                    className="btn-secondary"
                  >
                    나중에
                  </button>
                </div>
              </div>
            )}

            {/* 상태가 정상인 경우 */}
            {!notification && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h4 className="font-semibold text-green-800">점검 상태 양호</h4>
                </div>
                <p className="text-green-700">
                  현재 금형 상태가 양호합니다. 추가 점검이 필요하지 않습니다.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoldQRInspection;
