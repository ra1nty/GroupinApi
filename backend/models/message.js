var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    conversationId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true}],
    body : {type: String, required: true},
    sender : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
},
{
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
