

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mockOrders, mockCustomers } from '@/lib/mock-data';
import { dataStore } from '@/lib/data-store';
import type { Order, Customer, StageHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Printer, Edit, ArrowLeft, Eye, Home, Clock, MessageSquare, QrCode } from 'lucide-react';
import { buildWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import { OrderCostBreakdown } from '@/components/orders/order-cost-breakdown';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';

function DetailItem({ label, value, children, className }: { label: string; value?: string | React.ReactNode; children?: React.ReactNode; className?: string }) {
  const content = children ?? value;
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  return (
    <div className={cn("flex flex-col print:grid print:grid-cols-2", className)}>
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

interface OrderDetailsPageProps {}

export default function OrderDetailsPage({}: OrderDetailsPageProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const { showLoader } = useLoader();

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showActions, setShowActions] = useState(false);
  
  const printParam = searchParams.get('print') === 'true';
  const showActionsParam = searchParams.get('showActions') === 'true';

  useEffect(() => {
    const foundOrder = dataStore.getOrderById(id) || mockOrders.find(o => o.id === `ORD${id}` || o.id === id || o.id.replace('ORD', '') === id);
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
    if (showActionsParam) {
        setShowActions(true);
    }
  }, [id, showActionsParam]);

  useEffect(() => {
    if (printParam && order) {
      const handleAfterPrint = () => {
        router.back();
      };
      
      window.addEventListener('afterprint', handleAfterPrint);
      
      setTimeout(() => {
          window.print();
      }, 500); // 500ms delay to ensure content is rendered

      return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [printParam, order, router]);


  const handleBackClick = () => {
    showLoader();
    router.back();
  };
  
  const handlePrintClick = () => {
    router.push(`/dashboard/orders/${id}?print=true`);
  };

  if (!order || !customer) {
    return <div>Pedido ou cliente não encontrado.</div>;
  }

  const getPaymentConditionString = (pc: Order['paymentCondition']) => {
    if (!pc) return '';
    if (Array.isArray(pc)) return pc.join(', ');
    return pc;
  };


  return (
     <div className="flex flex-col gap-4">
        <div className="no-print">
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
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Detalhes do Pedido</h1>
                    <p className="text-muted-foreground">
                        {customer.companyName} - {customer.responsible}
                    </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="text-green-600 border-green-300 hover:bg-green-50 gap-2"
                        onClick={() => {
                            const phone = customer.phone?.replace(/\D/g, '') || '';
                            if (!phone) {
                                alert('Este cliente não possui WhatsApp cadastrado.');
                                return;
                            }
                            const message = buildWhatsAppMessage(order, customer);
                            openWhatsApp(phone, message);
                        }}
                    >
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                    </Button>
                    <Button onClick={handlePrintClick} variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Imprimir Ficha
                    </Button>
                    <LoaderLink href={`/dashboard/orders/${order.id.replace('ORD', '')}/edit`}>
                        <Button className="gap-2">
                            <Edit className="h-4 w-4" />
                            Editar Pedido
                        </Button>
                    </LoaderLink>
                </div>
            </div>
        </div>

        <Card className="p-4 sm:p-6 print-content">
            <div className="flex flex-col gap-6">

                {/* Dados Cliente e QR Code */}
                <div className="p-4 border rounded-lg bg-muted/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{customer.companyName}</span>
                                <span className="text-sm text-muted-foreground">{customer.responsible}</span>
                            </div>
                            <DetailItem label="Cidade" value={customer.city} className="text-right" />
                            <DetailItem label="Cód. Pedido" value={`${order.id.replace('ORD', '')}`} className="text-right" />
                        </div>
                        <Separator className="my-2" />
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <DetailItem label="Telefone" value={customer.phone} />
                            <DetailItem label="Email" value={customer.email} className="text-right" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white border rounded-md shadow-sm shrink-0 self-center md:self-auto">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                                typeof window !== 'undefined' ? `${window.location.origin}/dashboard/orders/${order.id.replace('ORD', '')}` : ''
                            )}`}
                            alt={`QR Code Pedido ${order.id}`}
                            className="w-20 h-20"
                        />
                        <span className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                            OP #{order.id.replace('ORD', '')}
                        </span>
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
                
                <div className="print:flex print:gap-6">
                    {/* Descrição Material */}
                    <div className="space-y-2 flex-1">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição do Produto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 p-4 border rounded-lg print:grid-cols-1">
                            <DetailItem label="Modelo" value={order.model} />
                            <DetailItem label="Material" value={order.material} />
                            <DetailItem label="Cor do Produto" value={order.color} />
                            <DetailItem label="Tipo de Manga" value={order.sleeveType} />
                            <DetailItem label="Cor da Manga" value={order.sleeveColor} />
                            <DetailItem label="Cor do Punho" value={order.cuffColor} />
                            <DetailItem label="Tipo de Gola" value={order.collarType} />
                            <DetailItem label="Cor da Gola" value={order.collarColor} />
                            <DetailItem label="Adicional" value={order.additional} />
                            <DetailItem label="Estampa" value={order.type} className="md:col-start-3 md:text-right print:text-left" />
                        </div>
                    </div>

                    {/* Financeiro e Prazos */}
                    <div className="space-y-2 flex-1 mt-6 print:mt-0">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financeiro e Prazos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg print:grid-cols-2 print:lg:grid-cols-2">
                            <DetailItem label="Data Encomenda" value={new Date(order.orderDate).toLocaleDateString('pt-BR')} />
                            <DetailItem label="Data Entrega" value={new Date(order.deliveryDate).toLocaleDateString('pt-BR')} />
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

                {/* Custos e Rentabilidade (Exclusivo para Gestão - Oculto na Impressão da Fábrica) */}
                {order.costDetails && (
                    <div className="no-print">
                        <OrderCostBreakdown 
                            costDetails={order.costDetails} 
                            totalValue={order.value} 
                            quantity={order.quantity} 
                        />
                    </div>
                )}

                {/* Status do Pedido */}
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
            </div>
        </Card>
        
        {showActions && (
            <div className="flex justify-end gap-2 mt-4 no-print">
                <Link href={`/dashboard/orders/${order.id.replace('ORD', '')}/edit`}>
                    <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Pedido
                    </Button>
                </Link>
                <Button variant="outline" onClick={handlePrintClick}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>
        )}

    </div>
  );
}


