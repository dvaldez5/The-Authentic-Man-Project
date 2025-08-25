import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { WebPageStructuredData } from '@/components/StructuredData';
import NewsletterCTA from '@/components/NewsletterCTA';
import { trackPageView, trackContactForm } from '@/lib/google-ads';
import { useMarketingAnalytics } from '@/hooks/use-marketing-analytics';
import { useGoogleAdsConversions } from '@/hooks/use-google-ads-conversions';
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Mic, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { toast } = useToast();
  
  // Initialize marketing analytics for bounce rate tracking
  const { trackInteraction } = useMarketingAnalytics();
  
  // Exit intent detection
  const { getTimeOnPage, getScrollDepth } = useExitIntent(
    (data) => {
      if (!showExitModal) {
        setShowExitModal(true);
      }
    },
    { delay: 3000 }
  );
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    // Track contact page view
    trackPageView('Contact Page', { 
      page_category: 'support',
      content_type: 'contact_form'
    });
  }, []);

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    // Track contact form submission engagement
    trackInteraction('contact_form_submit', 'contact_section');
    
    try {
      console.log('Submitting contact form with data:', data);
      
      // Try using fetch directly to see if that works
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseText = await response.text();
      console.log('Contact form response:', response.status, responseText);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${responseText}`);
      }
      
      // Track contact form submission conversion
      trackContactForm({
        email: data.email
      });
      
      // Track successful contact form submission engagement
      trackInteraction('contact_form_success', 'contact_section');
      
      toast({
        title: "Message Sent!",
        description: "We've received your message and will respond within 24-48 hours.",
      });
      form.reset();
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="pt-20">
      <MetaTags
        title="Contact Us | The AM Project - Get in Touch"
        description="Contact The AM Project team with questions, feedback, or partnership inquiries. We're here to help you on your journey of growth and purpose."
        image="/images/logo-inverted.svg"
      />
      <CanonicalLink path="/contact" />
      <WebPageStructuredData
        url="https://theamproject.com/contact"
        name="Contact Us | The AM Project - Get in Touch"
        description="Contact The AM Project team with questions, feedback, or partnership inquiries. We're here to help you on your journey of growth and purpose."
        image="/images/logo-inverted.svg"
        dateModified="2025-05-16"
      />
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h1 className="section-title">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions or want to collaborate? Reach out to us.
            </p>
            <div className="section-divider"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            className="bg-background text-foreground border border-border focus:ring-accent" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="bg-background text-foreground border border-border focus:ring-accent" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What is this regarding?" 
                            className="bg-background text-foreground border border-border focus:ring-accent" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message" 
                            className="bg-background text-foreground border border-border focus:ring-accent" 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-accent text-primary-foreground hover:bg-accent/80 transition duration-300"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
            
            <div>
              <Card className="bg-background p-8 rounded-lg border border-border h-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Connect With Us</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-accent mt-1">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                      <p className="text-muted-foreground">info@theamproject.com</p>
                      <p className="text-muted-foreground text-sm mt-1">We respond to all inquiries within 24-48 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="text-accent mt-1">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Headquarters</h3>
                      <p className="text-muted-foreground">Denver, CO</p>
                      <p className="text-muted-foreground text-sm mt-1">Available for in-person events and speaking engagements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="text-accent mt-1">
                      <Mic size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Media Inquiries</h3>
                      <p className="text-muted-foreground">media@theamproject.com</p>
                      <p className="text-muted-foreground text-sm mt-1">For podcast appearances, interviews, and collaborations</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                    <div className="flex gap-4">
                      <a href="https://www.instagram.com/theauthenticmanproject/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition duration-300">
                        <Instagram size={24} />
                      </a>
                      <a href="https://twitter.com/theamproject" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition duration-300">
                        <Twitter size={24} />
                      </a>
                      <a href="https://youtube.com/@theauthenticmanproject?si=mUe1tkR-EvkdHinA" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition duration-300">
                        <Youtube size={24} />
                      </a>
                      <a href="https://linkedin.com/company/the-am-project" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition duration-300">
                        <Linkedin size={24} />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Newsletter Subscription */}
          <div className="mt-16">
            <NewsletterCTA fullWidth />
          </div>
        </div>
      </section>
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="contact"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
};

export default Contact;
