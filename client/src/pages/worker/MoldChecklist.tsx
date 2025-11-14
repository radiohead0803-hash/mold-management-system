import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Upload, AlertCircle, Paperclip, X, Download, Eye } from 'lucide-react';
import { allCategories, CategorySection, CheckItem, FileAttachment } from './MoldChecklistData';

const MoldChecklist: React.FC = () => {
  const { moldId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [moldInfo, setMoldInfo] = useState<any>(null);
  const [productImage, setProductImage] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved'>('pending');
  
  // 기본 정보
  const [vehicleModel, setVehicleModel] = useState('NO5 (기본차)');
  const [manufacturer, setManufacturer] = useState('지금강');
  const [supplier, setSupplier] = useState('아이에이테크');
  const [injectionMachine, setInjectionMachine] = useState('- ton');
  const [clampingForce, setClampingForce] = useState('650ton');
  const [eoCutDate, setEoCutDate] = useState('2020.09.08');
  const [initialToDate, setInitialToDate] = useState('2020.11.20');

  // 카테고리 상태 관리
  const [categories, setCategories] = useState<CategorySection[]>(
    allCategories.map(cat => ({ ...cat, items: cat.items.map(item => ({ ...item })) }))
  );

  // 파일 미리보기 모달
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 총 점검 건수 계산
  const getTotalCheckItems = () => {
    return categories.reduce((total, category) => {
      return total + (category.enabled ? category.items.length : 0);
    }, 0);
  };

  const getCheckedItems = () => {
    return categories.reduce((total, category) => {
      if (!category.enabled) return total;
      return total + category.items.filter(item => item.checked).length;
    }, 0);
  };

  const getCompletionRate = () => {
    const total = getTotalCheckItems();
    const checked = getCheckedItems();
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  };

  useEffect(() => {
    fetchData();
  }, [moldId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('qr_session_token');
      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMoldInfo(data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 활성화/비활성화 토글
  const handleCategoryToggle = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };

  // 항목 체크 토글
  const handleCheckToggle = (categoryId: string, itemId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            )
          }
        : cat
    ));
  };

  // 규격/사양 값 변경
  const handleSpecChange = (categoryId: string, itemId: string, value: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, specValue: value } : item
            )
          }
        : cat
    ));
  };

  // 점검 내용 입력 값 변경
  const handleInspectionChange = (categoryId: string, itemId: string, value: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, inspectionValue: value } : item
            )
          }
        : cat
    ));
  };

  // 체크박스 옵션 토글 (다중 선택)
  const handleCheckboxToggle = (categoryId: string, itemId: string, option: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item => {
              if (item.id === itemId) {
                const currentValues = item.specValue?.split(',').filter(v => v) || [];
                const newValues = currentValues.includes(option)
                  ? currentValues.filter(v => v !== option)
                  : [...currentValues, option];
                return { ...item, specValue: newValues.join(',') };
              }
              return item;
            })
          }
        : cat
    ));
  };

  // 날짜 선택 항목의 체크박스 토글 (inspectionValue 사용)
  const handleDateCheckboxToggle = (categoryId: string, itemId: string, option: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item => {
              if (item.id === itemId) {
                const currentValues = item.inspectionValue?.split(',').filter(v => v) || [];
                const newValues = currentValues.includes(option)
                  ? currentValues.filter(v => v !== option)
                  : [...currentValues, option];
                return { ...item, inspectionValue: newValues.join(',') };
              }
              return item;
            })
          }
        : cat
    ));
  };

  // 파일 첨부 추가
  const handleFileUpload = (categoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newAttachments: FileAttachment[] = Array.from(files).map((file, index) => ({
        id: `${categoryId}-file-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }));

      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, attachments: [...(cat.attachments || []), ...newAttachments] }
          : cat
      ));
    }
  };

  // 파일 첨부 삭제
  const handleFileRemove = (categoryId: string, fileId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, attachments: (cat.attachments || []).filter(f => f.id !== fileId) }
        : cat
    ));
  };

  // 파일 미리보기
  const handleFilePreview = (file: FileAttachment) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  // 파일 다운로드
  const handleFileDownload = (file: FileAttachment) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 저장
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('qr_session_token');
      const saveData = {
        moldId,
        vehicleModel,
        manufacturer,
        supplier,
        injectionMachine,
        clampingForce,
        eoCutDate,
        initialToDate,
        categories,
        productImage,
        approvalStatus: 'pending',
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:5001/api/worker/mold/${moldId}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        alert('체크리스트가 저장되었습니다. 관리자 승인 대기 중입니다.');
        setApprovalStatus('pending');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 규격/사양 필드 렌더링
  const renderSpecField = (category: CategorySection, item: CheckItem) => {
    const disabled = !category.enabled || approvalStatus === 'approved';

    if (item.specType === 'input') {
      return (
        <input
          type="text"
          value={item.specValue || ''}
          onChange={(e) => handleSpecChange(category.id, item.id, e.target.value)}
          className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
          disabled={disabled}
        />
      );
    }

    if (item.specType === 'date-inspection' && item.specOptions) {
      return (
        <div className="flex flex-col gap-2">
          <input
            type="date"
            value={item.specValue || ''}
            onChange={(e) => handleSpecChange(category.id, item.id, e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            disabled={disabled}
          />
          <div className="flex flex-wrap gap-2 justify-center">
            {item.specOptions.map((option) => {
              const selectedValues = item.inspectionValue?.split(',').filter(v => v) || [];
              return (
                <label key={option} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleDateCheckboxToggle(category.id, item.id, option)}
                    className="cursor-pointer"
                    disabled={disabled}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (item.specType === 'select-inspection' && item.specOptions) {
      return (
        <div className="flex flex-col gap-2">
          <select
            value={item.specValue || ''}
            onChange={(e) => handleSpecChange(category.id, item.id, e.target.value)}
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            disabled={disabled}
          >
            <option value="">재질 선택</option>
            {item.specOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={item.inspectionValue || ''}
            onChange={(e) => handleInspectionChange(category.id, item.id, e.target.value)}
            placeholder="점검 내용 입력"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            disabled={disabled}
          />
        </div>
      );
    }

    if (item.specType === 'checkbox-inspection' && item.specOptions) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {item.specOptions.map((option) => {
              const selectedValues = item.specValue?.split(',').filter(v => v) || [];
              return (
                <label key={option} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleCheckboxToggle(category.id, item.id, option)}
                    className="cursor-pointer"
                    disabled={disabled}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
          <input
            type="text"
            value={item.inspectionValue || ''}
            onChange={(e) => handleInspectionChange(category.id, item.id, e.target.value)}
            placeholder="점검 내용 입력"
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
            disabled={disabled}
          />
        </div>
      );
    }

    return <span className="text-sm text-slate-600">{item.spec || item.specValue || '-'}</span>;
  };

  // 카테고리 테이블 렌더링
  const renderCategoryTable = (category: CategorySection) => (
    <div key={category.id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
      {/* 카테고리 헤더 */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{category.title}</h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={category.enabled}
              onChange={() => handleCategoryToggle(category.id)}
              className="w-4 h-4 cursor-pointer"
              disabled={approvalStatus === 'approved'}
            />
            <span className="font-medium">{category.enabled ? '점검대상' : '비대상'}</span>
          </label>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold w-16">No.</th>
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold">점검 항목</th>
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold w-80">규격/사양</th>
              <th className="border border-slate-300 px-4 py-2 text-sm font-bold w-24">확인</th>
            </tr>
          </thead>
          <tbody>
            {category.items.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-slate-50 ${!category.enabled ? 'bg-slate-50 opacity-50' : ''}`}
              >
                <td className="border border-slate-300 px-4 py-2 text-center text-sm">{index + 1}</td>
                <td className="border border-slate-300 px-4 py-2 text-sm">{item.item}</td>
                <td className="border border-slate-300 px-4 py-2 text-sm">
                  {renderSpecField(category, item)}
                </td>
                <td className="border border-slate-300 px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleCheckToggle(category.id, item.id)}
                    className="w-5 h-5 cursor-pointer"
                    disabled={!category.enabled || approvalStatus === 'approved'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 파일 첨부 섹션 */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-slate-700">관련 자료 첨부</h4>
          <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">
            <Paperclip className="h-4 w-4" />
            파일 첨부
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(category.id, e)}
              className="hidden"
              disabled={!category.enabled || approvalStatus === 'approved'}
            />
          </label>
        </div>
        {category.attachments && category.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {category.attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:border-blue-400 transition-colors"
              >
                <Paperclip className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700 font-medium">{file.name}</span>
                <div className="flex items-center gap-1 ml-2 border-l pl-2">
                  <button
                    onClick={() => handleFilePreview(file)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="미리보기"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleFileDownload(file)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="다운로드"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {category.enabled && approvalStatus !== 'approved' && (
                    <button
                      onClick={() => handleFileRemove(category.id, file.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="삭제"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/worker/mold/${moldId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">금형 체크리스트</h1>
                <p className="text-sm text-slate-600">{moldInfo?.moldId} - {moldInfo?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 점검 진행률 표시 */}
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-lg border border-slate-300">
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">총 점검항목</p>
                  <p className="text-2xl font-bold text-slate-800">{getTotalCheckItems()}</p>
                </div>
                <div className="h-12 w-px bg-slate-300"></div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">완료</p>
                  <p className="text-2xl font-bold text-blue-600">{getCheckedItems()}</p>
                </div>
                <div className="h-12 w-px bg-slate-300"></div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">진행률</p>
                  <p className="text-2xl font-bold text-green-600">{getCompletionRate()}%</p>
                </div>
              </div>
              {approvalStatus === 'approved' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-bold">승인완료</span>
                </div>
              )}
              {approvalStatus === 'pending' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-bold">승인대기</span>
                </div>
              )}
              {approvalStatus !== 'approved' && (
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  점검완료 및 승인요청
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white text-center">금형 체크리스트</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-[2fr,1fr] gap-6">
              <div>
                <table className="w-full border-2 border-slate-400">
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold text-center">차종</td>
                      <td className="border border-slate-400 px-4 py-2 text-center" colSpan={3}>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">PART NUMBER</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">{moldInfo?.partNumber || '86563/4-P1010'}</td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">PART NAME</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">{moldInfo?.partName || 'COVER-FOG LAMP, L/RH'}</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">작성일</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">{new Date().toLocaleDateString('ko-KR')}</td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">작성자</td>
                      <td className="border border-slate-400 px-4 py-2 bg-slate-50">점검자</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">양산처</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={manufacturer}
                          onChange={(e) => setManufacturer(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">제작처</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">양산 사출기</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={injectionMachine}
                          onChange={(e) => setInjectionMachine(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">형체력</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={clampingForce}
                          onChange={(e) => setClampingForce(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">EO CUT</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={eoCutDate}
                          onChange={(e) => setEoCutDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                      <td className="border border-slate-400 bg-slate-200 px-4 py-2 font-bold">초도 T/O 일정</td>
                      <td className="border border-slate-400 px-4 py-2">
                        <input
                          type="text"
                          value={initialToDate}
                          onChange={(e) => setInitialToDate(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded"
                          disabled={approvalStatus === 'approved'}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col items-center justify-start">
                <label className="text-sm font-bold mb-2">부품 그림</label>
                {productImage ? (
                  <img src={productImage} alt="제품" className="max-w-full max-h-64 h-auto rounded-lg border-2 border-slate-300 object-contain" />
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <p className="text-slate-400 text-sm">제품 이미지</p>
                  </div>
                )}
                <label className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 cursor-pointer">
                  <Upload className="h-3 w-3" />
                  이미지 업로드
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 9개 카테고리 렌더링 */}
        {categories.map(category => renderCategoryTable(category))}
      </div>

      {/* 파일 미리보기 모달 */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-slate-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{previewFile.name}</h3>
                  <p className="text-xs text-slate-500">
                    첨부일시: {new Date(previewFile.uploadedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFileDownload(previewFile)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  다운로드
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              {previewFile.name.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                />
              ) : previewFile.name.match(/\.(pdf)$/i) ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh] border border-slate-300 rounded-lg"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-12">
                  <Paperclip className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    이 파일 형식은 미리보기를 지원하지 않습니다.
                  </p>
                  <button
                    onClick={() => handleFileDownload(previewFile)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                  >
                    <Download className="h-4 w-4" />
                    파일 다운로드
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoldChecklist;
