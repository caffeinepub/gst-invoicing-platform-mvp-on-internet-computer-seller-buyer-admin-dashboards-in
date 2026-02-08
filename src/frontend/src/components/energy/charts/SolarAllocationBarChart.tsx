import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SolarAllocationBarChartProps {
  solarUsed: number;
  gridUsed: number;
  excessEnergy: number;
}

export default function SolarAllocationBarChart({
  solarUsed,
  gridUsed,
  excessEnergy,
}: SolarAllocationBarChartProps) {
  const data = [
    {
      category: 'Energy Flow',
      'Solar Used': solarUsed,
      'Grid Used': gridUsed,
      'Excess Solar': excessEnergy,
    },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Energy Allocation Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="category" className="text-xs" />
            <YAxis className="text-xs" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="Solar Used" fill="oklch(var(--chart-1))" />
            <Bar dataKey="Grid Used" fill="oklch(var(--chart-4))" />
            <Bar dataKey="Excess Solar" fill="oklch(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
