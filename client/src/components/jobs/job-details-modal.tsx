import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, PoundSterling, Building, Check, Phone, Mail } from "lucide-react";
import { type Job } from "@shared/schema";

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

export default function JobDetailsModal({ job, isOpen, onClose, onApply }: JobDetailsModalProps) {
  const formatSalary = (job: Job) => {
    const min = job.salaryMin / 100;
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
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
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
            </div>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-muted" data-testid="modal-apply-section">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Apply</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Interested in this position? Apply now and we'll get back to you within 24 hours.
                </p>
                <Button 
                  onClick={onApply}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-apply-now"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
            
            <Card data-testid="modal-benefits-section">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Job Benefits</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center" data-testid={`benefit-${index}`}>
                      <Check className="text-accent h-4 w-4 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card data-testid="modal-contact-section">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Call us for more information
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    hello@smeatonhealthcare.co.uk
                  </p>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Devon & Cornwall
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
