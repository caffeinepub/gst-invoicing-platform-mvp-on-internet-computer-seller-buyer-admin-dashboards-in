import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Zap, TrendingUp } from 'lucide-react';
import { fetchConsumption } from '../../services/energyApi';
import { useEnergyFlow } from '../../state/EnergyFlowContext';
import LoadingState from '../../components/energy/LoadingState';
import ErrorState from '../../components/energy/ErrorState';
import EmptyState from '../../components/energy/EmptyState';
import ConsumptionByApplianceChart from '../../components/energy/charts/ConsumptionByApplianceChart';
import LiveStatusBadge from '../../components/energy/LiveStatusBadge';
import LastUpdatedLabel from '../../components/energy/LastUpdatedLabel';
import AnimatedNumber from '../../components/energy/AnimatedNumber';
import { ConsumptionResponse } from '../../services/energyTypes';
import { Button } from '@/components/ui/button';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function ConsumptionPage() {
  const { inputsSubmitted } = useEnergyFlow();
  const [data, setData] = useState<ConsumptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Live telemetry integration
  const { latest, connectionStatus, lastUpdated } = useLiveTelemetry();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchConsumption();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load consumption data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-update headline metrics when live data is available
  useEffect(() => {
    if (latest && data) {
      // Convert live reading to consumption metrics
      // Note: This is a simplified mapping - in production you'd have more sophisticated logic
      const liveDaily = (latest.appliancePowerUsage / 1000) * 24; // Convert W to kWh per day
      const liveMonthly = liveDaily * 30;
      
      setData(prev => prev ? {
        ...prev,
        totalDailyConsumption: liveDaily,
        totalMonthlyConsumption: liveMonthly,
      } : null);
    }
  }, [latest, data]);

  if (!inputsSubmitted && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Energy Consumption Analysis</h1>
          <p className="text-muted-foreground">
            View detailed breakdown of your energy consumption
          </p>
        </div>
        <EmptyState
          message="No consumption data available yet. Please submit your appliance and solar panel inputs first."
          actionLabel="Go to Inputs"
          actionPath="/inputs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Energy Consumption Analysis</h1>
          <p className="text-muted-foreground">
            View detailed breakdown of your energy consumption
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveStatusBadge status={connectionStatus} />
          <Button onClick={loadData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Fetch Data'}
          </Button>
        </div>
      </div>

      <LastUpdatedLabel timestamp={lastUpdated} status={connectionStatus} />

      {isLoading && <LoadingState message="Loading consumption data..." />}

      {error && !isLoading && <ErrorState message={error} onRetry={loadData} />}

      {data && !isLoading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Consumption</CardTitle>
                <Zap className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={data.totalDailyConsumption} decimals={2} suffix=" kWh" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total energy used per day</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={data.totalMonthlyConsumption} decimals={2} suffix=" kWh" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total energy used per month</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Appliance-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appliance</TableHead>
                      <TableHead className="text-right">Power (W)</TableHead>
                      <TableHead className="text-right">Hours/Day</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Daily (kWh)</TableHead>
                      <TableHead className="text-right">Monthly (kWh)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.appliances.map((appliance, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{appliance.name}</TableCell>
                        <TableCell className="text-right">{appliance.powerRating}</TableCell>
                        <TableCell className="text-right">{appliance.dailyUsageHours}</TableCell>
                        <TableCell className="text-right">{appliance.quantity}</TableCell>
                        <TableCell className="text-right">{appliance.dailyConsumption.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{appliance.monthlyConsumption.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <ConsumptionByApplianceChart appliances={data.appliances} />
        </>
      )}
    </div>
  );
}
