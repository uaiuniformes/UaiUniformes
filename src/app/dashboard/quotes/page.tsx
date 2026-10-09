'use client';

import * as React from 'react';
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
import { MoreHorizontal, ArrowLeft, Home, PlusCircle, ArrowRightCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { useQuotes, useCustomers } from '@/lib/data-store';
import { useToast } from '@/hooks/use-toast';
import type { Quote } from '@/lib/types';
import { orderModels, shirtColors, stampTypes } from '@/components/orders/order-constants';

function QuoteRow({ 
  quote, 
  onDelete, 
  onConvert 
}: { 
  quote: Quote;
  onDelete: (id: string) => void;
  onConvert: (id: string) => void;
}) {
  const [creationDate, setCreationDate] = React.useState('');
  const [expirationDate, setExpirationDate] = React.useState('');

  React.useEffect(() => {
    setCreationDate(new Date(quote.creationDate).toLocaleDateString('pt-BR'));
    setExpirationDate(new Date(quote.expirationDate).toLocaleDateString('pt-BR'));
  }, [quote.creationDate, quote.expirationDate]);

  return (
    <TableRow>
      <TableCell className="font-medium">{quote.customerName}</TableCell>
      <TableCell>{quote.productType}</TableCell>
      <TableCell><Badge variant="outline">{quote.color}</Badge></TableCell>
      <TableCell><Badge variant="secondary">{quote.printType}</Badge></TableCell>
      <TableCell>{creationDate}</TableCell>
      <TableCell>{expirationDate}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onConvert(quote.id)} className="text-primary font-medium">
              <ArrowRightCircle className="mr-2 h-4 w-4" />
              Converter em Pedido
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Orçamento
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Orçamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover o orçamento para {quote.customerName}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(quote.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function QuotesPage() {
  const router = useRouter();
  const { showLoader } = useLoader();
  const { toast } = useToast();
  const { quotes, saveQuote, deleteQuote, convertQuoteToOrder } = useQuotes();
  const { customers } = useCustomers();

  const [isNewQuoteOpen, setIsNewQuoteOpen] = React.useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState('');
  const [productType, setProductType] = React.useState<string>(orderModels[0] || 'Tradicional');
  const [color, setColor] = React.useState<string>(shirtColors[0] || 'Branco');
  const [printType, setPrintType] = React.useState<string>(stampTypes[0] || 'Silk');
  const [daysValid, setDaysValid] = React.useState('15');

  const handleBackClick = () => {
    showLoader();
    router.back();
  };

  const handleCreateQuote = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      toast({
        title: 'Cliente obrigatório',
        description: 'Selecione um cliente para vincular ao orçamento.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + (Number(daysValid) || 15) * 86400000);

    saveQuote({
      customerId: customer.id,
      customerName: customer.companyName || customer.responsible,
      creationDate: now.toISOString(),
      expirationDate: expiry.toISOString(),
      productType,
      color,
      printType,
    });

    setIsNewQuoteOpen(false);
    toast({
      title: 'Orçamento Criado!',
      description: `Orçamento para ${customer.companyName} salvo com sucesso.`,
    });
  };

  const handleConvertToOrder = (quoteId: string) => {
    const order = convertQuoteToOrder(quoteId);
    if (order) {
      toast({
        title: 'Convertido com Sucesso!',
        description: `Orçamento transformado no pedido ${order.id}.`,
      });
      router.push('/dashboard/orders');
    }
  };

  const handleDeleteQuote = (quoteId: string) => {
    deleteQuote(quoteId);
    toast({
      title: 'Orçamento Excluído',
      description: 'O orçamento foi removido com sucesso.',
      variant: 'destructive',
    });
  };

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
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>
                Crie e gerencie os orçamentos para seus clientes.
              </CardDescription>
            </div>
          </div>
          
          <Dialog open={isNewQuoteOpen} onOpenChange={setIsNewQuoteOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
                <DialogDescription>
                  Preencha as informações para registrar um orçamento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Cliente / Empresa</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.companyName} {c.responsible ? `(${c.responsible})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Modelo / Peça</Label>
                    <Select value={productType} onValueChange={setProductType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderModels.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Cor</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shirtColors.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Estampa</Label>
                    <Select value={printType} onValueChange={setPrintType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stampTypes.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Validade (Dias)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={daysValid}
                      onChange={(e) => setDaysValid(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewQuoteOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateQuote} disabled={!selectedCustomerId}>Criar Orçamento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Estampa</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Data Validade</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <QuoteRow 
                  key={quote.id} 
                  quote={quote} 
                  onDelete={handleDeleteQuote}
                  onConvert={handleConvertToOrder}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum orçamento cadastrado. Clique em "Criar Orçamento".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
