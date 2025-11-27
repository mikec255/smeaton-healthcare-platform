import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Copy, Check, Send, Trash2, Eye, Clock, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ReferenceRequest } from "@shared/schema";

const statusConfig = {
  draft: { color: "bg-gray-500", label: "Draft", icon: FileText },
  requested: { color: "bg-blue-500", label: "Requested", icon: Send },
  received: { color: "bg-green-500", label: "Received", icon: CheckCircle }
};

export default function ReferenceRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReferenceRequest | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeJobTitle: "",
    refereeEmail: "",
    refereeName: "",
    refereeCompany: "",
  });
  
  const { toast } = useToast();
  const queryClientLocal = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/admin/reference-requests'],
    select: (data: ReferenceRequest[]) => {
      return data.filter(req => {
        const matchesSearch = !searchTerm || 
          req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (req.refereeName && req.refereeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (req.refereeEmail && req.refereeEmail.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin/reference-requests', 'POST', data);
    },
    onSuccess: () => {
      queryClientLocal.invalidateQueries({ queryKey: ['/api/admin/reference-requests'] });
      toast({
        title: "Reference Request Created",
        description: "The reference request has been created successfully."
      });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error?.message || "Failed to create reference request.",
        variant: "destructive"
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/admin/reference-requests/${id}/status`, 'PUT', { status });
    },
    onSuccess: () => {
      queryClientLocal.invalidateQueries({ queryKey: ['/api/admin/reference-requests'] });
      toast({
        title: "Status Updated",
        description: "Reference request status has been updated."
      });
      setShowConfirmDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update status.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/reference-requests/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClientLocal.invalidateQueries({ queryKey: ['/api/admin/reference-requests'] });
      toast({
        title: "Deleted",
        description: "Reference request has been deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error?.message || "Failed to delete request.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      employeeName: "",
      employeeJobTitle: "",
      refereeEmail: "",
      refereeName: "",
      refereeCompany: "",
    });
  };

  const generateFormUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/reference-form/${token}`;
  };

  const generateEmailTemplate = (request: ReferenceRequest) => {
    const formUrl = generateFormUrl(request.token);
    const subject = `Reference Request for ${request.employeeName} - Smeaton Healthcare`;
    
    const body = `Dear ${request.refereeName || "Sir/Madam"},

We are writing to request a professional reference for ${request.employeeName}${request.employeeJobTitle ? ` who has applied for the position of ${request.employeeJobTitle}` : ""} at Smeaton Healthcare.

We would be grateful if you could complete our online reference form by clicking the link below:

${formUrl}

This secure link is unique to this reference request and can be completed at your convenience.

If you have any questions or concerns, please do not hesitate to contact us.

Thank you for your time and assistance.

Kind regards,
Smeaton Healthcare Recruitment Team`;

    return { subject, body };
  };

  const copyEmailToClipboard = async (request: ReferenceRequest) => {
    const { subject, body } = generateEmailTemplate(request);
    const fullEmail = `Subject: ${subject}\n\n${body}`;
    
    try {
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      
      toast({
        title: "Copied to Clipboard",
        description: "Email template has been copied."
      });

      setTimeout(() => setCopied(false), 2000);
      
      setSelectedRequest(request);
      setShowConfirmDialog(true);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsRequested = () => {
    if (selectedRequest) {
      statusMutation.mutate({ id: selectedRequest.id, status: "requested" });
    }
  };

  const handleViewDetails = (request: ReferenceRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleShowEmail = (request: ReferenceRequest) => {
    setSelectedRequest(request);
    setShowEmailDialog(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`} data-testid={`status-badge-${status}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reference Requests</h1>
          <p className="text-gray-600">Manage external reference requests with unique form links</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-request">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by employee or referee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No reference requests found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Referee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employeeName}</div>
                        {request.employeeJobTitle && (
                          <div className="text-sm text-gray-500">{request.employeeJobTitle}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.refereeName || "Not specified"}</div>
                        {request.refereeEmail && (
                          <div className="text-sm text-gray-500">{request.refereeEmail}</div>
                        )}
                        {request.refereeCompany && (
                          <div className="text-sm text-gray-500">{request.refereeCompany}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {request.createdAt && format(new Date(request.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                          data-testid={`button-view-${request.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status !== "received" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowEmail(request)}
                            data-testid={`button-email-${request.id}`}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(request.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${request.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Reference Request</DialogTitle>
            <DialogDescription>
              Enter details for the new reference request. A unique form link will be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                placeholder="Enter employee name"
                data-testid="input-employee-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeJobTitle">Job Title</Label>
              <Input
                id="employeeJobTitle"
                value={formData.employeeJobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeJobTitle: e.target.value }))}
                placeholder="Enter job title"
                data-testid="input-job-title"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="refereeName">Referee Name</Label>
              <Input
                id="refereeName"
                value={formData.refereeName}
                onChange={(e) => setFormData(prev => ({ ...prev, refereeName: e.target.value }))}
                placeholder="Enter referee name"
                data-testid="input-referee-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refereeEmail">Referee Email</Label>
              <Input
                id="refereeEmail"
                type="email"
                value={formData.refereeEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, refereeEmail: e.target.value }))}
                placeholder="Enter referee email"
                data-testid="input-referee-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refereeCompany">Referee Company</Label>
              <Input
                id="refereeCompany"
                value={formData.refereeCompany}
                onChange={(e) => setFormData(prev => ({ ...prev, refereeCompany: e.target.value }))}
                placeholder="Enter company name"
                data-testid="input-referee-company"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.employeeName || createMutation.isPending}
              data-testid="button-submit-create"
            >
              {createMutation.isPending ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Template</DialogTitle>
            <DialogDescription>
              Copy this email template to send to the referee. The link contains a unique token for this request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Form Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generateFormUrl(selectedRequest.token)}
                    readOnly
                    className="font-mono text-sm"
                    data-testid="input-form-url"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generateFormUrl(selectedRequest.token));
                      toast({ title: "Link Copied", description: "Form link copied to clipboard." });
                    }}
                    data-testid="button-copy-link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Template</Label>
                <Textarea
                  value={(() => {
                    const { subject, body } = generateEmailTemplate(selectedRequest);
                    return `Subject: ${subject}\n\n${body}`;
                  })()}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                  data-testid="textarea-email-template"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => selectedRequest && copyEmailToClipboard(selectedRequest)}
              data-testid="button-copy-email"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Email & Mark as Requested"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Requested?</DialogTitle>
            <DialogDescription>
              The email template has been copied to your clipboard. Would you like to mark this reference request as "Requested"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Not Yet
            </Button>
            <Button 
              onClick={handleMarkAsRequested}
              disabled={statusMutation.isPending}
              data-testid="button-confirm-requested"
            >
              {statusMutation.isPending ? "Updating..." : "Yes, Mark as Requested"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reference Request Details</DialogTitle>
            <DialogDescription>
              View the full details of this reference request
              {selectedRequest?.status === "received" && " including the submitted reference."}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Employee Name</Label>
                    <p className="font-medium">{selectedRequest.employeeName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Job Title</Label>
                    <p className="font-medium">{selectedRequest.employeeJobTitle || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedRequest.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Created</Label>
                    <p className="font-medium">
                      {selectedRequest.createdAt && format(new Date(selectedRequest.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Referee Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Referee Name</Label>
                      <p className="font-medium">{selectedRequest.refereeName || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Referee Email</Label>
                      <p className="font-medium">{selectedRequest.refereeEmail || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Referee Company</Label>
                      <p className="font-medium">{selectedRequest.refereeCompany || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.status === "received" && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-semibold text-green-700">Submitted Reference</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500">Employment Start Date</Label>
                          <p className="font-medium">{selectedRequest.employmentStartDate || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Employment End Date</Label>
                          <p className="font-medium">{selectedRequest.employmentEndDate || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Job Title Held</Label>
                          <p className="font-medium">{selectedRequest.jobTitle || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Would Re-employ</Label>
                          <p className="font-medium">
                            {selectedRequest.wouldReemploy === true ? "Yes" : 
                             selectedRequest.wouldReemploy === false ? "No" : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Performance Rating</Label>
                          <p className="font-medium">{selectedRequest.performanceRating || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Reason for Leaving</Label>
                          <p className="font-medium">{selectedRequest.reasonForLeaving || "Not provided"}</p>
                        </div>
                      </div>
                      {selectedRequest.additionalComments && (
                        <div>
                          <Label className="text-gray-500">Additional Comments</Label>
                          <p className="font-medium whitespace-pre-wrap">{selectedRequest.additionalComments}</p>
                        </div>
                      )}
                      {selectedRequest.receivedAt && (
                        <div>
                          <Label className="text-gray-500">Received At</Label>
                          <p className="font-medium">
                            {format(new Date(selectedRequest.receivedAt), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedRequest.requestedAt && (
                  <div>
                    <Label className="text-gray-500">Requested At</Label>
                    <p className="font-medium">
                      {format(new Date(selectedRequest.requestedAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
