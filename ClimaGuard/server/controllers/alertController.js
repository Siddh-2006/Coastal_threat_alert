const webpush = require('../config/webpush');
const Subscription = require('../models/subscription-model');
const Alert = require('../models/alert-model');

// Send notification to users in affected area
exports.sendLocationNotification = async (alertData) => {
  const { title, message, affectedArea, alertType, severity } = alertData;
  
  try {
    // Find users in affected area
    const usersInArea = await Subscription.find({
      location: {
        $geoWithin: {
          $geometry: affectedArea
        }
      }
    });
    
    if (usersInArea.length === 0) {
      console.log('No users found in the affected area');
      return { total: 0, successful: 0, failed: 0 };
    }
    
    let successfulNotifications = 0;
    let failedNotifications = 0;
    const failedEndpoints = [];
    
    // Create alert record
    const alert = new Alert({
      type: alertType,
      severity,
      title,
      message,
      affectedArea,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });
    
    // Send to each user
    for (const user of usersInArea) {
      try {
        const payload = JSON.stringify({
          title: title,
          body: message,
          icon: '/icons/weather-alert.png',
          badge: '/icons/badge.png',
          data: {
            url: `/alerts/${alert._id}`,
            alertId: alert._id.toString()
          },
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        });
        
        await webpush.sendNotification(user, payload);
        successfulNotifications++;
        
        // Add user to notified list
        alert.notifiedUsers.push(user._id);
        
      } catch (error) {
        console.error(`Failed to notify ${user.endpoint}:`, error);
        failedNotifications++;
        failedEndpoints.push(user.endpoint);
        
        // Remove invalid subscriptions
        if (error.statusCode === 410) { // Gone
          await Subscription.deleteOne({ _id: user._id });
        }
      }
    }
    
    // Save alert with notification results
    alert.totalUsersNotified = successfulNotifications;
    await alert.save();
    
    // Clean up failed subscriptions
    if (failedEndpoints.length > 0) {
      await Subscription.deleteMany({ endpoint: { $in: failedEndpoints } });
    }
    
    return {
      total: usersInArea.length,
      successful: successfulNotifications,
      failed: failedNotifications,
      alertId: alert._id
    };
    
  } catch (error) {
    console.error('Error sending location notifications:', error);
    throw error;
  }
};

// Get recent alerts for a location
exports.getAlertsForLocation = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }
    
    const alerts = await Alert.find({
      affectedArea: {
        $geoIntersects: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          }
        }
      },
      expiresAt: { $gt: new Date() }
    }).sort({ triggeredAt: -1 }).limit(10);
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};