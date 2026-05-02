import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { SiFacebook, SiX, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { Mail } from "lucide-react";

interface SocialShareBarProps {
  title: string;
  url?: string;
}

export default function SocialShareBar({ title, url }: SocialShareBarProps) {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this opportunity: ${encodedUrl}`
  };

  const handleShare = (platform: string) => {
    window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 border-t border-b border-gray-200 my-6">
      <div className="flex items-center gap-2 text-gray-600">
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="text-sm sm:text-base font-medium">Share:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600"
          data-testid="share-facebook"
        >
          <SiFacebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="hover:bg-gray-50 hover:border-gray-900 hover:text-gray-900"
          data-testid="share-twitter"
        >
          <SiX className="h-4 w-4 mr-2" />
          X
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700"
          data-testid="share-linkedin"
        >
          <SiLinkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          className="hover:bg-green-50 hover:border-green-600 hover:text-green-600"
          data-testid="share-whatsapp"
        >
          <SiWhatsapp className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email')}
          className="hover:bg-purple-50 hover:border-purple-600 hover:text-purple-600"
          data-testid="share-email"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>
    </div>
  );
}
