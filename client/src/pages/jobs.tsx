import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import JobFilters from "@/components/jobs/job-filters";
import JobCard from "@/components/jobs/job-card";
import JobDetailsModal from "@/components/jobs/job-details-modal";
import SimpleJobApplicationModal from "@/components/jobs/job-application-modal-simple";
import JobFormModal from "@/components/admin/job-form-modal";
import { type Job } from "@shared/schema";

export default function Jobs() {
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    salaryRange: "",
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

  // Check if user is authenticated and is an admin
  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/auth/me", {
        credentials: 'include',
        headers,
      });
      if (!response.ok) return null;
      return response.json();
    },
    retry: false,
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: [
      "/api/jobs", 
      { location: filters.location, type: filters.type, salaryRange: filters.salaryRange }
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.location && filters.location !== 'all') params.set('location', filters.location);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.salaryRange && filters.salaryRange !== 'all') params.set('salaryRange', filters.salaryRange);
      
      const url = `/api/jobs${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
    enabled: true,
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setShowApplication(true);
  };

  const handleCloseModals = () => {
    setSelectedJob(null);
    setShowApplication(false);
  };

  const handleCreateJob = () => {
    setShowJobForm(true);
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
  };

  // Check if user is admin
  const isAdmin = authUser?.user && ["admin", "superadmin"].includes(authUser.user.role);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center" data-testid="jobs-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="jobs-page">
      {/* Jobs Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-between mb-8">
          <div></div> {/* Left spacer */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="jobs-title">
              Career Opportunities
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="jobs-subtitle">
              Join our compassionate team and make a difference in people's lives
            </p>
          </div>
          
          {/* Right side - Create Job Button for Admin Users or empty spacer */}
          <div className="flex justify-end">
            {isAdmin && (
              <Button 
                onClick={handleCreateJob}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-create-job"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Job Filters */}
      <JobFilters onFilterChange={handleFilterChange} />
      
      {/* Job Listings */}
      <div className="space-y-6" data-testid="job-listings">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={() => handleJobSelect(job)}
              onApply={() => handleApplyClick(job)}
            />
          ))
        ) : (
          <div className="text-center py-12" data-testid="no-jobs-message">
            <p className="text-muted-foreground">
              {filters.location || filters.type || filters.salaryRange
                ? "No jobs found matching your criteria. Try adjusting your filters."
                : "No job opportunities available at the moment. Please check back later."}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedJob && !showApplication && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={true}
          onClose={handleCloseModals}
          onApply={() => setShowApplication(true)}
        />
      )}

      {selectedJob && showApplication && (
        <SimpleJobApplicationModal
          job={selectedJob}
          isOpen={true}
          onClose={handleCloseModals}
        />
      )}

      {/* Job Creation Modal for Admin Users */}
      {showJobForm && (
        <JobFormModal
          isOpen={true}
          onClose={handleCloseJobForm}
        />
      )}
    </div>
  );
}
