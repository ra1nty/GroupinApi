const ChatController = require('../controllers/chat');
const UserController = require('../controllers/user');
const ProjectController = require('../controllers/project');
const TagController = require('../controllers/tag');
const TokenModule = require('../auth/token');


const jwt = require('jsonwebtoken');
const config = require('../../config');


module.exports = function(router, passport) {

    router.post('/register',function(req, res, next) {
        passport.authenticate('local-signup', {session: false}, function(err, user, next){
            if(err || !user){
                res.status(200).json({error: true, message: "Error"});
            }else{
            var token = jwt.sign({ id: user._id }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).json({ auth: true, token: token, user: user });}
        })(req, res, next);
    });

    router.post('/login',function(req, res, next) {
        passport.authenticate('local-login', {session: false}, function(err, user, next){
            if(!user){
                res.status(200).json({ auth: false, token: null });
            }else{
                var token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).json({ auth: true, token: token, user: user });
            }
        })(req, res, next);
    });

    router.get('/user/:user_id', TokenModule.verifyToken, UserController.getUser);

    router.patch('/user/:user_id', TokenModule.verifyToken, UserController.updateUser);

    router.get('/profile', TokenModule.verifyToken, TokenModule.requireLogin, UserController.getProfile);

    router.get('/chat/', TokenModule.verifyToken, TokenModule.requireLogin, ChatController.getConversations);

    router.get('/chat/:conversation_id', TokenModule.verifyToken, TokenModule.requireLogin, ChatController.getConversation);
    
    router.post('/chat/:conversation_id', TokenModule.verifyToken, TokenModule.requireLogin, ChatController.newMessage);

    router.post('/chat/new/:to', TokenModule.verifyToken, TokenModule.requireLogin, ChatController.newConversation);

    router.get('/projects/', ProjectController.getAll);

    router.post('/projects/', TokenModule.verifyToken, TokenModule.requireLogin, ProjectController.addProject);

    router.get('/projects/:id', ProjectController.getOne);

    router.put('/projects/:id/popularity', ProjectController.updatePopularity);

    // modification
    router.get('/projects/:id/popularity', ProjectController.getPopularity);

    router.put('/projects/:id/status', TokenModule.verifyToken, TokenModule.requireLogin, ProjectController.toggleStatus);

    router.get('/tags/', TagController.getAll);

    router.get('/tags/:id', TagController.getOne);


    return router;
}