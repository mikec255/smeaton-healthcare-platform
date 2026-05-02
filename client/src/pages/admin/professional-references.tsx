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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge as BadgeIcon, Search, Filter, Eye, Edit, Clock, User, Mail, Building2, FileText, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProfessionalReference } from "@shared/schema";

const statusConfig = {
  pending: { color: "bg-yellow-500", label: "Pending Review", icon: Clock },
  reviewed: { color: "bg-blue-500", label: "Under Review", icon: Eye },
  verified: { color: "bg-green-500", label: "Verified", icon: BadgeIcon },
  flagged: { color: "bg-red-500", label: "Flagged", icon: FileText }
};

const relationshipOptions = [
  "Direct Manager/Supervisor",
  "Senior Colleague",
  "Clinical Lead/Matron",
  "HR Manager",
  "Director/Owner",
  "Team Leader",
  "Mentor/Preceptor",
  "Other Professional Contact"
];

export default function ProfessionalReferencesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReference, setSelectedReference] = useState<ProfessionalReference | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: references = [], isLoading } = useQuery({
    queryKey: ['/api/admin/professional-references'],
    select: (data: ProfessionalReference[]) => {
      return data.filter(ref => {
        const matchesSearch = !searchTerm || 
          ref.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ref.referenceProviderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ref.referenceProviderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ref.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || ref.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/admin/professional-references/${id}/status`, 'PUT', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professional-references'] });
      toast({
        title: "Status Updated",
        description: "Reference status has been updated successfully."
      });
      setShowStatusDialog(false);
      setSelectedReference(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update reference status.",
        variant: "destructive"
      });
    }
  });

  const notesMutation = useMutation({
    mutationFn: async ({ id, adminNotes }: { id: string; adminNotes: string }) => {
      return apiRequest(`/api/admin/professional-references/${id}/notes`, 'PUT', { adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/professional-references'] });
      toast({
        title: "Notes Updated",
        description: "Admin notes have been updated successfully."
      });
      setShowNotesDialog(false);
      setSelectedReference(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed", 
        description: error?.message || "Failed to update admin notes.",
        variant: "destructive"
      });
    }
  });

  const handleStatusUpdate = (reference: ProfessionalReference) => {
    setSelectedReference(reference);
    setStatusUpdate(reference.status || "pending");
    setShowStatusDialog(true);
  };

  const handleNotesUpdate = (reference: ProfessionalReference) => {
    setSelectedReference(reference);
    setAdminNotes(reference.adminNotes ?? "");
    setShowNotesDialog(true);
  };

  const handleViewDetails = (reference: ProfessionalReference) => {
    setSelectedReference(reference);
    setShowDetails(true);
  };

  const submitStatusUpdate = () => {
    if (selectedReference && statusUpdate) {
      statusMutation.mutate({
        id: selectedReference.id,
        status: statusUpdate
      });
    }
  };

  const submitNotesUpdate = () => {
    if (selectedReference) {
      notesMutation.mutate({
        id: selectedReference.id,
        adminNotes
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="secondary">{status}</Badge>;

    return (
      <Badge className={`${config.color} text-white hover:${config.color}/90`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: string | null) => {
    if (!rating) return <span className="text-gray-400">Not rated</span>;
    
    const numRating = parseInt(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    
    return (
      <div className="flex items-center space-x-1">
        {stars}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading professional references...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="title-professional-references">
            Professional References
          </h1>
          <p className="text-gray-600 mt-1">
            Manage professional references submitted for candidates
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {references.length} total references
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search References</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by candidate name, reference provider, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-references"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Under Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References List */}
      <div className="grid gap-4">
        {references.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No References Found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "No references match your current filters."
                  : "No professional references have been submitted yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          references.map((reference) => (
            <Card key={reference.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg" data-testid={`text-candidate-name-${reference.id}`}>
                        {reference.candidateName}
                      </h3>
                      {getStatusBadge(reference.status || "pending")}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm space-x-4">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{reference.candidateEmail}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Submitted {format(new Date(reference.createdAt || new Date()), "MMM dd, yyyy 'at' HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(reference)}
                      data-testid={`button-view-${reference.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(reference)}
                      data-testid={`button-status-${reference.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNotesUpdate(reference)}
                      data-testid={`button-notes-${reference.id}`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Notes
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="font-medium text-gray-700">Reference Provider</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span data-testid={`text-provider-name-${reference.id}`}>
                        {reference.referenceProviderName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{reference.referenceProviderEmail}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-gray-700">Organization</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{reference.referenceProviderCompany}</span>
                    </div>
                    <div className="text-gray-600 mt-1">{reference.referenceProviderTitle}</div>
                  </div>

                  <div>
                    <Label className="font-medium text-gray-700">Contact Info</Label>
                    <div className="text-gray-600 mt-1">{reference.referenceProviderPhone || 'No phone provided'}</div>
                    <div className="text-xs text-gray-500 mt-1">{reference.source || 'direct_submission'}</div>
                  </div>
                </div>

                {reference.adminNotes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Label className="font-medium text-blue-800">Admin Notes</Label>
                    <p className="text-blue-700 text-sm mt-1">{reference.adminNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reference Details</DialogTitle>
            <DialogDescription>
              Complete professional reference information
            </DialogDescription>
          </DialogHeader>
          
          {selectedReference && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="details">Full Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Candidate</Label>
                    <p>{selectedReference.candidateName}</p>
                    <p className="text-sm text-gray-600">{selectedReference.candidateEmail}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Reference Provider</Label>
                    <p>{selectedReference.referenceProviderName}</p>
                    <p className="text-sm text-gray-600">{selectedReference.referenceProviderEmail}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Organization</Label>
                    <p>{selectedReference.referenceProviderCompany}</p>
                    <p className="text-sm text-gray-600">{selectedReference.referenceProviderTitle}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Position Applied For</Label>
                    <p>{selectedReference.positionAppliedFor}</p>
                    <p className="text-sm text-gray-600">
                      Source: {selectedReference.source || 'direct_submission'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="assessment" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="font-semibold">Overall Rating</Label>
                    <div className="mt-2">
                      {getRatingStars(selectedReference.referenceData?.overallRating || null)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Would Rehire?</Label>
                    <p className={`mt-2 font-medium ${
                      selectedReference.referenceData?.wouldRehire === 'yes' ? 'text-green-600' : 
                      selectedReference.referenceData?.wouldRehire === 'no' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {selectedReference.referenceData?.wouldRehire === 'yes' ? 'Yes' : 
                       selectedReference.referenceData?.wouldRehire === 'no' ? 'No' : 'Not Specified'}
                    </p>
                  </div>
                </div>
                
                {selectedReference.referenceData?.strengthsAchievements && (
                  <div>
                    <Label className="font-semibold">Strengths & Achievements</Label>
                    <ScrollArea className="h-32 mt-2 p-3 border rounded-md bg-gray-50">
                      <p className="text-sm">{selectedReference.referenceData.strengthsAchievements}</p>
                    </ScrollArea>
                  </div>
                )}
                
                {selectedReference.referenceData?.areasImprovement && (
                  <div>
                    <Label className="font-semibold">Areas for Improvement</Label>
                    <ScrollArea className="h-32 mt-2 p-3 border rounded-md bg-gray-50">
                      <p className="text-sm">{selectedReference.referenceData.areasImprovement}</p>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <ScrollArea className="h-96">
                  <div className="space-y-4 pr-4">
                    <div>
                      <Label className="font-semibold">Candidate Role & Responsibilities</Label>
                      <p className="mt-2 text-sm bg-gray-50 p-3 rounded-md">{selectedReference.referenceData?.candidateRole || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Performance Context</Label>
                      <p className="mt-2 text-sm bg-gray-50 p-3 rounded-md">{selectedReference.referenceData?.performanceContext || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Additional Comments</Label>
                      <p className="mt-2 text-sm bg-gray-50 p-3 rounded-md">{selectedReference.referenceData?.additionalComments || 'No additional comments'}</p>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Contact Information</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <p><strong>Phone:</strong> {selectedReference.referenceProviderPhone || 'Not provided'}</p>
                        <p><strong>Position:</strong> {selectedReference.referenceProviderTitle}</p>
                        <p><strong>Best Contact Times:</strong> {selectedReference.referenceData?.bestContactTimes || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <p><strong>Submitted:</strong> {format(new Date(selectedReference.createdAt || new Date()), "MMMM dd, yyyy 'at' HH:mm:ss")}</p>
                      <p><strong>Reference ID:</strong> {selectedReference.id}</p>
                      {selectedReference.reviewedAt && (
                        <p><strong>Last Reviewed:</strong> {format(new Date(selectedReference.reviewedAt), "MMMM dd, yyyy 'at' HH:mm:ss")} by {selectedReference.reviewedBy}</p>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Reference Status</DialogTitle>
            <DialogDescription>
              Change the status of this professional reference
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reference for: {selectedReference?.candidateName}</Label>
              <p className="text-sm text-gray-600">Provided by: {selectedReference?.referenceProviderName}</p>
            </div>
            
            <div>
              <Label htmlFor="status-update">New Status</Label>
              <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Under Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={statusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submitStatusUpdate}
              disabled={statusMutation.isPending || !statusUpdate}
              data-testid="button-confirm-status"
            >
              {statusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Update Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Admin Notes</DialogTitle>
            <DialogDescription>
              Add or edit internal notes for this reference
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reference for: {selectedReference?.candidateName}</Label>
              <p className="text-sm text-gray-600">Provided by: {selectedReference?.referenceProviderName}</p>
            </div>
            
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this reference..."
                className="mt-1"
                rows={4}
                data-testid="textarea-admin-notes"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotesDialog(false)}
              disabled={notesMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submitNotesUpdate}
              disabled={notesMutation.isPending}
              data-testid="button-confirm-notes"
            >
              {notesMutation.isPending ? "Updating..." : "Update Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}