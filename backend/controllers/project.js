//todo: add populate
require('../../config/index');
var Project = require('../models/project');
var Tag = require('../models/tag');
var User = require('../models/user');
const Promise = require('bluebird');

var per_page = 20;
module.exports.getAll = function(req, res) {
	function callback(res) {
		var ret = function(err, items){
			if (err) {	return res.status(500).json({message : "Error!", data: []});	}
			if (items.length == 0) {
				return res.status(400).json({message: "Bad Request: Page number exceeds", data: []});
			}
			res.status(200).json({message : "OK", data : items});
		}
		return ret;
	}

	// parse request
	for (var key in req.query) {
		switch(key) {
			case "count":
				req.query["count"] = req.query["count"] == "true";
				break;
			case "sort":
			case "select":
			case "where":
				var str = req.query[key];
				str = str.replace(/,}$/, "}"); // eliminate the trailing comma
				req.query[key] = JSON.parse(str);
				break;
			case "skip":
			case "limit":
			case "page": // PAGINATE
				req.query[key] = +req.query[key]
				break;
		}
	}

	console.log(req.query);
	if ("page" in req.query){
		req.query["skip"] = (req.query["page"] - 1) * per_page;
		if (!("limit" in req.query)) {
			req.query["limit"] = per_page;
		}
	}
	console.log(req.query);
	if ("count" in req.query && req.query.count == true){ // console.log("count track");
		Project.count(req.query["where"], callback(res)); 
	}else{ // console.log("find track");
		Project.find(req.query["where"], null, req.query)
		.populate("tags", "name")
		.populate('creator', 'username')
		.exec(callback(res))
	}
}

module.exports.addProject = function (req, res, next){
	var project_info = {
		"name" : req.body['name'],
		"description" : req.body['description'],
		"creator" : res.locals.userId,
		"required_skills": req.body['required_skills'],
	}

	const new_project = Project(project_info);
	new_project.save().then(function(project){
		User.findByIdAndUpdate(res.locals.userId, {$push:{"projects": project._id }}, {new:true}, function(err, user){
			if(err){
				return res.status(500).json({message:err});
			}
			if(!user){
				return res.status(404).json({message: "Invalid login status."});
			}
		})
		var project_id = project._id;

		var promises = req.body['tag_names'].map(function(tag_name) {
			return Tag.findOneAndUpdate({"name" : tag_name}, { $push : {"projects": project_id }, $inc : {"popularity" : 1}}, {new:true}).exec();
		})
		Promise.all(promises).then(function(tags){
			var tag_ids = [];
			var missInd = 0;
			var promise_new_tags = [];
			tags.forEach(function(tag){
				if(!tag){
					var tag_info = {
						"name" : req.body['tag_names'][missInd],
						"projects" : [project_id]
					}
					const new_tag = Tag(tag_info);
					promise_new_tags.push(new_tag.save());
				}else{
					tag_ids.push(tag._id);
				}
				missInd++;
			})
			Promise.all(promise_new_tags).then(function(tags){
				tags.forEach(function(tag){
					tag_ids.push(tag._id);
				})
				Project.findByIdAndUpdate(project_id, {$set : {"tags" : tag_ids}}, {new:true}, function(err, project){
					if(err){
						return res.status(500).json({message: err});
					}
					res.status(200).json({data : project});
				})
			}).catch(function(err){
				if(err){
					return res.status(500).json({message: err});
				}
			})
		}).catch(function(err){
			console.log(err);
			if(err){
				return res.status(500).json({message: err});
			}
		})
	}).catch(function(err){
		console.log(err);
		if(err){
			return res.status(500).json({message:err});
		}
	})
}

module.exports.getPopularity = function(req, res){
	console.log(req.params);
	Project.findById(req.params.id, function(err, doc){
		if (err) {
			console.log(">>> Error getting popularity");
			res.status(500).json({message: err['message'], data: []});
		}

		if (doc == null){
			console.log(">>> Not found (getting popularity)");
			return res.status(404).json({message : err['message'], data : []});
		}

		console.log(">>> Get popularity Success");
		res.status(200).json({message: "OK", data: doc.popularity});
	});
}

module.exports.updatePopularity = function(req, res){
	Project.findByIdAndUpdate(req.params.id, { $inc: { popularity : 1}}, function(err, updated_doc){
		if (err) {
			console.log(">>> Error (update popularity)");
			return res.status(500).json({message : err, data : []}); // mostly CastError
		}
		if (updated_doc == null){
			console.log(">>> Not found (update popularity)");
			return res.status(404).json({message : err, data : []}); // mostly CastError
		}
		console.log(">>> Update Success");
		console.log(updated_doc);
		res.status(200).json({ message: "OK", data: updated_doc, });

	})
}

module.exports.toggleStatus = function(req, res) {
	var user_id = res.locals.userId;
	Project.findById(req.params.id, function(err, doc){
		if (err) { 
			console.log(">>> Error (update status)");
			return res.status(500).json({message : "Error finding document", data : []});
		}
		if (doc == null){
			console.log(">>> Not Found (update status)");
			return res.status(404).json({message : "Item Not Found", data : []});
		}
		if (doc.creator_id != user_id){
			console.log(">>> Auth Fairlure (update status)");
			return res.status(403).json({message : "Item Not Found", data : []});
		}
		doc.set({
			"creator_id" : doc.creator_id,
			"creator_name" : doc.creator_name,
			"name" : doc.name,
			"status" : doc.status ^ 1,
		});	
		doc.save(function(err, updated_doc){
			if (err) {
				console.log(">>> Error (update status)");
				return res.status(500).json({message : err['message'], data : []}); // mostly CastError
			}
			console.log(">>> Update Status Success");
			return res.status(200).json({ message: "OK", data: updated_doc, });
		});
	});
}

module.exports.getOne = function(req, res){
	Project.findOne({ '_id' : req.params.id}).populate('tags','name', 'creator').exec(function(err, doc){
		if (err) {
			console.log(">>> Error (getOne)");
			return res.status(500).json({message : err['message'], data : []}); 
		}
		if (doc == null) {
			console.log(">>> Error (getOne)");
			return res.status(404).json({message : "Item Not Found", data : []});
		}
		
		res.status(200).json({message : "OK", data : doc});
	})
}
