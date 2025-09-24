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
          color: "bg-emerald-600 text-white hover:bg-emerald-700"
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
          color: "bg-emerald-600 text-white hover:bg-emerald-700"
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
          color: "bg-orange-600 text-white hover:bg-orange-700"
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
          color: "bg-orange-600 text-white hover:bg-orange-700"
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
          color: "bg-pink-600 text-white hover:bg-pink-700"
        }
      ]
    }
  ];

  // Add Tools & Compliance, Resources, and Admin categories for superadmin users
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
              active: 3,
              inactive: 0
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
              active: 34,
              inactive: 0
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
              active: 1,
              inactive: 0
            },
            color: "bg-green-600 text-white hover:bg-green-700"
          }
        ]
      },
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
              active: blogPosts.filter(p => p.isPublished).length,
              inactive: blogPosts.filter(p => !p.isPublished).length
            },
            color: "bg-blue-600 text-white hover:bg-blue-700"
          },
          {
            title: "Newsletter",
            description: "Create, edit and send newsletters to subscribers",
            icon: Mail,
            link: "/admin/newsletters",
            stats: {
              total: newsletters.length,
              active: newsletters.filter(n => n.status === 'published').length,
              inactive: newsletters.filter(n => n.status === 'draft').length
            },
            color: "bg-blue-600 text-white hover:bg-blue-700"
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
            color: "bg-slate-600 text-white hover:bg-slate-700"
          },
          {
            title: "Email Settings",
            description: "Configure email services for automated notifications and communications",
            icon: Mail,
            link: "#",
            isEmailSettings: true,
            stats: {
              total: 1,
              active: emailConfig.configured ? 1 : 0,
              inactive: emailConfig.configured ? 0 : 1
            },
            color: emailConfig.configured ? "bg-slate-600 text-white hover:bg-slate-700" : "bg-slate-600 text-white hover:bg-slate-700"
          }
        ]
      }
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="admin-page">
      {/* Admin Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="admin-title">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="admin-subtitle">
          Manage your healthcare staffing platform
        </p>
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {managementCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            {/* Simple Category Header */}
            <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b">
              {category.title}
            </h2>
            
            {/* Horizontal Boxes */}
            <div className="flex flex-wrap gap-4">
              {category.areas.map((area, areaIndex) => {
                const IconComponent = area.icon;
                const isEmailSettings = 'isEmailSettings' in area && area.isEmailSettings;
                
                return (
                  <div key={areaIndex} data-testid={`management-box-${category.id}-${areaIndex}`}>
                    {isEmailSettings ? (
                      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                          <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer min-w-[160px]" data-testid="button-open-email-settings">
                            <div className="flex items-center gap-3">
                              <div className={`${area.color} rounded-lg p-2`}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <span className="font-medium text-sm">{area.title}</span>
                            </div>
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
                      <Link href={area.link} data-testid={`link-${category.id}-${areaIndex}`}>
                        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-all duration-200 min-w-[160px]">
                          <div className="flex items-center gap-3">
                            <div className={`${area.color} rounded-lg p-2`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-sm">{area.title}</span>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
