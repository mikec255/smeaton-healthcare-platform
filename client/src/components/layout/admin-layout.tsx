import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Menu, 
  X, 
  BarChart3,
  LogOut,
  ChevronRight,
  Home
} from 'lucide-react';
import { type User } from '@shared/schema';
import { navigationItems, type NavItem, generateBreadcrumbs } from '@/config/admin-nav';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['overview']);
  const [location, setLocation] = useLocation();

  // Get current user using default fetcher
  const { data: authUser } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
    setLocation('/login');
  };

  const isCurrentPath = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href);
  };

  const user = authUser?.user;
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-pink-600 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Admin
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigationItems
              .filter(item => !item.adminOnly || isSuperAdmin)
              .map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedMenus.includes(item.id);
                const IconComponent = item.icon;

                return (
                  <div key={item.id}>
                    {hasSubmenu ? (
                      <Button
                        variant="ghost"
                        className={`w-full justify-start px-3 py-2 text-left font-normal h-auto
                          ${isCurrentPath(item.href) ? 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                        `}
                        onClick={() => toggleMenu(item.id)}
                      >
                        <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="ghost"
                        className={`w-full justify-start px-3 py-2 text-left font-normal h-auto
                          ${isCurrentPath(item.href) ? 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                        `}
                        data-testid={`nav-item-${item.id}`}
                      >
                        <Link href={item.href}>
                          <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs bg-pink-600 text-white px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </Button>
                    )}

                    {/* Submenu */}
                    {hasSubmenu && isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu!.map((subItem) => {
                          const SubIconComponent = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              asChild
                              variant="ghost"
                              className={`w-full justify-start px-3 py-1.5 text-left font-normal h-auto text-sm
                                ${isCurrentPath(subItem.href) ? 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
                              `}
                              data-testid={`nav-subitem-${subItem.id}`}
                            >
                              <Link href={subItem.href}>
                                <SubIconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                                <span className="flex-1">{subItem.label}</span>
                                {subItem.badge && (
                                  <span className="ml-auto text-xs bg-pink-600 text-white px-1.5 py-0.5 rounded-full">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-pink-600 text-white text-sm font-medium">
                  {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.username || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'admin'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
                <Link href="/admin" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Home className="w-4 h-4" />
                  <span className="sr-only">Dashboard</span>
                </Link>
                {(() => {
                  const breadcrumbs = generateBreadcrumbs(location);
                  
                  return breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                      <span className={item.current ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                        {item.label}
                      </span>
                    </div>
                  ));
                })()}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Welcome back, {user?.username}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}