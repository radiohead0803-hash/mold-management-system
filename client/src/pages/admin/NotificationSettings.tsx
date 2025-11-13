import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  User,
  Shield,
  Zap
} from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: 'daily_inspection' | 'repair_request' | 'system' | 'maintenance';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    sound: boolean;
  };
  conditions: {
    moldStatus?: string[];
    inspectionResult?: string[];
    urgencyLevel?: string[];
    timeRange?: { start: string; end: string };
  };
}

interface NotificationSettings {
  globalEnabled: boolean;
  soundEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  rules: NotificationRule[];
}

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    globalEnabled: true,
    soundEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    rules: []
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Mock 설정 데이터 로드
      const mockSettings: NotificationSettings = {
        globalEnabled: true,
        soundEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        },
        rules: [
          {
            id: 'urgent_inspection',
            name: '긴급 점검 알림',
            description: '비정상 점검 결과 시 즉시 알림',
            type: 'daily_inspection',
            priority: 'urgent',
            enabled: true,
            channels: {
              inApp: true,
              email: true,
              sms: true,
              sound: true
            },
            conditions: {
              inspectionResult: ['abnormal']
            }
          },
          {
            id: 'repair_request',
            name: '수리 요청 알림',
            description: '새로운 수리 요청 접수 시 알림',
            type: 'repair_request',
            priority: 'high',
            enabled: true,
            channels: {
              inApp: true,
              email: true,
              sms: false,
              sound: true
            },
            conditions: {
              urgencyLevel: ['urgent', 'high']
            }
          },
          {
            id: 'daily_inspection_complete',
            name: '일상점검 완료 알림',
            description: '일상점검 완료 시 알림',
            type: 'daily_inspection',
            priority: 'medium',
            enabled: true,
            channels: {
              inApp: true,
              email: false,
              sms: false,
              sound: false
            },
            conditions: {
              inspectionResult: ['normal', 'attention', 'abnormal']
            }
          },
          {
            id: 'maintenance_due',
            name: '정기 점검 예정 알림',
            description: '정기 점검 예정일 3일 전 알림',
            type: 'maintenance',
            priority: 'medium',
            enabled: true,
            channels: {
              inApp: true,
              email: true,
              sms: false,
              sound: false
            },
            conditions: {}
          }
        ]
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Settings load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Mock API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Settings save error:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateRule = (ruleId: string, updates: Partial<NotificationRule>) => {
    setSettings(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_inspection': return <CheckCircle className="h-4 w-4" />;
      case 'repair_request': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      case 'system': return <Shield className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">알림 설정을 불러오는 중...</p>
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
                <h1 className="text-2xl font-bold text-neutral-900">알림 설정</h1>
                <p className="text-sm text-neutral-600">시스템 알림 및 알림 규칙 관리</p>
              </div>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Global Settings */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">전체 설정</h2>
              <p className="text-sm text-neutral-600">알림 시스템 전체 설정</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">알림 활성화</p>
                    <p className="text-sm text-neutral-600">모든 알림 기능 사용</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.globalEnabled}
                    onChange={(e) => updateGlobalSetting('globalEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? <Volume2 className="h-5 w-5 text-neutral-600" /> : <VolumeX className="h-5 w-5 text-neutral-600" />}
                  <div>
                    <p className="font-medium text-neutral-900">사운드 알림</p>
                    <p className="text-sm text-neutral-600">알림 시 사운드 재생</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateGlobalSetting('soundEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">이메일 알림</p>
                    <p className="text-sm text-neutral-600">이메일로 알림 발송</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => updateGlobalSetting('emailEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-neutral-600" />
                  <div>
                    <p className="font-medium text-neutral-900">SMS 알림</p>
                    <p className="text-sm text-neutral-600">문자 메시지 발송</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsEnabled}
                    onChange={(e) => updateGlobalSetting('smsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Quiet Hours */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-neutral-600" />
                    <div>
                      <p className="font-medium text-neutral-900">방해 금지 시간</p>
                      <p className="text-sm text-neutral-600">지정 시간 동안 알림 차단</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={(e) => updateGlobalSetting('quietHours', {
                        ...settings.quietHours,
                        enabled: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">시작 시간</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => updateGlobalSetting('quietHours', {
                          ...settings.quietHours,
                          start: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">종료 시간</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => updateGlobalSetting('quietHours', {
                          ...settings.quietHours,
                          end: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Rules */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BellRing className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">알림 규칙</h2>
              <p className="text-sm text-neutral-600">상황별 알림 설정</p>
            </div>
          </div>

          <div className="space-y-4">
            {settings.rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      {getTypeIcon(rule.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{rule.name}</h3>
                      <p className="text-sm text-neutral-600">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                      {rule.priority === 'urgent' ? '긴급' : 
                       rule.priority === 'high' ? '높음' :
                       rule.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {rule.enabled && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.channels.inApp}
                        onChange={(e) => updateRule(rule.id, {
                          channels: { ...rule.channels, inApp: e.target.checked }
                        })}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Bell className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">앱 내 알림</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.channels.email}
                        onChange={(e) => updateRule(rule.id, {
                          channels: { ...rule.channels, email: e.target.checked }
                        })}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Mail className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">이메일</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.channels.sms}
                        onChange={(e) => updateRule(rule.id, {
                          channels: { ...rule.channels, sms: e.target.checked }
                        })}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Smartphone className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">SMS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.channels.sound}
                        onChange={(e) => updateRule(rule.id, {
                          channels: { ...rule.channels, sound: e.target.checked }
                        })}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Volume2 className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm text-neutral-700">사운드</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Notification */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">알림 테스트</h2>
              <p className="text-sm text-neutral-600">설정된 알림이 제대로 작동하는지 확인</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800">일상점검 알림</p>
              <p className="text-sm text-green-600">테스트 점검 알림 발송</p>
            </button>
            <button className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
              <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="font-medium text-orange-800">수리요청 알림</p>
              <p className="text-sm text-orange-600">테스트 수리 알림 발송</p>
            </button>
            <button className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Bell className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="font-medium text-red-800">긴급 알림</p>
              <p className="text-sm text-red-600">테스트 긴급 알림 발송</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
