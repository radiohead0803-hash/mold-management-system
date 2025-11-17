import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft, Save, Info } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  currentShotCount: number;
}

interface InjectionCondition {
  temperature1: string;
  temperature2: string;
  temperature3: string;
  temperature4: string;
  injectionPressure: string;
  injectionSpeed: string;
  holdingPressure: string;
  holdingTime: string;
  coolingTime: string;
  cycleTime: string;
  backPressure: string;
  screwSpeed: string;
  cushion: string;
  moldTemperature: string;
  notes: string;
}

const InjectionConditionsInput: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [conditions, setConditions] = useState<InjectionCondition>({
    temperature1: '',
    temperature2: '',
    temperature3: '',
    temperature4: '',
    injectionPressure: '',
    injectionSpeed: '',
    holdingPressure: '',
    holdingTime: '',
    coolingTime: '',
    cycleTime: '',
    backPressure: '',
    screwSpeed: '',
    cushion: '',
    moldTemperature: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error('금형 정보를 불러올 수 없습니다.');

      const data = await response.json();
      setMoldInfo({
        moldId: data.moldId,
        name: data.name,
        currentShotCount: data.shotCount || 0
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!conditions.temperature1 || !conditions.injectionPressure) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: API 호출
      alert('사출조건이 저장되었습니다.');
      navigate(`/worker/mold/${moldId}`);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof InjectionCondition, value: string) => {
    setConditions(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
                <h1 className="text-2xl font-bold">사출조건 입력</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 사출조건 입력 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white">□</span> 사출조건 입력
            </h2>
            <span className="text-white text-xs">Creative Auto Module System</span>
          </div>

          {/* 안내 메시지 */}
          <div className="p-6 bg-slate-50">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">사출조건 입력 안내</h4>
                  <p className="text-sm text-blue-800">새로운 사출조건을 입력하면 리비전이 자동으로 생성되며, 변경이력이 기록됩니다.</p>
                </div>
              </div>
            </div>

            {/* 온도 설정 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 온도 설정
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">노즐 온도 (°C) *</label>
                <input
                  type="number"
                  value={conditions.temperature1}
                  onChange={(e) => handleChange('temperature1', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="기존: 225°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">실린더 1구 온도 (°C)</label>
                <input
                  type="number"
                  value={conditions.temperature2}
                  onChange={(e) => handleChange('temperature2', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="기존: 210°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">실린더 2구 온도 (°C)</label>
                <input
                  type="number"
                  value={conditions.temperature3}
                  onChange={(e) => handleChange('temperature3', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="기존: 200°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">실린더 3구 온도 (°C)</label>
                <input
                  type="number"
                  value={conditions.temperature4}
                  onChange={(e) => handleChange('temperature4', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="기존: 190°C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">금형 온도 (°C)</label>
                <input
                  type="number"
                  value={conditions.moldTemperature}
                  onChange={(e) => handleChange('moldTemperature', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="기존: 40°C"
                />
              </div>
              </div>
            </div>

            {/* 압력 및 속도 설정 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 압력 및 속도 설정
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">사출압력 (MPa) *</label>
                <input
                  type="number"
                  value={conditions.injectionPressure}
                  onChange={(e) => handleChange('injectionPressure', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="기존: 85 MPa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">사출속도 (mm/s)</label>
                <input
                  type="number"
                  value={conditions.injectionSpeed}
                  onChange={(e) => handleChange('injectionSpeed', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="기존: 50 mm/s"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">보압 (MPa)</label>
                <input
                  type="number"
                  value={conditions.holdingPressure}
                  onChange={(e) => handleChange('holdingPressure', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="기존: 60 MPa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">배압 (MPa)</label>
                <input
                  type="number"
                  value={conditions.backPressure}
                  onChange={(e) => handleChange('backPressure', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="기존: 5 MPa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">스크류 회전속도 (rpm)</label>
                <input
                  type="number"
                  value={conditions.screwSpeed}
                  onChange={(e) => handleChange('screwSpeed', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="기존: 100 rpm"
                />
              </div>
              </div>
            </div>

            {/* 시간 설정 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 시간 설정
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">보압시간 (초)</label>
                <input
                  type="number"
                  value={conditions.holdingTime}
                  onChange={(e) => handleChange('holdingTime', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="기존: 3초"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">냉각시간 (초)</label>
                <input
                  type="number"
                  value={conditions.coolingTime}
                  onChange={(e) => handleChange('coolingTime', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="기존: 15초"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">사이클 타임 (초)</label>
                <input
                  type="number"
                  value={conditions.cycleTime}
                  onChange={(e) => handleChange('cycleTime', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="기존: 25초"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">쿠션 (mm)</label>
                <input
                  type="number"
                  value={conditions.cushion}
                  onChange={(e) => handleChange('cushion', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="기존: 5 mm"
                />
              </div>
              </div>
            </div>

            {/* 비고 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 비고
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6">
              <textarea
            value={conditions.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            rows={4}
            placeholder="특이사항이나 변경 사유를 입력하세요..."
              />
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate(`/worker/mold/${moldId}`)}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InjectionConditionsInput;
