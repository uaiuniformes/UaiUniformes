
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Camera, ShieldCheck, History, LogIn, FilePlus, Pencil, X, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserAction } from '@/lib/types';
import { mockUserActions } from '@/lib/mock-data';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

function ActionIcon({ type }: { type: UserAction['type'] }) {
    switch (type) {
        case 'Login':
            return <LogIn className="h-5 w-5 text-green-500" />;
        case 'Etapa Alterada':
            return <CheckSquare className="h-5 w-5 text-blue-500" />;
        case 'Pedido Criado':
            return <FilePlus className="h-5 w-5 text-purple-500" />;
        case 'Pedido Editado':
            return <Pencil className="h-5 w-5 text-orange-500" />;
        case 'Pedido Cancelado':
            return <X className="h-5 w-5 text-red-500" />;
        case 'Senha Alterada':
            return <ShieldCheck className="h-5 w-5 text-yellow-600" />;
        case 'Checklist Marcado':
             return <CheckSquare className="h-5 w-5 text-cyan-500" />;
        default:
            return <History className="h-5 w-5 text-muted-foreground" />;
    }
}

function TimeAgo({ timestamp }: { timestamp: string }) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR }));
  }, [timestamp]);

  if (!timeAgo) {
    return null; // ou um placeholder de carregamento
  }

  return (
      <p className="text-xs text-muted-foreground">
          {timeAgo}
          <span className="mx-1">·</span>
          {format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>
  );
}


export default function ProfilePage() {
    const { toast } = useToast();
    // Mock user data
    const [user, setUser] = useState({
        name: 'Usuário Admin',
        email: 'Admin@Uai.com',
        avatar: '/avatars/01.png',
    });
    const [notifications, setNotifications] = useState(true);

    const handleSaveChanges = () => {
        toast({
            title: "Perfil Atualizado",
            description: "Suas informações foram salvas com sucesso.",
        });
    };
    
    const handleChangePassword = () => {
        toast({
            title: "Senha Alterada",
            description: "Sua senha foi alterada com sucesso.",
        });
    };

  return (
    <div className="flex flex-col gap-4">
       <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Meu Perfil</h1>
            <p className="text-muted-foreground">
                Gerencie as informações da sua conta e preferências.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Details Card */}
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader className="items-center text-center">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <Label htmlFor="avatar-upload" className="absolute bottom-0 right-0 block cursor-pointer">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background hover:bg-muted">
                                    <Camera className="h-4 w-4" />
                                </div>
                                <span className="sr-only">Alterar foto</span>
                             </Label>
                             <Input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                        </div>
                        <CardTitle className="mt-4">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" defaultValue={user.name} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email} />
                        </div>
                        <Button className="w-full" onClick={handleSaveChanges}>Salvar Alterações</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Security and Preferences Card */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Segurança e Preferências</CardTitle>
                        <CardDescription>
                           Altere sua senha e gerencie as notificações do sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Change Password */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-md font-medium">Alterar Senha</h3>
                                <p className="text-sm text-muted-foreground">Para sua segurança, escolha uma senha forte.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Senha Atual</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nova Senha</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleChangePassword}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Alterar Senha
                            </Button>
                        </div>

                        <Separator />

                        {/* Preferences */}
                        <div className="space-y-4">
                             <div>
                                <h3 className="text-md font-medium">Preferências de Notificação</h3>
                                <p className="text-sm text-muted-foreground">Escolha como você deseja ser notificado.</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Notificações por Email</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receber emails sobre atualizações importantes e alertas.
                                    </p>
                                </div>
                                 <Switch
                                    checked={notifications}
                                    onCheckedChange={setNotifications}
                                    aria-label="Toggle email notifications"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Card>
             <CardHeader>
                <CardTitle>Histórico de Atividades Recentes</CardTitle>
                <CardDescription>
                    Veja as últimas ações que você realizou no sistema.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-6">
                        {mockUserActions.map(action => (
                            <div key={action.id} className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <ActionIcon type={action.type} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {action.description}
                                        {action.details?.orderId && (
                                            <Link href={`/dashboard/orders/${action.details.orderId.replace('ORD', '')}`} className="ml-1 text-primary hover:underline">
                                                (Pedido #{action.details.orderId.replace('ORD', '')})
                                            </Link>
                                        )}
                                    </p>
                                    <TimeAgo timestamp={action.timestamp} />
                                    {action.details?.from && action.details?.to && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            De: <span className="font-semibold">{action.details.from}</span> → Para: <span className="font-semibold">{action.details.to}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
