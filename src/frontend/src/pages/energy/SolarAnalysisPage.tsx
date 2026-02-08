import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Zap, Battery, TrendingUp } from 'lucide-react';
import { fetchSolarAnalysis } from '../../services/energyApi';
import { useEnergyFlow } from '../../state/EnergyFlowContext';
import LoadingState from '../../components/energy/LoadingState';
import ErrorState from '../../components/energy/ErrorState';
import EmptyState from '../../components/energy/EmptyState';
import SolarVsGridPieChart from '../../components/energy/charts/SolarVsGridPieChart';
import SolarAllocationBarChart from '../../components/energy/charts/SolarAllocationBarChart';
import LiveStatusBadge from '../../components/energy/LiveStatusBadge';
import LastUpdatedLabel from '../../components/energy/LastUpdatedLabel';
import AnimatedNumber from '../../components/energy/AnimatedNumber';
import { SolarAnalysisResponse } from '../../services/energyTypes';
import { Button } from '@/components/ui/button';
import { useLiveTelemetry } from '../../hooks/useLiveTelemetry';

export default function SolarAnalysisPage() {
  const { inputsSubmitted } = useEnergyFlow();
  const [data, setData] = useState<SolarAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Live telemetry integration
  const { latest, connectionStatus, lastUpdated } = useLiveTelemetry();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchSolarAnalysis();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load solar analysis data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-update headline metrics when live data is available
  useEffect(() => {
    if (latest && data) {
      // Update with live readings
      const liveSolarUsed = latest.solarGeneration;
      const liveGridUsed = latest.gridImport;
      const liveExcess = Math.max(0, latest.solarGeneration - latest.gridImport);
      const liveEfficiency = latest.solarGeneration > 0 
        ? (liveSolarUsed / (liveSolarUsed + liveGridUsed)) * 100 
        : 0;
      
      setData(prev => prev ? {
        ...prev,
        solarUsed: liveSolarUsed,
        gridUsed: liveGridUsed,
        excessEnergy: liveExcess,
        efficiencyPercentage: liveEfficiency,
      } : null);
    }
  }, [latest, data]);

  if (!inputsSubmitted && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Solar Energy Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your solar vs grid energy usage and efficiency
          </p>
        </div>
        <EmptyState
          message="No solar analysis data available yet. Please submit your appliance and solar panel inputs first."
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Solar Energy Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your solar vs grid energy usage and efficiency
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

      {isLoading && <LoadingState message="Loading solar analysis..." />}

      {error && !isLoading && <ErrorState message={error} onRetry={loadData} />}

      {data && !isLoading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solar Energy Used</CardTitle>
                <Leaf className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={data.solarUsed} decimals={2} suffix=" kWh" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">From solar panels</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grid Energy Used</CardTitle>
                <Zap className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={data.gridUsed} decimals={2} suffix=" kWh" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">From power grid</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excess Solar</CardTitle>
                <Battery className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={data.excessEnergy} decimals={2} suffix=" kWh" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Surplus energy</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-success/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                <TrendingUp className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  <AnimatedNumber value={data.efficiencyPercentage} decimals={1} suffix="%" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Solar efficiency rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SolarVsGridPieChart solarUsed={data.solarUsed} gridUsed={data.gridUsed} />
            <SolarAllocationBarChart
              solarUsed={data.solarUsed}
              gridUsed={data.gridUsed}
              excessEnergy={data.excessEnergy}
            />
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <span className="text-muted-foreground">Solar Panel Capacity</span>
                  <span className="text-xl font-bold">{data.solarCapacity} kW</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <span className="text-muted-foreground">Battery Storage</span>
                  <span className="text-xl font-bold">{data.batteryStorage} kWh</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
