var User = require('../models/user');

exports.getUser = function(req, res, next){
	const id = req.params.user_id;
    console.log(id);
    if (res.locals.userId == id){
        User.findById(id, { password: 0 }, function (err, user){
            if (err) return res.status(500).json({err : true, message:"Internal error"});
            if (!user) return res.status(404).json({err : true, message: "User not found"});
            return res.status(200).json(user);
        })
    }else{
        User.findById(id, { password: 0, conversations: 0, email: 0}, function (err, user){
            if (err) return res.status(500).json({err : true, message:"Internal error"});
            if (!user) return res.status(404).json({err : true, message: "User not found"});
            return res.status(200).json(user);
        })
    }
}

exports.updateUser = function(req, res, next){
    const id = req.params.user_id;
    console.log(req.body);
    if("password" in req.body || "conversation" in req.body) {
        return res.status(403).json({err: true, message: "Forbidden field"})
    }
    var updateObj = req.body;
    if (res.locals.userId == id){
        User.findByIdAndUpdate(id, updateObj, {new: true, select:{"password":0}},function(err, user){
        if(err) return res.status(500).json({err : true, message:"Internal error"});
            return res.status(200).json(user);
        })
    }else{
        return res.status(403).json({err: true, message: "Not authorized"})
    }
}

exports.getProfile = function(req, res, next){
    User.findById(res.locals.userId, { password: 0 }).populate('projects' ,'name description').exec(function (err, user){
        if (err) return res.status(500).json({message: err});
        if (!user) return res.status(404).json({message: "User not found"});
        return res.status(200).json(user);
    })
}
