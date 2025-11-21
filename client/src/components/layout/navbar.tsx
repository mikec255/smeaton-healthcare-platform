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
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40">
      {/* Main navbar container */}
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" data-testid="navbar-logo" className="flex-shrink-0 mr-4">
            <img 
              src={logoImage} 
              alt="Smeaton Healthcare" 
              className="h-14 sm:h-16 md:h-20 w-auto"
            />
          </Link>

          {/* Desktop Navigation - only visible on xl+ screens */}
          <div className="hidden xl:flex items-center gap-1">
            {/* Home */}
            <Link 
              href="/" 
              className="px-3 py-2 text-sm font-medium whitespace-nowrap"
              style={{ color: isActive("/") ? '#EF2587' : '#374151' }}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setResourcesOpen(false);
                  setWorkingOpen(false);
                }}
                className="px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1 text-gray-700 hover:text-pink-600"
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {serviceLinks.map(link => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button
                onClick={() => {
                  setResourcesOpen(!resourcesOpen);
                  setServicesOpen(false);
                  setWorkingOpen(false);
                }}
                className="px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1 text-gray-700 hover:text-pink-600"
              >
                Resources
                <ChevronDown className="w-4 h-4" />
              </button>
              {resourcesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {resourceLinks.map(link => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setResourcesOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Working at Smeaton Dropdown */}
            <div className="relative group">
              <button
                onClick={() => {
                  setWorkingOpen(!workingOpen);
                  setServicesOpen(false);
                  setResourcesOpen(false);
                }}
                className="px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1 text-gray-700 hover:text-pink-600"
              >
                Working at Smeaton
                <ChevronDown className="w-4 h-4" />
              </button>
              {workingOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {workingLinks.map(link => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setWorkingOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Find Jobs */}
            <Link 
              href="/jobs" 
              className="px-3 py-2 text-sm font-medium whitespace-nowrap"
              style={{ color: isActive("/jobs") ? '#EF2587' : '#374151' }}
            >
              Find Jobs
            </Link>

            {/* Contact */}
            <Link 
              href="/contact" 
              className="px-3 py-2 text-sm font-medium whitespace-nowrap"
              style={{ color: isActive("/contact") ? '#EF2587' : '#374151' }}
            >
              Contact
            </Link>

            {/* Buttons */}
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <Button 
                onClick={() => window.location.href = '/referral'}
                className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-3 py-2 flex items-center gap-2 whitespace-nowrap"
              >
                Make a Referral
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/admin'}
                className="text-sm px-3 py-2 whitespace-nowrap"
              >
                Admin
              </Button>
            </div>

            {/* Phone number - desktop only */}
            <div className="ml-6 flex-shrink-0 text-blue-700 text-sm font-bold whitespace-nowrap border-l border-gray-300 pl-6">
              0330 165 8880
            </div>
          </div>

          {/* Mobile/Tablet hamburger menu - visible on screens smaller than xl */}
          <Button 
            variant="ghost" 
            size="sm"
            className="xl:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-3 sm:px-4 py-4 space-y-3">
            {/* Home Link */}
            <Link 
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 px-3 text-base font-medium border-b border-gray-100"
              style={{ color: isActive("/") ? '#EF2587' : '#374151' }}
            >
              Home
            </Link>

            {/* Services Section */}
            <div>
              <div className="text-sm font-bold px-3 py-2 text-gray-900">Services</div>
              {serviceLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-6 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Resources Section */}
            <div>
              <div className="text-sm font-bold px-3 py-2 text-gray-900">Resources</div>
              {resourceLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-6 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Working at Smeaton Section */}
            <div>
              <div className="text-sm font-bold px-3 py-2 text-gray-900">Working at Smeaton</div>
              {workingLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-6 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Find Jobs */}
            <Link 
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 px-3 text-base font-medium border-t border-b border-gray-100"
              style={{ color: isActive("/jobs") ? '#EF2587' : '#374151' }}
            >
              Find Jobs
            </Link>

            {/* Contact */}
            <Link 
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 px-3 text-base font-medium border-b border-gray-100"
              style={{ color: isActive("/contact") ? '#EF2587' : '#374151' }}
            >
              Contact
            </Link>

            {/* Action Buttons and Phone */}
            <div className="pt-4 space-y-3 border-t border-gray-200">
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/referral';
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium"
              >
                Make a Referral
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/admin';
                }}
                className="w-full"
              >
                Admin
              </Button>

              <div className="text-center py-3 border-t border-gray-100">
                <div className="text-lg font-bold text-blue-700">
                  📞 0330 165 8880
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
