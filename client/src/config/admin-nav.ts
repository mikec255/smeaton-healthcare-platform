import { 
  Home, 
  Users, 
  Briefcase, 
  UserCheck, 
  MessageSquare, 
  Calculator,
  Shield,
  BookOpen,
  Mail,
  Settings,
  BarChart3,
  FileText,
  MapPin
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: string | number;
  submenu?: NavItem[];
  adminOnly?: boolean;
  description?: string;
  permission?: keyof {
    overview: boolean;
    recruitment: boolean;
    customerRelations: boolean;
    feedback: boolean;
    tools: boolean;
    resources: boolean;
    system: boolean;
  };
}

export interface AdminRoute {
  path: string;
  title: string;
  description?: string;
  breadcrumbLabel?: string;
  parentId?: string;
}

// Navigation configuration
export const navigationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    href: '/admin',
    permission: 'overview',
    description: 'Dashboard overview with key metrics and recent activity'
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: Users,
    href: '#',
    permission: 'recruitment',
    description: 'Manage job listings and candidate applications',
    submenu: [
      { 
        id: 'jobs', 
        label: 'Jobs', 
        icon: Briefcase, 
        href: '/admin/jobs',
        description: 'Create and manage job listings'
      },
      { 
        id: 'applications', 
        label: 'Pre-Screens', 
        icon: Users, 
        href: '/admin/applications',
        description: 'Review job applications and manage candidate pipeline'
      },
      { 
        id: 'recruitment-applications', 
        label: 'Applications', 
        icon: FileText, 
        href: '/admin/recruitment-applications',
        description: 'View full recruitment applications submitted via direct link'
      },
      { 
        id: 'professional-references', 
        label: 'References', 
        icon: UserCheck, 
        href: '/admin/professional-references',
        description: 'Manage professional references submitted for candidates'
      }
    ]
  },
  {
    id: 'customers',
    label: 'Customer Relations',
    icon: UserCheck,
    href: '#',
    permission: 'customerRelations',
    description: 'Manage customer relationships and service referrals',
    submenu: [
      { 
        id: 'referrals', 
        label: 'Referrals', 
        icon: UserCheck, 
        href: '/admin/referrals',
        description: 'Process care referrals and coordinate services'
      },
      { 
        id: 'contacts', 
        label: 'Contact Enquiries', 
        icon: MessageSquare, 
        href: '/admin/contact-enquiries',
        description: 'Manage general website contact form submissions'
      }
    ]
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    href: '/admin/feedback',
    permission: 'feedback',
    description: 'View customer feedback for CQC compliance and quality improvement'
  },
  {
    id: 'tools',
    label: 'Tools & Compliance',
    icon: Calculator,
    href: '#',
    permission: 'tools',
    description: 'Business tools and regulatory compliance management',
    submenu: [
      { 
        id: 'calculators', 
        label: 'Package Calculators', 
        icon: Calculator, 
        href: '/admin/tools',
        description: 'Business calculators for care packages with UK employment overhead calculations'
      },
      { 
        id: 'cqc', 
        label: 'CQC Toolkit', 
        icon: Shield, 
        href: '/admin/cqc-toolkit',
        description: 'Comprehensive CQC compliance management with 2024 Single Assessment Framework'
      },
      { 
        id: 'audit-logs', 
        label: 'Audit Logs', 
        icon: Shield, 
        href: '/admin/audit-logs',
        description: 'GDPR compliance tracking - view all admin actions involving personal data'
      },
      { 
        id: 'route-planner', 
        label: 'Route Planner', 
        icon: MapPin, 
        href: '/admin/route-planner',
        description: 'Optimize domiciliary care visit routes with Google Maps integration'
      }
    ]
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: BookOpen,
    href: '#',
    permission: 'resources',
    description: 'Manage content and communications',
    submenu: [
      { 
        id: 'blog', 
        label: 'Blog', 
        icon: BookOpen, 
        href: '/admin/blog',
        description: 'Create, edit and publish blog posts for the resources section'
      },
      { 
        id: 'newsletters', 
        label: 'Newsletter', 
        icon: Mail, 
        href: '/admin/newsletters',
        description: 'Create, edit and send newsletters to subscribers'
      }
    ]
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    href: '#',
    permission: 'system',
    description: 'System administration and configuration',
    submenu: [
      { 
        id: 'users', 
        label: 'Manage Users', 
        icon: Settings, 
        href: '/admin/users',
        description: 'Create and manage admin users with role-based access control'
      }
    ]
  }
];

