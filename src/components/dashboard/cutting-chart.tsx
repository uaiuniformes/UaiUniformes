
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CuttingData } from '@/lib/types';
import { Button } from '../ui/button';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { LoaderLink } from './loader-link';

interface CuttingChartProps {
  data: CuttingData[];
}

export function CuttingChart({ data }: CuttingChartProps) {
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Desempenho de Corte</CardTitle>
            <CardDescription>Distribuição de peças cortadas.</CardDescription>
          </div>
          <LoaderLink href="/dashboard/reports/cutting">
            <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Relatório
            </Button>
          </LoaderLink>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--card-foreground))',
                borderRadius: 'var(--radius)'
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={50}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry) => {
                const item = data.find(d => d.name === value);
                return <span style={{ color: 'hsl(var(--foreground))' }}>{value} ({item?.value})</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
