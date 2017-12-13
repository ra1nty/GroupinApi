var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({
    email		: String,
    password	: String,
    username    : String,
    description : { type: String, default: 'This user is shy XD.' },
    wechat_id   : { type: String, default: '' },
    projects : [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    skills      : [{ type: String }],
    conversations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'}],

    /*add for socket*/
    new_message : [mongoose.Schema.Types.ObjectId],
});

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
