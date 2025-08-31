const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
    },
    auth: {
      type: String,
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location queries
subscriptionSchema.index({ location: '2dsphere' });

// Update the updatedAt field before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);