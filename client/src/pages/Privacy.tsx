import { useState, useEffect } from 'react';
import { scrollToTop } from '@/lib/utils';
import MetaTags from '@/components/MetaTags';
import CanonicalLink from '@/components/CanonicalLink';
import { useExitIntent } from '@/hooks/use-exit-intent';
import ExitIntentModal from '@/components/ExitIntentModal';

const Privacy = () => {
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
        title="Privacy Policy | The AM Project" 
        description="Privacy Policy for The AM Project website. Learn about how we collect, use, and protect your personal information."
      />
      <CanonicalLink path="/privacy" />
      
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none prose-invert text-white">
              <p className="lead text-white/70 mb-8">
                Last Updated: May 16, 2025
              </p>
              
              <p>
                The AM Project ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by The AM Project when you use our website, services, or applications (collectively, the "Services").
              </p>
              
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, fill out a form, communicate with us, or otherwise use our Services.
              </p>
              <p>
                <strong>Personal Information:</strong> This may include your name, email address, postal address, phone number, and any other information you choose to provide.
              </p>
              <p>
                <strong>Usage Information:</strong> We automatically collect certain information about your use of our Services, including:
              </p>
              <ul>
                <li>Log data (such as your IP address, browser type, operating system, the referring web page, pages visited, and search terms)</li>
                <li>Device information (such as your device type, operating system, and unique device identifiers)</li>
                <li>Location information (such as your general geographic location based on your IP address)</li>
                <li>Cookie and similar technology information (as described below)</li>
              </ul>
              
              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul>
                <li>Provide, maintain, and improve our Services</li>
                <li>Send you technical notices, updates, security alerts, and administrative messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, offers, and events, and provide news and information we think will be of interest to you</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Personalize and improve the Services and provide content or features that match user profiles or interests</li>
              </ul>
              
              <h2>3. How We Share Your Information</h2>
              <p>
                We may share the information we collect as follows:
              </p>
              <ul>
                <li><strong>With service providers:</strong> We may share your information with third-party service providers who need access to such information to carry out work on our behalf, such as email delivery, data analysis, and customer service.</li>
                <li><strong>In response to legal requests:</strong> We may disclose information if we believe in good faith that disclosure is necessary to comply with any applicable law, regulation, legal process, or governmental request.</li>
                <li><strong>To protect rights and safety:</strong> We may disclose information where we believe it is necessary to protect the rights, property, and safety of The AM Project, our users, and others.</li>
                <li><strong>With your consent:</strong> We may share your information with third parties when you have given us your consent to do so.</li>
              </ul>
              <p>
                We may also share aggregated or de-identified information that cannot reasonably be used to identify you.
              </p>
              
              <h2>4. Cookies and Similar Technologies</h2>
              <p>
                We and our third-party service providers may use cookies, web beacons, and other technologies to receive and store certain types of information whenever you interact with our Services. A cookie is a small piece of data sent from a website and stored on your device. Cookies help us provide, protect, and improve our Services, such as by personalizing content, offering and measuring advertisements, understanding user behavior, and providing a safer experience.
              </p>
              <p>
                You can set your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our Services may not function properly without cookies.
              </p>
              
              <h2>5. Data Retention</h2>
              <p>
                We retain information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Once the purpose for which we collected your personal information has been fulfilled, we will securely delete or anonymize your personal information.
              </p>
              
              <h2>6. Your Rights and Choices</h2>
              <p>
                You have certain rights and choices regarding your personal information:
              </p>
              <ul>
                <li><strong>Account Information:</strong> You may update, correct, or delete your account information at any time by logging into your online account or contacting us.</li>
                <li><strong>Communications Preferences:</strong> You may opt out of receiving promotional communications from us by following the instructions provided in those communications or by contacting us.</li>
                <li><strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually choose to set your browser to remove or reject cookies.</li>
                <li><strong>Do Not Track:</strong> Some browsers offer a "Do Not Track" feature. Our Services do not currently change their behavior based on receiving Do Not Track signals.</li>
              </ul>
              
              <h2>7. Children's Privacy</h2>
              <p>
                Our Services are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
              </p>
              
              <h2>8. International Users</h2>
              <p>
                The Services are hosted in the United States and are intended for users located in the United States. If you access the Services from outside the United States, please be aware that information collected through the Services may be transferred to, processed, stored, and used in the United States and other jurisdictions.
              </p>
              
              <h2>9. Links to Other Websites</h2>
              <p>
                Our Services may contain links to other websites that are not operated or controlled by The AM Project. This Privacy Policy does not apply to third-party websites or services. We encourage you to review the privacy policies of any third-party websites you visit.
              </p>
              
              <h2>10. Changes to This Privacy Policy</h2>
              <p>
                We may change this Privacy Policy from time to time. If we make material changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice (such as adding a statement to our website or sending you a notification). We encourage you to review the Privacy Policy whenever you access the Services to stay informed about our information practices.
              </p>
              
              <h2>11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                The AM Project<br />
                Email: privacy@theamproject.com<br />
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
          currentPage="privacy"
          timeOnPage={getTimeOnPage()}
          scrollDepth={getScrollDepth()}
        />
      )}
    </div>
  );
};

export default Privacy;