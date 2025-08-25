import { Link } from 'wouter';
import { scrollToTop } from '@/lib/utils';
import { ReactNode } from 'react';

interface ScrollToTopLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

const ScrollToTopLink = ({ href, children, className }: ScrollToTopLinkProps) => {
  const handleClick = () => {
    scrollToTop();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};

export default ScrollToTopLink;