'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle2, Layers } from 'lucide-react';

interface StageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badgeText?: string;
  gradient: string;
  stats: {
    totalOrders: number;
    totalPieces?: number;
    priorityOrders?: number;
    overdueOrders?: number;
  };
}

export function StageHeader({
  title,
  subtitle,
  icon: Icon,
  badgeText = 'Fila de Produção',
  gradient,
  stats,
}: StageHeaderProps) {
  return (
    <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden mb-6 bg-white dark:bg-zinc-900">
      <div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Icon & Title */}
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-2xl shadow-md p-2.5 text-white bg-gradient-to-tr shrink-0',
                gradient
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {title}
                </h1>
                <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-border">
                  {badgeText}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick Micro-KPI Counters */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Total Pedidos */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700">
              <Layers className="h-4 w-4 text-slate-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Fila</span>
                <span className="text-sm font-bold text-foreground leading-none">{stats.totalOrders} pedidos</span>
              </div>
            </div>

            {/* Total Peças (if provided) */}
            {typeof stats.totalPieces === 'number' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Volume</span>
                  <span className="text-sm font-bold text-foreground leading-none">{stats.totalPieces} peças</span>
                </div>
              </div>
            )}

            {/* Prioridades */}
            {typeof stats.priorityOrders === 'number' && stats.priorityOrders > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4 text-amber-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400">Prioridades</span>
                  <span className="text-sm font-bold leading-none">{stats.priorityOrders}</span>
                </div>
              </div>
            )}

            {/* Atrasados */}
            {typeof stats.overdueOrders === 'number' && stats.overdueOrders > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400">Atenção</span>
                  <span className="text-sm font-bold leading-none">{stats.overdueOrders} atraso(s)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
