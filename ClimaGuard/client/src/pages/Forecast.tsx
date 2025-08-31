import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Droplets, Wind, Thermometer, Waves, AlertTriangle, 
  Gauge, Eye, Clock, MapPin
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';

interface PredictionResponse {
  forecast: {
    surface_pressure: number[];
    pressure_tendency: number[];
    wind_speed_10m: number[];
    wind_speed_100m: number[];
    wind_gusts_10m: number[];
    wind_shear: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    temperature_2m: number[];
    precipitation: number[];
    cloud_cover: number[];
    wind_direction_10m: number[];
  };
  anomaly_detection: {
    has_anomaly: boolean;
    latest_reconstruction_error: number;
    anomaly_threshold: number;
    total_anomalies: number;
    anomaly_indices: number[];
    reconstruction_errors: number[];
  };
  reconstruction_error: number;
  plot_data: string;
  timestamp: string;
  metadata: {
    location: { latitude: number; longitude: number; };
    data_period: { start: string; end: string; };
    historical_data_points: number;
    features_available: string[];
    forecast_horizon: number;
  };
}

const Forecast = () => {
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 10);

        const response = await fetch(`${import.meta.env.VITE_PREDICTION_API || 'http://localhost:9000'}/forecast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: 21.90,
            longitude: 89.51,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPredictionData(data);
      } catch (err) {
        console.error("Prediction fetch error:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch prediction data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions with proper error handling
  const safeGetAverage = (values: number[] | undefined): number => {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
  };

  const safeGetMax = (values: number[] | undefined): number => {
    if (!values || values.length === 0) return 0;
    return Math.max(...values.map(v => v || 0));
  };

  const safeGetMin = (values: number[] | undefined): number => {
    if (!values || values.length === 0) return 0;
    return Math.min(...values.map(v => v || 0));
  };

  const formatChartData = (values: number[] | undefined, label: string) => {
    if (!values) return [];
    return values.map((value, index) => ({
      hour: index + 1,
      [label]: parseFloat((value || 0).toFixed(2)),
      time: `${index + 1}h`
    }));
  };

  const getRiskLevel = () => {
    if (!predictionData?.anomaly_detection) return { level: 'UNKNOWN', color: 'bg-gray-500/20 text-gray-500' };
    
    if (predictionData.anomaly_detection.has_anomaly) {
      return { level: 'HIGH RISK', color: 'bg-red-500/20 text-red-500' };
    }
    
    const errorRate = predictionData.anomaly_detection.latest_reconstruction_error;
    if (errorRate > 0.5) return { level: 'MODERATE', color: 'bg-yellow-500/20 text-yellow-500' };
    return { level: 'LOW RISK', color: 'bg-green-500/20 text-green-500' };
  };

  // Chart components with error handling
  const TemperatureChart = () => {
    if (!predictionData?.forecast?.temperature_2m) return <div className="h-full flex items-center justify-center text-muted-foreground">No temperature data available</div>;
    
    const data = formatChartData(predictionData.forecast.temperature_2m, 'temperature');
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))" 
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const WindChart = () => {
    if (!predictionData?.forecast?.wind_speed_10m) return <div className="h-full flex items-center justify-center text-muted-foreground">No wind data available</div>;
    
    const windData = predictionData.forecast.wind_speed_10m.map((speed, index) => ({
      hour: index + 1,
      wind_speed: speed || 0,
      wind_gusts: predictionData.forecast?.wind_gusts_10m?.[index] || 0,
      time: `${index + 1}h`
    }));
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={windData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Line type="monotone" dataKey="wind_speed" stroke="#3b82f6" strokeWidth={2} name="Wind Speed (m/s)" />
          <Line type="monotone" dataKey="wind_gusts" stroke="#f59e0b" strokeWidth={2} name="Gusts (m/s)" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const PressureChart = () => {
    if (!predictionData?.forecast?.surface_pressure) return <div className="h-full flex items-center justify-center text-muted-foreground">No pressure data available</div>;
    
    const data = formatChartData(predictionData.forecast.surface_pressure, 'pressure');
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Line type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const AnomalyChart = () => {
    if (!predictionData?.anomaly_detection?.reconstruction_errors) return <div className="h-full flex items-center justify-center text-muted-foreground">No anomaly data available</div>;
    
    const anomalyData = predictionData.anomaly_detection.reconstruction_errors.map((error, index) => ({
      index: index + 1,
      error: error || 0,
      threshold: predictionData.anomaly_detection?.anomaly_threshold || 0,
      isAnomaly: predictionData.anomaly_detection?.anomaly_indices?.includes(index) || false
    }));
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={anomalyData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="error" name="Reconstruction Error">
            {anomalyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isAnomaly ? "#ef4444" : "#22c55e"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-2xl font-bold mb-2">Loading Predictions...</h2>
          <p className="text-muted-foreground">Analyzing environmental data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const riskLevel = getRiskLevel();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Forecasting Dashboard</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Real-time environmental predictions powered by AI
          </p>
          {predictionData && (
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className={riskLevel.color}>
                Status: {riskLevel.level}
              </Badge>
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {predictionData.metadata.location.latitude.toFixed(2)}, {predictionData.metadata.location.longitude.toFixed(2)}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(predictionData.timestamp).toLocaleTimeString()}
              </Badge>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">
                  {predictionData ? `${safeGetAverage(predictionData.forecast.temperature_2m).toFixed(1)}°C` : '--°C'}
                </p>
              </div>
              <Thermometer className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="text-2xl font-bold">
                  {predictionData ? `${safeGetAverage(predictionData.forecast.wind_speed_10m).toFixed(1)} m/s` : '-- m/s'}
                </p>
              </div>
              <Wind className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pressure</p>
                <p className="text-2xl font-bold">
                  {predictionData ? `${safeGetAverage(predictionData.forecast.surface_pressure).toFixed(0)} hPa` : '-- hPa'}
                </p>
              </div>
              <Gauge className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold">
                  {predictionData?.anomaly_detection?.total_anomalies || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Chart Selection and Display */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Environmental Metrics</h2>
            <div className="flex gap-2">
              <Button 
                variant={selectedMetric === 'temperature' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedMetric('temperature')}
              >
                <Thermometer className="w-4 h-4 mr-1" />
                Temperature
              </Button>
              <Button 
                variant={selectedMetric === 'wind' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedMetric('wind')}
              >
                <Wind className="w-4 h-4 mr-1" />
                Wind
              </Button>
              <Button 
                variant={selectedMetric === 'pressure' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedMetric('pressure')}
              >
                <Gauge className="w-4 h-4 mr-1" />
                Pressure
              </Button>
            </div>
          </div>
          
          <div className="h-80">
            {selectedMetric === 'temperature' && <TemperatureChart />}
            {selectedMetric === 'wind' && <WindChart />}
            {selectedMetric === 'pressure' && <PressureChart />}
          </div>
        </Card>

        {/* Anomaly Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Anomaly Detection</h3>
            <div className="h-64 mb-4">
              <AnomalyChart />
            </div>
            {predictionData?.anomaly_detection && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Current Error</p>
                  <p className="text-lg font-semibold">
                    {predictionData.anomaly_detection.latest_reconstruction_error.toFixed(4)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Threshold</p>
                  <p className="text-lg font-semibold">
                    {predictionData.anomaly_detection.anomaly_threshold.toFixed(4)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Total Anomalies</p>
                  <p className="text-lg font-semibold">
                    {predictionData.anomaly_detection.total_anomalies}
                  </p>
                </div>
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">System Analysis</h3>
            {predictionData?.plot_data ? (
              <div className="h-64">
                <img 
                  src={`data:image/png;base64,${predictionData.plot_data}`}
                  alt="System Analysis Plot" 
                  className="w-full h-full object-contain rounded"
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Analysis plot not available</p>
                </div>
              </div>
            )}
            
            {predictionData?.metadata && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Data Period: {predictionData.metadata.data_period.start} to {predictionData.metadata.data_period.end}</p>
                <p>Historical Points: {predictionData.metadata.historical_data_points.toLocaleString()}</p>
                <p>Features: {predictionData.metadata.features_available.length}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forecast;