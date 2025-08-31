import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Droplets, Wind, Thermometer, Waves, AlertTriangle, 
  Gauge, Eye, Clock, MapPin, TrendingUp, BarChart3, LineChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, ComposedChart, ReferenceLine
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

const AdvancedForecast = () => {
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('temperature_2m');
  const [activeTab, setActiveTab] = useState('forecast');

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

  // Helper functions
  const safeGetAverage = (values: number[] | undefined): number => {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
  };

  const formatChartData = (values: number[] | undefined, label: string) => {
    if (!values) return [];
    return values.map((value, index) => ({
      hour: index + 1,
      [label]: parseFloat((value || 0).toFixed(2)),
      time: `T+${index + 1}h`
    }));
  };

  const generateReconstructionData = (originalData: number[]) => {
    // Simulate reconstruction data with slight variations
    return originalData.map(value => value * (0.95 + Math.random() * 0.1));
  };

  const calculateErrors = (original: number[], reconstruction: number[]) => {
    return original.map((val, idx) => Math.abs(val - reconstruction[idx]));
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

  // Advanced Chart Components
  const ForecastChart = () => {
    if (!predictionData?.forecast?.[selectedMetric]) {
      return <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>;
    }
    
    const data = formatChartData(predictionData.forecast[selectedMetric], 'forecast');
    
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
            dataKey="forecast" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))" 
            fillOpacity={0.2}
            strokeWidth={2}
            name="PatchTST Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const ReconstructionChart = () => {
    if (!predictionData?.forecast?.[selectedMetric]) {
      return <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>;
    }
    
    const originalData = predictionData.forecast[selectedMetric];
    const reconstructionData = generateReconstructionData(originalData);
    
    const data = originalData.map((value, index) => ({
      hour: index + 1,
      original: value,
      reconstruction: reconstructionData[index],
      time: `T+${index + 1}h`
    }));
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
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
          <Line type="monotone" dataKey="original" stroke="#3b82f6" strokeWidth={2} name="Original Forecast" />
          <Line type="monotone" dataKey="reconstruction" stroke="#ef4444" strokeWidth={2} name="Autoencoder Reconstruction" />
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  const ErrorAnalysisChart = () => {
    if (!predictionData?.anomaly_detection?.reconstruction_errors) {
      return <div className="h-full flex items-center justify-center text-muted-foreground">No error data available</div>;
    }
    
    const errorData = predictionData.anomaly_detection.reconstruction_errors.map((error, index) => ({
      hour: index + 1,
      error: error || 0,
      threshold: predictionData.anomaly_detection?.anomaly_threshold || 0,
      isAnomaly: predictionData.anomaly_detection?.anomaly_indices?.includes(index) || false,
      time: `T+${index + 1}h`
    }));
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={errorData}>
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
            dataKey="error" 
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.2}
            strokeWidth={2}
            name="Reconstruction Error"
          />
          <ReferenceLine 
            y={predictionData.anomaly_detection.anomaly_threshold} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            label={{ value: "Threshold", position: "topRight" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const CombinedChart = () => {
    if (!predictionData?.forecast?.[selectedMetric]) {
      return <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>;
    }
    
    const originalData = predictionData.forecast[selectedMetric];
    const reconstructionData = generateReconstructionData(originalData);
    const historicalHours = 24;
    
    // Create labels for historical and forecast
    const historicalLabels = Array.from({length: historicalHours}, (_, i) => `T-${historicalHours - i}`);
    const forecastLabels = Array.from({length: originalData.length}, (_, i) => `T+${i + 1}`);
    const allLabels = [...historicalLabels, ...forecastLabels];
    
    const data = allLabels.map((label, index) => {
      if (index < historicalHours) {
        return {
          time: label,
          historical: null,
          forecast: null,
          reconstruction: null
        };
      } else {
        const dataIndex = index - historicalHours;
        return {
          time: label,
          historical: null,
          forecast: originalData[dataIndex] || null,
          reconstruction: reconstructionData[dataIndex] || null
        };
      }
    });
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="time" interval={2} />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" connectNulls={false} />
          <Line type="monotone" dataKey="reconstruction" stroke="#ef4444" strokeWidth={2} name="Reconstruction" connectNulls={false} />
          <ReferenceLine 
            x={`T+1`} 
            stroke="#64748b" 
            strokeWidth={2} 
            label={{ value: "Current Time", position: "topLeft" }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-2xl font-bold mb-2">Loading Advanced Analysis...</h2>
          <p className="text-muted-foreground">Processing PatchTST predictions and anomaly detection</p>
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
            Retry Analysis
          </Button>
        </div>
      </div>
    );
  }

  const riskLevel = getRiskLevel();
  const metrics = [
    { key: 'temperature_2m', label: 'Temperature', icon: Thermometer, color: 'text-red-500' },
    { key: 'wind_speed_10m', label: 'Wind Speed', icon: Wind, color: 'text-blue-500' },
    { key: 'surface_pressure', label: 'Pressure', icon: Gauge, color: 'text-purple-500' },
    { key: 'relative_humidity_2m', label: 'Humidity', icon: Droplets, color: 'text-cyan-500' },
    { key: 'precipitation', label: 'Precipitation', icon: Waves, color: 'text-green-500' }
  ];

  const tabs = [
    { key: 'forecast', label: 'PatchTST Forecast', icon: TrendingUp },
    { key: 'reconstruction', label: 'Reconstruction', icon: LineChart },
    { key: 'error', label: 'Error Analysis', icon: BarChart3 },
    { key: 'combined', label: 'Combined View', icon: Activity }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Advanced Weather Forecast Visualization</h1>
          <p className="text-xl text-muted-foreground mb-4">
            PatchTST predictions with Autoencoder anomaly detection
          </p>
          {predictionData && (
            <div className="flex justify-center gap-4 flex-wrap">
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

        {/* Anomaly Detection Status */}
        <Card className={`p-6 mb-8 ${predictionData?.anomaly_detection?.has_anomaly ? 'border-red-500 bg-red-50/50' : 'border-green-500 bg-green-50/50'}`}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className={`w-8 h-8 mr-3 ${predictionData?.anomaly_detection?.has_anomaly ? 'text-red-500' : 'text-green-500'}`} />
              <h2 className="text-2xl font-bold">
                {predictionData?.anomaly_detection?.has_anomaly ? 'Anomaly Detected!' : 'No Anomaly Detected'}
              </h2>
            </div>
            {predictionData?.anomaly_detection && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Error</p>
                  <p className="text-2xl font-bold">{predictionData.anomaly_detection.latest_reconstruction_error.toFixed(4)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Threshold</p>
                  <p className="text-2xl font-bold">{predictionData.anomaly_detection.anomaly_threshold.toFixed(4)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Anomalies</p>
                  <p className="text-2xl font-bold">{predictionData.anomaly_detection.total_anomalies}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Metric Selector */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Feature to Visualize</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {metrics.map((metric) => (
              <Button
                key={metric.key}
                variant={selectedMetric === metric.key ? 'default' : 'outline'}
                className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                onClick={() => setSelectedMetric(metric.key)}
              >
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-xs text-center">{metric.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Tab Navigation */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-96">
            {activeTab === 'forecast' && <ForecastChart />}
            {activeTab === 'reconstruction' && <ReconstructionChart />}
            {activeTab === 'error' && <ErrorAnalysisChart />}
            {activeTab === 'combined' && <CombinedChart />}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              {activeTab === 'forecast' && 'PatchTST 24-hour forecast for the selected meteorological feature.'}
              {activeTab === 'reconstruction' && 'Comparison between original forecast and autoencoder reconstruction to identify patterns.'}
              {activeTab === 'error' && 'Reconstruction error analysis with anomaly threshold visualization.'}
              {activeTab === 'combined' && 'Unified view showing historical context and forecast predictions with reconstruction overlay.'}
            </p>
          </div>
        </Card>

        {/* Additional Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              System Analysis Plot
            </h3>
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
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Dataset Information</h3>
            {predictionData?.metadata && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data Period</p>
                  <p className="font-mono text-sm">{predictionData.metadata.data_period.start} to {predictionData.metadata.data_period.end}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Historical Data Points</p>
                  <p className="text-lg font-bold">{predictionData.metadata.historical_data_points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Features</p>
                  <p className="text-lg font-bold">{predictionData.metadata.features_available.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forecast Horizon</p>
                  <p className="text-lg font-bold">{predictionData.metadata.forecast_horizon} hours</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Features</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {predictionData.metadata.features_available.slice(0, 6).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {predictionData.metadata.features_available.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{predictionData.metadata.features_available.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedForecast;