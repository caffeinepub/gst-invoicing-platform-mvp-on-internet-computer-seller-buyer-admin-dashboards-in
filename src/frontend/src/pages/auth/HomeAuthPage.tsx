import { Leaf, Zap, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthCornerControl from '../../components/auth/AuthCornerControl';

export default function HomeAuthPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Auth Controls in Top-Right Corner */}
      <AuthCornerControl />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-background to-background" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
                <Leaf className="h-12 w-12 text-success" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Green Energy Usage Optimizer
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Optimize your solar energy usage, track consumption, and maximize cost savings with
              intelligent energy management
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Powerful Energy Management Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Real-Time Monitoring</CardTitle>
                <CardDescription>
                  Track your energy consumption in real-time across all appliances and devices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Solar Analysis</CardTitle>
                <CardDescription>
                  Analyze solar vs grid usage with detailed efficiency metrics and visualizations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                  <TrendingDown className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>
                  Calculate savings, ROI, and payback periods to maximize your investment returns
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Illustration Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <img
              src="/assets/generated/green-energy-illustration.dim_1200x900.png"
              alt="Green Energy Optimization"
              className="w-full rounded-lg shadow-card"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-success/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Ready to Optimize Your Energy?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of users who are saving money and reducing their carbon footprint with
              our intelligent energy management platform.
            </p>
            <p className="text-sm text-muted-foreground">
              Click the icons in the top-right corner to get started
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-success hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
