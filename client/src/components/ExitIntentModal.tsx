import { useState } from 'react';
import { X } from 'lucide-react';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  timeOnPage: number;
  scrollDepth: number;
}

const reasonOptions = [
  { value: 'unclear', label: "I'm not sure what this app actually does" },
  { value: 'not_ready', label: "I'm not ready to commit to anything right now" },
  { value: 'pricing', label: "I don't want to pay for it" },
  { value: 'alternatives', label: 'I already use something else' },
  { value: 'skeptical', label: "I'm skeptical it will actually help" },
  { value: 'trust', label: "I don't fully trust it yet" },
  { value: 'browsing', label: 'Just browsing' },
  { value: 'other', label: 'Other (please share below)' },
];

export default function ExitIntentModal({ 
  isOpen, 
  onClose, 
  currentPage, 
  timeOnPage, 
  scrollDepth 
}: ExitIntentModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleReasonChange = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0 && !otherReason.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a session ID for anonymous tracking
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/exit-intent-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          page: currentPage,
          selectedReasons,
          customFeedback: otherReason.trim() || null,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          timeOnPage: Math.floor(timeOnPage / 1000), // Convert to seconds
          scrollDepth,
        }),
      });

      if (response.ok) {
        console.log('Exit-intent feedback submitted successfully');
        // Already marked in useExitIntent hook, but ensure it's set
        sessionStorage.setItem('exitIntentModalShown', 'true');
        setIsSubmitted(true);
        // Auto-close after showing thank you message
        setTimeout(() => {
          onClose();
        }, 4000);
      } else {
        console.error('Failed to submit exit-intent feedback');
      }
    } catch (error) {
      console.error('Error submitting exit-intent feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Already marked in useExitIntent hook, but ensure it's set
    sessionStorage.setItem('exitIntentModalShown', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card border border-primary rounded-lg max-w-lg w-full p-8 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {!isSubmitted ? (
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center font-['Playfair_Display']">
              Before you go—can I ask you one thing?
            </h2>
            
            <div className="space-y-4 mb-6">
              <p className="text-foreground text-base leading-relaxed">
                You clicked for a reason. Something resonated.
              </p>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                But if this didn't feel right, I'd love to know why.
              </p>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                I built this because men are struggling in silence—and most solutions weren't built for us.
              </p>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                If this isn't it, that's okay. But your feedback could help shape something that actually helps the next man who shows up here.
              </p>
            </div>
            
            <div className="text-center space-y-3 mb-6">
              <p className="text-foreground font-bold text-base">
                What were you hoping to find?
              </p>
              <p className="text-foreground font-bold text-base">
                What would've made you stay?
              </p>
            </div>
            
            <p className="text-muted-foreground text-sm italic text-left">
              — Daniel
            </p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 font-['Playfair_Display']">
              Thank you for that.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
              We take this seriously—every piece of feedback helps us build something better for men who are ready to do the work.
            </p>
            <p className="text-foreground text-sm md:text-base leading-relaxed">
              The door stays open. If you ever want to reconnect, we'll be here.
            </p>
          </div>
        )}

        {!isSubmitted && (
          <div className="space-y-4">
            <div>
              <p className="text-foreground font-medium mb-3">What stopped you from signing up?</p>
              <div className="space-y-2">
                {reasonOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(option.value)}
                      onChange={() => handleReasonChange(option.value)}
                      className="w-4 h-4 accent-primary bg-card border-primary rounded focus:ring-primary focus:ring-2"
                      style={{ accentColor: '#7C4A32' }}
                    />
                    <span className="text-muted-foreground text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">
                Something else? (Optional)
              </label>
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Share what's on your mind..."
                className="w-full p-3 bg-card border border-primary rounded text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 py-2 px-4 border border-primary text-primary rounded hover:bg-primary/10 transition duration-300"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (selectedReasons.length === 0 && !otherReason.trim())}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}