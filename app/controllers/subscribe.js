var { MongoDB } = require("../mongodb");
const webpush = require("web-push");

// Subscribe Route
module.exports = function(app) {
  app.route("/subscribe").post((req, res) => {
    // Get pushSubscription Object
    const subscription = req.body;
    // Get appName
    const appName = req.query.appName;

    if (!appName) {
      // Send 201 - Missing Parameter
      res.status(400).json({});
    } else {
      // Add Subscription to given App Name
      MongoDB.addSubscriptionToApp(appName, subscription)
        .then(updateRes => {
          console.log("updateRes: ", updateRes);
          if (updateRes.lastErrorObject.updatedExisting) {
            console.log(`MongoDB: Added Subscription to "${appName}"`);
          } else {
            console.log(
              `MongoDB: Created App "${appName}" and added Subscription`
            );
          }
          // Send 201 - Resource Created
          res.status(201).json({});
          // Create Payload
          const payload = `You subscribed to App: ${appName}`;
          // Send Notification
          webpush
            .sendNotification(subscription, payload)
            .catch(error => console.error(error));
        })
        .catch(err => {
          console.log(err);
          // Send 500 - Server Error
          res.status(500).json({});
        });
    }
  });
};
