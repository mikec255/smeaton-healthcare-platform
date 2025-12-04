import { useState, useEffect } from "react";
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
import { Plus, FileCheck, Shield, Users, Clock, AlertTriangle, CheckCircle, XCircle, Calendar, Download, Edit, Trash2, Brain, QrCode, Mail, PlayCircle, Eye, Upload, Camera, FileText, Award, MessageSquare, BarChart3, ClipboardCheck, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DashboardModal } from '@uppy/react';
import type { CqcAudit, CqcAuditCategory, CqcQualityStatement, CqcEvidenceCategory, CqcAuditEvidence, CqcQualityAssessment, CqcComplianceRecord, InsertCqcAudit, InsertCqcComplianceRecord, KnowledgeQuestionnaire, InsertKnowledgeQuestionnaire, KnowledgeQuestion, InsertKnowledgeQuestion, KnowledgeSession, KnowledgeAction } from "@shared/schema";
import { insertCqcAuditSchema, insertCqcComplianceRecordSchema, insertKnowledgeQuestionnaireSchema, insertKnowledgeQuestionSchema } from "@shared/schema";

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

// Regulation 12 - Safe Care and Treatment audit form schema
const safeCareAuditSchema = z.object({
  riskAssessmentsComplete: z.string().min(1, "Please select an option"),
  riskAssessmentDetails: z.string().min(1, "Details are required"),
  medicationManagementSafe: z.string().min(1, "Please select an option"),
  medicationDetails: z.string().min(1, "Details are required"),
  incidentReportingEffective: z.string().min(1, "Please select an option"),
  incidentDetails: z.string().min(1, "Details are required"),
  equipmentSafe: z.string().min(1, "Please select an option"),
  equipmentDetails: z.string().min(1, "Details are required"),
  infectionControlMeasures: z.string().min(1, "Please select an option"),
  infectionControlDetails: z.string().min(1, "Details are required"),
  staffTrainedInSafety: z.string().min(1, "Please select an option"),
  safetyTrainingDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 13 - Safeguarding audit form schema
const safeguardingAuditSchema = z.object({
  safeguardingPolicyInPlace: z.string().min(1, "Please select an option"),
  policyDetails: z.string().min(1, "Details are required"),
  staffTrainedInSafeguarding: z.string().min(1, "Please select an option"),
  trainingDetails: z.string().min(1, "Details are required"),
  safeguardingLeadIdentified: z.string().min(1, "Please select an option"),
  leadDetails: z.string().min(1, "Details are required"),
  reportingProcessClear: z.string().min(1, "Please select an option"),
  reportingDetails: z.string().min(1, "Details are required"),
  dbsChecksComplete: z.string().min(1, "Please select an option"),
  dbsDetails: z.string().min(1, "Details are required"),
  concernsDocumented: z.string().min(1, "Please select an option"),
  documentationDetails: z.string().min(1, "Details are required"),
  partnershipWithAuthorities: z.string().min(1, "Please select an option"),
  partnershipDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 17 - Good Governance audit form schema
const governanceAuditSchema = z.object({
  qualityAssuranceSystemsInPlace: z.string().min(1, "Please select an option"),
  qaDetails: z.string().min(1, "Details are required"),
  policiesUpToDate: z.string().min(1, "Please select an option"),
  policyReviewDetails: z.string().min(1, "Details are required"),
  recordKeepingAccurate: z.string().min(1, "Please select an option"),
  recordDetails: z.string().min(1, "Details are required"),
  riskManagementEffective: z.string().min(1, "Please select an option"),
  riskManagementDetails: z.string().min(1, "Details are required"),
  auditScheduleMaintained: z.string().min(1, "Please select an option"),
  auditDetails: z.string().min(1, "Details are required"),
  cqcNotificationsSubmitted: z.string().min(1, "Please select an option"),
  notificationDetails: z.string().min(1, "Details are required"),
  leadershipOversight: z.string().min(1, "Please select an option"),
  leadershipDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 18 - Staffing audit form schema
const staffingAuditSchema = z.object({
  sufficientStaffDeployed: z.string().min(1, "Please select an option"),
  staffingLevelDetails: z.string().min(1, "Details are required"),
  staffQualifiedAndCompetent: z.string().min(1, "Please select an option"),
  qualificationDetails: z.string().min(1, "Details are required"),
  supervisionProvided: z.string().min(1, "Please select an option"),
  supervisionDetails: z.string().min(1, "Details are required"),
  trainingNeedsMet: z.string().min(1, "Please select an option"),
  trainingDetails: z.string().min(1, "Details are required"),
  staffSupportedAndDeveloped: z.string().min(1, "Please select an option"),
  supportDetails: z.string().min(1, "Details are required"),
  inductionProcessComplete: z.string().min(1, "Please select an option"),
  inductionDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 19 - Fit and Proper Persons audit form schema
const fitProperPersonsAuditSchema = z.object({
  recruitmentPolicySafe: z.string().min(1, "Please select an option"),
  recruitmentDetails: z.string().min(1, "Details are required"),
  dbsChecksCompleted: z.string().min(1, "Please select an option"),
  dbsCheckDetails: z.string().min(1, "Details are required"),
  referencesObtained: z.string().min(1, "Please select an option"),
  referenceDetails: z.string().min(1, "Details are required"),
  professionalRegistrationChecked: z.string().min(1, "Please select an option"),
  registrationDetails: z.string().min(1, "Details are required"),
  rightToWorkVerified: z.string().min(1, "Please select an option"),
  rightToWorkDetails: z.string().min(1, "Details are required"),
  characterAssessmentComplete: z.string().min(1, "Please select an option"),
  characterDetails: z.string().min(1, "Details are required"),
  ongoingMonitoring: z.string().min(1, "Please select an option"),
  monitoringDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 12A - Infection Prevention and Control audit form schema
const infectionControlAuditSchema = z.object({
  ipcPolicyInPlace: z.string().min(1, "Please select an option"),
  policyDetails: z.string().min(1, "Details are required"),
  ppeAvailableAndUsed: z.string().min(1, "Please select an option"),
  ppeDetails: z.string().min(1, "Details are required"),
  handHygieneCompliance: z.string().min(1, "Please select an option"),
  handHygieneDetails: z.string().min(1, "Details are required"),
  cleaningSchedulesMaintained: z.string().min(1, "Please select an option"),
  cleaningDetails: z.string().min(1, "Details are required"),
  outbreakManagementPlan: z.string().min(1, "Please select an option"),
  outbreakDetails: z.string().min(1, "Details are required"),
  staffTrainedInIpc: z.string().min(1, "Please select an option"),
  ipcTrainingDetails: z.string().min(1, "Details are required"),
  wasteDisposalCompliant: z.string().min(1, "Please select an option"),
  wasteDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 9 - Person-Centred Care audit form schema
const personCentredCareAuditSchema = z.object({
  carePlansPersonalised: z.string().min(1, "Please select an option"),
  carePlanDetails: z.string().min(1, "Details are required"),
  preferencesDocumented: z.string().min(1, "Please select an option"),
  preferenceDetails: z.string().min(1, "Details are required"),
  serviceUserInvolved: z.string().min(1, "Please select an option"),
  involvementDetails: z.string().min(1, "Details are required"),
  needsRegularlyReviewed: z.string().min(1, "Please select an option"),
  reviewDetails: z.string().min(1, "Details are required"),
  choicesRespected: z.string().min(1, "Please select an option"),
  choiceDetails: z.string().min(1, "Details are required"),
  culturalNeedsMet: z.string().min(1, "Please select an option"),
  culturalDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

// Regulation 16 - Complaints Handling audit form schema
const complaintsAuditSchema = z.object({
  complaintsProcessAccessible: z.string().min(1, "Please select an option"),
  processDetails: z.string().min(1, "Details are required"),
  complaintsInvestigated: z.string().min(1, "Please select an option"),
  investigationDetails: z.string().min(1, "Details are required"),
  timelinessMet: z.string().min(1, "Please select an option"),
  timelinessDetails: z.string().min(1, "Details are required"),
  learningFromComplaints: z.string().min(1, "Please select an option"),
  learningDetails: z.string().min(1, "Details are required"),
  complainantsKeptInformed: z.string().min(1, "Please select an option"),
  communicationDetails: z.string().min(1, "Details are required"),
  recordsWellMaintained: z.string().min(1, "Please select an option"),
  recordsDetails: z.string().min(1, "Details are required"),
  score: z.coerce.number().min(0).max(6),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actions: z.string().min(1, "Actions are required"),
});

type CreateAuditFormData = z.infer<typeof createAuditSchema>;
type CreateComplianceRecordFormData = z.infer<typeof createComplianceRecordSchema>;
type CreateKnowledgeQuestionnaireFormData = z.infer<typeof createKnowledgeQuestionnaireSchema>;
type CreateKnowledgeQuestionFormData = z.infer<typeof createKnowledgeQuestionSchema>;
type InsuranceAuditFormData = z.infer<typeof insuranceAuditSchema>;
type SafeCareAuditFormData = z.infer<typeof safeCareAuditSchema>;
type SafeguardingAuditFormData = z.infer<typeof safeguardingAuditSchema>;
type GovernanceAuditFormData = z.infer<typeof governanceAuditSchema>;
type StaffingAuditFormData = z.infer<typeof staffingAuditSchema>;
type FitProperPersonsAuditFormData = z.infer<typeof fitProperPersonsAuditSchema>;
type InfectionControlAuditFormData = z.infer<typeof infectionControlAuditSchema>;
type PersonCentredCareAuditFormData = z.infer<typeof personCentredCareAuditSchema>;
type ComplaintsAuditFormData = z.infer<typeof complaintsAuditSchema>;

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


export default function CqcToolkit() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createAuditOpen, setCreateAuditOpen] = useState(false);
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [createQuestionnaireOpen, setCreateQuestionnaireOpen] = useState(false);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ url: string; title: string } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [insuranceAuditOpen, setInsuranceAuditOpen] = useState(false);
  const [safeCareAuditOpen, setSafeCareAuditOpen] = useState(false);
  const [safeguardingAuditOpen, setSafeguardingAuditOpen] = useState(false);
  const [governanceAuditOpen, setGovernanceAuditOpen] = useState(false);
  const [staffingAuditOpen, setStaffingAuditOpen] = useState(false);
  const [fitProperPersonsAuditOpen, setFitProperPersonsAuditOpen] = useState(false);
  const [infectionControlAuditOpen, setInfectionControlAuditOpen] = useState(false);
  const [personCentredCareAuditOpen, setPersonCentredCareAuditOpen] = useState(false);
  const [complaintsAuditOpen, setComplaintsAuditOpen] = useState(false);
  const [selectedEvidenceFiles, setSelectedEvidenceFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Current user query for getting auditor information
  const { data: authData } = useQuery<{ user: { id: string; username: string; role: string } }>({
    queryKey: ["/api/auth/me"],
  });
  const currentUser = authData?.user;

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

  // Mutations
  const createAuditMutation = useMutation({
    mutationFn: async (data: CreateAuditFormData): Promise<CqcAudit> => {
      // Convert string dates to Date objects for API
      const auditData = {
        ...data,
        auditDate: new Date(data.auditDate),
        nextAuditDue: data.nextAuditDue ? new Date(data.nextAuditDue) : null,
      };
      
      const response = await apiRequest('POST', '/api/cqc/audits', auditData);
      return response.json();
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
      
      const response = await apiRequest('POST', '/api/cqc/compliance-records', recordData);
      return response.json();
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

  const createInsuranceAuditMutation = useMutation({
    mutationFn: async (data: InsuranceAuditFormData): Promise<void> => {
      // First create the audit record
      const auditData = {
        title: "Insurance Audit",
        auditType: "compliance_specific",
        serviceType: "administrative",
        keyQuestion: "well_led",
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
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits"] });
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

  const safeCareAuditForm = useForm<SafeCareAuditFormData>({
    resolver: zodResolver(safeCareAuditSchema),
    defaultValues: {
      riskAssessmentsComplete: "",
      riskAssessmentDetails: "",
      medicationManagementSafe: "",
      medicationDetails: "",
      incidentReportingEffective: "",
      incidentDetails: "",
      equipmentSafe: "",
      equipmentDetails: "",
      infectionControlMeasures: "",
      infectionControlDetails: "",
      staffTrainedInSafety: "",
      safetyTrainingDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const safeguardingAuditForm = useForm<SafeguardingAuditFormData>({
    resolver: zodResolver(safeguardingAuditSchema),
    defaultValues: {
      safeguardingPolicyInPlace: "",
      policyDetails: "",
      staffTrainedInSafeguarding: "",
      trainingDetails: "",
      safeguardingLeadIdentified: "",
      leadDetails: "",
      reportingProcessClear: "",
      reportingDetails: "",
      dbsChecksComplete: "",
      dbsDetails: "",
      concernsDocumented: "",
      documentationDetails: "",
      partnershipWithAuthorities: "",
      partnershipDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const governanceAuditForm = useForm<GovernanceAuditFormData>({
    resolver: zodResolver(governanceAuditSchema),
    defaultValues: {
      qualityAssuranceSystemsInPlace: "",
      qaDetails: "",
      policiesUpToDate: "",
      policyReviewDetails: "",
      recordKeepingAccurate: "",
      recordDetails: "",
      riskManagementEffective: "",
      riskManagementDetails: "",
      auditScheduleMaintained: "",
      auditDetails: "",
      cqcNotificationsSubmitted: "",
      notificationDetails: "",
      leadershipOversight: "",
      leadershipDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const staffingAuditForm = useForm<StaffingAuditFormData>({
    resolver: zodResolver(staffingAuditSchema),
    defaultValues: {
      sufficientStaffDeployed: "",
      staffingLevelDetails: "",
      staffQualifiedAndCompetent: "",
      qualificationDetails: "",
      supervisionProvided: "",
      supervisionDetails: "",
      trainingNeedsMet: "",
      trainingDetails: "",
      staffSupportedAndDeveloped: "",
      supportDetails: "",
      inductionProcessComplete: "",
      inductionDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const fitProperPersonsAuditForm = useForm<FitProperPersonsAuditFormData>({
    resolver: zodResolver(fitProperPersonsAuditSchema),
    defaultValues: {
      recruitmentPolicySafe: "",
      recruitmentDetails: "",
      dbsChecksCompleted: "",
      dbsCheckDetails: "",
      referencesObtained: "",
      referenceDetails: "",
      professionalRegistrationChecked: "",
      registrationDetails: "",
      rightToWorkVerified: "",
      rightToWorkDetails: "",
      characterAssessmentComplete: "",
      characterDetails: "",
      ongoingMonitoring: "",
      monitoringDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const infectionControlAuditForm = useForm<InfectionControlAuditFormData>({
    resolver: zodResolver(infectionControlAuditSchema),
    defaultValues: {
      ipcPolicyInPlace: "",
      policyDetails: "",
      ppeAvailableAndUsed: "",
      ppeDetails: "",
      handHygieneCompliance: "",
      handHygieneDetails: "",
      cleaningSchedulesMaintained: "",
      cleaningDetails: "",
      outbreakManagementPlan: "",
      outbreakDetails: "",
      staffTrainedInIpc: "",
      ipcTrainingDetails: "",
      wasteDisposalCompliant: "",
      wasteDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const personCentredCareAuditForm = useForm<PersonCentredCareAuditFormData>({
    resolver: zodResolver(personCentredCareAuditSchema),
    defaultValues: {
      carePlansPersonalised: "",
      carePlanDetails: "",
      preferencesDocumented: "",
      preferenceDetails: "",
      serviceUserInvolved: "",
      involvementDetails: "",
      needsRegularlyReviewed: "",
      reviewDetails: "",
      choicesRespected: "",
      choiceDetails: "",
      culturalNeedsMet: "",
      culturalDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
    },
  });

  const complaintsAuditForm = useForm<ComplaintsAuditFormData>({
    resolver: zodResolver(complaintsAuditSchema),
    defaultValues: {
      complaintsProcessAccessible: "",
      processDetails: "",
      complaintsInvestigated: "",
      investigationDetails: "",
      timelinessMet: "",
      timelinessDetails: "",
      learningFromComplaints: "",
      learningDetails: "",
      complainantsKeptInformed: "",
      communicationDetails: "",
      recordsWellMaintained: "",
      recordsDetails: "",
      score: 0,
      areasOfStrength: "",
      areasForImprovement: "",
      actions: "",
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
          <TabsTrigger value="knowledge" data-testid="tab-knowledge">
            <Brain className="w-4 h-4 mr-2" />
            Staff Knowledge
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
          {/* Quick Start Audit Forms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Quick Start Audit Forms
              </CardTitle>
              <CardDescription>
                Predefined audit forms for common compliance requirements and regulatory standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Insurance Audit Form */}
                <Dialog open={insuranceAuditOpen} onOpenChange={setInsuranceAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Insurance Audit</h3>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                              Verify current insurance coverage and policies
                            </p>
                            <Badge className="mt-2 bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                              6 Point Scoring
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
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
                
                {/* Regulation 12 - Safe Care and Treatment */}
                <Dialog open={safeCareAuditOpen} onOpenChange={setSafeCareAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900 dark:text-red-100">Regulation 12: Safe Care</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                              Safe care and treatment assessment
                            </p>
                            <Badge className="mt-2 bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200">
                              Key Question: Safe
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Regulation 12: Safe Care and Treatment
                      </DialogTitle>
                      <DialogDescription>
                        Health and Social Care Act 2008 (Regulated Activities) Regulations 2014
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...safeCareAuditForm}>
                      <form onSubmit={safeCareAuditForm.handleSubmit((data) => 
                        submitGenericAudit("Regulation 12: Safe Care and Treatment", "safe_care", "safe", data, setSafeCareAuditOpen, safeCareAuditForm)
                      )} className="space-y-6">
                        <Card className="border-red-200 dark:border-red-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Risk Assessment</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="riskAssessmentsComplete" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Are comprehensive risk assessments completed for all service users?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - fully compliant</SelectItem>
                                      <SelectItem value="partial">Partially - some gaps</SelectItem>
                                      <SelectItem value="no">No - significant gaps</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="riskAssessmentDetails" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evidence and details:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="Describe evidence of risk assessments..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 dark:border-red-800">
                          <CardHeader className="pb-3"><CardTitle className="text-lg">Medication Management</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="medicationManagementSafe" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Is medication managed safely with appropriate records (MAR charts)?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - fully compliant</SelectItem>
                                      <SelectItem value="partial">Partially - some gaps</SelectItem>
                                      <SelectItem value="no">No - significant gaps</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="medicationDetails" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evidence and details:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="Describe medication management practices..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 dark:border-red-800">
                          <CardHeader className="pb-3"><CardTitle className="text-lg">Incident Reporting</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="incidentReportingEffective" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Is incident reporting effective with learning outcomes documented?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - fully compliant</SelectItem>
                                      <SelectItem value="partial">Partially - some gaps</SelectItem>
                                      <SelectItem value="no">No - significant gaps</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="incidentDetails" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evidence and details:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="Describe incident reporting system..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 dark:border-red-800">
                          <CardHeader className="pb-3"><CardTitle className="text-lg">Equipment Safety</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="equipmentSafe" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Is equipment properly maintained and fit for purpose?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - fully compliant</SelectItem>
                                      <SelectItem value="partial">Partially - some gaps</SelectItem>
                                      <SelectItem value="no">No - significant gaps</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="equipmentDetails" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evidence and details:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="Describe equipment safety measures..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 dark:border-red-800">
                          <CardHeader className="pb-3"><CardTitle className="text-lg">Infection Control</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="infectionControlMeasures" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Are infection prevention and control measures in place?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - fully compliant</SelectItem>
                                      <SelectItem value="partial">Partially - some gaps</SelectItem>
                                      <SelectItem value="no">No - significant gaps</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="infectionControlDetails" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evidence and details:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="Describe infection control measures..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-red-200 dark:border-red-800">
                          <CardHeader className="pb-3"><CardTitle className="text-lg">Staff Safety Training</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="staffTrainedInSafety" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Are all staff appropriately trained in health and safety?</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes - fully compliant</SelectItem>
                                      <SelectItem value="partial">Partially - some gaps</SelectItem>
                                      <SelectItem value="no">No - significant gaps</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="safetyTrainingDetails" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Evidence and details:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="Describe safety training records..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                          <CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeCareAuditForm.control} name="score" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Overall Score (0-6):</FormLabel>
                                <FormControl><Input type="number" min="0" max="6" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="areasOfStrength" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Areas of Strength:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="What is working well..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="areasForImprovement" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Areas for Improvement:</FormLabel>
                                <FormControl><Textarea {...field} rows={2} placeholder="What needs improvement..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={safeCareAuditForm.control} name="actions" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Required Actions:</FormLabel>
                                <FormControl><Textarea {...field} rows={3} placeholder="Specify actions required..." /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setSafeCareAuditOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={genericAuditMutation.isPending} className="bg-red-600 hover:bg-red-700">
                            {genericAuditMutation.isPending ? "Saving..." : "Save Audit"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 13 - Safeguarding */}
                <Dialog open={safeguardingAuditOpen} onOpenChange={setSafeguardingAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Regulation 13: Safeguarding</h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                              Safeguarding service users from abuse
                            </p>
                            <Badge className="mt-2 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                              Key Question: Safe
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Regulation 13: Safeguarding Service Users
                      </DialogTitle>
                      <DialogDescription>
                        Protecting service users from abuse and improper treatment
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...safeguardingAuditForm}>
                      <form onSubmit={safeguardingAuditForm.handleSubmit((data) => 
                        submitGenericAudit("Regulation 13: Safeguarding", "safeguarding", "safe", data, setSafeguardingAuditOpen, safeguardingAuditForm)
                      )} className="space-y-6">
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Safeguarding Policy</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="safeguardingPolicyInPlace" render={({ field }) => (
                              <FormItem><FormLabel>Is there a comprehensive safeguarding policy in place?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="policyDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Staff Training</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="staffTrainedInSafeguarding" render={({ field }) => (
                              <FormItem><FormLabel>Are all staff trained in safeguarding (adults and children where applicable)?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="trainingDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Safeguarding Lead</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="safeguardingLeadIdentified" render={({ field }) => (
                              <FormItem><FormLabel>Is a designated safeguarding lead identified and trained?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="leadDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Reporting Process</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="reportingProcessClear" render={({ field }) => (
                              <FormItem><FormLabel>Is the reporting process clear and understood by all staff?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="reportingDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">DBS Checks</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="dbsChecksComplete" render={({ field }) => (
                              <FormItem><FormLabel>Are enhanced DBS checks completed for all staff?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="dbsDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Documentation</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="concernsDocumented" render={({ field }) => (
                              <FormItem><FormLabel>Are safeguarding concerns properly documented and investigated?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="documentationDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-purple-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Multi-Agency Working</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="partnershipWithAuthorities" render={({ field }) => (
                              <FormItem><FormLabel>Is there effective partnership working with local authorities?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={safeguardingAuditForm.control} name="partnershipDetails" render={({ field }) => (
                              <FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={safeguardingAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={safeguardingAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={safeguardingAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={safeguardingAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setSafeguardingAuditOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={genericAuditMutation.isPending} className="bg-purple-600 hover:bg-purple-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 17 - Good Governance */}
                <Dialog open={governanceAuditOpen} onOpenChange={setGovernanceAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                            <ClipboardCheck className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Regulation 17: Governance</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              Good governance and quality assurance
                            </p>
                            <Badge className="mt-2 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                              Key Question: Well-Led
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-blue-600" />
                        Regulation 17: Good Governance
                      </DialogTitle>
                      <DialogDescription>Systems and processes to ensure compliance with fundamental standards</DialogDescription>
                    </DialogHeader>
                    <Form {...governanceAuditForm}>
                      <form onSubmit={governanceAuditForm.handleSubmit((data) => 
                        submitGenericAudit("Regulation 17: Good Governance", "governance", "well_led", data, setGovernanceAuditOpen, governanceAuditForm)
                      )} className="space-y-6">
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Quality Assurance Systems</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="qualityAssuranceSystemsInPlace" render={({ field }) => (
                              <FormItem><FormLabel>Are effective quality assurance systems in place?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="qaDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Policy Management</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="policiesUpToDate" render={({ field }) => (
                              <FormItem><FormLabel>Are all policies and procedures up to date and regularly reviewed?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="policyReviewDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Record Keeping</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="recordKeepingAccurate" render={({ field }) => (
                              <FormItem><FormLabel>Are accurate and complete records maintained?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="recordDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Risk Management</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="riskManagementEffective" render={({ field }) => (
                              <FormItem><FormLabel>Is risk management effective with regular risk register reviews?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="riskManagementDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Schedule</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="auditScheduleMaintained" render={({ field }) => (
                              <FormItem><FormLabel>Is an internal audit schedule maintained and followed?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="auditDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">CQC Notifications</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="cqcNotificationsSubmitted" render={({ field }) => (
                              <FormItem><FormLabel>Are CQC notifications submitted appropriately and on time?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="notificationDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Leadership Oversight</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="leadershipOversight" render={({ field }) => (
                              <FormItem><FormLabel>Is there effective leadership oversight and accountability?</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={governanceAuditForm.control} name="leadershipDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={governanceAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={governanceAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={governanceAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={governanceAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setGovernanceAuditOpen(false)}>Cancel</Button>
                          <Button type="submit" disabled={genericAuditMutation.isPending} className="bg-blue-600 hover:bg-blue-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 18 - Staffing */}
                <Dialog open={staffingAuditOpen} onOpenChange={setStaffingAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 dark:text-green-100">Regulation 18: Staffing</h3>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              Sufficient staff with appropriate skills
                            </p>
                            <Badge className="mt-2 bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200">
                              Key Question: Effective
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-green-600" />Regulation 18: Staffing</DialogTitle>
                      <DialogDescription>Ensuring sufficient numbers of suitably qualified, competent staff</DialogDescription>
                    </DialogHeader>
                    <Form {...staffingAuditForm}>
                      <form onSubmit={staffingAuditForm.handleSubmit((data) => submitGenericAudit("Regulation 18: Staffing", "staffing", "effective", data, setStaffingAuditOpen, staffingAuditForm))} className="space-y-6">
                        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Staffing Levels</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="sufficientStaffDeployed" render={({ field }) => (<FormItem><FormLabel>Are sufficient staff deployed to meet service user needs?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="staffingLevelDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Qualifications & Competence</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="staffQualifiedAndCompetent" render={({ field }) => (<FormItem><FormLabel>Are staff suitably qualified, competent, and skilled?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="qualificationDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Supervision</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="supervisionProvided" render={({ field }) => (<FormItem><FormLabel>Is regular supervision and appraisal provided?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="supervisionDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Training</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="trainingNeedsMet" render={({ field }) => (<FormItem><FormLabel>Are training needs identified and met?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="trainingDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Staff Support & Development</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="staffSupportedAndDeveloped" render={({ field }) => (<FormItem><FormLabel>Are staff supported and developed?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="supportDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Induction</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="inductionProcessComplete" render={({ field }) => (<FormItem><FormLabel>Is a comprehensive induction process in place for new staff?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="inductionDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={staffingAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={staffingAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setStaffingAuditOpen(false)}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-green-600 hover:bg-green-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 19 - Fit and Proper Persons */}
                <Dialog open={fitProperPersonsAuditOpen} onOpenChange={setFitProperPersonsAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400">
                            <Award className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-teal-900 dark:text-teal-100">Regulation 19: Fit & Proper</h3>
                            <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                              Fit and proper persons employed
                            </p>
                            <Badge className="mt-2 bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200">
                              Key Question: Safe
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-teal-600" />Regulation 19: Fit and Proper Persons Employed</DialogTitle><DialogDescription>Ensuring robust recruitment and employment processes</DialogDescription></DialogHeader>
                    <Form {...fitProperPersonsAuditForm}>
                      <form onSubmit={fitProperPersonsAuditForm.handleSubmit((data) => submitGenericAudit("Regulation 19: Fit and Proper Persons", "fit_proper_persons", "safe", data, setFitProperPersonsAuditOpen, fitProperPersonsAuditForm))} className="space-y-6">
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Recruitment Policy</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="recruitmentPolicySafe" render={({ field }) => (<FormItem><FormLabel>Is there a robust, safe recruitment policy in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="recruitmentDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">DBS Checks</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="dbsChecksCompleted" render={({ field }) => (<FormItem><FormLabel>Are enhanced DBS checks completed before employment?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="dbsCheckDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">References</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="referencesObtained" render={({ field }) => (<FormItem><FormLabel>Are satisfactory references obtained and verified?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="referenceDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Professional Registration</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="professionalRegistrationChecked" render={({ field }) => (<FormItem><FormLabel>Is professional registration checked and monitored (NMC, HCPC, etc.)?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="na">N/A</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="registrationDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Right to Work</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="rightToWorkVerified" render={({ field }) => (<FormItem><FormLabel>Is right to work in the UK verified for all staff?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="rightToWorkDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Character Assessment</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="characterAssessmentComplete" render={({ field }) => (<FormItem><FormLabel>Are full employment history and character assessments completed?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="characterDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-teal-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Ongoing Monitoring</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="ongoingMonitoring" render={({ field }) => (<FormItem><FormLabel>Is ongoing fitness to practice monitored?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="monitoringDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={fitProperPersonsAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={fitProperPersonsAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setFitProperPersonsAuditOpen(false)}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-teal-600 hover:bg-teal-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 12A - Infection Control (IPC) */}
                <Dialog open={infectionControlAuditOpen} onOpenChange={setInfectionControlAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-pink-900 dark:text-pink-100">Infection Control (IPC)</h3>
                            <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                              Infection prevention and control
                            </p>
                            <Badge className="mt-2 bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200">
                              Key Question: Safe
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-pink-600" />Infection Prevention and Control Audit</DialogTitle><DialogDescription>Comprehensive IPC compliance assessment</DialogDescription></DialogHeader>
                    <Form {...infectionControlAuditForm}>
                      <form onSubmit={infectionControlAuditForm.handleSubmit((data) => submitGenericAudit("Infection Prevention and Control", "infection_control", "safe", data, setInfectionControlAuditOpen, infectionControlAuditForm))} className="space-y-6">
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">IPC Policy</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="ipcPolicyInPlace" render={({ field }) => (<FormItem><FormLabel>Is a comprehensive IPC policy in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="policyDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">PPE</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="ppeAvailableAndUsed" render={({ field }) => (<FormItem><FormLabel>Is appropriate PPE available and correctly used?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="ppeDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Hand Hygiene</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="handHygieneCompliance" render={({ field }) => (<FormItem><FormLabel>Is hand hygiene compliance monitored?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="handHygieneDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Cleaning</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="cleaningSchedulesMaintained" render={({ field }) => (<FormItem><FormLabel>Are cleaning schedules maintained?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="cleaningDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Outbreak Management</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="outbreakManagementPlan" render={({ field }) => (<FormItem><FormLabel>Is an outbreak management plan in place?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="outbreakDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">IPC Training</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="staffTrainedInIpc" render={({ field }) => (<FormItem><FormLabel>Are all staff trained in IPC?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="ipcTrainingDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-pink-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Waste Disposal</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="wasteDisposalCompliant" render={({ field }) => (<FormItem><FormLabel>Is waste disposal compliant with regulations?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="wasteDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={infectionControlAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={infectionControlAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setInfectionControlAuditOpen(false)}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-pink-600 hover:bg-pink-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 9 - Person-Centred Care */}
                <Dialog open={personCentredCareAuditOpen} onOpenChange={setPersonCentredCareAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Regulation 9: Person-Centred</h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              Person-centred care assessment
                            </p>
                            <Badge className="mt-2 bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                              Key Question: Caring
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-amber-600" />Regulation 9: Person-Centred Care</DialogTitle><DialogDescription>Care appropriate to needs and preferences</DialogDescription></DialogHeader>
                    <Form {...personCentredCareAuditForm}>
                      <form onSubmit={personCentredCareAuditForm.handleSubmit((data) => submitGenericAudit("Regulation 9: Person-Centred Care", "person_centred_care", "caring", data, setPersonCentredCareAuditOpen, personCentredCareAuditForm))} className="space-y-6">
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Care Plans</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="carePlansPersonalised" render={({ field }) => (<FormItem><FormLabel>Are care plans personalised to individual needs?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="carePlanDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Preferences</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="preferencesDocumented" render={({ field }) => (<FormItem><FormLabel>Are service user preferences clearly documented?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="preferenceDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Involvement</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="serviceUserInvolved" render={({ field }) => (<FormItem><FormLabel>Are service users involved in planning their care?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="involvementDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Regular Reviews</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="needsRegularlyReviewed" render={({ field }) => (<FormItem><FormLabel>Are needs regularly reviewed and updated?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="reviewDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Choice & Control</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="choicesRespected" render={({ field }) => (<FormItem><FormLabel>Are choices respected and promoted?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="choiceDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-amber-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Cultural Needs</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="culturalNeedsMet" render={({ field }) => (<FormItem><FormLabel>Are cultural, religious and spiritual needs met?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="culturalDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={personCentredCareAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={personCentredCareAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setPersonCentredCareAuditOpen(false)}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-amber-600 hover:bg-amber-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Regulation 16 - Complaints */}
                <Dialog open={complaintsAuditOpen} onOpenChange={setComplaintsAuditOpen}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Regulation 16: Complaints</h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                              Receiving and acting on complaints
                            </p>
                            <Badge className="mt-2 bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200">
                              Key Question: Responsive
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-indigo-600" />Regulation 16: Complaints Handling</DialogTitle><DialogDescription>Receiving and acting on complaints</DialogDescription></DialogHeader>
                    <Form {...complaintsAuditForm}>
                      <form onSubmit={complaintsAuditForm.handleSubmit((data) => submitGenericAudit("Regulation 16: Complaints Handling", "complaints", "responsive", data, setComplaintsAuditOpen, complaintsAuditForm))} className="space-y-6">
                        <Card className="border-indigo-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Accessibility</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="complaintsProcessAccessible" render={({ field }) => (<FormItem><FormLabel>Is the complaints process accessible and well-publicised?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="processDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-indigo-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Investigation</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="complaintsInvestigated" render={({ field }) => (<FormItem><FormLabel>Are complaints investigated thoroughly?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="investigationDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-indigo-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Timeliness</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="timelinessMet" render={({ field }) => (<FormItem><FormLabel>Are response timelines met?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="timelinessDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-indigo-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Learning</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="learningFromComplaints" render={({ field }) => (<FormItem><FormLabel>Is learning from complaints evidenced?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="learningDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-indigo-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Communication</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="complainantsKeptInformed" render={({ field }) => (<FormItem><FormLabel>Are complainants kept informed throughout?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="communicationDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-indigo-200"><CardHeader className="pb-3"><CardTitle className="text-lg">Records</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="recordsWellMaintained" render={({ field }) => (<FormItem><FormLabel>Are complaint records well maintained?</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="recordsDetails" render={({ field }) => (<FormItem><FormLabel>Evidence:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20"><CardHeader className="pb-3"><CardTitle className="text-lg">Audit Summary</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                            <FormField control={complaintsAuditForm.control} name="score" render={({ field }) => (<FormItem><FormLabel>Overall Score (0-6):</FormLabel><FormControl><Input type="number" min="0" max="6" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="areasOfStrength" render={({ field }) => (<FormItem><FormLabel>Areas of Strength:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="areasForImprovement" render={({ field }) => (<FormItem><FormLabel>Areas for Improvement:</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={complaintsAuditForm.control} name="actions" render={({ field }) => (<FormItem><FormLabel>Required Actions:</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                          </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setComplaintsAuditOpen(false)}>Cancel</Button><Button type="submit" disabled={genericAuditMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">{genericAuditMutation.isPending ? "Saving..." : "Save Audit"}</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
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