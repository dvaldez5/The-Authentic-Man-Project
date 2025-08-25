import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Copy, 
  Check
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  title: string;
  text: string;
  url: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const SocialShareButtons = ({ 
  title, 
  text, 
  url, 
  variant = 'outline', 
  size = 'sm',
  showLabel = true 
}: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Success!',
        description: 'Link copied to clipboard',
        variant: 'default',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const shareToFacebook = () => {
    // Just use the direct URL approach which works well
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + ': ' + text)}`, 
      'facebook-share',
      'width=650,height=450,resizable=yes,scrollbars=yes'
    );
  };

  const shareToTwitter = () => {
    // Twitter sharing with enhanced params
    // Open in a popup window with controlled dimensions
    const twitterText = title.length > 50 ? title.substring(0, 47) + '...' : title;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`,
      'twitter-share',
      'width=550,height=420,resizable=yes,scrollbars=yes'
    );
  };

  const shareToLinkedIn = () => {
    // Try multiple approaches for LinkedIn
    
    // First try to open a popup window with the URL for sharing
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      'linkedin-share',
      'width=550,height=460,resizable=yes,scrollbars=yes'
    );
    
    // Note: LinkedIn might not show preview if it can't access the URL (like in Replit)
    // But this approach works well when deployed to a real domain
  };

  const shareByEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
  };

  const [hasNativeShare, setHasNativeShare] = useState(false);
  
  useEffect(() => {
    // Check for native sharing capability in the browser
    setHasNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  const nativeShare = () => {
    if (hasNativeShare) {
      navigator.share({
        title,
        text,
        url,
      })
      .catch((error) => console.log('Error sharing', error));
    }
  };

  // If native sharing is available, it's usually a better user experience on mobile
  if (hasNativeShare) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={nativeShare}
      >
        {showLabel && "Share"} <Share className={showLabel ? "ml-2 h-4 w-4" : "h-4 w-4"} />
      </Button>
    );
  }

  // Custom share options for platforms without native sharing
  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={variant} size={size}>
            {showLabel && "Share"} <Share className={showLabel ? "ml-2 h-4 w-4" : "h-4 w-4"} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-2">
            <div className="text-sm font-medium pb-1 mb-1 border-b">Share via</div>
            <div className="grid grid-cols-4 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={shareToFacebook}>
                    <Facebook className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Facebook</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={shareToTwitter}>
                    <Twitter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Twitter</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={shareToLinkedIn}>
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>LinkedIn</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={shareByEmail}>
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex mt-2 pt-2 border-t">
              <div className="flex-1 pr-2">
                <p className="text-xs text-muted-foreground truncate">{url}</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy link'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

export default SocialShareButtons;