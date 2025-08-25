import React, { useEffect } from 'react';

interface CanonicalLinkProps {
  path: string;
}

/**
 * Creates a canonical link element in the document head
 * Canonical links help prevent duplicate content issues by specifying the "official" URL of a page
 */
const CanonicalLink: React.FC<CanonicalLinkProps> = ({ path }) => {
  useEffect(() => {
    // Get base domain from window or use a default for server-side rendering
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://theamproject.com';
    
    // Create or update canonical link
    let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.rel = 'canonical';
      document.head.appendChild(linkElement);
    }
    
    // Ensure the path starts with a slash if it's not an absolute URL
    const canonicalPath = path.startsWith('http') 
      ? path
      : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    
    linkElement.href = canonicalPath;
    
    // Clean up
    return () => {
      // Optional: remove if needed
      // const link = document.querySelector('link[rel="canonical"]');
      // if (link) link.remove();
    };
  }, [path]);
  
  // This component doesn't render anything visible
  return null;
};

export default CanonicalLink;