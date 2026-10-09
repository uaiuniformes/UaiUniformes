'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const checklistItems = [
  'Designer - Fazer Pedido',
  'Compra de Material',
  'Produção - Corte de material',
  'Produção - Separar Arte',
  'Produção - Imprimir Arte',
  'Produção - Estampagem',
  'Produção - Costureira e Arremate',
  'Vendas - Conclusão',
];

export function Checklist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Checklist de Processos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {checklistItems.map((item) => {
          const id = item.toLowerCase().replace(/\s+/g, '-');
          return (
            <div key={id} className="flex items-center gap-3">
              <Checkbox id={id} />
              <Label htmlFor={id} className="text-sm font-normal">
                {item}
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
