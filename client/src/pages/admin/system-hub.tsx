import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Settings, Mail, CheckCircle, XCircle } from "lucide-react";
import { type User } from "@shared/schema";

export default function SystemHub() {
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

  const { data: emailConfig = { configured: false } } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/admin/email-config/status"],
    enabled: !!authUser && authUser.user?.role === "superadmin",
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

  // Only superadmins can access this hub
  if (authUser.user?.role !== "superadmin") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this area.</p>
          <Link href="/admin">
            <Button>Back to Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    {
      title: "Manage Users",
      description: "Create and manage admin users with role-based access control",
      icon: Settings,
      link: "/admin/users",
      stats: "User management",
      color: "bg-slate-600",
      clickable: true
    },
    {
      title: "Email Settings",
      description: `Email service ${emailConfig.configured ? 'configured and ready' : 'requires environment setup'}`,
      icon: Mail,
      link: "#",
      stats: emailConfig.configured ? "Service active" : "Needs configuration",
      color: emailConfig.configured ? "bg-green-600" : "bg-red-600",
      clickable: false,
      statusIcon: emailConfig.configured ? CheckCircle : XCircle
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="system-hub-page">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4" data-testid="back-to-admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="system-hub-title">
          Admin
        </h1>
        <p className="text-muted-foreground">
          System administration and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const StatusIcon = feature.statusIcon;
          
          if (!feature.clickable) {
            return (
              <Card key={index} className="p-6 opacity-80" data-testid={`system-feature-${index}`}>
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} text-white rounded-lg p-3`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      {StatusIcon && (
                        <StatusIcon className={`h-4 w-4 ${emailConfig.configured ? 'text-green-500' : 'text-red-500'}`} />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                    <p className="text-xs text-muted-foreground">{feature.stats}</p>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Link href={feature.link} key={index} data-testid={`system-feature-${index}`}>
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
