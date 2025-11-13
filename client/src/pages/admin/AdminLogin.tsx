import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 32px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.25)'
          }}>
            <LogIn style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#171717',
            margin: '0 0 8px 0'
          }}>
            금형관리 시스템
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#525252',
            margin: 0
          }}>
            관리자 계정으로 로그인하세요
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '24px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#404040',
                marginBottom: '8px'
              }}>
                아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e5e5',
                  fontSize: '16px',
                  background: 'white',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e5e5';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#404040',
                marginBottom: '8px'
              }}>
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e5e5e5',
                    fontSize: '16px',
                    background: 'white',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0ea5e9';
                    e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e5e5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#a3a3a3',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '20px', height: '20px' }} />
                  ) : (
                    <Eye style={{ width: '20px', height: '20px' }} />
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                style={{
                  width: '100%',
                  background: isLoading || !username || !password 
                    ? '#d4d4d4' 
                    : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: isLoading || !username || !password 
                    ? 'none' 
                    : '0 8px 25px rgba(14, 165, 233, 0.3)',
                  cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!isLoading && username && password) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(14, 165, 233, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && username && password) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(14, 165, 233, 0.3)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn style={{ width: '20px', height: '20px' }} />
                    로그인
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e5e5'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#525252',
              textAlign: 'center',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              데모 계정 (개발용)
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #93c5fd'
              }}>
                <p style={{
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '4px',
                  margin: 0
                }}>관리자</p>
                <p style={{
                  color: '#1d4ed8',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  margin: 0
                }}>admin / admin123</p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #86efac'
              }}>
                <p style={{
                  fontWeight: '600',
                  color: '#15803d',
                  marginBottom: '4px',
                  margin: 0
                }}>매니저</p>
                <p style={{
                  color: '#166534',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  margin: 0
                }}>manager / manager123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{
            fontSize: '12px',
            color: '#737373',
            margin: 0
          }}>
            © 2024 금형관리 전산화 시스템. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
