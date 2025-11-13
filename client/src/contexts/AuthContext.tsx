import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'operator';
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user info
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // 임시 데모 토큰 검증 (개발용)
      if (token.startsWith('demo-token-')) {
        const username = token.replace('demo-token-', '');
        const demoUser = {
          id: username === 'admin' ? '1' : '2',
          username,
          email: `${username}@moldmanagement.com`,
          full_name: username === 'admin' ? '시스템 관리자' : '생산 관리자',
          role: username === 'admin' ? 'admin' as const : 'manager' as const,
          department: username === 'admin' ? 'IT' : '생산부'
        };
        setUser(demoUser);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // 임시 데모 로그인 (개발용)
      if ((username === 'admin' && password === 'admin123') || 
          (username === 'manager' && password === 'manager123')) {
        const demoUser = {
          id: username === 'admin' ? '1' : '2',
          username,
          email: `${username}@moldmanagement.com`,
          full_name: username === 'admin' ? '시스템 관리자' : '생산 관리자',
          role: username === 'admin' ? 'admin' as const : 'manager' as const,
          department: username === 'admin' ? 'IT' : '생산부'
        };
        
        localStorage.setItem('auth_token', 'demo-token-' + username);
        setUser(demoUser);
        return true;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem('auth_token', token);
        setUser(userData);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
