import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Upload, Eye, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MoldManagement: React.FC = () => {
  const navigate = useNavigate();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMold, setSelectedMold] = useState<any>(null);

  // Mock data for demonstration
  const molds = [
    {
      id: 'A-001',
      partNumber: 'P-2024-001',
      partName: '도어 핸들',
      vehicleModel: 'Genesis G90',
      manufacturer: '현대모비스',
      status: '생산중',
      lastCheck: '2024-11-01',
      shots: 15420,
      location: '1공장 A라인'
    },
    {
      id: 'B-205',
      partNumber: 'P-2024-205',
      partName: '범퍼 브라켓',
      vehicleModel: 'Sonata',
      manufacturer: '플라스틱옴니움',
      status: '수리중',
      lastCheck: '2024-10-28',
      shots: 8750,
      location: '2공장 B라인'
    },
    {
      id: 'C-102',
      partNumber: 'P-2024-102',
      partName: '센터콘솔',
      vehicleModel: 'Tucson',
      manufacturer: '동희산업',
      status: '점검예정',
      lastCheck: '2024-10-30',
      shots: 22100,
      location: '1공장 C라인'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '생산중':
        return 'badge badge-success';
      case '수리중':
        return 'badge badge-error';
      case '점검예정':
        return 'badge badge-warning';
      default:
        return 'badge badge-neutral';
    }
  };

  const handleViewDetail = (mold: any) => {
    setSelectedMold(mold);
    setShowDetailModal(true);
  };

  const handleEdit = (mold: any) => {
    // Navigate to edit page or open edit modal
    navigate(`/admin/molds/edit/${mold.id}`);
  };

  const handleDeleteClick = (mold: any) => {
    setSelectedMold(mold);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: API call to delete mold
    console.log('Deleting mold:', selectedMold?.id);
    alert(`금형 ${selectedMold?.id}가 삭제되었습니다.`);
    setShowDeleteModal(false);
    setSelectedMold(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">금형 관리</h1>
          <p className="text-neutral-600 mt-1">금형 정보를 등록하고 관리하세요</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <Upload className="mr-2 h-4 w-4" />
            엑셀 업로드
          </button>
          <button className="btn-secondary">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </button>
          <button className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            새 금형 등록
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="금형 검색 (품번, 품명, 차종...)"
                className="pl-10 pr-4 py-2 w-full rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
            <option>전체 상태</option>
            <option>생산중</option>
            <option>수리중</option>
            <option>점검예정</option>
            <option>보관중</option>
          </select>
          <select className="px-4 py-2 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
            <option>전체 제작처</option>
            <option>현대모비스</option>
            <option>플라스틱옴니움</option>
            <option>동희산업</option>
          </select>
          <button className="btn-secondary">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </button>
        </div>
      </div>

      {/* Mold List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-4 px-6 font-medium text-neutral-700">금형 ID</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">품번</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">품명</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">대상차종</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">제작처</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">상태</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">누적타수</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">최근점검</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">위치</th>
                <th className="text-left py-4 px-6 font-medium text-neutral-700">작업</th>
              </tr>
            </thead>
            <tbody>
              {molds.map((mold) => (
                <tr key={mold.id} className="border-b border-neutral-50 hover:bg-neutral-25">
                  <td className="py-4 px-6">
                    <div className="font-medium text-neutral-900">{mold.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-neutral-700">{mold.partNumber}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-neutral-900">{mold.partName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-neutral-700">{mold.vehicleModel}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-neutral-700">{mold.manufacturer}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={getStatusBadge(mold.status)}>
                      {mold.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-neutral-700">{mold.shots.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-neutral-700">{mold.lastCheck}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-neutral-700">{mold.location}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetail(mold)}
                        className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        title="상세보기"
                      >
                        <Eye className="h-4 w-4" />
                        상세
                      </button>
                      <button 
                        onClick={() => handleEdit(mold)}
                        className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                        title="수정"
                      >
                        <Edit2 className="h-4 w-4" />
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(mold)}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
          <div className="text-sm text-neutral-600">
            총 {molds.length}개 중 1-{molds.length}개 표시
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50" disabled>
              이전
            </button>
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
              2
            </button>
            <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
              3
            </button>
            <button className="px-3 py-1 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50">
              다음
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="text-2xl font-semibold text-neutral-900">247</div>
          <div className="text-sm text-neutral-600 mt-1">총 금형 수</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-semibold text-accent-green">189</div>
          <div className="text-sm text-neutral-600 mt-1">생산중</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-semibold text-accent-orange">23</div>
          <div className="text-sm text-neutral-600 mt-1">점검예정</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-semibold text-accent-red">8</div>
          <div className="text-sm text-neutral-600 mt-1">수리중</div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMold && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">금형 상세 정보</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600">금형 ID</label>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">{selectedMold.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">상태</label>
                  <p className="mt-1">
                    <span className={getStatusBadge(selectedMold.status)}>{selectedMold.status}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">품번</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.partNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">품명</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.partName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">대상차종</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.vehicleModel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">제작처</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.manufacturer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">누적타수</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.shots.toLocaleString()} 회</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600">최근점검</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.lastCheck}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-neutral-600">위치</label>
                  <p className="mt-1 text-neutral-900">{selectedMold.location}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedMold);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  수정하기
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMold && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">금형 삭제</h2>
              <p className="text-neutral-600 text-center mb-6">
                <span className="font-semibold text-neutral-900">{selectedMold.id}</span> 금형을 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>삭제될 정보:</strong><br />
                  • 품번: {selectedMold.partNumber}<br />
                  • 품명: {selectedMold.partName}<br />
                  • 제작처: {selectedMold.manufacturer}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedMold(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoldManagement;
