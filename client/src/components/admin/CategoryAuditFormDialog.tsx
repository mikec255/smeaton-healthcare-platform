import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardCheck, Upload, FileText, Trash2, CheckCircle, XCircle, AlertTriangle, Calendar, ChevronDown, ChevronUp, Eye, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuditFormTemplate {
  id: string;
  category: string;
  title: string;
  description: string | null;
  regulationReference: string | null;
  defaultFrequency: string;
  isActive: boolean;
  items: AuditFormItem[];
}

interface AuditFormItem {
  id: string;
  templateId: string;
  questionText: string;
  questionType: "single_choice" | "multi_choice" | "boolean" | "text" | "number" | "file";
  options: string[] | null;
  guidance: string | null;
  regulationReference: string | null;
  evidenceRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryAuditFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  categoryLabel: string;
  branch: string;
  onSuccess?: () => void;
}

const auditFormSchema = z.object({
  auditDate: z.string().min(1, "Audit date is required"),
  findings: z.string().optional(),
  areasOfStrength: z.string().optional(),
  areasForImprovement: z.string().optional(),
  actionPlan: z.string().optional(),
  nextAuditDue: z.string().optional(),
});

type AuditFormData = z.infer<typeof auditFormSchema>;

export function CategoryAuditFormDialog({
  open,
  onOpenChange,
  category,
  categoryLabel,
  branch,
  onSuccess,
}: CategoryAuditFormDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [responses, setResponses] = useState<Record<string, { response: string; notes: string; isCompliant: boolean }>>({});
  const [uploadedEvidence, setUploadedEvidence] = useState<Array<{ fileName: string; filePath: string; itemId?: string; fileData?: string; mimeType?: string; fileSize?: number }>>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: template, isLoading, error: templateError } = useQuery<AuditFormTemplate | null>({
    queryKey: ["/api/cqc/audit-form-templates/category", category],
    queryFn: async () => {
      const response = await fetch(`/api/cqc/audit-form-templates/category/${encodeURIComponent(category)}`, { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch template');
      }
      return response.json();
    },
    enabled: open && !!category,
  });

  const form = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      auditDate: new Date().toISOString().split('T')[0],
      findings: "",
      areasOfStrength: "",
      areasForImprovement: "",
      actionPlan: "",
      nextAuditDue: "",
    },
  });

  useEffect(() => {
    if (template?.items) {
      const initialResponses: Record<string, { response: string; notes: string; isCompliant: boolean }> = {};
      template.items.forEach(item => {
        initialResponses[item.id] = { response: "", notes: "", isCompliant: false };
      });
      setResponses(initialResponses);
    }
  }, [template]);

  useEffect(() => {
    if (!open) {
      setResponses({});
      setExpandedItems(new Set());
      setUploadedEvidence([]);
      setValidationError(null);
      form.reset();
    }
  }, [open, form]);

  const validateResponses = (): boolean => {
    if (!template?.items) return false;
    
    const incompleteItems = template.items.filter(item => {
      const response = responses[item.id];
      if (!response?.response) return true;
      if (item.evidenceRequired && !uploadedEvidence.some(e => e.itemId === item.id) && !response.notes) {
        return true;
      }
      return false;
    });

    if (incompleteItems.length > 0) {
      const itemNumbers = incompleteItems.map(item => template.items.indexOf(item) + 1);
      setValidationError(`Please complete all checklist items. Items ${itemNumbers.join(', ')} require responses.`);
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleFormSubmit = (data: AuditFormData) => {
    if (!validateResponses()) {
      toast({
        title: "Incomplete Form",
        description: validationError || "Please complete all checklist items before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(data);
  };

  const submitMutation = useMutation({
    mutationFn: async (data: AuditFormData) => {
      if (!template) throw new Error("No template loaded");

      const responseArray = Object.entries(responses).map(([itemId, resp]) => ({
        itemId,
        response: resp.response,
        isCompliant: resp.isCompliant,
        notes: resp.notes,
      }));

      const res = await apiRequest("POST", "/api/cqc/audit-form-submissions", {
        templateId: template.id,
        branch,
        category,
        auditDate: data.auditDate,
        findings: data.findings,
        areasOfStrength: data.areasOfStrength,
        areasForImprovement: data.areasForImprovement,
        actionPlan: data.actionPlan,
        nextAuditDue: data.nextAuditDue,
        responses: responseArray,
      });

      if (!res.ok) throw new Error("Failed to submit audit");
      return res.json();
    },
    onSuccess: async (submission) => {
      for (const evidence of uploadedEvidence) {
        await apiRequest("POST", `/api/cqc/audit-form-submissions/${submission.id}/evidence`, {
          fileName: evidence.fileName,
          filePath: evidence.filePath,
          fileData: evidence.fileData,
          fileSize: evidence.fileSize,
          mimeType: evidence.mimeType,
          itemId: evidence.itemId,
        });
      }

      await apiRequest("POST", "/api/cqc/audits", {
        title: `${categoryLabel} Audit`,
        auditType: "category_checklist",
        category,
        serviceType: "All Services",
        keyQuestion: "Well-led",
        auditDate: form.getValues("auditDate"),
        branch,
        auditorName: "System",
        status: "completed",
        score: submission.percentageScore || 0,
        totalItems: submission.maxScore || 0,
        compliantItems: submission.totalScore || 0,
        findings: form.getValues("findings"),
        recommendations: form.getValues("actionPlan"),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audit-form-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/audit-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cqc/compliance-records"] });
      toast({ title: "Audit submitted successfully", description: `${categoryLabel} audit has been recorded.` });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: "Failed to submit audit. Please try again.", variant: "destructive" });
    },
  });

  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const updateResponse = (itemId: string, field: 'response' | 'notes' | 'isCompliant', value: string | boolean) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        ...(field === 'response' && typeof value === 'string' && {
          isCompliant: value === 'yes' || value === 'compliant' || value === 'true',
        }),
      },
    }));
    setValidationError(null);
  };

  const handleFileUpload = async (itemId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploadingFile(itemId);
    
    try {
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setUploadedEvidence(prev => [
        ...prev,
        {
          fileName: file.name,
          filePath: `evidence/${Date.now()}-${file.name}`,
          itemId,
          fileData,
          mimeType: file.type,
          fileSize: file.size,
        }
      ]);
      setValidationError(null);
      
      toast({
        title: "File Attached",
        description: `${file.name} has been attached as evidence.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to attach file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(null);
      if (fileInputRefs.current[itemId]) {
        fileInputRefs.current[itemId]!.value = '';
      }
    }
  };

  const removeEvidence = (index: number) => {
    setUploadedEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const getCompletionStats = () => {
    if (!template?.items) return { total: 0, completed: 0, compliant: 0 };
    const items = template.items;
    const completed = Object.values(responses).filter(r => r.response !== "").length;
    const compliant = Object.values(responses).filter(r => r.isCompliant).length;
    return { total: items.length, completed, compliant };
  };

  const stats = getCompletionStats();
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const compliancePercentage = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
  const isFormComplete = stats.completed === stats.total && stats.total > 0;

  const renderQuestionInput = (item: AuditFormItem) => {
    const currentResponse = responses[item.id]?.response || "";
    const hasError = validationError && !currentResponse;

    switch (item.questionType) {
      case "boolean":
        return (
          <RadioGroup
            value={currentResponse}
            onValueChange={(value) => updateResponse(item.id, 'response', value)}
            className={`flex gap-4 ${hasError ? 'ring-2 ring-red-500 ring-offset-2 rounded-md p-1' : ''}`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${item.id}-yes`} />
              <label htmlFor={`${item.id}-yes`} className="text-sm font-medium text-green-700 dark:text-green-400 cursor-pointer">Yes</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${item.id}-no`} />
              <label htmlFor={`${item.id}-no`} className="text-sm font-medium text-red-700 dark:text-red-400 cursor-pointer">No</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="na" id={`${item.id}-na`} />
              <label htmlFor={`${item.id}-na`} className="text-sm font-medium text-gray-500 cursor-pointer">N/A</label>
            </div>
          </RadioGroup>
        );

      case "single_choice":
        return (
          <Select value={currentResponse} onValueChange={(value) => updateResponse(item.id, 'response', value)}>
            <SelectTrigger className={`w-full ${hasError ? 'ring-2 ring-red-500' : ''}`}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(item.options || ["compliant", "non_compliant", "partial", "na"]).map(option => (
                <SelectItem key={option} value={option}>
                  {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "text":
        return (
          <Textarea
            value={currentResponse}
            onChange={(e) => updateResponse(item.id, 'response', e.target.value)}
            placeholder="Enter your response..."
            className={`min-h-[80px] ${hasError ? 'ring-2 ring-red-500' : ''}`}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={currentResponse}
            onChange={(e) => updateResponse(item.id, 'response', e.target.value)}
            placeholder="Enter a number"
            className={hasError ? 'ring-2 ring-red-500' : ''}
          />
        );

      default:
        return (
          <RadioGroup
            value={currentResponse}
            onValueChange={(value) => updateResponse(item.id, 'response', value)}
            className={`flex gap-4 ${hasError ? 'ring-2 ring-red-500 ring-offset-2 rounded-md p-1' : ''}`}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${item.id}-yes`} />
              <label htmlFor={`${item.id}-yes`} className="text-sm font-medium text-green-700 dark:text-green-400 cursor-pointer">Yes</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${item.id}-no`} />
              <label htmlFor={`${item.id}-no`} className="text-sm font-medium text-red-700 dark:text-red-400 cursor-pointer">No</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="na" id={`${item.id}-na`} />
              <label htmlFor={`${item.id}-na`} className="text-sm font-medium text-gray-500 cursor-pointer">N/A</label>
            </div>
          </RadioGroup>
        );
    }
  };

  const getStatusIcon = (itemId: string) => {
    const response = responses[itemId];
    if (!response?.response) return null;
    if (response.isCompliant) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (response.response === 'na') return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            {categoryLabel} Audit
          </DialogTitle>
          <DialogDescription>
            {template?.description || `Complete the checklist for ${categoryLabel.toLowerCase()} compliance audit.`}
            {template?.regulationReference && (
              <Badge variant="outline" className="ml-2">{template.regulationReference}</Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isLoading && templateError && (
          <div className="py-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Template</h3>
            <p className="text-muted-foreground">
              Failed to load the audit form template. Please try again later.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        )}

        {!isLoading && !templateError && !template && (
          <div className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Template Available</h3>
            <p className="text-muted-foreground mb-4">
              There is no audit form template configured for the "{categoryLabel}" category yet.
              Please contact your administrator to set up the template.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}

        {!isLoading && !templateError && template && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Completion</div>
                    <div className={`text-2xl font-bold ${isFormComplete ? 'text-green-600' : 'text-gray-600'}`}>{completionPercentage}%</div>
                    <div className="text-xs text-muted-foreground">{stats.completed}/{stats.total} items</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Compliance</div>
                    <div className={`text-2xl font-bold ${compliancePercentage >= 80 ? 'text-green-600' : compliancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {compliancePercentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">{stats.compliant}/{stats.total} compliant</div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="auditDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Audit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-40" data-testid="input-audit-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Checklist Items ({stats.completed}/{stats.total} completed)</h3>
                {template.items.map((item, index) => {
                  const hasResponse = responses[item.id]?.response;
                  const itemEvidence = uploadedEvidence.filter(e => e.itemId === item.id);
                  
                  return (
                    <Card key={item.id} className={`transition-all ${hasResponse ? (responses[item.id]?.isCompliant ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : responses[item.id]?.response === 'na' ? 'border-gray-200' : 'border-red-200 bg-red-50/50 dark:bg-red-950/20') : validationError ? 'border-orange-300' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${hasResponse ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {hasResponse ? <CheckCircle className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.questionText}</p>
                                {item.guidance && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.guidance}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.id)}
                                {item.evidenceRequired && (
                                  <Badge variant={itemEvidence.length > 0 ? "default" : "outline"} className="text-xs">
                                    {itemEvidence.length > 0 ? `${itemEvidence.length} file(s)` : 'Evidence Required'}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="mt-3">
                              {renderQuestionInput(item)}
                            </div>

                            <div className="mt-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItemExpanded(item.id)}
                                className="text-xs"
                                data-testid={`button-expand-item-${item.id}`}
                              >
                                {expandedItems.has(item.id) ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Add Notes / Evidence
                                  </>
                                )}
                              </Button>

                              {expandedItems.has(item.id) && (
                                <div className="mt-2 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes & Observations</label>
                                    <Textarea
                                      value={responses[item.id]?.notes || ""}
                                      onChange={(e) => updateResponse(item.id, 'notes', e.target.value)}
                                      placeholder="Add notes, observations, or evidence references..."
                                      className="text-sm min-h-[60px]"
                                      data-testid={`textarea-notes-${item.id}`}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Evidence Files</label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="file"
                                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                        onChange={(e) => handleFileUpload(item.id, e.target.files)}
                                        className="text-xs"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                        disabled={isUploadingFile === item.id}
                                        data-testid={`input-file-${item.id}`}
                                      />
                                      {isUploadingFile === item.id && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Accepted: PDF, Word, Excel, Images (max 10MB)</p>
                                  </div>
                                  
                                  {itemEvidence.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="text-xs font-medium text-muted-foreground">Attached Evidence:</div>
                                      {itemEvidence.map((ev, i) => {
                                        const globalIndex = uploadedEvidence.findIndex(e => e === ev);
                                        return (
                                          <div key={i} className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                                            <FileText className="h-3 w-3" />
                                            <span className="truncate flex-1">{ev.fileName}</span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0"
                                              onClick={() => removeEvidence(globalIndex)}
                                              data-testid={`button-remove-evidence-${item.id}-${i}`}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Summary & Actions</h3>
                
                <FormField
                  control={form.control}
                  name="areasOfStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas of Strength</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Document areas where compliance is good..." className="min-h-[80px]" data-testid="textarea-areas-of-strength" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="areasForImprovement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas for Improvement</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Document areas needing improvement..." className="min-h-[80px]" data-testid="textarea-areas-for-improvement" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actionPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Plan</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="List actions to be taken..." className="min-h-[80px]" data-testid="textarea-action-plan" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextAuditDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Audit Due</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-next-audit-due" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="flex-1 text-sm text-muted-foreground">
                  {!isFormComplete && (
                    <span className="text-orange-600">Complete all {stats.total - stats.completed} remaining items to submit</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending || !isFormComplete}
                    data-testid="button-submit-audit"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Audit"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CategoryAuditFormDialog;
