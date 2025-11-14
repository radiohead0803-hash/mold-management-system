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
                <h1 className="text-2xl font-bold">리비전 관리</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 리비전 관리 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-white">□</span> 리비전 관리
            </h2>
            <span className="text-white text-xs">Creative Auto Module System</span>
          </div>

          {/* 현재 버전 */}
          <div className="p-6 bg-slate-50">
            <div className="bg-white rounded-lg border-2 border-slate-300 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <GitBranch className="h-6 w-6 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">현재 적용 버전</p>
                    <h2 className="text-3xl font-bold text-slate-900">{revisions.find(r => r.status === 'current')?.version || 'N/A'}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">마지막 업데이트</p>
                  <p className="text-lg font-semibold text-slate-900">{revisions.find(r => r.status === 'current')?.date || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* 리비전 목록 테이블 */}
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-slate-800">
              <span>▶</span> 리비전 목록
            </h3>
            <div className="bg-white rounded-lg border-2 border-slate-300 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300">
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 w-24">버전</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">설명</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 w-32">작성자</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 w-32">날짜</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">변경내역</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 w-32">상태</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 w-40">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((revision) => (
                    <tr 
                      key={revision.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 ${
                        revision.status === 'current' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          revision.status === 'current'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {revision.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">{revision.description}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{revision.author}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{revision.date}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {revision.changes.map((change, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                              <p className="text-xs text-slate-600">{change}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {revision.status === 'current' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            현재 버전
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="상세보기">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="다운로드">
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
        </div>
      </div>
    </div>
  );
};

export default InjectionRevision;
