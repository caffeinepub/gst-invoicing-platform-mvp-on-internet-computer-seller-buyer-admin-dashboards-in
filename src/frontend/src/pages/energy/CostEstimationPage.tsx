import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, Zap, Leaf } from 'lucide-react';
import { fetchCostEstimation } from '../../services/energyApi';
import { useEnergyFlow } from '../../state/EnergyFlowContext';
import LoadingState from '../../components/energy/LoadingState';
import ErrorState from '../../components/energy/ErrorState';
import EmptyState from '../../components/energy/EmptyState';
import LiveStatusBadge from '../../components/energy/LiveStatusBadge';
import LastUpdatedLabel from '../../components/energy/LastUpdatedLabel';
import AnimatedNumber from '../../components/energy/AnimatedNumber';
import { CostEstimationResponse } from '../../services/energyTypes';
import { Button } from '@/components/ui/button';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function CostEstimationPage() {
  const { inputsSubmitted } = useEnergyFlow();
  const [data, setData] = useState<CostEstimationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Live telemetry integration
  const { latest, connectionStatus, lastUpdated } = useLiveTelemetry();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCostEstimation();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cost estimation data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-update headline metrics when live data is available
  useEffect(() => {
    if (latest && data) {
      // Simplified cost calculation based on live readings
      const gridCostPerKwh = 0.12; // Example rate
      const liveMonthlySavings = (latest.solarGeneration * 30 * gridCostPerKwh);
      const liveAnnualSavings = liveMonthlySavings * 12;
      
      setData(prev => prev ? {
        ...prev,
        monthlySavings: liveMonthlySavings,
        annualSavings: liveAnnualSavings,
      } : null);
    }
  }, [latest, data]);

  if (!inputsSubmitted && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cost Estimation & Savings</h1>
          <p className="text-muted-foreground">
            Calculate your potential savings and return on investment
          </p>
        </div>
        <EmptyState
          message="No cost estimation data available yet. Please submit your appliance and solar panel inputs first."
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Cost Estimation & Savings</h1>
          <p className="text-muted-foreground">
            Calculate your potential savings and return on investment
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

      {isLoading && <LoadingState message="Loading cost estimation..." />}

      {error && !isLoading && <ErrorState message={error} onRetry={loadData} />}

      {data && !isLoading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-soft border-success/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                <DollarSign className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  $<AnimatedNumber value={data.monthlySavings} decimals={2} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per month with solar</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  $<AnimatedNumber value={data.annualSavings} decimals={2} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per year with solar</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
                <Calendar className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={data.paybackPeriod} decimals={1} suffix=" years" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solar ROI</CardTitle>
                <TrendingUp className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  <AnimatedNumber value={data.solarROI} decimals={1} suffix="%" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Cost Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Grid Only</span>
                    <Zap className="h-4 w-4 text-warning" />
                  </div>
                  <div className="text-2xl font-bold">${data.gridCostPerMonth.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Monthly grid cost</p>
                </div>
                <div className="p-4 border border-success/50 rounded-lg bg-success/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">With Solar</span>
                    <Leaf className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-success">${data.solarCostPerMonth.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Monthly hybrid cost</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
