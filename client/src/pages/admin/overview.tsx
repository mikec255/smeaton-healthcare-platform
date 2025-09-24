import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Link } from 'wouter';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { type Job, type Application, type Feedback, type User } from '@shared/schema';

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: any;
  href?: string;
  loading?: boolean;
}

function KpiCard({ title, value, change, icon: Icon, href, loading }: KpiCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {loading ? <Skeleton className="h-8 w-16" /> : value}
        </div>
        {change && !loading && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center">
            {change.type === 'increase' ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : change.type === 'decrease' ? (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            ) : (
              <Activity className="h-3 w-3 text-gray-400 mr-1" />
            )}
            {change.value > 0 ? '+' : ''}{change.value}% from {change.period}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

// Recent Activity Item
interface ActivityItem {
  id: string;
  type: 'job' | 'application' | 'referral' | 'feedback';
  title: string;
  description: string;
  time: string;
  status?: string;
  href?: string;
}

function ActivityFeed({ activities, loading }: { activities: ActivityItem[], loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = activity.type === 'job' ? Briefcase : 
                            activity.type === 'application' ? Users :
                            activity.type === 'referral' ? UserCheck : MessageSquare;
        
        const content = (
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full">
                <IconComponent className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {activity.description}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {activity.time}
                </p>
                {activity.status && (
                  <Badge variant="secondary" className="text-xs">
                    {activity.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );

        return activity.href ? (
          <Link key={activity.id} href={activity.href}>
            {content}
          </Link>
        ) : (
          <div key={activity.id}>{content}</div>
        );
      })}
    </div>
  );
}

export default function AdminOverview() {
  // Queries for dashboard data
  const { data: authUser } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!authUser,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    enabled: !!authUser,
  });

  // Note: Using contact submissions as referrals data
  const { data: contactSubmissions = [], isLoading: contactsLoading } = useQuery<any[]>({
    queryKey: ["/api/contact-enquiries"],
    enabled: !!authUser,
  });

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!authUser,
  });

  // Calculate metrics
  const metrics = {
    activeJobs: jobs.filter(job => job.isActive).length,
    totalJobs: jobs.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    totalApplications: applications.length,
    newContacts: contactSubmissions.filter((contact: any) => contact.status === 'new').length,
    totalContacts: contactSubmissions.length,
    avgRating: feedback.length > 0 ? 
      (feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length) : 0,
    totalFeedback: feedback.length
  };

  // Generate recent activity
  const recentActivity: ActivityItem[] = [
    ...jobs.slice(0, 2).map(job => ({
      id: `job-${job.id}`,
      type: 'job' as const,
      title: `New job posted: ${job.title}`,
      description: `${job.location} • ${job.type}`,
      time: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown',
      status: job.isActive ? 'Active' : 'Inactive',
      href: '/admin/jobs'
    })),
    ...applications.slice(0, 2).map(app => ({
      id: `app-${app.id}`,
      type: 'application' as const,
      title: `New application received`,
      description: `Application for ${app.jobId}`,
      time: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown',
      status: app.status || 'pending',
      href: '/admin/applications'
    })),
    ...contactSubmissions.slice(0, 1).map((contact: any) => ({
      id: `contact-${contact.id}`,
      type: 'referral' as const,
      title: `New contact enquiry`,
      description: `${contact.subject || 'General enquiry'}`,
      time: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown',
      status: contact.status || 'new',
      href: '/admin/contact-enquiries'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  const isLoading = jobsLoading || applicationsLoading || contactsLoading || feedbackLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Overview"
          description="Monitor your healthcare staffing platform performance and recent activity"
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Active Jobs"
            value={metrics.activeJobs}
            change={{
              value: 12,
              type: 'increase',
              period: 'last month'
            }}
            icon={Briefcase}
            href="/admin/jobs"
            loading={isLoading}
          />
          
          <KpiCard
            title="Pending Applications"
            value={metrics.pendingApplications}
            change={{
              value: 8,
              type: 'increase',
              period: 'last week'
            }}
            icon={Users}
            href="/admin/applications"
            loading={isLoading}
          />
          
          <KpiCard
            title="New Enquiries"
            value={metrics.newContacts}
            change={{
              value: 5,
              type: 'increase',
              period: 'this week'
            }}
            icon={UserCheck}
            href="/admin/contact-enquiries"
            loading={isLoading}
          />
          
          <KpiCard
            title="Avg. Rating"
            value={metrics.avgRating > 0 ? metrics.avgRating.toFixed(1) : '—'}
            change={{
              value: 2,
              type: 'increase',
              period: 'last month'
            }}
            icon={Star}
            href="/admin/feedback"
            loading={isLoading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={recentActivity} loading={isLoading} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</span>
                <span className="font-semibold">{isLoading ? '—' : metrics.totalJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Applications</span>
                <span className="font-semibold">{isLoading ? '—' : metrics.totalApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</span>
                <span className="font-semibold">{isLoading ? '—' : metrics.totalContacts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Customer Feedback</span>
                <span className="font-semibold">{isLoading ? '—' : metrics.totalFeedback}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create New Job
                </Button>
              </Link>
              <Link href="/admin/applications">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Review Applications
                </Button>
              </Link>
              <Link href="/admin/referrals">
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Process Referrals
                </Button>
              </Link>
              <Link href="/admin/tools">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Package Calculator
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}