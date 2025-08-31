const Subscription = require('../models/subscription-model');

// Save subscription from frontend
exports.subscribe = async (req, res) => {
  try {
    const { subscription, location } = req.body;
    
    if (!subscription || !subscription.endpoint || !location) {
      return res.status(400).json({ 
        error: 'Subscription and location are required' 
      });
    }
    
    // Check if subscription already exists
    const existingSub = await Subscription.findOne({ 
      endpoint: subscription.endpoint 
    });
    
    if (existingSub) {
      // Update existing subscription with new location
      existingSub.keys = subscription.keys;
      existingSub.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      };
      existingSub.userAgent = req.get('User-Agent');
      await existingSub.save();
      
      return res.status(200).json({ 
        message: 'Subscription updated successfully' 
      });
    }
    
    // Create new subscription
    const newSubscription = new Subscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      userAgent: req.get('User-Agent')
    });
    
    await newSubscription.save();
    
    res.status(201).json({ 
      message: 'Subscription saved successfully' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Remove subscription
exports.unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ 
        error: 'Endpoint is required' 
      });
    }
    
    await Subscription.deleteOne({ endpoint });
    
    res.status(200).json({ 
      message: 'Unsubscribed successfully' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};