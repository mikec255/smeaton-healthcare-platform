import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Home, ChevronDown, Menu, X } from 'lucide-react';
import { type User } from '@shared/schema';
import { generateBreadcrumbs, navigationItems, type NavItem } from '@/config/admin-nav';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Get current user using default fetcher
  const { data: authUser } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = authUser?.user;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href) && href !== '#';
  };

  const isParentActive = (item: NavItem) => {
    if (item.href !== '#' && isActive(item.href)) return true;
    return item.submenu?.some(sub => isActive(sub.href)) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-testid="button-toggle-sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
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
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Welcome back, {user?.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20 overflow-y-auto",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id] ?? isParentActive(item);
            const Icon = item.icon;

            if (hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isParentActive(item)
                        ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    data-testid={`button-toggle-${item.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded ? "transform rotate-180" : ""
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {item.submenu?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link key={subItem.id} href={subItem.href}>
                            <a
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                isActive(subItem.href)
                                  ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-medium"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              )}
                              data-testid={`link-${subItem.id}`}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </a>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={item.id} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  data-testid={`link-${item.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page Content */}
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}