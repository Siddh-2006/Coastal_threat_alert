import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import InteractiveGraph from '@/components/InteractiveGraph';
import { Shield, Users, Globe, TrendingUp, Waves, AlertTriangle, Activity, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-sustainable-future.jpg';
import dashboardImage from '@/assets/environmental-dashboard.jpg';

const Home = () => {
  const leftStats = [
    {
      title: 'Cities Protected',
      value: '2,847',
      subtitle: 'Coastal communities',
      icon: MapPin,
      trend: 'up' as const,
      trendValue: '12%'
    },
    {
      title: 'Early Warnings',
      value: '99.7%',
      subtitle: 'Accuracy rate',
      icon: AlertTriangle,
      trend: 'up' as const,
      trendValue: '0.3%'
    },
    {
      title: 'Response Time',
      value: '3.2min',
      subtitle: 'Average alert speed',
      icon: Activity,
      trend: 'down' as const,
      trendValue: '45s'
    }
  ];

  const rightFeatures = [
    {
      title: 'AI-Powered Prediction',
      value: '5-Day',
      subtitle: 'Forecast accuracy',
      icon: TrendingUp,
      trend: 'up' as const,
      trendValue: '95%'
    },
    {
      title: 'Ocean Monitoring',
      value: '24/7',
      subtitle: 'Real-time tracking',
      icon: Waves,
      trend: 'neutral' as const,
      trendValue: 'Live'
    },
    {
      title: 'Global Coverage',
      value: '156',
      subtitle: 'Countries supported',
      icon: Globe,
      trend: 'up' as const,
      trendValue: '8'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10" />
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Sustainable coastal future" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
              ClimaGuard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The Ultimate Environmental Predictor • Protecting Coastal Ecosystems Through Advanced AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                <Shield className="w-5 h-5 mr-2" />
                Start Monitoring
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Section - 2:3:2 Layout */}
      <section className="py-16 bg-gradient-to-b from-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 h-[600px]">
            
            {/* Left Section - Stats (2/7) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">Impact</h2>
                <p className="text-muted-foreground">Global protection metrics</p>
              </div>
              
              {leftStats.map((stat, index) => (
                <div 
                  key={stat.title}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <StatsCard {...stat} />
                </div>
              ))}
            </div>

            {/* Middle Section - Interactive Graph (3/7) */}
            <div className="lg:col-span-3">
              <div className="h-full animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <InteractiveGraph />
              </div>
            </div>

            {/* Right Section - Features (2/7) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl font-bold text-gradient mb-2">Features</h2>
                <p className="text-muted-foreground">Advanced capabilities</p>
              </div>
              
              {rightFeatures.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="animate-fade-up"
                  style={{ animationDelay: `${(index + 3) * 0.2}s` }}
                >
                  <StatsCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <h2 className="text-4xl font-bold text-gradient mb-6">
                Changing the World Through Technology
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our advanced AI algorithms process real-time environmental data from thousands of sensors, 
                satellites, and monitoring stations worldwide to provide unprecedented accuracy in coastal 
                threat prediction.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="card-oceanic p-4">
                  <div className="text-2xl font-bold text-gradient">98.7%</div>
                  <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                </Card>
                <Card className="card-oceanic p-4">
                  <div className="text-2xl font-bold text-gradient">156</div>
                  <div className="text-sm text-muted-foreground">Countries Covered</div>
                </Card>
              </div>
              
              <Button variant="glow" size="lg">
                <Activity className="w-5 h-5 mr-2" />
                Explore Dashboard
              </Button>
            </div>
            
            <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Card className="card-oceanic p-2 overflow-hidden">
                <img 
                  src={dashboardImage} 
                  alt="Environmental monitoring dashboard" 
                  className="w-full h-auto rounded-lg hover-lift"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Protect Your Coastal Community?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of communities worldwide using ClimaGuard for early warning and protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;