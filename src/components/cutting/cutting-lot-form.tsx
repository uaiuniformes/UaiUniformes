
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Order, ProductionLot, Cutter } from '@/lib/types';
import { mockOrders } from '@/lib/mock-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface CuttingLotFormDialogProps {
  lot?: ProductionLot;
  children: React.ReactNode;
  cutter: Cutter;
  onSave: (lot: ProductionLot) => void;
}

export function CuttingLotFormDialog({ lot, children, cutter, onSave }: CuttingLotFormDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [availableOrders, setAvailableOrders] = React.useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen && cutter) {
      // If editing, start with the lot's orders
      const initialOrderIds = lot?.orderIds || [];
      setSelectedOrderIds(initialOrderIds);
      setName(lot?.name || `Lote ${cutter} - ${new Date().toLocaleDateString('pt-BR')}`);

      // Available orders are those for the current cutter not yet in ANY lot,
      // plus the ones already in THIS lot if editing.
      const ordersForCutter = mockOrders.filter(
        (order) =>
          order.cutter === cutter &&
          order.stage === 'Corte' &&
          (!order.lotId || initialOrderIds.includes(order.id))
      );
      setAvailableOrders(ordersForCutter);
    }
  }, [isOpen, cutter, lot]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form on close
      setName('');
      setSelectedOrderIds([]);
    }
  };


  const handleOrderSelect = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) =>
      checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const totalPieces = React.useMemo(() => {
    return mockOrders
      .filter((order) => selectedOrderIds.includes(order.id))
      .reduce((sum, order) => sum + order.quantity, 0);
  }, [selectedOrderIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cutter || selectedOrderIds.length === 0) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha o nome do lote e selecione ao menos um pedido.',
        variant: 'destructive',
      });
      return;
    }

    const newLot: ProductionLot = {
      id: lot?.id || `LOTE${Math.floor(Math.random() * 1000)}`,
      name,
      cutter: cutter,
      orderIds: selectedOrderIds,
      totalPieces,
      creationDate: lot?.creationDate || new Date().toISOString(),
      status: lot?.status || 'Pendente',
    };

    onSave(newLot);
    toast({
      title: lot ? 'Lote Atualizado!' : 'Lote Criado!',
      description: `O lote "${name}" foi salvo com sucesso.`,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lot ? 'Editar Lote de Facção' : 'Criar Novo Lote de Facção'}</DialogTitle>
          <DialogDescription>
            Agrupe pedidos para a cortadeira **{cutter}**.
          </DialogDescription>
        </DialogHeader>
        <form id="lot-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="lot-name">Nome do Lote</Label>
              <Input
                id="lot-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lote Semana 1 - Uniformes"
              />
          </div>
          
          <div>
            <Label>Pedidos Disponíveis para "{cutter}"</Label>
            <ScrollArea className="h-64 mt-2 border rounded-md">
              <div className="p-4 space-y-2">
                {availableOrders.length > 0 ? (
                  availableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`order-${order.id}`}
                          checked={selectedOrderIds.includes(order.id)}
                          onCheckedChange={(checked) => handleOrderSelect(order.id, !!checked)}
                        />
                        <Label htmlFor={`order-${order.id}`} className="font-normal">
                          <span className="font-medium">#{order.id.replace('ORD','')} - {order.customerName}</span> ({order.model})
                        </Label>
                      </div>
                      <Badge variant="outline">{order.quantity} peças</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center p-4">
                    Nenhum pedido disponível na fila de corte para esta cortadeira.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
           <div className="flex justify-between items-center text-sm font-medium">
                <span>Pedidos selecionados: {selectedOrderIds.length}</span>
                <span>Total de Peças: {totalPieces}</span>
            </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="submit" form="lot-form">Salvar Lote</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
