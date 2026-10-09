

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Order, DeliveryMethod, OrderStage, PaymentCondition } from '@/lib/types';
import { deliveryMethods } from './order-constants';
import { FileUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '../ui/datepicker';
import { Textarea } from '../ui/textarea';

interface DeliveryConfirmationDialogProps {
  order: Order;
  children: React.ReactNode;
  onConfirm: (
    deliveryDetails: {
      deliveryMethod: DeliveryMethod;
      deliveryRecipient?: string;
      remainingAmountProofUrl?: string; // Should be File object in a real app
      remainingAmountPaid?: number;
      finalPaymentDate?: string;
    }
  ) => void;
  onMoveToCorrection: (reason: string) => void;
}

export function DeliveryConfirmationDialog({
  order,
  children,
  onConfirm,
  onMoveToCorrection,
}: DeliveryConfirmationDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [nextStage, setNextStage] = React.useState<OrderStage | 'Entregue'>('Entregue');
  const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod | undefined>();
  const [recipientName, setRecipientName] = React.useState('');
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [remainingAmountPaid, setRemainingAmountPaid] = React.useState<number | undefined>();
  const [finalPaymentDate, setFinalPaymentDate] = React.useState<Date | undefined>(new Date());
  const [correctionReason, setCorrectionReason] = React.useState('');

  const getPaymentConditionString = (pc: Order['paymentCondition']) => {
    if (!pc) return '';
    if (Array.isArray(pc)) return pc.join(', ');
    return pc;
  };

  const paymentCondition = getPaymentConditionString(order.paymentCondition) || '50%';
  const amountPaid = order.amountPaid || 0;
  const remainingAmount = paymentCondition.includes('Sem Entrada') ? order.value : order.value - amountPaid;
  const needsPayment = remainingAmount > 0 && !paymentCondition.includes('Nota');

  const handleConfirm = () => {
    if (nextStage === 'Entregue') {
      if (!deliveryMethod) return;
      onConfirm({
        deliveryMethod,
        deliveryRecipient: deliveryMethod === 'Retirado em Loja' ? recipientName : undefined,
        remainingAmountProofUrl: proofFile ? proofFile.name : undefined, // In real app, you'd upload the file
        remainingAmountPaid: remainingAmountPaid,
        finalPaymentDate: finalPaymentDate?.toISOString()
      });
    } else if (nextStage === 'Correção') {
      onMoveToCorrection(correctionReason);
    }
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state on close
      setNextStage('Entregue');
      setDeliveryMethod(undefined);
      setRecipientName('');
      setProofFile(null);
      setRemainingAmountPaid(undefined);
      setFinalPaymentDate(new Date());
      setCorrectionReason('');
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProofFile(e.target.files[0]);
    }
  };

  const canConfirmDelivery = !!deliveryMethod && (deliveryMethod !== 'Retirado em Loja' || recipientName.trim() !== '');
  const canConfirmCorrection = correctionReason.trim().length > 10;
  const canConfirm = nextStage === 'Entregue' ? canConfirmDelivery : canConfirmCorrection;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          <DialogDescription>
            Confirme os detalhes de finalização para o pedido de {order.customerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
            <div className="space-y-3">
                <Label>Próxima Etapa</Label>
                 <RadioGroup value={nextStage} onValueChange={(value) => setNextStage(value as OrderStage)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Entregue" id={`r1-${order.id}`} />
                    <Label htmlFor={`r1-${order.id}`}>Confirmar Entrega</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Correção" id={`r2-${order.id}`} />
                    <Label htmlFor={`r2-${order.id}`}>Mover para Correção</Label>
                  </div>
                </RadioGroup>
            </div>

            {nextStage === 'Correção' && (
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="correction-reason">Motivo da Correção (mín. 10 caracteres)</Label>
                <Textarea
                  id="correction-reason"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Ex: Faltou uma peça no tamanho G."
                />
              </div>
            )}

            {nextStage === 'Entregue' && (
                <div className="space-y-4 pt-4 border-t">
                     {needsPayment && (
                        <Alert>
                            <AlertTitle>Pagamento Pendente</AlertTitle>
                            <AlertDescription>
                                Valor restante a acertar: <strong>{remainingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-3">
                        <Label>Método de Entrega</Label>
                        <RadioGroup value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}>
                            {deliveryMethods.map(method => (
                                <div key={method} className="flex items-center space-x-2">
                                    <RadioGroupItem value={method} id={`${order.id}-${method}`} />
                                    <Label htmlFor={`${order.id}-${method}`}>{method}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {deliveryMethod === 'Retirado em Loja' && (
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="recipient-name">Nome de quem retirou</Label>
                            <Input 
                                type="text" 
                                id="recipient-name" 
                                placeholder="Nome completo"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                             />
                        </div>
                    )}

                    {(paymentCondition.includes('Nota') || needsPayment) && (
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>{paymentCondition.includes('Nota') ? 'Foto da Nota de Cobrança' : 'Comprovante Restante'}</Label>
                         <Label htmlFor="proof-upload" className={cn("flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted", proofFile && 'border-green-500')}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                     {proofFile ? (
                                        <>
                                            <FileUp className="w-6 h-6 mb-1 text-green-500" />
                                            <p className="text-xs text-green-500 truncate max-w-full px-4">{proofFile.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">{paymentCondition.includes('Nota') ? 'Anexar foto da nota' : 'Anexar comprovante'}</p>
                                        </>
                                     )}
                                </div>
                                <Input id="proof-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </Label>
                      </div>
                    )}
                    
                    {needsPayment && (
                         <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="final-payment-date">Data do Pagamento Final</Label>
                                <DatePicker date={finalPaymentDate} setDate={setFinalPaymentDate} />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="remaining-amount-paid">Valor Restante Pago (R$)</Label>
                                <Input 
                                    id="remaining-amount-paid" 
                                    type="number" 
                                    placeholder="Ex: 50.00"
                                    value={remainingAmountPaid || ''}
                                    onChange={(e) => setRemainingAmountPaid(Number(e.target.value))}
                                />
                            </div>
                         </div>
                    )}
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
