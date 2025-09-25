import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RecruitmentApplication } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Search,
  Filter,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";

// Use shared type from schema.ts - no need for local interface

export default function RecruitmentApplicationsAdmin() {
  const [selectedApplication, setSelectedApplication] = useState<RecruitmentApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Fetch recruitment applications
  const { data: applications = [], isLoading } = useQuery<RecruitmentApplication[]>({
    queryKey: ["/api/admin/recruitment-applications"],
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      return apiRequest('PUT', `/api/admin/recruitment-applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ 
        queryKey: ["/api/admin/recruitment-applications"] 
      });
      if (selectedApplication) {
        setSelectedApplication(null);
      }
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
      return apiRequest('PUT', `/api/admin/recruitment-applications/${applicationId}/notes`, { notes });
    },
    onSuccess: (data) => {
      toast({
        title: "Notes Saved",
        description: "Application notes have been saved successfully.",
      });
      // Update the selected application with new notes
      if (selectedApplication) {
        setSelectedApplication({ ...selectedApplication, adminNotes: notes });
      }
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ 
        queryKey: ["/api/admin/recruitment-applications"] 
      });
    },
    onError: () => {
      // Rollback local state on error
      if (selectedApplication) {
        setNotes(selectedApplication.adminNotes || "");
      }
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter applications by search and status
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.applicationData?.position && app.applicationData.position.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || (app.status || 'pending') === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "under_review": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "interview_scheduled": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "hired": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "withdrawn": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "pending": return "Pending";
      case "under_review": return "Under Review";
      case "interview_scheduled": return "Interview Scheduled";
      case "hired": return "Hired";
      case "rejected": return "Rejected";
      case "withdrawn": return "Withdrawn";
      default: return status;
    }
  };

  const handleViewApplication = (application: RecruitmentApplication) => {
    setSelectedApplication(application);
    setNotes(application.adminNotes || "");
  };

  const handleStatusChange = (status: string) => {
    if (!selectedApplication) return;
    statusUpdateMutation.mutate({ 
      applicationId: selectedApplication.id, 
      status 
    });
  };

  const handleSaveNotes = () => {
    if (!selectedApplication) return;
    notesUpdateMutation.mutate({ 
      applicationId: selectedApplication.id, 
      notes 
    });
  };

  // Calculate stats
  const stats = [
    {
      title: "Total Applications",
      value: applications.length,
      icon: Users,
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Pending Review",
      value: applications.filter(app => app.status === "pending").length,
      icon: Clock,
      bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
      textClass: "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: "Under Review",
      value: applications.filter(app => app.status === "under_review").length,
      icon: UserCheck,
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Hired",
      value: applications.filter(app => app.status === "hired").length,
      icon: CheckCircle,
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-400"
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="recruitment-applications-admin-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recruitment Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage full recruitment applications and candidate reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-emerald-600" />
          <span className="text-sm text-gray-500">Applications Dashboard</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} data-testid={`application-stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm" data-testid={`application-stat-title-${index}`}>
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground" data-testid={`application-stat-value-${index}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgClass} rounded-full p-3`}>
                    <IconComponent className={`${stat.textClass} h-6 w-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Click on any application to view details and manage status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Applications will appear here when submitted"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id} data-testid={`application-row-${application.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium" data-testid={`application-name-${application.id}`}>
                            {application.firstName} {application.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{application.applicationData?.position || 'Not specified'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {application.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {application.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status || 'pending')} data-testid={`application-status-${application.id}`}>
                        {getStatusLabel(application.status || 'pending')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {application.createdAt ? format(new Date(application.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplication(application)}
                        data-testid={`button-view-${application.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="application-detail-modal">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              View and manage recruitment application for {selectedApplication?.firstName} {selectedApplication?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Name:</span> {selectedApplication.firstName} {selectedApplication.lastName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedApplication.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {selectedApplication.phone}
                    </div>
                    {selectedApplication.applicationData?.address && (
                      <div>
                        <span className="font-medium">Address:</span> {selectedApplication.applicationData.address}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Position & Availability</h3>
                  <div className="space-y-3">
                    {selectedApplication.applicationData?.position && (
                      <div>
                        <span className="font-medium">Position:</span> {selectedApplication.applicationData.position}
                      </div>
                    )}
                    {selectedApplication.applicationData?.experience && (
                      <div>
                        <span className="font-medium">Experience:</span> {selectedApplication.applicationData.experience}
                      </div>
                    )}
                    {selectedApplication.applicationData?.availability && (
                      <div>
                        <span className="font-medium">Availability:</span> {selectedApplication.applicationData.availability}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal & Health Information */}
              {selectedApplication.applicationData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Legal & Health Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {typeof selectedApplication.applicationData.rightToWork !== 'undefined' && (
                        <div>
                          <span className="font-medium">Right to Work:</span> 
                          <Badge className={selectedApplication.applicationData.rightToWork ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedApplication.applicationData.rightToWork ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.transportReliable !== 'undefined' && (
                        <div>
                          <span className="font-medium">Reliable Transport:</span> 
                          <Badge className={selectedApplication.applicationData.transportReliable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedApplication.applicationData.transportReliable ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {typeof selectedApplication.applicationData.criminalConvictions !== 'undefined' && (
                        <div>
                          <span className="font-medium">Criminal Convictions:</span> 
                          <Badge className={selectedApplication.applicationData.criminalConvictions ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {selectedApplication.applicationData.criminalConvictions ? "Yes" : "No"}
                          </Badge>
                          {selectedApplication.applicationData.criminalConvictions && selectedApplication.applicationData.criminalDetails && (
                            <p className="text-sm mt-1 bg-muted p-3 rounded">{selectedApplication.applicationData.criminalDetails}</p>
                          )}
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.healthConditions !== 'undefined' && (
                        <div>
                          <span className="font-medium">Health Conditions:</span> 
                          <Badge className={selectedApplication.applicationData.healthConditions ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {selectedApplication.applicationData.healthConditions ? "Yes" : "No"}
                          </Badge>
                          {selectedApplication.applicationData.healthConditions && selectedApplication.applicationData.healthDetails && (
                            <p className="text-sm mt-1 bg-muted p-3 rounded">{selectedApplication.applicationData.healthDetails}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedApplication.applicationData && (selectedApplication.applicationData.emergencyContactName || selectedApplication.applicationData.emergencyContactPhone) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedApplication.applicationData.emergencyContactName && (
                      <div>
                        <span className="font-medium">Name:</span> {selectedApplication.applicationData.emergencyContactName}
                      </div>
                    )}
                    {selectedApplication.applicationData.emergencyContactPhone && (
                      <div>
                        <span className="font-medium">Phone:</span> {selectedApplication.applicationData.emergencyContactPhone}
                      </div>
                    )}
                    {selectedApplication.applicationData.emergencyContactRelationship && (
                      <div>
                        <span className="font-medium">Relationship:</span> {selectedApplication.applicationData.emergencyContactRelationship}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Motivation & Additional Info */}
              {selectedApplication.applicationData && (selectedApplication.applicationData.motivationStatement || selectedApplication.applicationData.additionalInfo) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Motivation & Additional Information</h3>
                  <div className="space-y-3">
                    {selectedApplication.applicationData.motivationStatement && (
                      <div>
                        <span className="font-medium">Why do you want to work in healthcare?</span>
                        <p className="text-sm mt-1 bg-muted p-3 rounded">{selectedApplication.applicationData.motivationStatement}</p>
                      </div>
                    )}
                    {selectedApplication.applicationData.additionalInfo && (
                      <div>
                        <span className="font-medium">Additional Information:</span>
                        <p className="text-sm mt-1 bg-muted p-3 rounded">{selectedApplication.applicationData.additionalInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Status Management</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Select 
                      value={selectedApplication.status || 'pending'} 
                      onValueChange={handleStatusChange}
                      disabled={statusUpdateMutation.isPending}
                    >
                      <SelectTrigger className="w-48" data-testid="select-application-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Applied: {selectedApplication.createdAt ? format(new Date(selectedApplication.createdAt), 'PPP') : 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Admin Notes</h3>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add notes about this application..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    data-testid="textarea-admin-notes"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveNotes}
                      disabled={notesUpdateMutation.isPending}
                      data-testid="button-save-notes"
                    >
                      {notesUpdateMutation.isPending ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}