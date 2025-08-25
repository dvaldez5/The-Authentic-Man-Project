/**
 * SEO Utilities and Auto-Optimization System
 * Handles dynamic SEO updates and content optimization
 */

import { seoConfig, pageConfigs, calculateSEOScore, getBlogPostSEO } from './seo-config';

// Auto-updating SEO optimization
export class SEOOptimizer {
  private static instance: SEOOptimizer;
  private contentChangeCallbacks: Set<() => void> = new Set();

  static getInstance(): SEOOptimizer {
    if (!SEOOptimizer.instance) {
      SEOOptimizer.instance = new SEOOptimizer();
    }
    return SEOOptimizer.instance;
  }

  // Register callback for content changes
  onContentChange(callback: () => void) {
    this.contentChangeCallbacks.add(callback);
  }

  // Trigger SEO optimization when content changes
  triggerOptimization() {
    this.contentChangeCallbacks.forEach(callback => callback());
  }

  // Auto-optimize page SEO
  optimizePage(pagePath: string, content?: any) {
    const config = pageConfigs[pagePath as keyof typeof pageConfigs];
    if (!config) return null;

    const optimization = calculateSEOScore(
      config.title,
      config.description,
      content?.content
    );

    // Auto-apply improvements
    return this.applyOptimizations(config, optimization.suggestions);
  }

  private applyOptimizations(config: any, suggestions: string[]) {
    let optimizedConfig = { ...config };

    suggestions.forEach(suggestion => {
      if (suggestion.includes('Title should be')) {
        optimizedConfig.title = this.optimizeTitle(config.title);
      }
      if (suggestion.includes('Meta description should be')) {
        optimizedConfig.description = this.optimizeDescription(config.description);
      }
      if (suggestion.includes('Include primary keywords')) {
        optimizedConfig = this.addKeywords(optimizedConfig);
      }
    });

    return optimizedConfig;
  }

  private optimizeTitle(title: string): string {
    if (title.length > 60) {
      return title.substring(0, 57) + "...";
    }
    if (title.length < 30) {
      const primaryKeyword = seoConfig.keywords.primary[0];
      return `${title} | ${primaryKeyword}`;
    }
    return title;
  }

  private optimizeDescription(description: string): string {
    if (description.length > 155) {
      return description.substring(0, 152) + "...";
    }
    if (description.length < 140) {
      const keyword = seoConfig.keywords.primary[0];
      return `${description} ${keyword} program for modern men.`;
    }
    return description;
  }

  private addKeywords(config: any) {
    const primaryKeyword = seoConfig.keywords.primary[0];
    
    if (!config.title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      config.title = `${config.title} - ${primaryKeyword}`;
    }
    
    if (!config.description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      config.description = `${config.description} ${primaryKeyword}.`;
    }

    return config;
  }
}

// Advanced Schema Markup Generator
export function generateAdvancedSchema(type: string, data: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type
  };

  switch (type) {
    case 'Course':
      return {
        ...baseSchema,
        name: data.name,
        description: data.description,
        provider: {
          '@type': 'Organization',
          name: seoConfig.organizationInfo.name,
          url: seoConfig.siteUrl
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          instructor: {
            '@type': 'Person',
            name: seoConfig.author.name
          }
        },
        educationalCredentialAwarded: data.credential,
        timeRequired: data.duration
      };

    case 'FAQPage':
      return {
        ...baseSchema,
        mainEntity: data.faqs.map((faq: any) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };

    case 'Review':
      return {
        ...baseSchema,
        itemReviewed: {
          '@type': 'Service',
          name: seoConfig.siteName
        },
        author: {
          '@type': 'Person',
          name: data.author
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: data.rating,
          bestRating: 5
        },
        reviewBody: data.review
      };

    case 'WebApplication':
      return {
        ...baseSchema,
        name: seoConfig.siteName,
        description: seoConfig.organizationInfo.description,
        url: seoConfig.siteUrl,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '9.99',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'RecurringPaymentPlan',
            frequency: 'monthly'
          }
        },
        author: {
          '@type': 'Organization',
          name: seoConfig.organizationInfo.name
        }
      };

    default:
      return baseSchema;
  }
}

// Content freshness tracking
export class ContentFreshnessTracker {
  private static lastUpdated: Map<string, Date> = new Map();

