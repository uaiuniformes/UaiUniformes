'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Home, 
  UserPlus, 
  ListPlus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Download, 
  Upload, 
  Database, 
  FileSpreadsheet, 
  RotateCcw,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { dataStore } from '@/lib/data-store';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SettingsListProps {
  categoryKey: string;
  title: string;
  items: string[];
  onItemsChange: () => void;
}

const SettingsList = ({ categoryKey, title, items, onItemsChange }: SettingsListProps) => {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState('');
  const [editingItem, setEditingItem] = React.useState<string | null>(null);
  const [editItemName, setEditItemName] = React.useState('');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    dataStore.reorderCategoryItems(categoryKey, result.source.index, result.destination.index);
    onItemsChange();
    toast({
      title: 'Ordem Atualizada!',
      description: `A ordem da lista "${title}" foi alterada.`,
    });
  };

  const handleAddItem = () => {
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      toast({
        title: 'Item já existe',
        description: `O item "${trimmed}" já está na lista.`,
        variant: 'destructive',
      });
      return;
    }
    dataStore.addCategoryItem(categoryKey, trimmed);
    setNewItemName('');
    setIsAddOpen(false);
    onItemsChange();
    toast({
      title: 'Item Adicionado!',
      description: `"${trimmed}" foi adicionado a "${title}".`,
    });
  };

  const handleStartEdit = (item: string) => {
    setEditingItem(item);
    setEditItemName(item);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const trimmed = editItemName.trim();
    if (!trimmed) return;
    dataStore.updateCategoryItem(categoryKey, editingItem, trimmed);
    setEditingItem(null);
    onItemsChange();
    toast({
      title: 'Item Atualizado!',
      description: `Item alterado para "${trimmed}".`,
    });
  };

  const handleDelete = (item: string) => {
    dataStore.deleteCategoryItem(categoryKey, item);
    onItemsChange();
    toast({
      title: 'Item Removido!',
      description: `O item "${item}" foi removido da lista "${title}".`,
      variant: 'destructive',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{items.length} itens cadastrados</CardDescription>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar {title.replace(/s$/, '')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar em "{title}"</DialogTitle>
                <DialogDescription>
                  Insira o nome do novo item para ser disponibilizado nos campos de seleção.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="item-name">Nome do Item</Label>
                <Input
                  id="item-name"
                  placeholder="Ex: Novo Modelo, Tecido, Cor..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddItem} disabled={!newItemName.trim()}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nenhum item cadastrado nesta categoria. Clique em "Adicionar" acima.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={title} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={true}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1.5 pr-3">
                    {items.map((item, index) => (
                      <Draggable key={`${title}-${item}-${index}`} draggableId={`${title}-${item}-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "flex items-center justify-between rounded-lg border p-2 bg-card hover:bg-muted/40 transition-colors",
                              snapshot.isDragging && "shadow-xl bg-accent border-primary"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps} className="p-1 cursor-grab hover:text-primary">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium">{item}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:text-primary"
                                onClick={() => handleStartEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover <span className="font-bold text-foreground">"{item}"</span> da categoria <span className="font-bold text-foreground">"{title}"</span>?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                      Sim, excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </ScrollArea>
      </CardContent>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Altere o nome do item em "{title}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-item-name">Nome do Item</Label>
            <Input
              id="edit-item-name"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={!editItemName.trim()}>Salvar Alteração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const settingTabsConfig = [
  { id: 'backup', label: '💾 Backup e Exportação', isBackup: true },
  { id: 'employees', label: '👥 Funcionários e Permissões', isSpecial: true },
  { id: 'models', label: 'Modelos de Peça' },
  { id: 'materials', label: 'Materiais' },
  { id: 'colors', label: 'Cores de Peça' },
  { id: 'sleeve-colors', label: 'Cores de Manga' },
  { id: 'cuff-colors', label: 'Cores de Punho' },
  { id: 'collar-colors', label: 'Cores de Gola' },
  { id: 'stamps', label: 'Estampas' },
  { id: 'collars', label: 'Tipos de Gola' },
  { id: 'sleeves', label: 'Tipos de Manga' },
  { id: 'additionals', label: 'Adicionais' },
  { id: 'payment-forms', label: 'Formas de Pagamento' },
  { id: 'payment-conditions', label: 'Condições de Pagamento' },
  { id: 'situations', label: 'Situação / Etapas' },
  { id: 'production-types', label: 'Tipo de Produção' },
  { id: 'responsibles', label: 'Responsáveis Internos' },
  { id: 'cutters', label: 'Cortadeiras' },
  { id: 'seamstresses', label: 'Costureiras' },
  { id: 'cities', label: 'Cidades' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { showLoader } = useLoader();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('backup');
  const [categoryItems, setCategoryItems] = React.useState<Record<string, string[]>>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadAllCategories = React.useCallback(() => {
    const map: Record<string, string[]> = {};
    settingTabsConfig.forEach((tab) => {
      if (!tab.isSpecial && !tab.isBackup) {
        map[tab.id] = dataStore.getCategoryItems(tab.id);
      }
    });
    setCategoryItems(map);
  }, []);

  React.useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories]);

  const handleBackClick = () => {
    showLoader();
    router.back();
  };

  const handleExportBackup = () => {
    const jsonStr = dataStore.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `uai_uniformes_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Backup Gerado com Sucesso!',
      description: 'O arquivo JSON com todos os dados foi baixado.',
    });
  };

  const handleExportOrdersCsv = () => {
    const orders = dataStore.getOrders();
    const headers = ['ID', 'Cliente', 'Responsavel', 'Modelo', 'Quantidade', 'Valor', 'Etapa', 'Data Pedido', 'Data Entrega'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${(o.customerResponsible || '').replace(/"/g, '""')}"`,
      `"${o.model}"`,
      o.quantity,
      `"${o.value.toFixed(2)}"`,
      `"${o.stage}"`,
      `"${o.orderDate}"`,
      `"${o.deliveryDate}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Planilha CSV Exportada!',
      description: `${orders.length} pedidos exportados para Excel/CSV.`,
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = dataStore.importBackup(content);
        if (success) {
          loadAllCategories();
          toast({
            title: 'Backup Restaurado com Sucesso!',
            description: 'Todos os pedidos, clientes e configurações foram atualizados.',
          });
        } else {
          toast({
            title: 'Erro ao restaurar',
            description: 'O arquivo selecionado não contém um formato de backup válido.',
            variant: 'destructive',
          });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDefaults = () => {
    dataStore.resetToDefaults();
    loadAllCategories();
    toast({
      title: 'Dados Restaurados',
      description: 'O sistema foi restaurado para os dados padrões de demonstração.',
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
            <h1 className="text-2xl font-bold tracking-tight font-headline">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Adicione, edite ou remova opções dos cadastros e gerencie backups.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <nav className="md:col-span-1">
          <Card>
            <CardHeader className="p-3 border-b">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[70vh]">
                <div className="space-y-1">
                  {settingTabsConfig.map((tab) => (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-9 text-sm font-medium",
                        activeTab === tab.id ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </nav>

        <main className="md:col-span-3">
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Backup e Exportação dos Dados
                  </CardTitle>
                  <CardDescription>
                    Faça download de cópias de segurança de todo o sistema ou importe um backup salvo anteriormente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-base mb-1">
                          <Download className="h-4 w-4 text-primary" />
                          Download do Backup (JSON)
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Gera um arquivo com todos os pedidos, clientes, orçamentos, estoque e configurações.
                        </p>
                      </div>
                      <Button onClick={handleExportBackup} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Backup Completo
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3 bg-muted/20 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-base mb-1">
                          <Upload className="h-4 w-4 text-emerald-600" />
                          Restaurar Backup (JSON)
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Carregue um arquivo JSON gerado anteriormente para restaurar todas as informações.
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".json"
                          className="hidden"
                          onChange={handleFileImport}
                        />
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Selecionar Arquivo JSON
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2 font-semibold text-base mb-1">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Exportar Planilha de Pedidos (CSV / Excel)
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baixe uma planilha contendo todos os pedidos registrados para visualização no Excel ou Google Sheets.
                    </p>
                    <Button variant="secondary" onClick={handleExportOrdersCsv}>
                      <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                      Baixar Planilha CSV de Pedidos
                    </Button>
                  </div>

                  <div className="border border-destructive/30 rounded-lg p-4 bg-destructive/5 space-y-2">
                    <h3 className="font-semibold text-sm text-destructive">Zona de Manutenção</h3>
                    <p className="text-xs text-muted-foreground">
                      Restaura o sistema para os dados iniciais de demonstração. Use apenas se desejar redefinir os testes.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/10">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restaurar Dados Originais de Demonstração
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Redefinir para Padrões?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Isso apagará alterações locais salvas no navegador e restaurará os dados iniciais de teste.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleResetDefaults} className="bg-destructive text-destructive-foreground">
                            Sim, Restaurar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'employees' && (
            <Card>
              <CardHeader>
                <CardTitle>Funcionários e Permissões</CardTitle>
                <CardDescription>
                  Gerencie os usuários do sistema, suas informações de login e níveis de acesso.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoaderLink href="/dashboard/employees">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Gerenciar Funcionários
                  </Button>
                </LoaderLink>
              </CardContent>
            </Card>
          )}

          {settingTabsConfig
            .filter((t) => !t.isSpecial && !t.isBackup)
            .map((tab) =>
              activeTab === tab.id ? (
                <SettingsList
                  key={tab.id}
                  categoryKey={tab.id}
                  title={tab.label}
                  items={categoryItems[tab.id] || []}
                  onItemsChange={loadAllCategories}
                />
              ) : null
            )}
        </main>
      </div>
    </div>
  );
}
