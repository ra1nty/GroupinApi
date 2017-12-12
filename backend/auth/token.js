var jwt = require('jsonwebtoken');
var config = require('../../config');

exports.verifyToken = function(req, res, next) {
    var token = req.headers['x-access-token'];
    if (!token){
        res.locals.userId = null;
        return next();
    }
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err){
            return res.status(500).send({message: 'Malformed token.' });
        }
        res.locals.userId = decoded.id;
        return next();
    });
}

exports.requireLogin = function(req, res, next) {
    if(!res.locals.userId){
        return res.status(403).send({message: 'Login required.' });
    }
    return next();
}