import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ApplianceConsumption } from '../../../services/energyTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConsumptionByApplianceChartProps {
  appliances: ApplianceConsumption[];
}

export default function ConsumptionByApplianceChart({ appliances }: ConsumptionByApplianceChartProps) {
  const chartData = appliances.map((appliance) => ({
    name: appliance.name,
    daily: appliance.dailyConsumption,
    monthly: appliance.monthlyConsumption,
  }));

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Energy Consumption by Appliance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="daily" fill="oklch(var(--chart-1))" name="Daily (kWh)" />
            <Bar dataKey="monthly" fill="oklch(var(--chart-2))" name="Monthly (kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
