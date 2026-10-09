
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { mockCustomers, mockOrders } from '@/lib/mock-data';
import { dataStore } from '@/lib/data-store';
import type { Customer, Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Edit, ArrowLeft, Home, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || '-'}</dd>
    </div>
  );
}

function CustomerDetailsCard({ customer }: { customer: Customer }) {
    return (
        <Card className="w-full max-w-4xl mx-auto print-content">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Image
                alt="Logo do cliente"
                className="aspect-square rounded-md object-cover"
                height="100"
                src={customer.imageUrl ?? 'https://placehold.co/100x100.png'}
                width="100"
                data-ai-hint="logo company"
                />
            <div className="flex-1">
                <CardTitle className="text-2xl">{customer.companyName}</CardTitle>
                <CardDescription>{customer.responsible} - {customer.role}</CardDescription>
            </div>
            </CardHeader>
            <CardContent>
            <dl className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                    <DetailItem label="Email" value={customer.email} />
                    <DetailItem label="Telefone" value={customer.phone} />
                    <DetailItem label="CNPJ" value={customer.cnpj} />
                    <DetailItem label="CPF" value={customer.cpf} />
                    <DetailItem label="Endereço" value={customer.address} />
                    <DetailItem label="Cidade" value={customer.city} />
                    <DetailItem label="UF" value={customer.uf} />
                </div>
            </dl>
            </CardContent>
        </Card>
    );
}

function OrderRow({ order }: { order: Order }) {
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    setOrderDate(new Date(order.orderDate).toLocaleDateString('pt-BR'));
    setDeliveryDate(new Date(order.deliveryDate).toLocaleDateString('pt-BR'));
  }, [order.orderDate, order.deliveryDate]);

  return (
      <TableRow key={order.id}>
          <TableCell>{order.id.replace('ORD', '')}</TableCell>
          <TableCell>{order.model}</TableCell>
          <TableCell>{orderDate}</TableCell>
          <TableCell>{deliveryDate}</TableCell>
          <TableCell><Badge variant="outline">{order.stage}</Badge></TableCell>
          <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}</TableCell>
          <TableCell className="no-print">
              <OrderDetailsDialog
                  orderId={order.id}
                  showActions={true}
                  trigger={
                      <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                      </Button>
                  }
              />
          </TableCell>
      </TableRow>
  )
}


function CustomerOrdersTable({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Nenhum pedido encontrado para este cliente.
            </div>
        );
    }
    
    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
                <CardDescription>
                    Todos os pedidos registrados para este cliente.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Data Pedido</TableHead>
                            <TableHead>Data Entrega</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="w-[60px] no-print"><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <OrderRow key={order.id} order={order} />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>
    );
}


export default function CustomerDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { id } = params;
  const { showLoader } = useLoader();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  
  const printParam = searchParams?.get('print') === 'true';

  useEffect(() => {
    const foundCustomer = dataStore.getCustomerById(id as string) || mockCustomers.find(c => c.id === id);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      const orders = dataStore.getOrders()
        .filter(o => o.customerId === foundCustomer.id)
        .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      setCustomerOrders(orders);
    }
  }, [id]);

  useEffect(() => {
    if (printParam && customer) {
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
  }, [printParam, customer, router]);
  
  const handleBackClick = () => {
    showLoader();
    router.back();
  };

  const handlePrintClick = () => {
    router.push(`/dashboard/customers/${id}?print=true`);
  };

  if (!customer) {
    return <div>Cliente não encontrado.</div>;
  }

  return (
    <>
     <div className="flex flex-col gap-4 no-print">
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
            <h1 className="text-2xl font-bold tracking-tight font-headline">Ficha do Cliente</h1>
            <p className="text-muted-foreground">
              Detalhes completos do cliente.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LoaderLink href={`/dashboard/customers/${customer.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </LoaderLink>
          <Button variant="outline" onClick={handlePrintClick}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <CustomerDetailsCard customer={customer} />
      
      <CustomerOrdersTable orders={customerOrders} />

    </div>
    <div className="print-only">
        <div className="flex flex-col gap-8">
            <CustomerDetailsCard customer={customer} />
            <Separator />
            <CustomerOrdersTable orders={customerOrders} />
        </div>
    </div>
    </>
  );
}

    