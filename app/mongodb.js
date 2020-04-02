const MongoClient = require("mongodb").MongoClient;

class MongoDB {
  connectToMongo() {
    if (this.db) return Promise.resolve(this.db);
    return MongoClient.connect(this.url, this.options).then(
      db => (this.db = db.db("notification-app"))
    );
  }

  static getCollection(collection) {
    let func = collectionName => {
      return new Promise((resolve, reject) => {
        mongodb.db.collection(collectionName, function(
          error,
          controllerHandle
        ) {
          if (error) reject(error);
          resolve(controllerHandle);
        });
      });
    };
    return func(collection);
  }

  static getApps() {
    const func = async query => {
      try {
        const controllerHandle = await MongoDB.getCollection(
          "application-subscriptions"
        );
        const result = await controllerHandle
          .find(query, { projection: { _id: 0 } })
          .toArray();
        return result;
      } catch (e) {
        return false;
      }
    };
    let query = {};
    return func(query);
  }

  static createApp(appName, subscription) {
    var func = async query => {
      try {
        var controllerHandle = await MongoDB.getCollection(
          "application-subscriptions"
        );
        var result = await controllerHandle.insertOne(query);
        return result;
      } catch (e) {
        return e;
      }
    };
    let query = {
      appName: appName,
      subscriptions: subscription ? [subscription] : []
    };
    return func(query);
  }

  static addSubscriptionToApp(appName, subscription) {
    const func = async (query, update) => {
      try {
        const controllerHandle = await MongoDB.getCollection(
          "application-subscriptions"
        );
        const result = await controllerHandle.findAndModify(
          query,
          [["_id", "asc"]],
          update,
          { new: true, upsert: true }
        );
        return result;
      } catch (e) {
        return e;
      }
    };

    const update = { $addToSet: { subscriptions: subscription } };
    const query = { appName: appName };
    return func(query, update);
  }

  static deleteSubscriptionFromApp(appName, subscription) {
    const func = async (query, update) => {
      try {
        const controllerHandle = await MongoDB.getCollection(
          "application-subscriptions"
        );
        const result = await controllerHandle.findAndModify(
          query,
          [["_id", "asc"]],
          update
        );
        return result;
      } catch (e) {
        return e;
      }
    };

    const update = { $pull: { subscriptions: subscription } };
    const query = { appName: appName };
    return func(query, update);
  }
}

mongodb = new MongoDB();

mongodb.db = null;
mongodb.url = "mongodb://root:root@mongo:27017/";
mongodb.options = {
  reconnectTries: 5000,
  useNewUrlParser: true
};

mongodb.connectToMongo();

module.exports = { MongoDB };
