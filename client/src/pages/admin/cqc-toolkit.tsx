import { useState, useEffect, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Building2, Briefcase, FileWarning, DollarSign, Home, ShieldCheck, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, FileCheck, Shield, Users, Clock, AlertTriangle, CheckCircle, XCircle, Calendar, Download, Edit, Trash2, Brain, QrCode, Mail, PlayCircle, Eye, Upload, Camera, FileText, Award, MessageSquare, BarChart3, ClipboardCheck, X, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardModal } from '@uppy/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import type { CqcAudit, CqcAuditCategory, CqcQualityStatement, CqcEvidenceCategory, CqcAuditEvidence, CqcQualityAssessment, CqcComplianceRecord, InsertCqcAudit, InsertCqcComplianceRecord, KnowledgeQuestionnaire, InsertKnowledgeQuestionnaire, KnowledgeQuestion, InsertKnowledgeQuestion, KnowledgeSession, KnowledgeAction, ServiceImprovementPlanItem, AuditScheduleSettings } from "@shared/schema";
import { insertCqcAuditSchema, insertCqcComplianceRecordSchema, insertKnowledgeQuestionnaireSchema, insertKnowledgeQuestionSchema } from "@shared/schema";
import { CategoryAuditFormDialog } from "@/components/admin/CategoryAuditFormDialog";
import { StaffAssessmentsTab } from "@/components/admin/StaffAssessmentsTab";

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

const createKnowledgeQuestionnaireSchema = insertKnowledgeQuestionnaireSchema.omit({ createdBy: true, shareableLink: true });
const createKnowledgeQuestionSchema = insertKnowledgeQuestionSchema;

