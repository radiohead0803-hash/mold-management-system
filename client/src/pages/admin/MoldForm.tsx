import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';

interface MoldFormData {
  part_number: string;
  part_name: string;
  vehicle_model: string;
  manufacturer: string;
  material: string;
  weight: number | '';
  dimensions: string;
  cavity_count: number | '';
  location: string;
  purchase_date: string;
  purchase_cost: number | '';
  expected_shots: number | '';
  maintenance_cycle: number | '';
  qr_code: string;
  notes: string;
  images: File[];
}

const MoldForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<MoldFormData>({
    part_number: '',
    part_name: '',
    vehicle_model: '',
    manufacturer: '',
    material: '',
    weight: '',
    dimensions: '',
    cavity_count: '',
    location: '',
    purchase_date: '',
    purchase_cost: '',
    expected_shots: '',
    maintenance_cycle: '',
    qr_code: '',
    notes: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.part_number.trim()) {
      newErrors.part_number = '품번을 입력해주세요.';
    }
    if (!formData.part_name.trim()) {
      newErrors.part_name = '품명을 입력해주세요.';
    }
    if (!formData.vehicle_model.trim()) {
      newErrors.vehicle_model = '대상차종을 입력해주세요.';
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = '제작처를 입력해주세요.';
    }
    if (!formData.location.trim()) {
      newErrors.location = '위치를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        weight: formData.weight === '' ? null : Number(formData.weight),
        cavity_count: formData.cavity_count === '' ? null : Number(formData.cavity_count),
        purchase_cost: formData.purchase_cost === '' ? null : Number(formData.purchase_cost),
        expected_shots: formData.expected_shots === '' ? null : Number(formData.expected_shots),
        maintenance_cycle: formData.maintenance_cycle === '' ? null : Number(formData.maintenance_cycle)
      };

      const url = isEdit ? `/api/admin/molds/${id}` : '/api/admin/molds';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        navigate('/admin/molds');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/molds')}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {isEdit ? '금형 정보 수정' : '새 금형 등록'}
            </h1>
            <p className="text-neutral-600 mt-1">
              {isEdit ? '금형 정보를 수정하세요' : '새로운 금형 정보를 등록하세요'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                품번 <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                name="part_number"
                value={formData.part_number}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.part_number ? 'border-accent-red' : 'border-neutral-200'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                placeholder="예: P-2024-001"
              />
              {errors.part_number && (
                <p className="text-sm text-accent-red mt-1">{errors.part_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                품명 <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                name="part_name"
                value={formData.part_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.part_name ? 'border-accent-red' : 'border-neutral-200'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                placeholder="예: 도어 핸들"
              />
              {errors.part_name && (
                <p className="text-sm text-accent-red mt-1">{errors.part_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                대상차종 <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                name="vehicle_model"
                value={formData.vehicle_model}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.vehicle_model ? 'border-accent-red' : 'border-neutral-200'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                placeholder="예: Genesis G90"
              />
              {errors.vehicle_model && (
                <p className="text-sm text-accent-red mt-1">{errors.vehicle_model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                제작처 <span className="text-accent-red">*</span>
              </label>
              <select
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.manufacturer ? 'border-accent-red' : 'border-neutral-200'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
              >
                <option value="">제작처 선택</option>
                <option value="현대모비스">현대모비스</option>
                <option value="플라스틱옴니움">플라스틱옴니움</option>
                <option value="동희산업">동희산업</option>
                <option value="기타">기타</option>
              </select>
              {errors.manufacturer && (
                <p className="text-sm text-accent-red mt-1">{errors.manufacturer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                소재
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: PP, ABS, PC 등"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                중량 (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: 1500"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">상세 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                치수 (L×W×H)
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: 1200×800×600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                캐비티 수
              </label>
              <input
                type="number"
                name="cavity_count"
                value={formData.cavity_count}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: 4"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                위치 <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.location ? 'border-accent-red' : 'border-neutral-200'
                } focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                placeholder="예: 1공장 A라인"
              />
              {errors.location && (
                <p className="text-sm text-accent-red mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                구매일자
              </label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                구매비용 (원)
              </label>
              <input
                type="number"
                name="purchase_cost"
                value={formData.purchase_cost}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: 50000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                예상 수명 (타수)
              </label>
              <input
                type="number"
                name="expected_shots"
                value={formData.expected_shots}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: 1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                점검 주기 (일)
              </label>
              <input
                type="number"
                name="maintenance_cycle"
                value={formData.maintenance_cycle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="예: 30"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                QR 코드
              </label>
              <input
                type="text"
                name="qr_code"
                value={formData.qr_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="자동 생성됩니다"
                readOnly
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              비고
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="추가 정보나 특이사항을 입력하세요"
            />
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">이미지</h2>
          
          <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center">
            <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">이미지를 드래그하거나 클릭하여 업로드</p>
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
              className="btn-secondary cursor-pointer"
            >
              파일 선택
            </label>
          </div>

          {formData.images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-neutral-700 mb-3">
                업로드된 이미지 ({formData.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-accent-red text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/molds')}
            className="btn-secondary"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? '수정' : '등록'}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoldForm;
