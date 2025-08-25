import React from 'react';
import { useEffect } from 'react';

interface OrganizationStructuredDataProps {
  url: string;
  logo: string;
  name: string;
  description: string;
  sameAs?: string[];
}

export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({
  url,
  logo,
  name,
  description,
  sameAs = []
}) => {
  useEffect(() => {
    // Create the JSON-LD script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    // Organization structured data
    const organizationData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      url,
      logo,
      name,
      description,
      sameAs
    };
    
    script.innerHTML = JSON.stringify(organizationData);
    
    // Add an ID to make it replaceable if the component re-renders
    script.id = 'organization-structured-data';
    
    // Remove any existing script with the same ID
    const existingScript = document.getElementById('organization-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add the script to the document head
    document.head.appendChild(script);
    
    // Clean up function
    return () => {
      const scriptToRemove = document.getElementById('organization-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [url, logo, name, description, sameAs]);
  
  // This component doesn't render anything visible
  return null;
};

interface WebPageStructuredDataProps {
  url: string;
  name: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export const WebPageStructuredData: React.FC<WebPageStructuredDataProps> = ({
  url,
  name,
  description,
  image,
  datePublished,
  dateModified
}) => {
  useEffect(() => {
    // Create the JSON-LD script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    // WebPage structured data
    const webPageData: any = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url,
      name,
      description
    };
    
    // Add optional properties if they exist
    if (image) webPageData.image = image;
    if (datePublished) webPageData.datePublished = datePublished;
    if (dateModified) webPageData.dateModified = dateModified;
    
    script.innerHTML = JSON.stringify(webPageData);
    
    // Add an ID to make it replaceable if the component re-renders
    script.id = 'webpage-structured-data';
    
    // Remove any existing script with the same ID
    const existingScript = document.getElementById('webpage-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add the script to the document head
    document.head.appendChild(script);
    
    // Clean up function
    return () => {
      const scriptToRemove = document.getElementById('webpage-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [url, name, description, image, datePublished, dateModified]);
  
  // This component doesn't render anything visible
  return null;
};

interface ArticleStructuredDataProps {
  url: string;
  title: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  description: string;
  publisher: {
    name: string;
    logo: string;
  };
}

export const ArticleStructuredData: React.FC<ArticleStructuredDataProps> = ({
  url,
  title,
  image,
  datePublished,
  dateModified,
  author,
  description,
  publisher
}) => {
  useEffect(() => {
    // Create the JSON-LD script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    // Article structured data
    const articleData: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image,
      datePublished,
      author: {
        '@type': 'Person',
        name: author
      },
      publisher: {
        '@type': 'Organization',
        name: publisher.name,
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url
      }
    };
    
    // Add optional properties if they exist
    if (dateModified) articleData.dateModified = dateModified;
    
    script.innerHTML = JSON.stringify(articleData);
    
    // Add an ID to make it replaceable if the component re-renders
    script.id = 'article-structured-data';
    
    // Remove any existing script with the same ID
    const existingScript = document.getElementById('article-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add the script to the document head
    document.head.appendChild(script);
    
    // Clean up function
    return () => {
      const scriptToRemove = document.getElementById('article-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [url, title, image, datePublished, dateModified, author, description, publisher]);
  
  // This component doesn't render anything visible
  return null;
};

export default {
  OrganizationStructuredData,
  WebPageStructuredData,
  ArticleStructuredData
};