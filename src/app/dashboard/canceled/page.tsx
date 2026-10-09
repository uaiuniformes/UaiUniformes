
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoreHorizontal, Search, Eye, ArrowLeft, Home, RefreshCw } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

interface OrderRowProps {
  order: Order;
  onResumeOrder: (orderId: string) => void;
}

function OrderRow({ order, onResumeOrder }: OrderRowProps) {
  const router = useRouter();
  const [daysInProduction, setDaysInProduction] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    if (order.orderDate) {
      const today = new Date();
      const orderDate = new Date(order.orderDate);
      setDaysInProduction(differenceInDays(today, orderDate));
    }
  }, [order.orderDate]);
  
  const abbreviatedTypes = order.type.map(t => sublimationAbbreviations[t] || t);


  return (
    <TableRow key={order.id}>
      <TableCell className="p-2 font-medium w-[80px]">
        {order.id.replace('ORD', '')}
      </TableCell>
      <TableCell className="p-2">{order.customerName}</TableCell>
      <TableCell className="p-2">{order.customerResponsible}</TableCell>
      <TableCell className="p-2">{order.model}</TableCell>
      <TableCell className="p-2">
        <Badge variant="secondary">{abbreviatedTypes.join(', ')}</Badge>
      </TableCell>
      <TableCell className="p-2 text-center">{daysInProduction}</TableCell>
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
            <DialogTitle className="sr-only">Layout do Pedido {order.customerName} - {order.model}</DialogTitle>
            <Carousel>
              <CarouselContent>
                {(order.imageUrls || [`https://placehold.co/800x400.png`]).map((url, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={url}
                      alt={`${order.model} - Imagem ${index + 1}`}
                      width={800}
                      height={400}
                      className="rounded-md"
                      data-ai-hint="clothing apparel"
                    />
                  </CarouselItem>
                ))}
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
          <OrderDetailsDialog
            orderId={order.id}
            isProductionStage={true}
            trigger={
                <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Retomar Pedido
                    </DropdownMenuItem>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retomar Pedido?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja reativar o pedido de {order.customerName}? Ele voltará para a etapa em que estava antes do cancelamento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Não</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onResumeOrder(order.id)}>Sim, retomar</AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

function CanceledPageContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { orders, restoreOrder } = useOrders();
  const router = useRouter();
  const { showLoader } = useLoader();

  const handleBackClick = () => {
    showLoader();
    router.back();
  }

  const baseOrders = React.useMemo(() => {
    return orders
      .filter((order) => order.stage === 'Cancelado')
      .sort(
        (a, b) => {
             const historyA = (a.stageHistory || []).slice(-1)[0]?.startDate;
             const historyB = (b.stageHistory || []).slice(-1)[0]?.startDate;
             if (historyA && historyB) {
                return new Date(historyB).getTime() - new Date(historyA).getTime();
             }
             return 0;
        }
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
      const deliveryDate = order.deliveryDate ? format(new Date(order.deliveryDate), 'dd/MM/yyyy') : '';
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

  const handleResumeOrder = (orderId: string) => {
    const orderToResume = orders.find(o => o.id === orderId);
    if (!orderToResume) {
      toast({
        title: 'Erro ao Retomar',
        description: 'Pedido não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    // Find the last stage *before* the "Cancelado" stage.
    const historyBeforeCancel = (orderToResume.stageHistory || []).filter(h => h.stage !== 'Cancelado' && h.stage !== 'Deletado');
    const lastStageBeforeCancel = (historyBeforeCancel[historyBeforeCancel.length - 1]?.stage || 'Corte') as Exclude<OrderStage, 'Cancelado' | 'Deletado'>;
    
    restoreOrder(orderId, lastStageBeforeCancel);

    toast({
        title: 'Pedido Retomado!',
        description: `O pedido de ${orderToResume.customerName} voltou para a etapa "${lastStageBeforeCancel}". O histórico foi atualizado.`
    });
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
                Pedidos Cancelados
              </h1>
              <p className="text-muted-foreground">
                Visualize todos os pedidos cancelados.
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
                <TableHead className="h-10 px-2">Modelo</TableHead>
                <TableHead className="h-10 px-2">Estampa</TableHead>
                <TableHead className="h-10 px-2">Dias Prod.</TableHead>
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
                    onResumeOrder={handleResumeOrder}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="p-2 text-center h-24">
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

export default function CanceledPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <CanceledPageContent />
    </React.Suspense>
  );
}
