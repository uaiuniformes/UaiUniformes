
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { mockOrders } from '@/lib/mock-data';
import type { Order, ProductionLot } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { OrderDetailsDialog } from '../orders/order-details-dialog';

interface CuttingLotDetailsDialogProps {
  lot: ProductionLot;
}

export function CuttingLotDetailsDialog({ lot }: CuttingLotDetailsDialogProps) {
  const [ordersInLot, setOrdersInLot] = React.useState<Order[]>([]);

  React.useEffect(() => {
    const orders = mockOrders.filter((order) => lot.orderIds.includes(order.id));
    setOrdersInLot(orders);
  }, [lot]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Lote: {lot.name}</DialogTitle>
          <DialogDescription>
            Pedidos incluídos neste lote para a cortadeira **{lot.cutter}**. Total de {lot.totalPieces} peças.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Peças</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersInLot.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id.replace('ORD', '')}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.model}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                   <TableCell className="text-center">
                    <OrderDetailsDialog
                      orderId={order.id}
                      isProductionStage={true}
                      trigger={
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
