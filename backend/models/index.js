const mongoose = require('mongoose');

Promise = require('bluebird');
mongoose.Promise = Promise;

module.exports.connect = (uri) => {
  mongoose.connect(uri, {useMongoClient : true});

  mongoose.Promise = global.Promise;

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  require('./user');
  require('./message');
  require('./conversation');
  require('./project.js');
  require('./tag.js');
};
