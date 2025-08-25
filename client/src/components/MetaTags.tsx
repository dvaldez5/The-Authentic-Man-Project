import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * A component that dynamically updates the document's meta tags for SEO and social sharing
 * Optimized for men's mental fitness, wellness, and personal development searches
 */
const MetaTags = ({ 
  title, 
  description, 
  image, 
  url = typeof window !== 'undefined' ? window.location.href : '', 
  type = 'website' 
}: MetaTagsProps) => {
  
  useEffect(() => {
    // Set the document title
    document.title = title;
    
    // Helper function to create or update meta tags
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || 
                document.querySelector(`meta[property="${name}"]`);
                
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Set basic meta tags
    setMetaTag('description', description);
    
    // Set Open Graph meta tags
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:url', url);
    setMetaTag('og:type', type);
    
    if (image) {
      // Make sure image URL is absolute
      const absoluteImageUrl = image.startsWith('http') 
        ? image 
        : (typeof window !== 'undefined' 
            ? `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}` 
            : image);
      
      setMetaTag('og:image', absoluteImageUrl);
      setMetaTag('twitter:image', absoluteImageUrl);
    }
    
    // Set Twitter Card meta tags
    setMetaTag('twitter:card', image ? 'summary_large_image' : 'summary');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    
    // Clean up meta tags when the component unmounts
    return () => {
      // Optional: If you want to clean up meta tags on unmount, add logic here
      // We typically don't remove these tags because they should be replaced by the next page
    };
  }, [title, description, image, url, type]);
  
  // This component doesn't render anything visible
  return null;
};

export default MetaTags;