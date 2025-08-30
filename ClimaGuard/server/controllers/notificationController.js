const webpush = require("../config/webpush");

let subscriptions = []; // you can also store in DB

// Save subscription from frontend
exports.subscribe = (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: "Subscription saved successfully." });
};

// Send notification to all
exports.sendNotification = (req, res) => {
  const payload = JSON.stringify({
    title: "Weather Alert",
    body: "Heavy rain expected in your area.",
  });

  subscriptions.forEach(sub =>
    webpush.sendNotification(sub, payload).catch(err => console.error(err))
  );

  res.status(200).json({ message: "Notifications sent." });
};
