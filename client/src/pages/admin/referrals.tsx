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
import { User, Mail, Phone, MapPin, Calendar, Clock, FileText, MessageSquare, Heart } from "lucide-react";
import { type ContactSubmission } from "@shared/schema";

type ReferralStatus = "new" | "contacted" | "assessed" | "closed";

const statusColors = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
  assessed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
};

const statusLabels = {
  new: "New",
  contacted: "Contacted", 
  assessed: "Assessed",
  closed: "Closed"
};

export default function ReferralsAdmin() {
  const { toast } = useToast();
  const [selectedReferral, setSelectedReferral] = useState<ContactSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch referrals
  const { data: referrals = [], isLoading } = useQuery<ContactSubmission[]>({
    queryKey: ['/api/contact-submissions', { type: 'referral' }],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact-submissions?type=referral");
      return response.json();
    }
  });

  // Update referral status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReferralStatus }) => {
      return apiRequest("PUT", `/api/contact-submissions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-submissions'] });
      toast({
        title: "Status updated",
        description: "Referral status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update referral status.",
        variant: "destructive",
      });
    }
  });

  const filteredReferrals = referrals.filter(referral => 
    statusFilter === "all" || referral.status === statusFilter
  );

  const handleStatusChange = (id: string, status: ReferralStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading referrals...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="referrals-admin">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="referrals-title">
          Manage Referrals
        </h1>
        <p className="text-muted-foreground" data-testid="referrals-description">
          Review and manage care referrals submitted through the website
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
              <SelectItem value="all">All Referrals</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="assessed">Assessed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>New: {referrals.filter(r => r.status === 'new').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Contacted: {referrals.filter(r => r.status === 'contacted').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Assessed: {referrals.filter(r => r.status === 'assessed').length}</span>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No referrals found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all" 
                ? "No referrals have been submitted yet." 
                : `No referrals with status "${statusLabels[statusFilter as ReferralStatus]}"`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReferrals.map((referral) => (
            <Card key={referral.id} className="hover:shadow-md transition-shadow" data-testid={`referral-${referral.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {referral.firstName} {referral.lastName}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {referral.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {referral.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[referral.status as ReferralStatus]} data-testid={`status-${referral.id}`}>
                      {statusLabels[referral.status as ReferralStatus]}
                    </Badge>
                    <Select
                      value={referral.status || "new"}
                      onValueChange={(value) => handleStatusChange(referral.id, value as ReferralStatus)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32" data-testid={`status-select-${referral.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="assessed">Assessed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {referral.serviceRequired && (
                      <div className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Service Required:</span>
                          <p className="text-sm text-muted-foreground">{referral.serviceRequired}</p>
                        </div>
                      </div>
                    )}
                    {referral.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Location:</span>
                          <p className="text-sm text-muted-foreground">{referral.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {referral.additionalRequirements && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <span className="font-medium text-sm">Additional Info:</span>
                          <p className="text-sm text-muted-foreground">{referral.additionalRequirements}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReferral(referral)}
                        data-testid={`view-details-${referral.id}`}
                      >
                        View Full Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Referral Details</DialogTitle>
                      </DialogHeader>
                      {selectedReferral && (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Name:</span> {selectedReferral.firstName} {selectedReferral.lastName}</p>
                                <p><span className="font-medium">Email:</span> {selectedReferral.email}</p>
                                <p><span className="font-medium">Phone:</span> {selectedReferral.phone}</p>
                                {selectedReferral.location && <p><span className="font-medium">Location:</span> {selectedReferral.location}</p>}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Referral Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Status:</span> {statusLabels[selectedReferral.status as ReferralStatus]}</p>
                                <p><span className="font-medium">Submitted:</span> {selectedReferral.createdAt ? new Date(selectedReferral.createdAt).toLocaleString() : 'N/A'}</p>
                                {selectedReferral.serviceRequired && <p><span className="font-medium">Service:</span> {selectedReferral.serviceRequired}</p>}
                              </div>
                            </div>
                          </div>
                          {selectedReferral.additionalRequirements && (
                            <div>
                              <h4 className="font-semibold mb-2">Additional Requirements</h4>
                              <p className="text-sm bg-muted p-3 rounded">{selectedReferral.additionalRequirements}</p>
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