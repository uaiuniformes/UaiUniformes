
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { Order } from '@/lib/types';
import { separationChecklists } from './order-constants';
import { Alert, AlertDescription } from '../ui/alert';
import { Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/hooks/use-loader';

interface SeparationChecklistDialogProps {
  order: Order;
  children: React.ReactNode;
  onConfirm: () => void;
}

export function SeparationChecklistDialog({ order, children, onConfirm }: SeparationChecklistDialogProps) {
  const router = useRouter();
  const { showLoader } = useLoader();
  const checklistItems = [...(separationChecklists[order.model] || []), "Impressão da Ficha de Costura"];
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});
  const [justification, setJustification] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const totalItems = checklistItems.length;
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const allItemsChecked = totalItems > 0 && totalChecked === totalItems;
  const needsJustification = !allItemsChecked && totalItems > 0;

  const canConfirm = allItemsChecked || (needsJustification && justification.trim().length > 10);

  const handleCheckboxChange = (item: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [item]: checked }));
  };

  const handleConfirmClick = () => {
    // Here you could also save the checklist state and justification to the order object
    // For now, we just call the onConfirm callback
    onConfirm();
    setIsOpen(false);
     // Reset state on close
    setCheckedItems({});
    setJustification('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
        // Reset state on close
        setCheckedItems({});
        setJustification('');
    }
  }

  const handlePrintClick = () => {
    showLoader();
    const url = `/dashboard/orders/${order.id.replace('ORD', '')}?print=true`;
    router.push(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checklist de Separação</DialogTitle>
          <DialogDescription>
            Confirme os itens separados para o pedido de {order.customerName} - {order.model}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {checklistItems.length > 0 ? (
                <div className="space-y-2">
                    {checklistItems.map(item => {
                       const isPrintItem = item === "Impressão da Ficha de Costura";
                       return (
                            <div key={item} className="flex items-center space-x-2">
                                <Checkbox
                                id={`${order.id}-${item}`}
                                checked={checkedItems[item] || false}
                                onCheckedChange={(checked) => handleCheckboxChange(item, !!checked)}
                                />
                                <Label htmlFor={`${order.id}-${item}`} className="flex-1">{item}</Label>
                                {isPrintItem && (
                                    <Button variant="ghost" size="icon" onClick={handlePrintClick}>
                                        <Printer className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                       )
                    })}
                </div>
            ): (
                <p className="text-sm text-muted-foreground">Este modelo não possui um checklist de separação definido.</p>
            )}

          {needsJustification && (
            <div className="space-y-2">
                <Alert variant="destructive">
                    <AlertDescription>
                        Todos os itens devem ser marcados. Caso não seja possível, preencha uma justificativa.
                    </AlertDescription>
                </Alert>
              <Label htmlFor="justification">Justificativa (mín. 10 caracteres)</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ex: Gola será enviada separadamente pela outra unidade."
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmClick} disabled={!canConfirm}>
            Confirmar e Avançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
