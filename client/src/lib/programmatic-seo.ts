/**
 * Programmatic SEO System
 * Creates dynamic landing pages aligned with user searches and brand guidelines
 */

import { seoConfig } from './seo-config';
import { generateAdvancedSchema } from './seo-utils';

// Search query analysis and landing page generation
export interface SearchQuery {
  query: string;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  keywords: string[];
  demographics: string[];
  location?: string;
}

export interface DynamicLandingPage {
  url: string;
  title: string;
  description: string;
  heading: string;
  content: {
    hero: string;
    problem: string;
    solution: string;
    benefits: string[];
    cta: string;
  };
  schema: any;
  keywords: string[];
}

// Brand-aligned content templates using actual copy from the site
const brandTemplates = {
  colors: {
    primary: '#7C4A32', // Brown
    dark: '#0A0A0A',    // Dark Gray  
    cream: '#F5EDE1',   // Warm Cream
    gold: '#E4B768'     // Gold Accent
  },
  
  voice: {
    tone: 'direct, authentic, no-nonsense',
    style: 'practical, actionable, masculine',
    avoid: ['fluffy language', 'corporate speak', 'overly emotional']
  },

  messaging: {
    core: 'Redefining what it means to be a man',
    value_props: [
      'Build discipline that lasts',
      'Real results, not motivation', 
      'Community of men who get it',
      'AI coaching for tough decisions'
    ],
    hero_base: 'Redefining What It Means to Be a Man',
    subheading_base: 'The AM Project challenges you to become the man you were meant to be—mentally strong, emotionally intelligent, and purpose-driven.',
    cta_primary: 'Start Building Mental Fitness',
    cta_secondary: 'Join the Movement'
  }
};

// Dynamic landing page generator
export class ProgrammaticSEOGenerator {
  // Context-aware homepage adaptation
  private static generateHomepageCopy(searchQuery: SearchQuery) {
    const lowerQuery = searchQuery.query.toLowerCase();
    
    // Generate contextual tagline (the key part after "Like the gym—but for")
    let tagline = 'your mind.'; // default
    let description = 'A mental fitness app for men ready to build discipline, regain clarity, and reflect with purpose.';
    let focus = 'mental fitness and clarity';
    
    if (lowerQuery.includes('mental fitness') || lowerQuery.includes('therapy') || lowerQuery.includes('counseling')) {
      tagline = 'your mental strength.';
      description = 'A mental fitness app for men ready to build resilience, overcome challenges, and develop authentic strength.';
      focus = 'mental resilience and emotional regulation';
    } else if (lowerQuery.includes('discipline') || lowerQuery.includes('habit') || lowerQuery.includes('routine')) {
      tagline = 'your discipline.';
      description = 'A mental fitness app for men ready to build unshakeable discipline, master their habits, and create lasting change.';
      focus = 'discipline and habit formation';
    } else if (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('parent')) {
      tagline = 'your leadership.';
      description = 'A mental fitness app for fathers ready to build strength, lead their families, and model authentic masculinity.';
      focus = 'leadership and family strength';
    } else if (lowerQuery.includes('emotional intelligence') || lowerQuery.includes('relationships')) {
      tagline = 'your relationships.';
      description = 'A mental fitness app for men ready to build emotional intelligence, strengthen relationships, and communicate with purpose.';
      focus = 'emotional intelligence and relationship building';
    } else if (lowerQuery.includes('executive') || lowerQuery.includes('leader') || lowerQuery.includes('business')) {
      tagline = 'your leadership.';
      description = 'A mental fitness app for leaders ready to build mental clarity, make tough decisions, and lead with authentic strength.';
      focus = 'leadership and decision-making';
    } else if (lowerQuery.includes('personal development') || lowerQuery.includes('growth')) {
      tagline = 'your potential.';
      description = 'A mental fitness app for men ready to unlock their potential, build authentic strength, and create meaningful change.';
      focus = 'personal growth and self-mastery';
    }
    
    return {
      hero: `Like the gym—but for ${tagline}`,
      description,
      focus,
      tagline,
      whyNow: `Why ${focus} matters now`,
      finalCTA: `Ready to build ${focus}?`
    };
  }

  private static contentTemplates: Record<string, any> = {
    'default': {
      generateFromHomepage: true
    }
  };

