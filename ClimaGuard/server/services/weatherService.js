const axios = require('axios');

// Fetch weather data from API
exports.fetchWeatherData = async (location) => {
  try {
    // Replace with your weather API endpoint and key
    const API_KEY = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location.lat},${location.lng}&days=3`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Check for weather anomalies
exports.checkForAnomalies = (weatherData) => {
  const anomalies = [];
  const { forecast, current } = weatherData;
  
  // Check for heavy rain
  if (forecast.forecastday[0].day.totalprecip_mm > 50) {
    anomalies.push({
      type: 'rain',
      severity: 'high',
      title: 'Heavy Rainfall Warning',
      message: `Heavy rainfall (${forecast.forecastday[0].day.totalprecip_mm}mm) expected in your area. Possible flooding.`,
      affectedArea: {
        type: 'Point',
        coordinates: [current.lon, current.lat]
      },
      radius: 50 // 50km radius
    });
  }
  
  // Check for high winds
  if (current.wind_kph > 60) {
    anomalies.push({
      type: 'wind',
      severity: 'moderate',
      title: 'High Wind Warning',
      message: `Strong winds (${current.wind_kph} kph) expected in your area.`,
      affectedArea: {
        type: 'Point',
        coordinates: [current.lon, current.lat]
      },
      radius: 30 // 30km radius
    });
  }
  
  // Check for extreme temperatures
  if (current.temp_c > 35) {
    anomalies.push({
      type: 'heatwave',
      severity: 'high',
      title: 'Heat Wave Alert',
      message: `Extreme heat (${current.temp_c}°C) expected in your area. Stay hydrated.`,
      affectedArea: {
        type: 'Point',
        coordinates: [current.lon, current.lat]
      },
      radius: 40 // 40km radius
    });
  }
  
  if (current.temp_c < 0) {
    anomalies.push({
      type: 'coldwave',
      severity: 'moderate',
      title: 'Freezing Temperature Alert',
      message: `Freezing temperatures (${current.temp_c}°C) expected in your area.`,
      affectedArea: {
        type: 'Point',
        coordinates: [current.lon, current.lat]
      },
      radius: 40 // 40km radius
    });
  }
  
  return anomalies;
};