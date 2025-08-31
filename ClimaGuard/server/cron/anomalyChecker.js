const cron = require('node-cron');
const { fetchWeatherData, checkForAnomalies } = require('../services/weatherService');
const { sendLocationNotification } = require('../controllers/alertController');
const Subscription = require('../models/subscription-model');

// Run every 30 minutes to check for weather anomalies
cron.schedule('*/30 * * * *', async () => {
  console.log('Running anomaly check:', new Date().toISOString());
  
  try {
    // Get all unique locations from subscriptions
    const uniqueLocations = await Subscription.aggregate([
      {
        $group: {
          _id: {
            lat: { $arrayElemAt: ['$location.coordinates', 1] },
            lng: { $arrayElemAt: ['$location.coordinates', 0] }
          }
        }
      },
      { $limit: 50 } // Limit to avoid too many API calls
    ]);
    
    for (const location of uniqueLocations) {
      try {
        const weatherData = await fetchWeatherData(location._id);
        const anomalies = checkForAnomalies(weatherData);
        
        // Send notifications for each anomaly
        for (const anomaly of anomalies) {
          const result = await sendLocationNotification(anomaly);
          console.log(`Notification result for ${anomaly.type}:`, result);
        }
        
        // Add delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing location ${JSON.stringify(location._id)}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Anomaly check failed:', error);
  }
});

module.exports = cron;