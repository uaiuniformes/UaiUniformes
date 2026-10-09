

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Home, Printer, ArrowUpCircle, ArrowDownCircle, Check, Eye, Camera, RefreshCw, Paperclip, Mic, ChevronsUpDown, Calendar, FileText, File } from 'lucide-react';
import { useCashFlow, dataStore } from '@/lib/data-store';
import type { DailyCashRecord, CashFlowTransaction, PaymentType, Customer } from '@/lib/types';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { cn } from '@/lib/utils';
import { DatePickerWithIcon } from '@/components/ui/datepicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { extractReceiptInfo } from '@/ai/flows/extract-receipt-info';


const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const TransactionTable = ({ title, type, transactions }: { title: string, type: 'Entrada' | 'Saída', transactions: CashFlowTransaction[] }) => {
    
    const paymentMethodOrder: PaymentType[] = ['Dinheiro', 'Transferencia/ Pix', 'Cartão', 'Boleto', 'Cheque'];

    const sortedTransactions = React.useMemo(() => {
        return [...transactions]
            .filter(t => t.type === type)
            .sort((a, b) => {
                const indexA = paymentMethodOrder.indexOf(a.paymentMethod);
                const indexB = paymentMethodOrder.indexOf(b.paymentMethod);
                
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
            });
    }, [transactions, type]);

    const rowCount = sortedTransactions.length;
    
    const renderPrintTable = () => (
         <Table className="border">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="w-12 h-10 px-2 print:p-1">Nº</TableHead>
                    <TableHead className="h-10 px-2 print:p-1">Cliente/Origem</TableHead>
                    <TableHead className="h-10 px-2 print:p-1">Descrição</TableHead>
                    <TableHead className="w-32 h-10 px-2 print:p-1">Forma</TableHead>
                    <TableHead className="w-32 h-10 px-2 print:p-1 text-right">Valor (R$)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {sortedTransactions.map((transaction, index) => {
                    const description = transaction?.description || '';
                    const source = transaction?.source || '';
                    const baseDescription = description.endsWith('*') ? description.slice(0, -1) : description;
                    const baseSource = source.endsWith('*') ? source.slice(0, -1) : source;
                    return (
                        <TableRow key={`print-${index}`}>
                            <TableCell className="text-center bg-gray-50 font-medium p-1">{index + 1}</TableCell>
                            <TableCell className="p-1 text-xs">
                                {baseSource}
                                {source.endsWith('*') && <span className="text-red-500 font-bold">*</span>}
                            </TableCell>
                            <TableCell className="p-1 text-xs">{baseDescription}</TableCell>
                            <TableCell className="p-1 text-xs w-32">{transaction.paymentMethod}</TableCell>
                            <TableCell className="p-1 text-xs text-right w-32">{formatCurrency(transaction.value)}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={4} className="font-bold print:py-1 print:px-2">Total {title}</TableCell>
                    <TableCell className="text-right font-bold print:py-1 print:px-2">R$ {formatCurrency(sortedTransactions.reduce((sum, t) => sum + t.value, 0))}</TableCell>
                </TableRow>
            </TableFooter>
         </Table>
    );

    const renderScreenTable = () => (
        <Table className="border">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="w-12 h-10 px-2">Nº</TableHead>
                    <TableHead className="h-10 px-2">Cliente/Origem</TableHead>
                    <TableHead className="h-10 px-2">Descrição</TableHead>
                    <TableHead className="w-32 h-10 px-2">Forma</TableHead>
                    <TableHead className="w-32 h-10 px-2 text-right">Valor (R$)</TableHead>
                    <TableHead className="w-24 h-10 px-2 text-center">Ver Nota</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedTransactions.map((transaction, index) => {
                    const description = transaction?.description || '';
                    const hasAsterisk = description.endsWith('*');
                    const baseDescription = hasAsterisk ? description.slice(0, -1) : description;
                    const source = transaction?.source || '';
                    const baseSource = source.endsWith('*') ? source.slice(0, -1) : source;

                    return (
                        <TableRow key={`screen-${index}`} className="h-8">
                            <TableCell className="w-12 text-center bg-gray-50 font-medium p-1">{index + 1}</TableCell>
                            <TableCell className="p-1 text-xs">
                                {baseSource}
                                {source.endsWith('*') && <span className="text-red-500 font-bold">*</span>}
                            </TableCell>
                            <TableCell className="p-1 text-xs">{baseDescription}</TableCell>
                            <TableCell className="w-32 p-1 text-xs">{transaction?.paymentMethod || ''}</TableCell>
                            <TableCell className="w-32 p-1 text-xs text-right">{transaction ? formatCurrency(transaction.value) : ''}</TableCell>
                            <TableCell className="w-24 p-1 text-center">
                                {transaction?.receiptImageUrl && (
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                {transaction.receiptType === 'pdf' ? (
                                                    <FileText className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className={cn(
                                            transaction.receiptType === 'pdf' && 'h-[90vh] max-w-4xl'
                                        )}>
                                            <DialogHeader>
                                                <DialogTitle>Comprovante</DialogTitle>
                                                <DialogDescription>{transaction.description}</DialogDescription>
                                            </DialogHeader>
                                             {transaction.receiptType === 'pdf' ? (
                                                <embed src={transaction.receiptImageUrl} type="application/pdf" className="w-full h-full" />
                                             ) : (
                                                <Image src={transaction.receiptImageUrl} alt={`Comprovante para ${transaction.description}`} width={500} height={500} className="rounded-md object-contain" data-ai-hint="receipt document" />
                                             )}
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
                {[...Array(Math.max(0, 15 - rowCount))].map((_, index) => (
                   <TableRow key={`empty-${index}`} className="h-8">
                        <TableCell className="w-12 text-center bg-gray-50 font-medium p-1">{rowCount + index + 1}</TableCell>
                        <TableCell className="p-1"></TableCell>
                        <TableCell className="p-1"></TableCell>
                        <TableCell className="p-1 w-32"></TableCell>
                        <TableCell className="p-1 w-32"></TableCell>
                        <TableCell className="p-1 w-24"></TableCell>
                   </TableRow>
                ))}
            </TableBody>
             <TableFooter>
                <TableRow>
                    <TableCell colSpan={5} className="font-bold print:py-1 print:px-2">Total {title}</TableCell>
                    <TableCell className="text-right font-bold print:py-1 print:px-2">R$ {formatCurrency(sortedTransactions.reduce((sum, t) => sum + t.value, 0))}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );

    return (
        <div className="space-y-2">
             <h2 className={cn("text-lg font-semibold text-center py-1 rounded-t-md", type === 'Entrada' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800')}>{title}</h2>
             <div className="print:hidden">
                {renderScreenTable()}
             </div>
             <div className="hidden print:block">
                 {renderPrintTable()}
             </div>
        </div>
    )
}

function CustomerCombobox({ value, onValueChange }: { value: string, onValueChange: (value: string) => void }) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
  
    const filteredCustomers = React.useMemo(() => {
        const list = dataStore.getCustomers();
        if (!searchTerm) return list;
        return list.filter((customer: Customer) => 
            customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.responsible.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleSelect = (customerName: string) => {
        onValueChange(customerName);
        setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || "Selecione ou digite..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput 
                placeholder="Buscar cliente ou digitar..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm) {
                        onValueChange(searchTerm);
                        setOpen(false);
                    }
                }}
            />
            <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                {filteredCustomers.map((customer) => (
                    <CommandItem
                        key={customer.id}
                        value={customer.companyName}
                        onSelect={() => handleSelect(customer.companyName)}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                value === customer.companyName ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {customer.companyName} - <span className="text-muted-foreground ml-1">{customer.responsible}</span>
                    </CommandItem>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
}

function QuickTransactionDialog({ type, onConfirmTransaction, trigger, currentDate }: { type: 'Entrada' | 'Saída', onConfirmTransaction: (transaction: Omit<CashFlowTransaction, 'id'>) => void, trigger: React.ReactNode, currentDate: Date }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isCameraView, setIsCameraView] = React.useState(false);
    const [isListening, setIsListening] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [preview, setPreview] = React.useState<{type: 'image' | 'pdf', content: string, name?: string} | null>(null);


    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const recognitionRef = React.useRef<any>(null); // To hold the SpeechRecognition instance
    
    // Form fields state
    const [source, setSource] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [value, setValue] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentType | ''>('');

    React.useEffect(() => {
        let isMounted = true;
        let streamInstance: MediaStream | null = null;

        const startCamera = async () => {
            if (isCameraView) {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    toast({
                        title: "Câmera Indisponível",
                        description: "Seu navegador não possui suporte para câmera ou a conexão não é segura (HTTPS).",
                        variant: "destructive"
                    });
                    setIsCameraView(false);
                    return;
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    streamInstance = stream;

                    // Se o componente foi desmontado ou a visualização foi fechada durante o await
                    if (!isMounted || !videoRef.current) {
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        if (isMounted && videoRef.current) {
                            videoRef.current.play().catch(err => {
                                console.error("Video play failed:", err);
                                toast({
                                    title: "Erro de Câmera",
                                    description: "Não foi possível iniciar a visualização da câmera.",
                                    variant: "destructive"
                                });
                            });
                        }
                    };
                } catch (err) {
                    if (isMounted) {
                        console.error("Error accessing camera: ", err);
                        toast({
                            title: "Erro de Câmera",
                            description: "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
                            variant: "destructive"
                        });
                        setIsCameraView(false); // Go back to form view
                    }
                }
            }
        };

        startCamera();

        // Cleanup function to stop the stream
        return () => {
            isMounted = false;
            if (streamInstance) {
                streamInstance.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [isCameraView, toast]);


    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraView(false);
    };

    const handleCameraClick = () => {
        setIsCameraView(prev => !prev);
    };
    
    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            setPreview({ type: 'image', content: dataUri });
            stopCamera();
            handleOcr({ photoDataUri: dataUri });
        }
    };

    const handleFileSelectClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUri = e.target?.result as string;
            if(!dataUri) return;

            if (file.type.startsWith('image/')) {
                setPreview({ type: 'image', content: dataUri });
                handleOcr({ photoDataUri: dataUri });
            } else if (file.type === 'application/pdf') {
                setPreview({ type: 'pdf', content: dataUri, name: file.name });
                handleOcr({ photoDataUri: dataUri });
            } else {
                 toast({
                    title: "Arquivo Inválido",
                    description: "Por favor, selecione um arquivo de imagem (JPG, PNG) ou PDF.",
                    variant: "destructive",
                });
            }
        };
        reader.readAsDataURL(file);
        // Reset file input to allow selecting the same file again
        event.target.value = '';
    };

     const handleOcr = async (input: { photoDataUri?: string, text?: string }) => {
        setIsProcessing(true);
        try {
            const result = await extractReceiptInfo(input);
            if(result) {
                setDescription(result.description || '');
                setValue(result.value?.toString() || '');
                setPaymentMethod(result.paymentMethod || '');
                toast({
                    title: "Informações Extraídas!",
                    description: "Os campos do formulário foram preenchidos.",
                });
            }
        } catch (error: any) {
            console.error("AI extraction failed:", error);
            const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
            if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('model is overloaded')) {
                toast({
                    title: "Assistente Ocupado",
                    description: "O serviço de IA está com alta demanda. Por favor, tente novamente em alguns instantes.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Falha na Extração",
                    description: "Não foi possível ler as informações da entrada. Verifique sua conexão ou tente mais tarde.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsProcessing(false);
        }
    }

    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast({
                title: "Navegador não suportado",
                description: "Seu navegador não suporta o reconhecimento de voz.",
                variant: "destructive"
            });
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'pt-BR';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            toast({ title: 'Ouvindo...', description: 'Fale os detalhes da transação.' });
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            toast({ title: 'Erro ao ouvir', description: 'Tente novamente.', variant: 'destructive' });
        };

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            toast({ title: 'Texto capturado!', description: `Processando: "${transcript}"`});
            handleOcr({ text: transcript });
        };
        
        recognitionRef.current.start();
    };

    const resetForm = () => {
        setSource('');
        setDescription('');
        setValue('');
        setPaymentMethod('');
        setPreview(null);
        setIsCameraView(false);
        if (isListening) {
            recognitionRef.current?.stop();
        }
    }
    
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if(!open) {
            stopCamera();
            resetForm();
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
            
        const transaction: Omit<CashFlowTransaction, 'id'> = {
            date: currentDate.toISOString(),
            source,
            description,
            value: parseFloat(value),
            paymentMethod: paymentMethod as PaymentType,
            type,
            receiptImageUrl: preview?.content,
            receiptType: preview?.type,
        };
    
        onConfirmTransaction(transaction);
    
        toast({
            title: `Nova ${type} Registrada!`,
            description: `${description} (${paymentMethod}): R$ ${formatCurrency(parseFloat(value))}`,
        });
        
        handleOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                 <DialogHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1.5">
                        <DialogTitle>Nova {type} no Caixa</DialogTitle>
                        <DialogDescription>
                            {isCameraView ? "Aponte para o comprovante." : isListening ? "Ouvindo sua voz..." : "Registre uma nova transação financeira."}
                        </DialogDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleFileSelectClick} disabled={isListening}>
                            <Paperclip className="h-5 w-5" />
                        </Button>
                         <Button variant="outline" size="icon" onClick={handleMicClick} className={cn(isListening && "bg-red-500 text-white")}>
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleCameraClick} disabled={isListening}>
                            <Camera className="h-5 w-5" />
                        </Button>
                     </div>
                </DialogHeader>

                {isCameraView && (
                    <div className="space-y-4">
                        <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline></video>
                        <Button onClick={takePicture} className="w-full">Capturar Foto</Button>
                    </div>
                )}

                 <form onSubmit={handleSubmit} className={cn(isCameraView && "hidden")}>
                    <div className="grid gap-4 py-4">
                         {preview && (
                            <div className="space-y-2 relative">
                                <Label>Comprovante</Label>
                                {preview.type === 'image' ? (
                                    <Image src={preview.content} alt="Comprovante capturado" width={200} height={100} className="rounded-md object-cover w-full max-h-48" data-ai-hint="receipt document" />
                                ): (
                                    <div className="flex items-center p-2 border rounded-md bg-muted">
                                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground truncate">{preview.name}</span>
                                    </div>
                                )}
                                {isProcessing && (
                                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white rounded-md">
                                        <RefreshCw className="h-6 w-6 animate-spin mb-2" />
                                        <span>Analisando...</span>
                                    </div>
                                )}
                            </div>
                         )}
                        
                        <div className="grid gap-2">
                            <Label htmlFor="source">Cliente/Origem</Label>
                            <CustomerCombobox value={source} onValueChange={setSource} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição (Detalhes da transação)</Label>
                            <Input id="description" name="description" placeholder={type === 'Entrada' ? "Ex: Venda Uniforme" : "Ex: Compra de material"} required value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Valor (R$)</Label>
                                <Input id="value" name="value" type="number" step="0.01" placeholder="0,00" required value={value} onChange={(e) => setValue(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="paymentMethod">Forma</Label>
                                 <Select name="paymentMethod" required value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="Transferencia/ Pix">Transferencia/ Pix</SelectItem>
                                        <SelectItem value="Cartão">Cartão</SelectItem>
                                        <SelectItem value="Boleto">Boleto</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">Registrar {type}</Button>
                    </DialogFooter>
                </form>
                 <canvas ref={canvasRef} className="hidden"></canvas>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
            </DialogContent>
        </Dialog>
    );
}

const CashFlowPageContent = () => {
    const { toast } = useToast();
    const { showLoader } = useLoader();
    const { records: dailyRecords, saveRecord } = useCashFlow();
    const [date, setDate] = React.useState<Date | undefined>(() => new Date());
    const [record, setRecord] = React.useState<DailyCashRecord | null>(null);
    const [balanceState, setBalanceState] = React.useState<{ cash: number; coins: number }>({ cash: 0, coins: 0 });
    const [displayCashValue, setDisplayCashValue] = React.useState('0,00');

    React.useEffect(() => {
        if (date) {
            const foundRecord = dailyRecords.find(r => isSameDay(parseISO(r.date), date));
            if (foundRecord) {
                setRecord(foundRecord);
                setBalanceState(foundRecord.balance || { cash: 0, coins: 0 });
                setDisplayCashValue((foundRecord.balance?.cash || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            } else {
                // Create a new empty record for the selected date
                const previousDayRecord = dailyRecords
                    .filter(r => new Date(r.date) < date)
                    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                
                const newEmptyRecord: DailyCashRecord = {
                    date: date.toISOString(),
                    initialBalance: previousDayRecord?.balance?.cash || 0, // Set initial balance from previous day
                    transactions: [],
                    balance: { cash: 0, coins: 0 },
                };
                setRecord(newEmptyRecord);
                setBalanceState({ cash: 0, coins: 0 });
                setDisplayCashValue('0,00');
            }
        } else {
            setRecord(null);
            setBalanceState({ cash: 0, coins: 0 });
            setDisplayCashValue('0,00');
        }
    }, [date, dailyRecords]);
    
    const handleBalanceChange = () => {
        const numericValue = parseFloat(displayCashValue.replace('.', '').replace(',', '.')) || 0;
        const newBalance = { ...balanceState, cash: numericValue };
        setBalanceState(newBalance);
        setDisplayCashValue(numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        if (record) {
            saveRecord({ ...record, balance: newBalance });
        }
    };

    const handleConfirmTransaction = (transaction: Omit<CashFlowTransaction, 'id'>) => {
        const currentDate = date || new Date();
        let targetRecord = dailyRecords.find(r => isSameDay(parseISO(r.date), currentDate));

        if (!targetRecord) {
            const previousDayRecord = dailyRecords
                .filter(r => new Date(r.date) < currentDate)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            targetRecord = {
                date: currentDate.toISOString(),
                initialBalance: previousDayRecord?.balance?.cash || 0,
                transactions: [],
                balance: { cash: 0, coins: 0 },
            };
        }

        const maxId = Math.max(0, ...dailyRecords.flatMap(r => r.transactions).map(t => t.id));
        const newTransaction: CashFlowTransaction = { ...transaction, id: maxId + 1 };
        const newTransactions = [...targetRecord.transactions, newTransaction];

        if (newTransaction.type === 'Entrada' && newTransaction.paymentMethod !== 'Dinheiro') {
            const compensationTransaction: CashFlowTransaction = {
                id: maxId + 2,
                date: newTransaction.date,
                source: `${newTransaction.source}*`,
                description: `${newTransaction.description}*`,
                value: newTransaction.value,
                paymentMethod: newTransaction.paymentMethod,
                type: 'Saída',
                receiptImageUrl: newTransaction.receiptImageUrl,
                receiptType: newTransaction.receiptType,
            };
            newTransactions.push(compensationTransaction);
        }

        const updatedRecord: DailyCashRecord = {
            ...targetRecord,
            transactions: newTransactions,
        };

        saveRecord(updatedRecord);
        toast({
            title: "Lançamento Registrado!",
            description: `${transaction.type} de R$ ${formatCurrency(transaction.value)} adicionada ao caixa.`
        });
    };
    

    const totals = React.useMemo(() => {
        if (!record) return { totalEntrada: 0, totalSaida: 0, saldoFinal: 0 };
        const totalEntrada = record.transactions.filter(t => t.type === 'Entrada').reduce((sum, t) => sum + t.value, 0);
        const totalSaida = record.transactions.filter(t => t.type === 'Saída').reduce((sum, t) => sum + t.value, 0);
        const saldoFinal = record.initialBalance + totalEntrada - totalSaida;
        return { totalEntrada, totalSaida, saldoFinal };
    }, [record]);

    const saldoCaixa = React.useMemo(() => balanceState.cash + balanceState.coins, [balanceState]);
    const diff = React.useMemo(() => saldoCaixa - totals.saldoFinal, [saldoCaixa, totals.saldoFinal]);
    const isClosed = Math.abs(diff) < 0.01;

    const getResultado = () => {
        if (isClosed) {
            return <span className="text-green-600 font-bold">Fechou</span>;
        }
        if (diff < 0) {
            return <span className="text-red-600 font-bold">Faltando R$ {formatCurrency(Math.abs(diff))}</span>;
        }
        return <span className="text-blue-600 font-bold">A mais R$ {formatCurrency(diff)}</span>;
    };
    
    const getComposition = (method: PaymentType) => {
        if (!record) return 0;
        return record.transactions
            .filter(t => t.type === 'Entrada' && t.paymentMethod === method)
            .reduce((sum, t) => sum + t.value, 0);
    }

    const handleConfirmJustification = () => {
        toast({
            title: "Justificativa Registrada!",
            description: "A justificativa para a diferença no caixa foi salva.",
        });
    }

    const currentDate = date || new Date();
    
    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <LoaderLink href="/dashboard">
                            <Button variant="outline" size="icon" className="h-8 w-8 mb-1">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </LoaderLink>
                        <Button onClick={() => window.print()} variant="outline" size="icon" className="h-8 w-8">
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-headline">Controle de Caixa Diário</h1>
                        <p className="text-muted-foreground">Registre e confira as movimentações financeiras do dia.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <QuickTransactionDialog type="Entrada" onConfirmTransaction={handleConfirmTransaction} currentDate={currentDate} trigger={<Button variant="outline" size="icon"><ArrowUpCircle className="h-5 w-5 text-green-600"/></Button>} />
                    <QuickTransactionDialog type="Saída" onConfirmTransaction={handleConfirmTransaction} currentDate={currentDate} trigger={<Button variant="outline" size="icon"><ArrowDownCircle className="h-5 w-5 text-red-600"/></Button>} />
                    <DatePickerWithIcon date={date} setDate={setDate} />
                    <LoaderLink href="/dashboard/reports/cash-flow">
                        <Button>
                            <FileText className="mr-2 h-4 w-4" />
                            Relatório
                        </Button>
                    </LoaderLink>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 border rounded-lg bg-white print-content space-y-8">
                {/* Date and Initial Balance Header */}
                 <div className="flex justify-between items-center p-2 bg-yellow-200 rounded-md">
                    <h2 className="font-bold text-lg capitalize text-yellow-800">
                        {format(date || new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Label className="font-bold text-yellow-800">Saldo Inicial</Label>
                        <span className="font-bold text-yellow-800">R$</span>
                        <Input type="text" value={formatCurrency(record?.initialBalance || 0)} className="w-32 text-right font-bold bg-white" readOnly />
                    </div>
                </div>

                <div className="print:block md:grid md:grid-cols-2 md:gap-8">
                    <TransactionTable
                        title="Entrada"
                        type="Entrada"
                        transactions={record?.transactions || []}
                    />
                    <TransactionTable
                        title="Saída"
                        type="Saída"
                        transactions={record?.transactions || []}
                    />
                </div>
                
                {/* Closing and Composition */}
                 <div className="grid md:grid-cols-2 md:gap-8 print-footer-container">
                    {/* Fechamento */}
                     <Card className="print-footer-card">
                        <CardHeader className="print-card-header">
                            <CardTitle className="text-center">Fechamento Caixa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 print-card-content">
                            <div className="flex justify-between items-center p-1 rounded-md bg-gray-100">
                                <Label>Saldo Inicial</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(record?.initialBalance || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 rounded-md bg-green-100">
                                <Label>Entrada</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(totals.totalEntrada)}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 rounded-md bg-red-100">
                                <Label>Saída</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(totals.totalSaida)}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 rounded-md bg-yellow-100">
                                <Label className="font-bold">Saldo Final</Label>
                                <span className="font-bold font-mono text-sm">R$ {formatCurrency(totals.saldoFinal)}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 rounded-md bg-yellow-100">
                                <Label className="font-bold">Saldo Caixa</Label>
                                <span className="font-bold font-mono text-sm">R$ {formatCurrency(saldoCaixa)}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 mt-1">
                                <Label className="font-bold">Resultado</Label>
                                {getResultado()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Composição */}
                    <Card className="print-footer-card">
                         <CardHeader className="print-card-header">
                            <CardTitle className="text-center">Composição do Saldo</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-1 print-card-content">
                             <div className="flex justify-between items-center p-1">
                                <Label htmlFor="balance-cash">Dinheiro</Label>
                                <Input 
                                    id="balance-cash"
                                    type="text" 
                                    className="h-8 w-32 text-right" 
                                    placeholder="R$ 0,00" 
                                    value={displayCashValue}
                                    onChange={(e) => setDisplayCashValue(e.target.value)}
                                    onBlur={handleBalanceChange}
                                />
                            </div>
                            <div className="flex justify-between items-center p-1">
                                <Label>Transferencia/ Pix</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(getComposition('Transferencia/ Pix'))}</span>
                            </div>
                            <div className="flex justify-between items-center p-1">
                                <Label>Cartão</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(getComposition('Cartão'))}</span>
                            </div>
                            <div className="flex justify-between items-center p-1">
                                <Label>Boleto</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(getComposition('Boleto'))}</span>
                            </div>
                            <div className="flex justify-between items-center p-1">
                                <Label>Cheque</Label>
                                <span className="font-mono text-sm">R$ {formatCurrency(getComposition('Cheque'))}</span>
                            </div>
                         
                            {!isClosed && (
                                <div className="mt-2 pt-2 border-t space-y-2">
                                    <Label htmlFor="justification">Justificativa da Diferença</Label>
                                    <div className="flex items-center gap-2">
                                        <Textarea id="justification" placeholder="Ex: Troco errado..." className="min-h-[60px]" />
                                        <Button size="icon" variant="outline" onClick={handleConfirmJustification}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                         </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};


export default function CashFlowPage() {
    return (
        <React.Suspense fallback={<div>Carregando...</div>}>
            <CashFlowPageContent />
        </React.Suspense>
    );
}
