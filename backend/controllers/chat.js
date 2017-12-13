var Conversation = require('../models/conversation');
var Message = require('../models/message');
var User = require('../models/user');

exports.getConversations = function(req, res, next) {
    Conversation.find({participants : res.locals.userId})
        .select('_id')
        .exec(function(err, conversations){
            if(err){
                res.status(500).json({err: true, message: err})
                return next(err);
            }
            let allConversations = []
            var promises = []
            conversations.forEach(function(conversation){
                promises.push(Message.find({ conversationId : conversation._id })
                    .sort('-createdAt')
                    .populate('sender', 'username')
                    .exec()
                );
            })
            Promise.all(promises).then(function(messages){
                res.status(200).json(messages);
            }).catch(function(err){
                console.log(err);
                return res.status(500).json({err: true, message: err});
            })
        })
}

exports.getConversation = function(req, res, next) {  
    Message.find({ conversationId: req.params.conversation_id })
        .select('createdAt body sender')
        .sort('-createdAt')
        .populate('sender','username')
        .exec().then(function(messages) {
            res.status(200).json(messages);
        }).catch(function(err){
                return res.status(500).json({err: true, message: err});
        });
}

exports.newConversation = function(req, res, next) {
    console.log("add new conversation");
    if(!req.params.to) {
        res.status(422).json({ error: 'Need a valid recipient for your message.' });
        return next();
    }
    if(!req.body.content) {
        res.status(422).json({ error: 'Please enter a message.' });
        return next();
    }

    var conversationInfo = {
        participants: [res.locals.userId, req.params.to],
        project: req.body.projectId
    }

    var targetConversation;
    Conversation.findOne(conversationInfo).exec(function(err, conv){
        if (err){
            res.status(500).json({ error: true, message: err });
            return next(err);
        }
        targetConversation = null
        if (!conv){
            const conversation = new Conversation(conversationInfo);
            conversation.save(function(err, newConversation) {
                if (err) {
                    return res.status(500).json({ error: true, message: err });
                }
                User.findByIdAndUpdate(res.locals.userId, {$addToSet: {conversations: newConversation._id}}, function(err){
                    if(err){
                        res.status(500).json({ error: true, message: err });
                    }
                })
                User.findByIdAndUpdate(req.params.to, {$addToSet: {conversations: newConversation._id}}, function(err){
                    if(err){
                        res.status(500).json({ error: true, message: err });
                    }
                })
                targetConversation = newConversation;
                createMessage(targetConversation);
            })
            
        }else{
            targetConversation = conv;
            createMessage(targetConversation);
        }
    })

    function createMessage(targetConversation) {
        const message = new Message({
            conversationId: targetConversation._id,
            body: req.body.content,
            sender: res.locals.userId
        });
        message.save(function(err, newMessage) {
            if (err) {
                res.status(500).json({ error: true, message: err });
                return next(err);
            }
            res.status(200).json(newMessage);
            return next();
        });
    }
   
}

exports.newMessage = function(req, res, next){
    const reply = new Message({
        conversationId: req.body.conversationId,
        body: req.body.content,
        sender: res.locals.userId
    });

    reply.save(function(err, sentReply) {
        if (err) {
            res.status(500).json({ error: true, message: err });
            return next(err);
        }
        res.status(200).json(sentReply);
        return(next);
    });
}