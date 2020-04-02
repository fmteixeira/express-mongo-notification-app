// Application

async function fetchApps() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    const subscription = await swRegistration.pushManager.getSubscription();

    // Fetch Applications
    return await fetch("/getApps", {
      method: "POST",
      body: subscription ? JSON.stringify(subscription) : undefined,
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(async res => await res.json())
      .catch(error => {
        console.error("Error:", error);
      });
  }
}

function displayApps(apps) {
  if (apps) {
    // Display Apps in List
    console.log("Fetched Apps: ", apps);
    $("#app-list")
      .empty()
      .append(
        apps.map(app =>
          $(
            `<li class="${app.isSubscribed ? "subscribed" : ""}"><a>${
              app.appName
            }</a></li>`
          )
        )
      );
  }
}

async function createApp(appName) {
  console.log("CREATE APP", appName);
  // Fetch Applications
  return await fetch(`/createApp?appName=${appName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => {
      console.log("Create Response: ", res);
      // Fetch Apps and display them
      fetchApps().then(apps => displayApps(apps));
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

$(document).ready(function() {
  // Fetch Apps and display them
  fetchApps().then(apps => displayApps(apps));

  // On App click subcribe to it
  $("#app-list").on("click", "a", event => {
    const appName = $(event.target).text();
    if (
      $(event.target)
        .parent()
        .hasClass("subscribed")
    ) {
      console.log("Should unsub");
      removeSubscriptionOnServer(appName, false);
    } else {
      console.log("Should sub");
      addSubscriptionOnServer(appName, true);
    }
  });

  // On Create App Button click create an App
  $("#create-app-btn").on("click", () => {
    const appName = $("#input").text();
    createApp($("#input").val());
  });
});

// Service Worker & Subscriptions

/* Variables */
const applicationServerPublicKey =
  "BPf8gkZ051TIP3AiT0R3OyFUNcCwCDwHWOdlmgc6AHR96XPlbAnLwS5J3ZkTeTxxH384B5OCpcpLUfk1ykPWi30";

const pushButton = $("#push-btn");
const inputField = $("#input");

let isSubscribed = false;
let swRegistration = null;

/* Get Service Worket */
async function getServiveWorker() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    console.log("Service Worker and Push is supported");

    return navigator.serviceWorker
      .register("sw.js")
      .then(function(swReg) {
        swRegistration = swReg;
        return swRegistration;
      })
      .catch(function(error) {
        console.error("Service Worker Error", error);
        return false;
      });
  } else {
    console.warn("Push messaging is not supported");
    pushButton.html("Push Not Supported");
    return false;
  }
}

async function isClientSubscribed() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    const subscription = await swRegistration.pushManager.getSubscription();
    return subscription ? true : false;
  }
}

/* Subscribe User */

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser() {
  // Subscribe the User on the server here!
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    updateSubscriptionOnServer(subscription, true);
  });
}

async function enablePushNotificatios() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log("User is subscribed: ", subscription);

      isSubscribed = true;

      updateBtn(isSubscribed);
    })
    .catch(function(err) {
      console.log("Failed to subscribe the user: ", err);
      updateBtn(false);
    });
}

/* Unsubscribe User */

/*function unsubscribeUser() {
    // Unsubscribe the User on the server here!
    //updateSubscriptionOnServer(null);
}*/

function disablePushNotificatios() {
  swRegistration.pushManager
    .getSubscription()
    .then(function(subscription) {
      subscription
        .unsubscribe()
        .then(function(successful) {
          console.log("You've successfully unsubscribed" + successful);
        })
        .catch(e => {
          console.log("Unsubscription failed" + e);
        });
    })
    .catch(function(error) {
      console.log("Error unsubscribing", error);
    })
    .then(function() {
      console.log("User is unsubscribed.");
      isSubscribed = false;

      updateBtn(isSubscribed);
    });
}

/* API Calls */

async function addSubscriptionOnServer(appName) {
  const subscription = await swRegistration.pushManager.getSubscription();
  if (subscription) {
    console.log(`Sending Subscription to ${appName}`);
    await fetch(`/subscribe?appName=${appName}`, {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => {
      console.log("Subscription Response: ", res);
      // Fetch Apps and display them
      fetchApps().then(apps => displayApps(apps));
    });
  } else {
    console.error("Unsubscribe not yet Implemented");
  }
}

async function removeSubscriptionOnServer(appName) {
  const subscription = await swRegistration.pushManager.getSubscription();
  if (subscription) {
    console.log(`Sending Subscription to ${appName}`);
    await fetch(`/unsubscribe?appName=${appName}`, {
      method: "DELETE",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => {
      console.log("Subscription Response: ", res);
      // Fetch Apps and display them
      fetchApps().then(apps => displayApps(apps));
    });
  } else {
    console.error("Unsubscribe not yet Implemented");
  }
}

/* Update Button */
function updateBtn(isSubscribed) {
  if (Notification.permission === "denied") {
    pushButton.html("Push Messaging Blocked");
    pushButton.attr("disabled", true);
    return;
  }

  if (isSubscribed) {
    pushButton.attr("disabled", true);
    pushButton.html("Push Messaging Enabled");
  } else {
    pushButton.attr("disabled", false);
    pushButton.html("Enable Push Messaging");
    pushButton.on("click", function() {
      enablePushNotificatios();
    });
  }
}

/* Start Push */

function initializeUI() {
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    const subscriptionJson = $(".js-subscription-json");
    const subscriptionDetails = $(".js-subscription-details");

    if (isSubscribed) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      console.log("User IS subscribed.");
      updateBtn(true);
    } else {
      console.log("User IS NOT subscribed.");
      updateBtn(false);
    }

    updateBtn(isSubscribed);
  });
}
getServiveWorker().then(serviceWorker => {
  if (serviceWorker) {
    initializeUI();
  }
});
