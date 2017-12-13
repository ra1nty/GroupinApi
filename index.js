const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport')
const config = require('./config');
const router = express.Router();
const socketEvents = require('./socketEvents');  

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Access-Token");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS, PATCH");
    next();
};
app.use(allowCrossDomain);

require('./backend/models').connect(config.dbUri);
require('./backend/auth/passport')(passport);

// Initialize Passport
app.use(passport.initialize()); // Create an instance of Passport
// Get our routes
app.use('/api', require('./backend/routes/api')(router, passport));

// start the server

// modification
let server = app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000 or http://127.0.0.1:8000');
});

const io = require('socket.io').listen(server);
socketEvents(io);  