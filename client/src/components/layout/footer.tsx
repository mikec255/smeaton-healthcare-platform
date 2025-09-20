import { Link } from "wouter";
import { Heart, Mail, MapPin, Clock, Phone } from "lucide-react";
import smeatonLogo from "@assets/Untitled design-33_1757665477175.png";

export default function Footer() {
  // Calculate years since founding date (18/02/2019)
  const foundingDate = new Date('2019-02-18');
  const currentDate = new Date();
  const yearsSinceFoundation = Math.floor((currentDate.getTime() - foundingDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return (
    <footer className="bg-gradient-to-r from-foreground to-primary text-white pt-12 pb-24" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="self-start md:col-span-2">
            <img 
              src={smeatonLogo} 
              alt="Smeaton Healthcare" 
              className="h-32 w-auto block" 
              style={{ marginTop: '0px', marginBottom: '16px' }}
              data-testid="footer-brand-logo"
            />
            <p className="text-gray-300 mb-4" data-testid="footer-description">
              Providing exceptional healthcare services<br />across Devon and Cornwall since 2019.
            </p>
            <p className="text-gray-300 text-sm" data-testid="footer-copyright">
              © 2025 Smeaton Healthcare. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" style={{ marginTop: '0px', lineHeight: '32px', paddingTop: '48px' }} data-testid="footer-services-title">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/services/short-visits" className="hover:text-white transition-colors" data-testid="footer-link-short-visits">
                  Short Visits
                </Link>
              </li>
              <li>
                <Link href="/services/supported-living" className="hover:text-white transition-colors" data-testid="footer-link-supported-living">
                  Supported Living
                </Link>
              </li>
              <li>
                <Link href="/services/care-24-7" className="hover:text-white transition-colors" data-testid="footer-link-care-24-7">
                  Care 24/7
                </Link>
              </li>
              <li>
                <Link href="/services/live-in-care" className="hover:text-white transition-colors" data-testid="footer-link-live-in-care">
                  Live-in Care
                </Link>
              </li>
              <li>
                <Link href="/services/respite" className="hover:text-white transition-colors" data-testid="footer-link-respite">
                  Respite Care
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" style={{ marginTop: '0px', lineHeight: '32px', paddingTop: '48px' }} data-testid="footer-careers-title">Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors" data-testid="footer-link-current-openings">
                  Current Openings
                </Link>
              </li>
              <li>
                <Link href="/resources/working-at-smeaton" className="hover:text-white transition-colors" data-testid="footer-link-working-at-smeaton">
                  Working at Smeaton
                </Link>
              </li>
              <li>
                <Link href="/resources/blog" className="hover:text-white transition-colors" data-testid="footer-link-blog">
                  Blog & News
                </Link>
              </li>
              <li>
                <Link href="/referral" className="hover:text-white transition-colors" data-testid="footer-link-referrals">
                  Make a Referral
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" style={{ marginTop: '0px', lineHeight: '32px', paddingTop: '48px' }} data-testid="footer-contact-title">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center" data-testid="footer-email">
                <Mail className="h-4 w-4 mr-2" />
                hello@smeatonhealthcare.co.uk
              </li>
              <li className="flex items-center" data-testid="footer-phone">
                <Phone className="h-4 w-4 mr-2" />
                0330 165 8880
              </li>
              <li className="flex items-center" data-testid="footer-location">
                <MapPin className="h-4 w-4 mr-2" />
                Plymouth & Truro
              </li>
              <li className="flex items-center" data-testid="footer-availability">
                <Clock className="h-4 w-4 mr-2" />
                24/7 Emergency Support
              </li>
              <li className="flex items-center text-accent" data-testid="footer-experience">
                <Heart className="h-4 w-4 mr-2" />
                {yearsSinceFoundation} Years of Excellence
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
