/**
 * Centralized SEO Configuration System
 * Auto-updating SEO optimization with dynamic content support
 */

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  organizationInfo: {
    name: string;
    description: string;
    logo: string;
    sameAs: string[];
  };
  author: {
    name: string;
    url: string;
    image: string;
  };
  social: {
    twitter: string;
    facebook: string;
    linkedin: string;
  };
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
}

// Central SEO configuration with brand alignment
export const seoConfig: SEOConfig = {
  siteName: "The AM Project",
  siteUrl: "https://theamproject.com",
  defaultImage: "https://theamproject.com/am-logo.png",
  
  organizationInfo: {
    name: "The AM Project",
    description: "Mental fitness app for men. Build discipline, purpose, and psychological strength through daily challenges, AI coaching, and community support.",
    logo: "https://theamproject.com/am-logo.png",
    sameAs: [
      "https://twitter.com/theamproject",
      "https://facebook.com/theamproject",
      "https://linkedin.com/company/theamproject"
    ]
  },

  author: {
    name: "Daniel Valdez",
    url: "https://theamproject.com/about",
    image: "https://theamproject.com/founder-web.jpg"
  },

  social: {
    twitter: "@theamproject",
    facebook: "theamproject", 
    linkedin: "company/theamproject"
  },

  keywords: {
    primary: [
      "men's mental fitness app",
      "mental fitness for men",
      "men's personal development", 
      "masculine psychology program",
      "men's wellness platform"
    ],
    secondary: [
      "discipline building program",
      "men's emotional intelligence",
      "personal growth coaching",
      "male psychology development",
      "men's lifestyle improvement"
    ],
    longTail: [
      "mental fitness app for modern men",
      "men's personal development with AI coaching", 
      "discipline building program for men",
      "men's mental fitness subscription service",
      "masculine strength training psychology",
      "emotional wellness program for fathers",
      "professional development for men",
      "mental resilience training program"
    ]
  }
};

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: "The AM Project - Mental Fitness App for Men | Build Discipline & Purpose",
    description: "Transform your mental strength with The AM Project. Daily challenges, AI coaching, and community support for men serious about personal growth. Free 7-day trial.",
    keywords: [
      "men's mental fitness app",
      "mental fitness for men", 
      "personal development program",
      "discipline building app",
      "men's wellness coaching"
    ],
    type: "website",
    priority: 1.0
  },

  about: {
    title: "About Us | The AM Project - Our Mission and Values",
    description: "Learn about The AM Project's mission to help men build mental fitness, discipline, and purpose. Founded by Daniel Valdez, veteran and father of five.",
    keywords: [
      "about the am project",
      "men's mental fitness mission",
      "daniel valdez founder",
      "veteran mental fitness",
      "men's personal development story"
    ],
    type: "website", 
    priority: 0.8
  },

  blog: {
    title: "Blog | The AM Project - Men's Mental Fitness & Personal Development",
    description: "Expert insights on men's mental fitness, personal development, and building masculine strength. Practical strategies for modern men.",
    keywords: [
      "men's mental fitness blog",
      "personal development articles",
      "masculine strength content",
      "men's psychology insights",
      "mental fitness advice"
    ],
    type: "website",
    priority: 0.9
  },

  join: {
    title: "Join The AM Project | Men's Mental Fitness Program",
    description: "Start building mental fitness today. Join thousands of men developing discipline, purpose, and psychological strength. Free 7-day trial included.",
    keywords: [
      "join men's mental fitness program",
      "sign up personal development",
      "men's wellness membership", 
      "mental fitness subscription",
      "discipline building community"
    ],
    type: "website",
    priority: 1.0
  },

  'am-standard': {
    title: "The AM Standard | Core Principles for Men's Development",
    description: "Discover the 8 core principles of The AM Standard: Self, Family, Partner, Friends, Community, Financial, Purpose, and Play. Your blueprint for masculine excellence.",
    keywords: [
      "am standard principles",
      "men's development framework", 
      "masculine excellence guide",
      "personal development standards",
      "men's life philosophy"
    ],
    type: "article",
    priority: 0.9
  }
};

// Dynamic SEO for blog posts
export function getBlogPostSEO(post: any) {
  return {
    title: `${post.title} | The AM Project`,
    description: post.excerpt.length > 155 
      ? post.excerpt.substring(0, 152) + "..."
      : post.excerpt,
    keywords: [
      ...extractKeywordsFromContent(post.title),
      ...extractKeywordsFromContent(post.excerpt),
      post.category,
      "men's mental fitness",
      "personal development"
    ],
    type: "article",
    image: post.imageUrl,
    publishedTime: post.date,
    author: seoConfig.author.name,
    section: post.category,
    tags: [post.category, "men's health", "personal development"]
  };
}

// Keyword extraction utility
function extractKeywordsFromContent(content: string): string[] {
  const keywords: string[] = [];
  const targetKeywords = [
    ...seoConfig.keywords.primary,
    ...seoConfig.keywords.secondary,
    ...seoConfig.keywords.longTail
  ];

  targetKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });

  return keywords;
}

// SEO optimization scoring
export function calculateSEOScore(title: string, description: string, content?: string): {
  score: number;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  // Title optimization
  if (title.length >= 30 && title.length <= 60) {
    score += 20;
  } else {
    suggestions.push(`Title should be 30-60 characters (current: ${title.length})`);
  }

  // Description optimization
  if (description.length >= 140 && description.length <= 155) {
    score += 20;
  } else {
    suggestions.push(`Meta description should be 140-155 characters (current: ${description.length})`);
  }

  // Keyword presence
  const keywordFound = seoConfig.keywords.primary.some(keyword =>
    title.toLowerCase().includes(keyword.toLowerCase()) ||
    description.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (keywordFound) {
    score += 30;
  } else {
    suggestions.push("Include primary keywords in title or description");
  }

  // Content optimization (if provided)
  if (content) {
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300) {
      score += 20;
    } else {
      suggestions.push(`Content should be at least 300 words (current: ${wordCount})`);
    }

    // Keyword density check
    const keywordDensity = calculateKeywordDensity(content, seoConfig.keywords.primary[0]);
    if (keywordDensity >= 1 && keywordDensity <= 3) {
      score += 10;
    } else {
      suggestions.push(`Keyword density should be 1-3% (current: ${keywordDensity.toFixed(1)}%)`);
    }
  }

  return { score, suggestions };
}

// Keyword density calculator
function calculateKeywordDensity(content: string, keyword: string): number {
  const words = content.toLowerCase().split(/\s+/).length;
  const keywordOccurrences = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  return (keywordOccurrences / words) * 100;
}

// Generate dynamic meta tags
export function generateDynamicMeta(pagePath: string, customData?: any) {
  const baseConfig = pageConfigs[pagePath as keyof typeof pageConfigs] || pageConfigs.home;
  
  return {
    title: customData?.title || baseConfig.title,
    description: customData?.description || baseConfig.description,
    keywords: [...(baseConfig.keywords || []), ...(customData?.keywords || [])],
    type: customData?.type || baseConfig.type,
    image: customData?.image || seoConfig.defaultImage,
    url: `${seoConfig.siteUrl}${pagePath === 'home' ? '' : `/${pagePath}`}`,
    siteName: seoConfig.siteName,
    ...customData
  };
}