var { MongoDB } = require("../mongodb");
const webpush = require("web-push");

// Subscribe Route
module.exports = function(app) {
  app.route("/createApp").post((req, res) => {
    // Get appName
    const appName = req.query.appName;
    console.log("AppName: ", appName);

    // Add Subscription to given App Name
    MongoDB.createApp(appName)
      .then(() => {
        if (!appName) {
          // Send 201 - Missing Parameter
          res.status(400).json({});
        } else {
          // Send 201 - Resource Created
          res.status(201).json({});
        }
      })
      .catch(err => {
        console.log(err);
        // Send 500 - Server Error
        res.status(500).json({});
      });
  });
};
