import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, PoundSterling, Eye } from "lucide-react";
import { type Job } from "@shared/schema";

const PINK = "#EF2A86";
const NAVY = "#05163D";

interface JobCardProps {
  job: Job;
  onViewDetails: () => void;
  onApply: () => void;
}

export default function JobCard({ job, onViewDetails, onApply }: JobCardProps) {
  const formatSalary = (job: Job) => {
    const min = job.salaryMin;
    const max = job.salaryMax || null;
    if (job.salaryType === "hourly") {
      return max ? `£${min.toFixed(2)}–£${max.toFixed(2)} / hr` : `£${min.toFixed(2)} / hr`;
    } else if (job.salaryType === "weekly") {
      return max ? `£${min.toFixed(0)}–£${max.toFixed(0)} / wk` : `£${min.toFixed(0)} / wk`;
    } else {
      return max ? `£${min.toLocaleString()}–£${max.toLocaleString()} / yr` : `£${min.toLocaleString()} / yr`;
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case "care-at-home": return "Care at Home";
      case "permanent":    return "Permanent";
      case "temporary":    return "Temporary";
      default:             return type;
    }
  };

  return (
    <Card
      className="shadow-md border border-gray-100 hover:shadow-lg transition-shadow rounded-2xl"
      data-testid={`job-card-${job.id}`}
    >
      <CardContent className="p-5 sm:p-6">

        {/* Top row: title + button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg sm:text-xl font-bold leading-snug" style={{ color: NAVY }} data-testid={`job-title-${job.id}`}>
            {job.title}
          </h3>
          <button
            onClick={onViewDetails}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PINK }}
            data-testid={`button-view-details-${job.id}`}
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className="bg-pink-50 text-pink-600 border-0 font-semibold" data-testid={`job-type-${job.id}`}>
            {formatType(job.type)}
          </Badge>
          {job.department && job.department !== job.type && (
            <Badge variant="outline" className="font-medium" data-testid={`job-department-${job.id}`}>
              {job.department}
            </Badge>
          )}
        </div>

        {/* Info row — wraps cleanly on mobile */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1" data-testid={`job-location-${job.id}`}>
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: PINK }} />
            {job.location}
          </span>
          <span className="flex items-center gap-1" data-testid={`job-salary-${job.id}`}>
            <PoundSterling className="h-3.5 w-3.5 shrink-0" style={{ color: PINK }} />
            {formatSalary(job)}
          </span>
        </div>

        {/* Summary */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4" data-testid={`job-summary-${job.id}`}>
          {job.summary}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400" data-testid={`job-reports-to-${job.id}`}>
            {job.reportsTo ? `Reports to: ${job.reportsTo}` : ""}
          </span>
          <Button
            onClick={onApply}
            variant="outline"
            className="text-sm font-bold border-2 hover:opacity-90"
            style={{ borderColor: PINK, color: PINK }}
            data-testid={`button-quick-apply-${job.id}`}
          >
            Quick Apply
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
