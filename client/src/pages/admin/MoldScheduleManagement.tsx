import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle,
  X,
  Clock,
  FileText,
  Plus,
  Edit,
  CheckCircle
} from 'lucide-react';

interface MoldData {
  id: number;
  moldId: string;
  name: string;
  location: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance: string;
  manager: string;
}

interface ScheduleItem {
  id: number;
  moldId: string;
  moldName: string;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scheduleName: string;
  description: string;
  assignedTo: string;
  department: string;
  scheduledDate: string;
  estimatedDuration: number; // 시간
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface NewSchedule {
  moldId: string;
  moldName: string;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  scheduleName: string;
  description: string;
  assignedTo: string;
  department: string;
  scheduledDate: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  recurring: boolean;
  recurringInterval: number;
}

const MoldScheduleManagement: React.FC = () => {
  const navigate = useNavigate();
  
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [molds, setMolds] = useState<MoldData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [autoScheduleSettings, setAutoScheduleSettings] = useState({
    enabled: true,
    shotCountThreshold: 10000, // 샷수 기준
    inspectionInterval: 30, // 일 단위
    advanceNotice: 7 // 사전 알림 일수
  });
  
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    moldId: '',
    moldName: '',
    scheduleType: 'monthly',
    scheduleName: '',
    description: '',
    assignedTo: '',
    department: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    estimatedDuration: 2,
    priority: 'medium',
    notes: '',
    recurring: false,
    recurringInterval: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [schedulesResponse, moldsResponse] = await Promise.all([
        fetch('/api/maintenance-schedules'),
        fetch('/api/molds')
      ]);
      
      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData);
      }
      
      if (moldsResponse.ok) {
        const moldsData = await moldsResponse.json();
        setMolds(moldsData);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestData = () => {
    setNewSchedule({
      moldId: 'M-2024-001',
      moldName: '스마트폰 케이스 금형',
      scheduleType: 'monthly',
      scheduleName: '정기 점검 및 청소',
      description: '월간 정기 점검으로 금형 상태 확인, 캐비티 청소, 이젝터 점검, 냉각 시스템 점검을 포함합니다.',
      assignedTo: '이정수',
      department: 'maintenance',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 일주일 후
      estimatedDuration: 4,
      priority: 'high',
      notes: '생산 일정과 조율하여 진행. 특히 이젝터 핀 상태를 중점적으로 점검 필요.',
      recurring: true,
      recurringInterval: 1
    });
  };

  const handleInputChange = (field: keyof NewSchedule, value: any) => {
    setNewSchedule(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 금형 선택 시 자동으로 금형명 설정
    if (field === 'moldId') {
      const selectedMold = molds.find(mold => mold.moldId === value);
      if (selectedMold) {
        setNewSchedule(prev => ({
          ...prev,
          moldName: selectedMold.name
        }));
      }
    }
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!newSchedule.moldId || !newSchedule.scheduleName || !newSchedule.assignedTo) {
      setError('필수 필드를 모두 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/maintenance-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newSchedule)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '일정 등록에 실패했습니다.');
      }

      const result = await response.json();
      console.log('일정 등록 성공:', result);
      
      alert('점검 일정이 성공적으로 등록되었습니다!');
      setShowAddForm(false);
      setNewSchedule({
        moldId: '',
        moldName: '',
        scheduleType: 'monthly',
        scheduleName: '',
        description: '',
        assignedTo: '',
        department: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        estimatedDuration: 2,
        priority: 'medium',
        notes: '',
        recurring: false,
        recurringInterval: 1
      });
      loadData();
      
    } catch (error) {
      console.error('일정 등록 실패:', error);
      setError(error instanceof Error ? error.message : '등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAutoSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maintenance-schedules/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(autoScheduleSettings)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.generatedCount}개의 자동 점검 일정이 생성되었습니다.`);
        loadData();
      }
    } catch (error) {
      console.error('자동 일정 생성 실패:', error);
      setError('자동 일정 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateScheduleStatus = async (scheduleId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/maintenance-schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  };

  const sendNotificationToPartner = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/maintenance-schedules/${scheduleId}/notify-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        alert('협력사에 알림이 전송되었습니다.');
      }
    } catch (error) {
      console.error('알림 전송 실패:', error);
      setError('협력사 알림 전송에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '예정';
      case 'in_progress': return '진행중';
      case 'completed': return '완료';
      case 'overdue': return '지연';
      case 'cancelled': return '취소';
      default: return status;
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

  const filteredSchedules = schedules.filter(schedule => {
    const statusMatch = filterStatus === 'all' || schedule.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || schedule.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const renderAddForm = () => (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-900">새 점검 일정 등록</h3>
        <div className="flex gap-2">
          <button
            onClick={fillTestData}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            테스트 데이터
          </button>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            금형 선택 *
          </label>
          <select
            value={newSchedule.moldId}
            onChange={(e) => handleInputChange('moldId', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">금형 선택</option>
            {molds.map((mold) => (
              <option key={mold.id} value={mold.moldId}>
                {mold.moldId} - {mold.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            점검 유형
          </label>
          <select
            value={newSchedule.scheduleType}
            onChange={(e) => handleInputChange('scheduleType', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="daily">일간</option>
            <option value="weekly">주간</option>
            <option value="monthly">월간</option>
            <option value="quarterly">분기</option>
            <option value="yearly">연간</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            점검명 *
          </label>
          <input
            type="text"
            value={newSchedule.scheduleName}
            onChange={(e) => handleInputChange('scheduleName', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="점검 작업명"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            담당자 *
          </label>
          <input
            type="text"
            value={newSchedule.assignedTo}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="담당자명"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            부서
          </label>
          <select
            value={newSchedule.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">부서 선택</option>
            <option value="maintenance">보전부</option>
            <option value="production">생산부</option>
            <option value="quality">품질부</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            예정일
          </label>
          <input
            type="date"
            value={newSchedule.scheduledDate}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            예상 소요시간 (시간)
          </label>
          <input
            type="number"
            value={newSchedule.estimatedDuration}
            onChange={(e) => handleInputChange('estimatedDuration', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            우선순위
          </label>
          <select
            value={newSchedule.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="low">낮음</option>
            <option value="medium">보통</option>
            <option value="high">높음</option>
            <option value="urgent">긴급</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          점검 내용
        </label>
        <textarea
          value={newSchedule.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="점검할 내용을 상세히 입력하세요"
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          특이사항
        </label>
        <textarea
          value={newSchedule.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={2}
          placeholder="주의사항이나 특이사항을 입력하세요"
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={newSchedule.recurring}
            onChange={(e) => handleInputChange('recurring', e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-700">반복 일정</span>
        </label>
        
        {newSchedule.recurring && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newSchedule.recurringInterval}
              onChange={(e) => handleInputChange('recurringInterval', parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 border border-neutral-300 rounded text-sm"
              min="1"
            />
            <span className="text-sm text-neutral-600">
              {newSchedule.scheduleType === 'daily' ? '일' :
               newSchedule.scheduleType === 'weekly' ? '주' :
               newSchedule.scheduleType === 'monthly' ? '개월' :
               newSchedule.scheduleType === 'quarterly' ? '분기' : '년'} 마다
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowAddForm(false)}
          className="btn-secondary"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? '등록 중...' : '일정 등록'}
        </button>
      </div>
    </div>
  );

  const renderAutoScheduleSettings = () => (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <h3 className="text-lg font-medium text-neutral-900 mb-4">자동 일정 수립 설정</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            샷수 기준
          </label>
          <input
            type="number"
            value={autoScheduleSettings.shotCountThreshold}
            onChange={(e) => setAutoScheduleSettings(prev => ({
              ...prev,
              shotCountThreshold: parseInt(e.target.value) || 0
            }))}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="10000"
          />
          <p className="text-xs text-neutral-500 mt-1">샷수 도달 시 자동 일정 생성</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            점검 주기 (일)
          </label>
          <input
            type="number"
            value={autoScheduleSettings.inspectionInterval}
            onChange={(e) => setAutoScheduleSettings(prev => ({
              ...prev,
              inspectionInterval: parseInt(e.target.value) || 0
            }))}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="30"
          />
          <p className="text-xs text-neutral-500 mt-1">정기 점검 간격</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            사전 알림 (일)
          </label>
          <input
            type="number"
            value={autoScheduleSettings.advanceNotice}
            onChange={(e) => setAutoScheduleSettings(prev => ({
              ...prev,
              advanceNotice: parseInt(e.target.value) || 0
            }))}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="7"
          />
          <p className="text-xs text-neutral-500 mt-1">점검 전 알림 일수</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={generateAutoSchedules}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          {isLoading ? '생성 중...' : '자동 일정 생성'}
        </button>
      </div>
    </div>
  );

  const renderScheduleList = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-neutral-900">점검 일정 목록</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            새 일정 등록
          </button>
        </div>

        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="scheduled">예정</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="overdue">지연</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="all">전체 우선순위</option>
            <option value="urgent">긴급</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                금형 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                점검 내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                담당자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                예정일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                우선순위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredSchedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{schedule.moldId}</div>
                    <div className="text-sm text-neutral-500">{schedule.moldName}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{schedule.scheduleName}</div>
                    <div className="text-sm text-neutral-500">{schedule.scheduleType}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">{schedule.assignedTo}</div>
                  <div className="text-sm text-neutral-500">{schedule.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">{schedule.scheduledDate}</div>
                  <div className="text-sm text-neutral-500">{schedule.estimatedDuration}시간</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                    {getStatusText(schedule.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(schedule.priority)}`}>
                    {getPriorityText(schedule.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {schedule.status === 'scheduled' && (
                      <button
                        onClick={() => updateScheduleStatus(schedule.id, 'in_progress')}
                        className="text-blue-600 hover:text-blue-900"
                        title="시작"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}
                    {schedule.status === 'in_progress' && (
                      <button
                        onClick={() => updateScheduleStatus(schedule.id, 'completed')}
                        className="text-green-600 hover:text-green-900"
                        title="완료"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => sendNotificationToPartner(schedule.id)}
                      className="text-orange-600 hover:text-orange-900"
                      title="협력사 알림"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingSchedule(schedule)}
                      className="text-neutral-600 hover:text-neutral-900"
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSchedules.length === 0 && (
        <div className="p-8 text-center text-neutral-500">
          등록된 점검 일정이 없습니다.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              <h1 className="text-3xl font-semibold text-neutral-900">점검 일정 관리</h1>
              <p className="text-neutral-600 mt-1">금형 점검 일정을 계획하고 관리하세요</p>
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-neutral-600">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {renderAutoScheduleSettings()}
            {showAddForm && renderAddForm()}
            {renderScheduleList()}
          </>
        )}
      </div>
    </div>
  );
};

export default MoldScheduleManagement;
