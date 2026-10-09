

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockInventory } from '@/lib/mock-data';
import type { InventoryItem, InventoryCategory, InventoryMovement } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, History, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const categories: InventoryCategory[] = ['Malha PV', 'Malha PP', 'Piquet', 'Dryfit', 'Moletom', 'Outros'];

interface InventoryMovementDialogProps {
    item: InventoryItem;
    type: 'Entrada' | 'Saída';
    onConfirm: (movement: Omit<InventoryMovement, 'id' | 'itemId'>) => void;
}

function InventoryMovementDialog({ item, type, onConfirm }: InventoryMovementDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [quantity, setQuantity] = React.useState<number | ''>('');
    const [notes, setNotes] = React.useState('');

    const handleConfirm = () => {
        if (!quantity || quantity <= 0) {
            toast({ title: 'Quantidade inválida', description: 'Por favor, insira uma quantidade positiva.', variant: 'destructive' });
            return;
        }

        onConfirm({
            type,
            quantity: Number(quantity),
            date: new Date().toISOString(),
            responsible: 'Usuário Admin', // Mocked user
            notes,
        });

        toast({
            title: `Registro de ${type} Realizado!`,
            description: `${quantity}kg de ${item.name} (${item.color}) foram registrados.`,
        });
        setIsOpen(false);
        setQuantity('');
        setNotes('');
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className={type === 'Entrada' ? 'text-green-600' : 'text-red-600'}>
                    {type === 'Entrada' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar {type} de Estoque</DialogTitle>
                    <DialogDescription>
                        {item.name} - {item.color} (Atual: {item.quantity}kg)
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade (kg)</Label>
                        <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} placeholder="0.00" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Observações (Opcional)</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Material para o pedido ORD001" />
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm}>Confirmar {type}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function InventoryTable({ category, items, onUpdateInventory }: { category: InventoryCategory, items: InventoryItem[], onUpdateInventory: (item: InventoryItem, movement: Omit<InventoryMovement, 'id' | 'itemId'>) => void }) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredItems = items.filter(item => 
        item.category === category &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar material nesta aba..."
                    className="pl-8 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Card>
                 <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead>Cor</TableHead>
                                <TableHead>Fornecedor</TableHead>
                                <TableHead className="text-center">Quantidade (Kg)</TableHead>
                                <TableHead>Últ. Atualização</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length > 0 ? filteredItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.color}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                                    <TableCell className="text-center font-bold">{item.quantity.toFixed(1)}</TableCell>
                                    <TableCell>{format(parseISO(item.lastUpdated), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <InventoryMovementDialog item={item} type="Entrada" onConfirm={(m) => onUpdateInventory(item, m)} />
                                            <InventoryMovementDialog item={item} type="Saída" onConfirm={(m) => onUpdateInventory(item, m)} />
                                            <Button variant="ghost" size="icon">
                                                <History className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Nenhum item encontrado nesta categoria.
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


export default function InventoryPage() {
    const [inventory, setInventory] = React.useState<InventoryItem[]>(mockInventory);
    
    const handleUpdateInventory = (item: InventoryItem, movement: Omit<InventoryMovement, 'id' | 'itemId'>) => {
        setInventory(prevInventory => 
            prevInventory.map(i => {
                if (i.id === item.id) {
                    const newQuantity = movement.type === 'Entrada' 
                        ? i.quantity + movement.quantity 
                        : i.quantity - movement.quantity;
                    return { ...i, quantity: newQuantity, lastUpdated: new Date().toISOString() };
                }
                return i;
            })
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Controle de Estoque</CardTitle>
                        <CardDescription>
                            Gerencie o estoque de materiais da sua empresa.
                        </CardDescription>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4"/>
                        Novo Material
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="Malha PV" className="w-full">
                    <TabsList className="flex-wrap h-auto justify-start">
                        {categories.map(category => (
                             <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                        ))}
                    </TabsList>
                    {categories.map(category => (
                        <TabsContent key={category} value={category}>
                           <InventoryTable 
                             category={category} 
                             items={inventory} 
                             onUpdateInventory={handleUpdateInventory} 
                           />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
