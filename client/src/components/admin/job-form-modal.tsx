import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save } from "lucide-react";
import { type Job } from "@shared/schema";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  type: z.string().min(1, "Job type is required"),
  location: z.string().min(1, "Location is required"),
  department: z.string().optional(),
  branch: z.string().min(1, "Branch is required"),
  salaryType: z.string().min(1, "Salary type is required"),
  salaryMin: z.number().min(0, "Minimum salary is required"),
  salaryMax: z.number().optional(),
  summary: z.string().min(1, "Job summary is required"),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  reportsTo: z.string().optional(),
  experienceLevel: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface JobFormModalProps {
  job?: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobFormModal({ job, isOpen, onClose }: JobFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!job;

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: job ? {
      title: job.title,
      type: job.type,
      location: job.location,
      department: job.department || "",
      branch: job.branch || "Plymouth",
      salaryType: job.salaryType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax || undefined,
      summary: job.summary,
      description: job.description,
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      reportsTo: job.reportsTo || "",
      experienceLevel: job.experienceLevel || "",
      isActive: job.isActive ?? true,
    } : {
      title: "",
      type: "",
      location: "",
      department: "",
      branch: "Plymouth",
      salaryType: "",
      salaryMin: 0,
      salaryMax: undefined,
      summary: "",
      description: "",
      requirements: "",
      benefits: "",
      reportsTo: "",
      experienceLevel: "",
      isActive: true,
    },
  });

  // Reset form when job prop changes (for editing existing jobs)
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        type: job.type,
        location: job.location,
        department: job.department || "",
        branch: job.branch || "Plymouth",
        salaryType: job.salaryType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax || undefined,
        summary: job.summary,
        description: job.description,
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        reportsTo: job.reportsTo || "",
        experienceLevel: job.experienceLevel || "",
        isActive: job.isActive ?? true,
      });
    } else {
      // Reset to empty form for creating new jobs
      form.reset({
        title: "",
        type: "",
        location: "",
        department: "",
        branch: "Plymouth",
        salaryType: "",
        salaryMin: 0,
        salaryMax: undefined,
        summary: "",
        description: "",
        requirements: "",
        benefits: "",
        reportsTo: "",
        experienceLevel: "",
        isActive: true,
      });
    }
  }, [job, form]);

  const createJobMutation = useMutation({
    mutationFn: async (data: z.infer<typeof jobSchema>) => {
      const response = await apiRequest("POST", "/api/jobs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job created successfully",
        description: "The new job listing is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create job",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: z.infer<typeof jobSchema>) => {
      const response = await apiRequest("PUT", `/api/jobs/${job!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job updated successfully",
        description: "The job listing has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update job",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof jobSchema>) => {
    if (isEditing) {
      updateJobMutation.mutate(data);
    } else {
      createJobMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="job-form-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" data-testid="job-form-title">
            {isEditing ? "Edit Job Listing" : "Create New Job Listing"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? "Edit the details of an existing job listing" : "Create a new job listing with all required details"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Healthcare Assistant" data-testid="input-job-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job-type">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="care-at-home">Care at Home</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Plymouth" data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="care-at-home">Care at Home</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-branch">
                          <SelectValue placeholder="Select branch..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Plymouth">Plymouth</SelectItem>
                        <SelectItem value="Truro">Truro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="salaryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-salary-type">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Per Hour</SelectItem>
                        <SelectItem value="weekly">Per Week</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Min (pence) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="e.g., 1130 for £11.30"
                        data-testid="input-salary-min"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Max (pence)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g., 1300 for £13.00"
                        data-testid="input-salary-max"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Summary *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Brief description of the role..."
                      data-testid="textarea-summary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Job Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={8}
                      placeholder="Detailed job description, responsibilities, and requirements..."
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Experience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Select experience level..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="1-2-years">1-2 Years</SelectItem>
                        <SelectItem value="3-5-years">3-5 Years</SelectItem>
                        <SelectItem value="5-plus-years">5+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reportsTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reports To</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Service Manager" data-testid="input-reports-to" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="List qualifications, experience, and skills required..."
                      data-testid="textarea-requirements"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits & Perks</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="List benefits, training opportunities, etc..."
                      data-testid="textarea-benefits"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-active"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Make listing active immediately
                  </FormLabel>
                </FormItem>
              )}
            />
            
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={createJobMutation.isPending || updateJobMutation.isPending}
                data-testid="button-save-job"
              >
                {isEditing ? <Save className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                {createJobMutation.isPending || updateJobMutation.isPending 
                  ? "Saving..." 
                  : isEditing ? "Update Job Listing" : "Create Job Listing"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
