var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var tagSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    popularity: { type: Number, default: 0,},
    projects: [ {type: mongoose.Schema.Types.ObjectId, ref: 'Project'} ]
});

tagSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Tag', tagSchema);
