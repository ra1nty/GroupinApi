var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var projectSchema = new mongoose.Schema({
    "name": { type: String,required: [true, "A name is required."] },
	"description": {type: String, default: "The creator didn't say anything about it yet"},
    "creator": { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    "tags": [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    "popularity": { type: Number, default: 0},
    "status": { type: Number, default: 1},
    "required_skills": { type: [String], default: []}
},
{
    timestamps: true
});

projectSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Project', projectSchema);
