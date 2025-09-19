import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Feedback } from "@shared/schema";
import { 
  Star,
  MessageSquare, 
  Users, 
  CheckCircle,
  Clock,
  Search,
  Eye,
  Trash2,
  Filter,
  TrendingUp,
  ThumbsUp
} from "lucide-react";

export default function FeedbackAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: feedback = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: true,
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/feedback/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Feedback deleted",
        description: "The feedback has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateFeedbackStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/feedback/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feedback status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.additionalComments && item.additionalComments.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesService = serviceFilter === "all" || item.serviceUsed === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const stats = [
    {
      title: "Total Feedback",
      value: feedback.length,
      icon: MessageSquare,
      color: "primary"
    },
    {
      title: "Average Rating",
      value: feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length).toFixed(1) : "0",
      icon: Star,
      color: "success"
    },
    {
      title: "New Submissions",
      value: feedback.filter(f => f.status === "new").length,
      icon: Clock,
      color: "warning"
    },
    {
      title: "Resolved",
      value: feedback.filter(f => f.status === "resolved").length,
      icon: CheckCircle,
      color: "success"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>;
      case "reviewed":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Reviewed</Badge>;
      case "responded":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Responded</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>;
      case "published":
        return <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="feedback-admin-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Feedback</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="feedback-title">
            Feedback Management
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="feedback-subtitle">
            View and manage customer feedback for CQC compliance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="shadow-lg" data-testid={`feedback-stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm" data-testid={`feedback-stat-title-${index}`}>
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground" data-testid={`feedback-stat-value-${index}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`bg-${stat.color}/10 rounded-full p-3`}>
                    <IconComponent className={`text-${stat.color} h-6 w-6`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <Select value={serviceFilter} onValueChange={setServiceFilter} data-testid="service-filter">
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="care-at-home">Care at Home</SelectItem>
                  <SelectItem value="temporary-staff">Temporary Staff</SelectItem>
                  <SelectItem value="permanent-placement">Permanent Placement</SelectItem>
                  <SelectItem value="domiciliary-care">Domiciliary Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setServiceFilter("all");
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Feedback ({filteredFeedback.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-muted-foreground">Loading feedback...</div>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No feedback found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || serviceFilter !== "all" 
                  ? "Try adjusting your filters to see more results." 
                  : "No feedback submissions yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Overall Rating</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.email}
                          </div>
                          {item.relationship && (
                            <div className="text-xs text-muted-foreground">
                              {item.relationship}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.serviceUsed ? (
                          <Badge variant="outline">
                            {item.serviceUsed.split('-').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {getRatingStars(item.overallRating)}
                          </div>
                          <span className="text-sm font-medium">
                            {item.overallRating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.recommendation >= 9 ? (
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                          ) : item.recommendation >= 7 ? (
                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <span className="text-red-600">↓</span>
                          )}
                          <span className="text-sm">{item.recommendation}/10</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status || "new"}
                          onValueChange={(status) => updateFeedbackStatusMutation.mutate({ id: item.id, status })}
                          data-testid={`status-select-${item.id}`}
                        >
                          <SelectTrigger className="w-auto min-w-[120px]">
                            {getStatusBadge(item.status || "new")}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(item);
                              setIsDetailModalOpen(true);
                            }}
                            data-testid={`view-feedback-${item.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                data-testid={`delete-feedback-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this feedback from {item.firstName} {item.lastName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteFeedbackMutation.mutate(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>{selectedFeedback.firstName} {selectedFeedback.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedFeedback.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{selectedFeedback.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                    <p>{selectedFeedback.relationship || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Service Information</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service Used</label>
                  <p>
                    {selectedFeedback.serviceUsed ? (
                      <Badge variant="outline">
                        {selectedFeedback.serviceUsed.split('-').map((word: string) => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Ratings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Overall Rating</label>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < selectedFeedback.overallRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{selectedFeedback.overallRating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Recommendation Score</label>
                    <div className="flex items-center gap-2">
                      {selectedFeedback.recommendation >= 9 ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : selectedFeedback.recommendation >= 7 ? (
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <span className="text-red-600">↓</span>
                      )}
                      <span className="text-sm font-medium">{selectedFeedback.recommendation}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Comments */}
              {selectedFeedback.additionalComments && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Additional Comments</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedFeedback.additionalComments}</p>
                  </div>
                </div>
              )}

              {/* Status and Dates */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Status Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p>
                      <Badge variant="outline" className="capitalize">
                        {selectedFeedback.status || 'new'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
                    <p>{selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}