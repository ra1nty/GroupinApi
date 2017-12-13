var jwt = require('jsonwebtoken');
var config = require('./config');


var User = require('./backend/models/user');

class Client{
  constructor(socket, userId){
    this.socket = socket;
    this.userId = userId;

    this.updateUserId = this.updateUserId.bind(this);
  }

  updateUserId(userId){
    this.userId = userId;
  }

  getSocketId(){
    return this.socket.id;
  }

  getUserId(){
    return this.userId;
  }
}

var clients = {};
exports = module.exports = function(io) {  
  // Set socket.io listeners.
  io.on('connection', (socket) => {
    console.log('a user connected');
    var client = new Client(socket, null);

    // Receive user's token, decode, store key-value pair
    socket.on('user token', (token) => {
      console.log("Receive token: " + token);
      jwt.verify(token, config.secret, function(err, decoded) { // Decode user token to obtain user id
          if (err)  { 
            // TODO: inform user that the token cannot be decoded
            console.log(err); 
            return; 
          }
          var userId = decoded.id;
          client.updateUserId(userId);
          clients[userId] = client;
      });
    })

    // Receive 'new message', need to push notification
    socket.on('new message', (conversation, recipient) => {
      console.log("Receive new message");
      // If the user is online, push notification
      if (clients[recipient]){
        socket.broadcast.to(clients[recipient].getSocketId()).emit('refresh messages', conversation);
        return;
      }

      // If the user is offline, update the user data
      User.findById(recipient)
      .then((doc) => {
        var conv = doc.conversations;
        conv.push(conversation);
        doc.set({
          "conversations" : conv,
        })
        doc.save();
      })
      .catch((err) => console.log(err));
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      delete clients[client.getUserId];
    });
  });
}


    // On conversation entry, join broadcast channel
    // socket.on('enter conversation', (conversation) => {
    //   socket.join(conversation);
    //   console.log('joined ' + conversation);
    // });

    // socket.on('leave conversation', (conversation) => {
    //   socket.leave(conversation);
    //   console.log('left ' + conversation);
    // })