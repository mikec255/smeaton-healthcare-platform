import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/navbar";
import { useState, Suspense, lazy } from "react";
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
const Referral = lazy(() => import("@/pages/referral"));
const CreatePassword = lazy(() => import("@/pages/create-password"));

// Admin pages
const Admin = lazy(() => import("@/pages/admin"));
const UsersAdmin = lazy(() => import("@/pages/admin/users"));
const NewslettersAdmin = lazy(() => import("@/pages/admin/newsletters"));
const NewsletterEditor = lazy(() => import("@/pages/admin/newsletter-editor"));
const FeedbackAdmin = lazy(() => import("@/pages/admin/feedback"));
const BlogAdmin = lazy(() => import("@/pages/admin/blog"));
const ReferralsAdmin = lazy(() => import("@/pages/admin/referrals"));
const ContactEnquiriesAdmin = lazy(() => import("@/pages/admin/contact-enquiries"));
const JobsAdmin = lazy(() => import("@/pages/admin/jobs"));

// Resources pages
const Resources = lazy(() => import("@/pages/resources"));
const Blog = lazy(() => import("@/pages/resources/blog"));
const WorkingAtSmeaton = lazy(() => import("@/pages/resources/working-at-smeaton"));
const Sponsorship = lazy(() => import("@/pages/resources/sponsorship"));
const Newsletter = lazy(() => import("@/pages/resources/newsletter"));
const Costings = lazy(() => import("@/pages/resources/costings"));

function Router() {
  const [location] = useLocation();
  const [heroTab, setHeroTab] = useState("find-care");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
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
            <Route path="/services" component={Services} />
            <Route path="/services/short-visits" component={ShortVisits} />
            <Route path="/services/supported-living" component={SupportedLiving} />
            <Route path="/services/care-24-7" component={Care247} />
            <Route path="/services/enablements" component={Enablements} />
            <Route path="/services/respite" component={RespiteCare} />
            <Route path="/respite" component={RespiteCare} />
            <Route path="/services/live-in-care" component={LiveInCare} />
            <Route path="/services/condition-led-care" component={ConditionLedCare} />
            
            {/* Resources pages */}
            <Route path="/resources" component={Resources} />
            <Route path="/resources/blog" component={Blog} />
            <Route path="/resources/working-at-smeaton" component={WorkingAtSmeaton} />
            <Route path="/resources/sponsorship" component={Sponsorship} />
            <Route path="/resources/newsletter" component={Newsletter} />
            <Route path="/resources/costings" component={Costings} />
            
            {/* Other pages */}
            <Route path="/referral" component={Referral} />
            <Route path="/create-password" component={CreatePassword} />
            
            {/* Admin pages */}
            <Route path="/admin/newsletters/:id/edit" component={NewsletterEditor} />
            <Route path="/admin/newsletters/new" component={NewsletterEditor} />
            <Route path="/admin/newsletters/:id/preview" component={NewsletterEditor} />
            <Route path="/admin/newsletters" component={NewslettersAdmin} />
            <Route path="/admin/feedback" component={FeedbackAdmin} />
            <Route path="/admin/blog" component={BlogAdmin} />
            <Route path="/admin/referrals" component={ReferralsAdmin} />
            <Route path="/admin/contact-enquiries" component={ContactEnquiriesAdmin} />
            <Route path="/admin/jobs" component={JobsAdmin} />
            <Route path="/admin/users" component={UsersAdmin} />
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;