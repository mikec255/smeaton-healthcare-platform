import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, PoundSterling, Building } from "lucide-react";
import { type Job } from "@shared/schema";
import SocialShareBar from "@/components/shared/SocialShareBar";

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function JobDetailsModal({ job, isOpen, onClose, onApply }: JobDetailsModalProps) {
  const formatSalary = (job: Job) => {
    const min = job.salaryMin;
    const max = job.salaryMax || null;
    
    if (job.salaryType === "hourly") {
      return max ? `£${min.toFixed(2)}-£${max.toFixed(2)} per hour` : `£${min.toFixed(2)} per hour`;
    } else if (job.salaryType === "weekly") {
      return max ? `£${min.toFixed(2)}-£${max.toFixed(2)} per week` : `£${min.toFixed(2)} per week`;
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

  const benefits = [
    "Competitive salary",
    "Comprehensive training",
    "Career development",
    "Supportive team environment",
    "Flexible working arrangements"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="job-details-modal">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4" data-testid="modal-job-title">
            {job.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getTypeColor(job.type)} data-testid="modal-job-type">
              {formatType(job.type)}
            </Badge>
            {job.department && (
              <Badge variant="outline" data-testid="modal-job-department">
                {job.department}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-muted-foreground space-x-4 mb-6">
            <span className="flex items-center" data-testid="modal-job-location">
              <MapPin className="h-5 w-5 mr-1" />
              {job.location}
            </span>
            <span className="flex items-center" data-testid="modal-job-salary">
              <PoundSterling className="h-5 w-5 mr-1" />
              {formatSalary(job)}
            </span>
            {job.department && (
              <span className="flex items-center" data-testid="modal-job-workplace">
                <Building className="h-5 w-5 mr-1" />
                {job.department}
              </span>
            )}
          </div>
        </DialogHeader>
        
        <Button
          onClick={onApply}
          className="w-full text-white hover:opacity-90"
          style={{ backgroundColor: "#EF2A86" }}
          data-testid="button-apply-now"
        >
          Apply Now
        </Button>

        <div className="prose max-w-none" data-testid="modal-job-content">
          <h3 className="text-xl font-bold mb-4">Job Summary</h3>
          <p className="mb-4">{job.summary}</p>

          {job.description && (
            <>
              <h4 className="text-lg font-semibold mb-3">Full Description</h4>
              <div className="whitespace-pre-line mb-6">{job.description}</div>
            </>
          )}

          {job.requirements && (
            <>
              <h4 className="text-lg font-semibold mb-3">Requirements</h4>
              <div className="whitespace-pre-line mb-6">{job.requirements}</div>
            </>
          )}

          {job.benefits && (
            <>
              <h4 className="text-lg font-semibold mb-3">Benefits</h4>
              <div className="whitespace-pre-line mb-6">{job.benefits}</div>
            </>
          )}

          <SocialShareBar
            title={`${job.title} – Smeaton Healthcare`}
            url={`https://smeatonhealthcare.co.uk/jobs/${job.id}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
