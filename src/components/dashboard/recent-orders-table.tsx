'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowUpRight } from 'lucide-react';
import type { Order } from '@/lib/types';
import { OrderDetailsDialog } from '../orders/order-details-dialog';
import { cn } from '@/lib/utils';

interface RecentOrdersTableProps {
  data: Order[];
}

function getStageDotColor(stage: string) {
  switch (stage) {
    case 'Corte':
      return 'bg-slate-500';
    case 'Estampagem':
      return 'bg-amber-500';
    case 'Separação':
      return 'bg-sky-500';
    case 'Costura':
      return 'bg-indigo-500';
    case 'Arremate':
      return 'bg-teal-500';
    case 'Reposição de Corte':
    case 'Correção':
      return 'bg-rose-500';
    case 'Finalizado':
    case 'Entregue':
      return 'bg-emerald-500';
    default:
      return 'bg-blue-500';
  }
}

function getInitials(name: string) {
  if (!name) return 'UN';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function RecentOrdersTable({ data }: RecentOrdersTableProps) {
  const router = useRouter();

  return (
    <Card className="rounded-xl border border-border/70 shadow-xs overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4 w-[90px] font-semibold text-xs uppercase tracking-wider">Pedido</TableHead>
              <TableHead className="h-11 px-4 font-semibold text-xs uppercase tracking-wider">Empresa / Cliente</TableHead>
              <TableHead className="h-11 px-4 font-semibold text-xs uppercase tracking-wider">Modelo</TableHead>
              <TableHead className="h-11 px-4 font-semibold text-xs uppercase tracking-wider">Personalização</TableHead>
              <TableHead className="h-11 px-4 font-semibold text-xs uppercase tracking-wider">Etapa Atual</TableHead>
              <TableHead className="h-11 px-4 text-right font-semibold text-xs uppercase tracking-wider">Valor Total</TableHead>
              <TableHead className="h-11 px-4 text-center w-[70px]">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((order) => {
                const initials = getInitials(order.customerName || order.customerResponsible || 'U');
                const dotColor = getStageDotColor(order.stage);

                return (
                  <TableRow 
                    key={order.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <TableCell className="px-4 py-3 font-bold text-foreground w-[90px]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-mono font-semibold">
                        #{order.id.replace('ORD', '')}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-semibold text-xs border border-red-200/80 shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm text-foreground truncate max-w-[200px]">
                            {order.customerName}
                          </span>
                          {order.customerResponsible && order.customerResponsible !== order.customerName && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {order.customerResponsible}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                      {order.model}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {order.type.map((t, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary"
                            className="text-[11px] font-normal px-2 py-0 bg-muted/80 text-muted-foreground"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700">
                        <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
                        <span>{order.stage}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold text-sm text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <OrderDetailsDialog
                        orderId={order.id}
                        trigger={
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                  Nenhum pedido recente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
