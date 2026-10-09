
'use client';

import { useLoader } from '@/hooks/use-loader';
import { cn } from '@/lib/utils';

export function GlobalLoader() {
  const { isLoading } = useLoader();

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}
