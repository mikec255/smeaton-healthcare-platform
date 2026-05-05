import { Helmet } from "react-helmet-async";

const SITE_NAME = "Smeaton Healthcare";
const BASE_URL = "https://smeatonhealthcare.co.uk";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  datePublished?: string;
  dateModified?: string;
  author?: string;
}

export default function Seo({
  title,
  description,
  path = "",
  image = DEFAULT_IMAGE,
  noindex = false,
  type = "website",
  datePublished,
  dateModified,
  author,
}: SeoProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;
  const ogImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  const articleSchema = type === "article" ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": ogImage,
    "url": canonical,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": author || SITE_NAME,
      "url": BASE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonical,
    },
  }) : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      {datePublished && <meta property="article:published_time" content={datePublished} />}
      {(dateModified || datePublished) && <meta property="article:modified_time" content={dateModified || datePublished} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {articleSchema && (
        <script type="application/ld+json">{articleSchema}</script>
      )}
    </Helmet>
  );
}
