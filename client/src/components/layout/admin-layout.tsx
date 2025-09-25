import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Home } from 'lucide-react';
import { type User } from '@shared/schema';
import { generateBreadcrumbs } from '@/config/admin-nav';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  // Get current user using default fetcher
  const { data: authUser } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const user = authUser?.user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-4">
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

      {/* Page Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}