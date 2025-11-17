import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Ruler, Weight, Box, Layers } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface MoldBasicInfo {
  moldId: string;
  name: string;
  status: string;
}

interface Specification {
  category: string;
  item: string;
  value: string;
  unit: string;
}

const TechnicalSpecs: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [specs, setSpecs] = useState<Specification[]>([]);

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
        status: data.status
      });

      // 기술사양 데이터 설정
      const specsData: Specification[] = [
        { category: '기본정보', item: '금형번호', value: data.moldId || '-', unit: '' },
        { category: '기본정보', item: '제품명', value: data.name || '-', unit: '' },
        { category: '기본정보', item: '금형 상태', value: data.status || '-', unit: '' },
        { category: '치수', item: '금형 크기', value: data.specifications?.dimensions || '-', unit: 'mm' },
        { category: '치수', item: '금형 중량', value: data.specifications?.weight || '-', unit: 'kg' },
        { category: '구조', item: '캐비티 수', value: data.specifications?.cavities?.toString() || '-', unit: 'cavity' },
        { category: '구조', item: '금형 재질', value: data.specifications?.material || '-', unit: '' },
        { category: '성능', item: '최대 쇼트수', value: data.maxShotCount?.toLocaleString() || '-', unit: 'shot' },
        { category: '성능', item: '현재 쇼트수', value: data.shotCount?.toLocaleString() || '-', unit: 'shot' },
        { category: '관리', item: '담당자', value: data.manager || '-', unit: '' },
        { category: '관리', item: '보관 위치', value: data.location || '-', unit: '' }
      ];
      setSpecs(specsData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '기본정보': return <FileText className="h-4 w-4 text-blue-500" />;
      case '치수': return <Ruler className="h-4 w-4 text-green-500" />;
      case '구조': return <Box className="h-4 w-4 text-purple-500" />;
      case '성능': return <Layers className="h-4 w-4 text-orange-500" />;
      case '관리': return <Weight className="h-4 w-4 text-indigo-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const groupedSpecs = specs.reduce((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {} as Record<string, Specification[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/worker/mold/${moldId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 기술사양</h1>
                  <p className="text-sm text-slate-600">{moldInfo?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 기술사양 카드들 */}
        {Object.entries(groupedSpecs).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(category)}
                <h2 className="text-base font-bold text-white">{category}</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{spec.item}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {spec.value} {spec.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalSpecs;
