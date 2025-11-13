import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  User,
  FileText,
  BarChart3,
  Cog,
  HelpCircle
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setUserMenuOpen(false);
        setQuickMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '금형관리', href: '/admin/molds', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="w-full">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            {/* Left section - Logo and Navigation */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <Link to="/admin/dashboard" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">금</span>
                </div>
                <span className="text-xl font-semibold text-neutral-900 hidden sm:block">금형관리</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                        ${isActive(item.href)
                          ? 'bg-primary-50 text-primary-600 border border-primary-100'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }
                      `}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Quick Actions Dropdown */}
              <div className="relative hidden lg:block dropdown-container">
                <button
                  onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-150"
                >
                  빠른 작업
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                {quickMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-apple border border-neutral-100 py-2 z-50">
                    <Link
                      to="/admin/molds/new"
                      className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150"
                      onClick={() => setQuickMenuOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      새 금형 등록
                    </Link>
                    <Link
                      to="/admin/molds/upload"
                      className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150"
                      onClick={() => setQuickMenuOpen(false)}
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      엑셀 업로드
                    </Link>
                    <div className="border-t border-neutral-100 my-2"></div>
                    <button className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150">
                      <BarChart3 className="mr-3 h-4 w-4" />
                      리포트 생성
                    </button>
                    <button className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150">
                      <Cog className="mr-3 h-4 w-4" />
                      시스템 설정
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-150"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-3 ml-auto">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="금형 검색..."
                  className="pl-10 pr-4 py-2 w-64 xl:w-80 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-150"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-neutral-100 relative transition-colors duration-150">
                <Bell className="h-5 w-5 text-neutral-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent-red rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* User Menu Dropdown */}
              <div className="relative dropdown-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50 transition-colors duration-150"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-neutral-900">{user?.full_name}</p>
                    <p className="text-xs text-neutral-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-neutral-400 hidden lg:block" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-apple border border-neutral-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900">{user?.full_name}</p>
                      <p className="text-xs text-neutral-500">{user?.email}</p>
                      <p className="text-xs text-neutral-500">{user?.department}</p>
                    </div>
                    <button className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150">
                      <User className="mr-3 h-4 w-4" />
                      프로필 설정
                    </button>
                    <button className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150">
                      <Cog className="mr-3 h-4 w-4" />
                      계정 설정
                    </button>
                    <button className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-150">
                      <HelpCircle className="mr-3 h-4 w-4" />
                      도움말
                    </button>
                    <div className="border-t border-neutral-100 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-accent-red hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-apple transform transition-transform duration-200 ease-in-out lg:hidden">
            <div className="flex h-full flex-col">
              {/* Mobile menu header */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-100">
                <span className="text-xl font-semibold text-neutral-900">금형관리</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150
                        ${isActive(item.href)
                          ? 'bg-primary-50 text-primary-600 border border-primary-100'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile user info */}
              <div className="border-t border-neutral-100 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{user?.full_name}</p>
                    <p className="text-xs text-neutral-500">{user?.department}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-3 p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
