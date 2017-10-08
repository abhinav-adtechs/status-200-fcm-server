//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var cron = require('node-cron');
var request = require('request');
var admin = require("firebase-admin");


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];
  
var cron = require('node-cron');
 
 var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://status200-android-client.firebaseio.com"
});

var registrationToken = "fYyboPkVxkQ:APA91bElhNNxpNT19JnpdVWmDTugHEo4Pl8y9mbhntpqWWKwS_lEP6pAN0Q-rWnTy0xajmB2DsJhekYX9Zgy9ylcm8RLOAIrcOMvEmoTtIJ0A6Q5X9KKFU7w2oWTMrJ8_5EcNSdYe920";
var payload = {
  data: {
    title: "Alert",
    Message: "Your server just stopped running"
  }
};

 admin.messaging().sendToDevice(registrationToken, payload)
    .then(function(response) {
    // See the MessagingDevicesResponse reference documentation for
    // the contents of response.
      console.log("Successfully sent message:", response);
    })
    .catch(function(error) {
       console.log("Error sending message:", error);
   });
  
 
var task = cron.schedule('* * * * *', function(){
  console.log('running a task every minute');
  
  var req = http.get("http://139.59.21.68:8001/", function(res) {
  console.log('STATUS: ' + res.statusCode);
  
  if (res.statusCode != 200) {
      admin.messaging().sendToDevice(registrationToken, payload)
    .then(function(response) {
    // See the MessagingDevicesResponse reference documentation for
    // the contents of response.
      console.log("Successfully sent message:", response);
    })
    .catch(function(error) {
       console.log("Error sending message:", error);
   });
  }

  // Buffer the body entirely for processing as a whole.
  var bodyChunks = [];
  res.on('data', function(chunk) {
    // You can process streamed parts here...
    bodyChunks.push(chunk);
  }).on('end', function() {
    var body = Buffer.concat(bodyChunks);
    console.log('BODY: ' + body);
    // ...and/or process the entire body here.
  })
});

req.on('error', function(e) {
  console.log('ERROR: ' + e.message);
});
  
}, false);

task.start() ;

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
