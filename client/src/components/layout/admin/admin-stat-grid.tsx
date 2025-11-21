import { ReactNode } from "react";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  description?: string;
}

function StatCard({ label, value, valueColor, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
        <CardTitle className={`text-xl sm:text-2xl ${valueColor || ""}`}>
          {value}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
    </Card>
  );
}

interface AdminStatGridProps {
  stats: StatCardProps[];
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function AdminStatGrid({ stats, columns }: AdminStatGridProps) {
  const cols = columns || { default: 1, sm: 2, md: 3 };
  const gridClass = `grid gap-3 sm:gap-4 lg:gap-6 
    grid-cols-${cols.default || 1} 
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ""} 
    ${cols.md ? `md:grid-cols-${cols.md}` : ""} 
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ""}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
