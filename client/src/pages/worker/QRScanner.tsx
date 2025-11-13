import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  QrCode, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  X
} from 'lucide-react';

interface QRScannerProps {
  onScanSuccess?: (qrData: string) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // 로그인 체크
  useEffect(() => {
    const partnerToken = localStorage.getItem('partner_token');
    if (!partnerToken) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      navigate('/partner/login');
    }
  }, [navigate]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('카메라 접근 권한이 필요합니다.');
      setHasPermission(false);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const qrCode = prompt('QR 코드를 직접 입력하세요:');
    if (qrCode) {
      handleScanResult(qrCode);
    }
  };

  const handleScanResult = async (qrData: string) => {
    try {
      console.log('QR 스캔 시작:', qrData);
      setScanResult(qrData);
      stopCamera();

      // 임시로 세션 토큰 생성 (백엔드 없이 작동)
      const sessionToken = `temp-session-${Date.now()}-${qrData}`;
      localStorage.setItem('qr_session_token', sessionToken);
      console.log('임시 세션 토큰 저장 완료:', sessionToken);
      
      if (onScanSuccess) {
        console.log('onScanSuccess 콜백 호출');
        onScanSuccess(qrData);
      } else {
        // 금형 정보 페이지로 바로 이동
        console.log('금형 정보 페이지로 이동:', `/worker/mold/${qrData}`);
        navigate(`/worker/mold/${qrData}`);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      setError(error instanceof Error ? error.message : '스캔 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)'
            }}>
              <QrCode style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#171717',
                margin: 0
              }}>QR 스캔</h1>
              <p style={{
                fontSize: '14px',
                color: '#525252',
                margin: 0
              }}>금형관리 시스템</p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => window.location.href = '/admin/login'}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              관리자
            </button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: '#737373'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Scanner Area */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {!isScanning && !scanResult && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '160px',
                height: '160px',
                margin: '0 auto 32px',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
              }}>
                <QrCode style={{ width: '80px', height: '80px', color: '#0284c7' }} />
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#171717',
                  margin: '0 0 12px 0'
                }}>
                  QR 코드를 스캔하세요
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#525252',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  금형에 부착된 QR 코드를 카메라로 스캔하여<br />
                  작업을 시작하세요.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={startCamera}
                  disabled={hasPermission === false}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
                    cursor: hasPermission === false ? 'not-allowed' : 'pointer',
                    opacity: hasPermission === false ? 0.5 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => {
                    if (hasPermission !== false) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(14, 165, 233, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (hasPermission !== false) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.3)';
                    }
                  }}
                >
                  <Camera style={{ width: '24px', height: '24px' }} />
                  카메라 시작
                </button>
                
                <button
                  onClick={handleManualInput}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    color: '#404040',
                    fontWeight: '600',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  직접 입력
                </button>
              </div>

              {/* 테스트용 QR 코드 섹션 */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#171717',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>테스트용 QR 코드</h3>
                
                {/* 정상 상태 금형들 */}
                <div style={{ marginBottom: '10px' }}>
                  <p style={{
                    fontSize: '11px',
                    color: '#22c55e',
                    fontWeight: '600',
                    marginBottom: '6px'
                  }}>✅ 정상 상태 금형</p>
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleScanResult('M-2024-001')}
                      style={{
                        padding: '6px 10px',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>M-2024-001</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>스마트폰 케이스</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleScanResult('M-2024-002')}
                      style={{
                        padding: '6px 10px',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                        color: '#15803d',
                        border: '1px solid #86efac',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>M-2024-002</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>자동차 부품</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 주의 상태 금형들 */}
                <div style={{ marginBottom: '10px' }}>
                  <p style={{
                    fontSize: '11px',
                    color: '#f59e0b',
                    fontWeight: '600',
                    marginBottom: '6px'
                  }}>⚠️ 주의 상태 금형</p>
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleScanResult('M-2024-003')}
                      style={{
                        padding: '6px 10px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        color: '#d97706',
                        border: '1px solid #fbbf24',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>M-2024-003</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>플라스틱 용기</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleScanResult('M-2024-004')}
                      style={{
                        padding: '6px 10px',
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        color: '#d97706',
                        border: '1px solid #fbbf24',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>M-2024-004</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>전자부품</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 긴급 상태 금형들 */}
                <div style={{ marginBottom: '10px' }}>
                  <p style={{
                    fontSize: '11px',
                    color: '#ef4444',
                    fontWeight: '600',
                    marginBottom: '6px'
                  }}>🚨 긴급 상태 금형</p>
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleScanResult('M-2024-005')}
                      style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        color: '#dc2626',
                        border: '1px solid #f87171',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>M-2024-005</div>
                        <div style={{ fontSize: '8px', opacity: 0.8 }}>의료기기</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleScanResult('M-2024-006')}
                      style={{
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        color: '#dc2626',
                        border: '1px solid #f87171',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>M-2024-006</div>
                        <div style={{ fontSize: '8px', opacity: 0.8 }}>가전제품</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 랜덤 테스트 버튼 */}
                <div style={{
                  textAlign: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <button
                    onClick={() => {
                      const randomMolds = ['M-2024-001', 'M-2024-002', 'M-2024-003', 'M-2024-004', 'M-2024-005', 'M-2024-006'];
                      const randomMold = randomMolds[Math.floor(Math.random() * randomMolds.length)];
                      handleScanResult(randomMold);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    🎲 랜덤 QR 스캔
                  </button>
                </div>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-neutral-600 mb-4">
                  QR 코드를 화면 중앙에 맞춰주세요
                </p>
                <button
                  onClick={stopCamera}
                  className="btn-secondary"
                >
                  스캔 중지
                </button>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  스캔 완료
                </h3>
                <p className="text-neutral-600">
                  QR 코드가 성공적으로 인식되었습니다.
                </p>
              </div>

              <div className="bg-neutral-100 rounded-lg p-3">
                <p className="text-sm text-neutral-700 font-mono break-all">
                  {scanResult}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">오류 발생</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => {
                    setError(null);
                    setScanResult(null);
                  }}
                  className="btn-secondary text-sm"
                >
                  <RefreshCw className="mr-1 h-4 w-4" />
                  다시 시도
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#171717',
            marginBottom: '16px',
            textAlign: 'center'
          }}>사용 방법</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '16px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>1</div>
              <p style={{
                fontSize: '14px',
                color: '#1e40af',
                fontWeight: '500',
                margin: 0
              }}>금형에 부착된 QR 코드를 찾으세요</p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              borderRadius: '16px',
              border: '1px solid #86efac'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#22c55e',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>2</div>
              <p style={{
                fontSize: '14px',
                color: '#15803d',
                fontWeight: '500',
                margin: 0
              }}>카메라를 QR 코드에 가까이 대세요</p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
              borderRadius: '16px',
              border: '1px solid #c4b5fd'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#8b5cf6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>3</div>
              <p style={{
                fontSize: '14px',
                color: '#7c3aed',
                fontWeight: '500',
                margin: 0
              }}>자동으로 인식되면 작업 화면으로 이동합니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
