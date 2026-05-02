import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Link as LinkIcon, Copy, RefreshCw, Trash2, Eye, CheckCircle, XCircle, BarChart3, Users, Brain, ExternalLink } from "lucide-react";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StaffAssessmentTopic, StaffAssessmentLink, StaffAssessmentResponse } from "@shared/schema";

interface StaffAssessmentsTabProps {
  branch: string;
}

const createLinkSchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  branch: z.string().min(1, "Branch is required"),
});

export function StaffAssessmentsTab({ branch }: StaffAssessmentsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createLinkOpen, setCreateLinkOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<StaffAssessmentTopic | null>(null);
  const [viewResponsesOpen, setViewResponsesOpen] = useState(false);
  const [selectedLinkForResponses, setSelectedLinkForResponses] = useState<StaffAssessmentLink | null>(null);

  const { data: topics = [], isLoading: topicsLoading } = useQuery<StaffAssessmentTopic[]>({
    queryKey: ["/api/staff-assessment-topics"],
  });

  const { data: links = [], isLoading: linksLoading } = useQuery<StaffAssessmentLink[]>({
    queryKey: ["/api/staff-assessment-links", branch],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`/api/staff-assessment-links?branch=${encodeURIComponent(branch)}`, {
        credentials: 'include',
        headers
      });
      if (!response.ok) throw new Error("Failed to fetch links");
      return response.json();
    },
  });

  const { data: responses = [], isLoading: responsesLoading } = useQuery<StaffAssessmentResponse[]>({
    queryKey: ["/api/staff-assessment-responses", branch],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`/api/staff-assessment-responses?branch=${encodeURIComponent(branch)}`, {
        credentials: 'include',
        headers
      });
      if (!response.ok) throw new Error("Failed to fetch responses");
      return response.json();
    },
  });

  const linkForm = useForm<z.infer<typeof createLinkSchema>>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      topicId: "",
      branch: branch,
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createLinkSchema>) => {
      return await apiRequest("POST", "/api/staff-assessment-links", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-assessment-links"] });
      setCreateLinkOpen(false);
      linkForm.reset();
      toast({
        title: "Success",
        description: "Assessment link created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment link",
        variant: "destructive",
      });
    },
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return await apiRequest("POST", `/api/staff-assessment-links/${linkId}/regenerate-token`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-assessment-links"] });
      toast({
        title: "Success",
        description: "Link token regenerated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate token",
        variant: "destructive",
      });
    },
  });

  const toggleLinkActiveMutation = useMutation({
    mutationFn: async ({ linkId, isActive }: { linkId: string; isActive: boolean }) => {
      return await apiRequest("PUT", `/api/staff-assessment-links/${linkId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-assessment-links"] });
      toast({
        title: "Success",
        description: "Link status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update link status",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return await apiRequest("DELETE", `/api/staff-assessment-links/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-assessment-links"] });
      toast({
        title: "Success",
        description: "Assessment link deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete link",
        variant: "destructive",
      });
    },
  });

  const deleteResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      return await apiRequest("DELETE", `/api/staff-assessment-responses/${responseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-assessment-responses"] });
      toast({
        title: "Success",
        description: "Response deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete response",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (link: StaffAssessmentLink) => {
    const url = `${window.location.origin}/assessments/${link.token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Assessment link copied to clipboard",
    });
  };

  const getTopicById = (topicId: string) => topics.find(t => t.id === topicId);

  const branchLinks = links.filter(l => l.branch === branch);
  const branchResponses = responses.filter(r => r.branch === branch);

  const getResponsesForLink = (linkId: string) => branchResponses.filter(r => r.linkId === linkId);

  const getStatsForTopic = (topicId: string) => {
    const topicResponses = branchResponses.filter(r => r.topicId === topicId);
    const totalResponses = topicResponses.length;
    const passedCount = topicResponses.filter(r => r.passed).length;
    const avgScore = totalResponses > 0
      ? Math.round(topicResponses.reduce((sum, r) => sum + (r.percentageScore || 0), 0) / totalResponses)
      : 0;
    const trainingNeededCount = topicResponses.filter(r => r.needsFurtherTraining === 'yes').length;

    return { totalResponses, passedCount, avgScore, trainingNeededCount };
  };

  if (topicsLoading || linksLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Knowledge Assessments</h2>
          <p className="text-muted-foreground">
            Assessment links for {branch} staff
          </p>
        </div>
        {topics.filter(t => t.isActive && !branchLinks.some(l => l.topicId === t.id)).length > 0 && (
          <Dialog open={createLinkOpen} onOpenChange={setCreateLinkOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-assessment-link">
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Assessment Link</DialogTitle>
                <DialogDescription>
                  Create a shareable link for staff to complete an assessment
                </DialogDescription>
              </DialogHeader>
              <Form {...linkForm}>
                <form onSubmit={linkForm.handleSubmit((data) => createLinkMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={linkForm.control}
                    name="topicId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assessment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-topic">
                              <SelectValue placeholder="Select an assessment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {topics.filter(t => t.isActive && !branchLinks.some(l => l.topicId === t.id)).map((topic) => (
                              <SelectItem key={topic.id} value={topic.id}>
                                {topic.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <input type="hidden" {...linkForm.register('branch')} />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateLinkOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLinkMutation.isPending}>
                      {createLinkMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Assessment Links - Simple list */}
      {branchLinks.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assessment links created for {branch} yet.</p>
              {topics.filter(t => t.isActive).length > 0 && (
                <p className="text-sm mt-2">Click "Create Link" to get started.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {branchLinks.map((link) => {
            const topic = getTopicById(link.topicId);
            const linkResponses = getResponsesForLink(link.id);

            return (
              <Card key={link.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{topic?.title || "Unknown Topic"}</h3>
                      <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                        {window.location.origin}/assessments/{link.token}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{linkResponses.length} responses</span>
                        <span>{linkResponses.filter(r => r.passed).length} passed</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link)}
                        data-testid={`button-copy-link-${link.id}`}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLinkForResponses(link);
                          setViewResponsesOpen(true);
                        }}
                        data-testid={`button-view-responses-${link.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Responses
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this assessment link and all responses?")) {
                            deleteLinkMutation.mutate(link.id);
                          }
                        }}
                        data-testid={`button-delete-link-${link.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Responses Dialog */}
      <Dialog open={viewResponsesOpen} onOpenChange={setViewResponsesOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Assessment Responses - {selectedLinkForResponses && getTopicById(selectedLinkForResponses.topicId)?.title}
            </DialogTitle>
            <DialogDescription>
              View all staff responses for this assessment link
            </DialogDescription>
          </DialogHeader>
          {selectedLinkForResponses && (
            <div className="space-y-4">
              {getResponsesForLink(selectedLinkForResponses.id).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No responses yet for this assessment link.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getResponsesForLink(selectedLinkForResponses.id).map((response) => (
                    <Card key={response.id} className={response.passed ? 'border-green-200' : 'border-red-200'}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{response.staffName}</h4>
                              <Badge variant={response.passed ? "default" : "destructive"}>
                                {response.passed ? "Passed" : "Not Passed"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{response.jobTitle}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                Score: <strong>{response.percentageScore}%</strong> ({response.totalScore}/{response.maxScore})
                              </span>
                              <span className="text-muted-foreground">
                                Completed: {new Date(response.completedAt!).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            {response.needsFurtherTraining === 'yes' && (
                              <Badge variant="outline" className="mt-2 border-orange-500 text-orange-600">
                                Training Requested
                              </Badge>
                            )}
                            {response.feedback && (
                              <p className="mt-2 text-sm italic text-muted-foreground">
                                "{response.feedback}"
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this response?")) {
                                deleteResponseMutation.mutate(response.id);
                              }
                            }}
                            disabled={deleteResponseMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
