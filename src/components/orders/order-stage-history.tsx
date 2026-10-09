
'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
  } from '@/components/ui/dialog';
import type { StageHistory } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function StageHistoryDialog({ history, trigger }: { history?: StageHistory[], trigger: React.ReactNode }) {
    if (!history || history.length === 0) {
        return <span className="text-muted-foreground text-xs">N/A</span>;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Histórico de Etapas do Pedido</DialogTitle>
                    <DialogDescription>Acompanhe a linha do tempo completa do pedido.</DialogDescription>
                </DialogHeader>
                 <div className="relative pl-6 py-4">
                    <div className="absolute left-0 top-4 h-full w-0.5 bg-border -translate-x-1/2"></div>
                    {history.map((item, index) => (
                        <div key={index} className="relative pb-6 last:pb-0">
                            <div className="absolute left-0 top-1 w-3 h-3 bg-primary rounded-full -translate-x-1/2"></div>
                            <div className="ml-2">
                                <p className="font-semibold">{item.stage}</p>
                                <time className="text-xs text-muted-foreground flex items-center gap-1">
                                  {format(new Date(item.startDate), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                </time>
                                {item.reason && (
                                     <p className="text-sm mt-1 p-2 bg-red-100 border-l-4 border-red-500 rounded-r-md">
                                        <span className="font-semibold">Motivo:</span> {item.reason}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
