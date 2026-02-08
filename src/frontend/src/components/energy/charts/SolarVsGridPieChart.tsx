import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SolarVsGridPieChartProps {
  solarUsed: number;
  gridUsed: number;
}

export default function SolarVsGridPieChart({ solarUsed, gridUsed }: SolarVsGridPieChartProps) {
  const data = [
    { name: 'Solar Energy', value: solarUsed },
    { name: 'Grid Energy', value: gridUsed },
  ];

  const COLORS = ['oklch(var(--chart-1))', 'oklch(var(--chart-4))'];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Solar vs Grid Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
