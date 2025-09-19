import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import JobsTable from "@/components/admin/jobs-table";
import JobFormModal from "@/components/admin/job-form-modal";
import { Plus, Briefcase, UserPlus, Clock, CheckCircle, FileText, Send, Edit, ArrowRight, MessageSquare, Star, Mail, Users, UserCheck, Settings, BookOpen, LogOut, ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import { type Job, type Newsletter, type Feedback, type BlogPost, type User } from "@shared/schema";

// Email configuration schema
const emailConfigSchema = z.object({
  apiKey: z.string().min(50, "API key must be at least 50 characters").regex(/^x(keys|smtps)ib-/, "Invalid Brevo API key format")
});

type EmailConfigFormData = z.infer<typeof emailConfigSchema>;

export default function Admin() {
  const [, setLocation] = useLocation();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // All hooks must be called at the top level before any early returns
  const { data: authUser, isLoading: authLoading, error: authError } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/auth/me", {
        credentials: 'include',
        headers,
      });
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
    retry: false,
  });

  const { data: newsletters = [] } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
    enabled: !!authUser,
  });

  const { data: feedback = [] } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!authUser,
  });

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
    enabled: !!authUser,
  });

  // Email configuration status query
  const { data: emailConfig = { configured: false } } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/admin/email-config/status"],
    enabled: !!authUser && authUser.user?.role === "superadmin",
  });

  // Email configuration form
  const emailForm = useForm<EmailConfigFormData>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      apiKey: ""
    }
  });

  // Email configuration mutation
  const emailConfigMutation = useMutation({
    mutationFn: async (data: EmailConfigFormData) => {
      return await apiRequest("POST", "/api/admin/email-config", data);
    },
    onSuccess: () => {
      toast({
        title: "Email service configured",
        description: "Email integration is now active and ready to send notifications.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config/status"] });
      setEmailDialogOpen(false);
      emailForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Configuration failed",
        description: error?.message || "Failed to configure email service. Please check your API key.",
        variant: "destructive",
      });
    },
  });

  const onEmailConfigSubmit = (data: EmailConfigFormData) => {
    emailConfigMutation.mutate(data);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && (!authUser || authError)) {
      setLocation("/login");
    }
  }, [authUser, authLoading, authError, setLocation]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // Don't render admin content if not authenticated
  if (!authUser) {
    return null;
  }

  // Organized management categories
  const managementCategories = [
    {
      id: "resources",
      title: "Resources",
      description: "Manage content and communications",
      areas: [
        {
          title: "Blog",
          description: "Create, edit and publish blog posts for the resources section",
          icon: BookOpen,
          link: "/admin/blog",
          stats: {
            total: blogPosts.length,
            published: blogPosts.filter(p => p.isPublished).length,
            drafts: blogPosts.filter(p => !p.isPublished).length
          },
          color: "bg-primary text-primary-foreground hover:bg-primary/90"
        },
        {
          title: "Newsletter",
          description: "Create, edit and send newsletters to subscribers",
          icon: Mail,
          link: "/admin/newsletters",
          stats: {
            total: newsletters.length,
            published: newsletters.filter(n => n.status === 'published').length,
            drafts: newsletters.filter(n => n.status === 'draft').length
          },
          color: "bg-secondary text-secondary-foreground hover:bg-secondary/90"
        }
      ]
    },
    {
      id: "recruitment",
      title: "Recruitment", 
      description: "Manage hiring and applications",
      areas: [
        {
          title: "Pre-Screens",
          description: "Review job applications and manage candidate pipeline",
          icon: Users,
          link: "/admin/applications",
          stats: {
            total: 47,
            pending: 12,
            reviewed: 35
          },
          color: "bg-accent text-accent-foreground hover:bg-accent/90"
        }
      ]
    },
    {
      id: "customers",
      title: "Referrals & Website Enquiries",
      description: "Manage customer relationships, referrals and general enquiries", 
      areas: [
        {
          title: "Referrals",
          description: "Process care referrals and coordinate services",
          icon: UserCheck,
          link: "/admin/referrals",
          stats: {
            total: 23,
            new: 8,
            processed: 15
          },
          color: "bg-accent text-accent-foreground hover:bg-accent/90"
        },
        {
          title: "Contact Enquiries",
          description: "Manage general website contact form submissions",
          icon: MessageSquare,
          link: "/admin/contact-enquiries",
          stats: {
            total: 12,
            new: 5,
            processed: 7
          },
          color: "bg-secondary text-secondary-foreground hover:bg-secondary/90"
        }
      ]
    },
    {
      id: "feedback",
      title: "Feedback",
      description: "Monitor service quality and customer satisfaction",
      areas: [
        {
          title: "Manage Feedback",
          description: "View customer feedback for CQC compliance and quality improvement",
          icon: MessageSquare,
          link: "/admin/feedback",
          stats: {
            total: feedback.length,
            new: feedback.filter(f => f.status === "new").length,
            avgRating: feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length).toFixed(1) : "0"
          },
          color: "bg-muted text-muted-foreground hover:bg-muted/90"
        }
      ]
    }
  ];

  // Add admin category for superadmin users
  if (authUser?.user?.role === "superadmin") {
    managementCategories.push({
      id: "admin",
      title: "Admin",
      description: "System administration and configuration",
      areas: [
        {
          title: "Manage Users",
          description: "Create and manage admin users with role-based access control",
          icon: Settings,
          link: "/admin/users",
          stats: {
            total: 1,
            active: 1,
            inactive: 0
          },
          color: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        },
        {
          title: "Email Settings",
          description: "Configure email services for automated notifications and communications",
          icon: Mail,
          link: "#",
          isEmailSettings: true,
          stats: {
            configured: emailConfig.configured,
            status: emailConfig.configured ? "Configured" : "Not configured"
          },
          color: emailConfig.configured ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
        }
      ]
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="admin-page">
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="admin-title">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="admin-subtitle">
            Manage your healthcare staffing platform
          </p>
        </div>
      </div>
      
      {/* Management Categories */}
      <div className="space-y-8">
        {managementCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Category Header */}
            <div className="border-b border-border pb-4">
              <h2 className="text-2xl font-semibold text-foreground mb-2">{category.title}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            
            {/* Category Areas */}
            <div className="grid md:grid-cols-2 gap-6">
              {category.areas.map((area, areaIndex) => {
                const IconComponent = area.icon;
                const isEmailSettings = 'isEmailSettings' in area && area.isEmailSettings;
                const sectionId = `${category.id}-${areaIndex}`;
                const isExpanded = expandedSections.includes(sectionId);
                
                return (
                  <Card key={areaIndex} className="shadow-lg hover:shadow-xl transition-all duration-200 group" data-testid={`management-card-${category.id}-${areaIndex}`}>
                    {isEmailSettings ? (
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <div className="block cursor-pointer" data-testid="button-open-email-settings">
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center justify-between text-lg">
                                <span className="flex items-center gap-3">
                                  <div className={`${area.color} rounded-lg p-2`}>
                                    <IconComponent className="h-5 w-5" />
                                  </div>
                                  {area.title}
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{area.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection(sectionId);
                                  }}
                                  className="text-xs"
                                >
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  {isExpanded ? "Hide Stats" : "Show Stats"}
                                  {isExpanded ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
                                </Button>
                              </div>
                              
                              {isExpanded && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div className="text-center">
                                    <div className={`text-xl font-bold ${('configured' in area.stats && area.stats.configured) ? 'text-green-600' : 'text-red-600'}`}>
                                      {('configured' in area.stats && area.stats.configured) ? 'Active' : 'Inactive'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Status</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">
                                      {'status' in area.stats ? area.stats.status : 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Configuration</div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Email Settings</DialogTitle>
                          </DialogHeader>
                          <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onEmailConfigSubmit)} className="space-y-4">
                              <FormField
                                control={emailForm.control}
                                name="apiKey"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Brevo API Key</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="password" 
                                        placeholder="xkeysib-..." 
                                        {...field}
                                        data-testid="input-api-key"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setEmailDialogOpen(false)}
                                  data-testid="button-cancel"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={emailConfigMutation.isPending}
                                  data-testid="button-save-config"
                                >
                                  {emailConfigMutation.isPending ? "Saving..." : "Save & Test"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Link href={area.link} className="block" data-testid={`link-${category.id}-${areaIndex}`}>
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center justify-between text-lg">
                            <span className="flex items-center gap-3">
                              <div className={`${area.color} rounded-lg p-2`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              {area.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleSection(sectionId);
                                }}
                                className="text-xs"
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              </Button>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{area.description}</p>
                          
                          {isExpanded && (
                            <div className="grid grid-cols-3 gap-3">
                              {area.title === "Blog" && (
                                <>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">{area.stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">{"published" in area.stats ? area.stats.published : 0}</div>
                                    <div className="text-xs text-muted-foreground">Published</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-yellow-600">{"drafts" in area.stats ? area.stats.drafts : 0}</div>
                                    <div className="text-xs text-muted-foreground">Drafts</div>
                                  </div>
                                </>
                              )}
                              {area.title === "Newsletter" && (
                                <>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">{area.stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">{"published" in area.stats ? area.stats.published : 0}</div>
                                    <div className="text-xs text-muted-foreground">Published</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-yellow-600">{"drafts" in area.stats ? area.stats.drafts : 0}</div>
                                    <div className="text-xs text-muted-foreground">Drafts</div>
                                  </div>
                                </>
                              )}
                              {area.title === "Pre-Screens" && (
                                <>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">{area.stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-yellow-600">{"pending" in area.stats ? area.stats.pending : 0}</div>
                                    <div className="text-xs text-muted-foreground">Pending</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">{"reviewed" in area.stats ? area.stats.reviewed : 0}</div>
                                    <div className="text-xs text-muted-foreground">Reviewed</div>
                                  </div>
                                </>
                              )}
                              {area.title === "Referrals" && (
                                <>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">{area.stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-blue-600">{"new" in area.stats ? area.stats.new : 0}</div>
                                    <div className="text-xs text-muted-foreground">New</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">{"processed" in area.stats ? area.stats.processed : 0}</div>
                                    <div className="text-xs text-muted-foreground">Processed</div>
                                  </div>
                                </>
                              )}
                              {area.title === "Manage Feedback" && (
                                <>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">{area.stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-blue-600">{"new" in area.stats ? area.stats.new : 0}</div>
                                    <div className="text-xs text-muted-foreground">New</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-yellow-600">{"avgRating" in area.stats ? area.stats.avgRating : "0"}/5</div>
                                    <div className="text-xs text-muted-foreground">Rating</div>
                                  </div>
                                </>
                              )}
                              {area.title === "Manage Users" && (
                                <>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-foreground">{area.stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-green-600">{'active' in area.stats ? (area.stats as any).active : 0}</div>
                                    <div className="text-xs text-muted-foreground">Active</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xl font-bold text-red-600">{'inactive' in area.stats ? (area.stats as any).inactive : 0}</div>
                                    <div className="text-xs text-muted-foreground">Inactive</div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
