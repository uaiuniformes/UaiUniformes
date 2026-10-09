

'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Users, XCircle, Trash2, FileText, Scissors, DollarSign, Settings, Warehouse, Briefcase } from 'lucide-react';
import { LoaderLink } from './loader-link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function UserNav() {
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/01.png" alt="Usuário" />
            <AvatarFallback>UA</AvatarFallback>
            </Avatar>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Usuário Admin</p>
            <p className="text-xs leading-none text-muted-foreground">
            Admin@Uai.com
            </p>
        </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <LoaderLink href="/dashboard/profile">
          <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
          </DropdownMenuItem>
        </LoaderLink>
        <LoaderLink href="/dashboard/inventory">
            <DropdownMenuItem>
                <Warehouse className="mr-2 h-4 w-4" />
                <span>Estoque</span>
            </DropdownMenuItem>
        </LoaderLink>
        
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <FileText className="mr-2 h-4 w-4" />
                <span>Relatórios</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <LoaderLink href="/dashboard/reports/production">
                        <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            <span>Vendas</span>
                        </DropdownMenuItem>
                    </LoaderLink>
                    <LoaderLink href="/dashboard/reports/cutting">
                         <DropdownMenuItem>
                            <Scissors className="mr-2 h-4 w-4" />
                            <span>Corte</span>
                        </DropdownMenuItem>
                    </LoaderLink>
                    <LoaderLink href="/dashboard/reports/sewing">
                         <DropdownMenuItem>
                            <Scissors className="mr-2 h-4 w-4" />
                            <span>Costura</span>
                        </DropdownMenuItem>
                    </LoaderLink>
                    <LoaderLink href="/dashboard/reports/cash-flow">
                         <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            <span>Caixa</span>
                        </DropdownMenuItem>
                    </LoaderLink>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        <LoaderLink href="/dashboard/customers">
            <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Clientes</span>
            </DropdownMenuItem>
        </LoaderLink>
        <LoaderLink href="/dashboard/canceled">
            <DropdownMenuItem>
                <XCircle className="mr-2 h-4 w-4" />
                <span>Cancelados</span>
            </DropdownMenuItem>
        </LoaderLink>
        <LoaderLink href="/dashboard/deleted">
            <DropdownMenuItem>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Deletados</span>
            </DropdownMenuItem>
        </LoaderLink>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-end p-1">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <LoaderLink href="/dashboard/settings">
                             <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings />
                             </Button>
                        </LoaderLink>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Configurações</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <LoaderLink href="/">
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                              <LogOut />
                           </Button>
                        </LoaderLink>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Logout</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </DropdownMenuContent>
    </DropdownMenu>
  )
}
