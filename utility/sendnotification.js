const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // એડમિન માટે auth key
  });

 async function sendNotification(token,title,body) {
    // Function to send a notification
    const message = {
        notification: {
          title: title, // Notification નો title
          body:body // Notification નો message body
        },
        token:token , // User નો Firebase token
      };

 const response = await admin.messaging().send(message);
     console.log("Notification મોકલાઈ ગયું:", response);
}

module.exports = sendNotification;