import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Mail, Phone, MapPin, Clock, FileText, Briefcase, ArrowLeft, UserCheck, Calendar, Car, Zap, Shield, CheckCircle, XCircle, Info, Filter, Edit, NotebookPen } from "lucide-react";
import { type Application, type Job } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type JobWithApplications = Job & {
  applicationsCount?: number;
};

export default function ApplicationsAdmin() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notes, setNotes] = useState<string>("");
  const { toast } = useToast();

  // Fetch all jobs
  const { data: jobs, isLoading: jobsLoading, error: jobsError } = useQuery<JobWithApplications[]>({
    queryKey: ["/api/jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      return response.json();
    },
  });

  // Fetch applications for selected job
  const { data: applications, isLoading: applicationsLoading, error: applicationsError } = useQuery<Application[]>({
    queryKey: ["/api/jobs", selectedJob?.id, "applications"],
    queryFn: async () => {
      if (!selectedJob) return [];
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/jobs/${selectedJob.id}/applications`, {
        credentials: 'include',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch applications");
      }
      return response.json();
    },
    enabled: !!selectedJob,
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      return apiRequest('PUT', `/api/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ 
        queryKey: ["/api/jobs", selectedJob?.id, "applications"] 
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Notes update mutation
  const notesUpdateMutation = useMutation({
    mutationFn: async ({ applicationId, notes }: { applicationId: string; notes: string }) => {
      return apiRequest('PUT', `/api/applications/${applicationId}/notes`, { notes });
    },
    onSuccess: (data) => {
      toast({
        title: "Notes Saved",
        description: "Application notes have been saved successfully.",
      });
      // Update the selected application with new notes
      if (selectedApplication) {
        setSelectedApplication({ ...selectedApplication, notes });
      }
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ 
        queryKey: ["/api/jobs", selectedJob?.id, "applications"] 
      });
    },
    onError: () => {
      // Rollback local state on error
      if (selectedApplication) {
        setNotes(selectedApplication.notes || "");
      }
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter applications by status
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (statusFilter === "all") return applications;
    return applications.filter(app => (app.status || 'pending') === statusFilter);
  }, [applications, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "reviewed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "interview": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "hired": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    statusUpdateMutation.mutate({ applicationId, status: newStatus });
  };

  const handleSaveNotes = () => {
    if (!selectedApplication) return;
    // Don't save if notes haven't changed
    if (notes === (selectedApplication.notes || "")) return;
    notesUpdateMutation.mutate({ applicationId: selectedApplication.id, notes });
  };

  // Update notes state when application changes
  const selectApplication = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || "");
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (jobsLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading jobs...</span>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading jobs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        {!selectedJob ? (
          <>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Pre-Screens Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Select a job position to view and manage candidate pre-screens
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedJob(null);
                  setSelectedApplication(null);
                }}
                className="flex items-center gap-2"
                data-testid="button-back-to-jobs"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
              </Button>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              {selectedJob.title} - Pre-Screens
            </h1>
            <p className="text-muted-foreground mt-2">
              Review candidate pre-screens for {selectedJob.title} position
            </p>
          </>
        )}
      </div>

      {!selectedJob ? (
        // Jobs List View
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Positions</h2>
          
          {jobs && jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.type}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.summary}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant="secondary" className="mb-2">
                          View Pre-Screens
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Click to view candidates
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No job positions available.</p>
            </div>
          )}
        </div>
      ) : (
        // Applications for Selected Job
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div className="space-y-4">
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading pre-screens...</span>
              </div>
            ) : applications && applications.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Pre-Screen Applications ({filteredApplications.length} of {applications.length})</h2>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter-select">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredApplications.map((application) => (
                      <Card 
                        key={application.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedApplication?.id === application.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => selectApplication(application)}
                        data-testid={`application-card-${application.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {application.firstName} {application.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Applied {formatDate(application.createdAt || new Date().toISOString())}
                              </p>
                            </div>
                            <Badge className={getStatusColor(application.status || 'pending')}>
                              {application.status || 'pending'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {application.email}
                            </div>
                            {application.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {application.phone}
                              </div>
                            )}
                            {application.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {application.location}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pre-screen applications found for this position.</p>
              </div>
            )}
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Application Details</h2>
            
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{selectedApplication.firstName} {selectedApplication.lastName}</span>
                    <Badge className={getStatusColor(selectedApplication.status || 'pending')}>
                      {selectedApplication.status || 'pending'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {/* Contact Information */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm bg-muted/20 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">Email:</span>
                            <span className="text-muted-foreground">{selectedApplication.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Phone:</span>
                            <span className="text-muted-foreground">{selectedApplication.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Location:</span>
                            <span className="text-muted-foreground">{selectedApplication.location}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Referral Source */}
                      {selectedApplication.referralSource && (
                        <>
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              How They Found Us
                            </h4>
                            <div className="text-sm bg-muted/20 p-3 rounded-lg">
                              <p className="text-muted-foreground">{selectedApplication.referralSource}</p>
                            </div>
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Current Employment */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Current Employment
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm bg-muted/20 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Currently Working:</span>
                            <div className="flex items-center gap-1">
                              {selectedApplication.currentlyWorking === true ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : selectedApplication.currentlyWorking === false ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span className="text-muted-foreground">
                                {selectedApplication.currentlyWorking === true ? 'Yes' : 
                                 selectedApplication.currentlyWorking === false ? 'No' : 'Not specified'}
                              </span>
                            </div>
                          </div>
                          {selectedApplication.currentlyWorking && selectedApplication.currentEmployer && (
                            <>
                              <div className="flex justify-between">
                                <span className="font-medium">Current Employer:</span>
                                <span className="text-muted-foreground">{selectedApplication.currentEmployer}</span>
                              </div>
                              {selectedApplication.employmentDuration && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Employment Duration:</span>
                                  <span className="text-muted-foreground">{selectedApplication.employmentDuration}</span>
                                </div>
                              )}
                              {selectedApplication.noticePeriod && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Notice Period:</span>
                                  <span className="text-muted-foreground">{selectedApplication.noticePeriod}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Care Experience */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Care Experience
                        </h4>
                        <div className="text-sm bg-muted/20 p-3 rounded-lg">
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedApplication.experience || "No experience provided"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Holiday Information */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Holiday Information
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm bg-muted/20 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Pre-booked Holiday:</span>
                            <div className="flex items-center gap-1">
                              {selectedApplication.hasPreBookedHoliday === true ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : selectedApplication.hasPreBookedHoliday === false ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span className="text-muted-foreground">
                                {selectedApplication.hasPreBookedHoliday === true ? 'Yes' : 
                                 selectedApplication.hasPreBookedHoliday === false ? 'No' : 'Not specified'}
                              </span>
                            </div>
                          </div>
                          {selectedApplication.hasPreBookedHoliday && selectedApplication.holidayDates && (
                            <div className="flex justify-between">
                              <span className="font-medium">Holiday Dates:</span>
                              <span className="text-muted-foreground">{selectedApplication.holidayDates}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Transport */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Transport
                        </h4>
                        <div className="text-sm bg-muted/20 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Can Drive:</span>
                            <div className="flex items-center gap-1">
                              {selectedApplication.canDrive === true ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : selectedApplication.canDrive === false ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span className="text-muted-foreground">
                                {selectedApplication.canDrive === true ? 'Yes' : 
                                 selectedApplication.canDrive === false ? 'No' : 'Not specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Shift Preferences and Hours */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Work Preferences
                        </h4>
                        <div className="space-y-3 text-sm bg-muted/20 p-3 rounded-lg">
                          <div>
                            <span className="font-medium block mb-2">Shift Preferences:</span>
                            {selectedApplication.shiftPreferences && Array.isArray(selectedApplication.shiftPreferences) && selectedApplication.shiftPreferences.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {selectedApplication.shiftPreferences.map((shift) => (
                                  <Badge key={shift} variant="secondary" className="text-xs">
                                    {shift}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No preferences specified</span>
                            )}
                          </div>
                          {selectedApplication.preferredHours && (
                            <div>
                              <span className="font-medium">Preferred Hours:</span>
                              <span className="text-muted-foreground ml-2">{selectedApplication.preferredHours}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Certifications */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Certifications
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-sm bg-muted/20 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">DBS on Update Service:</span>
                            <div className="flex items-center gap-1">
                              {selectedApplication.hasDBS === true ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : selectedApplication.hasDBS === false ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span className="text-muted-foreground">
                                {selectedApplication.hasDBS === true ? 'Yes' : 
                                 selectedApplication.hasDBS === false ? 'No' : 'Not specified'}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">M&H Certificate:</span>
                            <div className="flex items-center gap-1">
                              {selectedApplication.hasMHCertificate === true ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : selectedApplication.hasMHCertificate === false ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : null}
                              <span className="text-muted-foreground">
                                {selectedApplication.hasMHCertificate === true ? 'Yes' : 
                                 selectedApplication.hasMHCertificate === false ? 'No' : 'Not specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Additional Information */}
                      {selectedApplication.additionalInfo && (
                        <>
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Additional Information
                            </h4>
                            <div className="text-sm bg-muted/20 p-3 rounded-lg">
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {selectedApplication.additionalInfo}
                              </p>
                            </div>
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Privacy Consent */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Privacy Consent
                        </h4>
                        <div className="text-sm bg-muted/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            {selectedApplication.privacyConsent ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-muted-foreground">
                              {selectedApplication.privacyConsent ? 'Consent given' : 'Consent not provided'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Application Date */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Application Date
                        </h4>
                        <div className="text-sm bg-muted/20 p-3 rounded-lg">
                          <p className="text-muted-foreground">
                            {formatDate(selectedApplication.createdAt || new Date().toISOString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Notes Section */}
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <NotebookPen className="h-4 w-4" />
                      <span className="font-medium">Admin Notes:</span>
                    </div>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add notes about this candidate..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px]"
                        data-testid="notes-textarea"
                      />
                      <Button
                        onClick={handleSaveNotes}
                        size="sm"
                        disabled={notesUpdateMutation.isPending}
                        className="w-full"
                        data-testid="save-notes-button"
                      >
                        {notesUpdateMutation.isPending ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Status Update */}
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Edit className="h-4 w-4" />
                      <span className="font-medium">Update Status:</span>
                    </div>
                    <Select 
                      value={selectedApplication.status || 'pending'} 
                      onValueChange={(newStatus) => handleStatusUpdate(selectedApplication.id, newStatus)}
                      disabled={statusUpdateMutation.isPending}
                      data-testid="status-update-select"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 pt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        Contact Candidate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select an application to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}