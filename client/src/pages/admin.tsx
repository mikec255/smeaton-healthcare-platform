import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, MessageSquare, Shield, BookOpen, Settings, ArrowRight } from "lucide-react";
import { type User } from "@shared/schema";

export default function Admin() {
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

  const isSuperAdmin = authUser.user?.role === "superadmin";

  const hubs = [
    {
      id: "recruitment",
      title: "Recruitment",
      description: "Manage jobs, applications, pre-screens and references",
      icon: Users,
      link: "/admin/recruitment",
      color: "bg-emerald-600",
      available: true
    },
    {
      id: "enquiries",
      title: "Referrals & Enquiries",
      description: "Process care referrals and website contact submissions",
      icon: UserCheck,
      link: "/admin/enquiries",
      color: "bg-orange-600",
      available: true
    },
    {
      id: "feedback",
      title: "Feedback",
      description: "Monitor service quality and customer satisfaction",
      icon: MessageSquare,
      link: "/admin/feedback-hub",
      color: "bg-pink-600",
      available: true
    },
    {
      id: "compliance",
      title: "Tools & Compliance",
      description: "CQC toolkit, audit logs, route planner and calculators",
      icon: Shield,
      link: "/admin/compliance",
      color: "bg-blue-600",
      available: isSuperAdmin
    },
    {
      id: "resources",
      title: "Resources",
      description: "Blog posts, newsletters, templates and marketing materials",
      icon: BookOpen,
      link: "/admin/resources",
      color: "bg-indigo-600",
      available: isSuperAdmin
    },
    {
      id: "system",
      title: "Admin",
      description: "User management and system configuration",
      icon: Settings,
      link: "/admin/system",
      color: "bg-slate-600",
      available: isSuperAdmin
    }
  ];

  const visibleHubs = hubs.filter(hub => hub.available);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="admin-page">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="admin-title">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="admin-subtitle">
          Manage your healthcare staffing platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleHubs.map((hub) => {
          const IconComponent = hub.icon;
          return (
            <Link href={hub.link} key={hub.id} data-testid={`hub-${hub.id}`}>
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full group">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${hub.color} text-white rounded-lg p-3`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-1">{hub.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm flex-1">{hub.description}</p>
                  <div className="flex items-center gap-1 text-sm text-primary mt-4 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="h-4 w-4" />
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
