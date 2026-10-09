'use client';

import { CustomerForm } from '@/components/customers/customer-form';
import { mockCustomers } from '@/lib/mock-data';
import { dataStore, useCustomers } from '@/lib/data-store';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useLoader } from '@/hooks/use-loader';
import { LoaderLink } from '@/components/dashboard/loader-link';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { customers } = useCustomers();
  const customer = customers.find(c => c.id === id) || dataStore.getCustomerById(id as string) || mockCustomers.find(c => c.id === id);
  const { showLoader } = useLoader();

  if (!customer) {
    return <div>Cliente não encontrado.</div>;
  }
  
  const handleBackClick = () => {
    showLoader();
    router.back();
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
            <h1 className="text-2xl font-bold tracking-tight font-headline">Editar Cliente</h1>
            <p className="text-muted-foreground">
              Altere as informações do cliente abaixo.
            </p>
          </div>
        </div>
      </div>
      <CustomerForm customer={customer} />
    </div>
  );
}
