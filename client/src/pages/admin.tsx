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
import { Plus, Briefcase, UserPlus, Clock, CheckCircle, FileText, Send, Edit, ArrowRight, MessageSquare, Star, Mail, Users, UserCheck, Settings, BookOpen, LogOut, ChevronDown, ChevronRight, BarChart3, Shield, Calculator } from "lucide-react";
import { type Job, type Newsletter, type Feedback, type BlogPost, type User } from "@shared/schema";

// Email configuration schema
const emailConfigSchema = z.object({
  apiKey: z.string().min(50, "API key must be at least 50 characters").regex(/^x(keys|smtps)ib-/, "Invalid Brevo API key format")
});

type EmailConfigFormData = z.infer<typeof emailConfigSchema>;

export default function Admin() {
  const [, setLocation] = useLocation();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
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
          title: "Jobs",
          description: "Create, manage and publish job listings for candidates",
          icon: Briefcase,
          link: "/admin/jobs",
          stats: {
            total: jobs.length,
            active: jobs.filter(j => j.isActive).length,
            inactive: jobs.filter(j => !j.isActive).length
          },
          color: "bg-primary text-primary-foreground hover:bg-primary/90"
        },
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

  // Add Tools & Compliance category for superadmin users
  if (authUser?.user?.role === "superadmin") {
    managementCategories.push(
      {
        id: "tools-compliance",
        title: "Tools & Compliance",
        description: "Business tools and regulatory compliance management",
        areas: [
          {
            title: "Package Calculators",
            description: "Business calculators for hourly, live-in, and 24/7 care packages with UK employment overhead calculations",
            icon: Calculator,
            link: "/admin/tools",
            stats: {
              total: 3,
              status: "Calculator", 
              info: "UK Ready"
            },
            color: "bg-purple-600 text-white hover:bg-purple-700"
          },
          {
            title: "CQC Audit & Compliance Toolkit",
            description: "Comprehensive CQC compliance management with 2024 Single Assessment Framework",
            icon: Shield,
            link: "/admin/cqc-toolkit",
            stats: {
              total: 34,
              status: "2024 Framework",
              info: "CQC Ready"
            },
            color: "bg-blue-600 text-white hover:bg-blue-700"
          },
          {
            title: "Audit Logs", 
            description: "GDPR compliance tracking - view all admin actions involving personal data",
            icon: Shield,
            link: "/admin/audit-logs",
            stats: {
              total: 1,
              status: "Compliant",
              info: "GDPR Ready"
            },
            color: "bg-green-600 text-white hover:bg-green-700"
          }
        ]
      },
      {
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
      }
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="admin-page">
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="admin-title">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="admin-subtitle">
            Manage your healthcare staffing platform
          </p>
        </div>
      </div>
      
      {/* Management Categories with Better Visual Separation */}
      <div className="space-y-16">
        {managementCategories.map((category, categoryIndex) => (
          <div key={category.id} className="relative">
            {/* Category Header with Enhanced Styling */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-8 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-foreground">{category.title}</h2>
              </div>
              <p className="text-lg text-muted-foreground">{category.description}</p>
            </div>
            
            {/* Category Areas in Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {category.areas.map((area, areaIndex) => {
                const IconComponent = area.icon;
                const isEmailSettings = 'isEmailSettings' in area && area.isEmailSettings;
                
                return (
                  <Card key={areaIndex} className="shadow-lg hover:shadow-xl transition-all duration-300 group border-2 hover:border-blue-200 dark:hover:border-blue-700" data-testid={`management-card-${category.id}-${areaIndex}`}>
                    {isEmailSettings ? (
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <div className="block cursor-pointer" data-testid="button-open-email-settings">
                            <CardHeader className="pb-4">
                              <CardTitle className="flex items-center justify-between text-lg">
                                <span className="flex items-center gap-3">
                                  <div className={`${area.color} rounded-lg p-3 shadow-md`}>
                                    <IconComponent className="h-6 w-6" />
                                  </div>
                                  {area.title}
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{area.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                                  emailConfig.configured ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {emailConfig.configured ? 'Configured' : 'Not configured'}
                                </span>
                              </div>
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
                              <div className={`${area.color} rounded-lg p-3 shadow-md`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              {area.title}
                            </span>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{area.description}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {area.title === "Blog" && (
                              <span className="bg-muted px-2 py-1 rounded">
                                {area.stats.total} total • {('published' in area.stats ? area.stats.published : 0)} published
                              </span>
                            )}
                            {area.title === "Newsletter" && (
                              <span className="bg-muted px-2 py-1 rounded">
                                {area.stats.total} total • {('published' in area.stats ? area.stats.published : 0)} published
                              </span>
                            )}
                            {area.title === "Jobs" && (
                              <span className="bg-muted px-2 py-1 rounded">
                                {area.stats.total} total • {('active' in area.stats ? area.stats.active : 0)} active
                              </span>
                            )}
                            {area.title === "Manage Feedback" && (
                              <span className="bg-muted px-2 py-1 rounded">
                                {area.stats.total} total • {('avgRating' in area.stats ? area.stats.avgRating : '0')} avg
                              </span>
                            )}
                            {(area.title === "Package Calculators" || area.title === "CQC Audit & Compliance Toolkit" || area.title === "Audit Logs") && (
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded font-medium">
                                {'info' in area.stats ? area.stats.info : 'Ready'}
                              </span>
                            )}
                          </div>
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
