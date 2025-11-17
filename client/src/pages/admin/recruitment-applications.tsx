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

  // PDF generation function with proper A4 page handling and canvas slicing
  const handleDownloadPDF = async () => {
    if (!pdfContentRef.current || !selectedApplication) return;

    setIsGeneratingPDF(true);
    try {
      const content = pdfContentRef.current;
      
      const canvas = await html2canvas(content, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = pdfHeight - (2 * margin);
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const scaleFactor = (contentWidth * 3.7795) / canvasWidth;
      const pageHeightInPx = (contentHeight * 3.7795) / scaleFactor;
      
      const totalPages = Math.ceil(canvasHeight / pageHeightInPx);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const sourceY = i * pageHeightInPx;
        const sourceHeight = Math.min(pageHeightInPx, canvasHeight - sourceY);
        
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY,
            canvasWidth, sourceHeight,
            0, 0,
            canvasWidth, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png');
          const imgHeight = (sourceHeight * contentWidth) / canvasWidth;
          
          pdf.addImage(
            pageImgData,
            'PNG',
            margin,
            margin,
            contentWidth,
            imgHeight
          );
        }
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
            <div ref={pdfContentRef} className="space-y-8 p-4">
              {/* SECTION 1: Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <UserCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">1. Personal Information</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 pl-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <p className="text-base mt-1">{selectedApplication.firstName || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <p className="text-base mt-1">{selectedApplication.lastName || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-base mt-1">
                      {selectedApplication.applicationData?.dateOfBirth 
                        ? format(new Date(selectedApplication.applicationData.dateOfBirth), 'dd/MM/yyyy') 
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <p className="text-base mt-1">{selectedApplication.email || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-base mt-1">{selectedApplication.phone || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.address || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Postcode</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.postcode || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">National Insurance Number</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.nationalInsuranceNumber || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.gender || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.maritalStatus || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ethnic Origin</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.ethnicOrigin || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.nationality || '—'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 2: Next of Kin */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <Contact className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">2. Next of Kin</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 pl-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.nextOfKinName || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.nextOfKinRelationship || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.nextOfKinPhone || '—'}</p>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.nextOfKinAddress || '—'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 3: Payroll & Bank Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">3. Payroll & Bank Details</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 pl-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payroll Type</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.payrollType || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.bankName || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.accountType || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Name</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.accountName || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.accountNumber || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sort Code</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.sortCode || '—'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 4: Worker Profile */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">4. Worker Profile</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pl-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Worker Types</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.applicationData?.workerTypes && Array.isArray(selectedApplication.applicationData.workerTypes) && selectedApplication.applicationData.workerTypes.length > 0 ? (
                        selectedApplication.applicationData.workerTypes.map((type: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                        ))
                      ) : (
                        <p className="text-base">—</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Travel Method</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.travelMethod || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Willing to Travel (Distance)</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.travelDistance || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lead Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.applicationData?.leadSkills && Array.isArray(selectedApplication.applicationData.leadSkills) && selectedApplication.applicationData.leadSkills.length > 0 ? (
                        selectedApplication.applicationData.leadSkills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                        ))
                      ) : (
                        <p className="text-base">—</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shift Preferences</label>
                    <p className="text-base mt-1">{selectedApplication.applicationData?.shiftPreferences || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Available Days</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.applicationData?.availableDays && Array.isArray(selectedApplication.applicationData.availableDays) && selectedApplication.applicationData.availableDays.length > 0 ? (
                        selectedApplication.applicationData.availableDays.map((day: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{day}</Badge>
                        ))
                      ) : (
                        <p className="text-base">—</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 5: Employment History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">5. Employment History</h2>
                </div>
                <div className="space-y-6 pl-4">
                  {selectedApplication.applicationData?.employmentHistory && Array.isArray(selectedApplication.applicationData.employmentHistory) && selectedApplication.applicationData.employmentHistory.length > 0 ? (
                    selectedApplication.applicationData.employmentHistory.map((job: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-muted pl-4 space-y-3">
                        <h4 className="font-semibold text-lg">Employment Record {idx + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                            <p className="text-base mt-1">{job.companyName || '—'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                            <p className="text-base mt-1">{job.jobTitle || '—'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                            <p className="text-base mt-1">
                              {job.startDate ? format(new Date(job.startDate), 'MMMM yyyy') : '—'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">End Date</label>
                            <p className="text-base mt-1">
                              {job.currentlyEmployed ? 'Currently Employed' : job.endDate ? format(new Date(job.endDate), 'MMMM yyyy') : '—'}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Reason for Leaving</label>
                            <p className="text-base mt-1">{job.reasonForLeaving || '—'}</p>
                          </div>
                          {job.useAsReference && (
                            <>
                              <div className="md:col-span-2">
                                <Badge variant="secondary">Used as Professional Reference</Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Reference Name</label>
                                <p className="text-base mt-1">{job.referenceName || '—'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Reference Phone</label>
                                <p className="text-base mt-1">{job.referencePhone || '—'}</p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Reference Email</label>
                                <p className="text-base mt-1">{job.referenceEmail || '—'}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-muted-foreground">No employment history provided</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* SECTION 6: Education & Qualifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">6. Education & Qualifications</h2>
                </div>
                <div className="space-y-6 pl-4">
                  {selectedApplication.applicationData?.education && Array.isArray(selectedApplication.applicationData.education) && selectedApplication.applicationData.education.length > 0 ? (
                    selectedApplication.applicationData.education.map((edu: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-muted pl-4 space-y-3">
                        <h4 className="font-semibold text-lg">Qualification {idx + 1}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Qualification Type</label>
                            <p className="text-base mt-1">{edu.qualificationType || '—'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Qualification Name</label>
                            <p className="text-base mt-1">{edu.qualificationName || '—'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Institution</label>
                            <p className="text-base mt-1">{edu.institution || '—'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Year Obtained</label>
                            <p className="text-base mt-1">{edu.yearObtained || '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base text-muted-foreground">No education records provided</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* SECTION 7: Health & Compliance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">7. Health & Compliance</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pl-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical Conditions</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.applicationData?.medicalConditions && Array.isArray(selectedApplication.applicationData.medicalConditions) && selectedApplication.applicationData.medicalConditions.length > 0 ? (
                        selectedApplication.applicationData.medicalConditions.map((condition: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                        ))
                      ) : (
                        <p className="text-base">None</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Does medication affect your driving?</label>
                    <p className="text-base mt-1">
                      {selectedApplication.applicationData?.medicationAffectsDriving ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Does medical condition affect night work?</label>
                    <p className="text-base mt-1">
                      {selectedApplication.applicationData?.medicalAffectsNightWork ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Do you have any criminal convictions?</label>
                    <p className="text-base mt-1">
                      {selectedApplication.applicationData?.hasCriminalConvictions ? 'Yes' : 'No'}
                    </p>
                    {selectedApplication.applicationData?.hasCriminalConvictions && selectedApplication.applicationData?.convictionDetails && (
                      <div className="mt-2">
                        <label className="text-sm font-medium text-muted-foreground">Conviction Details</label>
                        <p className="text-base mt-1 bg-muted/30 p-3 rounded">{selectedApplication.applicationData.convictionDetails}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">DBS Disclosure Consent</label>
                    <p className="text-base mt-1">
                      {selectedApplication.applicationData?.dbsConsent ? 'Consented' : 'Not Consented'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Working Time Directive Opt-Out</label>
                    <p className="text-base mt-1">
                      {selectedApplication.applicationData?.workingTimeDirectiveOptOut ? 'Opted Out' : 'Not Opted Out'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 8: Data Protection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">8. Data Protection</h2>
                </div>
                <div className="space-y-4 pl-4">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      We collect and process your personal data in accordance with GDPR regulations. 
                      Your data will be used solely for recruitment purposes and will be securely stored.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Personal data you consent to us holding and sharing:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div>• Name</div>
                      <div>• Date of Birth</div>
                      <div>• Phone Number</div>
                      <div>• Email Address</div>
                      <div>• Postal Address</div>
                      <div>• CV</div>
                      <div>• Experience, Training & Qualifications</div>
                      <div>• National Insurance Number</div>
                      <div>• Right to Work Documents</div>
                      <div>• Criminal Conviction(s)</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className={`border-2 rounded-md p-4 ${selectedApplication.applicationData?.dataProtectionConsent ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-red-500 bg-red-50/50 dark:bg-red-900/10'}`}>
                      <label className="text-sm font-medium text-muted-foreground">Data Protection Consent</label>
                      <p className="text-sm mt-1 mb-2 text-muted-foreground italic">
                        "I agree to the above statement regarding data protection and consent to my data being processed"
                      </p>
                      <p className={`text-base mt-2 font-semibold ${selectedApplication.applicationData?.dataProtectionConsent ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {selectedApplication.applicationData?.dataProtectionConsent === true ? '✓ Consented' : '✗ Not Consented'}
                      </p>
                    </div>
                    <div className={`border-2 rounded-md p-4 ${selectedApplication.applicationData?.dataHoldingConsent ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-red-500 bg-red-50/50 dark:bg-red-900/10'}`}>
                      <label className="text-sm font-medium text-muted-foreground">Data Holding Consent</label>
                      <p className="text-sm mt-1 mb-2 text-muted-foreground italic">
                        "I consent to the above information being held and shared for the purposes of providing or finding me work"
                      </p>
                      <p className={`text-base mt-2 font-semibold ${selectedApplication.applicationData?.dataHoldingConsent ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {selectedApplication.applicationData?.dataHoldingConsent === true ? '✓ Consented' : '✗ Not Consented'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 9: References */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">9. References</h2>
                </div>
                <div className="space-y-6 pl-4">
                  {(() => {
                    const allProfessionalRefs = selectedApplication.applicationData?.references?.filter((ref: any) => ref.referenceType === 'Professional') || [];
                    const professionalRefs = allProfessionalRefs.filter((ref: any) => 
                      ref.fullName && (ref.email || ref.phone)
                    );
                    const incompleteProfessionalRefs = allProfessionalRefs.length - professionalRefs.length;
                    const characterRefs = selectedApplication.applicationData?.references?.filter((ref: any) => ref.referenceType === 'Character') || [];
                    const hasAnyReferences = professionalRefs.length > 0 || characterRefs.length > 0;
                    
                    return (
                      <>
                        {allProfessionalRefs.length > 0 && (
                          <>
                            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border-l-4 border-blue-500 mb-4">
                              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                                <strong>Note:</strong> Professional references below are automatically synced from the Employment History section (Section 5) where the applicant marked employers as references.
                                {incompleteProfessionalRefs > 0 && (
                                  <span className="block mt-2 text-amber-700 dark:text-amber-400">
                                    ⚠ {incompleteProfessionalRefs} employer{incompleteProfessionalRefs > 1 ? 's were' : ' was'} marked as reference{incompleteProfessionalRefs > 1 ? 's' : ''} but {incompleteProfessionalRefs > 1 ? 'lack' : 'lacks'} complete contact details. Please refer to Section 5 for employer information.
                                  </span>
                                )}
                              </p>
                            </div>
                          </>
                        )}
                        {professionalRefs.length > 0 && (
                          <>
                            <h4 className="font-semibold text-base text-muted-foreground">Professional References</h4>
                            {professionalRefs.map((ref: any, idx: number) => (
                              <div key={idx} className="border-l-4 border-blue-500 pl-4 space-y-3 bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded">
                                <h4 className="font-semibold text-lg">
                                  Professional Reference {idx + 1}
                                  <span className="text-sm text-blue-600 ml-2 font-normal">(from Employment History)</span>
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-base mt-1">{ref.fullName || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Organisation/Company</label>
                                    <p className="text-base mt-1">{ref.company || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Job Title/Position</label>
                                    <p className="text-base mt-1">{ref.jobTitle || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                                    <p className="text-base mt-1">{ref.relationship || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Applicant's Job Title</label>
                                    <p className="text-base mt-1">{ref.applicantJobTitle || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                    <p className="text-base mt-1">
                                      {ref.startDate ? format(new Date(ref.startDate), 'MMMM yyyy') : '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                    <p className="text-base mt-1">
                                      {ref.endDate ? format(new Date(ref.endDate), 'MMMM yyyy') : '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <p className="text-base mt-1">{ref.email || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                    <p className="text-base mt-1">{ref.phone || '—'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {characterRefs.length > 0 && (
                          <>
                            <h4 className="font-semibold text-base text-muted-foreground mt-6">Character References</h4>
                            {characterRefs.map((ref: any, idx: number) => (
                              <div key={idx} className="border-l-4 border-muted pl-4 space-y-3">
                                <h4 className="font-semibold text-lg">Character Reference {idx + 1}</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-base mt-1">{ref.fullName || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Organisation/Company</label>
                                    <p className="text-base mt-1">{ref.company || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Job Title/Position</label>
                                    <p className="text-base mt-1">{ref.jobTitle || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                                    <p className="text-base mt-1">{ref.relationship || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Applicant's Job Title</label>
                                    <p className="text-base mt-1">{ref.applicantJobTitle || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                    <p className="text-base mt-1">
                                      {ref.startDate ? format(new Date(ref.startDate), 'MMMM yyyy') : '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                    <p className="text-base mt-1">
                                      {ref.endDate ? format(new Date(ref.endDate), 'MMMM yyyy') : '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <p className="text-base mt-1">{ref.email || '—'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                    <p className="text-base mt-1">{ref.phone || '—'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {!hasAnyReferences && (
                          <p className="text-base text-muted-foreground">No references provided</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <Separator />

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