// Route configuration for page metadata
export const adminRoutes: Record<string, AdminRoute> = {
  '/admin': {
    path: '/admin',
    title: 'Dashboard Overview',
    description: 'Monitor your healthcare staffing platform performance and recent activity',
    breadcrumbLabel: 'Dashboard'
  },
  '/admin/jobs': {
    path: '/admin/jobs',
    title: 'Job Management',
    description: 'Create, manage and publish job listings for candidates',
    breadcrumbLabel: 'Jobs',
    parentId: 'recruitment'
  },
  '/admin/applications': {
    path: '/admin/applications',
    title: 'Application Pre-Screens',
    description: 'Review job applications and manage candidate pipeline',
    breadcrumbLabel: 'Pre-Screens',
    parentId: 'recruitment'
  },
  '/admin/referrals': {
    path: '/admin/referrals',
    title: 'Care Referrals',
    description: 'Process care referrals and coordinate services',
    breadcrumbLabel: 'Referrals',
    parentId: 'customers'
  },
  '/admin/contact-enquiries': {
    path: '/admin/contact-enquiries',
    title: 'Contact Enquiries',
    description: 'Manage general website contact form submissions',
    breadcrumbLabel: 'Contact Enquiries',
    parentId: 'customers'
  },
  '/admin/feedback': {
    path: '/admin/feedback',
    title: 'Customer Feedback',
    description: 'View customer feedback for CQC compliance and quality improvement',
    breadcrumbLabel: 'Feedback'
  },
  '/admin/tools': {
    path: '/admin/tools',
    title: 'Package Calculators',
    description: 'Business calculators for care packages with UK employment overhead calculations',
    breadcrumbLabel: 'Package Calculators',
    parentId: 'tools'
  },
  '/admin/cqc-toolkit': {
    path: '/admin/cqc-toolkit',
    title: 'CQC Audit & Compliance Toolkit',
    description: 'Comprehensive CQC compliance management with 2024 Single Assessment Framework',
    breadcrumbLabel: 'CQC Toolkit',
    parentId: 'tools'
  },
  '/admin/audit-logs': {
    path: '/admin/audit-logs',
    title: 'Audit Logs',
    description: 'GDPR compliance tracking - view all admin actions involving personal data',
    breadcrumbLabel: 'Audit Logs',
    parentId: 'tools'
  },
  '/admin/blog': {
    path: '/admin/blog',
    title: 'Blog Management',
    description: 'Create, edit and publish blog posts for the resources section',
    breadcrumbLabel: 'Blog',
    parentId: 'resources'
  },
  '/admin/newsletters': {
    path: '/admin/newsletters',
    title: 'Newsletter Management',
    description: 'Create, edit and send newsletters to subscribers',
    breadcrumbLabel: 'Newsletter',
    parentId: 'resources'
  },
  '/admin/users': {
    path: '/admin/users',
    title: 'User Management',
    description: 'Create and manage admin users with role-based access control',
    breadcrumbLabel: 'Manage Users',
    parentId: 'system'
  },
  '/admin/recruitment-applications': {
    path: '/admin/recruitment-applications',
    title: 'Recruitment Applications',
    description: 'View and manage full recruitment applications submitted via direct link',
    breadcrumbLabel: 'Applications',
    parentId: 'recruitment'
  },
  '/admin/professional-references': {
    path: '/admin/professional-references',
    title: 'Professional References',
    description: 'Manage professional references submitted for candidates',
    breadcrumbLabel: 'References',
    parentId: 'recruitment'
  },
  '/admin/route-planner': {
    path: '/admin/route-planner',
    title: 'Route Planner',
    description: 'Optimize domiciliary care visit routes with Google Maps integration',
    breadcrumbLabel: 'Route Planner',
    parentId: 'tools'
  }
};

// Utility functions
export function getRouteConfig(path: string): AdminRoute | undefined {
  return adminRoutes[path];
}

export function getNavigationItem(id: string): NavItem | undefined {
  for (const item of navigationItems) {
    if (item.id === id) return item;
    if (item.submenu) {
      const subItem = item.submenu.find(sub => sub.id === id);
      if (subItem) return subItem;
    }
  }
  return undefined;
}

export function generateBreadcrumbs(path: string): Array<{ label: string; href?: string; current?: boolean }> {
  const route = getRouteConfig(path);
  if (!route) return [];

  const breadcrumbs = [];

  // Add parent if exists
  if (route.parentId) {
    const parentItem = getNavigationItem(route.parentId);
    if (parentItem) {
      breadcrumbs.push({
        label: parentItem.label,
        href: undefined // Parent categories don't have direct links
      });
    }
  }

  // Add current page
  breadcrumbs.push({
    label: route.breadcrumbLabel || route.title,
    current: true
  });

  return breadcrumbs;
}