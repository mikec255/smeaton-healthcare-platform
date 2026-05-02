import { useEffect } from "react";

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function PageSEO({
  title,
  description,
  canonicalUrl,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  keywords,
  noindex = false
}: PageSEOProps) {
  useEffect(() => {
    // Update document title
    const fullTitle = title.includes("Smeaton") ? title : `${title} | Smeaton Healthcare`;
    document.title = fullTitle;

    // Helper functions to manage meta tags
    const setMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const setMetaName = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const setLinkTag = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    // Basic meta tags
    setMetaName('description', description);
    
    // Keywords (still useful for some search engines)
    if (keywords && keywords.length > 0) {
      setMetaName('keywords', keywords.join(', '));
    }

    // Robots
    if (noindex) {
      setMetaName('robots', 'noindex, nofollow');
    } else {
      setMetaName('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Canonical URL
    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
    } else {
      setLinkTag('canonical', window.location.href.split('?')[0].split('#')[0]);
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', description);
    setMetaTag('og:type', type);
    setMetaTag('og:url', canonicalUrl || window.location.href);
    setMetaTag('og:site_name', 'Smeaton Healthcare');
    setMetaTag('og:locale', 'en_GB');

    if (image) {
      setMetaTag('og:image', image);
      setMetaTag('og:image:type', 'image/jpeg');
      setMetaTag('og:image:width', '1200');
      setMetaTag('og:image:height', '630');
      setMetaTag('og:image:alt', title);
    }

    if (type === 'article') {
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime);
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime);
      }
      if (author) {
        setMetaTag('article:author', author);
      }
    }

    // Twitter Card tags
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', fullTitle);
    setMetaName('twitter:description', description);
    if (image) {
      setMetaName('twitter:image', image);
      setMetaName('twitter:image:alt', title);
    }

    // Cleanup function
    return () => {
      // We don't remove tags on cleanup as they should persist
    };
  }, [title, description, canonicalUrl, image, type, publishedTime, modifiedTime, author, keywords, noindex]);

  return null;
}

