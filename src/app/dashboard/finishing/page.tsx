
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, Check, ArrowLeft, Home, MoreHorizontal, Trash2, XCircle, Printer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockOrders } from '@/lib/mock-data';
import { useOrders } from '@/lib/data-store';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { sendOrderStatusNotification } from '@/components/orders/order-actions';
import type { Order, OrderStage } from '@/lib/types';
import { orderSituations } from '@/components/orders/order-constants';
import { differenceInDays, format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { FinishingChecklistDialog } from '@/components/orders/finishing-checklist-dialog';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';


const allStages: readonly OrderStage[] = orderSituations;

const sublimationAbbreviations: { [key: string]: string } = {
  'Sublimação Total Costas': 'Subl T. Costas',
  'Sublimação Total Frente': 'Subl T. Frente',
  'Sublimação Parcial A3': 'Subl A3',
  'Sublimação Parcial A4': 'Subl A4',
  'Sublimação Camisa Total': 'Subl Total',
  'Sublimação Total Mangas': 'Subl Mangas',
};

const STAGE_DEADLINE = 5; // 5 dias para Arremate

interface OrderRowProps {
  order: Order;
  onStageChange: (orderId: string, newStage: OrderStage, isOverdue: boolean, correctionReason?: string) => void;
}

function OrderRow({ order, onStageChange }: OrderRowProps) {
  const [daysInProduction, setDaysInProduction] = React.useState<number | null>(null);
  const [daysInStage, setDaysInStage] = React.useState<number | null>(null);
  const [deliveryDate, setDeliveryDate] = React.useState<string>('');
  const [isStageOverdue, setIsStageOverdue] = React.useState(false);

  React.useEffect(() => {
    if (order.deliveryDate) {
        setDeliveryDate(new Date(order.deliveryDate).toLocaleDateString('pt-BR'));
    }
    if (order.orderDate) {
      const today = new Date();
      const orderDate = new Date(order.orderDate);
      setDaysInProduction(differenceInDays(today, orderDate));
    }
     if (order.stageHistory && order.stageHistory.length > 0) {
      const currentStageEntry = order.stageHistory[order.stageHistory.length - 1];
      if (currentStageEntry) {
        const days = differenceInDays(new Date(), new Date(currentStageEntry.startDate));
        setDaysInStage(days);
        setIsStageOverdue(days > STAGE_DEADLINE);
      }
    }
  }, [order]);

  const getRowColor = () => {
    if (order.isPriority) return 'bg-blue-800 text-white';
    if (daysInProduction === null) return '';
    if (daysInProduction > 45) return 'bg-red-600 text-white';
    if (daysInProduction >= 30) return 'bg-red-300 text-black';
    if (daysInProduction >= 15) return 'bg-yellow-300 text-black';
    return '';
  };
  
  const abbreviatedTypes = order.type.map(t => sublimationAbbreviations[t] || t);

  return (
    <TableRow key={order.id} className={cn(getRowColor(), 'hover:text-black hover:font-bold')}>
      <TableCell className="p-2 font-medium w-[80px]">
        {order.id.replace('ORD', '')}
      </TableCell>
      <TableCell className="p-2">{order.customerName}</TableCell>
      <TableCell className="p-2">{order.customerResponsible}</TableCell>
      <TableCell className="p-2">
        <Badge variant="secondary">{abbreviatedTypes.join(', ')}</Badge>
      </TableCell>
      <TableCell className="p-2">{deliveryDate}</TableCell>
      <TableCell className="p-2 text-center">{daysInProduction}</TableCell>
      <TableCell className="p-2 text-center">{daysInStage}</TableCell>
      <TableCell className="p-2">
        <Dialog>
          <DialogTrigger asChild>
            <Image
              src={order.imageUrls?.[0] || `https://placehold.co/40x40.png`}
              alt={order.model}
              width={40}
              height={40}
              className="rounded-md cursor-pointer"
              data-ai-hint="clothing apparel"
            />
          </DialogTrigger>
          <DialogContent className="p-0 max-w-2xl bg-transparent border-0 shadow-none">
            <DialogHeader>
              <DialogTitle className="sr-only">
                Layout do Pedido {order.customerName} - {order.model}
              </DialogTitle>
            </DialogHeader>
            <Carousel>
              <CarouselContent>
                {(order.imageUrls || [`https://placehold.co/800x400.png`]).map(
                  (url, index) => (
                    <CarouselItem key={index}>
                       <Dialog>
                          <DialogTrigger asChild>
                              <div className="p-1">
                                  <Image
                                      src={url}
                                      alt={`Referência ${index + 1}`}
                                      width={800}
                                      height={400}
                                      className="rounded-md object-cover cursor-pointer aspect-[2/1] w-full"
                                      data-ai-hint="clothing apparel"
                                  />
                              </div>
                          </DialogTrigger>
                          <DialogContent className="p-0 max-w-4xl bg-transparent border-0 shadow-none">
                              <DialogTitle className="sr-only">Layout do Pedido {order.model} - Imagem {index + 1}</DialogTitle>
                              <Image
                                  src={url}
                                  alt={`Referência ${index + 1}`}
                                  width={1200}
                                  height={600}
                                  className="rounded-md"
                                  data-ai-hint="clothing apparel"
                              />
                          </DialogContent>
                      </Dialog>
                    </CarouselItem>
                  )
                )}
              </CarouselContent>
              {order.imageUrls && order.imageUrls.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                </>
              )}
            </Carousel>
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell className="p-2">
        <div className="flex items-center gap-2">
          {isStageOverdue && (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant='outline' size="icon" className="border-purple-500 text-purple-500 hover:bg-purple-50 animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-purple-500" /> Alerta de Prazo Excedido</DialogTitle>
                         <DialogDescription>Pedido: {order.id.replace('ORD', '')} - {order.customerName}</DialogDescription>
                    </DialogHeader>
                    <p className="py-4 text-sm">
                       Este material passou o prazo de <strong>{STAGE_DEADLINE} dias</strong> estabelecido para a etapa de <strong>Arremate</strong>. Por favor, regularize-o para não ocorrer atraso na entrega final do pedido.
                    </p>
                </DialogContent>
            </Dialog>
          )}
            <FinishingChecklistDialog
                order={order}
                onConfirm={(nextStage, reason) => onStageChange(order.id, nextStage, isStageOverdue, reason)}
            >
                <Button variant={getRowColor() ? 'inverted' : 'outline'} size="icon">
                    <Check className="h-4 w-4" />
                </Button>
            </FinishingChecklistDialog>
          <OrderDetailsDialog
            orderId={order.id}
            isProductionStage={true}
            trigger={
                <Button variant={getRowColor() ? 'inverted' : 'outline'} size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function FinishingPageContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { orders, advanceOrderStage } = useOrders();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const handleBackClick = () => {
    showLoader();
    router.back();
  }

  const baseOrders = React.useMemo(() => {
    return orders
      .filter((order) => order.stage === 'Arremate')
      .sort(
        (a, b) =>
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
      );
  }, [orders]);

  const [filteredOrders, setFilteredOrders] =
    React.useState<Order[]>(baseOrders);

  React.useEffect(() => {
    setFilteredOrders(baseOrders);
  }, [baseOrders]);

  React.useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) {
      setFilteredOrders(baseOrders);
      return;
    }

    const results = baseOrders.filter((order) => {
      const deliveryDate = new Date(order.deliveryDate).toLocaleDateString('pt-BR');
      return (
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.customerResponsible.toLowerCase().includes(lowercasedTerm) ||
        order.model.toLowerCase().includes(lowercasedTerm) ||
        order.type.join(', ').toLowerCase().includes(lowercasedTerm) ||
        deliveryDate.includes(lowercasedTerm)
      );
    });
    setFilteredOrders(results);
  }, [searchTerm, baseOrders]);

  const handleStageChange = async (orderId: string, newStage: OrderStage, isOverdue: boolean, correctionReason?: string) => {
    showLoader();
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const order = orders.find((o) => o.id === orderId);
        advanceOrderStage(orderId, newStage, correctionReason ? { reason: correctionReason } : undefined);
    
        if (order) {
            toast({
            title: 'Etapa do Pedido Atualizada!',
            description: `Pedido de ${order.customerName} movido para "${newStage}".`,
            });
            
            const notificationResult = await sendOrderStatusNotification(order, isOverdue);
            if (notificationResult.customerMessage) {
            toast({
                title: 'Notificação para Cliente',
                description: notificationResult.customerMessage,
                variant: notificationResult.success ? 'default' : 'destructive',
            });
            }
            if (notificationResult.internalMessage) {
                toast({
                title: 'Notificação Interna',
                description: notificationResult.internalMessage,
                variant: notificationResult.success ? 'default' : 'destructive',
                });
            }
        }
    } finally {
        hideLoader();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                 <Button onClick={handleBackClick} variant="outline" size="icon" className="h-8 w-8 mb-1">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <LoaderLink href="/dashboard">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <Home className="h-4 w-4" />
                    </Button>
                </LoaderLink>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-headline">
                Arremate
              </h1>
              <p className="text-muted-foreground">
                Pedidos na etapa de arremate.
              </p>
            </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pedidos..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10 px-2 w-[80px]">Pedido</TableHead>
                <TableHead className="h-10 px-2">Empresa</TableHead>
                <TableHead className="h-10 px-2">Cliente</TableHead>
                <TableHead className="h-10 px-2">Estampa</TableHead>
                <TableHead className="h-10 px-2">Data Entrega</TableHead>
                <TableHead className="h-10 px-2">Dias Prod.</TableHead>
                <TableHead className="h-10 px-2">Dias Etapa</TableHead>
                <TableHead className="h-10 px-2">Layout</TableHead>
                <TableHead className="h-10 px-2">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStageChange={handleStageChange}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="p-2 text-center h-24">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FinishingPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <FinishingPageContent />
    </React.Suspense>
  );
}
