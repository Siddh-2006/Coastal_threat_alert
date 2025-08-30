import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Globe, Users, Bell, BarChart3, Waves, Leaf } from 'lucide-react';

const Home = ({ user }) => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [graphData, setGraphData] = useState([]);

  const metrics = {
    temperature: { label: 'Ocean Temperature', color: '#ef4444', unit: '°C' },
    seaLevel: { label: 'Sea Level Rise', color: '#3b82f6', unit: 'mm' },
    pollution: { label: 'Pollution Index', color: '#f97316', unit: 'AQI' },
    biodiversity: { label: 'Biodiversity Index', color: '#10b981', unit: 'score' },
  };

  useEffect(() => {
    // Generate sample data for the interactive graph
    const generateData = () => {
      const data = [];
      for (let i = 0; i < 24; i++) {
        let value;
        switch (selectedMetric) {
          case 'temperature':
            value = 18 + Math.sin(i * 0.5) * 3 + Math.random() * 2;
            break;
          case 'seaLevel':
            value = 5 + Math.sin(i * 0.3) * 2 + Math.random() * 1;
            break;
          case 'pollution':
            value = 50 + Math.sin(i * 0.4) * 20 + Math.random() * 10;
            break;
          case 'biodiversity':
            value = 75 - Math.sin(i * 0.6) * 15 + Math.random() * 5;
            break;
          default:
            value = Math.random() * 100;
        }
        data.push({ time: i, value: Math.max(0, value) });
      }
      return data;
    };

    setGraphData(generateData());
  }, [selectedMetric]);

  const stats = [
    { icon: Shield, label: 'Active Monitors', value: '2,847', color: 'text-blue-400' },
    { icon: Users, label: 'Protected Communities', value: '156k', color: 'text-green-400' },
    { icon: Bell, label: 'Alerts Sent', value: '12.3M', color: 'text-orange-400' },
    { icon: Globe, label: 'Coastal Coverage', value: '89%', color: 'text-purple-400' },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      description: 'Advanced AI models predict coastal threats up to 72 hours in advance',
    },
    {
      icon: Waves,
      title: 'Real-time Monitoring',
      description: 'Continuous monitoring of ocean conditions, weather patterns, and ecosystem health',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Location-based notifications delivered instantly to relevant stakeholders',
    },
    {
      icon: Leaf,
      title: 'Ecosystem Protection',
      description: 'Comprehensive protection for marine biodiversity and coastal environments',
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-7 gap-8 items-center">
          {/* Left Section (2/7) */}
          <div className="col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Platform Statistics</h2>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-200">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Section (3/7) */}
          <div className="col-span-3 text-center space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Protecting Our <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Coastal Future</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Advanced early warning system for coastal ecosystem threats. 
                Empowering communities with predictive intelligence to safeguard our planet.
              </p>
            </div>

            {/* Interactive Graph */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex justify-center space-x-2 mb-4">
                {Object.entries(metrics).map(([key, metric]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedMetric === key
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
              
              <div className="h-48 relative">
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={metrics[selectedMetric].color} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={metrics[selectedMetric].color} stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  {graphData.length > 0 && (
                    <>
                      <path
                        d={`M 0 ${192 - (graphData[0].value / 100) * 192} ${graphData
                          .map((point, index) => `L ${(index / (graphData.length - 1)) * 100}% ${192 - (point.value / 100) * 192}`)
                          .join(' ')}`}
                        fill="url(#graphGradient)"
                        className="opacity-70"
                      />
                      <path
                        d={`M 0 ${192 - (graphData[0].value / 100) * 192} ${graphData
                          .map((point, index) => `L ${(index / (graphData.length - 1)) * 100}% ${192 - (point.value / 100) * 192}`)
                          .join(' ')}`}
                        fill="none"
                        stroke={metrics[selectedMetric].color}
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute bottom-2 left-4 text-white text-sm">
                  {metrics[selectedMetric].label} ({metrics[selectedMetric].unit})
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                to="/forecasting"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Forecasts
              </Link>
              <Link
                to="/alerts"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Active Alerts
              </Link>
            </div>
          </div>

          {/* Right Section (2/7) */}
          <div className="col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-4 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-start space-x-3">
                  <feature.icon className="w-6 h-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-200">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Our Mission: <span className="text-blue-400">A Resilient Tomorrow</span>
          </h2>
          <p className="text-xl text-gray-200 leading-relaxed mb-12">
            ClimaGuard represents the next generation of environmental protection technology. 
            By combining cutting-edge AI, real-time monitoring, and community engagement, 
            we're building a world where coastal communities can thrive despite climate challenges.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Predictive Power</h3>
              <p className="text-gray-200">
                AI-driven forecasts that give communities the time they need to prepare and protect.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Community First</h3>
              <p className="text-gray-200">
                Built for everyone from government agencies to local fishing communities.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <Globe className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Global Impact</h3>
              <p className="text-gray-200">
                Protecting coastal ecosystems worldwide through collaborative intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;