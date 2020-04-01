const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");

const app = express().use(bodyParser.json());

// Set Static Path
app.use(express.static(path.join(__dirname, "client")));

const publicVapidKey =
  "BPf8gkZ051TIP3AiT0R3OyFUNcCwCDwHWOdlmgc6AHR96XPlbAnLwS5J3ZkTeTxxH384B5OCpcpLUfk1ykPWi30";
const privateVapidKey = "Aa_SeNHd-pgyURBsr59VFtkL1YzAYBtJ2ZBCN7JEilA";

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

const subscriptionsList = [];

async function getSubscriptionsList() {
  return subscriptionsList;
}

async function removeSubscription(subscription) {
  const index = subscriptionsList.indexOf(subscription);
  if (index > -1) {
    subscriptionsList.splice(index, 1);
  }
}

async function notifySubscribers() {
  const subscriptions = await getSubscriptionsList();
  console.log(`Notifying ${subscriptions.length} Subscribers`);

  subscriptions.forEach(subscription => {
    // Create Payload
    const payload = `You just got notificated!!!`;

    // Pass Object into sendNotification
    webpush.sendNotification(subscription, payload).catch(() => {
      removeSubscription(subscription);
    });
  });
}

setInterval(notifySubscribers, 10000);

// Subscribe Route
app.post("/subscribe", (req, res) => {
  // Get pushSubscription Object
  const subscription = req.body;

  // Send 201 - resource created
  res.status(201).json({});

  // Create Payload
  const payload = `You subscribed to: ${req.query.to}`;

  // Pass Object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch(error => console.error(error));

  // Add Subscription to subsctioptionList
  subscriptionsList.push(subscription);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
