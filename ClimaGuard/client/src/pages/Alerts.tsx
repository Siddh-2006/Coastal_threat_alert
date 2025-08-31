import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Waves, Mountain, Zap, Droplets, Users, MessageCircle, Heart, Share2, TrendingUp, Activity, MapPin, RefreshCw, Eye, EyeOff } from 'lucide-react';

const Alerts = () => {
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [location, setLocation] = useState({ latitude: 21.6458, longitude: 88.2636 }); // Sundarbans coordinates

  // Weather parameter mappings for each alert category
  const categoryWeatherMapping = {
    'storm': {
      primary: ['wind_speed_10m', 'wind_gusts_10m', 'surface_pressure'],
      secondary: ['wind_direction_10m', 'wind_shear'],
      thresholds: { wind_speed_10m: 25, surface_pressure: 1000, wind_gusts_10m: 35 }
    },
    'erosion': {
      primary: ['wind_speed_10m', 'precipitation'],
      secondary: ['wind_direction_10m'],
      thresholds: { wind_speed_10m: 20, precipitation: 5 }
    },
    'pollution': {
      primary: ['wind_speed_10m', 'wind_direction_10m'],
      secondary: ['temperature_2m', 'relative_humidity_2m'],
      thresholds: { wind_speed_10m: 5 }
    },
    'algae': {
      primary: ['temperature_2m', 'wind_speed_10m'],
      secondary: ['relative_humidity_2m'],
      thresholds: { temperature_2m: 28, wind_speed_10m: 10 }
    },
    'coral': {
      primary: ['temperature_2m'],
      secondary: ['wind_speed_10m'],
      thresholds: { temperature_2m: 30 }
    }
  };

  const alertCategories = [
    {
      id: 'storm',
      title: 'Storm Surge',
      icon: Waves,
      color: 'text-blue-500',
      description: 'Coastal flooding and storm surge warnings',
      why: 'Storm surges can cause devastating flooding, property damage, and pose serious threats to coastal communities.',
      posts: 3,
      urgency: 'high'
    },
    {
      id: 'erosion',
      title: 'Soil Erosion',
      icon: Mountain,
      color: 'text-orange-500',
      description: 'Coastal and inland erosion monitoring',
      why: 'Soil erosion threatens infrastructure, agricultural land, and natural habitats, requiring immediate attention.',
      posts: 5,
      urgency: 'medium'
    },
    {
      id: 'pollution',
      title: 'Pollution Alert',
      icon: Zap,
      color: 'text-red-500',
      description: 'Air and water pollution monitoring',
      why: 'Pollution directly impacts human health, marine life, and ecosystem balance, demanding urgent action.',
      posts: 8,
      urgency: 'high'
    },
    {
      id: 'algae',
      title: 'Algal Blooms',
      icon: Droplets,
      color: 'text-green-500',
      description: 'Harmful algal bloom detection',
      why: 'Algal blooms can produce toxins harmful to marine life, drinking water, and recreational activities.',
      posts: 2,
      urgency: 'medium'
    },
    {
      id: 'coral',
      title: 'Coral Bleaching',
      icon: Heart,
      color: 'text-pink-500',
      description: 'Coral reef health monitoring',
      why: 'Coral reefs support marine biodiversity and protect coastlines from erosion and storm damage.',
      posts: 4,
      urgency: 'medium'
    }
  ];

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Unusual Storm Activity Detected",
      content: "High winds and pressure drops observed in coastal areas. Community members report increased wave activity.",
      author: "Coastal Watch Team",
      userType: "authority",
      timestamp: "2 hours ago",
      category: "storm",
      urgent: true,
      likes: 15,
      comments: 8,
      location: "Sundarbans Delta"
    },
    {
      id: 2,
      title: "Soil Erosion Near Fishing Village",
      content: "Significant erosion observed along the riverbank. Local fishing infrastructure at risk.",
      author: "Village Environmental Committee",
      userType: "ngo",
      timestamp: "4 hours ago",
      category: "erosion",
      urgent: false,
      likes: 23,
      comments: 12,
      location: "Gosaba Island"
    },
    {
      id: 3,
      title: "Water Quality Concerns",
      content: "Unusual discoloration in water bodies. Possible industrial runoff detected upstream.",
      author: "Fisher Collective",
      userType: "fisherfolk",
      timestamp: "6 hours ago",
      category: "pollution",
      urgent: true,
      likes: 31,
      comments: 18,
      location: "Matla River"
    }
  ]);

  // Fetch weather forecast data
  const fetchWeatherForecast = async () => {
    setLoading(true);
    try {
      // Calculate date range (last 10 days for historical data)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await fetch('http://localhost:9000/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          start_date: startDate,
          end_date: endDate
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        console.error('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherForecast();
  }, [location]);

  // Calculate alert status based on weather data and thresholds
  const calculateAlertStatus = (categoryId) => {
    if (!weatherData.forecast) return { level: 'normal', message: 'No data available' };

    const mapping = categoryWeatherMapping[categoryId];
    if (!mapping) return { level: 'normal', message: 'No monitoring configured' };

    let alertLevel = 'normal';
    let alertMessages = [];
    let hasAnomaly = weatherData.anomaly_detection?.has_anomaly || false;

    // Check primary parameters against thresholds
    mapping.primary.forEach(param => {
      if (weatherData.forecast[param]) {
        const values = weatherData.forecast[param];
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        
        const threshold = mapping.thresholds[param];
        if (threshold && maxValue > threshold) {
          alertLevel = alertLevel === 'normal' ? 'warning' : 'critical';
          alertMessages.push(`${param.replace('_', ' ').toUpperCase()}: ${maxValue.toFixed(1)} (threshold: ${threshold})`);
        }
      }
    });

    // Factor in anomaly detection
    if (hasAnomaly) {
      alertLevel = alertLevel === 'normal' ? 'warning' : 'critical';
      alertMessages.push(`Anomaly detected (error: ${weatherData.anomaly_detection.latest_reconstruction_error.toFixed(3)})`);
    }

    const message = alertMessages.length > 0 
      ? alertMessages.join(', ') 
      : 'Normal conditions predicted';

    return { level: alertLevel, message, hasAnomaly };
  };

  // Generate mini chart data for each category
  const generateMiniChart = (categoryId) => {
    if (!weatherData.forecast) return null;

    const mapping = categoryWeatherMapping[categoryId];
    if (!mapping || !mapping.primary[0]) return null;

    const primaryParam = mapping.primary[0];
    const data = weatherData.forecast[primaryParam];
    if (!data) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return data.map((value, index) => ({
      hour: index,
      value: value,
      normalized: ((value - min) / range) * 100
    }));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-success/10 text-success border-success/20';
    }
  };

  const getAlertStatusColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'authority': return 'bg-primary/10 text-primary';
      case 'ngo': return 'bg-accent/10 text-accent';
      case 'fisherfolk': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            Environmental Alerts & Weather Monitoring
          </h1>
          <p className="text-xl text-gray-600 mb-4">AI-powered environmental monitoring with real-time forecasting</p>
          
          {/* Location and Refresh Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Sundarbans Delta ({location.latitude.toFixed(3)}, {location.longitude.toFixed(3)})</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchWeatherForecast}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          {/* Weather Plot Display */}
          {weatherData.plot_data && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Weather Forecast & Anomaly Detection</h3>
              <img 
                src={`data:image/png;base64,${weatherData.plot_data}`} 
                alt="Weather Forecast Plot"
                className="max-w-full h-auto mx-auto rounded-lg"
              />
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Reconstruction Error: {weatherData.anomaly_detection?.latest_reconstruction_error?.toFixed(4) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Threshold: {weatherData.anomaly_detection?.anomaly_threshold?.toFixed(4) || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Alert Categories Grid with Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {alertCategories.map((category, index) => {
            const Icon = category.icon;
            const alertStatus = calculateAlertStatus(category.id);
            const chartData = generateMiniChart(category.id);
            
            return (
              <Card 
                key={category.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                  selectedCategory === category.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedCategory(category.id)}  
              >
                {/* Alert Status Indicator */}
                <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-lg ${
                  alertStatus.level === 'critical' ? 'bg-red-500' :
                  alertStatus.level === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                    <p className="text-xs text-gray-600 mb-3">{category.description}</p>
                  </div>
                  
                  {/* Mini Chart */}
                  {chartData && (
                    <div className="mb-4">
                      <div className="h-8 flex items-end justify-between gap-1">
                        {chartData.slice(0, 12).map((point, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-t from-blue-400 to-blue-500 rounded-sm flex-1"
                            style={{ height: `${Math.max(point.normalized * 0.8, 10)}%` }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">Next 12 hours</div>
                    </div>
                  )}
                  
                  {/* Status and Metrics */}
                  <div className="space-y-2">
                    <Badge variant="outline" className={getAlertStatusColor(alertStatus.level)}>
                      {alertStatus.level.toUpperCase()}
                      {alertStatus.hasAnomaly && <AlertTriangle className="w-3 h-3 ml-1" />}
                    </Badge>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={getUrgencyColor(category.urgency)}>
                        {category.urgency.toUpperCase()}
                      </Badge>
                      <span className="text-gray-500">{category.posts} reports</span>
                    </div>
                  </div>
                  
                  {/* Expandable Details */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCard(expandedCard === category.id ? null : category.id);
                    }}
                  >
                    {expandedCard === category.id ? (
                      <>Hide Details <EyeOff className="w-3 h-3 ml-1" /></>
                    ) : (
                      <>Show Details <Eye className="w-3 h-3 ml-1" /></>
                    )}
                  </Button>
                  
                  {/* Expanded Details */}
                  {expandedCard === category.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-2">
                      <div>
                        <strong>Forecast Status:</strong>
                        <p className="text-gray-600 mt-1">{alertStatus.message}</p>
                      </div>
                      
                      {weatherData.forecast && categoryWeatherMapping[category.id] && (
                        <div>
                          <strong>Key Parameters:</strong>
                          <div className="mt-1 space-y-1">
                            {categoryWeatherMapping[category.id].primary.map(param => {
                              const values = weatherData.forecast[param];
                              if (!values) return null;
                              
                              const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
                              const max = Math.max(...values).toFixed(1);
                              
                              return (
                                <div key={param} className="flex justify-between">
                                  <span className="capitalize">{param.replace('_', ' ')}:</span>
                                  <span>Avg: {avg}, Max: {max}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <strong>Why it matters:</strong>
                        <p className="text-gray-600 mt-1">{category.why}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Posts and Reporting Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {selectedCategory === 'all' ? 'All Community Reports' : 
                 alertCategories.find(c => c.id === selectedCategory)?.title + ' Reports'}
              </h2>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory('all')}
                disabled={selectedCategory === 'all'}
              >
                Show All
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                Loading weather data...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No reports found for this category.</div>
            ) : (
              filteredPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className={`p-6 hover:shadow-md transition-all duration-200 ${
                    post.urgent ? 'border-l-4 border-l-red-500' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{post.author}</span>
                          <Badge variant="outline" className={getUserTypeColor(post.userType)}>
                            {post.userType}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{post.timestamp}</span>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{post.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {post.urgent && (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        URGENT
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.content}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                        <Heart className="w-4 h-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    
                    {/* Show category-specific forecast insights */}
                    {weatherData.forecast && post.category !== 'all' && (
                      <div className="text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        AI Forecast Available
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Report Creation Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 bg-gradient-to-br from-white to-blue-50">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                Report Environmental Alert
              </h3>
              
              <div className="space-y-4">
                <Input placeholder="Alert title..." className="border-gray-300" />
                <Textarea 
                  placeholder="Describe the environmental concern you've observed..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border-gray-300 min-h-[100px]"
                />
                
                <div className="space-y-2">
                  <label htmlFor="alert-category" className="text-sm font-medium">Category</label>
                  <select
                    id="alert-category"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option>Select category...</option>
                    {alertCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="alert-location" className="text-sm font-medium">Location</label>
                  <Input 
                    id="alert-location"
                    placeholder="Specific location or area..." 
                    className="border-gray-300" 
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Submit Alert
                </Button>
                
                <p className="text-xs text-gray-500">
                  Your report will be enhanced with AI weather forecasting and shared with environmental authorities and the community.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;