  static markUpdated(contentId: string) {
    this.lastUpdated.set(contentId, new Date());
    
    // Trigger SEO optimization for fresh content
    SEOOptimizer.getInstance().triggerOptimization();
  }

  static getLastUpdated(contentId: string): Date | null {
    return this.lastUpdated.get(contentId) || null;
  }

  static isContentFresh(contentId: string, maxAgeHours: number = 24): boolean {
    const lastUpdate = this.getLastUpdated(contentId);
    if (!lastUpdate) return false;

    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    return (Date.now() - lastUpdate.getTime()) < maxAge;
  }

  static getFreshnessScore(contentId: string): number {
    const lastUpdate = this.getLastUpdated(contentId);
    if (!lastUpdate) return 0;

    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    // Fresh content scores higher
    if (hoursSinceUpdate <= 24) return 100;
    if (hoursSinceUpdate <= 168) return 80; // 1 week
    if (hoursSinceUpdate <= 720) return 60; // 1 month
    if (hoursSinceUpdate <= 2160) return 40; // 3 months
    return 20;
  }
}

// SEO Performance Analyzer
export class SEOAnalyzer {
  static analyzePage(url: string, content: string, title: string, description: string) {
    const analysis = {
      url,
      score: 0,
      issues: [] as string[],
      recommendations: [] as string[],
      keywords: {
        primary: 0,
        secondary: 0,
        density: new Map<string, number>()
      },
      technical: {
        titleLength: title.length,
        descriptionLength: description.length,
        contentLength: content.split(/\s+/).length,
        headingStructure: this.analyzeHeadings(content)
      }
    };

    // Analyze keyword usage
    seoConfig.keywords.primary.forEach(keyword => {
      const occurrences = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (occurrences / analysis.technical.contentLength) * 100;
      
      analysis.keywords.density.set(keyword, density);
      
      if (occurrences > 0) {
        analysis.keywords.primary++;
        analysis.score += 10;
      }

      if (density < 1) {
        analysis.recommendations.push(`Increase "${keyword}" keyword density (current: ${density.toFixed(1)}%)`);
      } else if (density > 3) {
        analysis.issues.push(`"${keyword}" keyword density too high (${density.toFixed(1)}%)`);
      }
    });

    // Title analysis
    if (analysis.technical.titleLength < 30 || analysis.technical.titleLength > 60) {
      analysis.issues.push(`Title length should be 30-60 characters (current: ${analysis.technical.titleLength})`);
    } else {
      analysis.score += 15;
    }

    // Description analysis  
    if (analysis.technical.descriptionLength < 140 || analysis.technical.descriptionLength > 155) {
      analysis.issues.push(`Meta description should be 140-155 characters (current: ${analysis.technical.descriptionLength})`);
    } else {
      analysis.score += 15;
    }

    // Content length
    if (analysis.technical.contentLength < 300) {
      analysis.issues.push(`Content too short (${analysis.technical.contentLength} words). Aim for 300+ words.`);
    } else {
      analysis.score += 10;
    }

    // Heading structure
    if (analysis.technical.headingStructure.h1 !== 1) {
      analysis.issues.push(`Should have exactly 1 H1 tag (found: ${analysis.technical.headingStructure.h1})`);
    } else {
      analysis.score += 10;
    }

    return analysis;
  }

  private static analyzeHeadings(content: string) {
    return {
      h1: (content.match(/<h1/g) || []).length,
      h2: (content.match(/<h2/g) || []).length,
      h3: (content.match(/<h3/g) || []).length,
      h4: (content.match(/<h4/g) || []).length
    };
  }
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(path: string): any {
  const pathParts = path.split('/').filter(Boolean);
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: seoConfig.siteUrl
    }
  ];

  let currentPath = seoConfig.siteUrl;
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    breadcrumbs.push({
      '@type': 'ListItem',
      position: index + 2,
      name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      item: currentPath
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
  };
}

// Initialize SEO system
export function initializeSEO() {
  const optimizer = SEOOptimizer.getInstance();
  
  // Auto-optimize on content changes
  optimizer.onContentChange(() => {
    console.log('🔄 SEO Auto-optimization triggered');
  });

  // Track content freshness
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Mark current page as updated
      ContentFreshnessTracker.markUpdated(window.location.pathname);
    });
  }

  console.log('✅ SEO System Initialized');
}