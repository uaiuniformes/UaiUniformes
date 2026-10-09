'use client';

import { CustomerForm } from '@/components/customers/customer-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';

export default function NewCustomerPage() {
  const router = useRouter();
  const { showLoader } = useLoader();

  const handleBackClick = () => {
    showLoader();
    router.back();
  }
  
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
            <h1 className="text-2xl font-bold tracking-tight font-headline">Novo Cliente</h1>
            <p className="text-muted-foreground">
              Preencha as informações abaixo para cadastrar um novo cliente.
            </p>
          </div>
        </div>
      </div>
      <CustomerForm />
    </div>
  );
}
