import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Send,
  Calendar,
  Filter
} from "lucide-react";
import { type Newsletter } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function NewslettersAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: newsletters = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
    enabled: true,
  });

  const deleteNewsletterMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/newsletters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      toast({
        title: "Newsletter deleted",
        description: "The newsletter has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete newsletter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateNewsletterStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/newsletters/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
      toast({
        title: "Status updated",
        description: "Newsletter status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update newsletter status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         newsletter.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || newsletter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: "Total Newsletters",
      value: newsletters.length,
      icon: FileText,
      color: "primary"
    },
    {
      title: "Published",
      value: newsletters.filter(n => n.status === "published").length,
      icon: Send,
      color: "success"
    },
    {
      title: "Drafts",
      value: newsletters.filter(n => n.status === "draft").length,
      icon: Edit,
      color: "warning"
    },
    {
      title: "This Month",
      value: newsletters.filter(n => {
        if (!n.createdAt) return false;
        const createdDate = new Date(n.createdAt);
        const thisMonth = new Date();
        return createdDate.getMonth() === thisMonth.getMonth() && 
               createdDate.getFullYear() === thisMonth.getFullYear();
      }).length,
      icon: Calendar,
      color: "info"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-green-100 text-green-800" data-testid={`status-published`}>Published</Badge>;
      case "draft":
        return <Badge variant="secondary" data-testid={`status-draft`}>Draft</Badge>;
      case "archived":
        return <Badge variant="outline" data-testid={`status-archived`}>Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDeleteNewsletter = (id: string) => {
    deleteNewsletterMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateNewsletterStatusMutation.mutate({ id, status });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="newsletters-admin-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="newsletters-admin-title">
            Newsletter Management
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="newsletters-admin-subtitle">
            Create, edit, and manage your email newsletters
          </p>
        </div>
        <Link href="/admin/newsletters/new" data-testid="button-create-newsletter">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-5 w-5" />
            Create Newsletter
          </Button>
        </Link>
      </div>

      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="shadow-lg" data-testid={`newsletter-stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm" data-testid={`newsletter-stat-title-${index}`}>
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground" data-testid={`newsletter-stat-value-${index}`}>
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
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search newsletters by title or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="newsletter-search-input"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="newsletter-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Newsletters Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle data-testid="newsletters-table-title">
            All Newsletters ({filteredNewsletters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12" data-testid="newsletters-loading">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading newsletters...</p>
            </div>
          ) : filteredNewsletters.length === 0 ? (
            <div className="text-center py-12" data-testid="newsletters-empty">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No newsletters found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "No newsletters match your current filters."
                  : "Get started by creating your first newsletter."
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/admin/newsletters/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Newsletter
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNewsletters.map((newsletter) => (
                    <TableRow key={newsletter.id} data-testid={`newsletter-row-${newsletter.id}`}>
                      <TableCell className="font-medium" data-testid={`newsletter-title-${newsletter.id}`}>
                        {newsletter.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm" data-testid={`newsletter-slug-${newsletter.id}`}>
                        {newsletter.slug}
                      </TableCell>
                      <TableCell data-testid={`newsletter-status-${newsletter.id}`}>
                        <Select
                          value={newsletter.status}
                          onValueChange={(status) => handleStatusChange(newsletter.id, status)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell data-testid={`newsletter-subject-${newsletter.id}`}>
                        {newsletter.subject || <span className="text-muted-foreground italic">No subject</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`newsletter-created-${newsletter.id}`}>
                        {newsletter.createdAt ? format(new Date(newsletter.createdAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`newsletter-updated-${newsletter.id}`}>
                        {newsletter.updatedAt ? format(new Date(newsletter.updatedAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            data-testid={`button-preview-${newsletter.id}`}
                          >
                            <Link href={`/admin/newsletters/${newsletter.id}/preview`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            data-testid={`button-edit-${newsletter.id}`}
                          >
                            <Link href={`/admin/newsletters/${newsletter.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                data-testid={`button-delete-${newsletter.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-testid={`delete-dialog-${newsletter.id}`}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Newsletter</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{newsletter.title}"? This action cannot be undone 
                                  and will also delete all associated blocks and campaigns.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-testid={`button-cancel-delete-${newsletter.id}`}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNewsletter(newsletter.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`button-confirm-delete-${newsletter.id}`}
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
    </div>
  );
}