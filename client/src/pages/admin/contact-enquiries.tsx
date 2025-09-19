import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Mail, Phone, MapPin, Calendar, Clock, FileText, MessageSquare, Heart, Building } from "lucide-react";
import { type ContactSubmission } from "@shared/schema";

type EnquiryStatus = "new" | "contacted" | "resolved" | "closed";

const statusColors = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
};

const statusLabels = {
  new: "New",
  contacted: "Contacted", 
  resolved: "Resolved",
  closed: "Closed"
};

export default function ContactEnquiriesAdmin() {
  const { toast } = useToast();
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch contact enquiries (excluding referrals)
  const { data: enquiries = [], isLoading } = useQuery<ContactSubmission[]>({
    queryKey: ['/api/contact-submissions', { type: 'general-contact' }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact-submissions?type=general-contact");
      return response.json();
    }
  });

  // Update enquiry status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) => {
      return apiRequest("PUT", `/api/contact-submissions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-submissions'] });
      toast({
        title: "Status updated",
        description: "Contact enquiry status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update contact enquiry status.",
        variant: "destructive",
      });
    }
  });

  const filteredEnquiries = enquiries.filter(enquiry => 
    statusFilter === "all" || enquiry.status === statusFilter
  );

  const handleStatusChange = (id: string, status: EnquiryStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading contact enquiries...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="enquiries-admin">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="enquiries-title">
          Manage Contact Enquiries
        </h1>
        <p className="text-muted-foreground" data-testid="enquiries-description">
          Review and manage general contact form submissions from the website
        </p>
      </div>

      {/* Filters and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enquiries</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>New: {enquiries.filter(e => e.status === 'new').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Contacted: {enquiries.filter(e => e.status === 'contacted').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Resolved: {enquiries.filter(e => e.status === 'resolved').length}</span>
          </div>
        </div>
      </div>

      {/* Enquiries List */}
      {filteredEnquiries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contact enquiries found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "No contact enquiries have been submitted yet." 
                : `No ${statusFilter} enquiries found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="shadow-sm border" data-testid={`enquiry-card-${enquiry.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1" data-testid={`text-enquiry-name-${enquiry.id}`}>
                        {enquiry.contactName || `${enquiry.firstName} ${enquiry.lastName}`.trim() || "Anonymous"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        {enquiry.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{enquiry.email}</span>
                          </div>
                        )}
                        {enquiry.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{enquiry.phone}</span>
                          </div>
                        )}
                      </div>
                      {enquiry.organization && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Building className="h-4 w-4" />
                          <span>{enquiry.organization}</span>
                        </div>
                      )}
                      {enquiry.serviceRequired && (
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Service Required:</span> {enquiry.serviceRequired}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[enquiry.status as EnquiryStatus]} data-testid={`badge-status-${enquiry.id}`}>
                      {statusLabels[enquiry.status as EnquiryStatus]}
                    </Badge>
                    {enquiry.createdAt && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Select
                      value={enquiry.status}
                      onValueChange={(value) => handleStatusChange(enquiry.id, value as EnquiryStatus)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-status-${enquiry.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedEnquiry(enquiry)}
                        data-testid={`button-view-details-${enquiry.id}`}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Contact Enquiry Details</DialogTitle>
                      </DialogHeader>
                      {selectedEnquiry && (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Name:</span> {selectedEnquiry.contactName || `${selectedEnquiry.firstName || ""} ${selectedEnquiry.lastName || ""}`.trim() || "Anonymous"}</p>
                                {selectedEnquiry.email && <p><span className="font-medium">Email:</span> {selectedEnquiry.email}</p>}
                                {selectedEnquiry.phone && <p><span className="font-medium">Phone:</span> {selectedEnquiry.phone}</p>}
                                {selectedEnquiry.organization && <p><span className="font-medium">Organization:</span> {selectedEnquiry.organization}</p>}
                                {selectedEnquiry.location && <p><span className="font-medium">Location:</span> {selectedEnquiry.location}</p>}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Enquiry Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Status:</span> {statusLabels[selectedEnquiry.status as EnquiryStatus]}</p>
                                <p><span className="font-medium">Submitted:</span> {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : 'N/A'}</p>
                                {selectedEnquiry.serviceRequired && <p><span className="font-medium">Service:</span> {selectedEnquiry.serviceRequired}</p>}
                              </div>
                            </div>
                          </div>
                          {selectedEnquiry.additionalRequirements && (
                            <div>
                              <h4 className="font-semibold mb-2">Message</h4>
                              <p className="text-sm bg-muted p-3 rounded">{selectedEnquiry.additionalRequirements}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}