var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/**
* Specifies what strategy we'll use
*/
module.exports = function(passport) {

    var localOptions = {
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback: true
    };

    passport.use('local-signup', new LocalStrategy(localOptions, function(req, email, password, done) {
        User.findOne({'email' : email}, function(err, user) {
            if ( err ) {
                return done(err, null);
            } else if ( user ) {
                return done(new Error("Already exists!"), null);
            } else {
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.username = req.username;
                newUser.save(function(err, user) {
                    if(err){
                        return done(err, null);
                    }
                    return done(null, user);
                });
            }
        });
    }));

    passport.use('local-login', new LocalStrategy(localOptions ,function(req, email, password, done) {
        User.findOne({'email': email}, function(err, user) {
            if ( err ) {
                return done(err);
            } else if ( !user || !user.validPassword(password) ) {
                return done(null, false);
            }
            return done(null, user);
        });
    }));
};
