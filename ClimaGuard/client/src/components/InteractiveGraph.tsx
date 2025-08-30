import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Waves, Wind, Thermometer, Droplets } from 'lucide-react';

interface DataPoint {
  time: string;
  temperature: number;
  oceanLevel: number;
  windSpeed: number;
  precipitation: number;
}

const InteractiveGraph = () => {
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'oceanLevel' | 'windSpeed' | 'precipitation'>('temperature');
  const [timeRange, setTimeRange] = useState([7]);
  const [animationPhase, setAnimationPhase] = useState(0);

  const metrics = [
    { key: 'temperature' as const, label: 'Temperature', icon: Thermometer, unit: '°C', color: 'text-orange-500' },
    { key: 'oceanLevel' as const, label: 'Ocean Level', icon: Waves, unit: 'cm', color: 'text-blue-500' },
    { key: 'windSpeed' as const, label: 'Wind Speed', icon: Wind, unit: 'km/h', color: 'text-green-500' },
    { key: 'precipitation' as const, label: 'Precipitation', icon: Droplets, unit: 'mm', color: 'text-purple-500' },
  ];

  // Generate sample data
  const generateData = (): DataPoint[] => {
    const days = timeRange[0];
    const data: DataPoint[] = [];
    
    for (let i = 0; i < days; i++) {
      data.push({
        time: `Day ${i + 1}`,
        temperature: 22 + Math.sin(i * 0.5) * 5 + Math.random() * 3,
        oceanLevel: 0 + Math.sin(i * 0.3) * 15 + Math.random() * 5,
        windSpeed: 25 + Math.sin(i * 0.4) * 10 + Math.random() * 8,
        precipitation: Math.random() * 30,
      });
    }
    return data;
  };

  const [data, setData] = useState(generateData());

  useEffect(() => {
    setData(generateData());
  }, [timeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const currentMetric = metrics.find(m => m.key === selectedMetric)!;
  const currentValue = data[data.length - 1]?.[selectedMetric] || 0;
  const previousValue = data[data.length - 2]?.[selectedMetric] || 0;
  const trend = currentValue > previousValue;

  return (
    <Card className="card-oceanic p-6 h-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gradient">Environmental Monitor</h3>
            <p className="text-sm text-muted-foreground">Real-time coastal ecosystem data</p>
          </div>
          <Badge variant="outline" className="ocean-gradient text-white border-0">
            Live Data
          </Badge>
        </div>

        {/* Metric Selection */}
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.key;
            return (
              <Button
                key={metric.key}
                variant={isSelected ? "oceanic" : "ghost"}
                size="sm"
                onClick={() => setSelectedMetric(metric.key)}
                className={`justify-start transition-all duration-300 ${
                  isSelected ? 'shadow-md' : ''
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${metric.color}`} />
                {metric.label}
              </Button>
            );
          })}
        </div>

        {/* Current Value Display */}
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{currentMetric.label}</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gradient">
                  {currentValue.toFixed(1)}{currentMetric.unit}
                </span>
                {trend ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentMetric.color} bg-background/50`}>
              <currentMetric.icon className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Animated Graph Visualization */}
        <div className="relative h-32 bg-gradient-to-t from-primary/5 to-transparent rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-center space-x-1 p-2">
            {data.slice(-10).map((point, index) => {
              const value = point[selectedMetric];
              const maxValue = Math.max(...data.map(d => d[selectedMetric]));
              const height = (value / maxValue) * 80 + 20;
              
              return (
                <div
                  key={index}
                  className="flex-1 max-w-6 ocean-gradient rounded-t-sm transition-all duration-500 animate-float"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              );
            })}
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary-glow rounded-full animate-float"
                style={{
                  left: `${(i * 15 + animationPhase) % 100}%`,
                  top: `${20 + Math.sin(animationPhase * 0.1 + i) * 30}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Time Range Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time Range</span>
            <span className="text-sm font-medium">{timeRange[0]} days</span>
          </div>
          <Slider
            value={timeRange}
            onValueChange={setTimeRange}
            max={30}
            min={3}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};

export default InteractiveGraph;