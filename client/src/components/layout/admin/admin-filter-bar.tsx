import { ReactNode } from "react";

interface AdminFilterBarProps {
  children: ReactNode;
  className?: string;
}

export function AdminFilterBar({ children, className = "" }: AdminFilterBarProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
}