  static generateLandingPage(searchQuery: SearchQuery): DynamicLandingPage {
    console.log('🎯 ProgrammaticSEOGenerator.generateLandingPage called with:', searchQuery);
    
    // Generate homepage-based copy
    const homepageCopy = this.generateHomepageCopy(searchQuery);
    console.log('🏠 Homepage copy generated:', homepageCopy);
    
    const demographics = this.analyzeDemographics(searchQuery);
    console.log('👥 Demographics analyzed:', demographics);
    
    return {
      url: this.generateURL(searchQuery),
      title: this.generateTitle(searchQuery, searchQuery.query),
      description: homepageCopy.description,
      heading: homepageCopy.hero,
      content: {
        hero: homepageCopy.hero,
        description: homepageCopy.description,
        focus: homepageCopy.focus,
        tagline: homepageCopy.tagline,
        whyNow: homepageCopy.whyNow,
        finalCTA: homepageCopy.finalCTA,
        benefits: [
          "Daily challenges that build real discipline",
          "AI coaching for the hard decisions",
          "Community of men who get it", 
          "Progress you can actually measure"
        ],
        cta: "Start Building Mental Fitness"
      },
      schema: this.generatePageSchema(searchQuery, homepageCopy),
      keywords: this.extractRelevantKeywords(searchQuery)
    };
  }

  private static identifyPrimaryKeyword(query: SearchQuery): string {
    // Match query against our target keywords
    const allKeywords = [
      ...seoConfig.keywords.primary,
      ...seoConfig.keywords.secondary,
      ...seoConfig.keywords.longTail
    ];

    for (const keyword of allKeywords) {
      if (query.query.toLowerCase().includes(keyword.toLowerCase())) {
        return keyword;
      }
    }

    // Fallback to most relevant template key
    const templateKeys = Object.keys(this.contentTemplates);
    for (const key of templateKeys) {
      if (query.query.toLowerCase().includes(key)) {
        return key;
      }
    }

    return seoConfig.keywords.primary[0]; // Default fallback
  }

  private static selectTemplate(keyword: string) {
    const templateKey = Object.keys(this.contentTemplates).find(key =>
      keyword.toLowerCase().includes(key)
    ) || 'personal development';

    return this.contentTemplates[templateKey as keyof typeof this.contentTemplates];
  }

  private static analyzeDemographics(query: SearchQuery): any {
    const demographics = {
      ageGroup: 'adult',
      profession: 'general',
      lifeStage: 'general',
      location: query.location || 'general'
    };

    // Age detection
    if (query.query.includes('young') || query.query.includes('20s')) {
      demographics.ageGroup = 'young_adult';
    } else if (query.query.includes('father') || query.query.includes('dad')) {
      demographics.lifeStage = 'father';
    } else if (query.query.includes('executive') || query.query.includes('leader')) {
      demographics.profession = 'executive';
    }

    return demographics;
  }

  private static generateURL(query: SearchQuery): string {
    const slug = query.query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    return `/landing/${slug}`;
  }

  private static generateTitle(query: SearchQuery, keyword: string): string {
    const location = query.location ? ` in ${query.location}` : '';
    const demographic = this.getDemographicModifier(query);
    
    return `${keyword}${demographic}${location} | The AM Project - Mental Fitness for Men`;
  }

  private static generateDescription(query: SearchQuery, keyword: string): string {
    const template = this.selectTemplate(keyword);
    const demographic = this.getDemographicModifier(query);
    const location = query.location ? ` Available in ${query.location}.` : '';
    
    return `${template.solution}${demographic}. ${template.benefits[0]} and ${template.benefits[1].toLowerCase()}. Free 7-day trial.${location}`.substring(0, 155);
  }

  private static getDemographicModifier(query: SearchQuery): string {
    if (query.query.includes('father') || query.query.includes('dad')) {
      return ' for fathers';
    }
    if (query.query.includes('executive') || query.query.includes('leader')) {
      return ' for leaders';
    }
    if (query.query.includes('young')) {
      return ' for young men';
    }
    return '';
  }

  private static personalizeHeading(hero: string, demographics: any): string {
    if (demographics.lifeStage === 'father') {
      return hero.replace('men who', 'fathers who');
    }
    if (demographics.profession === 'executive') {
      return hero.replace('men who', 'leaders who');
    }
    return hero;
  }

  private static personalizeContent(template: any, query: SearchQuery) {
    const demographics = this.analyzeDemographics(query);
    
    return {
      hero: this.personalizeHeading(template.hero, demographics),
      problem: this.localizeProblem(template.problem, query.location),
      solution: template.solution,
      benefits: template.benefits.map((benefit: string) => 
        this.personalizeBenefit(benefit, demographics)
      ),
      cta: this.personalizeCTA(template.cta, demographics)
    };
  }

  private static localizeProblem(problem: string, location?: string): string {
    if (!location) return problem;
    
    return problem.replace('Most men', `Men in ${location}`);
  }

  private static personalizeBenefit(benefit: string, demographics: any): string {
    if (demographics.lifeStage === 'father') {
      return benefit
        .replace('relationships', 'family relationships')
        .replace('leadership', 'parental leadership');
    }
    return benefit;
  }

