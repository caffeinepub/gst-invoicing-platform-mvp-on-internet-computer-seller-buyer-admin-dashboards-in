import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { useEnergyFlow } from '../../state/EnergyFlowContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function OverviewPage() {
  const { inputsSubmitted } = useEnergyFlow();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Energy Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor and optimize your solar energy usage for maximum efficiency
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft transition-smooth hover:shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solar Efficiency</CardTitle>
            <Leaf className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inputsSubmitted ? '—' : 'Submit inputs'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall system efficiency
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft transition-smooth hover:shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
            <Zap className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inputsSubmitted ? '—' : 'Submit inputs'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Daily total usage
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft transition-smooth hover:shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inputsSubmitted ? '—' : 'Submit inputs'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly savings estimate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft transition-smooth hover:shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Period</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inputsSubmitted ? '—' : 'Submit inputs'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payback timeline
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome to the Green Energy Usage Optimizer! To begin analyzing your energy consumption
            and solar efficiency, please submit your appliance and solar panel information.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate({ to: '/inputs' })} size="lg" className="flex-1">
              Submit Energy Inputs
            </Button>
            <Button
              onClick={() => navigate({ to: '/consumption' })}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              View Consumption
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
