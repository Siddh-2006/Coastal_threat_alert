const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['storm', 'flood', 'heatwave', 'coldwave', 'rain', 'wind']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'moderate', 'high', 'extreme']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  affectedArea: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
    },
    coordinates: {
      type: [],
    }
  },
  radius: Number, // in kilometers for circular areas
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  notifiedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }],
  totalUsersNotified: {
    type: Number,
    default: 0
  }
});

alertSchema.index({ affectedArea: '2dsphere' });
alertSchema.index({ triggeredAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);