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
import { Plus, FileCheck, Shield, Users, Clock, AlertTriangle, CheckCircle, XCircle, Calendar, Download, Edit, Trash2, Brain, QrCode, Mail, PlayCircle, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CqcAudit, CqcAuditCategory, CqcChecklistItem, CqcAuditResponse, CqcComplianceRecord, InsertCqcAudit, InsertCqcComplianceRecord, KnowledgeQuestionnaire, InsertKnowledgeQuestionnaire, KnowledgeQuestion, InsertKnowledgeQuestion, KnowledgeSession, KnowledgeAction } from "@shared/schema";
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

type CreateAuditFormData = z.infer<typeof createAuditSchema>;
type CreateComplianceRecordFormData = z.infer<typeof createComplianceRecordSchema>;
type CreateKnowledgeQuestionnaireFormData = z.infer<typeof createKnowledgeQuestionnaireSchema>;
type CreateKnowledgeQuestionFormData = z.infer<typeof createKnowledgeQuestionSchema>;

export default function CqcToolkit() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [createAuditOpen, setCreateAuditOpen] = useState(false);
  const [createRecordOpen, setCreateRecordOpen] = useState(false);
  const [createQuestionnaireOpen, setCreateQuestionnaireOpen] = useState(false);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<{ url: string; title: string } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
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

  const createQuestionnaireMutation = useMutation({
    mutationFn: async (data: CreateKnowledgeQuestionnaireFormData): Promise<KnowledgeQuestionnaire> => {
      return apiRequest('/api/knowledge/questionnaires', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
      return apiRequest('/api/knowledge/questions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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

  // Helper functions
  const generateQRCode = async (questionnaire: KnowledgeQuestionnaire) => {
    const assessmentUrl = `${window.location.origin}/assessment/${questionnaire.shareableLink}`;
    setQrCodeData({ url: assessmentUrl, title: questionnaire.title });
    
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
    const subject = `Staff Knowledge Assessment: ${questionnaire.title}`;
    const body = `Dear Team Member,

You have been selected to complete a knowledge assessment as part of our ongoing training and compliance program.

Assessment: ${questionnaire.title}
Category: ${questionnaire.category.replace('_', ' ').toUpperCase()}
Specific Topic: ${questionnaire.subcategory.replace('_', ' ')}
Time Limit: ${questionnaire.timeLimit ? questionnaire.timeLimit + ' minutes' : 'No time limit'}
Passing Score: ${questionnaire.passingScore}%

Please complete the assessment by clicking the link below:
${assessmentUrl}

Instructions:
${questionnaire.instructions || 'Complete all questions to the best of your ability. This assessment tests your knowledge of healthcare practices and compliance requirements.'}

Important Notes:
• This is a random knowledge test as part of our continuous professional development
• Multiple staff members can complete this assessment using the same link
• Results will be reviewed and feedback provided as appropriate
• Contact your supervisor if you have any technical difficulties

Thank you for your commitment to maintaining high standards of care.

Best regards,
Smeaton Healthcare Training Team`;
    
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
                              <strong>Assessment Link:</strong>
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