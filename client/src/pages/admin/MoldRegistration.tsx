import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  X, 
  Camera,
  FileText,
  Settings,
  MapPin,
  User
} from 'lucide-react';

interface MoldFormData {
  // 기본 정보
  moldId: string;
  name: string;
  category: string;
  manufacturer: string;
  supplier: string; // 생산처(협력사)
  purchaseDate: string;
  
  // 사양 정보
  material: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cavityCount: number;
  maxPressure: number;
  
  // 위치 및 상태
  location: string;
  zone: string;
  status: 'available' | 'in_use' | 'maintenance' | 'repair';
  
  // 담당자 정보
  manager: string;
  department: string;
  
  // 추가 정보
  description: string;
  maintenanceInterval: number; // 일 단위
}

const MoldRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [partners, setPartners] = useState([
    { id: 1, name: '협력사 A' },
    { id: 2, name: '협력사 B' },
    { id: 3, name: '협력사 C' },
    { id: 4, name: '협력사 D' },
    { id: 5, name: '협력사 E' }
  ]);
  const [formData, setFormData] = useState<MoldFormData>({
    moldId: '',
    name: '',
    category: '',
    manufacturer: '',
    supplier: '',
    purchaseDate: '',
    material: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    cavityCount: 1,
    maxPressure: 0,
    location: '',
    zone: '',
    status: 'available',
    manager: '',
    department: '',
    description: '',
    maintenanceInterval: 30
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: '기본 정보', icon: FileText },
    { id: 2, title: '사양 정보', icon: Settings },
    { id: 3, title: '위치 및 상태', icon: MapPin },
    { id: 4, title: '담당자 정보', icon: User },
    { id: 5, title: '이미지 및 완료', icon: Camera }
  ];

  const handleInputChange = (field: keyof MoldFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDimensionChange = (dimension: keyof MoldFormData['dimensions'], value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 필수 필드 검증
      if (!formData.moldId || !formData.name || !formData.location || !formData.zone) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
      }

      // API 호출로 금형 등록
      const response = await fetch('/api/molds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '금형 등록에 실패했습니다.');
      }

      const result = await response.json();
      console.log('금형 등록 성공:', result);
      
      // TODO: 이미지 업로드 처리 (별도 API 필요)
      if (images.length > 0) {
        console.log('업로드할 이미지:', images);
        // 실제 구현 시 FormData를 사용하여 이미지 업로드
      }
      
      alert('금형이 성공적으로 등록되었습니다!');
      // 대시보드로 이동
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('금형 등록 실패:', error);
      alert(error instanceof Error ? error.message : '금형 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">기본 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  금형 ID *
                </label>
                <input
                  type="text"
                  value={formData.moldId}
                  onChange={(e) => handleInputChange('moldId', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: M-2024-001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  금형명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="금형명을 입력하세요"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">카테고리 선택</option>
                  <option value="injection">사출금형</option>
                  <option value="press">프레스금형</option>
                  <option value="die-casting">다이캐스팅금형</option>
                  <option value="forging">단조금형</option>
                  <option value="other">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  제조업체
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="제조업체명"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  생산처 (협력사) *
                </label>
                <select
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">생산처를 선택하세요</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.name}>
                      {partner.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-neutral-500">
                  * 협력사 관리 메뉴에서 협력사를 추가할 수 있습니다.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  구입일자
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">사양 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  재질
                </label>
                <select
                  value={formData.material}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">재질 선택</option>
                  <option value="steel">강철</option>
                  <option value="aluminum">알루미늄</option>
                  <option value="stainless">스테인리스</option>
                  <option value="carbon-steel">탄소강</option>
                  <option value="other">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  중량 (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                치수 (mm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="길이"
                    min="0"
                  />
                  <span className="text-xs text-neutral-500 mt-1 block">길이</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="너비"
                    min="0"
                  />
                  <span className="text-xs text-neutral-500 mt-1 block">너비</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="높이"
                    min="0"
                  />
                  <span className="text-xs text-neutral-500 mt-1 block">높이</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  캐비티 수
                </label>
                <input
                  type="number"
                  value={formData.cavityCount}
                  onChange={(e) => handleInputChange('cavityCount', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  최대 압력 (MPa)
                </label>
                <input
                  type="number"
                  value={formData.maxPressure}
                  onChange={(e) => handleInputChange('maxPressure', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">위치 및 상태</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  설치 위치 *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="예: A구역-01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  구역 *
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => handleInputChange('zone', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">구역 선택</option>
                  <option value="A">A구역</option>
                  <option value="B">B구역</option>
                  <option value="C">C구역</option>
                  <option value="D">D구역</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  현재 상태 *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="available">사용 가능</option>
                  <option value="in_use">사용 중</option>
                  <option value="maintenance">정비 중</option>
                  <option value="repair">수리 중</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  정비 주기 (일)
                </label>
                <input
                  type="number"
                  value={formData.maintenanceInterval}
                  onChange={(e) => handleInputChange('maintenanceInterval', parseInt(e.target.value) || 30)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="30"
                  min="1"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">담당자 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  담당자 *
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="담당자명"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  부서 *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">부서 선택</option>
                  <option value="production">생산부</option>
                  <option value="quality">품질부</option>
                  <option value="maintenance">보전부</option>
                  <option value="development">개발부</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                설명 및 특이사항
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="금형에 대한 추가 설명이나 특이사항을 입력하세요"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">이미지 업로드 및 완료</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                금형 이미지
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <p className="text-neutral-600 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-primary cursor-pointer"
                >
                  파일 선택
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">업로드된 이미지</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`업로드된 이미지 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-neutral-900 mb-4">등록 정보 확인</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">금형 ID:</span> {formData.moldId}</div>
                <div><span className="font-medium">금형명:</span> {formData.name}</div>
                <div><span className="font-medium">카테고리:</span> {formData.category}</div>
                <div><span className="font-medium">위치:</span> {formData.location}</div>
                <div><span className="font-medium">담당자:</span> {formData.manager}</div>
                <div><span className="font-medium">부서:</span> {formData.department}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
              <h1 className="text-3xl font-semibold text-neutral-900">새 금형 등록</h1>
              <p className="text-neutral-600 mt-1">금형 정보를 입력하여 시스템에 등록하세요</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-neutral-300 text-neutral-400'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-neutral-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-500' : 'bg-neutral-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          <div className="flex gap-3">
            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                className="btn-primary"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? '등록 중...' : '금형 등록'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoldRegistration;
