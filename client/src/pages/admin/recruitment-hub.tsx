import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Briefcase, Users, FileText, UserCheck, ClipboardList } from "lucide-react";
import { type User, type Job } from "@shared/schema";

export default function RecruitmentHub() {
  const [, setLocation] = useLocation();

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

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!authUser,
  });

  const { data: recruitmentApplications = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/recruitment-applications"],
    enabled: !!authUser,
  });

  const { data: professionalReferences = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/professional-references"],
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authLoading && (!authUser || authError)) {
      setLocation("/login");
    }
  }, [authUser, authLoading, authError, setLocation]);

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

  if (!authUser) {
    return null;
  }

  const features = [
    {
      title: "Jobs",
      description: "Create, manage and publish job listings for candidates",
      icon: Briefcase,
      link: "/admin/jobs",
      stats: `${jobs.filter(j => j.isActive).length} active of ${jobs.length} total`,
      color: "bg-emerald-600"
    },
    {
      title: "Pre-Screens",
      description: "Review job applications and manage candidate pipeline",
      icon: Users,
      link: "/admin/applications",
      stats: "Initial screening stage",
      color: "bg-emerald-600"
    },
    {
      title: "Applications",
      description: "View full recruitment applications submitted via direct link",
      icon: FileText,
      link: "/admin/recruitment-applications",
      stats: `${recruitmentApplications.filter(app => app.status === 'pending').length} pending of ${recruitmentApplications.length} total`,
      color: "bg-emerald-600"
    },
    {
      title: "References",
      description: "Request and manage external reference requests",
      icon: UserCheck,
      link: "/admin/reference-requests",
      stats: `${professionalReferences.filter(ref => ref.status === 'pending').length} pending of ${professionalReferences.length} total`,
      color: "bg-emerald-600"
    },
    {
      title: "Professional References",
      description: "View submitted professional references for candidates",
      icon: ClipboardList,
      link: "/admin/professional-references",
      stats: `${professionalReferences.length} references`,
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="recruitment-hub-page">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4" data-testid="back-to-admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="recruitment-hub-title">
          Recruitment
        </h1>
        <p className="text-muted-foreground">
          Manage hiring, applications, and candidate references
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Link href={feature.link} key={index} data-testid={`recruitment-feature-${index}`}>
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} text-white rounded-lg p-3`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                    <p className="text-xs text-muted-foreground">{feature.stats}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