// Insurance audit form schema
const insuranceAuditSchema = z.object({
  hasCurrentInsurance: z.string().min(1, "Please select an option"),
  insuranceCompanyName: z.string().min(1, "Insurance company name is required"),
  coverageDetails: z.string().min(1, "Coverage details are required"),
  score: z.coerce.number().min(0, "Score must be at least 0").max(6, "Score must be at most 6"),
  furtherInformation: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Statement of Purpose Audit schema (Good Governance)
const statementOfPurposeAuditSchema = z.object({
  lastReviewDate: z.string().min(1, "Last review date is required"),
  newReviewDate: z.string().min(1, "New review date is required"),
  sopReviewed: z.string().min(1, "Please select an option"),
  sopChanges: z.string().optional(),
  sopReviewDateUpdated: z.string().min(1, "Please select an option"),
  uploadedFileName: z.string().optional(),
  uploadedFileData: z.string().optional(),
  notes: z.string().optional(),
});

// === BUSINESS AUDITS SCHEMAS ===

// Business Continuity Plan audit schema
const businessContinuityAuditSchema = z.object({
  bcpDocumentInPlace: z.string().min(1, "Please select an option"),
  bcpDetails: z.string().min(1, "Details are required"),
  riskAssessmentComplete: z.string().min(1, "Please select an option"),
  riskDetails: z.string().min(1, "Details are required"),
  emergencyContactsUpdated: z.string().min(1, "Please select an option"),
  contactDetails: z.string().min(1, "Details are required"),
  backupSystemsInPlace: z.string().min(1, "Please select an option"),
  backupDetails: z.string().min(1, "Details are required"),
  staffTrainedInBcp: z.string().min(1, "Please select an option"),
  trainingDetails: z.string().min(1, "Details are required"),
  testingConducted: z.string().min(1, "Please select an option"),
  testingDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Data Protection / GDPR audit schema
const dataProtectionAuditSchema = z.object({
  privacyPolicyInPlace: z.string().min(1, "Please select an option"),
  policyDetails: z.string().min(1, "Details are required"),
  dpoIdentified: z.string().min(1, "Please select an option"),
  dpoDetails: z.string().min(1, "Details are required"),
  dataProcessingRecords: z.string().min(1, "Please select an option"),
  recordsDetails: z.string().min(1, "Details are required"),
  consentManagement: z.string().min(1, "Please select an option"),
  consentDetails: z.string().min(1, "Details are required"),
  dataBreachProcedure: z.string().min(1, "Please select an option"),
  breachDetails: z.string().min(1, "Details are required"),
  staffTrainedInGdpr: z.string().min(1, "Please select an option"),
  gdprTrainingDetails: z.string().min(1, "Details are required"),
  subjectAccessProcess: z.string().min(1, "Please select an option"),
  sarDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Financial Controls audit schema
const financialControlsAuditSchema = z.object({
  segregationOfDuties: z.string().min(1, "Please select an option"),
  segregationDetails: z.string().min(1, "Details are required"),
  paymentApprovals: z.string().min(1, "Please select an option"),
  approvalDetails: z.string().min(1, "Details are required"),
  bankReconciliations: z.string().min(1, "Please select an option"),
  reconciliationDetails: z.string().min(1, "Details are required"),
  expenseControls: z.string().min(1, "Please select an option"),
  expenseDetails: z.string().min(1, "Details are required"),
  auditTrailMaintained: z.string().min(1, "Please select an option"),
  auditTrailDetails: z.string().min(1, "Details are required"),
  budgetMonitoring: z.string().min(1, "Please select an option"),
  budgetDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Health & Safety Premises audit schema
const premisesAuditSchema = z.object({
  fireRiskAssessment: z.string().min(1, "Please select an option"),
  fireDetails: z.string().min(1, "Details are required"),
  patTesting: z.string().min(1, "Please select an option"),
  patDetails: z.string().min(1, "Details are required"),
  legionellaAssessment: z.string().min(1, "Please select an option"),
  legionellaDetails: z.string().min(1, "Details are required"),
  asbestosRegister: z.string().min(1, "Please select an option"),
  asbestosDetails: z.string().min(1, "Details are required"),
  securityMeasures: z.string().min(1, "Please select an option"),
  securityDetails: z.string().min(1, "Details are required"),
  accessibilityCompliance: z.string().min(1, "Please select an option"),
  accessibilityDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Service Improvement Plan (SIP) form schema
const sipFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["must_do", "should_do"]),
  cqcDomain: z.string().optional(),
  serviceArea: z.string().optional(),
  responsibility: z.string().optional(),
  targetDate: z.string().optional(),
  evidence: z.string().optional(),
});

type SipFormData = z.infer<typeof sipFormSchema>;

type CreateAuditFormData = z.infer<typeof createAuditSchema>;
type CreateComplianceRecordFormData = z.infer<typeof createComplianceRecordSchema>;
type CreateKnowledgeQuestionnaireFormData = z.infer<typeof createKnowledgeQuestionnaireSchema>;
type CreateKnowledgeQuestionFormData = z.infer<typeof createKnowledgeQuestionSchema>;
type InsuranceAuditFormData = z.infer<typeof insuranceAuditSchema>;
type BusinessContinuityAuditFormData = z.infer<typeof businessContinuityAuditSchema>;
type DataProtectionAuditFormData = z.infer<typeof dataProtectionAuditSchema>;
type FinancialControlsAuditFormData = z.infer<typeof financialControlsAuditSchema>;
type PremisesAuditFormData = z.infer<typeof premisesAuditSchema>;
type StatementOfPurposeAuditFormData = z.infer<typeof statementOfPurposeAuditSchema>;

// Icon mapping for evidence categories
const EVIDENCE_CATEGORY_ICONS: Record<string, any> = {
  "people_experience": Users,
  "staff_feedback": MessageSquare,
  "observations": Eye,
  "records_documents": FileText,
  "systems_processes": BarChart3,
  "environment_resources": ClipboardCheck
};

// Color mapping for evidence categories
const EVIDENCE_CATEGORY_COLORS: Record<string, string> = {
  "people_experience": "text-blue-600",
  "staff_feedback": "text-green-600",
  "observations": "text-purple-600",
  "records_documents": "text-orange-600",
  "systems_processes": "text-red-600",
  "environment_resources": "text-teal-600"
};


// Branch options for multi-location support
const BRANCH_OPTIONS = [
  { value: "Plymouth", label: "Plymouth" },
  { value: "Truro", label: "Truro" },
];

// CQC Feedback Category Configuration
const FEEDBACK_CATEGORIES = {
  C: { label: "Caring", color: "bg-rose-500", description: "Compassionate care and emotional support" },
  S: { label: "Safe", color: "bg-emerald-500", description: "Safety, risk management, and safeguarding" },
  P: { label: "People", color: "bg-blue-500", description: "Staff competence and person-centred care" },
  F: { label: "Friends & Family", color: "bg-amber-500", description: "Recommendation and overall satisfaction" },
} as const;

interface FeedbackCampaign {
  id: string;
  name: string;
  description?: string;
  branch: string;
  category: "C" | "S" | "P" | "F";
  status: "draft" | "active" | "paused" | "closed";
  startDate?: Date;
  endDate?: Date;
  linkToken: string;
  responseCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FeedbackResponse {
  id: string;
  campaignId: string;
  branch: string;
  source: string;
  overallRating?: number;
  npsScore?: number;
  wouldRecommend?: boolean;
  positiveComments?: string;
  improvementComments?: string;
  status: string;
  createdAt: Date;
}

interface FeedbackStats {
  totalResponses: number;
  averageRating: number;
  npsScore: number;
  ratingDistribution: Record<number, number>;
  recommendPercentage: number;
}

function FeedbackTab({ branch }: { branch: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<FeedbackCampaign | null>(null);
  const [viewResponses, setViewResponses] = useState(false);
  const [addManualResponse, setAddManualResponse] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const campaignSchema = z.object({
    name: z.string().min(1, "Campaign name is required"),
    description: z.string().optional(),
    category: z.enum(["C", "S", "P", "F"]),
    status: z.enum(["draft", "active", "paused", "closed"]).default("draft"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });

  const manualResponseSchema = z.object({
    source: z.enum(["manual", "email", "phone", "in_person", "letter"]),
    overallRating: z.coerce.number().min(1).max(5).optional(),
    npsScore: z.coerce.number().min(0).max(10).optional(),
    wouldRecommend: z.string().optional().transform(v => v === "yes" ? true : v === "no" ? false : undefined),
    positiveComments: z.string().optional(),
    improvementComments: z.string().optional(),
    respondentName: z.string().optional(),
    respondentRelationship: z.string().optional(),
    adminNotes: z.string().optional(),
  });

  const campaignForm = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "F",
      status: "draft",
      startDate: "",
      endDate: "",
    },
  });

  const manualResponseForm = useForm<z.infer<typeof manualResponseSchema>>({
    resolver: zodResolver(manualResponseSchema),
    defaultValues: {
      source: "manual",
      overallRating: undefined,
      npsScore: undefined,
      wouldRecommend: undefined,
      positiveComments: "",
      improvementComments: "",
      respondentName: "",
      respondentRelationship: "",
      adminNotes: "",
    },
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<FeedbackCampaign[]>({
    queryKey: ["/api/cqc/feedback/campaigns", branch, categoryFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ branch });
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const res = await fetch(`/api/cqc/feedback/campaigns?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return res.json();
    },
  });

  const { data: campaignStats } = useQuery<FeedbackStats>({
    queryKey: ["/api/cqc/feedback/campaigns", selectedCampaign?.id, "stats"],
    queryFn: async () => {
      const res = await fetch(`/api/cqc/feedback/campaigns/${selectedCampaign?.id}/stats`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!selectedCampaign,
  });

  const { data: campaignResponses = [] } = useQuery<FeedbackResponse[]>({
    queryKey: ["/api/cqc/feedback/campaigns", selectedCampaign?.id, "responses"],
    queryFn: async () => {
      const res = await fetch(`/api/cqc/feedback/campaigns/${selectedCampaign?.id}/responses`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
    enabled: !!selectedCampaign && viewResponses,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: z.infer<typeof campaignSchema>) => {
      return await apiRequest("POST", "/api/cqc/feedback/campaigns", { ...data, branch });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/feedback/campaigns", branch] });
      setCreateCampaignOpen(false);
      campaignForm.reset();
      toast({ title: "Campaign Created", description: "Your feedback campaign has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeedbackCampaign> }) => {
      return await apiRequest("PUT", `/api/cqc/feedback/campaigns/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/feedback/campaigns", branch] });
      toast({ title: "Campaign Updated", description: "Campaign status has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/cqc/feedback/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/feedback/campaigns", branch] });
      setSelectedCampaign(null);
      toast({ title: "Campaign Deleted", description: "The campaign has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addManualResponseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof manualResponseSchema>) => {
      return await apiRequest("POST", `/api/cqc/feedback/campaigns/${selectedCampaign?.id}/responses`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/feedback/campaigns", selectedCampaign?.id, "responses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/feedback/campaigns", selectedCampaign?.id, "stats"] });
      setAddManualResponse(false);
      manualResponseForm.reset();
      toast({ title: "Response Added", description: "Manual feedback response has been recorded." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyLinkToClipboard = (token: string) => {
    const url = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Feedback form link has been copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            CQC Feedback Collection
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collect and analyse feedback aligned with CQC quality domains (C/S/P/F)
          </p>
        </div>

        <Dialog open={createCampaignOpen} onOpenChange={setCreateCampaignOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Feedback Campaign</DialogTitle>
              <DialogDescription>
                Set up a new feedback collection campaign for a CQC quality domain.
              </DialogDescription>
            </DialogHeader>
            <Form {...campaignForm}>
              <form onSubmit={campaignForm.handleSubmit((data) => createCampaignMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={campaignForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Q4 2025 Friends & Family Survey" data-testid="input-campaign-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={campaignForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} placeholder="Brief description of this campaign" data-testid="input-campaign-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={campaignForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CQC Domain</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-campaign-category">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(FEEDBACK_CATEGORIES).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                                {cat.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={campaignForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-campaign-start" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={campaignForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-campaign-end" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateCampaignOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCampaignMutation.isPending} data-testid="button-submit-campaign">
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Domain:</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]" data-testid="select-filter-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {Object.entries(FEEDBACK_CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loadingCampaigns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg">No Feedback Campaigns</h3>
            <p className="text-muted-foreground mt-1">
              Create your first campaign to start collecting feedback.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const categoryConfig = FEEDBACK_CATEGORIES[campaign.category];
            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow" data-testid={`campaign-card-${campaign.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${categoryConfig.color}`}></div>
                      <Badge variant={campaign.status === "active" ? "default" : campaign.status === "closed" ? "secondary" : "outline"}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">{categoryConfig.label}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{campaign.name}</CardTitle>
                  {campaign.description && (
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responses</span>
                    <span className="font-medium">{campaign.responseCount}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLinkToClipboard(campaign.linkToken)}
                      data-testid={`button-copy-link-${campaign.id}`}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setViewResponses(true);
                      }}
                      data-testid={`button-view-responses-${campaign.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {campaign.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => updateCampaignMutation.mutate({ id: campaign.id, data: { status: "active" } })}
                        data-testid={`button-activate-${campaign.id}`}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Campaign Detail Dialog */}
      <Dialog open={viewResponses} onOpenChange={(open) => { setViewResponses(open); if (!open) setSelectedCampaign(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${FEEDBACK_CATEGORIES[selectedCampaign.category].color}`}></div>
                    <DialogTitle>{selectedCampaign.name}</DialogTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={selectedCampaign.status === "active" ? "default" : "outline"}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                </div>
                <DialogDescription>{selectedCampaign.description}</DialogDescription>
              </DialogHeader>

              {/* Stats Cards */}
              {campaignStats && (
                <>
                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{campaignStats.totalResponses}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1">
                          {campaignStats.averageRating.toFixed(1)}
                          <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${campaignStats.npsScore >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {campaignStats.npsScore > 0 ? "+" : ""}{campaignStats.npsScore}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Would Recommend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{campaignStats.recommendPercentage}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row */}
                  {campaignStats.totalResponses > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      {/* Rating Distribution Chart */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { rating: "1★", count: campaignStats.ratingDistribution[1] || 0, fill: "#ef4444" },
                                { rating: "2★", count: campaignStats.ratingDistribution[2] || 0, fill: "#f97316" },
                                { rating: "3★", count: campaignStats.ratingDistribution[3] || 0, fill: "#eab308" },
                                { rating: "4★", count: campaignStats.ratingDistribution[4] || 0, fill: "#84cc16" },
                                { rating: "5★", count: campaignStats.ratingDistribution[5] || 0, fill: "#22c55e" },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rating" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Responses">
                                  {[
                                    { rating: "1★", count: campaignStats.ratingDistribution[1] || 0, fill: "#ef4444" },
                                    { rating: "2★", count: campaignStats.ratingDistribution[2] || 0, fill: "#f97316" },
                                    { rating: "3★", count: campaignStats.ratingDistribution[3] || 0, fill: "#eab308" },
                                    { rating: "4★", count: campaignStats.ratingDistribution[4] || 0, fill: "#84cc16" },
                                    { rating: "5★", count: campaignStats.ratingDistribution[5] || 0, fill: "#22c55e" },
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recommendation Pie Chart */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Would Recommend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-48 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: "Yes", value: campaignStats.recommendPercentage, fill: "#22c55e" },
                                    { name: "No", value: 100 - campaignStats.recommendPercentage, fill: "#ef4444" },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  dataKey="value"
                                  label={({ name, value }) => `${name}: ${value}%`}
                                >
                                  <Cell fill="#22c55e" />
                                  <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip formatter={(value) => `${value}%`} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setAddManualResponse(true)} data-testid="button-add-manual-response">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Response
                </Button>
                <Button variant="outline" onClick={() => copyLinkToClipboard(selectedCampaign.linkToken)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Copy Public Link
                </Button>
                {selectedCampaign.status === "active" && (
                  <Button variant="outline" onClick={() => updateCampaignMutation.mutate({ id: selectedCampaign.id, data: { status: "paused" } })}>
                    Pause Campaign
                  </Button>
                )}
                {selectedCampaign.status === "paused" && (
                  <Button onClick={() => updateCampaignMutation.mutate({ id: selectedCampaign.id, data: { status: "active" } })}>
                    Resume Campaign
                  </Button>
                )}
              </div>

              {/* Responses List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {campaignResponses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No responses yet</p>
                ) : (
                  campaignResponses.map((response) => (
                    <Card key={response.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{response.source}</Badge>
                            {response.overallRating && (
                              <span className="flex items-center gap-1 text-sm">
                                {response.overallRating} <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
                              </span>
                            )}
                            {response.wouldRecommend !== undefined && (
                              <span className={`text-xs ${response.wouldRecommend ? "text-green-600" : "text-red-600"}`}>
                                {response.wouldRecommend ? "Would recommend" : "Would not recommend"}
                              </span>
                            )}
                          </div>
                          {response.positiveComments && (
                            <p className="text-sm"><strong>Positive:</strong> {response.positiveComments}</p>
                          )}
                          {response.improvementComments && (
                            <p className="text-sm"><strong>To improve:</strong> {response.improvementComments}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Response Dialog */}
      <Dialog open={addManualResponse} onOpenChange={setAddManualResponse}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Manual Feedback Response</DialogTitle>
            <DialogDescription>
              Record feedback received via phone, email, letter, or in person.
            </DialogDescription>
          </DialogHeader>
          <Form {...manualResponseForm}>
            <form onSubmit={manualResponseForm.handleSubmit((data) => addManualResponseMutation.mutate(data))} className="space-y-4">
              <FormField
                control={manualResponseForm.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-response-source">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={manualResponseForm.control}
                  name="overallRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={5} {...field} data-testid="input-response-rating" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={manualResponseForm.control}
                  name="npsScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPS Score (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={10} {...field} data-testid="input-response-nps" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={manualResponseForm.control}
                name="wouldRecommend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Would Recommend?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-response-recommend">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={manualResponseForm.control}
                name="positiveComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Positive Comments</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-response-positive" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={manualResponseForm.control}
                name="improvementComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Improvement Suggestions</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-response-improvement" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={manualResponseForm.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Internal notes about this response" data-testid="input-response-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddManualResponse(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addManualResponseMutation.isPending} data-testid="button-submit-response">
                  {addManualResponseMutation.isPending ? "Saving..." : "Add Response"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CqcToolkit() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBranch, setSelectedBranch] = useState("Plymouth");
  const [matrixFrequencyFilter, setMatrixFrequencyFilter] = useState("all");
  const [createAuditOpen, setCreateAuditOpen] = useState(false);
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [createQuestionnaireOpen, setCreateQuestionnaireOpen] = useState(false);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ url: string; title: string } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  // CQC Regulation Audit States
  const [insuranceAuditOpen, setInsuranceAuditOpen] = useState(false);
  const [statementOfPurposeAuditOpen, setStatementOfPurposeAuditOpen] = useState(false);
  // Business Audit States
  const [businessContinuityAuditOpen, setBusinessContinuityAuditOpen] = useState(false);
  const [dataProtectionAuditOpen, setDataProtectionAuditOpen] = useState(false);
  const [financialControlsAuditOpen, setFinancialControlsAuditOpen] = useState(false);
  const [premisesAuditOpen, setPremisesAuditOpen] = useState(false);
  // Service Improvement Plan (SIP) States
  const [sipDialogOpen, setSipDialogOpen] = useState(false);
  const [editingSipItem, setEditingSipItem] = useState<ServiceImprovementPlanItem | null>(null);
  const [sipFilter, setSipFilter] = useState<{ status?: string; priority?: string }>({});
  // SIP checkbox states for audit forms - tracks which sections should be added to SIP on submit
  const [bcSipChecks, setBcSipChecks] = useState<Record<string, boolean>>({});
  const [dpSipChecks, setDpSipChecks] = useState<Record<string, boolean>>({});
  const [fcSipChecks, setFcSipChecks] = useState<Record<string, boolean>>({});
  const [premisesSipChecks, setPremisesSipChecks] = useState<Record<string, boolean>>({});
  // Audit forms tab state
  const [auditFormsTab, setAuditFormsTab] = useState("cqc");
  const [selectedEvidenceFiles, setSelectedEvidenceFiles] = useState<File[]>([]);
  // Category audit form state (for dynamic audit forms from matrix)
  const [categoryAuditFormOpen, setCategoryAuditFormOpen] = useState(false);
  const [selectedCategoryForAudit, setSelectedCategoryForAudit] = useState<{ key: string; label: string } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Current user query for getting auditor information
  const { data: authData } = useQuery<{ user: { id: string; username: string; role: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const currentUser = authData?.user;

  // Queries - using single URL format for default fetcher compatibility
  // All queries now filter by selectedBranch
  const { data: audits = [], isLoading: auditsLoading, error: auditsError } = useQuery<CqcAudit[]>({
    queryKey: ["/api/cqc/audits", selectedBranch],
    queryFn: async () => {
      const response = await fetch(`/api/cqc/audits?branch=${encodeURIComponent(selectedBranch)}`, { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch audits');
      }
      return response.json();
    },
    retry: 3,
    retryDelay: 500,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CqcAuditCategory[]>({
    queryKey: ["/api/cqc/audit-categories"],
  });

  const { data: complianceRecords = [], isLoading: recordsLoading, error: recordsError } = useQuery<CqcComplianceRecord[]>({
    queryKey: ["/api/cqc/compliance-records", selectedBranch],
    queryFn: async () => {
      const response = await fetch(`/api/cqc/compliance-records?branch=${encodeURIComponent(selectedBranch)}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch compliance records');
      return response.json();
    },
  });

  const { data: knowledgeQuestionnaires = [], isLoading: questionnairesLoading, error: questionnairesError } = useQuery<KnowledgeQuestionnaire[]>({
    queryKey: ["/api/knowledge/questionnaires"],
  });

  const { data: knowledgeSessions = [], isLoading: sessionsLoading } = useQuery<KnowledgeSession[]>({
    queryKey: ["/api/knowledge/sessions"],
  });

  const { data: knowledgeQuestions = [], isLoading: questionsLoading } = useQuery<KnowledgeQuestion[]>({
    queryKey: ["/api/knowledge/questionnaires", selectedQuestionnaire, "questions"],
    enabled: !!selectedQuestionnaire,
  });

  // CQC 2024 Framework queries
  const { data: cqcEvidenceCategories = [], isLoading: evidenceCategoriesLoading } = useQuery<CqcEvidenceCategory[]>({
    queryKey: ["/api/cqc/evidence-categories"],
  });

  const { data: cqcQualityStatements = [], isLoading: qualityStatementsLoading } = useQuery<CqcQualityStatement[]>({
    queryKey: ["/api/cqc/quality-statements"],
  });

  const { data: cqcAuditEvidence = [], isLoading: auditEvidenceLoading } = useQuery<CqcAuditEvidence[]>({
    queryKey: ["/api/cqc/audit-evidence"],
  });

  const { data: cqcQualityAssessments = [], isLoading: qualityAssessmentsLoading } = useQuery<CqcQualityAssessment[]>({
    queryKey: ["/api/cqc/quality-assessments"],
  });

  // Service Improvement Plan queries
  const sipQueryParams = new URLSearchParams();
  if (sipFilter.status) sipQueryParams.append('status', sipFilter.status);
  if (sipFilter.priority) sipQueryParams.append('priority', sipFilter.priority);
  sipQueryParams.append('branch', selectedBranch);
  const sipQueryString = `?${sipQueryParams.toString()}`;
  
  const { data: sipItems = [], isLoading: sipItemsLoading, error: sipItemsError } = useQuery<ServiceImprovementPlanItem[]>({
    queryKey: ["/api/admin/sip", sipFilter, selectedBranch],
    queryFn: async () => {
      const response = await fetch(`/api/admin/sip${sipQueryString}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch SIP items');
      return response.json();
    },
  });

  // Audit Schedule Settings query - for matrix frequency management
  const { data: auditScheduleSettings = [], isLoading: scheduleSettingsLoading } = useQuery<AuditScheduleSettings[]>({
    queryKey: ["/api/cqc/audit-schedules", selectedBranch],
    queryFn: async () => {
      const response = await fetch(`/api/cqc/audit-schedules?branch=${encodeURIComponent(selectedBranch)}`, { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }
        throw new Error('Failed to fetch audit schedules');
      }
      return response.json();
    },
    retry: 3,
    retryDelay: 500,
  });

  // Mutation for updating audit schedule settings
  const updateAuditScheduleMutation = useMutation({
    mutationFn: async (data: { category: string; frequency: string; branch: string }): Promise<AuditScheduleSettings> => {
      const response = await apiRequest('POST', '/api/cqc/audit-schedules', data);
      return response.json();
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData<AuditScheduleSettings[]>(
        ["/api/cqc/audit-schedules", selectedBranch],
        (old = []) => {
          const filtered = old.filter(s => s.category !== newSettings.category);
          return [...filtered, newSettings];
        }
      );
      toast({ title: "Success", description: "Audit frequency updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update frequency", variant: "destructive" });
    },
  });

  // CQC Evidence upload mutation
  const uploadEvidenceMutation = useMutation({
    mutationFn: async (evidenceData: {
      evidenceCategoryId: string;
      qualityStatementId: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      fileType: string;
      description?: string;
    }): Promise<CqcAuditEvidence> => {
      const response = await apiRequest('POST', '/api/cqc/audit-evidence', evidenceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audit-evidence"] });
      toast({ title: "Success", description: "Evidence uploaded successfully" });
    },
    onError: (error: Error) => {
      console.error('Upload evidence error:', error);
      toast({ title: "Error", description: error.message || "Failed to upload evidence", variant: "destructive" });
    },
  });

  // Mutations - now include branch for multi-location support
  const createAuditMutation = useMutation({
    mutationFn: async (data: CreateAuditFormData): Promise<CqcAudit> => {
      // Convert string dates to Date objects for API and include branch
      const auditData = {
        ...data,
        branch: selectedBranch,
        auditDate: new Date(data.auditDate),
        nextAuditDue: data.nextAuditDue ? new Date(data.nextAuditDue) : null,
      };
      
      const response = await apiRequest('POST', '/api/cqc/audits', auditData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits", selectedBranch] });
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
      // Convert string dates to Date objects for API and include branch
      const recordData = {
        ...data,
        branch: selectedBranch,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        renewalDue: data.renewalDue ? new Date(data.renewalDue) : null,
      };
      
      const response = await apiRequest('POST', '/api/cqc/compliance-records', recordData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/compliance-records", selectedBranch] });
      setCreateRecordOpen(false);
      recordForm.reset();
      toast({ title: "Success", description: "Compliance record created successfully" });
    },
    onError: (error: Error) => {
      console.error('Create record error:', error);
      toast({ title: "Error", description: error.message || "Failed to create compliance record", variant: "destructive" });
    },
  });

  const createQuestionnaireMutation = useMutation({
    mutationFn: async (data: CreateKnowledgeQuestionnaireFormData): Promise<KnowledgeQuestionnaire> => {
      const response = await apiRequest('POST', '/api/knowledge/questionnaires', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge/questionnaires"] });
      setCreateQuestionnaireOpen(false);
      questionnaireForm.reset();
      toast({ title: "Success", description: "Knowledge questionnaire created successfully" });
    },
    onError: (error: Error) => {
      console.error('Create questionnaire error:', error);
      toast({ title: "Error", description: error.message || "Failed to create questionnaire", variant: "destructive" });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: CreateKnowledgeQuestionFormData): Promise<KnowledgeQuestion> => {
      const response = await apiRequest('POST', '/api/knowledge/questions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge/questionnaires", selectedQuestionnaire, "questions"] });
      setCreateQuestionOpen(false);
      questionForm.reset();
      toast({ title: "Success", description: "Question created successfully" });
    },
    onError: (error: Error) => {
      console.error('Create question error:', error);
      toast({ title: "Error", description: error.message || "Failed to create question", variant: "destructive" });
    },
  });

  // Service Improvement Plan mutations - include branch for multi-location support
  const createSipMutation = useMutation({
    mutationFn: async (data: SipFormData): Promise<ServiceImprovementPlanItem> => {
      const response = await apiRequest('POST', '/api/admin/sip', { ...data, branch: selectedBranch });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sip", sipFilter, selectedBranch] });
      setSipDialogOpen(false);
      sipForm.reset();
      toast({ title: "Success", description: "Improvement item added to plan" });
    },
    onError: (error: Error) => {
      console.error('Create SIP item error:', error);
      toast({ title: "Error", description: error.message || "Failed to add improvement item", variant: "destructive" });
    },
  });

  // Silent SIP mutation for batch creation from audit forms (no dialog side effects)
  const createSipSilentMutation = useMutation({
    mutationFn: async (data: SipFormData): Promise<ServiceImprovementPlanItem> => {
      const response = await apiRequest('POST', '/api/admin/sip', { ...data, branch: selectedBranch });
      return response.json();
    },
  });

  const updateSipMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SipFormData> }): Promise<ServiceImprovementPlanItem> => {
      const response = await apiRequest('PUT', `/api/admin/sip/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sip", sipFilter, selectedBranch] });
      setSipDialogOpen(false);
      setEditingSipItem(null);
      sipForm.reset();
      toast({ title: "Success", description: "Improvement item updated" });
    },
    onError: (error: Error) => {
      console.error('Update SIP item error:', error);
      toast({ title: "Error", description: error.message || "Failed to update improvement item", variant: "destructive" });
    },
  });

  const completeSipMutation = useMutation({
    mutationFn: async (id: string): Promise<ServiceImprovementPlanItem> => {
      const response = await apiRequest('PUT', `/api/admin/sip/${id}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sip", sipFilter, selectedBranch] });
      toast({ title: "Success", description: "Improvement item marked as completed" });
    },
    onError: (error: Error) => {
      console.error('Complete SIP item error:', error);
      toast({ title: "Error", description: error.message || "Failed to complete improvement item", variant: "destructive" });
    },
  });

  const deleteSipMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest('DELETE', `/api/admin/sip/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sip", sipFilter, selectedBranch] });
      toast({ title: "Success", description: "Improvement item deleted" });
    },
    onError: (error: Error) => {
      console.error('Delete SIP item error:', error);
      toast({ title: "Error", description: error.message || "Failed to delete improvement item", variant: "destructive" });
    },
  });

  const createInsuranceAuditMutation = useMutation({
    mutationFn: async (data: InsuranceAuditFormData): Promise<void> => {
      // First create the audit record with branch
      const auditData = {
        title: "Insurance Audit",
        auditType: "compliance_specific",
        serviceType: "administrative",
        keyQuestion: "well_led",
        branch: selectedBranch,
        auditDate: new Date().toISOString(),
        auditorId: currentUser?.id || "unknown-auditor", // Provide fallback for missing session
        auditorName: currentUser?.username || "Unknown",
        findings: JSON.stringify({
          hasCurrentInsurance: data.hasCurrentInsurance,
          insuranceCompanyName: data.insuranceCompanyName,
          coverageDetails: data.coverageDetails,
          score: data.score,
          furtherInformation: data.furtherInformation,
          actions: data.actions,
          auditType: "insurance",
          evidenceFileCount: selectedEvidenceFiles.length
        }),
        actionPlan: data.actions,
      };
      
      const response = await apiRequest('POST', '/api/cqc/audits', auditData);
      const createdAudit = await response.json();
      
      // If there are evidence files, try to upload them using the existing evidence upload system
      if (selectedEvidenceFiles.length > 0) {
        try {
          // Use a default quality statement ID for insurance audits if we can't get categories
          // This is a workaround for the evidence categories API issue
          const evidencePromises = selectedEvidenceFiles.map(async (file, index) => {
            const evidenceData = {
              evidenceCategoryId: "insurance_documents", // Use string ID as fallback
              qualityStatementId: createdAudit.id, // Link to the audit (though this field name may be confusing)
              fileName: file.name,
              fileUrl: `pending_upload_${file.name}`, // Use fileUrl to match existing schema
              fileSize: file.size,
              fileType: file.type,
              description: `Insurance audit evidence file: ${file.name}`,
            };
            
            // Use the existing evidence upload mutation logic
            return apiRequest('POST', '/api/cqc/audit-evidence', evidenceData);
          });
          
          await Promise.all(evidencePromises);
          console.log('Evidence files processed successfully');
        } catch (error) {
          console.error('Error handling evidence files (continuing with audit):', error);
          // Don't throw - let the audit succeed even if evidence upload fails
          // The user will still get feedback about the audit being saved
          toast({ 
            title: "Partial Success", 
            description: "Audit saved successfully, but evidence files could not be uploaded", 
            variant: "default" 
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits", selectedBranch] });
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audit-evidence"] });
      setInsuranceAuditOpen(false);
      setSelectedEvidenceFiles([]);
      insuranceAuditForm.reset();
      toast({ title: "Success", description: "Insurance audit saved successfully" });
    },
    onError: (error: Error) => {
      console.error('Create insurance audit error:', error);
      toast({ title: "Error", description: error.message || "Failed to save insurance audit", variant: "destructive" });
    },
  });

  // Generic CQC Audit mutation - reusable for all regulation audits
  // 6-point scoring: 6=Good, 5=Requires Improvement, 0-4=Inadequate
  const genericAuditMutation = useMutation({
    mutationFn: async (params: { 
      title: string;
      category: string;
      keyQuestion: string;
      data: any;
    }): Promise<void> => {
      const { title, category, keyQuestion, data } = params;
      const score = Number(data.score) || 0;
      const auditData = {
        title,
        auditType: "fundamental_standards",
        category,
        serviceType: "domiciliary_care",
        keyQuestion,
        branch: selectedBranch,
        auditDate: new Date().toISOString(),
        auditorId: currentUser?.id || "unknown-auditor",
        auditorName: currentUser?.username || "Unknown Auditor",
        overallRating: score === 6 ? "good" : score === 5 ? "requires_improvement" : "inadequate",
        findings: JSON.stringify(data),
        areasOfStrength: data.areasOfStrength || "",
        areasForImprovement: data.areasForImprovement || "",
        actionPlan: data.actions || "",
      };
      await apiRequest('POST', '/api/cqc/audits', auditData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits", selectedBranch] });
      toast({ title: "Success", description: "Audit saved successfully" });
    },
    onError: (error: Error) => {
      console.error('Create audit error:', error);
      toast({ title: "Error", description: error.message || "Failed to save audit", variant: "destructive" });
    },
  });

  // Helper function to submit audit and reset form
  const submitGenericAudit = async (
    title: string,
    category: string,
    keyQuestion: string,
    data: any,
    setOpen: (open: boolean) => void,
    form: any
  ) => {
    try {
      await genericAuditMutation.mutateAsync({ title, category, keyQuestion, data });
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Helper function to add audit findings to Service Improvement Plan
  const addToSip = (description: string, auditType: string, cqcDomain: string, priority: "must_do" | "should_do" = "should_do") => {
    if (!description || description.trim() === "") {
      toast({ title: "Cannot add to SIP", description: "Please enter the areas for improvement first", variant: "destructive" });
      return;
    }
    sipForm.reset({
      description: description.trim(),
      priority,
      cqcDomain,
      serviceArea: auditType,
      responsibility: "",
      targetDate: "",
      evidence: "",
    });
    setActiveTab("sip");
    setSipDialogOpen(true);
  };

  // Helper function to batch-create SIP items from checked sections on form submit
  const batchAddToSip = async (
    checkedSections: { section: string; description: string; priority: "must_do" | "should_do" }[],
    auditType: string,
    cqcDomain: string
  ) => {
    const validItems = checkedSections.filter(item => item.description && item.description.trim() !== "");
    if (validItems.length === 0) return 0;

    const results = await Promise.allSettled(
      validItems.map(item => 
        createSipSilentMutation.mutateAsync({
          description: `[${item.section}] ${item.description.trim()}`,
          priority: item.priority,
          cqcDomain,
          serviceArea: auditType,
          responsibility: "",
          targetDate: "",
          evidence: "",
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sip", sipFilter, selectedBranch] });
    }
    if (failCount > 0) {
      console.error(`Failed to add ${failCount} SIP item(s)`);
    }
    return successCount;
  };

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
      renewalDue: "",
      status: "active",
      certificateNumber: "",
      issuingBody: "",
      documentPath: "",
      notes: "",
    },
  });

  const questionnaireForm = useForm({
    resolver: zodResolver(createKnowledgeQuestionnaireSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      isActive: true,
      timeLimit: undefined,
      passingScore: 70,
      instructions: "",
      emailTemplate: "",
    },
  });

  const questionForm = useForm({
    resolver: zodResolver(createKnowledgeQuestionSchema),
    defaultValues: {
      questionnaireId: "",
      questionText: "",
      questionType: "multiple_choice",
      options: [],
      correctAnswer: "",
      explanation: "",
      points: 1,
      sortOrder: 0,
      isRequired: true,
    },
  });

  const sipForm = useForm<SipFormData>({
    resolver: zodResolver(sipFormSchema),
    defaultValues: {
      description: "",
      priority: "should_do",
      cqcDomain: "",
      serviceArea: "",
      responsibility: "",
      targetDate: "",
      evidence: "",
    },
  });

  const insuranceAuditForm = useForm<InsuranceAuditFormData>({
    resolver: zodResolver(insuranceAuditSchema),
    defaultValues: {
      hasCurrentInsurance: "",
      insuranceCompanyName: "",
      coverageDetails: "",
      score: 0,
      furtherInformation: "",
      actions: "",
    },
  });

  const statementOfPurposeAuditForm = useForm<StatementOfPurposeAuditFormData>({
    resolver: zodResolver(statementOfPurposeAuditSchema),
    defaultValues: {
      lastReviewDate: "",
      newReviewDate: "",
      sopReviewed: "",
      sopChanges: "",
      sopReviewDateUpdated: "",
      uploadedFileName: "",
      uploadedFileData: "",
      notes: "",
    },
  });

  // === BUSINESS AUDIT FORMS ===
  const businessContinuityAuditForm = useForm<BusinessContinuityAuditFormData>({
    resolver: zodResolver(businessContinuityAuditSchema),
    defaultValues: {
      bcpDocumentInPlace: "", bcpDetails: "", riskAssessmentComplete: "", riskDetails: "",
      emergencyContactsUpdated: "", contactDetails: "", backupSystemsInPlace: "", backupDetails: "",
      staffTrainedInBcp: "", trainingDetails: "", testingConducted: "", testingDetails: "",
      score: 0, areasOfStrength: "", areasForImprovement: "", actions: "",
    },
  });

  const dataProtectionAuditForm = useForm<DataProtectionAuditFormData>({
    resolver: zodResolver(dataProtectionAuditSchema),
    defaultValues: {
      privacyPolicyInPlace: "", policyDetails: "", dpoIdentified: "", dpoDetails: "",
      dataProcessingRecords: "", recordsDetails: "", consentManagement: "", consentDetails: "",
      dataBreachProcedure: "", breachDetails: "", staffTrainedInGdpr: "", gdprTrainingDetails: "",
      subjectAccessProcess: "", sarDetails: "", score: 0, areasOfStrength: "", areasForImprovement: "", actions: "",
    },
  });

  const financialControlsAuditForm = useForm<FinancialControlsAuditFormData>({
    resolver: zodResolver(financialControlsAuditSchema),
    defaultValues: {
      segregationOfDuties: "", segregationDetails: "", paymentApprovals: "", approvalDetails: "",
      bankReconciliations: "", reconciliationDetails: "", expenseControls: "", expenseDetails: "",
      auditTrailMaintained: "", auditTrailDetails: "", budgetMonitoring: "", budgetDetails: "",
      score: 0, areasOfStrength: "", areasForImprovement: "", actions: "",
    },
  });

  const premisesAuditForm = useForm<PremisesAuditFormData>({
    resolver: zodResolver(premisesAuditSchema),
    defaultValues: {
      fireRiskAssessment: "", fireDetails: "", patTesting: "", patDetails: "",
      legionellaAssessment: "", legionellaDetails: "", asbestosRegister: "", asbestosDetails: "",
      securityMeasures: "", securityDetails: "", accessibilityCompliance: "", accessibilityDetails: "",
      score: 0, areasOfStrength: "", areasForImprovement: "", actions: "",
    },
  });

  // Helper functions
  const generateQRCode = async (questionnaire: KnowledgeQuestionnaire) => {
    const assessmentUrl = `${window.location.origin}/assessment/${questionnaire.shareableLink}`;
    setQrCodeData({ url: assessmentUrl, title: `Smeaton Healthcare - ${questionnaire.title}` });
    
    // Generate QR code data URL
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(assessmentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({ title: "Error", description: "Failed to generate QR code", variant: "destructive" });
    }
  };

  const generateEmailTemplate = (questionnaire: KnowledgeQuestionnaire) => {
    const assessmentUrl = `${window.location.origin}/assessment/${questionnaire.shareableLink}`;
    const subject = `Smeaton Healthcare Professional Assessment: ${questionnaire.title}`;
    const body = `Dear Team Member,

You have been assigned a professional knowledge assessment as part of Smeaton Healthcare's commitment to excellence in care delivery.

🏥 SMEATON HEALTHCARE ASSESSMENT DETAILS:
Assessment: ${questionnaire.title}
Category: ${questionnaire.category.replace('_', ' ').toUpperCase()}
Specific Topic: ${questionnaire.subcategory.replace('_', ' ')}
Time Limit: ${questionnaire.timeLimit ? questionnaire.timeLimit + ' minutes' : 'No time limit'}
Passing Score: ${questionnaire.passingScore}%

🌟 Complete your Smeaton Healthcare assessment here:
${assessmentUrl}

Instructions:
${questionnaire.instructions || 'Complete all questions to the best of your ability. This assessment ensures our team maintains the highest standards in healthcare delivery and CQC compliance.'}

Important Notes:
• This assessment is part of Smeaton Healthcare's professional development program
• Multiple team members can complete this assessment using the same link
• Results will be reviewed by your supervisor with feedback provided
• Contact your line manager if you experience any technical difficulties
• Your participation helps maintain our reputation for exceptional care

Thank you for your continued dedication to excellence in healthcare.

With appreciation,
The Smeaton Healthcare Professional Development Team

---
🌟 Smeaton Healthcare - Excellence in Care, Excellence in Training
Delivering outstanding healthcare across Devon & Cornwall`;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    toast({ 
      title: "Email Template Ready", 
      description: "Email template has been opened in your default email client." 
    });
  };

  // Sample scenario-based questions for healthcare training
  const sampleScenarioQuestions = {
    safeguarding: [
      {
        text: "You notice unexplained bruising on Mrs. Thompson's arms during personal care. She seems withdrawn and mentions her son has been 'helping with finances'. What should be your immediate response?",
        type: "scenario_based",
        options: [
          "Document the bruising and discuss with the service user privately about their concerns",
          "Immediately report to your supervisor and follow safeguarding procedures",
          "Ask the son directly about the bruising during his next visit",
          "Wait to see if more signs appear before taking action"
        ],
        correct: "Immediately report to your supervisor and follow safeguarding procedures",
        explanation: "Signs of potential abuse must be reported immediately through proper safeguarding channels. Documentation and supervisor notification are crucial first steps."
      },
      {
        text: "During a home visit, you observe that 8-year-old Emma appears malnourished and is caring for her younger siblings while her parent is present but appears intoxicated. What is your professional obligation?",
        type: "scenario_based", 
        options: [
          "Offer to help with childcare and suggest parenting resources",
          "Contact children's services immediately as this indicates potential neglect",
          "Provide food and return the next day to monitor the situation",
          "Speak to other family members first before taking formal action"
        ],
        correct: "Contact children's services immediately as this indicates potential neglect",
        explanation: "Child safeguarding concerns require immediate professional intervention. Signs of neglect and substance abuse in caregivers pose immediate risks to child welfare."
      }
    ],
    mental_capacity: [
      {
        text: "Mr. Davies has dementia and is refusing to take his prescribed heart medication, saying 'I don't need those poison pills'. He becomes agitated when staff approach with medication. How should you proceed?",
        type: "scenario_based",
        options: [
          "Respect his decision as he has the right to refuse medication",
          "Assess his capacity to make this specific decision and explore best interest options",
          "Hide the medication in his food to ensure he receives necessary treatment",
          "Ask his family to convince him to take the medication"
        ],
        correct: "Assess his capacity to make this specific decision and explore best interest options",
        explanation: "Under the Mental Capacity Act, capacity must be assessed for each specific decision. If he lacks capacity for this decision, best interest procedures must be followed."
      }
    ],
    infection_control: [
      {
        text: "While providing personal care, you accidentally get blood on your gloves from a small cut on the service user. The service user mentions they have Hepatitis B. What is your immediate action plan?",
        type: "scenario_based",
        options: [
          "Remove gloves carefully, wash hands thoroughly, and report the incident immediately",
          "Continue care as the cut is small and unlikely to cause infection",
          "Apply antiseptic to your hands and complete the care episode",
          "Change gloves and continue, reporting the incident after completing care"
        ],
        correct: "Remove gloves carefully, wash hands thoroughly, and report the incident immediately",
        explanation: "Blood-borne pathogen exposure requires immediate PPE removal, thorough decontamination, and incident reporting for potential post-exposure prophylaxis."
      }
    ],
    medication: [
      {
        text: "You're checking the MAR chart and notice that Mrs. Green's Warfarin dosage appears to have been changed from 2mg to 20mg. Mrs. Green is asking for her 'usual heart tablets'. What should you do?",
        type: "scenario_based",
        options: [
          "Give the 20mg dose as written on the MAR chart",
          "Give the 2mg dose as it's likely a transcription error",
          "Withhold the medication and immediately contact the prescriber and supervisor",
          "Give half the dose (10mg) as a compromise until you can check"
        ],
        correct: "Withhold the medication and immediately contact the prescriber and supervisor",
        explanation: "A ten-fold increase in Warfarin could be fatal. Never administer medication when there's doubt about dosage. Always clarify with prescriber before administration."
      }
    ],
    manual_handling: [
      {
        text: "Mr. Patel has fallen in his bedroom and is conscious but cannot get up. He's asking you to help him to his chair. You're working alone and he's a heavy gentleman. What's your safest approach?",
        type: "scenario_based",
        options: [
          "Use proper lifting techniques to help him up immediately",
          "Call for emergency services as he may have sustained injuries from the fall",
          "Get additional staff support before attempting any movement",
          "Both assess for injuries and call for additional support before moving him"
        ],
        correct: "Both assess for injuries and call for additional support before moving him",
        explanation: "Post-fall protocol requires injury assessment and appropriate support. Never attempt solo lifting of heavy individuals - this risks injury to both parties."
      }
    ],
    duty_of_care: [
      {
        text: "Your colleague mentions they're feeling unwell with flu symptoms but doesn't want to go home as they're short-staffed. They're working with vulnerable elderly residents. What's your professional responsibility?",
        type: "scenario_based",
        options: [
          "Support their dedication and help them manage their workload",
          "Suggest they take paracetamol and continue working with a mask",
          "Insist they report to management and arrange cover to protect vulnerable residents",
          "Offer to cover some of their duties so they can rest between tasks"
        ],
        correct: "Insist they report to management and arrange cover to protect vulnerable residents",
        explanation: "Duty of care to vulnerable residents outweighs staffing concerns. Working while infectious poses serious risks to immunocompromised individuals."
      }
    ]
  };

  // Function to create sample questionnaire with scenario questions
  const createSampleQuestionnaire = async (category: string, subcategory: string) => {
    const questions = sampleScenarioQuestions[subcategory as keyof typeof sampleScenarioQuestions];
    if (!questions) {
      toast({ title: "Error", description: "No sample questions available for this category", variant: "destructive" });
      return;
    }

    const sampleData = {
      title: `${subcategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Knowledge Assessment`,
      description: `Scenario-based assessment covering ${subcategory.replace('_', ' ')} practices and procedures in healthcare settings.`,
      category,
      subcategory,
      isActive: true,
      passingScore: 70,
      timeLimit: 30,
      instructions: "Read each scenario carefully and select the most appropriate response based on best practice guidelines and regulatory requirements. Consider the immediate safety of service users and your professional obligations.",
      emailTemplate: ""
    };

    try {
      const questionnaire = await createQuestionnaireMutation.mutateAsync(sampleData);
      
      // Add the sample questions
      for (const [index, question] of questions.entries()) {
        await createQuestionMutation.mutateAsync({
          questionnaireId: questionnaire.id,
          questionText: question.text,
          questionType: question.type as "multiple_choice" | "scenario_based" | "true_false" | "short_answer",
          options: question.options,
          correctAnswer: question.correct,
          explanation: question.explanation,
          points: 1,
          sortOrder: index,
          isRequired: true
        });
      }
      
      toast({ 
        title: "Sample Created!", 
        description: `${questions.length} scenario-based questions added to ${sampleData.title}` 
      });
    } catch (error) {
      console.error('Error creating sample questionnaire:', error);
    }
  };

  // Calculate knowledge stats
  const knowledgeStats = {
    totalQuestionnaires: knowledgeQuestionnaires.length,
    activeSessions: knowledgeSessions.filter(s => s.status === 'in_progress').length,
    completedSessions: knowledgeSessions.filter(s => s.status === 'completed').length,
    passRate: knowledgeSessions.length > 0 
      ? Math.round((knowledgeSessions.filter(s => s.passed).length / knowledgeSessions.filter(s => s.status === 'completed').length) * 100) || 0
      : 0,
  };

  // ... (keeping existing logic)

  const recordForm_old = useForm({
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

  // Helper functions for Audit Matrix
  const getTrafficLightColor = (rating: string | null | undefined) => {
    if (!rating) return "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    switch (rating.toLowerCase()) {
      case "outstanding":
      case "good":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700";
      case "requires_improvement":
      case "requires improvement":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700";
      case "inadequate":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (rating: string | null | undefined) => {
    if (!rating) return <FileCheck className="h-4 w-4 opacity-50" />;
    switch (rating.toLowerCase()) {
      case "outstanding":
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "requires_improvement":
      case "requires improvement":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "inadequate":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileCheck className="h-4 w-4 opacity-50" />;
    }
  };

  const formatAuditDate = (date: string | Date | null | undefined) => {
    if (!date) return "Not assessed";
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const auditCategories = [
    { key: "insurance", label: "Insurance", icon: "🛡️" },
    { key: "safeguarding", label: "Safeguarding", icon: "👥" },
    { key: "health_safety", label: "Health & Safety", icon: "⚠️" },
    { key: "safe_care", label: "Safe Care", icon: "💊" },
    { key: "staffing", label: "Staffing", icon: "👔" },
    { key: "complaints", label: "Complaints", icon: "📝" },
    { key: "consent", label: "Consent", icon: "✓" },
    { key: "dignity", label: "Dignity", icon: "❤️" },
    { key: "governance", label: "Governance", icon: "📋" },
    { key: "duty_candour", label: "Duty of Candour", icon: "🔍" },
    { key: "business_continuity", label: "Business Continuity", icon: "🏢" },
    { key: "data_protection", label: "Data Protection", icon: "🔒" },
    { key: "financial_controls", label: "Financial Controls", icon: "💰" },
    { key: "premises", label: "Premises", icon: "🏠" },
    { key: "medication_management", label: "Medication", icon: "💉" },
    { key: "care_planning", label: "Care Planning", icon: "📑" },
    { key: "training_competency", label: "Training", icon: "🎓" },
  ];

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
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[150px]" data-testid="select-branch">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_OPTIONS.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <Shield className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="audits" data-testid="tab-audits">
            <FileCheck className="w-4 h-4 mr-2" />
            Audits
          </TabsTrigger>
          <TabsTrigger value="knowledge" data-testid="tab-knowledge">
            <Brain className="w-4 h-4 mr-2" />
            Staff Knowledge
          </TabsTrigger>
          <TabsTrigger value="assessments" data-testid="tab-assessments">
            <Award className="w-4 h-4 mr-2" />
            Staff Assessments
          </TabsTrigger>
          <TabsTrigger value="sip" data-testid="tab-sip">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            SIP
          </TabsTrigger>
          <TabsTrigger value="feedback" data-testid="tab-feedback">
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback
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

          {/* Audit Compliance Matrix - Grid-Based Visual Layout */}
          <Card data-testid="audit-compliance-matrix" className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle>Audit Compliance Matrix</CardTitle>
                </div>
                <Select value={matrixFrequencyFilter} onValueChange={setMatrixFrequencyFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-matrix-frequency">
                    <SelectValue placeholder="Filter by frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audits</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="biannually">Bi-Annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Visual overview of all audit areas across the year with completion status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Status Legend - Card Header */}
              <div className="bg-muted/50 border-b px-6 py-3">
                <div className="flex items-center flex-wrap gap-4">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    Status Key
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-xs font-medium">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                    <span className="text-xs font-medium">Due within 14 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-xs font-medium">Overdue</span>
                  </div>
                  </div>
              </div>

              {/* Single Matrix with Filter */}
              <div className="relative max-h-[70vh] overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(70vh-20px)]">
                  <div 
                    className="grid w-full"
                    style={{ 
                      gridTemplateColumns: '240px repeat(12, 1fr)',
                      gap: 0
                    }}
                  >
                    {/* Header Row - 12 Months */}
                    <div className="bg-blue-700 text-white font-semibold p-3 flex items-center sticky left-0 top-0 z-30 border-r-2 border-blue-800 shadow-md min-h-[48px]">
                      <span className="text-xs">Audit Area</span>
                    </div>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                      <div 
                        key={month}
                        className="bg-blue-700 text-white font-semibold p-2 flex items-center justify-center text-center text-xs sticky top-0 z-20 min-h-[48px]"
                      >
                        {month}
                      </div>
                    ))}

                    {/* Data Rows - Filtered by Frequency */}
                    {(() => {
                      const defaultFrequencies: Record<string, string> = {
                        medication_management: 'weekly',
                        infection_control: 'weekly',
                        care_planning: 'fortnightly',
                        risk_assessment: 'fortnightly',
                        staff_supervision: 'monthly',
                        health_safety: 'monthly',
                        safeguarding: 'monthly',
                        complaints_feedback: 'monthly',
                        training_development: 'quarterly',
                        quality_assurance: 'quarterly',
                        environment: 'quarterly',
                        governance: 'biannually',
                        policies_procedures: 'biannually',
                      };

                      const getCategoryFrequency = (categoryKey: string): string => {
                        const setting = auditScheduleSettings.find(s => s.category === categoryKey);
                        return setting?.frequency || defaultFrequencies[categoryKey] || 'annually';
                      };

                      const getFrequencyLabel = (categoryKey: string) => {
                        const frequency = getCategoryFrequency(categoryKey);
                        switch (frequency) {
                          case 'weekly': return 'Weekly';
                          case 'fortnightly': return 'Fortnightly';
                          case 'monthly': return 'Monthly';
                          case 'quarterly': return 'Quarterly';
                          case 'biannually': return 'Bi-Annually';
                          case 'annually': return 'Annually';
                          default: return 'Annually';
                        }
                      };

                      const filteredCategories = matrixFrequencyFilter === 'all' 
                        ? auditCategories 
                        : auditCategories.filter(cat => getCategoryFrequency(cat.key) === matrixFrequencyFilter);

                      return filteredCategories.map((cat) => {
                        const categoryAudits = audits.filter(a => a.category === cat.key);
                        const currentYear = new Date().getFullYear();
                        const categoryFrequency = getCategoryFrequency(cat.key);

                        const getScheduledMonthsForFrequency = (frequency: string): number[] => {
                          switch (frequency) {
                            case 'weekly': return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                            case 'fortnightly': return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                            case 'monthly': return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                            case 'quarterly': return [2, 5, 8, 11];
                            case 'biannually': return [5, 11];
                            case 'annually': return [11];
                            default: return [11];
                          }
                        };

                        const scheduledMonths = getScheduledMonthsForFrequency(categoryFrequency);

                        const getMonthStatus = (monthIndex: number) => {
                          const monthStart = new Date(currentYear, monthIndex, 1);
                          const monthEnd = new Date(currentYear, monthIndex + 1, 0);
                          const today = new Date();
                          const fourteenDaysFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

                          const completedAuditInMonth = categoryAudits.find(a => {
                            const auditDate = new Date(a.auditDate);
                            return auditDate >= monthStart && auditDate <= monthEnd && a.status === 'completed';
                          });

                          if (completedAuditInMonth) {
                            return { status: 'completed', date: completedAuditInMonth.auditDate };
                          }

                          const isScheduledMonth = scheduledMonths.includes(monthIndex);

                          if (isScheduledMonth) {
                            if (monthEnd < today) {
                              return { status: 'overdue', date: null };
                            }
                            if (monthStart <= fourteenDaysFromNow && monthEnd >= today) {
                              return { status: 'due_soon', date: null };
                            }
                            if (monthStart > today) {
                              return { status: 'scheduled', date: null };
                            }
                            if (monthIndex === today.getMonth()) {
                              return { status: 'due_soon', date: null };
                            }
                          }

                          return { status: 'not_scheduled', date: null };
                        };

                        const getStatusSquareClass = (status: string) => {
                          switch (status) {
                            case 'completed': return 'bg-green-500';
                            case 'due_soon': return 'bg-amber-500';
                            case 'overdue': return 'bg-red-500';
                            case 'scheduled': return 'bg-gray-400 dark:bg-gray-500';
                            default: return 'bg-transparent';
                          }
                        };

                        const getStatusLabel = (status: string) => {
                          switch (status) {
                            case 'completed': return 'Completed';
                            case 'due_soon': return 'Due within 14 days';
                            case 'overdue': return 'Overdue';
                            case 'scheduled': return 'Scheduled';
                            default: return 'Not scheduled';
                          }
                        };

                        const latestAudit = categoryAudits
                          .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime())[0];

                        return (
                          <Fragment key={cat.key}>
                            {/* Name Cell - Sticky Left */}
                            <div 
                              className="bg-muted/50 p-3 flex items-center sticky left-0 z-10 border-r-2 border-blue-600 shadow-md min-h-[52px] border-b"
                              data-testid={`audit-matrix-row-${cat.key}`}
                            >
                              <div className="flex items-center gap-2 min-w-0 w-full">
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                                  {cat.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-medium truncate">{cat.label}</div>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Select
                                      value={categoryFrequency}
                                      onValueChange={(value) => {
                                        updateAuditScheduleMutation.mutate({
                                          category: cat.key,
                                          frequency: value,
                                          branch: selectedBranch,
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="h-4 text-[9px] px-1 py-0 w-auto min-w-0 border-dashed" data-testid={`frequency-select-${cat.key}`}>
                                        <SelectValue placeholder={getFrequencyLabel(cat.key)} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="fortnightly">Fortnightly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="biannually">Bi-Annually</SelectItem>
                                        <SelectItem value="annually">Annually</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {latestAudit && <span>• Last: {formatAuditDate(latestAudit.auditDate)}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Monthly Status Cells */}
                            {Array.from({ length: 12 }, (_, monthIndex) => {
                              const monthStatus = getMonthStatus(monthIndex);
                              return (
                                <div 
                                  key={`${cat.key}-month-${monthIndex}`}
                                  className="p-2 flex items-center justify-center bg-white dark:bg-gray-950 border-b border-r min-h-[52px]"
                                >
                                  <div 
                                    className={`w-4 h-4 rounded cursor-pointer transition-transform hover:scale-125 ${getStatusSquareClass(monthStatus.status)}`}
                                    title={`${cat.label} - ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex]}: ${getStatusLabel(monthStatus.status)}${monthStatus.date ? ` (${formatAuditDate(monthStatus.date)})` : ''}\nClick to open audit form`}
                                    data-testid={`audit-matrix-cell-${cat.key}-${monthIndex}`}
                                    onClick={() => {
                                      setSelectedCategoryForAudit({ key: cat.key, label: cat.label });
                                      setCategoryAuditFormOpen(true);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </Fragment>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
          {/* Quick Start Audit Forms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Quick Start Audit Forms
              </CardTitle>
              <CardDescription>
                Predefined audit forms for CQC regulatory compliance and business operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={auditFormsTab} onValueChange={setAuditFormsTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="cqc" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    CQC Regulations
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Business Audits
                  </TabsTrigger>
                </TabsList>

                {/* CQC REGULATIONS TAB */}
                <TabsContent value="cqc" className="space-y-4">
                  <Accordion type="multiple" className="space-y-2">
                    {/* REGULATION 12 - SAFE CARE AND TREATMENT */}
                    <AccordionItem value="reg12" className="border rounded-lg bg-red-50 dark:bg-red-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-red-900 dark:text-red-100">Regulation 12: Safe Care and Treatment</h3>
                            <p className="text-sm text-red-700 dark:text-red-300">Risk assessments, medication, infection control, equipment safety</p>
                          </div>
                          <Badge className="ml-auto bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200">Template Coming Soon</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Audit templates for this regulation will be provided in a future update.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* REGULATION 13 - SAFEGUARDING */}
                    <AccordionItem value="reg13" className="border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Regulation 13: Safeguarding</h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Policies, training, DBS, reporting, multi-agency</p>
                          </div>
                          <Badge className="ml-auto bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">Template Coming Soon</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Audit templates for this regulation will be provided in a future update.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* REGULATION 17 - GOOD GOVERNANCE */}
                    <AccordionItem value="reg17" className="border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            <ClipboardCheck className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Regulation 17: Good Governance</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">QA systems, policies, records, risk management</p>
                          </div>
                          <Badge className="ml-auto bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">1 Audit</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Dialog open={statementOfPurposeAuditOpen} onOpenChange={setStatementOfPurposeAuditOpen}>
                            <DialogTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow border border-blue-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">Statement of Purpose</h4>
                                  <p className="text-sm text-muted-foreground mt-1">SOP review and version control</p>
                                </CardContent>
                              </Card>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* REGULATION 18 - STAFFING */}
                    <AccordionItem value="reg18" className="border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Regulation 18: Staffing</h3>
                            <p className="text-sm text-green-700 dark:text-green-300">Staffing levels, training, supervision, competency</p>
                          </div>
                          <Badge className="ml-auto bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">Template Coming Soon</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Audit templates for this regulation will be provided in a future update.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* REGULATION 19 - FIT AND PROPER PERSONS */}
                    <AccordionItem value="reg19" className="border rounded-lg bg-teal-50 dark:bg-teal-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400">
                            <Award className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-teal-900 dark:text-teal-100">Regulation 19: Fit & Proper Persons</h3>
                            <p className="text-sm text-teal-700 dark:text-teal-300">Recruitment, DBS, references, registration</p>
                          </div>
                          <Badge className="ml-auto bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200">Template Coming Soon</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Audit templates for this regulation will be provided in a future update.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* REGULATION 9 - PERSON-CENTRED CARE */}
                    <AccordionItem value="reg9" className="border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Regulation 9: Person-Centred Care</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300">Care plans, preferences, involvement, reviews</p>
                          </div>
                          <Badge className="ml-auto bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">Template Coming Soon</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Audit templates for this regulation will be provided in a future update.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* REGULATION 16 - COMPLAINTS */}
                    <AccordionItem value="reg16" className="border rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Regulation 16: Complaints</h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">Handling, investigation, learning, timeliness</p>
                          </div>
                          <Badge className="ml-auto bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">Template Coming Soon</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="p-4 text-center text-muted-foreground">
                          <p>Audit templates for this regulation will be provided in a future update.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>

                {/* BUSINESS AUDITS TAB */}
                <TabsContent value="business" className="space-y-4">
                  <Accordion type="multiple" className="space-y-2">
                    {/* RISK & INSURANCE */}
                    <AccordionItem value="risk-insurance" className="border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Risk & Insurance</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300">Insurance coverage, liability, indemnity policies</p>
                          </div>
                          <Badge className="ml-auto bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">1 Audit</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Dialog open={insuranceAuditOpen} onOpenChange={setInsuranceAuditOpen}>
                            <DialogTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow border border-orange-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">Insurance Audit</h4>
                                  <p className="text-sm text-muted-foreground mt-1">Verify current insurance coverage and policies</p>
                                </CardContent>
                              </Card>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* BUSINESS OPERATIONS */}
                    <AccordionItem value="business-ops" className="border rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">Business Operations</h3>
                            <p className="text-sm text-cyan-700 dark:text-cyan-300">Continuity planning, emergency response, backup systems</p>
                          </div>
                          <Badge className="ml-auto bg-cyan-200 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-200">1 Audit</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Dialog open={businessContinuityAuditOpen} onOpenChange={setBusinessContinuityAuditOpen}>
                            <DialogTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow border border-cyan-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">Business Continuity</h4>
                                  <p className="text-sm text-muted-foreground mt-1">BCP, emergency planning, backup systems</p>
                                </CardContent>
                              </Card>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* DATA & COMPLIANCE */}
                    <AccordionItem value="data-compliance" className="border rounded-lg bg-violet-50 dark:bg-violet-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400">
                            <FileWarning className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-violet-900 dark:text-violet-100">Data & Compliance</h3>
                            <p className="text-sm text-violet-700 dark:text-violet-300">GDPR, privacy policies, data protection, consent management</p>
                          </div>
                          <Badge className="ml-auto bg-violet-200 text-violet-800 dark:bg-violet-800 dark:text-violet-200">1 Audit</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Dialog open={dataProtectionAuditOpen} onOpenChange={setDataProtectionAuditOpen}>
                            <DialogTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow border border-violet-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">Data Protection / GDPR</h4>
                                  <p className="text-sm text-muted-foreground mt-1">Privacy policy, consent, SAR, breach procedures</p>
                                </CardContent>
                              </Card>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* FINANCIAL MANAGEMENT */}
                    <AccordionItem value="financial" className="border rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Financial Management</h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300">Financial controls, payments, reconciliations, budgets</p>
                          </div>
                          <Badge className="ml-auto bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">1 Audit</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Dialog open={financialControlsAuditOpen} onOpenChange={setFinancialControlsAuditOpen}>
                            <DialogTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow border border-emerald-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">Financial Controls</h4>
                                  <p className="text-sm text-muted-foreground mt-1">Payments, reconciliations, expense controls</p>
                                </CardContent>
                              </Card>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* PREMISES & SAFETY */}
                    <AccordionItem value="premises-safety" className="border rounded-lg bg-rose-50 dark:bg-rose-950/20">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400">
                            <Home className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-rose-900 dark:text-rose-100">Premises & Safety</h3>
                            <p className="text-sm text-rose-700 dark:text-rose-300">Fire safety, PAT testing, legionella, security, accessibility</p>
                          </div>
                          <Badge className="ml-auto bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-200">1 Audit</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <Dialog open={premisesAuditOpen} onOpenChange={setPremisesAuditOpen}>
                            <DialogTrigger asChild>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow border border-rose-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">Health & Safety Premises</h4>
                                  <p className="text-sm text-muted-foreground mt-1">Fire, PAT, legionella, security, accessibility</p>
                                </CardContent>
                              </Card>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>

              {/* DIALOG CONTENTS - All audit form dialogs are rendered below (controlled by state, triggers in tabs above) */}
              
              {/* Insurance Audit Dialog Content */}
              <Dialog open={insuranceAuditOpen} onOpenChange={setInsuranceAuditOpen}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-orange-600" />
                        Insurance Audit Form
                      </DialogTitle>
                      <DialogDescription>
                        Complete audit of insurance coverage and compliance requirements
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Insurance Audit Form Content */}
                      <Form {...insuranceAuditForm}>
                        <form 
                          onSubmit={insuranceAuditForm.handleSubmit(createInsuranceAuditMutation.mutate)}
                          className="space-y-6"
                        >
                          {/* Primary Insurance Question */}
                          <Card className="border-orange-200 dark:border-orange-800">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                                Current Insurance Status
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <FormField
                                control={insuranceAuditForm.control}
                                name="hasCurrentInsurance"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Do we have current and up to date insurance? *</FormLabel>
                                    <FormControl>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger data-testid="select-insurance-status">
                                          <SelectValue placeholder="Select response" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="yes">Yes</SelectItem>
                                          <SelectItem value="no">NO</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={insuranceAuditForm.control}
                                name="insuranceCompanyName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Insurance Company Name: *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Enter insurance company name"
                                        data-testid="input-insurance-company"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={insuranceAuditForm.control}
                                name="coverageDetails"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Please provide details (E.g Level of Cover) *</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Describe the level of coverage, policy limits, and any specific coverage areas..."
                                        rows={4}
                                        data-testid="textarea-coverage-details"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div>
                                <FormLabel className="text-base font-medium">Evidence *</FormLabel>
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []);
                                      setSelectedEvidenceFiles(files);
                                    }}
                                    className="hidden"
                                    id="insurance-evidence-upload"
                                    data-testid="input-evidence-files"
                                  />
                                  <label
                                    htmlFor="insurance-evidence-upload"
                                    className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                  >
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Drop files here or click to browse</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      Upload insurance certificates, policy documents, and coverage evidence
                                    </p>
                                  </label>
                                  
                                  {selectedEvidenceFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Selected Files ({selectedEvidenceFiles.length}):
                                      </p>
                                      {selectedEvidenceFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">{file.name}</span>
                                            <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedEvidenceFiles(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            data-testid={`button-remove-file-${index}`}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Scoring System */}
                          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Audit Scoring Breakdown (Out of 6 Total Points)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="font-medium text-red-900 dark:text-red-100">POOR: 0 - 4</span>
                                  </div>
                                  <Badge className="bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200">
                                    Urgent Action Required
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium text-yellow-900 dark:text-yellow-100">OK: 5</span>
                                  </div>
                                  <Badge className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                                    Action Required
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-900 dark:text-green-100">GOOD: 6</span>
                                  </div>
                                  <Badge className="bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                                    Minor or no Action Required
                                  </Badge>
                                </div>
                              </div>
                              
                              <FormField
                                control={insuranceAuditForm.control}
                                name="score"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Enter Score (0-6) *</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min="0"
                                        max="6"
                                        step="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        placeholder="Enter score from 0 to 6"
                                        data-testid="input-insurance-score"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                          
                          {/* Additional Information and Actions */}
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">Additional Information & Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <FormField
                                control={insuranceAuditForm.control}
                                name="furtherInformation"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Further Information: (If required)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Add any additional information, notes, or observations..."
                                        rows={3}
                                        data-testid="textarea-further-info"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={insuranceAuditForm.control}
                                name="actions"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-medium">Actions *</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Specify required actions, improvements, or follow-up tasks..."
                                        rows={4}
                                        data-testid="textarea-actions"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                          
                          <div className="flex justify-end gap-2 pt-4">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setInsuranceAuditOpen(false)}
                              data-testid="button-close-insurance-audit"
                            >
                              Close
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createInsuranceAuditMutation.isPending}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              data-testid="button-save-insurance-audit"
                            >
                              {createInsuranceAuditMutation.isPending ? "Saving..." : "Save Insurance Audit"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Business Continuity Audit Dialog Content */}
                <Dialog open={businessContinuityAuditOpen} onOpenChange={(open) => { setBusinessContinuityAuditOpen(open); if (!open) setBcSipChecks({}); }}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-600" />Business Continuity Audit</DialogTitle>
                      <DialogDescription>Comprehensive audit of business continuity planning and disaster recovery</DialogDescription>
                    </DialogHeader>
                    <Form {...businessContinuityAuditForm}>
                      <form onSubmit={businessContinuityAuditForm.handleSubmit(async (data) => {
                        await submitGenericAudit("Business Continuity", "business_continuity", "effective", data, setBusinessContinuityAuditOpen, businessContinuityAuditForm);
                        const checkedItems = [];
                        if (bcSipChecks.bcp && data.bcpDetails) checkedItems.push({ section: "Business Continuity Plan", description: data.bcpDetails, priority: data.bcpInPlace === "no" ? "must_do" as const : "should_do" as const });
                        if (bcSipChecks.training && data.staffTrainingDetails) checkedItems.push({ section: "Staff Training", description: data.staffTrainingDetails, priority: data.staffAware === "no" ? "must_do" as const : "should_do" as const });
                        if (bcSipChecks.testing && data.testingDetails) checkedItems.push({ section: "Testing & Review", description: data.testingDetails, priority: data.planTested === "no" ? "must_do" as const : "should_do" as const });
                        if (bcSipChecks.summary && data.areasForImprovement) checkedItems.push({ section: "Areas for Improvement", description: data.areasForImprovement, priority: "should_do" as const });
                        if (checkedItems.length > 0) {
                          const count = await batchAddToSip(checkedItems, "Business Continuity", "effective");
                          if (count > 0) toast({ title: "Added to SIP", description: `${count} item${count > 1 ? 's' : ''} added to Service Improvement Plan` });
                        }
                        setBcSipChecks({});
                      })} className="space-y-4">
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Business Continuity Plan</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={businessContinuityAuditForm.control} name="bcpInPlace" render={({ field }) => (<FormItem><FormLabel>Is a business continuity plan in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={businessContinuityAuditForm.control} name="bcpDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="bc-sip-bcp" checked={bcSipChecks.bcp || false} onCheckedChange={(checked) => setBcSipChecks(prev => ({ ...prev, bcp: !!checked }))} data-testid="checkbox-sip-bc-bcp" /><label htmlFor="bc-sip-bcp" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Staff Training & Awareness</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={businessContinuityAuditForm.control} name="staffAware" render={({ field }) => (<FormItem><FormLabel>Are staff aware of their roles in emergencies?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={businessContinuityAuditForm.control} name="staffTrainingDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="bc-sip-training" checked={bcSipChecks.training || false} onCheckedChange={(checked) => setBcSipChecks(prev => ({ ...prev, training: !!checked }))} data-testid="checkbox-sip-bc-training" /><label htmlFor="bc-sip-training" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Testing & Review</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={businessContinuityAuditForm.control} name="planTested" render={({ field }) => (<FormItem><FormLabel>Has the plan been tested within the last 12 months?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={businessContinuityAuditForm.control} name="testingDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="bc-sip-testing" checked={bcSipChecks.testing || false} onCheckedChange={(checked) => setBcSipChecks(prev => ({ ...prev, testing: !!checked }))} data-testid="checkbox-sip-bc-testing" /><label htmlFor="bc-sip-testing" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={businessContinuityAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={businessContinuityAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={businessContinuityAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="bc-sip-summary" checked={bcSipChecks.summary || false} onCheckedChange={(checked) => setBcSipChecks(prev => ({ ...prev, summary: !!checked }))} data-testid="checkbox-sip-bc-summary" /><label htmlFor="bc-sip-summary" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add Areas for Improvement to Service Improvement Plan</label></div>
                            <FormField control={businessContinuityAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setBusinessContinuityAuditOpen(false); setBcSipChecks({}); }}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-amber-600 hover:bg-amber-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Data Protection / GDPR Audit Dialog Content */}
                <Dialog open={dataProtectionAuditOpen} onOpenChange={(open) => { setDataProtectionAuditOpen(open); if (!open) setDpSipChecks({}); }}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-purple-600" />Data Protection / GDPR Audit</DialogTitle>
                      <DialogDescription>Comprehensive audit of data protection policies and GDPR compliance</DialogDescription>
                    </DialogHeader>
                    <Form {...dataProtectionAuditForm}>
                      <form onSubmit={dataProtectionAuditForm.handleSubmit(async (data) => {
                        await submitGenericAudit("Data Protection / GDPR", "data_protection", "effective", data, setDataProtectionAuditOpen, dataProtectionAuditForm);
                        const checkedItems = [];
                        if (dpSipChecks.policies && data.policiesDetails) checkedItems.push({ section: "Data Protection Policies", description: data.policiesDetails, priority: data.policiesInPlace === "no" ? "must_do" as const : "should_do" as const });
                        if (dpSipChecks.security && data.securityDetails) checkedItems.push({ section: "Data Security", description: data.securityDetails, priority: data.dataSecure === "no" ? "must_do" as const : "should_do" as const });
                        if (dpSipChecks.training && data.trainingDetails) checkedItems.push({ section: "Staff Training", description: data.trainingDetails, priority: data.staffTrained === "no" ? "must_do" as const : "should_do" as const });
                        if (dpSipChecks.summary && data.areasForImprovement) checkedItems.push({ section: "Areas for Improvement", description: data.areasForImprovement, priority: "should_do" as const });
                        if (checkedItems.length > 0) {
                          const count = await batchAddToSip(checkedItems, "Data Protection", "well_led");
                          if (count > 0) toast({ title: "Added to SIP", description: `${count} item${count > 1 ? 's' : ''} added to Service Improvement Plan` });
                        }
                        setDpSipChecks({});
                      })} className="space-y-4">
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Data Protection Policies</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={dataProtectionAuditForm.control} name="policiesInPlace" render={({ field }) => (<FormItem><FormLabel>Are comprehensive data protection policies in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={dataProtectionAuditForm.control} name="policiesDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="dp-sip-policies" checked={dpSipChecks.policies || false} onCheckedChange={(checked) => setDpSipChecks(prev => ({ ...prev, policies: !!checked }))} data-testid="checkbox-sip-dp-policies" /><label htmlFor="dp-sip-policies" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Data Security</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={dataProtectionAuditForm.control} name="dataSecure" render={({ field }) => (<FormItem><FormLabel>Is personal data stored securely (encryption, access controls)?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={dataProtectionAuditForm.control} name="securityDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="dp-sip-security" checked={dpSipChecks.security || false} onCheckedChange={(checked) => setDpSipChecks(prev => ({ ...prev, security: !!checked }))} data-testid="checkbox-sip-dp-security" /><label htmlFor="dp-sip-security" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Staff Training</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={dataProtectionAuditForm.control} name="staffTrained" render={({ field }) => (<FormItem><FormLabel>Have all staff completed GDPR training?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={dataProtectionAuditForm.control} name="trainingDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="dp-sip-training" checked={dpSipChecks.training || false} onCheckedChange={(checked) => setDpSipChecks(prev => ({ ...prev, training: !!checked }))} data-testid="checkbox-sip-dp-training" /><label htmlFor="dp-sip-training" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={dataProtectionAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={dataProtectionAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={dataProtectionAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="dp-sip-summary" checked={dpSipChecks.summary || false} onCheckedChange={(checked) => setDpSipChecks(prev => ({ ...prev, summary: !!checked }))} data-testid="checkbox-sip-dp-summary" /><label htmlFor="dp-sip-summary" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add Areas for Improvement to Service Improvement Plan</label></div>
                            <FormField control={dataProtectionAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setDataProtectionAuditOpen(false); setDpSipChecks({}); }}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-purple-600 hover:bg-purple-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Financial Controls Audit Dialog Content */}
                <Dialog open={financialControlsAuditOpen} onOpenChange={(open) => { setFinancialControlsAuditOpen(open); if (!open) setFcSipChecks({}); }}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-600" />Financial Controls Audit</DialogTitle>
                      <DialogDescription>Comprehensive audit of financial procedures and controls</DialogDescription>
                    </DialogHeader>
                    <Form {...financialControlsAuditForm}>
                      <form onSubmit={financialControlsAuditForm.handleSubmit(async (data) => {
                        await submitGenericAudit("Financial Controls", "financial_controls", "effective", data, setFinancialControlsAuditOpen, financialControlsAuditForm);
                        const checkedItems = [];
                        if (fcSipChecks.payment && data.paymentDetails) checkedItems.push({ section: "Payment Procedures", description: data.paymentDetails, priority: data.paymentProceduresInPlace === "no" ? "must_do" as const : "should_do" as const });
                        if (fcSipChecks.reconciliation && data.reconciliationDetails) checkedItems.push({ section: "Reconciliations", description: data.reconciliationDetails, priority: data.reconciliationsComplete === "no" ? "must_do" as const : "should_do" as const });
                        if (fcSipChecks.expense && data.expenseDetails) checkedItems.push({ section: "Expense Controls", description: data.expenseDetails, priority: data.expenseControlsInPlace === "no" ? "must_do" as const : "should_do" as const });
                        if (fcSipChecks.summary && data.areasForImprovement) checkedItems.push({ section: "Areas for Improvement", description: data.areasForImprovement, priority: "should_do" as const });
                        if (checkedItems.length > 0) {
                          const count = await batchAddToSip(checkedItems, "Financial Controls", "well_led");
                          if (count > 0) toast({ title: "Added to SIP", description: `${count} item${count > 1 ? 's' : ''} added to Service Improvement Plan` });
                        }
                        setFcSipChecks({});
                      })} className="space-y-4">
                        <Card className="border-emerald-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Payment Procedures</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={financialControlsAuditForm.control} name="paymentProceduresInPlace" render={({ field }) => (<FormItem><FormLabel>Are robust payment approval procedures in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={financialControlsAuditForm.control} name="paymentDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="fc-sip-payment" checked={fcSipChecks.payment || false} onCheckedChange={(checked) => setFcSipChecks(prev => ({ ...prev, payment: !!checked }))} data-testid="checkbox-sip-fc-payment" /><label htmlFor="fc-sip-payment" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-emerald-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Reconciliations</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={financialControlsAuditForm.control} name="reconciliationsComplete" render={({ field }) => (<FormItem><FormLabel>Are bank and account reconciliations completed monthly?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={financialControlsAuditForm.control} name="reconciliationDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="fc-sip-reconciliation" checked={fcSipChecks.reconciliation || false} onCheckedChange={(checked) => setFcSipChecks(prev => ({ ...prev, reconciliation: !!checked }))} data-testid="checkbox-sip-fc-reconciliation" /><label htmlFor="fc-sip-reconciliation" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-emerald-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Expense Controls</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={financialControlsAuditForm.control} name="expenseControlsInPlace" render={({ field }) => (<FormItem><FormLabel>Are expense controls and approval limits in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={financialControlsAuditForm.control} name="expenseDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="fc-sip-expense" checked={fcSipChecks.expense || false} onCheckedChange={(checked) => setFcSipChecks(prev => ({ ...prev, expense: !!checked }))} data-testid="checkbox-sip-fc-expense" /><label htmlFor="fc-sip-expense" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={financialControlsAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={financialControlsAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={financialControlsAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="fc-sip-summary" checked={fcSipChecks.summary || false} onCheckedChange={(checked) => setFcSipChecks(prev => ({ ...prev, summary: !!checked }))} data-testid="checkbox-sip-fc-summary" /><label htmlFor="fc-sip-summary" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add Areas for Improvement to Service Improvement Plan</label></div>
                            <FormField control={financialControlsAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setFinancialControlsAuditOpen(false); setFcSipChecks({}); }}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Premises Audit Dialog Content */}
                <Dialog open={premisesAuditOpen} onOpenChange={(open) => { setPremisesAuditOpen(open); if (!open) setPremisesSipChecks({}); }}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Home className="h-5 w-5 text-rose-600" />Health & Safety Premises Audit</DialogTitle>
                      <DialogDescription>Comprehensive audit of premises safety and compliance</DialogDescription>
                    </DialogHeader>
                    <Form {...premisesAuditForm}>
                      <form onSubmit={premisesAuditForm.handleSubmit(async (data) => {
                        await submitGenericAudit("Health & Safety Premises", "premises", "safe", data, setPremisesAuditOpen, premisesAuditForm);
                        const checkedItems = [];
                        if (premisesSipChecks.fire && data.fireSafetyDetails) checkedItems.push({ section: "Fire Safety", description: data.fireSafetyDetails, priority: data.fireSafetyCompliant === "no" ? "must_do" as const : "should_do" as const });
                        if (premisesSipChecks.pat && data.patTestingDetails) checkedItems.push({ section: "PAT Testing", description: data.patTestingDetails, priority: data.patTestingComplete === "no" ? "must_do" as const : "should_do" as const });
                        if (premisesSipChecks.legionella && data.legionellaDetails) checkedItems.push({ section: "Legionella Assessment", description: data.legionellaDetails, priority: data.legionellaCompliant === "no" ? "must_do" as const : "should_do" as const });
                        if (premisesSipChecks.security && data.securityDetails) checkedItems.push({ section: "Security & Accessibility", description: data.securityDetails, priority: data.securityAdequate === "no" ? "must_do" as const : "should_do" as const });
                        if (premisesSipChecks.summary && data.areasForImprovement) checkedItems.push({ section: "Areas for Improvement", description: data.areasForImprovement, priority: "should_do" as const });
                        if (checkedItems.length > 0) {
                          const count = await batchAddToSip(checkedItems, "Premises & Equipment", "safe");
                          if (count > 0) toast({ title: "Added to SIP", description: `${count} item${count > 1 ? 's' : ''} added to Service Improvement Plan` });
                        }
                        setPremisesSipChecks({});
                      })} className="space-y-4">
                        <Card className="border-rose-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Fire Safety</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={premisesAuditForm.control} name="fireSafetyCompliant" render={({ field }) => (<FormItem><FormLabel>Is fire safety equipment maintained and staff trained?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={premisesAuditForm.control} name="fireSafetyDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="premises-sip-fire" checked={premisesSipChecks.fire || false} onCheckedChange={(checked) => setPremisesSipChecks(prev => ({ ...prev, fire: !!checked }))} data-testid="checkbox-sip-premises-fire" /><label htmlFor="premises-sip-fire" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-rose-200"><CardHeader className="pb-3"><CardTitle className="text-lg">PAT Testing</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={premisesAuditForm.control} name="patTestingComplete" render={({ field }) => (<FormItem><FormLabel>Is PAT testing up to date for all portable equipment?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={premisesAuditForm.control} name="patTestingDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="premises-sip-pat" checked={premisesSipChecks.pat || false} onCheckedChange={(checked) => setPremisesSipChecks(prev => ({ ...prev, pat: !!checked }))} data-testid="checkbox-sip-premises-pat" /><label htmlFor="premises-sip-pat" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-rose-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Legionella Assessment</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={premisesAuditForm.control} name="legionellaCompliant" render={({ field }) => (<FormItem><FormLabel>Is legionella risk assessment and monitoring in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={premisesAuditForm.control} name="legionellaDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="premises-sip-legionella" checked={premisesSipChecks.legionella || false} onCheckedChange={(checked) => setPremisesSipChecks(prev => ({ ...prev, legionella: !!checked }))} data-testid="checkbox-sip-premises-legionella" /><label htmlFor="premises-sip-legionella" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-rose-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Security & Accessibility</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={premisesAuditForm.control} name="securityAdequate" render={({ field }) => (<FormItem><FormLabel>Are security measures and accessibility provisions adequate?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={premisesAuditForm.control} name="securityDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="premises-sip-security" checked={premisesSipChecks.security || false} onCheckedChange={(checked) => setPremisesSipChecks(prev => ({ ...prev, security: !!checked }))} data-testid="checkbox-sip-premises-security" /><label htmlFor="premises-sip-security" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add this section to Service Improvement Plan</label></div>
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={premisesAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={premisesAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={premisesAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="flex items-center gap-2 pt-2 border-t"><Checkbox id="premises-sip-summary" checked={premisesSipChecks.summary || false} onCheckedChange={(checked) => setPremisesSipChecks(prev => ({ ...prev, summary: !!checked }))} data-testid="checkbox-sip-premises-summary" /><label htmlFor="premises-sip-summary" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"><ClipboardCheck className="h-3 w-3" />Add Areas for Improvement to Service Improvement Plan</label></div>
                            <FormField control={premisesAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setPremisesAuditOpen(false); setPremisesSipChecks({}); }}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-rose-600 hover:bg-rose-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Statement of Purpose Audit */}
                <Dialog open={statementOfPurposeAuditOpen} onOpenChange={setStatementOfPurposeAuditOpen}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Statement of Purpose Audit
                      </DialogTitle>
                      <DialogDescription>Review and update your Statement of Purpose (SOP) documentation</DialogDescription>
                    </DialogHeader>
                    <Form {...statementOfPurposeAuditForm}>
                      <form onSubmit={statementOfPurposeAuditForm.handleSubmit((data) => 
                        submitGenericAudit("Statement of Purpose", "statement_of_purpose", "well_led", data, setStatementOfPurposeAuditOpen, statementOfPurposeAuditForm)
                      )} className="space-y-6">
                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">SOP Review Dates</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={statementOfPurposeAuditForm.control} name="lastReviewDate" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Last SOP Review</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={statementOfPurposeAuditForm.control} name="newReviewDate" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of New SOP Review</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">SOP Review Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={statementOfPurposeAuditForm.control} name="sopReviewed" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Has the Statement of Purpose been reviewed?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - Reviewed and Up to Date</SelectItem>
                                      <SelectItem value="partial">Partial - Review in Progress</SelectItem>
                                      <SelectItem value="no">No - Not Yet Reviewed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={statementOfPurposeAuditForm.control} name="sopChanges" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Changes Made to SOP (if any)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={3} placeholder="Describe any changes made during this review..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Review Date Confirmation</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={statementOfPurposeAuditForm.control} name="sopReviewDateUpdated" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Has the latest review date been updated on the SOP document?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - Date Updated</SelectItem>
                                      <SelectItem value="no">No - Date Not Yet Updated</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Upload Latest SOP Version</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Upload SOP Document</label>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                      toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      const base64 = reader.result as string;
                                      statementOfPurposeAuditForm.setValue("uploadedFileName", file.name);
                                      statementOfPurposeAuditForm.setValue("uploadedFileData", base64);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <p className="text-xs text-muted-foreground">Accepted formats: PDF, Word documents (max 10MB)</p>
                              {statementOfPurposeAuditForm.watch("uploadedFileName") && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{statementOfPurposeAuditForm.watch("uploadedFileName")}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto h-6 w-6 p-0"
                                    onClick={() => {
                                      statementOfPurposeAuditForm.setValue("uploadedFileName", "");
                                      statementOfPurposeAuditForm.setValue("uploadedFileData", "");
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-blue-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Additional Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <FormField control={statementOfPurposeAuditForm.control} name="notes" render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea {...field} rows={3} placeholder="Any additional notes about the SOP review..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setStatementOfPurposeAuditOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={genericAuditMutation.isPending} className="bg-blue-600 hover:bg-blue-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
            </CardContent>
          </Card>

          {/* CQC 2024 Single Assessment Framework Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                CQC 2024 Single Assessment Framework
              </CardTitle>
              <CardDescription>
                Comprehensive audit system based on the 5 key questions and 34 Quality Statements for regulatory compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Button data-testid="button-start-new-audit">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Audit
                </Button>
                <Button variant="outline" data-testid="button-view-evidence-library">
                  <Upload className="w-4 h-4 mr-2" />
                  Evidence Library
                </Button>
                <Button variant="outline" data-testid="button-audit-reports">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Audit Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence Collection Framework</CardTitle>
              <CardDescription>Six types of evidence used in CQC inspections to assess quality and safety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidenceCategoriesLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  cqcEvidenceCategories.map((category) => {
                    const IconComponent = EVIDENCE_CATEGORY_ICONS[category.categoryName] || FileText;
                    const colorClass = EVIDENCE_CATEGORY_COLORS[category.categoryName] || "text-gray-600";
                  return (
                    <Dialog key={category.id}>
                      <DialogTrigger asChild>
                        <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-upload-${category.categoryName}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${colorClass}`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm" data-testid={`evidence-category-${category.id}`}>
                                  {category.displayName}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {category.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Evidence: {cqcAuditEvidence.filter(evidence => evidence.evidenceCategoryId === category.id).length}
                                  </span>
                                  <div className="flex items-center text-xs text-blue-600">
                                    <Upload className="h-3 w-3 mr-1" />
                                    Click to Upload
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Upload Evidence - {category.displayName}</DialogTitle>
                          <DialogDescription>
                            Upload evidence files for {category.description.toLowerCase()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <DashboardModal
                            uppy={undefined}
                            open={true}
                            onRequestClose={() => {}}
                            note="Upload photos, documents, certificates, and other evidence files"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* CQC 5 Key Questions Interface */}
          <div className="space-y-6">
            {qualityStatementsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className="h-16 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Group quality statements by key question
              ['safe', 'effective', 'caring', 'responsive', 'well_led'].map((keyQuestionId, questionIndex) => {
                const keyQuestionStatements = cqcQualityStatements.filter(statement => statement.keyQuestion === keyQuestionId);
                const keyQuestionInfo = {
                  safe: { name: 'Safe', description: 'People are protected from abuse and avoidable harm' },
                  effective: { name: 'Effective', description: 'People\'s care, treatment and support achieves good outcomes' },
                  caring: { name: 'Caring', description: 'Staff involve and treat people with compassion, kindness, dignity and respect' },
                  responsive: { name: 'Responsive', description: 'Services are organized to meet people\'s needs' },
                  well_led: { name: 'Well-Led', description: 'Leadership, management and governance support the delivery of person-centered care' }
                }[keyQuestionId];
                
                if (keyQuestionStatements.length === 0) return null;
                
                return (
                  <Card key={keyQuestionId} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {questionIndex + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" data-testid={`key-question-${keyQuestionId}`}>
                          {keyQuestionInfo.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                          {keyQuestionInfo.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-assess-${keyQuestionId}`}>
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                      Start Assessment
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <strong>Quality Statements ({keyQuestionStatements.length})</strong>
                    </div>
                    <div className="grid gap-3">
                      {keyQuestionStatements.map((statement, statementIndex) => (
                        <Card key={statementIndex} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between space-x-4">
                              <div className="flex-1">
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium mt-1">
                                    {statementIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                                      {statement.statementText}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-3">
                                      <Button variant="outline" size="sm" data-testid={`button-assess-statement-${questionIndex}-${statementIndex}`}>
                                        <Eye className="h-3 w-3 mr-1" />
                                        Assess
                                      </Button>
                                      <Button variant="ghost" size="sm" data-testid={`button-evidence-statement-${questionIndex}-${statementIndex}`}>
                                        <Upload className="h-3 w-3 mr-1" />
                                        Add Evidence
                                      </Button>
                                      <Button variant="ghost" size="sm" data-testid={`button-notes-statement-${questionIndex}-${statementIndex}`}>
                                        <FileText className="h-3 w-3 mr-1" />
                                        Notes
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  Not Assessed
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
            )}
          </div>

          {/* Recent Audits Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Activity</CardTitle>
              <CardDescription>Overview of completed and ongoing CQC assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
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
                <div className="text-center py-12 space-y-6">
                  <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Shield className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ready for CQC Assessment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
                      Begin your regulatory compliance journey with the 2024 Single Assessment Framework. 
                      Assess all 34 Quality Statements across the 5 key questions.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button data-testid="button-start-first-assessment">
                      <Shield className="w-4 h-4 mr-2" />
                      Start Your First Assessment
                    </Button>
                    <Button variant="outline" data-testid="button-learn-about-framework">
                      Learn About CQC 2024 Framework
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.slice(0, 5).map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {audit.status === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {audit.status === "in_progress" && <Clock className="h-5 w-5 text-yellow-600" />}
                          {audit.status === "draft" && <XCircle className="h-5 w-5 text-gray-400" />}
                        </div>
                        <div>
                          <h4 className="font-medium" data-testid={`audit-summary-title-${audit.id}`}>
                            {audit.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {audit.category} • {new Date(audit.auditDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={audit.status === "completed" ? "default" : audit.status === "in_progress" ? "secondary" : "outline"}>
                          {audit.status === "completed" ? "Completed" : audit.status === "in_progress" ? "In Progress" : "Draft"}
                        </Badge>
                        <Button variant="outline" size="sm" data-testid={`button-view-audit-summary-${audit.id}`}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                  {audits.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="ghost" data-testid="button-view-all-audits">
                        View All Audits ({audits.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          {/* Knowledge Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-questionnaires">{knowledgeStats.totalQuestionnaires}</div>
                <p className="text-xs text-muted-foreground">
                  Active questionnaires
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="stat-active-sessions">{knowledgeStats.activeSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Active sessions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="stat-completed-sessions">{knowledgeStats.completedSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Sessions completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="stat-pass-rate">{knowledgeStats.passRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall pass rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Questionnaires Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Knowledge Assessments</CardTitle>
                <CardDescription>Create and manage scenario-based training questionnaires for healthcare compliance</CardDescription>
              </div>
              <Dialog open={createQuestionnaireOpen} onOpenChange={setCreateQuestionnaireOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-questionnaire">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create Knowledge Assessment</DialogTitle>
                    <DialogDescription>
                      Set up a new scenario-based training questionnaire for staff compliance training.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...questionnaireForm}>
                    <form onSubmit={questionnaireForm.handleSubmit((data) => createQuestionnaireMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={questionnaireForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assessment Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Safeguarding Adults Knowledge Test" data-testid="input-questionnaire-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={questionnaireForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Training Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-questionnaire-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="mandatory_core">Mandatory Core Training</SelectItem>
                                  <SelectItem value="care_specific">Care-Specific Knowledge</SelectItem>
                                  <SelectItem value="professional_standards">Professional Standards</SelectItem>
                                  <SelectItem value="specialized">Specialized Areas</SelectItem>
                                  <SelectItem value="scenario_testing">Situational Testing</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={questionnaireForm.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Specific Topic</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-questionnaire-subcategory">
                                    <SelectValue placeholder="Select topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="safeguarding">Safeguarding Adults & Children</SelectItem>
                                  <SelectItem value="mental_capacity">Mental Capacity Act & DoLS</SelectItem>
                                  <SelectItem value="health_safety">Health & Safety</SelectItem>
                                  <SelectItem value="fire_safety">Fire Safety</SelectItem>
                                  <SelectItem value="first_aid">First Aid / Basic Life Support</SelectItem>
                                  <SelectItem value="infection_control">Infection Prevention & Control</SelectItem>
                                  <SelectItem value="manual_handling">Manual Handling & Moving People</SelectItem>
                                  <SelectItem value="medication">Medication Awareness</SelectItem>
                                  <SelectItem value="personal_care">Personal Care</SelectItem>
                                  <SelectItem value="nutrition">Nutrition & Hydration</SelectItem>
                                  <SelectItem value="pressure_care">Pressure Area Care</SelectItem>
                                  <SelectItem value="end_of_life">End of Life Care</SelectItem>
                                  <SelectItem value="record_keeping">Record Keeping & Confidentiality</SelectItem>
                                  <SelectItem value="duty_of_care">Duty of Care</SelectItem>
                                  <SelectItem value="equality_diversity">Equality, Diversity & Human Rights</SelectItem>
                                  <SelectItem value="professional_boundaries">Professional Boundaries</SelectItem>
                                  <SelectItem value="communication">Communication Skills</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={questionnaireForm.control}
                          name="passingScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Passing Score (%)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="0" max="100" placeholder="70" data-testid="input-passing-score" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={questionnaireForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Describe the purpose and scope of this assessment..." data-testid="textarea-questionnaire-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={questionnaireForm.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions for Staff</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Provide clear instructions for completing this assessment..." data-testid="textarea-questionnaire-instructions" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={questionnaireForm.control}
                          name="timeLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Limit (minutes)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" placeholder="30 (optional)" data-testid="input-time-limit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={questionnaireForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Make this assessment available to staff
                                </div>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  data-testid="checkbox-is-active"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCreateQuestionnaireOpen(false)}
                          data-testid="button-cancel-questionnaire"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createQuestionnaireMutation.isPending}
                          data-testid="button-submit-questionnaire"
                        >
                          {createQuestionnaireMutation.isPending ? "Creating..." : "Create Assessment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {questionnairesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-64" />
                            <Skeleton className="h-4 w-48" />
                            <div className="flex space-x-4">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-24" />
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
              ) : questionnairesError ? (
                <div className="text-center py-8 space-y-4">
                  <XCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="text-red-600">Failed to load knowledge assessments</p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/knowledge/questionnaires"] })} variant="outline" data-testid="button-retry-questionnaires">
                    Retry
                  </Button>
                </div>
              ) : knowledgeQuestionnaires.length === 0 ? (
                <div className="text-center py-8 space-y-6">
                  <Brain className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-gray-500 font-medium">No knowledge assessments created yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create scenario-based training questionnaires for healthcare compliance</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button onClick={() => setCreateQuestionnaireOpen(true)} data-testid="button-create-first-questionnaire">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Assessment
                    </Button>
                    <div className="text-xs text-gray-400">or</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createSampleQuestionnaire('mandatory_core', 'safeguarding')}
                        disabled={createQuestionnaireMutation.isPending || createQuestionMutation.isPending}
                        data-testid="button-sample-safeguarding"
                      >
                        {createQuestionnaireMutation.isPending ? "Creating..." : "Safeguarding Sample"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createSampleQuestionnaire('mandatory_core', 'mental_capacity')}
                        disabled={createQuestionnaireMutation.isPending || createQuestionMutation.isPending}
                        data-testid="button-sample-mental-capacity"
                      >
                        {createQuestionnaireMutation.isPending ? "Creating..." : "Mental Capacity Sample"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createSampleQuestionnaire('mandatory_core', 'infection_control')}
                        disabled={createQuestionnaireMutation.isPending || createQuestionMutation.isPending}
                        data-testid="button-sample-infection-control"
                      >
                        {createQuestionnaireMutation.isPending ? "Creating..." : "Infection Control Sample"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createSampleQuestionnaire('care_specific', 'medication')}
                        disabled={createQuestionnaireMutation.isPending || createQuestionMutation.isPending}
                        data-testid="button-sample-medication"
                      >
                        {createQuestionnaireMutation.isPending ? "Creating..." : "Medication Sample"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 max-w-lg mx-auto">
                    Sample assessments include realistic scenario-based questions covering key healthcare topics like safeguarding, mental capacity, infection control, and medication management.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {knowledgeQuestionnaires.map((questionnaire) => (
                    <Card key={questionnaire.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium" data-testid={`questionnaire-title-${questionnaire.id}`}>
                                {questionnaire.title}
                              </h3>
                              <Badge variant={questionnaire.isActive ? "default" : "secondary"}>
                                {questionnaire.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {questionnaire.category.replace('_', ' ')} • {questionnaire.subcategory.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {questionnaire.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Pass: {questionnaire.passingScore}%</span>
                              {questionnaire.timeLimit && (
                                <span>Time: {questionnaire.timeLimit}min</span>
                              )}
                              <span>Created: {new Date(questionnaire.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => generateQRCode(questionnaire)}
                                  data-testid={`button-qr-${questionnaire.id}`}
                                >
                                  <QrCode className="h-4 w-4 mr-1" />
                                  QR Code
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Assessment QR Code</DialogTitle>
                                  <DialogDescription>
                                    Staff can scan this QR code to access the assessment: {questionnaire.title}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center space-y-4 py-4">
                                  {qrCodeDataUrl && (
                                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                      <img 
                                        src={qrCodeDataUrl} 
                                        alt={`QR Code for ${questionnaire.title}`}
                                        className="w-48 h-48"
                                      />
                                    </div>
                                  )}
                                  <div className="text-center space-y-2">
                                    <p className="text-sm font-medium">{questionnaire.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {questionnaire.category.replace('_', ' ')} • {questionnaire.subcategory.replace('_', ' ')}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2 w-full">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        if (qrCodeDataUrl) {
                                          const link = document.createElement('a');
                                          link.download = `${questionnaire.title.replace(/[^a-zA-Z0-9]/g, '-')}-qr-code.png`;
                                          link.href = qrCodeDataUrl;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          toast({ title: "Downloaded!", description: "QR code image has been downloaded" });
                                        }
                                      }}
                                      className="flex-1"
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => generateEmailTemplate(questionnaire)}
                              data-testid={`button-email-${questionnaire.id}`}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedQuestionnaire(questionnaire.id)}
                              data-testid={`button-manage-${questionnaire.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <strong>🏥 Smeaton Healthcare Assessment Link:</strong>
                              <br />
                              <span className="font-mono text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border">
                                {window.location.origin}/assessment/{questionnaire.shareableLink}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/assessment/${questionnaire.shareableLink}`);
                                toast({ title: "Copied!", description: "Assessment link copied to clipboard" });
                              }}
                              data-testid={`button-copy-link-${questionnaire.id}`}
                            >
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sip" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    Service Improvement Plan (SIP)
                  </CardTitle>
                  <CardDescription>Track and manage required improvements from audits and inspections. This is a live document used to demonstrate continuous improvement to CQC.</CardDescription>
                </div>
                <Dialog open={sipDialogOpen} onOpenChange={(open) => {
                  setSipDialogOpen(open);
                  if (!open) {
                    setEditingSipItem(null);
                    sipForm.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-sip-item">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Improvement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingSipItem ? "Edit Improvement Item" : "Add Improvement Item"}</DialogTitle>
                      <DialogDescription>
                        {editingSipItem ? "Update this improvement item" : "Add a new item to the Service Improvement Plan"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...sipForm}>
                      <form onSubmit={sipForm.handleSubmit((data) => {
                        if (editingSipItem) {
                          updateSipMutation.mutate({ id: editingSipItem.id, data });
                        } else {
                          createSipMutation.mutate(data);
                        }
                      })} className="space-y-4">
                        <FormField
                          control={sipForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the improvement required..."
                                  className="min-h-[100px]"
                                  {...field}
                                  data-testid="input-sip-description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={sipForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-sip-priority">
                                      <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="must_do">Must Do (High Priority)</SelectItem>
                                    <SelectItem value="should_do">Should Do (Lower Priority)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={sipForm.control}
                            name="cqcDomain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CQC Domain</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-sip-cqc-domain">
                                      <SelectValue placeholder="Select domain" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="safe">Safe</SelectItem>
                                    <SelectItem value="effective">Effective</SelectItem>
                                    <SelectItem value="caring">Caring</SelectItem>
                                    <SelectItem value="responsive">Responsive</SelectItem>
                                    <SelectItem value="well_led">Well-Led</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={sipForm.control}
                            name="serviceArea"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Area</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Medication Management"
                                    {...field}
                                    data-testid="input-sip-service-area"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={sipForm.control}
                            name="responsibility"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Responsible Person</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Service Manager"
                                    {...field}
                                    data-testid="input-sip-responsibility"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={sipForm.control}
                            name="targetDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date"
                                    {...field}
                                    data-testid="input-sip-target-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={sipForm.control}
                          name="evidence"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Evidence / Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Document evidence of improvement or progress notes..."
                                  {...field}
                                  data-testid="input-sip-evidence"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setSipDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createSipMutation.isPending || updateSipMutation.isPending}
                            data-testid="button-submit-sip"
                          >
                            {createSipMutation.isPending || updateSipMutation.isPending ? "Saving..." : editingSipItem ? "Update" : "Add to Plan"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600" data-testid="stat-sip-total">{sipItems.length}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600" data-testid="stat-sip-must-do">
                    {sipItems.filter(i => i.priority === 'must_do' && i.status !== 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Must Do</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600" data-testid="stat-sip-in-progress">
                    {sipItems.filter(i => i.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600" data-testid="stat-sip-completed">
                    {sipItems.filter(i => i.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex gap-4 mb-4">
                <Select 
                  value={sipFilter.status || "all"} 
                  onValueChange={(v) => setSipFilter(prev => ({ ...prev, status: v === "all" ? undefined : v }))}
                >
                  <SelectTrigger className="w-[180px]" data-testid="filter-sip-status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={sipFilter.priority || "all"} 
                  onValueChange={(v) => setSipFilter(prev => ({ ...prev, priority: v === "all" ? undefined : v }))}
                >
                  <SelectTrigger className="w-[180px]" data-testid="filter-sip-priority">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="must_do">Must Do</SelectItem>
                    <SelectItem value="should_do">Should Do</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SIP Items List */}
              {sipItemsError ? (
                <div className="text-center py-12 text-red-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Failed to load improvement items</p>
                  <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                </div>
              ) : sipItemsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : sipItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No improvement items yet</p>
                  <p className="text-sm">Add items from audit findings or click "Add Improvement" above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sipItems.map((item) => (
                    <Card key={item.id} className={`border-l-4 ${
                      item.status === 'completed' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' :
                      item.priority === 'must_do' ? 'border-l-red-500' : 'border-l-yellow-500'
                    }`} data-testid={`sip-item-${item.id}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={item.priority === 'must_do' ? 'destructive' : 'secondary'}>
                                {item.priority === 'must_do' ? 'Must Do' : 'Should Do'}
                              </Badge>
                              <Badge variant={
                                item.status === 'completed' ? 'default' :
                                item.status === 'in_progress' ? 'secondary' : 'outline'
                              } className={item.status === 'completed' ? 'bg-green-600' : ''}>
                                {item.status === 'completed' ? 'Completed' :
                                 item.status === 'in_progress' ? 'In Progress' : 'Open'}
                              </Badge>
                              {item.cqcDomain && (
                                <Badge variant="outline" className="capitalize">
                                  {item.cqcDomain.replace('_', '-')}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground font-mono">
                                {item.referenceNumber}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{item.description}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              {item.serviceArea && (
                                <span>Area: {item.serviceArea}</span>
                              )}
                              {item.responsibility && (
                                <span>Owner: {item.responsibility}</span>
                              )}
                              {item.targetDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Target: {new Date(item.targetDate).toLocaleDateString('en-GB')}
                                </span>
                              )}
                              {item.completedDate && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  Completed: {new Date(item.completedDate).toLocaleDateString('en-GB')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {item.status !== 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => completeSipMutation.mutate(item.id)}
                                disabled={completeSipMutation.isPending}
                                data-testid={`button-complete-sip-${item.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSipItem(item);
                                sipForm.reset({
                                  description: item.description,
                                  priority: item.priority as "must_do" | "should_do",
                                  cqcDomain: item.cqcDomain || "",
                                  serviceArea: item.serviceArea || "",
                                  responsibility: item.responsibility || "",
                                  targetDate: item.targetDate ? new Date(item.targetDate).toISOString().split('T')[0] : "",
                                  evidence: item.evidence || "",
                                });
                                setSipDialogOpen(true);
                              }}
                              data-testid={`button-edit-sip-${item.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this improvement item?")) {
                                  deleteSipMutation.mutate(item.id);
                                }
                              }}
                              disabled={deleteSipMutation.isPending}
                              data-testid={`button-delete-sip-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <StaffAssessmentsTab branch={selectedBranch} />
        </TabsContent>

        {/* Feedback Collection Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <FeedbackTab branch={selectedBranch} />
        </TabsContent>
      </Tabs>

      {/* Category Audit Form Dialog */}
      {selectedCategoryForAudit && (
        <CategoryAuditFormDialog
          open={categoryAuditFormOpen}
          onOpenChange={setCategoryAuditFormOpen}
          category={selectedCategoryForAudit.key}
          categoryLabel={selectedCategoryForAudit.label}
          branch={selectedBranch}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits"] });
            toast({
              title: "Audit Completed",
              description: `${selectedCategoryForAudit.label} audit has been saved successfully.`,
            });
          }}
        />
      )}
    </div>
  );
}