  private static personalizeCTA(cta: string, demographics: any): string {
    if (demographics.lifeStage === 'father') {
      return cta.replace('men', 'fathers');
    }
    if (demographics.profession === 'executive') {
      return cta.replace('men', 'leaders');
    }
    return cta;
  }

  private static generatePageSchema(query: SearchQuery, template: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${query.query} | The AM Project`,
      description: template.solution,
      url: `${seoConfig.siteUrl}${this.generateURL(query)}`,
      mainEntity: {
        '@type': 'Service',
        name: 'The AM Project',
        description: seoConfig.organizationInfo.description,
        provider: {
          '@type': 'Organization',
          name: seoConfig.organizationInfo.name,
          url: seoConfig.siteUrl
        }
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: seoConfig.siteUrl
          },
          {
            '@type': 'ListItem', 
            position: 2,
            name: 'Landing Pages',
            item: `${seoConfig.siteUrl}/landing`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: query.query,
            item: `${seoConfig.siteUrl}${this.generateURL(query)}`
          }
        ]
      }
    };
  }

  private static extractRelevantKeywords(query: SearchQuery): string[] {
    const relevant = [];
    const allKeywords = [
      ...seoConfig.keywords.primary,
      ...seoConfig.keywords.secondary,
      ...seoConfig.keywords.longTail
    ];

    // Add query keywords
    relevant.push(...query.keywords);

    // Add matching SEO keywords
    allKeywords.forEach(keyword => {
      if (query.query.toLowerCase().includes(keyword.toLowerCase())) {
        relevant.push(keyword);
      }
    });

    // Add demographic keywords
    if (query.demographics) {
      relevant.push(...query.demographics);
    }

    return Array.from(new Set(relevant)); // Remove duplicates
  }
}

// Search intent analyzer
export function analyzeSearchIntent(query: string): SearchQuery {
  const lowerQuery = query.toLowerCase();
  
  let intent: SearchQuery['intent'] = 'informational';
  
  // Transactional intent
  if (lowerQuery.includes('buy') || lowerQuery.includes('subscribe') || 
      lowerQuery.includes('join') || lowerQuery.includes('sign up') ||
      lowerQuery.includes('trial') || lowerQuery.includes('download')) {
    intent = 'transactional';
  }
  // Commercial intent  
  else if (lowerQuery.includes('best') || lowerQuery.includes('review') ||
           lowerQuery.includes('compare') || lowerQuery.includes('vs') ||
           lowerQuery.includes('price') || lowerQuery.includes('cost')) {
    intent = 'commercial';
  }
  // Navigational intent
  else if (lowerQuery.includes('login') || lowerQuery.includes('dashboard') ||
           lowerQuery.includes('account') || lowerQuery.includes('profile')) {
    intent = 'navigational';
  }

  // Extract keywords
  const keywords = extractKeywords(query);
  const demographics = extractDemographics(query);
  const location = extractLocation(query);

  return {
    query,
    intent,
    keywords,
    demographics,
    location
  };
}

function extractKeywords(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return words.filter(word => 
    word.length > 2 && 
    !stopWords.includes(word) &&
    /^[a-z]+$/.test(word)
  );
}

function extractDemographics(query: string): string[] {
  const demographics = [];
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('father') || lowerQuery.includes('dad')) {
    demographics.push('fathers');
  }
  if (lowerQuery.includes('executive') || lowerQuery.includes('leader')) {
    demographics.push('executives');
  }
  if (lowerQuery.includes('young')) {
    demographics.push('young men');
  }
  if (lowerQuery.includes('professional')) {
    demographics.push('professionals');
  }

  return demographics;
}

function extractLocation(query: string): string | undefined {
  // Simple location extraction - could be enhanced with NLP
  const locationPatterns = [
    /in ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/,
    /near ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s(?:area|region)/
  ];

  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

// Landing page cache for performance
export class LandingPageCache {
  private static cache = new Map<string, DynamicLandingPage>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static get(queryKey: string): DynamicLandingPage | null {
    const expiry = this.cacheExpiry.get(queryKey);
    
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(queryKey);
      this.cacheExpiry.delete(queryKey);
      return null;
    }

    return this.cache.get(queryKey) || null;
  }

  static set(queryKey: string, landingPage: DynamicLandingPage): void {
    this.cache.set(queryKey, landingPage);
    this.cacheExpiry.set(queryKey, Date.now() + this.CACHE_DURATION);
  }

  static clear(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// Initialize programmatic SEO
export function initializeProgrammaticSEO() {
  console.log('🎯 Programmatic SEO System Initialized');
  console.log(`📊 Template Coverage: ${Object.keys(ProgrammaticSEOGenerator['contentTemplates']).length} content types`);
  console.log(`🔍 Keyword Targeting: ${seoConfig.keywords.primary.length + seoConfig.keywords.secondary.length + seoConfig.keywords.longTail.length} keywords`);
}