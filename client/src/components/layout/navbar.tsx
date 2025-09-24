import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, ArrowRight, ChevronDown } from "lucide-react";
import logoImage from "@/assets/logo.png";

export default function Navbar() {
  const [location, navigate] = useLocation();
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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      zIndex: 40,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/">
            <img 
              src={logoImage} 
              alt="Smeaton Healthcare" 
              style={{ height: '144px', width: 'auto' }}
            />
          </Link>
          <div style={{ 
            display: 'none',
            color: '#275799',
            fontSize: '20px',
            fontWeight: 'bold'
          }} className="lg:block">
            0330 165 8880
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          {/* Home */}
          <Link href="/" style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: isActive("/") ? '#EF2587' : '#374151',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            Home
          </Link>

          {/* Services Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setServicesOpen(!servicesOpen);
                setResourcesOpen(false);
                setWorkingOpen(false);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Services
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            </button>
            {servicesOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                minWidth: '250px',
                padding: '8px',
                zIndex: 1000
              }}>
                {serviceLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setServicesOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setResourcesOpen(!resourcesOpen);
                setServicesOpen(false);
                setWorkingOpen(false);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Resources
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            </button>
            {resourcesOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                minWidth: '250px',
                padding: '8px',
                zIndex: 1000
              }}>
                {resourceLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setResourcesOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Working at Smeaton Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setWorkingOpen(!workingOpen);
                setServicesOpen(false);
                setResourcesOpen(false);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Working at Smeaton
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            </button>
            {workingOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                minWidth: '250px',
                padding: '8px',
                zIndex: 1000
              }}>
                {workingLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setWorkingOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Find Jobs */}
          <Link href="/jobs" style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: isActive("/jobs") ? '#EF2587' : '#374151',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            Find Jobs
          </Link>

          {/* Contact */}
          <Link href="/contact" style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: isActive("/contact") ? '#EF2587' : '#374151',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            Contact
          </Link>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            <Button 
              onClick={() => navigate('/referral')}
              style={{
                backgroundColor: '#EF2587',
                color: 'white',
                padding: '8px 16px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Make a Referral
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/admin')}
              style={{
                padding: '8px 16px',
                fontSize: '14px'
              }}
            >
              Admin
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button - Only show on mobile screens */}
        <button
          className="block lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#374151'
          }}
          data-testid="button-mobile-menu"
        >
          <Menu style={{ width: '24px', height: '24px' }} />
        </button>
      </div>

      {/* Mobile Menu - Clean layout with proper spacing */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            overflowY: 'auto',
            zIndex: 999
          }} 
          className="lg:hidden"
          data-testid="mobile-menu"
        >
          <div style={{ padding: '20px' }}>
            <Link 
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '16px 12px',
                fontSize: '18px',
                fontWeight: '500',
                color: isActive("/") ? '#EF2587' : '#374151',
                textDecoration: 'none',
                borderBottom: '1px solid #f3f4f6'
              }}
              data-testid="mobile-link-home"
            >
              Home
            </Link>

            <div style={{ marginTop: '0' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                paddingLeft: '12px',
                paddingTop: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f3f4f6',
                color: '#111827'
              }}>
                Services
              </div>
              {serviceLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 24px',
                    fontSize: '16px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f9fafb'
                  }}
                  data-testid={`mobile-link-service-${link.href.split('/').pop()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ marginTop: '0' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                paddingLeft: '12px',
                paddingTop: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f3f4f6',
                color: '#111827'
              }}>
                Resources
              </div>
              {resourceLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 24px',
                    fontSize: '16px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f9fafb'
                  }}
                  data-testid={`mobile-link-resource-${link.href.split('/').pop()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ marginTop: '0' }}>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                paddingLeft: '12px',
                paddingTop: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f3f4f6',
                color: '#111827'
              }}>
                Working at Smeaton
              </div>
              {workingLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 24px',
                    fontSize: '16px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f9fafb'
                  }}
                  data-testid={`mobile-link-working-${link.href.split('/').pop()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link 
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '16px 12px',
                fontSize: '18px',
                fontWeight: '500',
                color: isActive("/jobs") ? '#EF2587' : '#374151',
                textDecoration: 'none',
                marginTop: '16px',
                borderBottom: '1px solid #f3f4f6'
              }}
              data-testid="mobile-link-jobs"
            >
              Find Jobs
            </Link>

            <Link 
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '16px 12px',
                fontSize: '18px',
                fontWeight: '500',
                color: isActive("/contact") ? '#EF2587' : '#374151',
                textDecoration: 'none',
                borderBottom: '1px solid #f3f4f6'
              }}
              data-testid="mobile-link-contact"
            >
              Contact
            </Link>

            <div style={{ 
              padding: '24px 16px', 
              borderTop: '2px solid #f3f4f6', 
              marginTop: '24px',
              backgroundColor: '#f9fafb'
            }}>
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/referral');
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#EF2587',
                  color: 'white',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  borderRadius: '8px'
                }}
                data-testid="mobile-button-referral"
              >
                Make a Referral
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/admin');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}
                data-testid="mobile-button-admin"
              >
                Admin
              </Button>

              <div style={{
                textAlign: 'center',
                marginTop: '8px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#275799',
                letterSpacing: '0.5px'
              }}>
                📞 0330 165 8880
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}