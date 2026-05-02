import { useState } from "react";
import Seo from "@/components/seo";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Clock as TickerClock, Star as TickerStar } from "lucide-react";
import { SiTrustpilot } from "react-icons/si";
import nhsLogoImg from "@assets/nhs_logo.png";
import googleLogoImg from "@assets/google_logo_white.svg";
import JobFilters from "@/components/jobs/job-filters";
import JobCard from "@/components/jobs/job-card";
import JobDetailsModal from "@/components/jobs/job-details-modal";
import SimpleJobApplicationModal from "@/components/jobs/job-application-modal-simple";
import JobFormModal from "@/components/admin/job-form-modal";
import { type Job } from "@shared/schema";
import { PageSEO, pageSEO } from "@/components/seo/PageSEO";
import { JobPostingSchema } from "@/components/seo/StructuredData";

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

  const { data: jobs, isLoading, error, refetch } = useQuery<Job[]>({
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
      console.log('Fetching jobs from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch jobs:', response.status, response.statusText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Jobs fetched successfully:', data);
      return data;
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
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
  const BLUE = "#275799";
  const PINK = "#EF2A86";
  const CREAM = "#FDF7F0";
  const SCRIPT = { fontFamily: "'Dancing Script', cursive" };

  const ticker = (
    <div style={{ backgroundColor: PINK, padding: "10px 0" }}>
      <div className="w-full flex items-center justify-center flex-nowrap gap-x-8 px-8 overflow-x-auto">
        <span className="inline-flex items-center gap-2 shrink-0">
          <img src={googleLogoImg} alt="Google" style={{ height: "18px", width: "auto" }} />
          <span className="text-white text-sm font-medium">4.9</span>
        </span>
        <span className="text-white/30 shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <SiTrustpilot style={{ color: "#00B67A", fontSize: "18px" }} />
          <span className="text-white text-sm font-medium">Trustpilot 4.6</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <img src={nhsLogoImg} alt="NHS" style={{ height: "26px", width: "auto", filter: "brightness(0) invert(1)" }} />
          <span className="text-white text-sm font-medium">Approved Provider</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <span className="text-white text-sm font-medium whitespace-nowrap">CQC Rated Good</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <TickerClock size={15} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium whitespace-nowrap">Care within 24 hours</span>
        </span>
        <span className="text-white/30 hidden sm:inline shrink-0">|</span>
        <span className="hidden sm:inline-flex items-center gap-2 shrink-0">
          <TickerStar size={15} className="text-white shrink-0" />
          <span className="text-white text-sm font-medium whitespace-nowrap">Private Care Available</span>
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {ticker}
        <section style={{ backgroundColor: CREAM }} className="py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-3" style={{ borderBottom: `2px solid ${PINK}` }}></div>
            <p className="text-gray-400 text-sm" data-testid="jobs-loading">Loading job opportunities...</p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-left" data-testid="jobs-error">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load jobs</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              data-testid="button-retry-jobs"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get salary unit text
  const getSalaryUnit = (salaryType: string) => {
    switch (salaryType) {
      case 'hourly': return 'HOUR';
      case 'weekly': return 'WEEK';
      case 'annual': return 'YEAR';
      default: return 'HOUR';
    }
  };

  return (
    <div data-testid="jobs-page">
      <Seo title="Healthcare Jobs in Devon & Cornwall" description="Join the Smeaton Healthcare team. We're hiring compassionate care workers across Plymouth and Cornwall. View current vacancies and apply online." path="/jobs" />
      {ticker}

      {/* HERO */}
      <section style={{ backgroundColor: CREAM }} className="py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: PINK }}>Careers</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight" style={{ color: BLUE }} data-testid="jobs-title">Career Opportunities</h1>
              <div className="mb-4" style={{ ...SCRIPT, fontSize: "clamp(2rem, 4vw, 3rem)", color: PINK }}>join a team that cares.</div>
              <p className="text-gray-500 text-base max-w-xl leading-relaxed" data-testid="jobs-subtitle">
                Join our compassionate team and make a real difference in people's lives across Devon and Cornwall.
              </p>
            </div>
            {isAdmin && (
              <div className="shrink-0 ml-6">
                <Button onClick={handleCreateJob} style={{ backgroundColor: PINK }} className="text-white hover:opacity-90 font-bold" data-testid="button-create-job">
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
