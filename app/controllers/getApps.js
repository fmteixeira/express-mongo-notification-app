var { MongoDB } = require("../mongodb");

// Subscribe Route
module.exports = function(app) {
  app.route("/getApps").post((req, res) => {
    // Get pushSubscription Object
    const subscription = req.body;
    console.log("Subscription", subscription);

    function compareSubscriptions(givenSub, subscriptions) {
      const isSubscribed = sub => givenSub.endpoint === sub.endpoint;
      return subscriptions.some(isSubscribed);
    }

    MongoDB.getApps()
      .then(appList => {
        console.log("Apps Response: ", appList);
        const apps = appList.map(app => {
          console.log();
          return {
            appName: app.appName,
            isSubscribed: compareSubscriptions(subscription, app.subscriptions)
          };
        });
        res.json(apps);
        console.log("Apps: ", apps);
      })
      .catch(err => {
        console.log(err);
        // Send 500 - Server Error
        res.status(500).json({});
      });
  });
};
