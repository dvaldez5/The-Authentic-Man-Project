import { useState, useEffect } from 'react';
import { scrollToTop } from '@/lib/utils';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';

const Terms = () => {
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

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <div className="pt-20">
      <MetaTags 
        title="Terms of Service | The AM Project" 
        description="Terms of Service for The AM Project website and services. Read about the legal terms governing your use of our platform."
      />
      <CanonicalLink path="/terms" />
      
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none prose-invert text-white">
              <p className="lead text-white/70 mb-8">
                Last Updated: May 16, 2025
              </p>
              
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or using The AM Project website, services, or any applications made available by The AM Project (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you don't agree to these Terms, you may not use the Services.
              </p>
              
              <h2>2. Privacy Policy</h2>
              <p>
                Please review our Privacy Policy, which explains how we collect, use, and share information about you when you use our Services. By using our Services, you agree to the collection, use, and sharing of your information as set out in the Privacy Policy.
              </p>
              
              <h2>3. Changes to Terms or Services</h2>
              <p>
                We may modify the Terms at any time. If we do this, we'll let you know by posting the modified Terms on the Services or through other communications. It's important that you review the Terms whenever we modify them because if you continue to use the Services after we have modified the Terms, you're indicating to us that you agree to be bound by the modified Terms. If you don't agree to be bound by the modified Terms, then you may not use the Services anymore.
              </p>
              
              <h2>4. Using Our Services</h2>
              <p>
                The AM Project grants you a personal, worldwide, royalty-free, non-assignable, non-exclusive, revocable, and non-sublicensable license to access and use the Services. This license is for the sole purpose of letting you use and enjoy the benefits of the Services in a way that these Terms allow.
              </p>
              
              <h2>5. Content and Intellectual Property Rights</h2>
              <p>
                All content on the Services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and data compilations, is the property of The AM Project or its content suppliers and is protected by copyright laws. You may not use, reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services, except as follows:
              </p>
              <ul>
                <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
                <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
                <li>You may print or download one copy of a reasonable number of pages of the Services for your own personal, non-commercial use and not for further reproduction, publication, or distribution.</li>
                <li>If we provide desktop, mobile, or other applications for download, you may download a single copy to your computer or mobile device solely for your own personal, non-commercial use, provided you agree to be bound by our end user license agreement for such applications.</li>
              </ul>
              
              <h2>6. User Content</h2>
              <p>
                Our Services may allow you to submit, post, upload, or otherwise make available content, such as comments, data, text, messages, or other materials (collectively, "User Content"). You retain all rights in, and are solely responsible for, the User Content you make available through the Services.
              </p>
              <p>
                By making any User Content available through the Services, you grant to The AM Project a non-exclusive, transferable, worldwide, royalty-free license, with the right to sublicense, to use, copy, modify, create derivative works based upon, distribute, publicly display, and publicly perform your User Content in connection with operating and providing the Services.
              </p>
              
              <h2>7. Prohibited Content</h2>
              <p>
                You may not post, upload, or otherwise make available User Content that:
              </p>
              <ul>
                <li>Is defamatory, obscene, pornographic, vulgar, or offensive;</li>
                <li>Is intended to harass, abuse, or threaten others;</li>
                <li>Constitutes impersonation of another person or entity;</li>
                <li>Violates the privacy or publicity rights of another person;</li>
                <li>Is in violation of any applicable laws or regulations;</li>
                <li>Is intended to promote or generate revenue for a commercial enterprise;</li>
                <li>Contains or installs any viruses, worms, malware, Trojan horses, or other harmful or destructive content.</li>
              </ul>
              
              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your access to and use of the Services, at our sole discretion, at any time and without notice to you. You may also terminate your account by contacting us. Upon any termination, discontinuation, or cancellation of the Services, all provisions of these Terms which by their nature should survive will survive, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
              
              <h2>9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICES AND ALL CONTENT ARE PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND. WITHOUT LIMITING THE FOREGOING, WE EXPLICITLY DISCLAIM ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE.
              </p>
              
              <h2>10. Limitation of Liability</h2>
              <p>
                IN NO EVENT WILL THE AM PROJECT, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SERVICES OR ANY CONTENT ON THE SERVICES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
              </p>
              
              <h2>11. Governing Law and Jurisdiction</h2>
              <p>
                These Terms and any dispute that may arise between you and The AM Project shall be governed by and construed in accordance with the laws of the State of Colorado, without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located within Denver County, Colorado.
              </p>
              
              <h2>12. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                The AM Project<br />
                Email: info@theamproject.com<br />
                Denver, CO, USA
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {showExitModal && (
        <ExitIntentModal 
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          currentPage="terms"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
};

export default Terms;