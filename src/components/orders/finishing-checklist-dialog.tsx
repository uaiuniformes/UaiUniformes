
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
import type { Order, OrderStage } from '@/lib/types';
import { Alert, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface FinishingChecklistDialogProps {
  order: Order;
  children: React.ReactNode;
  onConfirm: (nextStage: OrderStage, reason?: string) => void;
}

const checklistItems = [
  'Limpeza das peças',
  'Peças Passadas',
  'Estampa verificada',
  'Quantidade conferida',
  'Material Embalado',
];

export function FinishingChecklistDialog({ order, children, onConfirm }: FinishingChecklistDialogProps) {
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});
  const [justification, setJustification] = React.useState('');
  const [correctionReason, setCorrectionReason] = React.useState('');
  const [nextStageOption, setNextStageOption] = React.useState<OrderStage>('Finalizado');
  const [isOpen, setIsOpen] = React.useState(false);

  const totalItems = checklistItems.length;
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const allItemsChecked = totalItems > 0 && totalChecked === totalItems;
  const needsChecklistJustification = !allItemsChecked && totalItems > 0 && nextStageOption === 'Finalizado';

  const needsCorrectionReason = nextStageOption === 'Correção';

  const canConfirmFinalizado = allItemsChecked || (needsChecklistJustification && justification.trim().length > 10);
  const canConfirmCorrecao = correctionReason.trim().length > 10;
  
  const canConfirm = nextStageOption === 'Finalizado' ? canConfirmFinalizado : canConfirmCorrecao;


  const handleCheckboxChange = (item: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [item]: checked }));
  };

  const handleConfirmClick = () => {
    onConfirm(nextStageOption, nextStageOption === 'Correção' ? correctionReason : undefined);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setCheckedItems({});
      setJustification('');
      setCorrectionReason('');
      setNextStageOption('Finalizado');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checklist de Arremate</DialogTitle>
          <DialogDescription>
            Verifique os itens para o pedido de {order.customerName} - {order.model}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                {checklistItems.map(item => (
                <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                    id={`${order.id}-${item}`}
                    checked={checkedItems[item] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(item, !!checked)}
                    />
                    <Label htmlFor={`${order.id}-${item}`}>{item}</Label>
                </div>
                ))}
            </div>

            {needsChecklistJustification && (
                <div className="space-y-2">
                    <Alert variant="destructive">
                        <AlertDescription>
                            Todos os itens devem ser marcados. Caso não seja possível, preencha uma justificativa.
                        </AlertDescription>
                    </Alert>
                <Label htmlFor="justification">Justificativa do Checklist (mín. 10 caracteres)</Label>
                <Textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Ex: Cliente solicitou a não embalagem individual."
                />
                </div>
            )}
            
            <div className="space-y-3">
                <Label>Próxima Etapa</Label>
                 <RadioGroup value={nextStageOption} onValueChange={(value) => setNextStageOption(value as OrderStage)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Finalizado" id="r1-finalizado" />
                    <Label htmlFor="r1-finalizado">Mover para Pedidos Prontos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Correção" id="r2-correcao" />
                    <Label htmlFor="r2-correcao">Mover para Correção</Label>
                  </div>
                </RadioGroup>
            </div>
             {needsCorrectionReason && (
                <div className="space-y-2">
                <Label htmlFor="correction-reason">Motivo da Correção (mín. 10 caracteres)</Label>
                <Textarea
                    id="correction-reason"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="Ex: Costura da manga está torta."
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
