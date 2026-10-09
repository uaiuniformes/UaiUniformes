
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { mockOrders, mockCustomers } from '@/lib/mock-data';
import { dataStore } from '@/lib/data-store';
import type { Order, Customer } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Edit, Printer, RefreshCcw, MessageSquare, QrCode, Copy } from 'lucide-react';
import { buildWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import { OrderCostBreakdown } from './order-cost-breakdown';
import Link from 'next/link';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '../dashboard/loader-link';


function DetailItem({ label, value, children, className }: { label: string; value?: string | React.ReactNode; children?: React.ReactNode; className?: string }) {
  const content = children ?? value;
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  return (
    <div className={cn("flex flex-col", className)}>
      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
      <dd className="text-sm">{Array.isArray(content) ? content.join(', ') : content}</dd>
    </div>
  );
}

function SizeGrid({ sizes }: { sizes?: Record<string, number> }) {
    if (!sizes || Object.keys(sizes).length === 0) {
        return null;
    }

    const sizeOrder = {
        tradicional: ['PP', 'P', 'M', 'G', 'GG', 'EG', 'EGG', 'BIG P', 'BIG M', 'BIG G', 'Amostra', 'Sob Medida'],
        babylook: ['PP baby', 'P baby', 'M baby', 'G baby', 'GG baby', 'EG baby', 'EGG baby', 'BIG P baby', 'BIG M baby', 'BIG G baby', 'Amostra baby', 'Sob Medida baby'],
        infantil: ['Tam 2', 'Tam 4', 'Tam 6', 'Tam 8', 'Tam 10', 'Tam 12', 'Tam 14'],
    };

    const renderCategory = (category: 'tradicional' | 'babylook' | 'infantil', title: string) => {
        const categorySizes = sizeOrder[category]
            .map(size => ({ size, quantity: sizes[size] }))
            .filter(item => item.quantity > 0);

        if (categorySizes.length === 0) {
            return null;
        }

        return (
            <div key={category}>
                <h4 className="text-sm font-medium mb-2">{title}</h4>
                <div className="flex flex-wrap gap-2">
                    {categorySizes.map(({ size, quantity }) => (
                         <div key={size} className="flex flex-col text-center border rounded-md p-1 w-16">
                            <span className="font-bold text-sm">{quantity}</span>
                            <span className="text-xs text-muted-foreground truncate">{size}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    return (
        <div className="space-y-4">
            {renderCategory('tradicional', 'Tradicional')}
            {renderCategory('babylook', 'Babylook')}
            {renderCategory('infantil', 'Infantil')}
        </div>
    );
}

interface OrderDetailsDialogProps {
  orderId: string;
  trigger: React.ReactNode;
  showActions?: boolean;
  isProductionStage?: boolean;
}

export function OrderDetailsDialog({ orderId, trigger, showActions = false, isProductionStage = false }: OrderDetailsDialogProps) {
  const router = useRouter();
  const { showLoader } = useLoader();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const foundOrder = dataStore.getOrderById(orderId) || mockOrders.find(o => o.id === orderId || o.id === `ORD${orderId}` || o.id.replace('ORD', '') === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
      const foundCustomer = dataStore.getCustomerById(foundOrder.customerId) || mockCustomers.find(c => c.id === foundOrder.customerId);
      if (foundCustomer) {
        setCustomer(foundCustomer);
      } else {
        setCustomer({
          id: foundOrder.customerId || 'cust-generic',
          companyName: foundOrder.customerName || 'Cliente',
          responsible: foundOrder.customerResponsible || 'Responsável',
          role: 'Cliente',
          email: '',
          phone: '',
          address: '',
          cnpj: '',
          city: '',
          uf: '',
        });
      }
    }
  }, [orderId]);
  
  const handlePrintClick = () => {
    if (!order) return;
    showLoader();
    const url = `/dashboard/orders/${order.id.replace('ORD', '')}?print=true`;
    router.push(url);
  };

  const handleRepeatOrder = () => {
    if (!order) return;
    showLoader();
    router.push(`/dashboard/orders/${order.id.replace('ORD', '')}/edit`);
  };

  const handleWhatsAppNotify = () => {
    if (!order || !customer) return;
    const phone = customer.phone?.replace(/\D/g, '') || '';
    if (!phone) {
      alert('Este cliente não possui telefone/WhatsApp cadastrado.');
      return;
    }
    const message = buildWhatsAppMessage(order, customer);
    openWhatsApp(phone, message);
  };

  if (!order || !customer) {
    return trigger; // Render only the trigger if data is not yet found
  }
  
  const getPaymentConditionString = (pc: Order['paymentCondition']) => {
    if (!pc) return '';
    if (Array.isArray(pc)) return pc.join(', ');
    return pc;
  };
  
  const isDelivered = order.stage === 'Entregue';

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido {order.id.replace('ORD', '')}</DialogTitle>
          <DialogDescription>
            {customer.companyName} - {customer.responsible}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <Card className="p-4 sm:p-6 shadow-none border-0">
                <div className="flex flex-col gap-6">

                    {/* Dados Cliente */}
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{customer.companyName}</span>
                                <span className="text-sm text-muted-foreground">{customer.responsible}</span>
                            </div>
                            <DetailItem label="Cidade" value={customer.city} className="text-right" />
                            <DetailItem label="Cód. Pedido" value={`${order.id.replace('ORD', '')}`} className="text-right" />
                        </div>
                        <Separator className="my-3" />
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <DetailItem label="Telefone" value={customer.phone} />
                                {customer.phone && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 h-7 text-xs gap-1 ml-2 mt-2"
                                        onClick={handleWhatsAppNotify}
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        WhatsApp
                                    </Button>
                                )}
                            </div>
                            <DetailItem label="Email" value={customer.email} className="text-right" />
                        </div>
                    </div>

                    {/* Card de Rastreio com QR Code e Notificação */}
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 border rounded-md shadow-sm shrink-0">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                                        typeof window !== 'undefined' ? `${window.location.origin}/dashboard/orders/${order.id.replace('ORD', '')}` : ''
                                    )}`}
                                    alt={`QR Code Pedido ${order.id}`}
                                    className="w-20 h-20"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <QrCode className="h-4 w-4 text-primary" />
                                    Ficha & Rastreamento da Produção
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Escaneie com a câmera do celular para abrir esta Ordem de Produção instantaneamente na fábrica.
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-xs font-mono bg-white px-2 py-0.5 border rounded text-muted-foreground">
                                        Pedido #{order.id.replace('ORD', '')}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs gap-1 text-primary hover:underline px-1.5"
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                navigator.clipboard?.writeText(`${window.location.origin}/dashboard/orders/${order.id.replace('ORD', '')}`);
                                                alert('Link do pedido copiado com sucesso!');
                                            }
                                        }}
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copiar Link
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 h-9 text-xs"
                                onClick={handleWhatsAppNotify}
                            >
                                <MessageSquare className="h-4 w-4" />
                                Notificar no WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Grade de Tamanhos */}
                    {order.sizes && Object.values(order.sizes).some(qty => qty > 0) && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade de Tamanhos</h3>
                            <div className="p-4 border rounded-lg">
                                <SizeGrid sizes={order.sizes} />
                            </div>
                        </div>
                    )}

                    {/* Descrição Material */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição do Produto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 p-4 border rounded-lg">
                            <DetailItem label="Modelo" value={order.model} />
                            <DetailItem label="Material" value={order.material} />
                            <DetailItem label="Cor do Produto" value={order.color} />
                            <DetailItem label="Tipo de Manga" value={order.sleeveType} />
                            <DetailItem label="Cor da Manga" value={order.sleeveColor} />
                            <DetailItem label="Cor do Punho" value={order.cuffColor} />
                            <DetailItem label="Tipo de Gola" value={order.collarType} />
                            <DetailItem label="Cor da Gola" value={order.collarColor} />
                            <DetailItem label="Adicional" value={order.additional} />
                            <DetailItem label="Estampa" value={order.type} className="md:col-start-3 md:text-right" />
                        </div>
                    </div>


                    {/* Layout */}
                    {order.imageUrls && order.imageUrls.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layout</h3>
                            <Carousel className="w-full">
                            <CarouselContent>
                                {order.imageUrls.map((url, index) => (
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
                                ))}
                            </CarouselContent>
                            {order.imageUrls.length > 1 && (
                                <>
                                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                </>
                            )}
                            </Carousel>
                        </div>
                    )}
                    
                     {/* Observações */}
                    <DetailItem label="Observações" value={order.notes} />

                    {/* Financeiro e Prazos */}
                    {!isProductionStage && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financeiro e Prazos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg">
                                <DetailItem label="Data Encomenda" value={new Date(order.orderDate).toLocaleDateString('pt-BR')} />
                                <DetailItem label="Valor UND" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value / order.quantity)} />
                                <DetailItem label="Qtd Peças" value={order.quantity.toString()} />
                                <DetailItem label="Total Pedido" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)} />
                                <DetailItem label="Valor de Entrada" value={order.amountPaid ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.amountPaid) : undefined} />
                                <DetailItem label="Data da Entrada" value={order.entryDate ? new Date(order.entryDate).toLocaleDateString('pt-BR') : undefined} />
                                <DetailItem label="Valor Restante Pago" value={order.remainingAmountPaid ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.remainingAmountPaid) : undefined} />
                                <DetailItem label="Data Pag. Final" value={order.finalPaymentDate ? new Date(order.finalPaymentDate).toLocaleDateString('pt-BR') : undefined} />
                                <DetailItem label="Forma de Pagamento" value={getPaymentConditionString(order.paymentMethod)} />
                                <DetailItem label="Condição de Pagamento" value={getPaymentConditionString(order.paymentCondition)} />
                            </div>
                        </div>
                    )}

                    {/* Custos e Lucro - Exclusivo para Gestão e Produção Geral */}
                    {!isProductionStage && order.costDetails && (
                        <OrderCostBreakdown 
                            costDetails={order.costDetails} 
                            totalValue={order.value} 
                            quantity={order.quantity} 
                        />
                    )}

                    {/* Status do Pedido */}
                    {!isProductionStage && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status do Pedido</h3>
                            <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg">
                                <DetailItem label="Situação Atual">
                                    <Badge variant={order.isPriority ? "destructive" : "default"}>{order.stage}</Badge>
                                </DetailItem>
                                <DetailItem label="Tipo de Produção">
                                    <Badge variant="secondary">{order.productionType}</Badge>
                                </DetailItem>
                                <DetailItem label="Responsável Interno" value={order.responsible} />
                                <DetailItem label="Responsável do Corte" value={order.cutter} />
                            </div>
                        </div>
                    )}
                    
                    {isProductionStage && (
                        <div className="space-y-2 mt-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prazo</h3>
                            <div className="p-4 border rounded-lg">
                                <DetailItem label="Data de Entrega" value={new Date(order.deliveryDate).toLocaleDateString('pt-BR')} />
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </ScrollArea>
        <DialogFooter className="gap-2 flex flex-col sm:flex-row items-center justify-between pt-2">
            <Button 
                type="button" 
                variant="outline" 
                className="text-green-600 border-green-300 hover:bg-green-50 gap-2 w-full sm:w-auto"
                onClick={handleWhatsAppNotify}
            >
                <MessageSquare className="h-4 w-4" />
                Notificar WhatsApp
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button variant="outline" onClick={handlePrintClick}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Ficha
                </Button>
                {showActions && !isDelivered && (
                    <LoaderLink href={`/dashboard/orders/${order.id.replace('ORD', '')}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Pedido
                        </Button>
                    </LoaderLink>
                )}
                {isDelivered && showActions && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Repetir Pedido
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Repetir Pedido?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Isso criará um **novo pedido** com as mesmas informações deste, que começará do início do processo de produção. O pedido original permanecerá nos entregues. Deseja continuar?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Não</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRepeatOrder}>Sim, repetir</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
