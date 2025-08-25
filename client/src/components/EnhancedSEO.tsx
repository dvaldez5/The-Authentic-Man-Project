/**
 * Enhanced SEO Component with Auto-Optimization
 * Integrates with the new SEO system for dynamic optimization
 */

import React, { useEffect, useState } from 'react';
import MetaTags from './MetaTags';
import CanonicalLink from './CanonicalLink';
import { OrganizationStructuredData, WebPageStructuredData } from './StructuredData';
import { seoConfig, generateDynamicMeta, getBlogPostSEO } from '@/lib/seo-config';
import { SEOOptimizer, generateAdvancedSchema, ContentFreshnessTracker } from '@/lib/seo-utils';

interface EnhancedSEOProps {
  pagePath: string;
  customData?: any;
  blogPost?: any;
  enableAutoOptimization?: boolean;
  children?: React.ReactNode;
}

/**
 * Enhanced SEO component that automatically optimizes SEO based on content changes
 */
const EnhancedSEO: React.FC<EnhancedSEOProps> = ({
  pagePath,
  customData,
  blogPost,
  enableAutoOptimization = true,
  children
}) => {
  const [optimizedMeta, setOptimizedMeta] = useState<any>(null);
  const [seoScore, setSEOScore] = useState<number>(0);

  useEffect(() => {
    // Generate initial meta data
    let meta;
    if (blogPost) {
      meta = getBlogPostSEO(blogPost);
    } else {
      meta = generateDynamicMeta(pagePath, customData);
    }

    // Apply auto-optimization if enabled
    if (enableAutoOptimization) {
      const optimizer = SEOOptimizer.getInstance();
      const optimized = optimizer.optimizePage(pagePath, { content: blogPost?.content || '' });
      
      if (optimized) {
        meta = { ...meta, ...optimized };
      }
    }

    setOptimizedMeta(meta);

    // Mark content as fresh
    ContentFreshnessTracker.markUpdated(`${pagePath}-${Date.now()}`);

    // Calculate SEO score
    if (meta) {
      // Simple scoring based on title and description length
      let score = 0;
      if (meta.title && meta.title.length >= 30 && meta.title.length <= 60) score += 40;
      if (meta.description && meta.description.length >= 140 && meta.description.length <= 155) score += 40;
      if (meta.keywords && meta.keywords.length > 0) score += 20;
      setSEOScore(score);
    }

    // Listen for content changes
    if (enableAutoOptimization) {
      const optimizer = SEOOptimizer.getInstance();
      const handleOptimization = () => {
        console.log('🔄 Auto-optimizing SEO for:', pagePath);
        const reOptimized = optimizer.optimizePage(pagePath, { content: blogPost?.content || '' });
        if (reOptimized) {
          setOptimizedMeta((prev: any) => ({ ...prev, ...reOptimized }));
        }
      };

      optimizer.onContentChange(handleOptimization);
    }
  }, [pagePath, customData, blogPost, enableAutoOptimization]);

  if (!optimizedMeta) return null;

  return (
    <>
      {/* Core SEO Tags */}
      <MetaTags
        title={optimizedMeta.title}
        description={optimizedMeta.description}
        image={optimizedMeta.image}
        url={optimizedMeta.url}
        type={optimizedMeta.type}
      />

      {/* Canonical Link */}
      <CanonicalLink path={pagePath} />

      {/* Organization Schema (for home page) */}
      {pagePath === 'home' && (
        <OrganizationStructuredData
          url={seoConfig.siteUrl}
          logo={seoConfig.organizationInfo.logo}
          name={seoConfig.organizationInfo.name}
          description={seoConfig.organizationInfo.description}
          sameAs={seoConfig.organizationInfo.sameAs}
        />
      )}

      {/* Web Page Schema */}
      <WebPageStructuredData
        url={optimizedMeta.url}
        name={optimizedMeta.title}
        description={optimizedMeta.description}
        image={optimizedMeta.image}
        datePublished={optimizedMeta.publishedTime}
        dateModified={optimizedMeta.modifiedTime}
      />

      {/* Advanced Schema Markup */}
      {blogPost && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateAdvancedSchema('Article', {
              headline: blogPost.title,
              description: blogPost.excerpt,
              image: blogPost.imageUrl,
              datePublished: blogPost.date,
              author: seoConfig.author.name,
              publisher: seoConfig.organizationInfo
            }))
          }}
        />
      )}

      {/* FAQ Schema for specific pages */}
      {pagePath === 'about' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateAdvancedSchema('FAQPage', {
              faqs: [
                {
                  question: "What is The AM Project?",
                  answer: "The AM Project is a mental fitness program designed specifically for men, focusing on building discipline, purpose, and psychological strength through daily challenges and AI coaching."
                },
                {
                  question: "How does The AM Project help with men's mental fitness?",
                  answer: "We provide practical tools, daily challenges, community support, and AI-powered coaching specifically designed for how men process emotions and build mental strength."
                },
                {
                  question: "Who founded The AM Project?",
                  answer: "The AM Project was founded by Daniel Valdez, a veteran, firefighter, MBA, and father of five who understands the unique challenges men face."
                }
              ]
            }))
          }}
        />
      )}

      {/* Service Schema for main pages */}
      {(pagePath === 'home' || pagePath === 'join') && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateAdvancedSchema('WebApplication', {}))
          }}
        />
      )}

      {/* SEO Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.group('🎯 SEO Debug Info');
              console.log('Page:', '${pagePath}');
              console.log('SEO Score:', ${seoScore}/100);
              console.log('Title Length:', ${optimizedMeta.title?.length || 0});
              console.log('Description Length:', ${optimizedMeta.description?.length || 0});
              console.log('Keywords:', ${JSON.stringify(optimizedMeta.keywords || [])});
              console.log('Auto-Optimization:', ${enableAutoOptimization});
              console.groupEnd();
            `
          }}
        />
      )}

      {children}
    </>
  );
};

export default EnhancedSEO;