
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(); 

/**
 * Triggers when a user gets a new follower and sends a notification.
 *
 * Followers add a flag to `/followers/{followedUid}/{followerUid}`.
 * Users save their device notification tokens to `/users/{followedUid}/notificationTokens/{notificationToken}`.
 */
exports.sendFollowerNotification = functions.database.ref('/test/int')
    .onWrite(async (change) => {
		const current = change.after.val();
		console.log(current);
		if(current == 0){
			return null;
		}
		


      // Notification details.
      const payload = {
        notification: {
          title: 'Intrusion Occurred!',
          body: `Intruder Detected, open app to acknowledge`,
		  click_action: 'OPEN_RESULT_ACTIVITY'
		  } 
      };

      // Listing all tokens as an array.
      var token = "cC-Ef21qQIWw1kIZEZdRwI:APA91bG87fypQ0EHNaKiWAE-i4TM4j6zYb9Mk1Vai36LAWN6PJDXnWezDNp4P0c7NNnP6yJZ2oLyyQM_c6HVvuXwEK9Iyi4mh-BedmhkN_jd-siR9njWkdNuEvsPneP241uY6UUFB9OI";
      // Send notifications to all tokens.
      const response = await admin.messaging().sendToDevice(token, payload);
      // For each message check if there was an error.
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          functions.logger.error(
            'Failure sending notification to',
            token,
            error
          );

        }
      });
    });