// Default SEO values for the site
export const defaultSEO = {
  title: "Smeaton Healthcare - Healthcare Staffing & Care Services",
  description: "Professional healthcare staffing and domiciliary care services across Devon and Cornwall. Join our team or find quality home care for your loved ones.",
  keywords: [
    "healthcare staffing",
    "care jobs Devon",
    "care jobs Cornwall",
    "domiciliary care",
    "live-in care",
    "home care services",
    "healthcare recruitment",
    "care worker jobs",
    "respite care",
    "elderly care",
    "Plymouth care services"
  ]
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: "Smeaton Healthcare - Quality Home Care Services in Devon & Cornwall",
    description: "Trusted healthcare staffing and home care services across Devon and Cornwall. Compassionate care workers, live-in care, respite care, and more. Join our team today.",
    keywords: ["home care Devon", "care services Cornwall", "healthcare staffing Plymouth", "domiciliary care", "live-in care services"]
  },
  services: {
    title: "Our Care Services - Smeaton Healthcare",
    description: "Comprehensive home care services including live-in care, short visits, respite care, condition-led care, and supported living across Devon and Cornwall.",
    keywords: ["care services", "home care", "live-in care", "respite care", "supported living", "domiciliary care"]
  },
  liveInCare: {
    title: "Live-in Care Services - 24/7 Home Care | Smeaton Healthcare",
    description: "Professional live-in care services providing round-the-clock support in the comfort of your own home. Experienced carers across Devon and Cornwall.",
    keywords: ["live-in care", "24 hour care", "home care", "residential care alternative", "elderly live-in care"]
  },
  shortVisits: {
    title: "Short Visit Care - Domiciliary Care Services | Smeaton Healthcare",
    description: "Flexible short visit care services for daily support with personal care, medication, meals, and companionship across Devon and Cornwall.",
    keywords: ["short visit care", "domiciliary care", "home visits", "personal care", "medication support"]
  },
  respite: {
    title: "Respite Care Services - Family Carer Support | Smeaton Healthcare",
    description: "Give family carers a well-deserved break with our professional respite care services. Short-term care support across Devon and Cornwall.",
    keywords: ["respite care", "carer support", "short-term care", "family carer break", "temporary care"]
  },
  conditionLedCare: {
    title: "Condition-Led Care - Specialist Care Services | Smeaton Healthcare",
    description: "Specialist care for dementia, Parkinson's, stroke recovery, and other health conditions. Experienced carers trained in condition-specific support.",
    keywords: ["dementia care", "Parkinson's care", "stroke care", "specialist care", "condition-led care"]
  },
  enablements: {
    title: "Enablement & Reablement Services | Smeaton Healthcare",
    description: "Helping individuals regain independence after illness or hospital discharge. Professional enablement and reablement services in Devon and Cornwall.",
    keywords: ["enablement", "reablement", "rehabilitation care", "post-hospital care", "independence support"]
  },
  supportedLiving: {
    title: "Supported Living Services | Smeaton Healthcare",
    description: "Empowering individuals to live independently with tailored support. Supported living services for learning disabilities and mental health needs.",
    keywords: ["supported living", "independent living", "learning disability support", "mental health support"]
  },
  care247: {
    title: "24/7 Care Services - Round-the-Clock Support | Smeaton Healthcare",
    description: "Continuous 24/7 care and support for complex care needs. Professional carers providing overnight and waking night care across Devon and Cornwall.",
    keywords: ["24/7 care", "overnight care", "waking night care", "complex care", "continuous care"]
  },
  jobs: {
    title: "Care Jobs in Devon & Cornwall | Smeaton Healthcare Careers",
    description: "Join our caring team. Find rewarding care worker jobs, live-in carer positions, and healthcare roles across Devon and Cornwall. Competitive pay and training.",
    keywords: ["care jobs Devon", "care jobs Cornwall", "carer jobs", "healthcare jobs", "live-in carer jobs", "care worker vacancies"]
  },
  contact: {
    title: "Contact Us - Get in Touch | Smeaton Healthcare",
    description: "Contact Smeaton Healthcare for care services or job opportunities. We're here to help with home care enquiries across Devon and Cornwall.",
    keywords: ["contact Smeaton Healthcare", "care enquiry", "home care contact", "Plymouth care services"]
  },
  blog: {
    title: "Healthcare Blog - News & Insights | Smeaton Healthcare",
    description: "Read our latest healthcare insights, care tips, and industry news. Expert advice on home care, elderly care, and healthcare careers.",
    keywords: ["healthcare blog", "care news", "elderly care tips", "healthcare insights", "care industry news"]
  },
  recruitment: {
    title: "Apply to Join Our Team | Smeaton Healthcare Careers",
    description: "Start your rewarding career in care. Apply now to become a care worker with Smeaton Healthcare. Full training, competitive pay, and career progression.",
    keywords: ["care job application", "become a carer", "care worker application", "healthcare recruitment"]
  },
  referral: {
    title: "Refer a Friend - Earn Rewards | Smeaton Healthcare",
    description: "Know someone who'd be great in care? Refer them to Smeaton Healthcare and earn rewards when they join our team.",
    keywords: ["refer a friend", "care referral", "employee referral", "care worker referral"]
  },
  workingAtSmeaton: {
    title: "Working at Smeaton - Why Join Us | Smeaton Healthcare",
    description: "Discover what makes Smeaton Healthcare a great place to work. Benefits, training, career progression, and our supportive team culture.",
    keywords: ["working at Smeaton", "care career", "healthcare employer", "care job benefits"]
  },
  sponsorship: {
    title: "Skilled Worker Visa Sponsorship | Smeaton Healthcare",
    description: "Smeaton Healthcare is a licensed sponsor for skilled worker visas. International healthcare professionals welcome to apply.",
    keywords: ["visa sponsorship", "skilled worker visa", "care worker sponsorship", "international care workers"]
  }
};
