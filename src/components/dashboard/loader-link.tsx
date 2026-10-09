
'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/hooks/use-loader';
import type React from 'react';

interface LoaderLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

export function LoaderLink({ children, href, className, ...props }: LoaderLinkProps) {
  const { showLoader } = useLoader();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    showLoader();
    router.push(href.toString());
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
