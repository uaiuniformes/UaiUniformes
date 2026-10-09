'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { LoaderLink } from './loader-link';

interface ProductionChartProps {
  data: { name: string; Pedidos: number; fill: string }[];
}

export function ProductionChart({ data }: ProductionChartProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Produção por Responsável</CardTitle>
                <CardDescription>Volume de pedidos por responsável.</CardDescription>
            </div>
            <LoaderLink href="/dashboard/reports/production">
              <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório
              </Button>
            </LoaderLink>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--card-foreground))',
                borderRadius: 'var(--radius)'
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="Pedidos" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
