// Server-side programmatic SEO utilities for dynamic landing pages
import { Request, Response } from 'express';

// Define landing page configurations
export const landingPageConfigs = {
  'mens-mental-fitness-app': {
    keywords: ['mental fitness', 'anxiety', 'stress', 'mental well-being', 'emotional resilience'],
    title: 'Mental Fitness App for Men | Build Emotional Strength | The AM Project',
    description: 'Transform your mental fitness with The AM Project. Build emotional resilience, manage stress, and develop unshakeable mental strength with our proven system for men.',
    h1: 'Build Unshakeable Mental Strength',
    schemaType: 'WebApplication',
    category: 'Mental Fitness'
  },
  'discipline-building-program': {
    keywords: ['discipline', 'habits', 'self control', 'willpower', 'consistency'],
    title: 'Discipline Building Program for Men | Master Your Habits | The AM Project',
    description: 'Master discipline and build lasting habits with The AM Project. Our proven system helps men develop unshakeable self-control and consistent growth.',
    h1: 'Master Your Discipline',
    schemaType: 'Course',
    category: 'Personal Development'
  },
  'executive-leadership-training': {
    keywords: ['leadership', 'executive', 'business', 'management', 'authority'],
    title: 'Executive Leadership Training for Men | Build Authority | The AM Project',
    description: 'Develop authentic leadership and executive presence with The AM Project. Build authority, make better decisions, and lead with integrity.',
    h1: 'Lead with Authentic Authority',
    schemaType: 'Course',
    category: 'Leadership'
  },
  'fatherhood-coaching': {
    keywords: ['fatherhood', 'parenting', 'dad', 'family', 'father'],
    title: 'Fatherhood Coaching for Men | Be a Better Father | The AM Project',
    description: 'Become the father your family needs with The AM Project. Build parenting skills, family leadership, and intentional fatherhood habits.',
    h1: 'Build the Fatherhood Strength Your Family Needs',
    schemaType: 'Course',
    category: 'Family & Parenting'
  }
};

// Generate dynamic meta tags for each landing page
export function generateMetaTags(slug: string) {
  const config = landingPageConfigs[slug as keyof typeof landingPageConfigs];
  if (!config) return null;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords.join(', '),
    ogTitle: config.title,
    ogDescription: config.description,
    ogType: 'website',
    ogImage: 'https://theamproject.com/images/og-image.jpg',
    twitterCard: 'summary_large_image',
    twitterTitle: config.title,
    twitterDescription: config.description,
    canonical: `https://theamproject.com/landing/${slug}`
  };
}

