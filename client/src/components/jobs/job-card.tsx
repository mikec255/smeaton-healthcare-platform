import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, PoundSterling, Building, Eye } from "lucide-react";
import { type Job } from "@shared/schema";

interface JobCardProps {
  job: Job;
  onViewDetails: () => void;
  onApply: () => void;
}

export default function JobCard({ job, onViewDetails, onApply }: JobCardProps) {
  const formatSalary = (job: Job) => {
    const min = job.salaryMin / 100; // Convert from pence to pounds
    const max = job.salaryMax ? job.salaryMax / 100 : null;
    
    if (job.salaryType === "hourly") {
      return max ? `£${min.toFixed(2)}-£${max.toFixed(2)} per hour` : `£${min.toFixed(2)} per hour`;
    } else if (job.salaryType === "weekly") {
      return max ? `£${min.toFixed(0)}-£${max.toFixed(0)} per week` : `£${min.toFixed(0)} per week`;
    } else {
      return max ? `£${min.toLocaleString()}-£${max.toLocaleString()} per year` : `£${min.toLocaleString()} per year`;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "permanent": return "bg-primary/10 text-primary";
      case "care-at-home": return "bg-accent/10 text-accent";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case "care-at-home": return "Care at Home";
      case "permanent": return "Permanent";
      case "temporary": return "Temporary";
      default: return type;
    }
  };

  return (
    <Card 
      className="shadow-lg border border-border hover:shadow-xl transition-shadow"
      data-testid={`job-card-${job.id}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2" data-testid={`job-title-${job.id}`}>
              {job.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={getTypeColor(job.type)} data-testid={`job-type-${job.id}`}>
                {formatType(job.type)}
              </Badge>
              {job.department && (
                <Badge variant="outline" data-testid={`job-department-${job.id}`}>
                  {job.department}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground text-sm space-x-4 mb-4">
              <span className="flex items-center" data-testid={`job-location-${job.id}`}>
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </span>
              <span className="flex items-center" data-testid={`job-salary-${job.id}`}>
                <PoundSterling className="h-4 w-4 mr-1" />
                {formatSalary(job)}
              </span>
              {job.department && (
                <span className="flex items-center" data-testid={`job-workplace-${job.id}`}>
                  <Building className="h-4 w-4 mr-1" />
                  {job.department}
                </span>
              )}
            </div>
          </div>
          <Button 
            onClick={onViewDetails} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 ml-4"
            data-testid={`button-view-details-${job.id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-4" data-testid={`job-summary-${job.id}`}>
          {job.summary}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {job.reportsTo && (
              <span data-testid={`job-reports-to-${job.id}`}>
                Reports to: {job.reportsTo}
              </span>
            )}
          </div>
          <Button 
            onClick={onApply} 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/10"
            data-testid={`button-quick-apply-${job.id}`}
          >
            Quick Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
