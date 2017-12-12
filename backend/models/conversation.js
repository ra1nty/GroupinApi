var mongoose = require('mongoose');

var conversationSchema = mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

module.exports = mongoose.model('Conversation', conversationSchema);
