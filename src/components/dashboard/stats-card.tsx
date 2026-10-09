import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoaderLink } from './loader-link';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  hoverColor?: string;
  gradient?: string;
  href?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'bg-red-500',
  gradient,
  href,
}: StatsCardProps) {
  // Fallback to suitable gradient if not passed directly
  const ringGradient =
    gradient ||
    (color.includes('blue')
      ? 'from-blue-600 via-sky-500 to-cyan-400'
      : color.includes('orange')
      ? 'from-amber-600 via-orange-500 to-amber-400'
      : color.includes('yellow')
      ? 'from-amber-500 via-yellow-400 to-amber-300'
      : color.includes('purple') || color.includes('indigo')
      ? 'from-indigo-600 via-purple-500 to-violet-400'
      : color.includes('emerald') || color.includes('green')
      ? 'from-emerald-600 via-teal-500 to-emerald-400'
      : color.includes('gray') || color.includes('zinc')
      ? 'from-zinc-700 via-slate-600 to-zinc-400'
      : 'from-red-700 via-rose-600 to-red-500');

  const content = (
    <div className="flex flex-col items-center gap-2 group cursor-pointer select-none">
      {/* Outer Circular Container with gradient ring & micro-interaction */}
      <div
        className={cn(
          'relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr shadow-md',
          ringGradient,
          'transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20'
        )}
      >
        {/* Inner Satin Circle Core */}
        <div className="relative flex flex-col items-center justify-center w-full h-full rounded-full bg-white dark:bg-zinc-900 border border-white/60 dark:border-zinc-800 shadow-inner">
          {/* Translucent Glass Capsule for Stage Icon (top-floating) */}
          <div
            className={cn(
              'absolute -top-2 flex items-center justify-center w-8 h-8 rounded-full',
              'bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md shadow-sm border border-zinc-200/80 dark:border-zinc-700',
              'transition-all duration-300 group-hover:scale-115 group-hover:-translate-y-0.5'
            )}
          >
            <div className={cn('p-1 rounded-full text-white bg-gradient-to-tr', ringGradient)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Central Bold Metric */}
          <div className="mt-2 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
              {value}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/80 -mt-0.5">
              pedidos
            </span>
          </div>
        </div>
      </div>

      {/* Clean Typography Title */}
      <span className="text-xs sm:text-sm font-semibold text-center text-zinc-700 dark:text-zinc-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors max-w-[105px] leading-tight">
        {title}
      </span>
    </div>
  );

  if (href) {
    return (
      <LoaderLink href={href} className="flex flex-col items-center no-underline">
        {content}
      </LoaderLink>
    );
  }

  return content;
}
