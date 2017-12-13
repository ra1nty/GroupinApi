var mongoose = require('mongoose');

var conversationSchema = mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
});

module.exports = mongoose.model('Conversation', conversationSchema);
