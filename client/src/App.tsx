import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "@/components/layout/navbar";
import { useState, Suspense, lazy, useEffect } from "react";
import Footer from "@/components/layout/footer";
import ErrorBoundary from "@/components/error-boundary";

// Loading fallback component
function PageSkeleton() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
    </div>
  );
}

// Core pages that we know work
const Home = lazy(() => import("@/pages/home"));
const Jobs = lazy(() => import("@/pages/jobs"));
const Contact = lazy(() => import("@/pages/contact"));
const Login = lazy(() => import("@/pages/login"));
const ApplicationsAdmin = lazy(() => import("@/pages/admin/applications"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Service pages - load safely
const Services = lazy(() => import("@/pages/services"));
const ShortVisits = lazy(() => import("@/pages/short-visits"));
const SupportedLiving = lazy(() => import("@/pages/supported-living"));
const Care247 = lazy(() => import("@/pages/care-24-7"));
const Enablements = lazy(() => import("@/pages/enablements"));
const RespiteCare = lazy(() => import("@/pages/respite"));
const LiveInCare = lazy(() => import("@/pages/live-in-care"));
const ConditionLedCare = lazy(() => import("@/pages/condition-led-care"));

// Other essential pages
const About = lazy(() => import("@/pages/about"));
const Referral = lazy(() => import("@/pages/referral"));
const CreatePassword = lazy(() => import("@/pages/create-password"));

// Admin pages
const Admin = lazy(() => import("@/pages/admin"));
const RecruitmentHub = lazy(() => import("@/pages/admin/recruitment-hub"));
const EnquiriesHub = lazy(() => import("@/pages/admin/enquiries-hub"));
const FeedbackHub = lazy(() => import("@/pages/admin/feedback-hub"));
const ComplianceHub = lazy(() => import("@/pages/admin/compliance-hub"));
const ResourcesHub = lazy(() => import("@/pages/admin/resources-hub"));
const SystemHub = lazy(() => import("@/pages/admin/system-hub"));
const UsersAdmin = lazy(() => import("@/pages/admin/users"));
const NewslettersAdmin = lazy(() => import("@/pages/admin/newsletters"));
const NewsletterEditor = lazy(() => import("@/pages/admin/newsletter-editor"));
const FeedbackAdmin = lazy(() => import("@/pages/admin/feedback"));
const BlogAdmin = lazy(() => import("@/pages/admin/blog"));
const TemplatesAdmin = lazy(() => import("@/pages/admin/templates"));
const ReferralsAdmin = lazy(() => import("@/pages/admin/referrals"));
const ContactEnquiriesAdmin = lazy(() => import("@/pages/admin/contact-enquiries"));
const JobsAdmin = lazy(() => import("@/pages/admin/jobs"));
const AuditLogsAdmin = lazy(() => import("@/pages/admin/audit-logs"));
const ToolsAdmin = lazy(() => import("@/pages/admin/tools"));
const CqcToolkitAdmin = lazy(() => import("@/pages/admin/cqc-toolkit"));
const RecruitmentApplicationsAdmin = lazy(() => import("@/pages/admin/recruitment-applications"));
const ProfessionalReferencesAdmin = lazy(() => import("@/pages/admin/professional-references"));
const ReferenceRequestsAdmin = lazy(() => import("@/pages/admin/reference-requests"));
const RoutePlannerAdmin = lazy(() => import("@/pages/admin/route-planner"));
const FinanceReportsAdmin = lazy(() => import("@/pages/admin/finance-reports"));
const LiveInCareFlyer = lazy(() => import("@/pages/admin/live-in-care-flyer"));
const LiveInCareFacebook = lazy(() => import("@/pages/admin/live-in-care-facebook"));
const RecruitmentApplication = lazy(() => import("@/pages/recruitment-application"));
const ProfessionalReference = lazy(() => import("@/pages/professional-reference"));
const ReferenceForm = lazy(() => import("@/pages/reference-form"));

// Assessment page for staff knowledge tests
const Assessment = lazy(() => import("@/pages/assessment"));

// Staff assessment page (branch-specific knowledge assessments)
const StaffAssessment = lazy(() => import("@/pages/staff-assessment"));

// Public pages (no auth required)
const PublicFeedback = lazy(() => import("@/pages/public-feedback"));

// Resources pages
const Resources = lazy(() => import("@/pages/resources"));
const Blog = lazy(() => import("@/pages/resources/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const WorkingAtSmeaton = lazy(() => import("@/pages/resources/working-at-smeaton"));
const Sponsorship = lazy(() => import("@/pages/resources/sponsorship"));
const Newsletter = lazy(() => import("@/pages/resources/newsletter"));
const NewsletterPost = lazy(() => import("@/pages/newsletter-post"));
const Costings = lazy(() => import("@/pages/resources/costings"));

// Location pages (SEO)
const PlymouthLocation = lazy(() => import("@/pages/locations/plymouth"));
const TruroLocation = lazy(() => import("@/pages/locations/truro"));
const ExeterLocation = lazy(() => import("@/pages/locations/exeter"));
const CornwallLocation = lazy(() => import("@/pages/locations/cornwall"));
const DevonLocation = lazy(() => import("@/pages/locations/devon"));

function Router() {
  const [location] = useLocation();
  const [heroTab, setHeroTab] = useState("find-care");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[88px] sm:pt-[104px]">
        <Suspense fallback={<PageSkeleton />}>
          <Switch>
            <Route path="/">
              <Home heroTab={heroTab} onHeroTabChange={setHeroTab} />
            </Route>
            
            {/* Core functionality - tested and working */}
            <Route path="/jobs" component={Jobs} />
            <Route path="/contact" component={Contact} />
            <Route path="/login" component={Login} />
            <Route path="/admin/applications" component={ApplicationsAdmin} />
            
            {/* Service pages */}
            <Route path="/services/short-visits" component={ShortVisits} />
            <Route path="/services/supported-living" component={SupportedLiving} />
            <Route path="/services/care-24-7" component={Care247} />
            <Route path="/services/enablements" component={Enablements} />
            <Route path="/services/respite" component={RespiteCare} />
            <Route path="/respite" component={RespiteCare} />
            <Route path="/services/live-in-care" component={LiveInCare} />
            <Route path="/services/condition-led-care" component={ConditionLedCare} />
            
            {/* Resources pages */}
            <Route path="/resources/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/resources/working-at-smeaton" component={WorkingAtSmeaton} />
            <Route path="/resources/sponsorship" component={Sponsorship} />
            <Route path="/resources/newsletter" component={Newsletter} />
            <Route path="/newsletter/:slug" component={NewsletterPost} />
            <Route path="/resources/costings" component={Costings} />
            
            {/* Location pages (SEO) */}
            <Route path="/locations/plymouth" component={PlymouthLocation} />
            <Route path="/locations/truro" component={TruroLocation} />
            <Route path="/locations/exeter" component={ExeterLocation} />
            <Route path="/locations/cornwall" component={CornwallLocation} />
            <Route path="/locations/devon" component={DevonLocation} />
            
            {/* Other pages */}
            <Route path="/about" component={About} />
            <Route path="/referral" component={Referral} />
            <Route path="/create-password" component={CreatePassword} />
            <Route path="/apply" component={RecruitmentApplication} />
            <Route path="/reference" component={ProfessionalReference} />
            <Route path="/reference-form/:token" component={ReferenceForm} />
            
            {/* Staff Assessment page (public) */}
            <Route path="/assessment/:shareableLink" component={Assessment} />
            <Route path="/assessments/:token" component={StaffAssessment} />
            
            {/* Public Feedback Form */}
            <Route path="/feedback/:token" component={PublicFeedback} />
            
            {/* Admin hub pages */}
            <Route path="/admin/recruitment" component={RecruitmentHub} />
            <Route path="/admin/enquiries" component={EnquiriesHub} />
            <Route path="/admin/feedback-hub" component={FeedbackHub} />
            <Route path="/admin/compliance" component={ComplianceHub} />
            <Route path="/admin/resources" component={ResourcesHub} />
            <Route path="/admin/system" component={SystemHub} />
            
            {/* Admin feature pages */}
            <Route path="/admin/newsletters/:id/edit" component={NewsletterEditor} />
            <Route path="/admin/newsletters/new" component={NewsletterEditor} />
            <Route path="/admin/newsletters/:id/preview" component={NewsletterEditor} />
            <Route path="/admin/newsletters" component={NewslettersAdmin} />
            <Route path="/admin/feedback" component={FeedbackAdmin} />
            <Route path="/admin/blog" component={BlogAdmin} />
            <Route path="/admin/templates" component={TemplatesAdmin} />
            <Route path="/admin/referrals" component={ReferralsAdmin} />
            <Route path="/admin/contact-enquiries" component={ContactEnquiriesAdmin} />
            <Route path="/admin/jobs" component={JobsAdmin} />
            <Route path="/admin/users" component={UsersAdmin} />
            <Route path="/admin/audit-logs" component={AuditLogsAdmin} />
            <Route path="/admin/tools" component={ToolsAdmin} />
            <Route path="/admin/cqc-toolkit" component={CqcToolkitAdmin} />
            <Route path="/admin/route-planner" component={RoutePlannerAdmin} />
            <Route path="/admin/finance-reports" component={FinanceReportsAdmin} />
            <Route path="/admin/live-in-care-flyer" component={LiveInCareFlyer} />
            <Route path="/admin/live-in-care-facebook" component={LiveInCareFacebook} />
            <Route path="/admin/recruitment-applications" component={RecruitmentApplicationsAdmin} />
            <Route path="/admin/professional-references" component={ProfessionalReferencesAdmin} />
            <Route path="/admin/reference-requests" component={ReferenceRequestsAdmin} />
            <Route path="/admin" component={Admin} />
            
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;