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

  const NAVY = "#05163D";
  const PINK = "#EF2A86";
  const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

  if (isLoading) {
    return (
      <div>
        <section style={{ backgroundColor: NAVY }} className="py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
            <p className="text-white/60 text-sm" data-testid="jobs-loading">Loading job opportunities...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div data-testid="jobs-page">
      {/* HERO */}
      <section style={{ backgroundColor: NAVY }} className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          {[0,1,2,3].map(i => <div key={i} className="absolute rounded-full border border-white" style={{ width:`${200+i*150}px`,height:`${200+i*150}px`,top:"50%",left:"50%",transform:"translate(-50%,-50%)" }} />)}
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4 text-white/50">Careers</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight" data-testid="jobs-title">Career Opportunities</h1>
              <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: PINK }}>join a team that cares.</div>
              <p className="text-white/60 text-base max-w-xl leading-relaxed" data-testid="jobs-subtitle">
                Join our compassionate team and make a real difference in people's lives across Devon and Cornwall.
              </p>
            </div>
            {isAdmin && (
              <div className="shrink-0 ml-6">
                <Button onClick={handleCreateJob} className="bg-white text-[#05163D] hover:bg-white/90 font-bold" data-testid="button-create-job">
                  <Plus className="h-4 w-4 mr-2" /> Create Job
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      
      {/* Job Filters */}
      <JobFilters onFilterChange={handleFilterChange} />
      
      {/* Job Listings */}
      <div className="space-y-4 mt-6" data-testid="job-listings">
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
          <div className="text-center py-16 rounded-2xl border-2 border-gray-100 bg-white" data-testid="no-jobs-message">
            <p className="text-gray-400 text-base">
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
    </div>
  );
}
