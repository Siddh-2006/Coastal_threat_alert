const webpush = require('web-push');
require('dotenv').config();

// Check if VAPID keys are set in environment variables
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error(
    'VAPID keys are not set. Please add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to your environment variables.'
  );
}

// Validate the VAPID keys format
try {
  webpush.setVapidDetails(
    'mailto:admin@climaguard.com', // Replace with your actual email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('VAPID keys configured successfully');
} catch (error) {
  console.error('Invalid VAPID keys:', error.message);
  throw new Error('Failed to configure VAPID keys. Please check your key format.');
}

module.exports = webpush;