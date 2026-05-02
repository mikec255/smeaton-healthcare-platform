import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Heart, Clock, Shield, CheckCircle, Phone, Mail, MapPin, Printer } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

export default function LiveInCareFlyer() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Live-In Care A5 Flyer</h1>
              <p className="text-muted-foreground mt-2">Print-ready marketing flyer (A5 size: 148mm x 210mm)</p>
            </div>
            <Button onClick={handlePrint} size="lg" data-testid="button-print">
              <Printer className="mr-2 h-5 w-5" />
              Print Flyer
            </Button>
          </div>
        </div>

        {/* A5 Flyer - Portrait */}
        <div className="bg-white shadow-2xl mx-auto overflow-hidden" style={{ width: '148mm', height: '210mm' }}>
          {/* Header with Brand Colors */}
          <div className="bg-gradient-to-br from-[hsl(340,82%,52%)] to-[hsl(291,64%,42%)] text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Home className="absolute top-4 right-4 w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-2">Live-In Care</h1>
              <p className="text-lg font-semibold opacity-95">Professional 24/7 care in your own home</p>
              <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="font-semibold">Devon & Cornwall</span>
              </div>
            </div>
          </div>

          {/* Key Benefits Section */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-pink-50 border-pink-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-pink-600 rounded-full p-2">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Stay Home</h3>
                    <p className="text-xs text-gray-600">Familiar surroundings</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-pink-50 border-pink-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-pink-600 rounded-full p-2">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">One-to-One</h3>
                    <p className="text-xs text-gray-600">Dedicated carer</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-600 rounded-full p-2">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">24/7 Support</h3>
                    <p className="text-xs text-gray-600">Round-the-clock</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-600 rounded-full p-2">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Peace of Mind</h3>
                    <p className="text-xs text-gray-600">Family assured</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* What's Included */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">What's Included</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Personal care assistance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Medication management</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Meal preparation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Light housekeeping</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Companionship</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Health monitoring</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Mobility assistance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Emotional support</span>
                </div>
              </div>
            </div>

            {/* Who Benefits */}
            <div className="border-l-4 border-pink-600 pl-4 py-2">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Who Benefits?</h2>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Adults wanting to age in place with dignity</li>
                <li>• Recovering from surgery or illness</li>
                <li>• People with dementia or chronic conditions</li>
                <li>• Those needing ongoing support at home</li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-pink-600 to-purple-600 text-white rounded-lg p-4 text-center">
              <p className="text-sm font-semibold mb-1">Rates from</p>
              <p className="text-3xl font-black">£185</p>
              <p className="text-sm opacity-90">per day</p>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-900 text-white rounded-lg p-4">
              <h2 className="text-lg font-bold mb-3">Get Started Today</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="text-xs text-gray-400">Call us</p>
                    <p className="font-bold">01752 690990</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-pink-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email us</p>
                    <p className="font-semibold text-sm">info@smeatonhealthcare.co.uk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Smeaton Healthcare
              </p>
              <p className="text-xs text-gray-500 mt-1">Professional care across Devon & Cornwall</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-muted-foreground print:hidden">
          <p className="text-sm">
            This flyer is designed for A5 paper (148mm x 210mm). 
            <br />Use your browser's print function to save as PDF or print directly.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          @page {
            size: A5 portrait;
            margin: 0;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
