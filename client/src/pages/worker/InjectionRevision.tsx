import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Eye, Download } from 'lucide-react';

interface MoldBasicInfo {
  moldId: string;
  name: string;
}

interface Revision {
  id: string;
  version: string;
  date: string;
  author: string;
  description: string;
  status: 'current' | 'archived';
  changes: string[];
}

const InjectionRevision: React.FC = () => {
  const { moldId } = useParams<{ moldId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<MoldBasicInfo | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) throw new Error('금형 정보를 불러올 수 없습니다.');

      const data = await response.json();
      setMoldInfo({
        moldId: data.moldId,
        name: data.name
      });

      // Mock revision data
      const mockRevisions: Revision[] = [
        {
          id: 'rev_001',
          version: 'v1.3',
          date: '2024-11-10',
          author: '김작업',
          description: '사출압력 및 온도 조정',
          status: 'current',
          changes: ['노즐 온도: 220°C → 225°C', '사출압력: 80MPa → 85MPa']
        },
        {
          id: 'rev_002',
          version: 'v1.2',
          date: '2024-10-25',
          author: '이기술',
          description: '냉각시간 최적화',
          status: 'archived',
          changes: ['냉각시간: 20초 → 15초', '사이클타임: 30초 → 25초']
        },
        {
          id: 'rev_003',
          version: 'v1.1',
          date: '2024-10-01',
          author: '박금형',
          description: '초기 설정 수정',
          status: 'archived',
          changes: ['보압: 50MPa → 60MPa', '보압시간: 2초 → 3초']
        },
        {
          id: 'rev_004',
          version: 'v1.0',
          date: '2024-09-15',
          author: '최설계',
          description: '초기 사출조건 설정',
          status: 'archived',
          changes: ['최초 설정값 입력']
        }
      ];
      setRevisions(mockRevisions);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{moldInfo?.moldId} - 리비전관리</h1>
                  <p className="text-sm text-slate-600">{moldInfo?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 현재 버전 */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">현재 적용 버전</p>
              <h2 className="text-3xl font-bold">{revisions.find(r => r.status === 'current')?.version || 'N/A'}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">마지막 업데이트</p>
              <p className="text-lg font-semibold">{revisions.find(r => r.status === 'current')?.date || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* 리비전 목록 */}
        <div className="space-y-4">
          {revisions.map((revision, index) => (
            <div
              key={revision.id}
              className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all ${
                revision.status === 'current'
                  ? 'border-purple-500'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className={`px-6 py-4 ${
                revision.status === 'current'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                  : 'bg-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      revision.status === 'current'
                        ? 'bg-white text-purple-600'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {revision.version}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        revision.status === 'current' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {revision.description}
                      </h3>
                      <p className={`text-sm ${
                        revision.status === 'current' ? 'text-white/80' : 'text-slate-600'
                      }`}>
                        {revision.date} · {revision.author}
                      </p>
                    </div>
                  </div>
                  {revision.status === 'current' && (
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                      현재 버전
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">변경 내역</h4>
                <div className="space-y-2">
                  {revision.changes.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-sm text-slate-600">{change}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    상세보기
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium">
                    <Download className="h-4 w-4" />
                    다운로드
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InjectionRevision;
