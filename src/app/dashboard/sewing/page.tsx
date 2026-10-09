
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Eye, Check, ArrowLeft, Home, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StageHeader } from '@/components/dashboard/stage-header';
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
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { sendOrderStatusNotification } from '@/components/orders/order-actions';
import type { Order, OrderStage, Seamstress } from '@/lib/types';
import { orderSituations, seamstresses } from '@/components/orders/order-constants';
import { differenceInDays, format } from 'date-fns';
import { Input } from '@/components/ui/input';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allSeamstresses: (Seamstress | 'Todos')[] = ['Todos', ...seamstresses];

const sublimationAbbreviations: { [key: string]: string } = {
  'Sublimação Total Costas': 'Subl T. Costas',
  'Sublimação Total Frente': 'Subl T. Frente',
  'Sublimação Parcial A3': 'Subl A3',
  'Sublimação Parcial A4': 'Subl A4',
  'Sublimação Camisa Total': 'Subl Total',
  'Sublimação Total Mangas': 'Subl Mangas',
};

const STAGE_DEADLINE = 15; // 15 dias para Costura

interface OrderRowProps {
  order: Order;
  onStageChange: (orderId: string, newStage: OrderStage, isOverdue: boolean) => void;
}

function OrderRow({ order, onStageChange }: OrderRowProps) {
  const [daysInProduction, setDaysInProduction] = React.useState<number | null>(null);
  const [daysInStage, setDaysInStage] = React.useState<number | null>(null);
  const [isStageOverdue, setIsStageOverdue] = React.useState(false);

  React.useEffect(() => {
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

  const nextStage: OrderStage = 'Arremate';

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
      <TableCell className="p-2">{new Date(order.deliveryDate).toLocaleDateString('pt-BR')}</TableCell>
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
                      <Image
                        src={url}
                        alt={`${order.model} - Imagem ${index + 1}`}
                        width={800}
                        height={400}
                        className="rounded-md"
                        data-ai-hint="clothing apparel"
                      />
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
        <Badge variant="outline" className={cn(getRowColor() && "text-black bg-white/70")}>
            {order.seamstress || 'Não definida'}
        </Badge>
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
                       Este material passou o prazo de <strong>{STAGE_DEADLINE} dias</strong> estabelecido para a etapa de <strong>Costura</strong>. Por favor, regularize-o para não ocorrer atraso na entrega final do pedido.
                    </p>
                </DialogContent>
            </Dialog>
          )}
          {nextStage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={getRowColor() ? 'inverted' : 'outline'}
                  size="icon"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Deseja mover o pedido de {order.customerName} - {order.customerResponsible} para a etapa "{nextStage}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onStageChange(order.id, nextStage!, isStageOverdue)}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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

function SewingPageContent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { orders, advanceOrderStage } = useOrders();
  const [selectedSeamstress, setSelectedSeamstress] = React.useState<Seamstress | 'Todos'>('Todos');
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const handleBackClick = () => {
    showLoader();
    router.back();
  }

  const baseOrders = React.useMemo(() => {
    let sewingOrders = orders
      .filter((order) => order.stage === 'Costura')
      .sort(
        (a, b) =>
          new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
      );

    if (selectedSeamstress !== 'Todos') {
        sewingOrders = sewingOrders.filter(order => order.seamstress === selectedSeamstress);
    }
    
    return sewingOrders;
  }, [orders, selectedSeamstress]);

  const [filteredOrders, setFilteredOrders] =
    React.useState<Order[]>(baseOrders);

  const sewingTotalPieces = React.useMemo(() => {
    return baseOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  }, [baseOrders]);

  const sewingOverdueOrders = React.useMemo(() => {
    return baseOrders.filter((o) => {
      const days = o.stageHistory
        ? differenceInDays(new Date(), new Date(o.stageHistory[o.stageHistory.length - 1].startDate))
        : 0;
      return days > STAGE_DEADLINE;
    }).length;
  }, [baseOrders]);

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
      const deliveryDate = format(new Date(order.deliveryDate), 'dd/MM/yyyy');
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

  const handleStageChange = async (orderId: string, newStage: OrderStage, isOverdue: boolean) => {
    showLoader();
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const order = orders.find((o) => o.id === orderId);
        advanceOrderStage(orderId, newStage);
    
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
      <StageHeader
        title={selectedSeamstress === 'Todos' ? 'Setor de Costura & Montagem' : `Setor de Costura: ${selectedSeamstress}`}
        subtitle="Montagem de peças, fechamento, colocação de golas, punhos e acabamentos"
        icon={Wrench}
        badgeText={selectedSeamstress}
        gradient="from-indigo-600 via-purple-500 to-violet-400"
        stats={{
          totalOrders: baseOrders.length,
          totalPieces: sewingTotalPieces,
          priorityOrders: baseOrders.filter((o) => o.isPriority || o.productionType === 'Eventos/Prioridade').length,
          overdueOrders: sewingOverdueOrders,
        }}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleBackClick} variant="outline" size="sm" className="gap-1.5 border-border hover:bg-muted/80">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <LoaderLink href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 border-border hover:bg-muted/80">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </LoaderLink>
        </div>
        <div className='flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto'>
          <Select value={selectedSeamstress} onValueChange={(value) => setSelectedSeamstress(value as Seamstress | 'Todos')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por costureira" />
              </SelectTrigger>
              <SelectContent>
                  {allSeamstresses.map((seamstress) => (
                      <SelectItem key={seamstress} value={seamstress}>
                          {seamstress}
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
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
                <TableHead className="h-10 px-2">Costureira</TableHead>
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
                  <TableCell colSpan={10} className="p-2 text-center h-24">
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

export default function SewingPage() {
  return (
    <React.Suspense fallback={<div>Carregando...</div>}>
      <SewingPageContent />
    </React.Suspense>
  );
}
