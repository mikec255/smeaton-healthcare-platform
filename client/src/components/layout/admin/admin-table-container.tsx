import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminTableContainerProps {
  title?: string;
  description?: string;
  filters?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

export function AdminTableContainer({
  title,
  description,
  filters,
  children,
  actions,
}: AdminTableContainerProps) {
  return (
    <Card>
      {(title || description || actions) && (
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {title && <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>}
              {description && (
                <CardDescription className="text-sm mt-1">{description}</CardDescription>
              )}
            </div>
            {actions}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4 sm:p-6 space-y-4">
        {filters}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
