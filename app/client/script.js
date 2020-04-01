/* Varriables */
const applicationServerPublicKey =
  "BPf8gkZ051TIP3AiT0R3OyFUNcCwCDwHWOdlmgc6AHR96XPlbAnLwS5J3ZkTeTxxH384B5OCpcpLUfk1ykPWi30";

const pushButton = document.querySelector(".push-btn");
const inputField = document.querySelector("#input");

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
    pushButton.textContent = "Push Not Supported";
    return false;
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
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log("User is subscribed: ", subscription);

      // Subscribe the User on the server here!
      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn(isSubscribed);
    })
    .catch(function(err) {
      console.log("Failed to subscribe the user: ", err);
      updateBtn(false);
    });
}

/* Unsubscribe User */

function unsubscribeUser() {
  swRegistration.pushManager
    .getSubscription()
    .then(function(subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log("Error unsubscribing", error);
    })
    .then(function() {
      // Unsubscribe the User on the server here!
      //updateSubscriptionOnServer(null);

      console.log("User is unsubscribed.");
      isSubscribed = false;

      updateBtn(isSubscribed);
    });
}

/* API Calls */

async function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server
  if (subscription) {
    console.log(`Sending Subscription to ${inputField.value}`);
    console.log("API Fetch: ", `/subscribe?to=${inputField.value}`);
    await fetch(`/subscribe?to=${inputField.value}`, {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json"
      }
    }).then(res => console.log("Subscription Response: ", res));
  } else {
    console.error("Unsubscribe not yet Implemented");
  }
}

/* Update Button */
function updateBtn(isSubscribed) {
  if (Notification.permission === "denied") {
    pushButton.textContent = "Push Messaging Blocked";
    pushButton.disabled = true;
    //updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = "Disable Push Messaging";
    pushButton.addEventListener("click", function() {
      unsubscribeUser();
    });
  } else {
    pushButton.textContent = "Enable Push Messaging";
    pushButton.addEventListener("click", function() {
      subscribeUser();
    });
  }

  pushButton.disabled = false;
}

/* Start Push */

function initializeUI() {
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    const subscriptionJson = document.querySelector(".js-subscription-json");
    const subscriptionDetails = document.querySelector(
      ".js-subscription-details"
    );

    if (isSubscribed) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      console.log("User IS subscribed.");
    } else {
      console.log("User IS NOT subscribed.");
    }

    updateBtn(isSubscribed);
  });
}
getServiveWorker().then(serviceWorker => {
  if (serviceWorker) {
    initializeUI();
  }
});
