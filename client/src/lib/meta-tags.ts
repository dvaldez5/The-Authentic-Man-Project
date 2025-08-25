// Client-side meta tag utilities for programmatic SEO
import { landingPageConfigs } from '../../../server/programmatic-seo';

// Update document meta tags dynamically
export function updateMetaTags(slug: string) {
  const config = landingPageConfigs[slug as keyof typeof landingPageConfigs];
  if (!config) return;

  // Update title
  if (document.title !== config.title) {
    document.title = config.title;
  }

  // Update or create meta description
  updateMetaTag('description', config.description);
  
  // Update or create meta keywords
  updateMetaTag('keywords', config.keywords.join(', '));
  
  // Update Open Graph tags
  updateMetaTag('og:title', config.title, 'property');
  updateMetaTag('og:description', config.description, 'property');
  updateMetaTag('og:type', 'website', 'property');
  updateMetaTag('og:url', `https://theamproject.com/landing/${slug}`, 'property');
  
  // Update Twitter tags
  updateMetaTag('twitter:title', config.title);
  updateMetaTag('twitter:description', config.description);
  updateMetaTag('twitter:card', 'summary_large_image');
  
  // Update canonical link
  updateCanonicalLink(`https://theamproject.com/landing/${slug}`);
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

function updateCanonicalLink(href: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  
  canonical.href = href;
}

// Add structured data to the page
export function addStructuredData(slug: string) {
  const config = landingPageConfigs[slug as keyof typeof landingPageConfigs];
  if (!config) return;

  // Remove existing structured data for this slug
  const existingScript = document.querySelector(`script[data-slug="${slug}"]`);
  if (existingScript) {
    existingScript.remove();
  }

  // Generate schema markup
  let schemaData;
  
  if (config.schemaType === 'WebApplication') {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'The AM Project - Mental Fitness App for Men',
      description: config.description,
      url: `https://theamproject.com/landing/${slug}`,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        price: '9.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1247'
      }
    };
  } else if (config.schemaType === 'Course') {
    schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: config.title.split(' | ')[0],
      description: config.description,
      provider: {
        '@type': 'Organization',
        name: 'The AM Project',
        url: 'https://theamproject.com'
      },
      courseMode: 'online',
      educationalLevel: 'Intermediate',
      offers: {
        '@type': 'Offer',
        price: '9.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    };
  }

  if (schemaData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-slug', slug);
    script.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);
  }
}