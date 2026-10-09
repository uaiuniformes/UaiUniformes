'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, ArrowLeft, Home, X, ChevronsUpDown, MessageSquareQuote, Image as ImageIcon } from 'lucide-react';
import { dataStore, useCustomers } from '@/lib/data-store';
import { calculateOrderCosts } from '@/lib/cost-calculator';
import { OrderCostBreakdown } from './order-cost-breakdown';
import type { Customer, Order } from '@/lib/types';
import {
  orderModels,
  materials,
  shirtColors,
  cuffColors,
  sleeveColors,
  collarTypes,
  collarColors,
  sleeveTypes,
  stampTypes,
  additionalItems,
  paymentMethods,
  paymentConditions,
  internalResponsibles,
  orderSituations,
  cutters,
  seamstresses,
  productionTypes,
} from '@/components/orders/order-constants';
import { addDays, subDays, isSaturday, isSunday, isSameDay, parseISO } from 'date-fns';
import { DatePicker } from '@/components/ui/datepicker';
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { brazilianHolidays } from '@/lib/holidays';
import { Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import Image from 'next/image';

function isHoliday(date: Date): boolean {
  return brazilianHolidays.some(holiday => isSameDay(date, holiday.date));
}

function calculateDeliveryDate(startDate: Date): Date {
  let deliveryDate = addDays(new Date(startDate), 30);

  while (isSaturday(deliveryDate) || isSunday(deliveryDate) || isHoliday(deliveryDate)) {
    deliveryDate = subDays(deliveryDate, 1);
  }

  return deliveryDate;
}

const SizeInputGrid = ({ 
  title, 
  sizes, 
  handleSizeChange,
  values = {}
}: { 
  title: string, 
  sizes: string[], 
  handleSizeChange: (size: string, value: string) => void,
  values?: Record<string, number>
}) => (
    <div>
        <Label className="text-base font-medium">{title}</Label>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border mt-2">
            <div className="flex w-max space-x-2 p-4">
                {sizes.map(size => (
                    <div key={size} className="grid gap-2 w-20">
                        <Label htmlFor={`size-${size.toLowerCase().replace(/ /g, '-')}`} className="text-center truncate text-xs">{size}</Label>
                        <Input
                            id={`size-${size.toLowerCase().replace(/ /g, '-')}`}
                            type="number"
                            min="0"
                            placeholder="0"
                            value={values[size] !== undefined && values[size] !== 0 ? values[size] : ''}
                            onChange={(e) => handleSizeChange(size, e.target.value)}
                            className="text-center h-8"
                        />
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
);

interface MultiSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  placeholder?: string;
}

const MultiSelect = ({ options, selected, onChange, className, placeholder = "Selecione..." }: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const handleUnselect = (option: string) => {
    onChange(selected.filter(s => s !== option));
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto", className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              selected.map(item => (
                <Badge
                  variant="secondary"
                  key={item}
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(item);
                  }}
                >
                  {item}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    handleSelect(option);
                    setOpen(true);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected.includes(option)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


export function OrderForm({ existingOrder }: { existingOrder?: Order }) {
  const [isEditMode, setIsEditMode] = useState(!!existingOrder);
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  const [selectedCompany, setSelectedCompany] = useState('');
  const [responsibles, setResponsibles] = useState<Customer[]>([]);
  const [selectedResponsible, setSelectedResponsible] = useState<Customer | null>(null);
  
  const [sizesQuantities, setSizesQuantities] = useState<Record<string, number>>({});
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number | undefined>();
  
  const [orderDate, setOrderDate] = useState<Date | undefined>();
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [entryDate, setEntryDate] = useState<Date | undefined>();
  
  const [selectedModel, setSelectedModel] = useState('');
  const [productionType, setProductionType] = useState<string>('');
  
  // States for single-select
  const [selectedSleeveType, setSelectedSleeveType] = useState<string>('');
  const [selectedCollarType, setSelectedCollarType] = useState<string>('');

  // States for multi-select
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSleeveColors, setSelectedSleeveColors] = useState<string[]>([]);
  const [selectedCuffColors, setSelectedCuffColors] = useState<string[]>([]);
  const [selectedCollarColors, setSelectedCollarColors] = useState<string[]>([]);
  const [selectedStampTypes, setSelectedStampTypes] = useState<string[]>([]);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [selectedPaymentConditions, setSelectedPaymentConditions] = useState<string[]>([]);

  // Internal control states
  const [selectedSituation, setSelectedSituation] = useState<string>('Corte');
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] = useState<string>('Eduardo');
  const [selectedCutter, setSelectedCutter] = useState<string>('Magda');
  const [selectedSeamstress, setSelectedSeamstress] = useState<string>('Fabrica');
  const [notes, setNotes] = useState<string>('');
  
  const [sendNotifications, setSendNotifications] = useState(true);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);

  const router = useRouter();
  const { customers } = useCustomers();
  const allCustomers: Customer[] = customers && customers.length > 0 ? customers : dataStore.getCustomers();

  useEffect(() => {
    if (existingOrder) {
      setIsEditMode(true);
      const customer = allCustomers.find((c: Customer) => c.id === existingOrder.customerId);
      if(customer && customer.companyName) {
         setSelectedCompany(customer.companyName);
         const companyResponsibles = allCustomers.filter((c: Customer) => c.companyName === customer.companyName);
         setResponsibles(companyResponsibles);
         setSelectedResponsible(customer);
      }
      setSelectedModel(existingOrder.model);
      setProductionType(existingOrder.productionType || '');
      setOrderDate(parseISO(existingOrder.orderDate));
      setDeliveryDate(parseISO(existingOrder.deliveryDate));
      setEntryDate(existingOrder.entryDate ? parseISO(existingOrder.entryDate) : undefined);
      setUnitPrice(existingOrder.quantity > 0 ? existingOrder.value / existingOrder.quantity : 0);
      setAmountPaid(existingOrder.amountPaid);
      setSendNotifications(existingOrder.notifications);
      setImagePreviews(existingOrder.imageUrls && existingOrder.imageUrls.length > 0 ? existingOrder.imageUrls : [null, null, null]);

      setSelectedSleeveType(existingOrder.sleeveType || '');
      setSelectedCollarType(existingOrder.collarType || '');

      setSelectedSituation(existingOrder.stage || 'Corte');
      setSelectedResponsiblePerson(existingOrder.responsible || 'Eduardo');
      setSelectedCutter(existingOrder.cutter || 'Magda');
      setSelectedSeamstress(existingOrder.seamstress || 'Fabrica');
      setNotes(existingOrder.notes || '');
      if (existingOrder.sizes) {
        setSizesQuantities(existingOrder.sizes);
      }

      const ensureArray = (value: any) => Array.isArray(value) ? value : (value ? [value] : []);

      setSelectedMaterials(ensureArray(existingOrder.material));
      setSelectedColors(ensureArray(existingOrder.color));
      setSelectedStampTypes(ensureArray(existingOrder.type));
      setSelectedSleeveColors(existingOrder.sleeveColor || []);
      setSelectedCuffColors(existingOrder.cuffColor || []);
      setSelectedCollarColors(existingOrder.collarColor || []);
      setSelectedAdditionals(existingOrder.additional || []);
      setSelectedPaymentMethods(ensureArray(existingOrder.paymentMethod));
      setSelectedPaymentConditions(ensureArray(existingOrder.paymentCondition));
    }
  }, [existingOrder, allCustomers]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Map<string, Customer>();
    allCustomers.forEach((customer: Customer) => {
      if (customer.companyName && !companies.has(customer.companyName)) {
        companies.set(customer.companyName, customer);
      }
    });
    return Array.from(companies.values());
  }, [allCustomers]);
  
  const fullDetailModels = [
    'Polo', 'Portuguesa', 'Padre', 'Esporte', 'Social', 'Jaqueta', 
    'Bobojaco', 'Guarda Pó', 'Moletom', 'Tradicional', 'Regata'
  ];

  const showFullDetails = useMemo(() => {
    return fullDetailModels.includes(selectedModel) || selectedModel === '';
  }, [selectedModel]);

  const handleCompanyChange = (companyName: string) => {
    setSelectedCompany(companyName);
    const companyResponsibles = allCustomers.filter((c: Customer) => c.companyName === companyName);
    setResponsibles(companyResponsibles);
    setSelectedResponsible(companyResponsibles[0] || null); 
  };

  const handleResponsibleChange = (responsibleId: string) => {
    const responsible = allCustomers.find((c: Customer) => c.id === responsibleId);
    setSelectedResponsible(responsible || null);
  };
    
  const tradicionalSizes = [ 'PP', 'P', 'M', 'G', 'GG', 'EG', 'EGG', 'BIG P', 'BIG M', 'BIG G', 'Amostra', 'Sob Medida' ];
  const babylookSizes = [ 'PP baby', 'P baby', 'M baby', 'G baby', 'GG baby', 'EG baby', 'EGG baby', 'BIG P baby', 'BIG M baby', 'BIG G baby', 'Amostra baby', 'Sob Medida baby' ];
  const kidsSizes = [ 'Tam 2', 'Tam 4', 'Tam 6', 'Tam 8', 'Tam 10', 'Tam 12', 'Tam 14' ];

  const handleSizeChange = (size: string, value: string) => {
    setSizesQuantities(prev => ({ ...prev, [size]: Number(value) || 0 }));
  };

  const totalQuantity = useMemo(() => {
    return Object.values(sizesQuantities).reduce((sum, qty) => sum + qty, 0);
  }, [sizesQuantities]);

  const totalPrice = useMemo(() => {
    return totalQuantity * unitPrice;
  }, [totalQuantity, unitPrice]);

  const liveCostDetails = useMemo(() => {
    return calculateOrderCosts({
      model: selectedModel,
      material: selectedMaterials,
      stampTypes: selectedStampTypes,
      quantity: totalQuantity || 1,
      totalValue: totalPrice || 0,
    });
  }, [selectedModel, selectedMaterials, selectedStampTypes, totalQuantity, totalPrice]);
  
  const handleOrderDateChange = (date: Date | undefined) => {
    setOrderDate(date);
    if (date) {
      const newDeliveryDate = calculateDeliveryDate(date);
      setDeliveryDate(newDeliveryDate);
    } else {
      setDeliveryDate(undefined);
    }
  };
  
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result as string;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
    const input = document.getElementById(`image${index+1}`) as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSave = () => {
    const custName = selectedCompany || selectedResponsible?.companyName;
    if (!custName) {
      toast({
        title: "Cliente obrigatório",
        description: "Por favor, selecione a empresa ou cliente para o pedido.",
        variant: "destructive",
      });
      return;
    }

    showLoader();
    try {
      const orderPayload: Partial<Order> = {
        ...(existingOrder?.id ? { id: existingOrder.id } : {}),
        customerId: selectedResponsible?.id || '',
        customerName: custName,
        customerResponsible: selectedResponsible?.responsible || '',
        model: selectedModel || 'Tradicional',
        color: selectedColors.length > 0 ? selectedColors : ['Branco'],
        type: (selectedStampTypes.length > 0 ? selectedStampTypes : ['Silk']) as any,
        productionType: (productionType || 'Outros') as any,
        orderDate: (orderDate || new Date()).toISOString(),
        deliveryDate: (deliveryDate || calculateDeliveryDate(new Date())).toISOString(),
        entryDate: entryDate ? entryDate.toISOString() : undefined,
        value: totalPrice || (unitPrice * (totalQuantity || 1)) || 0,
        quantity: totalQuantity || 1,
        stage: (selectedSituation || 'Corte') as any,
        responsible: (selectedResponsiblePerson || 'Eduardo') as any,
        cutter: (selectedCutter || 'Magda') as any,
        seamstress: (selectedSeamstress || 'Fabrica') as any,
        artSeparation: existingOrder?.artSeparation || 'À Separar',
        notifications: sendNotifications,
        material: selectedMaterials,
        sleeveType: (selectedSleeveType || 'Curta') as any,
        collarType: (selectedCollarType || 'Careca') as any,
        sleeveColor: selectedSleeveColors as any,
        cuffColor: selectedCuffColors as any,
        collarColor: selectedCollarColors as any,
        additional: selectedAdditionals as any,
        sizes: sizesQuantities,
        notes: notes,
        amountPaid: amountPaid || 0,
        paymentCondition: selectedPaymentConditions as any,
        paymentMethod: (selectedPaymentMethods[0] || 'Dinheiro') as any,
        imageUrls: (imagePreviews.filter(Boolean) as string[]),
        costDetails: liveCostDetails,
      };

      const saved = dataStore.saveOrder(orderPayload);

      toast({
        title: isEditMode ? "Pedido Atualizado!" : "Pedido Criado!",
        description: isEditMode
          ? `As alterações no pedido ${saved.id} foram salvas com sucesso.`
          : `O pedido ${saved.id} para ${saved.customerName} foi criado com sucesso.`,
      });

      router.push('/dashboard/orders');
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o pedido.",
        variant: "destructive",
      });
    } finally {
      hideLoader();
    }
  };

  const handleCancel = () => {
    showLoader();
    setTimeout(() => {
      if (isEditMode && existingOrder) {
        const destination = `/dashboard/orders/${existingOrder.id.replace('ORD', '')}`;
        router.replace(destination);
      } else {
        router.back();
      }
    }, 500);
  };
  
  const BackButton = ({ onConfirm }: { onConfirm: () => void }) => (
    <Button onClick={onConfirm} variant="outline" size="icon" className="h-8 w-8 mb-1">
        <ArrowLeft className="h-4 w-4" />
    </Button>
  );

  const HomeButton = ({ onConfirm }: { onConfirm: () => void }) => (
    <Button onClick={onConfirm} variant="outline" size="icon" className="h-8 w-8">
        <Home className="h-4 w-4" />
    </Button>
  );
  
  const NavigationWarningDialog = ({ children, onConfirm }: { children: React.ReactNode, onConfirm: () => void }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Sair da Edição?</AlertDialogTitle>
                <AlertDialogDescription>
                    As alterações não salvas serão perdidas. Deseja continuar?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Não, continuar editando</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>Sim, sair</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="flex flex-col gap-4">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                 {isEditMode ? (
                    <>
                        <NavigationWarningDialog onConfirm={handleCancel}>
                           <Button variant="outline" size="icon" className="h-8 w-8 mb-1">
                                <ArrowLeft className="h-4 w-4" />
                           </Button>
                        </NavigationWarningDialog>
                        <NavigationWarningDialog onConfirm={() => { showLoader(); router.push('/dashboard'); }}>
                             <Button variant="outline" size="icon" className="h-8 w-8">
                                <Home className="h-4 w-4" />
                            </Button>
                        </NavigationWarningDialog>
                    </>
                ) : (
                    <>
                       <BackButton onConfirm={() => { showLoader(); router.back(); }}/>
                       <HomeButton onConfirm={() => { showLoader(); router.push('/dashboard'); }}/>
                    </>
                )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-headline">
                {isEditMode ? `Editar Pedido` : 'Novo Pedido'}
              </h1>
              <p className="text-muted-foreground">
                {isEditMode ? `Alterando pedido de ${selectedResponsible?.companyName} - ${selectedResponsible?.responsible}` : 'Preencha as informações abaixo para criar um novo pedido.'}
              </p>
            </div>
        </div>
      </div>

      {/* Informações da Empresa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">Informações do Cliente</CardTitle>
            </div>
             <div className="flex items-center space-x-2">
                <Switch 
                    id="notifications-switch" 
                    checked={sendNotifications}
                    onCheckedChange={setSendNotifications}
                />
                <Label htmlFor="notifications-switch" className="text-xs text-muted-foreground">
                    Notificar cliente
                </Label>
            </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Empresa/Cliente</Label>
            <Select onValueChange={handleCompanyChange} value={selectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCompanies.map(company => (
                  <SelectItem key={company.id} value={company.companyName!}>{company.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="responsible-name">Nome Responsável</Label>
              <Select onValueChange={handleResponsibleChange} disabled={!selectedCompany} value={selectedResponsible?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsibles.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.responsible}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 98765-4321" value={selectedResponsible?.phone || ''} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" placeholder="Ex: São Paulo" value={selectedResponsible?.city || ''} readOnly />
          </div>
        </CardContent>
      </Card>
      
      {/* Grade de Tamanhos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grade de Tamanhos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <SizeInputGrid title="Tradicional" sizes={tradicionalSizes} handleSizeChange={handleSizeChange} values={sizesQuantities} />
            <Separator />
            <SizeInputGrid title="Babylook" sizes={babylookSizes} handleSizeChange={handleSizeChange} values={sizesQuantities} />
            <Separator />
            <SizeInputGrid title="Infantil" sizes={kidsSizes} handleSizeChange={handleSizeChange} values={sizesQuantities} />
            {totalQuantity > 0 && (
                <div className="text-right font-bold text-red-600 pr-4 pt-2">
                    Total: {totalQuantity} peças
                </div>
            )}
        </CardContent>
      </Card>

      {/* Detalhes do Produto */}
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Descrição do Produto</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                {/* Row 1 */}
                <div className="grid gap-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Select onValueChange={setSelectedModel} value={selectedModel}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                            {orderModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Material</Label>
                    <MultiSelect options={materials} selected={selectedMaterials} onChange={setSelectedMaterials} placeholder="Selecione materiais" />
                </div>
                <div className="grid gap-2">
                    <Label>Cor do Produto</Label>
                    <MultiSelect options={shirtColors} selected={selectedColors} onChange={setSelectedColors} placeholder="Selecione cores" />
                </div>
                
                {/* Row 2 */}
                <div className="grid gap-2">
                    <Label>Tipo de Manga</Label>
                     <Select onValueChange={setSelectedSleeveType} value={selectedSleeveType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {sleeveTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Cor da Manga</Label>
                    <MultiSelect options={sleeveColors} selected={selectedSleeveColors} onChange={setSelectedSleeveColors} placeholder="Selecione cores" />
                </div>
                <div className="grid gap-2">
                    <Label>Cor do Punho</Label>
                    <MultiSelect options={cuffColors} selected={selectedCuffColors} onChange={setSelectedCuffColors} placeholder="Selecione cores" />
                </div>

                {/* Row 3 */}
                <div className="grid gap-2">
                    <Label>Tipo de Gola</Label>
                     <Select onValueChange={setSelectedCollarType} value={selectedCollarType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            {collarTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Cor da Gola</Label>
                    <MultiSelect options={collarColors} selected={selectedCollarColors} onChange={setSelectedCollarColors} placeholder="Selecione cores" />
                </div>
                <div className="grid gap-2">
                    <Label>Adicionais</Label>
                    <MultiSelect options={additionalItems} selected={selectedAdditionals} onChange={setSelectedAdditionals} placeholder="Selecione adicionais" />
                </div>
                
                {/* Row 4 */}
                 <div className="grid gap-2 md:col-start-3 md:justify-self-end w-full">
                    <Label>Tipo de Estampa</Label>
                    <MultiSelect options={stampTypes} selected={selectedStampTypes} onChange={setSelectedStampTypes} placeholder="Selecione estampas" />
                </div>
            </CardContent>
        </Card>

        {/* Imagens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Layout</CardTitle>
          <CardDescription>Anexe as imagens de referência para o pedido.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
                <div key={index}>
                    {imagePreviews[index] ? (
                    <div className="relative group">
                        <Image
                        src={imagePreviews[index]!}
                        alt={`Preview ${index + 1}`}
                        width={300}
                        height={150}
                        className="rounded-lg object-cover w-full h-32"
                        />
                        <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ) : (
                    <Label
                        htmlFor={`image${index + 1}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">Imagem {index + 1}</p>
                        </div>
                        <Input
                            id={`image${index + 1}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleImageChange(index, e)}
                        />
                    </Label>
                    )}
                </div>
            ))}
            </div>
        </CardContent>
      </Card>

      {/* Financeiro e Prazos */}
      <Card>
        <CardHeader>
          <CardTitle>Financeiro e Prazos</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="grid gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="order-date">Data de Encomenda</Label>
                  <DatePicker date={orderDate} setDate={handleOrderDateChange} />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="delivery-date">Data de Entrega</Label>
                  <DatePicker date={deliveryDate} setDate={setDeliveryDate} />
              </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantidade Total</Label>
              <Input id="quantity" type="number" value={totalQuantity} placeholder="0" readOnly className="bg-muted" />
            </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="unit-price">Valor UND</Label>
                  <Input 
                    id="unit-price" 
                    type="number" 
                    placeholder="R$ 0,00"
                    value={unitPrice || ''}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total-price">Total</Label>
                  <Input 
                    id="total-price" 
                    type="text"
                    value={`R$ ${totalPrice.toFixed(2).replace('.',',')}`} 
                    placeholder="R$ 0,00" 
                    readOnly 
                    className="bg-muted"
                  />
                </div>
              </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Forma de Pagamento</Label>
              <MultiSelect options={paymentMethods} selected={selectedPaymentMethods} onChange={setSelectedPaymentMethods} placeholder="Selecione formas de pagamento" />
            </div>
            <div className="grid gap-2">
              <Label>Condição de Pagamento</Label>
              <MultiSelect options={paymentConditions} selected={selectedPaymentConditions} onChange={setSelectedPaymentConditions} placeholder="Selecione condições de pagamento" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custos e Lucro do Pedido - Calculadora em Tempo Real */}
      <OrderCostBreakdown 
        costDetails={liveCostDetails} 
        totalValue={totalPrice} 
        quantity={totalQuantity} 
      />
      
      {/* Comprovantes */}
      <Card>
        <CardHeader>
            <CardTitle>Comprovantes e Pagamentos</CardTitle>
          </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="proof-entry">Comprovante Entrada</Label>
            <Input id="proof-entry" type="file" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proof-remaining">Comprovante Restante</Label>
            <Input id="proof-remaining" type="file" />
          </div>
           <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="grid gap-2">
                <Label htmlFor="amount-paid">Valor de Entrada Pago (R$)</Label>
                <Input 
                  id="amount-paid" 
                  type="number" 
                  placeholder="Ex: 50.00"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="entry-date">Data da Entrada</Label>
                  <DatePicker date={entryDate} setDate={setEntryDate} />
              </div>
              <p className="text-xs text-muted-foreground md:col-span-2">
                Use este campo para registrar pagamentos de entrada em dinheiro ou quando não houver comprovante digital.
              </p>
            </div>
        </CardContent>
      </Card>

      {/* Controle Interno */}
      <Card>
        <CardHeader>
            <CardTitle>Controle Interno</CardTitle>
          </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Situação</Label>
              <Select value={selectedSituation} onValueChange={setSelectedSituation}>
                <SelectTrigger><SelectValue placeholder="Selecione a situação" /></SelectTrigger>
                <SelectContent>
                  {orderSituations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="production-type">Tipo de Produção</Label>
              <Select value={productionType} onValueChange={setProductionType}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                      {productionTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
              <div className="grid gap-2">
              <Label htmlFor="responsible-prod">Responsável</Label>
              <Select value={selectedResponsiblePerson} onValueChange={setSelectedResponsiblePerson}>
                <SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
                <SelectContent>{internalResponsibles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
              <div className="grid gap-2">
              <Label htmlFor="cutter">Corte</Label>
              <Select value={selectedCutter} onValueChange={setSelectedCutter}>
                <SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
                <SelectContent>{cutters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="seamstress">Costureira</Label>
              <Select value={selectedSeamstress} onValueChange={setSelectedSeamstress}>
                <SelectTrigger><SelectValue placeholder="Selecione a costureira" /></SelectTrigger>
                <SelectContent>{seamstresses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
          <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
              <Textarea 
                id="notes" 
                placeholder="Detalhes importantes sobre o pedido." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
          </CardContent>
      </Card>

      <div className="flex justify-end gap-2 no-print mt-4">
        {isEditMode ? (
            <>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline">Cancelar Alterações</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja cancelar as alterações? Todas as modificações não salvas serão perdidas.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Não</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancel}>Sim, cancelar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button>Salvar Alterações</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Alterações</AlertDialogTitle>
                            <AlertDialogDescription>
                               Deseja salvar as alterações feitas neste pedido?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Não</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSave}>
                              Sim, salvar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        ) : (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Salvar Pedido</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Novo Pedido</AlertDialogTitle>
                    <AlertDialogDescription>
                        Deseja criar este novo pedido? Verifique se todas as informações estão corretas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Não</AlertDialogCancel>
                     <AlertDialogAction onClick={handleSave}>
                      Sim, Criar Pedido
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
        )}
      </div>
    </div>
  );
}
