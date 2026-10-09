

'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Search, X } from 'lucide-react';
import Link from 'next/link';
import type { Customer } from '@/lib/types';
import { dataStore } from '@/lib/data-store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLoader } from '@/hooks/use-loader';

const cityData = [
  { name: 'Açucena', uf: 'MG' },
  { name: 'Alvarenga', uf: 'MG' },
  { name: 'Bom Jesus do Galho', uf: 'MG' },
  { name: 'Bugre', uf: 'MG' },
  { name: 'Caratinga', uf: 'MG' },
  { name: 'Córrego Novo', uf: 'MG' },
  { name: 'Dionísio', uf: 'MG' },
  { name: 'Dom Cavati', uf: 'MG' },
  { name: 'Entre Folhas', uf: 'MG' },
  { name: 'Iapu', uf: 'MG' },
  { name: 'Imbé de Minas', uf: 'MG' },
  { name: 'Inhapim', uf: 'MG' },
  { name: 'Ipanema', uf: 'MG' },
  { name: 'Joanésia', uf: 'MG' },
  { name: 'Matipó', uf: 'MG' },
  { name: 'Nova Módica', uf: 'MG' },
  { name: 'Orizânia', uf: 'MG' },
  { name: 'Piedade de Caratinga', uf: 'MG' },
  { name: 'Pingo Dágua', uf: 'MG' },
  { name: 'Raul Soares', uf: 'MG' },
  { name: 'Santa Bárbara do Leste', uf: 'MG' },
  { name: 'Santa Rita de Minas', uf: 'MG' },
  { name: 'São Domingo das Dores', uf: 'MG' },
  { name: 'São Sebastião do Anta', uf: 'MG' },
  { name: 'Tarumirim', uf: 'MG' },
  { name: 'Ubaporanga', uf: 'MG' },
  { name: 'Vermelho Novo', uf: 'MG' },
  { name: 'Vargem Alegre', uf: 'MG' },
  { name: 'EUA', uf: '' },
];


export function CustomerForm({ customer: initialCustomer }: { customer?: Customer }) {
  const [formData, setFormData] = useState<Partial<Customer>>(initialCustomer || {});
  const [selectedUf, setSelectedUf] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(initialCustomer?.imageUrl || null);


  useEffect(() => {
    if (initialCustomer) {
      setFormData(initialCustomer);
      const city = cityData.find(c => c.name === initialCustomer.city);
      setSelectedUf(city ? city.uf : '');
      setLogoPreview(initialCustomer.imageUrl || null);
    }
  }, [initialCustomer]);

  const handleInputChange = (field: keyof Customer, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCityChange = (cityName: string) => {
    handleInputChange('city', cityName);
    const city = cityData.find(c => c.name === cityName);
    setSelectedUf(city ? city.uf : '');
  };

  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCnpjSearch = () => {
    const list = dataStore.getCustomers();
    const cleanCnpj = formData.cnpj?.replace(/\D/g, '') || '';
    const foundCustomer = list.find(c => (c.cnpj || '').replace(/\D/g, '') === cleanCnpj && cleanCnpj.length > 0);
    if (foundCustomer) {
      setFormData(foundCustomer);
      const city = cityData.find(c => c.name === foundCustomer.city);
      setSelectedUf(city ? city.uf : (foundCustomer.uf || ''));
      setLogoPreview(foundCustomer.imageUrl || null);
      toast({
        title: 'Cliente encontrado',
        description: `Dados preenchidos com base em ${foundCustomer.companyName}.`,
      });
    } else {
      toast({
        title: 'Não encontrado',
        description: 'Nenhum cliente cadastrado localmente com este CNPJ.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    const input = document.getElementById('logo-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSaveCustomer = () => {
    if (!formData.companyName?.trim()) {
      toast({
        title: 'Nome da Empresa obrigatório',
        description: 'Por favor, informe a razão social ou nome fantasia da empresa.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const saved = dataStore.saveCustomer({
        ...(initialCustomer?.id ? { id: initialCustomer.id } : {}),
        companyName: formData.companyName.trim(),
        responsible: formData.responsible || '',
        role: formData.role || 'Responsável',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        cnpj: formData.cnpj || '',
        cpf: formData.cpf || '',
        city: formData.city || '',
        uf: selectedUf || formData.uf || '',
        imageUrl: logoPreview || formData.imageUrl || '',
      });

      toast({
        title: 'Cliente salvo com sucesso!',
        description: `O cliente ${saved.companyName} foi gravado.`,
      });

      router.push('/dashboard/customers');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar o cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>
              Detalhes de contato e identificação do cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
             <div className="grid md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="company-name">Empresa</Label>
                  <Input id="company-name" placeholder="Nome da empresa" value={formData.companyName || ''} onChange={e => handleInputChange('companyName', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsible-name">Responsável</Label>
                  <Input id="responsible-name" placeholder="Nome do contato principal" value={formData.responsible || ''} onChange={e => handleInputChange('responsible', e.target.value)} />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contato@empresa.com" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Select onValueChange={handleCityChange} value={formData.city || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityData.map(city => (
                        <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input id="uf" value={selectedUf} placeholder="UF" readOnly />
                </div>
                 <div className="grid md:grid-cols-2 gap-4 md:col-span-2">
                      <div className="grid gap-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <div className="flex items-center gap-2">
                              <Input id="cnpj" placeholder="00.000.000/0001-00" value={formData.cnpj || ''} onChange={e => handleInputChange('cnpj', e.target.value)} />
                              <Button variant="outline" size="icon" onClick={handleCnpjSearch}>
                                  <Search className="h-4 w-4" />
                              </Button>
                          </div>
                           <p className="text-xs text-muted-foreground">
                              Clique na lupa para buscar os dados automaticamente.
                          </p>
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="cpf">CPF (opcional)</Label>
                          <Input id="cpf" placeholder="000.000.000-00" value={formData.cpf || ''} onChange={e => handleInputChange('cpf', e.target.value)} />
                      </div>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-6">
           <Card>
              <CardHeader>
                  <CardTitle>Logo da Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                  {logoPreview ? (
                    <div className="relative group w-full h-32">
                        <Image src={logoPreview} alt="Preview da logo" layout="fill" className="rounded-lg object-contain" />
                         <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemoveLogo}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  ) : (
                    <Label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-center text-muted-foreground">
                                Clique para carregar a logo ou foto
                            </p>
                        </div>
                        <Input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </Label>
                  )}
              </CardContent>
          </Card>

          <div className="flex items-center gap-2">
              <Link href="/dashboard/customers" className="w-full">
                  <Button variant="outline" className="w-full" type="button">
                      Cancelar
                  </Button>
              </Link>
              <Button 
                size="lg" 
                className="w-full" 
                type="button"
                onClick={handleSaveCustomer} 
                disabled={isSaving}
              >
                  {isSaving ? 'Salvando...' : initialCustomer ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
