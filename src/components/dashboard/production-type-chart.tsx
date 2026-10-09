'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ProductionTypeChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function ProductionTypeChart({ data }: ProductionTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Etapa</CardTitle>
        <CardDescription>Distribuição dos pedidos em cada etapa da produção.</CardDescription>
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
              wrapperStyle={{ fontSize: '11px', lineHeight: '1.5' }}
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
