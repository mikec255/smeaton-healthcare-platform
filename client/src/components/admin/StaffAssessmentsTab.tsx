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
      const response = await fetch(`/api/staff-assessment-links?branch=${encodeURIComponent(branch)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Failed to fetch links");
      return response.json();
    },
  });

  const { data: responses = [], isLoading: responsesLoading } = useQuery<StaffAssessmentResponse[]>({
    queryKey: ["/api/staff-assessment-responses", branch],
    queryFn: async () => {
      const response = await fetch(`/api/staff-assessment-responses?branch=${encodeURIComponent(branch)}`, {
        credentials: 'include'
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
            Create unique assessment links for {branch} branch staff
          </p>
        </div>
        <Dialog open={createLinkOpen} onOpenChange={setCreateLinkOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-assessment-link">
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Assessment Link</DialogTitle>
              <DialogDescription>
                Create a unique shareable link for staff to complete an assessment
              </DialogDescription>
            </DialogHeader>
            <Form {...linkForm}>
              <form onSubmit={linkForm.handleSubmit((data) => createLinkMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={linkForm.control}
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Topic</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-topic">
                            <SelectValue placeholder="Select an assessment topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.filter(t => t.isActive).map((topic) => (
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
                <FormField
                  control={linkForm.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-branch">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Plymouth">Plymouth</SelectItem>
                          <SelectItem value="Truro">Truro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateLinkOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLinkMutation.isPending}>
                    {createLinkMutation.isPending ? "Creating..." : "Create Link"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Topics</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topics.filter(t => t.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Assessment topics available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branch Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchLinks.filter(l => l.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Active links for {branch}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchResponses.length}</div>
            <p className="text-xs text-muted-foreground">Assessments completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branchResponses.length > 0
                ? Math.round((branchResponses.filter(r => r.passed).length / branchResponses.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall pass rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Available Assessment Topics
          </CardTitle>
          <CardDescription>
            Assessment topics that can be assigned to staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assessment topics available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic) => {
                const stats = getStatsForTopic(topic.id);
                const hasLinkForBranch = branchLinks.some(l => l.topicId === topic.id);
                
                return (
                  <Card key={topic.id} className={`border ${topic.isActive ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' : 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{topic.title}</h4>
                            <Badge variant={topic.isActive ? "default" : "secondary"}>
                              {topic.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {hasLinkForBranch && (
                              <Badge variant="outline" className="border-blue-500 text-blue-600">
                                Link Created
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {topic.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Passing Score: {topic.passingScore}%</span>
                            <span>Questions: {Array.isArray(topic.questions) ? topic.questions.length : 0}</span>
                            {stats.totalResponses > 0 && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {stats.totalResponses} responses
                                </span>
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="h-4 w-4" />
                                  {stats.avgScore}% avg score
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {!hasLinkForBranch && topic.isActive && (
                          <Button
                            size="sm"
                            onClick={() => {
                              linkForm.setValue('topicId', topic.id);
                              linkForm.setValue('branch', branch);
                              setCreateLinkOpen(true);
                            }}
                            data-testid={`button-create-link-${topic.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Create Link
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Assessment Links for {branch}
          </CardTitle>
          <CardDescription>
            Manage unique shareable links for staff assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {branchLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assessment links created for {branch} yet.</p>
              <p className="text-sm">Click "Create Assessment Link" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {branchLinks.map((link) => {
                const topic = getTopicById(link.topicId);
                const linkResponses = getResponsesForLink(link.id);
                const passedCount = linkResponses.filter(r => r.passed).length;

                return (
                  <Card key={link.id} className={`border ${link.isActive ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' : 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{topic?.title || "Unknown Topic"}</h4>
                            <Badge variant={link.isActive ? "default" : "secondary"}>
                              {link.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {topic?.description || "No description available"}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {linkResponses.length} responses
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {passedCount} passed
                            </span>
                            {linkResponses.length > 0 && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-4 w-4" />
                                {Math.round((passedCount / linkResponses.length) * 100)}% pass rate
                              </span>
                            )}
                          </div>
                          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border text-xs font-mono break-all">
                            {window.location.origin}/assessments/{link.token}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
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
                            onClick={() => window.open(`/assessments/${link.token}`, '_blank')}
                            data-testid={`button-preview-link-${link.id}`}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
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
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => regenerateTokenMutation.mutate(link.id)}
                            disabled={regenerateTokenMutation.isPending}
                            data-testid={`button-regenerate-token-${link.id}`}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Regenerate
                          </Button>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={link.isActive ?? true}
                              onCheckedChange={(checked) =>
                                toggleLinkActiveMutation.mutate({ linkId: link.id, isActive: checked })
                              }
                              data-testid={`switch-link-active-${link.id}`}
                            />
                            <span className="text-xs">{link.isActive ? "Active" : "Inactive"}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this assessment link? All responses will also be deleted.")) {
                                deleteLinkMutation.mutate(link.id);
                              }
                            }}
                            disabled={deleteLinkMutation.isPending}
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
        </CardContent>
      </Card>

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
