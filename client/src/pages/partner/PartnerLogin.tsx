import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Lock, User, AlertCircle } from 'lucide-react';

const PartnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 더미 협력사 계정 데이터 (실제로는 백엔드에서 검증)
  const partnerAccounts = [
    { username: 'partnerA', password: 'partner123', name: '협력사 A' },
    { username: 'partnerB', password: 'partner123', name: '협력사 B' },
    { username: 'partnerC', password: 'partner123', name: '협력사 C' },
    { username: 'partnerD', password: 'partner123', name: '협력사 D' },
    { username: 'partnerE', password: 'partner123', name: '협력사 E' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 실제로는 백엔드 API 호출
      // const response = await fetch('http://localhost:5001/api/partner/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });

      // 더미 로그인 검증
      const partner = partnerAccounts.find(
        acc => acc.username === username && acc.password === password
      );

      if (partner) {
        // 로그인 성공
        localStorage.setItem('partner_token', 'dummy_token_' + Date.now());
        localStorage.setItem('partner_name', partner.name);
        localStorage.setItem('partner_username', partner.username);
        
        // QR 스캔 페이지로 리다이렉트
        navigate('/worker/scan');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">협력사 로그인</h1>
          <p className="text-slate-600">금형관리 시스템</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 아이디 입력 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                아이디
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="협력사 아이디를 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              협력사 계정이 필요하신가요?<br />
              관리자에게 문의하여 계정을 발급받으세요.
            </p>
          </div>

          {/* 테스트 계정 안내 (개발용) */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-semibold text-slate-700 mb-2">테스트 계정:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p>• 아이디: partnerA ~ partnerE</p>
              <p>• 비밀번호: partner123</p>
            </div>
          </div>
        </div>

        {/* 관리자 로그인 링크 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            관리자 로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
