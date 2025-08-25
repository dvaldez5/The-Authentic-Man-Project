import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blog';
import NewsletterCTA from '@/components/NewsletterCTA';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { WebPageStructuredData } from '@/components/StructuredData';
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';

type Category = 'all' | 'self' | 'family' | 'partner' | 'friends' | 'community' | 'financial' | 'purpose' | 'play' | 'learning';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    { delay: 3000 }
  );

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category.toLowerCase() === selectedCategory);

  return (
    <div className="pt-20">
      <MetaTags
        title="Blog | The AM Project - Insights for Modern Men"
        description="Discover practical articles on personal growth, discipline, and purpose for men seeking to build stronger lives and relationships."
        image="/images/mountain-climbers.jpg"
      />
      <CanonicalLink path="/blog" />
      <WebPageStructuredData
        url="https://theamproject.com/blog"
        name="Blog | The AM Project - Insights for Modern Men"
        description="Discover practical articles on personal growth, discipline, and purpose for men seeking to build stronger lives and relationships."
        image="/images/mountain-climbers.jpg"
        dateModified="2025-05-16"
      />
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="section-title">Latest Insights</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Practical wisdom for developing discipline, leadership, and purpose.
            </p>
            <div className="section-divider"></div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: 'all', label: 'All' },
              { id: 'self', label: 'Self' },
              { id: 'family', label: 'Family' },
              { id: 'partner', label: 'Partner' },
              { id: 'friends', label: 'Friends' },
              { id: 'community', label: 'Community & Society' },
              { id: 'financial', label: 'Financial Stewardship' },
              { id: 'purpose', label: 'Purpose & Spiritual Grounding' },
              { id: 'play', label: 'Play & Creative Expression' },
              { id: 'learning', label: 'Continuous Learning & Humility' }
            ].map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={selectedCategory === category.id 
                  ? 'bg-accent text-primary-foreground' 
                  : 'border-border text-foreground hover:border-accent'}
                onClick={() => setSelectedCategory(category.id as Category)}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Card 
                key={index} 
                className="bg-background rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-[1.02] transition duration-300"
              >
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-48 object-cover" 
                />
                <CardHeader className="p-6 pb-2">
                  <div className="text-accent text-sm font-semibold mb-2">{post.category.toUpperCase()}</div>
                  <h2 className="text-xl font-bold mb-3">{post.title}</h2>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{post.date}</span>
                  <Link href={`/blog/${post.slug}`}>
                    <Button 
                      variant="link" 
                      className="text-accent font-semibold p-0 hover:underline"
                    >
                      Read More →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* If there are no posts in the selected category */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No articles found in this category.
              </p>
              <Button 
                variant="outline" 
                className="border-accent text-accent"
                onClick={() => setSelectedCategory('all')}
              >
                View All Articles
              </Button>
            </div>
          )}
          
          <NewsletterCTA variant="secondary" />
        </div>
      </section>
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="blog"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
};

export default Blog;
