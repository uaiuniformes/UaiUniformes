
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const userRoles: UserRole[] = ['Administrador', 'Gerente', 'Vendedor', 'Cortadeira'];

interface EmployeeFormDialogProps {
  user?: User;
  children: React.ReactNode;
  onSave: (user: User) => void;
}

export function EmployeeFormDialog({ user, children, onSave }: EmployeeFormDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<User>>(user || { role: 'Vendedor' });
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user?.avatar || null);

  const isEditMode = !!user;

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        // In a real app, you'd also set the file to be uploaded.
        // For this mock, we'll just use the data URL as the avatar path.
        handleInputChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    handleInputChange('avatar', '');
    const input = document.getElementById('avatar-upload-dialog') as HTMLInputElement;
    if (input) input.value = '';
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form on close
      setFormData(user || { role: 'Vendedor' });
      setPassword('');
      setConfirmPassword('');
      setAvatarPreview(user?.avatar || null);
    }
    setIsOpen(open);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
        return;
    }

    const newUser: User = {
        id: formData.id || `USER${Math.floor(Math.random() * 1000)}`,
        name: formData.name || '',
        email: formData.email || '',
        avatar: avatarPreview || 'https://placehold.co/100x100.png',
        role: formData.role || 'Vendedor',
    };
    
    onSave(newUser);
    toast({
        title: isEditMode ? 'Funcionário Atualizado' : 'Funcionário Adicionado',
        description: `${newUser.name} foi salvo com sucesso.`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Altere as informações abaixo.' : 'Preencha as informações para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="employee-form" className="space-y-4 py-2">
            <div className="flex flex-col items-center space-y-4">
                 <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview || undefined} alt={formData.name} />
                        <AvatarFallback>{formData.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <Label htmlFor="avatar-upload-dialog" className="absolute -bottom-1 -right-1 block cursor-pointer">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background hover:bg-muted">
                            <Camera className="h-4 w-4" />
                        </div>
                    </Label>
                    <Input id="avatar-upload-dialog" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                     {avatarPreview && (
                        <Button variant="ghost" size="icon" className="absolute -top-1 -right-1 h-6 w-6" onClick={handleRemoveAvatar}>
                            <X className="h-4 w-4" />
                        </Button>
                     )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Permissão</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as UserRole)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a permissão" />
                        </SelectTrigger>
                        <SelectContent>
                            {userRoles.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEditMode} placeholder={isEditMode ? 'Deixe em branco para não alterar' : ''}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!isEditMode && !!password} />
                </div>
            </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button type="submit" form="employee-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
