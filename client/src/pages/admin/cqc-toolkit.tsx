import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FileCheck, Shield, Users, Clock, AlertTriangle, CheckCircle, XCircle, Calendar, Download, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CqcAudit, CqcAuditCategory, CqcChecklistItem, CqcAuditResponse, CqcComplianceRecord, InsertCqcAudit, InsertCqcComplianceRecord } from "@shared/schema";
import { insertCqcAuditSchema, insertCqcComplianceRecordSchema } from "@shared/schema";

// Extended form schemas based on shared insert schemas
// Note: auditorId is handled server-side from authenticated session
const createAuditSchema = insertCqcAuditSchema.extend({
  auditDate: z.string().min(1, "Audit date is required"),
  nextAuditDue: z.string().optional(),
}).omit({ auditorId: true });

const createComplianceRecordSchema = insertCqcComplianceRecordSchema.extend({
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  renewalDue: z.string().optional(),
});

type CreateAuditFormData = z.infer<typeof createAuditSchema>;
type CreateComplianceRecordFormData = z.infer<typeof createComplianceRecordSchema>;

export default function CqcToolkit() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createAuditOpen, setCreateAuditOpen] = useState(false);
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Current user query for getting auditor information
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Queries - using single URL format for default fetcher compatibility
  const { data: audits = [], isLoading: auditsLoading, error: auditsError } = useQuery<CqcAudit[]>({
    queryKey: ["/api/cqc/audits"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CqcAuditCategory[]>({
    queryKey: ["/api/cqc/audit-categories"],
  });

  const { data: complianceRecords = [], isLoading: recordsLoading, error: recordsError } = useQuery<CqcComplianceRecord[]>({
    queryKey: ["/api/cqc/compliance-records"],
  });

  // Mutations
  const createAuditMutation = useMutation({
    mutationFn: async (data: CreateAuditFormData): Promise<CqcAudit> => {
      // Convert string dates to Date objects for API
      const auditData = {
        ...data,
        auditDate: new Date(data.auditDate),
        nextAuditDue: data.nextAuditDue ? new Date(data.nextAuditDue) : null,
      };
      
      return apiRequest('/api/cqc/audits', {
        method: 'POST',
        body: JSON.stringify(auditData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits"] });
      setCreateAuditOpen(false);
      auditForm.reset();
      toast({ title: "Success", description: "Audit created successfully" });
    },
    onError: (error: Error) => {
      console.error('Create audit error:', error);
      toast({ title: "Error", description: error.message || "Failed to create audit", variant: "destructive" });
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async (data: CreateComplianceRecordFormData): Promise<CqcComplianceRecord> => {
      // Convert string dates to Date objects for API
      const recordData = {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        renewalDue: data.renewalDue ? new Date(data.renewalDue) : null,
      };
      
      return apiRequest('/api/cqc/compliance-records', {
        method: 'POST',
        body: JSON.stringify(recordData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/compliance-records"] });
      setCreateRecordOpen(false);
      recordForm.reset();
      toast({ title: "Success", description: "Compliance record created successfully" });
    },
    onError: (error: Error) => {
      console.error('Create record error:', error);
      toast({ title: "Error", description: error.message || "Failed to create compliance record", variant: "destructive" });
    },
  });

  // Forms
  const auditForm = useForm({
    resolver: zodResolver(createAuditSchema),
    defaultValues: {
      title: "",
      auditType: "",
      category: "",
      auditDate: "",
      auditorName: "",
      findings: "",
      recommendations: "",
      nextAuditDue: "",
    },
  });

  const recordForm = useForm({
    resolver: zodResolver(createComplianceRecordSchema),
    defaultValues: {
      staffId: "",
      staffName: "",
      recordType: "",
      title: "",
      issueDate: "",
      expiryDate: "",
      certificateNumber: "",
      issuingBody: "",
      notes: "",
    },
  });

  // Statistics
  const auditStats = {
    total: audits.length,
    completed: audits.filter(a => a.status === "completed").length,
    inProgress: audits.filter(a => a.status === "in_progress").length,
    draft: audits.filter(a => a.status === "draft").length,
  };

  const complianceStats = {
    total: complianceRecords.length,
    active: complianceRecords.filter(r => r.status === "active").length,
    expiringSoon: complianceRecords.filter(r => {
      if (!r.expiryDate) return false;
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return new Date(r.expiryDate) <= thirtyDaysFromNow && r.status === "active";
    }).length,
    expired: complianceRecords.filter(r => {
      if (!r.expiryDate) return false;
      return new Date(r.expiryDate) < new Date() && r.status === "active";
    }).length,
  };

  const onCreateAudit = (data: CreateAuditFormData) => {
    // Note: auditorId is set server-side from authenticated session
    createAuditMutation.mutate(data);
  };

  const onCreateRecord = (data: CreateComplianceRecordFormData) => {
    createRecordMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CQC Audit & Compliance Toolkit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive CQC compliance management for healthcare staffing agencies
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createAuditOpen} onOpenChange={setCreateAuditOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-audit">
                <Plus className="w-4 h-4 mr-2" />
                New Audit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New CQC Audit</DialogTitle>
                <DialogDescription>
                  Create a comprehensive CQC compliance audit
                </DialogDescription>
              </DialogHeader>
              <Form {...auditForm}>
                <form onSubmit={auditForm.handleSubmit(onCreateAudit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={auditForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audit Title</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-audit-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={auditForm.control}
                      name="auditType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audit Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-audit-type">
                                <SelectValue placeholder="Select audit type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="internal">Internal Audit</SelectItem>
                              <SelectItem value="external">External Audit</SelectItem>
                              <SelectItem value="mock_inspection">Mock CQC Inspection</SelectItem>
                              <SelectItem value="self_assessment">Self Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={auditForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-audit-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="safe">Safe</SelectItem>
                              <SelectItem value="effective">Effective</SelectItem>
                              <SelectItem value="caring">Caring</SelectItem>
                              <SelectItem value="responsive">Responsive</SelectItem>
                              <SelectItem value="well_led">Well-Led</SelectItem>
                              <SelectItem value="staff_recruitment">Staff Recruitment</SelectItem>
                              <SelectItem value="training_competency">Training & Competency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={auditForm.control}
                      name="auditorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auditor Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-auditor-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={auditForm.control}
                      name="auditDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audit Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-audit-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={auditForm.control}
                      name="nextAuditDue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Audit Due</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-next-audit-due" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={auditForm.control}
                    name="findings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Findings</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="textarea-findings" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={auditForm.control}
                    name="recommendations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommendations</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} data-testid="textarea-recommendations" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateAuditOpen(false)}
                      data-testid="button-cancel-audit"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAuditMutation.isPending}
                      data-testid="button-submit-audit"
                    >
                      {createAuditMutation.isPending ? "Creating..." : "Create Audit"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={createRecordOpen} onOpenChange={setCreateRecordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-record">
                <Plus className="w-4 h-4 mr-2" />
                New Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Compliance Record</DialogTitle>
                <DialogDescription>
                  Add a new staff compliance record for tracking certificates, training, and qualifications
                </DialogDescription>
              </DialogHeader>
              <Form {...recordForm}>
                <form onSubmit={recordForm.handleSubmit(onCreateRecord)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={recordForm.control}
                      name="staffName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-staff-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recordForm.control}
                      name="recordType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Record Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-record-type">
                                <SelectValue placeholder="Select record type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dbs_check">DBS Check</SelectItem>
                              <SelectItem value="professional_registration">Professional Registration</SelectItem>
                              <SelectItem value="training_certificate">Training Certificate</SelectItem>
                              <SelectItem value="competency_assessment">Competency Assessment</SelectItem>
                              <SelectItem value="health_clearance">Health Clearance</SelectItem>
                              <SelectItem value="reference_check">Reference Check</SelectItem>
                              <SelectItem value="right_to_work">Right to Work</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={recordForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title/Description</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-record-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={recordForm.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-issue-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recordForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-expiry-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={recordForm.control}
                      name="certificateNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-certificate-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={recordForm.control}
                      name="issuingBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issuing Body</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-issuing-body" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={recordForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} data-testid="textarea-record-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateRecordOpen(false)}
                      data-testid="button-cancel-record"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createRecordMutation.isPending}
                      data-testid="button-submit-record"
                    >
                      {createRecordMutation.isPending ? "Creating..." : "Create Record"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <Shield className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="audits" data-testid="tab-audits">
            <FileCheck className="w-4 h-4 mr-2" />
            Audits
          </TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">
            <Users className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <Download className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-audits">{auditStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {auditStats.completed} completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600" data-testid="stat-in-progress">{auditStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  Active audits
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Records</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-compliance-records">{complianceStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {complianceStats.active} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="stat-action-required">
                  {complianceStats.expiringSoon + complianceStats.expired}
                </div>
                <p className="text-xs text-muted-foreground">
                  {complianceStats.expired} expired, {complianceStats.expiringSoon} expiring soon
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
                <CardDescription>Latest CQC audit activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audits.slice(0, 5).map((audit) => (
                    <div key={audit.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {audit.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {audit.status === "in_progress" && <Clock className="h-4 w-4 text-yellow-600" />}
                        {audit.status === "draft" && <XCircle className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" data-testid={`audit-title-${audit.id}`}>
                          {audit.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {audit.category} • {new Date(audit.auditDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        audit.status === "completed" ? "default" :
                        audit.status === "in_progress" ? "secondary" : "outline"
                      }>
                        {audit.status === "completed" ? "Completed" :
                         audit.status === "in_progress" ? "In Progress" : "Draft"}
                      </Badge>
                    </div>
                  ))}
                  {audits.length === 0 && (
                    <p className="text-sm text-gray-500">No audits yet. Create your first audit to get started.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compliance Alerts</CardTitle>
                <CardDescription>Records requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceRecords
                    .filter(r => {
                      if (!r.expiryDate) return false;
                      const thirtyDaysFromNow = new Date();
                      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                      return new Date(r.expiryDate) <= thirtyDaysFromNow;
                    })
                    .slice(0, 5)
                    .map((record) => {
                      const isExpired = record.expiryDate && new Date(record.expiryDate) < new Date();
                      const isExpiringSoon = record.expiryDate && new Date(record.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <div key={record.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <AlertTriangle className={`h-4 w-4 ${isExpired ? "text-red-600" : "text-yellow-600"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate" data-testid={`record-title-${record.id}`}>
                              {record.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {record.staffName} • {record.recordType}
                            </p>
                          </div>
                          <Badge variant={isExpired ? "destructive" : "secondary"}>
                            {isExpired ? "Expired" : "Expires Soon"}
                          </Badge>
                        </div>
                      );
                    })}
                  {complianceStats.expiringSoon + complianceStats.expired === 0 && (
                    <p className="text-sm text-gray-500">All compliance records are up to date.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CQC Audits</CardTitle>
              <CardDescription>Manage your CQC audit activities and compliance checks</CardDescription>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-56" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : auditsError ? (
                <div className="text-center py-8 space-y-4">
                  <XCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="text-red-600">Failed to load audits</p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits"] })} variant="outline" data-testid="button-retry-audits">
                    Retry
                  </Button>
                </div>
              ) : audits.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <FileCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No audits created yet</p>
                  <Button onClick={() => setCreateAuditOpen(true)} data-testid="button-create-first-audit">
                    Create Your First Audit
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <Card key={audit.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium" data-testid={`audit-card-title-${audit.id}`}>{audit.title}</h3>
                            <p className="text-sm text-gray-600">
                              {audit.auditType.replace(/_/g, ' ')} • {audit.category} • {audit.auditorName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Audit Date: {new Date(audit.auditDate).toLocaleDateString()}
                              {audit.nextAuditDue && (
                                <span> • Next Due: {new Date(audit.nextAuditDue).toLocaleDateString()}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              audit.status === "completed" ? "default" :
                              audit.status === "in_progress" ? "secondary" : "outline"
                            }>
                              {audit.status === "completed" ? "Completed" :
                               audit.status === "in_progress" ? "In Progress" : "Draft"}
                            </Badge>
                            <Button variant="outline" size="sm" data-testid={`button-edit-audit-${audit.id}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-view-audit-${audit.id}`}>
                              View Details
                            </Button>
                          </div>
                        </div>
                        {audit.findings && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Key Findings:</strong> {audit.findings}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Records</CardTitle>
              <CardDescription>Track staff qualifications, certifications, and compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-52" />
                            <Skeleton className="h-4 w-40" />
                            <div className="flex space-x-4">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recordsError ? (
                <div className="text-center py-8 space-y-4">
                  <XCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="text-red-600">Failed to load compliance records</p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cqc/compliance-records"] })} variant="outline" data-testid="button-retry-records">
                    Retry
                  </Button>
                </div>
              ) : complianceRecords.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">No compliance records created yet</p>
                  <Button onClick={() => setCreateRecordOpen(true)} data-testid="button-create-first-record">
                    Create Your First Record
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {complianceRecords.map((record) => {
                    const isExpired = record.expiryDate && new Date(record.expiryDate) < new Date();
                    const isExpiringSoon = record.expiryDate && 
                      new Date(record.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                      new Date(record.expiryDate) >= new Date();
                    
                    return (
                      <Card key={record.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium" data-testid={`record-card-title-${record.id}`}>
                                {record.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {record.staffName} • {record.recordType.replace(/_/g, ' ').toUpperCase()}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {record.issueDate && (
                                  <span>Issued: {new Date(record.issueDate).toLocaleDateString()}</span>
                                )}
                                {record.expiryDate && (
                                  <span>Expires: {new Date(record.expiryDate).toLocaleDateString()}</span>
                                )}
                                {record.certificateNumber && (
                                  <span>Cert: {record.certificateNumber}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                isExpired ? "destructive" :
                                isExpiringSoon ? "secondary" : "default"
                              }>
                                {isExpired ? "Expired" :
                                 isExpiringSoon ? "Expires Soon" : "Active"}
                              </Badge>
                              <Button variant="outline" size="sm" data-testid={`button-edit-record-${record.id}`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-view-record-${record.id}`}>
                                View Details
                              </Button>
                            </div>
                          </div>
                          {record.notes && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Notes:</strong> {record.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CQC Compliance Reports</CardTitle>
              <CardDescription>Generate comprehensive reports for CQC compliance and audit purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Audit Summary Report</CardTitle>
                    <CardDescription>Comprehensive overview of all audits and findings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" data-testid="button-generate-audit-report">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Audit Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Dashboard</CardTitle>
                    <CardDescription>Staff compliance status and expiry tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" data-testid="button-generate-compliance-report">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Compliance Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CQC Readiness Report</CardTitle>
                    <CardDescription>Assessment of CQC inspection readiness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" data-testid="button-generate-readiness-report">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Readiness Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Staff Training Matrix</CardTitle>
                    <CardDescription>Complete training and qualification tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" data-testid="button-generate-training-report">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Training Matrix
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}