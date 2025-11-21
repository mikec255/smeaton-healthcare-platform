import { ReactNode } from "react";

interface AdminPageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AdminPageLayout({ children, className = "" }: AdminPageLayoutProps) {
  return (
    <div className={`container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