// Generate structured data (schema markup) for each page type
export function generateSchemaMarkup(slug: string) {
  const config = landingPageConfigs[slug as keyof typeof landingPageConfigs];
  if (!config) return null;

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The AM Project',
    url: 'https://theamproject.com',
    logo: 'https://theamproject.com/images/logo.svg',
    description: 'A mental fitness platform for men focused on building discipline, clarity, and purpose.',
    sameAs: [
      'https://twitter.com/theamproject',
      'https://linkedin.com/company/theamproject'
    ]
  };

  if (config.schemaType === 'WebApplication') {
    return {
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
        priceValidUntil: '2025-12-31',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1247'
      }
    };
  }

  if (config.schemaType === 'Course') {
    return {
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

  return baseSchema;
}

// Generate FAQ schema for landing pages
export function generateFAQSchema(slug: string) {
  const faqs = {
    'mens-mental-health-app': [
      {
        question: 'How does The AM Project help with mental fitness?',
        answer: 'The AM Project provides daily mental fitness challenges, AI coaching, and a supportive community to help men build emotional resilience and manage stress effectively.'
      },
      {
        question: 'Is this app specifically designed for men?',
        answer: 'Yes, The AM Project is built by men, for men, addressing the unique mental fitness challenges that men face in today\'s world.'
      },
      {
        question: 'What makes this different from therapy?',
        answer: 'We focus on practical mental fitness training rather than traditional therapy, providing tools and challenges that build mental strength daily.'
      }
    ],
    'discipline-building-program': [
      {
        question: 'How does The AM Project build discipline?',
        answer: 'Our system provides daily discipline challenges, habit tracking, and AI coaching to help you develop unshakeable self-control and consistency.'
      },
      {
        question: 'How long does it take to see results?',
        answer: 'Most men report feeling more disciplined within the first week, with significant habit changes typically occurring within 30 days.'
      }
    ],
    'executive-leadership-training': [
      {
        question: 'Who is this leadership training for?',
        answer: 'Our program is designed for executives, managers, and emerging leaders who want to develop authentic authority and decision-making skills.'
      },
      {
        question: 'How does this differ from other leadership programs?',
        answer: 'We focus on building inner strength and character first, then developing external leadership skills that are sustainable and authentic.'
      }
    ],
    'fatherhood-coaching': [
      {
        question: 'What does fatherhood coaching include?',
        answer: 'Our program provides parenting challenges, family leadership guidance, and a community of committed fathers working to be better dads.'
      },
      {
        question: 'Is this suitable for new fathers?',
        answer: 'Yes, our program works for fathers at any stage - from expecting dads to experienced fathers looking to improve their family leadership.'
      }
    ]
  };

  const pageFAQs = faqs[slug as keyof typeof faqs] || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Server-side route handler for dynamic landing pages
export function handleLandingPage(req: Request, res: Response) {
  const { slug } = req.params;
  const config = landingPageConfigs[slug as keyof typeof landingPageConfigs];

  if (!config) {
    return res.status(404).send('Landing page not found');
  }

  const metaTags = generateMetaTags(slug);
  const schemaMarkup = generateSchemaMarkup(slug);
  const faqSchema = generateFAQSchema(slug);

  // Generate the HTML with proper meta tags and schema
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaTags?.title}</title>
    <meta name="description" content="${metaTags?.description}">
    <meta name="keywords" content="${metaTags?.keywords}">
    <link rel="canonical" href="${metaTags?.canonical}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${metaTags?.ogTitle}">
    <meta property="og:description" content="${metaTags?.ogDescription}">
    <meta property="og:type" content="${metaTags?.ogType}">
    <meta property="og:url" content="${metaTags?.canonical}">
    <meta property="og:image" content="${metaTags?.ogImage}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="${metaTags?.twitterCard}">
    <meta name="twitter:title" content="${metaTags?.twitterTitle}">
    <meta name="twitter:description" content="${metaTags?.twitterDescription}">
    
    <!-- Schema Markup -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaMarkup, null, 2)}
    </script>
    
    <!-- FAQ Schema -->
    <script type="application/ld+json">
    ${JSON.stringify(faqSchema, null, 2)}
    </script>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/assets/index.css" as="style">
    <link rel="preload" href="/assets/index.js" as="script">
    
    <!-- CSS -->
    <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
    <div id="root">
        <!-- Initial content for SEO -->
        <header>
            <nav>
                <h1>${config.h1}</h1>
            </nav>
        </header>
        <main>
            <section>
                <h1>${config.h1}</h1>
                <p>${metaTags?.description}</p>
            </section>
        </main>
    </div>
    
    <!-- React app will hydrate this -->
    <script src="/assets/index.js"></script>
    <script>
        // Pass the landing page data to the client
        window.__LANDING_PAGE_DATA__ = {
            slug: "${slug}",
            config: ${JSON.stringify(config)}
        };
    </script>
</body>
</html>`;

  res.send(html);
}

// Generate sitemap for all landing pages
export function generateSitemap() {
  const baseUrl = 'https://theamproject.com';
  const currentDate = new Date().toISOString().split('T')[0];

  const sitemapEntries = Object.keys(landingPageConfigs).map(slug => {
    return `  <url>
    <loc>${baseUrl}/landing/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;
}