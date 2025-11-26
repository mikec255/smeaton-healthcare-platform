import { useEffect } from "react";

interface OrganisationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

interface JobPostingSchemaProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType: string;
  jobLocation: {
    addressLocality: string;
    addressRegion: string;
    addressCountry?: string;
  };
  baseSalary?: {
    minValue?: number;
    maxValue?: number;
    currency?: string;
    unitText?: string;
  };
  hiringOrganization: {
    name: string;
    sameAs?: string;
    logo?: string;
  };
  jobBenefits?: string[];
  qualifications?: string[];
  responsibilities?: string[];
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  mainEntityOfPage?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Organisation Schema - for the main business
export function OrganisationSchema({
  name = "Smeaton Healthcare",
  description = "Professional healthcare staffing and domiciliary care services across Devon and Cornwall. Providing quality home care, live-in care, and healthcare recruitment.",
  url = "https://smeatonhealthcare.co.uk",
  logo = "https://smeatonhealthcare.co.uk/logo.png",
  telephone,
  email = "info@smeatonhealthcare.co.uk",
  address = {
    addressLocality: "Plymouth",
    addressRegion: "Devon",
    postalCode: "PL1",
    addressCountry: "GB"
  },
  sameAs = []
}: OrganisationSchemaProps) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "MedicalBusiness"],
    "@id": `${url}/#organization`,
    name,
    description,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 200,
      height: 60
    },
    email,
    address: {
      "@type": "PostalAddress",
      ...address
    },
    areaServed: [
      {
        "@type": "State",
        name: "Devon"
      },
      {
        "@type": "State", 
        name: "Cornwall"
      }
    ],
    priceRange: "££",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Healthcare Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Live-in Care",
            description: "24/7 live-in care services for those who need round-the-clock support"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Domiciliary Care",
            description: "Regular home visits for personal care and support"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Respite Care",
            description: "Short-term care to give family carers a break"
          }
        }
      ]
    },
    sameAs
  };

  // Add telephone only if provided (to avoid invalid data)
  if (telephone) {
    schema.telephone = telephone;
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'organisation-schema';
    script.textContent = JSON.stringify(schema);
    
    // Remove existing script if any
    const existing = document.getElementById('organisation-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById('organisation-schema');
      if (el) el.remove();
    };
  }, []);

  return null;
}

// Job Posting Schema - for individual job listings
export function JobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  jobLocation,
  baseSalary,
  hiringOrganization,
  jobBenefits,
  qualifications,
  responsibilities
}: JobPostingSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted,
    employmentType: employmentType.toUpperCase().replace('-', '_'),
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: jobLocation.addressLocality,
        addressRegion: jobLocation.addressRegion,
        addressCountry: jobLocation.addressCountry || "GB"
      }
    },
    hiringOrganization: {
      "@type": "Organization",
      name: hiringOrganization.name,
      sameAs: hiringOrganization.sameAs,
      logo: hiringOrganization.logo
    },
    directApply: true
  };

  if (validThrough) {
    schema.validThrough = validThrough;
  }

  if (baseSalary && (baseSalary.minValue || baseSalary.maxValue)) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: baseSalary.currency || "GBP",
      value: {
        "@type": "QuantitativeValue",
        minValue: baseSalary.minValue,
        maxValue: baseSalary.maxValue,
        unitText: baseSalary.unitText || "HOUR"
      }
    };
  }

  if (jobBenefits && jobBenefits.length > 0) {
    schema.jobBenefits = jobBenefits.join(", ");
  }

  if (qualifications && qualifications.length > 0) {
    schema.qualifications = qualifications.join(", ");
  }

  if (responsibilities && responsibilities.length > 0) {
    schema.responsibilities = responsibilities.join(", ");
  }

  useEffect(() => {
    const scriptId = `job-schema-${title.replace(/\s+/g, '-').toLowerCase()}`;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [title]);

  return null;
}

// Article Schema - for blog posts
export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = { name: "Smeaton Healthcare" },
  publisher = { name: "Smeaton Healthcare", logo: "https://smeatonhealthcare.co.uk/logo.png" },
  mainEntityOfPage
}: ArticleSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    author: {
      "@type": "Organization",
      name: author.name
    },
    publisher: {
      "@type": "Organization",
      name: publisher.name,
      logo: {
        "@type": "ImageObject",
        url: publisher.logo
      }
    }
  };

  if (image) {
    schema.image = {
      "@type": "ImageObject",
      url: image,
      width: 1200,
      height: 630
    };
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (mainEntityOfPage) {
    schema.mainEntityOfPage = {
      "@type": "WebPage",
      "@id": mainEntityOfPage
    };
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-schema';
    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById('article-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById('article-schema');
      if (el) el.remove();
    };
  }, [headline]);

  return null;
}

// Breadcrumb Schema - for navigation
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-schema';
    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById('breadcrumb-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById('breadcrumb-schema');
      if (el) el.remove();
    };
  }, [items]);

  return null;
}

// Website Schema - for the main site
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://smeatonhealthcare.co.uk/#website",
    url: "https://smeatonhealthcare.co.uk",
    name: "Smeaton Healthcare",
    description: "Professional healthcare staffing and domiciliary care services across Devon and Cornwall",
    publisher: {
      "@id": "https://smeatonhealthcare.co.uk/#organization"
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://smeatonhealthcare.co.uk/jobs?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'website-schema';
    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById('website-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById('website-schema');
      if (el) el.remove();
    };
  }, []);

  return null;
}

// FAQPage Schema - for FAQ sections
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    script.textContent = JSON.stringify(schema);
    
    const existing = document.getElementById('faq-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);
    
    return () => {
      const el = document.getElementById('faq-schema');
      if (el) el.remove();
    };
  }, [faqs]);

  return null;
}
