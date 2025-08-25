import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { usePWA } from '@/hooks/use-pwa';
import { Instagram, Twitter, Youtube, Linkedin, Download, Loader2, CheckCircle } from 'lucide-react';
import { scrollToTop } from '@/lib/utils';

const footerFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FooterFormValues = z.infer<typeof footerFormSchema>;

const Footer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();
  const { isInstallable, installApp, isInstalled } = usePWA();
  
  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  async function onSubmit(data: FooterFormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/newsletter', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });
      
      // Trigger PDF download
      const link = document.createElement('a');
      link.href = '/The_AM_Reset.pdf';
      link.download = 'The AM Reset - 6 Grounded Practices.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success!",
        description: "You've been added to our newsletter. The AM Reset is downloading now!",
        variant: "default",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute -left-40 top-0 w-80 h-80 bg-accent/5 rounded-full blur-2xl z-0"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-1">
            <Link href="/" onClick={() => scrollToTop()} className="flex items-center mb-6">
              <img src="/white-logo.png" alt="The AM Project Logo" className="h-20 w-auto" />
            </Link>
            <p className="text-muted-foreground mb-6">
              Redefining what it means to be a man through strength, integrity, discipline, and purpose.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.instagram.com/theauthenticmanproject/" target="_blank" rel="noopener noreferrer" 
                className="bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded-full transition duration-300 flex items-center justify-center">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com/theamproject" target="_blank" rel="noopener noreferrer" 
                className="bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded-full transition duration-300 flex items-center justify-center">
                <Twitter size={18} />
              </a>
              <a href="https://youtube.com/@theauthenticmanproject?si=mUe1tkR-EvkdHinA" target="_blank" rel="noopener noreferrer" 
                className="bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded-full transition duration-300 flex items-center justify-center">
                <Youtube size={18} />
              </a>
              <a href="https://linkedin.com/company/the-am-project" target="_blank" rel="noopener noreferrer" 
                className="bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded-full transition duration-300 flex items-center justify-center">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center">
              <span className="h-5 w-1 bg-accent mr-2 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li><Link href="/" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Home
              </Link></li>
              <li><Link href="/about" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                About
              </Link></li>
              <li><Link href="/standard" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                The AM Standard
              </Link></li>
              <li><Link href="/blog" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Blog
              </Link></li>
              <li><Link href="/join#newsletter" className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Join the Newsletter
              </Link></li>
              <li><Link href="/contact" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Contact
              </Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center">
              <span className="h-5 w-1 bg-accent mr-2 rounded-full"></span>
              Resources
            </h4>
            <ul className="space-y-3">
              <li><Link href="/blog" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Discipline Framework
              </Link></li>
              <li><Link href="/blog" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Physical Confidence Guide
              </Link></li>
              <li><Link href="/blog" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Leadership Principles
              </Link></li>
              <li><Link href="/blog" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                Essential Reading List
              </Link></li>
              <li><Link href="/blog" onClick={() => scrollToTop()} className="text-muted-foreground hover:text-accent transition duration-300 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/70"><path d="m9 18 6-6-6-6"/></svg>
                The AM Podcast
              </Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 flex items-center">
              <span className="h-5 w-1 bg-accent mr-2 rounded-full"></span>
              Get the App
            </h4>
            <p className="text-muted-foreground mb-4">Download the AM Project app for offline access and native experience.</p>
            <div className="mb-6">
              {isInstalled ? (
                <div className="flex items-center justify-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-500 font-medium text-sm">App Installed</span>
                </div>
              ) : (
                <Button 
                  disabled={isInstalling}
                  onClick={async () => {
                    if (isInstallable) {
                      setIsInstalling(true);
                      try {
                        await installApp();
                        toast({
                          title: "App installed successfully!",
                          description: "The AM Project app has been added to your device.",
                        });
                      } catch (error) {
                        console.error('Install failed:', error);
                        toast({
                          title: "Installation failed",
                          description: "Please use your browser's install option from the menu.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsInstalling(false);
                      }
                    } else {
                      // iOS Safari or other browsers without install prompt
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                      if (isIOS) {
                        toast({
                          title: "iOS Installation Steps",
                          description: "1. Tap the Share button (square with arrow up) 2. Scroll down and tap 'Add to Home Screen' 3. Tap 'Add' to confirm",
                          duration: 8000,
                        });
                      } else {
                        toast({
                          title: "Android Installation Steps",
                          description: "1. Tap the three dots menu in Chrome 2. Tap 'Add to Home screen' or 'Install app' 3. Tap 'Add' to confirm",
                          duration: 8000,
                        });
                      }
                    }
                  }}
                  className="bg-accent text-primary-foreground rounded px-5 py-3 font-semibold hover:bg-accent/80 transition duration-300 w-full mb-3 disabled:opacity-70"
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <span className="h-5 w-1 bg-accent mr-2 rounded-full"></span>
              Join Our Newsletter
            </h4>
            <p className="text-muted-foreground mb-4">Get actionable tools and insights for becoming the strongest version of yourself.</p>
            <p className="text-sm text-muted-foreground mb-4">Includes instant download: The AM Reset — 6 practices to get back on track</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input 
                            placeholder="First name" 
                            className="bg-accent/5 text-foreground border border-accent/20 rounded px-4 py-3 w-full focus-visible:ring-accent focus-visible:ring-1" 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input 
                            placeholder="Last name" 
                            className="bg-accent/5 text-foreground border border-accent/20 rounded px-4 py-3 w-full focus-visible:ring-accent focus-visible:ring-1" 
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Your email" 
                          className="bg-accent/5 text-foreground border border-accent/20 rounded px-4 py-3 w-full focus-visible:ring-accent focus-visible:ring-1" 
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-accent text-primary-foreground rounded px-5 py-3 font-semibold hover:bg-accent/80 transition duration-300 w-full"
                >
                  {isSubmitting ? "Subscribing..." : "Get Free AM Reset"}
                </Button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground mt-3">No fluff, no empty hype. Just tools that work.</p>
          </div>
        </div>
        
        <div className="border-t border-border/30 pt-8 mt-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} The AM Project. All rights reserved. <span className="mx-2">•</span> Denver, CO</p>
          <div className="mt-3 flex justify-center gap-6">
            <Link href="/privacy" onClick={() => scrollToTop()} className="hover:text-accent transition duration-300">Privacy Policy</Link>
            <Link href="/terms" onClick={() => scrollToTop()} className="hover:text-accent transition duration-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
