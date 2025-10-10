import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/layout/page-header';
import { Home, Heart, Clock, Users, Phone, Mail, MapPin } from 'lucide-react';

export default function LiveInCareFacebook() {
  const handleDownload = () => {
    const element = document.getElementById('facebook-post');
    if (!element) return;

    // Use html2canvas for image generation
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 1080,
        height: 1080
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = 'smeaton-live-in-care-facebook.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Live-In Care - Facebook Post"
        description="Download image for Facebook sharing (1080x1080px)"
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex justify-end">
          <div className="space-x-2">
            <Button onClick={handleDownload} data-testid="button-download-facebook">
              Download Image (1080x1080)
            </Button>
          </div>
        </div>

        {/* Facebook Post - Square 1080x1080 */}
        <div className="bg-white shadow-2xl mx-auto" style={{ width: '1080px', height: '1080px' }}>
          <div id="facebook-post" className="w-full h-full flex flex-col bg-white">
            {/* Header with Brand Colors */}
            <div className="bg-gradient-to-br from-[hsl(340,82%,52%)] to-[hsl(291,64%,42%)] text-white p-12 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 opacity-10">
                <Home className="absolute top-8 right-8 w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h1 className="text-6xl font-bold mb-4 leading-tight">
                  Live-In Care
                </h1>
                <p className="text-3xl font-light opacity-90">
                  Professional Care in the Comfort of Home
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12 flex flex-col justify-between">
              {/* Key Benefits */}
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Personalised Care</h3>
                    <p className="text-2xl text-gray-600">One-to-one support tailored to individual needs</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Peace of Mind</h3>
                    <p className="text-2xl text-gray-600">Round-the-clock care and companionship</p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-semibold text-gray-900 mb-2">Stay Independent</h3>
                    <p className="text-2xl text-gray-600">Remain in familiar surroundings with dignity</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 my-8">
                <p className="text-2xl text-gray-700 mb-3">Starting from</p>
                <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-3">
                  £1,295/week
                </p>
                <p className="text-xl text-gray-600">Fully managed, professional service</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-semibold text-gray-900">0330 165 8880</span>
                    <span className="text-2xl text-gray-700">info@smeatonhealthcare.co.uk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white text-center py-6 flex-shrink-0">
              <p className="text-3xl font-bold">Smeaton Healthcare</p>
              <p className="text-xl opacity-75 mt-2">Caring for You, Supporting Your Independence</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Preview shown at 1080x1080px - optimized for Facebook posts</p>
        </div>
      </div>
    </AdminLayout>
  );
}
