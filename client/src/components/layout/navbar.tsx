import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import logoImage from "@/assets/logo.png";

export default function Navbar() {
  const [location] = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [workingOpen, setWorkingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const serviceLinks = [
    { href: "/services/short-visits", label: "Short Visits" },
    { href: "/services/supported-living", label: "Supported Living" },
    { href: "/services/care-24-7", label: "24/7 Care" },
    { href: "/services/enablements", label: "Enabling" },
    { href: "/services/respite", label: "Respite Care" },
    { href: "/services/live-in-care", label: "Live-In Care" },
    { href: "/services/condition-led-care", label: "Condition-Led Care" },
  ];

  const resourceLinks = [
    { href: "/resources/blog", label: "Blog" },
    { href: "/resources/newsletter", label: "Newsletter" },
    { href: "/resources/costings", label: "Understanding Care Funding" },
  ];

  const workingLinks = [
    { href: "/resources/working-at-smeaton", label: "Working at Smeaton" },
    { href: "/resources/sponsorship", label: "Sponsorship" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40" style={{ padding: '0', margin: '0', display: 'flex', justifyContent: 'center' }}>
      {/* Main navbar container */}
      <div style={{ padding: '0', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '72px', width: '100%', boxSizing: 'border-box', gap: '0' }}>
        
        {/* Logo - ALWAYS VISIBLE */}
        <Link href="/" data-testid="navbar-logo" className="flex-shrink-0 flex items-center justify-center" style={{ padding: '0', margin: '0', height: '100%' }}>
          <img 
            src={logoImage} 
            alt="Smeaton Healthcare" 
            className="h-40 sm:h-32 md:h-28 w-auto"
            style={{ display: 'block', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop Navigation - visible on md+ screens */}
        <div className="hidden md:flex items-center gap-0" style={{ flex: '1', margin: '0', padding: '0', height: '100%' }}>
          {/* Home - visible on lg+ */}
          <Link 
            href="/" 
            className="hidden lg:flex text-sm font-medium whitespace-nowrap items-center justify-center h-full"
            style={{ color: isActive("/") ? '#EF2587' : '#374151', padding: '0 6px', margin: '0' }}
          >
            Home
          </Link>

          {/* Services Dropdown - visible on md+ */}
          <div className="relative" style={{ position: 'relative', height: '100%' }}>
            <button
              onClick={() => {
                setServicesOpen(!servicesOpen);
                setResourcesOpen(false);
                setWorkingOpen(false);
              }}
              style={{ padding: '0 6px', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', color: '#374151', margin: '0', height: '100%' }}
            >
              Services
              <ChevronDown className="w-4 h-4" />
            </button>
            {servicesOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', minWidth: '220px', padding: '6px', zIndex: 1000 }}>
                {serviceLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setServicesOpen(false)}
                    style={{ display: 'block', padding: '8px 12px', fontSize: '14px', color: '#374151', textDecoration: 'none', borderRadius: '4px' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Resources Dropdown - visible on lg+ */}
          <div className="hidden lg:block relative" style={{ position: 'relative', height: '100%' }}>
            <button
              onClick={() => {
                setResourcesOpen(!resourcesOpen);
                setServicesOpen(false);
                setWorkingOpen(false);
              }}
              style={{ padding: '0 6px', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', color: '#374151', margin: '0', height: '100%' }}
            >
              Resources
              <ChevronDown className="w-4 h-4" />
            </button>
            {resourcesOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', minWidth: '220px', padding: '6px', zIndex: 1000 }}>
                {resourceLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setResourcesOpen(false)}
                    style={{ display: 'block', padding: '8px 12px', fontSize: '14px', color: '#374151', textDecoration: 'none', borderRadius: '4px' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Working at Smeaton - visible on xl+ */}
          <div className="hidden xl:block relative" style={{ position: 'relative', height: '100%' }}>
            <button
              onClick={() => {
                setWorkingOpen(!workingOpen);
                setServicesOpen(false);
                setResourcesOpen(false);
              }}
              style={{ padding: '0 6px', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', color: '#374151', margin: '0', height: '100%' }}
            >
              Working at Smeaton
              <ChevronDown className="w-4 h-4" />
            </button>
            {workingOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', minWidth: '220px', padding: '6px', zIndex: 1000 }}>
                {workingLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setWorkingOpen(false)}
                    style={{ display: 'block', padding: '8px 12px', fontSize: '14px', color: '#374151', textDecoration: 'none', borderRadius: '4px' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Find Jobs - visible on lg+ */}
          <Link 
            href="/jobs" 
            className="hidden lg:flex text-sm font-medium whitespace-nowrap items-center justify-center h-full"
            style={{ color: isActive("/jobs") ? '#EF2587' : '#374151', padding: '0 12px', margin: '0' }}
          >
            Find Jobs
          </Link>

          {/* Contact - visible on lg+ */}
          <Link 
            href="/contact" 
            className="hidden lg:flex text-sm font-medium whitespace-nowrap items-center justify-center h-full"
            style={{ color: isActive("/contact") ? '#EF2587' : '#374151', padding: '0 12px', margin: '0' }}
          >
            Contact
          </Link>
        </div>

        {/* Right side items - these disappear first as screen shrinks */}
        
        {/* Make a Referral - hidden below xl */}
        <Button 
          onClick={() => window.location.href = '/referral'}
          className="hidden xl:flex"
          style={{ backgroundColor: '#EC4899', color: 'white', padding: '4px 8px', fontSize: '11px', border: 'none', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600', margin: '0', height: '28px' }}
        >
          Make a Referral
          <ArrowRight className="w-3 h-3" />
        </Button>

        {/* Admin - hidden below md */}
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/admin'}
          className="hidden md:block"
          style={{ padding: '4px 8px', fontSize: '11px', margin: '0', height: '28px', fontWeight: '600' }}
        >
          Admin
        </Button>

        {/* Phone - hidden below xl */}
        <div className="hidden xl:flex text-sm whitespace-nowrap" style={{ color: '#1e40af', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', height: '100%', margin: '0' }}>
          0330 165 8880
        </div>

        {/* Hamburger menu - visible below md */}
        <Button 
          variant="ghost" 
          className="md:hidden"
          style={{ padding: '0', margin: '0', height: '100%', width: 'auto' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? (
            <X className="h-20 sm:h-16 w-20 sm:w-16 text-gray-600" />
          ) : (
            <Menu className="h-20 sm:h-16 w-20 sm:w-16 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-white z-50 overflow-y-auto">
          <div style={{ padding: '12px' }}>
            {/* Home Link */}
            <Link 
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block', padding: '12px 8px', fontSize: '16px', fontWeight: '500', borderBottom: '1px solid #f3f4f6', color: isActive("/") ? '#EF2587' : '#374151', textDecoration: 'none' }}
            >
              Home
            </Link>

            {/* Services Section */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', padding: '8px', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>Services</div>
              {serviceLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'block', padding: '8px 16px', fontSize: '14px', color: '#6b7280', textDecoration: 'none', borderBottom: '1px solid #f9fafb' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Resources Section */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', padding: '8px', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>Resources</div>
              {resourceLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'block', padding: '8px 16px', fontSize: '14px', color: '#6b7280', textDecoration: 'none', borderBottom: '1px solid #f9fafb' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Working at Smeaton Section */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', padding: '8px', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>Working at Smeaton</div>
              {workingLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ display: 'block', padding: '8px 16px', fontSize: '14px', color: '#6b7280', textDecoration: 'none', borderBottom: '1px solid #f9fafb' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Find Jobs */}
            <Link 
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block', padding: '12px 8px', fontSize: '16px', fontWeight: '500', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', color: isActive("/jobs") ? '#EF2587' : '#374151', textDecoration: 'none', marginTop: '12px' }}
            >
              Find Jobs
            </Link>

            {/* Contact */}
            <Link 
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block', padding: '12px 8px', fontSize: '16px', fontWeight: '500', borderBottom: '1px solid #e5e7eb', color: isActive("/contact") ? '#EF2587' : '#374151', textDecoration: 'none' }}
            >
              Contact
            </Link>

            {/* Action Buttons and Phone */}
            <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/referral';
                }}
                style={{ width: '100%', backgroundColor: '#EC4899', color: 'white', padding: '12px', fontSize: '15px', fontWeight: '600', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                Make a Referral
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/admin';
                }}
                style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: '600', borderRadius: '6px' }}
              >
                Admin
              </Button>

              <div style={{ textAlign: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '18px', fontWeight: 'bold', color: '#1e40af' }}>
                📞 0330 165 8880
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
