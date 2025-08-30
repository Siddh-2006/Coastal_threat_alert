import React, { useState, useEffect } from 'react';
import { Thermometer, Waves, Droplets, Wind, MapPin, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const Forecasting = () => {
  const [selectedRegion, setSelectedRegion] = useState('pacific');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [forecastData, setForecastData] = useState({});

  const regions = [
    { id: 'pacific', name: 'Pacific Coast', coords: { lat: 37.7749, lng: -122.4194 } },
    { id: 'atlantic', name: 'Atlantic Coast', coords: { lat: 40.7128, lng: -74.0060 } },
    { id: 'gulf', name: 'Gulf Coast', coords: { lat: 29.7604, lng: -95.3698 } },
    { id: 'caribbean', name: 'Caribbean Region', coords: { lat: 18.2208, lng: -66.5901 } },
  ];

  const timeframes = [
    { id: '24h', label: '24 Hours', hours: 24 },
    { id: '48h', label: '48 Hours', hours: 48 },
    { id: '72h', label: '72 Hours', hours: 72 },
    { id: '7d', label: '7 Days', hours: 168 },
  ];

  useEffect(() => {
    // Generate sample forecast data
    const generateForecastData = () => {
      const data = {
        weather: {
          temperature: 22 + Math.random() * 8,
          humidity: 65 + Math.random() * 20,
          windSpeed: 8 + Math.random() * 15,
          pressure: 1013 + Math.random() * 20 - 10,
        },
        coastal: {
          waveHeight: 2.5 + Math.random() * 3,
          tideLevel: 1.8 + Math.sin(Date.now() / 10000) * 0.5,
          erosionRisk: Math.floor(Math.random() * 100),
          stormSurgeRisk: Math.floor(Math.random() * 100),
        },
        water: {
          quality: 85 - Math.random() * 20,
          temperature: 19 + Math.random() * 6,
          salinity: 34 + Math.random() * 2,
          oxygenLevel: 7.5 + Math.random() * 1.5,
        },
        pollution: {
          airQuality: 45 + Math.random() * 30,
          waterPollution: 25 + Math.random() * 40,
          plasticDebris: Math.floor(Math.random() * 100),
          chemicalContaminants: Math.floor(Math.random() * 50),
        },
      };
      setForecastData(data);
    };

    generateForecastData();
    const interval = setInterval(generateForecastData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [selectedRegion, selectedTimeframe]);

  const getSeverityColor = (value, type) => {
    if (type === 'quality' || type === 'oxygen') {
      if (value >= 80) return 'text-green-400';
      if (value >= 60) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      if (value >= 70) return 'text-red-400';
      if (value >= 40) return 'text-yellow-400';
      return 'text-green-400';
    }
  };

  const formatValue = (value, unit = '') => {
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Environmental Forecasting Dashboard
          </h1>
          <p className="text-xl text-gray-200">
            Real-time predictions and analysis for coastal ecosystem protection
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-white/10 backdrop-blur-lg text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 focus:outline-none"
            >
              {regions.map((region) => (
                <option key={region.id} value={region.id} className="bg-gray-800">
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white/10 backdrop-blur-lg text-white rounded-lg px-4 py-2 border border-white/20 focus:border-blue-400 focus:outline-none"
            >
              {timeframes.map((timeframe) => (
                <option key={timeframe.id} value={timeframe.id} className="bg-gray-800">
                  {timeframe.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Forecast Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weather Forecasts */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <Thermometer className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Weather Conditions</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Temperature</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.weather?.temperature || 0, '°C')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Humidity</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.weather?.humidity || 0, '%')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Wind Speed</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.weather?.windSpeed || 0, ' m/s')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Pressure</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.weather?.pressure || 0, ' hPa')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coastal Conditions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <Waves className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Coastal Conditions</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Wave Height</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.coastal?.waveHeight || 0, ' m')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Tide Level</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.coastal?.tideLevel || 0, ' m')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Erosion Risk</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.coastal?.erosionRisk || 0, 'risk')}`}>
                    {Math.floor(forecastData.coastal?.erosionRisk || 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Storm Surge Risk</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.coastal?.stormSurgeRisk || 0, 'risk')}`}>
                    {Math.floor(forecastData.coastal?.stormSurgeRisk || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Water Quality */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <Droplets className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Water Quality</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Quality Index</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.water?.quality || 0, 'quality')}`}>
                    {Math.floor(forecastData.water?.quality || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Temperature</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.water?.temperature || 0, '°C')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Salinity</span>
                  <span className="text-white font-semibold">
                    {formatValue(forecastData.water?.salinity || 0, ' ppt')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Oxygen Level</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.water?.oxygenLevel || 0, 'oxygen')}`}>
                    {formatValue(forecastData.water?.oxygenLevel || 0, ' mg/L')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pollution Levels */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <Wind className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Pollution Monitoring</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Air Quality</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.pollution?.airQuality || 0, 'pollution')}`}>
                    {Math.floor(forecastData.pollution?.airQuality || 0)} AQI
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Water Pollution</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.pollution?.waterPollution || 0, 'pollution')}`}>
                    {Math.floor(forecastData.pollution?.waterPollution || 0)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Plastic Debris</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.pollution?.plasticDebris || 0, 'pollution')}`}>
                    {Math.floor(forecastData.pollution?.plasticDebris || 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">Chemical Level</span>
                  <span className={`font-semibold ${getSeverityColor(forecastData.pollution?.chemicalContaminants || 0, 'pollution')}`}>
                    {Math.floor(forecastData.pollution?.chemicalContaminants || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Regional Overview</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">System Operational</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {regions.map((region) => (
              <div
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedRegion === region.id
                    ? 'bg-blue-500/30 border-2 border-blue-400'
                    : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                }`}
              >
                <h3 className="text-lg font-semibold text-white mb-2">{region.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-200">Risk Level</span>
                    <span className="text-green-400">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-200">Monitors Active</span>
                    <span className="text-white">{12 + Math.floor(Math.random() * 20)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-200">Last Update</span>
                    <span className="text-gray-300">2 min ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts Section */}
        <div className="mt-12 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/30">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Priority Alerts</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
              <div>
                <span className="text-red-400 font-semibold">High Wave Activity</span>
                <p className="text-gray-200 text-sm">Expected wave heights of 4.2m in Pacific Coast region</p>
              </div>
              <span className="text-gray-300 text-sm">12 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded-lg">
              <div>
                <span className="text-yellow-400 font-semibold">Water Quality Alert</span>
                <p className="text-gray-200 text-sm">Decreased oxygen levels detected in Gulf Coast monitoring stations</p>
              </div>
              <span className="text-gray-300 text-sm">45 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;