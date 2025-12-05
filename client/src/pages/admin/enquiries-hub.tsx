import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UserCheck, MessageSquare } from "lucide-react";
import { type User } from "@shared/schema";

export default function EnquiriesHub() {
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

  const features = [
    {
      title: "Referrals",
      description: "Process care referrals and coordinate services",
      icon: UserCheck,
      link: "/admin/referrals",
      stats: "Manage incoming care referrals",
      color: "bg-orange-600"
    },
    {
      title: "Contact Enquiries",
      description: "Manage general website contact form submissions",
      icon: MessageSquare,
      link: "/admin/contact-enquiries",
      stats: "Website contact submissions",
      color: "bg-orange-600"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="enquiries-hub-page">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4" data-testid="back-to-admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="enquiries-hub-title">
          Referrals & Website Enquiries
        </h1>
        <p className="text-muted-foreground">
          Manage customer relationships, referrals and general enquiries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Link href={feature.link} key={index} data-testid={`enquiries-feature-${index}`}>
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
