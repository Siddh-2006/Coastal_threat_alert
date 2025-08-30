import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Map, Droplets, Wind, Thermometer, Waves, AlertTriangle } from 'lucide-react';

const Forecast = () => {
  const forecastData = [
    {
      type: 'Weather',
      icon: Thermometer,
      status: 'Normal',
      severity: 'low',
      details: 'Stable conditions for next 5 days',
      data: '24°C, Light winds'
    },
    {
      type: 'Coastal Regions',
      icon: Waves,
      status: 'Watch',
      severity: 'medium',
      details: 'Elevated tide levels expected',
      data: 'High tide: +0.8m'
    },
    {
      type: 'Water Quality',
      icon: Droplets,
      status: 'Good',
      severity: 'low',
      details: 'pH levels within normal range',
      data: 'pH: 7.2, Clarity: 85%'
    },
    {
      type: 'Pollution Levels',
      icon: Wind,
      status: 'Alert',
      severity: 'high',
      details: 'Increased particulate matter detected',
      data: 'PM2.5: 45 μg/m³'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-success/10 text-success border-success/20';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">Forecasting Dashboard</h1>
          <p className="text-xl text-muted-foreground">Real-time environmental predictions and monitoring</p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Map View */}
          <div className="lg:col-span-2">
            <Card className="card-oceanic p-6 h-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gradient">Interactive Map</h3>
                <Button variant="outline" size="sm">
                  <Map className="w-4 h-4 mr-2" />
                  Full Screen
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-lg h-72 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Interactive map will be implemented with Mapbox</p>
                  <p className="text-sm">Showing coastal regions, sensor data, and alerts</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="card-oceanic p-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-gradient">247</div>
                  <div className="text-sm text-muted-foreground">Active Sensors</div>
                </div>
              </div>
            </Card>
            
            <Card className="card-oceanic p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-warning" />
                <div>
                  <div className="text-2xl font-bold text-gradient">3</div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
              </div>
            </Card>
            
            <Card className="card-oceanic p-4">
              <div className="flex items-center space-x-3">
                <Waves className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-gradient">98.7%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Forecast Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {forecastData.map((forecast, index) => {
            const Icon = forecast.icon;
            return (
              <Card 
                key={forecast.type} 
                className="card-oceanic hover-lift p-6 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 ocean-gradient rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{forecast.type}</h3>
                      <p className="text-sm text-muted-foreground">{forecast.data}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(forecast.severity)}>
                    {forecast.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{forecast.details}</p>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      forecast.severity === 'high' ? 'bg-destructive' :
                      forecast.severity === 'medium' ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ 
                      width: forecast.severity === 'high' ? '85%' : 
                             forecast.severity === 'medium' ? '60%' : '30%'
                    }}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Charts Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-oceanic p-6">
            <h3 className="text-xl font-semibold text-gradient mb-4">5-Day Trend Analysis</h3>
            <div className="bg-gradient-to-t from-primary/5 to-transparent rounded-lg h-48 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Interactive charts will be implemented</p>
              </div>
            </div>
          </Card>
          
          <Card className="card-oceanic p-6">
            <h3 className="text-xl font-semibold text-gradient mb-4">Risk Assessment</h3>
            <div className="bg-gradient-to-t from-accent/5 to-transparent rounded-lg h-48 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Risk matrix visualization</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forecast;