import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface UploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ValidationError[];
}

const ExcelUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 엑셀 파일 확인
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        return;
      }
      
      setFile(selectedFile);
      setResult(null);
    }
  };

  const downloadTemplate = () => {
    // 템플릿 다운로드 API 호출
    const link = document.createElement('a');
    link.href = '/api/admin/molds/template';
    link.download = '금형정보_등록템플릿.xlsx';
    link.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/molds/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        alert(data.error || '업로드 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
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
            <h1 className="text-2xl font-semibold text-neutral-900">엑셀 일괄 등록</h1>
            <p className="text-neutral-600 mt-1">엑셀 파일을 통해 금형 정보를 일괄 등록하세요</p>
          </div>
        </div>
      </div>

      {/* 템플릿 다운로드 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">1. 템플릿 다운로드</h2>
        <p className="text-neutral-600 mb-4">
          먼저 등록 템플릿을 다운로드하여 금형 정보를 입력하세요.
        </p>
        <button
          onClick={downloadTemplate}
          className="btn-secondary flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          템플릿 다운로드
        </button>
      </div>

      {/* 파일 업로드 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">2. 파일 업로드</h2>
        
        {!file ? (
          <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center">
            <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">엑셀 파일을 드래그하거나 클릭하여 업로드</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="btn-primary cursor-pointer"
            >
              파일 선택
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Upload className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{file.name}</p>
                  <p className="text-sm text-neutral-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-neutral-600" />
              </button>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary flex-1"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    업로드 중...
                  </div>
                ) : (
                  '업로드 시작'
                )}
              </button>
              <button
                onClick={resetUpload}
                className="btn-secondary"
                disabled={uploading}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 업로드 결과 */}
      {result && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">3. 업로드 결과</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-neutral-900">{result.totalRows}</p>
              <p className="text-sm text-neutral-600">총 행 수</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
              <p className="text-sm text-green-600">성공</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
              <p className="text-sm text-red-600">실패</p>
            </div>
          </div>

          {result.success ? (
            <div className="flex items-center p-4 bg-green-50 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-green-800">업로드 완료</p>
                <p className="text-sm text-green-600">
                  {result.successCount}개의 금형 정보가 성공적으로 등록되었습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">부분 완료</p>
                  <p className="text-sm text-yellow-600">
                    일부 데이터에 오류가 있습니다. 아래 오류 목록을 확인하세요.
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-medium text-neutral-900 mb-3">오류 목록</h3>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-3 py-2 text-left">행</th>
                          <th className="px-3 py-2 text-left">필드</th>
                          <th className="px-3 py-2 text-left">오류 내용</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {result.errors.map((error, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{error.row}</td>
                            <td className="px-3 py-2">{error.field}</td>
                            <td className="px-3 py-2 text-red-600">{error.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={resetUpload}
              className="btn-secondary"
            >
              다시 업로드
            </button>
            <button
              onClick={() => navigate('/admin/molds')}
              className="btn-primary"
            >
              금형 목록으로
            </button>
          </div>
        </div>
      )}

      {/* 업로드 가이드 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">업로드 가이드</h2>
        <div className="space-y-3 text-sm text-neutral-600">
          <div className="flex items-start space-x-2">
            <span className="font-medium text-primary-600">1.</span>
            <p>템플릿을 다운로드하여 필수 항목을 모두 입력하세요.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-primary-600">2.</span>
            <p>품번, 품명, 대상차종, 제작처, 위치는 필수 입력 항목입니다.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-primary-600">3.</span>
            <p>날짜는 YYYY-MM-DD 형식으로 입력하세요. (예: 2024-01-15)</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-primary-600">4.</span>
            <p>숫자 항목은 숫자만 입력하세요. (중량, 캐비티 수, 비용 등)</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-primary-600">5.</span>
            <p>최대 1,000개의 금형 정보를 한 번에 업로드할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
