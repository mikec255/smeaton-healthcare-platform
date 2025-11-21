import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-pink-600",
  badge,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {Icon && (
          <div className="hidden sm:flex items-center gap-2">
            <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
