import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Eye, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { type Job } from "@shared/schema";

interface JobsTableProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
}

export default function JobsTable({ jobs, onEdit }: JobsTableProps) {
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      toast({
        title: "Job deleted successfully",
        description: "The job listing has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setDeleteJobId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete job",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/jobs/${jobId}`, { isActive });
    },
    onSuccess: (_, { isActive }) => {
      toast({
        title: isActive ? "Job published" : "Job unpublished",
        description: isActive 
          ? "The job listing is now visible to candidates." 
          : "The job listing is no longer visible to candidates.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update job status",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatSalary = (job: Job) => {
    const min = job.salaryMin / 100;
    const max = job.salaryMax ? job.salaryMax / 100 : null;
    
    if (job.salaryType === "hourly") {
      return max ? `£${min.toFixed(2)}-£${max.toFixed(2)}/hr` : `£${min.toFixed(2)}/hr`;
    } else if (job.salaryType === "weekly") {
      return max ? `£${min.toFixed(0)}-£${max.toFixed(0)}/week` : `£${min.toFixed(0)}/week`;
    } else {
      return max ? `£${min.toLocaleString()}-£${max.toLocaleString()}/year` : `£${min.toLocaleString()}/year`;
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

  const handleDelete = (jobId: string) => {
    setDeleteJobId(jobId);
  };

  const confirmDelete = () => {
    if (deleteJobId) {
      deleteJobMutation.mutate(deleteJobId);
    }
  };

  const handleToggleStatus = (job: Job) => {
    toggleJobStatusMutation.mutate({
      jobId: job.id,
      isActive: !job.isActive
    });
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12" data-testid="no-jobs-message">
        <p className="text-muted-foreground">No jobs found. Create your first job listing to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto" data-testid="jobs-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} data-testid={`job-row-${job.id}`}>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground" data-testid={`job-title-${job.id}`}>
                      {job.title}
                    </div>
                    {job.department && (
                      <div className="text-sm text-muted-foreground" data-testid={`job-department-${job.id}`}>
                        {job.department}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className="bg-secondary/10 text-secondary border-secondary/20" 
                    data-testid={`job-branch-${job.id}`}
                  >
                    {job.branch || "Plymouth"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(job.type)} data-testid={`job-type-badge-${job.id}`}>
                    {formatType(job.type)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-foreground" data-testid={`job-location-${job.id}`}>
                  {job.location}
                </TableCell>
                <TableCell className="text-sm text-foreground" data-testid={`job-salary-${job.id}`}>
                  {formatSalary(job)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={job.isActive ? "default" : "secondary"}
                    className={job.isActive ? "bg-accent/10 text-accent" : ""}
                    data-testid={`job-status-${job.id}`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(job)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                      data-testid={`button-edit-${job.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {/* TODO: Implement view applications */}}
                      className="text-secondary hover:text-secondary/80 hover:bg-secondary/10"
                      data-testid={`button-view-applications-${job.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleStatus(job)}
                      className={job.isActive 
                        ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                        : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }
                      disabled={toggleJobStatusMutation.isPending}
                      data-testid={`button-toggle-status-${job.id}`}
                      title={job.isActive ? "Unpublish job" : "Publish job"}
                    >
                      {job.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      data-testid={`button-delete-${job.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent data-testid="delete-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job listing
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteJobMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteJobMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
