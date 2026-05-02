import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Briefcase } from "lucide-react";
import JobsTable from "@/components/admin/jobs-table";
import JobFormModal from "@/components/admin/job-form-modal";
import { useLocation } from "wouter";
import { type Job } from "@shared/schema";
import { 
  AdminPageLayout, 
  AdminPageHeader, 
  AdminStatGrid, 
  AdminFilterBar,
  AdminTableContainer 
} from "@/components/layout/admin";

export default function JobsAdmin() {
  const [location] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const { data: jobs = [], isLoading, error } = useQuery<Job[]>({
    queryKey: ["/api/admin/jobs"],
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && job.isActive) ||
                         (statusFilter === "inactive" && !job.isActive);
    
    const matchesBranch = branchFilter === "all" || 
                         (job.branch || "Plymouth") === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleAddJob = () => {
    setSelectedJob(null);
    setIsJobModalOpen(true);
  };

  const closeModal = () => {
    setIsJobModalOpen(false);
    setSelectedJob(null);
  };

  if (error) {
    return (
      <AdminPageLayout>
        <AdminPageHeader
          title="Jobs"
          description="Manage job listings and recruitment"
          icon={Briefcase}
        />
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load jobs</h3>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title="Jobs"
        description="Manage job listings and recruitment"
        icon={Briefcase}
        actions={
          <Button onClick={handleAddJob} className="gap-2 w-full sm:w-auto" data-testid="button-add-job">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Job</span>
            <span className="sm:hidden">Create</span>
          </Button>
        }
      />

      <div className="space-y-4 sm:space-y-6">
        <AdminStatGrid
          stats={[
            { label: "Total Jobs", value: jobs.length },
            { label: "Active Jobs", value: jobs.filter(job => job.isActive).length, valueColor: "text-green-600" },
            { label: "Inactive Jobs", value: jobs.filter(job => !job.isActive).length, valueColor: "text-orange-600" },
          ]}
        />

        <AdminTableContainer
          title="Job Listings"
          description="Manage all job postings and their publication status"
          filters={
            <AdminFilterBar>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, location, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-branch-filter">
                  <SelectValue placeholder="Filter by branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Plymouth">Plymouth</SelectItem>
                  <SelectItem value="Truro">Truro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </AdminFilterBar>
          }
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading jobs...</p>
            </div>
          ) : (
            <JobsTable jobs={filteredJobs} onEdit={handleEditJob} />
          )}
        </AdminTableContainer>
      </div>

      {/* Job Form Modal */}
      <JobFormModal
        job={selectedJob}
        isOpen={isJobModalOpen}
        onClose={closeModal}
      />
    </AdminPageLayout>
  );
}