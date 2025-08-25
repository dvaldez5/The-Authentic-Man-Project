import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost as BlogPostType } from '@/data/blog';
import NewsletterCTA from '@/components/NewsletterCTA';
import SocialShareButtons from '@/components/SocialShareButtons';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { ArticleStructuredData } from '@/components/StructuredData';
import { scrollToTop } from '@/lib/utils';

const BlogPost = () => {
  const [, params] = useRoute('/blog/:slug');
  const [post, setPost] = useState<BlogPostType | null>(null);
  // State for safely accessing window.location after mount
  const [currentUrl, setCurrentUrl] = useState('');
  
  useEffect(() => {
    if (params?.slug) {
      const foundPost = blogPosts.find(post => post.slug === params.slug);
      if (foundPost) {
        setPost(foundPost);
        scrollToTop();
      }
    }
  }, [params?.slug]);

  // Set current URL after component mounts
  useEffect(() => {
    setCurrentUrl(window.location.href);
    // Note: Analytics tracking handled by main GA4 system in App.tsx
  }, []);

  if (!post) {
    return (
      <div className="pt-20">
        <section className="py-20 bg-secondary">
          <div className="container">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-6">Article Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The article you're looking for might have been moved or doesn't exist.
              </p>
              <Link href="/blog">
                <Button>Return to Blog</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {post && (
        <>
          <MetaTags
            title={`${post.title} | The AM Project`}
            description={post.excerpt}
            image={post.imageUrl}
            type="article"
          />
          <CanonicalLink path={`/blog/${post.slug}`} />
          {currentUrl && (
            <ArticleStructuredData
              url={currentUrl}
              title={post.title}
              image={post.imageUrl}
              datePublished={post.date}
              author="Daniel Valdez"
              description={post.excerpt}
              publisher={{
                name: "The AM Project",
                logo: "https://theamproject.com/images/logo-inverted.svg"
              }}
            />
          )}
        </>
      )}
      <section className="py-12 bg-secondary">
        <div className="container">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6 hover:bg-background/20">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Articles
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-block bg-accent text-primary-foreground px-3 py-1 rounded text-sm font-medium mb-4">
              {post.category.toUpperCase()}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{post.title}</h1>
            <p className="text-xl text-white/80">{post.excerpt}</p>
            <div className="mt-4 text-white/70">{post.date}</div>
          </div>
          
          <div className="max-w-4xl mx-auto mb-10">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-background">
        <div className="container">
          <div 
            className="max-w-3xl mx-auto prose prose-lg prose-invert text-white" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="max-w-3xl mx-auto mt-16 border-t border-border pt-8 text-white">
            <div className="flex justify-between items-center">
              <div className="text-white/70">
                Published on {post.date}
              </div>
              <div className="flex gap-2">
                {currentUrl && (
                  <SocialShareButtons
                    title={post.title}
                    text={post.excerpt}
                    url={currentUrl}
                    variant="outline"
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mt-16">
            <h3 className="text-2xl font-bold mb-6">Continue Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts
                .filter(p => p.id !== post.id)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <div className="bg-secondary p-6 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-xs uppercase text-accent font-medium mb-2">
                        {relatedPost.category}
                      </div>
                      <h4 className="text-lg font-bold mb-2">{relatedPost.title}</h4>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))
              }
            </div>
          </div>
          
          <div className="mt-20">
            <NewsletterCTA variant="secondary" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;