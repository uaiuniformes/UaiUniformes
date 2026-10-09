
'use client';

import * as React from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Home, UserPlus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';
import { mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { EmployeeFormDialog } from '@/components/employees/employee-form';


export default function EmployeesPage() {
    const router = useRouter();
    const { showLoader } = useLoader();
    const [users, setUsers] = React.useState<User[]>(mockUsers);
    
    const handleBackClick = () => {
        showLoader();
        router.back();
    };

    const handleSaveUser = (user: User) => {
        setUsers(prev => {
            const existing = prev.find(u => u.id === user.id);
            if (existing) {
                return prev.map(u => u.id === user.id ? user : u);
            }
            return [...prev, user];
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
                            <CardTitle>Funcionários e Permissões</CardTitle>
                            <CardDescription>
                                Gerencie os usuários do sistema e seus níveis de acesso.
                            </CardDescription>
                        </div>
                    </div>
                    <EmployeeFormDialog onSave={handleSaveUser}>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Adicionar Funcionário
                        </Button>
                    </EmployeeFormDialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Permissão</TableHead>
                            <TableHead><span className="sr-only">Ações</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{user.role}</Badge>
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
                                            <EmployeeFormDialog user={user} onSave={handleSaveUser}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                            </EmployeeFormDialog>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
