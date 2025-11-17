import { useState, useMemo, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  Eye,
  Search,
  Filter,
  FileText,
  Mail,
  Phone,
  Calendar,
  User,
  Download,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Building2,
  CreditCard,
  UserCircle,
  Contact
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function RecruitmentApplicationsAdmin() {
  const [selectedApplication, setSelectedApplication] = useState<RecruitmentApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
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
    mutationFn: async ({ applicationId, adminNotes }: { applicationId: string; adminNotes: string }) => {
      return apiRequest('PUT', `/api/admin/recruitment-applications/${applicationId}/notes`, { adminNotes });
    },
    onSuccess: () => {
      toast({
        title: "Notes Saved",
        description: "Application notes have been saved successfully.",
      });
      if (selectedApplication) {
        setSelectedApplication({ ...selectedApplication, adminNotes: notes });
      }
      queryClient.invalidateQueries({ 
        queryKey: ["/api/admin/recruitment-applications"] 
      });
    },
    onError: () => {
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

  // PDF generation function
  const handleDownloadPDF = async () => {
    if (!pdfContentRef.current || !selectedApplication) return;

    setIsGeneratingPDF(true);
    try {
      const content = pdfContentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Recruitment_Application_${selectedApplication.firstName}_${selectedApplication.lastName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: "Application PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Filter applications by search and status
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());
      
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
      adminNotes: notes 
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
                placeholder="Search by name, email..."
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="application-detail-modal">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  View and manage recruitment application for {selectedApplication?.firstName} {selectedApplication?.lastName}
                </DialogDescription>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                variant="outline"
                size="sm"
                data-testid="button-download-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </DialogHeader>
          
          {selectedApplication && (
            <div ref={pdfContentRef} className="space-y-6 p-4">
              {/* 1. Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Full Name:</span>
                    <p className="text-sm">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                  </div>
                  {selectedApplication.applicationData?.dateOfBirth && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Date of Birth:</span>
                      <p className="text-sm">{typeof selectedApplication.applicationData.dateOfBirth === 'string' ? format(new Date(selectedApplication.applicationData.dateOfBirth), 'dd/MM/yyyy') : 'Not provided'}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Email:</span>
                    <p className="text-sm">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-muted-foreground">Phone:</span>
                    <p className="text-sm">{selectedApplication.phone}</p>
                  </div>
                  {selectedApplication.applicationData?.address && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Address:</span>
                      <p className="text-sm">{selectedApplication.applicationData.address}</p>
                    </div>
                  )}
                  {selectedApplication.applicationData?.postcode && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Postcode:</span>
                      <p className="text-sm">{selectedApplication.applicationData.postcode}</p>
                    </div>
                  )}
                  {selectedApplication.applicationData?.nationalInsuranceNumber && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">National Insurance Number:</span>
                      <p className="text-sm">{selectedApplication.applicationData.nationalInsuranceNumber}</p>
                    </div>
                  )}
                  {selectedApplication.applicationData?.gender && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Gender:</span>
                      <p className="text-sm">{selectedApplication.applicationData.gender}</p>
                    </div>
                  )}
                  {selectedApplication.applicationData?.maritalStatus && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Marital Status:</span>
                      <p className="text-sm">{selectedApplication.applicationData.maritalStatus}</p>
                    </div>
                  )}
                  {selectedApplication.applicationData?.ethnicOrigin && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Ethnic Origin:</span>
                      <p className="text-sm">{selectedApplication.applicationData.ethnicOrigin}</p>
                    </div>
                  )}
                  {selectedApplication.applicationData?.nationality && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Nationality:</span>
                      <p className="text-sm">{selectedApplication.applicationData.nationality}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 2. Next of Kin */}
              {selectedApplication.applicationData && (selectedApplication.applicationData.nextOfKinName || selectedApplication.applicationData.nextOfKinPhone || selectedApplication.applicationData.nextOfKinAddress) && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Contact className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Next of Kin</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                      {selectedApplication.applicationData.nextOfKinName && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Name:</span>
                          <p className="text-sm">{selectedApplication.applicationData.nextOfKinName}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.nextOfKinPhone && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Phone:</span>
                          <p className="text-sm">{selectedApplication.applicationData.nextOfKinPhone}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.nextOfKinAddress && (
                        <div className="md:col-span-3">
                          <span className="font-medium text-sm text-muted-foreground">Address:</span>
                          <p className="text-sm">{selectedApplication.applicationData.nextOfKinAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 3. Payroll/Bank Details */}
              {selectedApplication.applicationData && (selectedApplication.applicationData.payrollType || selectedApplication.applicationData.bankName) && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Payroll & Bank Details</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                      {selectedApplication.applicationData.payrollType && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Payroll Type:</span>
                          <p className="text-sm">{selectedApplication.applicationData.payrollType}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.bankName && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Bank Name:</span>
                          <p className="text-sm">{selectedApplication.applicationData.bankName}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.accountType && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Account Type:</span>
                          <p className="text-sm">{selectedApplication.applicationData.accountType}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.accountName && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Account Name:</span>
                          <p className="text-sm">{selectedApplication.applicationData.accountName}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.accountNumber && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Account Number:</span>
                          <p className="text-sm">{selectedApplication.applicationData.accountNumber}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.sortCode && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Sort Code:</span>
                          <p className="text-sm">{selectedApplication.applicationData.sortCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 4. Worker Profile */}
              {selectedApplication.applicationData && (selectedApplication.applicationData.workerTypes || selectedApplication.applicationData.travelMethod) && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Worker Profile</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                      {selectedApplication.applicationData.workerTypes && Array.isArray(selectedApplication.applicationData.workerTypes) && selectedApplication.applicationData.workerTypes.length > 0 && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Worker Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.applicationData.workerTypes.map((type: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedApplication.applicationData.travelMethod && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Travel Method:</span>
                          <p className="text-sm">{selectedApplication.applicationData.travelMethod}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.travelDistance && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Travel Distance:</span>
                          <p className="text-sm">{selectedApplication.applicationData.travelDistance}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.leadSkills && Array.isArray(selectedApplication.applicationData.leadSkills) && selectedApplication.applicationData.leadSkills.length > 0 && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Lead Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.applicationData.leadSkills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedApplication.applicationData.shiftPreferences && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Shift Preferences:</span>
                          <p className="text-sm">{selectedApplication.applicationData.shiftPreferences}</p>
                        </div>
                      )}
                      {selectedApplication.applicationData.availableDays && Array.isArray(selectedApplication.applicationData.availableDays) && selectedApplication.applicationData.availableDays.length > 0 && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Available Days:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.applicationData.availableDays.map((day: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{day}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 5. Employment History */}
              {selectedApplication.applicationData?.employmentHistory && Array.isArray(selectedApplication.applicationData.employmentHistory) && selectedApplication.applicationData.employmentHistory.length > 0 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Employment History</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedApplication.applicationData.employmentHistory.map((job: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{job.jobTitle}</h4>
                              <p className="text-sm text-muted-foreground">{job.companyName}</p>
                            </div>
                            {job.currentlyEmployed && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            {job.startDate && (
                              <div>
                                <span className="font-medium text-muted-foreground">Start Date:</span> {typeof job.startDate === 'string' ? format(new Date(job.startDate), 'MMM yyyy') : 'Not provided'}
                              </div>
                            )}
                            {job.endDate && !job.currentlyEmployed && (
                              <div>
                                <span className="font-medium text-muted-foreground">End Date:</span> {typeof job.endDate === 'string' ? format(new Date(job.endDate), 'MMM yyyy') : 'Not provided'}
                              </div>
                            )}
                            {job.reasonForLeaving && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-muted-foreground">Reason for Leaving:</span> {job.reasonForLeaving}
                              </div>
                            )}
                            {(job.managerName || job.managerPhone || job.managerEmail) && (
                              <div className="md:col-span-2">
                                <span className="font-medium text-muted-foreground">Manager Contact:</span>
                                <div className="ml-2 space-y-1">
                                  {job.managerName && <p>Name: {job.managerName}</p>}
                                  {job.managerPhone && <p>Phone: {job.managerPhone}</p>}
                                  {job.managerEmail && <p>Email: {job.managerEmail}</p>}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 6. Education */}
              {selectedApplication.applicationData?.education && Array.isArray(selectedApplication.applicationData.education) && selectedApplication.applicationData.education.length > 0 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Education & Qualifications</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedApplication.applicationData.education.map((edu: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 p-3 rounded-lg">
                          <div className="grid md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Type:</span> {edu.qualificationType}
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Qualification:</span> {edu.qualificationName}
                            </div>
                            {edu.institution && (
                              <div>
                                <span className="font-medium text-muted-foreground">Institution:</span> {edu.institution}
                              </div>
                            )}
                            {edu.yearObtained && (
                              <div>
                                <span className="font-medium text-muted-foreground">Year Obtained:</span> {edu.yearObtained}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 7. Health & Compliance */}
              {selectedApplication.applicationData && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Health & Compliance</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                      {selectedApplication.applicationData.medicalConditions && Array.isArray(selectedApplication.applicationData.medicalConditions) && selectedApplication.applicationData.medicalConditions.length > 0 && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Medical Conditions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.applicationData.medicalConditions.map((condition: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.medicationAffectsDriving !== 'undefined' && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Medication Affects Driving:</span>
                          <Badge className={selectedApplication.applicationData.medicationAffectsDriving ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {selectedApplication.applicationData.medicationAffectsDriving ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.medicalAffectsNightWork !== 'undefined' && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Medical Affects Night Work:</span>
                          <Badge className={selectedApplication.applicationData.medicalAffectsNightWork ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {selectedApplication.applicationData.medicalAffectsNightWork ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.hasCriminalConvictions !== 'undefined' && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-sm text-muted-foreground">Criminal Convictions:</span>
                          <Badge className={selectedApplication.applicationData.hasCriminalConvictions ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                            {selectedApplication.applicationData.hasCriminalConvictions ? "Yes" : "No"}
                          </Badge>
                          {selectedApplication.applicationData.hasCriminalConvictions && selectedApplication.applicationData.convictionDetails && (
                            <p className="text-sm mt-2 bg-background p-3 rounded border">{selectedApplication.applicationData.convictionDetails}</p>
                          )}
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.dbsConsent !== 'undefined' && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">DBS Consent:</span>
                          <Badge className={selectedApplication.applicationData.dbsConsent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedApplication.applicationData.dbsConsent ? "Yes" : "No"}
                          </Badge>
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.workingTimeDirectiveOptOut !== 'undefined' && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Working Time Directive Opt-Out:</span>
                          <Badge className={selectedApplication.applicationData.workingTimeDirectiveOptOut ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                            {selectedApplication.applicationData.workingTimeDirectiveOptOut ? "Opted Out" : "Not Opted Out"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 8. Data Protection */}
              {selectedApplication.applicationData && (typeof selectedApplication.applicationData.dataProtectionConsent !== 'undefined' || typeof selectedApplication.applicationData.dataHoldingConsent !== 'undefined') && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Data Protection</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                      {typeof selectedApplication.applicationData.dataProtectionConsent !== 'undefined' && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Data Protection Consent:</span>
                          <Badge className={selectedApplication.applicationData.dataProtectionConsent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedApplication.applicationData.dataProtectionConsent ? "Consented" : "Not Consented"}
                          </Badge>
                        </div>
                      )}
                      {typeof selectedApplication.applicationData.dataHoldingConsent !== 'undefined' && (
                        <div>
                          <span className="font-medium text-sm text-muted-foreground">Data Holding Consent:</span>
                          <Badge className={selectedApplication.applicationData.dataHoldingConsent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {selectedApplication.applicationData.dataHoldingConsent ? "Consented" : "Not Consented"}
                          </Badge>
                        </div>
                      )}
                      {selectedApplication.applicationData.dataTypesConsented && Array.isArray(selectedApplication.applicationData.dataTypesConsented) && selectedApplication.applicationData.dataTypesConsented.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-sm text-muted-foreground">Data Types Consented:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.applicationData.dataTypesConsented.map((type: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* 9. References */}
              {selectedApplication.applicationData?.references && Array.isArray(selectedApplication.applicationData.references) && selectedApplication.applicationData.references.length > 0 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">References</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedApplication.applicationData.references.map((ref: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{ref.fullName}</h4>
                              <p className="text-sm text-muted-foreground">{ref.referenceType} Reference</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            {ref.company && (
                              <div>
                                <span className="font-medium text-muted-foreground">Organisation:</span> {ref.company}
                              </div>
                            )}
                            {ref.jobTitle && (
                              <div>
                                <span className="font-medium text-muted-foreground">Job Title:</span> {ref.jobTitle}
                              </div>
                            )}
                            {ref.relationship && (
                              <div>
                                <span className="font-medium text-muted-foreground">Relationship:</span> {ref.relationship}
                              </div>
                            )}
                            {ref.applicantJobTitle && (
                              <div>
                                <span className="font-medium text-muted-foreground">Applicant's Position:</span> {ref.applicantJobTitle}
                              </div>
                            )}
                            {ref.startDate && (
                              <div>
                                <span className="font-medium text-muted-foreground">Start Date:</span> {typeof ref.startDate === 'string' ? format(new Date(ref.startDate), 'MMM yyyy') : 'Not provided'}
                              </div>
                            )}
                            {ref.endDate && (
                              <div>
                                <span className="font-medium text-muted-foreground">End Date:</span> {typeof ref.endDate === 'string' ? format(new Date(ref.endDate), 'MMM yyyy') : 'Not provided'}
                              </div>
                            )}
                            {ref.email && (
                              <div>
                                <span className="font-medium text-muted-foreground">Email:</span> {ref.email}
                              </div>
                            )}
                            {ref.phone && (
                              <div>
                                <span className="font-medium text-muted-foreground">Phone:</span> {ref.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Status Management */}
              <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Status Management</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
              <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
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
