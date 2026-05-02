// Utility to update meta tags for social media sharing
export function updateMetaTags(data: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  const baseUrl = window.location.origin;
  
  // Update page title
  if (data.title) {
    document.title = data.title;
  }
  
  // Helper to update or create meta tag
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
  
  // Update description
  if (data.description) {
    setMetaName('description', data.description);
    setMetaTag('og:description', data.description);
    setMetaTag('twitter:description', data.description);
  }
  
  // Update title
  if (data.title) {
    setMetaTag('og:title', data.title);
    setMetaTag('twitter:title', data.title);
  }
  
  // Update image
  if (data.image) {
    setMetaTag('og:image', data.image);
    setMetaTag('twitter:image', data.image);
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
  }
  
  // Update URL
  if (data.url) {
    const fullUrl = data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
    setMetaTag('og:url', fullUrl);
    setMetaTag('twitter:url', fullUrl);
  }
}

// Reset to default meta tags
export function resetMetaTags() {
  updateMetaTags({
    title: 'Smeaton Healthcare - Healthcare Staffing & Services',
    description: 'Professional healthcare staffing and care services across Devon and Cornwall. Join our team or find quality care for your loved ones.',
    url: window.location.pathname,
  });
}
