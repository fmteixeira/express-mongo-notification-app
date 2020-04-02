var { MongoDB } = require("../mongodb");
const webpush = require("web-push");

// Subscribe Route
module.exports = function(app) {
  app.route("/unsubscribe").delete((req, res) => {
    // Get pushSubscription Object
    const subscription = req.body;
    // Get appName
    const appName = req.query.appName;

    if (!appName) {
      // Send 201 - Missing Parameter
      res.status(400).json({});
    } else {
      // Remove Subscription to given App Name
      MongoDB.deleteSubscriptionFromApp(appName, subscription)
        .then(updateRes => {
          console.log("updateRes: ", updateRes);
          if (updateRes.lastErrorObject.updatedExisting) {
            console.log(`MongoDB: Removed Subscription to "${appName}"`);
          } else {
            console.log(
              `MongoDB: Created App "${appName}" and Removed Subscription`
            );
          }
          // Send 201 - Resource Created
          res.status(201).json({});
          // Create Payload
          const payload = `You unsubscribed to App: ${appName}`;
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
