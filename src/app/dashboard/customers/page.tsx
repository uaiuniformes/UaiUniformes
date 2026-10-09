
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { mockCustomers, mockOrders } from '@/lib/mock-data';
import { useCustomers, dataStore } from '@/lib/data-store';
import { MoreHorizontal, Search, FileText, Printer, UserPlus, ArrowLeft, Home, Edit, Trash2, History, Eye, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Customer, Order } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OrderDetailsDialog } from '@/components/orders/order-details-dialog';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { useLoader } from '@/hooks/use-loader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

function CustomerOrdersTable({ orders }: { orders: Order[] }) {
    if (orders.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Nenhum pedido encontrado para este cliente.
            </div>
        );
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Data Pedido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[60px]"><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>{order.id.replace('ORD', '')}</TableCell>
                        <TableCell>{order.model}</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell><Badge variant="outline">{order.stage}</Badge></TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.value)}</TableCell>
                        <TableCell>
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
                ))}
            </TableBody>
        </Table>
    );
}

function CustomerHistoryDialog({ customerId, trigger }: { customerId: string, trigger: React.ReactNode }) {
    const router = useRouter();
    const [customerOrders, setCustomerOrders] = React.useState<Order[]>([]);
    const [customer, setCustomer] = React.useState<Customer | null>(null);

    React.useEffect(() => {
        const foundCustomer = dataStore.getCustomerById(customerId) || mockCustomers.find(c => c.id === customerId);
        if (foundCustomer) {
            setCustomer(foundCustomer);
            const orders = dataStore.getOrders()
                .filter(o => o.customerId === foundCustomer.id)
                .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
            setCustomerOrders(orders);
        }
    }, [customerId]);

    if (!customer) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Histórico de Pedidos de {customer.companyName}</DialogTitle>
                    <DialogDescription>
                        Todos os pedidos registrados para este cliente.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <CustomerOrdersTable orders={customerOrders} />
                </div>
            </DialogContent>
        </Dialog>
    );
}


export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { customers, deleteCustomer } = useCustomers();
  const router = useRouter();
  const { showLoader } = useLoader();
  const { toast } = useToast();

  const filteredCustomers = React.useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) {
      return customers;
    }
    
    return customers.filter(customer => {
      const termAsNumberOnly = lowercasedTerm.replace(/[^\d]/g, '');

      const matchesText = Boolean(
        customer.companyName?.toLowerCase().includes(lowercasedTerm) ||
        customer.responsible?.toLowerCase().includes(lowercasedTerm) ||
        customer.email?.toLowerCase().includes(lowercasedTerm) ||
        customer.city?.toLowerCase().includes(lowercasedTerm) ||
        customer.uf?.toLowerCase().includes(lowercasedTerm)
      );

      let matchesNumber = false;
      if (termAsNumberOnly.length > 0) {
        matchesNumber = Boolean(
          customer.phone?.replace(/[^\d]/g, '').includes(termAsNumberOnly) ||
          customer.cnpj?.replace(/[^\d]/g, '').includes(termAsNumberOnly) ||
          customer.cpf?.replace(/[^\d]/g, '').includes(termAsNumberOnly)
        );
      }
      
      return matchesText || matchesNumber;
    });
  }, [searchTerm, customers]);


  const displayValue = (value: string | undefined | null) => value || '-';
  
  const handleBackClick = () => {
    showLoader();
    router.back();
  }

  const handlePrint = (customerId: string) => {
    const url = `/dashboard/customers/${customerId}?print=true`;
    router.push(url);
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    deleteCustomer(customerId);
    toast({
        title: "Cliente Excluído",
        description: "O cliente foi removido com sucesso.",
        variant: "destructive"
    });
  }

  return (
    <Card>
      <CardHeader>
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
                    <CardTitle className="text-xl font-bold">Clientes Cadastrados</CardTitle>
                    <CardDescription>
                      Gerencie sua base de clientes ({filteredCustomers.length} cadastrados).
                    </CardDescription>
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar clientes..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <LoaderLink href="/dashboard/customers/new">
                    <Button className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-800 hover:to-red-600 text-white shadow-sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Cliente
                    </Button>
                </LoaderLink>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Avatar</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cliente / Contato</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp / Telefone</TableHead>
              <TableHead>CNPJ / CPF</TableHead>
              <TableHead>Cidade / UF</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => {
                const nameForInitials = customer.companyName || customer.responsible || 'CL';
                const initials = nameForInitials
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : '';

                return (
                  <TableRow key={customer.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <TableCell>
                      {customer.imageUrl && !customer.imageUrl.includes('placehold.co') ? (
                        <Image
                          alt="Logo do cliente"
                          className="h-10 w-10 rounded-xl object-cover border"
                          height="40"
                          src={customer.imageUrl}
                          width="40"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-700 to-rose-500 font-bold text-xs text-white shadow-xs">
                          {initials}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{displayValue(customer.companyName)}</TableCell>
                    <TableCell className="text-sm text-foreground">{displayValue(customer.responsible)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{displayValue(customer.email)}</TableCell>
                    <TableCell>
                      {cleanPhone ? (
                        <a
                          href={`https://wa.me/55${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all hover:scale-102"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100" />
                          <span>{displayValue(customer.phone)}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{displayValue(customer.cnpj || customer.cpf)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">{displayValue(customer.city)}</Badge>
                        <Badge variant="secondary" className="text-xs">{displayValue(customer.uf)}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                         <LoaderLink href={`/dashboard/customers/${customer.id}`}>
                            <DropdownMenuItem>
                               <FileText className="mr-2 h-4 w-4" />
                               Ver Ficha Completa
                            </DropdownMenuItem>
                         </LoaderLink>
                        <CustomerHistoryDialog 
                            customerId={customer.id} 
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <History className="mr-2 h-4 w-4" />
                                    Histórico de Pedidos
                                </DropdownMenuItem>
                            }
                        />
                        <LoaderLink href={`/dashboard/customers/${customer.id}/edit`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </LoaderLink>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handlePrint(customer.id); }}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-600 focus:bg-red-50">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente
                                        <span className="font-bold"> {customer.companyName} ({customer.responsible})</span>.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCustomer(customer.id)}>
                                        Sim, excluir cliente
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
              })
            ) : (
                <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                        Nenhum cliente encontrado.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
